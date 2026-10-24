// Unidad VII · Simulaciones: fórmula general con q, seguro de cartera, árbol de un futuro y cobertura cambiaria.

// ======================================================================
// 1. Calculadora generalizada
// ======================================================================

const narCa = crearNarrador($('ca-narrador'), { titulo: 'Qué representa q y por qué importa' });
let caPrevio = null, caSub = null;

function controlQ() {
  const sub = $('ca-sub').value;
  if (sub === caSub) return;
  caSub = sub;
  $('ca-s-label').textContent = { indice: 'Nivel del índice S₀', accion: 'Precio de la acción S₀', moneda: 'Tipo de cambio contado S₀', futuro: 'Precio del futuro F₀' }[sub];
  if (sub === 'accion' || sub === 'futuro') { $('ca-q-box').innerHTML = `<p class="ayuda" style="margin-top:22px">${sub === 'accion' ? 'Sin dividendos: q = 0.' : 'Para un futuro, q = r: el modelo de Black.'}</p>`; return; }
  const v = sub === 'moneda' ? 3 : 2;
  $('ca-q-box').innerHTML = controlRango({ id: 'ca-q', etiqueta: sub === 'moneda' ? 'Tasa extranjera r_f (%)' : 'Rendimiento por dividendos q (%)', min: 0, max: 15, paso: 0.25, valor: v, formato: x => fmt(x, 2) + ' %' });
  vincularRango('ca-q', x => fmt(x, 2) + ' %');
  if (sub === 'moneda') { $('ca-s').value = 1.10; $('ca-k').value = 1.05; $('ca-r').value = 6; $('ca-sigma').value = 25; $('ca-t').value = '0,5'; }
  if (sub === 'indice') { $('ca-s').value = 50; $('ca-k').value = 50; $('ca-r').value = 5; $('ca-sigma').value = 30; $('ca-t').value = '8/12'; }
}

function simCalc() {
  controlQ();
  const sub = $('ca-sub').value;
  const S = numero('ca-s'), K = numero('ca-k'), r = numero('ca-r') / 100, sigma = numero('ca-sigma') / 100, T = numero('ca-t');
  const q = sub === 'futuro' ? r : sub === 'accion' ? 0 : numero('ca-q') / 100;
  if ([S, K, r, sigma, T, q].some(Number.isNaN) || S <= 0 || K <= 0 || T <= 0 || sigma <= 0) return datosInvalidos();
  const b = Opciones.blackScholes({ S, K, r, sigma, T, q });
  const Sq = S * Math.exp(-q * T), Kr = K * Math.exp(-r * T);
  const minC = Math.max(Sq - Kr, 0), minP = Math.max(Kr - Sq, 0);
  const dec = S < 10 ? 4 : 2;
  const nombreS = sub === 'futuro' ? 'F₀' : 'S₀';
  $('ca-datos').innerHTML = `
    <div class="dato destacado"><div class="dato-etiqueta">Call</div><div class="dato-valor">${fmt(b.call, dec)}</div><div class="dato-nota">mínimo ${fmt(minC, dec)}</div></div>
    <div class="dato destacado"><div class="dato-etiqueta">Put</div><div class="dato-valor">${fmt(b.put, dec)}</div><div class="dato-nota">mínimo ${fmt(minP, dec)}</div></div>
    <div class="dato"><div class="dato-etiqueta">${nombreS}·e^(−qT)</div><div class="dato-valor">${fmt(Sq, dec)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Paridad: c + K·e^(−rT) = p + ${nombreS}·e^(−qT)</div><div class="dato-valor" style="font-size:0.95rem">${fmt(b.call + Kr, dec)} = ${fmt(b.put + Sq, dec)}</div></div>`;
  const c = coloresGrafico();
  const xs = []; for (let i = 0; i <= 120; i++) xs.push(K * (0.5 + i / 120));
  dibujarGrafico($('ca-grafico'), {
    type: 'line',
    data: { datasets: [
      { label: 'Call', data: xs.map(x => ({ x, y: Opciones.blackScholes({ S: x, K, r, sigma, T, q }).call })), borderColor: c.acento, borderWidth: 2.5, pointRadius: 0 },
      { label: 'Put', data: xs.map(x => ({ x, y: Opciones.blackScholes({ S: x, K, r, sigma, T, q }).put })), borderColor: c.series[2], borderWidth: 2.5, pointRadius: 0 },
      { label: 'Call con q = 0', data: xs.map(x => ({ x, y: Opciones.blackScholes({ S: x, K, r, sigma, T, q: 0 }).call })), borderColor: c.acento, borderDash: [4, 4], borderWidth: 1.2, pointRadius: 0, hidden: q === 0 },
      { label: 'Hoy', data: [{ x: S, y: b.call }, { x: S, y: b.put }], showLine: false, pointRadius: 6, pointBackgroundColor: c.eje },
    ] },
    options: opcionesEjes({ tituloX: sub === 'futuro' ? 'Precio del futuro' : 'Precio del subyacente', tituloY: 'Prima', xMin: xs[0], xMax: xs[xs.length - 1], decX: dec === 4 ? 2 : 0, decY: dec }),
  });
  const qq = { indice: 'el rendimiento por dividendos del índice: quien tiene las acciones lo cobra y quien tiene la opción no', accion: 'cero: la acción no paga dividendos, así que vale el Black-Scholes original', moneda: 'la tasa de interés de la moneda extranjera: quien tiene la moneda la coloca a r_f, quien tiene la opción no (Garman-Kohlhagen)', futuro: 'la tasa r: el futuro no cuesta nada hoy, así que en el mundo neutral al riesgo su valor esperado no crece (modelo de Black)' }[sub];
  const clave = [sub, q].join('|');
  const porque = `Acá q es ${qq}. Para valuar alcanza con reemplazar ${nombreS} por ${nombreS}·e^(−qT) = ${fmt(Sq, dec)} en la fórmula de Black-Scholes (regla de Merton). Un q más alto baja ese valor: el call vale menos (se parece menos a tener el activo) y el put vale más. La paridad y los límites cambian igual: ${nombreS} pasa a ser ${nombreS}·e^(−qT).`;
  if (clave !== caPrevio) { narCa.decir(`Call ${fmt(b.call, dec)} y put ${fmt(b.put, dec)} con q = ${fmt(q * 100, 2)} %.`, porque); caPrevio = clave; }
  else narCa.reemplazar(`Call ${fmt(b.call, dec)} y put ${fmt(b.put, dec)} con q = ${fmt(q * 100, 2)} %.`, porque);
}
alCambiar('w-calc', simCalc);

// ======================================================================
// 2. Seguro de cartera
// ======================================================================

const narSe = crearNarrador($('se-narrador'), { titulo: 'Cómo funciona el seguro' });
$('se-st-box').innerHTML = controlRango({ id: 'se-st', etiqueta: 'Índice al vencimiento', min: 700, max: 1300, paso: 5, valor: 880, formato: v => fmt(v, 0) });
vincularRango('se-st', v => fmt(v, 0));

function simSeguro() {
  const V0 = numero('se-v'), Vmin = numero('se-vmin'), beta = numero('se-b'), S0 = numero('se-i'), m = numero('se-m'), r = numero('se-r') / 100, q = numero('se-q') / 100, sigma = numero('se-sigma') / 100, T = numero('se-t') / 12, ST = numero('se-st');
  if ([V0, Vmin, beta, S0, m, r, q, sigma, T, ST].some(Number.isNaN) || beta <= 0 || S0 <= 0) return datosInvalidos();
  // Rendimientos simples del período, como en Hull 12.4
  const valor = s => V0 * (1 + r * T + beta * (s / S0 - 1 + q * T - r * T) - q * T);
  const K = S0 * (1 + (Vmin / V0 - 1 - r * T + q * T) / beta + r * T - q * T);
  const N = (beta * V0) / (m * S0);
  const prima = Opciones.blackScholes({ S: S0, K, r, sigma, T, q }).put;
  const costo = N * m * prima;
  const con = s => valor(s) + N * m * Math.max(K - s, 0);
  $('se-datos').innerHTML = `
    <div class="dato destacado"><div class="dato-etiqueta">Strike K</div><div class="dato-valor">${fmt(K, 2)}</div></div>
    <div class="dato destacado"><div class="dato-etiqueta">Contratos de puts</div><div class="dato-valor">${fmt(N, 2)}</div><div class="dato-nota">β·V₀/(m·S₀)</div></div>
    <div class="dato"><div class="dato-etiqueta">Prima por punto (BSM)</div><div class="dato-valor">${fmt(prima, 2)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Costo del seguro</div><div class="dato-valor">${fmt(costo, 0)}</div><div class="dato-nota">${fmt((costo / V0) * 100, 2)} % de la cartera</div></div>
    <div class="dato"><div class="dato-etiqueta">Con el índice en ${fmt(ST, 0)}</div><div class="dato-valor">${fmt(con(ST), 0)}</div><div class="dato-nota">sin seguro ${fmt(valor(ST), 0)}</div></div>`;
  const c = coloresGrafico();
  const xs = []; for (let s = 700; s <= 1300; s += 5) xs.push(s);
  dibujarGrafico($('se-grafico'), {
    type: 'line',
    data: { datasets: [
      { label: 'Cartera sin seguro', data: xs.map(s => ({ x: s, y: valor(s) / 1000 })), borderColor: c.series[0], borderWidth: 2, pointRadius: 0 },
      { label: 'Cartera + puts (sin contar la prima)', data: xs.map(s => ({ x: s, y: con(s) / 1000 })), borderColor: c.acento, borderWidth: 2.6, pointRadius: 0 },
      { label: 'Valor asegurado', data: [{ x: 700, y: Vmin / 1000 }, { x: 1300, y: Vmin / 1000 }], borderColor: c.ganancia, borderDash: [5, 4], borderWidth: 1.2, pointRadius: 0 },
      { label: 'Escenario', data: [{ x: ST, y: con(ST) / 1000 }], showLine: false, pointRadius: 6, pointBackgroundColor: c.acento },
    ] },
    options: opcionesEjes({ tituloX: 'Índice al vencimiento', tituloY: 'Valor (miles)', xMin: 700, xMax: 1300, decX: 0, decY: 0 }),
  });
  const ejerce = ST < K;
  narSe.reemplazar(
    `Con el índice en ${fmt(ST, 0)}, la cartera vale ${fmt(valor(ST), 0)} y los puts ${ejerce ? `pagan ${fmt(N * m * (K - ST), 0)}` : 'no se ejercen'}: total ${fmt(con(ST), 0)}.`,
    `Con β = ${fmt(beta, 2)}, cada punto que cae el índice le cuesta a la cartera ${fmt(beta, 2)} veces más que a una cartera que replica el índice: por eso hacen falta ${fmt(beta, 2)} veces más puts (${fmt(N, 2)} contratos). El strike (${fmt(K, 1)}) es el nivel del índice en el que, por CAPM, la cartera vale justo lo asegurado. ${beta > 1 ? 'Con β > 1 el strike queda más cerca del índice actual y el seguro es más caro.' : beta < 1 ? 'Con β < 1 el strike queda más lejos del índice actual.' : ''} Por debajo del strike lo que pierde la cartera lo pagan los puts; por encima, la cartera conserva la suba. El costo (${fmt(costo, 0)}) es el precio de ese piso.`,
    ejerce ? 'aviso' : 'pos',
  );
}
alCambiar('w-seguro', simSeguro);

// ======================================================================
// 3. Árbol binomial de un futuro
// ======================================================================

function dibujarArbol(arbol, n, K) {
  const W = 150, H = 62, ancho = 40 + (n + 1) * W, alto = Math.max(160, (n + 1) * H + 20);
  let svg = `<svg viewBox="0 0 ${ancho} ${alto}" role="img" aria-label="Árbol binomial del futuro">`;
  const pos = (i, j) => ({ x: 30 + i * W, y: alto / 2 + (i / 2 - j) * H });
  for (let i = 0; i < n; i++) for (let j = 0; j <= i; j++) {
    const a = pos(i, j), b1 = pos(i + 1, j + 1), b2 = pos(i + 1, j);
    svg += `<line x1="${a.x + 100}" y1="${a.y}" x2="${b1.x}" y2="${b1.y}" class="s-trazo" stroke-width="1" opacity="0.5"/><line x1="${a.x + 100}" y1="${a.y}" x2="${b2.x}" y2="${b2.y}" class="s-trazo" stroke-width="1" opacity="0.5"/>`;
  }
  for (let i = 0; i <= n; i++) for (let j = 0; j <= i; j++) {
    const nodo = arbol[i][j], p = pos(i, j);
    svg += `<rect x="${p.x}" y="${p.y - 22}" width="100" height="44" rx="6" class="${nodo.anticipado ? 's-relleno' : ''} s-caja" stroke-width="${nodo.anticipado ? 2.5 : 1.2}"/>
      <text x="${p.x + 50}" y="${p.y - 5}" text-anchor="middle" font-size="12" class="s-suave">F = ${fmt(nodo.S, 2)}</text>
      <text x="${p.x + 50}" y="${p.y + 13}" text-anchor="middle" font-size="13.5" font-weight="700" class="s-texto">${fmt(nodo.V, 3)}${nodo.anticipado ? ' ★' : ''}</text>`;
  }
  return svg + '</svg>';
}

function simArbol() {
  const F = numero('ab-f'), K = numero('ab-k'), r = numero('ab-r') / 100, sigma = numero('ab-sigma') / 100, T = numero('ab-t'), n = Number($('ab-n').value);
  const tipo = $('ab-tipo').value, americana = $('ab-ej').value === 'ame';
  if ([F, K, r, sigma, T].some(Number.isNaN) || T <= 0 || sigma <= 0) return datosInvalidos();
  const res = Opciones.binomial({ S: F, K, r, sigma, T, n, tipo, americana, q: r, guardarArbol: true });
  const eur = Opciones.binomial({ S: F, K, r, sigma, T, n, tipo, americana: false, q: r });
  const black = Opciones.black76({ F, K, r, sigma, T })[tipo];
  $('ab-svg').innerHTML = dibujarArbol(res.arbol, n, K);
  const anticipados = res.arbol.flatMap((fila, i) => fila.map((nd, j) => ({ ...nd, i, j }))).filter(nd => nd.anticipado);
  $('ab-datos').innerHTML = `
    <div class="dato"><div class="dato-etiqueta">u = e^(σ√Δt)</div><div class="dato-valor">${fmt(res.u, 4)}</div></div>
    <div class="dato"><div class="dato-etiqueta">p = (1 − d)/(u − d)</div><div class="dato-valor">${fmt(res.p, 4)}</div></div>
    <div class="dato destacado"><div class="dato-etiqueta">${americana ? 'Americana' : 'Europea'} (árbol)</div><div class="dato-valor">${fmt(res.precio, 4)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Europea con Black</div><div class="dato-valor">${fmt(black, 4)}</div></div>`;
  $('ab-texto').innerHTML = `<p>En cada paso el futuro sube a \\(F\\,u\\) o baja a \\(F\\,d\\). Como el futuro no cuesta nada, su valor esperado neutral al riesgo tiene que ser el precio de hoy: \\(p\\,u + (1-p)\\,d = 1\\), de donde \\(p = (1 - d)/(u - d) = ${fmt(res.p, 4).replace(',', '{,}')}\\). Es lo mismo que un activo con \\(q = r\\).</p>
    <p>${americana
      ? (anticipados.length
        ? `Las celdas resaltadas con ★ son nodos donde conviene <b>ejercer anticipadamente</b> (${anticipados.length}): el valor intrínseco supera al valor de seguir. Con opciones sobre futuros puede convenir ejercer temprano también un <b>call</b> muy dentro del dinero, porque al ejercer se cobra ya \\(F - K\\) y se gana el interés. La americana vale ${fmt(res.precio - eur.precio, 4)} más que la europea (${fmt(eur.precio, 4)}).`
        : 'En este árbol no conviene ejercer en ningún nodo antes del vencimiento: la americana vale lo mismo que la europea.')
      : `Con ${n} pasos el árbol da ${fmt(res.precio, 4)}; Black da ${fmt(black, 4)}. Con más pasos converge.`}</p>`;
  renderFormulas($('ab-texto'));
}
alCambiar('w-arbol', simArbol);

// ======================================================================
// 4. Cobertura de un exportador
// ======================================================================

const narEx = crearNarrador($('ex-narrador'), { titulo: 'Qué conviene y por qué' });
$('ex-st-box').innerHTML = controlRango({ id: 'ex-st', etiqueta: 'EURUSD al vencimiento', min: 0.85, max: 1.40, paso: 0.005, valor: 0.95, formato: v => fmt(v, 3) });
vincularRango('ex-st', v => fmt(v, 3));

function strikeCallIgual(prima, d) {
  let lo = d.S, hi = d.S * 3;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (Opciones.blackScholes({ S: d.S, K: mid, r: d.r, sigma: d.sigma, T: d.T, q: d.rf }).call > prima) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

function simExpo() {
  const d = { S: numero('ex-s'), r: numero('ex-r') / 100, rf: numero('ex-rf') / 100, sigma: numero('ex-sigma') / 100, T: numero('ex-t'), K1: numero('ex-k1') };
  const ST = numero('ex-st');
  if (Object.values(d).some(Number.isNaN) || d.S <= 0 || d.T <= 0) return datosInvalidos();
  const EUR = 1e6;
  const F = d.S * Math.exp((d.r - d.rf) * d.T);
  const prima = Opciones.blackScholes({ S: d.S, K: d.K1, r: d.r, sigma: d.sigma, T: d.T, q: d.rf }).put;
  const primaT = prima * Math.exp(d.r * d.T);
  const K2 = strikeCallIgual(prima, d);
  const sin = x => x * EUR, fwd = () => F * EUR, put = x => (Math.max(x, d.K1) - primaT) * EUR, rango = x => Math.min(Math.max(x, d.K1), K2) * EUR;
  const c = coloresGrafico();
  const xs = []; for (let x = 0.85; x <= 1.4001; x += 0.01) xs.push(x);
  dibujarGrafico($('ex-grafico'), {
    type: 'line',
    data: { datasets: [
      { label: 'Sin cobertura', data: xs.map(x => ({ x, y: sin(x) / 1e6 })), borderColor: c.series[0], borderWidth: 1.8, pointRadius: 0 },
      { label: `Forward a ${fmt(F, 4)}`, data: xs.map(x => ({ x, y: fwd() / 1e6 })), borderColor: c.series[1], borderWidth: 2, pointRadius: 0 },
      { label: `Put ${fmt(d.K1, 2)} (neto de prima)`, data: xs.map(x => ({ x, y: put(x) / 1e6 })), borderColor: c.acento, borderWidth: 2.5, pointRadius: 0 },
      { label: `Range forward ${fmt(d.K1, 2)}–${fmt(K2, 4)}`, data: xs.map(x => ({ x, y: rango(x) / 1e6 })), borderColor: c.series[2], borderDash: [6, 4], borderWidth: 2.2, pointRadius: 0 },
    ] },
    options: opcionesEjes({ tituloX: 'EURUSD al vencimiento', tituloY: 'Dólares recibidos (millones)', xMin: 0.85, xMax: 1.4, decX: 2, decY: 2 }),
  });
  const vals = { 'Sin cobertura': sin(ST), Forward: fwd(), Put: put(ST), 'Range forward': rango(ST) };
  $('ex-datos').innerHTML = Object.entries(vals).map(([k2, v]) => `<div class="dato"><div class="dato-etiqueta">${k2}</div><div class="dato-valor">${fmt(v, 0)}</div></div>`).join('')
    + `<div class="dato destacado"><div class="dato-etiqueta">Prima del put / strike del call</div><div class="dato-valor" style="font-size:1rem">${fmt(prima, 4)} / ${fmt(K2, 4)}</div></div>`;
  const mejor = Object.entries(vals).sort((a, b) => b[1] - a[1])[0][0];
  narEx.reemplazar(
    `Con el euro a ${fmt(ST, 3)}, el mejor resultado ex post es: ${mejor.toLowerCase()}.`,
    `El forward (${fmt(F, 4)}) fija el resultado: no se paga nada, pero se resigna la suba. El put cuesta ${fmt(prima, 4)} por euro (${fmt(primaT * EUR, 0)} dólares al vencimiento, con intereses) y asegura un piso de ${fmt((d.K1 - primaT) * EUR, 0)} sin resignar la suba. El range forward compra el put ${fmt(d.K1, 2)} y lo paga vendiendo un call ${fmt(K2, 4)} de igual prima: costo cero, a cambio de un techo. El exportador queda dentro de una banda de ${fmt(d.K1 * EUR, 0)} a ${fmt(K2 * EUR, 0)} dólares. Ninguna estrategia es "la mejor" de antemano: dependen de cuánto riesgo se quiere eliminar y de cuánto se está dispuesto a pagar.`,
  );
}
alCambiar('w-expo', simExpo);
