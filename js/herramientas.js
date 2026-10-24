// Caja de herramientas: calculadoras para estudiar y practicar.
// Las fórmulas están en calculos.js; acá se leen los datos, se muestran los pasos
// y, en modo práctica, se diagnostican los errores típicos.

const cerca = (a, b, tol = 0.005) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tol;
const leerLibre = id => { const t = String($(id).value).trim(); return t === '' ? NaN : parseFloat(t.replace(',', '.')); };
const f4 = x => fmt(x, 4);

// ======================================================================
// 1. Black-Scholes paso a paso (con modo práctica)
// ======================================================================

// Subyacentes: en todos los casos es Black-Scholes-Merton con un rendimiento q distinto.
const SUBYACENTES = {
  accion: { s: 'Precio de la acción S₀', q: 'Dividendos δ (%, continuo)', S: 'S₀', Q: 'δ', nombre: 'acción' },
  indice: { s: 'Nivel del índice S₀', q: 'Rendimiento por dividendos q (%)', S: 'S₀', Q: 'q', nombre: 'índice' },
  moneda: { s: 'Tipo de cambio contado S₀ (moneda local por unidad extranjera)', q: 'Tasa extranjera r_f (%, continua)', S: 'S₀', Q: 'r_f', nombre: 'moneda' },
  futuro: { s: 'Precio del futuro F₀', q: '', S: 'F₀', Q: 'r', nombre: 'futuro' },
};

function datosBS() {
  const sub = $('bs-sub').value;
  const r = numero('bs-r') / 100;
  return { S: numero('bs-s'), K: numero('bs-k'), r, sigma: numero('bs-sigma') / 100, T: numero('bs-t'), q: sub === 'futuro' ? r : numero('bs-q') / 100, sub };
}

function etiquetasBS() {
  const x = SUBYACENTES[$('bs-sub').value];
  $('bs-s-label').textContent = x.s;
  $('bs-q-box').hidden = $('bs-sub').value === 'futuro';
  $('bs-q-label').textContent = x.q;
}

// Calcula todo lo necesario, incluidos los resultados "equivocados" típicos para diagnosticar.
function calculoBS(d) {
  const { S, K, r, sigma, T, q } = d;
  const ln = Math.log(S / K), deriva = (r - q + (sigma * sigma) / 2) * T, raiz = sigma * Math.sqrt(T);
  const b = Opciones.blackScholes(d);
  const N = Opciones.normal, Sq = S * Math.exp(-q * T), Kr = K * Math.exp(-r * T);
  return {
    ln, deriva, raiz, Sq, Kr, ...b,
    errores: {
      d1SinMedio: (ln + (r - q) * T) / raiz,
      d1ConSigma2: (ln + (r - q + sigma * sigma) * T) / raiz,
      d1SinRaiz: (ln + deriva) / (sigma * T),
      d1Invertido: (Math.log(K / S) + deriva) / raiz,
      d1Meses: (ln + (r - q + (sigma * sigma) / 2) * T * 12) / (sigma * Math.sqrt(T * 12)),
      callSinDescontar: Sq * b.Nd1 - K * b.Nd2,
      callNInvertidas: Sq * b.Nd2 - Kr * b.Nd1,
      putSinDescontar: K * N(-b.d2) - Sq * N(-b.d1),
      putSinNegativos: Kr * b.Nd2 - Sq * b.Nd1,
    },
  };
}

function bsPasoAPaso() {
  etiquetasBS();
  const d = datosBS();
  if (Object.entries(d).some(([k, v]) => k !== 'sub' && Number.isNaN(v)) || d.S <= 0 || d.K <= 0 || d.T <= 0 || d.sigma <= 0) {
    $('bs-pasos').innerHTML = '<li><span>Revisá los datos: S, K, σ y T tienen que ser positivos.</span></li>';
    return;
  }
  const c = calculoBS(d);
  const x = SUBYACENTES[d.sub];
  const fut = d.sub === 'futuro';
  const conQ = d.q > 0 || fut;
  const S = x.S, Q = x.Q;
  const Sq = fut ? 'F₀·e^(−rT)' : conQ ? `S₀·e^(−${Q}T)` : 'S₀';
  const pasos = [
    [`ln(${S} / K)`, `ln(${fmt(d.S, 4)} / ${fmt(d.K, 4)})`, c.ln, 'Mide cuán dentro (positivo) o fuera (negativo) del dinero está la opción, en términos de rendimiento.'],
    [fut ? '(σ²/2)·T' : `(r ${conQ ? `− ${Q} ` : ''}+ σ²/2)·T`, fut ? `(${fmt(d.sigma, 4)}²/2)·${fmt(d.T, 4)}` : `(${fmt(d.r, 4)} ${conQ ? `− ${fmt(d.q, 4)} ` : ''}+ ${fmt(d.sigma, 4)}²/2)·${fmt(d.T, 4)}`, c.deriva,
      fut ? 'Con futuros la tasa no aparece en d₁: el futuro ya incorpora el costo de tenencia (es como un activo con q = r).' : `Crecimiento esperado del ${x.nombre} en el mundo neutral al riesgo${conQ ? `, neto del rendimiento ${Q} que no recibe quien tiene la opción` : ''}, más el ajuste σ²/2.`],
    ['σ·√T', `${fmt(d.sigma, 4)}·√${fmt(d.T, 4)}`, c.raiz, 'Desvío del rendimiento acumulado hasta el vencimiento: la volatilidad crece con la raíz del tiempo.'],
    [`d₁ = [ln(${S}/K) + ${fut ? '(σ²/2)' : `(r${conQ ? ' − ' + Q : ''} + σ²/2)`}·T] / (σ√T)`, `(${f4(c.ln)} + ${f4(c.deriva)}) / ${f4(c.raiz)}`, c.d1, 'Distancia al strike medida en desvíos.'],
    ['d₂ = d₁ − σ√T', `${f4(c.d1)} − ${f4(c.raiz)}`, c.d2, 'Siempre más chico que d₁.'],
    ['N(d₁)', `N(${f4(c.d1)})`, c.Nd1, `Es la delta del call${conQ ? ` dividida por e^(−${Q}T)` : ''}: cuánto se parece el call a tener el subyacente.`],
    ['N(d₂)', `N(${f4(c.d2)})`, c.Nd2, 'Probabilidad neutral al riesgo de que el call termine dentro del dinero (que se ejerza).'],
    ['K·e^(−rT)', `${fmt(d.K, 4)}·e^(−${fmt(d.r, 4)}·${fmt(d.T, 4)})`, c.Kr, 'Valor presente de lo que se paga al ejercer el call (o se cobra al ejercer el put).'],
    [Sq, fut ? `${fmt(d.S, 4)}·e^(−${fmt(d.r, 4)}·${fmt(d.T, 4)})` : conQ ? `${fmt(d.S, 4)}·e^(−${fmt(d.q, 4)}·${fmt(d.T, 4)})` : fmt(d.S, 4), c.Sq,
      fut ? 'Valor presente del precio futuro: el modelo de Black descuenta F₀ porque el futuro no cuesta nada hoy.' : conQ ? `El ${x.nombre} sin el rendimiento ${Q} que se pierde durante la vida de la opción.` : 'Sin dividendos, el subyacente entra tal cual.'],
    [fut ? 'Call (Black): c = e^(−rT)·[F₀·N(d₁) − K·N(d₂)]' : `Call: c = ${Sq}·N(d₁) − K·e^(−rT)·N(d₂)`, `${f4(c.Sq)}·${f4(c.Nd1)} − ${f4(c.Kr)}·${f4(c.Nd2)}`, c.call, 'Lo que se recibe si se ejerce (el subyacente, ponderado) menos lo que se paga (K, ponderado por la probabilidad de ejercicio), todo a valor presente.'],
    [fut ? 'Put (Black): p = e^(−rT)·[K·N(−d₂) − F₀·N(−d₁)]' : `Put: p = K·e^(−rT)·N(−d₂) − ${Sq}·N(−d₁)`, `${f4(c.Kr)}·${f4(1 - c.Nd2)} − ${f4(c.Sq)}·${f4(1 - c.Nd1)}`, c.put, 'Simétrico al call: se cobra K y se entrega el subyacente si termina por debajo del strike.'],
  ];
  $('bs-pasos').innerHTML = pasos.map(([titulo, cuenta, valor, porque]) => `
    <li><span><b>${titulo}</b><br><span class="formula-paso">${cuenta}</span><span class="porque">${porque}</span></span><span class="resultado-paso">${f4(valor)}</span></li>`).join('')
    + `<li><span><b>Control: paridad put-call</b><br>c + K·e^(−rT) = ${f4(c.call + c.Kr)} · p + ${Sq} = ${f4(c.put + c.Sq)}<span class="porque">Si los dos lados no coinciden, hay un error de cuentas.</span></span><span class="resultado-paso">${cerca(c.call + c.Kr, c.put + c.Sq, 1e-6) ? '✔' : '✘'}</span></li>`;
  $('bs-pasos').classList.toggle('ocultos', $('bs-practica').checked && !bsMostrado);
}

let bsMostrado = false;

function marcar(id, ok, texto) {
  const input = $(`pr-${id}`), marca = $(`m-${id}`);
  input.classList.remove('bien', 'mal');
  marca.classList.remove('bien', 'mal');
  if (ok === null) { marca.textContent = ''; return; }
  input.classList.add(ok ? 'bien' : 'mal');
  marca.classList.add(ok ? 'bien' : 'mal');
  marca.textContent = texto;
}

function verificarBS() {
  const c = calculoBS(datosBS());
  const e = c.errores, N = Opciones.normal;
  const v = { d1: leerLibre('pr-d1'), d2: leerLibre('pr-d2'), nd1: leerLibre('pr-nd1'), nd2: leerLibre('pr-nd2'), c: leerLibre('pr-c'), p: leerLibre('pr-p') };

  const diagnostico = (valor, correcto, pistas, tol = 0.005) => {
    if (Number.isNaN(valor)) return [null, ''];
    if (cerca(valor, correcto, tol)) return [true, '✔ Correcto'];
    for (const [esperado, texto] of pistas) if (cerca(valor, esperado, tol)) return [false, `✘ ${texto}`];
    return [false, '✘ No coincide. Revisá el cálculo de este paso.'];
  };

  marcar('d1', ...diagnostico(v.d1, c.d1, [
    [c.d2, 'Ese valor es d₂, no d₁.'],
    [e.d1SinMedio, 'Te olvidaste del σ²/2 en el numerador.'],
    [e.d1ConSigma2, 'Usaste σ² en lugar de σ²/2.'],
    [e.d1SinRaiz, 'El denominador es σ·√T, no σ·T.'],
    [e.d1Invertido, 'Invertiste S₀ y K dentro del logaritmo.'],
    [e.d1Meses, 'Parece que usaste T en meses: T va en años.'],
  ]));
  marcar('d2', ...diagnostico(v.d2, c.d2, [
    [c.d1, 'Ese valor es d₁: d₂ = d₁ − σ√T.'],
    [c.d1 + c.raiz, 'Sumaste σ√T: hay que restarlo (d₂ = d₁ − σ√T).'],
    [v.d1 - c.raiz, 'Tu d₂ es coherente con tu d₁: el error viene del paso anterior.'],
  ]));
  marcar('nd1', ...diagnostico(v.nd1, c.Nd1, [
    [1 - c.Nd1, 'Ese es N(−d₁) = 1 − N(d₁).'],
    [c.Nd2, 'Ese es N(d₂).'],
    [Opciones.densidad(c.d1), 'Usaste la densidad φ(d₁), no la acumulada N(d₁).'],
    [N(v.d1), 'Es N de tu d₁: el error viene del cálculo de d₁.'],
  ], 0.002));
  marcar('nd2', ...diagnostico(v.nd2, c.Nd2, [
    [1 - c.Nd2, 'Ese es N(−d₂) = 1 − N(d₂).'],
    [c.Nd1, 'Ese es N(d₁).'],
    [Opciones.densidad(c.d2), 'Usaste la densidad φ(d₂), no la acumulada N(d₂).'],
    [N(v.d2), 'Es N de tu d₂: el error viene del cálculo de d₂.'],
  ], 0.002));
  marcar('c', ...diagnostico(v.c, c.call, [
    [e.callSinDescontar, 'No descontaste K: va K·e^(−rT).'],
    [c.put, 'Ese es el precio del put.'],
    [e.callNInvertidas, 'Intercambiaste N(d₁) y N(d₂).'],
    [Math.max(c.Sq - c.Kr, 0), 'Eso es S₀ − K·e^(−rT), el límite inferior, no el precio.'],
  ], 0.01));
  marcar('p', ...diagnostico(v.p, c.put, [
    [e.putSinDescontar, 'No descontaste K: va K·e^(−rT).'],
    [c.call, 'Ese es el precio del call.'],
    [e.putSinNegativos, 'Usaste N(d₂) y N(d₁) en lugar de N(−d₂) y N(−d₁).'],
  ], 0.01));
}

// ======================================================================
// 2. Tabla de la normal
// ======================================================================

function herramientaNormal() {
  const inversa = elegido('n-modo') === 'inversa';
  $('n-x-label').textContent = inversa ? 'Probabilidad N(x) (entre 0 y 1)' : 'Valor de x';
  const entrada = leerLibre('n-x');
  if (Number.isNaN(entrada)) return;
  if (inversa && (entrada <= 0 || entrada >= 1)) {
    $('n-datos').innerHTML = '<div class="alerta">La probabilidad tiene que estar entre 0 y 1 (por ejemplo, 0,975).</div>';
    return;
  }
  const x = inversa ? Opciones.normalInversa(entrada) : entrada;
  const Nx = Opciones.normal(x);

  $('n-datos').innerHTML = `
    <div class="dato destacado"><div class="dato-etiqueta">${inversa ? 'x' : 'N(x)'}</div><div class="dato-valor">${f4(inversa ? x : Nx)}</div></div>
    <div class="dato"><div class="dato-etiqueta">N(−x) = 1 − N(x)</div><div class="dato-valor">${f4(1 - Nx)}</div></div>
    <div class="dato"><div class="dato-etiqueta">Densidad φ(x)</div><div class="dato-valor">${f4(Opciones.densidad(x))}</div></div>`;

  // Cómo buscarlo en una tabla impresa (con valores positivos y dos decimales).
  const ax = Math.abs(x);
  const abajo = Math.floor(ax * 100) / 100, arriba = abajo + 0.01;
  const Nab = Opciones.normal(abajo), Narr = Opciones.normal(arriba);
  const fraccion = (ax - abajo) / 0.01;
  const interp = Nab + fraccion * (Narr - Nab);
  const fila = Math.floor(abajo * 10) / 10, col = Math.round((abajo - fila) * 100) / 100;
  $('n-tabla').innerHTML = `
    <p><b>Cómo buscarlo en la tabla:</b> para ${fmt(ax, 4)} se busca la fila <b>${fmt(fila, 1)}</b> y la columna <b>${fmt(col, 2)}</b>: N(${fmt(abajo, 2)}) = ${f4(Nab)}. La siguiente columna da N(${fmt(arriba, 2)}) = ${f4(Narr)}.</p>
    ${fraccion > 0.001 ? `<p>Interpolando: ${f4(Nab)} + ${fmt(fraccion, 2)}·(${f4(Narr)} − ${f4(Nab)}) ≈ <b>${f4(interp)}</b>.</p>` : ''}
    ${x < 0 ? `<p>Como x es negativo y la tabla suele traer solo valores positivos: N(${fmt(x, 4)}) = 1 − N(${fmt(ax, 4)}) = ${f4(Nx)}.</p>` : ''}`;

  const xs = [];
  for (let i = 0; i <= 160; i++) xs.push(-4 + (8 * i) / 160);
  xs.push(x);
  xs.sort((a, b) => a - b);
  dibujarGrafico($('n-grafico'), {
    type: 'line',
    data: {
      datasets: [
        { label: `Área = N(${fmt(x, 4)}) = ${f4(Nx)}`, data: xs.filter(t => t <= x).map(t => ({ x: t, y: Opciones.densidad(t) })), borderColor: 'transparent', pointRadius: 0, fill: { target: 'origin', above: 'rgba(31,58,95,0.25)' } },
        { label: 'Densidad normal estándar', data: xs.map(t => ({ x: t, y: Opciones.densidad(t) })), borderColor: '#1f3a5f', borderWidth: 2, pointRadius: 0 },
      ],
    },
    options: opcionesEjes({ tituloX: 'x', tituloY: 'φ(x)', xMin: -4, xMax: 4, decX: 0, decY: 2 }),
  });
}

// ======================================================================
// 3. Conversor de tasas y tasa forward
// ======================================================================

const nombresComp = { 0: 'Continua', 1: 'Anual', 2: 'Semestral', 4: 'Trimestral', 12: 'Mensual' };

function herramientaTasas() {
  const R = numero('t-tasa') / 100, m = Number($('t-comp').value), T = numero('t-plazo');
  if ([R, T].some(Number.isNaN)) return datosInvalidos();
  const Rc = m === 0 ? R : m * Math.log(1 + R / m);
  const filas = [0, 1, 2, 4, 12].map(k => {
    const Rk = k === 0 ? Rc : k * (Math.exp(Rc / k) - 1);
    const fd = Math.exp(-Rc * T);
    return [
      { texto: nombresComp[k] + (k === m ? ' (dato)' : ''), clase: k === m ? 'pos' : '' },
      fmtPct(Rk, 4),
      k === 0 ? '—' : fmtPct(Rk / k, 4),
      k === 0 ? `e^(−${fmt(Rc, 4)}·${fmt(T, 2)})` : `(1 + ${fmt(Rk / k, 6)})^(−${fmt(k * T, 2)})`,
      fmt(fd, 6),
    ];
  });
  $('t-resultado').innerHTML = `
    ${tablaHTML([{ titulo: 'Composición' }, { titulo: 'Tasa anual equivalente', num: true }, { titulo: 'Tasa por período', num: true }, { titulo: `Factor de descuento a ${fmt(T, 2)} años` }, { titulo: 'Valor', num: true }], filas)}
    <div class="explicacion">
      <p>De m veces por año a continua: R_c = m·ln(1 + R_m/m). De continua a m veces por año: R_m = m·(e^(R_c/m) − 1).</p>
      <p>Todas las tasas de la tabla son equivalentes: dan el mismo factor de descuento.</p>
    </div>`;

  const r1 = numero('fw-r1') / 100, t1 = numero('fw-t1'), r2 = numero('fw-r2') / 100, t2 = numero('fw-t2');
  if ([r1, t1, r2, t2].some(Number.isNaN)) return datosInvalidos();
  if (!(t2 > t1)) { $('fw-resultado').innerHTML = '<div class="alerta">T₂ tiene que ser mayor que T₁.</div>'; return; }
  const RF = (r2 * t2 - r1 * t1) / (t2 - t1);
  $('fw-resultado').innerHTML = `
    <div class="resultados">
      <div class="dato destacado"><div class="dato-etiqueta">Forward continua entre T₁ y T₂</div><div class="dato-valor">${fmtPct(RF, 4)}</div></div>
      <div class="dato"><div class="dato-etiqueta">Equivalente semestral</div><div class="dato-valor">${fmtPct(2 * (Math.exp(RF / 2) - 1), 4)}</div></div>
      <div class="dato"><div class="dato-etiqueta">Equivalente anual</div><div class="dato-valor">${fmtPct(Math.exp(RF) - 1, 4)}</div></div>
    </div>
    <div class="explicacion"><p>R_F = (R₂·T₂ − R₁·T₁)/(T₂ − T₁) = (${fmt(r2, 4)}·${fmt(t2, 4)} − ${fmt(r1, 4)}·${fmt(t1, 4)})/(${fmt(t2 - t1, 4)}).</p></div>`;
}

// ======================================================================
// 4. Paridad put-call: despejar la incógnita
// ======================================================================

function herramientaParidad() {
  const inc = $('pc-incognita').value;
  ['c', 'p', 's', 'k'].forEach(id => { $(`pc-${id}`).disabled = id === inc.toLowerCase(); });
  const v = { c: numero('pc-c'), p: numero('pc-p'), S: numero('pc-s'), K: numero('pc-k') };
  const r = numero('pc-r') / 100, T = numero('pc-t'), D = numero('pc-d') || 0;
  const faltan = Object.entries(v).filter(([k, x]) => k !== inc && Number.isNaN(x));
  if (faltan.length || [r, T].some(Number.isNaN)) return datosInvalidos();
  const fd = Math.exp(-r * T);
  let resultado, formula;
  if (inc === 'p') { resultado = v.c + D + v.K * fd - v.S; formula = `p = c + D + K·e^(−rT) − S₀ = ${fmt(v.c, 4)} + ${fmt(D, 4)} + ${fmt(v.K * fd, 4)} − ${fmt(v.S, 4)}`; }
  if (inc === 'c') { resultado = v.p + v.S - D - v.K * fd; formula = `c = p + S₀ − D − K·e^(−rT) = ${fmt(v.p, 4)} + ${fmt(v.S, 4)} − ${fmt(D, 4)} − ${fmt(v.K * fd, 4)}`; }
  if (inc === 'S') { resultado = v.c + D + v.K * fd - v.p; formula = `S₀ = c + D + K·e^(−rT) − p = ${fmt(v.c, 4)} + ${fmt(D, 4)} + ${fmt(v.K * fd, 4)} − ${fmt(v.p, 4)}`; }
  if (inc === 'K') { resultado = (v.p + v.S - v.c - D) / fd; formula = `K = (p + S₀ − c − D)·e^(rT) = (${fmt(v.p, 4)} + ${fmt(v.S, 4)} − ${fmt(v.c, 4)} − ${fmt(D, 4)})·${fmt(1 / fd, 6)}`; }
  const nombres = { p: 'Put', c: 'Call', S: 'Precio de la acción', K: 'Strike' };
  $('pc-resultado').innerHTML = `
    <div class="resultados">
      <div class="dato destacado"><div class="dato-etiqueta">${nombres[inc]}</div><div class="dato-valor">${fmt(resultado, 4)}</div></div>
      <div class="dato"><div class="dato-etiqueta">K·e^(−rT)</div><div class="dato-valor">${fmt(v.K * fd || 0, 4)}</div></div>
    </div>
    <div class="explicacion"><p>${formula} = <b>${fmt(resultado, 4)}</b></p></div>
    ${resultado < 0 ? '<div class="alerta">El resultado es negativo: con esos datos no puede cumplirse la paridad. Revisá los valores.</div>' : ''}`;
}

// ======================================================================
// 5. Límites de precios
// ======================================================================

function herramientaLimites() {
  const S = numero('li-s'), K = numero('li-k'), r = numero('li-r') / 100, T = numero('li-t'), precio = numero('li-precio');
  if ([S, K, r, T].some(Number.isNaN)) return datosInvalidos();
  const vpK = K * Math.exp(-r * T);
  const lim = {
    c: { nombre: 'Call europeo', inf: Math.max(S - vpK, 0), sup: S, fInf: 'máx(S₀ − K·e^(−rT); 0)', fSup: 'S₀' },
    p: { nombre: 'Put europeo', inf: Math.max(vpK - S, 0), sup: vpK, fInf: 'máx(K·e^(−rT) − S₀; 0)', fSup: 'K·e^(−rT)' },
    C: { nombre: 'Call americano', inf: Math.max(S - vpK, 0), sup: S, fInf: 'máx(S₀ − K·e^(−rT); 0)', fSup: 'S₀' },
    P: { nombre: 'Put americano', inf: Math.max(K - S, 0), sup: K, fInf: 'máx(K − S₀; 0)', fSup: 'K' },
  };
  const tipo = $('li-tipo').value;
  const filas = Object.entries(lim).map(([k, l]) => [
    { texto: l.nombre, clase: k === tipo ? 'pos' : '' }, l.fInf, fmt(l.inf, 4), l.fSup, fmt(l.sup, 4),
  ]);
  let veredicto = '';
  if (!Number.isNaN(precio)) {
    const l = lim[tipo];
    const estrategias = {
      'c-bajo': 'Comprar el call, vender en corto la acción e invertir lo recaudado.',
      'c-alto': 'Vender el call y comprar la acción.',
      'C-bajo': 'Comprar el call, vender en corto la acción e invertir lo recaudado.',
      'C-alto': 'Vender el call y comprar la acción.',
      'p-bajo': 'Comprar el put y la acción, tomando prestado el dinero.',
      'p-alto': 'Vender el put e invertir K·e^(−rT) a la tasa libre de riesgo.',
      'P-bajo': 'Comprar el put y la acción, y ejercer inmediatamente: se cobra K.',
      'P-alto': 'Vender el put e invertir K.',
    };
    if (precio < l.inf - 1e-9) veredicto = `<div class="alerta">El ${l.nombre.toLowerCase()} cotiza a ${fmt(precio)}, <b>por debajo de su límite inferior</b> (${fmt(l.inf, 4)}): está barato y hay arbitraje. ${estrategias[`${tipo}-bajo`]}</div>`;
    else if (precio > l.sup + 1e-9) veredicto = `<div class="alerta">El ${l.nombre.toLowerCase()} cotiza a ${fmt(precio)}, <b>por encima de su límite superior</b> (${fmt(l.sup, 4)}): está caro y hay arbitraje. ${estrategias[`${tipo}-alto`]}</div>`;
    else veredicto = `<div class="ok">El precio ${fmt(precio)} está dentro de los límites (${fmt(l.inf, 4)} a ${fmt(l.sup, 4)}): no hay arbitraje por límites.</div>`;
  }
  $('li-resultado').innerHTML = tablaHTML(
    [{ titulo: 'Opción' }, { titulo: 'Límite inferior' }, { titulo: 'Valor', num: true }, { titulo: 'Límite superior' }, { titulo: 'Valor', num: true }], filas) + veredicto;
}

// ======================================================================
// 6. Griegas y cobertura delta
// ======================================================================

function herramientaGriegas() {
  const d = { S: numero('g-s'), K: numero('g-k'), r: numero('g-r') / 100, sigma: numero('g-sigma') / 100, T: numero('g-t') };
  const cant = numero('g-cant'), tipo = $('g-tipo').value;
  if (Object.values(d).some(Number.isNaN) || Number.isNaN(cant)) return datosInvalidos();
  const g = Opciones.griegas(d);
  if (!g) { $('g-resultado').innerHTML = '<div class="alerta">T y σ tienen que ser positivos.</div>'; return; }
  const esCall = tipo === 'call';
  const delta = esCall ? g.deltaCall : g.deltaPut, theta = esCall ? g.thetaCall : g.thetaPut, rho = esCall ? g.rhoCall : g.rhoPut;
  const deltaPos = cant * delta, acciones = -deltaPos;
  const accion = Math.abs(acciones) < 0.5 ? 'No hace falta operar acciones.' : `${acciones > 0 ? 'Comprar' : 'Vender'} <b>${fmt(Math.abs(acciones), 0)} acciones</b>.`;
  $('g-resultado').innerHTML = `
    <div class="resultados">
      <div class="dato"><div class="dato-etiqueta">Precio del ${tipo}</div><div class="dato-valor">${f4(g[tipo])}</div></div>
      <div class="dato destacado"><div class="dato-etiqueta">Delta</div><div class="dato-valor">${f4(delta)}</div></div>
      <div class="dato"><div class="dato-etiqueta">Gamma</div><div class="dato-valor">${f4(g.gamma)}</div></div>
      <div class="dato"><div class="dato-etiqueta">Theta (por año · por día calendario, ÷365)</div><div class="dato-valor" style="font-size:1.05rem">${f4(theta)} · ${f4(theta / 365)}</div></div>
      <div class="dato"><div class="dato-etiqueta">Vega (por 1 % de σ)</div><div class="dato-valor">${f4(g.vega / 100)}</div></div>
      <div class="dato"><div class="dato-etiqueta">Rho (por 1 % de r)</div><div class="dato-valor">${f4(rho / 100)}</div></div>
    </div>
    <div class="explicacion">
      <p><b>Interpretación:</b> si la acción sube $1, el ${tipo} cambia ≈ ${fmt(delta, 4)}; su delta cambia ≈ ${fmt(g.gamma, 4)}. Si pasa un día sin otros cambios, vale ≈ ${fmt(Math.abs(theta / 365), 4)} ${theta < 0 ? 'menos' : 'más'}.</p>
      <p><b>Cobertura:</b> ${fmt(cant, 0)} ${tipo}s × delta ${fmt(delta, 4)} = delta de la posición ${fmt(deltaPos, 2)}. Para quedar delta neutral: ${accion}</p>
      <p><b>Gamma de la posición:</b> ${fmt(cant * g.gamma, 4)} (${cant * g.gamma >= 0 ? 'positiva: la volatilidad del subyacente favorece a la posición cubierta' : 'negativa: los movimientos grandes del subyacente perjudican a la posición cubierta'}).</p>
    </div>`;
}

// ======================================================================
// 7. Tabla de payoff por rangos
// ======================================================================

let patasTP = [];

function filaPata(p, i) {
  const esAccion = p.tipo === 'accion';
  return `<tr data-i="${i}">
    <td><select data-campo="tipo" aria-label="Instrumento de la posición ${i + 1}"><option value="call" ${p.tipo === 'call' ? 'selected' : ''}>Call</option><option value="put" ${p.tipo === 'put' ? 'selected' : ''}>Put</option><option value="accion" ${esAccion ? 'selected' : ''}>Acción</option></select></td>
    <td><select data-campo="lado" aria-label="Compra o venta, posición ${i + 1}"><option value="compra" ${p.lado === 'compra' ? 'selected' : ''}>Compra</option><option value="venta" ${p.lado === 'venta' ? 'selected' : ''}>Venta</option></select></td>
    <td><input data-campo="strike" type="number" step="any" value="${p.strike}" aria-label="${esAccion ? 'Precio de la acción' : 'Strike'}, posición ${i + 1}" title="${esAccion ? 'Precio de compra/venta de la acción' : 'Strike'}"></td>
    <td><input data-campo="prima" aria-label="Prima, posición ${i + 1}" type="number" step="any" value="${esAccion ? '' : p.prima}" ${esAccion ? 'disabled placeholder="—"' : ''}></td>
    <td><input data-campo="cant" aria-label="Cantidad, posición ${i + 1}" type="number" step="1" min="1" value="${p.cant}"></td>
    <td><button class="btn-icono" data-quitar title="Quitar">×</button></td>
  </tr>`;
}

function dibujarPatasTP() {
  $('tp-patas').innerHTML = patasTP.map(filaPata).join('');
  herramientaPayoff();
}

// Expresión lineal b·S_T + a, escrita como en las guías.
function expresion(b, a) {
  const redondo = x => Math.round(x * 10000) / 10000;
  b = redondo(b); a = redondo(a);
  if (b === 0) return fmt(a);
  const termS = Math.abs(b) === 1 ? 'S_T' : `${fmt(Math.abs(b), b % 1 ? 2 : 0)}·S_T`;
  if (a === 0) return (b < 0 ? '−' : '') + termS;
  if (b < 0 && a > 0) return `${fmt(a)} − ${termS}`;
  return `${b < 0 ? '−' : ''}${termS} ${a > 0 ? '+' : '−'} ${fmt(Math.abs(a))}`;
}

// Payoff bruto de una pata dentro de un rango, como expresión.
function expresionPata(p, activo) {
  const k = fmt(p.strike), n = p.cant > 1 ? `${p.cant}·` : '', menos = p.lado === 'venta';
  if (p.tipo === 'accion') return `${menos ? '−' : ''}${n}S_T`;
  if (!activo) return '0';
  const base = p.tipo === 'call' ? `S_T − ${k}` : `${k} − S_T`;
  if (menos) return `−${n}(${base})`;
  return p.cant > 1 ? `${n}(${base})` : base;
}

function herramientaPayoff() {
  if (!patasTP.length) { $('tp-resultado').innerHTML = '<p class="vacio">Agregá posiciones o cargá un ejemplo.</p>'; return; }
  const legs = patasTP.map(p => ({
    type: p.tipo === 'accion' ? 'stock' : p.tipo, side: p.lado, qty: p.cant,
    strike: p.tipo === 'accion' ? 0 : p.strike, premium: p.tipo === 'accion' ? p.strike : p.prima,
  }));
  if (legs.some(l => [l.strike, l.premium, l.qty].some(Number.isNaN))) return datosInvalidos();
  const strikes = [...new Set(patasTP.filter(p => p.tipo !== 'accion').map(p => p.strike))].sort((a, b) => a - b);
  const costo = Payoff.analyze(legs).netPremium;

  // Rangos: debajo del primer strike, entre strikes y arriba del último.
  const rangos = [];
  if (!strikes.length) rangos.push({ etiqueta: 'Cualquier S_T', muestra: 100 });
  else {
    rangos.push({ etiqueta: `S_T ≤ ${fmt(strikes[0])}`, muestra: strikes[0] / 2 });
    for (let i = 0; i < strikes.length - 1; i++) rangos.push({ etiqueta: `${fmt(strikes[i])} < S_T < ${fmt(strikes[i + 1])}`, muestra: (strikes[i] + strikes[i + 1]) / 2 });
    rangos.push({ etiqueta: `S_T ≥ ${fmt(strikes[strikes.length - 1])}`, muestra: strikes[strikes.length - 1] * 1.5 });
  }

  const payoffBruto = (S) => legs.reduce((s, l) => {
    const sg = l.side === 'compra' ? 1 : -1;
    const v = l.type === 'call' ? Math.max(S - l.strike, 0) : l.type === 'put' ? Math.max(l.strike - S, 0) : S;
    return s + sg * l.qty * v;
  }, 0);

  const filas = rangos.map(rg => {
    const S1 = rg.muestra, S2 = rg.muestra + 0.001;
    const b = (payoffBruto(S2) - payoffBruto(S1)) / 0.001, a = payoffBruto(S1) - b * S1;
    const celdas = patasTP.map(p => {
      const activo = p.tipo === 'call' ? S1 > p.strike : p.tipo === 'put' ? S1 < p.strike : true;
      return expresionPata(p, activo);
    });
    return [rg.etiqueta, ...celdas, { texto: `<b>${expresion(b, a)}</b>` }, { texto: expresion(b, a - costo) }];
  });

  const nombre = p => `${p.lado === 'compra' ? 'Long' : 'Short'} ${p.cant > 1 ? p.cant + ' ' : ''}${p.tipo === 'accion' ? 'acción' : `${p.tipo} ${fmt(p.strike)}`}`;
  const a = Payoff.analyze(legs);
  $('tp-resultado').innerHTML = tablaHTML(
    [{ titulo: 'Rango del precio' }, ...patasTP.map(p => ({ titulo: nombre(p) })), { titulo: 'Payoff bruto total' }, { titulo: 'Beneficio (− costo)' }], filas)
    + `<div class="resultados">
        <div class="dato"><div class="dato-etiqueta">${costo >= 0 ? 'Costo neto (débito)' : 'Ingreso neto (crédito)'}</div><div class="dato-valor">${fmt(Math.abs(costo))}</div></div>
        <div class="dato"><div class="dato-etiqueta">Ganancia máxima</div><div class="dato-valor pos">${fmt(a.maxProfit)}</div></div>
        <div class="dato"><div class="dato-etiqueta">Pérdida máxima</div><div class="dato-valor neg">${fmt(a.maxLoss)}</div></div>
        <div class="dato"><div class="dato-etiqueta">Break-even</div><div class="dato-valor">${a.breakevens.map(x => fmt(x, decPrecio(Math.max(...patasTP.map(p => p.strike || 0))))).join(' / ') || '—'}</div></div>
      </div>`;
}

function cargarEjemploTP(valor) {
  if (!valor) return;
  patasTP = valor.split(';').map(s => {
    const [tipo, lado, strike, prima, cant] = s.split('|');
    const n = x => parseFloat(x.replace(',', '.'));
    return { tipo, lado, strike: n(strike), prima: n(prima), cant: n(cant) };
  });
  dibujarPatasTP();
}

// ======================================================================
// Inicio
// ======================================================================

alCambiar('w-bs', () => { bsPasoAPaso(); });
$('bs-practica').addEventListener('change', e => {
  bsMostrado = false;
  $('bs-zona-practica').hidden = !e.target.checked;
  bsPasoAPaso();
});
$('bs-verificar').addEventListener('click', verificarBS);
$('bs-mostrar').addEventListener('click', () => { bsMostrado = true; bsPasoAPaso(); });

alCambiar('w-normal', herramientaNormal);
alCambiar('w-tasas', herramientaTasas);
alCambiar('w-paridad', herramientaParidad);
alCambiar('w-limites', herramientaLimites);
alCambiar('w-griegas', herramientaGriegas);

$('tp-patas').addEventListener('input', e => {
  const tr = e.target.closest('tr'), campo = e.target.dataset.campo;
  if (!tr || !campo) return;
  const p = patasTP[Number(tr.dataset.i)];
  p[campo] = campo === 'tipo' || campo === 'lado' ? e.target.value : parseFloat(String(e.target.value).replace(',', '.'));
  if (campo === 'tipo') dibujarPatasTP(); else herramientaPayoff();
});
$('tp-patas').addEventListener('click', e => {
  if (!e.target.hasAttribute('data-quitar')) return;
  patasTP.splice(Number(e.target.closest('tr').dataset.i), 1);
  dibujarPatasTP();
});
$('tp-agregar').addEventListener('click', () => { patasTP.push({ tipo: 'call', lado: 'compra', strike: 100, prima: 5, cant: 1 }); dibujarPatasTP(); });
$('tp-ejemplo').addEventListener('change', e => { cargarEjemploTP(e.target.value); e.target.value = ''; });
cargarEjemploTP('call|compra|95|8,53|1;call|venta|105|3,44|1');
