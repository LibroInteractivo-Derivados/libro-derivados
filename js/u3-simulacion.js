// Unidad III · Simulaciones: arbitraje cash-and-carry, curva de futuros, valor de un forward,
// curva cero (bootstrap) y precio-rendimiento-duración de un bono.

// ======================================================================
// 1. Arbitraje cash-and-carry
// ======================================================================

const narAr = crearNarrador($('ar-narrador'), { titulo: 'Qué hace el arbitrajista y por qué' });
$('ar-fm-box').innerHTML = controlRango({ id: 'ar-fm', etiqueta: 'Precio forward de mercado', min: 30, max: 50, paso: 0.05, valor: 43, formato: v => fmt(v) });
vincularRango('ar-fm', v => fmt(v));

function datosAr() {
  const tipo = $('ar-tipo').value;
  document.querySelectorAll('#w-arb [data-para]').forEach(el => { el.hidden = el.dataset.para !== tipo; });
  const S = numero('ar-s'), r = numero('ar-r') / 100, T = numero('ar-t') / 12;
  const ing = numero('ar-i'), ti = numero('ar-ti') / 12, q = numero('ar-q') / 100;
  const I = tipo === 'ingreso' && ti <= T ? ing * Math.exp(-r * ti) : 0;
  const qq = tipo === 'rendimiento' ? q : 0;
  return { tipo, S, r, T, ing, ti, I, q: qq, F0: Futuros.precioForward({ S, r, T, I, q: qq }) };
}

function simArbitraje() {
  const d = datosAr();
  if ([d.S, d.r, d.T].some(Number.isNaN) || d.T <= 0) return datosInvalidos();
  const Fm = numero('ar-fm');
  const dif = Fm - d.F0;
  const eT = Math.exp(d.r * d.T);
  $('ar-datos').innerHTML = `
    <div class="dato destacado"><div class="dato-etiqueta">Forward teórico</div><div class="dato-valor">${fmt(d.F0, 4)}</div><div class="dato-nota">${d.tipo === 'simple' ? 'S₀·e^(rT)' : d.tipo === 'ingreso' ? '(S₀ − I)·e^(rT)' : 'S₀·e^((r − q)T)'}</div></div>
    <div class="dato"><div class="dato-etiqueta">Forward de mercado</div><div class="dato-valor">${fmt(Fm, 4)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Estrategia</div><div class="dato-valor" style="font-size:1rem">${Math.abs(dif) < 0.005 ? 'Ninguna' : dif > 0 ? 'Cash-and-carry' : 'Reverse cash-and-carry'}</div></div>
    <div class="dato"><div class="dato-etiqueta">Ganancia en T por unidad</div><div class="dato-valor ${claseSigno(Math.abs(dif))}">${fmt(Math.abs(dif), 4)}</div></div>`;
  // Gráfico: ganancia del arbitraje según F de mercado
  const c = coloresGrafico();
  const lo = 30, hi = 50;
  const xs = []; for (let x = lo; x <= hi; x += 0.25) xs.push(x);
  dibujarGrafico($('ar-grafico'), {
    type: 'line',
    data: { datasets: [
      { label: 'Cash-and-carry (forward caro)', data: xs.map(x => ({ x, y: Math.max(x - d.F0, 0) })), borderColor: c.acento, borderWidth: 2.5, pointRadius: 0 },
      { label: 'Reverse (forward barato)', data: xs.map(x => ({ x, y: Math.max(d.F0 - x, 0) })), borderColor: c.series[2], borderWidth: 2.5, borderDash: [6, 4], pointRadius: 0 },
      { label: 'Mercado', data: [{ x: Fm, y: Math.abs(dif) }], showLine: false, pointRadius: 7, pointBackgroundColor: c.eje },
    ] },
    options: opcionesEjes({ tituloX: 'Precio forward de mercado', tituloY: 'Ganancia sin riesgo en T', xMin: lo, xMax: hi, decX: 0 }),
  });
  // Tabla de flujos
  const ingTxt = d.tipo === 'ingreso' && d.I > 0;
  let filas, que, porque;
  if (Math.abs(dif) < 0.005) {
    $('ar-tabla').innerHTML = '<div class="ok">El forward cotiza a su valor teórico: ningún arbitraje da ganancia.</div>';
    narAr.reemplazar(`Con el forward a ${fmt(Fm)} no hay arbitraje.`, `Comprar el activo y financiarlo hasta T cuesta exactamente ${fmt(d.F0, 4)}: lo mismo que pactar hoy la compra a plazo. Esa igualdad es la que define el precio forward.`);
    return;
  }
  if (dif > 0) {
    const deuda = d.S * eT;
    filas = [
      ['1. Pedir prestado S₀ a la tasa r', `+${fmt(d.S)}`, `−${fmt(deuda, 4)}`],
      ['2. Comprar el activo al contado', `−${fmt(d.S)}`, ingTxt ? `cobra el ingreso (${fmt(d.ing)}) en ${fmt(d.ti * 12, 0)} meses, que capitalizado vale ${fmt(d.ing * Math.exp(d.r * (d.T - d.ti)), 4)}` : d.tipo === 'rendimiento' ? 'el rendimiento q se reinvierte en el activo' : 'entrega el activo'],
      [`3. Vender forward a ${fmt(Fm)}`, '0', `+${fmt(Fm, 4)}`],
      ['Total', '0', `+${fmt(dif, 4)}`],
    ];
    if (d.tipo === 'rendimiento') filas[0] = ['1. Pedir prestado S₀·e^(−qT) y comprar e^(−qT) unidades (con q llegan a 1 en T)', `+${fmt(d.S * Math.exp(-d.q * d.T), 4)}`, `−${fmt(d.S * Math.exp((d.r - d.q) * d.T), 4)}`];
    if (d.tipo === 'rendimiento') filas[1] = ['2. Comprar el activo', `−${fmt(d.S * Math.exp(-d.q * d.T), 4)}`, '1 unidad (por el rendimiento reinvertido)'];
    que = `El forward está caro: ${fmt(Fm)} contra ${fmt(d.F0, 4)} de valor teórico. Cash-and-carry: ganancia segura de ${fmt(dif, 4)} en T.`;
    porque = `Se vende lo caro (el forward) y se compra lo barato (el activo, financiado con deuda). En T se entrega el activo a ${fmt(Fm)} y con eso se cancela la deuda de ${fmt(d.tipo === 'rendimiento' ? d.S * Math.exp((d.r - d.q) * d.T) : d.tipo === 'ingreso' ? (d.S - d.I) * eT : d.S * eT, 4)}${ingTxt ? ' (neta del ingreso cobrado)' : ''}. No hay riesgo de precio: todo queda pactado hoy. Estas operaciones (comprar contado y vender forward) empujan el forward hacia abajo y el contado hacia arriba hasta que el arbitraje desaparece.`;
  } else {
    filas = [
      ['1. Vender en corto el activo (pedirlo prestado y venderlo)', `+${fmt(d.S)}`, ingTxt ? `pagar al prestamista el ingreso (${fmt(d.ing)}) en ${fmt(d.ti * 12, 0)} meses` : 'devolver el activo'],
      ['2. Invertir lo recaudado a la tasa r', `−${fmt(d.S)}`, `+${fmt(d.S * eT, 4)}`],
      [`3. Comprar forward a ${fmt(Fm)}`, '0', `−${fmt(Fm, 4)} (recibe el activo y cierra el corto)`],
      ['Total', '0', `+${fmt(-dif, 4)}`],
    ];
    que = `El forward está barato: ${fmt(Fm)} contra ${fmt(d.F0, 4)}. Reverse cash-and-carry: ganancia segura de ${fmt(-dif, 4)} en T.`;
    porque = `Se compra lo barato (el forward) y se vende lo caro (el activo, en corto). Lo recaudado se invierte a la tasa libre de riesgo; en T se compra el activo por el forward y se devuelve al prestamista.${ingTxt ? ' Como el activo paga un ingreso durante el préstamo, el vendedor en corto tiene que pagárselo a quien se lo prestó: por eso el forward teórico es (S₀ − I)e^(rT).' : ''} Esto requiere poder vender en corto: con activos de consumo no siempre se puede, y por eso para ellos solo vale una desigualdad.`;
  }
  $('ar-tabla').innerHTML = tablaHTML([{ titulo: 'Operación' }, { titulo: 'Flujo hoy', num: true }, { titulo: 'En T', num: true }], filas, i => (i === filas.length - 1 ? 'total' : ''));
  narAr.reemplazar(que, porque, 'pos');
}
alCambiar('w-arb', simArbitraje);

// ======================================================================
// 2. Curva de futuros
// ======================================================================

const narCf = crearNarrador($('cf-narrador'), { titulo: 'Qué inclina la curva' });
let cfTipoPrevio = null;
function controlesCurva() {
  const tipo = $('cf-tipo').value;
  if (tipo === cfTipoPrevio) return;
  cfTipoPrevio = tipo;
  const conf = {
    commodity: [{ id: 'cf-a', e: 'Almacenamiento u (%)', v: 2 }, { id: 'cf-b', e: 'Rendimiento de conveniencia y (%)', v: 10 }],
    indice: [{ id: 'cf-a', e: 'Dividendos q (%)', v: 3 }, null],
    moneda: [{ id: 'cf-a', e: 'Tasa extranjera r_f (%)', v: 4 }, null],
  }[tipo];
  $('cf-r-box').innerHTML = controlRango({ id: 'cf-r', etiqueta: 'Tasa r (%)', min: 0, max: 40, paso: 0.25, valor: tipo === 'moneda' ? 30 : 5, formato: v => fmt(v, 2) + ' %' });
  $('cf-a-box').innerHTML = controlRango({ id: conf[0].id, etiqueta: conf[0].e, min: 0, max: 40, paso: 0.25, valor: conf[0].v, formato: v => fmt(v, 2) + ' %' });
  $('cf-b-box').innerHTML = conf[1] ? controlRango({ id: conf[1].id, etiqueta: conf[1].e, min: 0, max: 40, paso: 0.25, valor: conf[1].v, formato: v => fmt(v, 2) + ' %' }) : '';
  ['cf-r', 'cf-a', 'cf-b'].forEach(id => { if ($(id)) vincularRango(id, v => fmt(v, 2) + ' %'); });
  if (tipo === 'moneda') $('cf-s').value = 1400; else if (tipo === 'indice') $('cf-s').value = 5000; else $('cf-s').value = 70;
}

function simCurva() {
  controlesCurva();
  const tipo = $('cf-tipo').value, S = numero('cf-s'), r = numero('cf-r') / 100, a = numero('cf-a') / 100, b = $('cf-b') ? numero('cf-b') / 100 : 0;
  if ([S, r, a].some(Number.isNaN)) return datosInvalidos();
  const carry = tipo === 'commodity' ? r + a - b : r - a;
  const F = T => S * Math.exp(carry * T);
  const c = coloresGrafico();
  const xs = []; for (let T = 0; T <= 2.0001; T += 1 / 12) xs.push(T);
  dibujarGrafico($('cf-grafico'), {
    type: 'line',
    data: { datasets: [
      { label: 'Precio futuro F(T)', data: xs.map(T => ({ x: T * 12, y: F(T) })), borderColor: c.acento, borderWidth: 2.6, pointRadius: 3 },
      { label: 'Contado S₀', data: [{ x: 0, y: S }, { x: 24, y: S }], borderColor: c.suave, borderDash: [4, 4], borderWidth: 1.2, pointRadius: 0 },
    ] },
    options: opcionesEjes({ tituloX: 'Vencimiento (meses)', tituloY: 'Precio', xMin: 0, xMax: 24, decX: 0, decY: S > 100 ? 0 : 2 }),
  });
  const estado = carry > 1e-9 ? 'Contango' : carry < -1e-9 ? 'Backwardation' : 'Plana';
  $('cf-datos').innerHTML = `
    <div class="dato destacado"><div class="dato-etiqueta">Costo de tenencia neto</div><div class="dato-valor">${fmtSigno(carry * 100, 2)} %</div><div class="dato-nota">${tipo === 'commodity' ? 'r + u − y' : tipo === 'indice' ? 'r − q' : 'r − r_f'}</div></div>
    <div class="dato"><div class="dato-etiqueta">Futuro a 6 meses</div><div class="dato-valor">${fmt(F(0.5))}</div></div>
    <div class="dato"><div class="dato-etiqueta">Futuro a 1 año</div><div class="dato-valor">${fmt(F(1))}</div></div>
    <div class="dato"><div class="dato-etiqueta">Forma de la curva</div><div class="dato-valor" style="font-size:1rem">${estado}</div></div>`;
  const textos = {
    commodity: `Financiar el bien (r = ${fmt(r * 100, 2)} %) y guardarlo (u = ${fmt(a * 100, 2)} %) encarece los futuros; el rendimiento de conveniencia (y = ${fmt(b * 100, 2)} %) los abarata, porque tener el bien físico tiene un beneficio que el futuro no da. ${carry < 0 ? 'Acá la conveniencia supera al costo de financiar y guardar: el mercado valora tener el bien hoy (escasez).' : 'Acá el costo de financiar y guardar supera la conveniencia: mercado bien abastecido.'}`,
    indice: `El futuro sobre índice crece a la tasa r (financiar las acciones) menos los dividendos q (que cobra quien tiene las acciones, no quien tiene el futuro). ${carry < 0 ? 'Con dividendos mayores que la tasa, los futuros cotizan por debajo del índice.' : ''}`,
    moneda: `Es la paridad de tasas: la moneda extranjera "rinde" r_f. Con r = ${fmt(r * 100, 2)} % local y r_f = ${fmt(a * 100, 2)} %, ${carry > 0 ? 'el futuro cotiza por encima del contado: la moneda con tasa más alta (la local) cotiza con descuento a plazo' : 'el futuro cotiza por debajo del contado'}. No es un pronóstico del tipo de cambio: es lo que exige el no arbitraje.`,
  };
  narCf.reemplazar(`${estado}: el costo de tenencia neto es ${fmtSigno(carry * 100, 2)} % anual.`, textos[tipo], carry >= 0 ? '' : 'aviso');
}
alCambiar('w-curva', simCurva);

// ======================================================================
// 3. Valor de un forward ya pactado
// ======================================================================

const narVf = crearNarrador($('vf-narrador'), { titulo: 'Por qué vale lo que vale' });
$('vf-s-box').innerHTML = controlRango({ id: 'vf-s', etiqueta: 'Precio contado hoy', min: 30, max: 50, paso: 0.1, valor: 42, formato: v => fmt(v) });
$('vf-t-box').innerHTML = controlRango({ id: 'vf-t', etiqueta: 'Tiempo restante (meses)', min: 0, max: 3, paso: 0.25, valor: 2, formato: v => fmt(v, 2) });
vincularRango('vf-s', v => fmt(v));
vincularRango('vf-t', v => fmt(v, 2));

function simValor() {
  const K = numero('vf-k'), r = numero('vf-r') / 100, S = numero('vf-s'), T = numero('vf-t') / 12;
  if ([K, r, S, T].some(Number.isNaN)) return datosInvalidos();
  const F = S * Math.exp(r * T), f = (F - K) * Math.exp(-r * T);
  const c = coloresGrafico();
  const xs = []; for (let x = 30; x <= 50; x += 0.25) xs.push(x);
  dibujarGrafico($('vf-grafico'), {
    type: 'line',
    data: { datasets: [
      { label: `Valor del forward largo (faltan ${fmt(T * 12, 2)} meses)`, data: xs.map(x => ({ x, y: x - K * Math.exp(-r * T) })), borderColor: c.acento, borderWidth: 2.5, pointRadius: 0, fill: { target: 'origin', above: c.rellenoGanancia, below: c.rellenoPerdida } },
      { label: 'Al vencimiento (S − K)', data: xs.map(x => ({ x, y: x - K })), borderColor: c.series[0], borderDash: [5, 4], borderWidth: 1.5, pointRadius: 0 },
      { label: 'Hoy', data: [{ x: S, y: f }], showLine: false, pointRadius: 7, pointBackgroundColor: c.acento },
    ] },
    options: opcionesEjes({ tituloX: 'Precio contado hoy', tituloY: 'Valor del forward', xMin: 30, xMax: 50, decX: 0 }),
  });
  $('vf-datos').innerHTML = `
    <div class="dato"><div class="dato-etiqueta">Forward de hoy F₀ = S·e^(rT)</div><div class="dato-valor">${fmt(F, 4)}</div></div>
    <div class="dato destacado"><div class="dato-etiqueta">Valor posición larga f</div><div class="dato-valor ${claseSigno(f)}">${fmtSigno(f, 4)}</div><div class="dato-nota">(F₀ − K)·e^(−rT)</div></div>
    <div class="dato"><div class="dato-etiqueta">Valor posición corta</div><div class="dato-valor ${claseSigno(-f)}">${fmtSigno(-f, 4)}</div></div>`;
  narVf.reemplazar(
    `Con el contado en ${fmt(S)} y ${fmt(T * 12, 2)} meses por delante, el forward pactado a ${fmt(K)} vale ${fmtSigno(f, 4)} para el largo.`,
    `Hoy un forward nuevo para la misma fecha se pactaría a F₀ = ${fmt(F, 4)}. Quien tiene el contrato viejo compra a ${fmt(K)}: ${F > K ? 'le conviene, porque podría vender a plazo a F₀ lo que compra a K' : 'le juega en contra, porque compra a K algo que a plazo hoy vale menos'}. La diferencia F₀ − K = ${fmtSigno(F - K, 4)} se cobra recién en T, por eso se descuenta: f = (F₀ − K)e^(−rT). Equivale a S − K·e^(−rT): ${fmt(S)} − ${fmt(K * Math.exp(-r * T), 4)}. ${T === 0 ? 'Al vencimiento el valor es S − K.' : ''}`,
    f > 0 ? 'pos' : f < 0 ? 'neg' : '',
  );
}
alCambiar('w-valor', simValor);

// ======================================================================
// 4. Bootstrap
// ======================================================================

const narBt = crearNarrador($('bt-narrador'), { titulo: 'Cómo sale cada tasa' });
let bonos = [{ T: 0.25, cupon: 0, precio: 97.5 }, { T: 0.5, cupon: 0, precio: 94.9 }, { T: 1, cupon: 0, precio: 90 }, { T: 1.5, cupon: 8, precio: 96 }, { T: 2, cupon: 12, precio: 101.6 }];
function filasBonos() {
  $('bt-filas').innerHTML = bonos.map((b, i) => `<tr data-i="${i}"><td class="num">${fmt(b.T, 2)}</td><td class="num">${fmt(b.cupon, 2)}</td><td class="num"><input type="number" step="0.1" value="${b.precio}" style="width:90px" aria-label="Precio del bono a ${fmt(b.T, 2)} años"></td><td class="num" id="bt-z${i}"></td><td class="num" id="bt-f${i}"></td></tr>`).join('');
}
function simBoot(cambiado = null) {
  let ceros;
  try { ceros = Tasas.bootstrap(bonos.map(b => ({ T: b.T, cupon: b.cupon / 100, m: 2, precio: b.precio }))); } catch (e) { return; }
  if (ceros.some(c => !Number.isFinite(c.r))) { narBt.reemplazar('Con esos precios no se puede calcular la curva.', 'Revisá que los precios sean positivos y razonables.', 'aviso'); return; }
  ceros.forEach((c, i) => {
    $('bt-z' + i).textContent = fmt(c.r * 100, 3);
    $('bt-f' + i).textContent = i === 0 ? '—' : fmt(Tasas.forward(ceros[i - 1].r, ceros[i - 1].t, c.r, c.t) * 100, 3);
  });
  const c = coloresGrafico();
  dibujarGrafico($('bt-grafico'), {
    type: 'line',
    data: { datasets: [
      { label: 'Tasa cero', data: ceros.map(z => ({ x: z.t, y: z.r * 100 })), borderColor: c.acento, borderWidth: 2.5, pointRadius: 4 },
      { label: 'Forward del tramo', data: ceros.slice(1).map((z, i) => ({ x: z.t, y: Tasas.forward(ceros[i].r, ceros[i].t, z.r, z.t) * 100 })), borderColor: c.series[2], borderDash: [6, 4], borderWidth: 2, pointRadius: 4, stepped: 'before' },
    ] },
    options: opcionesEjes({ tituloX: 'Plazo (años)', tituloY: 'Tasa (%, continua)', xMin: 0, xMax: 2.1, decX: 2, decY: 2 }),
  });
  const i = cambiado ?? 3;
  const b = bonos[i], z = ceros[i];
  let porque;
  if (b.cupon === 0) porque = `Es un bono cupón cero: su tasa sale directo de ${fmt(b.precio)}·e^(R·${fmt(b.T, 2)}) = 100, o sea R = ln(100/${fmt(b.precio)})/${fmt(b.T, 2)} = ${fmt(z.r * 100, 3)} %.`;
  else porque = `Paga cupones de ${fmt(b.cupon / 2, 2)} cada 6 meses. Los cupones anteriores se descuentan con las tasas ya calculadas (valen ${fmt(z.vpCupones, 4)}); lo que queda del precio, ${fmt(b.precio - z.vpCupones, 4)}, es el valor presente del último flujo (${fmt(z.ultimo, 2)}): R = −ln(${fmt(b.precio - z.vpCupones, 4)}/${fmt(z.ultimo, 2)})/${fmt(b.T, 2)} = ${fmt(z.r * 100, 3)} %.`;
  porque += ' Como la curva es creciente, cada forward queda por encima de las tasas cero: tiene que "levantar" el promedio.';
  narBt.reemplazar(`Tasa cero a ${fmt(b.T, 2)} años: ${fmt(z.r * 100, 3)} %.`, porque);
}
filasBonos();
$('bt-filas').addEventListener('input', e => {
  const tr = e.target.closest('tr');
  const v = aNumero(e.target.value);
  if (!tr || Number.isNaN(v) || v <= 0) return;
  bonos[Number(tr.dataset.i)].precio = v;
  simBoot(Number(tr.dataset.i));
});
alCambiarTema(() => simBoot());
simBoot();

// ======================================================================
// 5. Precio, rendimiento y duración
// ======================================================================

const narBn = crearNarrador($('bn-narrador'), { titulo: 'Duración y convexidad' });
$('bn-dy-box').innerHTML = controlRango({ id: 'bn-dy', etiqueta: 'Cambio de rendimiento (puntos básicos)', min: -300, max: 300, paso: 10, valor: 100, formato: v => fmtSigno(v, 0) + ' pb' });
vincularRango('bn-dy', v => fmtSigno(v, 0) + ' pb');

function simBono() {
  const c0 = numero('bn-c') / 100, m = Number($('bn-m').value), T = numero('bn-t'), y = numero('bn-y') / 100, dy = numero('bn-dy') / 10000;
  if ([c0, T, y, dy].some(Number.isNaN) || T <= 0 || T > 100) return datosInvalidos();
  const fl = Tasas.flujosBono({ nominal: 100, cupon: c0, m, T });
  const { B, D, C } = Tasas.duracion(fl, y);
  const exacto = Tasas.precioConRendimiento(fl, y + dy);
  const aprox1 = B * (1 - D * dy), aprox2 = B * (1 - D * dy + 0.5 * C * dy * dy);
  const col = coloresGrafico();
  const ys = []; for (let x = Math.max(0.001, y - 0.04); x <= y + 0.04 + 1e-9; x += 0.002) ys.push(x);
  dibujarGrafico($('bn-grafico'), {
    type: 'line',
    data: { datasets: [
      { label: 'Precio exacto', data: ys.map(x => ({ x: x * 100, y: Tasas.precioConRendimiento(fl, x) })), borderColor: col.acento, borderWidth: 2.6, pointRadius: 0 },
      { label: 'Aproximación por duración (tangente)', data: ys.map(x => ({ x: x * 100, y: B * (1 - D * (x - y)) })), borderColor: col.series[0], borderDash: [6, 4], borderWidth: 1.6, pointRadius: 0 },
      { label: 'Nuevo rendimiento', data: [{ x: (y + dy) * 100, y: exacto }], showLine: false, pointRadius: 7, pointBackgroundColor: col.acento },
    ] },
    options: opcionesEjes({ tituloX: 'Rendimiento (%, continuo)', tituloY: 'Precio', decX: 1, decY: 2 }),
  });
  $('bn-datos').innerHTML = `
    <div class="dato"><div class="dato-etiqueta">Precio actual</div><div class="dato-valor">${fmt(B, 4)}</div></div>
    <div class="dato destacado"><div class="dato-etiqueta">Duración</div><div class="dato-valor">${fmt(D, 3)} años</div></div>
    <div class="dato"><div class="dato-etiqueta">Precio exacto con ${fmtSigno(dy * 10000, 0)} pb</div><div class="dato-valor">${fmt(exacto, 4)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Con duración</div><div class="dato-valor">${fmt(aprox1, 4)}</div><div class="dato-nota">error ${fmtSigno(aprox1 - exacto, 4)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Con duración y convexidad</div><div class="dato-valor">${fmt(aprox2, 4)}</div><div class="dato-nota">error ${fmtSigno(aprox2 - exacto, 4)}</div></div>`;
  narBn.reemplazar(
    `Si el rendimiento ${dy >= 0 ? 'sube' : 'baja'} ${fmt(Math.abs(dy) * 10000, 0)} pb, el precio pasa de ${fmt(B, 2)} a ${fmt(exacto, 2)} (${fmtSigno((exacto / B - 1) * 100, 2)} %).`,
    `La duración (${fmt(D, 2)} años) dice que el precio cae ≈ ${fmt(D, 2)} % por cada punto porcentual de suba: es la pendiente de la curva. Pero la curva es convexa: la tangente queda siempre por debajo, así que la duración ${dy > 0 ? 'exagera la caída' : 'subestima la suba'}. La convexidad corrige esa diferencia; cuanto mayor el cambio de tasa, más importa. Bonos más largos o con cupones más bajos tienen más duración: probá cambiar el plazo o el cupón.`,
  );
}
alCambiar('w-bono', simBono);
