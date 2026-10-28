// Batalla con Active Time Battle (inspirada en Final Fantasy IV), alimentada por el banco
// de preguntas de opción múltiple (BANCO, en js/preguntas-uN.js).
//
// - Dos barras de tiempo: la del jugador y la del jefe. Cuando se llena la del jugador aparece
//   una pregunta (su turno); cuando se llena la del jefe, ataca.
// - Responder bien hace daño: más si la pregunta es difícil, si se respondió rápido y si hay combo.
// - Modo Espera: la barra del jefe se frena mientras hay una pregunta en pantalla.
//
// Para agregar o cambiar jefes, editá JEFES. Para cambiar el balance, editá CONFIG.
// Lo que se guarda en el navegador (claves "derivados:batalla:..."):
//   batalla:<id jefe>  → { intentos, victorias, mejorPuntaje, mejorRango }
//   batalla:partidas   → últimas 100 partidas (jefe, fecha, resultado, aciertos, tiempo, puntaje)

(function () {
  const CONFIG = {
    vidaJugador: 100,
    contraataque: 10,     // daño por responder mal
    cargaJugador: 2.2,    // segundos que tarda en llenarse la barra del jugador
    velocidades: { lenta: 45, normal: 30, rapida: 20 }, // segundos para que se llene la barra del jefe
    danoBase: { 1: 12, 2: 18, 3: 25 },
    // Tiempo "ideal" de respuesta (s): da bonus de daño y suma al puntaje.
    tiempoIdeal: { 'teórica': { 1: 15, 2: 22, 3: 30 }, 'práctica': { 1: 25, 2: 35, 3: 45 } },
    items: { descarte: 2, eter: 1, pocion: 1 },
    curaPocion: 30,
  };

  // color: token de la unidad (--u1…--u8); sin color usa el acento general del libro.
  const JEFES = [
    { id: 'u1', grupo: 'Por unidad', unidades: [1], nombre: 'Golem del Margen', icono: '🗿', vida: 200, ataque: 18, color: 'u1', golpe: 'te hace una llamada de margen' },
    { id: 'u2', grupo: 'Por unidad', unidades: [2], nombre: 'Hidra de la Base', icono: '🐉', vida: 200, ataque: 18, color: 'u2', golpe: 'te muerde con riesgo de base' },
    { id: 'u3', grupo: 'Por unidad', unidades: [3], nombre: 'Espectro del Costo de Tenencia', icono: '👻', vida: 200, ataque: 18, color: 'u3', golpe: 'te cobra el costo de tenencia' },
    { id: 'u4', grupo: 'Por unidad', unidades: [4], nombre: 'Serpiente del Swap', icono: '🐍', vida: 200, ataque: 18, color: 'u4', golpe: 'te enrosca en flujos variables' },
    { id: 'u5', grupo: 'Por unidad', unidades: [5], nombre: 'León de la Paridad', icono: '🦁', vida: 200, ataque: 18, color: 'u5', golpe: 'te arbitra la paridad put-call' },
    { id: 'u6', grupo: 'Por unidad', unidades: [6], nombre: 'Ent Binomial', icono: '🌳', vida: 200, ataque: 18, color: 'u6', golpe: 'te azota con una rama del árbol' },
    { id: 'u7', grupo: 'Por unidad', unidades: [7], nombre: 'Kraken Cambiario', icono: '🦑', vida: 180, ataque: 18, color: 'u7', golpe: 'te salpica con un salto del tipo de cambio' },
    { id: 'u8', grupo: 'Por unidad', unidades: [8], nombre: 'Quimera de las Estrategias', icono: '🐲', vida: 200, ataque: 18, color: 'u8', golpe: 'te lanza un straddle' },
    { id: 'p1', grupo: 'Jefes de parcial', unidades: [1, 2, 3], nombre: 'Titán del Primer Parcial', icono: '👹', vida: 280, ataque: 20, golpe: 'te aplasta con un futuro mal cubierto' },
    { id: 'p2', grupo: 'Jefes de parcial', unidades: [4, 5, 6, 8], nombre: 'Kraken de la Volatilidad', icono: '🐙', vida: 300, ataque: 20, golpe: 'te ataca con una ola de volatilidad' },
    { id: 'final', grupo: 'Jefes de parcial', unidades: [1, 2, 3, 4, 5, 6, 7, 8], nombre: 'Leviatán del Final', icono: '🐋', vida: 360, ataque: 22, golpe: 'te arrastra al fondo del programa' },
  ];

  // Unidades ocultas por el docente (Modo Profesor): sus jefes no aparecen y no aportan preguntas.
  if (window.Profesor && Profesor.mostrar) {
    JEFES.forEach(j => { j.unidades = j.unidades.filter(n => Profesor.mostrar.unidad('u' + n)); });
    for (let i = JEFES.length - 1; i >= 0; i--) if (!JEFES[i].unidades.length) JEFES.splice(i, 1);
  }
  const ROMANOS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  const el = id => document.getElementById(id);
  const banco = typeof BANCO !== 'undefined' ? BANCO : [];
  const preguntasDe = j => banco.filter(q => j.unidades.includes(q.unidad));
  const nombreUnidades = j => (j.unidades.length === 8 ? 'Todas las unidades' : `Unidad${j.unidades.length > 1 ? 'es' : ''} ${j.unidades.map(n => ROMANOS[n]).join(', ')}`);

  let jefe = JEFES[0];
  let E = null; // estado de la partida

  function mezclar(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  function aplicarColor(j) {
    const raiz = el('batalla');
    if (j.color) {
      raiz.style.setProperty('--acento', `var(--${j.color})`);
      raiz.style.setProperty('--acento-suave', `var(--${j.color}-suave)`);
    } else {
      raiz.style.removeProperty('--acento');
      raiz.style.removeProperty('--acento-suave');
    }
  }

  // ---------- Pantalla de inicio ----------

  function record(j) { return Guardado.leer('batalla:' + j.id, null); }

  function renderJefes() {
    const grupos = [...new Set(JEFES.map(j => j.grupo))];
    el('lista-jefes').innerHTML = grupos.map(g => `
      <div class="grupo-jefes">${g}</div>
      <div class="jefes">${JEFES.filter(j => j.grupo === g).map(j => {
        const r = record(j);
        const n = preguntasDe(j).length;
        return `<button type="button" class="jefe-tarjeta" data-id="${j.id}" aria-pressed="${j === jefe}" ${j.color ? `style="--acento: var(--${j.color}); --acento-suave: var(--${j.color}-suave)"` : ''}>
          <span class="icono" aria-hidden="true">${j.icono}</span>
          <span class="nombre">${j.nombre}</span>
          <span class="detalle">${nombreUnidades(j)} · ${n} preguntas</span>
          <span class="record">${r && r.intentos
            ? `<span class="chip acento">Mejor rango: ${r.mejorRango}</span><span class="chip">${r.victorias} / ${r.intentos} victorias</span>`
            : '<span class="chip">Sin jugar</span>'}</span>
        </button>`;
      }).join('')}</div>`).join('');
  }

  function elegirJefe(id) {
    jefe = JEFES.find(j => j.id === id) || JEFES[0];
    aplicarColor(jefe);
    document.querySelectorAll('.jefe-tarjeta').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.id === jefe.id)));
  }

  function mostrarInicio() {
    if (E) E.terminado = true;
    el('pantalla-fin').hidden = true;
    el('pantalla-batalla').hidden = true;
    el('pantalla-inicio').hidden = false;
    renderJefes();
    elegirJefe(jefe.id);
  }

  // ---------- Inicio y fin de la partida ----------

  function iniciar() {
    const pool = preguntasDe(jefe);
    if (!pool.length) { alert('No hay preguntas cargadas para este jefe.'); return; }
    E = {
      jefe,
      modo: elegido('modo') || 'espera',
      velocidad: CONFIG.velocidades[elegido('velocidad') || 'normal'],
      vida: CONFIG.vidaJugador,
      vidaJefe: jefe.vida,
      atbJugador: 0,
      atbJefe: 0,
      cola: mezclar(pool),
      pool,
      pregunta: null,
      tiempoPregunta: 0,
      tiempoTotal: 0,
      combo: 0,
      comboMax: 0,
      danoRecibido: 0,
      items: { ...CONFIG.items },
      historial: [],
      pausa: false,
      terminado: false,
      ultimoTick: performance.now(),
    };
    el('pantalla-inicio').hidden = true;
    el('pantalla-fin').hidden = true;
    el('pantalla-batalla').hidden = false;
    el('sprite-jefe').textContent = jefe.icono;
    el('sprite-jefe').className = 'sprite-jefe';
    el('nombre-jefe').textContent = jefe.nombre;
    el('rotulo-jefe').textContent = jefe.nombre;
    el('etiqueta-modo').textContent = E.modo === 'activo' ? 'Modo Activo' : 'Modo Espera';
    el('velo-pausa').hidden = true;
    el('btn-pausa').textContent = '⏸ Pausa';
    mensaje(`¡Apareció el ${jefe.nombre}!`);
    ocultarPregunta();
    actualizarItems();
    el('escena').scrollIntoView({ block: 'start', behavior: 'smooth' });
    requestAnimationFrame(bucle);
  }

  function calcularPuntaje(victoria) {
    const respondidas = E.historial.length;
    const aciertos = E.historial.filter(h => h.correcta).length;
    const pct = respondidas ? (aciertos / respondidas) * 100 : 0;
    const buenas = E.historial.filter(h => h.correcta);
    const ratioTiempo = buenas.length ? buenas.reduce((s, h) => s + Math.min(h.tiempo / h.ideal, 2), 0) / buenas.length : 2;
    // 80 % por aciertos y hasta 20 puntos por velocidad (ratio 1 = respondió en el tiempo ideal).
    const bonusTiempo = Math.max(0, Math.min(20, 20 * (2 - ratioTiempo)));
    let puntaje = pct * 0.8 + bonusTiempo;
    if (!victoria) puntaje = Math.min(puntaje, 59);
    const rango = puntaje >= 90 ? 'S' : puntaje >= 75 ? 'A' : puntaje >= 60 ? 'B' : 'C';
    return { respondidas, aciertos, pct, puntaje: Math.round(puntaje), rango };
  }

  function guardarResultado(victoria, r) {
    const ORDEN = { S: 4, A: 3, B: 2, C: 1 };
    const previo = Guardado.leer('batalla:' + E.jefe.id, null) || { intentos: 0, victorias: 0, mejorPuntaje: 0, mejorRango: 'C' };
    const nuevoRecord = previo.intentos > 0 && r.puntaje > previo.mejorPuntaje;
    Guardado.escribir('batalla:' + E.jefe.id, {
      intentos: previo.intentos + 1,
      victorias: previo.victorias + (victoria ? 1 : 0),
      mejorPuntaje: Math.max(previo.mejorPuntaje, r.puntaje),
      mejorRango: ORDEN[r.rango] > ORDEN[previo.mejorRango] || !previo.intentos ? r.rango : previo.mejorRango,
    });
    const partidas = Guardado.leer('batalla:partidas', []);
    partidas.push({
      jefe: E.jefe.id, fecha: new Date().toISOString(), victoria, modo: E.modo, velocidad: E.velocidad,
      respondidas: r.respondidas, aciertos: r.aciertos, puntaje: r.puntaje, rango: r.rango,
      segundos: Math.round(E.tiempoTotal),
      preguntas: E.historial.map(h => ({ id: h.id, ok: h.correcta, s: Math.round(h.tiempo * 10) / 10 })),
    });
    Guardado.escribir('batalla:partidas', partidas.slice(-100));
    return nuevoRecord;
  }

  function terminar(victoria) {
    if (E.terminado) return;
    E.terminado = true;
    const r = calcularPuntaje(victoria);
    const nuevoRecord = guardarResultado(victoria, r);
    const tiempoMedio = r.respondidas ? E.historial.reduce((s, h) => s + h.tiempo, 0) / r.respondidas : 0;

    el('pantalla-batalla').hidden = true;
    el('pantalla-fin').hidden = false;
    el('fin-titulo').textContent = victoria ? `¡Derrotaste al ${E.jefe.nombre}!` : 'Derrota…';
    el('fin-titulo').className = victoria ? 'victoria' : 'derrota';
    el('fin-rango').textContent = r.rango;
    const dato = (etiqueta, valor, nota = '', clase = '') =>
      `<div class="dato ${clase}"><div class="dato-etiqueta">${etiqueta}</div><div class="dato-valor">${valor}</div>${nota ? `<div class="dato-nota">${nota}</div>` : ''}</div>`;
    el('fin-datos').innerHTML =
      dato('Aciertos', `${r.aciertos} / ${r.respondidas}`, `${Math.round(r.pct)} %`, 'destacado') +
      dato('Puntaje', `${r.puntaje} / 100`, nuevoRecord ? 'Nuevo récord' : '') +
      dato('Tiempo total', formatoTiempo(E.tiempoTotal)) +
      dato('Tiempo medio', segundos(tiempoMedio), 'por respuesta') +
      dato('Combo máximo', `×${E.comboMax}`) +
      dato('Daño recibido', String(E.danoRecibido));

    const unidad = E.jefe.unidades.length === 1 && LIBRO.unidades.find(u => u.id === 'u' + E.jefe.unidades[0]);
    const pagEj = unidad && unidad.paginas.find(p => p.id === 'ejercitacion');
    el('btn-ir-unidad').hidden = !pagEj;
    if (pagEj) el('btn-ir-unidad').href = pagEj.archivo;

    el('fin-informe').innerHTML = E.historial.map((h, i) => `
      <details class="informe-item ${h.correcta ? 'acierto' : 'error'}">
        <summary>
          <span class="marca">${h.correcta ? '✔' : '✘'}</span>
          <span class="tema">${i + 1}. ${h.tema} <span class="chip">Unidad ${ROMANOS[h.unidad]}</span></span>
          <span class="tiempo">${segundos(h.tiempo)}</span>
        </summary>
        <p>${h.enunciado}</p>
        <p><b>Tu respuesta:</b> ${h.dada}</p>
        ${h.correcta ? '' : `<p><b>Correcta:</b> ${h.correctaTexto}</p>`}
        <p>${h.explicacion}</p>
        ${h.trampas ? `<p class="ayuda"><b>Trampas:</b> ${h.trampas}</p>` : ''}
        <p class="ayuda">${h.id} · Fuente: ${h.fuente || '—'}</p>
      </details>`).join('') || '<p class="vacio">No llegaste a responder ninguna pregunta.</p>';
    renderFormulas(el('fin-informe'));
    el('pantalla-fin').scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  // ---------- Bucle de tiempo (ATB) ----------

  function bucle(ahora) {
    if (!E || E.terminado) return;
    const dt = Math.min((ahora - E.ultimoTick) / 1000, 0.1);
    E.ultimoTick = ahora;

    if (!E.pausa) {
      E.tiempoTotal += dt;
      if (!E.pregunta) {
        E.atbJugador = Math.min(1, E.atbJugador + dt / CONFIG.cargaJugador);
        if (E.atbJugador >= 1) mostrarPregunta();
      } else {
        E.tiempoPregunta += dt;
      }
      const pensando = E.pregunta && E.modo === 'espera';
      if (!pensando) {
        E.atbJefe += dt / E.velocidad;
        if (E.atbJefe >= 1) ataqueDelJefe();
      }
    }
    dibujarBarras();
    requestAnimationFrame(bucle);
  }

  function dibujarBarras() {
    const v = Math.max(0, E.vida) / CONFIG.vidaJugador;
    el('vida-jugador').style.width = `${v * 100}%`;
    el('vida-jugador').classList.toggle('baja', v <= 0.3);
    el('vida-jugador-num').textContent = `${Math.max(0, Math.round(E.vida))} / ${CONFIG.vidaJugador}`;
    el('vida-jefe').style.width = `${(Math.max(0, E.vidaJefe) / E.jefe.vida) * 100}%`;
    el('vida-jefe-num').textContent = `${Math.max(0, Math.round(E.vidaJefe))} / ${E.jefe.vida}`;
    el('atb-jugador').style.width = `${E.atbJugador * 100}%`;
    el('atb-jugador').classList.toggle('lleno', E.atbJugador >= 1);
    el('atb-jefe').style.width = `${Math.min(1, E.atbJefe) * 100}%`;
    el('atb-jefe').classList.toggle('peligro', E.atbJefe > 0.75);
    el('combo').textContent = E.combo > 1 ? `Combo ×${E.combo}` : '';
  }

  function ataqueDelJefe() {
    E.atbJefe = 0;
    recibirDano(E.jefe.ataque, `¡El ${E.jefe.nombre} ${E.jefe.golpe}!`);
  }

  function recibirDano(cantidad, texto) {
    E.vida -= cantidad;
    E.danoRecibido += cantidad;
    mensaje(`${texto} (−${cantidad})`);
    const escena = el('escena');
    escena.classList.remove('sacudida');
    void escena.offsetWidth;
    escena.classList.add('sacudida');
    numeroFlotante(el('zona-jugador'), `−${cantidad}`, 'al-jugador');
    if (E.vida <= 0) {
      E.pausa = true; // congela las barras mientras termina la animación
      setTimeout(() => terminar(false), 700);
    }
  }

  // ---------- Preguntas ----------

  function siguientePregunta() {
    if (!E.cola.length) E.cola = mezclar(E.pool);
    return E.cola.pop();
  }

  function mostrarPregunta() {
    const q = siguientePregunta();
    E.pregunta = {
      q,
      opciones: mezclar([{ t: q.correcta, ok: true }, ...q.incorrectas.map(t => ({ t, ok: false }))]),
      ideal: (CONFIG.tiempoIdeal[q.tipo] || CONFIG.tiempoIdeal['teórica'])[q.dificultad] || 25,
    };
    E.tiempoPregunta = 0;
    el('pregunta-tema').innerHTML =
      `<span class="chip acento">Unidad ${ROMANOS[q.unidad]}</span><span class="chip">${q.tema}</span><span class="chip">${'★'.repeat(q.dificultad)}</span>`;
    el('pregunta-texto').innerHTML = q.enunciado;
    el('pregunta-opciones').innerHTML = E.pregunta.opciones
      .map((o, i) => `<button type="button" data-i="${i}"><b>${'ABCD'[i]})</b><span>${o.t}</span></button>`).join('');
    renderFormulas(el('ventana-pregunta'));
    el('ventana-pregunta').hidden = false;
    el('esperando').hidden = true;
    actualizarItems();
    mensaje('¡Tu turno!');
  }

  function ocultarPregunta() {
    el('ventana-pregunta').hidden = true;
    el('esperando').hidden = false;
  }

  function responder(i) {
    const P = E && E.pregunta;
    if (!P || E.terminado || E.pausa) return;
    const boton = el('pregunta-opciones').querySelector(`button[data-i="${i}"]`);
    if (!boton || boton.disabled) return;
    const q = P.q, elegida = P.opciones[i];
    const correcta = elegida.ok;
    const tiempo = E.tiempoPregunta;
    E.historial.push({
      id: q.id, unidad: q.unidad, tema: q.tema, enunciado: q.enunciado, correcta, dada: elegida.t, correctaTexto: q.correcta,
      explicacion: q.explicacion || '', trampas: q.trampas || '', fuente: q.fuente, tiempo, ideal: P.ideal,
    });

    if (correcta) {
      E.combo += 1;
      E.comboMax = Math.max(E.comboMax, E.combo);
      const vel = tiempo <= P.ideal * 0.5 ? 1.5 : tiempo <= P.ideal ? 1.2 : 1;
      const multCombo = Math.min(2, 1 + 0.25 * (E.combo - 1));
      const dano = Math.round((CONFIG.danoBase[q.dificultad] || 15) * vel * multCombo);
      E.vidaJefe -= dano;
      const extra = vel === 1.5 ? ' ¡Rapidísimo!' : vel === 1.2 ? ' ¡Rápido!' : '';
      mensaje(`¡Correcto!${extra} Le hacés ${dano} de daño.`);
      numeroFlotante(el('zona-jefe'), `−${dano}`, 'al-jefe');
      const sprite = el('sprite-jefe');
      sprite.classList.remove('golpeado');
      void sprite.offsetWidth;
      sprite.classList.add('golpeado');
    } else {
      E.combo = 0;
      recibirDano(CONFIG.contraataque, `Incorrecto: era «${q.correcta}». El ${E.jefe.nombre} contraataca`);
    }

    E.pregunta = null;
    E.atbJugador = 0;
    ocultarPregunta();
    actualizarItems();
    if (E.vidaJefe <= 0) {
      E.pausa = true;
      el('sprite-jefe').classList.add('derrotado');
      mensaje(`¡Derrotaste al ${E.jefe.nombre}!`);
      setTimeout(() => terminar(true), 900);
    }
  }

  // ---------- Ítems ----------

  function usarItem(item) {
    if (!E || E.terminado || E.pausa || E.items[item] <= 0) return;
    if (item === 'descarte') {
      if (!E.pregunta) { mensaje('El Descarte se usa durante tu turno.'); return; }
      const botones = [...el('pregunta-opciones').querySelectorAll('button')];
      const malas = botones.filter(b => !E.pregunta.opciones[Number(b.dataset.i)].ok && !b.disabled);
      mezclar(malas).slice(0, 2).forEach(b => { b.disabled = true; });
      mensaje('Usaste un Descarte: quedan dos opciones.');
    } else if (item === 'eter') {
      E.atbJefe = 0;
      mensaje(`Usaste un Éter: la barra del ${E.jefe.nombre} volvió a cero.`);
    } else if (item === 'pocion') {
      if (E.vida >= CONFIG.vidaJugador) { mensaje('Tu vida ya está completa.'); return; }
      const cura = Math.min(CONFIG.curaPocion, CONFIG.vidaJugador - E.vida);
      E.vida += cura;
      numeroFlotante(el('zona-jugador'), `+${Math.round(cura)}`, 'cura');
      mensaje(`Usaste una Poción: +${Math.round(cura)} de vida.`);
    }
    E.items[item] -= 1;
    actualizarItems();
  }

  function actualizarItems() {
    ['descarte', 'eter', 'pocion'].forEach(i => {
      el(`item-${i}-n`).textContent = E.items[i];
      el(`item-${i}`).disabled = E.items[i] <= 0 || (i === 'descarte' && !E.pregunta);
    });
  }

  // ---------- Efectos y formato ----------

  function mensaje(texto) { el('mensaje').textContent = texto; }

  function numeroFlotante(zona, texto, clase) {
    const n = document.createElement('div');
    n.className = `numero-flotante ${clase}`;
    n.textContent = texto;
    zona.appendChild(n);
    setTimeout(() => n.remove(), 1100);
  }

  function segundos(seg) { return fmt(seg, 1) + ' s'; }

  function formatoTiempo(seg) {
    const m = Math.floor(seg / 60), s = Math.floor(seg % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function alternarPausa(forzar) {
    if (!E || E.terminado) return;
    E.pausa = forzar !== undefined ? forzar : !E.pausa;
    el('btn-pausa').textContent = E.pausa ? '▶ Seguir' : '⏸ Pausa';
    el('velo-pausa').hidden = !E.pausa;
  }

  // ---------- Eventos ----------

  el('lista-jefes').addEventListener('click', ev => {
    const b = ev.target.closest('.jefe-tarjeta');
    if (b) elegirJefe(b.dataset.id);
  });
  el('btn-comenzar').addEventListener('click', iniciar);
  el('btn-revancha').addEventListener('click', iniciar);
  el('btn-otro-jefe').addEventListener('click', mostrarInicio);
  el('btn-pausa').addEventListener('click', () => alternarPausa());
  el('btn-rendirse').addEventListener('click', () => {
    if (!E || E.terminado) return;
    alternarPausa(true);
    if (confirm('¿Abandonar la batalla? Cuenta como derrota.')) terminar(false);
    else alternarPausa(false);
  });
  el('pregunta-opciones').addEventListener('click', ev => {
    const b = ev.target.closest('button[data-i]');
    if (b) responder(Number(b.dataset.i));
  });
  ['descarte', 'eter', 'pocion'].forEach(i => el(`item-${i}`).addEventListener('click', () => usarItem(i)));

  document.addEventListener('keydown', ev => {
    if (!E || E.terminado || el('pantalla-batalla').hidden || ev.ctrlKey || ev.metaKey || ev.altKey) return;
    const k = ev.key.toLowerCase();
    if (k === 'p') { alternarPausa(); ev.preventDefault(); return; }
    const i = '1234'.indexOf(k) >= 0 ? '1234'.indexOf(k) : 'abcd'.indexOf(k);
    if (i >= 0 && E.pregunta) { responder(i); ev.preventDefault(); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && E && !E.terminado && !E.pausa) alternarPausa(true);
  });

  // batalla.html#u5 abre con el jefe de la Unidad V elegido.
  const ids = JEFES.map(j => j.id);
  const inicial = parametroURL('jefe', ids);
  if (inicial && ids.includes(inicial)) jefe = JEFES.find(j => j.id === inicial);
  mostrarInicio();
  addEventListener('hashchange', () => {
    const id = parametroURL('jefe', ids);
    if (id && ids.includes(id) && !el('pantalla-inicio').hidden) elegirJefe(id);
  });
})();
