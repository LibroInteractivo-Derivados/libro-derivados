// ============================================================================
// Modo Profesor · Interfaz
// ----------------------------------------------------------------------------
// Todo lo que ve el docente: botón de acceso, ingreso con contraseña, barra
// superior del modo edición, barra de cada bloque, panel lateral (página,
// simuladores, ejercitación, libro, archivo y acceso), avisos y confirmaciones.
//
// ADVERTENCIA SOBRE LA CONTRASEÑA
// La contraseña del Modo Profesor es una BARRERA DE USO, no una medida de
// seguridad real: el libro funciona completo en el navegador, sin servidor, y
// cualquier persona con conocimientos técnicos puede leer o modificar el código
// y los datos guardados. Sirve para que los alumnos no entren a editar por
// accidente. La contraseña no se guarda en texto plano sino como una huella
// (hash no criptográfico), pero eso no la vuelve segura. Lo que ven los alumnos
// en sus computadoras depende solamente del archivo js/config-docente.js que el
// docente distribuye: lo que se edita en un navegador no llega a los demás.
// ============================================================================

(function (P) {
  'use strict';

  const U = P.Util;
  const C = P.Config;
  const K = P.Contenido;
  const I = {};

  const CLAVE_SESION = 'derivados:docente:sesion';
  const CLAVE_VISTA = 'derivados:docente:vista';
  const CLAVE_RETORNO = 'derivados:docente:retorno';
  const CONTRASENA_INICIAL = 'profesor';
  const huellaClave = t => U.hash('derivados-docente:' + t, 7);
  const hashVigente = () => C.obtener().acceso.hash || huellaClave(CONTRASENA_INICIAL);

  const E = () => P.Editor;
  const S = () => P.Simuladores;
  const X = () => P.Ejercicios;
  const $q = (sel, raiz = document) => raiz.querySelector(sel);
  const crear = (tag, clase, html) => { const el = document.createElement(tag); if (clase) el.className = clase; if (html !== undefined) el.innerHTML = html; return el; };

  // --------------------------------------------------------------------------
  // Avisos y confirmaciones
  // --------------------------------------------------------------------------
  let zonaAvisos = null;
  I.aviso = function (texto, tipo = '') {
    if (!zonaAvisos) {
      zonaAvisos = crear('div', 'prof-ui prof-avisos');
      zonaAvisos.setAttribute('role', 'status');
      zonaAvisos.setAttribute('aria-live', 'polite');
      document.body.appendChild(zonaAvisos);
    }
    const a = crear('div', 'prof-aviso-flotante ' + tipo);
    a.textContent = texto;
    zonaAvisos.appendChild(a);
    setTimeout(() => { a.classList.add('saliendo'); setTimeout(() => a.remove(), 400); }, tipo === 'error' ? 7000 : 4200);
  };

  // Devuelve una promesa que se resuelve en true si el docente confirma.
  I.confirmar = function (titulo, texto, textoBoton = 'Aceptar', peligro = false) {
    return new Promise(resolver => {
      const cont = crear('div', 'prof-form');
      const p = crear('p', 'prof-confirmar-texto');
      p.textContent = texto;
      cont.appendChild(p);
      let respondido = false;
      const responder = (valor, cerrar) => { if (respondido) return; respondido = true; cerrar(); resolver(valor); };
      const v = E().crearVentana(titulo, cont, [
        { texto: 'Cancelar', accion: cerrar => responder(false, cerrar) },
        { texto: textoBoton, clase: 'prof-btn ' + (peligro ? 'prof-btn-peligro-lleno' : 'prof-btn-primario'), accion: cerrar => responder(true, cerrar) },
      ]);
      // Si se cierra con Esc o tocando afuera, cuenta como "Cancelar".
      const obs = new MutationObserver(() => { if (!v.caja.isConnected) { obs.disconnect(); if (!respondido) { respondido = true; resolver(false); } } });
      obs.observe(document.body, { childList: true });
      v.caja.querySelector('.prof-modal-pie .prof-btn:last-child').focus();
    });
  };

  // --------------------------------------------------------------------------
  // Recargar conservando el lugar (para cambios de estructura, deshacer, etc.)
  // --------------------------------------------------------------------------
  I.recargar = function ({ ancla = null, aviso = null, panel } = {}) {
    U.escribirSesion(CLAVE_RETORNO, JSON.stringify({
      pagina: K.clavePagina(), y: window.scrollY, ancla, aviso,
      panel: panel !== undefined ? panel : (panelEl && !panelEl.hidden ? pestanaActual : null),
      panelY: panelEl && $q('.prof-panel-cuerpo', panelEl) ? $q('.prof-panel-cuerpo', panelEl).scrollTop : 0,
    }));
    location.reload();
  };

  function retomar() {
    const r = U.leerJSON('sesion', CLAVE_RETORNO);
    U.borrarSesion(CLAVE_RETORNO);
    if (!r || r.pagina !== K.clavePagina()) return;
    const destino = r.ancla && document.getElementById(r.ancla);
    if (destino) destino.scrollIntoView({ block: 'center' });
    else window.scrollTo(0, r.y || 0);
    if (r.panel && panelEl) { abrirPanel(r.panel); $q('.prof-panel-cuerpo', panelEl).scrollTop = r.panelY || 0; }
    if (r.aviso) I.aviso(r.aviso);
  }

  // --------------------------------------------------------------------------
  // Inicio según el modo
  // --------------------------------------------------------------------------
  I.iniciar = function (modo) {
    if (modo === 'edicion') armarEdicion();
    else if (modo === 'vista') armarVistaAlumno();
    else armarAcceso();
  };

  // Lo llama js/profesor/inicio.js cuando la página terminó de armarse.
  I.listo = function () {
    if (P.modo !== 'edicion') return;
    marcarBloques();
    retomar();
    avisoNavegador();
  };

  // ---------- Modo alumno: botón discreto de acceso ----------
  function armarAcceso() {
    const c = C.obtener();
    if (!c.acceso.ocultarBoton) {
      const b = crear('button', 'prof-acceso');
      b.type = 'button';
      b.innerHTML = '<svg width="11" height="11" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg> Modo Profesor';
      b.title = 'Ingreso del docente para editar el libro';
      b.addEventListener('click', abrirIngreso);
      const pie = $q('.pie-libro > div');
      if (pie) pie.appendChild(b);
      else { b.classList.add('flotante'); document.body.appendChild(b); }
    }
    // Acceso alternativo (sirve aunque el botón esté oculto): agregar #profesor a la dirección.
    const pedido = () => location.hash === '#profesor' || new URLSearchParams(location.search).has('profesor');
    if (pedido()) setTimeout(abrirIngreso, 0);
    window.addEventListener('hashchange', () => { if (pedido()) abrirIngreso(); });
  }

  let intentos = 0, bloqueadoHasta = 0;
  function abrirIngreso() {
    if ($q('.prof-ingreso')) return;
    const cont = crear('div', 'prof-form prof-ingreso');
    cont.innerHTML = `
      <p>Ingresá la contraseña del docente para editar el contenido del libro.</p>
      <label class="prof-etiqueta" for="prof-clave">Contraseña</label>
      <input id="prof-clave" class="prof-campo" type="password" autocomplete="current-password">
      <div class="prof-error" hidden></div>
      <p class="prof-ayuda">Si es la primera vez, la contraseña inicial figura en la guía del profesor. Los alumnos no necesitan entrar acá.</p>`;
    const campo = $q('#prof-clave', cont), error = $q('.prof-error', cont);
    const ingresar = cerrar => {
      if (Date.now() < bloqueadoHasta) { error.hidden = false; error.textContent = 'Demasiados intentos. Esperá unos segundos y volvé a probar.'; return; }
      if (huellaClave(campo.value) !== hashVigente()) {
        intentos++;
        if (intentos >= 5) { bloqueadoHasta = Date.now() + 15000; intentos = 0; }
        error.hidden = false; error.textContent = 'La contraseña no es correcta.';
        campo.select();
        return;
      }
      cerrar();
      U.escribirSesion(CLAVE_SESION, '1');
      U.borrarSesion(CLAVE_VISTA);
      if (location.hash === '#profesor') history.replaceState(null, '', location.pathname + location.search);
      U.escribirSesion(CLAVE_RETORNO, JSON.stringify({ pagina: K.clavePagina(), y: window.scrollY, aviso: 'Modo Profesor activo. Pasá el mouse por un bloque (o tocalo) para editarlo.' }));
      location.reload();
    };
    const v = E().crearVentana('Modo Profesor', cont, [
      { texto: 'Cancelar', accion: cerrar => cerrar() },
      { texto: 'Ingresar', clase: 'prof-btn prof-btn-primario', accion: ingresar },
    ]);
    campo.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); $q('.prof-btn-primario', v.caja).click(); } });
    campo.focus();
  }

  // ---------- Vista de alumno (el docente previsualiza sin salir) ----------
  function armarVistaAlumno() {
    const p = crear('div', 'prof-ui prof-pildora');
    p.setAttribute('role', 'region');
    p.setAttribute('aria-label', 'Vista de alumno');
    p.innerHTML = '<span><strong>Vista de alumno.</strong> Así ven esta página los alumnos.</span>';
    const b = crear('button', 'prof-btn prof-btn-primario');
    b.type = 'button';
    b.textContent = 'Volver a editar';
    b.addEventListener('click', () => {
      U.borrarSesion(CLAVE_VISTA);
      U.escribirSesion(CLAVE_RETORNO, JSON.stringify({ pagina: K.clavePagina(), y: window.scrollY }));
      location.reload();
    });
    p.appendChild(b);
    document.body.appendChild(p);
  }

  // --------------------------------------------------------------------------
  // Modo edición
  // --------------------------------------------------------------------------
  let barraSup = null, barraBloque = null, panelEl = null, pestanaActual = 'pagina';
  let bloqueActual = null;

  function nombrePagina() {
    const h1 = $q('.contenido h1, main.portada h1');
    const { unidad, pagina } = typeof paginaActual === 'function' ? paginaActual() : {};
    if (unidad && pagina) return `Unidad ${unidad.numero} · ${pagina.nombre}`;
    return h1 ? h1.textContent.trim() : document.title;
  }

  function armarEdicion() {
    // Barra superior
    barraSup = crear('div', 'prof-ui prof-barra-superior');
    barraSup.setAttribute('role', 'region');
    barraSup.setAttribute('aria-label', 'Barra del Modo Profesor');
    barraSup.innerHTML = `
      <div class="prof-barra-izq">
        <span class="prof-insignia"><span class="prof-texto-btn">Modo </span>Profesor</span>
        <span class="prof-pagina" title="Página que estás editando">Editando: <b></b></span>
      </div>
      <span class="prof-guardado" aria-live="polite"></span>
      <div class="prof-barra-der">
        <button type="button" class="prof-btn-barra" data-accion="deshacer" title="Deshacer (Ctrl+Z)" aria-label="Deshacer"><span aria-hidden="true">↶</span><span class="prof-texto-btn"> Deshacer</span></button>
        <button type="button" class="prof-btn-barra" data-accion="rehacer" title="Rehacer (Ctrl+Y)" aria-label="Rehacer"><span aria-hidden="true">↷</span><span class="prof-texto-btn"> Rehacer</span></button>
        <button type="button" class="prof-btn-barra" data-accion="vista" title="Ver la página como la ven los alumnos">Vista alumno</button>
        <button type="button" class="prof-btn-barra prof-destacado" data-accion="panel" aria-expanded="false" aria-controls="prof-panel">Panel</button>
        <button type="button" class="prof-btn-barra" data-accion="salir" title="Salir del Modo Profesor (los cambios quedan guardados)">Salir</button>
      </div>`;
    $q('.prof-pagina b', barraSup).textContent = nombrePagina();
    document.body.prepend(barraSup);
    barraSup.addEventListener('click', ev => {
      const b = ev.target.closest('[data-accion]');
      if (!b) return;
      const a = b.dataset.accion;
      if (a === 'deshacer') deshacer();
      if (a === 'rehacer') rehacer();
      if (a === 'vista') vistaAlumno();
      if (a === 'panel') { if (panelEl.hidden) abrirPanel(pestanaActual); else cerrarPanel(); }
      if (a === 'salir') salir();
    });

    // Aviso de página oculta y cambios sin ubicar
    const main = $q('main');
    if (main && K.paginaOculta()) {
      const av = crear('div', 'prof-ui prof-franja', '<strong>Esta página está oculta para los alumnos.</strong> La ves porque estás en el Modo Profesor. Para mostrarla, usá Panel → Esta página.');
      main.before(av);
    }
    if (main && K.huerfanos.length) {
      const av = crear('div', 'prof-ui prof-franja aviso', `<strong>Hay ${K.huerfanos.length} cambio(s) que no se pudieron ubicar</strong> (el texto original cambió en esta versión del libro). Se listan en Panel → Esta página.`);
      main.before(av);
    }

    // Barra de bloque
    barraBloque = crear('div', 'prof-ui prof-barra-bloque');
    barraBloque.setAttribute('role', 'toolbar');
    barraBloque.hidden = true;
    // Dentro de <main> (región principal), para los lectores de pantalla.
    (main || document.body).appendChild(barraBloque);
    prepararSeleccion();

    // Panel lateral
    panelEl = crear('aside', 'prof-ui prof-panel');
    panelEl.id = 'prof-panel';
    panelEl.hidden = true;
    panelEl.setAttribute('aria-label', 'Panel del Modo Profesor');
    document.body.appendChild(panelEl);

    // Atajos de teclado
    document.addEventListener('keydown', ev => {
      const enCampo = ev.target.closest && ev.target.closest('input, textarea, select, [contenteditable="true"]');
      const modal = document.querySelector('.prof-modal-fondo');
      if (modal || enCampo || E().hayEditorAbierto()) return;
      const k = ev.key.toLowerCase();
      if ((ev.ctrlKey || ev.metaKey) && k === 'z' && !ev.shiftKey) { ev.preventDefault(); deshacer(); }
      else if ((ev.ctrlKey || ev.metaKey) && (k === 'y' || (k === 'z' && ev.shiftKey))) { ev.preventDefault(); rehacer(); }
      else if (ev.key === 'Escape' && panelEl && !panelEl.hidden) cerrarPanel();
    });

    C.alCambiar(() => { actualizarEstado(); marcarBloques(); });
    actualizarEstado();
    // Edición en dos pestañas a la vez: si la otra guarda, esta se pone al día para
    // no pisar esos cambios con una copia vieja.
    window.addEventListener('storage', ev => {
      if (ev.key !== 'derivados:docente:borrador') return;
      if (E().hayEditorAbierto() || document.querySelector('.prof-modal-fondo')) {
        I.aviso('Se guardaron cambios desde otra pestaña. Guardá o cancelá lo que estás editando y recargá la página (F5) antes de seguir, para no pisarlos.', 'error');
      } else I.recargar({ aviso: 'Se actualizaron los cambios hechos en otra pestaña.' });
    });
    // Evita salir de la página con un editor abierto sin guardar.
    window.addEventListener('beforeunload', ev => { if (E().hayEditorAbierto()) { ev.preventDefault(); ev.returnValue = ''; } });
    // Unidades y páginas ocultas en el menú
    document.querySelectorAll('#encabezado a[href]').forEach(a => {
      const clave = (a.getAttribute('href') || '').replace(/\.html?.*$/, '');
      const c = C.obtener();
      const u = LIBRO.unidades.find(x => x.paginas[0] && x.paginas[0].archivo === a.getAttribute('href') && a.closest('.unidades'));
      if ((u && u._profOculta) || (a.closest('.pestanas') && c.unidades.paginasOcultas.includes(clave)) || (a.classList.contains('general') && c.unidades.paginasOcultas.includes(clave))) {
        a.classList.add('prof-enlace-oculto');
        a.title = (a.title ? a.title + ' · ' : '') + 'Oculta para los alumnos';
      }
    });
  }

  function actualizarEstado() {
    if (!barraSup) return;
    const h = C.historial();
    const bd = $q('[data-accion="deshacer"]', barraSup), br = $q('[data-accion="rehacer"]', barraSup);
    bd.disabled = !h.puedeDeshacer;
    br.disabled = !h.puedeRehacer;
    bd.title = h.puedeDeshacer ? `Deshacer: ${h.ultimo} (Ctrl+Z)` : 'No hay nada para deshacer';
    br.title = h.puedeRehacer ? `Rehacer: ${h.siguiente} (Ctrl+Y)` : 'No hay nada para rehacer';
    const est = C.estadoGuardado();
    const g = $q('.prof-guardado', barraSup);
    if (!est.persistente) {
      g.className = 'prof-guardado alerta-guardado';
      g.textContent = 'Este navegador no permite guardar: exportá la configuración (Panel → Archivo) antes de cerrar.';
    } else if (est.cuando) {
      g.className = 'prof-guardado';
      g.textContent = 'Guardado automáticamente · ' + U.fechaHora(est.cuando).slice(-5);
    } else {
      g.className = 'prof-guardado';
      const o = C.origen();
      g.textContent = o === 'borrador' ? 'Cambios guardados en este navegador' : o === 'publicada' ? 'Mostrando la versión publicada' : 'Libro original, sin cambios';
    }
    if (panelEl && !panelEl.hidden && pestanaActual === 'archivo') pintarPestana();
  }

  function avisoNavegador() {
    if (location.protocol === 'file:' && /firefox/i.test(navigator.userAgent) && !U.leerSesion('derivados:docente:aviso-ff')) {
      U.escribirSesion('derivados:docente:aviso-ff', '1');
      I.aviso('Si al pasar de una página a otra no ves tus cambios, abrí el libro con Chrome o Edge: algunas versiones de Firefox no comparten lo guardado entre archivos abiertos con doble clic.', 'error');
    }
  }

  function deshacer() {
    if (E().hayEditorAbierto()) return;
    const d = C.deshacer();
    if (d) I.recargar({ aviso: 'Se deshizo: ' + d.toLowerCase() + '.' });
  }
  function rehacer() {
    if (E().hayEditorAbierto()) return;
    const d = C.rehacer();
    if (d) I.recargar({ aviso: 'Se rehízo: ' + d.toLowerCase() + '.' });
  }
  function vistaAlumno() {
    if (E().hayEditorAbierto()) { I.aviso('Guardá o cancelá la edición abierta antes de pasar a la vista de alumno.', 'error'); return; }
    U.escribirSesion(CLAVE_VISTA, 'alumno');
    U.escribirSesion(CLAVE_RETORNO, JSON.stringify({ pagina: K.clavePagina(), y: window.scrollY }));
    location.reload();
  }
  function salir() {
    if (E().hayEditorAbierto()) { I.aviso('Guardá o cancelá la edición abierta antes de salir.', 'error'); return; }
    U.borrarSesion(CLAVE_SESION);
    U.borrarSesion(CLAVE_VISTA);
    U.escribirSesion(CLAVE_RETORNO, JSON.stringify({ pagina: K.clavePagina(), y: window.scrollY }));
    location.reload();
  }

  // --------------------------------------------------------------------------
  // Bloques: selección y barra flotante
  // --------------------------------------------------------------------------
  const NOMBRES = {
    linea: 'Título', parrafo: 'Texto', contenedor: 'Caja de contenido', formula: 'Fórmula', figura: 'Figura',
    grafico: 'Gráfico de payoff', diagrama: 'Diagrama de flujos', quiz: 'Autoevaluación', grilla: 'Grilla de gráficos',
    simulador: 'Simulador', fijo: 'Contenido automático',
  };
  const NOMBRES_NUEVOS = { parrafo: 'Párrafo agregado', lista: 'Lista agregada', subtitulo: 'Subtítulo agregado', nota: 'Nota del docente', ejemplo: 'Ejemplo agregado', formula: 'Fórmula agregada', pregunta: 'Pregunta de repaso', seccion: 'Sección agregada' };

  function marcarBloques() {
    const cont = K.contenedor();
    if (!cont) return;
    [...cont.children].forEach(el => {
      if (!el.dataset.profId) return;
      if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
      const tipo = el.dataset.profNuevo ? NOMBRES_NUEVOS[el.dataset.profNuevo] : NOMBRES[K.tipo(el.dataset.profId)];
      el.dataset.profEtiqueta = tipo || 'Bloque';
    });
    if (bloqueActual && !bloqueActual.isConnected) { bloqueActual = null; I.ocultarBarraBloque(); }
  }

  const bloqueDe = el => {
    const cont = K.contenedor();
    if (!cont || !el || !el.closest) return null;
    let x = el;
    while (x && x.parentElement !== cont) x = x.parentElement;
    return x && x.dataset && x.dataset.profId ? x : null;
  };

  let temporizador = null, pendiente = null;
  function prepararSeleccion() {
    const cont = K.contenedor();
    if (!cont) return;
    cont.addEventListener('mouseover', ev => {
      if (E().hayEditorAbierto()) return;
      clearTimeout(temporizador);
      clearTimeout(pendiente);
      const b = bloqueDe(ev.target);
      if (!b || b === bloqueActual) return;
      // Con la barra ya visible, se espera un instante antes de pasar a otro bloque:
      // así se puede llegar a la barra cruzando el bloque de arriba.
      if (barraBloque.hidden) I.seleccionar(b);
      else pendiente = setTimeout(() => I.seleccionar(b), 250);
    });
    cont.addEventListener('mouseleave', () => { clearTimeout(pendiente); temporizador = setTimeout(() => { if (!barraBloque.matches(':hover') && !barraBloque.contains(document.activeElement)) I.ocultarBarraBloque(); }, 600); });
    barraBloque.addEventListener('mouseenter', () => { clearTimeout(temporizador); clearTimeout(pendiente); });
    cont.addEventListener('focusin', ev => {
      if (E().hayEditorAbierto()) return;
      if (ev.target.dataset && ev.target.dataset.profId && ev.target.parentElement === cont) I.seleccionar(ev.target);
    });
    cont.addEventListener('click', ev => {
      if (E().hayEditorAbierto()) return;
      const b = bloqueDe(ev.target);
      if (b) I.seleccionar(b);
    });
    cont.addEventListener('dblclick', ev => {
      if (E().hayEditorAbierto()) return;
      if (ev.target.closest('input, select, textarea, button, a, section.widget')) return;
      const b = bloqueDe(ev.target);
      if (b && E().editable(b.dataset.profId)) { ev.preventDefault(); E().editarBloque(b.dataset.profId); }
    });
    cont.addEventListener('keydown', ev => {
      const b = ev.target;
      if (!b.dataset || !b.dataset.profId || b.parentElement !== cont || E().hayEditorAbierto()) return;
      if (ev.key === 'Enter' && E().editable(b.dataset.profId)) { ev.preventDefault(); E().editarBloque(b.dataset.profId); }
      // Tab desde un bloque seleccionado entra a su barra de acciones.
      if (ev.key === 'Tab' && !ev.shiftKey && !barraBloque.hidden) {
        const primero = barraBloque.querySelector('button');
        if (primero) { ev.preventDefault(); primero.focus(); }
      }
    });
    barraBloque.addEventListener('keydown', ev => {
      if (ev.key === 'Escape' && bloqueActual) { ev.preventDefault(); bloqueActual.focus(); }
      if (ev.key === 'Tab' && !ev.shiftKey) {
        const botones = [...barraBloque.querySelectorAll('button')];
        if (document.activeElement === botones[botones.length - 1] && bloqueActual) {
          // Al salir de la barra, el foco sigue con el próximo bloque.
          const sig = bloqueActual.nextElementSibling;
          if (sig) { ev.preventDefault(); sig.focus(); }
        }
      }
      if (ev.key === 'Tab' && ev.shiftKey && document.activeElement === barraBloque.querySelector('button') && bloqueActual) { ev.preventDefault(); bloqueActual.focus(); }
    });
    let rafPendiente = false;
    const reubicar = () => { if (rafPendiente) return; rafPendiente = true; requestAnimationFrame(() => { rafPendiente = false; ubicarBarra(); }); };
    window.addEventListener('scroll', reubicar, { passive: true });
    window.addEventListener('resize', reubicar);
  }

  I.seleccionar = function (b) {
    if (!b || !barraBloque) return;
    if (bloqueActual && bloqueActual !== b) bloqueActual.classList.remove('prof-seleccionado');
    bloqueActual = b;
    b.classList.add('prof-seleccionado');
    pintarBarraBloque(b);
    barraBloque.hidden = false;
    ubicarBarra();
  };

  I.ocultarBarraBloque = function () {
    if (!barraBloque) return;
    barraBloque.hidden = true;
    const menu = $q('.prof-menu-agregar', document);
    if (menu) menu.remove();
    if (bloqueActual) bloqueActual.classList.remove('prof-seleccionado');
  };

  I.refrescarBarraBloque = function () {
    if (bloqueActual && bloqueActual.isConnected && !E().hayEditorAbierto()) I.seleccionar(bloqueActual);
  };

  function ubicarBarra() {
    if (!barraBloque || barraBloque.hidden || !bloqueActual || !bloqueActual.isConnected) return;
    const r = bloqueActual.getBoundingClientRect();
    const alto = barraBloque.offsetHeight || 34;
    const ancho = barraBloque.offsetWidth || 300;
    // Debajo de la barra del docente y del encabezado del libro (si está fijo a la vista).
    const enc = $q('#encabezado');
    const techo = Math.max(barraSup ? barraSup.getBoundingClientRect().bottom : 0, enc ? enc.getBoundingClientRect().bottom : 0);
    let top = r.top - alto - 4;
    if (top < techo + 4) top = Math.min(Math.max(techo + 4, r.top + 4), r.bottom - alto - 4);
    if (top < techo + 4) top = techo + 4;
    let left = Math.min(r.right - ancho, document.documentElement.clientWidth - ancho - 8);
    left = Math.max(8, left);
    barraBloque.style.top = (top + window.scrollY) + 'px';
    barraBloque.style.left = (left + window.scrollX) + 'px';
  }

  function pintarBarraBloque(b) {
    const id = b.dataset.profId;
    const tipo = K.tipo(id);
    const nuevo = !K.esOriginal(id);
    const pag = C.pagina(K.clavePagina());
    const cambio = (pag.bloques || {})[id] || {};
    const esH2 = b.tagName === 'H2';
    const ocultaSeccion = esH2 && ((pag.secciones || {}).ocultas || []).includes(b.id);
    const botones = [];
    const btn = (accion, texto, titulo, clase = '') => botones.push(`<button type="button" class="prof-btn-chico ${clase}" data-b="${accion}" title="${U.escapar(titulo || texto)}">${texto}</button>`);
    if (E().editable(id)) btn('editar', 'Editar', 'Editar este bloque (doble clic o Enter)', 'prof-btn-chico-primario');
    if (tipo === 'simulador') btn('configurar', 'Configurar', 'Valores iniciales y rangos del simulador', 'prof-btn-chico-primario');
    btn('agregar', 'Agregar debajo ▾', 'Agregar un bloque nuevo debajo de este');
    if (esH2) {
      btn('subir', '↑', 'Subir la sección');
      btn('bajar', '↓', 'Bajar la sección');
      btn('seccion', ocultaSeccion ? 'Mostrar sección' : 'Ocultar sección', ocultaSeccion ? 'Volver a mostrar la sección a los alumnos' : 'Ocultar toda la sección a los alumnos');
      if (!nuevo) btn('restaurar-seccion', 'Restaurar sección', 'Volver la sección a su versión original');
    }
    if (!nuevo && !esH2) btn('ocultar', cambio.oculto ? 'Mostrar' : 'Ocultar', cambio.oculto ? 'Volver a mostrar este bloque a los alumnos' : 'Ocultar este bloque a los alumnos');
    if (!nuevo && (cambio.html !== undefined || cambio.atributos)) btn('restaurar', 'Restaurar', 'Volver este bloque a su texto original');
    if (nuevo) btn('eliminar', esH2 ? 'Eliminar sección' : 'Eliminar', esH2 ? 'Eliminar la sección agregada y su contenido' : 'Eliminar este bloque agregado', 'prof-btn-peligro');
    barraBloque.setAttribute('aria-label', 'Acciones sobre el bloque: ' + (b.dataset.profEtiqueta || 'bloque'));
    barraBloque.innerHTML = `<span class="prof-tipo-bloque">${U.escapar(b.dataset.profEtiqueta || '')}</span>` + botones.join('');
    barraBloque.onclick = ev => {
      const x = ev.target.closest('[data-b]');
      if (!x) return;
      accionBloque(x.dataset.b, b, x);
    };
  }

  function accionBloque(accion, b, boton) {
    const id = b.dataset.profId;
    if (accion === 'editar') return E().editarBloque(id);
    if (accion === 'configurar') { const w = b.matches('section.widget') ? b : b.querySelector('section.widget'); if (w) S().abrirConfigurador(w.id); return; }
    if (accion === 'agregar') return menuAgregar(b, boton);
    if (accion === 'ocultar') { const oculto = E().alternarOculto(id); I.aviso(oculto ? 'El bloque quedó oculto para los alumnos.' : 'El bloque vuelve a estar visible.'); return reseleccionar(id); }
    if (accion === 'restaurar') {
      return I.confirmar('¿Restaurar el texto original de este bloque?', 'Se pierden los cambios que hiciste en este bloque (podés recuperarlos con «Deshacer»).', 'Restaurar').then(ok => { if (ok) { E().restaurarBloque(id); I.aviso('Se restauró el bloque.'); reseleccionar(id); } });
    }
    if (accion === 'eliminar') {
      return I.confirmar(b.tagName === 'H2' ? '¿Eliminar la sección agregada?' : '¿Eliminar el bloque agregado?', b.tagName === 'H2' ? 'Se borran el título y todos los bloques que agregaste en la sección.' : 'Se borra el bloque (podés recuperarlo con «Deshacer»).', 'Eliminar', true).then(ok => {
        if (ok) { I.ocultarBarraBloque(); E().eliminarNuevo(id); I.aviso('Se eliminó.'); }
      });
    }
    if (accion === 'subir' || accion === 'bajar') {
      const ok = E().moverSeccion(b.id, accion === 'subir' ? -1 : 1);
      if (!ok) I.aviso(accion === 'subir' ? 'Es la primera sección de la página.' : 'Es la última sección de la página.');
      b.scrollIntoView({ block: 'center' });
      return reseleccionar(id, true);
    }
    if (accion === 'seccion') { const oculta = E().alternarSeccion(b.id); I.aviso(oculta ? 'La sección quedó oculta para los alumnos.' : 'La sección vuelve a estar visible.'); return reseleccionar(id); }
    if (accion === 'restaurar-seccion') {
      return I.confirmar('¿Restaurar la sección a su versión original?', 'Vuelven los textos originales, la sección se muestra y vuelve a su lugar, y se quitan los bloques que agregaste en ella.', 'Restaurar sección').then(ok => {
        if (ok && E().restaurarSeccion(b.id)) I.recargar({ ancla: b.id, aviso: 'Se restauró la sección.' });
      });
    }
  }

  function reseleccionar(id, enfocar) {
    const el = K.elemento(id);
    if (el) { I.seleccionar(el); if (enfocar) el.focus({ preventScroll: true }); }
  }

  function menuAgregar(b, boton) {
    const viejo = $q('.prof-menu-agregar');
    if (viejo) { viejo.remove(); return; }
    const m = crear('div', 'prof-ui prof-menu-agregar');
    m.setAttribute('role', 'menu');
    E().TIPOS_NUEVOS.forEach(([tipo, nombre]) => {
      const x = crear('button', '', U.escapar(nombre));
      x.type = 'button';
      x.setAttribute('role', 'menuitem');
      x.addEventListener('click', () => { m.remove(); I.ocultarBarraBloque(); E().agregar(b.dataset.profId, tipo); });
      m.appendChild(x);
    });
    (document.querySelector('main') || document.body).appendChild(m);
    const r = boton.getBoundingClientRect();
    m.style.top = (r.bottom + window.scrollY + 4) + 'px';
    m.style.left = Math.max(8, Math.min(r.left, document.documentElement.clientWidth - m.offsetWidth - 8) + window.scrollX) + 'px';
    m.querySelector('button').focus();
    m.addEventListener('keydown', ev => {
      const items = [...m.querySelectorAll('button')];
      const i = items.indexOf(document.activeElement);
      if (ev.key === 'ArrowDown') { ev.preventDefault(); items[(i + 1) % items.length].focus(); }
      if (ev.key === 'ArrowUp') { ev.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
      if (ev.key === 'Escape') { ev.preventDefault(); m.remove(); boton.focus(); }
    });
    setTimeout(() => document.addEventListener('mousedown', function fuera(ev) { if (!m.contains(ev.target)) { m.remove(); document.removeEventListener('mousedown', fuera); } }), 0);
  }

  // --------------------------------------------------------------------------
  // Panel lateral
  // --------------------------------------------------------------------------
  const PESTANAS = [
    ['pagina', 'Esta página'], ['simuladores', 'Simuladores'], ['ejercitacion', 'Ejercitación'],
    ['libro', 'Libro'], ['archivo', 'Archivo'], ['acceso', 'Acceso'],
  ];

  function pestanasDisponibles() {
    return PESTANAS.filter(([id]) => (id !== 'simuladores' || document.querySelector('section.widget[id]')) && (id !== 'ejercitacion' || document.getElementById('ejercitacion')));
  }

  function abrirPanel(pestana) {
    if (!pestanasDisponibles().some(([id]) => id === pestana)) pestana = 'pagina';
    pestanaActual = pestana;
    panelEl.hidden = false;
    document.body.classList.add('prof-panel-abierto');
    $q('[data-accion="panel"]', barraSup).setAttribute('aria-expanded', 'true');
    panelEl.innerHTML = `
      <div class="prof-panel-cabecera">
        <h2>Panel del docente</h2>
        <button type="button" class="prof-btn-chico" data-cerrar aria-label="Cerrar el panel">Cerrar ✕</button>
      </div>
      <div class="prof-pestanas" role="tablist" aria-label="Secciones del panel">
        ${pestanasDisponibles().map(([id, n]) => `<button type="button" role="tab" id="prof-tab-${id}" data-tab="${id}" aria-selected="${id === pestana}" aria-controls="prof-panel-cuerpo" tabindex="${id === pestana ? 0 : -1}">${n}</button>`).join('')}
      </div>
      <div class="prof-panel-cuerpo" id="prof-panel-cuerpo" role="tabpanel" aria-labelledby="prof-tab-${pestana}" tabindex="0"></div>`;
    $q('[data-cerrar]', panelEl).addEventListener('click', cerrarPanel);
    const tabs = $q('.prof-pestanas', panelEl);
    tabs.addEventListener('click', ev => { const t = ev.target.closest('[data-tab]'); if (t) abrirPanel(t.dataset.tab); });
    tabs.addEventListener('keydown', ev => {
      const items = [...tabs.querySelectorAll('[data-tab]')];
      const i = items.indexOf(document.activeElement);
      if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
        ev.preventDefault();
        const j = (i + (ev.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length;
        abrirPanel(items[j].dataset.tab);
        $q(`[data-tab="${items[j].dataset.tab}"]`, panelEl).focus();
      }
    });
    pintarPestana();
  }

  function cerrarPanel() {
    panelEl.hidden = true;
    document.body.classList.remove('prof-panel-abierto');
    $q('[data-accion="panel"]', barraSup).setAttribute('aria-expanded', 'false');
    $q('[data-accion="panel"]', barraSup).focus();
  }

  function pintarPestana() {
    const cuerpo = $q('.prof-panel-cuerpo', panelEl);
    const y = cuerpo.scrollTop;
    cuerpo.innerHTML = '';
    const f = { pagina: pestanaPagina, simuladores: pestanaSimuladores, ejercitacion: pestanaEjercitacion, libro: pestanaLibro, archivo: pestanaArchivo, acceso: pestanaAcceso }[pestanaActual];
    try { f(cuerpo); } catch (e) { console.error(e); cuerpo.innerHTML = '<p class="prof-error">No se pudo mostrar esta sección del panel.</p>'; }
    cuerpo.scrollTop = y;
    if (typeof renderFormulas === 'function') renderFormulas(cuerpo);
  }

  const seccionPanel = (cuerpo, titulo, ayuda) => {
    const s = crear('section', 'prof-panel-seccion');
    s.innerHTML = `<h3>${titulo}</h3>${ayuda ? `<p class="prof-ayuda">${ayuda}</p>` : ''}`;
    cuerpo.appendChild(s);
    return s;
  };
  const boton = (texto, clase, accion) => { const b = crear('button', clase || 'prof-btn', U.escapar(texto)); b.type = 'button'; b.addEventListener('click', accion); return b; };
  const casilla = (texto, marcada, alCambiar, deshabilitada) => {
    const l = crear('label', 'prof-casilla');
    const i = crear('input');
    i.type = 'checkbox'; i.checked = marcada; i.disabled = !!deshabilitada;
    i.addEventListener('change', () => alCambiar(i.checked));
    l.append(i, document.createTextNode(' ' + texto));
    return l;
  };

  // ---------- Esta página ----------
  function pestanaPagina(cuerpo) {
    const clave = K.clavePagina();
    const c = C.obtener();
    const s1 = seccionPanel(cuerpo, U.escapar(nombrePagina()));
    const esPortada = clave === 'index';
    const oculta = c.unidades.paginasOcultas.includes(clave);
    const unidadOculta = document.body.dataset.unidad && c.unidades.ocultas.includes(document.body.dataset.unidad);
    s1.appendChild(casilla('Mostrar esta página a los alumnos', !oculta, valor => {
      C.cambiar(valor ? 'Mostrar una página' : 'Ocultar una página', x => {
        x.unidades.paginasOcultas = x.unidades.paginasOcultas.filter(p => p !== clave);
        if (!valor) x.unidades.paginasOcultas.push(clave);
      });
      I.recargar({ aviso: valor ? 'La página vuelve a estar visible.' : 'La página quedó oculta para los alumnos (desaparece del menú).' });
    }, esPortada));
    if (esPortada) s1.appendChild(crear('p', 'prof-ayuda', 'La portada no se puede ocultar.'));
    if (unidadOculta) s1.appendChild(crear('p', 'prof-aviso', 'Toda la unidad está oculta para los alumnos (Panel → Libro).'));

    const secs = K.secciones();
    const pag = C.pagina(clave);
    const ocultas = new Set((pag.secciones || {}).ocultas || []);
    const s2 = seccionPanel(cuerpo, 'Secciones', secs.length ? 'Ordená las secciones con las flechas y elegí cuáles ven los alumnos. Para editar un bloque, pasá el mouse por la página.' : 'Esta página no tiene secciones con título.');
    const lista = crear('ol', 'prof-lista-secciones');
    secs.forEach((s, i) => {
      const li = crear('li', ocultas.has(s.id) ? 'oculta' : '');
      const nuevo = !K.esOriginal(s.h2.dataset.profId);
      li.innerHTML = `<label class="prof-casilla"><input type="checkbox" ${ocultas.has(s.id) ? '' : 'checked'} aria-label="Mostrar la sección ${U.escapar(s.h2.textContent)} a los alumnos"></label>
        <a href="#${encodeURIComponent(s.id)}" class="prof-ir">${U.escapar(s.h2.textContent)}</a>${nuevo ? ' <span class="prof-chip">agregada</span>' : ''}
        <span class="prof-acciones-fila">
          <button type="button" class="prof-btn-chico" data-m="-1" ${i === 0 ? 'disabled' : ''} aria-label="Subir la sección">↑</button>
          <button type="button" class="prof-btn-chico" data-m="1" ${i === secs.length - 1 ? 'disabled' : ''} aria-label="Bajar la sección">↓</button>
          ${nuevo ? '' : `<button type="button" class="prof-btn-chico" data-restaurar aria-label="Restaurar la sección ${U.escapar(s.h2.textContent)}">Restaurar</button>`}
        </span>`;
      $q('input', li).addEventListener('change', () => { E().alternarSeccion(s.id); pintarPestana(); });
      li.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => { E().moverSeccion(s.id, parseInt(b.dataset.m, 10)); pintarPestana(); }));
      const rest = $q('[data-restaurar]', li);
      if (rest) rest.addEventListener('click', () => {
        I.confirmar(`¿Restaurar la sección «${s.h2.textContent}»?`, 'Vuelven los textos originales, la sección se muestra y vuelve a su lugar, y se quitan los bloques que agregaste en ella.', 'Restaurar sección').then(ok => {
          if (ok && E().restaurarSeccion(s.id)) I.recargar({ ancla: s.id, aviso: 'Se restauró la sección.' });
        });
      });
      $q('.prof-ir', li).addEventListener('click', ev => { ev.preventDefault(); const el = document.getElementById(s.id); if (el) { el.scrollIntoView({ block: 'start' }); I.seleccionar(el); } });
      lista.appendChild(li);
    });
    s2.appendChild(lista);

    if (K.huerfanos.length) {
      const s3 = seccionPanel(cuerpo, 'Cambios sin ubicar', 'Estos cambios se hicieron sobre un texto que ya no está igual en esta versión del libro. No se muestran. Podés descartarlos.');
      const ul = crear('ul', 'prof-lista');
      K.huerfanos.forEach(h => {
        const li = crear('li');
        li.textContent = h.nuevo ? 'Bloque agregado (se muestra al final de la página)' : U.recortar(U.textoPlano(h.cambio.html || '') || 'Cambio de visibilidad', 80);
        if (!h.nuevo) li.appendChild(boton('Descartar', 'prof-btn-chico', () => {
          C.cambiar('Descartar un cambio sin ubicar', x => { delete x.paginas[clave].bloques[h.id]; });
          I.recargar({ panel: 'pagina', aviso: 'Se descartó el cambio.' });
        }));
        ul.appendChild(li);
      });
      s3.appendChild(ul);
    }

    const s4 = seccionPanel(cuerpo, 'Restaurar', 'Vuelve esta página a su versión original: textos, bloques agregados, orden y visibilidad de las secciones, valores de los simuladores y ajustes de la ejercitación.');
    s4.appendChild(boton('Restaurar esta página al original', 'prof-btn prof-btn-peligro', () => {
      I.confirmar('¿Restaurar esta página al original?', 'Se pierden todos los cambios de esta página (podés recuperarlos con «Deshacer» mientras no cierres la pestaña).', 'Restaurar la página', true).then(ok => {
        if (!ok) return;
        const hubo = C.cambiar('Restaurar una página', x => { delete x.paginas[clave]; });
        I.recargar({ y: 0, aviso: hubo ? 'La página volvió a su versión original.' : 'La página ya estaba como el original.' });
      });
    }));
  }

  // ---------- Simuladores ----------
  function pestanaSimuladores(cuerpo) {
    const s = seccionPanel(cuerpo, 'Simuladores de esta página', 'Elegí cuáles ven los alumnos y con qué valores arrancan. Los cálculos de los simuladores no se modifican.');
    const ul = crear('ul', 'prof-lista prof-lista-sim');
    S().lista().forEach(w => {
      const li = crear('li');
      li.innerHTML = `<div class="prof-fila-sim"><strong>${U.escapar(w.titulo)}</strong>${w.modificado ? ' <span class="prof-chip">valores propios</span>' : ''}</div>`;
      const acciones = crear('div', 'prof-acciones-fila');
      acciones.appendChild(casilla('Visible para los alumnos', w.visible, () => { S().alternarVisible(w.id); pintarPestana(); }, !w.ocultable));
      acciones.appendChild(boton('Configurar valores', 'prof-btn-chico prof-btn-chico-primario', () => { const el = document.getElementById(w.id); if (el) el.scrollIntoView({ block: 'start' }); S().abrirConfigurador(w.id); }));
      li.appendChild(acciones);
      ul.appendChild(li);
    });
    s.appendChild(ul);
  }

  // ---------- Ejercitación ----------
  function pestanaEjercitacion(cuerpo) {
    const r = X().resumen();
    const s1 = seccionPanel(cuerpo, 'Qué ven los alumnos', 'En el Modo Profesor ves todo; los alumnos ven solo lo que dejes activado. Probalo con «Vista alumno».');
    const op = (clave, texto) => s1.appendChild(casilla(texto, r.opciones[clave], v => { X().opcion(clave, v); I.recargar({ panel: 'ejercitacion' }); }));
    op('resoluciones', 'Mostrar las resoluciones y las respuestas modelo');
    op('pistas', 'Mostrar las pistas');
    op('autoevaluacion', 'Mostrar la autoevaluación de opción múltiple');

    const s2 = seccionPanel(cuerpo, `Ejercicios (${r.ejercicios.length})`, 'Desmarcá los que no quieras usar. Para editar un enunciado o agregar una nota, usá los botones de cada ejercicio en la página.');
    const ul = crear('ul', 'prof-lista prof-lista-ej');
    r.ejercicios.forEach(e => {
      const li = crear('li', e.visible ? '' : 'oculta');
      li.innerHTML = `<label class="prof-casilla"><input type="checkbox" ${e.visible ? 'checked' : ''} aria-label="Mostrar el ejercicio ${U.escapar(e.id)}"> <span><b>${U.escapar(e.id)}</b> · ${e.titulo}</span></label>${e.propio ? ' <span class="prof-chip">propio</span>' : ''}`;
      $q('input', li).addEventListener('change', () => X().alternarEjercicio(e.id));
      ul.appendChild(li);
    });
    s2.appendChild(ul);
    s2.appendChild(boton('+ Agregar un ejercicio propio', 'prof-btn prof-btn-primario', () => X().editarPropio(null)));

    const s3 = seccionPanel(cuerpo, `Preguntas de opción múltiple (${r.preguntas.length})`, 'Las preguntas desmarcadas no entran en los cuestionarios al azar, ni en la batalla ni en los simulacros. Con «Editar» cambiás el texto, las opciones y la respuesta correcta.');
    const ul2 = crear('ul', 'prof-lista prof-lista-ej');
    r.preguntas.forEach(q => {
      const li = crear('li', q.visible ? '' : 'oculta');
      li.innerHTML = `<label class="prof-casilla"><input type="checkbox" ${q.visible ? 'checked' : ''} aria-label="Incluir la pregunta ${U.escapar(q.id)}"> <span><b>${U.escapar(q.id)}</b> · ${U.escapar(q.texto)}</span></label>${q.editada ? ' <span class="prof-chip">editada</span>' : ''}`;
      $q('input', li).addEventListener('change', () => { X().alternarPregunta(q.id); li.classList.toggle('oculta'); });
      const a = crear('span', 'prof-acciones-fila');
      if (q.propia) a.append(boton('Editar', 'prof-btn-chico', () => X().editarPregunta(q.id)), boton('Eliminar', 'prof-btn-chico prof-btn-peligro', () => X().eliminarPregunta(q.id)));
      else a.append(boton('Editar', 'prof-btn-chico', () => X().editarPreguntaBanco(q.id)));
      li.appendChild(a);
      ul2.appendChild(li);
    });
    s3.appendChild(ul2);
    s3.appendChild(boton('+ Agregar una pregunta propia', 'prof-btn prof-btn-primario', () => X().editarPregunta(null)));
    s3.appendChild(crear('p', 'prof-ayuda', 'Los cambios en las preguntas se ven al generar un nuevo cuestionario (o al recargar la página).'));
  }

  // ---------- Libro ----------
  function pestanaLibro(cuerpo) {
    const c = C.obtener();
    const orig = K.libroOriginal;
    const lib = c.libro || {};

    // Datos de la cursada
    const s1 = seccionPanel(cuerpo, 'Datos de la cursada', 'Aparecen en el pie de todas las páginas.');
    s1.insertAdjacentHTML('beforeend', `
      <label class="prof-etiqueta" for="prof-materia">Materia</label><input id="prof-materia" class="prof-campo" type="text">
      <label class="prof-etiqueta" for="prof-cuatri">Cuatrimestre</label><input id="prof-cuatri" class="prof-campo" type="text">`);
    $q('#prof-materia', s1).value = lib.materia || orig.materia;
    $q('#prof-cuatri', s1).value = lib.cuatrimestre || orig.cuatrimestre;
    s1.appendChild(boton('Guardar los datos', 'prof-btn prof-btn-primario', () => {
      const m = $q('#prof-materia', s1).value.trim(), q = $q('#prof-cuatri', s1).value.trim();
      if (!m || !q) { I.aviso('La materia y el cuatrimestre no pueden quedar vacíos.', 'error'); return; }
      C.cambiar('Cambiar los datos de la cursada', x => {
        x.libro = x.libro || {};
        if (m === orig.materia) delete x.libro.materia; else x.libro.materia = m;
        if (q === orig.cuatrimestre) delete x.libro.cuatrimestre; else x.libro.cuatrimestre = q;
      });
      I.recargar({ panel: 'libro', aviso: 'Se guardaron los datos de la cursada.' });
    }));

    // Unidades
    const s2 = seccionPanel(cuerpo, 'Unidades', 'Orden en el menú y en la portada, unidades y páginas visibles para los alumnos, y textos de cada unidad.');
    const ul = crear('ol', 'prof-lista-unidades');
    const ids = LIBRO.unidades.map(u => u.id);
    LIBRO.unidades.forEach((u, i) => {
      const li = crear('li', u._profOculta ? 'oculta' : '');
      li.innerHTML = `<div class="prof-fila-unidad">
          <label class="prof-casilla"><input type="checkbox" ${u._profOculta ? '' : 'checked'} aria-label="Mostrar la unidad ${U.escapar(u.numero)} a los alumnos"> <span><b>Unidad ${u.numero}</b> · ${u.nombre}</span></label>
          <span class="prof-acciones-fila">
            <button type="button" class="prof-btn-chico" data-m="-1" ${i === 0 ? 'disabled' : ''} aria-label="Subir la unidad">↑</button>
            <button type="button" class="prof-btn-chico" data-m="1" ${i === ids.length - 1 ? 'disabled' : ''} aria-label="Bajar la unidad">↓</button>
            <button type="button" class="prof-btn-chico" data-textos>Textos</button>
          </span></div>
        <div class="prof-paginas-unidad">${u.paginas.filter(p => p.archivo).map(p => `<label class="prof-casilla"><input type="checkbox" data-pag="${U.escapar(p.archivo.replace(/\.html?$/, ''))}" ${p._profOculta ? '' : 'checked'}> <span>${p.nombre}</span></label>`).join('')}</div>`;
      $q('.prof-fila-unidad input', li).addEventListener('change', ev => {
        C.cambiar(ev.target.checked ? 'Mostrar una unidad' : 'Ocultar una unidad', x => {
          x.unidades.ocultas = x.unidades.ocultas.filter(v => v !== u.id);
          if (!ev.target.checked) x.unidades.ocultas.push(u.id);
        });
        I.recargar({ panel: 'libro' });
      });
      li.querySelectorAll('[data-pag]').forEach(inp => inp.addEventListener('change', () => {
        C.cambiar(inp.checked ? 'Mostrar una página' : 'Ocultar una página', x => {
          x.unidades.paginasOcultas = x.unidades.paginasOcultas.filter(v => v !== inp.dataset.pag);
          if (!inp.checked) x.unidades.paginasOcultas.push(inp.dataset.pag);
        });
        I.recargar({ panel: 'libro' });
      }));
      li.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => {
        const nuevo = ids.slice();
        const j = i + parseInt(b.dataset.m, 10);
        [nuevo[i], nuevo[j]] = [nuevo[j], nuevo[i]];
        const original = orig.unidades.map(x => x.id);
        C.cambiar('Cambiar el orden de las unidades', x => { x.unidades.orden = nuevo.join() === original.join() ? null : nuevo; });
        I.recargar({ panel: 'libro' });
      }));
      $q('[data-textos]', li).addEventListener('click', () => editarTextosUnidad(u.id));
      ul.appendChild(li);
    });
    s2.appendChild(ul);

    // Cronograma
    const s3 = seccionPanel(cuerpo, 'Cronograma de clases', 'Se usa en la portada (próxima clase) y en el Programa.');
    const clases = (lib.clases && lib.clases.length ? lib.clases : orig.clases).map(x => ({ ...x }));
    const tabla = crear('div', 'prof-cronograma');
    const opcionesUnidad = sel => `<option value="">—</option>` + orig.unidades.map(u => `<option value="${u.id}" ${u.id === sel ? 'selected' : ''}>U ${u.numero}</option>`).join('');
    const filaClase = x => {
      const f = crear('div', 'prof-fila-clase');
      f.innerHTML = `<input class="prof-campo prof-n" type="text" inputmode="numeric" aria-label="Número de clase">
        <input class="prof-campo prof-fecha" type="date" aria-label="Fecha">
        <select class="prof-campo prof-u" aria-label="Unidad">${opcionesUnidad(x.unidad)}</select>
        <input class="prof-campo prof-tema" type="text" aria-label="Tema">
        <label class="prof-casilla" title="Es un examen"><input type="checkbox" class="prof-ex"> Examen</label>
        <button type="button" class="prof-btn-chico prof-btn-peligro" aria-label="Quitar la clase">✕</button>`;
      $q('.prof-n', f).value = x.n ?? '';
      $q('.prof-fecha', f).value = x.fecha || '';
      $q('.prof-tema', f).value = x.tema || '';
      $q('.prof-ex', f).checked = !!x.examen;
      $q('button', f).addEventListener('click', () => f.remove());
      return f;
    };
    clases.forEach(x => tabla.appendChild(filaClase(x)));
    s3.appendChild(tabla);
    const acc3 = crear('div', 'prof-botonera');
    acc3.append(
      boton('+ Agregar una clase', 'prof-btn', () => tabla.appendChild(filaClase({ n: (clases.length + 1), fecha: '', unidad: null, tema: '' }))),
      boton('Guardar el cronograma', 'prof-btn prof-btn-primario', () => {
        const filas = [...tabla.querySelectorAll('.prof-fila-clase')].map(f => ({
          n: $q('.prof-n', f).value.trim() === '' ? null : parseInt($q('.prof-n', f).value, 10),
          fecha: $q('.prof-fecha', f).value, unidad: $q('.prof-u', f).value || null,
          tema: $q('.prof-tema', f).value.trim(), examen: $q('.prof-ex', f).checked,
        }));
        const mala = filas.findIndex(x => !/^\d{4}-\d{2}-\d{2}$/.test(x.fecha) || !x.tema || (x.n !== null && !Number.isFinite(x.n)));
        if (!filas.length) { I.aviso('El cronograma necesita al menos una clase.', 'error'); return; }
        if (mala >= 0) { I.aviso(`Revisá la fila ${mala + 1}: necesita fecha y tema (y el número de clase, si lo ponés, tiene que ser un número).`, 'error'); return; }
        filas.sort((a, b) => a.fecha.localeCompare(b.fecha));
        filas.forEach(x => { if (!x.examen) delete x.examen; });
        C.cambiar('Cambiar el cronograma', x => { x.libro = x.libro || {}; x.libro.clases = filas; });
        I.recargar({ panel: 'libro', aviso: 'Se guardó el cronograma (ordenado por fecha).' });
      }),
      boton('Restaurar el original', 'prof-btn', () => {
        C.cambiar('Restaurar el cronograma', x => { if (x.libro) delete x.libro.clases; });
        I.recargar({ panel: 'libro', aviso: 'Se restauró el cronograma original.' });
      }));
    s3.appendChild(acc3);

    // Evaluaciones
    const s4 = seccionPanel(cuerpo, 'Evaluaciones', 'Agrupan las unidades en la portada («Primer parcial», «Segundo parcial»…). Las unidades que no figuran en ninguna se muestran al final.');
    const evs = (lib.evaluaciones || orig.evaluaciones).map(x => ({ ...x }));
    const tablaEv = crear('div', 'prof-evaluaciones');
    const filaEv = x => {
      const f = crear('div', 'prof-fila-ev');
      f.innerHTML = `<div class="prof-dos-columnas"><input class="prof-campo prof-ev-nombre" type="text" aria-label="Nombre de la evaluación"><input class="prof-campo prof-ev-fecha" type="date" aria-label="Fecha"></div>
        <div class="prof-ev-unidades">${orig.unidades.map(u => `<label class="prof-casilla"><input type="checkbox" value="${u.id}" ${(x.unidades || []).includes(u.id) ? 'checked' : ''}> U ${u.numero}</label>`).join('')}
        <button type="button" class="prof-btn-chico prof-btn-peligro" aria-label="Quitar la evaluación">✕</button></div>`;
      $q('.prof-ev-nombre', f).value = x.nombre || '';
      $q('.prof-ev-fecha', f).value = x.fecha || '';
      $q('.prof-btn-peligro', f).addEventListener('click', () => f.remove());
      return f;
    };
    evs.forEach(x => tablaEv.appendChild(filaEv(x)));
    s4.appendChild(tablaEv);
    const acc4 = crear('div', 'prof-botonera');
    acc4.append(
      boton('+ Agregar una evaluación', 'prof-btn', () => tablaEv.appendChild(filaEv({ nombre: '', fecha: '', unidades: [] }))),
      boton('Guardar las evaluaciones', 'prof-btn prof-btn-primario', () => {
        const filas = [...tablaEv.querySelectorAll('.prof-fila-ev')].map(f => ({
          nombre: $q('.prof-ev-nombre', f).value.trim(), fecha: $q('.prof-ev-fecha', f).value,
          unidades: [...f.querySelectorAll('.prof-ev-unidades input:checked')].map(i => i.value),
        }));
        const mala = filas.findIndex(x => !x.nombre || !/^\d{4}-\d{2}-\d{2}$/.test(x.fecha));
        if (mala >= 0) { I.aviso(`Revisá la evaluación ${mala + 1}: necesita nombre y fecha.`, 'error'); return; }
        filas.sort((a, b) => a.fecha.localeCompare(b.fecha));
        C.cambiar('Cambiar las evaluaciones', x => { x.libro = x.libro || {}; x.libro.evaluaciones = filas; });
        I.recargar({ panel: 'libro', aviso: 'Se guardaron las evaluaciones.' });
      }),
      boton('Restaurar el original', 'prof-btn', () => {
        C.cambiar('Restaurar las evaluaciones', x => { if (x.libro) delete x.libro.evaluaciones; });
        I.recargar({ panel: 'libro', aviso: 'Se restauraron las evaluaciones originales.' });
      }));
    s4.appendChild(acc4);

    // Aviso, páginas generales y simulacros
    const s5 = seccionPanel(cuerpo, 'Para los alumnos: aviso, páginas y simulacros', 'Un aviso que aparece arriba en la portada, las páginas generales que ven los alumnos y los exámenes que pueden practicar en el Simulacro.');
    s5.insertAdjacentHTML('beforeend', `<label class="prof-etiqueta" for="prof-aviso">Aviso en la portada</label>
      <textarea id="prof-aviso" class="prof-campo" rows="3" placeholder="Por ejemplo: el viernes no hay clase; el simulacro del primer parcial ya está habilitado."></textarea>`);
    $q('#prof-aviso', s5).value = (c.aviso || {}).texto || '';
    const avisoActivo = casilla('Mostrar el aviso', !!(c.aviso || {}).activo, () => {});
    s5.appendChild(avisoActivo);
    s5.appendChild(boton('Guardar el aviso', 'prof-btn prof-btn-primario', () => {
      const texto = $q('#prof-aviso', s5).value.trim(), activo = $q('input', avisoActivo).checked;
      C.cambiar('Cambiar el aviso de la portada', x => { x.aviso = { activo: activo && !!texto, texto }; });
      I.aviso(activo && texto ? 'El aviso se muestra en la portada.' : 'El aviso no se muestra.');
    }));
    s5.appendChild(crear('p', 'prof-etiqueta', 'Páginas generales visibles'));
    (orig.generales || []).filter(g => g.archivo).forEach(g => {
      const clave = g.archivo.replace(/\.html?$/, '');
      s5.appendChild(casilla(g.nombre, !c.unidades.paginasOcultas.includes(clave), v => {
        C.cambiar(v ? 'Mostrar una página' : 'Ocultar una página', x => {
          x.unidades.paginasOcultas = x.unidades.paginasOcultas.filter(p => p !== clave);
          if (!v) x.unidades.paginasOcultas.push(clave);
        });
        I.recargar({ panel: 'libro' });
      }));
    });
    s5.appendChild(crear('p', 'prof-etiqueta', 'Exámenes del Simulacro'));
    [['p1', 'Primer parcial'], ['p2', 'Segundo parcial'], ['final', 'Examen final']].forEach(([id, nombre]) => {
      s5.appendChild(casilla(nombre, !((c.simulacro || {}).ocultos || []).includes(id), v => {
        C.cambiar(v ? 'Habilitar un examen del simulacro' : 'Ocultar un examen del simulacro', x => {
          x.simulacro = x.simulacro || { ocultos: [] };
          x.simulacro.ocultos = (x.simulacro.ocultos || []).filter(e => e !== id);
          if (!v) x.simulacro.ocultos.push(id);
        });
        I.aviso(v ? `El ${nombre.toLowerCase()} vuelve a estar en el Simulacro.` : `El ${nombre.toLowerCase()} quedó oculto en el Simulacro.`);
      }));
    });
    s5.appendChild(crear('p', 'prof-ayuda', 'Un examen solo usa preguntas de las unidades visibles. Las preguntas se ocultan o editan desde la Ejercitación de cada unidad (Panel → Ejercitación).'));
  }

  function editarTextosUnidad(id) {
    const o = K.libroOriginal.unidades.find(u => u.id === id);
    const d = ((C.obtener().libro || {}).unidades || {})[id] || {};
    const campos = [['nombre', 'Nombre'], ['corto', 'Nombre corto (menú)'], ['descripcion', 'Descripción (portada)'], ['clases', 'Clases'], ['hull', 'Bibliografía (Hull)']];
    const form = crear('div', 'prof-form');
    campos.forEach(([k, n]) => {
      form.insertAdjacentHTML('beforeend', `<label class="prof-etiqueta" for="prof-u-${k}">${n}</label>` + (k === 'descripcion' ? `<textarea id="prof-u-${k}" class="prof-campo" rows="3"></textarea>` : `<input id="prof-u-${k}" class="prof-campo" type="text">`));
      $q('#prof-u-' + k, form).value = d[k] || o[k] || '';
    });
    E().crearVentana(`Unidad ${o.numero} · textos`, form, [
      {
        texto: 'Restaurar los originales', accion: cerrar => {
          cerrar();
          C.cambiar('Restaurar los textos de una unidad', x => { if (x.libro && x.libro.unidades) delete x.libro.unidades[id]; });
          I.recargar({ panel: 'libro', aviso: 'Se restauraron los textos de la unidad.' });
        },
      },
      { texto: 'Cancelar', accion: cerrar => cerrar() },
      {
        texto: 'Guardar', clase: 'prof-btn prof-btn-primario', accion: cerrar => {
          const nuevo = {};
          let vacio = false;
          campos.forEach(([k]) => { const v = $q('#prof-u-' + k, form).value.trim(); if (!v) vacio = true; else if (v !== o[k]) nuevo[k] = v; });
          if (vacio) { I.aviso('Ningún campo puede quedar vacío.', 'error'); return; }
          cerrar();
          C.cambiar('Cambiar los textos de una unidad', x => {
            x.libro = x.libro || {};
            x.libro.unidades = x.libro.unidades || {};
            if (Object.keys(nuevo).length) x.libro.unidades[id] = nuevo; else delete x.libro.unidades[id];
            if (!Object.keys(x.libro.unidades).length) delete x.libro.unidades;
          });
          I.recargar({ panel: 'libro', aviso: 'Se guardaron los textos de la unidad.' });
        },
      },
    ]);
    $q('#prof-u-nombre', form).focus();
  }

  // ---------- Archivo ----------
  function pestanaArchivo(cuerpo) {
    const est = C.estadoGuardado();
    const origen = C.origen();
    const c = C.obtener();
    const s1 = seccionPanel(cuerpo, 'Estado');
    const txtOrigen = { borrador: 'Tus cambios guardados en este navegador.', publicada: 'La versión publicada (archivo js/config-docente.js), sin cambios locales.', original: 'El libro original, sin cambios.' }[origen];
    s1.insertAdjacentHTML('beforeend', `<dl class="prof-estado">
      <dt>Qué se está mostrando</dt><dd>${txtOrigen}</dd>
      <dt>Última modificación</dt><dd>${U.fechaHora(c.meta.actualizado)}</dd>
      <dt>Guardado automático</dt><dd>${est.persistente ? 'Activo: cada cambio se guarda en este navegador.' : '<strong>No disponible en este navegador.</strong> Exportá la configuración para no perder los cambios.'}</dd>
      ${C.publicada() ? `<dt>Versión publicada</dt><dd>Hay una configuración publicada (del ${U.fechaHora(C.publicada().meta.actualizado)}).</dd>` : ''}
    </dl>`);
    if (location.protocol === 'file:' && /firefox/i.test(navigator.userAgent)) s1.appendChild(crear('p', 'prof-aviso', 'Estás usando Firefox con el libro abierto desde una carpeta. Si al cambiar de página no ves tus cambios, editá con Chrome o Edge.'));

    const s2 = seccionPanel(cuerpo, 'Llevar los cambios a otra computadora', 'Exportá un archivo con todos tus cambios y abrilo en otra computadora con «Importar». El archivo no incluye el libro: solo tus cambios.');
    s2.appendChild(boton('Exportar la configuración (.json)', 'prof-btn prof-btn-primario', () => {
      const hoy = new Date().toISOString().slice(0, 10);
      U.descargar(`derivados-docente-${hoy}.json`, C.textoJSON());
      I.aviso('Se descargó el archivo de configuración.');
    }));
    const archivo = crear('input');
    archivo.type = 'file';
    archivo.accept = '.json,.js,application/json,text/javascript';
    archivo.className = 'prof-oculto-visual';
    archivo.id = 'prof-importar';
    const etiq = crear('label', 'prof-btn', 'Importar una configuración…');
    etiq.htmlFor = 'prof-importar';
    etiq.tabIndex = 0;
    etiq.setAttribute('role', 'button');
    etiq.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); archivo.click(); } });
    archivo.addEventListener('change', () => {
      const f = archivo.files && archivo.files[0];
      if (!f) return;
      if (f.size > 5 * 1024 * 1024) { I.aviso('El archivo es demasiado grande para ser una configuración.', 'error'); return; }
      const lector = new FileReader();
      lector.onload = () => {
        const r = C.leerArchivo(lector.result);
        archivo.value = '';
        if (r.error) { I.aviso(r.error, 'error'); return; }
        I.confirmar('¿Importar esta configuración?', `Reemplaza todos los cambios de este navegador por los del archivo (última modificación: ${U.fechaHora(r.config.meta.actualizado)}). La contraseña también pasa a ser la del archivo.`, 'Importar').then(ok => {
          if (!ok) return;
          C.reemplazar(r.config, 'Importar una configuración');
          I.recargar({ panel: 'archivo', aviso: 'Se importó la configuración.' });
        });
      };
      lector.onerror = () => I.aviso('No se pudo leer el archivo.', 'error');
      lector.readAsText(f);
    });
    s2.append(archivo, etiq);

    const s3 = seccionPanel(cuerpo, 'Publicar para los alumnos', 'Lo que editás acá solo se ve en este navegador. Para que los alumnos vean tu versión: <ol><li>Descargá el archivo <code>config-docente.js</code>.</li><li>Reemplazá con él el archivo <code>js/config-docente.js</code> de la carpeta del libro.</li><li>Distribuí la carpeta (o subila al campus) como siempre.</li></ol>');
    s3.appendChild(boton('Descargar config-docente.js', 'prof-btn prof-btn-primario', () => {
      U.descargar('config-docente.js', C.textoPublicacion(), 'text/javascript');
      I.aviso('Se descargó config-docente.js. Reemplazá con él el de la carpeta js del libro.');
    }));

    const s4 = seccionPanel(cuerpo, 'Restaurar', '');
    if (C.publicada() && origen === 'borrador') {
      s4.appendChild(crear('p', 'prof-ayuda', 'Descartar el borrador vuelve a mostrar la versión publicada (el archivo js/config-docente.js).'));
      s4.appendChild(boton('Descartar los cambios de este navegador', 'prof-btn prof-btn-peligro', () => {
        I.confirmar('¿Descartar los cambios de este navegador?', 'Se vuelve a la versión publicada. Si querés conservar tus cambios, exportalos antes.', 'Descartar', true).then(ok => {
          if (!ok) return;
          C.descartarBorrador();
          I.recargar({ panel: 'archivo', aviso: 'Se descartó el borrador: se muestra la versión publicada.' });
        });
      }));
    }
    s4.appendChild(crear('p', 'prof-ayuda', 'Restaurar todo vuelve el libro completo a su versión original (se conserva la contraseña).'));
    s4.appendChild(boton('Restaurar todo el libro al original', 'prof-btn prof-btn-peligro', () => {
      I.confirmar('¿Restaurar todo el libro al original?', 'Se borran todos los cambios de todas las páginas, los simuladores, la ejercitación y el cronograma. Podés deshacerlo mientras no cierres esta pestaña; para tener una copia, exportá antes la configuración.', 'Restaurar todo', true).then(ok => {
        if (!ok) return;
        const nueva = C.vacia();
        nueva.acceso = { ...C.obtener().acceso };
        C.reemplazar(nueva, 'Restaurar todo el libro');
        I.recargar({ panel: 'archivo', aviso: 'El libro volvió a su versión original.' });
      });
    }));
  }

  // ---------- Acceso ----------
  function pestanaAcceso(cuerpo) {
    const c = C.obtener();
    const s1 = seccionPanel(cuerpo, 'Cambiar la contraseña', 'La contraseña es una barrera para que los alumnos no entren a editar por accidente; no protege datos (el libro funciona sin servidor).');
    s1.insertAdjacentHTML('beforeend', `
      <label class="prof-etiqueta" for="prof-c-actual">Contraseña actual</label><input id="prof-c-actual" class="prof-campo" type="password" autocomplete="current-password">
      <label class="prof-etiqueta" for="prof-c-nueva">Contraseña nueva (al menos 6 caracteres)</label><input id="prof-c-nueva" class="prof-campo" type="password" autocomplete="new-password">
      <label class="prof-etiqueta" for="prof-c-repetir">Repetí la contraseña nueva</label><input id="prof-c-repetir" class="prof-campo" type="password" autocomplete="new-password">`);
    s1.appendChild(boton('Cambiar la contraseña', 'prof-btn prof-btn-primario', () => {
      const a = $q('#prof-c-actual', s1).value, n = $q('#prof-c-nueva', s1).value, r = $q('#prof-c-repetir', s1).value;
      if (huellaClave(a) !== hashVigente()) { I.aviso('La contraseña actual no es correcta.', 'error'); return; }
      if (n.length < 6) { I.aviso('La contraseña nueva tiene que tener al menos 6 caracteres.', 'error'); return; }
      if (n !== r) { I.aviso('Las dos contraseñas nuevas no coinciden.', 'error'); return; }
      C.cambiar('Cambiar la contraseña', x => { x.acceso.hash = huellaClave(n); });
      ['#prof-c-actual', '#prof-c-nueva', '#prof-c-repetir'].forEach(s => { $q(s, s1).value = ''; });
      I.aviso('Se cambió la contraseña. Para que rija en las computadoras de los alumnos, publicá de nuevo config-docente.js.');
    }));

    const s2 = seccionPanel(cuerpo, 'Botón de acceso', 'Si lo ocultás, se entra agregando <code>#profesor</code> al final de la dirección de cualquier página (por ejemplo, <code>index.html#profesor</code>).');
    s2.appendChild(casilla('Ocultar el botón «Modo Profesor» a los alumnos', c.acceso.ocultarBoton, v => {
      C.cambiar(v ? 'Ocultar el botón de acceso' : 'Mostrar el botón de acceso', x => { x.acceso.ocultarBoton = v; });
      I.aviso(v ? 'El botón quedó oculto para los alumnos. Recordá: se entra con #profesor.' : 'El botón vuelve a mostrarse.');
    }));
  }

  P.Interfaz = I;
})(window.Profesor = window.Profesor || {});
