// Motor de las páginas de Ejercitación.
//
// Cada unidad carga:
//   js/preguntas-base.js + js/preguntas-uN.js  → preguntas de opción múltiple (BANCO)
//   js/ejercicios-uN.js                        → ejercicios con respuesta numérica o conceptual (EJERCICIOS)
// y este archivo arma la página dentro de <div id="ejercitacion"></div>.
//
// ---------------------------------------------------------------------------
// Formato de un ejercicio (js/ejercicios-uN.js):
//
// window.EJERCICIOS = window.EJERCICIOS || [];   ← primera línea del archivo
// EJERCICIOS.push({
//   id: 'U5-03',                       // único
//   titulo: 'Límite inferior de un call y arbitraje',
//   fuente: 'Guía U5, ej. 3',          // o 'Nuevo', 'Hull 5.12', 'Parcial 2025'...
//   tema: 'Límites',                   // para filtrar
//   dificultad: 2,                     // 1 básica · 2 intermedia · 3 avanzada
//   enunciado: `<p>…</p>`,             // HTML; las fórmulas con \( … \)
//   campos: [                          // vacío o ausente = ejercicio conceptual
//     { etiqueta: 'Límite inferior ($)', respuesta: 3.66, tol: 0.01,
//       errores: [ { valor: 3.00, mensaje: 'No descontaste K.' } ] },   // diagnóstico de errores típicos
//     { etiqueta: '¿Qué opción conviene?', opciones: ['Call', 'Put'], respuesta: 'Call' },
//   ],
//   pistas: ['Primero calculá K·e^(−rT).'],
//   resolucion: `<p>…</p>`,            // paso a paso
//   respuestaModelo: `<p>…</p>`,       // para los conceptuales
//   herramienta: { texto: 'Abrir la calculadora de límites', enlace: 'herramientas.html#limites' },
//   aviso: 'La guía da 1.703.422; el cálculo correcto es…'   // opcional: diferencias con la guía
// });
//
// tol es la tolerancia absoluta (por defecto, 0,5 % del valor o 0,01, lo que sea mayor).
// ---------------------------------------------------------------------------

(function () {
  const unidadId = document.body.dataset.unidad;          // 'u5'
  const unidadNum = parseInt(unidadId.replace('u', ''), 10);
  const raiz = $('ejercitacion');
  if (!raiz) return;

  const ejercicios = window.EJERCICIOS || [];
  const preguntas = (typeof BANCO !== 'undefined' ? BANCO : []).filter(q => q.unidad === unidadNum);

  const DIF = { 1: 'Básica', 2: 'Intermedia', 3: 'Avanzada' };
  const claseDif = { 1: 'pos', 2: 'aviso', 3: 'neg' };

  // ---------- Esqueleto ----------
  raiz.innerHTML = `
    <div class="tabs" data-grupo="ej">
      <button data-tab="ejercicios" aria-selected="${ejercicios.length ? 'true' : 'false'}">Ejercicios (${ejercicios.length})</button>
      <button data-tab="autoevaluacion" aria-selected="${ejercicios.length ? 'false' : 'true'}">Autoevaluación de opción múltiple (${preguntas.length})</button>
    </div>
    <section data-panel="ejercicios" data-grupo="ej">
      <div class="marcador" id="ej-marcador"></div>
      <div class="filtros-ej">
        <label class="check" style="font-weight:600">Tema
          <select id="ej-tema"><option value="">Todos</option>${[...new Set(ejercicios.map(e => e.tema))].map(t => `<option>${t}</option>`).join('')}</select></label>
        <label class="check" style="font-weight:600">Origen
          <select id="ej-origen"><option value="">Todos</option><option value="guia">Guía de la cátedra</option><option value="nuevo">Adicionales del libro</option></select></label>
        <label class="check" style="font-weight:600">Dificultad
          <select id="ej-dif"><option value="">Todas</option><option value="1">Básica</option><option value="2">Intermedia</option><option value="3">Avanzada</option></select></label>
        <label class="check"><input type="checkbox" id="ej-pendientes"> Solo los que me faltan</label>
      </div>
      <div id="ej-lista"></div>
    </section>
    <section data-panel="autoevaluacion" data-grupo="ej" hidden>
      <p class="widget-intro">Armá un cuestionario al azar. Cada respuesta incorrecta muestra la "trampa": el error típico que lleva a esa opción. ¿Preferís repasar jugando? <a href="batalla.html#${unidadId}">Enfrentá al jefe de la unidad</a> con estas mismas preguntas.</p>
      <div class="filtros-ej">
        <label class="check" style="font-weight:600">Preguntas
          <select id="mc-cant"><option>5</option><option selected>10</option><option>20</option><option value="0">Todas</option></select></label>
        <label class="check" style="font-weight:600">Tipo
          <select id="mc-tipo"><option value="">Teóricas y prácticas</option><option value="teórica">Solo teóricas</option><option value="práctica">Solo prácticas</option></select></label>
        <label class="check" style="font-weight:600">Dificultad
          <select id="mc-dif"><option value="">Todas</option><option value="1">Básica</option><option value="2">Intermedia</option><option value="3">Avanzada</option></select></label>
        <button class="btn-primario" id="mc-generar" type="button">Nuevo cuestionario</button>
      </div>
      <div class="marcador" id="mc-marcador"></div>
      <div id="mc-lista"></div>
    </section>`;

  // ---------- Ejercicios ----------
  const resuelto = id => Guardado.leer('ej:' + id, false);
  const tolDe = c => (c.tol !== undefined ? c.tol : Math.max(0.01, Math.abs(c.respuesta) * 0.005));
  const esGuia = e => /gu[ií]a/i.test(e.fuente || '');

  function tarjetaEjercicio(e) {
    const campos = e.campos || [];
    const conceptual = campos.length === 0;
    const camposHTML = campos.map((c, i) => {
      const control = c.opciones
        ? `<select id="${e.id}-c${i}"><option value="">Elegí…</option>${c.opciones.map(o => `<option>${o}</option>`).join('')}</select>`
        : `<input id="${e.id}-c${i}" type="text" inputmode="decimal" autocomplete="off" placeholder="Tu resultado">`;
      return `<div class="ej-campo"><label for="${e.id}-c${i}">${c.etiqueta}</label>${control}<div class="marca-ej" id="${e.id}-m${i}"></div></div>`;
    }).join('');
    return `
      <article class="ejercicio ${resuelto(e.id) ? 'resuelto' : ''}" id="ej-${e.id}" data-id="${e.id}">
        <div class="ej-cabecera">
          <span class="ej-id">${e.id}</span>
          <span class="ej-titulo">${e.titulo}</span>
          <span class="chip ${esGuia(e) ? 'acento' : ''}">${e.fuente || 'Nuevo'}</span>
          <span class="chip ${claseDif[e.dificultad] || ''}">${DIF[e.dificultad] || ''}</span>
          ${conceptual ? '<span class="chip">Conceptual</span>' : ''}
          <span class="chip pos estado" ${resuelto(e.id) ? '' : 'hidden'}>✔ Resuelto</span>
        </div>
        <div class="ej-enunciado">${e.enunciado}</div>
        ${e.aviso ? `<div class="alerta" style="font-size:0.88rem">${e.aviso}</div>` : ''}
        ${conceptual ? '' : `<div class="ej-campos">${camposHTML}</div>`}
        <div class="botones">
          ${conceptual
            ? '<button class="btn-primario" data-accion="modelo" type="button">Ver la respuesta modelo</button>'
            : '<button class="btn-primario" data-accion="verificar" type="button">Verificar</button>'}
          ${(e.pistas || []).length ? '<button class="btn" data-accion="pista" type="button">Pista</button>' : ''}
          ${e.resolucion ? '<button class="btn" data-accion="resolucion" type="button">Ver la resolución</button>' : ''}
          ${e.herramienta ? `<a class="btn" href="${e.herramienta.enlace}">${e.herramienta.texto}</a>` : ''}
        </div>
        <div class="ej-pistas"></div>
        <div class="ej-resolucion" hidden>${e.resolucion || ''}</div>
        <div class="ej-modelo ej-resolucion" hidden>${e.respuestaModelo || ''}
          <div class="botones"><span>¿Cómo te fue?</span><button class="btn" data-accion="bien" type="button">La tenía bien</button><button class="btn" data-accion="repasar" type="button">Tengo que repasar</button></div>
        </div>
      </article>`;
  }

  function verificar(e, card) {
    let todos = true, alguno = false;
    (e.campos || []).forEach((c, i) => {
      const input = card.querySelector(`#${CSS.escape(e.id)}-c${i}`);
      const marca = card.querySelector(`#${CSS.escape(e.id)}-m${i}`);
      input.classList.remove('bien', 'mal');
      marca.classList.remove('bien', 'mal');
      marca.textContent = '';
      const crudo = input.value.trim();
      if (crudo === '') { todos = false; return; }
      alguno = true;
      let ok, msg;
      if (c.opciones) {
        ok = crudo === c.respuesta;
        msg = ok ? '✔ Correcto' : '✘ No es la opción correcta.';
      } else {
        const v = aNumero(crudo);
        if (Number.isNaN(v)) { ok = false; msg = '✘ No entiendo ese número. Usá coma o punto decimal.'; }
        else {
          const tol = tolDe(c);
          ok = Math.abs(v - c.respuesta) <= tol;
          if (ok) msg = '✔ Correcto';
          else {
            const diag = (c.errores || []).find(er => Math.abs(v - er.valor) <= tol);
            if (diag) msg = '✘ ' + diag.mensaje;
            else if (Math.abs(v + c.respuesta) <= tol && Math.abs(c.respuesta) > tol) msg = '✘ El valor es correcto pero el signo no: revisá desde el punto de vista de quién estás calculando.';
            else if (Math.abs(v - c.respuesta * 100) <= tol * 100 || Math.abs(v * 100 - c.respuesta) <= tol) msg = '✘ Parece un problema de unidades (decimal o porcentaje). Fijate cómo pide el resultado el enunciado.';
            else msg = '✘ No coincide. Revisá este paso.';
          }
        }
      }
      if (!ok) todos = false;
      input.classList.add(ok ? 'bien' : 'mal');
      marca.classList.add(ok ? 'bien' : 'mal');
      marca.textContent = msg;
    });
    if (alguno && todos) marcarResuelto(e, card, true);
  }

  function marcarResuelto(e, card, valor) {
    Guardado.escribir('ej:' + e.id, valor);
    card.classList.toggle('resuelto', valor);
    card.querySelector('.estado').hidden = !valor;
    actualizarMarcador();
  }

  function actualizarMarcador() {
    const total = ejercicios.length;
    const hechos = ejercicios.filter(e => resuelto(e.id)).length;
    const guia = ejercicios.filter(esGuia);
    $('ej-marcador').innerHTML = `
      <div class="dato destacado"><div class="dato-etiqueta">Resueltos</div><div class="dato-valor">${hechos} / ${total}</div></div>
      <div class="dato"><div class="dato-etiqueta">De la guía de la cátedra</div><div class="dato-valor">${guia.filter(e => resuelto(e.id)).length} / ${guia.length}</div></div>
      <div class="dato"><div class="dato-etiqueta">Adicionales del libro</div><div class="dato-valor">${total - guia.length}</div></div>`;
  }

  function filtrarEjercicios() {
    const tema = $('ej-tema').value, origen = $('ej-origen').value, dif = $('ej-dif').value, pend = $('ej-pendientes').checked;
    let visibles = 0;
    ejercicios.forEach(e => {
      const ok = (!tema || e.tema === tema)
        && (!origen || (origen === 'guia') === esGuia(e))
        && (!dif || String(e.dificultad) === dif)
        && (!pend || !resuelto(e.id));
      const card = $('ej-' + e.id);
      card.hidden = !ok;
      if (ok) visibles++;
    });
    const vacio = $('ej-vacio'); if (vacio) vacio.hidden = visibles > 0;
  }

  $('ej-lista').innerHTML = ejercicios.map(tarjetaEjercicio).join('') + '<p class="vacio" id="ej-vacio" hidden>No hay ejercicios con esos filtros.</p>';
  if (!ejercicios.length) $('ej-lista').innerHTML = '<p class="vacio">Los ejercicios con corrección automática de esta unidad se suman en la próxima entrega del libro. Mientras tanto, practicá con la autoevaluación de opción múltiple.</p>';
  renderFormulas($('ej-lista'));
  renderDiagramas();
  if (window.Chart) $('ej-lista').querySelectorAll('figure.grafico-payoff[data-patas]').forEach(dibujarGraficoPayoff);
  actualizarMarcador();
  ['ej-tema', 'ej-origen', 'ej-dif', 'ej-pendientes'].forEach(id => $(id).addEventListener('change', filtrarEjercicios));

  $('ej-lista').addEventListener('click', ev => {
    const btn = ev.target.closest('[data-accion]');
    if (!btn) return;
    const card = btn.closest('.ejercicio');
    const e = ejercicios.find(x => x.id === card.dataset.id);
    const accion = btn.dataset.accion;
    if (accion === 'verificar') verificar(e, card);
    if (accion === 'resolucion') {
      const r = card.querySelector('.ej-resolucion');
      r.hidden = !r.hidden;
      btn.textContent = r.hidden ? 'Ver la resolución' : 'Ocultar la resolución';
    }
    if (accion === 'modelo') { card.querySelector('.ej-modelo').hidden = false; btn.disabled = true; }
    if (accion === 'bien') marcarResuelto(e, card, true);
    if (accion === 'repasar') marcarResuelto(e, card, false);
    if (accion === 'pista') {
      const cont = card.querySelector('.ej-pistas');
      const dadas = cont.children.length;
      if (dadas < e.pistas.length) {
        const p = document.createElement('div');
        p.className = 'explicacion';
        p.innerHTML = `<b>Pista ${dadas + 1}:</b> ${e.pistas[dadas]}`;
        cont.appendChild(p);
        renderFormulas(p);
      }
      if (dadas + 1 >= e.pistas.length) btn.disabled = true;
    }
  });
  $('ej-lista').addEventListener('keydown', ev => {
    if (ev.key === 'Enter' && ev.target.matches('.ej-campo input')) {
      const card = ev.target.closest('.ejercicio');
      verificar(ejercicios.find(x => x.id === card.dataset.id), card);
    }
  });

  // Si se entra con #U5-03, ir directo a ese ejercicio.
  const destino = location.hash.replace('#', '');
  if (destino && $('ej-' + destino)) setTimeout(() => $('ej-' + destino).scrollIntoView({ block: 'start' }), 50);

  // ---------- Autoevaluación de opción múltiple ----------
  let cuestionario = [], respondidas = 0, correctas = 0;

  function mezclar(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  function generar() {
    const tipo = $('mc-tipo').value, dif = $('mc-dif').value, cant = parseInt($('mc-cant').value, 10);
    let pool = preguntas.filter(q => (!tipo || q.tipo === tipo) && (!dif || String(q.dificultad) === dif));
    pool = mezclar(pool);
    if (cant > 0) pool = pool.slice(0, cant);
    cuestionario = pool.map(q => ({ q, opciones: mezclar([{ t: q.correcta, ok: true }, ...q.incorrectas.map(t => ({ t, ok: false }))]) }));
    respondidas = 0; correctas = 0;
    $('mc-lista').innerHTML = cuestionario.length
      ? cuestionario.map((c, i) => `
        <article class="ejercicio" data-i="${i}">
          <div class="ej-cabecera"><span class="ej-id">${i + 1}</span><span class="chip">${c.q.tema}</span><span class="chip">${c.q.tipo}</span><span class="chip ${claseDif[c.q.dificultad] || ''}">${DIF[c.q.dificultad] || ''}</span></div>
          <div class="ej-enunciado"><p>${c.q.enunciado}</p></div>
          <div class="mc-opciones">${c.opciones.map((o, j) => `<button type="button" data-j="${j}"><b>${'abcd'[j]})</b><span>${o.t}</span></button>`).join('')}</div>
          <div class="ej-resolucion mc-expl" hidden></div>
        </article>`).join('')
      : '<p class="vacio">No hay preguntas con esos filtros.</p>';
    renderFormulas($('mc-lista'));
    marcadorMC();
  }

  function marcadorMC() {
    const total = cuestionario.length;
    $('mc-marcador').innerHTML = total ? `
      <div class="dato"><div class="dato-etiqueta">Respondidas</div><div class="dato-valor">${respondidas} / ${total}</div></div>
      <div class="dato destacado"><div class="dato-etiqueta">Correctas</div><div class="dato-valor">${correctas}</div></div>
      <div class="dato"><div class="dato-etiqueta">Nota</div><div class="dato-valor">${respondidas ? fmt((correctas / total) * 10, 1) : '—'}</div><div class="dato-nota">sobre 10, al terminar</div></div>` : '';
  }

  $('mc-lista').addEventListener('click', ev => {
    const b = ev.target.closest('button[data-j]');
    if (!b || b.disabled) return;
    const card = b.closest('.ejercicio');
    const c = cuestionario[parseInt(card.dataset.i, 10)];
    const j = parseInt(b.dataset.j, 10);
    card.querySelectorAll('.mc-opciones button').forEach((x, k) => { x.disabled = true; if (c.opciones[k].ok) x.classList.add('correcta'); });
    const ok = c.opciones[j].ok;
    if (!ok) b.classList.add('incorrecta');
    respondidas++; if (ok) correctas++;
    const ex = card.querySelector('.mc-expl');
    ex.hidden = false;
    ex.innerHTML = `<p><b class="${ok ? 'pos' : 'neg'}">${ok ? 'Correcto.' : 'Incorrecto.'}</b> ${c.q.explicacion}</p>${c.q.trampas ? `<p class="ayuda"><b>Trampas:</b> ${c.q.trampas}</p>` : ''}<p class="ayuda">Fuente: ${c.q.fuente || '—'}</p>`;
    renderFormulas(ex);
    marcadorMC();
  });
  $('mc-generar').addEventListener('click', generar);
  generar();
  prepararTabs();
})();
