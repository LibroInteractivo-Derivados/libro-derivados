// Panel del profesor: visibilidad, calendario y aviso, preguntas, ejercicios, textos editados y publicación.
// Todo cambio se guarda al instante como borrador en este navegador (Curso.guardar).

(function () {
  const $id = id => document.getElementById(id);
  const raiz = $id('contenido-panel');
  const esc = s => String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const ROMANOS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  const clonar = o => JSON.parse(JSON.stringify(o));

  // Sin modo profesor: el panel no se muestra.
  if (!Curso.esProfesor()) {
    $id('panel').innerHTML = `<h1>Panel del profesor</h1>
      <div class="aviso-oculto" style="padding:30px 0"><p>Este panel es para docentes. Para usarlo, entrá en modo profesor.</p>
      <p><button class="btn-primario" type="button" id="entrar-prof">Entrar como profesor</button></p>
      <p class="ayuda">Más adelante este paso va a pedir usuario y clave.</p></div>`;
    $id('entrar-prof').addEventListener('click', () => Curso.cambiarModo('profesor'));
    return;
  }

  let cfg = clonar(Curso.config());
  const guardar = () => { Curso.guardar(cfg); cfg = clonar(Curso.config()); estado(); };

  function estado() {
    $id('estado-panel').innerHTML = Curso.hayCambios()
      ? '<div class="estado-panel pendiente">Tenés cambios guardados en este navegador que los alumnos todavía no ven. <a href="#publicar" data-ir="publicar">Publicarlos</a></div>'
      : '<div class="estado-panel ok">Todo lo que ves está publicado: los alumnos ven lo mismo.</div>';
  }

  const PESTANAS = [
    ['visibilidad', 'Qué ven los alumnos'], ['calendario', 'Calendario y aviso'], ['preguntas', 'Preguntas'],
    ['ejercicios', 'Ejercicios'], ['textos', 'Textos editados'], ['publicar', 'Publicar'],
  ];
  raiz.innerHTML = `<div class="tabs" role="tablist">${PESTANAS.map(([id, t]) => `<button type="button" data-tab-panel="${id}">${t}</button>`).join('')}</div>
    ${PESTANAS.map(([id]) => `<section id="p-${id}" class="seccion-panel" hidden></section>`).join('')}`;

  function abrir(id) {
    PESTANAS.forEach(([p]) => { $id('p-' + p).hidden = p !== id; });
    raiz.querySelectorAll('[data-tab-panel]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tabPanel === id)));
    RENDER[id]();
    history.replaceState(null, '', '#' + id);
  }
  raiz.addEventListener('click', ev => { const b = ev.target.closest('[data-tab-panel]'); if (b) abrir(b.dataset.tabPanel); });
  document.addEventListener('click', ev => { const a = ev.target.closest('[data-ir]'); if (a) { ev.preventDefault(); abrir(a.dataset.ir); } });

  // ======================================================================
  // 1. Qué ven los alumnos
  // ======================================================================
  function renderVisibilidad() {
    const o = cfg.ocultas;
    const chk = (lista, valor, etiqueta, extra = '') => `<label class="check-vis"><input type="checkbox" data-lista="${lista}" value="${valor}" ${o[lista].includes(valor) ? '' : 'checked'} ${extra}> ${etiqueta}</label>`;
    const filas = LIBRO.unidades.map(u => `<tr class="${o.unidades.includes(u.id) ? 'apagada' : ''}">
        <td><span class="punto-u" style="background:var(--${u.id})"></span><b>Unidad ${u.numero}</b> · ${esc(u.nombre)}</td>
        <td>${chk('unidades', u.id, 'Visible')}</td>
        <td>${u.paginas.map(p => chk('paginas', `${u.id}-${p.id}`, esc(p.nombre), o.unidades.includes(u.id) ? 'disabled' : '')).join('')}</td>
      </tr>`).join('');
    const generales = LIBRO.generales.map(g => chk('generales', g.id, esc(g.nombre))).join('');
    const examenes = [['p1', 'Primer parcial'], ['p2', 'Segundo parcial'], ['final', 'Examen final']].map(([id, n]) => chk('examenes', id, n)).join('');
    $id('p-visibilidad').innerHTML = `
      <p class="widget-intro">Destildá lo que los alumnos todavía no tienen que ver (por ejemplo, una unidad que no se dio en clase). Lo oculto desaparece del menú, de la portada, de la batalla y de los simulacros. Vos lo seguís viendo, tachado.</p>
      <div class="tabla-wrap"><table class="tabla tabla-vis"><thead><tr><th>Unidad</th><th>¿La ven?</th><th>Secciones visibles</th></tr></thead><tbody>${filas}</tbody></table></div>
      <h3>Páginas generales</h3><div class="grupo-checks">${generales}</div>
      <h3>Exámenes del simulacro</h3><div class="grupo-checks">${examenes}</div>
      <p class="ayuda">Un examen del simulacro solo usa preguntas de las unidades visibles.</p>
      <div class="botones"><button class="btn" type="button" id="vis-todo">Mostrar todo</button></div>`;
    $id('p-visibilidad').onchange = ev => {
      const c = ev.target.closest('input[data-lista]');
      if (!c) return;
      const lista = cfg.ocultas[c.dataset.lista];
      const i = lista.indexOf(c.value);
      if (c.checked && i >= 0) lista.splice(i, 1);
      if (!c.checked && i < 0) lista.push(c.value);
      guardar(); renderVisibilidad();
    };
    $id('vis-todo').onclick = () => { cfg.ocultas = { unidades: [], paginas: [], generales: [], examenes: [] }; guardar(); renderVisibilidad(); };
  }

  // ======================================================================
  // 2. Calendario y aviso
  // ======================================================================
  function renderCalendario() {
    const evals = cfg.evaluaciones && cfg.evaluaciones.length ? cfg.evaluaciones : clonar(LIBRO.evaluaciones);
    const clases = cfg.clases && cfg.clases.length ? cfg.clases : clonar(LIBRO.clases);
    $id('p-calendario').innerHTML = `
      <h3>Aviso en la portada</h3>
      <label class="check-vis"><input type="checkbox" id="aviso-activo" ${cfg.aviso.activo ? 'checked' : ''}> Mostrar el aviso</label>
      <textarea id="aviso-texto" rows="3" class="campo-largo" placeholder="Por ejemplo: el viernes no hay clase; el simulacro del primer parcial ya está habilitado.">${esc(cfg.aviso.texto)}</textarea>
      <h3>Evaluaciones</h3>
      <div class="tabla-wrap"><table class="tabla"><thead><tr><th>Evaluación</th><th>Fecha</th></tr></thead><tbody>
        ${evals.map((e, i) => `<tr><td><input type="text" data-ev="${i}" data-campo="nombre" value="${esc(e.nombre)}"></td><td><input type="date" data-ev="${i}" data-campo="fecha" value="${esc(e.fecha)}"></td></tr>`).join('')}
      </tbody></table></div>
      <h3>Clases</h3>
      <div class="tabla-wrap"><table class="tabla"><thead><tr><th>Clase</th><th>Fecha</th><th>Tema</th></tr></thead><tbody>
        ${clases.map((c, i) => `<tr><td>${c.n ?? '—'}</td><td><input type="date" data-cl="${i}" data-campo="fecha" value="${esc(c.fecha)}"></td><td><input type="text" class="campo-largo" data-cl="${i}" data-campo="tema" value="${esc(c.tema)}"></td></tr>`).join('')}
      </tbody></table></div>
      <div class="botones"><button class="btn" type="button" id="cal-restaurar">Volver al cronograma original</button></div>
      <p class="ayuda">La portada y la página del programa usan estas fechas para mostrar la próxima clase y la próxima evaluación.</p>`;
    const sec = $id('p-calendario');
    sec.oninput = ev => {
      const t = ev.target;
      if (t.id === 'aviso-texto') { cfg.aviso.texto = t.value; guardar(); return; }
      if (t.dataset.ev !== undefined) { cfg.evaluaciones = evals; evals[+t.dataset.ev][t.dataset.campo] = t.value; guardar(); }
      if (t.dataset.cl !== undefined) { cfg.clases = clases; clases[+t.dataset.cl][t.dataset.campo] = t.value; guardar(); }
    };
    sec.onchange = ev => { if (ev.target.id === 'aviso-activo') { cfg.aviso.activo = ev.target.checked; guardar(); } };
    $id('cal-restaurar').onclick = () => {
      if (!confirm('¿Volver al cronograma original? Se pierden las fechas y temas que cambiaste.')) return;
      delete cfg.evaluaciones; delete cfg.clases; guardar(); location.reload();
    };
  }

  // ======================================================================
  // 3. Preguntas
  // ======================================================================
  const CAMPOS_PREG = ['tema', 'tipo', 'dificultad', 'enunciado', 'correcta', 'incorrectas', 'explicacion', 'trampas', 'eliminada'];
  let filtroU = '', filtroTexto = '', filtroEstado = '', abierta = null;

  function estadoPregunta(q) {
    if (q.nueva) return q.eliminada ? ['eliminada', 'Nueva · eliminada'] : ['nueva', 'Nueva'];
    const o = cfg.preguntas[q.id];
    if (o && o.eliminada) return ['eliminada', 'Eliminada'];
    if (o) return ['editada', 'Editada'];
    return ['', ''];
  }

  function renderPreguntas() {
    const lista = BANCO.filter(q => (!filtroU || String(q.unidad) === filtroU)
      && (!filtroTexto || (q.id + ' ' + q.tema + ' ' + q.enunciado).toLowerCase().includes(filtroTexto.toLowerCase()))
      && (!filtroEstado || estadoPregunta(q)[0] === filtroEstado));
    $id('p-preguntas').innerHTML = `
      <p class="widget-intro">Estas son las ${BANCO.length} preguntas de opción múltiple que usan la autoevaluación, la batalla y los simulacros. Tocá una para editarla.</p>
      <div class="filtros-ej">
        <label class="check" style="font-weight:600">Unidad <select id="pq-u"><option value="">Todas</option>${[1, 2, 3, 4, 5, 6, 7, 8].map(n => `<option value="${n}" ${filtroU === String(n) ? 'selected' : ''}>Unidad ${ROMANOS[n]}</option>`).join('')}</select></label>
        <label class="check" style="font-weight:600">Estado <select id="pq-e"><option value="">Todas</option><option value="editada" ${filtroEstado === 'editada' ? 'selected' : ''}>Editadas</option><option value="eliminada" ${filtroEstado === 'eliminada' ? 'selected' : ''}>Eliminadas</option><option value="nueva" ${filtroEstado === 'nueva' ? 'selected' : ''}>Nuevas</option></select></label>
        <input type="search" id="pq-t" placeholder="Buscar por texto o ID" value="${esc(filtroTexto)}">
        <button class="btn-primario" type="button" id="pq-nueva">Nueva pregunta</button>
      </div>
      <p class="ayuda">${lista.length} preguntas con estos filtros.</p>
      <div class="lista-items">${lista.map(q => {
        const [cls, txt] = estadoPregunta(q);
        return `<div class="item ${cls}" data-id="${esc(q.id)}">
          <button type="button" class="item-cabecera" data-abrir="${esc(q.id)}">
            <span class="ej-id">${esc(q.id)}</span><span class="chip">U ${ROMANOS[q.unidad]}</span><span class="chip">${esc(q.tipo)}</span>
            <span class="item-texto">${esc(q.enunciado)}</span>${txt ? `<span class="chip ${cls === 'eliminada' ? 'neg' : 'aviso'}">${txt}</span>` : ''}
          </button>
          ${abierta === q.id ? editorPregunta(q) : ''}
        </div>`;
      }).join('') || '<p class="vacio">No hay preguntas con esos filtros.</p>'}</div>`;
    const sec = $id('p-preguntas');
    $id('pq-u').onchange = e => { filtroU = e.target.value; renderPreguntas(); };
    $id('pq-e').onchange = e => { filtroEstado = e.target.value; renderPreguntas(); };
    $id('pq-t').oninput = e => { filtroTexto = e.target.value; clearTimeout(sec._t); sec._t = setTimeout(() => { renderPreguntas(); $id('pq-t').focus(); $id('pq-t').setSelectionRange(filtroTexto.length, filtroTexto.length); }, 250); };
    $id('pq-nueva').onclick = nuevaPregunta;
    sec.onclick = ev => {
      const a = ev.target.closest('[data-abrir]');
      if (a) { abierta = abierta === a.dataset.abrir ? null : a.dataset.abrir; renderPreguntas(); return; }
      const b = ev.target.closest('[data-pq]');
      if (b) accionPregunta(b.dataset.pq, b.closest('.item').dataset.id);
    };
  }

  function editorPregunta(q) {
    const orig = Curso.originales[q.id];
    return `<div class="item-editor">
      <div class="grilla-campos">
        <label>Tema <input type="text" data-c="tema" value="${esc(q.tema)}"></label>
        <label>Tipo <select data-c="tipo"><option ${q.tipo === 'teórica' ? 'selected' : ''}>teórica</option><option ${q.tipo === 'práctica' ? 'selected' : ''}>práctica</option></select></label>
        <label>Dificultad <select data-c="dificultad">${[1, 2, 3].map(d => `<option value="${d}" ${+q.dificultad === d ? 'selected' : ''}>${['', 'Básica', 'Intermedia', 'Avanzada'][d]}</option>`).join('')}</select></label>
        ${q.nueva ? `<label>Unidad <select data-c="unidad">${[1, 2, 3, 4, 5, 6, 7, 8].map(n => `<option value="${n}" ${+q.unidad === n ? 'selected' : ''}>${ROMANOS[n]}</option>`).join('')}</select></label>` : ''}
      </div>
      <label>Enunciado <textarea data-c="enunciado" rows="3">${esc(q.enunciado)}</textarea></label>
      <label class="correcta">Respuesta correcta <textarea data-c="correcta" rows="2">${esc(q.correcta)}</textarea></label>
      ${[0, 1, 2].map(i => `<label>Opción incorrecta ${i + 1} <textarea data-c="inc${i}" rows="2">${esc(q.incorrectas[i])}</textarea></label>`).join('')}
      <label>Explicación (se muestra después de responder) <textarea data-c="explicacion" rows="3">${esc(q.explicacion)}</textarea></label>
      <label>Trampas (opcional: por qué alguien elegiría cada opción incorrecta) <textarea data-c="trampas" rows="2">${esc(q.trampas)}</textarea></label>
      <p class="ayuda">Las fórmulas van entre \\( y \\). En el libro las cuatro opciones se muestran mezcladas al azar.</p>
      <div class="botones">
        <button class="btn-primario" type="button" data-pq="guardar">Guardar</button>
        ${q.nueva ? '' : (cfg.preguntas[q.id] && !cfg.preguntas[q.id].eliminada ? '<button class="btn" type="button" data-pq="restaurar">Volver a la original</button>' : '')}
        ${(q.nueva ? q.eliminada : (cfg.preguntas[q.id] || {}).eliminada) ? '<button class="btn" type="button" data-pq="incluir">Volver a incluirla</button>' : '<button class="btn" type="button" data-pq="eliminar">Eliminar del libro</button>'}
        <button class="btn" type="button" data-pq="cerrar">Cerrar</button>
      </div>
      ${orig && cfg.preguntas[q.id] ? `<details class="desplegable"><summary>Ver la versión original</summary><p><b>Enunciado:</b> ${esc(orig.enunciado)}</p><p><b>Correcta:</b> ${esc(orig.correcta)}</p><p><b>Incorrectas:</b> ${orig.incorrectas.map(esc).join(' · ')}</p></details>` : ''}
    </div>`;
  }

  function leerEditor(item) {
    const v = c => { const el = item.querySelector(`[data-c="${c}"]`); return el ? el.value.trim() : undefined; };
    return {
      tema: v('tema'), tipo: v('tipo'), dificultad: +v('dificultad'), enunciado: v('enunciado'), correcta: v('correcta'),
      incorrectas: [v('inc0'), v('inc1'), v('inc2')], explicacion: v('explicacion'), trampas: v('trampas'),
      ...(v('unidad') ? { unidad: +v('unidad') } : {}),
    };
  }

  function validar(d) {
    const ops = [d.correcta, ...d.incorrectas];
    if (!d.enunciado) return 'Falta el enunciado.';
    if (ops.some(o => !o)) return 'Completá la respuesta correcta y las tres incorrectas.';
    if (new Set(ops).size !== 4) return 'Las cuatro opciones tienen que ser distintas.';
    return '';
  }

  function accionPregunta(accion, id) {
    const item = $id('p-preguntas').querySelector(`.item[data-id="${CSS.escape(id)}"]`);
    const nuevaIdx = cfg.preguntasNuevas.findIndex(q => q.id === id);
    if (accion === 'cerrar') { abierta = null; renderPreguntas(); return; }
    if (accion === 'guardar') {
      const d = leerEditor(item), err = validar(d);
      if (err) { alert(err); return; }
      if (nuevaIdx >= 0) Object.assign(cfg.preguntasNuevas[nuevaIdx], d);
      else {
        const orig = Curso.originales[id], cambios = {};
        CAMPOS_PREG.forEach(c => { if (c !== 'eliminada' && d[c] !== undefined && JSON.stringify(d[c]) !== JSON.stringify(c === 'dificultad' ? +orig[c] : (orig[c] ?? ''))) cambios[c] = d[c]; });
        if ((cfg.preguntas[id] || {}).eliminada) cambios.eliminada = true;
        if (Object.keys(cambios).length) cfg.preguntas[id] = cambios; else delete cfg.preguntas[id];
      }
    }
    if (accion === 'restaurar') delete cfg.preguntas[id];
    if (accion === 'eliminar' || accion === 'incluir') {
      const elim = accion === 'eliminar';
      if (nuevaIdx >= 0) {
        if (elim && confirm('¿Borrar esta pregunta nueva? No se puede deshacer.')) cfg.preguntasNuevas.splice(nuevaIdx, 1);
      } else {
        cfg.preguntas[id] = Object.assign({}, cfg.preguntas[id], { eliminada: elim });
        if (!elim) { delete cfg.preguntas[id].eliminada; if (!Object.keys(cfg.preguntas[id]).length) delete cfg.preguntas[id]; }
      }
    }
    guardar();
    recargarBanco();
    renderPreguntas();
  }

  // Vuelve a aplicar las ediciones al banco que ya está en memoria (sin recargar la página).
  function recargarBanco() {
    const ids = new Set();
    for (let i = BANCO.length - 1; i >= 0; i--) if (BANCO[i].nueva) BANCO.splice(i, 1);
    BANCO.forEach((q, i) => {
      const orig = Curso.originales[q.id];
      if (!orig) return;
      ids.add(q.id);
      const o = cfg.preguntas[q.id];
      BANCO[i] = o ? Object.assign({}, orig, o, { editada: true }) : orig;
    });
    cfg.preguntasNuevas.forEach(q => BANCO.push(Object.assign({ fuente: 'Profesor', nueva: true }, q)));
  }

  function nuevaPregunta() {
    const u = +(filtroU || 1);
    const id = `U${u}-N${Date.now().toString(36).slice(-5).toUpperCase()}`;
    cfg.preguntasNuevas.push({ id, unidad: u, tema: 'Nuevo', tipo: 'teórica', dificultad: 1, fuente: 'Profesor', enunciado: '', correcta: '', incorrectas: ['', '', ''], explicacion: '', trampas: '' });
    // Se guarda recién cuando el profesor completa los campos y toca Guardar.
    BANCO.push(Object.assign({ nueva: true }, cfg.preguntasNuevas[cfg.preguntasNuevas.length - 1]));
    abierta = id; filtroTexto = ''; filtroEstado = '';
    renderPreguntas();
    const item = $id('p-preguntas').querySelector(`.item[data-id="${CSS.escape(id)}"]`);
    if (item) { item.scrollIntoView({ block: 'center' }); item.querySelector('[data-c="enunciado"]').focus(); }
  }

  // ======================================================================
  // 4. Ejercicios
  // ======================================================================
  const EJ_ORIG = (window.EJERCICIOS || []).slice();
  let filtroEjU = '1', ejAbierto = null;

  function renderEjercicios() {
    const lista = Curso.ajustarEjercicios(EJ_ORIG.filter(e => e.id.startsWith(`U${filtroEjU}-`)));
    $id('p-ejercicios').innerHTML = `
      <p class="widget-intro">Los ejercicios con corrección automática de cada unidad. Podés ocultar un ejercicio, corregir su enunciado o su resolución, y cambiar las respuestas que se aceptan como correctas.</p>
      <div class="filtros-ej"><label class="check" style="font-weight:600">Unidad <select id="pe-u">${[1, 2, 3, 4, 5, 6, 7, 8].map(n => `<option value="${n}" ${filtroEjU === String(n) ? 'selected' : ''}>Unidad ${ROMANOS[n]}</option>`).join('')}</select></label></div>
      <div class="lista-items">${lista.map(e => `<div class="item ${e.oculto ? 'eliminada' : e.editado ? 'editada' : ''}" data-id="${esc(e.id)}">
          <button type="button" class="item-cabecera" data-abrir="${esc(e.id)}"><span class="ej-id">${esc(e.id)}</span><span class="item-texto">${esc(e.titulo)}</span>
            ${e.oculto ? '<span class="chip neg">Oculto</span>' : e.editado ? '<span class="chip aviso">Editado</span>' : ''}</button>
          ${ejAbierto === e.id ? editorEjercicio(e) : ''}
        </div>`).join('')}</div>`;
    $id('pe-u').onchange = ev => { filtroEjU = ev.target.value; ejAbierto = null; renderEjercicios(); };
    $id('p-ejercicios').onclick = ev => {
      const a = ev.target.closest('[data-abrir]');
      if (a) { ejAbierto = ejAbierto === a.dataset.abrir ? null : a.dataset.abrir; renderEjercicios(); return; }
      const b = ev.target.closest('[data-pe]');
      if (b) accionEjercicio(b.dataset.pe, b.closest('.item').dataset.id);
    };
  }

  function editorEjercicio(e) {
    const orig = EJ_ORIG.find(x => x.id === e.id);
    const o = cfg.ejercicios[e.id] || {};
    const campos = (e.campos || []).map((c, i) => {
      const valorOrig = orig.campos[i].respuesta;
      const control = c.opciones
        ? `<select data-resp="${i}">${c.opciones.map(op => `<option ${op === c.respuesta ? 'selected' : ''}>${esc(op)}</option>`).join('')}</select>`
        : `<input type="text" inputmode="decimal" data-resp="${i}" value="${esc(String(c.respuesta).replace('.', ','))}">`;
      return `<tr><td>${esc(c.etiqueta)}</td><td>${control}</td><td class="num">${typeof valorOrig === 'number' ? fmt(valorOrig, 4) : esc(valorOrig)}</td></tr>`;
    }).join('');
    return `<div class="item-editor">
      <label class="check-vis"><input type="checkbox" data-oculto ${o.oculto ? 'checked' : ''}> Ocultar este ejercicio a los alumnos</label>
      <label>Título <input type="text" data-e="titulo" value="${esc(e.titulo)}"></label>
      <label>Enunciado (HTML) <textarea data-e="enunciado" rows="5">${esc(e.enunciado)}</textarea></label>
      <label>Aviso (opcional) <textarea data-e="aviso" rows="2">${esc(e.aviso || '')}</textarea></label>
      ${campos ? `<p style="margin:10px 0 4px;font-weight:600">Respuestas que se aceptan como correctas</p><div class="tabla-wrap"><table class="tabla compacta"><thead><tr><th>Campo</th><th>Respuesta</th><th class="num">Original</th></tr></thead><tbody>${campos}</tbody></table></div>` : ''}
      <label>Resolución (HTML) <textarea data-e="resolucion" rows="6">${esc(e.resolucion || '')}</textarea></label>
      <p class="ayuda">Si cambiás un dato del enunciado, revisá también las respuestas y la resolución: en el libro original se calculan con fórmulas, acá quedan fijas.</p>
      <div class="botones">
        <button class="btn-primario" type="button" data-pe="guardar">Guardar</button>
        ${cfg.ejercicios[e.id] ? '<button class="btn" type="button" data-pe="restaurar">Volver al original</button>' : ''}
        <button class="btn" type="button" data-pe="cerrar">Cerrar</button>
      </div>
    </div>`;
  }

  function accionEjercicio(accion, id) {
    if (accion === 'cerrar') { ejAbierto = null; renderEjercicios(); return; }
    if (accion === 'restaurar') delete cfg.ejercicios[id];
    if (accion === 'guardar') {
      const item = $id('p-ejercicios').querySelector(`.item[data-id="${CSS.escape(id)}"]`);
      const orig = EJ_ORIG.find(x => x.id === id), o = {};
      ['titulo', 'enunciado', 'aviso', 'resolucion'].forEach(k => { const v = item.querySelector(`[data-e="${k}"]`).value; if (v !== (orig[k] || '')) o[k] = v; });
      if (item.querySelector('[data-oculto]').checked) o.oculto = true;
      const resp = [...item.querySelectorAll('[data-resp]')].map(el => {
        const i = +el.dataset.resp, c = orig.campos[i];
        if (c.opciones) return el.value === c.respuesta ? null : el.value;
        const x = aNumero(el.value);
        if (Number.isNaN(x)) { alert(`"${el.value}" no es un número válido en «${c.etiqueta}».`); throw new Error('dato inválido'); }
        return Math.abs(x - c.respuesta) < 1e-9 ? null : x;
      });
      if (resp.some(x => x !== null)) o.respuestas = resp;
      if (Object.keys(o).length) cfg.ejercicios[id] = o; else delete cfg.ejercicios[id];
    }
    guardar();
    renderEjercicios();
  }

  // ======================================================================
  // 5. Textos editados
  // ======================================================================
  function renderTextos() {
    const paginas = Object.entries(cfg.textos);
    $id('p-textos').innerHTML = `
      <p class="widget-intro">Para corregir un texto de la teoría (o de cualquier página), entrá a esa página, tocá <b>Editar textos</b> en la barra del profesor de abajo y hacé clic sobre el párrafo, título o ítem que quieras cambiar. Acá ves todo lo que ya cambiaste.</p>
      ${paginas.length ? paginas.map(([pag, bloques]) => `<h3><a href="${esc(pag)}">${esc(pag)}</a></h3>
        <div class="lista-items">${Object.entries(bloques).map(([i, b]) => `<div class="item editada"><div class="item-cabecera estatica">
          <span class="item-texto"><b>Antes:</b> ${esc(b.texto || '')}… <br><b>Ahora:</b> ${esc(b.html.replace(/<[^>]+>/g, '').slice(0, 120))}…</span>
          <button class="btn" type="button" data-tx="${esc(pag)}|${i}">Volver al original</button></div></div>`).join('')}</div>`).join('')
      : '<p class="vacio">Todavía no editaste ningún texto.</p>'}`;
    $id('p-textos').onclick = ev => {
      const b = ev.target.closest('[data-tx]');
      if (!b) return;
      const [pag, i] = b.dataset.tx.split('|');
      delete cfg.textos[pag][i];
      if (!Object.keys(cfg.textos[pag]).length) delete cfg.textos[pag];
      guardar(); renderTextos();
    };
  }

  // ======================================================================
  // 6. Publicar
  // ======================================================================
  function renderPublicar() {
    const resumen = [
      cfg.ocultas.unidades.length && `${cfg.ocultas.unidades.length} unidad(es) oculta(s)`,
      cfg.ocultas.paginas.length && `${cfg.ocultas.paginas.length} sección(es) oculta(s)`,
      cfg.ocultas.generales.length + cfg.ocultas.examenes.length && 'páginas o exámenes ocultos',
      Object.keys(cfg.preguntas).length && `${Object.keys(cfg.preguntas).length} pregunta(s) editada(s) o eliminada(s)`,
      cfg.preguntasNuevas.length && `${cfg.preguntasNuevas.length} pregunta(s) nueva(s)`,
      Object.keys(cfg.ejercicios).length && `${Object.keys(cfg.ejercicios).length} ejercicio(s) editado(s)`,
      Object.keys(cfg.textos).length && `textos editados en ${Object.keys(cfg.textos).length} página(s)`,
      cfg.aviso.activo && 'aviso en la portada',
    ].filter(Boolean);
    $id('p-publicar').innerHTML = `
      <p class="widget-intro">${Curso.hayCambios() ? '<b>Tenés cambios sin publicar.</b> Por ahora solo los ves en este navegador.' : 'No hay cambios sin publicar.'}</p>
      <p>Configuración actual: ${resumen.length ? resumen.join(' · ') : 'sin cambios respecto del libro original'}.</p>
      <h3>Cómo publicar</h3>
      <ol>
        <li>Descargá el archivo de configuración con el botón de abajo (se llama <code>curso-config.js</code>).</li>
        <li>Reemplazá con él el archivo <code>js/curso-config.js</code> del libro publicado. En GitHub: entrá al repositorio, abrí la carpeta <code>js</code>, tocá <b>Add file → Upload files</b>, subí el archivo y confirmá con <b>Commit changes</b>.</li>
        <li>En uno o dos minutos, los alumnos ven los cambios.</li>
      </ol>
      <p class="ayuda">Cuando el libro tenga usuarios y un servidor, este paso va a ser un solo botón.</p>
      <div class="botones">
        <button class="btn-primario" type="button" id="pub-descargar">Descargar curso-config.js</button>
        <label class="btn" style="cursor:pointer">Importar un archivo de configuración<input type="file" id="pub-importar" accept=".js,.json" hidden></label>
        <button class="btn" type="button" id="pub-descartar" ${Curso.hayCambios() ? '' : 'disabled'}>Descartar los cambios sin publicar</button>
      </div>`;
    $id('pub-descargar').onclick = () => {
      const blob = new Blob([Curso.archivoPublicable()], { type: 'text/javascript' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'curso-config.js';
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    };
    $id('pub-importar').onchange = async ev => {
      const f = ev.target.files[0];
      if (!f) return;
      try {
        const txt = await f.text();
        const json = txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1);
        cfg = Curso.normalizar(JSON.parse(json));
        guardar(); alert('Configuración importada.'); location.reload();
      } catch (e) { alert('No se pudo leer el archivo: tiene que ser un curso-config.js descargado de este panel.'); }
    };
    $id('pub-descartar').onclick = () => {
      if (!confirm('¿Descartar todos los cambios sin publicar? Vuelve la configuración publicada.')) return;
      Curso.descartarBorrador(); location.reload();
    };
  }

  const RENDER = { visibilidad: renderVisibilidad, calendario: renderCalendario, preguntas: renderPreguntas, ejercicios: renderEjercicios, textos: renderTextos, publicar: renderPublicar };
  estado();
  const inicial = location.hash.replace('#', '');
  abrir(RENDER[inicial] ? inicial : 'visibilidad');
})();
