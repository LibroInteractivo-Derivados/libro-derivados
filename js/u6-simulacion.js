// Unidad VI · Simulaciones: replicante, árbol paso a paso, Arrow-Debreu, trayectorias,
// Black-Scholes con griegas y cobertura delta dinámica. Cada widget tiene un narrador que explica el porqué.

// Utilidades de la página
const cambios = (previo, actual) => (previo ? Object.keys(actual).filter(k => previo[k] !== actual[k]) : []);
function alfa(color, a) {
  if (/^#[0-9a-f]{6}$/i.test(color)) return color + Math.round(a * 255).toString(16).padStart(2, '0');
  return color;
}
function generador(semilla) { // mulberry32: números aleatorios reproducibles
  let t = semilla >>> 0;
  return () => { t += 0x6d2b79f5; let x = Math.imul(t ^ (t >>> 15), 1 | t); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}
const k4 = x => fmt(x, 4).replace(/,/g, '{,}');

// ======================================================================
// 1. Portafolio replicante
// ======================================================================

const narRep = crearNarrador($('r-narrador'), { titulo: 'Qué cambió y por qué' });
let repPrevio = null;

function simReplicante() {
  const d = { s0: numero('r-s0'), su: numero('r-su'), sd: numero('r-sd'), k: numero('r-k'), r: numero('r-r') / 100, t: numero('r-t'), tipo: elegido('r-tipo') };
  if ([d.s0, d.su, d.sd, d.k, d.r, d.t].some(Number.isNaN)) return datosInvalidos();
  if (!(d.su > d.sd)) { $('r-resultado').innerHTML = '<div class="alerta">El precio si sube tiene que ser mayor que el precio si baja.</div>'; return; }
  const x = Opciones.replicanteUnPaso({ S0: d.s0, Su: d.su, Sd: d.sd, K: d.k, r: d.r, T: d.t, tipo: d.tipo });
  const N = d.tipo === 'call' ? 'C' : 'P', crec = Math.exp(d.r * d.t);
  const accion = x.delta >= 0 ? `comprar ${fmt(x.delta, 4)} acciones` : `vender en corto ${fmt(-x.delta, 4)} acciones`;
  const caucion = x.B >= 0 ? `colocar ${fmt(x.B, 4)} en caución` : `tomar prestado ${fmt(-x.B, 4)}`;
  let html = x.hayArbitraje ? `<div class="alerta">No se cumple \\(d < e^{rT} < u\\): con estos datos hay arbitraje entre la acción y la caución, y el precio que sigue no tiene sentido económico.</div>` : '';
  html += `<div class="resultados">
      <div class="dato"><div class="dato-etiqueta">Pago si sube (${N}<sub>u</sub>)</div><div class="dato-valor">${fmt(x.Vu, 4)}</div></div>
      <div class="dato"><div class="dato-etiqueta">Pago si baja (${N}<sub>d</sub>)</div><div class="dato-valor">${fmt(x.Vd, 4)}</div></div>
      <div class="dato"><div class="dato-etiqueta">Δ (acciones)</div><div class="dato-valor">${fmt(x.delta, 4)}</div></div>
      <div class="dato"><div class="dato-etiqueta">B (caución)</div><div class="dato-valor">${fmt(x.B, 4)}</div></div>
      <div class="dato"><div class="dato-etiqueta">p neutral al riesgo</div><div class="dato-valor">${fmt(x.p, 4)}</div></div>
      <div class="dato destacado"><div class="dato-etiqueta">Precio de la opción</div><div class="dato-valor">${fmt(x.precio, 4)}</div></div>
    </div>
    <div class="explicacion">
      <p><b>Sistema:</b> \\(\\Delta \\cdot ${k4(d.su)} + B\\,e^{rT} = ${k4(x.Vu)}\\) y \\(\\Delta \\cdot ${k4(d.sd)} + B\\,e^{rT} = ${k4(x.Vd)}\\).</p>
      <p><b>Cartera replicante:</b> ${accion} y ${caucion}. Cuesta hoy \\(\\Delta S_0 + B = ${k4(x.precio)}\\).</p>
      <p><b>Neutral al riesgo:</b> \\(p = \\dfrac{e^{rT} - d}{u - d} = ${k4(x.p)}\\) y \\(${N}_0 = e^{-rT}[p\\,${N}_u + (1-p)\\,${N}_d] = ${k4(x.precioNeutral)}\\). Los dos enfoques coinciden.</p>
    </div>`;
  html += tablaHTML(
    [{ titulo: 'Al vencimiento' }, { titulo: `Si sube (${fmt(d.su)})`, num: true }, { titulo: `Si baja (${fmt(d.sd)})`, num: true }],
    [
      [`Δ acciones`, fmt(x.delta * d.su, 4), fmt(x.delta * d.sd, 4)],
      ['Caución con intereses', fmt(x.B * crec, 4), fmt(x.B * crec, 4)],
      ['<b>Cartera replicante</b>', fmt(x.delta * d.su + x.B * crec, 4), fmt(x.delta * d.sd + x.B * crec, 4)],
      [`<b>Opción (${d.tipo})</b>`, fmt(x.Vu, 4), fmt(x.Vd, 4)],
    ],
    i => (i >= 2 ? 'total' : ''),
  );
  $('r-resultado').innerHTML = html;
  renderFormulas($('r-resultado'));

  const ch = cambios(repPrevio, d);
  if (repPrevio && !ch.length) return;
  const que = `${d.tipo === 'call' ? 'Call' : 'Put'} = ${fmt(x.precio, 4)}: ${accion} y ${caucion}.`;
  const motivos = {
    s0: 'Cambió S₀ con los mismos precios futuros: los pagos y Δ no cambian, pero la cartera replicante incluye Δ acciones, que ahora cuestan distinto. También cambia p, porque u y d se miden contra S₀.',
    su: 'Cambió el escenario de suba: Δ = (pago si sube − pago si baja)/(S_u − S_d) se recalcula. Δ es cuántas acciones hacen falta para copiar la diferencia de pagos entre los dos escenarios.',
    sd: 'Cambió el escenario de baja: cambia la amplitud S_u − S_d y con ella Δ. Más amplitud con el mismo pago implica menos acciones por cada peso de diferencia.',
    k: d.tipo === 'call' ? 'Un strike más alto achica el pago del call en la suba: hacen falta menos acciones y el call vale menos.' : 'Un strike más alto agranda el pago del put en la baja: el put vale más.',
    r: d.tipo === 'call' ? 'Para replicar un call se toma deuda (B < 0). Con una tasa más alta, el valor presente de esa deuda es menor y el call vale más.' : 'Para replicar un put se coloca dinero (B > 0). Con más tasa, alcanza con colocar menos hoy: el put vale menos.',
    t: 'Cambió el plazo: cambia el factor e^(rT) con el que crece la caución (y p). El efecto es parecido al de cambiar la tasa.',
    tipo: d.tipo === 'call' ? 'El call se replica comprando acciones con deuda: Δ > 0 y B < 0.' : 'El put se replica vendiendo acciones en corto y colocando el dinero: Δ < 0 y B > 0.',
  };
  const porque = ch.length === 1 ? motivos[ch[0]] : 'La cartera de Δ acciones y B en caución paga exactamente lo mismo que la opción en los dos escenarios. Si la opción valiera otra cosa, habría arbitraje: por eso su precio es el costo de esa cartera, sin importar la probabilidad real de suba.';
  narRep.decir(que, porque + (x.hayArbitraje ? ' Ojo: con estos datos hay arbitraje.' : ''), x.hayArbitraje ? 'aviso' : '');
  repPrevio = d;
}
alCambiar('w-replicante', simReplicante);

// ======================================================================
// 2. Árbol binomial paso a paso
// ======================================================================

const AR = { res: null, datos: null, n: 2, etapa: 2, sel: null };

function leerArbol() {
  return { S: numero('a-s'), K: numero('a-k'), r: numero('a-r') / 100, sigma: numero('a-sigma') / 100, T: numero('a-t'), tipo: elegido('a-tipo'), americana: elegido('a-estilo') === 'americana' };
}
const pagoA = (S, K, tipo) => (tipo === 'call' ? Math.max(S - K, 0) : Math.max(K - S, 0));

function nodoInfo(i, j) {
  const { res, datos, n } = AR;
  const nd = res.arbol[i][j];
  const intr = pagoA(nd.S, datos.K, datos.tipo);
  if (i === n) return { nd, intr, final: true };
  const up = res.arbol[i + 1][j + 1], dn = res.arbol[i + 1][j];
  const seguir = Math.exp(-datos.r * res.dt) * (res.p * up.V + (1 - res.p) * dn.V);
  return { nd, intr, up, dn, seguir, delta: (up.V - dn.V) / (up.S - dn.S) };
}

function dibujarArbolU6() {
  const { res, n, etapa, sel } = AR;
  const COL = n > 4 ? 112 : 128, PASO = n > 4 ? 54 : 62, W = 98, H = 42;
  const alto = PASO * n + H + 46, ancho = 24 + n * COL + W + 10;
  const yc = (alto - 22) / 2, px = i => 12 + i * COL, py = (i, j) => yc - (j - i / 2) * PASO;
  let svg = `<svg viewBox="0 0 ${ancho} ${alto}" style="max-width:${ancho}px;margin:0 auto" role="group" aria-label="Árbol binomial. Elegí un nodo con el mouse o con Tab y Enter para ver su cálculo.">`;
  for (let i = 0; i < n; i++) for (let j = 0; j <= i; j++) {
    svg += `<line x1="${px(i) + W}" y1="${py(i, j)}" x2="${px(i + 1)}" y2="${py(i + 1, j + 1)}" class="s-trazo" stroke-width="1.2" opacity="0.55"/><line x1="${px(i) + W}" y1="${py(i, j)}" x2="${px(i + 1)}" y2="${py(i + 1, j)}" class="s-trazo" stroke-width="1.2" opacity="0.55"/>`;
  }
  for (let i = 0; i <= n; i++) {
    const visible = i >= n - etapa;
    for (let j = 0; j <= i; j++) {
      const nd = res.arbol[i][j], x = px(i), y = py(i, j) - H / 2;
      const esSel = sel && sel[0] === i && sel[1] === j;
      let estilo = 'fill:var(--superficie);stroke:var(--borde-fuerte, var(--eje))';
      if (visible && nd.anticipado) estilo = 'fill:var(--acento-suave);stroke:var(--acento)';
      else if (visible && i === n && nd.V > 0) estilo = 'fill:var(--ganancia-suave);stroke:var(--ganancia)';
      svg += `<g data-i="${i}" data-j="${j}" style="cursor:pointer" tabindex="0" role="button" aria-label="Paso ${i}, nodo ${j + 1}: S = ${fmt(nd.S)}, ${visible ? 'valor ' + fmt(nd.V, 3) + (nd.anticipado ? ', conviene ejercer' : '') : 'todavía sin calcular'}"><rect x="${x}" y="${y}" width="${W}" height="${H}" rx="6" style="${estilo}" stroke-width="${esSel ? 3 : nd.anticipado && visible ? 2.2 : 1.1}"/>
        <text x="${x + W / 2}" y="${y + 16}" text-anchor="middle" font-size="12" class="s-suave">S = ${fmt(nd.S)}</text>
        <text x="${x + W / 2}" y="${y + 33}" text-anchor="middle" font-size="13.5" font-weight="700" class="${visible ? 's-texto' : 's-suave'}">${visible ? fmt(nd.V, 3) + (nd.anticipado ? ' ★' : '') : '?'}</text></g>`;
    }
    svg += `<text x="${px(i) + W / 2}" y="${alto - 6}" text-anchor="middle" font-size="11.5" class="s-suave">t = ${fmt(i * res.dt, 2)}</text>`;
  }
  $('a-arbol').innerHTML = svg + '</svg>';
  $('a-etapa').textContent = etapa === n ? 'Árbol completo' : `Columnas calculadas: ${etapa + 1} de ${n + 1}`;
  $('a-atras').disabled = etapa === 0;
  $('a-adelante').disabled = etapa === n;
}

function explicarEtapa() {
  const { res, datos, n, etapa } = AR;
  const i = n - etapa, desc = Math.exp(-datos.r * res.dt);
  const tipoTxt = datos.tipo === 'call' ? 'máx(S − K; 0)' : 'máx(K − S; 0)';
  let html;
  if (etapa === 0) {
    const top = res.arbol[n][n];
    html = `<p><b>Paso 1 · Vencimiento (t = ${fmt(datos.T, 2)}).</b> Al vencimiento no hay nada que esperar: la opción vale su pago, ${tipoTxt}. Por ejemplo, en el nodo de arriba \\(S = ${k4(top.S)}\\) y el ${datos.tipo} vale \\(${k4(top.V)}\\). Los nodos verdes terminan dentro del dinero.</p>
      <p>Tocá <b>Calcular la columna anterior</b> para ir hacia atrás.</p>`;
  } else {
    const a = nodoInfo(i, i);
    const ejercidos = res.arbol[i].filter(nd => nd.anticipado);
    html = `<p><b>Paso ${etapa + 1} · t = ${fmt(i * res.dt, 2)}.</b> Cada nodo vale lo que se espera cobrar en el paso siguiente, con las probabilidades neutrales al riesgo \\(p = ${k4(res.p)}\\) y \\(1 - p\\), descontado un período:</p>
      <p>\\(V = e^{-r\\Delta t}[p\\,V_{suba} + (1-p)\\,V_{baja}]\\). ${i === 0 ? 'Hoy hay un solo nodo' : 'En el nodo de arriba'}: \\(${k4(desc)} \\times [${k4(res.p)} \\times ${k4(a.up.V)} + ${k4(1 - res.p)} \\times ${k4(a.dn.V)}] = ${k4(a.seguir)}\\).</p>
      ${datos.americana ? (ejercidos.length
        ? `<p>Como es <b>americana</b>, en cada nodo se compara ese valor con el de ejercer ya. En ${ejercidos.length === 1 ? 'el nodo marcado con ★' : `los ${ejercidos.length} nodos marcados con ★`} conviene ejercer: el valor intrínseco es mayor que el de seguir esperando.</p>`
        : '<p>Es americana, pero en esta columna no conviene ejercer en ningún nodo: seguir vale más que el valor intrínseco.</p>') : ''}
      ${etapa === n ? `<p><b>Resultado:</b> la opción vale \\(${k4(res.precio)}\\) hoy.${datos.americana ? '' : ` Black-Scholes da ${k4(Opciones.blackScholes(datos)[datos.tipo])}; la diferencia se achica con más pasos.`}</p>` : ''}`;
  }
  $('a-explica').innerHTML = html;
  renderFormulas($('a-explica'));
}

function explicarNodo(i, j) {
  const { res, datos, n } = AR;
  const x = nodoInfo(i, j);
  const desc = Math.exp(-datos.r * res.dt);
  let html = `<p><b>Nodo seleccionado:</b> t = ${fmt(i * res.dt, 2)}, ${j} ${j === 1 ? 'suba' : 'subas'} y ${i - j} ${i - j === 1 ? 'baja' : 'bajas'}: \\(S = ${k4(x.nd.S)}\\).</p>`;
  if (x.final) html += `<p>Es un nodo final: la opción vale su pago, \\(${k4(x.intr)}\\).</p>`;
  else {
    html += `<p>Seguir esperando vale \\(${k4(desc)} \\times [${k4(res.p)} \\times ${k4(x.up.V)} + ${k4(1 - res.p)} \\times ${k4(x.dn.V)}] = ${k4(x.seguir)}\\).</p>`;
    if (datos.americana) html += `<p>Ejercer ya daría \\(${k4(x.intr)}\\). ${x.nd.anticipado ? '<b>Conviene ejercer</b>: ' + (datos.tipo === 'put' ? 'cobrar K hoy y ganar el interés vale más que la posibilidad de que la acción siga bajando.' : 'el valor intrínseco supera al de seguir.') : 'Conviene seguir esperando.'}</p>`;
    html += `<p><b>Delta en este nodo:</b> \\(\\Delta = \\dfrac{${k4(x.up.V)} - ${k4(x.dn.V)}}{${k4(x.up.S)} - ${k4(x.dn.S)}} = ${k4(x.delta)}\\). Es la cantidad de acciones por opción que hay que tener en este nodo para cubrirla hasta el paso siguiente.</p>`;
  }
  $('a-explica').innerHTML = html + '<p class="ayuda">Tocá otro nodo o usá los botones para seguir el cálculo por columnas.</p>';
  renderFormulas($('a-explica'));
}

function simArbol(e) {
  const datos = leerArbol(), n = Number($('a-n').value);
  if ([datos.S, datos.K, datos.r, datos.sigma, datos.T].some(Number.isNaN) || datos.sigma <= 0 || datos.T <= 0) return datosInvalidos();
  const esCambio = e && e.type; // cambio de datos (no un re-render por tema)
  AR.datos = datos; AR.n = n; AR.res = Opciones.binomial({ ...datos, n, guardarArbol: true });
  if (esCambio || AR.etapa > n) { AR.etapa = n; AR.sel = null; }
  const res = AR.res, bs = Opciones.blackScholes(datos)[datos.tipo];
  const arbitraje = !(res.p > 0 && res.p < 1);
  $('a-datos').innerHTML = (arbitraje ? `<div class="alerta" style="grid-column: 1 / -1">No se cumple \\(d < e^{r\\Delta t} < u\\): la probabilidad neutral al riesgo da ${fmt(res.p, 4)}, fuera de 0 a 1. Con esta volatilidad tan baja frente a la tasa hay arbitraje entre la acción y la caución, y el precio del árbol no tiene sentido económico. Subí σ, bajá r o usá más pasos.</div>` : '') + `
    <div class="dato"><div class="dato-etiqueta">Δt</div><div class="dato-valor">${fmt(res.dt, 4)}</div></div>
    <div class="dato"><div class="dato-etiqueta">u</div><div class="dato-valor">${fmt(res.u, 4)}</div></div>
    <div class="dato"><div class="dato-etiqueta">d</div><div class="dato-valor">${fmt(res.d, 4)}</div></div>
    <div class="dato"><div class="dato-etiqueta">p = (e^(rΔt) − d)/(u − d)</div><div class="dato-valor">${fmt(res.p, 4)}</div></div>
    <div class="dato destacado"><div class="dato-etiqueta">Precio con el árbol</div><div class="dato-valor">${fmt(res.precio, 4)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Black-Scholes (europea)</div><div class="dato-valor">${fmt(bs, 4)}</div></div>`;
  if (arbitraje) renderFormulas($('a-datos'));
  dibujarArbolU6();
  if (AR.sel) explicarNodo(...AR.sel); else explicarEtapa();

  const c = coloresGrafico(), pts = [];
  for (let m = 1; m <= 100; m++) pts.push({ x: m, y: Opciones.binomial({ ...datos, n: m }).precio });
  dibujarGrafico($('a-convergencia'), {
    type: 'line',
    data: { datasets: [
      { label: `Árbol (${datos.americana ? 'americana' : 'europea'})`, data: pts, borderColor: c.acento, borderWidth: 1.8, pointRadius: 0 },
      { label: 'Black-Scholes (europea)', data: [{ x: 1, y: bs }, { x: 100, y: bs }], borderColor: c.texto, borderWidth: 1.4, borderDash: [6, 4], pointRadius: 0 },
    ] },
    options: opcionesEjes({ tituloX: 'Cantidad de pasos', tituloY: 'Precio de la opción', xMin: 1, xMax: 100, decX: 0, decY: 2 }),
  });
}
alCambiar('w-arbol', simArbol);
$('a-inicio').addEventListener('click', () => { AR.etapa = 0; AR.sel = null; dibujarArbolU6(); explicarEtapa(); });
$('a-atras').addEventListener('click', () => { AR.etapa = Math.max(0, AR.etapa - 1); AR.sel = null; dibujarArbolU6(); explicarEtapa(); });
$('a-adelante').addEventListener('click', () => { AR.etapa = Math.min(AR.n, AR.etapa + 1); AR.sel = null; dibujarArbolU6(); explicarEtapa(); });
$('a-todo').addEventListener('click', () => { AR.etapa = AR.n; AR.sel = null; dibujarArbolU6(); explicarEtapa(); });
function elegirNodo(g) {
  const i = Number(g.dataset.i), j = Number(g.dataset.j);
  if (i < AR.n - AR.etapa) AR.etapa = AR.n - i; // si estaba oculto, se calcula hasta esa columna
  AR.sel = [i, j];
  dibujarArbolU6();
  explicarNodo(i, j);
  const nuevo = $('a-arbol').querySelector(`g[data-i="${i}"][data-j="${j}"]`);
  if (nuevo && document.activeElement === document.body) nuevo.focus();
}
$('a-arbol').addEventListener('click', ev => {
  const g = ev.target.closest('g[data-i]');
  if (g) elegirNodo(g);
});
$('a-arbol').addEventListener('keydown', ev => {
  const g = ev.target.closest('g[data-i]');
  if (g && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); elegirNodo(g); }
});

// ======================================================================
// 3. Precios de Arrow-Debreu
// ======================================================================

const narAD = crearNarrador($('ad-narrador'), { titulo: 'Qué muestran los precios de estado' });
let adPrevio = null;
const PAGOS = {
  call: { nombre: 'call', f: (S, K) => Math.max(S - K, 0) },
  put: { nombre: 'put', f: (S, K) => Math.max(K - S, 0) },
  digital: { nombre: 'call digital', f: (S, K) => (S > K ? 1 : 0) },
  cuadrado: { nombre: 'derivado que paga S²', f: S => S * S },
  bono: { nombre: 'bono cupón cero de $1', f: () => 1 },
  accion: { nombre: 'acción', f: S => S },
};

function simAD() {
  const d = { S: numero('ad-s'), r: numero('ad-r') / 100, sigma: numero('ad-sigma') / 100, T: numero('ad-t'), n: Number($('ad-n').value), pago: $('ad-pago').value, K: numero('ad-k') };
  if ([d.S, d.r, d.sigma, d.T, d.K].some(Number.isNaN) || d.sigma <= 0 || d.T <= 0) return datosInvalidos();
  const dt = d.T / d.n, u = Math.exp(d.sigma * Math.sqrt(dt)), dd = 1 / u, p = (Math.exp(d.r * dt) - dd) / (u - dd);
  const ad = Opciones.preciosArrowDebreu({ r: d.r, T: d.T, n: d.n, p });
  const P = PAGOS[d.pago];
  const filas = ad.map(a => { const ST = d.S * Math.pow(u, a.j) * Math.pow(dd, d.n - a.j); const pg = P.f(ST, d.K); return { ...a, ST, pg, v: a.precio * pg }; });
  const suma = filas.reduce((s, f) => s + f.precio, 0), valor = filas.reduce((s, f) => s + f.v, 0);
  const bs = Opciones.blackScholes({ S: d.S, K: d.K, r: d.r, sigma: d.sigma, T: d.T });
  const exacto = { call: bs.call, put: bs.put, digital: Math.exp(-d.r * d.T) * bs.Nd2, cuadrado: d.S * d.S * Math.exp((d.r + d.sigma * d.sigma) * d.T), bono: Math.exp(-d.r * d.T), accion: d.S }[d.pago];
  const arbitrajeAD = !(p > 0 && p < 1);
  $('ad-datos').innerHTML = (arbitrajeAD ? `<div class="alerta" style="grid-column: 1 / -1">La probabilidad neutral al riesgo da ${fmt(p, 4)}, fuera de 0 a 1: no se cumple \\(d < e^{r\\Delta t} < u\\) y hay arbitraje. Con estos datos los precios de Arrow-Debreu no tienen sentido (algunos dan negativos). Subí σ, bajá r o usá más pasos.</div>` : '') + `
    <div class="dato"><div class="dato-etiqueta">p neutral al riesgo</div><div class="dato-valor">${fmt(p, 4)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Suma de precios AD</div><div class="dato-valor">${fmt(suma, 4)}</div><div class="dato-nota">= e^(−rT) = ${fmt(Math.exp(-d.r * d.T), 4)}</div></div>
    <div class="dato destacado"><div class="dato-etiqueta">Valor del ${P.nombre} (Σ AD × pago)</div><div class="dato-valor">${fmt(valor, 4)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Fórmula continua</div><div class="dato-valor">${fmt(exacto, 4)}</div></div>`;
  if (arbitrajeAD) renderFormulas($('ad-datos'));
  $('ad-tabla').innerHTML = tablaHTML(
    [{ titulo: 'Subas' }, { titulo: 'S<sub>T</sub>', num: true }, { titulo: 'Caminos', num: true }, { titulo: 'Prob. NR', num: true }, { titulo: 'Precio AD', num: true }, { titulo: 'Pago', num: true }, { titulo: 'AD × pago', num: true }],
    [...filas.slice().reverse().map(f => [String(f.j), fmt(f.ST, 2), String(f.caminos), fmt(f.prob, 4), fmt(f.precio, 4), fmt(f.pg, 2), fmt(f.v, 4)]),
      ['<b>Total</b>', '', '', fmt(filas.reduce((s, f) => s + f.prob, 0), 4), fmt(suma, 4), '', `<b>${fmt(valor, 4)}</b>`]],
    i => (i === filas.length ? 'total' : ''),
  );
  const c = coloresGrafico();
  const o = opcionesEjes({ tituloY: 'Precio', decY: 2 });
  o.scales.x = { type: 'category', title: { display: true, text: 'Precio de la acción al vencimiento', color: c.suave }, ticks: { color: c.suave }, grid: { display: false } };
  o.interaction = { mode: 'index', intersect: false };
  o.plugins.tooltip = {};
  dibujarGrafico($('ad-grafico'), {
    type: 'bar',
    data: { labels: filas.map(f => fmt(f.ST, 1)), datasets: [
      { label: 'Precio de Arrow-Debreu', data: filas.map(f => f.precio), backgroundColor: alfa(c.acento, 0.75) },
      ...(d.pago === 'bono' || d.pago === 'cuadrado' || d.pago === 'accion' ? [] : [{ label: 'Precio AD × pago', data: filas.map(f => f.v), backgroundColor: alfa(c.series[3], 0.75) }]),
    ] },
    options: o,
  });
  const ch = cambios(adPrevio, d);
  if (adPrevio && !ch.length) return;
  const motivos = {
    pago: 'Cambiaste el pago, no el árbol: los precios de Arrow-Debreu son los mismos. Valuar cualquier derivado es multiplicar su pago en cada nodo por el precio de ese nodo y sumar. Por eso los precios de estado son la "materia prima" de la valuación.',
    K: 'Con otro strike cambian los pagos, no los precios de estado.',
    sigma: 'Más volatilidad abre el árbol: más peso en los nodos extremos. Las opciones valen más (pagan en las puntas), pero la acción sigue valiendo S₀ y el bono e^(−rT).',
    r: 'Con más tasa, la suma de los precios AD (= e^(−rT), lo que vale un bono) baja, y p sube: el árbol neutral al riesgo pone más peso arriba para que la acción rinda r.',
    T: 'Con más plazo el árbol se abre más y la suma de precios (el factor de descuento) baja.',
    n: 'Con más pasos hay más nodos finales, y la distribución de S_T se parece cada vez más a la lognormal: el valor del árbol se acerca a la fórmula continua.',
    S: 'Cambió S₀: los precios AD no dependen de S₀ (solo de r, σ, T y n), pero los precios de la acción en cada nodo se escalan.',
  };
  const porque = ch.length === 1 && motivos[ch[0]] ? motivos[ch[0]] : 'Cada precio AD es lo que vale hoy cobrar $1 solo en ese nodo: e^(−rT) × probabilidad neutral al riesgo de llegar. Sumados dan e^(−rT), porque cobrar $1 en todos los nodos es un bono.';
  narAD.decir(`Valor del ${P.nombre}: ${fmt(valor, 4)} (fórmula continua: ${fmt(exacto, 4)}).`, porque);
  adPrevio = d;
}
alCambiar('w-ad', simAD);

// ======================================================================
// 4. Trayectorias y distribución lognormal
// ======================================================================

const narTr = crearNarrador($('t-narrador'), { titulo: 'Qué muestra la simulación' });
let trSemilla = 7, trPrevio = null;

function simTray(e) {
  const d = { S: numero('t-s'), mu: numero('t-mu') / 100, sigma: numero('t-sigma') / 100, T: numero('t-t'), K: numero('t-k') };
  if (Object.values(d).some(Number.isNaN) || d.S <= 0 || d.sigma <= 0 || d.T <= 0) return datosInvalidos();
  const rng = generador(trSemilla), z = () => Opciones.aleatorioNormal(rng);
  const pasos = Math.min(260, Math.max(12, Math.round(52 * d.T))), dt = d.T / pasos;
  const c = coloresGrafico();
  const caminos = [];
  for (let k = 0; k < 25; k++) {
    let S = d.S; const pts = [{ x: 0, y: S }];
    for (let i = 1; i <= pasos; i++) { S *= Math.exp((d.mu - d.sigma * d.sigma / 2) * dt + d.sigma * Math.sqrt(dt) * z()); pts.push({ x: i * dt, y: S }); }
    caminos.push(pts);
  }
  const N = 4000, m = Math.log(d.S) + (d.mu - d.sigma * d.sigma / 2) * d.T, s = d.sigma * Math.sqrt(d.T);
  const finales = []; for (let k = 0; k < N; k++) finales.push(Math.exp(m + s * z()));
  finales.sort((a, b) => a - b);
  const media = finales.reduce((a, b) => a + b, 0) / N, mediana = finales[N / 2];
  const probSim = finales.filter(x => x > d.K).length / N, prob = Opciones.probabilidadEjercicio({ S: d.S, K: d.K, mu: d.mu, sigma: d.sigma, T: d.T }).call;
  const lo = Math.exp(m - 3 * s), hi = Math.exp(m + 3.2 * s), B = 36, ancho = (hi - lo) / B;
  const cuenta = new Array(B).fill(0); finales.forEach(x => { const b = Math.floor((x - lo) / ancho); if (b >= 0 && b < B) cuenta[b]++; });
  const dens = x => Math.exp(-((Math.log(x) - m) ** 2) / (2 * s * s)) / (x * s * Math.sqrt(2 * Math.PI));
  $('t-datos').innerHTML = `
    <div class="dato"><div class="dato-etiqueta">E[S_T] = S₀·e^(μT)</div><div class="dato-valor">${fmt(d.S * Math.exp(d.mu * d.T), 2)}</div><div class="dato-nota">simulado: ${fmt(media, 2)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Mediana = S₀·e^((μ − σ²/2)T)</div><div class="dato-valor">${fmt(Math.exp(m), 2)}</div><div class="dato-nota">simulada: ${fmt(mediana, 2)}</div></div>
    <div class="dato destacado"><div class="dato-etiqueta">P(S_T > ${fmt(d.K, 0)}) = N(d₂) con μ</div><div class="dato-valor">${fmtPct(prob, 1)}</div><div class="dato-nota">simulada: ${fmtPct(probSim, 1)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Intervalo del 95 %</div><div class="dato-valor" style="font-size:1rem">${fmt(Math.exp(m - 1.96 * s), 1)} – ${fmt(Math.exp(m + 1.96 * s), 1)}</div></div>`;
  dibujarGrafico($('t-caminos'), {
    type: 'line',
    data: { datasets: [
      ...caminos.map((pts, k) => ({ label: k === 0 ? 'Trayectorias simuladas' : '', data: pts, borderColor: alfa(c.series[k % 5], 0.55), borderWidth: 1, pointRadius: 0 })),
      { label: 'Valor esperado S₀e^(μt)', data: Array.from({ length: 21 }, (_, i) => ({ x: (i * d.T) / 20, y: d.S * Math.exp((d.mu * i * d.T) / 20) })), borderColor: c.acento, borderWidth: 2.5, pointRadius: 0 },
      { label: `Nivel ${fmt(d.K, 0)}`, data: [{ x: 0, y: d.K }, { x: d.T, y: d.K }], borderColor: c.texto, borderDash: [5, 4], borderWidth: 1.2, pointRadius: 0 },
    ] },
    options: (() => { const o = opcionesEjes({ tituloX: 'Tiempo (años)', tituloY: 'Precio', xMin: 0, xMax: d.T, decX: 2, decY: 0 }); o.plugins.legend.labels.filter = it => it.text !== ''; o.plugins.tooltip = { enabled: false }; return o; })(),
  });
  dibujarGrafico($('t-histo'), {
    type: 'bar',
    data: { datasets: [
      { type: 'bar', label: `Simulación (${fmt(N, 0)} precios finales)`, data: cuenta.map((n2, b) => ({ x: lo + (b + 0.5) * ancho, y: n2 / (N * ancho) })), backgroundColor: alfa(c.acento, 0.35), borderColor: alfa(c.acento, 0.6), borderWidth: 1, barPercentage: 1, categoryPercentage: 1 },
      { type: 'line', label: 'Densidad lognormal teórica', data: Array.from({ length: 121 }, (_, i) => { const x = lo + ((hi - lo) * i) / 120; return { x, y: dens(x) }; }), borderColor: c.texto, borderWidth: 2, pointRadius: 0 },
    ] },
    options: (() => { const o = opcionesEjes({ tituloX: 'Precio al vencimiento S_T', tituloY: 'Densidad', xMin: lo, xMax: hi, decX: 0, decY: 3 }); o.plugins.tooltip = { enabled: false }; return o; })(),
  });
  const ch = cambios(trPrevio, d);
  const motivos = {
    mu: `Con otro μ toda la distribución se corre: el valor esperado pasa a ${fmt(d.S * Math.exp(d.mu * d.T), 2)}. Ojo: Black-Scholes no usa μ, porque valúa en el mundo neutral al riesgo (μ = r). μ sí importa para la probabilidad real de ejercicio.`,
    sigma: `Más volatilidad abre la distribución y la hace más asimétrica: la mediana (${fmt(Math.exp(m), 2)}) queda cada vez más por debajo de la media. La diferencia viene del término −σ²/2: muchas trayectorias terminan abajo y pocas muy arriba.`,
    T: 'Con más plazo la incertidumbre crece con √T: el abanico de trayectorias se abre.',
    K: `La probabilidad de terminar por encima de ${fmt(d.K, 0)} es N(d₂) calculado con μ: ${fmtPct(prob, 1)}.`,
    S: 'Cambió el precio inicial: toda la distribución se escala en la misma proporción.',
  };
  const esBoton = e && e.type === 'click';
  if (trPrevio && !ch.length && !esBoton) return;
  const que = esBoton ? 'Nueva simulación con los mismos parámetros.' : `S_T es lognormal: ln S_T ~ N(${fmt(m, 3)}; ${fmt(s, 3)}²).`;
  const porque = esBoton ? `Cada simulación da números un poco distintos (media ${fmt(media, 2)}, probabilidad ${fmtPct(probSim, 1)}), pero con 4.000 precios finales el histograma sigue de cerca a la curva teórica.`
    : ch.length === 1 && motivos[ch[0]] ? motivos[ch[0]] : 'El logaritmo del precio es normal, así que el precio no puede ser negativo y su distribución tiene cola larga a la derecha. Por eso la media supera a la mediana.';
  narTr.decir(que, porque);
  trPrevio = d;
}
alCambiar('w-tray', simTray);
$('t-otra').addEventListener('click', e => { trSemilla++; simTray(e); });

// ======================================================================
// 5. Black-Scholes y griegas
// ======================================================================

const narBS = crearNarrador($('b-narrador'), { titulo: 'Qué cambió y por qué' });
let bsPrevio = null;

function leerBS() {
  return { S: numero('b-s'), K: numero('b-k'), r: numero('b-r') / 100, sigma: numero('b-sigma') / 100, T: numero('b-t'), q: numero('b-q') / 100 };
}

function valorCurva(curva, tipo, p) {
  if (curva === 'precio') return Opciones.blackScholes(p)[tipo];
  const g = Opciones.griegas(p);
  if (!g) return NaN;
  if (curva === 'delta') return tipo === 'call' ? g.deltaCall : g.deltaPut;
  if (curva === 'gamma') return g.gamma;
  if (curva === 'theta') return (tipo === 'call' ? g.thetaCall : g.thetaPut) / 365;
  return g.vega / 100;
}

function simBS() {
  const d = leerBS();
  if (Object.values(d).some(Number.isNaN) || d.S <= 0 || d.K <= 0 || d.T <= 0 || d.sigma <= 0) return datosInvalidos();
  const bs = Opciones.blackScholes(d), g = Opciones.griegas(d);
  const tipo = elegido('b-tipo'), curva = $('b-curva').value;
  const dl = tipo === 'call' ? g.deltaCall : g.deltaPut, th = (tipo === 'call' ? g.thetaCall : g.thetaPut) / 365;
  $('b-datos').innerHTML = `
    <div class="dato"><div class="dato-etiqueta">d₁ / d₂</div><div class="dato-valor" style="font-size:1rem">${fmt(bs.d1, 4)} / ${fmt(bs.d2, 4)}</div></div>
    <div class="dato destacado"><div class="dato-etiqueta">Call europeo</div><div class="dato-valor">${fmt(bs.call, 4)}</div></div>
    <div class="dato destacado"><div class="dato-etiqueta">Put europeo</div><div class="dato-valor">${fmt(bs.put, 4)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Delta (${tipo})</div><div class="dato-valor">${fmt(dl, 4)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Gamma</div><div class="dato-valor">${fmt(g.gamma, 4)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Theta por día calendario, ÷365 (${tipo})</div><div class="dato-valor">${fmt(th, 4)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Vega por 1 % de σ</div><div class="dato-valor">${fmt(g.vega / 100, 4)}</div></div>`;
  const Sq = d.S * Math.exp(-d.q * d.T), Kr = d.K * Math.exp(-d.r * d.T), sq = d.q ? 'S_0e^{-\\delta T}' : 'S_0';
  $('b-detalle').innerHTML = `<div class="explicacion">
    <p>\\(c = ${sq}N(d_1) - Ke^{-rT}N(d_2) = ${k4(Sq)} \\times ${k4(bs.Nd1)} - ${k4(Kr)} \\times ${k4(bs.Nd2)} = ${k4(bs.call)}\\)</p>
    <p>\\(p = Ke^{-rT}N(-d_2) - ${sq}N(-d_1) = ${k4(bs.put)}\\). Paridad: \\(c + Ke^{-rT} = p + ${sq} = ${k4(bs.call + Kr)}\\).</p></div>`;
  renderFormulas($('b-detalle'));

  const c = coloresGrafico(), lo = d.K * 0.4, hi = d.K * 1.6, xs = [];
  for (let i = 0; i <= 120; i++) xs.push(lo + ((hi - lo) * i) / 120);
  const plazos = [d.T, d.T / 4, d.T / 20], tonos = [c.acento, c.series[3], c.series[0]];
  const datasets = plazos.map((t, i) => ({ label: `T = ${fmt(t, 2)} años`, data: xs.map(x => ({ x, y: valorCurva(curva, tipo, { ...d, S: x, T: t }) })), borderColor: tonos[i], borderWidth: i === 0 ? 2.5 : 1.6, pointRadius: 0 }));
  if (curva === 'precio') datasets.push({ label: 'Pago al vencimiento', data: xs.map(x => ({ x, y: Opciones.pagoAlVencimiento(tipo, x, d.K) })), borderColor: c.texto, borderWidth: 1.3, borderDash: [6, 4], pointRadius: 0 });
  datasets.push({ label: 'Hoy', data: [{ x: d.S, y: valorCurva(curva, tipo, d) }], showLine: false, pointRadius: 6, pointBackgroundColor: c.texto });
  const tituloY = { precio: `Precio del ${tipo}`, delta: `Delta del ${tipo}`, gamma: 'Gamma', theta: `Theta del ${tipo} (por día)`, vega: 'Vega (por punto de σ)' }[curva];
  dibujarGrafico($('b-grafico'), { type: 'line', data: { datasets }, options: opcionesEjes({ tituloX: 'Precio de la acción S', tituloY, xMin: lo, xMax: hi, decX: 0, decY: curva === 'precio' ? 1 : 3 }) });

  // Narrador: qué dato cambió y por qué se movieron los precios
  const actual = { ...d, call: bs.call, put: bs.put, tipo, curva };
  if (bsPrevio) {
    const ch = ['S', 'K', 'r', 'sigma', 'T', 'q'].filter(x => bsPrevio[x] !== d[x]);
    const nombres = { S: 'el precio de la acción', K: 'el strike', r: 'la tasa', sigma: 'la volatilidad', T: 'el plazo', q: 'el rendimiento por dividendos' };
    const dc = bs.call - bsPrevio.call, dp = bs.put - bsPrevio.put;
    const mov = `call ${fmt(bsPrevio.call, 2)} → ${fmt(bs.call, 2)} (${fmtSigno(dc)}); put ${fmt(bsPrevio.put, 2)} → ${fmt(bs.put, 2)} (${fmtSigno(dp)}).`;
    if (ch.length === 1) {
      const v = ch[0], sube = d[v] > bsPrevio[v];
      const por = {
        S: `El call es el derecho a comprar: si la acción vale más, vale más; el put, al revés. El cambio es aproximadamente delta × ΔS: con delta del call ${fmt(g.deltaCall, 2)} y del put ${fmt(g.deltaPut, 2)}. La diferencia con esa aproximación la explica gamma (la curva es convexa).`,
        K: 'Un strike más alto hace que comprar sea más caro (el call vale menos) y vender más rentable (el put vale más).',
        r: 'El strike se paga o se cobra al vencimiento: con más tasa su valor presente K·e^(−rT) es menor. El que tiene el call paga menos en valor presente (vale más); el del put cobra menos (vale menos). Es rho.',
        sigma: 'Más volatilidad sube el call y el put (vega > 0): quien tiene la opción aprovecha los movimientos favorables y su pérdida está limitada a la prima, así que más dispersión lo beneficia. Vega es máxima cerca del dinero.',
        T: `Con más plazo hay más incertidumbre (sube el valor de las dos) y el strike se descuenta más (sube el call, baja el put). ${dp < 0 ? 'Acá el segundo efecto domina para el put europeo: por eso puede valer menos con más plazo.' : 'Acá los dos suben.'} Es theta, mirado al revés.`,
        q: 'El dividendo baja el precio de la acción cuando se paga y quien tiene la opción no lo cobra: el call vale menos y el put más.',
      }[v];
      narBS.decir(`${sube ? 'Subió' : 'Bajó'} ${nombres[v]}: ${mov}`, por, (tipo === 'call' ? dc : dp) >= 0 ? 'pos' : 'neg');
    } else if (ch.length > 1) narBS.decir(`Cambiaron varios datos a la vez: ${mov}`, 'Para entender cada efecto, conviene mover un dato por vez.');
    else if (bsPrevio.curva !== curva) {
      const expl = {
        precio: 'El precio antes del vencimiento suele quedar por encima del pago: esa diferencia es el valor tiempo. Las excepciones son un put europeo muy dentro del dinero y, si la acción paga un rendimiento q, un call europeo muy dentro del dinero. A medida que T baja, la curva se pega al pago.',
        delta: 'Delta es la pendiente del precio. Va de 0 a 1 en el call (de −1 a 0 en el put) y cerca del vencimiento se vuelve un escalón en K: por eso la cobertura cerca del vencimiento es tan inestable.',
        gamma: 'Gamma es cuánto cambia delta. Es igual para el call y el put, máxima cerca del dinero y crece mucho al acercarse el vencimiento.',
        theta: 'Theta es lo que pierde la opción por el paso del tiempo. Es más negativa cerca del dinero y cerca del vencimiento: el valor tiempo se evapora al final.',
        vega: 'Vega mide la sensibilidad a la volatilidad. Es igual para call y put, máxima cerca del dinero y mayor cuanto más largo el plazo.',
      }[curva];
      narBS.decir(`Graficando: ${tituloY.toLowerCase()}.`, expl);
    }
  } else narBS.decir(`Call ${fmt(bs.call, 4)} y put ${fmt(bs.put, 4)}.`, 'Cambiá un dato por vez y acá aparece por qué se mueven los precios. Con el selector "Graficar" mirás cada griega.');
  bsPrevio = actual;
  simVolImplicita();
}

function simVolImplicita() {
  const d = leerBS(), precio = numero('v-precio'), tipo = elegido('v-tipo');
  if (Object.values(d).some(Number.isNaN) || Number.isNaN(precio)) return datosInvalidos();
  const vi = Opciones.volatilidadImplicita({ precio, tipo, ...d });
  $('v-resultado').textContent = Number.isNaN(vi) ? 'Precio fuera de rango' : fmtPct(vi);
}
alCambiar('w-bs', simBS);

// ======================================================================
// 6. Cobertura delta dinámica (Hull, cap. 19)
// ======================================================================

const narCo = crearNarrador($('c-narrador'), { titulo: 'Cómo funcionó la cobertura' });
let coSemilla = 11;
const CONTRATOS = 100000;

function leerCob() {
  return { S: numero('c-s'), K: numero('c-k'), r: numero('c-r') / 100, sigma: numero('c-sigma') / 100, mu: numero('c-mu') / 100, sem: Math.round(numero('c-sem')), frec: Number($('c-frec').value) };
}

// Simula una trayectoria y la cobertura. Devuelve filas y el costo en valor presente.
function cobertura(d, rng, guardar = true) {
  const T = d.sem / 52, pasos = Math.max(1, Math.round(d.sem / d.frec)), dt = T / pasos;
  let S = d.S, delta = Opciones.blackScholes({ S, K: d.K, r: d.r, sigma: d.sigma, T }).Nd1;
  let costo = delta * CONTRATOS * S;
  const filas = guardar ? [{ t: 0, S, delta, compra: delta * CONTRATOS, costoCompra: delta * CONTRATOS * S, acumulado: costo, interes: costo * (Math.exp(d.r * dt) - 1) }] : null;
  for (let i = 1; i <= pasos; i++) {
    const interes = costo * (Math.exp(d.r * dt) - 1);
    costo += interes;
    S *= Math.exp((d.mu - d.sigma * d.sigma / 2) * dt + d.sigma * Math.sqrt(dt) * Opciones.aleatorioNormal(rng));
    const resto = T - i * dt;
    const nuevo = resto > 1e-9 ? Opciones.blackScholes({ S, K: d.K, r: d.r, sigma: d.sigma, T: resto }).Nd1 : (S > d.K ? 1 : 0);
    const compra = (nuevo - delta) * CONTRATOS;
    costo += compra * S;
    delta = nuevo;
    if (guardar) filas.push({ t: i * dt, S, delta, compra, costoCompra: compra * S, acumulado: costo, interes: costo * (Math.exp(d.r * dt) - 1) });
  }
  const ejercida = S > d.K;
  const neto = costo - (ejercida ? d.K * CONTRATOS : 0);
  return { filas, S, ejercida, neto, vp: neto * Math.exp(-d.r * T), T };
}

function simCob(e) {
  const d = leerCob();
  if (Object.values(d).some(Number.isNaN) || d.S <= 0 || d.sigma <= 0 || d.sem < 1 || d.sem > 520) return datosInvalidos();
  const x = cobertura(d, generador(coSemilla));
  const bs = Opciones.blackScholes({ S: d.S, K: d.K, r: d.r, sigma: d.sigma, T: x.T }).call * CONTRATOS;
  const dif = x.vp - bs;
  $('c-datos').innerHTML = `
    <div class="dato"><div class="dato-etiqueta">Valor BS de los 100.000 calls</div><div class="dato-valor">${fmt(bs, 0)}</div></div>
    <div class="dato destacado"><div class="dato-etiqueta">Costo de cubrir (VP)</div><div class="dato-valor">${fmt(x.vp, 0)}</div><div class="dato-nota">${fmtSigno(dif, 0)} contra BS</div></div>
    <div class="dato"><div class="dato-etiqueta">Precio final</div><div class="dato-valor">${fmt(x.S, 2)}</div><div class="dato-nota">${x.ejercida ? 'se ejerce' : 'no se ejerce'}</div></div>
    <div class="dato"><div class="dato-etiqueta">Rebalanceos</div><div class="dato-valor">${x.filas.length - 1}</div></div>`;
  const c = coloresGrafico();
  const o = opcionesEjes({ tituloX: 'Semana', tituloY: 'Precio de la acción', xMin: 0, xMax: d.sem, decX: 0, decY: 1 });
  o.scales.y1 = { position: 'right', min: 0, max: 1, title: { display: true, text: 'Delta (acciones por call)', color: c.suave }, ticks: { color: c.suave, callback: v => fmt(v, 1) }, grid: { display: false } };
  dibujarGrafico($('c-grafico'), {
    type: 'line',
    data: { datasets: [
      { label: 'Precio de la acción', data: x.filas.map(f => ({ x: f.t * 52, y: f.S })), borderColor: c.acento, borderWidth: 2.2, pointRadius: x.filas.length < 30 ? 2.5 : 0 },
      { label: 'Strike', data: [{ x: 0, y: d.K }, { x: d.sem, y: d.K }], borderColor: c.texto, borderDash: [5, 4], borderWidth: 1.1, pointRadius: 0 },
      { label: 'Delta (eje derecho)', data: x.filas.map(f => ({ x: f.t * 52, y: f.delta })), borderColor: c.series[3], borderWidth: 1.8, stepped: 'before', pointRadius: 0, yAxisID: 'y1' },
    ] },
    options: o,
  });
  $('c-tabla').innerHTML = tablaHTML(
    [{ titulo: 'Semana', num: true }, { titulo: 'Precio', num: true }, { titulo: 'Delta', num: true }, { titulo: 'Acciones compradas', num: true }, { titulo: 'Costo de la compra (miles)', num: true }, { titulo: 'Costo acumulado con intereses (miles)', num: true }, { titulo: 'Interés del período (miles)', num: true }],
    x.filas.map(f => [(sem => fmt(sem, Number.isInteger(sem) ? 0 : 2))(Math.round(f.t * 5200) / 100), fmt(f.S, 2), fmt(f.delta, 3), fmt(f.compra, 0), fmt(f.costoCompra / 1000, 1), fmt(f.acumulado / 1000, 1), fmt(f.interes / 1000, 1)]),
  );
  const subas = x.filas.filter((f, i) => i > 0 && f.compra > 0).length, bajas = x.filas.length - 1 - subas;
  const esBoton = e && e.type === 'click';
  narCo.decir(
    `${esBoton ? 'Nueva trayectoria: ' : ''}la acción terminó en ${fmt(x.S, 2)}; la cobertura costó ${fmt(x.vp, 0)} en valor presente (${fmtSigno((dif / bs) * 100, 1)} % contra Black-Scholes).`,
    `El banco compra acciones cuando la acción sube (sube el delta) y vende cuando baja: compra caro y vende barato (${subas} compras y ${bajas} ventas). Esa pérdida sistemática es, en promedio, el precio de Black-Scholes: por eso cobrar ese precio por los calls lo deja cubierto. ${x.ejercida ? 'Como terminó por encima del strike, al final tiene 100.000 acciones y las entrega a K.' : 'Como terminó por debajo del strike, el delta llegó a 0 y ya no tiene acciones.'} Si rebalanceara de forma continua, el costo sería siempre el de Black-Scholes; con rebalanceos discretos queda un error, mayor cuanto mayor es gamma.`,
    Math.abs(dif / bs) < 0.1 ? 'pos' : 'aviso',
  );
}
alCambiar('w-cob', simCob);
$('c-otra').addEventListener('click', e => { coSemilla++; simCob(e); });

$('c-repetir').addEventListener('click', () => {
  const d = leerCob();
  if (Object.values(d).some(Number.isNaN) || d.S <= 0 || d.sigma <= 0 || d.sem < 1 || d.sem > 520) return datosInvalidos();
  const T = d.sem / 52, bs = Opciones.blackScholes({ S: d.S, K: d.K, r: d.r, sigma: d.sigma, T }).call * CONTRATOS;
  const HULL = { 5: 0.42, 4: 0.34, 2: 0.26, 1: 0.19, 0.5: 0.14, 0.25: 0.09 };
  const filas = [5, 4, 2, 1, 0.5, 0.25].map(f => {
    const rng = generador(1234), v = [];
    for (let i = 0; i < 500; i++) v.push(cobertura({ ...d, frec: f }, rng, false).vp);
    const media = v.reduce((a, b) => a + b, 0) / v.length, desvio = Math.sqrt(v.reduce((a, b) => a + (b - media) ** 2, 0) / (v.length - 1));
    return [f === 0.25 ? '¼' : f === 0.5 ? '½' : String(f), fmt(media, 0), fmt(desvio, 0), fmt(desvio / bs, 2), d.S === 49 && d.K === 50 && d.sem === 20 ? fmt(HULL[f], 2) : '—'];
  });
  $('c-desempeno').innerHTML = tablaHTML([{ titulo: 'Rebalanceo cada (semanas)' }, { titulo: 'Costo medio (VP)', num: true }, { titulo: 'Desvío del costo', num: true }, { titulo: 'Desvío / precio BS', num: true }, { titulo: 'Hull (tabla 19.4)', num: true }], filas)
    + `<p class="ayuda">Precio de Black-Scholes de los 100.000 calls: ${fmt(bs, 0)}. El costo medio se acerca a ese valor y el desvío cae aproximadamente a la mitad cada vez que la frecuencia se multiplica por cuatro (el error depende de √Δt).</p>`;
});
