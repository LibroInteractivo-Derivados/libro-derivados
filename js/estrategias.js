// Estrategias predefinidas del simulador (Unidad VIII).
// Están armadas para un subyacente que vale 100; `construirEstrategia` las
// reescala al precio actual que se ingrese en el simulador.

// Primas de referencia para un subyacente de 100, calculadas con Black-Scholes
// (r = 5 %, σ = 25 %, T = 3 meses). Por eso cumplen la paridad put-call y el box spread
// rinde exactamente la tasa libre de riesgo.
// Si las cambiás, actualizá también los ejemplos de u8-teoria.html.
const PRIMAS_REF = {
  call: { 90: 12.21, 95: 8.53, 100: 5.6, 105: 3.44, 110: 1.98 },
  put:  { 90: 1.09,  95: 2.35, 100: 4.36, 105: 7.14, 110: 10.61 },
};

// Cada estrategia: id (se usa en los enlaces ?estrategia=...), grupo (para el menú),
// nombre, vista (expectativa), resumen y patas. Una pata puede traer `prima` propia;
// si no, se toma de PRIMAS_REF. Para el bono, `strike` es el nominal.
const ESTRATEGIAS = [
  // ---------- Posiciones simples ----------
  {
    id: 'long-call', grupo: 'Posiciones simples', nombre: 'Long call', vista: 'Alcista',
    resumen: 'Comprás el derecho a comprar el subyacente al strike. Pérdida limitada a la prima; ganancia ilimitada si el precio sube.',
    patas: [{ type: 'call', side: 'compra', strike: 100, qty: 1 }],
  },
  {
    id: 'short-call', grupo: 'Posiciones simples', nombre: 'Short call', vista: 'Neutral / bajista',
    resumen: 'Vendés un call y cobrás la prima. Ganancia limitada a la prima; pérdida ilimitada si el precio sube.',
    patas: [{ type: 'call', side: 'venta', strike: 100, qty: 1 }],
  },
  {
    id: 'long-put', grupo: 'Posiciones simples', nombre: 'Long put', vista: 'Bajista',
    resumen: 'Comprás el derecho a vender el subyacente al strike. Pérdida limitada a la prima; ganás si el precio baja.',
    patas: [{ type: 'put', side: 'compra', strike: 100, qty: 1 }],
  },
  {
    id: 'short-put', grupo: 'Posiciones simples', nombre: 'Short put', vista: 'Neutral / alcista',
    resumen: 'Vendés un put y cobrás la prima. Ganancia limitada a la prima; perdés si el precio cae fuerte.',
    patas: [{ type: 'put', side: 'venta', strike: 100, qty: 1 }],
  },

  // ---------- Garantizar el capital ----------
  {
    id: 'ppn', grupo: 'Garantizar el capital', nombre: 'Principal-protected note', vista: 'Capital garantizado',
    dias: 1080, inicial: { r: 0.06 },
    resumen: 'Bono cupón cero a 3 años (6 %) que devuelve 100, más un call de 3 años comprado con el remanente. En el peor caso se recupera el capital; el call aporta solo upside.',
    patas: [
      { type: 'bond', side: 'compra', strike: 100, prima: 83.53, qty: 1 },
      { type: 'call', side: 'compra', strike: 113, prima: 16.36, qty: 1 },
    ],
  },

  // ---------- Estrategias cubiertas ----------
  {
    id: 'covered-call', grupo: 'Estrategias cubiertas', nombre: 'Covered call', vista: 'Equivale a short put',
    resumen: 'Long acción + short call. Vendés la suba por encima de K: limitás la ganancia y reducís la pérdida con la prima cobrada.',
    patas: [
      { type: 'stock', side: 'compra', strike: 100, qty: 1 },
      { type: 'call', side: 'venta', strike: 105, qty: 1 },
    ],
  },
  {
    id: 'reverse-covered-call', grupo: 'Estrategias cubiertas', nombre: 'Reverse covered call', vista: 'Equivale a long put',
    resumen: 'Short acción + long call. Seguís bajista, pero limitás la pérdida si el precio supera K.',
    patas: [
      { type: 'stock', side: 'venta', strike: 100, qty: 1 },
      { type: 'call', side: 'compra', strike: 105, qty: 1 },
    ],
  },
  {
    id: 'protective-put', grupo: 'Estrategias cubiertas', nombre: 'Protective put', vista: 'Equivale a long call',
    resumen: 'Long acción + long put. Seguís alcista, pero limitás la pérdida si el precio cae por debajo de K.',
    patas: [
      { type: 'stock', side: 'compra', strike: 100, qty: 1 },
      { type: 'put', side: 'compra', strike: 95, qty: 1 },
    ],
  },
  {
    id: 'reverse-protective-put', grupo: 'Estrategias cubiertas', nombre: 'Reverse protective put', vista: 'Equivale a short call',
    resumen: 'Short acción + short put. Vendés la caída por debajo de K: limitás la ganancia y reducís la pérdida con la prima cobrada.',
    patas: [
      { type: 'stock', side: 'venta', strike: 100, qty: 1 },
      { type: 'put', side: 'venta', strike: 95, qty: 1 },
    ],
  },
  {
    id: 'collar', grupo: 'Estrategias cubiertas', nombre: 'Collar', vista: 'Cobertura con costo reducido',
    resumen: 'Protective put financiado con un covered call: long acción + long put K1 + short call K2. Acota pérdidas y ganancias.',
    patas: [
      { type: 'stock', side: 'compra', strike: 100, qty: 1 },
      { type: 'put', side: 'compra', strike: 95, qty: 1 },
      { type: 'call', side: 'venta', strike: 105, qty: 1 },
    ],
  },

  // ---------- Dirección: spreads verticales ----------
  {
    id: 'bull-call-spread', grupo: 'Dirección: spreads verticales', nombre: 'Bull call spread', vista: 'Alcista moderada · net debit',
    resumen: 'Long call K1 + short call K2. Pagás neto; el call vendido abarata la compra a cambio de poner un techo a la ganancia.',
    patas: [
      { type: 'call', side: 'compra', strike: 95, qty: 1 },
      { type: 'call', side: 'venta', strike: 105, qty: 1 },
    ],
  },
  {
    id: 'bull-put-spread', grupo: 'Dirección: spreads verticales', nombre: 'Bull put spread', vista: 'Alcista moderada · net credit',
    resumen: 'Long put K1 + short put K2. Cobrás neto; si el precio termina por encima de K2 te quedás con todo el crédito.',
    patas: [
      { type: 'put', side: 'compra', strike: 95, qty: 1 },
      { type: 'put', side: 'venta', strike: 105, qty: 1 },
    ],
  },
  {
    id: 'bear-put-spread', grupo: 'Dirección: spreads verticales', nombre: 'Bear put spread', vista: 'Bajista moderada · net debit',
    resumen: 'Long put K2 + short put K1. Pagás neto; el put vendido abarata la protección a cambio de limitar la ganancia.',
    patas: [
      { type: 'put', side: 'venta', strike: 95, qty: 1 },
      { type: 'put', side: 'compra', strike: 105, qty: 1 },
    ],
  },
  {
    id: 'bear-call-spread', grupo: 'Dirección: spreads verticales', nombre: 'Bear call spread', vista: 'Bajista moderada · net credit',
    resumen: 'Short call K1 + long call K2. Cobrás neto; si el precio termina por debajo de K1 te quedás con todo el crédito.',
    patas: [
      { type: 'call', side: 'venta', strike: 95, qty: 1 },
      { type: 'call', side: 'compra', strike: 105, qty: 1 },
    ],
  },

  // ---------- Arbitraje ----------
  {
    id: 'box-spread', grupo: 'Arbitraje', nombre: 'Box spread', vista: 'Tasa sintética',
    resumen: 'Bull call spread + bear put spread con los mismos strikes. El payoff es siempre K2 − K1, así que tiene que valer (K2 − K1)·e^(−rT): rinde la tasa libre de riesgo.',
    patas: [
      { type: 'call', side: 'compra', strike: 95, qty: 1 },
      { type: 'call', side: 'venta', strike: 105, qty: 1 },
      { type: 'put', side: 'compra', strike: 105, qty: 1 },
      { type: 'put', side: 'venta', strike: 95, qty: 1 },
    ],
  },

  // ---------- NO volatilidad ----------
  {
    id: 'call-butterfly', grupo: 'NO volatilidad (precio quieto)', nombre: 'Call butterfly', vista: 'Sin volatilidad · net debit',
    resumen: 'Long call K1 + long call K3 + short 2 calls K2. Gana si el precio queda cerca de K2; ganancia y pérdida limitadas.',
    patas: [
      { type: 'call', side: 'compra', strike: 95, qty: 1 },
      { type: 'call', side: 'venta', strike: 100, qty: 2 },
      { type: 'call', side: 'compra', strike: 105, qty: 1 },
    ],
  },
  {
    id: 'put-butterfly', grupo: 'NO volatilidad (precio quieto)', nombre: 'Put butterfly', vista: 'Sin volatilidad · net debit',
    resumen: 'Igual que la call butterfly pero con puts: long put K1 + long put K3 + short 2 puts K2. Con strikes equidistantes, por la paridad put-call cuesta lo mismo.',
    patas: [
      { type: 'put', side: 'compra', strike: 95, qty: 1 },
      { type: 'put', side: 'venta', strike: 100, qty: 2 },
      { type: 'put', side: 'compra', strike: 105, qty: 1 },
    ],
  },
  {
    id: 'top-straddle', grupo: 'NO volatilidad (precio quieto)', nombre: 'Top straddle (short)', vista: 'Sin volatilidad · net credit',
    resumen: 'Short call + short put, mismo K. Ganancia limitada a las primas cobradas; pérdida ilimitada si el precio se mueve fuerte.',
    patas: [
      { type: 'call', side: 'venta', strike: 100, qty: 1 },
      { type: 'put', side: 'venta', strike: 100, qty: 1 },
    ],
  },
  {
    id: 'short-strangle', grupo: 'NO volatilidad (precio quieto)', nombre: 'Short strangle', vista: 'Sin volatilidad · net credit',
    resumen: 'Short put K1 + short call K2. Gana si el precio queda entre los strikes; cobra menos que un top straddle, pero el rango ganador es más ancho. Pérdida ilimitada.',
    patas: [
      { type: 'put', side: 'venta', strike: 95, qty: 1 },
      { type: 'call', side: 'venta', strike: 105, qty: 1 },
    ],
  },

  // ---------- Volatilidad ----------
  {
    id: 'straddle', grupo: 'Volatilidad (precio se mueve)', nombre: 'Bottom straddle (long)', vista: 'Volatilidad · net debit',
    resumen: 'Long call + long put, mismo K. Gana con un movimiento fuerte hacia cualquier lado; pérdida limitada a las primas.',
    patas: [
      { type: 'call', side: 'compra', strike: 100, qty: 1 },
      { type: 'put', side: 'compra', strike: 100, qty: 1 },
    ],
  },
  {
    id: 'strangle', grupo: 'Volatilidad (precio se mueve)', nombre: 'Long strangle', vista: 'Volatilidad · net debit',
    resumen: 'Long put K1 + long call K2, ambos fuera del dinero. Más barato que el straddle, pero necesita un movimiento mayor.',
    patas: [
      { type: 'put', side: 'compra', strike: 95, qty: 1 },
      { type: 'call', side: 'compra', strike: 105, qty: 1 },
    ],
  },
  {
    id: 'strip', grupo: 'Volatilidad (precio se mueve)', nombre: 'Strip', vista: 'Volatilidad con sesgo bajista',
    resumen: '1 call + 2 puts, mismo K. Como el bottom straddle, pero gana el doble si el precio baja (striP → Puts).',
    patas: [
      { type: 'call', side: 'compra', strike: 100, qty: 1 },
      { type: 'put', side: 'compra', strike: 100, qty: 2 },
    ],
  },
  {
    id: 'strap', grupo: 'Volatilidad (precio se mueve)', nombre: 'Strap', vista: 'Volatilidad con sesgo alcista',
    resumen: '2 calls + 1 put, mismo K. Como el bottom straddle, pero gana el doble si el precio sube.',
    patas: [
      { type: 'call', side: 'compra', strike: 100, qty: 2 },
      { type: 'put', side: 'compra', strike: 100, qty: 1 },
    ],
  },
  {
    id: 'short-butterfly', grupo: 'Volatilidad (precio se mueve)', nombre: 'Short (reverse) butterfly', vista: 'Volatilidad · net credit',
    resumen: 'Short call K1 + short call K3 + long 2 calls K2. Es la mariposa invertida: gana un poco si el precio se aleja de K2 y pierde (acotado) si se queda cerca.',
    patas: [
      { type: 'call', side: 'venta', strike: 95, qty: 1 },
      { type: 'call', side: 'compra', strike: 100, qty: 2 },
      { type: 'call', side: 'venta', strike: 105, qty: 1 },
    ],
  },
  // ---------- Paridad put-call ----------
  {
    id: 'forward-sintetico', grupo: 'Paridad put-call', nombre: 'Forward sintético (long call + short put)', vista: 'Equivale a comprar a plazo',
    resumen: 'Long call K + short put K, mismo vencimiento. Por la paridad put-call, c − p = S₀ − K·e^(−rT): el payoff es S_T − K, igual que un forward largo pactado a K.',
    patas: [
      { type: 'call', side: 'compra', strike: 100, qty: 1 },
      { type: 'put', side: 'venta', strike: 100, qty: 1 },
    ],
  },

  // ---------- Spreads de calendario (vencimientos distintos) ----------
  {
    id: 'calendar-call', grupo: 'Calendario (vencimientos distintos)', nombre: 'Calendar spread con calls', vista: 'Precio quieto cerca de K',
    resumen: 'Short call K a 30 días + long call K a 90 días. Se analiza al vencimiento del corto: gana si el precio queda cerca de K, porque el call corto vence sin valor y el largo conserva valor tiempo. Tiene vega positiva: también gana si sube la volatilidad.',
    patas: [
      { type: 'call', side: 'venta', strike: 100, qty: 1, dias: 30 },
      { type: 'call', side: 'compra', strike: 100, qty: 1, dias: 90 },
    ],
  },
  {
    id: 'calendar-put', grupo: 'Calendario (vencimientos distintos)', nombre: 'Calendar spread con puts', vista: 'Precio quieto cerca de K',
    resumen: 'Short put K a 30 días + long put K a 90 días. Mismo perfil que el calendar con calls.',
    patas: [
      { type: 'put', side: 'venta', strike: 100, qty: 1, dias: 30 },
      { type: 'put', side: 'compra', strike: 100, qty: 1, dias: 90 },
    ],
  },
  {
    id: 'diagonal', grupo: 'Calendario (vencimientos distintos)', nombre: 'Diagonal spread', vista: 'Levemente alcista',
    resumen: 'Short call 105 a 30 días + long call 100 a 90 días: distinto strike y distinto vencimiento. Combina la idea del bull spread con la del calendar.',
    patas: [
      { type: 'call', side: 'venta', strike: 105, qty: 1, dias: 30 },
      { type: 'call', side: 'compra', strike: 100, qty: 1, dias: 90 },
    ],
  },
];


function redondear(x) {
  return Math.round(x * 100) / 100;
}

// Devuelve las patas de la estrategia `id`, escaladas a un subyacente que vale `spot`.
// Cada pata trae `dias` (días al vencimiento, año de 360 días). Las que tienen `prima` escrita
// quedan con esa prima ("manual"); las demás traen premium = null y el simulador la calcula con
// Black-Scholes. Sin el simulador (por ejemplo, en la caja de herramientas) se usa PRIMAS_REF.
function construirEstrategia(id, spot, { conPrimasRef = false } = {}) {
  const e = ESTRATEGIAS.find(x => x.id === id);
  if (!e) return [];
  const f = spot / 100;
  return e.patas.map(p => {
    let premium = null;
    if (p.type === 'stock') premium = spot;
    else if (p.prima !== undefined) premium = p.prima * f;
    else if (conPrimasRef && PRIMAS_REF[p.type] && PRIMAS_REF[p.type][p.strike] !== undefined) premium = PRIMAS_REF[p.type][p.strike] * f;
    return {
      type: p.type,
      side: p.side,
      qty: p.qty,
      strike: p.type === 'stock' ? 0 : redondear(p.strike * f),
      premium: premium === null ? null : redondear(premium),
      manual: p.prima !== undefined,
      dias: p.dias || e.dias || 90,
    };
  });
}
