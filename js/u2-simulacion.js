// Unidad II · Simulaciones: riesgo de base, estimación de h* y cobertura de carteras con beta.

// ======================================================================
// 1. Cobertura y riesgo de base
// ======================================================================

const narBs = crearNarrador($('bs-narrador'), { titulo: 'Qué cambió y por qué' });
$('bs-s2-box').innerHTML = controlRango({ id: 'bs-s2', etiqueta: 'Contado al cerrar, S₂', min: 30, max: 70, paso: 0.25, valor: 44, formato: v => fmt(v) });
$('bs-f2-box').innerHTML = controlRango({ id: 'bs-f2', etiqueta: 'Futuro al cerrar, F₂', min: 30, max: 70, paso: 0.25, valor: 43, formato: v => fmt(v) });
vincularRango('bs-s2', v => fmt(v));
vincularRango('bs-f2', v => fmt(v));
let bsAntes = null;

function simBase() {
  const corta = elegido('bs-lado') === 'corta';
  const S1 = numero('bs-s1'), F1 = numero('bs-f1'), S2 = numero('bs-s2'), F2 = numero('bs-f2');
  if ([S1, F1, S2, F2].some(Number.isNaN)) return datosInvalidos();
  const b1 = S1 - F1, b2 = S2 - F2;
  const resFut = corta ? F1 - F2 : F2 - F1;
  const efectivo = corta ? S2 + resFut : S2 - resFut;   // precio obtenido (corta) o costo (larga)
  $('bs-datos').innerHTML = `
    <div class="dato"><div class="dato-etiqueta">Base inicial b₁ = S₁ − F₁</div><div class="dato-valor">${fmtSigno(b1)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Base final b₂ = S₂ − F₂</div><div class="dato-valor">${fmtSigno(b2)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Resultado en futuros</div><div class="dato-valor ${claseSigno(resFut)}">${fmtSigno(resFut)}</div></div>
    <div class="dato destacado"><div class="dato-etiqueta">${corta ? 'Precio efectivo de venta' : 'Costo efectivo de compra'} = F₁ + b₂</div><div class="dato-valor">${fmt(efectivo)}</div></div>`;
  const c = coloresGrafico();
  dibujarGrafico($('bs-grafico'), {
    type: 'bar',
    data: {
      labels: ['Sin cobertura (S₂)', 'Con cobertura (F₁ + b₂)', 'Lo que "fijó" en t₁ (F₁)'],
      datasets: [{ label: corta ? 'Precio de venta' : 'Costo de compra', data: [S2, efectivo, F1], backgroundColor: [c.series[0], c.acento, c.series[2]] }],
    },
    options: { animation: false, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { title: { display: true, text: corta ? 'Precio de venta' : 'Costo de compra', color: c.suave }, ticks: { color: c.suave }, grid: { color: c.grilla } }, x: { ticks: { color: c.suave }, grid: { display: false } } } },
  });
  // Narración: qué pasó con la base
  const db = b2 - b1;
  const fortalecio = db > 1e-9, debilito = db < -1e-9;
  const efecto = corta ? (b2 > 0 ? 'a favor' : b2 < 0 ? 'en contra' : 'neutro') : (b2 > 0 ? 'en contra' : b2 < 0 ? 'a favor' : 'neutro');
  const que = `${corta ? 'Vendés' : 'Comprás'} a ${fmt(S2)} en el contado y ${resFut >= 0 ? 'ganás' : 'perdés'} ${fmt(Math.abs(resFut))} en los futuros: ${corta ? 'precio' : 'costo'} efectivo ${fmt(efectivo)}.`;
  let porque = b2 === 0
    ? `Lo que se conoce en t₁ es F₁ = ${fmt(F1)}. El único riesgo era la base al cerrar, b₂, y acá es cero: la cobertura es perfecta y obtenés exactamente F₁. Es lo que pasa si cerrás justo al vencimiento del futuro, porque ahí el futuro converge al contado (siempre que cubras el mismo activo que el subyacente del futuro).`
    : `Lo que se conoce en t₁ es F₁ = ${fmt(F1)}. Lo que no se conoce es la base al cerrar, b₂ = ${fmtSigno(b2)}: ese es el riesgo que queda. ${b2 === 0 ? '' : `Como b₂ es ${b2 > 0 ? 'positiva' : 'negativa'}, la diferencia de ${fmt(Math.abs(b2))} juega ${efecto} ${corta ? 'del que vende' : 'del que compra'}.`}`;
  if (fortalecio || debilito) porque += ` Entre t₁ y t₂ la base se ${fortalecio ? 'fortaleció' : 'debilitó'} (de ${fmtSigno(b1)} a ${fmtSigno(b2)}): ${corta ? (fortalecio ? 'a la cobertura corta le conviene, porque está larga en contado y corta en futuro' : 'a la cobertura corta la perjudica') : (fortalecio ? 'a la cobertura larga la perjudica, porque está corta en contado y larga en futuro' : 'a la cobertura larga le conviene')}.`;
  porque += ` Sin cobertura, el resultado sería ${fmt(S2)} y dependería por completo del precio.`;
  const clave = [corta, S1, F1, S2, F2].join('|');
  if (bsAntes !== clave) { narBs.reemplazar(que, porque, efecto === 'a favor' ? 'pos' : efecto === 'en contra' ? 'neg' : ''); bsAntes = clave; }
}
alCambiar('w-base', simBase);
// Cerrar al vencimiento: el futuro converge al contado (F₂ = S₂) y la base desaparece.
$('bs-vencimiento').addEventListener('click', () => {
  $('bs-f2').value = $('bs-s2').value;
  $('bs-f2').dispatchEvent(new Event('input', { bubbles: true }));
});

// ======================================================================
// 2. Estimar h* con datos simulados
// ======================================================================

const narHs = crearNarrador($('hs-narrador'), { titulo: 'Cómo leerlo' });
$('hs-rho-box').innerHTML = controlRango({ id: 'hs-rho', etiqueta: 'Correlación verdadera ρ', min: 0, max: 0.99, paso: 0.01, valor: 0.93, formato: v => fmt(v, 2) });
$('hs-ss-box').innerHTML = controlRango({ id: 'hs-ss', etiqueta: 'Volatilidad del contado σ_S', min: 0.005, max: 0.06, paso: 0.001, valor: 0.026, formato: v => fmt(v, 3) });
$('hs-sf-box').innerHTML = controlRango({ id: 'hs-sf', etiqueta: 'Volatilidad del futuro σ_F', min: 0.005, max: 0.06, paso: 0.001, valor: 0.031, formato: v => fmt(v, 3) });
['hs-rho', 'hs-ss', 'hs-sf'].forEach(id => vincularRango(id, v => fmt(v, id === 'hs-rho' ? 2 : 3)));

let z = [];
function nuevaMuestra() { z = Array.from({ length: 150 }, () => [Opciones.aleatorioNormal(), Opciones.aleatorioNormal()]); }
nuevaMuestra();

function simHstar() {
  const rho = numero('hs-rho'), ss = numero('hs-ss'), sf = numero('hs-sf'), n = Number($('hs-n').value), qa = numero('hs-qa'), qf = numero('hs-qf');
  const datos = z.slice(0, n).map(([a, b]) => ({ dF: sf * a, dS: ss * (rho * a + Math.sqrt(1 - rho * rho) * b) }));
  const est = Cobertura.desdeDatos(datos.map(d => d.dS), datos.map(d => d.dF));
  const hTeo = rho * ss / sf;
  const N = Cobertura.contratos({ h: est.h, QA: qa, QF: qf });
  const desvio = h => Math.sqrt(ss * ss + h * h * sf * sf - 2 * h * rho * ss * sf); // desvío teórico de ΔS − h·ΔF
  const c = coloresGrafico();
  const xs = [Math.min(...datos.map(d => d.dF)), Math.max(...datos.map(d => d.dF))];
  const mS = Cobertura.media(datos.map(d => d.dS)), mF = Cobertura.media(datos.map(d => d.dF));
  dibujarGrafico($('hs-disp'), {
    type: 'scatter',
    data: { datasets: [
      { label: 'Observaciones', data: datos.map(d => ({ x: d.dF, y: d.dS })), backgroundColor: c.acento, pointRadius: 3 },
      { label: `Regresión (pendiente ${fmt(est.h, 2)})`, type: 'line', data: xs.map(x => ({ x, y: mS + est.h * (x - mF) })), borderColor: c.series[1], borderWidth: 2, pointRadius: 0 },
    ] },
    options: opcionesEjes({ tituloX: 'ΔF', tituloY: 'ΔS', decX: 3, decY: 3 }),
  });
  const hs = []; for (let h = 0; h <= 2.0001; h += 0.02) hs.push(h);
  dibujarGrafico($('hs-var'), {
    type: 'line',
    data: { datasets: [
      { label: 'Desvío de la posición cubierta', data: hs.map(h => ({ x: h, y: desvio(h) })), borderColor: c.acento, borderWidth: 2.5, pointRadius: 0 },
      { label: 'h* teórico', data: [{ x: hTeo, y: desvio(hTeo) }], showLine: false, pointRadius: 6, pointBackgroundColor: c.ganancia },
      { label: 'h = 1', data: [{ x: 1, y: desvio(1) }], showLine: false, pointRadius: 5, pointBackgroundColor: c.series[1] },
    ] },
    options: opcionesEjes({ tituloX: 'Ratio de cobertura h', tituloY: 'Desvío de ΔS − h·ΔF', xMin: 0, xMax: 2, decX: 1, decY: 3 }),
  });
  $('hs-datos').innerHTML = `
    <div class="dato"><div class="dato-etiqueta">h* verdadero = ρσ_S/σ_F</div><div class="dato-valor">${fmt(hTeo, 3)}</div></div>
    <div class="dato destacado"><div class="dato-etiqueta">h* estimado (${n} datos)</div><div class="dato-valor">${fmt(est.h, 3)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Efectividad ρ² estimada</div><div class="dato-valor">${fmt(est.efectividad * 100, 1)} %</div></div>
    <div class="dato"><div class="dato-etiqueta">Contratos N*</div><div class="dato-valor">${fmt(N, 1)}</div></div>`;
  const sinCob = ss, conH = desvio(hTeo), conUno = desvio(1);
  narHs.reemplazar(
    `Con ρ = ${fmt(rho, 2)}, la cobertura óptima reduce el desvío de ${fmt(sinCob, 4)} a ${fmt(conH, 4)} (elimina el ${fmt(rho * rho * 100, 0)} % de la varianza).`,
    `El ratio óptimo es la pendiente de la regresión de ΔS sobre ΔF. ${hTeo < 1 ? 'Es menor que 1' : 'Es mayor que 1'} porque ${hTeo < 1 ? 'el futuro se mueve más que el contado (en la parte correlacionada): con menos nominal en futuros alcanza' : 'el contado se mueve más que el futuro: hace falta más nominal en futuros'}. Usar h = 1 deja un desvío de ${fmt(conUno, 4)}, ${conUno > conH + 1e-6 ? 'mayor' : 'igual'} que con h*. La estimación con ${n} datos da ${fmt(est.h, 3)}: con pocos datos el error de muestreo puede ser grande (tocá "Nueva muestra" y fijate cuánto cambia). Si ρ baja, la curva se aplana: ninguna cobertura elimina mucho riesgo.`,
  );
}
$('hs-nueva').addEventListener('click', () => { nuevaMuestra(); simHstar(); });
alCambiar('w-hstar', simHstar);

// ======================================================================
// 3. Cubrir o cambiar la beta de una cartera
// ======================================================================

const narBt = crearNarrador($('bt-narrador'), { titulo: 'Qué pasó con la cartera' });
$('bt-obj-box').innerHTML = controlRango({ id: 'bt-obj', etiqueta: 'Beta objetivo β*', min: 0, max: 2.5, paso: 0.05, valor: 0, formato: v => fmt(v, 2) });
$('bt-mov-box').innerHTML = controlRango({ id: 'bt-mov', etiqueta: 'Movimiento del índice en 3 meses', min: -30, max: 30, paso: 0.5, valor: -10, formato: v => fmtSigno(v, 1) + ' %' });
vincularRango('bt-obj', v => fmt(v, 2));
vincularRango('bt-mov', v => fmtSigno(v, 1) + ' %');

function simBeta() {
  const VA = numero('bt-va'), b = numero('bt-b'), I0 = numero('bt-i'), F0 = numero('bt-f'), mult = numero('bt-mult'), r = numero('bt-r') / 100, q = numero('bt-q') / 100, bo = numero('bt-obj'), mov = numero('bt-mov') / 100;
  if ([VA, b, I0, F0, mult, r, q, bo, mov].some(Number.isNaN) || F0 <= 0) return datosInvalidos();
  const N = Cobertura.cambiarBeta({ beta: b, betaObjetivo: bo, VA, VF: F0 * mult });
  const dt = 0.25;
  const resultado = x => {
    const I1 = I0 * (1 + x);
    const F1 = I1 * Math.exp((r - q) / 12);
    const fut = N * (F0 - F1) * mult;                    // N > 0: futuros vendidos
    const ret = r * dt + b * (x + q * dt - r * dt);       // CAPM (como en la cátedra)
    const cartera = VA * (1 + ret);
    return { I1, F1, fut, ret, cartera, total: cartera + fut };
  };
  const res = resultado(mov);
  const c = coloresGrafico();
  const xs = []; for (let x = -30; x <= 30; x += 1) xs.push(x);
  dibujarGrafico($('bt-grafico'), {
    type: 'line',
    data: { datasets: [
      { label: 'Cartera sin cubrir', data: xs.map(x => ({ x, y: resultado(x / 100).cartera / 1e6 })), borderColor: c.series[0], borderWidth: 2, pointRadius: 0 },
      { label: `Cartera + futuros (β* = ${fmt(bo, 2)})`, data: xs.map(x => ({ x, y: resultado(x / 100).total / 1e6 })), borderColor: c.acento, borderWidth: 2.6, pointRadius: 0 },
      { label: 'Escenario', data: [{ x: mov * 100, y: res.total / 1e6 }], showLine: false, pointRadius: 6, pointBackgroundColor: c.acento },
    ] },
    options: opcionesEjes({ tituloX: 'Movimiento del índice (%)', tituloY: 'Valor al cabo de 3 meses (millones)', xMin: -30, xMax: 30, decX: 0, decY: 2 }),
  });
  $('bt-datos').innerHTML = `
    <div class="dato destacado"><div class="dato-etiqueta">Contratos</div><div class="dato-valor">${N >= 0 ? 'Vender' : 'Comprar'} ${fmt(Math.abs(N), 1)}</div><div class="dato-nota">(β − β*)·V_A / (F·mult)</div></div>
    <div class="dato"><div class="dato-etiqueta">Cartera sin cubrir</div><div class="dato-valor ${claseSigno(res.ret)}">${fmt(res.cartera, 0)}</div><div class="dato-nota">rinde ${fmtSigno(res.ret * 100, 3)} % (CAPM)</div></div>
    <div class="dato"><div class="dato-etiqueta">Resultado de los futuros</div><div class="dato-valor ${claseSigno(res.fut)}">${fmtSigno(res.fut, 0)}</div><div class="dato-nota">futuro de ${fmt(F0)} a ${fmt(res.F1)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Cartera + futuros</div><div class="dato-valor">${fmt(res.total, 0)}</div><div class="dato-nota">${fmtSigno((res.total / VA - 1) * 100, 2)} %</div></div>`;
  const pendiente = (resultado(0.01).total - resultado(-0.01).total) / (0.02 * VA);
  narBt.reemplazar(
    `El índice se movió ${fmtSigno(mov * 100, 1)} %: la cartera ${res.ret >= 0 ? 'gana' : 'pierde'} ${fmt(Math.abs(res.cartera - VA), 0)} y los futuros ${res.fut >= 0 ? 'ganan' : 'pierden'} ${fmt(Math.abs(res.fut), 0)}.`,
    `Por el CAPM, con β = ${fmt(b, 2)} la cartera se mueve ${fmt(b, 2)} veces el exceso de rendimiento del mercado. ${N > 0 ? `Vender ${fmt(N, 1)} futuros` : N < 0 ? `Comprar ${fmt(-N, 1)} futuros` : 'No operar futuros'} deja la posición con una beta efectiva de ≈ ${fmt(pendiente, 2)} (la pendiente de la línea azul). ${bo === 0 ? 'Con β* = 0 la línea es casi horizontal: la posición cubierta rinde aproximadamente la tasa libre de riesgo, pase lo que pase con el mercado. Las pequeñas diferencias vienen del riesgo de base: el futuro no se mueve exactamente como el índice.' : bo < b ? 'La cartera sigue expuesta al mercado, pero menos que antes, sin haber vendido ninguna acción.' : 'La exposición al mercado aumentó: los futuros comprados suman beta.'}`,
    res.total >= VA ? 'pos' : 'neg',
  );
}
alCambiar('w-beta', simBeta);
