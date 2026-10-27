// Modo alumno / modo profesor y configuración del curso.
// Se carga en todas las páginas ANTES de js/comun.js (y después de js/curso-config.js).
//
// La configuración dice qué ven los alumnos y qué contenido cambió el profesor:
//   ocultas.unidades   ['u3', …]            unidades ocultas
//   ocultas.paginas    ['u2-simulacion', …] secciones ocultas de una unidad (unidad-sección)
//   ocultas.generales  ['batalla', …]       páginas generales ocultas
//   ocultas.examenes   ['final', …]         exámenes del simulacro ocultos
//   aviso              { activo, texto }     aviso en la portada
//   evaluaciones, clases                     cronograma editado (reemplaza al de LIBRO)
//   preguntas          { id: {campos editados…, eliminada} }
//   preguntasNuevas    [ {pregunta completa} ]
//   ejercicios         { id: { oculto, enunciado, aviso, resolucion, respuestas: [...] } }
//   textos             { 'u1-teoria.html': { índice: { html, original } } }
//
// Dónde se guarda:
//   - La configuración PUBLICADA está en js/curso-config.js (window.CURSO_PUBLICADO).
//   - Los cambios del profesor se guardan como BORRADOR en este navegador hasta que los publica.
//     Si hay borrador, este navegador lo usa; los demás ven la versión publicada.
//   Cuando el libro tenga usuarios y un servidor, solo hay que cambiar leer/guardar/publicar.

const Curso = (() => {
  const CLAVE_BORRADOR = 'derivados:curso-borrador';
  const CLAVE_MODO = 'derivados:modo';
  const leerLS = (k, def) => { try { const v = localStorage.getItem(k); return v === null ? def : JSON.parse(v); } catch (e) { return def; } };
  const escribirLS = (k, v) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } };

  function normalizar(c) {
    c = JSON.parse(JSON.stringify(c || {}));
    c.version = 1;
    c.ocultas = Object.assign({ unidades: [], paginas: [], generales: [], examenes: [] }, c.ocultas || {});
    c.aviso = Object.assign({ activo: false, texto: '' }, c.aviso || {});
    c.preguntas = c.preguntas || {};
    c.preguntasNuevas = c.preguntasNuevas || [];
    c.ejercicios = c.ejercicios || {};
    c.textos = c.textos || {};
    return c;
  }

  const publicado = normalizar(window.CURSO_PUBLICADO || {});
  const borrador = leerLS(CLAVE_BORRADOR, null);
  let cfg = normalizar(borrador || publicado);

  // ---------- Modo ----------
  const modo = () => leerLS(CLAVE_MODO, null);              // null = todavía no eligió
  const esProfesor = () => modo() === 'profesor';
  // Más adelante: pedir usuario y clave antes de pasar a profesor.
  function cambiarModo(m) { escribirLS(CLAVE_MODO, m); location.reload(); }

  // ---------- Visibilidad ----------
  const pagina = () => (location.pathname.split('/').pop() || 'index.html');
  const visible = {
    unidad: id => !cfg.ocultas.unidades.includes(id),
    pagina: (u, s) => !cfg.ocultas.unidades.includes(u) && !cfg.ocultas.paginas.includes(`${u}-${s}`),
    general: id => !cfg.ocultas.generales.includes(id),
    examen: id => !cfg.ocultas.examenes.includes(id),
  };
  // Lo que se muestra en pantalla: el profesor ve todo (marcado como oculto); el alumno, solo lo visible.
  const mostrar = {
    unidad: id => esProfesor() || visible.unidad(id),
    pagina: (u, s) => esProfesor() || visible.pagina(u, s),
    general: id => esProfesor() || visible.general(id),
    examen: id => esProfesor() || visible.examen(id),
  };

  // Ajusta el objeto LIBRO (menú, pestañas, cronograma). Lo llama comun.js antes de dibujar.
  function ajustarLibro(L) {
    if (Array.isArray(cfg.evaluaciones) && cfg.evaluaciones.length) L.evaluaciones = cfg.evaluaciones;
    if (Array.isArray(cfg.clases) && cfg.clases.length) L.clases = cfg.clases;
    L.unidades.forEach(u => {
      u.oculta = !visible.unidad(u.id);
      u.paginas.forEach(p => { p.oculta = !visible.pagina(u.id, p.id); });
    });
    L.generales.forEach(g => { g.oculta = !visible.general(g.id); });
    if (!esProfesor()) {
      L.unidades = L.unidades.filter(u => !u.oculta);
      L.unidades.forEach(u => { u.paginas = u.paginas.filter(p => !p.oculta); });
      L.generales = L.generales.filter(g => !g.oculta);
    }
  }

  // ---------- Banco de preguntas ----------
  const originales = {};
  const esPanel = () => document.body && document.body.dataset.pagina === 'profesor';
  // Aplica las ediciones del profesor. Devuelve null si la pregunta no se muestra.
  function ajustarPregunta(p) {
    originales[p.id] = p;
    const o = cfg.preguntas[p.id];
    const q = o ? Object.assign({}, p, o, { editada: true }) : p;
    if (esPanel()) return q;
    if (q.eliminada) return null;
    if (!mostrar.unidad('u' + q.unidad)) return null;
    return q;
  }
  const preguntasNuevas = () => cfg.preguntasNuevas
    .filter(q => esPanel() || (!q.eliminada && q.enunciado && q.correcta && (q.incorrectas || []).filter(Boolean).length === 3 && mostrar.unidad('u' + q.unidad)))
    .map(q => Object.assign({ fuente: 'Profesor', nueva: true }, q));

  // ---------- Ejercicios ----------
  function ajustarEjercicios(lista) {
    return lista.map(e => {
      const o = cfg.ejercicios[e.id];
      if (!o) return e;
      const x = Object.assign({}, e, { editado: true });
      ['enunciado', 'aviso', 'resolucion', 'titulo'].forEach(k => { if (o[k] !== undefined) x[k] = o[k]; });
      if (o.oculto) x.oculto = true;
      if (Array.isArray(o.respuestas) && e.campos) {
        x.campos = e.campos.map((c, i) => (o.respuestas[i] === undefined || o.respuestas[i] === null ? c : Object.assign({}, c, { respuesta: o.respuestas[i], errores: [] })));
      }
      return x;
    }).filter(e => esPanel() || !e.oculto);
  }

  // ---------- Guardar, publicar ----------
  const config = () => cfg;
  function guardar(nueva) { cfg = normalizar(nueva); cfg.actualizado = new Date().toISOString(); escribirLS(CLAVE_BORRADOR, cfg); }
  const hayCambios = () => JSON.stringify(normalizar(Object.assign({}, cfg, { actualizado: undefined }))) !== JSON.stringify(normalizar(Object.assign({}, publicado, { actualizado: undefined })));
  function descartarBorrador() { escribirLS(CLAVE_BORRADOR, null); cfg = normalizar(publicado); }
  const archivoPublicable = () => `// Configuración publicada del curso: lo que ven los alumnos.\n// La genera el panel del profesor (profesor.html → Publicar). No hace falta editarla a mano.\nwindow.CURSO_PUBLICADO = ${JSON.stringify(cfg, null, 2)};\n`;

  // ---------- Textos editables ----------
  // Bloques de texto de la página que el profesor puede editar. Se numeran siempre igual,
  // sobre el HTML original, antes de que comun.js dibuje fórmulas y componentes.
  const SELECTOR = 'h1, h2, h3, h4, p, li, th, td, figcaption, dt, dd';
  const EXCLUIR = '.mini-sim, .quiz-rapido, .widget, #ejercitacion, #encabezado, .ej-diagrama-swap, .ej-cuadro-margenes, svg, script, .diagrama-swap, .grafico-payoff, [data-no-editable]';
  const bloques = [];
  const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return String(h); };

  function prepararTextos() {
    const raiz = document.querySelector('main');
    if (!raiz) return;
    const todos = [...raiz.querySelectorAll(SELECTOR)].filter(el => !el.closest(EXCLUIR) && !el.querySelector(SELECTOR));
    const propios = cfg.textos[pagina()] || {};
    todos.forEach((el, i) => {
      const original = el.innerHTML;
      bloques.push({ el, indice: i, original });
      const o = propios[i];
      if (o && o.original === hash(original)) { el.innerHTML = o.html; el.dataset.editado = '1'; }
      else if (o) el.dataset.desactualizado = '1';
    });
  }

  function guardarTexto(indice, html) {
    const b = bloques[indice];
    const c = normalizar(cfg);
    c.textos[pagina()] = c.textos[pagina()] || {};
    if (html === null || html === b.original) delete c.textos[pagina()][indice];
    else c.textos[pagina()][indice] = { html, original: hash(b.original), texto: b.original.replace(/<[^>]+>/g, '').slice(0, 80) };
    if (!Object.keys(c.textos[pagina()]).length) delete c.textos[pagina()];
    guardar(c);
  }

  // ---------- Bloqueo de lo oculto (alumnos) ----------
  function bloquearSiOculto() {
    const b = document.body.dataset;
    let oculto = false, motivo = '';
    if (b.unidad) {
      if (!visible.unidad(b.unidad)) { oculto = true; motivo = 'Esta unidad todavía no está disponible.'; }
      else if (b.seccion && !visible.pagina(b.unidad, b.seccion)) { oculto = true; motivo = 'Esta sección todavía no está disponible.'; }
    } else if (b.pagina && b.pagina !== 'portada' && b.pagina !== 'profesor' && !visible.general(b.pagina)) {
      oculto = true; motivo = 'Esta sección no está disponible por el momento.';
    }
    if (!oculto) return;
    if (esProfesor()) { document.body.classList.add('pagina-oculta'); return; }
    // Se esconde el contenido (sin borrarlo, para que los scripts de la página no fallen) y se muestra un aviso.
    const main = document.querySelector('main');
    if (main) {
      main.hidden = true;
      const aviso = document.createElement('main');
      aviso.className = 'pagina';
      aviso.innerHTML = `<article class="contenido"><div class="aviso-oculto"><h1>No disponible</h1><p>${motivo} El docente la va a habilitar cuando corresponda.</p><p><a class="btn-primario" style="text-decoration:none" href="index.html">Volver al inicio</a></p></div></article>`;
      main.after(aviso);
    }
    const pie = document.getElementById('pie-navegacion');
    if (pie) pie.hidden = true;
    window.__paginaBloqueada = true;
  }

  // ---------- Barra del profesor y editor de textos ----------
  function barraProfesor() {
    if (!esProfesor()) return;
    const barra = document.createElement('div');
    barra.className = 'barra-profesor';
    const editable = bloques.length > 0 && !esPanel();
    barra.innerHTML = `<span class="bp-modo">Modo profesor</span>
      ${document.body.classList.contains('pagina-oculta') ? '<span class="bp-aviso">Los alumnos no ven esta página</span>' : ''}
      ${hayCambios() ? '<a class="bp-aviso" href="profesor.html#publicar">Hay cambios sin publicar</a>' : ''}
      ${editable ? '<button type="button" class="bp-btn" data-accion="editar" aria-pressed="false">Editar textos</button>' : ''}
      <a class="bp-btn" href="profesor.html">Panel del profesor</a>
      <button type="button" class="bp-btn" data-accion="alumno">Ver como alumno</button>`;
    document.body.appendChild(barra);
    barra.addEventListener('click', ev => {
      const b = ev.target.closest('[data-accion]');
      if (!b) return;
      if (b.dataset.accion === 'alumno') cambiarModo('alumno');
      if (b.dataset.accion === 'editar') {
        const on = !document.body.classList.contains('edicion-activa');
        document.body.classList.toggle('edicion-activa', on);
        b.setAttribute('aria-pressed', String(on));
        b.textContent = on ? 'Terminar de editar' : 'Editar textos';
      }
    });
    // En modo edición, un clic en un bloque abre el editor.
    document.addEventListener('click', ev => {
      if (!document.body.classList.contains('edicion-activa')) return;
      if (ev.target.closest('.barra-profesor, .editor-texto')) return;
      const b = bloques.find(x => x.el === ev.target.closest(SELECTOR) || x.el.contains(ev.target));
      if (!b) return;
      ev.preventDefault(); ev.stopPropagation();
      abrirEditor(b);
    }, true);
  }

  function abrirEditor(b) {
    const actual = (cfg.textos[pagina()] || {})[b.indice];
    const fuente = actual && actual.original === hash(b.original) ? actual.html : b.original;
    const dlg = document.createElement('dialog');
    dlg.className = 'editor-texto';
    dlg.innerHTML = `<form method="dialog">
        <h3>Editar texto</h3>
        <p class="ayuda">Escribí como en un procesador de texto. Seleccioná una palabra y tocá <b>N</b> para negrita o <i>C</i> para cursiva. Las fórmulas van entre \\( y \\), por ejemplo \\(F_0 = S_0 e^{rT}\\): abajo ves cómo quedan.</p>
        <div class="editor-barra">
          <button type="button" class="btn" data-cmd="bold" title="Negrita"><b>N</b></button>
          <button type="button" class="btn" data-cmd="italic" title="Cursiva"><i>C</i></button>
          <span style="flex:1"></span>
          <button type="button" class="btn" data-html title="Para usuarios avanzados">Ver HTML</button>
        </div>
        <div class="editor-visual" contenteditable="true" spellcheck="true"></div>
        <textarea rows="8" spellcheck="false" hidden></textarea>
        <div class="editor-vista"><p class="ayuda" style="margin:0 0 4px">Así se va a ver</p><div class="ev-contenido"></div></div>
        <div class="botones">
          <button class="btn-primario" value="guardar">Guardar</button>
          ${actual ? '<button class="btn" value="restaurar">Volver al texto original</button>' : ''}
          <button class="btn" value="cancelar">Cancelar</button>
        </div>
      </form>`;
    document.body.appendChild(dlg);
    const ta = dlg.querySelector('textarea'), visual = dlg.querySelector('.editor-visual'), vista = dlg.querySelector('.ev-contenido');
    visual.innerHTML = fuente.trim();
    ta.value = fuente.trim();
    const previa = () => { vista.innerHTML = ta.value; if (typeof renderFormulas === 'function') renderFormulas(vista); };
    visual.addEventListener('input', () => { ta.value = visual.innerHTML; previa(); });
    ta.addEventListener('input', () => { visual.innerHTML = ta.value; previa(); });
    dlg.querySelectorAll('[data-cmd]').forEach(b => b.addEventListener('click', () => { visual.focus(); document.execCommand(b.dataset.cmd); ta.value = visual.innerHTML; previa(); }));
    dlg.querySelector('[data-html]').addEventListener('click', ev => {
      const verHtml = ta.hidden;
      ta.hidden = !verHtml; visual.hidden = verHtml;
      ev.target.textContent = verHtml ? 'Ver como texto' : 'Ver HTML';
    });
    previa();
    dlg.addEventListener('close', () => {
      if (dlg.returnValue === 'guardar') { guardarTexto(b.indice, ta.value.trim()); location.reload(); }
      else if (dlg.returnValue === 'restaurar') { guardarTexto(b.indice, null); location.reload(); }
      dlg.remove();
    });
    dlg.showModal();
    visual.focus();
  }

  // ---------- Botón de modo en el encabezado y elección inicial ----------
  function botonModo() {
    return `<button class="btn-barra" type="button" id="btn-modo" title="Cambiar entre modo alumno y modo profesor">${esProfesor() ? 'Profesor' : 'Alumno'}</button>`;
  }
  function vincularBotonModo() {
    const b = document.getElementById('btn-modo');
    if (b) b.addEventListener('click', () => cambiarModo(esProfesor() ? 'alumno' : 'profesor'));
  }

  // ---------- Arranque (el DOM ya está: los scripts van al final del body) ----------
  bloquearSiOculto();
  if (!window.__paginaBloqueada) prepararTextos();

  return {
    modo, esProfesor, cambiarModo, visible, mostrar, ajustarLibro, ajustarPregunta, preguntasNuevas, ajustarEjercicios,
    config, guardar, hayCambios, descartarBorrador, archivoPublicable, publicado: () => publicado, originales,
    bloques, guardarTexto, barraProfesor, botonModo, vincularBotonModo, normalizar,
  };
})();
window.Curso = Curso; // comun.js y los demás scripts lo buscan como window.Curso
