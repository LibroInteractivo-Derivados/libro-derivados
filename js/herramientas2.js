// Caja de herramientas (segunda parte): Unidades I, II y III, y volatilidad histórica.
// Cuenta de márgenes, cobertura con futuros, TNA de la cátedra, bonos y duración, FRA,
// precio forward y arbitraje, volatilidad histórica.
// Usa las fórmulas de calculos.js (Futuros, Cobertura, Tasas, Opciones) y las utilidades de comun.js.

const n4 = x => fmt(x, 4);
const leer = id => aNumero($(id).value);
const listaDe = id => String($(id).value).replace(/[−–]/g, '-').split(/[\s;]+/).filter(Boolean).map(aNumero);

// Lista de pasos con su explicación: [título, cuenta, resultado, porqué]
function pasosHTML(pasos) {
  return `<ol class="pasos">${pasos.map(([t, c, v, p]) => `<li><span><b>${t}</b>${c ? `<br><span class="formula-paso">${c}</span>` : ''}${p ? `<span class="porque">${p}</span>` : ''}</span><span class="resultado-paso">${v}</span></li>`).join('')}</ol>`;
}

// ======================================================================
// Unidad I · Cuenta de márgenes
// ======================================================================

function herramientaMargen() {
  const precios = listaDe('m-precios');
  const larga = elegido('m-lado') === 'larga';
  const n = leer('m-n'), tam = leer('m-tam'), mi = leer('m-mi'), mm = leer('m-mm');
  if (precios.length < 2 || precios.some(Number.isNaN) || [n, tam, mi, mm].some(Number.isNaN)) {
    $('m-resultado').innerHTML = '<div class="alerta">Escribí al menos dos precios y completá los datos.</div>';
    return;
  }
  if (mm > mi) { $('m-resultado').innerHTML = '<div class="alerta">El margen de mantenimiento no puede ser mayor que el inicial.</div>'; return; }
  const r = Futuros.cuentaMargen({ precios, contratos: n, tamano: tam, margenInicial: mi, margenMantenimiento: mm, larga });
  const filas = r.filas.map(f => [f.dia, fmt(f.precio), { texto: fmtSigno(f.diaria), clase: claseSigno(f.diaria) }, { texto: fmtSigno(f.acumulada), clase: claseSigno(f.acumulada) },
    fmt(f.saldoAntes), f.llamado > 0 ? { texto: fmt(f.llamado), clase: 'neg' } : '—', fmt(f.saldo)]);
  const primerLlamado = r.filas.find(f => f.llamado > 0);
  const ultima = r.filas[r.filas.length - 1];
  const caida = (mi - mm) / (n * tam);
  $('m-resultado').innerHTML = `
    <div class="resultados">
      <div class="dato"><div class="dato-etiqueta">Margen inicial total</div><div class="dato-valor">${fmt(r.mi)}</div></div>
      <div class="dato"><div class="dato-etiqueta">Margen de mantenimiento total</div><div class="dato-valor">${fmt(r.mm)}</div></div>
      <div class="dato destacado"><div class="dato-etiqueta">Resultado acumulado</div><div class="dato-valor ${claseSigno(ultima.acumulada)}">${fmtSigno(ultima.acumulada)}</div></div>
      <div class="dato"><div class="dato-etiqueta">Total depositado por llamados</div><div class="dato-valor">${fmt(r.totalLlamados)}</div></div>
    </div>
    ${tablaHTML([{ titulo: 'Día' }, { titulo: 'Precio de ajuste', num: true }, { titulo: 'Ganancia diaria', num: true }, { titulo: 'Acumulada', num: true }, { titulo: 'Saldo antes del llamado', num: true }, { titulo: 'Llamado de margen', num: true }, { titulo: 'Saldo', num: true }], filas, i => (r.filas[i].llamado > 0 ? 'resaltada' : ''), 'compacta')}
    <div class="explicacion">
      <p><b>Cómo se calcula:</b> ganancia diaria = ${larga ? '(precio de hoy − precio de ayer)' : '(precio de ayer − precio de hoy)'} × ${fmt(tam, 0)} × ${fmt(n, 0)} contratos. Una posición ${larga ? 'larga gana cuando el precio sube' : 'corta gana cuando el precio baja'}.</p>
      <p><b>Por qué hay llamados:</b> si el saldo cae por debajo del margen de mantenimiento (${fmt(r.mm)}), hay que depositar lo necesario para volver al margen <b>inicial</b>, no al de mantenimiento. Con estos datos, el precio puede moverse ${fmt(caida, 2)} en contra antes del primer llamado: (${fmt(mi)} − ${fmt(mm)}) / ${fmt(tam, 0)}.</p>
      ${primerLlamado ? `<p>El primer llamado ocurre el día ${primerLlamado.dia}: el saldo quedó en ${fmt(primerLlamado.saldoAntes)} y se depositan ${fmt(primerLlamado.llamado)}.</p>` : '<p>No hubo llamados de margen.</p>'}
    </div>`;
}

// ======================================================================
// Unidad II · Cobertura con futuros
// ======================================================================

function herramientaCobertura() {
  const rho = leer('cb-rho'), ss = leer('cb-ss'), sf = leer('cb-sf'), qa = leer('cb-qa'), qf = leer('cb-qf');
  const va = leer('cb-va'), vf = leer('cb-vf');
  if ([rho, ss, sf, qa, qf].some(Number.isNaN) || sf <= 0 || qf <= 0) return datosInvalidos();
  const h = Cobertura.ratioMinimaVarianza({ rho, sigmaS: ss, sigmaF: sf });
  const N = Cobertura.contratos({ h, QA: qa, QF: qf });
  const pasos = [
    ['h* = ρ · σ_S / σ_F', `${n4(rho)} × ${n4(ss)} / ${n4(sf)}`, n4(h), h > 1 ? 'Mayor que 1: el contado es más volátil (en relación con su correlación) que el futuro, así que hace falta más nominal en futuros que la exposición.' : 'Menor que 1: con menos nominal en futuros que la exposición se minimiza la varianza.'],
    ['Efectividad = ρ²', `${n4(rho)}²`, fmt(rho * rho * 100, 1) + ' %', 'Proporción de la varianza que elimina la cobertura (el R² de la regresión de ΔS sobre ΔF).'],
    ['N* = h* · Q_A / Q_F', `${n4(h)} × ${fmt(qa, 0)} / ${fmt(qf, 0)}`, fmt(N, 2), `Se redondea a ${Math.round(N)} contratos.`],
  ];
  if (!Number.isNaN(va) && !Number.isNaN(vf) && vf > 0) {
    const Nt = Cobertura.contratosTailing({ h, VA: va, VF: vf });
    pasos.push(['Con ajuste por liquidación diaria: N* = h* · V_A / V_F', `${n4(h)} × ${fmt(va)} / ${fmt(vf)}`, fmt(Nt, 2), 'Usa valores en dinero en lugar de cantidades: corrige porque los futuros se liquidan todos los días (tailing the hedge).']);
  }
  $('cb-resultado').innerHTML = pasosHTML(pasos);
}

function herramientaCoberturaDatos() {
  const dS = listaDe('cd-ds'), dF = listaDe('cd-df');
  const qa = leer('cd-qa'), qf = leer('cd-qf');
  if (dS.length < 3 || dS.length !== dF.length || [...dS, ...dF].some(Number.isNaN)) {
    $('cd-resultado').innerHTML = '<div class="alerta">Cargá la misma cantidad de datos en las dos listas (al menos 3).</div>';
    return;
  }
  const r = Cobertura.desdeDatos(dS, dF);
  const N = Cobertura.contratos({ h: r.h, QA: qa, QF: qf });
  const c = coloresGrafico();
  const mS = Cobertura.media(dS), mF = Cobertura.media(dF);
  const xs = [Math.min(...dF), Math.max(...dF)];
  dibujarGrafico($('cd-grafico'), {
    type: 'scatter',
    data: { datasets: [
      { label: 'Observaciones (ΔF, ΔS)', data: dF.map((x, i) => ({ x, y: dS[i] })), backgroundColor: c.acento, pointRadius: 4 },
      { label: `Recta de regresión: pendiente h* = ${fmt(r.h, 3)}`, type: 'line', data: xs.map(x => ({ x, y: mS + r.h * (x - mF) })), borderColor: c.series[1], borderWidth: 2, pointRadius: 0 },
    ] },
    options: opcionesEjes({ tituloX: 'ΔF (cambio del futuro)', tituloY: 'ΔS (cambio del contado)', decX: 3, decY: 3 }),
  });
  $('cd-resultado').innerHTML = pasosHTML([
    ['Desvío de ΔS', `${r.n} observaciones`, n4(r.sigmaS), 'Desvío estándar muestral (divide por n − 1).'],
    ['Desvío de ΔF', '', n4(r.sigmaF), ''],
    ['Correlación ρ', 'cov(ΔS, ΔF) / (σ_S · σ_F)', n4(r.rho), 'Qué tan juntos se mueven el contado y el futuro.'],
    ['h* = ρ · σ_S / σ_F', `${n4(r.rho)} × ${n4(r.sigmaS)} / ${n4(r.sigmaF)}`, n4(r.h), 'Es la pendiente de la recta del gráfico.'],
    ['Efectividad = ρ²', '', fmt(r.efectividad * 100, 1) + ' %', 'La cobertura elimina este porcentaje de la varianza.'],
    Number.isFinite(N) && qa > 0 && qf > 0
      ? ['N* = h* · Q_A / Q_F', `${n4(r.h)} × ${fmt(qa, 0)} / ${fmt(qf, 0)}`, fmt(N, 2), `≈ ${Math.round(N)} contratos.`]
      : ['N* = h* · Q_A / Q_F', '', '—', 'Para calcular los contratos, completá el tamaño de la exposición y el del contrato (mayores que cero).'],
  ]);
}

function herramientaBeta() {
  const va = leer('cbt-va'), b = leer('cbt-b'), bo = leer('cbt-bo'), F = leer('cbt-f'), mult = leer('cbt-mult');
  if ([va, b, bo, F, mult].some(Number.isNaN) || F <= 0 || mult <= 0) return datosInvalidos();
  const vf = F * mult;
  const N = Cobertura.cambiarBeta({ beta: b, betaObjetivo: bo, VA: va, VF: vf });
  const accion = Math.abs(N) < 0.005 ? 'No hace falta operar futuros.' : N > 0 ? `<b>Vender ${fmt(N, 2)}</b> contratos (≈ ${Math.round(N)})` : `<b>Comprar ${fmt(-N, 2)}</b> contratos (≈ ${Math.round(-N)})`;
  $('cbt-resultado').innerHTML = pasosHTML([
    ['Valor de un contrato V_F = F × multiplicador', `${fmt(F)} × ${fmt(mult, 0)}`, fmt(vf), ''],
    ['N = (β − β*) · V_A / V_F', `(${fmt(b, 2)} − ${fmt(bo, 2)}) × ${fmt(va)} / ${fmt(vf)}`, fmt(N, 2),
      bo === 0 ? 'Con β* = 0 la cartera queda cubierta del riesgo de mercado: rinde aproximadamente la tasa libre de riesgo (más el alfa, si lo hay).' : bo < b ? 'Bajar la beta reduce la exposición al mercado sin vender acciones.' : 'Subir la beta aumenta la exposición al mercado: se compran futuros.'],
  ]) + `<div class="ok" style="margin-top:6px">${accion}.</div>`;
}

// ======================================================================
// Unidad III · TNA de la cátedra
// ======================================================================

function herramientaTNA() {
  const tna = leer('tna-tasa') / 100, m = leer('tna-m'), plazo = leer('tna-plazo'), base = Number($('tna-base').value);
  if ([tna, m, plazo].some(Number.isNaN) || m <= 0) return datosInvalidos();
  const iPer = tna * m / base;
  const iPlazo = Math.pow(1 + iPer, plazo / m) - 1;
  const tea = Math.pow(1 + iPer, base / m) - 1;
  const rc = (base / m) * Math.log(1 + iPer);
  $('tna-resultado').innerHTML = pasosHTML([
    [`Tasa efectiva de cada período de ${fmt(m, 0)} días`, `${fmtPct(tna)} × ${fmt(m, 0)} / ${base}`, fmtPct(iPer, 4), 'La TNA es proporcional: se reparte según los días del período.'],
    [`Tasa efectiva a ${fmt(plazo, 0)} días`, `(1 + ${fmt(iPer, 6)})^(${fmt(plazo, 0)}/${fmt(m, 0)}) − 1`, fmtPct(iPlazo, 4), 'Se capitaliza: cada período gana intereses sobre los intereses anteriores.'],
    ['Tasa efectiva anual (TEA)', `(1 + ${fmt(iPer, 6)})^(${base}/${fmt(m, 0)}) − 1`, fmtPct(tea, 4), ''],
    ['Tasa continua equivalente', `(${base}/${fmt(m, 0)}) · ln(1 + ${fmt(iPer, 6)})`, fmtPct(rc, 4), 'La que se usa en las fórmulas de la materia.'],
  ]);
}

// ======================================================================
// Unidad III · Bonos, rendimiento y duración
// ======================================================================

function parsearCurva(texto) {
  return texto.split(';').map(x => x.trim()).filter(Boolean).map(par => {
    const [t, r] = par.split(':').map(v => aNumero(v));
    return { t, r: r / 100 };
  }).filter(p => !Number.isNaN(p.t) && !Number.isNaN(p.r)).sort((a, b) => a.t - b.t);
}
function interpolarCurva(curva, t) {
  if (t <= curva[0].t) return curva[0].r;
  if (t >= curva[curva.length - 1].t) return curva[curva.length - 1].r;
  for (let i = 0; i < curva.length - 1; i++) if (t >= curva[i].t && t <= curva[i + 1].t) return curva[i].r + ((t - curva[i].t) * (curva[i + 1].r - curva[i].r)) / (curva[i + 1].t - curva[i].t);
}

function herramientaBono() {
  const N = leer('bo-n'), c = leer('bo-c') / 100, m = Number($('bo-m').value), T = leer('bo-t'), dy = leer('bo-dy') / 10000;
  if ([N, c, T].some(Number.isNaN) || T <= 0 || T > 100) return datosInvalidos();
  const flujos = Tasas.flujosBono({ nominal: N, cupon: c, m, T });
  const curva = parsearCurva($('bo-curva').value);
  let precio, y;
  const filas = [];
  if (curva.length) {
    precio = 0;
    flujos.forEach(f => { const r = interpolarCurva(curva, f.t), fd = Math.exp(-r * f.t); precio += f.flujo * fd; filas.push([fmt(f.t, 4), fmt(f.flujo, 4), fmtPct(r, 3), fmt(fd, 6), fmt(f.flujo * fd, 4)]); });
    y = Tasas.rendimiento(flujos, precio);
  } else {
    y = leer('bo-y') / 100;
    if (Number.isNaN(y)) { $('bo-resultado').innerHTML = '<div class="alerta">Cargá la curva de tasas cero o un rendimiento.</div>'; return; }
    precio = Tasas.precioConRendimiento(flujos, y);
    flujos.forEach(f => { const fd = Math.exp(-y * f.t); filas.push([fmt(f.t, 4), fmt(f.flujo, 4), fmtPct(y, 3), fmt(fd, 6), fmt(f.flujo * fd, 4)]); });
  }
  const { D, C } = Tasas.duracion(flujos, y);
  const aprox = -precio * D * dy, aprox2 = aprox + 0.5 * precio * C * dy * dy;
  const exacto = Tasas.precioConRendimiento(flujos, y + dy) - precio;
  $('bo-resultado').innerHTML = tablaHTML([{ titulo: 'Plazo (años)', num: true }, { titulo: 'Flujo', num: true }, { titulo: 'Tasa usada', num: true }, { titulo: 'Factor de descuento', num: true }, { titulo: 'Valor presente', num: true }], filas, () => '', 'compacta')
    + pasosHTML([
      ['Precio del bono', 'Suma de los valores presentes', fmt(precio, 4), 'Cada flujo se descuenta con la tasa cero de su propio plazo (un bono es una canasta de cupones cero).'],
      ['Rendimiento (TIR) continuo', 'La única tasa que, aplicada a todos los flujos, da el precio', fmtPct(y, 4), 'Se obtiene por prueba y error.'],
      ['Duración D = Σ tᵢ · VPᵢ / B', '', `${fmt(D, 4)} años`, 'Promedio de los plazos ponderado por el valor presente de cada flujo. Mide la sensibilidad del precio a la tasa.'],
      ['Convexidad C = Σ tᵢ² · VPᵢ / B', '', fmt(C, 4), 'Curvatura de la relación precio-tasa.'],
      [`Cambio de precio si la tasa sube ${fmt(dy * 10000, 0)} pb (duración)`, `−B · D · Δy = −${fmt(precio, 2)} × ${fmt(D, 4)} × ${fmt(dy, 4)}`, fmtSigno(aprox, 4), ''],
      ['Con duración y convexidad', '−B·D·Δy + ½·B·C·Δy²', fmtSigno(aprox2, 4), ''],
      ['Cambio exacto', 'Revaluando el bono con la nueva tasa', fmtSigno(exacto, 4), 'La duración sola sobrestima la caída cuando la tasa sube: la convexidad corrige la diferencia.'],
    ]);
}

// ======================================================================
// Unidad III · FRA
// ======================================================================

function herramientaFRA() {
  const L = leer('fr-l'), rk = leer('fr-rk') / 100, t1 = leer('fr-t1') / 12, t2 = leer('fr-t2') / 12, rm = leer('fr-rm') / 100, rf = leer('fr-rf') / 100, r2 = leer('fr-r2') / 100;
  if ([L, rk, t1, t2].some(Number.isNaN) || !(t2 > t1)) { $('fr-resultado').innerHTML = '<div class="alerta">T₂ tiene que ser mayor que T₁.</div>'; return; }
  const tau = t2 - t1;
  const pasos = [];
  if (!Number.isNaN(rm)) {
    const largaT2 = L * (rm - rk) * tau;
    const largaT1 = largaT2 / (1 + rm * tau);
    pasos.push(
      ['Flujo de la posición larga al final del período (T₂)', `L · (R_M − R_K) · τ = ${fmt(L, 0)} × (${fmt(rm * 100, 3)} % − ${fmt(rk * 100, 3)} %) × ${fmt(tau, 4)}`, fmtSigno(largaT2), rm > rk ? 'La tasa de mercado terminó por encima de la pactada: el largo (que fijó su costo de endeudamiento) cobra la diferencia.' : 'La tasa de mercado terminó por debajo de la pactada: el largo paga la diferencia.'],
      ['Liquidación en T₁ (lo usual)', `${fmtSigno(largaT2)} / (1 + ${fmt(rm * 100, 3)} % × ${fmt(tau, 4)})`, fmtSigno(largaT1), 'Se paga al inicio del período, descontado con la tasa de mercado.'],
      ['Posición corta (la del prestamista)', 'El mismo monto con signo opuesto', fmtSigno(-largaT1), ''],
    );
  }
  if (!Number.isNaN(rf) && !Number.isNaN(r2)) {
    const v = L * (rf - rk) * tau * Math.exp(-r2 * t2);
    pasos.push(['Valor hoy de la posición larga', `L · (R_F − R_K) · τ · e^(−R₂T₂) = ${fmt(L, 0)} × (${fmt(rf * 100, 3)} % − ${fmt(rk * 100, 3)} %) × ${fmt(tau, 4)} × e^(−${fmt(r2, 4)} × ${fmt(t2, 4)})`, fmtSigno(v), 'Antes del vencimiento se supone que la tasa futura será igual a la forward de hoy, y se descuenta el flujo desde T₂.']);
  }
  $('fr-resultado').innerHTML = pasosHTML(pasos);
}

// ======================================================================
// Unidad III · Precio forward y arbitraje
// ======================================================================

function herramientaForward() {
  const tipo = $('fw-tipo').value;
  document.querySelectorAll('#w-fwd [data-para]').forEach(el => { el.hidden = el.dataset.para !== tipo; });
  const S = leer('fw-s'), r = leer('fw-r') / 100, T = leer('fw-t');
  if ([S, r, T].some(Number.isNaN) || S <= 0 || T <= 0) return datosInvalidos();
  const pasos = [];
  let F, I = 0, q = 0, U = 0, u = 0, y = 0, nombreQ = '';
  if (tipo === 'ingresos') {
    const ingresos = String($('fw-ing').value).split(';').map(x => x.trim()).filter(Boolean).map(t => {
      const [monto, plazo, tasa] = t.split('@').map(v => aNumero(v));
      return { monto, t: plazo, r: Number.isNaN(tasa) || tasa === undefined ? r : tasa / 100 };
    }).filter(d => !Number.isNaN(d.monto) && !Number.isNaN(d.t));
    ingresos.forEach(d => { const vp = d.monto * Math.exp(-d.r * d.t); I += vp; pasos.push([`VP del ingreso de ${fmt(d.monto)} en ${fmt(d.t, 4)} años`, `${fmt(d.monto)} · e^(−${fmt(d.r, 4)} × ${fmt(d.t, 4)})`, n4(vp), 'Cada ingreso se descuenta con la tasa de su propio plazo.']); });
    F = (S - I) * Math.exp(r * T);
    pasos.push(['F₀ = (S₀ − I) · e^(rT)', `(${fmt(S)} − ${n4(I)}) · e^(${fmt(r, 4)} × ${fmt(T, 4)})`, n4(F), 'Quien tiene el activo cobra los ingresos; quien está largo en el forward, no. Por eso se restan del contado.']);
  } else if (tipo === 'simple') {
    F = S * Math.exp(r * T);
    pasos.push(['F₀ = S₀ · e^(rT)', `${fmt(S)} · e^(${fmt(r, 4)} × ${fmt(T, 4)})`, n4(F), 'Comprar hoy y financiarse hasta T cuesta S₀e^(rT): el forward no puede valer otra cosa sin arbitraje.']);
  } else if (tipo === 'rendimiento' || tipo === 'moneda') {
    q = (tipo === 'moneda' ? leer('fw-rf') : leer('fw-q')) / 100;
    nombreQ = tipo === 'moneda' ? 'r_f' : 'q';
    F = S * Math.exp((r - q) * T);
    pasos.push([`F₀ = S₀ · e^((r − ${nombreQ})T)`, `${fmt(S, 4)} · e^((${fmt(r, 4)} − ${fmt(q, 4)}) × ${fmt(T, 4)})`, n4(F), tipo === 'moneda' ? 'Paridad cubierta de tasas: la moneda extranjera "rinde" su tasa r_f. Si r > r_f, el forward cotiza por encima del contado.' : 'El rendimiento q lo cobra quien tiene el activo, no quien está largo en el forward.']);
  } else {
    u = leer('fw-u') / 100; y = leer('fw-y') / 100; U = leer('fw-uvp');
    if (!Number.isNaN(U) && U > 0) {
      F = (S + U) * Math.exp((r - (y || 0)) * T);
      pasos.push(['F₀ = (S₀ + U) · e^((r − y)T)', `(${fmt(S)} + ${fmt(U)}) · e^((${fmt(r, 4)} − ${fmt(y || 0, 4)}) × ${fmt(T, 4)})`, n4(F), 'Guardar el bien cuesta U (en valor presente): se suma al contado.']);
    } else {
      F = S * Math.exp((r + (u || 0) - (y || 0)) * T);
      pasos.push(['F₀ = S₀ · e^((r + u − y)T)', `${fmt(S)} · e^((${fmt(r, 4)} + ${fmt(u || 0, 4)} − ${fmt(y || 0, 4)}) × ${fmt(T, 4)})`, n4(F), 'El almacenamiento u encarece el forward; el rendimiento de conveniencia y lo abarata (tener el bien físico tiene un beneficio que el forward no da).']);
    }
    pasos.push([F > S ? 'Contango' : 'Backwardation', '', F > S ? 'F₀ > S₀' : 'F₀ < S₀', F > S ? 'El futuro cotiza por encima del contado.' : 'El futuro cotiza por debajo del contado: el mercado valora mucho tener el bien hoy.']);
  }
  let html = pasosHTML(pasos);

  // Valor de un forward ya pactado
  const K = leer('fw-k');
  if (!Number.isNaN(K) && K > 0) {
    const f = (F - K) * Math.exp(-r * T);
    html += `<h3>Valor de un forward pactado a ${fmt(K)}</h3>` + pasosHTML([
      ['Posición larga: f = (F₀ − K) · e^(−rT)', `(${n4(F)} − ${fmt(K)}) · e^(−${fmt(r, 4)} × ${fmt(T, 4)})`, fmtSigno(f, 4), 'Hoy podría venderse a plazo a F₀ algo que voy a comprar a K: la diferencia se cobra en T, por eso se descuenta.'],
      ['Posición corta', '', fmtSigno(-f, 4), 'Lo que gana una parte lo pierde la otra.'],
    ]);
  }

  // Arbitraje
  const Fm = leer('fw-fm');
  if (!Number.isNaN(Fm) && Fm > 0) {
    const dif = Fm - F;
    if (Math.abs(dif) < 0.005) html += '<div class="ok">El precio de mercado coincide con el teórico: no hay arbitraje.</div>';
    else {
      const caro = dif > 0;
      const eT = Math.exp(r * T);
      let filas;
      if (tipo === 'moneda') {
        filas = caro
          ? [['Pedir prestado S₀ en moneda local (por 1 unidad extranjera)', fmt(S, 4), `−${fmt(S * eT, 4)}`], [`Comprar e^(−r_f T) = ${fmt(Math.exp(-q * T), 4)} unidades extranjeras y colocarlas a r_f`, `−${fmt(S * Math.exp(-q * T), 4)}`, '1 unidad extranjera'], [`Vender a plazo 1 unidad a ${fmt(Fm, 4)}`, '0', `+${fmt(Fm, 4)}`]]
          : [['Pedir prestada 1 unidad extranjera (devolver e^(r_f T))', '', `−${fmt(Math.exp(q * T), 4)} unidades`], ['Venderla al contado y colocar a r', fmt(S, 4), `+${fmt(S * eT, 4)}`], [`Comprar a plazo ${fmt(Math.exp(q * T), 4)} unidades a ${fmt(Fm, 4)}`, '0', `−${fmt(Fm * Math.exp(q * T), 4)}`]];
      } else {
        const base = tipo === 'ingresos' ? S - I : S;
        filas = caro
          ? [[`Pedir prestado ${tipo === 'ingresos' ? 'S₀ (los ingresos pagan parte de la deuda)' : 'S₀'}`, `+${fmt(S)}`, `−${fmt(base * eT, 4)}`], ['Comprar el activo al contado', `−${fmt(S)}`, tipo === 'ingresos' ? 'activo (y los ingresos cancelan su parte del préstamo)' : 'activo'], [`Vender forward a ${fmt(Fm)}`, '0', `+${fmt(Fm)} (entregando el activo)`]]
          : [['Vender en corto el activo', `+${fmt(S)}`, tipo === 'ingresos' ? 'devolver el activo y pagar sus ingresos' : 'devolver el activo'], [`Colocar a la tasa r ${tipo === 'ingresos' ? '(lo necesario para pagar los ingresos se coloca a su plazo)' : ''}`, `−${fmt(S)}`, `+${fmt(base * eT, 4)}`], [`Comprar forward a ${fmt(Fm)}`, '0', `−${fmt(Fm)} (recibo el activo y cierro el corto)`]];
      }
      html += `<h3>El forward de mercado está ${caro ? 'caro' : 'barato'}: ${caro ? 'cash-and-carry' : 'reverse cash-and-carry'}</h3>
        <p class="ayuda">Teórico ${n4(F)} vs. mercado ${fmt(Fm, 4)}. Se vende lo caro y se compra lo barato.</p>
        ${tablaHTML([{ titulo: 'Operación' }, { titulo: 'Hoy', num: true }, { titulo: 'En T', num: true }], filas)}
        <div class="ok">Ganancia sin riesgo en T: <b>${fmt(Math.abs(dif), 4)}</b> por unidad (${fmt(Math.abs(dif) * Math.exp(-r * T), 4)} en valor presente).</div>`;
    }
  }
  $('fwd-resultado').innerHTML = html;
}

// ======================================================================
// Unidad VI · Volatilidad histórica
// ======================================================================

function herramientaVolHist() {
  const precios = listaDe('vh-precios'), per = Number($('vh-per').value);
  if (precios.length < 3 || precios.some(x => Number.isNaN(x) || x <= 0)) { $('vh-resultado').innerHTML = '<div class="alerta">Cargá al menos tres precios positivos.</div>'; return; }
  const v = Opciones.volatilidadHistorica(precios, per);
  const filas = v.u.map((u, i) => [i + 1, fmt(precios[i + 1], 4), fmt(precios[i + 1] / precios[i], 6), fmt(u, 6)]);
  $('vh-resultado').innerHTML = `<details class="desplegable"><summary>Ver los ${v.n} rendimientos</summary>${tablaHTML([{ titulo: 'i' }, { titulo: 'Precio', num: true }, { titulo: 'Sᵢ / Sᵢ₋₁', num: true }, { titulo: 'uᵢ = ln(Sᵢ / Sᵢ₋₁)', num: true }], filas, () => '', 'compacta')}</details>`
    + pasosHTML([
      ['Media de los rendimientos ū', `Σuᵢ / ${v.n}`, fmt(v.media, 6), ''],
      ['Desvío s = √[Σ(uᵢ − ū)² / (n − 1)]', '', fmt(v.s, 6), 'Volatilidad de un período (un día, una semana, un mes).'],
      ['Volatilidad anual σ = s / √τ', `${fmt(v.s, 6)} / √(1/${per})`, fmtPct(v.sigma, 2), `Se anualiza con la raíz del tiempo: τ = 1/${per} años por período${per === 252 ? '. Se usan días hábiles porque la volatilidad aparece cuando el mercado opera' : ''}.`],
      ['Error estándar ≈ σ / √(2n)', '', fmtPct(v.errorEstandar, 2), 'Con pocos datos la estimación es poco precisa: con 20 rendimientos, el error es de alrededor de un sexto de σ.'],
    ]);
}

// ======================================================================
// Inicio
// ======================================================================

alCambiar('w-margen', herramientaMargen);
alCambiar('w-cob', () => { herramientaCobertura(); herramientaCoberturaDatos(); herramientaBeta(); });
alCambiar('w-tna', herramientaTNA);
alCambiar('w-bono', herramientaBono);
alCambiar('w-fra', herramientaFRA);
alCambiar('w-fwd', herramientaForward);
alCambiar('w-vh', herramientaVolHist);
