// ============================================================================
// Modo Profesor · Editor
// ----------------------------------------------------------------------------
// Edición en el lugar de los bloques de contenido:
//   · editor de texto con formato básico (negrita, cursiva, listas, enlaces);
//   · fórmulas LaTeX como "fichas": se ven dibujadas, se editan con un clic y
//     tienen vista previa en vivo mientras se escriben;
//   · editores específicos para fórmulas destacadas, figuras (epígrafe y datos
//     del gráfico) y autoevaluaciones (preguntas de repaso);
//   · alta, eliminación, ocultamiento y restauración de bloques y secciones.
//
// El editor trabaja siempre sobre el HTML FUENTE del bloque (con las fórmulas en
// LaTeX), no sobre lo que ya dibujó KaTeX. Al guardar, el bloque se vuelve a
// dibujar con las mismas funciones que usa el libro.
// ============================================================================

(function (P) {
  'use strict';

  const U = P.Util;
  const C = P.Config;
  const K = P.Contenido;
  const E = {};

  let abierto = null; // editor abierto { id, raiz, cerrar }

  // --------------------------------------------------------------------------
  // Fórmulas como fichas
  // --------------------------------------------------------------------------
  const RE_FORMULA = /\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]/g;

  function dibujarFormula(destino, latex, destacada) {
    try {
      if (!window.katex) throw new Error('KaTeX no está disponible');
      katex.render(latex, destino, { throwOnError: true, displayMode: destacada });
      return null;
    } catch (e) {
      destino.textContent = latex;
      return (e && e.message ? e.message : String(e)).replace(/^KaTeX parse error:\s*/, '');
    }
  }

  function crearFicha(latex, destacada) {
    const s = document.createElement('span');
    s.className = 'prof-ficha-formula' + (destacada ? ' destacada' : '');
    s.contentEditable = 'false';
    s.dataset.latex = latex;
    s.dataset.destacada = destacada ? '1' : '0';
    s.tabIndex = 0;
    s.setAttribute('role', 'button');
    s.setAttribute('aria-label', 'Fórmula ' + latex + '. Enter para editarla.');
    s.title = 'Clic para editar la fórmula';
    const error = dibujarFormula(s, latex, destacada);
    if (error) s.classList.add('con-error');
    return s;
  }

  // Convierte \( … \) y \[ … \] de los nodos de texto en fichas.
  function textoAFichas(raiz) {
    const recorrido = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
    const nodos = [];
    while (recorrido.nextNode()) nodos.push(recorrido.currentNode);
    nodos.forEach(n => {
      if (n.parentElement && n.parentElement.closest('.prof-ficha-formula, .prof-fijo')) return;
      const texto = n.nodeValue;
      RE_FORMULA.lastIndex = 0;
      if (!RE_FORMULA.test(texto)) return;
      RE_FORMULA.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let ultimo = 0, m;
      while ((m = RE_FORMULA.exec(texto))) {
        if (m.index > ultimo) frag.appendChild(document.createTextNode(texto.slice(ultimo, m.index)));
        frag.appendChild(m[1] !== undefined ? crearFicha(m[1].trim(), false) : crearFicha(m[2].trim(), true));
        ultimo = m.index + m[0].length;
      }
      if (ultimo < texto.length) frag.appendChild(document.createTextNode(texto.slice(ultimo)));
      n.replaceWith(frag);
    });
  }

  // Elementos que no se editan como texto dentro de un bloque (figuras, gráficos,
  // autoevaluaciones): se muestran como un recuadro fijo y se conservan tal cual.
  const SELECTOR_FIJO = 'figure, .grilla-graficos, .quiz-rapido, section.widget';
  function protegerFijos(raiz, mapa) {
    [...raiz.querySelectorAll(SELECTOR_FIJO)].forEach(el => {
      if (!el.isConnected && !raiz.contains(el)) return;
      if (el.parentElement && el.parentElement.closest(SELECTOR_FIJO)) return;
      const k = String(mapa.size);
      mapa.set(k, el.outerHTML);
      const marcador = document.createElement('div');
      marcador.className = 'prof-fijo';
      marcador.contentEditable = 'false';
      marcador.dataset.fijo = k;
      const nombre = el.matches('.quiz-rapido') ? 'Autoevaluación' : el.matches('.diagrama-swap') ? 'Diagrama' : el.matches('.grafico-payoff, .grilla-graficos') ? 'Gráfico' : 'Figura';
      marcador.textContent = `${nombre} (se conserva como está; se edita desde su propio bloque)`;
      el.replaceWith(marcador);
    });
  }

  // HTML fuente → contenido editable.
  function aEdicion(html, area, mapaFijos) {
    const t = document.createElement('template');
    t.innerHTML = html;
    protegerFijos(t.content, mapaFijos);
    textoAFichas(t.content);
    area.replaceChildren(t.content);
  }

  // Contenido editable → HTML fuente saneado.
  function aFuente(area, mapaFijos) {
    const copia = area.cloneNode(true);
    copia.querySelectorAll('.prof-ficha-formula').forEach(f => {
      const l = f.dataset.latex || '';
      f.replaceWith(document.createTextNode(f.dataset.destacada === '1' ? `\\[ ${l} \\]` : `\\(${l}\\)`));
    });
    copia.querySelectorAll('.prof-fijo').forEach(m => {
      const t = document.createElement('template');
      t.innerHTML = mapaFijos.get(m.dataset.fijo) || '';
      m.replaceWith(t.content);
    });
    copia.querySelectorAll('b').forEach(b => { const s = document.createElement('strong'); s.append(...b.childNodes); b.replaceWith(s); });
    copia.querySelectorAll('i').forEach(i => { const s = document.createElement('em'); s.append(...i.childNodes); i.replaceWith(s); });
    copia.querySelectorAll('[contenteditable], [style]').forEach(x => { x.removeAttribute('contenteditable'); x.removeAttribute('style'); });
    copia.querySelectorAll('details[open]').forEach(d => { if (!d.dataset.abiertoOriginal) d.removeAttribute('open'); });
    copia.querySelectorAll('span:not([class]):not([title])').forEach(s => s.replaceWith(...s.childNodes));
    let html = U.sanear(copia.innerHTML);
    html = html.replace(/(<br>\s*)+(<\/(p|li|h[1-4]|figcaption)>)/g, '$2').replace(/<p>(\s|&nbsp;|<br>)*<\/p>/g, '').trim();
    return html;
  }

  const normalizar = html => U.sanear(html || '').replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();

  // --------------------------------------------------------------------------
  // Ventanas emergentes pequeñas (fórmula y enlace)
  // --------------------------------------------------------------------------
  const SIMBOLOS = [
    ['\\frac{a}{b}', 'Fracción'], ['\\sqrt{x}', 'Raíz'], ['e^{x}', 'Exponencial'], ['x_{i}', 'Subíndice'],
    ['x^{2}', 'Potencia'], ['\\ln', 'Logaritmo'], ['\\sigma', 'Sigma'], ['\\mu', 'Mu'], ['\\Delta', 'Delta'],
    ['\\Gamma', 'Gamma'], ['\\Theta', 'Theta'], ['N(d_1)', 'N(d₁)'], ['\\le', '≤'], ['\\ge', '≥'],
    ['\\times', '×'], ['\\max(a;\\ b)', 'Máximo'], ['\\sum_{i=1}^{n}', 'Sumatoria'],
  ];

  function crearVentana(titulo, contenido, botones) {
    const fondo = document.createElement('div');
    fondo.className = 'prof-ui prof-modal-fondo';
    const caja = document.createElement('div');
    caja.className = 'prof-modal';
    caja.setAttribute('role', 'dialog');
    caja.setAttribute('aria-modal', 'true');
    caja.setAttribute('aria-label', titulo);
    caja.innerHTML = `<h2 class="prof-modal-titulo">${U.escapar(titulo)}</h2>`;
    caja.appendChild(contenido);
    const pie = document.createElement('div');
    pie.className = 'prof-modal-pie';
    botones.forEach(b => {
      const x = document.createElement('button');
      x.type = 'button';
      x.className = b.clase || 'prof-btn';
      x.textContent = b.texto;
      x.addEventListener('click', () => b.accion(cerrar));
      pie.appendChild(x);
    });
    caja.appendChild(pie);
    fondo.appendChild(caja);
    const anterior = document.activeElement;
    function cerrar() { fondo.remove(); document.removeEventListener('keydown', teclas, true); if (anterior && anterior.focus) anterior.focus(); }
    function teclas(ev) {
      // Con dos ventanas abiertas (por ejemplo, una fórmula dentro de un ejercicio),
      // las teclas las atiende solo la de arriba.
      const abiertas = document.querySelectorAll('.prof-modal-fondo');
      if (abiertas[abiertas.length - 1] !== fondo) return;
      if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); cerrar(); }
      if (ev.key === 'Tab') {
        // Mantiene el foco dentro de la ventana.
        const focos = [...caja.querySelectorAll('button, input, textarea, select, [tabindex="0"]')].filter(x => !x.disabled && x.offsetParent !== null);
        if (!focos.length) return;
        const i = focos.indexOf(document.activeElement);
        if (ev.shiftKey && i <= 0) { ev.preventDefault(); focos[focos.length - 1].focus(); }
        else if (!ev.shiftKey && i === focos.length - 1) { ev.preventDefault(); focos[0].focus(); }
      }
    }
    // No se cierra al hacer clic afuera: así no se pierde lo escrito por un clic de más.
    document.addEventListener('keydown', teclas, true);
    document.body.appendChild(fondo);
    return { caja, cerrar };
  }
  E.crearVentana = crearVentana;

  // Editor de una fórmula con vista previa en vivo.
  // opciones: { latex, destacada, permitirModo, alAceptar(latex, destacada), alEliminar }
  E.abrirFormula = function (op) {
    const cont = document.createElement('div');
    cont.className = 'prof-formula-editor';
    cont.innerHTML = `
      <label class="prof-etiqueta" for="prof-latex">Fórmula en LaTeX</label>
      <textarea id="prof-latex" class="prof-latex" rows="3" spellcheck="false" autocomplete="off"></textarea>
      <div class="prof-simbolos" role="group" aria-label="Insertar símbolos"></div>
      ${op.permitirModo !== false ? '<label class="prof-casilla"><input type="checkbox" id="prof-destacada"> Fórmula destacada (en su propio renglón)</label>' : ''}
      <div class="prof-etiqueta">Vista previa</div>
      <div class="prof-vista-previa" aria-live="polite"></div>
      <div class="prof-error" hidden></div>
      <p class="prof-ayuda">Ejemplos: <code>c = S_0 N(d_1) - K e^{-rT} N(d_2)</code> · <code>\\sigma\\sqrt{T}</code> · <code>\\frac{1}{2}</code>. No hace falta escribir los delimitadores \\( \\).</p>`;
    const area = cont.querySelector('textarea');
    const vista = cont.querySelector('.prof-vista-previa');
    const error = cont.querySelector('.prof-error');
    const destacada = cont.querySelector('#prof-destacada');
    area.value = op.latex || '';
    if (destacada) destacada.checked = !!op.destacada;
    const simbolos = cont.querySelector('.prof-simbolos');
    SIMBOLOS.forEach(([codigo, nombre]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'prof-btn-chico';
      b.title = nombre + ': ' + codigo;
      b.textContent = nombre;
      b.addEventListener('click', () => {
        const i = area.selectionStart, f = area.selectionEnd;
        area.value = area.value.slice(0, i) + codigo + area.value.slice(f);
        area.focus();
        area.selectionStart = area.selectionEnd = i + codigo.length;
        actualizar();
      });
      simbolos.appendChild(b);
    });
    let valida = true;
    function actualizar() {
      const latex = area.value.trim();
      if (!latex) { vista.textContent = ''; error.hidden = false; error.textContent = 'Escribí la fórmula.'; valida = false; return; }
      const msj = dibujarFormula(vista, latex, destacada ? destacada.checked : !!op.destacada);
      valida = !msj;
      error.hidden = valida;
      error.textContent = msj ? 'La fórmula tiene un error: ' + msj : '';
    }
    area.addEventListener('input', actualizar);
    if (destacada) destacada.addEventListener('change', actualizar);
    const botones = [];
    if (op.alEliminar) botones.push({ texto: 'Quitar la fórmula', clase: 'prof-btn prof-btn-peligro', accion: cerrar => { cerrar(); op.alEliminar(); } });
    botones.push({ texto: 'Cancelar', accion: cerrar => cerrar() });
    botones.push({
      texto: 'Aceptar', clase: 'prof-btn prof-btn-primario', accion: cerrar => {
        actualizar();
        if (!valida) { area.focus(); return; }
        cerrar();
        op.alAceptar(area.value.trim(), destacada ? destacada.checked : !!op.destacada);
      },
    });
    const v = crearVentana(op.titulo || 'Fórmula', cont, botones);
    area.addEventListener('keydown', ev => { if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) v.caja.querySelector('.prof-btn-primario').click(); });
    actualizar();
    area.focus();
  };

  function abrirEnlace(op) {
    const cont = document.createElement('div');
    cont.innerHTML = `
      <label class="prof-etiqueta" for="prof-url">Dirección del enlace</label>
      <input id="prof-url" class="prof-campo" type="text" placeholder="https://… o u6-teoria.html#griegas" autocomplete="off">
      <div class="prof-error" hidden></div>
      <p class="prof-ayuda">Se aceptan direcciones web (https://…) y páginas del libro (por ejemplo, <code>u5-simulacion.html</code>).</p>`;
    const campo = cont.querySelector('input');
    const error = cont.querySelector('.prof-error');
    campo.value = op.url || '';
    const v = crearVentana('Enlace', cont, [
      ...(op.url ? [{ texto: 'Quitar el enlace', clase: 'prof-btn prof-btn-peligro', accion: cerrar => { cerrar(); op.alQuitar(); } }] : []),
      { texto: 'Cancelar', accion: cerrar => cerrar() },
      {
        texto: 'Aceptar', clase: 'prof-btn prof-btn-primario', accion: cerrar => {
          const url = campo.value.trim();
          const valida = url && (/^(https?:|mailto:)/i.test(url) || !/^[a-z][a-z0-9+.-]*:/i.test(url)) && !/\s/.test(url);
          if (!valida) { error.hidden = false; error.textContent = 'Revisá la dirección: tiene que empezar con https:// o ser una página del libro.'; campo.focus(); return; }
          cerrar();
          op.alAceptar(url);
        },
      },
    ]);
    campo.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); v.caja.querySelector('.prof-btn-primario').click(); } });
    campo.focus();
  }

  // --------------------------------------------------------------------------
  // Editor de texto con formato
  // --------------------------------------------------------------------------
  // modo: 'linea' (títulos: una línea, Enter guarda) · 'flujo' (párrafos y listas) ·
  //       'contenedor' (cajas: se edita el interior respetando su diseño)
  E.crearEditorTexto = function ({ html, modo, etiqueta = 'div', clases = '', alEnter, etiquetaAccesible = 'Texto' }) {
    const raiz = document.createElement('div');
    raiz.className = 'prof-editor-texto modo-' + modo;
    const barra = document.createElement('div');
    barra.className = 'prof-barra-formato';
    barra.setAttribute('role', 'toolbar');
    barra.setAttribute('aria-label', 'Formato del texto');
    const area = document.createElement(modo === 'flujo' ? 'div' : etiqueta);
    if (clases) area.className = clases;
    area.classList.add('prof-area');
    area.contentEditable = 'true';
    area.spellcheck = true;
    area.setAttribute('role', 'textbox');
    area.setAttribute('aria-multiline', modo === 'linea' ? 'false' : 'true');
    area.setAttribute('aria-label', etiquetaAccesible);
    if (etiqueta === 'details') { area.setAttribute('open', ''); }
    // Enter crea párrafos (<p>) y no <div>.
    try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch (e) { /* navegador sin soporte */ }
    const fijos = new Map();
    aEdicion(html, area, fijos);

    let rango = null;
    const guardarSeleccion = () => {
      const sel = getSelection();
      if (sel.rangeCount && area.contains(sel.getRangeAt(0).commonAncestorContainer)) rango = sel.getRangeAt(0).cloneRange();
    };
    const restaurarSeleccion = () => {
      area.focus();
      if (!rango) return;
      const sel = getSelection();
      sel.removeAllRanges();
      sel.addRange(rango);
    };
    area.addEventListener('keyup', guardarSeleccion);
    area.addEventListener('mouseup', guardarSeleccion);
    area.addEventListener('input', guardarSeleccion);

    const insertarNodo = nodo => {
      restaurarSeleccion();
      const sel = getSelection();
      if (!sel.rangeCount || !area.contains(sel.getRangeAt(0).commonAncestorContainer)) { area.appendChild(nodo); return; }
      const r = sel.getRangeAt(0);
      r.deleteContents();
      r.insertNode(nodo);
      r.setStartAfter(nodo);
      r.collapse(true);
      sel.removeAllRanges();
      sel.addRange(r);
      guardarSeleccion();
    };

    const editarFicha = ficha => E.abrirFormula({
      titulo: 'Editar la fórmula',
      latex: ficha.dataset.latex,
      destacada: ficha.dataset.destacada === '1',
      permitirModo: modo !== 'linea',
      alAceptar: (latex, dest) => { const nueva = crearFicha(latex, dest); ficha.replaceWith(nueva); nueva.focus(); },
      alEliminar: () => ficha.remove(),
    });
    area.addEventListener('click', ev => { const f = ev.target.closest('.prof-ficha-formula'); if (f && area.contains(f)) { ev.preventDefault(); editarFicha(f); } });
    area.addEventListener('keydown', ev => {
      const f = ev.target.closest && ev.target.closest('.prof-ficha-formula');
      if (f && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); editarFicha(f); return; }
      if (ev.key === 'Enter' && modo === 'linea') { ev.preventDefault(); if (alEnter) alEnter(); }
    });
    // Al pegar, solo texto: evita que entre formato de Word o de páginas web.
    area.addEventListener('paste', ev => {
      ev.preventDefault();
      const texto = (ev.clipboardData || window.clipboardData).getData('text/plain');
      document.execCommand('insertText', false, modo === 'linea' ? texto.replace(/\s*\n\s*/g, ' ') : texto);
    });
    area.addEventListener('drop', ev => ev.preventDefault());

    const comandos = [
      { texto: 'N', titulo: 'Negrita (Ctrl+B)', clase: 'negrita', accion: () => document.execCommand('bold') },
      { texto: 'C', titulo: 'Cursiva (Ctrl+I)', clase: 'cursiva', accion: () => document.execCommand('italic') },
      ...(modo === 'linea' ? [] : [
        { texto: '• Lista', titulo: 'Lista con viñetas', accion: () => document.execCommand('insertUnorderedList') },
        { texto: '1. Lista', titulo: 'Lista numerada', accion: () => document.execCommand('insertOrderedList') },
      ]),
      {
        texto: 'Enlace', titulo: 'Agregar o cambiar un enlace', accion: () => {
          guardarSeleccion();
          const sel = getSelection();
          const nodo = sel.rangeCount ? sel.getRangeAt(0).commonAncestorContainer : null;
          const a = nodo && (nodo.nodeType === 1 ? nodo : nodo.parentElement).closest('a');
          abrirEnlace({
            url: a && area.contains(a) ? a.getAttribute('href') : '',
            alQuitar: () => { if (a) a.replaceWith(...a.childNodes); },
            alAceptar: url => {
              if (a && area.contains(a)) { a.setAttribute('href', url); return; }
              restaurarSeleccion();
              const s = getSelection();
              if (s.rangeCount && !s.getRangeAt(0).collapsed) document.execCommand('createLink', false, url);
              else { const nuevo = document.createElement('a'); nuevo.href = url; nuevo.textContent = url; insertarNodo(nuevo); }
            },
          });
        },
      },
      {
        texto: 'ƒ Fórmula', titulo: 'Insertar una fórmula en el texto', accion: () => {
          guardarSeleccion();
          E.abrirFormula({ titulo: 'Insertar una fórmula', latex: '', destacada: false, permitirModo: modo !== 'linea', alAceptar: (l, d) => insertarNodo(crearFicha(l, d)) });
        },
      },
      { texto: 'Quitar formato', titulo: 'Quitar negrita, cursiva y enlaces de la selección', accion: () => { document.execCommand('removeFormat'); document.execCommand('unlink'); } },
    ];
    comandos.forEach(cmd => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'prof-btn-formato ' + (cmd.clase || '');
      b.textContent = cmd.texto;
      b.title = cmd.titulo;
      b.setAttribute('aria-label', cmd.titulo);
      // mousedown sin foco: la selección queda en el texto.
      b.addEventListener('mousedown', ev => ev.preventDefault());
      b.addEventListener('click', () => { if (!area.contains(document.activeElement)) restaurarSeleccion(); cmd.accion(); guardarSeleccion(); });
      barra.appendChild(b);
    });
    raiz.append(barra, area);
    return {
      raiz,
      area,
      fuente: () => aFuente(area, fijos),
      enfocar: () => {
        area.focus();
        const sel = getSelection();
        const r = document.createRange();
        r.selectNodeContents(area);
        r.collapse(false);
        sel.removeAllRanges();
        sel.addRange(r);
      },
    };
  };

  // Cajas con título (<p class="caja-titulo">): el título se edita en su propio
  // renglón, para que «seleccionar todo» en el contenido no lo borre.
  function separarTitulo(html) {
    const t = document.createElement('template');
    t.innerHTML = html;
    const nodos = [...t.content.childNodes].filter(n => n.nodeType === 1 || n.nodeValue.trim());
    const primero = nodos[0];
    if (!primero || primero.nodeType !== 1 || !primero.matches('p.caja-titulo')) return null;
    const titulo = primero.innerHTML;
    primero.remove();
    return { titulo, resto: t.innerHTML };
  }

  function crearEditorCaja({ html, etiqueta, clases, etiquetaAccesible }) {
    const sep = separarTitulo(html);
    if (!sep) return E.crearEditorTexto({ html, modo: 'contenedor', etiqueta, clases, etiquetaAccesible });
    const raiz = document.createElement('div');
    raiz.className = 'prof-editor-caja';
    const rotulo = texto => { const d = document.createElement('div'); d.className = 'prof-etiqueta'; d.textContent = texto; return d; };
    const titulo = E.crearEditorTexto({ html: sep.titulo, modo: 'linea', etiqueta: 'p', etiquetaAccesible: 'Título de la caja' });
    const cuerpo = E.crearEditorTexto({ html: sep.resto, modo: 'contenedor', etiqueta, clases, etiquetaAccesible });
    raiz.append(rotulo('Título de la caja'), titulo.raiz, rotulo('Contenido'), cuerpo.raiz);
    return {
      raiz,
      area: cuerpo.area,
      fuente: () => {
        const t = titulo.fuente();
        return (U.textoPlano(t) || /\\\(/.test(t) ? `<p class="caja-titulo">${t}</p>` : '') + cuerpo.fuente();
      },
      enfocar: cuerpo.enfocar,
    };
  }

  // En un bloque recién agregado, selecciona el texto de ejemplo para escribir encima.
  const MARCADORES = /^(Escribí acá.*|Primer punto\.|Subtítulo|Nueva sección|Planteo del ejemplo, con sus datos\.)$/;
  function seleccionarMarcador() {
    if (!abierto) return;
    const cand = [...abierto.marco.querySelectorAll('.prof-area, .prof-area p, .prof-area li')]
      .find(x => MARCADORES.test(x.textContent.trim()) && !x.querySelector('p, li'));
    if (!cand) return;
    cand.closest('.prof-area').focus();
    const r = document.createRange();
    r.selectNodeContents(cand);
    const sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
  }

  // --------------------------------------------------------------------------
  // Marco común de edición en el lugar
  // --------------------------------------------------------------------------
  function abrirMarco(id, titulo, cuerpo, { alGuardar, ayuda, ocultarOriginal = true }) {
    cerrarAbierto();
    const el = K.elemento(id);
    if (!el) return null;
    const marco = document.createElement('div');
    marco.className = 'prof-ui prof-marco-edicion';
    marco.setAttribute('role', 'region');
    marco.setAttribute('aria-label', titulo);
    marco.innerHTML = `<div class="prof-marco-cabecera"><span class="prof-marco-titulo">${U.escapar(titulo)}</span><span class="prof-marco-acciones"></span></div>`;
    const acciones = marco.querySelector('.prof-marco-acciones');
    const cancelar = document.createElement('button');
    cancelar.type = 'button'; cancelar.className = 'prof-btn'; cancelar.textContent = 'Cancelar';
    const guardar = document.createElement('button');
    guardar.type = 'button'; guardar.className = 'prof-btn prof-btn-primario'; guardar.textContent = 'Guardar';
    acciones.append(cancelar, guardar);
    marco.appendChild(cuerpo);
    if (ayuda) { const p = document.createElement('p'); p.className = 'prof-ayuda'; p.innerHTML = ayuda; marco.appendChild(p); }
    const errorEl = document.createElement('div');
    errorEl.className = 'prof-error';
    errorEl.hidden = true;
    marco.appendChild(errorEl);
    el.before(marco);
    // Mientras se edita, el editor ocupa el lugar del bloque (salvo en las figuras,
    // donde conviene seguir viendo el dibujo).
    if (ocultarOriginal) el.classList.add('prof-en-edicion');
    function cerrar() { marco.remove(); const x = K.elemento(id); if (x) x.classList.remove('prof-en-edicion'); abierto = null; P.Interfaz && P.Interfaz.refrescarBarraBloque(); }
    cancelar.addEventListener('click', () => { cerrar(); const x = K.elemento(id); if (x) x.focus(); });
    guardar.addEventListener('click', () => {
      const r = alGuardar();
      if (r && r.error) { errorEl.hidden = false; errorEl.textContent = r.error; return; }
      cerrar();
      // El índice lateral se arma de nuevo cuando el editor ya no está en la página
      // (si no, tomaría el título que se estaba editando).
      K.rehacerIndice();
      const x = K.elemento(id);
      if (x) { x.focus({ preventScroll: true }); P.Interfaz && P.Interfaz.seleccionar(x); }
    });
    marco.addEventListener('keydown', ev => {
      if (ev.key === 'Escape' && !document.querySelector('.prof-modal-fondo')) { ev.preventDefault(); cancelar.click(); }
      if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); guardar.click(); }
    });
    abierto = { id, marco, cerrar };
    P.Interfaz && P.Interfaz.ocultarBarraBloque();
    marco.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    return { marco, errorEl };
  }

  function cerrarAbierto() { if (abierto) abierto.cerrar(); }
  E.hayEditorAbierto = () => !!abierto;
  E.cerrarAbierto = cerrarAbierto;

  const clavePag = () => K.clavePagina();
  const nuevoDe = id => (C.pagina(clavePag()).nuevos || []).find(n => n.id === id);

  // Guarda el HTML de un bloque original (o lo borra si volvió al original).
  function guardarBloque(id, cambios, descripcion) {
    C.cambiar(descripcion, c => {
      const pag = c.paginas[clavePag()] = c.paginas[clavePag()] || {};
      pag.bloques = pag.bloques || {};
      const actual = pag.bloques[id] || { huella: K.original(id).huella };
      Object.assign(actual, cambios);
      Object.keys(actual).forEach(k => { if (actual[k] === undefined) delete actual[k]; });
      const vacio = actual.html === undefined && !actual.atributos && !actual.oculto;
      if (vacio) delete pag.bloques[id]; else pag.bloques[id] = actual;
    });
    // Mostrar u ocultar no cambia el contenido: solo se actualizan las marcas. (Volver a
    // armar un simulador lo desconectaría de su script.)
    if (Object.keys(cambios).every(k => k === 'oculto')) K.refrescarMarcas();
    else K.actualizarBloque(id);
  }

  function guardarNuevo(id, html, descripcion) {
    C.cambiar(descripcion, c => {
      const n = (c.paginas[clavePag()].nuevos || []).find(x => x.id === id);
      if (n) n.html = U.sanear(html);
    });
    K.actualizarBloque(id);
  }

  // --------------------------------------------------------------------------
  // Editar un bloque (abre el editor que corresponde a su tipo)
  // --------------------------------------------------------------------------
  const TIPO_DE_NUEVO = { parrafo: 'parrafo', lista: 'parrafo', subtitulo: 'linea', seccion: 'linea', nota: 'contenedor', ejemplo: 'contenedor', formula: 'formula', pregunta: 'quiz' };

  E.editable = function (id) {
    const f = K.fuente(id);
    if (!f) return false;
    const tipo = f.nuevo ? TIPO_DE_NUEVO[f.tipo] : f.tipo;
    return ['linea', 'parrafo', 'contenedor', 'formula', 'figura', 'grafico', 'diagrama', 'quiz'].includes(tipo);
  };

  E.editarBloque = function (id) {
    const f = K.fuente(id);
    if (!f) return;
    const tipo = f.nuevo ? TIPO_DE_NUEVO[f.tipo] : f.tipo;
    if (tipo === 'formula') return leerFormula(f.html).simple ? editarFormulaBloque(id, f) : editarTexto(id, f, 'contenedor');
    if (tipo === 'quiz') return editarQuiz(id, f);
    if (['figura', 'grafico', 'diagrama'].includes(tipo)) return editarFigura(id, f);
    return editarTexto(id, f, tipo);
  };

  function editarTexto(id, f, tipo) {
    const el = K.elemento(id);
    const orig = K.original(id);
    let editor;
    if (f.nuevo) {
      const t = document.createElement('template');
      t.innerHTML = f.html;
      const unico = t.content.children.length === 1 ? t.content.firstElementChild : null;
      if (tipo === 'linea' && unico) editor = E.crearEditorTexto({ html: unico.innerHTML, modo: 'linea', etiqueta: unico.tagName.toLowerCase(), clases: unico.className, alEnter: () => guardarBtn(), etiquetaAccesible: 'Título' });
      else if (tipo === 'contenedor' && unico) editor = crearEditorCaja({ html: unico.innerHTML, etiqueta: unico.tagName.toLowerCase(), clases: unico.className, etiquetaAccesible: 'Contenido de la caja' });
      else editor = E.crearEditorTexto({ html: f.html, modo: 'flujo', etiquetaAccesible: 'Texto' });
      const ref = unico;
      const marco = abrirMarco(id, 'Editar el bloque agregado', editor.raiz, {
        ayuda: 'Ctrl+Enter guarda · Esc cancela · Hacé clic en una fórmula para editarla.',
        alGuardar: () => {
          const fuente = editor.fuente();
          if (!U.textoPlano(fuente) && !/prof-fijo|\\\(|\\\[/.test(fuente)) return { error: 'El bloque quedó vacío. Escribí un texto o usá "Eliminar" en la barra del bloque.' };
          let html = fuente;
          if (ref && (tipo === 'linea' || tipo === 'contenedor')) {
            const tag = ref.tagName.toLowerCase();
            html = `<${tag}${ref.className ? ` class="${ref.className}"` : ''}>${fuente}</${tag}>`;
          }
          guardarNuevo(id, html, 'Editar un bloque agregado');
          return null;
        },
      });
      function guardarBtn() { marco.marco.querySelector('.prof-btn-primario').click(); }
      editor.enfocar();
      return;
    }
    const tag = orig.clon.tagName.toLowerCase();
    const clase = orig.clon.getAttribute('class') || '';
    if (tipo === 'linea') {
      editor = E.crearEditorTexto({ html: f.html, modo: 'linea', etiqueta: tag, clases: clase, alEnter: () => guardarBtn(), etiquetaAccesible: 'Título' });
    } else if (tipo === 'parrafo') {
      const html = f.envolver ? f.html : `<${tag}${clase ? ` class="${clase}"` : ''}>${f.html}</${tag}>`;
      editor = E.crearEditorTexto({ html, modo: 'flujo', etiquetaAccesible: 'Párrafo' });
    } else {
      editor = crearEditorCaja({ html: f.html, etiqueta: tag, clases: clase, etiquetaAccesible: 'Contenido del bloque' });
      if (tag === 'details' && orig.clon.hasAttribute('open')) editor.area.dataset.abiertoOriginal = '1';
    }
    const marco = abrirMarco(id, tipo === 'linea' ? 'Editar el título' : 'Editar el bloque', editor.raiz, {
      ayuda: tipo === 'linea' ? 'Enter guarda · Esc cancela.' : 'Ctrl+Enter guarda · Esc cancela · Hacé clic en una fórmula para editarla. Para un párrafo nuevo, presioná Enter.',
      alGuardar: () => {
        const fuente = editor.fuente();
        if (!U.textoPlano(fuente) && !/\\\(|\\\[|<figure|quiz-rapido/.test(fuente)) return { error: 'El bloque quedó vacío. Si querés que no se vea, usá "Ocultar" en la barra del bloque.' };
        let cambio;
        if (tipo === 'parrafo') {
          const t = document.createElement('template');
          t.innerHTML = fuente;
          const hijos = t.content.children;
          const soloTexto = [...t.content.childNodes].every(n => n.nodeType === 1 || !n.nodeValue.trim());
          if (hijos.length === 1 && soloTexto && hijos[0].tagName.toLowerCase() === tag) cambio = { html: hijos[0].innerHTML, envolver: undefined };
          else cambio = { html: fuente, envolver: true };
          if (!cambio.envolver && normalizar(cambio.html) === normalizar(K.fuenteOriginal(id))) cambio = { html: undefined, envolver: undefined };
        } else {
          cambio = normalizar(fuente) === normalizar(K.fuenteOriginal(id)) ? { html: undefined } : { html: fuente };
        }
        guardarBloque(id, cambio, tipo === 'linea' ? 'Editar un título' : 'Editar un bloque');
        return null;
      },
    });
    function guardarBtn() { marco.marco.querySelector('.prof-btn-primario').click(); }
    if (el) editor.area.style.minHeight = Math.min(el.offsetHeight, 400) + 'px';
    editor.enfocar();
  }

  // Fórmula destacada (div.formula): nombre opcional + LaTeX con vista previa.
  function leerFormula(html) {
    const t = document.createElement('template');
    t.innerHTML = html;
    const raiz = t.content.querySelector('.formula') || t.content;
    const nombreEl = raiz.querySelector('.nombre-formula');
    const nombre = nombreEl ? nombreEl.textContent.trim() : '';
    if (nombreEl) nombreEl.remove();
    const texto = raiz.textContent.trim();
    const m = texto.match(/^\\\[([\s\S]*)\\\]$/) || texto.match(/^\\\(([\s\S]*)\\\)$/);
    // "simple": una sola fórmula y nada más (las que tienen dos o más se editan como texto).
    const simple = !!m && (texto.match(/\\\[|\\\(/g) || []).length === 1 && !raiz.querySelector('*:not(br)');
    return { nombre, latex: (m ? m[1] : texto).trim(), simple };
  }

  function editarFormulaBloque(id, f) {
    const { nombre, latex } = leerFormula(f.html);
    const cuerpo = document.createElement('div');
    cuerpo.className = 'prof-formula-editor';
    cuerpo.innerHTML = `
      <label class="prof-etiqueta" for="prof-fnombre">Nombre de la fórmula (opcional)</label>
      <input id="prof-fnombre" class="prof-campo" type="text" placeholder="Por ejemplo: Paridad put-call">
      <label class="prof-etiqueta" for="prof-flatex">Fórmula en LaTeX</label>
      <textarea id="prof-flatex" class="prof-latex" rows="3" spellcheck="false"></textarea>
      <div class="prof-simbolos" role="group" aria-label="Insertar símbolos"></div>
      <div class="prof-etiqueta">Vista previa</div>
      <div class="prof-vista-previa formula" aria-live="polite"></div>
      <div class="prof-error" hidden></div>`;
    const nom = cuerpo.querySelector('#prof-fnombre'), area = cuerpo.querySelector('#prof-flatex');
    const vista = cuerpo.querySelector('.prof-vista-previa'), error = cuerpo.querySelector('.prof-error');
    nom.value = nombre; area.value = latex;
    SIMBOLOS.forEach(([codigo, n]) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'prof-btn-chico'; b.textContent = n; b.title = n + ': ' + codigo;
      b.addEventListener('click', () => { const i = area.selectionStart; area.value = area.value.slice(0, i) + codigo + area.value.slice(area.selectionEnd); area.focus(); area.selectionStart = area.selectionEnd = i + codigo.length; actualizar(); });
      cuerpo.querySelector('.prof-simbolos').appendChild(b);
    });
    let valida = true;
    function actualizar() {
      const msj = area.value.trim() ? dibujarFormula(vista, area.value.trim(), true) : 'Escribí la fórmula.';
      valida = !msj; error.hidden = valida; error.textContent = msj ? 'La fórmula tiene un error: ' + msj : '';
    }
    area.addEventListener('input', actualizar);
    abrirMarco(id, 'Editar la fórmula', cuerpo, {
      ayuda: 'La vista previa se actualiza mientras escribís. Ctrl+Enter guarda.',
      alGuardar: () => {
        actualizar();
        if (!valida) return { error: 'Corregí la fórmula antes de guardar.' };
        const html = (nom.value.trim() ? `<span class="nombre-formula">${U.escapar(nom.value.trim())}</span>` : '') + `\\[ ${area.value.trim()} \\]`;
        if (f.nuevo) guardarNuevo(id, `<div class="formula${nom.value.trim() ? ' con-nombre' : ''}">${html}</div>`, 'Editar una fórmula');
        else {
          const igual = normalizar(html) === normalizar(K.fuenteOriginal(id)) || (leerFormula(K.fuenteOriginal(id)).latex === area.value.trim() && leerFormula(K.fuenteOriginal(id)).nombre === nom.value.trim());
          guardarBloque(id, { html: igual ? undefined : html }, 'Editar una fórmula');
        }
        return null;
      },
    });
    actualizar();
    area.focus();
  }

  // Figuras: epígrafe y, en gráficos y diagramas, sus datos.
  function editarFigura(id, f) {
    const cuerpo = document.createElement('div');
    cuerpo.className = 'prof-form';
    const epigrafe = E.crearEditorTexto({ html: f.html, modo: 'linea', etiqueta: 'p', etiquetaAccesible: 'Epígrafe' });
    const lab = document.createElement('div');
    lab.className = 'prof-etiqueta';
    lab.textContent = 'Epígrafe (texto debajo de la figura)';
    cuerpo.append(lab, epigrafe.raiz);
    const campos = {};
    const agregarCampo = (attr, etiqueta, ayuda) => {
      const id2 = 'prof-' + attr;
      const d = document.createElement('div');
      d.innerHTML = `<label class="prof-etiqueta" for="${id2}">${etiqueta}</label><input id="${id2}" class="prof-campo prof-mono" type="text" autocomplete="off"><p class="prof-ayuda">${ayuda}</p>`;
      d.querySelector('input').value = f.atributos[attr] || '';
      campos[attr] = d.querySelector('input');
      cuerpo.appendChild(d);
    };
    if (f.tipo === 'grafico') {
      agregarCampo('data-patas', 'Posiciones del gráfico', 'Cada posición: <code>compra|venta call|put|accion strike prima [cantidad]</code>, separadas por punto y coma. Ejemplo: <code>compra call 95 8,53; venta call 105 3,44</code>.');
      agregarCampo('data-desde', 'Precio mínimo del eje (opcional)', 'Si queda vacío se calcula solo.');
      agregarCampo('data-hasta', 'Precio máximo del eje (opcional)', 'Si queda vacío se calcula solo.');
    }
    if (f.tipo === 'diagrama') {
      agregarCampo('data-entidades', 'Participantes', 'Separados por | (barra vertical). Ejemplo: <code>Empresa A | Banco | Empresa B</code>.');
      agregarCampo('data-flujos', 'Flujos', 'Cada flujo: <code>Origen &gt; Destino: texto</code>, separados por punto y coma. "afuera" es el prestamista o el mercado.');
    }
    abrirMarco(id, 'Editar la figura', cuerpo, {
      ocultarOriginal: false,
      alGuardar: () => {
        const atributos = {};
        Object.entries(campos).forEach(([a, input]) => { atributos[a] = input.value.trim(); });
        if (f.tipo === 'grafico') {
          const patas = atributos['data-patas'];
          let ok = !!patas;
          try {
            const legs = parsearPatas(patas);
            ok = ok && legs.length > 0 && legs.every(l => ['compra', 'venta'].includes(l.side) && ['call', 'put', 'stock', 'bond'].includes(l.type) && (l.type === 'stock' || Number.isFinite(l.strike)) && Number.isFinite(l.premium === undefined ? 0 : l.premium || 0));
          } catch (e) { ok = false; }
          if (!ok) return { error: 'Revisá las posiciones: cada una tiene que ser, por ejemplo, "compra call 100 5".' };
          ['data-desde', 'data-hasta'].forEach(a => { if (atributos[a] && !Number.isFinite(U.aNumero(atributos[a]))) atributos[a] = ''; });
          if (atributos['data-desde'] && atributos['data-hasta'] && U.aNumero(atributos['data-desde']) >= U.aNumero(atributos['data-hasta'])) return { error: 'El precio mínimo del eje tiene que ser menor que el máximo.' };
        }
        if (f.tipo === 'diagrama') {
          const ents = atributos['data-entidades'].split('|').map(s => s.trim()).filter(Boolean);
          const flujos = atributos['data-flujos'].split(';').map(s => s.trim()).filter(Boolean);
          if (ents.length < 2) return { error: 'El diagrama necesita al menos dos participantes.' };
          const malo = flujos.find(fl => !/^.+>.+:.+$/.test(fl));
          if (malo) return { error: `El flujo "${malo}" no tiene el formato "Origen > Destino: texto".` };
        }
        Object.keys(atributos).forEach(a => { if (atributos[a] === '') delete atributos[a]; });
        const html = epigrafe.fuente();
        const orig = K.original(id);
        const atributosCambiados = Object.keys(campos).some(a => (atributos[a] || '') !== (orig.clon.getAttribute(a) || ''));
        guardarBloque(id, {
          html: normalizar(html) === normalizar(K.fuenteOriginal(id)) ? undefined : html,
          atributos: atributosCambiados ? atributos : undefined,
        }, 'Editar una figura');
        return null;
      },
    });
    epigrafe.enfocar();
  }

  // --------------------------------------------------------------------------
  // Autoevaluaciones (preguntas de repaso)
  // --------------------------------------------------------------------------
  function leerQuiz(html) {
    const t = document.createElement('template');
    t.innerHTML = html;
    const raiz = t.content.querySelector('.quiz-rapido') || t.content;
    const tituloEl = raiz.querySelector(':scope > .caja-titulo');
    return {
      titulo: tituloEl ? tituloEl.textContent.trim() : 'Autoevaluación rápida',
      preguntas: [...raiz.querySelectorAll('.qr-pregunta')].map(q => ({
        correcta: Math.max(0, parseInt(q.dataset.correcta, 10) - 1 || 0),
        enunciado: (q.querySelector('.qr-enunciado') || {}).innerHTML || '',
        opciones: [...q.querySelectorAll('.qr-op > li')].map(li => li.innerHTML),
        explicacion: (q.querySelector('.qr-explicacion') || {}).innerHTML || '',
      })),
    };
  }

  function quizAHTML(titulo, preguntas) {
    return `<p class="caja-titulo">${U.escapar(titulo || 'Autoevaluación rápida')}</p>` + preguntas.map(p => `
        <div class="qr-pregunta" data-correcta="${p.correcta + 1}">
          <p class="qr-enunciado">${p.enunciado}</p>
          <ol class="qr-op">${p.opciones.map(o => `<li>${o}</li>`).join('')}</ol>
          <p class="qr-explicacion">${p.explicacion}</p>
        </div>`).join('');
  }

  function editarQuiz(id, f) {
    const datos = leerQuiz(f.html);
    if (!datos.preguntas.length) datos.preguntas.push({ correcta: 0, enunciado: '', opciones: ['', ''], explicacion: '' });
    const cuerpo = document.createElement('div');
    cuerpo.className = 'prof-form prof-quiz-editor';
    cuerpo.innerHTML = `<label class="prof-etiqueta" for="prof-qtitulo">Título de la caja</label><input id="prof-qtitulo" class="prof-campo" type="text">
      <div class="prof-quiz-preguntas"></div>
      <button type="button" class="prof-btn" data-q="agregar-pregunta">+ Agregar otra pregunta</button>`;
    cuerpo.querySelector('#prof-qtitulo').value = datos.titulo;
    const lista = cuerpo.querySelector('.prof-quiz-preguntas');
    const editores = []; // por pregunta: { enunciado, opciones: [editor], correcta: () => n, explicacion }
    let serie = 0;

    function agregarPregunta(p) {
      const n = ++serie;
      const caja = document.createElement('fieldset');
      caja.className = 'prof-quiz-pregunta';
      caja.innerHTML = `<legend>Pregunta</legend>
        <div class="prof-etiqueta">Enunciado</div><div data-lugar="enunciado"></div>
        <div class="prof-etiqueta">Opciones (marcá la correcta)</div><div data-lugar="opciones" class="prof-quiz-opciones"></div>
        <button type="button" class="prof-btn-chico" data-q="agregar-opcion">+ Opción</button>
        <div class="prof-etiqueta">Explicación (se muestra al responder)</div><div data-lugar="explicacion"></div>
        <div class="prof-quiz-pie"><button type="button" class="prof-btn-chico prof-btn-peligro" data-q="quitar-pregunta">Quitar esta pregunta</button></div>`;
      const reg = { caja, opciones: [] };
      reg.enunciado = E.crearEditorTexto({ html: p.enunciado, modo: 'linea', etiqueta: 'p', etiquetaAccesible: 'Enunciado de la pregunta' });
      caja.querySelector('[data-lugar="enunciado"]').appendChild(reg.enunciado.raiz);
      reg.explicacion = E.crearEditorTexto({ html: p.explicacion, modo: 'linea', etiqueta: 'p', etiquetaAccesible: 'Explicación' });
      caja.querySelector('[data-lugar="explicacion"]').appendChild(reg.explicacion.raiz);
      const cont = caja.querySelector('[data-lugar="opciones"]');
      const agregarOpcion = (html, esCorrecta) => {
        const fila = document.createElement('div');
        fila.className = 'prof-quiz-opcion';
        const radio = document.createElement('input');
        radio.type = 'radio'; radio.name = 'prof-correcta-' + n; radio.checked = esCorrecta;
        radio.setAttribute('aria-label', 'Marcar como respuesta correcta');
        const ed = E.crearEditorTexto({ html, modo: 'linea', etiqueta: 'p', etiquetaAccesible: 'Texto de la opción' });
        const quitar = document.createElement('button');
        quitar.type = 'button'; quitar.className = 'prof-btn-chico'; quitar.textContent = 'Quitar'; quitar.setAttribute('aria-label', 'Quitar esta opción');
        quitar.addEventListener('click', () => {
          if (reg.opciones.length <= 2) { P.Interfaz.aviso('Cada pregunta necesita al menos dos opciones.'); return; }
          reg.opciones = reg.opciones.filter(o => o.fila !== fila); fila.remove();
        });
        fila.append(radio, ed.raiz, quitar);
        cont.appendChild(fila);
        reg.opciones.push({ fila, radio, ed });
      };
      p.opciones.forEach((o, i) => agregarOpcion(o, i === p.correcta));
      caja.querySelector('[data-q="agregar-opcion"]').addEventListener('click', () => {
        if (reg.opciones.length >= 6) { P.Interfaz.aviso('Como máximo, seis opciones por pregunta.'); return; }
        agregarOpcion('', false);
      });
      caja.querySelector('[data-q="quitar-pregunta"]').addEventListener('click', () => {
        if (editores.length <= 1) { P.Interfaz.aviso('La autoevaluación necesita al menos una pregunta. Para sacarla, ocultá o eliminá el bloque.'); return; }
        editores.splice(editores.indexOf(reg), 1); caja.remove();
      });
      lista.appendChild(caja);
      editores.push(reg);
    }
    datos.preguntas.forEach(agregarPregunta);
    cuerpo.querySelector('[data-q="agregar-pregunta"]').addEventListener('click', () => agregarPregunta({ correcta: 0, enunciado: '', opciones: ['', '', ''], explicacion: '' }));

    abrirMarco(id, 'Editar las preguntas de repaso', cuerpo, {
      ayuda: 'Los alumnos ven las opciones como botones y, al elegir, la explicación. Ctrl+Enter guarda.',
      alGuardar: () => {
        const preguntas = [];
        for (const [i, r] of editores.entries()) {
          const enunciado = r.enunciado.fuente();
          const opciones = r.opciones.map(o => o.ed.fuente());
          const correcta = r.opciones.findIndex(o => o.radio.checked);
          if (!U.textoPlano(enunciado) && !/\\\(/.test(enunciado)) return { error: `Falta el enunciado de la pregunta ${i + 1}.` };
          if (opciones.some(o => !U.textoPlano(o) && !/\\\(/.test(o))) return { error: `Hay una opción vacía en la pregunta ${i + 1}.` };
          if (correcta < 0) return { error: `Marcá la opción correcta de la pregunta ${i + 1}.` };
          preguntas.push({ enunciado, opciones, correcta, explicacion: r.explicacion.fuente() });
        }
        const titulo = cuerpo.querySelector('#prof-qtitulo').value.trim() || 'Autoevaluación rápida';
        const interior = quizAHTML(titulo, preguntas);
        if (f.nuevo) guardarNuevo(id, `<div class="quiz-rapido">${interior}</div>`, 'Editar preguntas de repaso');
        else guardarBloque(id, { html: normalizar(interior) === normalizar(K.fuenteOriginal(id)) ? undefined : interior }, 'Editar preguntas de repaso');
        return null;
      },
    });
  }

  // --------------------------------------------------------------------------
  // Bloques nuevos
  // --------------------------------------------------------------------------
  const PLANTILLAS = {
    parrafo: '<p>Escribí acá el texto.</p>',
    lista: '<ul><li>Primer punto.</li><li>Segundo punto.</li></ul>',
    subtitulo: '<h3>Subtítulo</h3>',
    nota: '<div class="caja docente"><p class="caja-titulo">Nota del docente</p><p>Escribí acá la nota.</p></div>',
    ejemplo: '<div class="caja ejemplo"><p class="caja-titulo">Ejemplo</p><p>Planteo del ejemplo, con sus datos.</p><p>Resolución paso a paso.</p></div>',
    formula: '<div class="formula">\\[ c = S_0\\,N(d_1) - K e^{-rT} N(d_2) \\]</div>',
    pregunta: `<div class="quiz-rapido">${quizAHTML('Pregunta de repaso', [{ correcta: 0, enunciado: 'Escribí la pregunta.', opciones: ['Respuesta correcta', 'Otra opción', 'Otra opción'], explicacion: 'Por qué es correcta.' }])}</div>`,
    seccion: '<h2>Nueva sección</h2>',
  };
  E.TIPOS_NUEVOS = [
    ['parrafo', 'Párrafo'], ['lista', 'Lista'], ['subtitulo', 'Subtítulo'], ['nota', 'Nota del docente'],
    ['ejemplo', 'Ejemplo'], ['formula', 'Fórmula destacada'], ['pregunta', 'Pregunta de repaso'], ['seccion', 'Nueva sección'],
  ];

  // Agrega un bloque debajo de "anclaId" y abre su editor.
  E.agregar = function (anclaId, tipo) {
    cerrarAbierto();
    const clave = clavePag();
    const ancla = anclaId === '__inicio' ? null : K.elemento(anclaId);
    if (tipo === 'seccion') {
      const seccion = ancla ? K.seccionDe(ancla) : '__intro';
      const h2 = { id: U.nuevoId('s'), tipo: 'seccion', despues: null, despuesSeccion: seccion, html: PLANTILLAS.seccion, creado: new Date().toISOString() };
      const p = { id: U.nuevoId('n'), tipo: 'parrafo', despues: h2.id, despuesSeccion: null, html: PLANTILLAS.parrafo, creado: new Date().toISOString() };
      C.cambiar('Agregar una sección', c => {
        const pag = c.paginas[clave] = c.paginas[clave] || {};
        pag.nuevos = pag.nuevos || [];
        pag.nuevos.push(h2, p);
        if (pag.secciones && pag.secciones.orden && pag.secciones.orden.length) {
          const i = pag.secciones.orden.indexOf(seccion);
          pag.secciones.orden.splice(i < 0 ? 0 : i + 1, 0, h2.id);
        }
      });
      const elH2 = K.insertarNuevo(h2);
      K.insertarNuevo(p);
      K.refrescarMarcas();
      K.rehacerIndice();
      K.renderizar(elH2);
      elH2.scrollIntoView({ block: 'center' });
      E.editarBloque(h2.id);
      seleccionarMarcador();
      return;
    }
    const n = { id: U.nuevoId('n'), tipo, despues: anclaId, ancla: K.esOriginal(anclaId) ? K.original(anclaId).huella : null, despuesSeccion: null, html: PLANTILLAS[tipo] || PLANTILLAS.parrafo, creado: new Date().toISOString() };
    C.cambiar('Agregar un bloque', c => {
      const pag = c.paginas[clave] = c.paginas[clave] || {};
      pag.nuevos = pag.nuevos || [];
      pag.nuevos.push(n);
    });
    const el = K.insertarNuevo(n);
    K.refrescarMarcas();
    K.renderizar(el);
    E.editarBloque(n.id);
    seleccionarMarcador();
  };

  // Elimina un bloque agregado por el docente (y lo que se agregó colgado de él).
  E.eliminarNuevo = function (id) {
    const clave = clavePag();
    const pag = C.pagina(clave);
    const quitar = new Set([id]);
    let creciendo = true;
    while (creciendo) {
      creciendo = false;
      (pag.nuevos || []).forEach(n => { if (!quitar.has(n.id) && quitar.has(n.despues)) { quitar.add(n.id); creciendo = true; } });
    }
    C.cambiar('Eliminar un bloque agregado', c => {
      const p = c.paginas[clave];
      p.nuevos = (p.nuevos || []).filter(n => !quitar.has(n.id));
      if (p.secciones && p.secciones.orden) p.secciones.orden = p.secciones.orden.filter(x => !quitar.has(x));
      if (p.secciones && p.secciones.ocultas) p.secciones.ocultas = p.secciones.ocultas.filter(x => !quitar.has(x));
    });
    quitar.forEach(x => { const el = K.elemento(x); if (el) el.remove(); });
    K.refrescarMarcas();
    K.rehacerIndice();
  };

  E.alternarOculto = function (id) {
    const pag = C.pagina(clavePag());
    const ahora = !!((pag.bloques || {})[id] || {}).oculto;
    guardarBloque(id, { oculto: ahora ? undefined : true }, ahora ? 'Mostrar un bloque' : 'Ocultar un bloque');
    return !ahora;
  };

  E.restaurarBloque = function (id) {
    C.cambiar('Restaurar un bloque', c => {
      const pag = c.paginas[clavePag()];
      if (pag && pag.bloques) delete pag.bloques[id];
    });
    if (['simulador', 'fijo', 'grilla'].includes(K.tipo(id))) K.refrescarMarcas();
    else K.actualizarBloque(id);
    if (K.elemento(id) && K.elemento(id).tagName === 'H2') K.rehacerIndice();
  };

  // --------------------------------------------------------------------------
  // Secciones
  // --------------------------------------------------------------------------
  E.alternarSeccion = function (sid) {
    const clave = clavePag();
    let oculta = false;
    C.cambiar('Mostrar u ocultar una sección', c => {
      const pag = c.paginas[clave] = c.paginas[clave] || {};
      pag.secciones = pag.secciones || { orden: null, ocultas: [] };
      pag.secciones.ocultas = pag.secciones.ocultas || [];
      const i = pag.secciones.ocultas.indexOf(sid);
      if (i >= 0) pag.secciones.ocultas.splice(i, 1); else { pag.secciones.ocultas.push(sid); oculta = true; }
    });
    K.refrescarMarcas();
    return oculta;
  };

  E.moverSeccion = function (sid, delta) {
    const clave = clavePag();
    const ids = K.secciones().map(s => s.id);
    const i = ids.indexOf(sid), j = i + delta;
    if (i < 0 || j < 0 || j >= ids.length) return false;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    C.cambiar(delta < 0 ? 'Subir una sección' : 'Bajar una sección', c => {
      const pag = c.paginas[clave] = c.paginas[clave] || {};
      pag.secciones = pag.secciones || { orden: null, ocultas: [] };
      pag.secciones.orden = ids;
    });
    K.ordenarSecciones();
    K.refrescarMarcas();
    K.rehacerIndice();
    return true;
  };

  // Restaura una sección original: textos originales, visible, en su lugar y sin
  // los bloques que el docente le agregó. (Las secciones agregadas se eliminan.)
  E.restaurarSeccion = function (sid) {
    const clave = clavePag();
    const s = K.secciones().find(x => x.id === sid);
    if (!s || !K.esOriginal(s.h2.dataset.profId)) return false;
    const ids = s.elementos.map(e => e.dataset.profId).filter(Boolean);
    C.cambiar('Restaurar una sección', c => {
      const pag = c.paginas[clave];
      if (!pag) return;
      ids.forEach(id => { if (pag.bloques) delete pag.bloques[id]; });
      // Los bloques agregados dentro de la sección (y los que cuelgan de ellos).
      const quitar = new Set(ids.filter(id => !K.esOriginal(id)));
      let creciendo = true;
      while (creciendo) {
        creciendo = false;
        (pag.nuevos || []).forEach(n => { if (!quitar.has(n.id) && quitar.has(n.despues) && n.tipo !== 'seccion') { quitar.add(n.id); creciendo = true; } });
      }
      pag.nuevos = (pag.nuevos || []).filter(n => !quitar.has(n.id));
      if (pag.secciones) {
        pag.secciones.ocultas = (pag.secciones.ocultas || []).filter(x => x !== sid);
        if (pag.secciones.orden) {
          // Vuelve a su lugar original: antes de la primera sección original que la seguía.
          const pos = {};
          K.secciones().forEach(x => { const pid = x.h2.dataset.profId; pos[x.id] = K.esOriginal(pid) ? parseInt(pid.slice(1), 10) : null; });
          const orden = pag.secciones.orden.filter(x => x !== sid);
          const i = orden.findIndex(x => pos[x] !== null && pos[x] !== undefined && pos[x] > pos[sid]);
          orden.splice(i < 0 ? orden.length : i, 0, sid);
          pag.secciones.orden = orden;
        }
      }
    });
    return true;
  };

  P.Editor = E;
})(window.Profesor = window.Profesor || {});
