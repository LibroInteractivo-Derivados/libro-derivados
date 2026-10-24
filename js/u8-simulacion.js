// Unidad VIII · Simulador de estrategias con opciones.
//
// Dos momentos:
//   - Cuando se arma la estrategia ("condiciones iniciales"): S₀, σ₀ y r definen las primas (Black-Scholes).
//   - El escenario que se explora con los deslizadores: precio de hoy, días transcurridos, σ y r.
// El gráfico muestra el resultado al vencimiento (horizonte) y el resultado si se cierra hoy.
// El narrador explica cada cambio con las griegas de la posición y con los tramos del payoff.
//
// Usa Payoff y Opciones (calculos.js), ESTRATEGIAS y construirEstrategia (estrategias.js)
// y las utilidades de comun.js (crearNarrador, controlRango, coloresGrafico...).

const ANIO = 360; // convención de la materia (30/360)

const E = {
  S0: 100, sigma0: 0.25, r: 0.05,      // condiciones iniciales
  S: 100, t: 0, sigma: 0.25,            // escenario (t = días transcurridos)
  patas: [],
  primasAuto: true,
  verPatas: false,
  verDist: false,
  estrategia: null,
};

const nar = crearNarrador($('narrador'), { titulo: 'Qué está pasando y por qué', maximo: 12 });

// ======================================================================
// Cálculos de la posición
// ======================================================================

const esOpcion = p => p.type === 'call' || p.type === 'put';
const signo = p => (p.side === 'compra' ? 1 : -1);
const tau = (p, t) => Math.max(p.dias - t, 0) / ANIO;

// Horizonte: el primer vencimiento entre opciones y bonos (si no hay, 90 días).
function horizonte() {
  const d = E.patas.filter(p => p.type !== 'stock').map(p => p.dias);
  return d.length ? Math.min(...d) : 90;
}
const hayCalendario = () => new Set(E.patas.filter(p => p.type !== 'stock').map(p => p.dias)).size > 1;

function primaTeorica(p) {
  if (p.type === 'stock') return E.S0;
  if (p.type === 'bond') return p.strike * Math.exp((-E.r * p.dias) / ANIO);
  const b = Opciones.blackScholes({ S: E.S0, K: p.strike, r: E.r, sigma: E.sigma0, T: p.dias / ANIO });
  return p.type === 'call' ? b.call : b.put;
}

function recalcularPrimas() {
  E.patas.forEach(p => {
    if (p.type === 'stock') { if (!p.manual) p.premium = Math.round(E.S0 * 100) / 100; return; }
    if (E.primasAuto && !p.manual) p.premium = Math.round(primaTeorica(p) * 100) / 100;
    if (p.premium === null || p.premium === undefined) p.premium = Math.round(primaTeorica(p) * 100) / 100;
  });
}

// Valor de mercado de una pata si el subyacente vale S y pasaron t días.
function valorPata(p, S, t, sigma = E.sigma, r = E.r) {
  const T = tau(p, t);
  if (p.type === 'stock') return S;
  if (p.type === 'bond') return p.strike * Math.exp(-r * T);
  if (T <= 1e-9) return p.type === 'call' ? Math.max(S - p.strike, 0) : Math.max(p.strike - S, 0);
  const b = Opciones.blackScholes({ S, K: p.strike, r, sigma, T });
  return p.type === 'call' ? b.call : b.put;
}
const resultadoPata = (p, S, t, sigma, r) => signo(p) * p.qty * (valorPata(p, S, t, sigma, r) - p.premium);
const resultado = (S, t, sigma = E.sigma, r = E.r) => E.patas.reduce((s, p) => s + resultadoPata(p, S, t, sigma, r), 0);
const costoNeto = () => E.patas.reduce((s, p) => s + signo(p) * p.qty * p.premium, 0);

// Griegas de la posición con el plazo propio de cada pata. Theta por día; vega por punto de σ.
function griegasPosicion(S = E.S, t = E.t, sigma = E.sigma, r = E.r) {
  const g = { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 };
  E.patas.forEach(p => {
    const k = signo(p) * p.qty, T = tau(p, t);
    if (p.type === 'stock') { g.delta += k; return; }
    if (p.type === 'bond') { g.theta += (k * r * p.strike * Math.exp(-r * T)) / ANIO; g.rho += (-k * T * p.strike * Math.exp(-r * T)) / 100; return; }
    if (T <= 1e-9) { g.delta += k * (p.type === 'call' ? (S > p.strike ? 1 : 0) : (S < p.strike ? -1 : 0)); return; }
    const x = Opciones.griegas({ S, K: p.strike, r, sigma, T });
    const call = p.type === 'call';
    g.delta += k * (call ? x.deltaCall : x.deltaPut);
    g.gamma += k * x.gamma;
    g.theta += (k * (call ? x.thetaCall : x.thetaPut)) / ANIO;
    g.vega += (k * x.vega) / 100;
    g.rho += (k * (call ? x.rhoCall : x.rhoPut)) / 100;
  });
  return g;
}

// Pata que más aporta a una griega ('theta' o 'vega') en el escenario dado.
function pataDominante(griega, S, t, sigma, r) {
  let mejor = null;
  E.patas.filter(esOpcion).forEach(p => {
    const T = tau(p, t);
    if (T <= 1e-9) return;
    const x = Opciones.griegas({ S, K: p.strike, r, sigma, T });
    const v = signo(p) * p.qty * (griega === 'vega' ? x.vega : (p.type === 'call' ? x.thetaCall : x.thetaPut));
    if (!mejor || Math.abs(v) > Math.abs(mejor.v)) mejor = { p, v };
  });
  return mejor;
}

// Análisis al horizonte: exacto si todas las patas vencen juntas; numérico si hay calendario.
function analizarHorizonte() {
  const H = horizonte();
  if (!hayCalendario()) {
    const legs = E.patas.map(p => ({ type: p.type, side: p.side, strike: p.strike, premium: p.premium, qty: p.qty }));
    return { ...Payoff.analyze(legs), exacto: true };
  }
  const max = Math.max(...E.patas.map(p => p.strike || 0), E.S0) * 4;
  let maxP = -Infinity, minP = Infinity, prev = null;
  const be = [];
  for (let i = 0; i <= 1200; i++) {
    const S = (max * i) / 1200 + 1e-6;
    const v = resultado(S, H);
    maxP = Math.max(maxP, v); minP = Math.min(minP, v);
    if (prev && prev.v * v < 0) be.push(prev.S - (prev.v * (S - prev.S)) / (v - prev.v));
    prev = { S, v };
  }
  const pendiente = (resultado(max * 3, H) - resultado(max * 2, H)) / max;
  if (pendiente > 1e-3) maxP = Infinity;
  if (pendiente < -1e-3) minP = -Infinity;
  return { maxProfit: maxP, maxLoss: minP, breakevens: be.map(x => Math.round(x * 1e8) / 1e8), netPremium: costoNeto(), exacto: false };
}

// Probabilidad (neutral al riesgo) de terminar con ganancia al horizonte, desde el escenario actual.
function probabilidadGanancia() {
  const H = horizonte(), T = Math.max(H - E.t, 0) / ANIO;
  if (T <= 1e-9) return resultado(E.S, H) > 0 ? 1 : 0;
  const m = Math.log(E.S) + (E.r - (E.sigma * E.sigma) / 2) * T, s = E.sigma * Math.sqrt(T);
  let p = 0;
  const n = 600, lo = m - 5 * s, hi = m + 5 * s, dx = (hi - lo) / n;
  for (let i = 0; i < n; i++) {
    const x = lo + (i + 0.5) * dx;
    if (resultado(Math.exp(x), H) > 0) p += Opciones.densidad((x - m) / s) * (dx / s);
  }
  return Math.min(1, Math.max(0, p));
}

// ======================================================================
// Textos
// ======================================================================

const fmtK = x => (Math.abs(x - Math.round(x)) < 1e-9 ? fmt(x, 0) : fmt(x));
const DIASTXT = d => (d === 1 ? '1 día' : `${fmt(d, 0)} días`);
function nombrePataLarga(p) {
  const op = p.side === 'compra' ? 'compra' : 'venta';
  if (p.type === 'stock') return `${op} de ${p.qty > 1 ? p.qty + ' acciones' : 'la acción'} a ${fmt(p.premium)}`;
  if (p.type === 'bond') return `${op} de un bono cupón cero (nominal ${fmtK(p.strike)})`;
  return `${op} de ${p.qty > 1 ? p.qty + ' ' : 'un '}${p.type} ${fmtK(p.strike)}${hayCalendario() ? ` a ${DIASTXT(p.dias)}` : ''}`;
}
function etiquetaCorta(p) {
  const op = p.side === 'compra' ? 'Long' : 'Short';
  if (p.type === 'stock') return `${op} acción`;
  if (p.type === 'bond') return `${op} bono ${fmt(p.strike, 0)}`;
  return `${op} ${p.qty > 1 ? p.qty + ' ' : ''}${p.type} ${fmt(p.strike, 0)}${hayCalendario() ? ` (${p.dias} d)` : ''}`;
}

// Para qué está cada pata (explicación del rol).
function rolPata(p) {
  const K = fmtK(p.strike);
  if (p.type === 'stock') return p.side === 'compra' ? 'gana 1 por cada peso que sube el subyacente, sin techo; pierde si baja.' : 'gana si el subyacente baja; pierde sin límite si sube.';
  if (p.type === 'bond') return `paga ${fmt(p.strike)} al vencimiento pase lo que pase: es la parte garantizada.`;
  if (p.type === 'call') return p.side === 'compra'
    ? `da el derecho a comprar a ${K}: aporta la ganancia si el precio supera ${K}, con una pérdida máxima igual a la prima.`
    : `obliga a vender a ${K} si te lo piden: cobrás la prima pero resignás lo que el precio suba por encima de ${K}.`;
  return p.side === 'compra'
    ? `da el derecho a vender a ${K}: protege o gana si el precio cae por debajo de ${K}.`
    : `obliga a comprar a ${K} si te lo piden: cobrás la prima pero absorbés las caídas por debajo de ${K}.`;
}

// Qué pasa en cada pata si al horizonte el precio es S.
function lecturaTramo(S) {
  const H = horizonte();
  const items = E.patas.map(p => {
    const r = resultadoPata(p, S, H);
    let estado;
    if (p.type === 'stock') estado = `vale ${fmt(S)}`;
    else if (p.type === 'bond') estado = `paga ${fmt(p.strike)}`;
    else if (p.dias > H) estado = `sigue viva (le quedan ${DIASTXT(p.dias - H)}) y vale ${fmt(valorPata(p, S, H))} por Black-Scholes`;
    else {
      const itm = p.type === 'call' ? S > p.strike : S < p.strike;
      estado = itm
        ? `<b>se ejerce</b>: paga ${fmt(Math.abs(S - p.strike))} (${p.type === 'call' ? 'S − K' : 'K − S'})`
        : 'vence <b>sin valor</b> (fuera del dinero)';
    }
    return `<li><b>${etiquetaCorta(p)}</b>: ${estado}. Resultado ${fmtSigno(r)}.</li>`;
  });
  const tot = resultado(S, H);
  return `<p style="margin-top:0"><b>Si al ${hayCalendario() ? `día ${H} (vence la primera pata)` : 'vencimiento'} el subyacente vale ${fmt(S)}:</b></p><ul style="margin:4px 0">${items.join('')}</ul>
    <p style="margin-bottom:0">Total: <b class="${claseSigno(tot)}">${fmtSigno(tot)}</b>${Math.abs(costoNeto()) > 0.004 ? ` (ya descontado el ${costoNeto() > 0 ? 'costo neto pagado' : 'ingreso neto cobrado'} de ${fmt(Math.abs(costoNeto()))})` : ''}.</p>`;
}

function textoMaximo(v, tipo) {
  if (v === Infinity || v === -Infinity) return 'ilimitada';
  return fmt(Math.abs(v));
}

// ======================================================================
// Controles del escenario
// ======================================================================

function rangoPrecio() {
  const precios = E.patas.filter(p => esOpcion(p) || p.type === 'bond').map(p => p.strike).concat(E.S0);
  const lo = Math.min(...precios), hi = Math.max(...precios);
  return [Math.max(0, Math.floor(lo * 0.6)), Math.ceil(hi * 1.4)];
}

function armarControles() {
  const [lo, hi] = rangoPrecio();
  const H = horizonte();
  E.S = Math.min(Math.max(E.S, lo), hi);
  E.t = Math.min(E.t, H);
  $('c-s').innerHTML = controlRango({ id: 'esc-s', etiqueta: 'Precio del subyacente hoy', min: lo, max: hi, paso: (hi - lo) / 400, valor: E.S, formato: v => fmt(v) });
  $('c-t').innerHTML = controlRango({ id: 'esc-t', etiqueta: `Días transcurridos (vence a los ${H})`, min: 0, max: H, paso: 1, valor: E.t, formato: v => `${fmt(v, 0)} (faltan ${fmt(H - v, 0)})` });
  $('c-sigma').innerHTML = controlRango({ id: 'esc-sigma', etiqueta: 'Volatilidad σ hoy', min: 5, max: 80, paso: 0.5, valor: E.sigma * 100, formato: v => fmt(v, 1) + ' %' });
  $('c-r').innerHTML = controlRango({ id: 'esc-r', etiqueta: 'Tasa r', min: 0, max: 30, paso: 0.25, valor: E.r * 100, formato: v => fmt(v, 2) + ' %' });
  vincularRango('esc-s', v => fmt(v));
  vincularRango('esc-t', v => `${fmt(v, 0)} (faltan ${fmt(H - v, 0)})`);
  vincularRango('esc-sigma', v => fmt(v, 1) + ' %');
  vincularRango('esc-r', v => fmt(v, 2) + ' %');
}

function ponerControl(id, valor) {
  const el = $(id);
  if (!el) return;
  el.value = valor;
  el.dispatchEvent(new Event('input'));
}

// ======================================================================
// Dibujo
// ======================================================================

function dibujar() {
  const hay = E.patas.length > 0;
  $('w-sim').hidden = !hay;
  if (!hay) { $('cuadro').innerHTML = ''; $('cuadro-cab').innerHTML = ''; $('griegas').innerHTML = ''; return; }

  const H = horizonte();
  const a = analizarHorizonte();
  const ahora = resultado(E.S, E.t);
  const g = griegasPosicion();
  const prob = probabilidadGanancia();
  const costo = costoNeto();

  // Indicadores
  $('tiles').innerHTML = `
    <div class="dato"><div class="dato-etiqueta">${costo >= 0 ? 'Costo neto (débito)' : 'Ingreso neto (crédito)'}</div><div class="dato-valor">${fmt(Math.abs(costo))}</div></div>
    <div class="dato"><div class="dato-etiqueta">Ganancia máxima</div><div class="dato-valor pos">${textoMaximo(a.maxProfit)}</div></div>
    <div class="dato"><div class="dato-etiqueta">${a.maxLoss >= 0 ? 'Resultado mínimo' : 'Pérdida máxima'}</div><div class="dato-valor ${a.maxLoss < 0 ? 'neg' : 'pos'}">${textoMaximo(a.maxLoss)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Break-even</div><div class="dato-valor" style="font-size:0.98rem">${a.breakevens.length ? a.breakevens.map(x => fmt(x, decPrecio(E.S0))).join(' · ') : 'No tiene'}</div></div>
    <div class="dato destacado"><div class="dato-etiqueta">${E.t >= H ? 'Resultado al vencimiento' : 'Si cerrás hoy'}</div><div class="dato-valor ${claseSigno(ahora)}">${fmtSigno(ahora)}</div><div class="dato-nota">S = ${fmt(E.S)} · faltan ${fmt(H - E.t, 0)} d</div></div>
    <div class="dato"><div class="dato-etiqueta">Prob. de ganar al vencimiento</div><div class="dato-valor">${fmt(prob * 100, 1)} %</div><div class="dato-nota">neutral al riesgo</div></div>`;

  // Gráfico
  const [lo, hi] = rangoPrecio();
  const xs = [];
  for (let i = 0; i <= 240; i++) xs.push(lo + ((hi - lo) * i) / 240);
  E.patas.forEach(p => { if (esOpcion(p) && p.strike > lo && p.strike < hi) xs.push(p.strike); });
  xs.sort((x, y) => x - y);
  const c = coloresGrafico();
  const datasets = [{
    label: hayCalendario() ? `Al día ${H} (vence la primera pata)` : 'Al vencimiento',
    data: xs.map(x => ({ x, y: resultado(x, H) })),
    borderColor: c.acento, borderWidth: 2.6, pointRadius: 0,
    fill: { target: 'origin', above: c.rellenoGanancia, below: c.rellenoPerdida }, order: 2,
  }];
  if (E.t < H) datasets.push({
    label: `Si cerrás hoy (faltan ${H - E.t} d, σ ${fmt(E.sigma * 100, 1)} %)`,
    data: xs.map(x => ({ x, y: resultado(x, E.t) })),
    borderColor: c.acento, borderWidth: 1.8, borderDash: [6, 5], pointRadius: 0, order: 1,
  });
  if (E.verPatas) E.patas.forEach((p, i) => datasets.push({
    label: etiquetaCorta(p), data: xs.map(x => ({ x, y: resultadoPata(p, x, H) })),
    borderColor: c.series[i % c.series.length], borderWidth: 1.3, borderDash: [3, 4], pointRadius: 0, order: 3,
  }));
  datasets.push({
    label: 'Break-even', data: a.breakevens.filter(x => x >= lo && x <= hi).map(x => ({ x, y: 0 })),
    showLine: false, pointRadius: 5, pointBackgroundColor: c.eje, pointBorderColor: c.superficie, pointBorderWidth: 2, order: 0,
  });
  datasets.push({
    label: 'Escenario actual', data: [{ x: E.S, y: ahora }], showLine: false,
    pointRadius: 7, pointBackgroundColor: c.acento, pointBorderColor: c.superficie, pointBorderWidth: 2, order: 0,
  });
  const ys = datasets[0].data.map(p => p.y).concat(E.t < H ? datasets[1].data.map(p => p.y) : []);
  let yMin = Math.min(...ys, 0), yMax = Math.max(...ys, 0);
  const margen = (yMax - yMin) * 0.08 || 1;
  yMin -= margen; yMax += margen;
  datasets.push({
    label: 'Precio hoy', data: [{ x: E.S, y: yMin }, { x: E.S, y: yMax }],
    borderColor: c.suave, borderWidth: 1, borderDash: [2, 3], pointRadius: 0, order: 4,
  });
  if (E.verDist) {
    const T = Math.max(H - E.t, 0) / ANIO;
    if (T > 0) {
      const m = Math.log(E.S) + (E.r - E.sigma * E.sigma / 2) * T, s = E.sigma * Math.sqrt(T);
      const dens = xs.map(x => (x > 0 ? Opciones.densidad((Math.log(x) - m) / s) / (x * s) : 0));
      const maxD = Math.max(...dens) || 1;
      datasets.push({
        label: 'Distribución del precio al vencimiento', data: xs.map((x, i) => ({ x, y: yMin + ((dens[i] / maxD) * (yMax - yMin)) * 0.35 })),
        borderColor: 'transparent', pointRadius: 0, order: 5,
        fill: { target: { value: yMin }, above: token('--acento-suave') },
      });
    }
  }
  $('ley-hoy').hidden = E.t >= H;
  $('ley-dist').hidden = !E.verDist;
  const opciones = opcionesEjes({ tituloX: 'Precio del subyacente', tituloY: 'Resultado', xMin: lo, xMax: hi, yMin, yMax, leyenda: false });
  opciones.plugins.tooltip.filter = item => !['Precio hoy', 'Distribución del precio al vencimiento'].includes(item.dataset.label);
  dibujarGrafico($('grafico'), { type: 'line', data: { datasets }, options: opciones });

  // Lectura del tramo
  $('tramo').innerHTML = lecturaTramo(E.S);

  // Griegas
  const dirDelta = g.delta > 0.005 ? 'alcista' : g.delta < -0.005 ? 'bajista' : 'neutral';
  $('griegas').innerHTML = `
    <div class="dato"><div class="dato-etiqueta">Delta Δ</div><div class="dato-valor">${fmt(g.delta, 3)}</div>
      <p>Posición ${dirDelta}: si el subyacente sube 1, el resultado cambia ≈ ${fmtSigno(g.delta, 2)}. Equivale a tener ${fmt(Math.abs(g.delta), 2)} acciones ${g.delta >= 0 ? 'compradas' : 'vendidas'}.</p></div>
    <div class="dato"><div class="dato-etiqueta">Gamma Γ</div><div class="dato-valor">${fmt(g.gamma, 4)}</div>
      <p>${g.gamma > 1e-4 ? 'Positiva: los movimientos grandes te favorecen (la delta crece cuando sube y baja cuando cae).' : g.gamma < -1e-4 ? 'Negativa: los movimientos grandes te perjudican; la delta se mueve en tu contra.' : 'Casi cero: la delta casi no cambia con el precio.'}</p></div>
    <div class="dato"><div class="dato-etiqueta">Theta Θ (por día, año de 360)</div><div class="dato-valor ${claseSigno(g.theta)}">${fmtSigno(g.theta, 3)}</div>
      <p>${g.theta < -1e-4 ? 'Cada día que pasa sin que se mueva el precio, perdés esto: estás comprado en valor tiempo.' : g.theta > 1e-4 ? 'Cada día que pasa sin que se mueva el precio, ganás esto: cobraste valor tiempo y se va consumiendo a tu favor.' : 'El paso del tiempo casi no te afecta.'}</p></div>
    <div class="dato"><div class="dato-etiqueta">Vega (por 1 punto de σ)</div><div class="dato-valor ${claseSigno(g.vega)}">${fmtSigno(g.vega, 3)}</div>
      <p>${g.vega > 1e-4 ? 'Largo en volatilidad: si la volatilidad sube un punto, ganás esto.' : g.vega < -1e-4 ? 'Corto en volatilidad: si la volatilidad sube un punto, perdés esto.' : 'La volatilidad casi no te afecta.'}</p></div>
    <div class="dato"><div class="dato-etiqueta">Rho (por 1 punto de r)</div><div class="dato-valor">${fmtSigno(g.rho, 3)}</div>
      <p>Efecto de una suba de la tasa de un punto porcentual. Suele ser el menos importante en plazos cortos.</p></div>`;

  // Cuadro
  const precios = new Set();
  for (let k = 0.7; k <= 1.3001; k += 0.1) precios.add(Math.round(E.S0 * k * 100) / 100);
  E.patas.filter(esOpcion).forEach(p => precios.add(p.strike));
  a.breakevens.forEach(b => precios.add(b));
  precios.add(Math.round(E.S * 100) / 100);
  const lista = [...precios].filter(x => x > 0).sort((x, y) => x - y);
  $('cuadro-cab').innerHTML = `<tr><th>Precio${hayCalendario() ? ` al día ${H}` : ' al vencimiento'}</th>${E.patas.map(p => `<th class="num">${etiquetaCorta(p)}</th>`).join('')}<th class="num">Total</th></tr>`;
  $('cuadro').innerHTML = lista.map(S => {
    const tot = resultado(S, H);
    const nota = Math.abs(S - E.S) < 0.005 ? ' (escenario)' : a.breakevens.includes(S) ? ' (break-even)' : '';
    return `<tr class="${nota === ' (escenario)' ? 'fila-actual' : ''}"><td>${fmt(S)}${nota}</td>${E.patas.map(p => { const v = resultadoPata(p, S, H); return `<td class="num ${claseSigno(v)}">${fmt(v)}</td>`; }).join('')}<td class="num ${claseSigno(tot)}"><strong>${fmt(tot)}</strong></td></tr>`;
  }).join('');
}

// ======================================================================
// Narración de los cambios del escenario
// ======================================================================

let base = null;       // foto del estado cuando empezó la interacción con un control
let controlActivo = null;
let entradaNueva = true;

function foto() {
  return { S: E.S, t: E.t, sigma: E.sigma, r: E.r, v: resultado(E.S, E.t), g: griegasPosicion(), a: analizarHorizonte() };
}

function narrarEscenario(control) {
  if (!E.patas.length) return;
  const ahora = foto();
  const dv = ahora.v - base.v;
  const H = horizonte();
  const cambio = `El resultado pasó de ${fmtSigno(base.v)} a ${fmtSigno(ahora.v)} (${fmtSigno(dv)}).`;
  let que = '', porque = '', tipo = dv > 0.005 ? 'pos' : dv < -0.005 ? 'neg' : '';

  if (control === 'S') {
    const dS = ahora.S - base.S;
    if (Math.abs(dS) < 1e-9) return;
    const aprox = base.g.delta * dS, aprox2 = aprox + 0.5 * base.g.gamma * dS * dS;
    que = `El subyacente ${dS > 0 ? 'subió' : 'bajó'} de ${fmt(base.S)} a ${fmt(ahora.S)}. ${cambio}`;
    porque = `Tu delta era ${fmt(base.g.delta, 3)}: por cada peso de ${dS > 0 ? 'suba' : 'baja'} la posición cambia ≈ ${fmtSigno(base.g.delta, 3)}, o sea ≈ ${fmtSigno(aprox)}.`;
    if (Math.abs(base.g.gamma) > 1e-4 && Math.abs(dv - aprox) > 0.02) porque += ` La diferencia con el resultado real la explica gamma (${fmt(base.g.gamma, 4)}): ${base.g.gamma > 0 ? 'la delta se fue moviendo a tu favor' : 'la delta se fue moviendo en tu contra'} (Δ + ½Γ·ΔS² da ≈ ${fmtSigno(aprox2)}).`;
    // ¿cruzó un strike o un break-even?
    const cruces = [];
    E.patas.filter(esOpcion).forEach(p => { if ((base.S - p.strike) * (ahora.S - p.strike) < 0) cruces.push(`el strike ${fmtK(p.strike)} (${etiquetaCorta(p)} pasa a estar ${(p.type === 'call') === (ahora.S > p.strike) ? 'dentro' : 'fuera'} del dinero)`); });
    ahora.a.breakevens.forEach(b => { if ((base.S - b) * (ahora.S - b) < 0) cruces.push(`el break-even ${fmt(b)}`); });
    if (cruces.length) porque += ` Cruzaste ${cruces.join(' y ')}.`;
  }
  if (control === 't') {
    const dt = ahora.t - base.t;
    if (dt === 0) return;
    que = dt > 0 ? `Pasaron ${DIASTXT(dt)} con el precio en ${fmt(E.S)}. ${cambio}` : `Retrocediste ${DIASTXT(-dt)} en el tiempo. ${cambio}`;
    if (dt > 0) {
      const dom = pataDominante('theta', base.S, base.t, base.sigma, base.r);
      const quien = dom ? ` La pata que más pesa es el ${etiquetaCorta(dom.p).toLowerCase()}: ${dom.p.side === 'compra' ? 'su valor tiempo, que pagaste, se consume' : 'su valor tiempo, que cobraste, se consume a tu favor'}.` : '';
      porque = `Tu theta era ${fmtSigno(base.g.theta, 3)} por día. ${base.g.theta < -1e-4 ? 'En neto, el paso del tiempo te cuesta: tenés más valor tiempo comprado que vendido.' : base.g.theta > 1e-4 ? 'En neto, el paso del tiempo te favorece: tenés más valor tiempo vendido que comprado.' : 'Casi no tenés valor tiempo en juego.'}${quien}`;
      if (ahora.t >= H) porque += ` Llegaste al ${hayCalendario() ? 'primer vencimiento' : 'vencimiento'}: la curva punteada coincide con la del vencimiento y solo queda el valor intrínseco${hayCalendario() ? ' de la pata corta (la larga todavía conserva valor tiempo)' : ''}.`;
      else if (H - ahora.t < 15 && Math.abs(base.g.theta) > 1e-4) porque += ' Cerca del vencimiento el desgaste se acelera, sobre todo para las opciones en el dinero.';
    } else porque = 'Al alejarte del vencimiento las opciones recuperan valor tiempo.';
  }
  if (control === 'sigma') {
    const ds = (ahora.sigma - base.sigma) * 100;
    if (Math.abs(ds) < 1e-9) return;
    que = `La volatilidad ${ds > 0 ? 'subió' : 'bajó'} de ${fmt(base.sigma * 100, 1)} % a ${fmt(ahora.sigma * 100, 1)} %. ${cambio}`;
    porque = E.t >= H
      ? 'Al vencimiento la volatilidad ya no importa: las opciones valen solo su valor intrínseco.'
      : `Tu vega era ${fmtSigno(base.g.vega, 3)} por punto (≈ ${fmtSigno(base.g.vega * ds)} para ${fmt(Math.abs(ds), 1)} puntos). ${base.g.vega > 1e-4 ? 'Estás largo en volatilidad: más volatilidad hace más probables los escenarios extremos, y las opciones compradas valen más porque su pérdida está acotada y su ganancia no.' : base.g.vega < -1e-4 ? 'Estás corto en volatilidad: las opciones vendidas valen más con más volatilidad, y recomprarlas cuesta más.' : 'Tu exposición a la volatilidad es casi nula.'}${(() => { const d = pataDominante('vega', base.S, base.t, base.sigma, base.r); return d && E.patas.filter(esOpcion).length > 1 ? ` La pata más sensible es el ${etiquetaCorta(d.p).toLowerCase()}, la más cercana al dinero.` : ''; })()}`;
  }
  if (control === 'r') {
    const dr = (ahora.r - base.r) * 100;
    if (Math.abs(dr) < 1e-9) return;
    que = `La tasa ${dr > 0 ? 'subió' : 'bajó'} de ${fmt(base.r * 100, 2)} % a ${fmt(ahora.r * 100, 2)} %. ${cambio}`;
    porque = `Una tasa más alta baja el valor presente del strike: favorece a los calls (pagan K más adelante) y perjudica a los puts (cobran K más adelante) y a los bonos. Tu rho era ${fmtSigno(base.g.rho, 3)} por punto. Las primas pagadas no cambian: se fijaron cuando armaste la estrategia.`;
  }
  if (entradaNueva) { nar.decir(que, porque, tipo); entradaNueva = false; }
  else nar.reemplazar(que, porque, tipo);
}

function narrarEstrategia(e) {
  const a = analizarHorizonte();
  const costo = costoNeto();
  const roles = E.patas.map(p => `<li><b>${nombrePataLarga(p)}</b> (prima ${fmt(p.premium)}): ${rolPata(p)}</li>`).join('');
  nar.decir(
    e ? `Cargaste ${e.nombre}.` : 'Cambiaste la estrategia.',
    `${e ? e.resumen + ' ' : ''}${costo >= 0 ? `Pagás ${fmt(costo)} en neto (net debit)` : `Cobrás ${fmt(-costo)} en neto (net credit)`}; ganancia máxima ${textoMaximo(a.maxProfit)}, pérdida máxima ${textoMaximo(a.maxLoss)}${a.breakevens.length ? `, break-even en ${a.breakevens.map(x => fmt(x)).join(' y ')}` : ''}.<ul style="margin:6px 0 0;padding-left:18px">${roles}</ul>`,
  );
}

function narrarCambioPatas(antes, texto) {
  const a = analizarHorizonte();
  const cambios = [];
  if (antes) {
    if (antes.maxProfit !== a.maxProfit) cambios.push(`ganancia máxima: ${textoMaximo(antes.maxProfit)} → ${textoMaximo(a.maxProfit)}`);
    if (antes.maxLoss !== a.maxLoss) cambios.push(`pérdida máxima: ${textoMaximo(antes.maxLoss)} → ${textoMaximo(a.maxLoss)}`);
    if (Math.abs(antes.netPremium - a.netPremium) > 0.004) cambios.push(`${a.netPremium >= 0 ? 'costo neto' : 'ingreso neto'}: ${fmt(Math.abs(a.netPremium))}`);
  }
  nar.decir(texto, cambios.length ? cambios.join(' · ') + '.' : '');
}

// ======================================================================
// Tabla de patas
// ======================================================================

function filaPata(p, i) {
  const acc = p.type === 'stock', bono = p.type === 'bond';
  return `<tr data-i="${i}">
    <td><select data-campo="type" aria-label="Instrumento">${['call', 'put', 'stock', 'bond'].map(t => `<option value="${t}" ${p.type === t ? 'selected' : ''}>${{ call: 'Call', put: 'Put', stock: 'Acción', bond: 'Bono cupón cero' }[t]}</option>`).join('')}</select></td>
    <td><select data-campo="side" aria-label="Operación"><option value="compra" ${p.side === 'compra' ? 'selected' : ''}>Compra</option><option value="venta" ${p.side === 'venta' ? 'selected' : ''}>Venta</option></select></td>
    <td><input data-campo="strike" type="number" step="any" min="0" value="${acc ? '' : p.strike}" ${acc ? 'disabled placeholder="—"' : ''} aria-label="Strike o nominal"></td>
    <td><input data-campo="dias" type="number" step="1" min="1" value="${acc ? '' : p.dias}" ${acc ? 'disabled placeholder="—"' : ''} aria-label="Días al vencimiento"></td>
    <td><input data-campo="premium" type="number" step="any" min="0" value="${p.premium}" ${E.primasAuto && !p.manual && !acc ? 'readonly' : ''} aria-label="Prima o precio">${E.primasAuto && !p.manual && !acc ? '<div class="prima-auto">Black-Scholes</div>' : ''}</td>
    <td><input data-campo="qty" type="number" step="1" min="1" value="${p.qty}" aria-label="Cantidad"></td>
    <td><button class="btn-icono" data-quitar type="button" title="Quitar">×</button></td>
  </tr>`;
}

function dibujarPatas() {
  $('patas').innerHTML = E.patas.map(filaPata).join('');
  $('patas-vacio').hidden = E.patas.length > 0;
}

function nuevaPata(tipo) {
  const K = Math.round(E.S0);
  const p = { type: tipo, side: 'compra', strike: tipo === 'stock' ? 0 : K, qty: 1, dias: horizonte(), premium: null, manual: false };
  if (!E.patas.length) p.dias = 90;
  return p;
}

// Todo cambio estructural pasa por acá: recalcula primas, rearma controles y dibuja.
function reconstruir({ controles = true } = {}) {
  recalcularPrimas();
  dibujarPatas();
  if (controles) armarControles();
  dibujar();
}

// ======================================================================
// Recorridos guiados
// ======================================================================

const pataRef = (type, side, strike, extra = {}) => { E.estrategia = null; return { type, side, strike, qty: 1, dias: 90, premium: null, manual: false, ...extra }; };

const RECORRIDOS = [
  {
    id: 'bull', nombre: 'Del call al bull spread: por qué vender un call abarata y limita',
    pasos: [
      { aplicar: () => { E.patas = [pataRef('call', 'compra', 95)]; E.S = 100; E.t = 0; E.sigma = 0.25; },
        texto: 'Empezamos con un <b>call comprado de strike 95</b>. Cuesta 8,53. Mirá el gráfico: la pérdida máxima es la prima y la ganancia no tiene techo. El break-even es 95 + 8,53 = 103,53: el precio tiene que subir más de 3,5 % solo para recuperar lo pagado.' },
      { aplicar: () => { E.patas = [pataRef('call', 'compra', 95), pataRef('call', 'venta', 105)]; },
        texto: 'Ahora <b>vendemos un call 105</b> y cobramos 3,44. El costo neto baja a 5,09 y el break-even a 100,09. A cambio, por encima de 105 lo que gana el call comprado lo pierde el vendido: la ganancia queda topeada en 105 − 95 − 5,09 = 4,91. Es una apuesta alcista <b>moderada</b>.' },
      { aplicar: () => { E.S = 112; E.t = 90; },
        texto: 'Saltamos al vencimiento con el subyacente en 112. Los dos calls se ejercen: ganás 17 con el comprado y perdés 7 con el vendido. Neto 10 − 5,09 = 4,91, lo mismo que si hubiera terminado en 105. Esa suba de 105 a 112 es la que "vendiste" por 3,44.' },
      { aplicar: () => { E.S = 104; E.t = 45; },
        texto: 'Volvemos a la mitad del camino: faltan 45 días y el precio está en 104. La curva punteada (si cerrás hoy) es más suave que la del vencimiento: las opciones todavía tienen valor tiempo. Probá mover el tiempo y mirá cómo la punteada se va pegando a la de vencimiento.' },
    ],
  },
  {
    id: 'straddle', nombre: 'Straddle: la volatilidad a favor y el tiempo en contra',
    pasos: [
      { aplicar: () => { cargarPlantilla('straddle', false); E.S = 100; E.t = 0; E.sigma = 0.25; },
        texto: 'Un <b>straddle comprado</b>: call 100 + put 100. Pagás 9,96. Ganás si el precio se mueve fuerte para cualquier lado: por debajo de 90,04 o por encima de 109,96. Fijate la delta: casi cero. No apostás a la dirección sino al tamaño del movimiento.' },
      { aplicar: () => { E.sigma = 0.35; },
        texto: 'Sube la volatilidad del 25 % al 35 % sin que se mueva el precio. La posición <b>gana</b> aunque el subyacente siga en 100: estás largo en vega. El mercado ahora espera movimientos más grandes y tus opciones valen más.' },
      { aplicar: () => { E.sigma = 0.25; E.t = 60; },
        texto: 'Volvemos al 25 % y pasan 60 días con el precio quieto en 100. La posición pierde: es la <b>theta</b>. Compraste valor tiempo y se consume todos los días. El straddle necesita que el movimiento llegue antes de que el tiempo se coma la prima.' },
      { aplicar: () => { E.S = 116; },
        texto: 'Ahora sí, el precio salta a 116. El call gana mucho más de lo que pierde el put (que ya no puede perder más que su prima). La gamma positiva hizo que la delta pasara de casi 0 a positiva a medida que subía el precio.' },
    ],
  },
  {
    id: 'paridad', nombre: 'Covered call y short put: la paridad put-call en acción',
    pasos: [
      { aplicar: () => { cargarPlantilla('covered-call', false); E.S = 100; E.t = 0; },
        texto: 'Un <b>covered call</b>: comprás la acción a 100 y vendés un call 105 por 3,44. La ganancia queda topeada en 105 − 100 + 3,44 = 8,44 y la pérdida es casi como la de la acción, amortiguada por la prima.' },
      { aplicar: () => { E.patas = [pataRef('put', 'venta', 105)]; },
        texto: 'Ahora un <b>put vendido de strike 105</b>, solo. Mirá la forma: es la misma que la del covered call. La paridad put-call lo explica: acción − call = bono que paga K − put. Es decir, <b>covered call = short put + colocar K·e^(−rT)</b>.' },
      { aplicar: () => { E.t = 90; E.S = 110; },
        texto: 'Al vencimiento con el precio en 110: el short put gana 7,14 (la prima cobrada) y el covered call ganaba 8,44. La diferencia, 1,30, es el interés de 105 durante 3 meses: \\(105\\,(1 - e^{-0{,}05 \\times 0{,}25}) = 1{,}30\\). El covered call inmoviliza dinero en la acción; el short put no.' },
    ],
  },
  {
    id: 'calendar', nombre: 'Calendar spread: vender el tiempo del corto plazo',
    pasos: [
      { aplicar: () => { cargarPlantilla('calendar-call', false); E.S = 100; E.t = 0; E.sigma = 0.25; },
        texto: 'Vendés un call 100 a 30 días y comprás un call 100 a 90 días. Pagás la diferencia de primas. El gráfico "al vencimiento" se mide a los 30 días, cuando vence el corto: el call largo todavía está vivo y se valúa con Black-Scholes. Por eso la curva no tiene quiebres sino forma de carpa.' },
      { aplicar: () => { E.t = 25; },
        texto: 'Pasan 25 días con el precio en 100. La posición <b>gana</b>: el call de 30 días pierde su valor tiempo mucho más rápido que el de 90. La theta del corto es mayor (en valor absoluto) que la del largo, así que la theta de la posición es positiva.' },
      { aplicar: () => { E.S = 118; },
        texto: 'Si el precio se dispara a 118, los dos calls quedan muy dentro del dinero y se comportan casi como la acción: lo que ganás con uno lo perdés con el otro, y el valor tiempo que querías capturar desaparece. El calendar pierde si el precio se aleja de K, para cualquier lado.' },
    ],
  },
  {
    id: 'box', nombre: 'Box spread: una tasa sintética',
    pasos: [
      { aplicar: () => { cargarPlantilla('box-spread', false); E.S = 100; E.t = 0; },
        texto: 'Bull call spread 95/105 + bear put spread 95/105. Al vencimiento el payoff es siempre 105 − 95 = 10, valga lo que valga el subyacente. Hoy cuesta \\(10\\,e^{-0{,}05 \\times 0{,}25} = 9{,}88\\). La ganancia de 0,12 es exactamente el interés: el box rinde la tasa libre de riesgo.' },
      { aplicar: () => { E.S = 80; E.t = 90; },
        texto: 'Movés el precio a 80, a 120, a donde quieras: la línea es horizontal. Por eso, si un box cotizara por debajo de 9,88 se compraría y si cotizara por encima se vendería: sería un arbitraje.' },
    ],
  },
];

let recorrido = null, pasoActual = 0;

function mostrarPaso() {
  const r = recorrido;
  const paso = r.pasos[pasoActual];
  paso.aplicar();
  if (!E.estrategia) { $('info-estrategia').innerHTML = ''; $('plantilla').value = ''; }
  reconstruir();
  base = null; controlActivo = null;
  $('recorrido').hidden = false;
  $('recorrido').innerHTML = `
    <div class="paso-n">${r.nombre} · paso ${pasoActual + 1} de ${r.pasos.length}</div>
    <p>${paso.texto}</p>
    <div class="botones">
      <button class="btn" id="paso-ant" type="button" ${pasoActual === 0 ? 'disabled' : ''}>← Anterior</button>
      <button class="btn-primario" id="paso-sig" type="button">${pasoActual === r.pasos.length - 1 ? 'Terminar' : 'Siguiente →'}</button>
    </div>`;
  renderFormulas($('recorrido'));
  $('paso-ant').addEventListener('click', () => { pasoActual--; mostrarPaso(); });
  $('paso-sig').addEventListener('click', () => {
    if (pasoActual < r.pasos.length - 1) { pasoActual++; mostrarPaso(); }
    else { $('recorrido').hidden = true; $('recorrido-sel').value = ''; recorrido = null; nar.decir('Terminaste el recorrido.', 'Ahora probá vos: mové el precio, el tiempo y la volatilidad, o cambiá las patas.'); }
  });
  nar.decir(`Recorrido: paso ${pasoActual + 1}`, paso.texto);
}

// ======================================================================
// Estrategias predefinidas
// ======================================================================

function cargarPlantilla(id, narrar = true) {
  const e = ESTRATEGIAS.find(x => x.id === id);
  if (!e) return;
  E.estrategia = e;
  const ini = e.inicial || {};
  E.r = ini.r !== undefined ? ini.r : E.r;
  $('ini-r').value = String(Math.round(E.r * 10000) / 100);
  E.patas = construirEstrategia(id, E.S0);
  E.S = E.S0; E.t = 0; E.sigma = E.sigma0;
  $('plantilla').value = id;
  $('info-estrategia').innerHTML = `<strong>${e.nombre}</strong><span class="etiqueta">${e.vista}</span><br>${e.resumen}`;
  if (narrar) { reconstruir(); base = null; controlActivo = null; narrarEstrategia(e); }
}

// ======================================================================
// Eventos
// ======================================================================

function init() {
  const sel = $('plantilla');
  const grupos = {};
  ESTRATEGIAS.forEach(e => {
    if (!grupos[e.grupo]) { grupos[e.grupo] = document.createElement('optgroup'); grupos[e.grupo].label = e.grupo; sel.appendChild(grupos[e.grupo]); }
    const o = document.createElement('option'); o.value = e.id; o.textContent = e.nombre; grupos[e.grupo].appendChild(o);
  });
  sel.addEventListener('change', () => { if (sel.value) cargarPlantilla(sel.value); });

  const rs = $('recorrido-sel');
  RECORRIDOS.forEach(r => { const o = document.createElement('option'); o.value = r.id; o.textContent = r.nombre; rs.appendChild(o); });
  rs.addEventListener('change', () => {
    recorrido = RECORRIDOS.find(r => r.id === rs.value) || null;
    if (!recorrido) { $('recorrido').hidden = true; return; }
    pasoActual = 0; mostrarPaso();
  });

  // Condiciones iniciales
  $('w-inicial').addEventListener('change', () => {
    const S0 = numero('ini-s'), s0 = numero('ini-sigma') / 100, r = numero('ini-r') / 100;
    if (!(S0 > 0) || !(s0 > 0) || Number.isNaN(r)) return;
    const escala = S0 / E.S0;
    const cambioS0 = Math.abs(escala - 1) > 1e-9;
    E.primasAuto = $('primas-auto').checked;
    if (cambioS0 && E.estrategia) { E.S0 = S0; E.sigma0 = s0; E.r = r; cargarPlantilla(E.estrategia.id); return; }
    E.S0 = S0; E.sigma0 = s0; E.r = r;
    if (!cambioS0) { E.sigma = s0; }
    reconstruir();
    nar.decir('Cambiaste las condiciones iniciales.', E.primasAuto ? `Las primas se recalcularon con Black-Scholes (S₀ = ${fmt(E.S0)}, σ = ${fmt(E.sigma0 * 100, 1)} %, r = ${fmt(E.r * 100, 2)} %). Más volatilidad encarece todas las opciones; una tasa más alta encarece los calls y abarata los puts.` : 'Las primas quedan como las escribiste.');
  });

  // Escenario (deslizadores)
  const CONTROL = { 'esc-s': 'S', 'esc-t': 't', 'esc-sigma': 'sigma', 'esc-r': 'r' };
  $('w-escenario').addEventListener('input', ev => {
    const id = ev.target.id, v = parseFloat(ev.target.value);
    // La foto "antes" se toma ANTES de aplicar el primer cambio de cada control.
    if (CONTROL[id] && (CONTROL[id] !== controlActivo || !base)) { base = foto(); controlActivo = CONTROL[id]; entradaNueva = true; }
    if (id === 'esc-s') { E.S = v; narrarEscenario('S'); }
    if (id === 'esc-t') { E.t = Math.round(v); narrarEscenario('t'); }
    if (id === 'esc-sigma') { E.sigma = v / 100; narrarEscenario('sigma'); }
    if (id === 'esc-r') { E.r = v / 100; narrarEscenario('r'); }
    dibujar();
  });
  $('btn-vencer').addEventListener('click', () => ponerControl('esc-t', horizonte()));
  $('btn-hoy').addEventListener('click', () => ponerControl('esc-t', 0));
  $('ver-patas').addEventListener('change', e => { E.verPatas = e.target.checked; dibujar(); });
  $('ver-dist').addEventListener('change', e => {
    E.verDist = e.target.checked; dibujar();
    if (E.verDist) nar.decir('Distribución del precio al vencimiento', 'El área sombreada muestra dónde es más probable que termine el precio según un modelo lognormal neutral al riesgo, con la volatilidad del escenario. Comparala con las zonas de ganancia: así se lee la probabilidad de ganar que aparece arriba.');
  });

  // Patas
  const editar = ev => {
    const tr = ev.target.closest('tr'), campo = ev.target.dataset.campo;
    if (!tr || !campo) return;
    const p = E.patas[Number(tr.dataset.i)];
    const antes = analizarHorizonte();
    if (campo === 'type' || campo === 'side') {
      const tipoAntes = p.type;
      p[campo] = ev.target.value;
      if (campo === 'type' && p.type !== tipoAntes) {
        if (p.type === 'stock') { p.strike = 0; p.premium = E.S0; }
        else if (tipoAntes === 'stock') { p.strike = Math.round(E.S0); p.dias = horizonte(); }
        p.manual = false;
      }
      reconstruir();
      narrarCambioPatas(antes, `Cambiaste una pata: ahora es ${nombrePataLarga(p)}. Esa pata ${rolPata(p)}`);
      return;
    }
    const v = aNumero(ev.target.value);
    if (Number.isNaN(v) || v < 0) return;
    if (campo === 'qty') p.qty = Math.max(1, Math.round(v));
    else if (campo === 'dias') p.dias = Math.max(1, Math.round(v));
    else if (campo === 'premium') { p.premium = v; p.manual = true; }
    else p[campo] = v;
    if (ev.type === 'change') {
      reconstruir();
      narrarCambioPatas(antes, `Modificaste ${nombrePataLarga(p)}.`);
    } else { recalcularPrimas(); dibujar(); }
  };
  $('patas').addEventListener('change', editar);
  $('patas').addEventListener('click', ev => {
    if (!ev.target.hasAttribute('data-quitar')) return;
    const antes = analizarHorizonte();
    const [p] = E.patas.splice(Number(ev.target.closest('tr').dataset.i), 1);
    E.estrategia = null; $('plantilla').value = '';
    reconstruir();
    if (E.patas.length) narrarCambioPatas(antes, `Quitaste ${nombrePataLarga(p)}.`);
  });
  document.querySelectorAll('[data-agregar]').forEach(b => b.addEventListener('click', () => {
    const antes = E.patas.length ? analizarHorizonte() : null;
    const p = nuevaPata(b.dataset.agregar);
    E.patas.push(p);
    E.estrategia = null; $('plantilla').value = ''; $('info-estrategia').innerHTML = '';
    reconstruir();
    narrarCambioPatas(antes, `Agregaste ${nombrePataLarga(p)}: ${rolPata(p)}`);
  }));
  $('limpiar').addEventListener('click', () => {
    E.patas = []; E.estrategia = null; $('plantilla').value = ''; $('info-estrategia').innerHTML = '';
    nar.limpiar(); reconstruir();
  });

  alCambiarTema(dibujar);

  // Abrir con una estrategia: u8-simulacion.html?estrategia=straddle (local) o #straddle (publicado)
  const pedida = parametroURL('estrategia', ESTRATEGIAS.map(e => e.id));
  cargarPlantilla(pedida || 'bull-call-spread');
}

init();
