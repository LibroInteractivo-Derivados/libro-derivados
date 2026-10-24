// Unidad V · Simulaciones: posiciones básicas, variables, límites y arbitraje, paridad put-call y ejercicio anticipado.
// Cada widget tiene un narrador que explica el porqué de cada cambio.

const cambiosU5 = (previo, actual) => (previo ? Object.keys(actual).filter(k => previo[k] !== actual[k]) : []);
const alfaU5 = (color, a) => (/^#[0-9a-f]{6}$/i.test(color) ? color + Math.round(a * 255).toString(16).padStart(2, '0') : color);

// ---------- 1. Las cuatro posiciones básicas ----------
const narPos = crearNarrador($('p-narrador'), { titulo: '¿Se ejerce? ¿Por qué?' });
$('p-st-box').innerHTML = controlRango({ id: 'p-st', etiqueta: 'Precio del subyacente al vencimiento S<sub>T</sub>', min: 60, max: 140, paso: 1, valor: 112, formato: v => fmt(v, 0) });
vincularRango('p-st', v => fmt(v, 0));
let posPrevio = null;

function simPosicion() {
  const tipo = elegido('p-tipo'), lado = elegido('p-lado'), modo = elegido('p-modo');
  const K = numero('p-k'), prima = numero('p-prima');
  if ([K, prima].some(Number.isNaN) || K <= 0) return datosInvalidos();
  // El deslizador acompaña al strike. Con precios chicos (por ejemplo, un tipo de cambio)
  // se usan más decimales para que el break-even y la prima no se redondeen mal.
  const dp = decPrecio(K), dS = K >= 10 ? 0 : 3;
  const redondeo = v => (K >= 10 ? Math.round(v) : Math.round(v * 1000) / 1000);
  const st = $('p-st');
  const lo = Math.max(0, K * 0.6), hi = K * 1.4;
  if (Number(st.min) !== redondeo(lo) || Number(st.max) !== redondeo(hi)) {
    st.min = redondeo(lo); st.max = redondeo(hi); st.step = K >= 50 ? 1 : K >= 10 ? 0.5 : 0.001;
    if (+st.value < lo || +st.value > hi) st.value = redondeo(K * 1.12);
    st.dispatchEvent(new Event('input'));
  }
  const ST = numero('p-st');
  const pata = { type: tipo, side: lado, strike: K, premium: prima, qty: 1 };
  const a = Payoff.analyze([pata]);
  const xs = []; for (let i = 0; i <= 160; i++) xs.push(lo + ((hi - lo) * i) / 160);
  xs.push(K); xs.sort((x, y) => x - y);
  const c = coloresGrafico(), datasets = [];
  if (modo !== 'payoff') datasets.push({ label: 'Beneficio', data: xs.map(x => ({ x, y: Payoff.legPnL(pata, x) })), borderColor: c.acento, borderWidth: 2.5, pointRadius: 0, fill: { target: 'origin', above: c.rellenoGanancia, below: c.rellenoPerdida } });
  if (modo !== 'beneficio') datasets.push({ label: 'Payoff bruto', data: xs.map(x => ({ x, y: Payoff.legPnL({ ...pata, premium: 0 }, x) })), borderColor: c.series[0], borderWidth: 1.8, borderDash: [6, 4], pointRadius: 0 });
  if (modo !== 'payoff' && a.breakevens.length) datasets.push({ label: 'Break-even', data: a.breakevens.map(x => ({ x, y: 0 })), showLine: false, pointRadius: 5, pointBackgroundColor: c.texto });
  const res = Payoff.legPnL(pata, ST);
  datasets.push({ label: `S_T = ${fmt(ST, dS)}`, data: [{ x: ST, y: modo === 'payoff' ? Payoff.legPnL({ ...pata, premium: 0 }, ST) : res }], showLine: false, pointRadius: 7, pointBackgroundColor: c.acento, pointBorderColor: c.superficie, pointBorderWidth: 2 });
  dibujarGrafico($('p-grafico'), { type: 'line', data: { datasets }, options: opcionesEjes({ tituloX: 'Precio del subyacente al vencimiento (S_T)', tituloY: 'Resultado', xMin: lo, xMax: hi }) });
  $('p-datos').innerHTML = `
    <div class="dato"><div class="dato-etiqueta">Break-even</div><div class="dato-valor">${a.breakevens.map(x => fmt(x, dp)).join(' / ') || '—'}</div></div>
    <div class="dato"><div class="dato-etiqueta">Ganancia máxima</div><div class="dato-valor pos">${fmt(a.maxProfit, dp)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Pérdida máxima</div><div class="dato-valor neg">${fmt(a.maxLoss, dp)}</div></div>
    <div class="dato destacado"><div class="dato-etiqueta">Resultado con S_T = ${fmt(ST, dS)}</div><div class="dato-valor ${res >= 0 ? 'pos' : 'neg'}">${fmtSigno(res, dp)}</div></div>`;
  const nombre = `${lado === 'compra' ? 'comprador' : 'lanzador'} de un ${tipo}`;
  const ejerceTxt = tipo === 'call' ? `el subyacente termina por encima de ${fmt(K, dp)}` : `el subyacente termina por debajo de ${fmt(K, dp)}`;
  const be = a.breakevens[0];
  let texto;
  if (lado === 'compra') texto = tipo === 'call'
    ? `El <b>${nombre}</b> ejerce si ${ejerceTxt}, pero recién gana si el precio supera el break-even (${fmt(be, dp)}): antes tiene que recuperar la prima. Su pérdida máxima es la prima, ${fmt(prima, dp)}.`
    : `El <b>${nombre}</b> ejerce si ${ejerceTxt}. Gana si el precio cae por debajo del break-even (${fmt(be, dp)}). Pierde como máximo la prima (${fmt(prima, dp)}) y gana como máximo ${fmt(a.maxProfit, dp)}, si el subyacente llega a cero.`;
  else texto = `El <b>${nombre}</b> cobra la prima y queda obligado a cumplir si el comprador ejerce (cuando ${ejerceTxt}). Gana como máximo la prima, ${fmt(prima, dp)}; puede perder ${tipo === 'call' ? 'sin límite' : 'hasta ' + fmt(-a.maxLoss, dp)}. Su resultado es exactamente el opuesto al del comprador: las opciones son un juego de suma cero.`;
  $('p-texto').innerHTML = `<p>${texto}</p>`;

  // Narrador
  const enDinero = tipo === 'call' ? ST > K : ST < K;
  const pago = tipo === 'call' ? Math.max(ST - K, 0) : Math.max(K - ST, 0);
  const quien = lado === 'compra' ? 'El comprador' : 'El comprador (tu contraparte)';
  const decision = enDinero
    ? `${quien} <b>ejerce</b>: ${tipo === 'call' ? `compra a ${fmt(K)} algo que vale ${fmt(ST)}` : `vende a ${fmt(K)} algo que vale ${fmt(ST)}`}, y eso vale ${fmt(pago)}.`
    : `${quien} <b>no ejerce</b>: ${tipo === 'call' ? `no tiene sentido pagar ${fmt(K)} por algo que vale ${fmt(ST)}` : `no tiene sentido vender a ${fmt(K)} algo que vale ${fmt(ST)}`}. La opción vence sin valor.`;
  const cuenta = lado === 'compra' ? `Resultado: pago ${fmt(pago)} − prima ${fmt(prima)} = ${fmtSigno(res)}.` : `Resultado: prima cobrada ${fmt(prima)} − pago ${fmt(pago)} = ${fmtSigno(res)}.`;
  const extra = enDinero && lado === 'compra' && res < 0 ? ' Ojo: conviene ejercer igual aunque el resultado total sea negativo, porque la prima ya está pagada: ejercer achica la pérdida.' : '';
  const d = { tipo, lado, K, prima, ST };
  const ch = cambiosU5(posPrevio, d);
  if (posPrevio && !ch.length) return;
  const que = `S_T = ${fmt(ST, 0)}: ${enDinero ? 'se ejerce' : 'no se ejerce'} (${fmtSigno(res)}).`;
  if (ch.length === 1 && ch[0] === 'ST' && posPrevio) narPos.reemplazar(que, decision + ' ' + cuenta + extra, res >= 0 ? 'pos' : 'neg');
  else narPos.decir(que, decision + ' ' + cuenta + extra, res >= 0 ? 'pos' : 'neg');
  posPrevio = d;
}

// ---------- 2. Variables que afectan el precio ----------
const narVar = crearNarrador($('x-narrador'), { titulo: 'Qué cambió y por qué' });
let varPrevio = null;
const RANGOS = {
  S: { nombre: 'Precio de la acción (S₀)', desde: () => 0, hasta: d => 2 * d.K, dec: 0 },
  K: { nombre: 'Strike (K)', desde: () => 0, hasta: d => 2 * d.S, dec: 0 },
  T: { nombre: 'Tiempo al vencimiento (años)', desde: () => 0, hasta: d => Math.max(2, 2 * d.T), dec: 1 },
  sigma: { nombre: 'Volatilidad σ (%)', desde: () => 0, hasta: d => Math.max(0.6, 2 * d.sigma), dec: 0, pct: true },
  r: { nombre: 'Tasa libre de riesgo r (%)', desde: () => 0, hasta: d => Math.max(0.1, 2 * d.r), dec: 0, pct: true },
};

function simVariables() {
  const d = { S: numero('x-s'), K: numero('x-k'), T: numero('x-t'), sigma: numero('x-sigma') / 100, r: numero('x-r') / 100 };
  if (Object.values(d).some(Number.isNaN) || d.S <= 0 || d.K <= 0) return datosInvalidos();
  const tipo = elegido('x-tipo'), eje = $('x-eje').value, rango = RANGOS[eje];
  $('x-limites-box').style.visibility = eje === 'S' ? 'visible' : 'hidden';
  const bs = Opciones.blackScholes(d), precio = bs[tipo], otro = tipo === 'call' ? 'put' : 'call';
  const intr = Opciones.pagoAlVencimiento(tipo, d.S, d.K);
  const moneyness = Math.abs(d.S - d.K) < 1e-9 ? 'ATM (en el dinero)' : intr > 0 ? 'ITM (dentro del dinero)' : 'OTM (fuera del dinero)';
  $('x-datos').innerHTML = `
    <div class="dato destacado"><div class="dato-etiqueta">Precio del ${tipo}</div><div class="dato-valor">${fmt(precio)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Valor intrínseco</div><div class="dato-valor">${fmt(intr)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Valor tiempo</div><div class="dato-valor">${fmt(precio - intr)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Moneyness</div><div class="dato-valor" style="font-size:1rem">${moneyness}</div></div>
    <div class="dato"><div class="dato-etiqueta">Precio del ${otro} (referencia)</div><div class="dato-valor">${fmt(bs[otro])}</div></div>`;
  const lo = rango.desde(d), hi = rango.hasta(d), xs = [];
  for (let i = 0; i <= 120; i++) xs.push(lo + ((hi - lo) * i) / 120);
  const esc = rango.pct ? 100 : 1, conX = x => ({ ...d, [eje]: x });
  const c = coloresGrafico();
  const datasets = [{ label: `Precio del ${tipo}`, data: xs.map(x => ({ x: x * esc, y: Opciones.blackScholes(conX(x))[tipo] })), borderColor: c.acento, borderWidth: 2.5, pointRadius: 0 }];
  if (eje === 'S') datasets.push({ label: 'Valor intrínseco (el área sombreada es el valor tiempo)', data: xs.map(x => ({ x, y: Opciones.pagoAlVencimiento(tipo, x, d.K) })), borderColor: c.series[0], borderWidth: 1.4, pointRadius: 0, fill: { target: 0, above: alfaU5(c.acento, 0.12), below: alfaU5(c.acento, 0.12) } });
  if (eje === 'S' && $('x-limites').checked) {
    const vpK = d.K * Math.exp(-d.r * d.T);
    datasets.push({ label: 'Límite inferior', data: xs.map(x => ({ x, y: tipo === 'call' ? Math.max(x - vpK, 0) : Math.max(vpK - x, 0) })), borderColor: c.ganancia, borderWidth: 1.5, borderDash: [6, 4], pointRadius: 0 });
    datasets.push({ label: 'Límite superior', data: xs.map(x => ({ x, y: tipo === 'call' ? x : vpK })), borderColor: c.perdida, borderWidth: 1.5, borderDash: [6, 4], pointRadius: 0 });
  }
  datasets.push({ label: 'Valores actuales', data: [{ x: d[eje] * esc, y: precio }], showLine: false, pointRadius: 6, pointBackgroundColor: c.texto });
  const opciones = opcionesEjes({ tituloX: rango.nombre, tituloY: `Precio del ${tipo}`, xMin: lo * esc, xMax: hi * esc, decX: rango.dec });
  if (eje === 'S') { const m = Math.max(...datasets[0].data.map(p => p.y)) * 1.15, paso = m > 20 ? 10 : m > 5 ? 5 : 1; opciones.scales.y.max = Math.ceil(m / paso) * paso; }
  dibujarGrafico($('x-grafico'), { type: 'line', data: { datasets }, options: opciones });
  const textos = {
    S: tipo === 'call' ? 'Cuanto más vale la acción, más vale el call. Para precios muy altos el call se comporta casi como la acción menos el valor presente del strike: la curva se pega al límite inferior.' : 'Cuanto más vale la acción, menos vale el put. Para precios muy bajos el put vale casi el valor presente del strike menos el precio de la acción.',
    K: tipo === 'call' ? 'Un strike más alto hace más caro comprar la acción al ejercer, así que el call vale menos.' : 'Un strike más alto permite vender la acción más cara al ejercer, así que el put vale más.',
    T: 'Sin dividendos, más plazo da más valor: hay más tiempo para que el precio se mueva a favor. En opciones europeas con dividendos, o en puts muy dentro del dinero, no siempre se cumple.',
    sigma: 'La volatilidad aumenta el valor de calls y puts: los escenarios malos tienen pérdida acotada (a lo sumo la opción vale cero), pero los buenos no tienen techo.',
    r: tipo === 'call' ? 'Una tasa más alta reduce el valor presente del strike que se va a pagar, así que el call vale más.' : 'Una tasa más alta reduce el valor presente del strike que se va a cobrar, así que el put vale menos.',
  };
  $('x-texto').innerHTML = `<p>${textos[eje]}</p>`;

  const act = { ...d, tipo, eje, call: bs.call, put: bs.put };
  if (varPrevio) {
    const ch = ['S', 'K', 'T', 'sigma', 'r'].filter(x => varPrevio[x] !== d[x]);
    const nombres = { S: 'el precio de la acción', K: 'el strike', T: 'el plazo', sigma: 'la volatilidad', r: 'la tasa' };
    if (ch.length === 1) {
      const v = ch[0], sube = d[v] > varPrevio[v];
      const dc = bs.call - varPrevio.call, dp = bs.put - varPrevio.put;
      narVar.decir(`${sube ? 'Subió' : 'Bajó'} ${nombres[v]}: call ${fmtSigno(dc)} (a ${fmt(bs.call)}), put ${fmtSigno(dp)} (a ${fmt(bs.put)}).`, textos[v] + (v === 'T' && dp < 0 ? ' Acá el put europeo bajó con más plazo: está tan dentro del dinero que esperar más (y cobrar K más tarde) le resta valor.' : ''), (tipo === 'call' ? dc : dp) >= 0 ? 'pos' : 'neg');
    } else if (varPrevio.eje !== eje) narVar.decir(`Ahora el gráfico mueve: ${RANGOS[eje].nombre.toLowerCase()}.`, textos[eje]);
    else if (varPrevio.tipo !== tipo) narVar.decir(`Ahora se muestra el ${tipo}.`, tipo === 'put' ? 'El put reacciona al revés que el call ante S, K y r; ante σ y (casi siempre) T, los dos suben.' : 'El call sube con S, σ, T y r, y baja con K.');
  } else narVar.decir(`Call ${fmt(bs.call)} y put ${fmt(bs.put)}.`, 'Cambiá un dato por vez: acá aparece cuánto se movió cada opción y por qué.');
  varPrevio = act;
}

// ---------- 3. Límites de precios y arbitraje ----------
const narLim = crearNarrador($('l-narrador'), { titulo: 'El arbitraje, explicado' });
$('l-st-box').innerHTML = controlRango({ id: 'l-st', etiqueta: 'Precio de la acción al vencimiento S<sub>T</sub>', min: 10, max: 40, paso: 0.5, valor: 20, formato: v => fmt(v, 1) });
vincularRango('l-st', v => fmt(v, 1));
let limPrevio = null;

function simLimites() {
  const tipo = elegido('l-tipo');
  const d = { tipo, S: numero('l-s'), K: numero('l-k'), r: numero('l-r') / 100, T: numero('l-t'), D: numero('l-d'), m: numero('l-c') };
  if ([d.S, d.K, d.r, d.T, d.D, d.m].some(Number.isNaN) || d.S <= 0 || d.K <= 0 || d.T <= 0) return datosInvalidos();
  const st = $('l-st'), lo = Math.round(d.K * 0.4), hi = Math.round(d.K * 1.6);
  if (Number(st.min) !== lo || Number(st.max) !== hi) { st.min = lo; st.max = hi; st.step = d.K > 40 ? 1 : 0.5; if (+st.value < lo || +st.value > hi) st.value = Math.round(d.K * 0.8); st.dispatchEvent(new Event('input')); }
  const ST = numero('l-st'), cap = Math.exp(d.r * d.T), vpK = d.K * Math.exp(-d.r * d.T);
  const inf = tipo === 'call' ? Math.max(d.S - d.D - vpK, 0) : Math.max(vpK + d.D - d.S, 0);
  const sup = tipo === 'call' ? d.S : vpK;
  const nombre = tipo === 'call' ? 'call' : 'put';
  $('l-datos').innerHTML = `
    <div class="dato"><div class="dato-etiqueta">Límite inferior</div><div class="dato-valor">${fmt(inf, 4)}</div><div class="dato-nota">${tipo === 'call' ? 'S₀ − D − K·e^(−rT)' : 'K·e^(−rT) + D − S₀'}</div></div>
    <div class="dato"><div class="dato-etiqueta">Límite superior</div><div class="dato-valor">${fmt(sup, 4)}</div><div class="dato-nota">${tipo === 'call' ? 'S₀' : 'K·e^(−rT)'}</div></div>
    <div class="dato destacado"><div class="dato-etiqueta">Precio de mercado</div><div class="dato-valor">${fmt(d.m, 4)}</div><div class="dato-nota">${d.m < inf - 1e-9 ? 'barato: hay arbitraje' : d.m > sup + 1e-9 ? 'caro: hay arbitraje' : 'dentro de los límites'}</div></div>`;
  let filas = [], total = 0, hoy = 0, que, porque, tipoMsg = 'pos';
  const c2 = x => fmt(x, 2);
  if (d.m < inf - 1e-9 && tipo === 'call') {
    const inv = d.S - d.m - d.D, alFinal = inv * cap, recompra = Math.min(ST, d.K);
    filas = [
      ['Comprar el call', c2(-d.m), ST > d.K ? `ejerce: ${c2(ST - d.K)}` : '0'],
      ['Vender la acción en corto', c2(d.S), c2(-ST)],
      ...(d.D ? [['Reservar el VP de los dividendos (los paga el corto)', c2(-d.D), '0']] : []),
      [`Colocar ${c2(inv)} a la tasa r`, c2(-inv), c2(alFinal)],
    ];
    total = alFinal - recompra; hoy = -d.m + d.S - d.D - inv;
    que = `El call cotiza ${fmt(d.m, 2)}, por debajo de su mínimo (${fmt(inf, 2)}): se compra el call y se vende la acción.`;
    porque = `Lo barato se compra y lo caro se vende. Al vencimiento, la plata colocada vale ${fmt(alFinal, 2)} y alcanza para recomprar la acción: a ${fmt(ST, 2)} si cotiza por debajo de ${fmt(d.K, 2)}, o a ${fmt(d.K, 2)} ejerciendo el call si cotiza por encima. Con S_T = ${fmt(ST, 2)} se gana ${fmt(total, 2)}, y nunca menos de ${fmt(alFinal - d.K, 2)}.`;
  } else if (d.m < inf - 1e-9) {
    const deuda = d.m + d.S - d.D, alFinal = deuda * cap, venta = Math.max(ST, d.K);
    filas = [
      ['Comprar el put', c2(-d.m), ST < d.K ? `ejerce: ${c2(d.K - ST)}` : '0'],
      ['Comprar la acción', c2(-d.S), c2(ST)],
      ...(d.D ? [['Dividendos que cobra la acción (VP)', c2(d.D), '0']] : []),
      [`Tomar prestado ${c2(deuda)}`, c2(deuda), c2(-alFinal)],
    ];
    total = venta - alFinal; hoy = -d.m - d.S + d.D + deuda;
    que = `El put cotiza ${fmt(d.m, 2)}, por debajo de su mínimo (${fmt(inf, 2)}): se compran el put y la acción con plata prestada.`;
    porque = `Al vencimiento se debe ${fmt(alFinal, 2)}. La acción se vende a ${fmt(d.K, 2)} como mínimo (si cae, se ejerce el put). Con S_T = ${fmt(ST, 2)} se gana ${fmt(total, 2)}, y nunca menos de ${fmt(d.K - alFinal, 2)}.`;
  } else if (d.m > sup + 1e-9 && tipo === 'call') {
    filas = [['Vender el call', c2(d.m), ST > d.K ? c2(-(ST - d.K)) : '0'], ['Comprar la acción', c2(-d.S), c2(ST)]];
    total = (d.m - d.S) * cap + ST - Math.max(ST - d.K, 0); hoy = d.m - d.S;
    que = `El call cotiza ${fmt(d.m, 2)}, más que la propia acción (${fmt(d.S, 2)}).`;
    porque = 'Un derecho a comprar no puede valer más que lo que se compra: se vende el call y se compra la acción, y queda una diferencia positiva hoy. Si ejercen, se entrega la acción y además se cobra K.';
  } else if (d.m > sup + 1e-9) {
    filas = [['Vender el put', c2(d.m), ST < d.K ? c2(-(d.K - ST)) : '0'], [`Colocar ${c2(d.m)} a la tasa r`, c2(-d.m), c2(d.m * cap)]];
    total = d.m * cap - Math.max(d.K - ST, 0); hoy = 0;
    que = `El put cotiza ${fmt(d.m, 2)}, más que el valor presente del strike (${fmt(vpK, 2)}).`;
    porque = `Lo máximo que puede pagar el put es K = ${fmt(d.K, 2)}. Si se vende el put y se coloca la prima, al vencimiento se tiene ${fmt(d.m * cap, 2)}, más que K: se gana pase lo que pase.`;
  } else {
    que = `El ${nombre} cotiza ${fmt(d.m, 2)}: está entre ${fmt(inf, 2)} y ${fmt(sup, 2)}.`;
    porque = 'Dentro de los límites no hay arbitraje con estas operaciones. Probá bajar el precio de mercado por debajo del límite inferior para ver la estrategia.';
    tipoMsg = '';
  }
  if (filas.length) {
    filas.push(['<b>Total</b>', { texto: fmt(Math.abs(hoy) < 0.005 ? 0 : hoy, 2), clase: '' }, { texto: '<b>' + fmtSigno(total) + '</b>', clase: total >= 0 ? 'pos' : 'neg' }]);
    $('l-tabla').innerHTML = tablaHTML([{ titulo: 'Operación' }, { titulo: 'Flujo hoy', num: true }, { titulo: `Al vencimiento con S<sub>T</sub> = ${fmt(ST, 2)}`, num: true }], filas, i => (i === filas.length - 1 ? 'total' : ''))
      + '<p class="ayuda">Mové S<sub>T</sub>: el resultado al vencimiento es positivo en todos los escenarios. Eso es un arbitraje.</p>';
  } else $('l-tabla').innerHTML = '';
  const dd = { ...d, ST };
  const ch = cambiosU5(limPrevio, dd);
  if (limPrevio && !ch.length) return;
  if (ch.length === 1 && ch[0] === 'ST') narLim.reemplazar(que, porque, tipoMsg); else narLim.decir(que, porque, tipoMsg);
  limPrevio = dd;
}

// ---------- 5. Ejercicio anticipado ----------
const narAnt = crearNarrador($('an-narrador'), { titulo: 'Por qué (no) conviene ejercer antes' });
let antPrevio = null;

function simAnticipado() {
  const d = { K: numero('an-k'), r: numero('an-r') / 100, sigma: numero('an-sigma') / 100, T: numero('an-t'), q: numero('an-q') / 100 };
  if (Object.values(d).some(Number.isNaN) || d.K <= 0 || d.T <= 0 || d.sigma <= 0) return datosInvalidos();
  const xs = []; for (let i = 0; i <= 24; i++) xs.push(d.K * (0.5 + i / 24));
  const prem = (S, tipo) => Opciones.binomial({ S, K: d.K, r: d.r, sigma: d.sigma, T: d.T, q: d.q, n: 200, tipo, americana: true }).precio - Opciones.binomial({ S, K: d.K, r: d.r, sigma: d.sigma, T: d.T, q: d.q, n: 200, tipo }).precio;
  const put = xs.map(S => ({ x: S, y: Math.max(prem(S, 'put'), 0) })), call = xs.map(S => ({ x: S, y: Math.max(prem(S, 'call'), 0) }));
  const c = coloresGrafico();
  dibujarGrafico($('an-grafico'), { type: 'line', data: { datasets: [
    { label: 'Put: americano − europeo', data: put, borderColor: c.acento, borderWidth: 2.5, pointRadius: 0, tension: 0.2 },
    { label: 'Call: americano − europeo', data: call, borderColor: c.series[3], borderWidth: 2.2, pointRadius: 0, tension: 0.2 },
  ] }, options: opcionesEjes({ tituloX: 'Precio de la acción hoy', tituloY: 'Valor del derecho a ejercer antes', xMin: xs[0], xMax: xs[xs.length - 1], decX: 0, decY: 2 }) });
  const maxPut = Math.max(...put.map(p => p.y)), maxCall = Math.max(...call.map(p => p.y));
  const ch = cambiosU5(antPrevio, d);
  if (antPrevio && !ch.length) return;
  const base = `${d.q === 0 ? 'Sin dividendos el call americano vale lo mismo que el europeo: ejercerlo antes es pagar K antes de tiempo y perder la protección, así que nunca conviene. ' : `Con dividendos (q = ${fmt(d.q * 100, 1)} %) puede convenir ejercer el call antes, para cobrar el dividendo: aparece un valor de hasta ${fmt(maxCall, 2)}. `}El put sí puede convenir ejercerlo antes cuando está muy dentro del dinero: cobrar K hoy y ganar el interés vale más que esperar. Ese derecho vale hasta ${fmt(maxPut, 2)}.`;
  const motivos = { r: 'Con más tasa vale más cobrar K hoy: crece el valor del ejercicio anticipado del put.', q: 'El dividendo lo cobra quien tiene la acción: con más q, más conviene ejercer el call antes, y menos el put.', sigma: 'Con más volatilidad vale más esperar (la opción tiene más valor tiempo), así que ejercer antes conviene en menos casos.', T: 'Con más plazo, el interés que se gana cobrando K antes es mayor, pero también hay más valor tiempo.', K: 'El strike cambia la escala del gráfico.' };
  narAnt.decir(ch.length === 1 ? `Cambió ${{ r: 'la tasa', q: 'el dividendo', sigma: 'la volatilidad', T: 'el plazo', K: 'el strike' }[ch[0]]}.` : 'Valor del ejercicio anticipado.', (ch.length === 1 ? motivos[ch[0]] + ' ' : '') + base);
  antPrevio = d;
}

// ---------- 3. Paridad put-call y arbitraje ----------
const EJEMPLOS_PARIDAD = {
  europea: { 'q-s': 50, 'q-k': 50, 'q-r': 5, 'q-t': '1', 'q-c': 5, 'q-p': 2 },
  americana: { 'q-s': 19, 'q-k': 20, 'q-r': 10, 'q-t': '5/12', 'q-c': 1.5, 'q-p': 2 },
};

function simParidad() {
  const S = numero('q-s'), K = numero('q-k'), r = numero('q-r') / 100, T = numero('q-t');
  const c = numero('q-c'), p = numero('q-p');
  if ([S, K, r, T, c, p].some(Number.isNaN)) return datosInvalidos();
  const tipo = elegido('q-tipo');
  const vpK = K * Math.exp(-r * T);

  if (tipo === 'europea') {
    const par = Opciones.paridad({ S, K, r, T, call: c, put: p });
    const dif = par.diferencia;
    let html = `
      <div class="resultados">
        <div class="dato"><div class="dato-etiqueta">Cartera A: c + Ke<sup>−rT</sup></div><div class="dato-valor">${fmt(par.carteraA, 4)}</div></div>
        <div class="dato"><div class="dato-etiqueta">Cartera C: p + S₀</div><div class="dato-valor">${fmt(par.carteraC, 4)}</div></div>
        <div class="dato destacado"><div class="dato-etiqueta">Diferencia (A − C)</div><div class="dato-valor">${fmt(dif, 4)}</div></div>
        <div class="dato"><div class="dato-etiqueta">Put que cumple la paridad</div><div class="dato-valor">${fmt(c + vpK - S, 4)}</div></div>
      </div>`;

    if (Math.abs(dif) < 0.005) {
      html += '<div class="ok">Se cumple la paridad put-call: no hay oportunidad de arbitraje.</div>';
    } else {
      const aCara = dif > 0;
      const filas = aCara
        ? [
            ['Vender el call', fmt(c), '\\(-(S_T - K)\\)', '0'],
            ['Comprar el put', fmt(-p), '0', '\\(K - S_T\\)'],
            ['Comprar la acción', fmt(-S), '\\(S_T\\)', '\\(S_T\\)'],
            [`Tomar prestado \\(Ke^{-rT}\\)`, fmt(vpK), '\\(-K\\)', '\\(-K\\)'],
          ]
        : [
            ['Comprar el call', fmt(-c), '\\(S_T - K\\)', '0'],
            ['Vender el put', fmt(p), '0', '\\(-(K - S_T)\\)'],
            ['Vender en corto la acción', fmt(S), '\\(-S_T\\)', '\\(-S_T\\)'],
            [`Prestar (invertir) \\(Ke^{-rT}\\)`, fmt(-vpK), '\\(+K\\)', '\\(+K\\)'],
          ];
      filas.push(['<strong>Total</strong>', { texto: '+' + fmt(Math.abs(dif), 4), clase: 'pos' }, '0', '0']);
      html += `
        <div class="alerta">No se cumple la paridad: la cartera ${aCara ? 'A (call + bono) está cara' : 'C (put + acción) está cara'}. Se vende lo caro y se compra lo barato.</div>
        ${tablaHTML([{ titulo: 'Operación' }, { titulo: 'Flujo hoy', num: true }, { titulo: 'Al vencimiento si S<sub>T</sub> &gt; K', num: true }, { titulo: 'Al vencimiento si S<sub>T</sub> &lt; K', num: true }], filas, i => (i === filas.length - 1 ? 'total' : ''))}
        <p>Hoy se cobra <strong>${fmt(Math.abs(dif), 4)}</strong> y al vencimiento todas las posiciones se cancelan, suba o baje la acción: es una ganancia sin riesgo.</p>`;
    }
    $('q-resultado').innerHTML = html;
  } else {
    const inf = S - K, sup = S - vpK;
    const pMin = c - sup, pMax = c - inf;
    const difCP = c - p;
    let html = `
      <div class="resultados">
        <div class="dato"><div class="dato-etiqueta">S₀ − K (límite inferior)</div><div class="dato-valor">${fmt(inf, 4)}</div></div>
        <div class="dato"><div class="dato-etiqueta">S₀ − Ke<sup>−rT</sup> (límite superior)</div><div class="dato-valor">${fmt(sup, 4)}</div></div>
        <div class="dato"><div class="dato-etiqueta">C − P observado</div><div class="dato-valor">${fmt(difCP, 4)}</div></div>
        <div class="dato destacado"><div class="dato-etiqueta">Rango admisible para P</div><div class="dato-valor" style="font-size:1.1rem">${fmt(pMin)} a ${fmt(pMax)}</div></div>
      </div>
      <p>\\(${fmt(inf, 2)} \\le C - P \\le ${fmt(sup, 2)}\\). Con \\(C = ${fmt(c)}\\), el put americano tiene que valer entre ${fmt(pMin)} y ${fmt(pMax)}.</p>`;
    if (difCP > sup + 1e-9) {
      html += '<div class="alerta">Se viola el límite superior: \\(C - P \\gt S_0 - Ke^{-rT}\\). La cartera E (call + bono que paga K) está cara frente a la F (put + acción): conviene vender E y comprar F.</div>';
    } else if (difCP < inf - 1e-9) {
      html += '<div class="alerta">Se viola el límite inferior: \\(C - P \\lt S_0 - K\\). La cartera G (call + K en efectivo) está barata frente a la F (put + acción): conviene comprar G y vender F.</div>';
    } else {
      html += '<div class="ok">El precio del put está dentro de la banda: no hay arbitraje.</div>';
    }
    $('q-resultado').innerHTML = html;
  }
  renderFormulas($('q-resultado'));
}

document.querySelectorAll('input[name="q-tipo"]').forEach(radio =>
  radio.addEventListener('change', () => {
    Object.entries(EJEMPLOS_PARIDAD[radio.value]).forEach(([id, v]) => { $(id).value = v; });
    simParidad();
  })
);


alCambiar('w-posicion', simPosicion);
alCambiar('w-variables', simVariables);
alCambiar('w-lim', simLimites);
alCambiar('w-paridad', simParidad);
alCambiar('w-ant', simAnticipado);
