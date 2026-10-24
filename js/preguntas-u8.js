// Banco de preguntas · UNIDAD VIII · Estrategias con opciones
// (usa los helpers definidos en banco-mc.js; los resultados se calculan con Payoff de calculos.js)

// Analiza una estrategia escrita como en el libro: "compra call 95 8,53; venta call 105 3,44".
function analizar(texto) {
  const legs = texto.split(';').map(s => s.trim()).filter(Boolean).map(s => {
    const p = s.split(/\s+/), n = x => parseFloat(String(x).replace(',', '.'));
    if (p[1].startsWith('acc')) return { type: 'stock', side: p[0], strike: 0, premium: n(p[2]), qty: n(p[3]) || 1 };
    if (p[1].startsWith('bono')) return { type: 'bond', side: p[0], strike: n(p[2]), premium: n(p[3]), qty: 1 };
    return { type: p[1], side: p[0], strike: n(p[2]), premium: n(p[3]), qty: n(p[4]) || 1 };
  });
  const a = Payoff.analyze(legs);
  return { ...a, neto: a.netPremium, pnl: S => Payoff.totalPnL(legs, S) };
}
const be = lista => lista.map(x => f(x)).join(' y ');

// ---------- Teóricas ----------
Q({ id: 'U8-T01', unidad: 8, tema: 'Conceptos', dificultad: 1, tipo: 'teórica', fuente: 'Presentación U8',
  enunciado: 'Una estrategia es "net debit" cuando…',
  correcta: 'Se paga más por lo que se compra de lo que se cobra por lo que se vende.',
  incorrectas: ['Se cobra más por lo que se vende de lo que se paga por lo que se compra.', 'El payoff bruto es siempre negativo.', 'La pérdida máxima es ilimitada.'],
  explicacion: 'Requiere inversión inicial. Si se cobra más de lo que se paga, es "net credit".' });

Q({ id: 'U8-T02', unidad: 8, tema: 'Conceptos', dificultad: 1, tipo: 'teórica', fuente: 'Presentación U8',
  enunciado: 'El payoff BRUTO de una estrategia es…',
  correcta: 'Lo que pagan las opciones al vencimiento, sin considerar las primas.',
  incorrectas: ['El resultado al vencimiento neto de las primas pagadas y cobradas.', 'La prima neta pagada al armar la estrategia.', 'La ganancia máxima posible de la estrategia.'],
  explicacion: 'El payoff neto (beneficio) sí descuenta o suma las primas.' });

Q({ id: 'U8-T03', unidad: 8, tema: 'Capital garantizado', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U8',
  enunciado: 'Una principal-protected note se arma típicamente con…',
  correcta: 'Un bono cupón cero que devuelve el capital y un call comprado con el remanente.',
  incorrectas: [
    'Un bono cupón cero que devuelve el capital y un put comprado con el remanente.',
    'La acción y un put comprado que limita la pérdida (protective put).',
    'Un call comprado y un put vendido con el mismo strike y vencimiento.',
  ],
  explicacion: 'El bono garantiza el capital y el call aporta solo upside.',
  trampas: 'El protective put también protege, pero no garantiza recuperar el 100 % del capital invertido.' });

Q({ id: 'U8-T04', unidad: 8, tema: 'Capital garantizado', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U8',
  enunciado: 'Si sube la tasa libre de riesgo, una principal-protected note…',
  correcta: 'Se vuelve más atractiva: el bono cuesta menos y queda más dinero para comprar opciones.',
  incorrectas: [
    'Se vuelve menos atractiva: el bono cupón cero cuesta más y queda menos para opciones.',
    'No cambia, porque el capital garantizado al vencimiento sigue siendo el mismo.',
    'Deja de garantizar el capital, porque el bono pierde valor cuando suben las tasas.',
  ],
  explicacion: 'A mayor tasa, menor valor presente del capital a garantizar.' });

Q({ id: 'U8-T05', unidad: 8, tema: 'Cubiertas', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U8',
  enunciado: 'Por la paridad put-call, un covered call (long acción + short call) equivale a…',
  correcta: 'Un short put.',
  incorrectas: ['Un long put.', 'Un long call.', 'Un short call.'],
  explicacion: 'S₀ − c = K·e^(−rT) − p: vender un put más una cantidad fija.' });

Q({ id: 'U8-T06', unidad: 8, tema: 'Cubiertas', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U8',
  enunciado: 'Por la paridad put-call, un protective put (long acción + long put) equivale a…',
  correcta: 'Un long call.',
  incorrectas: ['Un short put.', 'Un long put.', 'Un short call.'],
  explicacion: 'S₀ + p = c + K·e^(−rT).' });

Q({ id: 'U8-T07', unidad: 8, tema: 'Cubiertas', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U8',
  enunciado: 'Un reverse covered call (short acción + long call) equivale a…',
  correcta: 'Un long put.',
  incorrectas: ['Un short put.', 'Un long call.', 'Un short call.'],
  explicacion: 'Es la posición opuesta al covered call.' });

Q({ id: 'U8-T08', unidad: 8, tema: 'Cubiertas', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U8',
  enunciado: 'Un reverse protective put (short acción + short put) equivale a…',
  correcta: 'Un short call.',
  incorrectas: ['Un long call.', 'Un short put.', 'Un long put.'],
  explicacion: 'Es la posición opuesta al protective put.' });

Q({ id: 'U8-T09', unidad: 8, tema: 'Cubiertas', dificultad: 3, tipo: 'teórica', fuente: 'Presentación U8',
  enunciado: '¿Cuál de estas estrategias mantiene la apuesta direccional y paga una prima para limitar la pérdida (es decir, "compra un seguro")?',
  correcta: 'Protective put.',
  incorrectas: ['Covered call.', 'Reverse protective put.', 'Top straddle.'],
  explicacion: 'El protective put sigue alcista y compra un put como seguro. El covered call y el reverse protective put venden un escenario y cobran prima.' });

Q({ id: 'U8-T10', unidad: 8, tema: 'Spreads', dificultad: 1, tipo: 'teórica', fuente: 'Presentación U8 · Hull 9.2',
  enunciado: 'Un spread vertical combina…',
  correcta: 'Dos opciones del mismo tipo, con el mismo vencimiento y distinto strike.',
  incorrectas: ['Dos opciones del mismo tipo, con el mismo strike y distinto vencimiento.', 'Un call y un put con el mismo strike.', 'Una opción y la acción subyacente.'],
  explicacion: 'Con distinto vencimiento sería un spread calendario (horizontal).',
  trampas: '«…con el mismo strike y distinto vencimiento» describe el spread calendario.' });

Q({ id: 'U8-T11', unidad: 8, tema: 'Spreads', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U8',
  enunciado: 'Un bull call spread se arma con…',
  correcta: 'Long call K₁ + short call K₂, con K₁ < K₂.',
  incorrectas: ['Long call K₂ + short call K₁, con K₁ < K₂.', 'Long call K₁ + short put K₂, con K₁ < K₂.', 'Long call K₁ + long call K₂, con K₁ < K₂.'],
  explicacion: 'Se compra el call de strike bajo y se vende el de strike alto.',
  trampas: '«Long call K₂ + short call K₁» es un bear call spread.' });

Q({ id: 'U8-T12', unidad: 8, tema: 'Spreads', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U8',
  enunciado: 'Un bull put spread (long put K₁ + short put K₂, con K₁ < K₂) es…',
  correcta: 'Net credit, con payoff bruto ≤ 0.',
  incorrectas: ['Net debit, con payoff bruto ≥ 0.', 'Net credit, con payoff bruto ≥ 0.', 'Net debit, con payoff bruto ≤ 0.'],
  explicacion: 'Se vende el put caro (K₂): se cobra neto, y al vencimiento se puede tener que pagar.' });

Q({ id: 'U8-T13', unidad: 8, tema: 'Spreads', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U8',
  enunciado: 'Un bear put spread se arma con…',
  correcta: 'Long put K₂ + short put K₁, con K₁ < K₂.',
  incorrectas: ['Long put K₁ + short put K₂, con K₁ < K₂.', 'Long put K₂ + short call K₁, con K₁ < K₂.', 'Short put K₁ + short put K₂, con K₁ < K₂.'],
  explicacion: 'Se compra el put de strike alto (caro) y se vende el de strike bajo.',
  trampas: '«Long put K₁ + short put K₂» es un bull put spread.' });

Q({ id: 'U8-T14', unidad: 8, tema: 'Spreads', dificultad: 3, tipo: 'teórica', fuente: 'Presentación U8',
  enunciado: 'Según el patrón de los spreads verticales, si se COMPRA la opción más cara…',
  correcta: 'El spread es net debit y su payoff bruto es ≥ 0.',
  incorrectas: ['El spread es net credit y su payoff bruto es ≥ 0.', 'El spread es net debit y su payoff bruto es ≤ 0.', 'El spread es net credit y su payoff bruto es ≤ 0.'],
  explicacion: 'Comprar la más cara implica pagar neto; a cambio, al vencimiento solo se puede cobrar.' });

Q({ id: 'U8-T15', unidad: 8, tema: 'Spreads', dificultad: 2, tipo: 'teórica', fuente: 'Hull 9.2',
  enunciado: '¿Qué bull call spread es el más agresivo (barato, pero con baja probabilidad de pagar)?',
  correcta: 'El que tiene ambos calls fuera del dinero.',
  incorrectas: ['El que tiene ambos calls dentro del dinero.', 'El que tiene un call dentro y otro fuera del dinero.', 'El que tiene ambos calls at the money.'],
  explicacion: 'A medida que los calls pasan a estar dentro del dinero, el spread se vuelve más caro y más conservador.' });

Q({ id: 'U8-T16', unidad: 8, tema: 'Box spread', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U8',
  enunciado: 'Un box spread se arma combinando…',
  correcta: 'Un bull call spread y un bear put spread con los mismos strikes.',
  incorrectas: ['Un bull call spread y un bull put spread con los mismos strikes.', 'Un bear call spread y un bear put spread con los mismos strikes.', 'Un straddle y un strangle con los mismos strikes.'],
  explicacion: 'El resultado tiene payoff fijo: K₂ − K₁.' });

Q({ id: 'U8-T17', unidad: 8, tema: 'Box spread', dificultad: 3, tipo: 'teórica', fuente: 'Presentación U8',
  enunciado: 'Para que no haya arbitraje, un box spread con strikes K₁ < K₂ y vencimiento T debe valer hoy…',
  correcta: '(K₂ − K₁)·e^(−rT)',
  incorrectas: ['K₂ − K₁', '(K₂ − K₁)·e^(rT)', 'Cero, porque los spreads se compensan'],
  explicacion: 'Paga K₂ − K₁ con certeza al vencimiento: vale ese monto descontado. Por eso se lo llama "tasa sintética".',
  trampas: 'K₂ − K₁ es el payoff, no el valor de hoy.' });

Q({ id: 'U8-T18', unidad: 8, tema: 'Box spread', dificultad: 3, tipo: 'teórica', fuente: 'Presentación U8',
  enunciado: '¿Por qué la relación del box spread puede no cumplirse con opciones americanas?',
  correcta: 'Porque el ejercicio anticipado (por ejemplo, P > p) puede alterar los flujos.',
  incorrectas: [
    'Porque las opciones americanas no tienen strikes fijos.',
    'Porque con americanas el payoff del box deja de ser fijo aun si nadie ejerce antes.',
    'Porque las opciones americanas no cumplen la ley del precio único.',
  ],
  explicacion: 'Si una de las opciones vendidas se ejerce antes, el flujo de fondos cambia de momento.' });

Q({ id: 'U8-T19', unidad: 8, tema: 'Butterfly', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U8',
  enunciado: 'Una call butterfly se arma con…',
  correcta: 'Long call K₁ + long call K₃ + short 2 calls K₂.',
  incorrectas: ['Short call K₁ + short call K₃ + long 2 calls K₂.', 'Long call K₁ + short call K₂ + long call K₃.', 'Long call K₁ + long 2 calls K₂ + long call K₃.'],
  explicacion: 'Cuatro opciones con tres strikes; K₂ en el medio.',
  trampas: '«Short call K₁ + short call K₃ + long 2 calls K₂» es la short butterfly. «Long call K₁ + short call K₂ + long call K₃» vende un solo call en K₂ (faltan dos).' });

Q({ id: 'U8-T20', unidad: 8, tema: 'Butterfly', dificultad: 1, tipo: 'teórica', fuente: 'Presentación U8',
  enunciado: 'La call butterfly es una apuesta a…',
  correcta: 'Que el precio se quede cerca de K₂ (NO volatilidad).',
  incorrectas: ['Un movimiento fuerte del precio hacia cualquier lado.', 'Una suba moderada del precio.', 'Una baja fuerte del precio.'],
  explicacion: 'Gana si el precio queda cerca del strike central; pierde poco (la prima) si se mueve mucho.' });

Q({ id: 'U8-T21', unidad: 8, tema: 'Butterfly', dificultad: 3, tipo: 'teórica', fuente: 'Hull 9.2',
  enunciado: 'Si π es la prima neta pagada, la ganancia máxima de una call butterfly con strikes equidistantes K₁ < K₂ < K₃ es…',
  correcta: 'K₂ − K₁ − π',
  incorrectas: ['K₃ − K₁ − π', 'π', 'K₃ − K₂ + π'],
  explicacion: 'Se alcanza con S_T = K₂: solo paga el call K₁, que vale K₂ − K₁.',
  trampas: 'K₃ − K₁ − π duplica el ancho de las alas (ese error aparece en algunos apuntes).' });

Q({ id: 'U8-T22', unidad: 8, tema: 'Butterfly', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U8',
  enunciado: 'Una short (reverse) butterfly es…',
  correcta: 'Net credit y apuesta a la volatilidad.',
  incorrectas: ['Net debit y apuesta a la volatilidad.', 'Net credit y apuesta a la NO volatilidad.', 'Net debit y apuesta a la NO volatilidad.'],
  explicacion: 'Invierte todas las posiciones de la butterfly.' });

Q({ id: 'U8-T23', unidad: 8, tema: 'Volatilidad', dificultad: 1, tipo: 'teórica', fuente: 'Presentación U8',
  enunciado: 'Un bottom straddle se arma con…',
  correcta: 'Long call + long put, con el mismo strike y vencimiento.',
  incorrectas: ['Short call + short put, con el mismo strike y vencimiento.', 'Long call + long put, con distinto strike.', 'Long call + short put, con el mismo strike y vencimiento.'],
  explicacion: 'El bottom straddle compra un call y un put con el mismo strike y vencimiento. Con strikes distintos sería un strangle; vendiendo las dos opciones, un top straddle.',
  trampas: 'Long call + short put con el mismo strike es un forward sintético.' });

Q({ id: 'U8-T24', unidad: 8, tema: 'Volatilidad', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U8',
  enunciado: 'Un top straddle (short call + short put, mismo K) tiene…',
  correcta: 'Ganancia limitada a las primas y pérdida ilimitada.',
  incorrectas: ['Ganancia ilimitada y pérdida limitada a las primas.', 'Ganancia y pérdida limitadas.', 'Ganancia y pérdida ilimitadas.'],
  explicacion: 'Es una apuesta a la NO volatilidad, muy riesgosa.' });

Q({ id: 'U8-T25', unidad: 8, tema: 'Volatilidad', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U8 · Hull 9.3',
  enunciado: 'Comparado con un bottom straddle, un long strangle…',
  correcta: 'Es más barato, pero necesita un movimiento mayor del precio para ganar.',
  incorrectas: ['Es más caro, pero necesita un movimiento menor del precio.', 'Es más barato y además necesita un movimiento menor.', 'Cuesta lo mismo y tiene el mismo perfil.'],
  explicacion: 'Usa opciones fuera del dinero: cuestan menos, pero los break-evens quedan más lejos.' });

Q({ id: 'U8-T26', unidad: 8, tema: 'Volatilidad', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U8',
  enunciado: 'Un strip se arma con…',
  correcta: '1 call + 2 puts con el mismo strike, y tiene sesgo bajista.',
  incorrectas: ['2 calls + 1 put con el mismo strike, y tiene sesgo bajista.', '1 call + 2 puts con el mismo strike, y tiene sesgo alcista.', '2 puts con distinto strike, y no tiene sesgo.'],
  explicacion: 'Con dos puts, gana el doble por cada peso que cae el precio.' });

Q({ id: 'U8-T27', unidad: 8, tema: 'Volatilidad', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U8',
  enunciado: 'Un strap se arma con…',
  correcta: '2 calls + 1 put con el mismo strike, y tiene sesgo alcista.',
  incorrectas: ['1 call + 2 puts con el mismo strike, y tiene sesgo alcista.', '2 calls + 1 put con el mismo strike, y tiene sesgo bajista.', '2 calls con distinto strike, y no tiene sesgo.'],
  explicacion: 'Con dos calls, gana el doble por cada peso que sube el precio.' });

Q({ id: 'U8-T28', unidad: 8, tema: 'Cubiertas', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U8',
  enunciado: 'Un collar se arma con…',
  correcta: 'Long acción + long put K₁ + short call K₂, con K₁ < K₂.',
  incorrectas: ['Long acción + short put K₁ + long call K₂, con K₁ < K₂.', 'Long put K₁ + short call K₂, sin la acción.', 'Long acción + long put K₁ + long call K₂, con K₁ < K₂.'],
  explicacion: 'Protective put financiado con un covered call.' });

Q({ id: 'U8-T29', unidad: 8, tema: 'Cubiertas', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U8',
  enunciado: 'Un "zero-cost collar" es aquel en el que…',
  correcta: 'La prima del put comprado es igual a la del call vendido.',
  incorrectas: [
    'La acción se compró sin costo, porque se financió con las primas.',
    'El strike del put comprado es igual al strike del call vendido.',
    'No hay pérdida posible, porque el put cubre toda la caída.',
  ],
  explicacion: 'El call vendido financia por completo el put comprado.' });

Q({ id: 'U8-T30', unidad: 8, tema: 'Volatilidad', dificultad: 3, tipo: 'teórica', fuente: 'Presentación U8',
  enunciado: 'Comparado con un top straddle, un short strangle…',
  correcta: 'Cobra menos prima, pero gana en un rango de precios más amplio.',
  incorrectas: ['Cobra más prima y gana en un rango más amplio.', 'Cobra menos prima y además tiene pérdida limitada.', 'Cobra más prima, pero gana en un rango más estrecho.'],
  explicacion: 'Vende opciones fuera del dinero: cobra menos, pero su pérdida sigue siendo ilimitada.',
  trampas: '«Cobra menos prima y además tiene pérdida limitada» suena lógica, pero el short strangle también tiene pérdida ilimitada.' });

Q({ id: 'U8-T31', unidad: 8, tema: 'Mapa', dificultad: 1, tipo: 'teórica', fuente: 'Presentación U8 (mapa de estrategias)',
  enunciado: 'Un inversor cree que el precio se va a quedar quieto y quiere riesgo acotado. ¿Qué estrategia elige?',
  correcta: 'Call butterfly.',
  incorrectas: ['Long strangle.', 'Strip.', 'Bull call spread.'],
  explicacion: 'Butterfly: NO volatilidad con pérdida limitada. El top straddle también apuesta a la quietud, pero tiene pérdida ilimitada.' });

Q({ id: 'U8-T32', unidad: 8, tema: 'Mapa', dificultad: 1, tipo: 'teórica', fuente: 'Presentación U8 (mapa de estrategias)',
  enunciado: 'Un inversor espera una suba moderada y quiere acotar su riesgo. ¿Qué estrategia elige?',
  correcta: 'Bull spread.',
  incorrectas: ['Bear spread.', 'Top straddle.', 'Short call.'],
  explicacion: 'Apuesta de dirección (alcista) con ganancia y pérdida limitadas.' });

Q({ id: 'U8-T33', unidad: 8, tema: 'Mapa', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U8 (mapa de estrategias)',
  enunciado: 'Un inversor espera un movimiento fuerte del precio, más probablemente a la baja. ¿Qué estrategia elige?',
  correcta: 'Strip.',
  incorrectas: ['Strap.', 'Butterfly.', 'Collar.'],
  explicacion: 'El strip es un straddle con dos puts: sesgo bajista.' });

Q({ id: 'U8-T34', unidad: 8, tema: 'Conceptos', dificultad: 2, tipo: 'teórica', fuente: 'Hull cap. 9',
  enunciado: 'En el análisis de estrategias de esta unidad (como en Hull), el beneficio se calcula…',
  correcta: 'Como payoff al vencimiento menos costo inicial, ignorando el valor tiempo del dinero.',
  incorrectas: ['Como payoff al vencimiento menos el costo inicial capitalizado a la tasa libre de riesgo.', 'Como el valor de Black-Scholes de la estrategia al vencimiento.', 'Como payoff bruto, sin considerar las primas.'],
  explicacion: 'Es una simplificación para enfocarse en el perfil de la estrategia.' });

// ---------- Prácticas ----------
{
  // Guía U8, ej. 1
  const a = analizar('compra call 15 4; venta call 17,5 2 2; compra call 20 0,5');
  Q({ id: 'U8-P01', unidad: 8, tema: 'Butterfly', dificultad: 2, tipo: 'práctica', fuente: 'Guía U8, ej. 1',
    enunciado: 'Calls a tres meses con strikes 15; 17,5 y 20 cuestan 4; 2 y 0,5. ¿Cuál es el costo neto de la butterfly (long 15, short 2 × 17,5, long 20)?',
    correcta: f(a.neto), incorrectas: [f(4 - 2 + 0.5), f(4 + 2 + 0.5), f(-a.neto)],
    explicacion: '4 + 0,5 − 2 × 2 = 0,50 (débito).',
    trampas: '2,50: vender un solo call en K₂. 6,50: sumar todas las primas. −0,50: confundir débito con crédito.' });

  Q({ id: 'U8-P02', unidad: 8, tema: 'Butterfly', dificultad: 3, tipo: 'práctica', fuente: 'Guía U8, ej. 1',
    enunciado: 'Con esa butterfly (calls 15; 17,5 y 20 a 4; 2 y 0,5), ¿cuál es la ganancia máxima?',
    correcta: f(a.maxProfit), incorrectas: [f(20 - 15 - a.neto), f(17.5 - 15), f(a.neto)],
    explicacion: 'Con S_T = 17,5: solo paga el call 15 (2,50); menos el costo 0,50 = 2,00.',
    trampas: '4,50: usar K₃ − K₁ − π. 2,50: olvidar el costo. 0,50: es la pérdida máxima.' });

  Q({ id: 'U8-P03', unidad: 8, tema: 'Butterfly', dificultad: 2, tipo: 'práctica', fuente: 'Guía U8, ej. 1',
    enunciado: 'Con esa butterfly (calls 15; 17,5 y 20 a 4; 2 y 0,5), ¿cuáles son los break-evens?',
    correcta: be(a.breakevens), incorrectas: [be([15, 20]), be([14.5, 20.5]), be([17, 18])],
    explicacion: 'K₁ + π = 15,5 y K₃ − π = 19,5.',
    trampas: '15 y 20: los strikes extremos. 14,5 y 20,5: restar y sumar la prima al revés.' });
}
{
  // Guía U8, ej. 2
  const a = analizar('compra call 50 2; compra put 45 3');
  Q({ id: 'U8-P04', unidad: 8, tema: 'Volatilidad', dificultad: 2, tipo: 'práctica', fuente: 'Guía U8, ej. 2',
    enunciado: 'Un call con strike 50 cuesta 2 y un put con strike 45 cuesta 3. Con ellos se arma un long strangle. ¿Cuáles son los break-evens?',
    correcta: be(a.breakevens), incorrectas: [be([45, 50]), be([42, 52]), be([40, 50])],
    explicacion: 'Costo 5: break-evens en 45 − 5 y 50 + 5.',
    trampas: '45 y 50: los strikes. 42 y 52: restar y sumar solo la prima de cada opción. 40 y 50: aplicar el costo de un solo lado.' });

  Q({ id: 'U8-P05', unidad: 8, tema: 'Volatilidad', dificultad: 1, tipo: 'práctica', fuente: 'Guía U8, ej. 2',
    enunciado: 'Con ese long strangle (call 50 a 2; put 45 a 3), ¿cuál es la pérdida máxima y dónde se da?',
    correcta: `${f(-a.maxLoss)}, para cualquier precio entre 45 y 50`,
    incorrectas: ['5,00, solo si el precio termina exactamente en 47,50', '2,00, para cualquier precio entre 45 y 50', 'Ilimitada si el precio sube mucho'],
    explicacion: 'Entre los strikes ninguna opción se ejerce: se pierde todo el costo.' });
}
{
  // Guía U8, ej. 3
  const bull = analizar('compra put 30 4; venta put 35 7');
  const bear = analizar('venta put 30 4; compra put 35 7');
  Q({ id: 'U8-P06', unidad: 8, tema: 'Spreads', dificultad: 3, tipo: 'práctica', fuente: 'Guía U8, ej. 3',
    enunciado: 'Puts con strikes 30 y 35 cuestan 4 y 7. Se arma un BULL spread con puts. ¿Cuál es su perfil?',
    correcta: `Crédito ${f(-bull.neto)}; ganancia máxima ${f(bull.maxProfit)}; pérdida máxima ${f(-bull.maxLoss)}`,
    incorrectas: [
      `Débito ${f(bear.neto)}; ganancia máxima ${f(bear.maxProfit)}; pérdida máxima ${f(-bear.maxLoss)}`,
      `Crédito ${f(-bull.neto)}; ganancia máxima ${f(-bull.maxLoss)}; pérdida máxima ${f(bull.maxProfit)}`,
      `Crédito ${f(11)}; ganancia máxima ${f(11)}; pérdida máxima ${f(5)}`,
    ],
    explicacion: 'Long put 30 + short put 35: se cobran 7 − 4 = 3. Pérdida máxima = (35 − 30) − 3 = 2.',
    trampas: '«Débito 3,00…» es el bear put spread. «Crédito 3,00; ganancia máxima 2,00…» invierte ganancia y pérdida. «Crédito 11,00…» suma las primas.' });

  Q({ id: 'U8-P07', unidad: 8, tema: 'Spreads', dificultad: 2, tipo: 'práctica', fuente: 'Guía U8, ej. 3',
    enunciado: 'Con puts 30 y 35 a 4 y 7, ¿cuál es el break-even del bull put spread?',
    correcta: f(bull.breakevens[0]), incorrectas: [f(30 + 3), f(35 + 3), f(30 - 3)],
    explicacion: 'K₂ − crédito = 35 − 3 = 32.',
    trampas: '33: K₁ + crédito. 38: sumar el crédito a K₂. 27: restarlo de K₁.' });
}
{
  // Guía U8, ej. 4
  const a = analizar('compra call 60 6; compra put 60 4');
  Q({ id: 'U8-P08', unidad: 8, tema: 'Volatilidad', dificultad: 2, tipo: 'práctica', fuente: 'Guía U8, ej. 4',
    enunciado: 'Un call con strike 60 cuesta 6 y un put con el mismo strike y vencimiento cuesta 4. ¿En qué rango de precios el straddle genera pérdida?',
    correcta: `Entre ${be(a.breakevens)}`,
    incorrectas: [`Entre ${be([54, 66])}`, `Entre ${be([56, 64])}`, `Entre ${be([60, 70])}`],
    explicacion: 'Costo 10: pierde entre 60 − 10 y 60 + 10.',
    trampas: '54 y 66: usar solo la prima del call. 56 y 64: usar solo la del put. 60 y 70: aplicar el costo de un solo lado.' });
}
{
  const a = analizar('compra accion 40; venta call 42 1,5');
  Q({ id: 'U8-P09', unidad: 8, tema: 'Cubiertas', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo · Presentación U8',
    enunciado: 'Comprás una acción a 40 y vendés un call con strike 42 a 1,50 (covered call). ¿Cuál es la ganancia máxima?',
    correcta: f(a.maxProfit), incorrectas: [f(2), f(1.5), f(42 + 1.5)],
    explicacion: 'Si S_T ≥ 42, se entrega la acción a 42: (42 − 40) + 1,50 = 3,50.',
    trampas: '2,00: olvidar la prima. 1,50: solo la prima. 43,50: K + prima.' });
}
{
  const a = analizar('compra accion 80; compra put 75 2');
  Q({ id: 'U8-P10', unidad: 8, tema: 'Cubiertas', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo · Presentación U8',
    enunciado: 'Tenés una acción comprada a 80 y comprás un put con strike 75 a 2 (protective put). ¿Cuál es la pérdida máxima?',
    correcta: f(-a.maxLoss), incorrectas: [f(5), f(2), f(82)],
    explicacion: 'El put asegura vender a 75: se pierden 80 − 75 = 5 más la prima de 2.',
    trampas: '5,00: olvidar la prima. 2,00: solo la prima. 82,00: es el break-even.' });
}
{
  const a = analizar('compra accion 50; compra put 45 1,2; venta call 55 1');
  Q({ id: 'U8-P11', unidad: 8, tema: 'Cubiertas', dificultad: 3, tipo: 'práctica', fuente: 'Nuevo · Presentación U8',
    enunciado: 'Tenés una acción comprada a 50, comprás un put 45 a 1,20 y vendés un call 55 a 1,00 (collar). ¿Cuál es la pérdida máxima?',
    correcta: f(-a.maxLoss), incorrectas: [f(5), f(a.maxProfit), f(5 + 1.2 + 1)],
    explicacion: 'Costo neto = 50 + 1,20 − 1,00 = 50,20. Peor caso: vender a 45 ⇒ 50,20 − 45 = 5,20.',
    trampas: '5,00: ignorar las primas. 4,80: es la ganancia máxima. 7,20: sumar las dos primas.' });
}
Q({ id: 'U8-P12', unidad: 8, tema: 'Capital garantizado', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo · Presentación U8',
  enunciado: 'Una nota garantiza $10.000 a 2 años. La tasa libre de riesgo es 5 % anual continua. ¿Cuánto dinero queda para comprar opciones después de comprar el bono cupón cero?',
  correcta: `$ ${f(10000 - 10000 * EXP(-0.1))}`,
  incorrectas: [`$ ${f(1000)}`, `$ ${f(10000 - 10000 * EXP(-0.05))}`, `$ ${f(10000 - 10000 / 1.05 ** 2)}`],
  explicacion: 'Bono = 10.000·e^(−0,05·2) = 9.048,37; remanente = 951,63.',
  trampas: '1.000: interés simple (5 % × 2). 487,71: descontar un solo año. 929,71: usar composición anual en vez de continua.' });
{
  const vb = 10 * EXP(-0.05);
  Q({ id: 'U8-P13', unidad: 8, tema: 'Box spread', dificultad: 3, tipo: 'práctica', fuente: 'Nuevo · Presentación U8',
    enunciado: 'Con opciones europeas a un año de strikes 40 y 50, y r = 5 % anual continua, un box spread cotiza a 9,30. ¿Qué conviene hacer?',
    correcta: `Comprarlo: vale ${f(vb)}, se gana ${f(vb - 9.3)} hoy.`,
    incorrectas: [`Venderlo: vale ${f(vb)}, se gana ${f(vb - 9.3)} hoy.`, `Comprarlo: se gana ${f(10 - 9.3)} hoy.`, 'Nada: un box spread siempre vale K₂ − K₁ = 10.'],
    explicacion: `Valor teórico = 10·e^(−0,05) = ${f(vb, 4)} > 9,30: está barato, se compra.`,
    trampas: '«Venderlo» invierte la operación. 0,70 no descuenta el payoff. «Siempre vale K₂ − K₁ = 10» confunde payoff con valor.' });
}
{
  const a = analizar('compra call 40 3; compra put 40 2,5 2');
  Q({ id: 'U8-P14', unidad: 8, tema: 'Volatilidad', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo · Presentación U8',
    enunciado: 'Un strip se arma con 1 call y 2 puts con strike 40. El call cuesta 3 y cada put 2,50. ¿Cuáles son los break-evens?',
    correcta: be(a.breakevens), incorrectas: [be([32, 44]), be([34.5, 45.5]), be([36, 44])],
    explicacion: 'Costo 8. Abajo: 40 − 8/2 (los dos puts recuperan el costo con la mitad de la caída). Arriba: 40 + 8.',
    trampas: '32 y 44: usar las fórmulas del strap. 34,5 y 45,5: usar un straddle (costo 5,50). 36 y 44: dividir el costo por 2 en ambos lados.' });
}
{
  const a = analizar('compra call 100 5,6 2; compra put 100 4,36');
  Q({ id: 'U8-P15', unidad: 8, tema: 'Volatilidad', dificultad: 3, tipo: 'práctica', fuente: 'Nuevo · Presentación U8',
    enunciado: 'Un strap se arma con 2 calls y 1 put con strike 100. Cada call cuesta 5,60 y el put 4,36. ¿Cuáles son los break-evens?',
    correcta: be(a.breakevens), incorrectas: [be([100 - 15.56 / 2, 100 + 15.56]), be([100 - 9.96, 100 + 9.96]), be([100 - 15.56, 100 + 15.56])],
    explicacion: 'Costo 15,56. Abajo: 100 − 15,56 (un solo put). Arriba: 100 + 15,56/2 (dos calls).',
    trampas: '92,22 y 115,56 usa las fórmulas del strip. 90,04 y 109,96 son los de un straddle de 1 call y 1 put. 84,44 y 115,56 aplica el costo completo en los dos lados.' });
}
{
  const a = analizar('venta call 30 4; compra call 35 1,5');
  Q({ id: 'U8-P16', unidad: 8, tema: 'Spreads', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo · Presentación U8',
    enunciado: 'Vendés un call 30 a 4 y comprás un call 35 a 1,50 (bear call spread). ¿Cuál es el break-even?',
    correcta: f(a.breakevens[0]), incorrectas: [f(35 - 1.5), f(30 + 4), f(30 + 1.5)],
    explicacion: 'Crédito 2,50. Break-even = K₁ + crédito = 30 + 2,50.',
    trampas: '33,50: K₂ − la prima del call comprado. 34,00: K₁ + la prima cobrada (sin restar la pagada). 31,50: K₁ + la prima pagada.' });
}
{
  const a = analizar('compra put 90 1,5; venta put 100 5 2; compra put 110 11,2');
  Q({ id: 'U8-P17', unidad: 8, tema: 'Butterfly', dificultad: 3, tipo: 'práctica', fuente: 'Nuevo · Hull 9.2',
    enunciado: 'Puts con strikes 90, 100 y 110 cuestan 1,50; 5,00 y 11,20. Con ellos se arma una put butterfly. ¿Cuál es la ganancia máxima?',
    correcta: f(a.maxProfit), incorrectas: [f(110 - 90 - a.neto), f(10), f(a.neto)],
    explicacion: `Costo = 1,50 + 11,20 − 2 × 5,00 = ${f(a.neto)}. Ganancia máxima = 10 − ${f(a.neto)} (con S_T = 100).`,
    trampas: `${f(110 - 90 - a.neto)}: usar K₃ − K₁. 10,00: olvidar el costo. ${f(a.neto)}: es la pérdida máxima.` });
}
{
  const a = analizar('compra call 95 8,53; venta call 105 3,44');
  Q({ id: 'U8-P18', unidad: 8, tema: 'Spreads', dificultad: 2, tipo: 'práctica', fuente: 'Presentación U8 (primas del libro)',
    enunciado: 'Comprás un call 95 a 8,53 y vendés un call 105 a 3,44. ¿Cuál es el break-even del bull call spread?',
    correcta: f(a.breakevens[0]), incorrectas: [f(95 + 8.53), f(105 + 5.09), f(95 + 3.44)],
    explicacion: 'Débito = 8,53 − 3,44 = 5,09. Break-even = K₁ + débito = 100,09.',
    trampas: '103,53: K₁ + la prima pagada (sin restar la cobrada). 110,09: K₂ + débito. 98,44: K₁ + la prima cobrada.' });
}
{
  const a = analizar('compra call 100 5,6; compra put 100 4,36');
  Q({ id: 'U8-P19', unidad: 8, tema: 'Volatilidad', dificultad: 1, tipo: 'práctica', fuente: 'Presentación U8 (primas del libro)',
    enunciado: 'Un bottom straddle con strike 100: el call cuesta 5,60 y el put 4,36. ¿Cuál es la pérdida máxima?',
    correcta: f(-a.maxLoss), incorrectas: [f(5.6), f(4.36), 'Ilimitada'],
    explicacion: 'Si S_T = 100, ninguna opción paga: se pierden ambas primas.',
    trampas: 'Ilimitada: corresponde al top straddle.' });
}
{
  const a = analizar('venta put 95 2,35; compra put 105 7,14');
  Q({ id: 'U8-P20', unidad: 8, tema: 'Spreads', dificultad: 3, tipo: 'práctica', fuente: 'Presentación U8 (primas del libro)',
    enunciado: 'Comprás un put 105 a 7,14 y vendés un put 95 a 2,35. ¿Cuál es la ganancia máxima de este bear put spread?',
    correcta: f(a.maxProfit), incorrectas: [f(a.neto), f(10), f(7.14 - 2.35 + 10)],
    explicacion: 'Débito = 4,79. Ganancia máxima = (105 − 95) − 4,79 = 5,21 (si S_T ≤ 95).',
    trampas: '4,79: es la pérdida máxima (el débito). 10,00: olvidar el débito. 14,79: sumar el débito en lugar de restarlo.' });
}
