// Simulacro de examen: preguntas de opción múltiple del banco (BANCO, js/preguntas-uN.js),
// con cuenta regresiva, nota según la escala de la cátedra y análisis por tema.
//
// Selección de preguntas (función seleccionar):
//   1. Mitad prácticas y mitad teóricas (si un tipo no alcanza, se completa con el otro).
//   2. Dentro de cada tipo, primero las preguntas que el alumno vio MENOS veces en simulacros
//      anteriores (así no se repiten hasta agotar el banco).
//   3. Entre ésas, se reparte entre unidades y dificultades en proporción a cuántas preguntas
//      de cada unidad y de cada dificultad hay en el banco del examen. El orden final es al azar.
//
// Lo que se guarda en el navegador (claves "derivados:..."):
//   simulacro:intentos  → todos los simulacros entregados (últimos 300), con el detalle por pregunta
//   simulacro:vistas    → cuántas veces le tocó cada pregunta al alumno
//   simulacro:enCurso   → el simulacro que se está haciendo (para retomarlo si se recarga)
//   idAnonimo           → identificador al azar del navegador (sin datos personales), para la tesis

(function () {
  const ROMANOS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  const numU = id => parseInt(String(id).replace('u', ''), 10);
  const ev = i => LIBRO.evaluaciones[i] || {};

  const EXAMENES = [
    { id: 'p1', nombre: 'Primer parcial', unidades: (ev(0).unidades || ['u1', 'u2', 'u3']).map(numU), fecha: ev(0).fecha },
    { id: 'p2', nombre: 'Segundo parcial', unidades: (ev(1).unidades || ['u4', 'u5', 'u6', 'u8']).map(numU), fecha: ev(1).fecha },
    { id: 'final', nombre: 'Examen final', unidades: [1, 2, 3, 4, 5, 6, 7, 8], fecha: ev(3).fecha },
  ];
  const MODALIDADES = [
    { id: 'completo', nombre: 'Simulacro completo', preguntas: 35, minutos: 90 },
    { id: 'mini', nombre: 'Mini simulacro', preguntas: 15, minutos: 45 },
  ];
  // Escala: porcentaje mínimo de respuestas correctas para cada nota.
  const ESCALA = [
    { desde: 95, nota: 10 }, { desde: 88, nota: 9 }, { desde: 80, nota: 8 }, { desde: 75, nota: 7 },
    { desde: 70, nota: 6 }, { desde: 65, nota: 5 }, { desde: 60, nota: 4 },
  ];
  const UMBRAL_REFORZAR = 60; // % de aciertos por debajo del cual se sugiere reforzar un tema

  // Diagrama de un swap con intermediario (pregunta práctica para completar, con datos al azar).
  // probabilidad: en qué proporción de los simulacros de cada examen aparece (1 = siempre).
  const CUADRO_SWAP = { p1: 0, p2: 1, final: 0.5 };
  const ID_CUADRO = 'U4-CUADRO';

  const el = id => document.getElementById(id);
  const banco = typeof BANCO !== 'undefined' ? BANCO : [];
  const porId = new Map(banco.map(q => [q.id, q]));
  const preguntasDe = ex => banco.filter(q => ex.unidades.includes(q.unidad));
  const nombreUnidades = ex => (ex.unidades.length === 8 ? 'Todas las unidades' : `Unidades ${ex.unidades.map(n => ROMANOS[n]).join(', ')}`);
  const examenPorId = id => EXAMENES.find(e => e.id === id);
  const modalidadPorId = id => MODALIDADES.find(m => m.id === id);

  let examen = EXAMENES[0], modalidad = MODALIDADES[0];
  let S = null;          // simulacro en curso
  let desde = 0;         // momento en que se empezó a mirar la pregunta actual
  let reloj = null;

  // ---------- Utilidades ----------

  function mezclar(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  const promedio = xs => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null);
  const segundos = s => (s === null ? '—' : s < 60 ? `${fmt(s, 1)} s` : `${Math.floor(s / 60)} min ${String(Math.round(s % 60)).padStart(2, '0')} s`);
  const reloj2 = ms => {
    const t = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    return (h ? `${h}:${String(m).padStart(2, '0')}` : `${m}`) + `:${String(s).padStart(2, '0')}`;
  };
  const fechaCorta = iso => { const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const fechaDia = iso => { if (!iso) return ''; const [a, m, d] = iso.split('-'); return `${d}/${m}/${a}`; };
  const textoOpcion = (q, k) => (k === 0 ? q.correcta : q.incorrectas[k - 1]);

  function nota(porcentaje) {
    const fila = ESCALA.find(f => porcentaje >= f.desde - 1e-9);
    return fila ? fila.nota : null; // null = desaprobado
  }

  function idAnonimo() {
    let id = Guardado.leer('idAnonimo', null);
    if (!id) {
      id = 'a-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
      Guardado.escribir('idAnonimo', id);
    }
    return id;
  }

  // ---------- Selección de preguntas ----------

  // practicasYaIncluidas: prácticas que el examen ya tiene fuera del banco (el cuadro del swap).
  function seleccionar(pool, n, vistas, practicasYaIncluidas = 0) {
    const veces = q => vistas[q.id] || 0;
    const porTipo = { 'práctica': pool.filter(q => q.tipo === 'práctica'), 'teórica': pool.filter(q => q.tipo !== 'práctica') };
    let nPract = Math.max(0, Math.round((n + practicasYaIncluidas) / 2) - practicasYaIncluidas), nTeo = n - nPract;
    // Si un tipo no alcanza, el otro completa.
    if (porTipo['práctica'].length < nPract) { nTeo += nPract - porTipo['práctica'].length; nPract = porTipo['práctica'].length; }
    if (porTipo['teórica'].length < nTeo) { nPract = Math.min(porTipo['práctica'].length, nPract + nTeo - porTipo['teórica'].length); nTeo = porTipo['teórica'].length; }

    // Proporción de cada unidad y de cada dificultad en el banco del examen.
    const parte = f => { const o = {}; pool.forEach(q => { o[f(q)] = (o[f(q)] || 0) + 1 / pool.length; }); return o; };
    const parteU = parte(q => q.unidad), parteD = parte(q => q.dificultad);
    const tomadasU = {}, tomadasD = {};
    const restantes = { 'práctica': mezclar(porTipo['práctica']), 'teórica': mezclar(porTipo['teórica']) };
    // Turnos: cuántas prácticas y teóricas, intercalados al azar.
    const turnos = mezclar([...Array(nPract).fill('práctica'), ...Array(nTeo).fill('teórica')]);
    const elegidas = [];
    turnos.forEach(tipo => {
      const resto = restantes[tipo];
      if (!resto.length) return;
      const minimo = Math.min(...resto.map(veces));
      const aptas = resto.filter(q => veces(q) === minimo);
      // Cuánto le falta a su unidad y a su dificultad para llegar a su proporción en el banco.
      const k = elegidas.length + 1;
      const puntaje = q => (parteU[q.unidad] * k - (tomadasU[q.unidad] || 0)) + 0.5 * (parteD[q.dificultad] * k - (tomadasD[q.dificultad] || 0));
      const mejor = Math.max(...aptas.map(puntaje));
      const q = aptas.find(x => puntaje(x) >= mejor - 1e-9); // aptas ya está mezclada: el empate se resuelve al azar
      elegidas.push(q);
      tomadasU[q.unidad] = (tomadasU[q.unidad] || 0) + 1;
      tomadasD[q.dificultad] = (tomadasD[q.dificultad] || 0) + 1;
      restantes[tipo] = resto.filter(x => x !== q);
    });
    return mezclar(elegidas);
  }

  // ---------- Diagrama de un swap con intermediario (js/diagrama-swap.js) ----------
  const CAMPOS_DIAGRAMA = DiagramaSwap.CAMPOS;
  const generarCuadroSwap = DiagramaSwap.generar;
  const corregirCuadro = DiagramaSwap.corregir;
  const enunciadoCuadro = c => DiagramaSwap.enunciado(c) + DiagramaSwap.instrucciones(true);
  const tablaCuadro = DiagramaSwap.dibujar;
  const explicacionCuadro = DiagramaSwap.explicacion;

  // Datos de la pregunta i del simulacro (del banco o el diagrama del swap).
  function pregunta(s, i) {
    if (s.ids[i] === ID_CUADRO) {
      return { id: ID_CUADRO, unidad: 4, tema: 'Diagrama de un swap (ventaja comparativa)', tipo: 'práctica', dificultad: 2, fuente: 'Como la Guía U4, ej. 1', cuadro: s.cuadro, enunciado: enunciadoCuadro(s.cuadro) };
    }
    return porId.get(s.ids[i]);
  }
  const esCuadro = (s, i) => s.ids[i] === ID_CUADRO;
  const respondida = (s, i) => (esCuadro(s, i) ? (s.resp[i] || []).every(x => String(x || '').trim() !== '') : s.resp[i] !== null);

  // ---------- Pantalla de inicio ----------

  function vistasDe(ex) {
    const vistas = Guardado.leer('simulacro:vistas', {});
    const pool = preguntasDe(ex);
    return { total: pool.length, sinVer: pool.filter(q => !vistas[q.id]).length };
  }

  function renderInicio() {
    el('lista-examenes').innerHTML = EXAMENES.map(ex => {
      const v = vistasDe(ex);
      return `<button type="button" class="eleccion" data-examen="${ex.id}" aria-pressed="${ex === examen}">
        <span class="titulo">${ex.nombre}</span>
        <span class="detalle">${nombreUnidades(ex)}${ex.fecha ? ` · ${fechaDia(ex.fecha)}` : ''}</span>
        <span class="chips"><span class="chip">${v.total} preguntas en el banco</span><span class="chip ${v.sinVer ? 'acento' : ''}">${v.sinVer} sin ver</span></span>
      </button>`;
    }).join('');
    el('lista-modalidades').innerHTML = MODALIDADES.map(m => `
      <button type="button" class="eleccion" data-modalidad="${m.id}" aria-pressed="${m === modalidad}">
        <span class="titulo">${m.nombre}</span>
        <span class="detalle">${m.preguntas} preguntas · ${m.minutos} minutos</span>
      </button>`).join('');

    el('escala').innerHTML = `<h3>Escala de notas</h3>` + tablaHTML(
      [{ titulo: 'Respuestas correctas' }, { titulo: 'Nota', num: true }],
      [['Menos del 60 %', 'Desaprobado'], ['60 % a 64 %', '4'], ['65 % a 69 %', '5'], ['70 % a 74 %', '6'], ['75 % a 79 %', '7'], ['80 % a 87 %', '8'], ['88 % a 94 %', '9'], ['95 % a 100 %', '10']],
      () => '', 'escala');

    const intentos = Guardado.leer('simulacro:intentos', []);
    el('historial').innerHTML = intentos.length
      ? tablaHTML(
        [{ titulo: 'Fecha' }, { titulo: 'Examen' }, { titulo: 'Modalidad' }, { titulo: 'Correctas', num: true }, { titulo: 'Nota', num: true }, { titulo: 'Tiempo usado', num: true }],
        [...intentos].reverse().map(r => [
          fechaCorta(r.fecha), (examenPorId(r.examen) || {}).nombre || r.examen, (modalidadPorId(r.modalidad) || {}).nombre || r.modalidad,
          `${r.correctas} / ${r.preguntas} (${fmt(r.porcentaje, 0)} %)`,
          { texto: r.aprobado ? String(r.nota) : 'Desaprobado', clase: r.aprobado ? 'pos' : 'neg' },
          reloj2(r.segundosUsados * 1000),
        ])) + `<div class="botones-fila">
          <button class="btn" type="button" id="btn-csv">Descargar resultados (CSV para Excel)</button>
          <button class="btn" type="button" id="btn-json">Descargar resultados (JSON)</button></div>`
      : '<p class="vacio">Todavía no hiciste ningún simulacro.</p>';
    if (intentos.length) {
      el('btn-csv').addEventListener('click', descargarCSV);
      el('btn-json').addEventListener('click', descargarJSON);
    }

    // Simulacro sin terminar.
    const enCurso = Guardado.leer('simulacro:enCurso', null);
    if (enCurso && enCurso.limite > Date.now()) {
      const ex = examenPorId(enCurso.examen), m = modalidadPorId(enCurso.modalidad);
      el('en-curso').innerHTML = `<div class="caja importante en-curso">
        <p><b>Tenés un simulacro sin terminar:</b> ${ex ? ex.nombre : ''} · ${m ? m.nombre : ''}. Quedan ${reloj2(enCurso.limite - Date.now())} y respondiste ${enCurso.resp.filter(r => r !== null).length} de ${enCurso.ids.length}.</p>
        <button class="btn-primario" type="button" id="btn-continuar">Continuar</button>
        <button class="btn" type="button" id="btn-descartar">Descartar</button></div>`;
      el('btn-continuar').addEventListener('click', () => retomar(enCurso));
      el('btn-descartar').addEventListener('click', () => {
        if (!confirm('¿Descartar el simulacro sin terminar? No se guarda ningún resultado.')) return;
        Guardado.escribir('simulacro:enCurso', null);
        renderInicio();
      });
    } else {
      el('en-curso').innerHTML = '';
    }
  }

  function mostrar(pantalla) {
    ['pantalla-inicio', 'pantalla-examen', 'pantalla-resultado'].forEach(p => { el(p).hidden = p !== pantalla; });
    scrollTo({ top: 0 });
  }

  function mostrarInicio() {
    mostrar('pantalla-inicio');
    renderInicio();
  }

  // ---------- Examen ----------

  function empezar() {
    const enCurso = Guardado.leer('simulacro:enCurso', null);
    if (enCurso && enCurso.limite > Date.now() && !confirm('Tenés otro simulacro sin terminar. Si empezás uno nuevo, ese se descarta. ¿Seguir?')) return;
    const vistas = Guardado.leer('simulacro:vistas', {});
    const conCuadro = Math.random() < (CUADRO_SWAP[examen.id] || 0);
    const elegidas = seleccionar(preguntasDe(examen), modalidad.preguntas - (conCuadro ? 1 : 0), vistas, conCuadro ? 1 : 0);
    if (!elegidas.length) { alert('No hay preguntas para este examen.'); return; }
    elegidas.forEach(q => { vistas[q.id] = (vistas[q.id] || 0) + 1; });
    Guardado.escribir('simulacro:vistas', vistas);
    const ids = elegidas.map(q => q.id);
    if (conCuadro) ids.splice(Math.floor(Math.random() * (ids.length + 1)), 0, ID_CUADRO);
    const ahora = Date.now();
    S = {
      version: 1,
      examen: examen.id,
      modalidad: modalidad.id,
      ids,
      orden: ids.map(id => (id === ID_CUADRO ? null : mezclar([0, 1, 2, 3]))), // 0 = la correcta
      resp: ids.map(id => (id === ID_CUADRO ? Array(CAMPOS_DIAGRAMA).fill('') : null)), // opción elegida (en el orden mostrado) o casilleros del diagrama
      tiempos: ids.map(() => 0),                                                // segundos mirando cada pregunta
      marcadas: ids.map(() => false),
      cuadro: conCuadro ? generarCuadroSwap() : null,
      inicio: ahora,
      limite: ahora + modalidad.minutos * 60000,
      actual: 0,
    };
    guardarEnCurso();
    abrirExamen();
  }

  function retomar(enCurso) {
    // Descarta preguntas que ya no existan en el banco (por si se editó).
    const validas = enCurso.ids.map((id, i) => (porId.has(id) || (id === ID_CUADRO && enCurso.cuadro) ? i : -1)).filter(i => i >= 0);
    ['ids', 'orden', 'resp', 'tiempos', 'marcadas'].forEach(k => { enCurso[k] = validas.map(i => enCurso[k][i]); });
    enCurso.actual = Math.min(enCurso.actual || 0, enCurso.ids.length - 1);
    S = enCurso;
    abrirExamen();
  }

  function abrirExamen() {
    const ex = examenPorId(S.examen), m = modalidadPorId(S.modalidad);
    el('ex-titulo').innerHTML = `${ex.nombre}<small>${m.nombre} · ${S.ids.length} preguntas · ${m.minutos} min</small>`;
    mostrar('pantalla-examen');
    ajustarBarra();
    desde = Date.now();
    renderPregunta();
    clearInterval(reloj);
    reloj = setInterval(tic, 250);
    tic();
  }

  function guardarEnCurso() { if (S) Guardado.escribir('simulacro:enCurso', S); }

  // Suma a la pregunta actual el tiempo que pasó desde la última vez.
  function acumular() {
    const ahora = Date.now();
    if (S && desde) S.tiempos[S.actual] += Math.max(0, (ahora - desde) / 1000);
    desde = ahora;
  }

  let ultimoGuardado = 0;
  function tic() {
    if (!S) return;
    const resta = S.limite - Date.now();
    const r = el('reloj');
    r.textContent = reloj2(resta);
    r.classList.toggle('aviso', resta <= 10 * 60000 && resta > 5 * 60000);
    r.classList.toggle('peligro', resta <= 5 * 60000);
    if (Date.now() - ultimoGuardado > 5000) { acumular(); guardarEnCurso(); ultimoGuardado = Date.now(); }
    if (resta <= 0) entregar(true);
  }

  function renderPregunta() {
    const i = S.actual, q = pregunta(S, i);
    el('pregunta-num').textContent = `Pregunta ${i + 1} de ${S.ids.length}`;
    el('pregunta-chips').innerHTML = `<span class="chip">Unidad ${ROMANOS[q.unidad]}</span>`;
    if (esCuadro(S, i)) {
      el('pregunta-enunciado').innerHTML = q.enunciado;
      el('pregunta-opciones').innerHTML = tablaCuadro(S.cuadro, S.resp[i], 'examen') +
        '<p class="ayuda">Escribí solo el número, con coma decimal (5,3). Para un spread negativo usá el signo menos (−0,25).</p>';
    } else {
      el('pregunta-enunciado').innerHTML = q.enunciado;
      el('pregunta-opciones').innerHTML = S.orden[i]
        .map((k, j) => `<button type="button" data-j="${j}" aria-pressed="${S.resp[i] === j}"><b>${'abcd'[j]})</b><span>${textoOpcion(q, k)}</span></button>`)
        .join('');
    }
    renderFormulas(el('pregunta'));
    el('btn-anterior').disabled = i === 0;
    el('btn-siguiente').textContent = i === S.ids.length - 1 ? 'Ir a la primera sin responder' : 'Siguiente →';
    el('btn-borrar').disabled = esCuadro(S, i) ? !S.resp[i].some(x => String(x).trim()) : S.resp[i] === null;
    el('btn-marcar').textContent = S.marcadas[i] ? 'Quitar la marca' : 'Marcar para revisar';
    el('btn-marcar').classList.toggle('activo', S.marcadas[i]);
    renderGrilla();
  }

  function renderGrilla() {
    el('grilla').innerHTML = S.ids.map((_, i) => {
      const r = respondida(S, i);
      const clases = [r ? 'respondida' : '', S.marcadas[i] ? 'marcada' : '', i === S.actual ? 'actual' : ''].join(' ');
      return `<button type="button" class="${clases}" data-i="${i}" aria-label="Pregunta ${i + 1}${r ? ', respondida' : ''}${S.marcadas[i] ? ', marcada' : ''}">${i + 1}</button>`;
    }).join('');
    const n = S.ids.filter((_, i) => respondida(S, i)).length;
    el('ex-progreso').textContent = `Respondidas: ${n} / ${S.ids.length}`;
  }

  function irA(i) {
    if (!S || i < 0 || i >= S.ids.length || i === S.actual) return;
    acumular();
    S.actual = i;
    guardarEnCurso();
    renderPregunta();
    const p = el('pregunta');
    if (p.getBoundingClientRect().top < 0) p.scrollIntoView({ block: 'start' });
  }

  function siguiente() {
    if (S.actual < S.ids.length - 1) { irA(S.actual + 1); return; }
    const sinResp = S.ids.findIndex((_, i) => !respondida(S, i));
    if (sinResp >= 0) irA(sinResp);
  }

  function responder(j) {
    if (!S || esCuadro(S, S.actual)) return;
    S.resp[S.actual] = j;
    guardarEnCurso();
    renderPregunta();
  }

  function ajustarBarra() {
    const h = el('encabezado') ? el('encabezado').offsetHeight : 59;
    el('barra-examen').style.top = `${h + 8}px`;
  }

  // ---------- Entrega y resultados ----------

  function entregar(porTiempo = false) {
    if (!S) return;
    if (!porTiempo) {
      const sin = S.ids.filter((_, i) => !respondida(S, i)).length;
      const texto = sin ? `Te quedan ${sin} pregunta${sin > 1 ? 's' : ''} sin responder (cuentan como incorrectas). ¿Entregar igual?` : '¿Entregar el simulacro?';
      if (!confirm(texto)) return;
    }
    acumular();
    clearInterval(reloj);
    const resultado = calcular(S, porTiempo);
    const intentos = Guardado.leer('simulacro:intentos', []);
    intentos.push(resultado);
    Guardado.escribir('simulacro:intentos', intentos.slice(-300));
    Guardado.escribir('simulacro:enCurso', null);
    const hecho = S;
    S = null;
    mostrarResultado(resultado, hecho);
  }

  function resumen(items) {
    const resp = items.filter(x => x.respondida);
    const correctas = items.filter(x => x.correcta).length;
    return {
      preguntas: items.length,
      respondidas: resp.length,
      correctas,
      porcentaje: items.length ? (correctas / items.length) * 100 : 0,
      tiempoPromedio: promedio(resp.map(x => x.segundos)),
    };
  }

  function calcular(s, porTiempo) {
    const detalle = s.ids.map((id, i) => {
      const q = pregunta(s, i);
      const base = { id, unidad: q.unidad, tema: q.tema, tipo: q.tipo, dificultad: q.dificultad, segundos: Math.round(s.tiempos[i] * 10) / 10 };
      if (id === ID_CUADRO) {
        const c = corregirCuadro(s.cuadro, s.resp[i]);
        return { ...base, respondida: c.respondida, correcta: c.correcta, opcionElegida: null, celdasBien: c.bien, celdas: c.total, cuadro: s.cuadro, celdasRespuesta: s.resp[i] };
      }
      const resp = s.resp[i] !== null;
      const k = resp ? s.orden[i][s.resp[i]] : null;
      return { ...base, respondida: resp, correcta: resp && k === 0, opcionElegida: k }; // opcionElegida: 0 = correcta, 1-3 = cuál incorrecta
    });
    const total = resumen(detalle);
    const agrupar = clave => {
      const grupos = new Map();
      detalle.forEach(x => { const c = clave(x); if (!grupos.has(c)) grupos.set(c, []); grupos.get(c).push(x); });
      return grupos;
    };
    const porTema = [...agrupar(x => `${x.unidad}|${x.tema}`)].map(([c, xs]) => ({ unidad: xs[0].unidad, tema: xs[0].tema, ...resumen(xs) }));
    const porUnidad = [...agrupar(x => x.unidad)].map(([u, xs]) => ({ unidad: u, ...resumen(xs) })).sort((a, b) => a.unidad - b.unidad);
    const porTipo = {};
    ['práctica', 'teórica'].forEach(t => { porTipo[t] = resumen(detalle.filter(x => x.tipo === t)); });
    const m = modalidadPorId(s.modalidad);
    const n = nota(total.porcentaje);
    return {
      version: 1,
      idAnonimo: idAnonimo(),
      fecha: new Date(s.inicio).toISOString(),
      entrega: new Date().toISOString(),
      examen: s.examen,
      modalidad: s.modalidad,
      minutos: m ? m.minutos : null,
      preguntas: total.preguntas,
      respondidas: total.respondidas,
      correctas: total.correctas,
      porcentaje: Math.round(total.porcentaje * 100) / 100,
      nota: n,
      aprobado: n !== null,
      finPorTiempo: porTiempo,
      segundosUsados: Math.round(Math.min(Date.now(), s.limite) - s.inicio) / 1000,
      tiempoPromedio: total.tiempoPromedio,
      tiempoPromedioPractica: porTipo['práctica'].tiempoPromedio,
      tiempoPromedioTeorica: porTipo['teórica'].tiempoPromedio,
      porTipo,
      porUnidad,
      porTema,
      detalle,
    };
  }

  function mostrarResultado(r, s) {
    const ex = examenPorId(r.examen), m = modalidadPorId(r.modalidad);
    mostrar('pantalla-resultado');
    el('res-titulo').textContent = `Resultado · ${ex.nombre}`;
    el('res-bajada').textContent = `${m.nombre} · ${fechaCorta(r.fecha)}${r.finPorTiempo ? ' · Se entregó automáticamente al terminar el tiempo.' : ''}`;
    el('res-nota').innerHTML = `<div class="nota-caja ${r.aprobado ? 'aprobado' : 'desaprobado'}">
      <div><div class="nota-rotulo">Nota</div><div class="nota-valor">${r.aprobado ? r.nota : 'Desaprobado'}</div></div>
      <div class="nota-texto">
        <p><b>${r.correctas} de ${r.preguntas} correctas (${fmt(r.porcentaje, 1)} %).</b></p>
        <p>${r.respondidas < r.preguntas ? `Dejaste ${r.preguntas - r.respondidas} sin responder. ` : ''}Usaste ${reloj2(r.segundosUsados * 1000)} de ${m.minutos}:00.</p>
        <p class="ayuda">${r.aprobado ? (r.nota < 10 ? `Para la nota siguiente necesitás ${siguienteUmbral(r.porcentaje)} % de aciertos.` : '¡Nota máxima!') : 'Para aprobar (nota 4) necesitás al menos el 60 % de aciertos.'}</p>
      </div></div>`;

    const dato = (etiqueta, valor, notaTxt = '', clase = '') =>
      `<div class="dato ${clase}"><div class="dato-etiqueta">${etiqueta}</div><div class="dato-valor">${valor}</div>${notaTxt ? `<div class="dato-nota">${notaTxt}</div>` : ''}</div>`;
    const pt = r.porTipo['práctica'], te = r.porTipo['teórica'];
    el('res-datos').innerHTML =
      dato('Tiempo promedio por respuesta', segundos(r.tiempoPromedio), 'todas las preguntas', 'destacado') +
      dato('Prácticas', segundos(r.tiempoPromedioPractica), `promedio · ${pt.correctas} / ${pt.preguntas} correctas`) +
      dato('Teóricas', segundos(r.tiempoPromedioTeorica), `promedio · ${te.correctas} / ${te.preguntas} correctas`) +
      dato('Respondidas', `${r.respondidas} / ${r.preguntas}`);

    const fila = x => [
      x.tema !== undefined ? `Unidad ${ROMANOS[x.unidad]} · ${x.tema}` : `Unidad ${ROMANOS[x.unidad]}`,
      String(x.preguntas), String(x.correctas),
      { texto: `${fmt(x.porcentaje, 0)} %`, clase: x.porcentaje < UMBRAL_REFORZAR ? 'neg' : 'pos' },
      segundos(x.tiempoPromedio),
      { texto: x.porcentaje < UMBRAL_REFORZAR ? '<span class="chip neg">Reforzar</span>' : '<span class="chip pos">Bien</span>' },
    ];
    const columnas = (primera) => [{ titulo: primera }, { titulo: 'Preguntas', num: true }, { titulo: 'Correctas', num: true }, { titulo: 'Aciertos', num: true }, { titulo: 'Tiempo promedio', num: true }, { titulo: '' }];
    const temas = [...r.porTema].sort((a, b) => a.porcentaje - b.porcentaje || a.unidad - b.unidad);
    el('res-temas').innerHTML = tablaHTML(columnas('Tema'), temas.map(fila), i => (temas[i].porcentaje < UMBRAL_REFORZAR ? 'fila-reforzar' : ''));
    el('res-unidades').innerHTML = tablaHTML(columnas('Unidad'), r.porUnidad.map(fila));

    el('res-revision').innerHTML = s.ids.map((id, i) => {
      const q = pregunta(s, i), d = r.detalle[i];
      const estado = !d.respondida ? 'blanco' : d.correcta ? 'acierto' : 'error';
      const cabecera = `<summary><span class="marca">${!d.respondida ? '—' : d.correcta ? '✔' : '✘'}</span>
          <span class="tema">${i + 1}. Unidad ${ROMANOS[q.unidad]} · ${q.tema} <span class="chip">${q.tipo}</span></span>
          <span class="tiempo">${segundos(d.segundos)}</span></summary>`;
      if (id === ID_CUADRO) {
        const c = corregirCuadro(s.cuadro, s.resp[i]);
        return `<details class="revision-item ${estado}">${cabecera}
          ${q.enunciado}
          ${tablaCuadro(s.cuadro, s.resp[i], 'revision', c)}
          <p><b>${c.marcas.slice(0, 6).filter(Boolean).length} de 6 tasas y ${c.marcas.slice(6).filter(Boolean).length} de 6 sentidos correctos.</b> En rojo, lo que estaba mal, con el valor o el sentido correcto al lado.</p>
          ${explicacionCuadro(s.cuadro)}
        </details>`;
      }
      return `<details class="revision-item ${estado}">
        ${cabecera}
        <p>${q.enunciado}</p>
        <p><b>Tu respuesta:</b> ${d.respondida ? textoOpcion(q, d.opcionElegida) : 'sin responder'}</p>
        ${d.correcta ? '' : `<p><b>Correcta:</b> ${q.correcta}</p>`}
        <p>${q.explicacion || ''}</p>
        ${q.trampas ? `<p class="ayuda"><b>Trampas:</b> ${q.trampas}</p>` : ''}
        <p class="ayuda">${q.id} · Fuente: ${q.fuente || '—'}</p>
      </details>`;
    }).join('');
    renderFormulas(el('res-revision'));
    examen = ex; modalidad = m;
  }

  function siguienteUmbral(p) {
    const mayores = ESCALA.map(f => f.desde).filter(d => d > p + 1e-9);
    return mayores.length ? Math.min(...mayores) : 100;
  }

  // ---------- Descargas (para la tesis) ----------

  function descargar(nombre, contenido, tipo) {
    const blob = new Blob([contenido], { type: tipo });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function descargarJSON() {
    descargar('simulacros-derivados.json', JSON.stringify(Guardado.leer('simulacro:intentos', []), null, 2), 'application/json');
  }

  // Una fila por pregunta respondida en cada simulacro (separador ";" y coma decimal, como usa Excel en español).
  function descargarCSV() {
    const num = x => (x === null || x === undefined ? '' : String(x).replace('.', ','));
    const celda = x => `"${String(x === null || x === undefined ? '' : x).replace(/"/g, '""')}"`;
    const cab = ['id_anonimo', 'intento', 'fecha', 'examen', 'modalidad', 'nota', 'aprobado', 'porcentaje_examen', 'fin_por_tiempo', 'segundos_usados',
      'pregunta', 'unidad', 'tema', 'tipo', 'dificultad', 'respondida', 'correcta', 'segundos'];
    const filas = [cab.join(';')];
    Guardado.leer('simulacro:intentos', []).forEach((r, n) => r.detalle.forEach(d => filas.push([
      celda(r.idAnonimo), n + 1, celda(r.fecha), celda(r.examen), celda(r.modalidad), r.nota === null ? 'desaprobado' : r.nota, r.aprobado ? 1 : 0,
      num(r.porcentaje), r.finPorTiempo ? 1 : 0, num(r.segundosUsados),
      celda(d.id), d.unidad, celda(d.tema), celda(d.tipo), d.dificultad, d.respondida ? 1 : 0, d.correcta ? 1 : 0, num(d.segundos),
    ].join(';'))));
    descargar('simulacros-derivados.csv', '﻿' + filas.join('\r\n'), 'text/csv;charset=utf-8');
  }

  // ---------- Eventos ----------

  el('lista-examenes').addEventListener('click', ev => {
    const b = ev.target.closest('[data-examen]');
    if (!b) return;
    examen = examenPorId(b.dataset.examen);
    document.querySelectorAll('[data-examen]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  });
  el('lista-modalidades').addEventListener('click', ev => {
    const b = ev.target.closest('[data-modalidad]');
    if (!b) return;
    modalidad = modalidadPorId(b.dataset.modalidad);
    document.querySelectorAll('[data-modalidad]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  });
  el('btn-empezar').addEventListener('click', empezar);
  el('pregunta-opciones').addEventListener('click', ev => {
    const b = ev.target.closest('button[data-j]');
    if (b) responder(Number(b.dataset.j));
  });
  el('grilla').addEventListener('click', ev => {
    const b = ev.target.closest('button[data-i]');
    if (b) irA(Number(b.dataset.i));
  });
  el('btn-anterior').addEventListener('click', () => irA(S.actual - 1));
  el('btn-siguiente').addEventListener('click', siguiente);
  el('btn-borrar').addEventListener('click', () => {
    S.resp[S.actual] = esCuadro(S, S.actual) ? Array(CAMPOS_DIAGRAMA).fill('') : null;
    guardarEnCurso();
    renderPregunta();
  });
  // Celdas del cuadro del swap: se guarda lo que se escribe sin redibujar (para no perder el foco).
  el('pregunta-opciones').addEventListener('input', ev => {
    const c = ev.target.closest('input[data-celda]');
    if (!c || !S || !esCuadro(S, S.actual)) return;
    S.resp[S.actual][Number(c.dataset.celda)] = c.value;
    el('btn-borrar').disabled = !S.resp[S.actual].some(x => String(x).trim());
    guardarEnCurso();
    renderGrilla();
  });
  // Flechas del diagrama: cada toque pasa a sin elegir → un sentido → el otro.
  el('pregunta-opciones').addEventListener('click', ev => {
    const b = ev.target.closest('[data-sentido]');
    if (!b || !S || !esCuadro(S, S.actual)) return;
    const n = Number(b.dataset.sentido);
    DiagramaSwap.alternarSentido(S.resp[S.actual], n);
    guardarEnCurso();
    renderPregunta();
    const igual = el('pregunta-opciones').querySelector(`[data-sentido="${n}"]`);
    if (igual) igual.focus();
  });
  el('pregunta-opciones').addEventListener('keydown', ev => {
    const c = ev.target.closest('input[data-celda]');
    if (!c || ev.key !== 'Enter') return;
    ev.preventDefault();
    const sig = el('pregunta-opciones').querySelector(`input[data-celda="${Number(c.dataset.celda) + 1}"]`);
    if (sig) sig.focus();
  });
  el('btn-marcar').addEventListener('click', () => { S.marcadas[S.actual] = !S.marcadas[S.actual]; guardarEnCurso(); renderPregunta(); });
  el('btn-entregar').addEventListener('click', () => entregar(false));
  el('btn-otro').addEventListener('click', mostrarInicio);
  el('btn-volver').addEventListener('click', () => { mostrarInicio(); el('historial-titulo').scrollIntoView({ block: 'start' }); });

  document.addEventListener('keydown', ev => {
    if (!S || el('pantalla-examen').hidden || ev.ctrlKey || ev.metaKey || ev.altKey) return;
    if (ev.target.closest && ev.target.closest('input, select, textarea')) return;
    const k = ev.key.toLowerCase();
    if (k === 'arrowright') { siguiente(); ev.preventDefault(); return; }
    if (k === 'arrowleft') { irA(S.actual - 1); ev.preventDefault(); return; }
    if (k === 'm') { el('btn-marcar').click(); ev.preventDefault(); return; }
    const j = '1234'.indexOf(k) >= 0 ? '1234'.indexOf(k) : 'abcd'.indexOf(k);
    if (j >= 0) { responder(j); ev.preventDefault(); }
  });
  addEventListener('resize', () => { if (S) ajustarBarra(); });
  addEventListener('pagehide', () => { if (S) { acumular(); guardarEnCurso(); } });
  document.addEventListener('visibilitychange', () => { if (S && document.hidden) { acumular(); guardarEnCurso(); } });

  // ---------- Arranque ----------

  // simulacro.html#p2 abre con el segundo parcial elegido.
  const inicial = parametroURL('examen', EXAMENES.map(e => e.id));
  if (inicial && examenPorId(inicial)) examen = examenPorId(inicial);
  addEventListener('hashchange', () => {
    const id = parametroURL('examen', EXAMENES.map(e => e.id));
    if (id && examenPorId(id) && !el('pantalla-inicio').hidden) { examen = examenPorId(id); renderInicio(); }
  });

  // Si quedó un simulacro con el tiempo vencido (se cerró la página), se entrega solo.
  const pendiente = Guardado.leer('simulacro:enCurso', null);
  if (pendiente && pendiente.limite <= Date.now() && pendiente.ids && pendiente.ids.length) {
    retomar(pendiente);
    entregar(true);
  } else {
    mostrarInicio();
  }
})();
