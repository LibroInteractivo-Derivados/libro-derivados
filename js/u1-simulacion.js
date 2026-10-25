// Unidad I · Simulaciones: cuenta de márgenes día a día, payoffs y tipos de operadores.

// ======================================================================
// 1. Cuenta de márgenes día a día
// ======================================================================

const HULL_ORO = [1441, 1438.3, 1444.6, 1441.3, 1440.1, 1436.2, 1429.9, 1430.8, 1425.4, 1428.1, 1411, 1411, 1414.3, 1416.1, 1423, 1426.9];
let preciosMg = [];
const narMg = crearNarrador($('mg-narrador'), { titulo: 'Qué pasó en tu cuenta', maximo: 10 });

function datosMg() {
  return { larga: elegido('mg-lado') === 'larga', n: numero('mg-n'), tam: numero('mg-tam'), p0: numero('mg-p0'), mi: numero('mg-mi'), mm: numero('mg-mm') };
}

function cuentaMg() {
  const d = datosMg();
  return Futuros.cuentaMargen({ precios: [d.p0, ...preciosMg], contratos: d.n, tamano: d.tam, margenInicial: d.mi, margenMantenimiento: d.mm, larga: d.larga });
}

function narrarDia() {
  const d = datosMg();
  const r = cuentaMg();
  const f = r.filas[r.filas.length - 1];
  if (!f) return;
  const ayer = r.filas.length > 1 ? r.filas[r.filas.length - 2].precio : d.p0;
  const mov = f.precio - ayer;
  const gana = f.diaria >= 0;
  let porque = `El precio ${mov >= 0 ? 'subió' : 'bajó'} ${fmt(Math.abs(mov))}: ${fmt(Math.abs(mov))} × ${fmt(d.tam, 0)} × ${fmt(d.n, 0)} contratos = ${fmt(Math.abs(f.diaria))}. ${d.larga ? 'Estás largo: ganás cuando sube y perdés cuando baja.' : 'Estás corto: ganás cuando baja y perdés cuando sube.'} La cámara acredita o debita la diferencia el mismo día (ajuste diario).`;
  let tipo = gana ? 'pos' : 'neg';
  if (f.llamado > 0) {
    porque += ` El saldo quedó en ${fmt(f.saldoAntes)}, por debajo del margen de mantenimiento (${fmt(r.mm)}): <b>llamado de margen</b>. Hay que depositar ${fmt(f.llamado)} para volver al margen inicial (${fmt(r.mi)}), no solo al de mantenimiento. Si no se deposita, el agente cierra la posición.`;
    tipo = 'aviso';
  } else if (f.saldo < r.mm + (r.mi - r.mm) * 0.35 && !gana) {
    porque += ` Ojo: el saldo (${fmt(f.saldo)}) está cerca del margen de mantenimiento.`;
  }
  narMg.decir(`Día ${f.dia}: ajuste a ${fmt(f.precio)} → ${fmtSigno(f.diaria)}`, porque, tipo);
}

function dibujarMg() {
  const d = datosMg();
  if (Object.values(d).some(v => typeof v === 'number' && Number.isNaN(v))) return;
  const r = cuentaMg();
  const ultima = r.filas[r.filas.length - 1];
  const precio = ultima ? ultima.precio : d.p0;
  const caida = (d.mi - d.mm) / d.tam;
  $('mg-datos').innerHTML = `
    <div class="dato"><div class="dato-etiqueta">Precio de ajuste</div><div class="dato-valor">${fmt(precio)}</div><div class="dato-nota">día ${ultima ? ultima.dia : 0}</div></div>
    <div class="dato destacado"><div class="dato-etiqueta">Saldo de la cuenta</div><div class="dato-valor">${fmt(ultima ? ultima.saldo : r.mi)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Resultado acumulado</div><div class="dato-valor ${claseSigno(ultima ? ultima.acumulada : 0)}">${fmtSigno(ultima ? ultima.acumulada : 0)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Depositado por llamados</div><div class="dato-valor">${fmt(r.totalLlamados)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Margen antes de un llamado</div><div class="dato-valor">${fmt(caida)}</div><div class="dato-nota">por unidad, desde el saldo inicial</div></div>`;
  const c = coloresGrafico();
  const dias = [0, ...r.filas.map(f => f.dia)];
  const saldos = [r.mi, ...r.filas.map(f => f.saldo)];
  const antes = [r.mi, ...r.filas.map(f => f.saldoAntes)];
  dibujarGrafico($('mg-grafico'), {
    type: 'line',
    data: { datasets: [
      { label: 'Saldo antes del llamado', data: dias.map((x, i) => ({ x, y: antes[i] })), borderColor: c.series[0], borderDash: [4, 4], borderWidth: 1.5, pointRadius: 3, stepped: false },
      { label: 'Saldo después del llamado', data: dias.map((x, i) => ({ x, y: saldos[i] })), borderColor: c.acento, borderWidth: 2.5, pointRadius: 3 },
      { label: 'Margen inicial', data: [{ x: 0, y: r.mi }, { x: Math.max(1, dias.length - 1), y: r.mi }], borderColor: c.ganancia, borderWidth: 1.2, pointRadius: 0 },
      { label: 'Margen de mantenimiento', data: [{ x: 0, y: r.mm }, { x: Math.max(1, dias.length - 1), y: r.mm }], borderColor: c.perdida, borderWidth: 1.2, borderDash: [6, 4], pointRadius: 0 },
    ] },
    options: (() => {
      const o = opcionesEjes({ tituloX: 'Día', tituloY: 'Saldo de la cuenta', xMin: 0, xMax: Math.max(1, dias.length - 1), decX: 0, decY: 0 });
      o.scales.x.ticks.stepSize = 1; // un tick por día (sin "0 0 0 1 1 1")
      o.plugins.legend.labels.boxWidth = 12;
      return o;
    })(),
  });
  $('mg-tabla').innerHTML = r.filas.length ? tablaHTML(
    [{ titulo: 'Día' }, { titulo: 'Precio', num: true }, { titulo: 'Diaria', num: true }, { titulo: 'Acumulada', num: true }, { titulo: 'Saldo', num: true }, { titulo: 'Llamado', num: true }],
    r.filas.map(f => [f.dia, fmt(f.precio), { texto: fmtSigno(f.diaria), clase: claseSigno(f.diaria) }, { texto: fmtSigno(f.acumulada), clase: claseSigno(f.acumulada) }, fmt(f.saldo), f.llamado > 0 ? { texto: fmt(f.llamado), clase: 'neg' } : '—']),
    i => (r.filas[i].llamado > 0 ? 'resaltada' : ''), 'compacta') : '<p class="vacio">Todavía no pasó ningún día. Usá los botones.</p>';
}

function avanzar(mov) {
  const d = datosMg();
  const ultimo = preciosMg.length ? preciosMg[preciosMg.length - 1] : d.p0;
  preciosMg.push(Math.max(0.01, Math.round((ultimo + mov) * 100) / 100));
  dibujarMg();
  narrarDia();
}

document.querySelectorAll('[data-mov]').forEach(b => b.addEventListener('click', () => avanzar(parseFloat(b.dataset.mov))));
$('mg-azar').addEventListener('click', () => avanzar(Math.round(Opciones.aleatorioNormal() * 6 * 100) / 100));
$('mg-hull').addEventListener('click', () => {
  preciosMg = [];
  $('mg-p0').value = 1450; $('mg-n').value = 2; $('mg-tam').value = 100; $('mg-mi').value = 6000; $('mg-mm').value = 4500;
  document.querySelector('input[name="mg-lado"][value="larga"]').checked = true;
  narMg.limpiar();
  HULL_ORO.forEach(p => { preciosMg.push(p); });
  dibujarMg();
  const r = cuentaMg();
  narMg.decir('Cargaste los 16 días del ejemplo de Hull.', `Hubo llamados de margen los días ${r.filas.filter(f => f.llamado > 0).map(f => `${f.dia} (${fmt(f.llamado)})`).join(' y ')}. Al final el inversor perdió ${fmt(-r.filas[r.filas.length - 1].acumulada)}: el oro pasó de 1.450 a 1.426,90.`);
});
$('mg-reiniciar').addEventListener('click', () => { preciosMg = []; narMg.limpiar(); dibujarMg(); });
$('w-margen').addEventListener('change', e => {
  if (e.target.closest('.entradas')) {
    dibujarMg();
    narMg.decir('Cambiaste los datos de la posición.', 'La tabla se recalculó con los mismos precios. Un margen inicial más alto da más colchón antes del primer llamado; uno de mantenimiento más alto hace que los llamados lleguen antes.');
  }
});
alCambiarTema(dibujarMg);
dibujarMg();
narMg.decir('Abriste la posición.', `Depositaste el margen inicial: ${fmt(numero('mg-mi') * numero('mg-n'))}. A partir de ahora, todos los días la cámara compara el precio de ajuste con el del día anterior y te acredita o debita la diferencia. Tocá "Día siguiente".`);

// ======================================================================
// 2. Forward, futuro u opción
// ======================================================================

const narPo = crearNarrador($('po-narrador'), { titulo: 'Qué pasa al vencimiento' });
$('po-st-box').innerHTML = controlRango({ id: 'po-st', etiqueta: 'Precio del subyacente al vencimiento S_T', min: 50, max: 150, paso: 0.5, valor: 112, formato: v => fmt(v) });
vincularRango('po-st', v => fmt(v));

function simPayoff() {
  const pos = $('po-pos').value, K = numero('po-k'), prima = numero('po-prima'), ST = numero('po-st');
  if ([K, prima, ST].some(Number.isNaN)) return datosInvalidos();
  const esFwd = pos.includes('fwd');
  const side = pos.startsWith('long') ? 'compra' : 'venta';
  const pata = esFwd ? { type: 'stock', side, strike: 0, premium: K, qty: 1 } : { type: pos.split('-')[1], side, strike: K, premium: prima, qty: 1 };
  const bruto = esFwd ? Payoff.legPnL(pata, ST) : Payoff.legPnL({ ...pata, premium: 0 }, ST);
  const neto = Payoff.legPnL(pata, ST);
  const lo = K * 0.5, hi = K * 1.5;
  const xs = []; for (let i = 0; i <= 160; i++) xs.push(lo + ((hi - lo) * i) / 160); xs.push(K); xs.sort((a, b) => a - b);
  const c = coloresGrafico();
  const ds = [{ label: 'Resultado neto', data: xs.map(x => ({ x, y: Payoff.legPnL(pata, x) })), borderColor: c.acento, borderWidth: 2.5, pointRadius: 0, fill: { target: 'origin', above: c.rellenoGanancia, below: c.rellenoPerdida } }];
  if (!esFwd) ds.push({ label: 'Payoff bruto', data: xs.map(x => ({ x, y: Payoff.legPnL({ ...pata, premium: 0 }, x) })), borderColor: c.series[0], borderDash: [6, 4], borderWidth: 1.5, pointRadius: 0 });
  ds.push({ label: 'S_T elegido', data: [{ x: ST, y: neto }], showLine: false, pointRadius: 7, pointBackgroundColor: c.acento, pointBorderColor: c.superficie, pointBorderWidth: 2 });
  dibujarGrafico($('po-grafico'), { type: 'line', data: { datasets: ds }, options: opcionesEjes({ tituloX: 'Precio al vencimiento S_T', tituloY: 'Resultado', xMin: lo, xMax: hi, decX: 0 }) });
  $('po-datos').innerHTML = `
    <div class="dato"><div class="dato-etiqueta">Payoff bruto</div><div class="dato-valor ${claseSigno(bruto)}">${fmtSigno(bruto)}</div></div>
    <div class="dato destacado"><div class="dato-etiqueta">Resultado neto</div><div class="dato-valor ${claseSigno(neto)}">${fmtSigno(neto)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Costo de entrada</div><div class="dato-valor">${esFwd ? '0' : (side === 'compra' ? '−' : '+') + fmt(prima)}</div><div class="dato-nota">${esFwd ? 'el forward no cuesta nada' : side === 'compra' ? 'prima pagada' : 'prima cobrada'}</div></div>`;
  let que, porque;
  const k = fmt(K), st = fmt(ST);
  if (esFwd) {
    que = `Con S_T = ${st}, el forward ${side === 'compra' ? 'largo' : 'corto'} da ${fmtSigno(neto)}.`;
    porque = side === 'compra'
      ? `Estás obligado a comprar a ${k} algo que vale ${st}: ${ST >= K ? 'ganás la diferencia' : 'perdés la diferencia, porque pagás más de lo que vale'}. No hay elección: el forward obliga a las dos partes, por eso el payoff es una recta (S_T − K) sin piso ni techo.`
      : `Estás obligado a vender a ${k} algo que vale ${st}: ${ST <= K ? 'ganás la diferencia' : 'perdés la diferencia, porque entregás algo que vale más'}. El payoff es K − S_T, una recta sin piso ni techo.`;
  } else {
    const tipo = pata.type, itm = tipo === 'call' ? ST > K : ST < K;
    que = `Con S_T = ${st}, el ${tipo} ${side === 'compra' ? 'comprado' : 'vendido'} da ${fmtSigno(neto)}.`;
    const ejerce = tipo === 'call'
      ? (itm ? `se ejerce: comprar a ${k} algo que vale ${st} deja ${fmt(ST - K)}` : `no se ejerce: comprar a ${k} sería más caro que en el mercado (${st})`)
      : (itm ? `se ejerce: vender a ${k} algo que vale ${st} deja ${fmt(K - ST)}` : `no se ejerce: vender a ${k} sería más barato que en el mercado (${st})`);
    porque = side === 'compra'
      ? `La opción ${ejerce}. Al payoff bruto se le resta la prima pagada (${fmt(prima)}). La pérdida máxima es la prima: es el precio del derecho a elegir.`
      : `Quien te compró la opción decide: ${ejerce}. Vos cobraste la prima (${fmt(prima)}), que es tu ganancia máxima; si se ejerce, pagás la diferencia.`;
  }
  narPo.reemplazar(que, porque, neto > 0 ? 'pos' : neto < 0 ? 'neg' : '');
}
alCambiar('w-payoff', simPayoff);

// ======================================================================
// 3. Operadores
// ======================================================================

const narCo = crearNarrador($('co-narrador'), { titulo: 'Qué conviene y por qué' });
$('co-st-box').innerHTML = controlRango({ id: 'co-st', etiqueta: 'Dólar al vencimiento ($ por USD)', min: 1000, max: 2000, paso: 5, valor: 1350, formato: v => fmt(v, 0) });
vincularRango('co-st', v => fmt(v, 0));
const USD = 1000000;

function simCobertura() {
  const S = numero('co-s'), F = numero('co-f'), K = numero('co-k'), prima = numero('co-prima'), ST = numero('co-st');
  if ([S, F, K, prima, ST].some(Number.isNaN)) return datosInvalidos();
  const sin = x => x * USD, fwd = () => F * USD, put = x => (Math.max(x, K) - prima) * USD;
  const c = coloresGrafico();
  const xs = []; for (let x = 1000; x <= 2000; x += 10) xs.push(x);
  dibujarGrafico($('co-grafico'), {
    type: 'line',
    data: { datasets: [
      { label: 'Sin cobertura', data: xs.map(x => ({ x, y: sin(x) / 1e6 })), borderColor: c.series[0], borderWidth: 2, pointRadius: 0 },
      { label: 'Con forward', data: xs.map(x => ({ x, y: fwd() / 1e6 })), borderColor: c.acento, borderWidth: 2.5, pointRadius: 0 },
      { label: 'Con put', data: xs.map(x => ({ x, y: put(x) / 1e6 })), borderColor: c.series[2], borderWidth: 2.5, borderDash: [6, 4], pointRadius: 0 },
      { label: 'Dólar elegido', data: [{ x: ST, y: sin(ST) / 1e6 }, { x: ST, y: fwd() / 1e6 }, { x: ST, y: put(ST) / 1e6 }], showLine: false, pointRadius: 5, pointBackgroundColor: c.eje },
    ] },
    options: opcionesEjes({ tituloX: 'Dólar al vencimiento', tituloY: 'Pesos recibidos (millones)', xMin: 1000, xMax: 2000, decX: 0, decY: 0 }),
  });
  const vals = { 'Sin cobertura': sin(ST), 'Con forward': fwd(), 'Con put': put(ST) };
  const mejor = Object.entries(vals).sort((a, b) => b[1] - a[1])[0][0];
  $('co-datos').innerHTML = Object.entries(vals).map(([k2, v]) => `<div class="dato ${k2 === mejor ? 'destacado' : ''}"><div class="dato-etiqueta">${k2}</div><div class="dato-valor">$ ${fmt(v / 1e6, 2)} M</div></div>`).join('');
  const piso = (K - prima) * USD;
  narCo.reemplazar(
    `Con el dólar a ${fmt(ST, 0)}, lo mejor ex post es: ${mejor.toLowerCase()}.`,
    `El forward fija ${fmt(F, 0)} pase lo que pase: elimina el riesgo, pero también la posibilidad de beneficiarse si el dólar sube. El put funciona como un seguro: garantiza un piso de ${fmt(K - prima, 0)} por dólar ($ ${fmt(piso / 1e6, 2)} M, el strike menos la prima) y deja aprovechar las subas por encima de ${fmt(K + prima, 0)}${ST > K ? `; hoy no se ejerce porque vender a ${fmt(K, 0)} sería peor que vender a ${fmt(ST, 0)}` : `; hoy se ejerce: vende a ${fmt(K, 0)} en lugar de ${fmt(ST, 0)}`}. Sin cobertura, el resultado depende por completo del dólar. Cubrirse no busca ganar más: busca saber hoy cuánto se va a cobrar.`,
    '',
  );
}

const narEs = crearNarrador($('es-narrador'), { titulo: 'Apalancamiento' });
$('es-st-box').innerHTML = controlRango({ id: 'es-st', etiqueta: 'Precio final a los 3 meses', min: 70, max: 130, paso: 0.5, valor: 110, formato: v => fmt(v) });
vincularRango('es-st', v => fmt(v));

function simEspeculador() {
  const cap = numero('es-cap'), S = numero('es-s'), F = numero('es-f'), m = numero('es-m') / 100, K = numero('es-k'), cprima = numero('es-c'), ST = numero('es-st');
  if ([cap, S, F, m, K, cprima, ST].some(Number.isNaN) || S <= 0 || m <= 0 || cprima <= 0) return datosInvalidos();
  const nAcc = cap / S, nFut = cap / (F * m), nCall = cap / cprima;
  const ren = x => ({
    activo: (nAcc * (x - S)) / cap,
    futuros: (nFut * (x - F)) / cap,
    calls: (nCall * (Math.max(x - K, 0) - cprima)) / cap,
  });
  const c = coloresGrafico();
  const xs = []; for (let x = 70; x <= 130; x += 0.5) xs.push(x);
  dibujarGrafico($('es-grafico'), {
    type: 'line',
    data: { datasets: [
      { label: 'Comprar el activo', data: xs.map(x => ({ x, y: ren(x).activo * 100 })), borderColor: c.series[0], borderWidth: 2, pointRadius: 0 },
      { label: 'Futuros (con margen)', data: xs.map(x => ({ x, y: ren(x).futuros * 100 })), borderColor: c.acento, borderWidth: 2.5, pointRadius: 0 },
      { label: 'Calls', data: xs.map(x => ({ x, y: ren(x).calls * 100 })), borderColor: c.series[2], borderWidth: 2.5, borderDash: [6, 4], pointRadius: 0 },
    ] },
    options: opcionesEjes({ tituloX: 'Precio final', tituloY: 'Rendimiento sobre el capital (%)', xMin: 70, xMax: 130, decX: 0, decY: 0 }),
  });
  const r = ren(ST);
  $('es-datos').innerHTML = `
    <div class="dato"><div class="dato-etiqueta">Activo (${fmt(nAcc, 0)} unidades)</div><div class="dato-valor ${claseSigno(r.activo)}">${fmtSigno(r.activo * 100, 1)} %</div></div>
    <div class="dato destacado"><div class="dato-etiqueta">Futuros (exposición ${fmt(nFut, 0)} unidades)</div><div class="dato-valor ${claseSigno(r.futuros)}">${fmtSigno(r.futuros * 100, 1)} %</div></div>
    <div class="dato"><div class="dato-etiqueta">Calls (${fmt(nCall, 0)} opciones)</div><div class="dato-valor ${claseSigno(r.calls)}">${fmtSigno(r.calls * 100, 1)} %</div></div>`;
  narEs.reemplazar(
    `Con el precio en ${fmt(ST)}: activo ${fmtSigno(r.activo * 100, 1)} %, futuros ${fmtSigno(r.futuros * 100, 1)} %, calls ${fmtSigno(r.calls * 100, 1)} %.`,
    `Con futuros el mismo capital alcanza para una exposición ${fmt(1 / m, 0)} veces mayor, porque solo se deposita el margen (${fmt(m * 100, 0)} %): ganancias y pérdidas se multiplican y las pérdidas pueden superar el capital (con llamados de margen en el camino). Con calls la exposición también es grande, pero la pérdida máxima es la prima pagada: si el precio termina por debajo de ${fmt(K)}, se pierde el 100 % del capital y nada más.`,
    r.futuros >= 0 ? 'pos' : 'neg',
  );
}

function simArbitraje() {
  const ny = numero('ar-ny'), ba = numero('ar-ba'), tc = numero('ar-tc'), n = numero('ar-n'), costo = numero('ar-costo') / 100;
  if ([ny, ba, tc, n, costo].some(Number.isNaN) || tc <= 0) return datosInvalidos();
  const nyPesos = ny * tc;
  const dif = ba - nyPesos;
  const bruto = Math.abs(dif) * n;
  const costos = (ba + nyPesos) * n * costo / 2;
  const neto = bruto - costos;
  $('ar-datos').innerHTML = `
    <div class="dato"><div class="dato-etiqueta">Nueva York en pesos</div><div class="dato-valor">${fmt(nyPesos)}</div><div class="dato-nota">${fmt(ny)} × ${fmt(tc)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Buenos Aires</div><div class="dato-valor">${fmt(ba)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Diferencia por acción</div><div class="dato-valor ${claseSigno(Math.abs(dif))}">${fmt(Math.abs(dif))}</div></div>
    <div class="dato destacado"><div class="dato-etiqueta">Ganancia neta de costos</div><div class="dato-valor ${claseSigno(neto)}">${fmtSigno(neto)}</div></div>`;
  const caroBA = dif > 0;
  $('ar-texto').innerHTML = Math.abs(dif) < 0.005
    ? '<div class="ok">Los dos precios coinciden con el tipo de cambio: no hay arbitraje.</div>'
    : `<div class="explicacion"><p><b>Qué hace el arbitrajista:</b> compra donde está barata y vende donde está cara, al mismo tiempo. ${caroBA ? `Compra ${fmt(n, 0)} acciones en Nueva York (paga ${fmt(ny * n)} USD, o sea ${fmt(nyPesos * n)} pesos) y las vende en Buenos Aires por ${fmt(ba * n)} pesos.` : `Compra ${fmt(n, 0)} acciones en Buenos Aires (${fmt(ba * n)} pesos) y las vende en Nueva York por ${fmt(ny * n)} USD, que valen ${fmt(nyPesos * n)} pesos.`}</p>
       <p>Gana ${fmt(bruto)} sin riesgo de precio, porque no queda expuesto a lo que haga la acción. Menos costos de transacción (${fmt(costos)}), queda ${fmtSigno(neto)}.${neto <= 0 ? ' <b>Con estos costos el arbitraje no conviene</b>: la diferencia está dentro de la banda que los costos permiten.' : ''}</p>
       <p><b>Por qué estas oportunidades duran poco:</b> al comprar donde está barata y vender donde está cara, los propios arbitrajistas empujan los precios hasta igualarlos. Por eso en mercados líquidos las diferencias que se ven son chicas y quedan dentro de los costos.</p></div>`;
}

alCambiar('w-oper', () => { simCobertura(); simEspeculador(); simArbitraje(); });
