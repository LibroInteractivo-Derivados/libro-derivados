// Banco de preguntas · UNIDAD V · Introducción a las opciones
// (usa los helpers de preguntas-base.js)

// ---------- Teóricas ----------
Q({ id: 'U5-T01', unidad: 5, tema: 'Definición', dificultad: 1, tipo: 'teórica', fuente: 'Presentación U5 · Hull cap. 7',
  enunciado: 'Un call le da a su comprador…',
  correcta: 'El derecho, pero no la obligación, de comprar el subyacente al precio de ejercicio.',
  incorrectas: [
    'La obligación de comprar el subyacente al precio de ejercicio.',
    'El derecho, pero no la obligación, de vender el subyacente al precio de ejercicio.',
    'La obligación de vender el subyacente al precio de ejercicio.',
  ],
  explicacion: 'El call es un derecho de compra. La obligación la tiene el lanzador (vendedor) del call.' });

Q({ id: 'U5-T02', unidad: 5, tema: 'Definición', dificultad: 1, tipo: 'teórica', fuente: 'Hull cap. 7',
  enunciado: 'El lanzador (vendedor) de un put…',
  correcta: 'Tiene la obligación de comprar el subyacente al strike si el comprador ejerce.',
  incorrectas: ['Tiene el derecho de vender el subyacente al strike.', 'Tiene la obligación de vender el subyacente al strike si el comprador ejerce.', 'Tiene el derecho de comprar el subyacente al strike.'],
  explicacion: 'Si el comprador del put ejerce, le vende el subyacente al lanzador, que está obligado a comprarlo a K.',
  trampas: '"Obligación de vender" corresponde al lanzador de un call.' });

Q({ id: 'U5-T03', unidad: 5, tema: 'Definición', dificultad: 1, tipo: 'teórica', fuente: 'Hull cap. 7',
  enunciado: '¿Cuál es la diferencia entre una opción europea y una americana?',
  correcta: 'La europea solo puede ejercerse al vencimiento; la americana, en cualquier momento hasta el vencimiento.',
  incorrectas: [
    'La europea se negocia en bolsas europeas y la americana en bolsas de Estados Unidos.',
    'La americana solo puede ejercerse al vencimiento; la europea, en cualquier momento.',
    'Ambas pueden ejercerse en cualquier momento, pero la europea se liquida en efectivo.',
  ],
  explicacion: 'El nombre no tiene que ver con el lugar donde se negocian, sino con cuándo pueden ejercerse.' });

Q({ id: 'U5-T04', unidad: 5, tema: 'Definición', dificultad: 1, tipo: 'teórica', fuente: 'Hull cap. 7',
  enunciado: 'La prima de una opción es…',
  correcta: 'El precio que paga el comprador para adquirir el derecho.',
  incorrectas: ['El precio de ejercicio de la opción.', 'La ganancia que obtiene el comprador al ejercer.', 'El margen de garantía que exige el mercado al comprador.'],
  explicacion: 'La prima es el precio de la opción; el strike es otra cosa.' });

Q({ id: 'U5-T05', unidad: 5, tema: 'Definición', dificultad: 2, tipo: 'teórica', fuente: 'Hull cap. 7',
  enunciado: '¿Cuál es una diferencia clave entre una opción y un contrato forward?',
  correcta: 'Entrar en un forward no tiene costo, mientras que comprar una opción requiere pagar una prima.',
  incorrectas: [
    'El forward da un derecho al comprador, mientras que la opción impone una obligación a ambas partes.',
    'La opción obliga a ambas partes a cumplir, mientras que el forward obliga solo al vendedor.',
    'Entrar en un forward requiere pagar una prima, mientras que comprar una opción no tiene costo inicial.',
  ],
  explicacion: 'El forward obliga a las dos partes y se entra sin costo; la opción obliga solo al lanzador y por eso el comprador paga una prima.' });

Q({ id: 'U5-T06', unidad: 5, tema: 'Payoffs', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U5',
  enunciado: 'El payoff bruto de un short put al vencimiento es…',
  correcta: '−máx(K − S_T; 0)',
  incorrectas: ['máx(K − S_T; 0)', '−máx(S_T − K; 0)', 'máx(K − S_T; 0) − p'],
  explicacion: 'El lanzador paga lo que gana el comprador. El payoff bruto no incluye la prima.',
  trampas: '«máx(K − S_T; 0) − p» es el BENEFICIO de un long put, no el payoff bruto de un short put.' });

Q({ id: 'U5-T07', unidad: 5, tema: 'Moneyness', dificultad: 1, tipo: 'teórica', fuente: 'Presentación U5',
  enunciado: 'Un call está "in the money" cuando…',
  correcta: 'S > K',
  incorrectas: ['S < K', 'S = K', 'S > K·e^(−rT), aunque S < K'],
  explicacion: 'El call está dentro del dinero cuando ejercerlo ahora daría un valor positivo: S > K.' });

Q({ id: 'U5-T08', unidad: 5, tema: 'Moneyness', dificultad: 1, tipo: 'teórica', fuente: 'Presentación U5',
  enunciado: 'Un put está "in the money" cuando…',
  correcta: 'S < K',
  incorrectas: ['S > K', 'S = K', 'La prima supera al valor intrínseco'],
  explicacion: 'El put da derecho a vender a K: vale ejercerlo si el subyacente vale menos que K.' });

Q({ id: 'U5-T09', unidad: 5, tema: 'Moneyness', dificultad: 2, tipo: 'teórica', fuente: 'Hull cap. 7',
  enunciado: 'El valor tiempo de una opción es…',
  correcta: 'La prima menos el valor intrínseco.',
  incorrectas: ['El valor intrínseco menos la prima.', 'La prima más el valor intrínseco.', 'La prima descontada a la tasa libre de riesgo.'],
  explicacion: 'Prima = valor intrínseco + valor tiempo.' });

Q({ id: 'U5-T10', unidad: 5, tema: 'Variables', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U5 (tabla de signos)',
  enunciado: 'Si aumenta la volatilidad del subyacente, el precio de un PUT europeo…',
  correcta: 'Aumenta.',
  incorrectas: ['Disminuye.', 'No cambia.', 'Aumenta solo si el put está dentro del dinero.'],
  explicacion: 'La volatilidad aumenta el valor de calls y puts por la asimetría del payoff.' });

Q({ id: 'U5-T11', unidad: 5, tema: 'Variables', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U5 (tabla de signos)',
  enunciado: 'Si aumenta la tasa libre de riesgo, el precio de un PUT europeo…',
  correcta: 'Disminuye.',
  incorrectas: ['Aumenta.', 'No cambia.', 'Aumenta, igual que el de un call.'],
  explicacion: 'Una tasa más alta reduce el valor presente de K, que el put va a cobrar al ejercer.' });

Q({ id: 'U5-T12', unidad: 5, tema: 'Variables', dificultad: 1, tipo: 'teórica', fuente: 'Presentación U5 (tabla de signos)',
  enunciado: 'Si aumenta el precio de ejercicio K, el precio de un CALL…',
  correcta: 'Disminuye.',
  incorrectas: ['Aumenta.', 'No cambia.', 'Depende de la volatilidad.'],
  explicacion: 'Un strike más alto hace más caro comprar al ejercer.' });

Q({ id: 'U5-T13', unidad: 5, tema: 'Variables', dificultad: 3, tipo: 'teórica', fuente: 'Presentación U5 (tabla de signos)',
  enunciado: '¿Qué efecto tiene un aumento del plazo al vencimiento sobre el precio de un CALL EUROPEO sobre una acción que paga dividendos?',
  correcta: 'Ambiguo: puede aumentar o disminuir.',
  incorrectas: ['Siempre lo aumenta: hay más tiempo para ganar.', 'Siempre lo disminuye: se descuenta más el precio de ejercicio.', 'No lo afecta: solo importa la volatilidad.'],
  explicacion: 'En la tabla figura "?" para las europeas: un call que vence antes de un dividendo grande puede valer más que uno que vence después.',
  trampas: '"Siempre lo aumenta" es correcto para las AMERICANAS, no para las europeas.' });

Q({ id: 'U5-T14', unidad: 5, tema: 'Variables', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U5 (tabla de signos)',
  enunciado: 'Los dividendos esperados durante la vida de la opción…',
  correcta: 'Reducen el valor del call y aumentan el del put.',
  incorrectas: ['Aumentan el valor del call y reducen el del put.', 'Aumentan el valor de ambos.', 'No afectan el valor de las opciones.'],
  explicacion: 'El día ex-dividendo el precio de la acción cae.' });

Q({ id: 'U5-T15', unidad: 5, tema: 'Variables', dificultad: 3, tipo: 'teórica', fuente: 'Presentación U5',
  enunciado: '¿Por qué la volatilidad aumenta el valor de una opción pero no el de un forward?',
  correcta: 'Porque el payoff de la opción es asimétrico: las pérdidas están acotadas, pero las ganancias no.',
  incorrectas: [
    'Porque el forward no tiene fecha de vencimiento, así que la volatilidad no llega a afectar su valor.',
    'Porque una mayor volatilidad hace subir la tasa libre de riesgo, que solo afecta a las opciones.',
    'Porque el forward se negocia OTC y la opción en bolsa, donde la volatilidad sí se refleja en el precio.',
  ],
  explicacion: 'En un forward (payoff lineal) los escenarios buenos y malos se compensan; en la opción, los malos están "capeados".' });

Q({ id: 'U5-T16', unidad: 5, tema: 'Límites', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U5',
  enunciado: '¿Cuál es el límite superior del precio de un call (europeo o americano)?',
  correcta: 'c ≤ S₀',
  incorrectas: ['c ≤ K', 'c ≤ K·e^(−rT)', 'c ≤ S₀ − K'],
  explicacion: 'Un derecho a comprar una acción nunca puede valer más que la propia acción.' });

Q({ id: 'U5-T17', unidad: 5, tema: 'Límites', dificultad: 3, tipo: 'teórica', fuente: 'Presentación U5',
  enunciado: '¿Cuál es el límite superior del precio de un PUT EUROPEO?',
  correcta: 'p ≤ K·e^(−rT)',
  incorrectas: ['p ≤ K', 'p ≤ S₀', 'p ≤ S₀ − K·e^(−rT)'],
  explicacion: 'Al vencimiento el put europeo vale como máximo K, así que hoy vale como máximo K descontado.',
  trampas: 'p ≤ K es el límite del put AMERICANO, que puede ejercerse hoy.' });

Q({ id: 'U5-T18', unidad: 5, tema: 'Límites', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U5',
  enunciado: '¿Cuál es el límite inferior del precio de un call europeo sobre una acción sin dividendos?',
  correcta: 'máx(S₀ − K·e^(−rT); 0)',
  incorrectas: ['máx(S₀ − K; 0)', 'máx(K·e^(−rT) − S₀; 0)', 'S₀'],
  explicacion: 'Surge de comparar la cartera A (call + bono que paga K) con la cartera B (una acción).',
  trampas: 'máx(S₀ − K; 0) olvida descontar el strike.' });

Q({ id: 'U5-T19', unidad: 5, tema: 'Paridad put-call', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U5',
  enunciado: 'La paridad put-call para opciones europeas sobre una acción sin dividendos es…',
  correcta: 'c + K·e^(−rT) = p + S₀',
  incorrectas: ['c + S₀ = p + K·e^(−rT)', 'c + K = p + S₀', 'c − p = K·e^(−rT) − S₀'],
  explicacion: 'Cartera A (call + bono que paga K) y cartera C (put + acción) valen lo mismo al vencimiento.',
  trampas: '«c + S₀ = p + K·e^(−rT)» intercambia S₀ y K·e^(−rT). «c − p = K·e^(−rT) − S₀» es la correcta con el signo cambiado. «c + K = p + S₀» no descuenta el strike.' });

Q({ id: 'U5-T20', unidad: 5, tema: 'Paridad put-call', dificultad: 3, tipo: 'teórica', fuente: 'Presentación U5',
  enunciado: 'Para opciones AMERICANAS sobre una acción sin dividendos se cumple…',
  correcta: 'S₀ − K ≤ C − P ≤ S₀ − K·e^(−rT)',
  incorrectas: ['S₀ − K·e^(−rT) ≤ C − P ≤ S₀ − K', 'C − P = S₀ − K·e^(−rT)', 'S₀ − K ≤ P − C ≤ S₀ − K·e^(−rT)'],
  explicacion: 'Como S₀ − K < S₀ − K·e^(−rT), el límite inferior es el que no descuenta K.',
  trampas: '«S₀ − K·e^(−rT) ≤ C − P ≤ S₀ − K» invierte los límites. «C − P = S₀ − K·e^(−rT)» es la paridad europea. La banda con P − C cambia el orden de la resta.' });

Q({ id: 'U5-T21', unidad: 5, tema: 'Ejercicio anticipado', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U5',
  enunciado: '¿Cuándo conviene ejercer anticipadamente un call americano sobre una acción que NO paga dividendos?',
  correcta: 'Nunca: siempre es mejor venderlo.',
  incorrectas: ['Cuando está muy dentro del dinero.', 'Cuando la tasa de interés es alta.', 'Cuando falta poco para el vencimiento.'],
  explicacion: 'Ejercer adelanta el pago de K y hace perder el "seguro" (put implícito).',
  trampas: '"Cuando está muy dentro del dinero" vale para el PUT americano.' });

Q({ id: 'U5-T22', unidad: 5, tema: 'Ejercicio anticipado', dificultad: 3, tipo: 'teórica', fuente: 'Presentación U5',
  enunciado: '¿Qué ocurre con un put americano sobre una acción que no paga dividendos?',
  correcta: 'Puede convenir ejercerlo anticipadamente si está muy dentro del dinero.',
  incorrectas: [
    'Nunca conviene ejercerlo anticipadamente, igual que el call.',
    'Solo conviene ejercerlo anticipadamente si la acción paga dividendos.',
    'Siempre conviene ejercerlo apenas queda dentro del dinero.',
  ],
  explicacion: 'Ejemplo extremo: si S = 0, ya no puede bajar más y conviene cobrar K cuanto antes.' });

Q({ id: 'U5-T23', unidad: 5, tema: 'Ejercicio anticipado', dificultad: 3, tipo: 'teórica', fuente: 'Hull 8 (problema 8.12)',
  enunciado: '¿Qué combinación hace MÁS atractivo el ejercicio anticipado de un put americano?',
  correcta: 'Tasas de interés altas y baja volatilidad.',
  incorrectas: ['Tasas de interés bajas y alta volatilidad.', 'Tasas de interés altas y alta volatilidad.', 'Tasas de interés bajas y baja volatilidad.'],
  explicacion: 'Tasas altas: cobrar K antes rinde más. Volatilidad baja: el valor "seguro" de esperar es menor.' });

Q({ id: 'U5-T24', unidad: 5, tema: 'Ejercicio anticipado', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U5',
  enunciado: '¿Por qué, sin dividendos, un call americano vale lo mismo que uno europeo (C = c)?',
  correcta: 'Porque nunca conviene ejercer anticipadamente el call americano.',
  incorrectas: ['Porque tienen el mismo strike y el mismo vencimiento.', 'Porque la paridad put-call lo exige.', 'Porque el call americano no puede ejercerse antes del vencimiento.'],
  explicacion: 'Si el derecho extra (ejercer antes) nunca se usa, no agrega valor.' });

Q({ id: 'U5-T25', unidad: 5, tema: 'Especificaciones', dificultad: 1, tipo: 'teórica', fuente: 'Presentación U5',
  enunciado: 'En general, un contrato de opciones sobre acciones equivale a…',
  correcta: '100 acciones.',
  incorrectas: ['1 acción.', '10 acciones.', '1.000 acciones.'],
  explicacion: 'Por eso la prima cotizada por acción se multiplica por 100 para obtener el costo del contrato.' });

Q({ id: 'U5-T26', unidad: 5, tema: 'Especificaciones', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U5',
  enunciado: 'Las opciones sobre índices accionarios…',
  correcta: 'Se liquidan siempre en efectivo.',
  incorrectas: ['Se liquidan entregando las acciones que componen el índice.', 'Son siempre americanas.', 'Solo se negocian OTC.'],
  explicacion: 'El payoff es N veces el índice (100 o 250 en general) y se paga en efectivo.' });

Q({ id: 'U5-T27', unidad: 5, tema: 'Especificaciones', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U5 · Hull cap. 7',
  enunciado: 'Ante un split de 2 por 1 de la acción subyacente…',
  correcta: 'El strike se divide por 2 y el contrato pasa a cubrir el doble de acciones.',
  incorrectas: ['El strike se duplica y el contrato cubre la mitad de acciones.', 'El strike se divide por 2 y el contrato cubre la misma cantidad de acciones.', 'No se hace ningún ajuste.'],
  explicacion: 'En un split n por m, K pasa a K·m/n y la cantidad se multiplica por n/m.' });

Q({ id: 'U5-T28', unidad: 5, tema: 'Especificaciones', dificultad: 3, tipo: 'teórica', fuente: 'Presentación U5',
  enunciado: 'Ante el pago de un dividendo en efectivo, en las opciones que cotizan en bolsa…',
  correcta: 'En general no se ajusta el strike, salvo en dividendos excepcionalmente grandes.',
  incorrectas: [
    'Siempre se ajusta el strike, restándole el monto del dividendo pagado.',
    'Se ajusta la prima de la opción por el monto del dividendo, sin tocar el strike.',
    'Se cancela la opción y se emite una nueva con strike y vencimiento ajustados.',
  ],
  explicacion: 'En OTC pueden ajustarse; en bolsa, en general no. Con dividendos en acciones y splits sí se ajusta.' });

Q({ id: 'U5-T29', unidad: 5, tema: 'Límites', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U5',
  enunciado: 'La cartera A (un call europeo más un bono cupón cero que paga K en T) vale al vencimiento…',
  correcta: 'máx(S_T; K)',
  incorrectas: ['S_T', 'K', 'máx(S_T − K; 0)'],
  explicacion: 'Si S_T > K: (S_T − K) + K = S_T. Si S_T ≤ K: 0 + K = K.' });

// ---------- Prácticas ----------
Q({ id: 'U5-P01', unidad: 5, tema: 'Payoffs', dificultad: 1, tipo: 'práctica', fuente: 'Presentación U5',
  enunciado: 'Comprás un call con strike 100 a una prima de 5. ¿Cuál es el break-even?',
  correcta: '105', incorrectas: ['95', '100', '5'],
  explicacion: 'Long call: K + prima.' });

Q({ id: 'U5-P02', unidad: 5, tema: 'Payoffs', dificultad: 2, tipo: 'práctica', fuente: 'Presentación U5',
  enunciado: 'Vendés un put con strike 70 y cobrás una prima de 7. ¿Cuál es el break-even?',
  correcta: '63', incorrectas: ['77', '70', '56'],
  explicacion: 'El lanzador del put empieza a perder cuando S_T cae por debajo de K − prima.',
  trampas: '77: sumar la prima como en un call. 56: restar dos veces la prima.' });

Q({ id: 'U5-P03', unidad: 5, tema: 'Payoffs', dificultad: 2, tipo: 'práctica', fuente: 'Guía U5, ej. 1',
  enunciado: 'INTC cotiza a $40. Comprás 1 contrato del call INTC.C.45 (100 acciones) a una prima de $1 por acción. Si al vencimiento INTC vale $50, ¿cuál es tu ganancia?',
  correcta: '$ 400', incorrectas: ['$ 500', '$ 4', '$ −100'],
  explicacion: '(50 − 45 − 1) × 100 = 400.',
  trampas: '500: olvidar la prima. 4: olvidar que el contrato es de 100 acciones. −100: es el resultado si la acción vale $38.' });

Q({ id: 'U5-P04', unidad: 5, tema: 'Cobertura', dificultad: 2, tipo: 'práctica', fuente: 'Guía U5, ej. 2',
  enunciado: 'Tenés 1.000 acciones de NVDA a $72 y comprás 10 contratos del put NVDA.P.70 (100 acciones cada uno) a $1 por acción. Si al vencimiento NVDA vale $66, ¿cuánto vale tu posición neta de la prima pagada?',
  correcta: '$ 69.000', incorrectas: ['$ 70.000', '$ 66.000', '$ 65.000'],
  explicacion: 'Acciones: 66.000. Puts: (70 − 66) × 1.000 = 4.000. Prima: −1.000. Total: 69.000.',
  trampas: '70.000: olvidar la prima. 66.000: olvidar el put. 65.000: restar la prima pero olvidar el pago del put.' });

Q({ id: 'U5-P05', unidad: 5, tema: 'Moneyness', dificultad: 1, tipo: 'práctica', fuente: 'Nuevo · Hull cap. 7',
  enunciado: 'Una acción vale 105. Un call con strike 100 cotiza a 7,50. ¿Cuál es su valor tiempo?',
  correcta: '2,50', incorrectas: ['5,00', '7,50', '12,50'],
  explicacion: 'Valor intrínseco = 105 − 100 = 5. Valor tiempo = 7,50 − 5 = 2,50.',
  trampas: '5,00 es el valor intrínseco. 12,50 suma en lugar de restar.' });

Q({ id: 'U5-P06', unidad: 5, tema: 'Moneyness', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo · Hull cap. 7',
  enunciado: 'Una acción vale 105. Un put con strike 100 cotiza a 1,80. ¿Cuál es su valor tiempo?',
  correcta: '1,80', incorrectas: ['6,80', '0,00', '5,00'],
  explicacion: 'El put está fuera del dinero: valor intrínseco = máx(100 − 105; 0) = 0. Toda la prima es valor tiempo.',
  trampas: '6,80: tomar el valor intrínseco como K − S = −5 (sin el máximo con 0). 0,00: creer que una opción OTM no tiene valor tiempo.' });
{
  // Guía U5, ej. 3
  const li = 28 - 25 * EXP(-0.08 / 3);
  Q({ id: 'U5-P07', unidad: 5, tema: 'Límites', dificultad: 2, tipo: 'práctica', fuente: 'Guía U5, ej. 3',
    enunciado: '¿Cuál es el límite inferior de un call europeo a 4 meses sobre una acción sin dividendos, con S₀ = 28, K = 25 y r = 8 % anual?',
    correcta: f(li), incorrectas: [f(3), f(28 - 25 * EXP(-0.08)), f(0)],
    explicacion: `c ≥ S₀ − K·e^(−rT) = 28 − 25·e^(−0,08·4/12) = ${f(li)}.`,
    trampas: '3,00: no descontar K. 4,92: usar T = 1 año. 0,00: quedarse con el cero del máximo.' });

  const capital = (28 - 3.5) * EXP(0.08 / 3);
  Q({ id: 'U5-P08', unidad: 5, tema: 'Arbitraje', dificultad: 3, tipo: 'práctica', fuente: 'Guía U5, ej. 3',
    enunciado: 'Con S₀ = 28, K = 25, r = 8 % y T = 4 meses, el call cotiza a 3,50 (por debajo de su límite inferior). Se compra el call, se vende en corto la acción y se coloca el dinero. ¿Cuál es la ganancia al vencimiento si la acción vale 20?',
    correcta: f(capital - 20), incorrectas: [f(28 - 3.5 - 20), f(capital - 25), f(25 - 20)],
    explicacion: `Se colocan 28 − 3,50 = 24,50, que crecen a ${f(capital)}. Con S_T = 20 el call no se ejerce y se recompra la acción a 20.`,
    trampas: '4,50: olvidar los intereses. 0,16: es la ganancia si la acción vale 30 (se ejerce a 25). 5,00: K − S_T.' });
}
Q({ id: 'U5-P09', unidad: 5, tema: 'Límites', dificultad: 2, tipo: 'práctica', fuente: 'Guía U5, ej. 4',
  enunciado: '¿Cuál es el límite inferior de un put europeo a 1 mes sobre una acción sin dividendos, con S₀ = 12, K = 15 y r = 6 % anual?',
  correcta: f(15 * EXP(-0.005) - 12), incorrectas: [f(3), f(15 * EXP(-0.06) - 12), f(0)],
  explicacion: 'p ≥ K·e^(−rT) − S₀ = 15·e^(−0,06/12) − 12.',
  trampas: '3,00: no descontar K. 2,13: usar T = 1 año. 0,00: quedarse con el cero del máximo.' });

Q({ id: 'U5-P10', unidad: 5, tema: 'Paridad put-call', dificultad: 2, tipo: 'práctica', fuente: 'Guía U5, ej. 5',
  enunciado: 'Una acción sin dividendos vale 19. Un call europeo a 3 meses con K = 20 vale 1. La tasa es 4 % anual. ¿Cuánto vale el put europeo a 3 meses con K = 20?',
  correcta: f(1 + 20 * EXP(-0.01) - 19), incorrectas: [f(2), f(1 + 19 - 20 * EXP(-0.01)), f(1 + 20 * EXP(-0.04) - 19)],
  explicacion: 'p = c + K·e^(−rT) − S₀ = 1 + 20·e^(−0,04·0,25) − 19.',
  trampas: '2,00: no descontar K. 0,20: invertir los signos de S₀ y K·e^(−rT). 1,78: usar T = 1 año en lugar de 3 meses.' });
{
  // Guía U5, ej. 6 (con dividendos)
  const D = 0.8 * EXP(-0.12 / 12), VPK = 60 * EXP(-0.04);
  Q({ id: 'U5-P11', unidad: 5, tema: 'Límites', dificultad: 3, tipo: 'práctica', fuente: 'Guía U5, ej. 6',
    enunciado: 'Call europeo a 4 meses: S₀ = 64, K = 60, r = 12 % anual. Se espera un dividendo de 0,80 dentro de 1 mes. ¿Cuál es el límite inferior del precio del call?',
    correcta: f(64 - D - VPK), incorrectas: [f(64 - VPK), f(64 - 60), f(64 - 0.8 - 60)],
    explicacion: `c ≥ S₀ − D − K·e^(−rT) = 64 − ${f(D, 3)} − ${f(VPK, 3)}.`,
    trampas: '6,35: ignorar el dividendo. 4,00: S₀ − K. 3,20: restar el dividendo y K sin descontar.' });
}
{
  // Guía U5, ej. 8
  const D = 0.5 * EXP(-0.1 * 2 / 12) + 0.5 * EXP(-0.1 * 5 / 12), VPK = 30 * EXP(-0.05);
  Q({ id: 'U5-P12', unidad: 5, tema: 'Paridad put-call', dificultad: 3, tipo: 'práctica', fuente: 'Guía U5, ej. 8',
    enunciado: 'Un call europeo a 6 meses con K = 30 cuesta 2. La acción vale 29 y paga dividendos de 0,50 dentro de 2 y de 5 meses. Todas las tasas son 10 %. ¿Cuánto vale el put europeo a 6 meses con K = 30?',
    correcta: f(2 + D + VPK - 29), incorrectas: [f(2 + VPK - 29), f(2 - D + VPK - 29), f(2 + 30 - 29)],
    explicacion: `p = c + D + K·e^(−rT) − S₀, con D = valor presente de los dividendos = ${f(D, 4)}.`,
    trampas: '1,54: ignorar los dividendos. 0,57: restar los dividendos en lugar de sumarlos. 3,00: no descontar nada.' });
}
Q({ id: 'U5-P13', unidad: 5, tema: 'Paridad americanas', dificultad: 3, tipo: 'práctica', fuente: 'Guía U5, ej. 9',
  enunciado: 'Un call americano sobre una acción sin dividendos cuesta 4. S₀ = 31, K = 30, T = 3 meses, r = 8 %. ¿Entre qué valores debe estar el put americano con igual strike y vencimiento?',
  correcta: `Entre ${f(4 - (31 - 30 * EXP(-0.02)))} y ${f(4 - 1)}`,
  incorrectas: [`Entre ${f(1)} y ${f(31 - 30 * EXP(-0.02))}`, `Entre ${f(5)} y ${f(4 + 31 - 30 * EXP(-0.02))}`, `Exactamente ${f(4 - (31 - 30 * EXP(-0.02)))}`],
  explicacion: '1 ≤ C − P ≤ 31 − 30·e^(−0,02) = 1,59 ⇒ 4 − 1,59 ≤ P ≤ 4 − 1.',
  trampas: '«Entre 1,00 y 1,59» es la banda de C − P, no de P. «Entre 5,00 y 5,59» suma en lugar de restar. «Exactamente 2,41» aplica la paridad europea, que no vale para americanas.' });
{
  // Guía U5, ej. 10
  const T = 5 / 12, p = 7.72 + 82 * EXP(-0.25 * T) - 80;
  Q({ id: 'U5-P14', unidad: 5, tema: 'Paridad put-call', dificultad: 3, tipo: 'práctica', fuente: 'Guía U5, ej. 10',
    enunciado: 'S₀ = 80. Un call europeo a 5 meses con K = 82 vale 7,72. La tasa libre de riesgo es 25 % (continua). ¿Cuál es el precio "fair" del put con las mismas características?',
    correcta: f(p), incorrectas: [f(7.72 + 82 - 80), f(7.72 + 82 / (1 + 0.25 * T) - 80), f(7.72 + 80 - 82 * EXP(-0.25 * T))],
    explicacion: `p = 7,72 + 82·e^(−0,25·5/12) − 80 = ${f(p)}.`,
    trampas: '9,72: no descontar K. 1,93: descontar con interés simple en vez de continuo. 13,83: invertir S₀ y K·e^(−rT).' });
}
Q({ id: 'U5-P15', unidad: 5, tema: 'Arbitraje', dificultad: 2, tipo: 'práctica', fuente: 'Presentación U5 (límites)',
  enunciado: 'Una acción vale 50 y un call europeo sobre ella cotiza a 52. ¿Qué estrategia de arbitraje corresponde?',
  correcta: 'Vender el call y comprar la acción: se gana al menos 2 hoy.',
  incorrectas: [
    'Comprar el call y vender en corto la acción: se gana 2 hoy.',
    'No hay arbitraje: un call dentro del dinero puede valer más que la acción.',
    'Vender el call y comprar un put: se gana 2 hoy.',
  ],
  explicacion: 'Se viola c ≤ S₀. Se vende lo caro (call) y se compra lo barato (acción). Si se ejerce, se entrega la acción.' });
{
  const vpK = 50 * EXP(-0.05), dif = 5 + vpK - (2 + 50);
  Q({ id: 'U5-P16', unidad: 5, tema: 'Arbitraje', dificultad: 3, tipo: 'práctica', fuente: 'Presentación U5 · Hull cap. 8',
    enunciado: 'S₀ = 50, K = 50, r = 5 %, T = 1 año. El call europeo cotiza a 5 y el put europeo a 2. ¿Qué estrategia de arbitraje corresponde?',
    correcta: `Vender el call, comprar el put y la acción, y tomar prestado K·e^(−rT): se gana ${f(dif)} hoy.`,
    incorrectas: [
      `Comprar el call, vender el put, vender en corto la acción e invertir K·e^(−rT): se gana ${f(dif)} hoy.`,
      'Vender el call y comprar el put: se gana 3,00 hoy.',
      'No hay arbitraje: la diferencia de precios se explica por el valor tiempo.',
    ],
    explicacion: `c + K·e^(−rT) = ${f(5 + vpK)} > p + S₀ = 52: la cartera A está cara. Se vende A y se compra C.`,
    trampas: '«Comprar el call, vender el put…» es la estrategia inversa: compra lo caro. «3,00» es solo c − p.' });
}
{
  const sup = 45 - 42 * EXP(-0.025);
  Q({ id: 'U5-P17', unidad: 5, tema: 'Paridad americanas', dificultad: 3, tipo: 'práctica', fuente: 'Nuevo · Presentación U5',
    enunciado: 'Un put americano sobre una acción sin dividendos cuesta 1,50. S₀ = 45, K = 42, T = 6 meses, r = 5 %. ¿Entre qué valores debe estar el call americano con igual strike y vencimiento?',
    correcta: `Entre ${f(1.5 + 3)} y ${f(1.5 + sup)}`,
    incorrectas: [`Entre ${f(3)} y ${f(sup)}`, `Exactamente ${f(1.5 + sup)}`, `Entre ${f(1.5)} y ${f(3)}`],
    explicacion: `S₀ − K ≤ C − P ≤ S₀ − K·e^(−rT) ⇒ 3 ≤ C − 1,50 ≤ ${f(sup)}.`,
    trampas: '«Entre 3,00 y 4,04» es la banda de C − P. «Exactamente 5,54» aplica la paridad europea. «Entre 1,50 y 3,00» confunde los extremos.' });
}
Q({ id: 'U5-P18', unidad: 5, tema: 'Payoffs', dificultad: 1, tipo: 'práctica', fuente: 'Presentación U5',
  enunciado: 'Comprás un put con strike 50 a una prima de 4. ¿Cuál es tu ganancia máxima?',
  correcta: '46', incorrectas: ['50', 'Ilimitada', '54'],
  explicacion: 'Se da si la acción vale 0: 50 − 0 − 4 = 46.',
  trampas: '50: olvidar la prima. Ilimitada: corresponde al long call.' });

Q({ id: 'U5-P19', unidad: 5, tema: 'Payoffs', dificultad: 2, tipo: 'práctica', fuente: 'Presentación U5',
  enunciado: 'Vendés un call con strike 100 y cobrás 5. Al vencimiento la acción vale 112. ¿Cuál es tu resultado?',
  correcta: '−7', incorrectas: ['−12', '+5', '−17'],
  explicacion: 'Pagás 112 − 100 = 12 y te quedás con la prima de 5: −12 + 5 = −7.',
  trampas: '−12: olvidar la prima. +5: creer que no se ejerce. −17: restar la prima en lugar de sumarla.' });

Q({ id: 'U5-P20', unidad: 5, tema: 'Límites', dificultad: 2, tipo: 'práctica', fuente: 'Guía U5, ej. 7',
  enunciado: 'Un put europeo a 1 mes cotiza a 2,50. S₀ = 47, K = 50, r = 6 % anual. ¿Cuál es su límite inferior y qué indica?',
  correcta: `${f(50 * EXP(-0.005) - 47)}: el put está barato y hay arbitraje.`,
  incorrectas: [
    `${f(50 * EXP(-0.005) - 47)}: el put está caro y hay arbitraje.`,
    '3,00: el put está barato y hay arbitraje.',
    `${f(50 * EXP(-0.005) - 47)}: no hay arbitraje porque el put es europeo.`,
  ],
  explicacion: 'p ≥ 50·e^(−0,005) − 47 = 2,75 > 2,50: el put cotiza por debajo de su límite. Se compran el put y la acción con dinero prestado.',
  trampas: '«2,75: el put está caro» cambia una sola palabra. 3,00 no descuenta K.' });
