// ============================================================================
// Modo Profesor · Contenido
// ----------------------------------------------------------------------------
// Aplica la configuración del docente sobre la página ANTES de que el libro la
// dibuje (fórmulas, índice, autoevaluaciones, gráficos):
//   · datos generales del libro: unidades visibles y su orden, páginas ocultas,
//     nombres de las unidades y cronograma;
//   · bloques de la página: textos editados, bloques ocultos y bloques nuevos;
//   · secciones (títulos <h2>): orden y visibilidad.
//
// Cómo se identifican los bloques: el contenido de cada página es una lista de
// elementos dentro de <article class="contenido"> (o <main class="portada">).
// Cada elemento original recibe un identificador por su posición ("b12") y una
// huella de su texto. Si en una versión futura del libro un bloque cambia de
// lugar, el cambio del docente se reubica por la huella; si no se encuentra,
// queda listado como "cambio sin ubicar" en el panel, sin romper nada.
// ============================================================================

(function (P) {
  'use strict';

  const U = P.Util;
  const C = P.Config;
  const K = {};

  let contenedor = null;
  const ORIG = new Map();     // id → { clon (HTML original sin procesar), tipo, huella }
  let edicion = false;
  K.huerfanos = [];           // cambios que no se pudieron ubicar en la página

  // Clave de la página: nombre del archivo sin ".html" ('u6-teoria', 'index'...).
  K.clavePagina = function () {
    const archivo = decodeURIComponent(location.pathname.split('/').pop() || '');
    return archivo.replace(/\.html?$/i, '') || 'index';
  };
  const claveDeArchivo = archivo => String(archivo || '').replace(/\.html?$/i, '');

  K.contenedor = () => contenedor;
  K.original = id => ORIG.get(id);
  K.tipo = id => (ORIG.get(id) || {}).tipo || null;
  K.esOriginal = id => ORIG.has(id);

  // --------------------------------------------------------------------------
  // Datos generales del libro (objeto LIBRO de js/comun.js)
  // --------------------------------------------------------------------------
  // Copia del objeto LIBRO tal como viene (para mostrar y restaurar los originales).
  K.libroOriginal = null;

  K.aplicarLibro = function (modoEdicion) {
    if (!K.libroOriginal) K.libroOriginal = JSON.parse(JSON.stringify(LIBRO));
    const c = C.obtener();
    const l = c.libro || {};
    // Los textos del docente se escapan: js/comun.js los inserta como HTML.
    const e = U.escapar;
    if (l.materia) LIBRO.materia = e(l.materia);
    if (l.cuatrimestre) LIBRO.cuatrimestre = e(l.cuatrimestre);
    if (Array.isArray(l.clases) && l.clases.length) LIBRO.clases = l.clases.map(x => ({ ...x, tema: e(x.tema) }));
    if (Array.isArray(l.evaluaciones)) LIBRO.evaluaciones = l.evaluaciones.map(x => ({ ...x, nombre: e(x.nombre), unidades: [...x.unidades] }));
    if (l.unidades) {
      LIBRO.unidades.forEach(u => {
        const d = l.unidades[u.id];
        if (d) ['nombre', 'corto', 'descripcion', 'clases', 'hull'].forEach(k => { if (d[k]) u[k] = e(d[k]); });
      });
    }
    // Orden de las unidades en el menú, la portada y la navegación.
    const orden = c.unidades.orden;
    if (orden && orden.length) {
      const pos = id => { const i = orden.indexOf(id); return i < 0 ? 1000 : i; };
      const original = LIBRO.unidades.map(u => u.id);
      LIBRO.unidades.sort((a, b) => pos(a.id) - pos(b.id) || original.indexOf(a.id) - original.indexOf(b.id));
    }
    // Unidades y páginas ocultas.
    LIBRO.unidades.forEach(u => {
      u._profOculta = c.unidades.ocultas.includes(u.id);
      u.paginas.forEach(p => { p._profOculta = c.unidades.paginasOcultas.includes(claveDeArchivo(p.archivo)); });
    });
    if (!modoEdicion) {
      LIBRO.unidades = LIBRO.unidades
        .filter(u => !u._profOculta)
        .map(u => ({ ...u, paginas: u.paginas.filter(p => !p._profOculta) }))
        .filter(u => u.paginas.some(p => p.archivo));
      // Las evaluaciones no nombran unidades ocultas.
      const visibles = new Set(LIBRO.unidades.map(u => u.id));
      LIBRO.evaluaciones = LIBRO.evaluaciones.map(ev => ({ ...ev, unidades: (ev.unidades || []).filter(id => visibles.has(id)) }));
      // Páginas generales ocultas (Herramientas, Formulario, Programa).
      LIBRO.generales = LIBRO.generales.filter(g => !c.unidades.paginasOcultas.includes(claveDeArchivo(g.archivo)));
    } else {
      LIBRO.generales.forEach(g => { g._profOculta = c.unidades.paginasOcultas.includes(claveDeArchivo(g.archivo)); });
    }
  };

  // ¿La página actual está oculta para los alumnos?
  K.paginaOculta = function () {
    const c = C.obtener();
    const unidad = document.body.dataset.unidad;
    return (unidad && c.unidades.ocultas.includes(unidad)) || c.unidades.paginasOcultas.includes(K.clavePagina());
  };

  // Vista de alumno de una página oculta: se esconde el contenido (sin borrarlo,
  // para que los scripts de la página sigan funcionando) y se muestra un aviso.
  K.mostrarAvisoPaginaOculta = function () {
    const main = document.querySelector('main');
    if (!main) return;
    main.hidden = true;
    const aviso = document.createElement('main');
    aviso.className = 'pagina';
    aviso.innerHTML = `<article class="contenido">
        <h1>Esta página no está disponible</h1>
        <p class="bajada">El docente no la incluyó en el recorrido de esta cursada.</p>
        <p><a class="btn-primario" href="index.html">Volver a la portada</a></p>
      </article>`;
    main.after(aviso);
  };

  // --------------------------------------------------------------------------
  // Bloques originales
  // --------------------------------------------------------------------------
  // Tipos:
  //   linea      títulos y etiquetas (una sola línea de texto)
  //   parrafo    párrafos y listas
  //   contenedor cajas (ejemplo, definición...), objetivos, tablas, fichas
  //   formula    fórmula destacada (div.formula)
  //   figura     figura con dibujo propio: solo se edita el epígrafe
  //   grafico    gráfico de payoff: epígrafe y posiciones
  //   diagrama   diagrama de swap: epígrafe y flujos
  //   quiz       autoevaluación rápida
  //   grilla     grilla de gráficos (solo mostrar/ocultar)
  //   simulador  simulador interactivo (solo mostrar/ocultar y parámetros)
  //   fijo       contenido que arma un script (solo mostrar/ocultar)
  function clasificar(el) {
    const tag = el.tagName.toLowerCase();
    if (el.matches('section.widget')) return 'simulador';
    if (el.matches('figure.grafico-payoff')) return 'grafico';
    if (el.matches('figure.diagrama-swap')) return 'diagrama';
    if (tag === 'figure') return 'figura';
    if (el.matches('div.grilla-graficos')) return 'grilla';
    // Mini simulaciones de la lectura y ejercicios armados por un script (js/lectura-interactiva.js,
    // js/diagrama-swap.js, js/cuadro-margenes.js): se pueden ocultar, no editar.
    if (el.matches('div.mini-sim')) return 'fijo';
    if (el.matches('div.quiz-rapido') && el.querySelector('.ej-diagrama-swap, .ej-cuadro-margenes')) return 'fijo';
    if (el.matches('div.quiz-rapido')) return 'quiz';
    // Puntos clave: se editan como una caja (el título y el botón los agrega el script).
    if (el.matches('aside.punto-clave')) return 'contenedor';
    if (el.id && tag !== 'h2') return 'fijo';
    // Elementos que un script completa o que tienen controles: no se editan como texto.
    if (el.querySelector('[id]:not(svg *), section.widget, canvas, input, select, textarea, button, svg')) return 'fijo';
    if (el.matches('div.formula')) return 'formula';
    if (/^h[1-4]$/.test(tag) || el.matches('span.etiqueta-hull')) return 'linea';
    if (tag === 'p' || tag === 'ul' || tag === 'ol') return el.textContent.trim() || tag !== 'p' ? 'parrafo' : 'fijo';
    if (['div', 'details', 'dl', 'section', 'blockquote', 'table'].includes(tag)) return 'contenedor';
    return 'fijo';
  }

  K.prepararBloques = function () {
    contenedor = document.querySelector('article.contenido') || document.querySelector('main.portada');
    if (!contenedor) return false;
    [...contenedor.children].forEach((el, i) => {
      const id = 'b' + i;
      el.dataset.profId = id;
      // Mismo identificador que asigna el índice lateral, calculado sobre el texto original:
      // si el docente cambia el título, los enlaces a la sección siguen funcionando.
      if (el.tagName === 'H2' && !el.id && typeof aSlug === 'function') el.id = aSlug(el.textContent);
      ORIG.set(id, { clon: el.cloneNode(true), tipo: clasificar(el), huella: U.huella(el) });
    });
    return true;
  };

  // Todos los elementos de la página que pertenecen a un bloque (original o nuevo).
  K.elemento = id => (contenedor ? contenedor.querySelector(`:scope > [data-prof-id="${CSS.escape(id)}"]`) : null);

  // --------------------------------------------------------------------------
  // Secciones (un <h2> y todo lo que sigue hasta el próximo <h2>)
  // --------------------------------------------------------------------------
  K.secciones = function () {
    const res = [];
    let s = null;
    if (!contenedor) return res;
    [...contenedor.children].forEach(el => {
      if (el.tagName === 'H2') { s = { id: el.id, h2: el, elementos: [el] }; res.push(s); }
      else if (s) s.elementos.push(el);
    });
    return res;
  };

  // Sección a la que pertenece un elemento ('__intro' si está antes del primer título).
  K.seccionDe = function (el) {
    let x = el;
    while (x) { if (x.tagName === 'H2') return x.id; x = x.previousElementSibling; }
    return '__intro';
  };

  function ultimoDeSeccion(sid) {
    if (!contenedor) return null;
    const hijos = [...contenedor.children];
    if (sid === '__intro') {
      const primero = hijos.findIndex(e => e.tagName === 'H2');
      return primero > 0 ? hijos[primero - 1] : primero === 0 ? null : hijos[hijos.length - 1];
    }
    const h2 = hijos.find(e => e.tagName === 'H2' && e.id === sid);
    if (!h2) return null;
    let ultimo = h2, x = h2.nextElementSibling;
    while (x && x.tagName !== 'H2') { ultimo = x; x = x.nextElementSibling; }
    return ultimo;
  }

  // --------------------------------------------------------------------------
  // Aplicar los cambios de la página
  // --------------------------------------------------------------------------
  function aplicarCambio(el, cambio) {
    const tipo = (ORIG.get(el.dataset.profId) || {}).tipo;
    if (cambio.atributos && (tipo === 'grafico' || tipo === 'diagrama')) {
      Object.entries(cambio.atributos).forEach(([k, v]) => { if (U.ATRIBUTOS_FIGURA.includes(k)) el.setAttribute(k, v); });
    }
    if (cambio.html === undefined) return el;
    const html = U.sanear(cambio.html);
    if (tipo === 'figura' || tipo === 'grafico' || tipo === 'diagrama') {
      let epigrafe = el.querySelector('figcaption');
      if (!epigrafe) { epigrafe = document.createElement('figcaption'); el.appendChild(epigrafe); }
      epigrafe.innerHTML = html;
      return el;
    }
    if (cambio.envolver) {
      const div = document.createElement('div');
      div.className = 'bloque-texto';
      div.dataset.profId = el.dataset.profId;
      div.innerHTML = html;
      el.replaceWith(div);
      return div;
    }
    el.innerHTML = html;
    // Las fórmulas con nombre llevan la clase "con-nombre" (deja lugar para el rótulo).
    if (tipo === 'formula') el.classList.toggle('con-nombre', !!el.querySelector(':scope > .nombre-formula'));
    return el;
  }

  function crearElementoNuevo(n) {
    const t = document.createElement('template');
    t.innerHTML = U.sanear(n.html).trim();
    let el = t.content.children.length === 1 ? t.content.firstElementChild : null;
    if (!el) {
      el = document.createElement('div');
      el.className = 'bloque-texto';
      el.innerHTML = U.sanear(n.html);
    }
    el.dataset.profId = n.id;
    el.dataset.profNuevo = n.tipo;
    if (el.tagName === 'H2') el.id = n.id;
    return el;
  }
  K.crearElementoNuevo = crearElementoNuevo;

  K.insertarNuevo = function (n) {
    const el = crearElementoNuevo(n);
    let ref = null;
    // Si el libro cambió y el bloque de referencia ya no está en la misma posición,
    // se lo busca por la huella de su texto.
    let despues = n.despues;
    if (despues && n.ancla && ORIG.has(despues) && ORIG.get(despues).huella !== n.ancla) {
      const otro = [...ORIG.entries()].find(([, x]) => x.huella === n.ancla);
      if (otro) despues = otro[0];
    }
    if (n.tipo === 'seccion' && n.despuesSeccion) ref = ultimoDeSeccion(n.despuesSeccion);
    else if (despues) ref = K.elemento(despues);
    if (ref) ref.after(el);
    else if (n.despuesSeccion === '__intro' || n.despues === '__inicio') contenedor.prepend(el);
    else { contenedor.appendChild(el); if (n.despues || n.despuesSeccion) K.huerfanos.push({ id: n.id, nuevo: true }); }
    return el;
  };

  K.aplicarPagina = function (modoEdicion) {
    edicion = modoEdicion;
    if (!contenedor) return;
    const clave = K.clavePagina();
    const pag = C.pagina(clave);
    K.huerfanos = [];

    // 1. Bloques editados (y reubicación por huella si el libro cambió).
    const reubicados = {};
    Object.entries(pag.bloques || {}).forEach(([id, cambio]) => {
      let destino = id;
      const o = ORIG.get(id);
      if (!o || (cambio.huella && o.huella !== cambio.huella)) {
        const candidato = [...ORIG.entries()].find(([otro, x]) => x.huella === cambio.huella && !(pag.bloques || {})[otro]);
        if (!candidato) { K.huerfanos.push({ id, cambio }); return; }
        destino = candidato[0];
        reubicados[id] = destino;
      }
      const el = K.elemento(destino);
      if (el) aplicarCambio(el, cambio);
    });
    // En modo edición se corrige la configuración para que use los nuevos identificadores.
    if (modoEdicion && Object.keys(reubicados).length) {
      Object.entries(reubicados).forEach(([viejo, nuevo]) => { pag.bloques[nuevo] = pag.bloques[viejo]; delete pag.bloques[viejo]; });
      C.guardar();
    }

    // 2. Bloques y secciones agregados por el docente (en el orden en que se crearon).
    (pag.nuevos || []).forEach(n => K.insertarNuevo(n));

    // 3. Orden de las secciones.
    K.ordenarSecciones();

    // 4. Bloques y secciones ocultos, y marcas del modo edición.
    if (modoEdicion) K.refrescarMarcas();
    else {
      Object.entries(pag.bloques || {}).forEach(([id, cambio]) => { if (cambio.oculto) ocultarParaAlumnos(K.elemento(reubicados[id] || id)); });
      const ocultas = new Set((pag.secciones || {}).ocultas || []);
      K.secciones().forEach(s => { if (ocultas.has(s.id)) s.elementos.forEach(ocultarParaAlumnos); });
      // Sin rastros del Modo Profesor en la vista de los alumnos.
      contenedor.querySelectorAll('[data-prof-id]').forEach(el => { delete el.dataset.profId; delete el.dataset.profNuevo; });
    }
  };

  function ocultarParaAlumnos(el) {
    if (!el) return;
    const tipo = (ORIG.get(el.dataset.profId) || {}).tipo;
    // Los simuladores y el contenido que arma un script se esconden (los scripts los
    // siguen usando); el texto se quita de la página. El estilo en línea con
    // "important" evita que un script vuelva a mostrarlo al cambiar su "hidden".
    if (tipo === 'simulador' || tipo === 'fijo') { el.hidden = true; el.style.setProperty('display', 'none', 'important'); }
    else el.remove();
  }

  K.ordenarSecciones = function () {
    const pag = C.pagina(K.clavePagina());
    const orden = (pag.secciones || {}).orden;
    if (!orden || !orden.length || !contenedor) return;
    const secs = K.secciones();
    const pos = s => { const i = orden.indexOf(s.id); return i < 0 ? 1000 + secs.indexOf(s) : i; };
    [...secs].sort((a, b) => pos(a) - pos(b)).forEach(s => s.elementos.forEach(e => contenedor.appendChild(e)));
  };

  // Marcas visuales del modo edición (oculto, modificado, agregado).
  K.refrescarMarcas = function () {
    if (!contenedor) return;
    const pag = C.pagina(K.clavePagina());
    const ocultas = new Set((pag.secciones || {}).ocultas || []);
    const bloques = pag.bloques || {};
    K.secciones();
    [...contenedor.children].forEach(el => {
      const id = el.dataset.profId;
      if (!id) return;
      const cambio = bloques[id] || {};
      const seccion = K.seccionDe(el);
      const ocultoBloque = !!cambio.oculto, ocultaSeccion = ocultas.has(seccion);
      el.classList.toggle('prof-oculto', ocultoBloque || ocultaSeccion);
      if (ocultaSeccion) el.dataset.profOculto = 'seccion';
      else if (ocultoBloque) el.dataset.profOculto = 'bloque';
      else delete el.dataset.profOculto;
      const modificado = ORIG.has(id) && (cambio.html !== undefined || !!cambio.atributos);
      if (modificado) el.dataset.profModificado = '1'; else delete el.dataset.profModificado;
    });
  };

  // --------------------------------------------------------------------------
  // Fuente de un bloque para editarlo (HTML con las fórmulas en LaTeX, sin dibujar)
  // --------------------------------------------------------------------------
  K.fuente = function (id) {
    const pag = C.pagina(K.clavePagina());
    const nuevo = (pag.nuevos || []).find(n => n.id === id);
    if (nuevo) return { nuevo: true, tipo: nuevo.tipo, html: nuevo.html };
    const o = ORIG.get(id);
    if (!o) return null;
    const cambio = (pag.bloques || {})[id] || {};
    if (['figura', 'grafico', 'diagrama'].includes(o.tipo)) {
      const atributos = {};
      U.ATRIBUTOS_FIGURA.forEach(a => {
        const v = cambio.atributos && cambio.atributos[a] !== undefined ? cambio.atributos[a] : o.clon.getAttribute(a);
        if (v !== null && v !== undefined) atributos[a] = v;
      });
      const cap = o.clon.querySelector('figcaption');
      return { tipo: o.tipo, html: cambio.html !== undefined ? cambio.html : (cap ? cap.innerHTML : ''), atributos };
    }
    if (cambio.html !== undefined) return { tipo: o.tipo, html: cambio.html, envolver: !!cambio.envolver };
    return { tipo: o.tipo, html: o.clon.innerHTML };
  };

  // HTML original de un bloque (para comparar y para "Restaurar").
  K.fuenteOriginal = function (id) {
    const o = ORIG.get(id);
    if (!o) return null;
    if (['figura', 'grafico', 'diagrama'].includes(o.tipo)) {
      const cap = o.clon.querySelector('figcaption');
      return cap ? cap.innerHTML : '';
    }
    return o.clon.innerHTML;
  };

  // --------------------------------------------------------------------------
  // Actualizar un bloque en vivo (modo edición) y volver a dibujarlo
  // --------------------------------------------------------------------------
  K.actualizarBloque = function (id) {
    const pag = C.pagina(K.clavePagina());
    const actualEl = K.elemento(id);
    if (!actualEl) return null;
    // Los simuladores y el contenido que arma un script nunca se vuelven a armar:
    // perderían la conexión con su script. Solo cambian sus marcas.
    const o0 = ORIG.get(id);
    if (o0 && ['simulador', 'fijo', 'grilla'].includes(o0.tipo)) { K.refrescarMarcas(); return actualEl; }
    let nuevoEl;
    const nuevo = (pag.nuevos || []).find(n => n.id === id);
    if (nuevo) nuevoEl = crearElementoNuevo(nuevo);
    else {
      const o = ORIG.get(id);
      nuevoEl = o.clon.cloneNode(true);
      nuevoEl.dataset.profId = id;
      const cambio = (pag.bloques || {})[id];
      actualEl.replaceWith(nuevoEl);
      if (cambio) nuevoEl = aplicarCambio(nuevoEl, cambio);
      K.refrescarMarcas();
      K.renderizar(nuevoEl);
      return nuevoEl;
    }
    actualEl.replaceWith(nuevoEl);
    K.refrescarMarcas();
    K.renderizar(nuevoEl);
    return nuevoEl;
  };

  // Vuelve a dibujar fórmulas, autoevaluaciones, gráficos y diagramas de un bloque.
  K.renderizar = function (el) {
    if (!el) return;
    const todos = (sel) => (el.matches(sel) ? [el] : [...el.querySelectorAll(sel)]);
    try { if (typeof renderFormulas === 'function') renderFormulas(el); } catch (e) { console.error(e); }
    try { if (typeof prepararQuizRapidos === 'function') prepararQuizRapidos(); } catch (e) { console.error(e); }
    try { if (window.Chart && typeof dibujarGraficoPayoff === 'function') todos('figure.grafico-payoff[data-patas]').forEach(dibujarGraficoPayoff); } catch (e) { console.error(e); }
    try { if (typeof dibujarDiagramaSwap === 'function') todos('.diagrama-swap[data-entidades]').forEach(dibujarDiagramaSwap); } catch (e) { console.error(e); }
    try { if (window.LecturaInteractiva) todos('aside.punto-clave').forEach(LecturaInteractiva.decorarPuntoClave); } catch (e) { console.error(e); }
  };

  // Vuelve a armar el índice lateral (después de agregar o renombrar secciones).
  K.rehacerIndice = function () {
    try { if (typeof renderIndice === 'function') renderIndice(); } catch (e) { console.error(e); }
  };

  P.Contenido = K;
})(window.Profesor = window.Profesor || {});
