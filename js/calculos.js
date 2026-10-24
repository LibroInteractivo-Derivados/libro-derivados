// Fórmulas financieras del libro. Este archivo no tiene nada de interfaz:
// lo usan las simulaciones y los ejemplos (y lo van a usar los ejercicios).
//
// Convención: todas las tasas van en forma decimal (5 % = 0.05) y los tiempos en años.

// ======================================================================
// P&L de estrategias con opciones al vencimiento
// ======================================================================
//
// Una "pata" es: { type: 'call' | 'put' | 'stock' | 'bond', side: 'compra' | 'venta', strike, premium, qty }
// Para acciones, `premium` es el precio de compra/venta y `strike` no se usa.
// Para bonos cupón cero, `strike` es el nominal que se cobra al vencimiento y `premium` el precio pagado.

const Payoff = (() => {
  const EPS = 1e-9;

  function sign(leg) {
    return leg.side === 'compra' ? 1 : -1;
  }

  // Resultado de una pata si al vencimiento el subyacente vale S.
  function legPnL(leg, S) {
    let value;
    if (leg.type === 'call') value = Math.max(S - leg.strike, 0) - leg.premium;
    else if (leg.type === 'put') value = Math.max(leg.strike - S, 0) - leg.premium;
    else if (leg.type === 'bond') value = leg.strike - leg.premium;
    else value = S - leg.premium;
    return sign(leg) * leg.qty * value;
  }

  function totalPnL(legs, S) {
    return legs.reduce((sum, leg) => sum + legPnL(leg, S), 0);
  }

  // Pendiente del P&L cuando S → ∞: solo los calls y las acciones siguen moviéndose.
  function finalSlope(legs) {
    return legs.reduce((s, leg) => (leg.type === 'call' || leg.type === 'stock' ? s + sign(leg) * leg.qty : s), 0);
  }

  // Precios donde la curva puede cambiar de pendiente (0 y los strikes de las opciones).
  function breakpoints(legs) {
    const strikes = legs.filter(l => l.type === 'call' || l.type === 'put').map(l => l.strike);
    return [...new Set([0, ...strikes])].filter(x => x >= 0).sort((a, b) => a - b);
  }

  // > 0: se pagó (débito). < 0: se cobró (crédito).
  function netPremium(legs) {
    return legs.reduce((s, leg) => s + sign(leg) * leg.qty * leg.premium, 0);
  }

  // Como el P&L al vencimiento es lineal por tramos, alcanza con evaluarlo en los
  // breakpoints y mirar la pendiente final para obtener máximos y break-evens exactos.
  function analyze(legs) {
    const pts = breakpoints(legs);
    const vals = pts.map(S => totalPnL(legs, S));
    const slope = finalSlope(legs);

    let maxProfit = Math.max(...vals);
    let maxLoss = Math.min(...vals);
    if (slope > EPS) maxProfit = Infinity;
    if (slope < -EPS) maxLoss = -Infinity;

    const be = [];
    for (let i = 0; i < pts.length; i++) {
      if (Math.abs(vals[i]) < EPS && pts[i] > 0) be.push(pts[i]);
      if (i < pts.length - 1) {
        const a = pts[i], b = pts[i + 1], va = vals[i], vb = vals[i + 1];
        if (va * vb < 0) be.push(a - (va * (b - a)) / (vb - va));
      }
    }
    const last = pts[pts.length - 1];
    const vLast = vals[vals.length - 1];
    if (vLast * slope < 0) be.push(last - vLast / slope);

    // Se redondea solo para eliminar duplicados numéricos; la presentación decide los decimales.
    const breakevens = [...new Set(be.map(x => Math.round(x * 1e8) / 1e8))].sort((a, b) => a - b);

    return { maxProfit, maxLoss, breakevens, netPremium: netPremium(legs) };
  }

  // Valor teórico de una pata ANTES del vencimiento (Black-Scholes), con `tau` años por delante.
  // Para la acción es S; para el bono, el nominal descontado; para las opciones, Black-Scholes.
  function legValue(leg, S, tau, { r, sigma, q = 0 }) {
    if (leg.type === 'stock') return S;
    if (leg.type === 'bond') return leg.strike * Math.exp(-r * Math.max(tau, 0));
    if (tau <= 1e-9) return leg.type === 'call' ? Math.max(S - leg.strike, 0) : Math.max(leg.strike - S, 0);
    const b = Opciones.blackScholes({ S, K: leg.strike, r, sigma, T: tau, q });
    return leg.type === 'call' ? b.call : b.put;
  }

  // Resultado "a mercado" de una pata si hoy el subyacente vale S y faltan `tau` años
  // (cuánto se ganaría cerrando la posición ahora, sin contar intereses sobre la prima).
  function legMarkPnL(leg, S, tau, mercado) {
    return sign(leg) * leg.qty * (legValue(leg, S, tau, mercado) - leg.premium);
  }

  function totalMarkPnL(legs, S, tau, mercado) {
    return legs.reduce((s, leg) => s + legMarkPnL(leg, S, tau, mercado), 0);
  }

  // Griegas de la posición completa (suma de las griegas de cada pata con su signo y cantidad).
  // Theta por día calendario; vega por 1 punto porcentual de volatilidad.
  function greeks(legs, S, tau, { r, sigma, q = 0 }) {
    const g = { delta: 0, gamma: 0, theta: 0, vega: 0 };
    legs.forEach(leg => {
      const k = sign(leg) * leg.qty;
      if (leg.type === 'stock') { g.delta += k; return; }
      if (leg.type === 'bond') { g.theta += (k * r * leg.strike * Math.exp(-r * tau)) / 365; return; }
      if (tau <= 1e-9) {
        if (leg.type === 'call') g.delta += k * (S > leg.strike ? 1 : 0);
        else g.delta += k * (S < leg.strike ? -1 : 0);
        return;
      }
      const x = Opciones.griegas({ S, K: leg.strike, r, sigma, T: tau, q });
      if (!x) return;
      const esCall = leg.type === 'call';
      g.delta += k * (esCall ? x.deltaCall : x.deltaPut);
      g.gamma += k * x.gamma;
      g.theta += (k * (esCall ? x.thetaCall : x.thetaPut)) / 365;
      g.vega += (k * x.vega) / 100;
    });
    return g;
  }

  return { legPnL, totalPnL, analyze, breakpoints, legValue, legMarkPnL, totalMarkPnL, greeks, netPremium };
})();

// ======================================================================
// Valuación de opciones (Unidades V y VI)
// ======================================================================

const Opciones = (() => {
  // Función de distribución normal estándar acumulada N(x).
  // Aproximación de Abramowitz y Stegun (26.2.17), error < 7.5e-8.
  function normal(x) {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const dens = 0.3989422804014327 * Math.exp((-x * x) / 2);
    const cola = dens * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    return x >= 0 ? 1 - cola : cola;
  }

  // Densidad de la normal estándar φ(x).
  function densidad(x) {
    return 0.3989422804014327 * Math.exp((-x * x) / 2);
  }

  // Inversa de N(x): el x tal que N(x) = prob (por bisección).
  function normalInversa(prob) {
    if (prob <= 0 || prob >= 1) return NaN;
    let lo = -10, hi = 10;
    for (let i = 0; i < 100; i++) {
      const mid = (lo + hi) / 2;
      if (normal(mid) < prob) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  }

  // Griegas de Black-Scholes-Merton (q = rendimiento por dividendos continuo).
  // Theta por año; vega y rho por 1,00 de cambio (100 %) en σ y en r.
  function griegas({ S, K, r, sigma, T, q = 0 }) {
    const b = blackScholes({ S, K, r, sigma, T, q });
    if (!(T > 0 && sigma > 0)) return null;
    const raizT = Math.sqrt(T), fi = densidad(b.d1), eq = Math.exp(-q * T), er = Math.exp(-r * T);
    const comun = (-S * fi * sigma * eq) / (2 * raizT);
    return {
      ...b,
      deltaCall: eq * b.Nd1,
      deltaPut: eq * (b.Nd1 - 1),
      gamma: (eq * fi) / (S * sigma * raizT),
      vega: S * eq * fi * raizT,
      thetaCall: comun - r * K * er * b.Nd2 + q * S * eq * b.Nd1,
      thetaPut: comun + r * K * er * normal(-b.d2) - q * S * eq * normal(-b.d1),
      rhoCall: K * T * er * b.Nd2,
      rhoPut: -K * T * er * normal(-b.d2),
    };
  }

  function pagoAlVencimiento(tipo, S, K) {
    return tipo === 'call' ? Math.max(S - K, 0) : Math.max(K - S, 0);
  }

  // Black-Scholes-Merton para opciones europeas. q = rendimiento por dividendos (continuo).
  function blackScholes({ S, K, r, sigma, T, q = 0 }) {
    if (T <= 0 || sigma <= 0) {
      const t = Math.max(T, 0);
      const Sq = S * Math.exp(-q * t);
      const Kr = K * Math.exp(-r * t);
      const itm = Sq > Kr ? 1 : 0;
      return { d1: NaN, d2: NaN, Nd1: itm, Nd2: itm, call: Math.max(Sq - Kr, 0), put: Math.max(Kr - Sq, 0) };
    }
    const raiz = sigma * Math.sqrt(T);
    const d1 = (Math.log(S / K) + (r - q + (sigma * sigma) / 2) * T) / raiz;
    const d2 = d1 - raiz;
    const Sq = S * Math.exp(-q * T);
    const Kr = K * Math.exp(-r * T);
    return {
      d1,
      d2,
      Nd1: normal(d1),
      Nd2: normal(d2),
      call: Sq * normal(d1) - Kr * normal(d2),
      put: Kr * normal(-d2) - Sq * normal(-d1),
    };
  }

  // Volatilidad implícita por bisección: la σ que hace que Black-Scholes iguale al precio de mercado.
  function volatilidadImplicita({ precio, tipo, S, K, r, T, q = 0 }) {
    const f = sigma => blackScholes({ S, K, r, sigma, T, q })[tipo] - precio;
    let lo = 1e-4, hi = 5;
    if (f(lo) > 0 || f(hi) < 0) return NaN;
    for (let i = 0; i < 100; i++) {
      const mid = (lo + hi) / 2;
      if (f(mid) > 0) hi = mid;
      else lo = mid;
    }
    return (lo + hi) / 2;
  }

  // Modelo binomial de un período con portafolio replicante (Δ acciones + B en caución).
  function replicanteUnPaso({ S0, Su, Sd, K, r, T, tipo = 'call' }) {
    const Vu = pagoAlVencimiento(tipo, Su, K);
    const Vd = pagoAlVencimiento(tipo, Sd, K);
    const delta = (Vu - Vd) / (Su - Sd);
    const B = (Vu - delta * Su) * Math.exp(-r * T);
    const u = Su / S0, d = Sd / S0, crec = Math.exp(r * T);
    const p = (crec - d) / (u - d);
    return {
      Vu, Vd, delta, B, u, d, p,
      precio: delta * S0 + B,
      precioNeutral: Math.exp(-r * T) * (p * Vu + (1 - p) * Vd),
      hayArbitraje: !(d < crec && crec < u),
    };
  }

  // Árbol binomial de Cox-Ross-Rubinstein: u = e^(σ√Δt), d = 1/u.
  // Con guardarArbol = true devuelve todos los nodos (para dibujarlos).
  function binomial({ S, K, r, sigma, T, n, tipo = 'call', americana = false, q = 0, guardarArbol = false }) {
    const dt = T / n;
    const u = Math.exp(sigma * Math.sqrt(dt));
    const d = 1 / u;
    const p = (Math.exp((r - q) * dt) - d) / (u - d);
    const desc = Math.exp(-r * dt);
    const precioNodo = (i, j) => S * Math.pow(u, j) * Math.pow(d, i - j); // j = cantidad de subas

    const arbol = guardarArbol ? [] : null;
    let valores = [];
    for (let j = 0; j <= n; j++) valores.push(pagoAlVencimiento(tipo, precioNodo(n, j), K));
    if (guardarArbol) arbol[n] = valores.map((V, j) => ({ S: precioNodo(n, j), V, anticipado: false }));

    let delta = NaN;
    for (let i = n - 1; i >= 0; i--) {
      if (i === 0) delta = (valores[1] - valores[0]) / (precioNodo(1, 1) - precioNodo(1, 0));
      const nuevos = [];
      for (let j = 0; j <= i; j++) {
        const continuar = desc * (p * valores[j + 1] + (1 - p) * valores[j]);
        const ejercer = pagoAlVencimiento(tipo, precioNodo(i, j), K);
        const anticipado = americana && ejercer > continuar + 1e-12;
        nuevos.push(anticipado ? ejercer : continuar);
        if (guardarArbol) (arbol[i] = arbol[i] || [])[j] = { S: precioNodo(i, j), V: nuevos[j], anticipado };
      }
      valores = nuevos;
    }

    return { precio: valores[0], u, d, p, dt, delta, arbol };
  }

  // Paridad put-call para europeas: c + K e^(-rT) = p + S0.
  function paridad({ S, K, r, T, call, put }) {
    const vpK = K * Math.exp(-r * T);
    return { vpK, carteraA: call + vpK, carteraC: put + S, diferencia: call + vpK - (put + S) };
  }

  // Modelo de Black (1976) para opciones europeas sobre futuros: F = precio futuro.
  // Equivale a Black-Scholes-Merton con S = F y q = r.
  function black76({ F, K, r, sigma, T }) {
    const b = blackScholes({ S: F, K, r, sigma, T, q: r });
    return { ...b, F };
  }

  // Probabilidad (en el mundo real, con rendimiento esperado mu) de que S_T > K: N(d2) con mu en lugar de r.
  function probabilidadEjercicio({ S, K, mu, sigma, T, q = 0 }) {
    const d2 = (Math.log(S / K) + (mu - q - (sigma * sigma) / 2) * T) / (sigma * Math.sqrt(T));
    return { d2, call: normal(d2), put: normal(-d2) };
  }

  // Distribución lognormal: media y desvío de ln(S_T), y valor esperado de S_T.
  function lognormal({ S, mu, sigma, T }) {
    const m = Math.log(S) + (mu - (sigma * sigma) / 2) * T;
    const s = sigma * Math.sqrt(T);
    return { media: m, desvio: s, esperado: S * Math.exp(mu * T), varianza: S * S * Math.exp(2 * mu * T) * (Math.exp(sigma * sigma * T) - 1) };
  }

  // Volatilidad histórica a partir de una serie de precios (Hull 15.4).
  // periodosPorAnio: 252 si son precios diarios hábiles, 52 si son semanales, 12 si son mensuales.
  function volatilidadHistorica(precios, periodosPorAnio = 252) {
    const u = [];
    for (let i = 1; i < precios.length; i++) u.push(Math.log(precios[i] / precios[i - 1]));
    const n = u.length;
    if (n < 2) return null;
    const media = u.reduce((a, b) => a + b, 0) / n;
    const s = Math.sqrt(u.reduce((a, x) => a + (x - media) * (x - media), 0) / (n - 1));
    const tau = 1 / periodosPorAnio;
    const sigma = s / Math.sqrt(tau);
    return { u, n, media, s, tau, sigma, errorEstandar: sigma / Math.sqrt(2 * n) };
  }

  // Precios de Arrow-Debreu (precios de estado) al vencimiento de un árbol de n pasos:
  // lo que vale hoy un título que paga $1 solo si se llega al nodo j (j subas).
  function preciosArrowDebreu({ r, T, n, p, q = 0 }) {
    const desc = Math.exp(-r * T);
    const comb = (a, b) => { let c = 1; for (let i = 1; i <= b; i++) c = (c * (a - b + i)) / i; return c; };
    return Array.from({ length: n + 1 }, (_, j) => ({ j, caminos: comb(n, j), prob: comb(n, j) * Math.pow(p, j) * Math.pow(1 - p, n - j), precio: desc * comb(n, j) * Math.pow(p, j) * Math.pow(1 - p, n - j) }));
  }

  // Número aleatorio normal estándar (Box-Muller), para simular trayectorias.
  function aleatorioNormal(rng = Math.random) {
    let u = 0, v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  return {
    normal, densidad, normalInversa, griegas, pagoAlVencimiento, blackScholes, volatilidadImplicita, replicanteUnPaso, binomial, paridad,
    black76, probabilidadEjercicio, lognormal, volatilidadHistorica, preciosArrowDebreu, aleatorioNormal,
  };
})();

// ======================================================================
// Swaps (Unidad IV)
// ======================================================================

const Swaps = (() => {
  // Flujos de un swap de tasa plain vanilla. Cada tasa variable se fija al inicio
  // del período y se paga al final.
  function flujos({ nocional, tasaFija, m, tasasVariables }) {
    const pagoFijo = (nocional * tasaFija) / m;
    return tasasVariables.map((tasa, i) => {
      const pagoVariable = (nocional * tasa) / m;
      return { periodo: i + 1, tasaVariable: tasa, pagoVariable, pagoFijo, netoPagadorFijo: pagoVariable - pagoFijo };
    });
  }

  // Ventaja comparativa. X quiere endeudarse a tasa variable e Y a tasa fija.
  // fijo = tasa fija que le ofrecen; spread = margen sobre la tasa variable (variable + spread).
  // La ganancia que queda después del margen del intermediario se reparte en partes iguales.
  function ventajaComparativa({ fijoX, spreadX, fijoY, spreadY, margen = 0 }) {
    const a = fijoY - fijoX;   // diferencia en el mercado de tasa fija
    const b = spreadY - spreadX; // diferencia en el mercado de tasa variable
    const total = a - b;
    if (total <= margen + 1e-12) return { a, b, total, conviene: false };
    const ganancia = (total - margen) / 2;
    return {
      a, b, total, conviene: true, ganancia, margen,
      tasaRecibeX: fijoX - spreadX + ganancia, // fija que X recibe en el swap
      tasaPagaY: fijoY - ganancia - spreadY,   // fija que Y paga en el swap
      spreadFinalX: spreadX - ganancia,         // X termina pagando variable + esto
      fijoFinalY: fijoY - ganancia,             // Y termina pagando esta tasa fija
    };
  }

  // Fechas de pago: el próximo dentro de `proximo` años y luego cada 1/m años.
  function fechasDePago({ proximo, cantidad, m }) {
    return Array.from({ length: cantidad }, (_, i) => proximo + i / m);
  }

  // Valuación como diferencia de bonos. tasasCero en composición continua, una por fecha.
  // tasaVariableFijada: la tasa variable ya fijada para el próximo pago (compuesta m veces al año).
  function valuarPorBonos({ nocional, tasaFija, m, tiempos, tasasCero, tasaVariableFijada }) {
    const k = (nocional * tasaFija) / m;
    const kVar = (nocional * tasaVariableFijada) / m;
    const filas = tiempos.map((t, i) => {
      const fd = Math.exp(-tasasCero[i] * t);
      const flujo = k + (i === tiempos.length - 1 ? nocional : 0);
      return { t, tasa: tasasCero[i], fd, flujo, vp: flujo * fd };
    });
    const Bfix = filas.reduce((s, f) => s + f.vp, 0);
    const Bfl = (nocional + kVar) * Math.exp(-tasasCero[0] * tiempos[0]);
    return { k, kVar, filas, Bfix, Bfl, valorRecibeFijo: Bfix - Bfl };
  }

  // Valuación como cartera de FRAs: se supone que cada tasa variable futura será igual a la forward.
  function valuarPorFRAs({ nocional, tasaFija, m, tiempos, tasasCero, tasaVariableFijada }) {
    const filas = tiempos.map((t, i) => {
      const fd = Math.exp(-tasasCero[i] * t);
      let forwardContinua = null;
      let tasaVariable = tasaVariableFijada;
      if (i > 0) {
        const t0 = tiempos[i - 1], r0 = tasasCero[i - 1];
        forwardContinua = (tasasCero[i] * t - r0 * t0) / (t - t0);
        tasaVariable = m * (Math.exp(forwardContinua / m) - 1);
      }
      const flujo = (nocional / m) * (tasaFija - tasaVariable);
      return { t, fd, forwardContinua, tasaVariable, flujo, vp: flujo * fd };
    });
    return { filas, valorRecibeFijo: filas.reduce((s, f) => s + f.vp, 0) };
  }

  // Conversión de una tasa continua a una compuesta m veces por año (y al revés).
  const continuaACompuesta = (rc, m) => m * (Math.exp(rc / m) - 1);
  const compuestaAContinua = (rm, m) => m * Math.log(1 + rm / m);

  // Swap de monedas con cupones anuales. spot = unidades de moneda doméstica por unidad extranjera.
  // Devuelve el valor para quien recibe la moneda doméstica y paga la extranjera, por los dos métodos.
  function valuarSwapMonedas({ principalDom, tasaDom, principalExt, tasaExt, spot, rDom, rExt, tiempos }) {
    const filas = tiempos.map((t, i) => {
      const ultimo = i === tiempos.length - 1;
      const flujoDom = principalDom * tasaDom + (ultimo ? principalDom : 0);
      const flujoExt = principalExt * tasaExt + (ultimo ? principalExt : 0);
      const fdDom = Math.exp(-rDom * t);
      const fdExt = Math.exp(-rExt * t);
      const forward = spot * Math.exp((rDom - rExt) * t);
      return { t, flujoDom, flujoExt, fdDom, fdExt, forward, valorForward: (flujoDom - flujoExt * forward) * fdDom };
    });
    const BD = filas.reduce((s, f) => s + f.flujoDom * f.fdDom, 0);
    const BF = filas.reduce((s, f) => s + f.flujoExt * f.fdExt, 0);
    return {
      filas, BD, BF,
      valorBonos: BD - spot * BF,
      valorForwards: filas.reduce((s, f) => s + f.valorForward, 0),
    };
  }

  return { flujos, ventajaComparativa, fechasDePago, valuarPorBonos, valuarPorFRAs, continuaACompuesta, compuestaAContinua, valuarSwapMonedas };
})();

// ======================================================================
// Tasas de interés (Unidad III)
// ======================================================================

const Tasas = (() => {
  // m = 0 significa composición continua.
  const aContinua = (R, m) => (m === 0 ? R : m * Math.log(1 + R / m));
  const desdeContinua = (Rc, m) => (m === 0 ? Rc : m * (Math.exp(Rc / m) - 1));
  const factorDescuento = (R, T, m = 0) => Math.exp(-aContinua(R, m) * T);

  // Tasa forward continua entre T1 y T2 a partir de tasas cero continuas.
  const forward = (R1, T1, R2, T2) => (R2 * T2 - R1 * T1) / (T2 - T1);

  // Flujos de un bono: cupón anual c (decimal) pagado m veces por año, plazo T en años.
  function flujosBono({ nominal = 100, cupon, m = 2, T }) {
    const n = Math.round(T * m);
    const primer = T - (n - 1) / m; // por si el primer cupón no está a un período completo
    return Array.from({ length: n }, (_, i) => {
      const t = primer + i / m;
      return { t, flujo: (nominal * cupon) / m + (i === n - 1 ? nominal : 0) };
    });
  }

  // Precio con una curva de tasas cero continuas: curva(t) → tasa.
  function precioConCurva(flujos, curva) {
    return flujos.reduce((s, f) => s + f.flujo * Math.exp(-curva(f.t) * f.t), 0);
  }

  // Precio con un único rendimiento continuo y.
  const precioConRendimiento = (flujos, y) => flujos.reduce((s, f) => s + f.flujo * Math.exp(-y * f.t), 0);

  // Rendimiento (yield) continuo que iguala el precio, por bisección.
  function rendimiento(flujos, precio) {
    let lo = -0.5, hi = 2;
    for (let i = 0; i < 200; i++) {
      const mid = (lo + hi) / 2;
      if (precioConRendimiento(flujos, mid) > precio) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }

  // Duración (Macaulay, con rendimiento continuo) y convexidad.
  function duracion(flujos, y) {
    const B = precioConRendimiento(flujos, y);
    const D = flujos.reduce((s, f) => s + f.t * f.flujo * Math.exp(-y * f.t), 0) / B;
    const C = flujos.reduce((s, f) => s + f.t * f.t * f.flujo * Math.exp(-y * f.t), 0) / B;
    return { B, D, C };
  }

  // Bootstrap: bonos ordenados por plazo [{ T, cupon, m, precio, nominal }] → tasas cero continuas.
  // Supone que los cupones de cada bono caen en plazos ya calculados (como en Hull, tabla 4.3/5.2).
  function bootstrap(bonos) {
    const ceros = []; // [{ t, r }]
    const interp = t => {
      const exacto = ceros.find(c => Math.abs(c.t - t) < 1e-9);
      if (exacto) return exacto.r;
      // interpolación lineal entre los puntos conocidos
      const ord = [...ceros].sort((a, b) => a.t - b.t);
      for (let i = 0; i < ord.length - 1; i++) if (t > ord[i].t && t < ord[i + 1].t) {
        return ord[i].r + ((t - ord[i].t) * (ord[i + 1].r - ord[i].r)) / (ord[i + 1].t - ord[i].t);
      }
      return ord.length ? ord[ord.length - 1].r : 0;
    };
    bonos.forEach(b => {
      const nominal = b.nominal || 100;
      const fl = b.cupon > 0 ? flujosBono({ nominal, cupon: b.cupon, m: b.m, T: b.T }) : [{ t: b.T, flujo: nominal }];
      const ultimo = fl[fl.length - 1];
      const vpCupones = fl.slice(0, -1).reduce((s, f) => s + f.flujo * Math.exp(-interp(f.t) * f.t), 0);
      const r = -Math.log((b.precio - vpCupones) / ultimo.flujo) / ultimo.t;
      ceros.push({ t: b.T, r, vpCupones, ultimo: ultimo.flujo });
    });
    return ceros;
  }

  // Valor de un FRA para quien recibe la tasa fija R_K sobre L entre T1 y T2,
  // con R_F la tasa forward (misma composición que R_K) y R2 la tasa cero continua a T2.
  const valorFRA = ({ L, RK, RF, T1, T2, R2 }) => L * (RK - RF) * (T2 - T1) * Math.exp(-R2 * T2);

  return { aContinua, desdeContinua, factorDescuento, forward, flujosBono, precioConCurva, precioConRendimiento, rendimiento, duracion, bootstrap, valorFRA };
})();

// ======================================================================
// Forwards y futuros (Unidades I, II y III)
// ======================================================================

const Futuros = (() => {
  // Precio forward por costo de tenencia (cost of carry):
  //   F0 = (S0 − I + U) · e^{(r − q + u − y)·T}
  // I = valor presente de ingresos conocidos (dividendos, cupones); q = rendimiento continuo
  // (dividendos de un índice, tasa extranjera en monedas); U = VP de costos de almacenamiento;
  // u = costo de almacenamiento proporcional; y = rendimiento de conveniencia.
  function precioForward({ S, r, T, I = 0, q = 0, U = 0, u = 0, y = 0 }) {
    return (S - I + U) * Math.exp((r - q + u - y) * T);
  }

  // Valor hoy de un forward pactado a K, si el forward para la misma fecha hoy vale F.
  // Posición larga: (F − K)·e^{−rT}. Posición corta: el opuesto.
  const valorForward = ({ F, K, r, T, larga = true }) => (larga ? 1 : -1) * (F - K) * Math.exp(-r * T);

  // Valor presente de dividendos discretos [{ monto, t }].
  const vpIngresos = (ingresos, r) => ingresos.reduce((s, d) => s + d.monto * Math.exp(-r * d.t), 0);

  // Detecta arbitraje entre un precio forward de mercado y el teórico.
  function arbitraje({ S, r, T, Fmercado, I = 0, q = 0 }) {
    const teorico = precioForward({ S, r, T, I, q });
    const dif = Fmercado - teorico;
    let estrategia = 'ninguna';
    if (dif > 1e-9) estrategia = 'cash-and-carry';   // forward caro: compro contado, vendo forward
    if (dif < -1e-9) estrategia = 'reverse';         // forward barato: vendo en corto contado, compro forward
    return { teorico, dif, estrategia, gananciaEnT: Math.abs(dif), gananciaHoy: Math.abs(dif) * Math.exp(-r * T) };
  }

  // Cuenta de márgenes con ajuste diario (mark-to-market).
  // precios: precios de ajuste de cada día (el primero es el precio pactado al abrir).
  function cuentaMargen({ precios, contratos, tamano, margenInicial, margenMantenimiento, larga = true }) {
    const signo = larga ? 1 : -1;
    const filas = [];
    let saldo = margenInicial * contratos;
    let acumulada = 0;
    const mi = margenInicial * contratos, mm = margenMantenimiento * contratos;
    for (let i = 1; i < precios.length; i++) {
      const diaria = signo * (precios[i] - precios[i - 1]) * tamano * contratos;
      acumulada += diaria;
      const antes = saldo + diaria;
      let llamado = 0;
      if (antes < mm) llamado = mi - antes; // se repone hasta el margen inicial
      saldo = antes + llamado;
      filas.push({ dia: i, precio: precios[i], diaria, acumulada, saldoAntes: antes, llamado, saldo });
    }
    return { filas, mi, mm, totalLlamados: filas.reduce((s, f) => s + f.llamado, 0) };
  }

  return { precioForward, valorForward, vpIngresos, arbitraje, cuentaMargen };
})();

// ======================================================================
// Cobertura con futuros (Unidad II)
// ======================================================================

const Cobertura = (() => {
  const media = xs => xs.reduce((a, b) => a + b, 0) / xs.length;
  const desvio = xs => { const m = media(xs); return Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1)); };

  // Ratio de cobertura de mínima varianza: h* = ρ·σS/σF.
  const ratioMinimaVarianza = ({ rho, sigmaS, sigmaF }) => (rho * sigmaS) / sigmaF;

  // Estimación a partir de datos de cambios de precio ΔS y ΔF (Hull, tabla 3.3).
  function desdeDatos(dS, dF) {
    const n = Math.min(dS.length, dF.length);
    const a = dS.slice(0, n), b = dF.slice(0, n);
    const mS = media(a), mF = media(b), sS = desvio(a), sF = desvio(b);
    const cov = a.reduce((s, x, i) => s + (x - mS) * (b[i] - mF), 0) / (n - 1);
    const rho = cov / (sS * sF);
    return { n, sigmaS: sS, sigmaF: sF, cov, rho, h: rho * sS / sF, efectividad: rho * rho };
  }

  // Número óptimo de contratos: N* = h*·QA/QF (sin ajuste) o h*·VA/VF (con ajuste por liquidación diaria, "tailing").
  const contratos = ({ h, QA, QF }) => (h * QA) / QF;
  const contratosTailing = ({ h, VA, VF }) => (h * VA) / VF;

  // Cobertura de una cartera de acciones con futuros sobre índice: N* = β·VA/VF, VF = F·multiplicador.
  const contratosBeta = ({ beta, VA, VF }) => (beta * VA) / VF;
  // Cambiar la beta de la cartera de β a β*: N = (β − β*)·VA/VF contratos a VENDER (si es negativo, comprar).
  const cambiarBeta = ({ beta, betaObjetivo, VA, VF }) => ((beta - betaObjetivo) * VA) / VF;

  // Precio efectivo obtenido con una cobertura que se cierra antes del vencimiento:
  // S2 + (F1 − F2) = F1 + b2, con b2 = S2 − F2 la base al cerrar.
  const precioEfectivo = ({ F1, S2, F2 }) => ({ base: S2 - F2, precio: S2 + F1 - F2 });

  return { media, desvio, ratioMinimaVarianza, desdeDatos, contratos, contratosTailing, contratosBeta, cambiarBeta, precioEfectivo };
})();
