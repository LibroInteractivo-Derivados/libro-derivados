// Banco de preguntas · Unidad I · Introducción a los derivados (usa los helpers de preguntas-base.js)

// ---------- Teóricas ----------
Q({ id: 'U1-T01', unidad: 1, tema: 'Derivados', dificultad: 1, tipo: 'teórica', fuente: 'Hull cap. 1',
  enunciado: 'Un derivado es un instrumento…',
  correcta: 'Cuyo valor depende del valor de otra variable, el subyacente.',
  incorrectas: ['Que solo se negocia en mercados organizados.', 'Que siempre obliga a entregar físicamente un activo.', 'Que rinde una tasa fija conocida de antemano.'],
  explicacion: 'Lo que define a un derivado es que su valor se "deriva" del de un subyacente: un precio, una tasa, un índice, un tipo de cambio.' });

Q({ id: 'U1-T02', unidad: 1, tema: 'Mercados', dificultad: 1, tipo: 'teórica', fuente: 'Hull cap. 1',
  enunciado: 'Una diferencia entre los mercados organizados (bolsa) y el mercado OTC es que en el OTC…',
  correcta: 'Los contratos se negocian a medida y hay más riesgo de crédito de la contraparte.',
  incorrectas: ['Los contratos son estandarizados y hay una cámara que garantiza todas las operaciones.', 'No se pueden negociar swaps.', 'Las operaciones tienen ajuste diario obligatorio para todos los participantes.'],
  explicacion: 'El OTC es una red de contrapartes que pactan contratos a medida. Por eso tiene más riesgo de crédito, aunque después de 2008 muchos swaps estandarizados pasaron a compensarse en una contraparte central.' });

Q({ id: 'U1-T03', unidad: 1, tema: 'Forwards', dificultad: 1, tipo: 'teórica', fuente: 'Hull cap. 1',
  enunciado: 'El payoff de una posición larga en un forward con precio pactado K es…',
  correcta: 'S_T − K',
  incorrectas: ['K − S_T', 'máx(S_T − K; 0)', 'S_T − K − prima'],
  explicacion: 'El largo está obligado a comprar a K algo que vale S_T. No hay prima ni elección: el payoff es lineal.', trampas: 'máx(S_T − K; 0) es el payoff de un call; el forward obliga, no da opción.' });

Q({ id: 'U1-T04', unidad: 1, tema: 'Forwards', dificultad: 1, tipo: 'teórica', fuente: 'Hull cap. 1',
  enunciado: '¿Cuánto cuesta entrar en un contrato forward al precio forward de mercado?',
  correcta: 'Nada: al inicio el contrato vale cero para las dos partes.',
  incorrectas: ['Una prima, como en una opción, que se paga al firmar el contrato.', 'El valor presente del precio pactado, que se paga al inicio.', 'El precio contado del activo, que se deposita como garantía.'],
  explicacion: 'El precio pactado se elige para que el contrato valga cero al inicio. Recién después, al moverse el mercado, gana valor para una parte y lo pierde para la otra.' });

Q({ id: 'U1-T05', unidad: 1, tema: 'Futuros', dificultad: 1, tipo: 'teórica', fuente: 'Hull cap. 2',
  enunciado: '¿Qué hace la cámara compensadora en un mercado de futuros?',
  correcta: 'Se interpone como contraparte de todas las operaciones y garantiza su cumplimiento.',
  incorrectas: ['Fija cada día el precio de los futuros según la oferta y la demanda.', 'Asesora a los inversores sobre qué posición conviene tomar en cada momento.', 'Presta dinero a los inversores para que puedan pagar los márgenes exigidos.'],
  explicacion: 'La cámara compra a todos los que venden y vende a todos los que compran. Con los márgenes y el ajuste diario se protege del incumplimiento.' });

Q({ id: 'U1-T06', unidad: 1, tema: 'Márgenes', dificultad: 1, tipo: 'teórica', fuente: 'Hull cap. 2',
  enunciado: 'Cuando el saldo de la cuenta de márgenes cae por debajo del margen de mantenimiento, el inversor tiene que depositar…',
  correcta: 'Lo necesario para volver al margen inicial.',
  incorrectas: ['Lo necesario para volver al margen de mantenimiento.', 'El margen inicial completo, además del saldo.', 'Nada: el ajuste lo cubre la cámara.'],
  explicacion: 'El llamado de margen repone hasta el margen inicial. El depósito se llama margen de variación (variation margin).', trampas: 'Volver solo al de mantenimiento es el error más común.' });

Q({ id: 'U1-T07', unidad: 1, tema: 'Futuros', dificultad: 2, tipo: 'teórica', fuente: 'Hull cap. 2',
  enunciado: 'Al acercarse el vencimiento, el precio del futuro…',
  correcta: 'Converge al precio contado del activo.',
  incorrectas: ['Se aleja del contado por el costo de tenencia.', 'Queda fijo en el precio pactado al inicio.', 'Converge a cero porque el contrato vence.'],
  explicacion: 'Si al vencimiento el futuro estuviera por encima o por debajo del contado, se podría arbitrar comprando en un mercado y entregando o recibiendo en el otro.' });

Q({ id: 'U1-T08', unidad: 1, tema: 'Futuros', dificultad: 2, tipo: 'teórica', fuente: 'Hull cap. 2',
  enunciado: 'El interés abierto (open interest) de un futuro es…',
  correcta: 'La cantidad de contratos en circulación: posiciones largas abiertas (igual a las cortas).',
  incorrectas: ['La cantidad de contratos negociados en el día, sumando compras y ventas.', 'La suma de las posiciones largas y cortas abiertas, contadas por separado.', 'El monto total que los operadores tienen depositado como margen en la cámara.'],
  explicacion: 'Cada contrato tiene un largo y un corto: se cuenta una sola vez. El volumen, en cambio, cuenta operaciones del día.', trampas: 'Sumar largos y cortos duplica el interés abierto.' });

Q({ id: 'U1-T09', unidad: 1, tema: 'Operadores', dificultad: 1, tipo: 'teórica', fuente: 'Hull cap. 1',
  enunciado: 'Una empresa que vende futuros para fijar el precio de la cosecha que va a producir es un…',
  correcta: 'Coberturista (hedger).',
  incorrectas: ['Especulador (speculator).', 'Arbitrajista (arbitrageur).', 'Creador de mercado (market maker).'],
  explicacion: 'Usa el derivado para reducir un riesgo que ya tiene por su actividad.' });

Q({ id: 'U1-T10', unidad: 1, tema: 'Operadores', dificultad: 1, tipo: 'teórica', fuente: 'Hull cap. 1',
  enunciado: 'Un arbitrajista busca…',
  correcta: 'Una ganancia sin riesgo aprovechando precios inconsistentes entre mercados o instrumentos.',
  incorrectas: ['Apostar a la dirección del precio con apalancamiento, aceptando el riesgo de perder.', 'Reducir el riesgo de una posición que ya tiene, aunque eso limite su ganancia.', 'Cobrar comisiones por intermediar entre compradores y vendedores de contratos.'],
  explicacion: 'Compra lo barato y vende lo caro al mismo tiempo. Su actividad hace que esas inconsistencias desaparezcan rápido.' });

Q({ id: 'U1-T11', unidad: 1, tema: 'Opciones', dificultad: 1, tipo: 'teórica', fuente: 'Hull cap. 1',
  enunciado: 'Frente a un forward, una opción…',
  correcta: 'Da un derecho y no una obligación, y por eso cuesta una prima.',
  incorrectas: ['Obliga a las dos partes a cumplir, y por eso entrar no cuesta nada.', 'Siempre se liquida por diferencias, sin entrega del subyacente.', 'Solo puede usarse para especular, nunca para cubrir un riesgo.'],
  explicacion: 'El comprador elige si ejerce; el vendedor cobra la prima por asumir la obligación.' });

Q({ id: 'U1-T12', unidad: 1, tema: 'Operadores', dificultad: 2, tipo: 'teórica', fuente: 'Hull cap. 1',
  enunciado: 'Un exportador que se cubre con un forward en lugar de con un put…',
  correcta: 'No paga prima, pero resigna la ganancia si el tipo de cambio sube.',
  incorrectas: ['Paga una prima y conserva la ganancia si el tipo de cambio sube.', 'Queda expuesto a pérdidas ilimitadas si el tipo de cambio baja.', 'Obtiene siempre un resultado mejor que con el put.'],
  explicacion: 'El forward fija el precio en los dos sentidos. El put es un seguro: pone un piso y deja la suba, a cambio de la prima.' });

Q({ id: 'U1-T13', unidad: 1, tema: 'Mercados', dificultad: 2, tipo: 'teórica', fuente: 'Datos del mercado argentino',
  enunciado: 'En el dólar futuro que se negocia en A3 Mercados…',
  correcta: 'Cada contrato es por USD 1.000 y se liquida por diferencias en pesos, con ajuste diario.',
  incorrectas: ['Cada contrato es por USD 100.000 y se entregan los dólares al vencimiento.', 'No hay márgenes porque es un contrato a medida.', 'El subyacente es el dólar de los bancos minoristas.'],
  explicacion: 'Es un futuro estandarizado sobre el tipo de cambio mayorista de referencia del BCRA (Com. "A" 3500), sin entrega de dólares.' });

Q({ id: 'U1-T14', unidad: 1, tema: 'Riesgos', dificultad: 2, tipo: 'teórica', fuente: 'Hull cap. 1',
  enunciado: '¿Qué lección dejan casos como Barings o Société Générale?',
  correcta: 'Hay que fijar límites de riesgo claros y controlar que se cumplan, aun cuando el operador gane.',
  incorrectas: ['Los derivados son demasiado riesgosos y deberían prohibirse en los bancos.', 'Las pérdidas se debieron a errores en las fórmulas de valuación de los derivados.', 'Los coberturistas no pueden perder dinero con derivados, solo los especuladores.'],
  explicacion: 'Las pérdidas surgieron de operadores que, fuera de su mandato, tomaron posiciones especulativas enormes sin control efectivo.' });

// ---------- Prácticas ----------
{
  const tol = (6000 - 4500) / 100;
  Q({ id: 'U1-P01', unidad: 1, tema: 'Márgenes', dificultad: 1, tipo: 'práctica', fuente: 'Nuevo',
    enunciado: 'Un inversor compra 1 futuro de oro (100 onzas) a 1.450. Margen inicial 6.000; de mantenimiento 4.500. ¿A qué precio recibe un llamado de margen?',
    correcta: `Por debajo de ${f(1450 - tol)}`, incorrectas: [`Por debajo de ${f(1450 - 45)}`, `Por debajo de ${f(1450 - 60)}`, `Por encima de ${f(1450 + tol)}`],
    explicacion: `Puede perder 6.000 − 4.500 = 1.500, es decir ${f(tol)} por onza: el llamado llega por debajo de ${f(1450 - tol)}.`,
    trampas: '1.405 usa todo el margen de mantenimiento; 1.390 usa el margen inicial completo; un largo no recibe llamados cuando el precio sube.' });
}
Q({ id: 'U1-P02', unidad: 1, tema: 'Márgenes', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'Una posición corta de 10 contratos de dólar futuro (USD 1.000) se abrió a $1.480. Hoy el ajuste es $1.505. Margen inicial $100.000 y de mantenimiento $80.000 por contrato. ¿Cuánto hay que depositar?',
  correcta: '$ 250.000', incorrectas: ['$ 50.000', '$ 0, porque la posición es corta', '$ 25.000'],
  explicacion: 'Pierde (1.505 − 1.480) × 1.000 × 10 = 250.000. El saldo queda en 750.000 < 800.000 y hay que volver a 1.000.000: se depositan 250.000.',
  trampas: '50.000 repone solo hasta el mantenimiento; 25.000 olvida los 10 contratos.' });
Q({ id: 'U1-P03', unidad: 1, tema: 'Forwards', dificultad: 1, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'Un productor vende a plazo 1.000 toneladas a 200. Al vencimiento el contado vale 185. ¿Cuál es el resultado del forward?',
  correcta: '+15.000', incorrectas: ['−15.000', '+185.000', '0, porque es una cobertura'],
  explicacion: 'Forward corto: (K − S_T) × 1.000 = (200 − 185) × 1.000 = 15.000. Sumado a la venta en el contado a 185, el productor cobra 200 por tonelada.' });
Q({ id: 'U1-P04', unidad: 1, tema: 'Opciones', dificultad: 1, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'Se compra un contrato de calls (100 acciones) con strike 50 y prima 3. Al vencimiento la acción vale 51. ¿Cuál es el resultado?',
  correcta: '−200', incorrectas: ['+100', '−300', '0'],
  explicacion: 'Se ejerce (51 > 50) y paga 1 por acción, pero la prima fue 3: (1 − 3) × 100 = −200.',
  trampas: '+100 olvida la prima; −300 supone que no se ejerce.' });
{
  const nF = 20000 / (0.1 * 101), ren = (nF * 9) / 20000;
  Q({ id: 'U1-P05', unidad: 1, tema: 'Operadores', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo',
    enunciado: 'Con 20.000 de capital, un especulador compra futuros a 101 depositando un margen del 10 %. El futuro termina en 110. ¿Qué rendimiento obtiene sobre su capital?',
    correcta: pct(ren, 1), incorrectas: [pct(0.09, 1), pct(0.1, 1), pct(9 / 11, 1)],
    explicacion: `Toma una posición de 20.000 / 10,1 = ${f(nF)} unidades y gana 9 por unidad: ${f(nF * 9)}, un ${pct(ren, 1)}.`,
    trampas: `9 % y 10 % ignoran el apalancamiento; ${pct(9 / 11, 1)} calcula el margen con el precio final (110) en lugar del de compra.` });
}
Q({ id: 'U1-P06', unidad: 1, tema: 'Opciones', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'Un exportador compra puts sobre el dólar con strike 1.450 y prima 30. Si al vencimiento el dólar vale 1.550, ¿cuántos pesos netos obtiene por dólar?',
  correcta: '1.520', incorrectas: ['1.420', '1.550', '1.450'],
  explicacion: 'El put no se ejerce: vende a 1.550 en el mercado y descuenta la prima pagada (30).',
  trampas: '1.420 supone que ejerce; 1.550 olvida la prima.' });
Q({ id: 'U1-P07', unidad: 1, tema: 'Operadores', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'Una acción vale USD 20 en Nueva York y $27.500 en Buenos Aires; el dólar está a $1.400. Sin costos, ¿qué hace un arbitrajista por cada acción?',
  correcta: 'Compra en Buenos Aires y vende en Nueva York: gana $500.', incorrectas: ['Compra en Nueva York y vende en Buenos Aires: gana $500.', 'No hay arbitraje: los precios son iguales.', 'Compra en Buenos Aires y vende en Nueva York: gana $1.375.'],
  explicacion: 'En pesos, Nueva York vale 20 × 1.400 = 28.000, más que Buenos Aires (27.500). Se compra lo barato (Buenos Aires) y se vende lo caro: 500 por acción.' });
Q({ id: 'U1-P08', unidad: 1, tema: 'Futuros', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'Durante el período de entrega, el futuro de maíz cotiza 182 y el maíz disponible, 175. ¿Qué operación es un arbitraje?',
  correcta: 'Comprar maíz al contado, vender futuros y entregar: gana 7 por tonelada.', incorrectas: ['Vender maíz al contado y comprar futuros para recibirlo: gana 7 por tonelada.', 'Comprar futuros y esperar a que converjan con el contado: gana 7 por tonelada.', 'Ninguna: durante el período de entrega no hay arbitraje posible.'],
  explicacion: 'Con el futuro por encima del contado en la entrega, se compra el físico, se vende el futuro y se entrega. Esto empuja la convergencia.' });
Q({ id: 'U1-P09', unidad: 1, tema: 'Futuros', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'A compra 20 contratos a B (posiciones nuevas). Después C compra 8 contratos a A. ¿Cuál es el interés abierto?',
  correcta: '20', incorrectas: ['28', '12', '40'],
  explicacion: 'A cierra 8 de sus largos y C abre 8 nuevos: los largos siguen sumando 20 (A 12 + C 8).',
  trampas: '28 es el volumen; 40 suma largos y cortos.' });
Q({ id: 'U1-P10', unidad: 1, tema: 'Márgenes', dificultad: 2, tipo: 'práctica', fuente: 'Basado en Hull, tabla 2.1',
  enunciado: 'En el ejemplo del oro de la teoría (2 contratos de 100 onzas comprados a 1.250, margen inicial 12.000 en total, de mantenimiento 9.000), el día 7 el saldo antes del llamado es 7.980. ¿Cuánto se deposita?',
  correcta: '4.020', incorrectas: ['1.020', '7.980', '3.000'],
  explicacion: 'Se repone hasta el margen inicial: 12.000 − 7.980 = 4.020.',
  trampas: '1.020 repone solo hasta el mantenimiento (9.000).' });

// ---------- Preguntas agregadas (revisión de octubre de 2026) ----------
Q({ id: 'U1-T15', unidad: 1, tema: 'Mercados', dificultad: 1, tipo: 'teórica', fuente: 'Nuevo',
  enunciado: '¿Qué es el riesgo de contraparte y cómo lo reduce un mercado organizado?',
  correcta: 'Es el riesgo de que la otra parte no cumpla; la cámara lo reduce con márgenes y ajuste diario.',
  incorrectas: ['Es el riesgo de que cambie el precio del subyacente; la cámara lo elimina fijando precios máximos.', 'Es el riesgo de que el contrato no tenga liquidez; se reduce con contratos a medida.', 'No existe en los mercados organizados, porque los contratos se liquidan recién al vencimiento.'],
  explicacion: 'La cámara se interpone entre las partes y exige márgenes que se ajustan todos los días: si alguien no repone, se le cierra la posición antes de que la pérdida crezca.',
  trampas: 'El riesgo de precio no lo elimina nadie: lo que se reduce es el de incumplimiento.' });
Q({ id: 'U1-T16', unidad: 1, tema: 'Futuros', dificultad: 1, tipo: 'teórica', fuente: 'Nuevo',
  enunciado: 'Un futuro, a diferencia de un forward sobre el mismo activo,…',
  correcta: 'Está estandarizado, se negocia en un mercado y se ajusta todos los días.',
  incorrectas: ['Se pacta a medida entre dos partes y se liquida solo al vencimiento.', 'Da el derecho, pero no la obligación, de comprar el activo.', 'No tiene riesgo de precio, porque la cámara garantiza el resultado.'],
  explicacion: 'Forward y futuro obligan a las dos partes. La diferencia es dónde y cómo se negocian: el forward es OTC y se liquida al final; el futuro es estandarizado, de bolsa y con ajuste diario.',
  trampas: '«Se pacta a medida» describe al forward. El derecho sin obligación es una opción.' });
Q({ id: 'U1-T17', unidad: 1, tema: 'Opciones', dificultad: 1, tipo: 'teórica', fuente: 'Nuevo',
  enunciado: 'El comprador de un put…',
  correcta: 'Tiene el derecho de vender el subyacente al strike y paga una prima por ese derecho.',
  incorrectas: ['Tiene la obligación de vender el subyacente al strike si el lanzador se lo pide.', 'Tiene el derecho de comprar el subyacente al strike.', 'Cobra una prima a cambio de comprometerse a comprar al strike.'],
  explicacion: 'Put = derecho a vender. El que tiene la obligación es el lanzador, que cobra la prima.',
  trampas: '«Cobra una prima y se compromete a comprar» describe al lanzador del put.' });
Q({ id: 'U1-T18', unidad: 1, tema: 'Opciones', dificultad: 1, tipo: 'teórica', fuente: 'Nuevo',
  enunciado: 'Una opción americana, a diferencia de una europea,…',
  correcta: 'Puede ejercerse en cualquier momento hasta el vencimiento.',
  incorrectas: ['Solo se negocia en los Estados Unidos.', 'Solo puede ejercerse al vencimiento.', 'Se liquida siempre por diferencias, sin entregar el activo.'],
  explicacion: 'El nombre no tiene que ver con el país: americana = ejercicio en cualquier momento; europea = solo al vencimiento.',
  trampas: '«Solo al vencimiento» es la definición de la europea.' });
Q({ id: 'U1-T19', unidad: 1, tema: 'Operadores', dificultad: 2, tipo: 'teórica', fuente: 'Nuevo',
  enunciado: 'Un especulador que compra futuros en lugar del activo…',
  correcta: 'Logra la misma exposición con menos capital, pero las pérdidas también se multiplican.',
  incorrectas: ['Elimina el riesgo de precio, porque el margen cubre las pérdidas.', 'No puede perder más que el margen inicial.', 'Obtiene siempre un rendimiento mayor que si comprara el activo.'],
  explicacion: 'El margen es una fracción del valor del contrato: el apalancamiento amplifica ganancias y pérdidas, que pueden superar el margen (por eso hay llamados).',
  trampas: 'Perder como máximo lo invertido es propio del comprador de una opción, no de un futuro.' });
Q({ id: 'U1-T20', unidad: 1, tema: 'Márgenes', dificultad: 1, tipo: 'teórica', fuente: 'Nuevo',
  enunciado: 'El ajuste diario (marking to market) de un futuro significa que…',
  correcta: 'Cada día se acredita o debita en la cuenta de márgenes la ganancia o la pérdida de la jornada.',
  incorrectas: ['Cada día el precio del futuro se iguala al precio contado.', 'Las ganancias y pérdidas se cobran recién al vencimiento.', 'El margen inicial se devuelve todos los días y se vuelve a depositar.'],
  explicacion: 'Con el precio de ajuste de cada día se calcula el resultado de la jornada y se liquida en la cuenta: el contrato vuelve a "empezar" cada día al nuevo precio.',
  trampas: 'Cobrar todo al vencimiento es lo que pasa con un forward.' });
Q({ id: 'U1-T21', unidad: 1, tema: 'Futuros', dificultad: 1, tipo: 'teórica', fuente: 'Basado en Hull, cap. 2',
  enunciado: 'La mayoría de los contratos de futuros no terminan con la entrega del activo porque…',
  correcta: 'Los operadores cierran la posición antes del vencimiento con una operación opuesta.',
  incorrectas: ['La entrega está prohibida en los mercados organizados.', 'La cámara los cancela automáticamente al vencimiento, sin resultado.', 'Si nadie los ejerce, vencen sin valor, como una opción.'],
  explicacion: 'Quien compró vende la misma cantidad del mismo vencimiento (y al revés): la posición neta queda en cero y el resultado ya se fue liquidando con el ajuste diario.',
  trampas: 'Un futuro no "se ejerce": obliga a las dos partes.' });
Q({ id: 'U1-T22', unidad: 1, tema: 'Riesgos', dificultad: 2, tipo: 'teórica', fuente: 'Basado en Hull, cap. 1',
  enunciado: 'Un coberturista vendió futuros para cubrir una producción, pero la venta se cayó y mantiene abierta la posición en futuros. Ahora…',
  correcta: 'En los hechos pasó a ser un especulador: su posición gana o pierde con el precio y nada la compensa.',
  incorrectas: ['Sigue cubierto mientras mantenga depositado el margen que le exige la cámara.', 'Se convirtió en arbitrajista, porque tiene una posición en futuros sin el activo.', 'No asume riesgo, porque el precio del futuro quedó fijado el día que lo vendió.'],
  explicacion: 'Una cobertura compensa una exposición. Sin la exposición, el futuro queda solo y su resultado depende del precio: es especulación.',
  trampas: 'El precio que se fija es el de la operación, no el resultado: el futuro sigue ganando o perdiendo cada día.' });
Q({ id: 'U1-P11', unidad: 1, tema: 'Márgenes', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'Una posición corta de 5 contratos de dólar futuro (USD 1.000 cada uno) se abrió a $1.500, con un margen inicial total de $75.000 y uno de mantenimiento total de $50.000. ¿A qué precio del futuro llega el primer llamado de margen?',
  correcta: '1.505', incorrectas: ['1.495', '1.515', '1.525'],
  explicacion: 'Se pueden perder 75.000 − 50.000 = 25.000. Un corto pierde 5 × 1.000 = 5.000 pesos por cada peso que sube el dólar: aguanta 5 pesos de suba, hasta 1.505.',
  trampas: '1.495 es el llamado de una posición larga. 1.515 usa todo el margen inicial en lugar de la diferencia con el de mantenimiento. 1.525 olvida multiplicar por los 5 contratos.' });
Q({ id: 'U1-P12', unidad: 1, tema: 'Forwards', dificultad: 1, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'Un importador compra USD 100.000 a plazo a $1.520. Al vencimiento el dólar contado vale $1.480. ¿Cuál es el resultado del forward?',
  correcta: '−4.000.000 pesos', incorrectas: ['+4.000.000 pesos', '−400.000 pesos', '0: el forward no cuesta nada'],
  explicacion: '(1.480 − 1.520) × 100.000 = −4.000.000. Igual paga 1.520 por cada dólar, que es lo que buscaba fijar.',
  trampas: '+4.000.000 es el resultado del vendedor. −400.000 corre la coma. El forward no cuesta nada al inicio, pero al vencimiento sí tiene resultado.' });
Q({ id: 'U1-P13', unidad: 1, tema: 'Opciones', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'Se lanza (vende) un put sobre USD 1.000 con strike $1.450 y prima $25 por dólar. Al vencimiento el dólar vale $1.400. ¿Cuál es el resultado del lanzador?',
  correcta: '−25.000 pesos', incorrectas: ['+25.000 pesos', '−50.000 pesos', '+75.000 pesos'],
  explicacion: 'El comprador ejerce: el lanzador compra a 1.450 algo que vale 1.400 (pierde 50 por dólar) y cobró 25. Neto: −25 × 1.000.',
  trampas: '+25.000 es solo la prima. −50.000 olvida la prima cobrada. +75.000 cambia el signo de la pérdida.' });
Q({ id: 'U1-P14', unidad: 1, tema: 'Operadores', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'Con 10.000 de capital se compran calls con strike 100 y prima 5 sobre una acción que vale 100. Al vencimiento la acción vale 110. ¿Qué rendimiento se obtiene sobre el capital?',
  correcta: '+100 %', incorrectas: ['+10 %', '+200 %', '+5 %'],
  explicacion: 'Se compran 2.000 calls. Cada uno paga 10: 20.000. Menos las primas (10.000), la ganancia es 10.000, el 100 % del capital.',
  trampas: '+10 % es lo que rinde la acción. +200 % olvida restar las primas. +5 % divide la ganancia neta por acción (110 − 105) por el precio de la acción.' });
Q({ id: 'U1-P15', unidad: 1, tema: 'Forwards', dificultad: 1, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'Un exportador vende a plazo USD 50.000 a $1.480. Al vencimiento el dólar contado está en $1.530. ¿Cuántos pesos recibe en total por sus dólares?',
  correcta: '74.000.000', incorrectas: ['76.500.000', '2.500.000', '71.500.000'],
  explicacion: 'El forward fija el precio: entrega los dólares a 1.480. Si los vendiera al contado y liquidara el forward por diferencias, llegaría a lo mismo: 76.500.000 − 2.500.000.',
  trampas: '76.500.000 es sin cobertura. 2.500.000 es solo el resultado (negativo) del forward. 71.500.000 resta dos veces la diferencia.' });
Q({ id: 'U1-P16', unidad: 1, tema: 'Operadores', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'El oro cotiza 2.400 la onza en Nueva York y el equivalente a 2.430 en Londres. Comprar, trasladar y vender cuesta en total 0,5 % de 2.400. ¿Hay arbitraje?',
  correcta: 'Sí: compra en Nueva York y vende en Londres; gana unos 18 por onza.',
  incorrectas: ['Sí: compra en Londres y vende en Nueva York; gana 30 por onza.', 'No: la diferencia es menor que los costos.', 'Sí: gana 30 por onza, porque en un arbitraje los costos no cuentan.'],
  explicacion: 'Los costos son 0,005 × 2.400 = 12. La diferencia (30) los supera: se compra donde está barato y se vende donde está caro, y quedan 18 por onza.',
  trampas: 'Comprar en Londres es comprar lo caro. Los costos sí cuentan: si superaran 30, no habría arbitraje.' });

// ---------- Preguntas basadas en la Guía U1 de la cátedra ----------
{
  // Guía U1, ej. 1: 3 futuros de oro de 100 onzas; margen inicial 4.000 y de mantenimiento 3.000 por contrato.
  const precios = [1750, 1767.5, 1732.15, 1730.42, 1747.72, 1765.2];
  const unidades = 300, inicial = 12000, mantenimiento = 9000;
  const cuenta = (reponerHasta) => {
    let saldo = inicial; const llamadas = [];
    for (let i = 1; i < precios.length; i++) {
      saldo += (precios[i] - precios[i - 1]) * unidades;
      if (saldo < mantenimiento && reponerHasta) { llamadas.push({ dia: i, monto: reponerHasta - saldo }); saldo = reponerHasta; }
    }
    return { saldo, llamadas };
  };
  const ok = cuenta(inicial);                 // se repone hasta el margen inicial (lo correcto)
  const hastaMant = cuenta(mantenimiento);    // error: reponer solo hasta el de mantenimiento
  const sinReponer = cuenta(0);               // error: no depositar
  const acumulada = (precios[5] - precios[0]) * unidades;
  const datos = 'Posición larga en 3 futuros de oro (100 onzas cada uno), pactada el 13/8 a 1.750. Margen inicial: 4.000 por contrato; de mantenimiento: 3.000 por contrato. Cierres: 14/8 1.767,50; 15/8 1.732,15; 16/8 1.730,42; 17/8 1.747,72; 18/8 1.765,20.';
  const dias = ['13/8', '14/8', '15/8', '16/8', '17/8', '18/8'];
  Q({ id: 'U1-P17', unidad: 1, tema: 'Márgenes', dificultad: 3, tipo: 'práctica', fuente: 'Guía U1, ej. 1',
    enunciado: `${datos} Si cada llamada de margen se cubre, ¿cuál es el saldo de la cuenta de margen al cierre del 18/8?`,
    correcta: f(ok.saldo), incorrectas: [f(sinReponer.saldo), f(hastaMant.saldo), f(inicial + ok.llamadas[0].monto + acumulada / 3)],
    explicacion: `El 15/8 la pérdida del día (−10.605) deja la cuenta en 6.645, debajo del mantenimiento (9.000): hay que depositar ${f(ok.llamadas[0].monto)} para volver al inicial. Después: −519, +5.190 y +5.244. Saldo final: ${f(ok.saldo)} (la guía da 21.915).`,
    trampas: `${f(sinReponer.saldo)} olvida el depósito de la llamada de margen. ${f(hastaMant.saldo)} repone solo hasta el margen de mantenimiento: se repone hasta el inicial. La última cuenta la ganancia de un solo contrato.` });
  Q({ id: 'U1-P18', unidad: 1, tema: 'Márgenes', dificultad: 3, tipo: 'práctica', fuente: 'Guía U1, ej. 1',
    enunciado: `${datos} ¿Cuándo hay llamada de margen y cuánto hay que depositar?`,
    correcta: `El ${dias[ok.llamadas[0].dia]}: ${f(ok.llamadas[0].monto)}.`,
    incorrectas: [`El ${dias[hastaMant.llamadas[0].dia]}: ${f(hastaMant.llamadas[0].monto)}.`, `El ${dias[ok.llamadas[0].dia]}: 10.605,00.`, `El 16/8: ${f(inicial - (inicial + (precios[3] - precios[0]) * unidades))}.`],
    explicacion: 'El 15/8 el saldo cae a 6.645, por debajo de 9.000 (3.000 × 3). La llamada de margen pide volver al margen inicial: 12.000 − 6.645 = 5.355.',
    trampas: '2.355 lleva la cuenta solo hasta el mantenimiento. 10.605 es la pérdida del día, no el depósito. La del 16/8 acumula pérdidas como si el 15/8 no se hubiera repuesto nada.' });
  Q({ id: 'U1-P19', unidad: 1, tema: 'Márgenes', dificultad: 2, tipo: 'práctica', fuente: 'Guía U1, ej. 1',
    enunciado: `${datos} ¿Cuál es la ganancia acumulada de la posición al 18/8?`,
    correcta: f(acumulada), incorrectas: [f(acumulada / 3), f(ok.saldo - inicial), f(precios[5] - precios[0])],
    explicacion: '(1.765,20 − 1.750) × 100 onzas × 3 contratos = 4.560. El saldo de la cuenta es otra cosa: incluye el margen inicial y los depósitos.',
    trampas: `${f(acumulada / 3)} cuenta un solo contrato. ${f(ok.saldo - inicial)} resta el margen inicial al saldo, pero el saldo también incluye el depósito de 5.355. 15,20 es la ganancia por onza.` });
}
{
  // Guía U1, ej. 3: cobro de GBP 50 millones en 2 meses; forward vendido a 1,32.
  const N = 50e6, K = 1.32;
  Q({ id: 'U1-P20', unidad: 1, tema: 'Forwards', dificultad: 2, tipo: 'práctica', fuente: 'Guía U1, ej. 3',
    enunciado: 'Una empresa de EE. UU. va a cobrar GBP 50 millones en 2 meses y vende un forward a 1,3200 (spot hoy: 1,3000). Si al vencimiento el spot es 1,2800, ¿cuántos dólares obtiene en total, sumando el cobro y el forward?',
    correcta: `USD ${f(N * K / 1e6, 0)} millones`, incorrectas: [`USD ${f(N * 1.28 / 1e6, 0)} millones`, `USD ${f(N * (1.28 - (K - 1.28)) / 1e6, 0)} millones`, `USD ${f(N * 1.3 / 1e6, 0)} millones`],
    explicacion: 'Vende las libras al contado por 64 millones y el forward gana (1,32 − 1,28) × 50 millones = 2 millones: 66 millones, el precio fijado. Con spot 1,34 también obtendría 66 (67 − 1).',
    trampas: '64 millones ignora el forward. 62 millones cuenta el resultado del forward con el signo cambiado. 65 millones usa el spot de hoy.' });
  Q({ id: 'U1-T23', unidad: 1, tema: 'Riesgos', dificultad: 2, tipo: 'teórica', fuente: 'Guía U1, ej. 3',
    enunciado: 'La misma empresa vendió el forward a 1,32 y al vencimiento la libra subió a 1,34: el forward perdió USD 1 millón y el directorio retó al CFO. ¿Qué argumento técnico lo defiende?',
    correcta: 'La cobertura fijó 66 millones en cualquier escenario: lo que perdió el forward lo ganó la venta al contado.',
    incorrectas: ['La pérdida es solo contable: un forward no implica pagos hasta que se renueva el contrato.', 'Si la libra hubiera seguido subiendo, el forward habría terminado ganando al vencimiento.', 'Debió comprar el forward: así habría ganado con la suba y protegido igual el cobro.'],
    explicacion: 'El objetivo de la cobertura no es ganar con el derivado sino eliminar la incertidumbre: con spot 1,34 obtuvo 67 − 1 = 66 millones; con 1,28 hubiera obtenido 64 + 2 = 66.',
    trampas: 'Al vencimiento el forward sí se liquida. Con la libra más alta, el forward vendido pierde más, no menos. Comprar el forward duplicaría la exposición en lugar de cubrirla.' });
}
{
  // Guía U1, ej. 4: USD 100.000 en acciones a 100 o en calls con strike 100 y prima 10.
  const cap = 100000, S0 = 100, K = 100, prima = 10;
  const acciones = cap / S0, opciones = cap / prima;
  const resAcc = S => acciones * (S - S0), resOpc = S => opciones * Math.max(S - K, 0) - cap;
  const indif = (cap - acciones * S0 + opciones * K - acciones * 0) / (opciones - acciones); // donde resOpc = resAcc (S > K)
  Q({ id: 'U1-P21', unidad: 1, tema: 'Opciones', dificultad: 2, tipo: 'práctica', fuente: 'Guía U1, ej. 4 (variante)',
    enunciado: 'Un trader invierte USD 100.000 al alza de una acción que vale 100: puede comprar acciones o calls con strike 100 que cuestan 10 cada una. Si en 3 meses la acción vale 105, ¿cuál es el resultado de la estrategia con calls?',
    correcta: `${signo(resOpc(105), 0)} (${signo(resOpc(105) / cap * 100, 0)} %)`, incorrectas: [`${signo(resAcc(105), 0)} (${signo(resAcc(105) / cap * 100, 0)} %)`, `${signo(opciones * 5, 0)} (${signo(opciones * 5 / cap * 100, 0)} %)`, `${signo(-acciones * 5, 0)} (${signo(-acciones * 5 / cap * 100, 0)} %)`],
    explicacion: 'Con 100.000 compra 10.000 calls. Cada una paga 5 al vencimiento: 50.000 contra 100.000 de primas, pierde 50.000. Las acciones habrían ganado 5.000. Las calls recién empiezan a ganar por encima de 110.',
    trampas: '+5.000 es el resultado con acciones. +50.000 olvida descontar la prima pagada. −5.000 aplica el apalancamiento de las acciones.' });
  Q({ id: 'U1-P22', unidad: 1, tema: 'Opciones', dificultad: 3, tipo: 'práctica', fuente: 'Guía U1, ej. 4 (variante)',
    enunciado: 'Con los mismos datos (USD 100.000; acción a 100; calls con strike 100 a 10 cada una), ¿a partir de qué precio de la acción al vencimiento la estrategia con calls gana más que la de acciones?',
    correcta: f(indif), incorrectas: ['110,00', '100,00', '120,00'],
    explicacion: `Acciones: 1.000 × (S − 100). Calls: 10.000 × (S − 100) − 100.000. Se igualan cuando 9.000 × (S − 100) = 100.000, es decir S = ${f(indif)}.`,
    trampas: '110 es el punto de equilibrio de las calls (donde dejan de perder), no donde superan a las acciones. 100 es el strike. 120 es uno de los escenarios de la guía, no el punto de corte.' });
}
Q({ id: 'U1-T24', unidad: 1, tema: 'Opciones', dificultad: 2, tipo: 'teórica', fuente: 'Guía U1, ej. 7',
  enunciado: 'Un agricultor va a vender su cosecha en 3 meses y quiere protegerse de una baja del precio. ¿Qué operaciones lo cubren?',
  correcta: 'Vender futuros sobre el commodity o comprar opciones de venta (puts).',
  incorrectas: ['Vender opciones de venta (puts) o comprar futuros sobre el commodity.', 'Comprar futuros sobre el commodity o comprar opciones de compra (calls).', 'Vender opciones de compra (calls) o vender opciones de venta (puts).'],
  explicacion: 'Al futuro vendido le va bien cuando el precio baja, y el put comprado le da el derecho a vender a un precio mínimo. Las dos compensan la caída del valor de la cosecha.',
  trampas: 'Vender un put no protege: obliga a comprar si el precio baja. Comprar futuros o calls duplica la exposición a la baja.' });
Q({ id: 'U1-T25', unidad: 1, tema: 'Forwards', dificultad: 1, tipo: 'teórica', fuente: 'Guía U1, ej. 6',
  enunciado: '¿Cuál de estas características NO corresponde a un contrato forward?',
  correcta: 'Se ajusta diariamente contra una cámara compensadora.',
  incorrectas: ['Se negocia en el mercado OTC, directamente entre las partes.', 'Sus condiciones no están estandarizadas: se pactan a medida.', 'Existe el riesgo de que la contraparte no cumpla.'],
  explicacion: 'El ajuste diario contra una cámara compensadora es propio de los futuros. El forward es OTC, a medida y con riesgo de contraparte.',
  trampas: 'Las otras tres son, justamente, las características del forward según la guía.' });
Q({ id: 'U1-T26', unidad: 1, tema: 'Futuros', dificultad: 2, tipo: 'teórica', fuente: 'Guía U2, ej. 11',
  enunciado: 'Cuando un futuro se liquida con entrega del subyacente, ¿quién establece las condiciones particulares de la entrega (calidad, lugar, fechas)?',
  correcta: 'El mercado que lista el contrato, en las especificaciones del futuro.',
  incorrectas: ['La parte larga, que elige qué calidad recibir al vencimiento.', 'La parte corta, que puede entregar cualquier calidad y en cualquier lugar.', 'Las dos partes, que negocian las condiciones en cada contrato.'],
  explicacion: 'Las condiciones las fija la bolsa. Dentro de las alternativas que ella permite, suele ser la parte corta la que elige, pero no puede salirse de esas especificaciones.',
  trampas: 'Negociar condiciones a medida es propio del forward, no del futuro.' });
Q({ id: 'U1-T27', unidad: 1, tema: 'Márgenes', dificultad: 1, tipo: 'teórica', fuente: 'Guía U2, ej. 13',
  enunciado: '¿Quién tiene que integrar el margen de garantía en un contrato de futuros?',
  correcta: 'Tanto la parte larga como la corta del futuro.',
  incorrectas: ['Solo la parte corta, que es la que entrega el activo.', 'Solo la parte larga, que es la que paga al vencimiento.', 'Las dos partes de un forward, pero no las de un futuro.'],
  explicacion: 'Las dos partes pueden perder con el movimiento del precio, así que las dos depositan margen y reciben o pagan el ajuste diario.',
  trampas: 'Los forwards, en general, no exigen margen: ese es uno de los motivos de su riesgo de contraparte.' });
Q({ id: 'U1-T28', unidad: 1, tema: 'Futuros', dificultad: 1, tipo: 'teórica', fuente: 'Guía U2, ej. 12',
  enunciado: '¿Cuándo converge el precio de un futuro al precio contado del subyacente?',
  correcta: 'Al llegar el período de entrega o vencimiento del contrato.',
  incorrectas: ['Cuando el contrato se opera por primera vez en la rueda.', 'Cada vez que una posición abierta se cierra por compensación.', 'Nunca: siempre queda una diferencia por el costo de tenencia.'],
  explicacion: 'Al vencimiento, comprar el futuro equivale a comprar al contado: si los precios difirieran habría arbitraje. Antes, la diferencia (la base) refleja el costo de tenencia.',
  trampas: 'El costo de tenencia se achica a medida que se acerca el vencimiento y al final desaparece.' });
