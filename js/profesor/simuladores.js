// ============================================================================
// Modo Profesor · Simuladores
// ----------------------------------------------------------------------------
// Permite que el docente cambie los valores con los que arranca cada simulador
// (S₀, K, σ, r, T, pasos del árbol, tipo de opción...) y los rangos admitidos, y
// que muestre u oculte simuladores, SIN tocar el código que calcula.
//
// Cómo funciona:
//   1. Antes de que corran los scripts de la página, se cargan los valores del
//      docente en los campos que ya están escritos en el HTML. Así el simulador
//      arranca directamente con esos datos (sin "saltos" ni mensajes del narrador).
//   2. Cuando la página terminó de armarse (DOMContentLoaded), se completan los
//      campos que crea cada script y se registran los valores originales, para
//      poder mostrarlos y restaurarlos.
//   3. Si el docente fijó un mínimo y un máximo, los deslizadores toman ese rango;
//      en los campos de texto, un valor fuera de rango no se calcula y se avisa,
//      igual que cuando falta un dato.
//
// Validaciones: además de las reglas propias de cada dato (σ > 0, T > 0, precios
// positivos, correlación entre −1 y 1, mínimo < máximo), los valores nuevos se
// prueban en el simulador antes de guardarlos: si el simulador los rechaza o da un
// resultado inválido, no se guardan.
// ============================================================================

(function (P) {
  'use strict';

  const U = P.Util;
  const C = P.Config;
  const K = P.Contenido;
  const S = {};

  const ORIGINALES = new Map();  // wid → Map(cid → { valor, min, max })
  const APLICADOS = new Map();   // wid → Map(cid → valor cargado en el paso 1)
  const LIMITES = new Map();     // wid → [{ cid, min, max }] (campos de texto y número)

  const configDe = wid => ((C.pagina(K.clavePagina()).simuladores || {})[wid] || { campos: {} }).campos || {};
  const widgets = () => [...document.querySelectorAll('section.widget[id]')];

  // --------------------------------------------------------------------------
  // Lectura de los campos de un simulador
  // --------------------------------------------------------------------------
  const limpiar = t => String(t || '').replace(/\s+/g, ' ').replace(/[:：]\s*$/, '').trim();

  function etiquetaDe(el) {
    const lab = el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (lab) return limpiar(lab.textContent);
    const padre = el.closest('label');
    if (padre) return limpiar(padre.textContent);
    return limpiar(el.getAttribute('aria-label') || el.getAttribute('title') || el.id);
  }

  function etiquetaGrupo(grupo) {
    let anc = grupo[0].parentElement;
    for (let i = 0; i < 4 && anc; i++, anc = anc.parentElement) {
      if (!grupo.every(r => anc.contains(r))) continue;
      const lab = [...anc.children].find(c => (c.tagName === 'LABEL' && !c.querySelector('input')) || c.tagName === 'LEGEND');
      if (lab) return limpiar(lab.textContent);
    }
    return grupo.map(textoOpcion).join(' / ');
  }

  const textoOpcion = r => limpiar((r.closest('label') || {}).textContent || r.value);

  function esNumeroTexto(valor) {
    const v = String(valor || '').trim();
    return v !== '' && !/[\s;@]/.test(v) && Number.isFinite(U.aNumero(v));
  }

  // Lista de campos configurables de un simulador.
  function campos(w) {
    const lista = [];
    const radios = new Set();
    w.querySelectorAll('input, select, textarea').forEach(el => {
      if (el.closest('.prof-ui') || el.closest('table')) return;
      if (el.type === 'radio') {
        if (!el.name || radios.has(el.name)) return;
        radios.add(el.name);
        const grupo = [...w.querySelectorAll(`input[type="radio"][name="${CSS.escape(el.name)}"]`)];
        lista.push({ cid: 'radio:' + el.name, tipo: 'opciones', etiqueta: etiquetaGrupo(grupo), opciones: grupo.map(r => ({ valor: r.value, texto: textoOpcion(r) })) });
        return;
      }
      if (!el.id || ['button', 'submit', 'reset', 'file', 'hidden', 'color'].includes(el.type)) return;
      const etiqueta = etiquetaDe(el);
      if (/^tu\s/i.test(etiqueta)) return; // respuestas que escribe el alumno (modo práctica)
      const c = { cid: el.id, etiqueta };
      if (el.type === 'checkbox') c.tipo = 'casilla';
      else if (el.tagName === 'SELECT') { c.tipo = 'seleccion'; c.opciones = [...el.options].map(o => ({ valor: o.value, texto: limpiar(o.textContent) })); }
      else if (el.type === 'range') { c.tipo = 'numero'; c.rango = true; }
      else if (el.type === 'number') c.tipo = 'numero';
      else c.tipo = esNumeroTexto(el.value) ? 'numero' : 'texto';
      if (el.type === 'number' || el.type === 'range') c.entero = /^\d+$/.test(el.step || '') && el.step !== '' && Number(el.step) >= 1;
      lista.push(c);
    });
    return lista;
  }

  function elementos(cid) {
    if (cid.startsWith('radio:')) return [...document.querySelectorAll(`input[type="radio"][name="${CSS.escape(cid.slice(6))}"]`)];
    const el = document.getElementById(cid);
    return el ? [el] : [];
  }

  function leerValor(cid) {
    const els = elementos(cid);
    if (!els.length) return undefined;
    if (cid.startsWith('radio:')) { const r = els.find(x => x.checked); return r ? r.value : ''; }
    const el = els[0];
    return el.type === 'checkbox' ? el.checked : el.value;
  }

  function leerLimites(cid) {
    const el = elementos(cid)[0];
    if (!el || cid.startsWith('radio:')) return {};
    const r = {};
    if (el.min !== '' && el.min !== undefined && Number.isFinite(Number(el.min))) r.min = Number(el.min);
    if (el.max !== '' && el.max !== undefined && Number.isFinite(Number(el.max))) r.max = Number(el.max);
    return r;
  }

  // Carga un valor en un campo. Devuelve los elementos que cambiaron.
  function poner(cid, valor) {
    const els = elementos(cid);
    if (!els.length || valor === undefined) return [];
    if (cid.startsWith('radio:')) {
      const r = els.find(x => x.value === valor);
      if (r && !r.checked) { r.checked = true; return [r]; }
      return [];
    }
    const el = els[0];
    if (el.type === 'checkbox') {
      if (el.checked !== !!valor) { el.checked = !!valor; return [el]; }
      return [];
    }
    let v = String(valor);
    if (el.type === 'number' || el.type === 'range') {
      if (v.trim() === '') v = '';
      else { const n = U.aNumero(v); if (!Number.isFinite(n)) return []; v = String(n); }
    }
    if (el.tagName === 'SELECT' && ![...el.options].some(o => o.value === v)) return [];
    if (el.value !== v) { el.value = v; return [el]; }
    return [];
  }

  function avisar(els) {
    els.forEach(el => {
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  // Rango de un campo: en los deslizadores cambia sus extremos.
  function ponerLimites(cid, lim) {
    const el = elementos(cid)[0];
    if (!el || cid.startsWith('radio:')) return [];
    let cambio = false;
    ['min', 'max'].forEach(k => {
      if (lim[k] === undefined) return;
      if (el.type === 'range' || el.type === 'number') { if (el[k] !== String(lim[k])) { el[k] = String(lim[k]); cambio = true; } }
    });
    if (el.type === 'range') {
      actualizarExtremos(el);
      // El deslizador ya recorta solo su valor al nuevo rango; se avisa al simulador.
      return cambio ? [el] : [];
    }
    return [];
  }

  // Los extremos escritos debajo de un deslizador (".extremos") se reescriben con el
  // mismo formato que tenían (decimales, signo, unidad).
  function actualizarExtremos(el) {
    const ext = el.parentElement && el.parentElement.querySelector('.extremos');
    if (!ext || ext.children.length < 2) return;
    const reescribir = (span, valor) => {
      if (!span.dataset.profFormato) span.dataset.profFormato = span.textContent;
      const modelo = span.dataset.profFormato;
      const m = modelo.match(/[−-]?\d[\d.]*(?:,(\d+))?/);
      if (!m) return;
      const dec = m[1] ? m[1].length : 0;
      let txt = Math.abs(valor).toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
      if (valor < 0) txt = (modelo.includes('−') ? '−' : '-') + txt;
      span.textContent = modelo.slice(0, m.index) + txt + modelo.slice(m.index + m[0].length);
    };
    reescribir(ext.children[0], Number(el.min));
    reescribir(ext.children[ext.children.length - 1], Number(el.max));
  }

  // --------------------------------------------------------------------------
  // Paso 1: antes de que corran los scripts de la página
  // --------------------------------------------------------------------------
  S.prepararEstaticos = function () {
    const pag = C.pagina(K.clavePagina());
    Object.entries(pag.simuladores || {}).forEach(([wid, w]) => {
      const sec = document.getElementById(wid);
      if (!sec) return;
      const orig = new Map(), aplicados = new Map();
      Object.entries(w.campos || {}).forEach(([cid, cfg]) => {
        if (!elementos(cid).length) return; // lo crea un script: se completa en el paso 2
        orig.set(cid, { valor: leerValor(cid), ...leerLimites(cid) });
        ponerLimites(cid, cfg);
        if (cfg.valor !== undefined) poner(cid, cfg.valor);
        aplicados.set(cid, leerValor(cid));
      });
      ORIGINALES.set(wid, orig);
      APLICADOS.set(wid, aplicados);
    });
  };

  // --------------------------------------------------------------------------
  // Paso 2: con la página armada
  // --------------------------------------------------------------------------
  S.completar = function () {
    widgets().forEach(w => {
      const cfg = configDe(w.id);
      const orig = ORIGINALES.get(w.id) || new Map();
      const aplicados = APLICADOS.get(w.id) || new Map();
      const pendientes = [];
      campos(w).forEach(c => {
        const actual = leerValor(c.cid);
        if (aplicados.has(c.cid)) {
          // Si el script pisó el valor al arrancar, el original es el que dejó el script.
          if (actual !== aplicados.get(c.cid)) { orig.set(c.cid, { valor: actual, ...leerLimites(c.cid) }); pendientes.push(c.cid); }
        } else {
          orig.set(c.cid, { valor: actual, ...leerLimites(c.cid) });
          if (cfg[c.cid]) pendientes.push(c.cid);
        }
      });
      ORIGINALES.set(w.id, orig);
      if (pendientes.length) aplicarConEventos(w, pendientes.map(cid => [cid, cfg[cid]]), true);
      registrarLimites(w.id, cfg);
    });
    instalarGuardia();
  };

  // Carga valores con aviso al simulador, en dos pasadas (hay campos que dependen
  // de otros, como la cantidad de contratos de una cobertura o las patas de una
  // estrategia). El narrador no registra estos cambios.
  function aplicarConEventos(w, pares, conservarNarrador) {
    const narradores = conservarNarrador ? [...w.querySelectorAll('.narrador ol')].map(ol => [ol, ol.innerHTML]) : [];
    for (let pasada = 0; pasada < 2; pasada++) {
      pares.forEach(([cid, cfg]) => {
        if (!cfg) return;
        avisar(ponerLimites(cid, cfg));
        if (cfg.valor !== undefined) avisar(poner(cid, cfg.valor));
      });
    }
    narradores.forEach(([ol, html]) => { ol.innerHTML = html; });
  }

  function registrarLimites(wid, cfg) {
    const lista = [];
    Object.entries(cfg).forEach(([cid, x]) => {
      const el = elementos(cid)[0];
      if (!el || el.type === 'range' || cid.startsWith('radio:')) return;
      if (x.min === undefined && x.max === undefined) return;
      lista.push({ cid, min: x.min, max: x.max });
    });
    if (lista.length) LIMITES.set(wid, lista); else LIMITES.delete(wid);
  }

  // --------------------------------------------------------------------------
  // Rangos en los campos de texto: un valor fuera de rango no se calcula
  // --------------------------------------------------------------------------
  const fmtN = n => Number(n).toLocaleString('es-AR', { maximumFractionDigits: 6 }).replace('-', '−');

  function marcarCampo(el, fuera, min, max) {
    el.classList.toggle('fuera-de-rango', fuera);
    el.setAttribute('aria-invalid', fuera ? 'true' : 'false');
    let aviso = el.parentElement.querySelector(':scope > .aviso-rango');
    if (fuera && !aviso) {
      aviso = document.createElement('small');
      aviso.className = 'aviso-rango';
      aviso.setAttribute('role', 'status');
      el.after(aviso);
    }
    if (aviso) {
      aviso.hidden = !fuera;
      aviso.textContent = min !== undefined && max !== undefined ? `Valores admitidos: entre ${fmtN(min)} y ${fmtN(max)}.`
        : min !== undefined ? `Valor mínimo admitido: ${fmtN(min)}.` : `Valor máximo admitido: ${fmtN(max)}.`;
    }
  }

  let guardiaInstalada = false;
  function instalarGuardia() {
    if (guardiaInstalada) return;
    guardiaInstalada = true;
    const guardia = ev => {
      const t = ev.target;
      if (!t || !t.closest || t.closest('.prof-ui')) return;
      const w = t.closest('section.widget[id]');
      const lista = w && LIMITES.get(w.id);
      if (!lista) return;
      let fuera = false;
      lista.forEach(({ cid, min, max }) => {
        const el = document.getElementById(cid);
        if (!el) return;
        const crudo = String(el.value).trim();
        const v = U.aNumero(crudo);
        const mal = crudo !== '' && Number.isFinite(v) && ((min !== undefined && v < min) || (max !== undefined && v > max));
        marcarCampo(el, mal, min, max);
        if (mal) fuera = true;
      });
      if (fuera) {
        // Se corta el evento antes de que llegue al simulador: los resultados quedan
        // atenuados con el aviso de "Revisá los datos".
        ev.stopImmediatePropagation();
        if (typeof marcarInvalido === 'function') marcarInvalido(w, true);
        w._profFuera = true;
      } else if (w._profFuera) {
        w._profFuera = false;
        if (typeof marcarInvalido === 'function') marcarInvalido(w, false);
      }
    };
    document.addEventListener('input', guardia, true);
    document.addEventListener('change', guardia, true);
  }

  // --------------------------------------------------------------------------
  // Validación
  // --------------------------------------------------------------------------
  // Reglas según el dato (se reconocen por la etiqueta del campo).
  const REGLAS = [
    { re: /volatilidad|σ|desv[ií]o/i, positivo: true, mensaje: 'La volatilidad tiene que ser mayor que cero.' },
    { re: /^plazo|tiempo al vencimiento|semanas al vencimiento|plazo t|^t[₁₂]? \(/i, positivo: true, mensaje: 'El plazo tiene que ser mayor que cero.' },
    { re: /pasos/i, entero: true, minimo: 1, mensaje: 'La cantidad de pasos tiene que ser un número entero mayor o igual que 1.' },
    { re: /correlaci[óo]n|ρ/i, entre: [-1, 1], mensaje: 'La correlación tiene que estar entre −1 y 1.' },
    { re: /precio|strike|acci[óo]n s|s₀|nivel del [íi]ndice|futuro f|contado|tipo de cambio|eurusd|[íi]ndice hoy|[íi]ndice al vencimiento|d[óo]lar|nominal|nocional|capital|valor de la cartera|valor a asegurar|multiplicador|tama[ñn]o/i, positivo: true, mensaje: 'Los precios, montos y tamaños tienen que ser mayores que cero.' },
    { re: /prima/i, noNegativo: true, mensaje: 'La prima no puede ser negativa.' },
  ];

  function errorRegla(etiqueta, v) {
    for (const r of REGLAS) {
      if (!r.re.test(etiqueta)) continue;
      if (r.positivo && !(v > 0)) return r.mensaje;
      if (r.noNegativo && v < 0) return r.mensaje;
      if (r.entero && (!Number.isInteger(v) || v < r.minimo)) return r.mensaje;
      if (r.entre && (v < r.entre[0] || v > r.entre[1])) return r.mensaje;
      return null;
    }
    return null;
  }

  // Valida la configuración de un campo. Devuelve un mensaje de error o null.
  S.validarCampo = function (c, original, cfg) {
    if (c.tipo !== 'numero') return null;
    const crudo = cfg.valor !== undefined ? String(cfg.valor).trim() : String(original.valor ?? '').trim();
    const v = U.aNumero(crudo);
    if (crudo === '' && String(original.valor ?? '').trim() !== '') return 'El valor inicial no puede quedar vacío.';
    if (crudo !== '' && !Number.isFinite(v)) return 'El valor inicial tiene que ser un número (con coma o punto decimal).';
    const min = cfg.min !== undefined ? cfg.min : original.min;
    const max = cfg.max !== undefined ? cfg.max : original.max;
    if (cfg.min !== undefined && !Number.isFinite(cfg.min)) return 'El mínimo tiene que ser un número.';
    if (cfg.max !== undefined && !Number.isFinite(cfg.max)) return 'El máximo tiene que ser un número.';
    if (min !== undefined && max !== undefined && !(min < max)) return 'El mínimo tiene que ser menor que el máximo.';
    if (crudo !== '') {
      if (min !== undefined && v < min) return 'El valor inicial es menor que el mínimo.';
      if (max !== undefined && v > max) return 'El valor inicial es mayor que el máximo.';
      if (cfg.valor !== undefined && c.entero && !Number.isInteger(v)) return 'Este dato tiene que ser un número entero.';
      const e = cfg.valor !== undefined ? errorRegla(c.etiqueta, v) : null;
      if (e) return e;
    }
    // Un mínimo nuevo no puede habilitar valores sin sentido (σ = 0, T negativo...).
    if (cfg.min !== undefined && cfg.min !== original.min) {
      const e = errorRegla(c.etiqueta, cfg.min);
      if (e) return 'Revisá el mínimo: ' + e.charAt(0).toLowerCase() + e.slice(1);
    }
    return null;
  };

  // Prueba los valores en el simulador real. Si los rechaza, vuelve a como estaba.
  S.probar = function (wid, cfg) {
    const w = document.getElementById(wid);
    if (!w) return 'No se encontró el simulador en la página.';
    const lista = campos(w);
    const antes = lista.map(c => [c.cid, { valor: leerValor(c.cid), ...leerLimites(c.cid) }]);
    let errores = 0;
    const alError = () => { errores++; };
    window.addEventListener('error', alError);
    let problema = null;
    try {
      // Primero se vuelve a los originales y después se aplica lo nuevo.
      const orig = ORIGINALES.get(wid) || new Map();
      const pares = lista.map(c => [c.cid, Object.assign({}, orig.get(c.cid) || {}, cfg[c.cid] || {})]);
      aplicarConEventos(w, pares, false);
      const invalido = w.matches('.datos-invalidos') || !!w.querySelector('.datos-invalidos');
      const nan = /\bNaN\b/.test(w.innerText || '');
      if (errores) problema = 'El simulador dio un error con estos valores.';
      else if (invalido) problema = 'El simulador no puede calcular con estos valores (los rechaza como fuera de rango o incompletos).';
      else if (nan) problema = 'Con estos valores el simulador da resultados inválidos.';
    } catch (e) {
      problema = 'El simulador dio un error con estos valores.';
    }
    window.removeEventListener('error', alError);
    if (problema) aplicarConEventos(w, antes, false);
    return problema;
  };

  // --------------------------------------------------------------------------
  // Datos para el panel
  // --------------------------------------------------------------------------
  // Nombre del simulador: el título de su sección; si no tiene, el comentario que lo
  // presenta en el HTML (por ejemplo, "<!-- 1. Estrategia -->"); si no, su identificador.
  function tituloDe(w) {
    const h = w.querySelector('h2, h3, .widget-titulo');
    const anterior = (() => { let x = w.previousElementSibling; while (x && x.tagName !== 'H2' && !x.matches('section.widget')) x = x.previousElementSibling; return x && x.tagName === 'H2' ? x : null; })();
    if (anterior || h) return limpiar((anterior || h).textContent);
    let n = w.previousSibling;
    while (n && n.nodeType === 3 && !n.nodeValue.trim()) n = n.previousSibling;
    if (n && n.nodeType === 8) return limpiar(n.nodeValue).replace(/^\d+[.)]\s*/, '');
    return w.id;
  }

  // Un simulador que está solo en su sección se oculta con toda la sección (título
  // y explicación); si comparte la sección, se oculta solo el simulador.
  function unidadDeOcultamiento(w) {
    const bloque = w.closest('[data-prof-id]');
    if (!bloque) return null;
    const sid = K.seccionDe(bloque);
    if (sid !== '__intro') {
      const s = K.secciones().find(x => x.id === sid);
      const otros = s ? s.elementos.filter(e => e !== bloque && (e.matches('section.widget') || e.querySelector('section.widget'))) : [];
      if (!otros.length) return { tipo: 'seccion', id: sid };
    }
    return { tipo: 'bloque', id: bloque.dataset.profId };
  }

  S.lista = function () {
    const pag = C.pagina(K.clavePagina());
    const ocultas = new Set((pag.secciones || {}).ocultas || []);
    return widgets().map(w => {
      const u = unidadDeOcultamiento(w);
      const visible = !u ? true : u.tipo === 'seccion' ? !ocultas.has(u.id) : !((pag.bloques || {})[u.id] || {}).oculto;
      return { id: w.id, titulo: tituloDe(w), visible, modificado: Object.keys(configDe(w.id)).length > 0, ocultable: !!u };
    });
  };

  S.alternarVisible = function (wid) {
    const w = document.getElementById(wid);
    const u = w && unidadDeOcultamiento(w);
    if (!u) return;
    if (u.tipo === 'seccion') P.Editor.alternarSeccion(u.id);
    else P.Editor.alternarOculto(u.id);
  };

  S.restaurar = function (wid) {
    C.cambiar('Restaurar los valores de un simulador', c => {
      const pag = c.paginas[K.clavePagina()];
      if (pag && pag.simuladores) delete pag.simuladores[wid];
    });
  };

  // --------------------------------------------------------------------------
  // Configurador (ventana del modo edición)
  // --------------------------------------------------------------------------
  const textoValor = (c, v) => {
    if (c.tipo === 'casilla') return v ? 'Activado' : 'Desactivado';
    if (c.opciones) { const o = c.opciones.find(x => x.valor === v); return o ? o.texto : String(v); }
    return String(v ?? '') === '' ? '(vacío)' : String(v);
  };

  S.abrirConfigurador = function (wid) {
    const w = document.getElementById(wid);
    if (!w) return;
    const lista = campos(w);
    const orig = ORIGINALES.get(wid) || new Map();
    const cfg = configDe(wid);
    const cont = document.createElement('div');
    cont.className = 'prof-form';
    cont.innerHTML = `<p class="prof-ayuda">Elegí con qué valores arranca el simulador cuando lo abren los alumnos y, si querés, el rango admitido. Lo que dejes igual al original no se guarda. Antes de guardar, los valores se prueban en el simulador.</p>
      <div class="prof-tabla-campos" role="table" aria-label="Campos del simulador">
        <div class="prof-fila prof-fila-cabecera" role="row"><span role="columnheader">Dato</span><span role="columnheader">Valor inicial</span><span role="columnheader">Mínimo</span><span role="columnheader">Máximo</span></div>
      </div>`;
    const tabla = cont.querySelector('.prof-tabla-campos');
    const filas = [];
    lista.forEach((c, i) => {
      const o = orig.get(c.cid) || { valor: leerValor(c.cid) };
      const x = cfg[c.cid] || {};
      const fila = document.createElement('div');
      fila.className = 'prof-fila';
      fila.setAttribute('role', 'row');
      const idv = `prof-sim-${i}`;
      let control;
      if (c.tipo === 'casilla') {
        control = `<label class="prof-casilla"><input type="checkbox" id="${idv}"> Activado</label>`;
      } else if (c.opciones) {
        control = `<select id="${idv}" class="prof-campo">${c.opciones.map(op => `<option value="${U.escapar(op.valor)}">${U.escapar(op.texto)}</option>`).join('')}</select>`;
      } else {
        control = `<input id="${idv}" class="prof-campo" type="text" autocomplete="off" inputmode="${c.tipo === 'numero' ? 'decimal' : 'text'}">`;
      }
      const conRango = c.tipo === 'numero';
      fila.innerHTML = `<span role="cell" class="prof-dato"><label for="${idv}">${U.escapar(c.etiqueta)}</label><small>Original: ${U.escapar(textoValor(c, o.valor))}${conRango && (o.min !== undefined || o.max !== undefined) ? ` · rango ${o.min !== undefined ? fmtN(o.min) : '—'} a ${o.max !== undefined ? fmtN(o.max) : '—'}` : ''}</small></span>
        <span role="cell">${control}</span>
        <span role="cell">${conRango ? `<input class="prof-campo prof-min" type="text" inputmode="decimal" aria-label="Mínimo de ${U.escapar(c.etiqueta)}" placeholder="${c.rango ? '' : 'sin límite'}">` : ''}</span>
        <span role="cell">${conRango ? `<input class="prof-campo prof-max" type="text" inputmode="decimal" aria-label="Máximo de ${U.escapar(c.etiqueta)}" placeholder="${c.rango ? '' : 'sin límite'}">` : ''}</span>
        <span class="prof-error prof-error-fila" hidden></span>`;
      const ctl = fila.querySelector('#' + idv);
      const valor = x.valor !== undefined ? x.valor : o.valor;
      if (c.tipo === 'casilla') ctl.checked = !!valor; else ctl.value = valor ?? '';
      if (conRango) {
        const mn = x.min !== undefined ? x.min : o.min, mx = x.max !== undefined ? x.max : o.max;
        fila.querySelector('.prof-min').value = mn !== undefined ? String(mn).replace('.', ',') : '';
        fila.querySelector('.prof-max').value = mx !== undefined ? String(mx).replace('.', ',') : '';
      }
      tabla.appendChild(fila);
      filas.push({ c, o, fila, ctl });
    });
    const errorGeneral = document.createElement('div');
    errorGeneral.className = 'prof-error';
    errorGeneral.hidden = true;
    cont.appendChild(errorGeneral);

    const leerFormulario = () => {
      const nueva = {};
      let hayError = false;
      filas.forEach(({ c, o, fila, ctl }) => {
        const err = fila.querySelector('.prof-error-fila');
        err.hidden = true;
        fila.classList.remove('con-error');
        const x = {};
        const valor = c.tipo === 'casilla' ? ctl.checked : ctl.value.trim();
        const igual = c.tipo === 'casilla' ? valor === !!o.valor : valor === String(o.valor ?? '').trim();
        if (!igual) x.valor = valor;
        if (c.tipo === 'numero') {
          const mn = fila.querySelector('.prof-min').value.trim(), mx = fila.querySelector('.prof-max').value.trim();
          const nmn = mn === '' ? undefined : U.aNumero(mn), nmx = mx === '' ? undefined : U.aNumero(mx);
          if (c.rango && (nmn === undefined || nmx === undefined)) { err.hidden = false; err.textContent = 'Un deslizador necesita mínimo y máximo.'; fila.classList.add('con-error'); hayError = true; return; }
          if (nmn !== o.min) x.min = nmn;
          if (nmx !== o.max) x.max = nmx;
          if ((mn === '' && o.min !== undefined) || (mx === '' && o.max !== undefined)) {
            // Quitar un límite que el simulador ya traía no se permite: puede romper el cálculo.
            err.hidden = false; err.textContent = 'Este dato ya tenía un límite propio del simulador; podés cambiarlo, pero no dejarlo vacío.'; fila.classList.add('con-error'); hayError = true; return;
          }
          if (x.min === undefined) delete x.min;
          if (x.max === undefined) delete x.max;
        }
        const e = S.validarCampo(c, o, x);
        if (e) { err.hidden = false; err.textContent = e; fila.classList.add('con-error'); hayError = true; return; }
        if (Object.keys(x).length) nueva[c.cid] = x;
      });
      return hayError ? null : nueva;
    };

    const v = P.Editor.crearVentana('Configurar el simulador: ' + tituloDe(w), cont, [
      {
        texto: 'Restaurar los valores originales', clase: 'prof-btn', accion: cerrar => {
          P.Interfaz.confirmar('¿Volver a los valores originales de este simulador?', 'Se borran los valores iniciales y los rangos que configuraste.', 'Restaurar').then(ok => {
            if (!ok) return;
            cerrar();
            S.restaurar(wid);
            P.Interfaz.recargar({ ancla: wid, aviso: 'Se restauraron los valores originales del simulador.' });
          });
        },
      },
      { texto: 'Cancelar', accion: cerrar => cerrar() },
      {
        texto: 'Probar y guardar', clase: 'prof-btn prof-btn-primario', accion: cerrar => {
          errorGeneral.hidden = true;
          const nueva = leerFormulario();
          if (!nueva) { errorGeneral.hidden = false; errorGeneral.textContent = 'Hay datos para revisar (marcados en rojo).'; return; }
          const problema = S.probar(wid, nueva);
          if (problema) { errorGeneral.hidden = false; errorGeneral.textContent = problema + ' No se guardó nada.'; return; }
          cerrar();
          const cambio = C.cambiar('Configurar un simulador', c => {
            const pag = c.paginas[K.clavePagina()] = c.paginas[K.clavePagina()] || {};
            pag.simuladores = pag.simuladores || {};
            if (Object.keys(nueva).length) pag.simuladores[wid] = { campos: nueva };
            else delete pag.simuladores[wid];
          });
          P.Interfaz.recargar({ ancla: wid, aviso: cambio ? 'Se guardaron los valores del simulador.' : 'No había cambios para guardar.' });
        },
      },
    ]);
    v.caja.classList.add('prof-modal-ancho');
    const primero = v.caja.querySelector('.prof-campo');
    if (primero) primero.focus();
  };

  P.Simuladores = S;
})(window.Profesor = window.Profesor || {});
