// Banco de preguntas · UNIDAD IV · Swaps (usa los helpers de preguntas-base.js)

// ======================================================================
// UNIDAD IV · SWAPS
// ======================================================================

// ---------- Teóricas ----------
Q({ id: 'U4-T01', unidad: 4, tema: 'Definición', dificultad: 1, tipo: 'teórica', fuente: 'Presentación U4 · Hull cap. 6',
  enunciado: '¿Qué es un swap?',
  correcta: 'Un acuerdo privado (OTC) entre dos partes para intercambiar flujos de fondos en fechas futuras según una fórmula preestablecida.',
  incorrectas: [
    'Un contrato estandarizado que cotiza en bolsa para intercambiar flujos de fondos en fechas futuras.',
    'Un préstamo entre dos empresas en el que una paga tasa fija y la otra la recibe.',
    'Una opción que da el derecho, pero no la obligación, de intercambiar flujos de fondos futuros.',
  ],
  explicacion: 'Los swaps son contratos OTC, a medida, y obligan a ambas partes. No son estandarizados ni opcionales.' });

Q({ id: 'U4-T02', unidad: 4, tema: 'Swap de tasa', dificultad: 1, tipo: 'teórica', fuente: 'Hull 6.1',
  enunciado: 'En un swap de tasa de interés plain vanilla, el capital nocional…',
  correcta: 'No se intercambia: solo se usa para calcular los intereses.',
  incorrectas: ['Se intercambia al inicio y al final del contrato.', 'Se intercambia solo al vencimiento.', 'Se amortiza en cuotas iguales durante la vida del swap.'],
  explicacion: 'En el swap de tasa el nocional nunca cambia de manos; en el swap de monedas, en cambio, sí se intercambian los principales.' });

Q({ id: 'U4-T03', unidad: 4, tema: 'Swap de monedas', dificultad: 1, tipo: 'teórica', fuente: 'Hull 6.5',
  enunciado: 'En un swap de monedas típico, los principales…',
  correcta: 'Se intercambian al inicio y al final del contrato.',
  incorrectas: ['No se intercambian: solo se usan para calcular intereses.', 'Se intercambian solo al inicio.', 'Se intercambian solo al final.'],
  explicacion: 'Los principales en cada moneda se eligen equivalentes al tipo de cambio inicial y se intercambian al principio y al final.' });

Q({ id: 'U4-T04', unidad: 4, tema: 'Swap de tasa', dificultad: 2, tipo: 'teórica', fuente: 'Hull 6.1',
  enunciado: 'En un swap plain vanilla, la tasa variable de cada período…',
  correcta: 'Se fija al inicio del período y se paga al final.',
  incorrectas: ['Se fija al final del período y se paga en ese mismo momento.', 'Se fija al inicio del período y se paga en ese mismo momento.', 'Se fija al final del período y se paga al inicio del siguiente.'],
  explicacion: 'Es la convención "set in advance, paid in arrears": por eso el próximo pago variable (k*) ya se conoce hoy.' });

Q({ id: 'U4-T05', unidad: 4, tema: 'Swap de tasa', dificultad: 1, tipo: 'teórica', fuente: 'Hull 6.1',
  enunciado: 'En cada fecha de pago de un swap de tasa…',
  correcta: 'Solo se transfiere la diferencia neta entre los dos intereses.',
  incorrectas: ['Cada parte paga el total de sus intereses a la otra.', 'Solo paga la parte que tiene la tasa fija.', 'Se paga la diferencia de intereses más una porción del nocional.'],
  explicacion: 'Los pagos se netean: paga únicamente la parte cuyo interés es mayor, por la diferencia.' });

Q({ id: 'U4-T06', unidad: 4, tema: 'Swap como bonos', dificultad: 2, tipo: 'teórica', fuente: 'Hull 6.3',
  enunciado: 'Quien paga tasa fija y recibe tasa variable en un swap está, en términos de bonos…',
  correcta: 'Comprado en un bono a tasa variable y vendido en un bono a tasa fija.',
  incorrectas: ['Comprado en un bono a tasa fija y vendido en un bono a tasa variable.', 'Comprado en ambos bonos.', 'Vendido en ambos bonos.'],
  explicacion: 'Recibir variable equivale a tener el bono variable; pagar fijo equivale a haber emitido (estar corto en) el bono fijo.' });

Q({ id: 'U4-T07', unidad: 4, tema: 'Usos', dificultad: 2, tipo: 'teórica', fuente: 'Hull 6.1',
  enunciado: 'Un inversor tiene un bono que le paga una tasa fija y quiere transformarlo en un activo a tasa variable. En un swap debe…',
  correcta: 'Pagar tasa fija y recibir tasa variable.',
  incorrectas: ['Recibir tasa fija y pagar tasa variable.', 'Entrar en un swap de monedas.', 'Comprar un FRA sobre la tasa fija.'],
  explicacion: 'Cobra fija del bono, la entrega en el swap y a cambio recibe variable: neto, cobra variable.' });

Q({ id: 'U4-T08', unidad: 4, tema: 'Intermediario', dificultad: 1, tipo: 'teórica', fuente: 'Hull 6.1',
  enunciado: '¿Cuál es el rol habitual de un banco en un swap?',
  correcta: 'Firma dos swaps que se compensan, gana un margen de pocos puntos básicos y asume el riesgo de crédito de cada parte.',
  incorrectas: [
    'Firma dos swaps que se compensan y gana un margen de pocos puntos básicos sin asumir riesgo de crédito.',
    'Cobra una comisión igual al nocional del swap.',
    'Garantiza a ambas partes una tasa variable fija durante toda la vida del swap.',
  ],
  explicacion: 'Si una empresa incumple, el banco igual debe cumplir con la otra: por eso sí asume riesgo de crédito.' });

Q({ id: 'U4-T09', unidad: 4, tema: 'Intermediario', dificultad: 2, tipo: 'teórica', fuente: 'Hull 6.1',
  enunciado: '¿Qué es el "warehousing" de swaps?',
  correcta: 'Que el banco entre en un swap sin tener todavía la contraparte opuesta y cubra el riesgo mientras tanto.',
  incorrectas: [
    'Que el banco guarde en custodia los nocionales de todos los swaps que intermedia hasta su vencimiento.',
    'Que el banco agrupe varios swaps pequeños de distintos clientes en uno solo para revenderlo.',
    'Que las empresas depositen garantías en el banco antes de firmar el swap, para cubrir el riesgo de crédito.',
  ],
  explicacion: 'El banco actúa como creador de mercado y cubre la posición con bonos, FRAs o futuros hasta encontrar la contraparte.' });

Q({ id: 'U4-T10', unidad: 4, tema: 'Convenciones', dificultad: 1, tipo: 'teórica', fuente: 'Hull 6.1',
  enunciado: 'Un punto básico equivale a…',
  correcta: '0,01 %',
  incorrectas: ['0,1 %', '1 %', '0,001 %'],
  explicacion: '100 puntos básicos = 1 %.' });

Q({ id: 'U4-T11', unidad: 4, tema: 'Ventaja comparativa', dificultad: 2, tipo: 'teórica', fuente: 'Hull 6.2 · Presentación U4',
  enunciado: 'Si a es la diferencia entre las tasas fijas de dos empresas y b la diferencia entre sus tasas variables, la ganancia total que puede repartirse mediante un swap es…',
  correcta: 'a − b',
  incorrectas: ['a + b', 'a', 'a / b'],
  explicacion: 'La ganancia surge de que las diferencias de costo no son iguales en ambos mercados: a − b.' });

Q({ id: 'U4-T12', unidad: 4, tema: 'Ventaja comparativa', dificultad: 3, tipo: 'teórica', fuente: 'Hull 6.2',
  enunciado: 'AAA paga 1,4 % menos que BBB en el mercado de tasa fija y 0,7 % menos en el de tasa variable. Entonces BBB tiene ventaja comparativa en…',
  correcta: 'El mercado de tasa variable.',
  incorrectas: ['El mercado de tasa fija.', 'Ningún mercado, porque AAA consigue mejores tasas en ambos.', 'Ambos mercados por igual.'],
  explicacion: 'BBB paga "menos de más" en variable (0,7 % contra 1,4 %). Ventaja comparativa no es ventaja absoluta.',
  trampas: 'La opción "ningún mercado" confunde ventaja absoluta con ventaja comparativa.' });

Q({ id: 'U4-T13', unidad: 4, tema: 'Ventaja comparativa', dificultad: 3, tipo: 'teórica', fuente: 'Hull 6.2',
  enunciado: '¿Cuál es la principal crítica al argumento de la ventaja comparativa?',
  correcta: 'Las tasas comparadas no son equivalentes: la fija se pacta a plazo, mientras que el margen sobre la variable puede subir en cada renovación si empeora la calificación.',
  incorrectas: [
    'El arbitraje ya eliminó todas las diferencias de tasas entre empresas, por lo que los swaps no generan ganancia para ninguna de las partes.',
    'El intermediario se queda siempre con toda la ganancia del swap, porque es quien asume el riesgo de crédito de ambas empresas.',
    'Los swaps solo pueden firmarse entre empresas con la misma calificación crediticia; si no, el reparto de la ganancia es desigual.',
  ],
  explicacion: 'La tasa "fija" que obtiene BBB depende de que su margen sobre la variable no cambie, y eso no está garantizado.' });

Q({ id: 'U4-T14', unidad: 4, tema: 'Valuación', dificultad: 2, tipo: 'teórica', fuente: 'Hull 6.3',
  enunciado: 'Al momento de firmarse, la tasa fija de un swap ("tasa swap") se elige para que…',
  correcta: 'El valor del swap sea cero para ambas partes.',
  incorrectas: ['Sea igual a la tasa variable vigente.', 'El intermediario obtenga la máxima ganancia posible.', 'El bono a tasa fija valga más que el bono a tasa variable.'],
  explicacion: 'Al inicio ninguna de las partes paga por entrar: B_fix = B_fl = nocional.' });

Q({ id: 'U4-T15', unidad: 4, tema: 'Valuación', dificultad: 2, tipo: 'teórica', fuente: 'Hull 6.4',
  enunciado: 'Inmediatamente después de una fecha de pago, el bono a tasa variable subyacente a un swap vale…',
  correcta: 'Su nominal L.',
  incorrectas: ['L + k*, donde k* es el próximo pago variable.', 'L·e^(−r·t), el nominal descontado.', 'Cero, porque ya pagó el cupón.'],
  explicacion: 'Recién pagado el cupón, el bono paga en adelante la tasa de mercado, por eso vale exactamente el nominal.' });

Q({ id: 'U4-T16', unidad: 4, tema: 'Valuación', dificultad: 3, tipo: 'teórica', fuente: 'Hull 6.4',
  enunciado: 'Si ya está fijado el próximo pago variable k*, que se cobrará en t₁, el valor HOY del bono a tasa variable es…',
  correcta: '(L + k*)·e^(−r₁·t₁)',
  incorrectas: ['L + k*', 'L', 'L·e^(−r₁·t₁) + k*'],
  explicacion: 'Justo antes de t₁ el bono vale L + k*; hoy hay que descontar ese valor hasta t₁.',
  trampas: '"L + k*" es el valor justo antes del pago, no hoy. "L" es el valor justo después.' });

Q({ id: 'U4-T17', unidad: 4, tema: 'Valuación', dificultad: 2, tipo: 'teórica', fuente: 'Hull 6.4',
  enunciado: 'Al valuar un swap como cartera de FRAs, cada tasa variable futura se reemplaza por…',
  correcta: 'La tasa forward implícita hoy en la curva de tasas.',
  incorrectas: ['La tasa variable vigente hoy.', 'La tasa fija del swap.', 'El promedio histórico de la tasa variable.'],
  explicacion: 'Un FRA se valúa suponiendo que se realizará la tasa forward.' });

Q({ id: 'U4-T18', unidad: 4, tema: 'Valuación', dificultad: 3, tipo: 'teórica', fuente: 'Hull 6.4',
  enunciado: 'Al inicio de un swap, con una curva de tasas de pendiente positiva, para quien PAGA tasa fija…',
  correcta: 'Los FRAs de los primeros períodos valen negativo y los de los últimos, positivo.',
  incorrectas: ['Todos los FRAs valen cero.', 'Los FRAs de los primeros períodos valen positivo y los de los últimos, negativo.', 'Todos los FRAs valen negativo.'],
  explicacion: 'Las forwards cortas quedan debajo de la tasa swap y las largas por encima; la suma da cero.',
  trampas: '«Los primeros valen positivo y los últimos, negativo» es la respuesta correcta para quien RECIBE fijo.' });

Q({ id: 'U4-T19', unidad: 4, tema: 'Swap de monedas', dificultad: 2, tipo: 'teórica', fuente: 'Hull 6.5',
  enunciado: 'Si S₀ es el tipo de cambio en unidades de moneda doméstica por unidad de moneda extranjera, el valor de un swap de monedas para quien RECIBE la moneda doméstica es…',
  correcta: 'B_D − S₀·B_F',
  incorrectas: ['S₀·B_F − B_D', 'B_D − B_F / S₀', 'S₀·(B_D − B_F)'],
  explicacion: 'Hay que expresar el bono extranjero en moneda doméstica (multiplicando por S₀) y restarlo del bono doméstico que se recibe.' });

Q({ id: 'U4-T20', unidad: 4, tema: 'Riesgo de crédito', dificultad: 2, tipo: 'teórica', fuente: 'Hull 6',
  enunciado: 'Si una contraparte incumple, el banco que intermedia un swap pierde…',
  correcta: 'El valor del swap con esa contraparte, solo si ese valor es positivo para el banco.',
  incorrectas: ['El valor del swap con esa contraparte, solo si ese valor es negativo para el banco.', 'Siempre el nocional del swap.', 'Nada, porque los flujos se netean.'],
  explicacion: 'Si el swap tenía valor negativo para el banco, el incumplimiento no le genera pérdida.' });

Q({ id: 'U4-T21', unidad: 4, tema: 'Riesgo de crédito', dificultad: 2, tipo: 'teórica', fuente: 'Hull 6',
  enunciado: '¿Por qué el riesgo de crédito es mayor en un swap de monedas que en uno de tasa?',
  correcta: 'Porque al final se intercambian los principales.',
  incorrectas: ['Porque las tasas de interés en distintas monedas son más volátiles.', 'Porque en los swaps de monedas no hay intermediario.', 'Porque los pagos de intereses se netean.'],
  explicacion: 'El intercambio final de principales aumenta mucho la exposición.' });

Q({ id: 'U4-T22', unidad: 4, tema: 'Ventaja comparativa', dificultad: 3, tipo: 'teórica', fuente: 'Guía U4, ej. 3 y 4',
  enunciado: 'En un swap de monedas armado por ventaja comparativa, el intermediario recibe flujos en una moneda y paga en otra. ¿Qué problema enfrenta y cómo lo resuelve?',
  correcta: 'Queda expuesto al riesgo cambiario y lo cubre con contratos forward de moneda.',
  incorrectas: ['No enfrenta ningún riesgo porque los flujos de ambas empresas se compensan.', 'Queda expuesto solo al riesgo de tasa y lo cubre con FRAs.', 'Traslada automáticamente el riesgo cambiario a las empresas.'],
  explicacion: 'Las respuestas de la guía: "el intermediario enfrenta riesgo cambiario y lo soluciona con forwards".' });

Q({ id: 'U4-T23', unidad: 4, tema: 'Convenciones', dificultad: 2, tipo: 'teórica', fuente: 'Hull 6.1',
  enunciado: 'La tasa LIBOR se calculaba con la convención de días…',
  correcta: 'Actual/360',
  incorrectas: ['30/360', 'Actual/365', 'Actual/actual'],
  explicacion: 'La tasa variable usa actual/360; la fija suele usar actual/365 o 30/360.' });

Q({ id: 'U4-T24', unidad: 4, tema: 'Definición', dificultad: 2, tipo: 'teórica', fuente: 'Hull 6.4',
  enunciado: 'Un swap de tasa de interés puede descomponerse como…',
  correcta: 'Una cartera de contratos forward sobre tasas (FRAs).',
  incorrectas: ['Una cartera de opciones sobre tasas.', 'Un único contrato forward sobre la tasa promedio.', 'Un contrato de futuros estandarizado.'],
  explicacion: 'Cada intercambio es un FRA; por eso puede valuarse como cartera de FRAs.' });

Q({ id: 'U4-T25', unidad: 4, tema: 'Valuación', dificultad: 3, tipo: 'teórica', fuente: 'Hull 6.4',
  enunciado: 'Un swap se firmó hoy a la tasa swap de mercado. Una semana después, todas las tasas de interés suben. Para quien PAGA tasa fija, el valor del swap…',
  correcta: 'Se vuelve positivo.',
  incorrectas: ['Se vuelve negativo.', 'Sigue siendo cero, porque el nocional no cambió.', 'Depende solo de la tasa variable ya fijada para el próximo pago.'],
  explicacion: 'Sube la tasa: B_fix cae más que B_fl (que vuelve a la par en cada pago). V = B_fl − B_fix > 0. Además, ahora recibirá una variable más alta contra una fija que quedó baja.' });

Q({ id: 'U4-T26', unidad: 4, tema: 'Definición', dificultad: 1, tipo: 'teórica', fuente: 'Presentación U4',
  enunciado: 'En dólares, la tasa LIBOR fue reemplazada como referencia por…',
  correcta: 'SOFR',
  incorrectas: ['EURIBOR', 'BADLAR', 'La tasa de los bonos del Tesoro a 10 años'],
  explicacion: 'La LIBOR en dólares dejó de publicarse en 2023 y fue reemplazada por la SOFR.' });

Q({ id: 'U4-T27', unidad: 4, tema: 'Usos', dificultad: 2, tipo: 'teórica', fuente: 'Hull 6.1',
  enunciado: 'Una empresa tiene un préstamo a LIBOR + 1 % y teme una suba de tasas. ¿Qué swap le conviene?',
  correcta: 'Pagar tasa fija y recibir LIBOR.',
  incorrectas: ['Recibir tasa fija y pagar LIBOR.', 'Un swap de monedas a tasa variable en ambas patas.', 'Ninguno: un swap no puede cambiar el tipo de tasa de un préstamo existente.'],
  explicacion: 'Recibe LIBOR (cancela la LIBOR del préstamo) y paga fijo: su costo queda fijo.' });

// ---------- Prácticas ----------
{
  // Guía U4, ej. 1
  const a = 6.4 - 5.0, b = 0.6 - 0.1, G = a - b, m = 0.1;
  const g = (G - m) / 2;
  Q({ id: 'U4-P01', unidad: 4, tema: 'Ventaja comparativa', dificultad: 2, tipo: 'práctica', fuente: 'Guía U4, ej. 1',
    enunciado: 'A: fija 5,0 % o LIBOR + 0,1 %. B: fija 6,4 % o LIBOR + 0,6 %. A quiere tasa variable y B tasa fija. Un intermediario cobra 0,1 % y el resto de la ganancia se reparte en partes iguales. ¿Cuánto termina pagando A?',
    correcta: libor(0.1 - g),
    incorrectas: [libor(0.1 - G / 2), libor(0.1 - (G - m)), libor(0.1)],
    explicacion: `a = ${pp(a)}, b = ${pp(b)}, ganancia total = ${pp(G)}; neta del banco = ${pp(G - m)}; ${pp(g)} para cada una. A: LIBOR + 0,10 % − ${pp(g)}.`,
    trampas: `${libor(0.1 - G / 2)}: olvidar el margen del banco. ${libor(0.1 - (G - m))}: darle a A toda la ganancia neta. ${libor(0.1)}: no hacer el swap.` });

  Q({ id: 'U4-P02', unidad: 4, tema: 'Ventaja comparativa', dificultad: 1, tipo: 'práctica', fuente: 'Guía U4, ej. 1',
    enunciado: 'Con las mismas tasas (A: 5,0 % / LIBOR + 0,1 %; B: 6,4 % / LIBOR + 0,6 %), ¿cuál es la ganancia total del swap, antes del margen del intermediario?',
    correcta: pp(G),
    incorrectas: [pp(a + b), pp(a), pp(G - m)],
    explicacion: `a − b = ${pp(a)} − ${pp(b)} = ${pp(G)}.`,
    trampas: `${pp(a + b)}: sumar las diferencias. ${pp(a)}: mirar solo la tasa fija. ${pp(G - m)}: restar ya el margen.` });
}
{
  // Guía U4, ej. 2 (inversión)
  const G = (8.8 - 8.0) - (0 - 0), m = 0.2, g = (G - m) / 2;
  Q({ id: 'U4-P03', unidad: 4, tema: 'Ventaja comparativa', dificultad: 3, tipo: 'práctica', fuente: 'Guía U4, ej. 2',
    enunciado: 'Para una inversión: A recibe 8,0 % fijo o LIBOR; B recibe 8,8 % fijo o LIBOR. A quiere invertir a tasa fija y B a variable. Un banco cobra 0,2 % y el resto se reparte en partes iguales. ¿Cuánto termina recibiendo A?',
    correcta: pp(8.0 + g),
    incorrectas: [pp(8.0 + G / 2), pp(8.0 + (G - m)), pp(8.8)],
    explicacion: `En una inversión, la ventaja es cobrar más. Ganancia total = ${pp(G)}; neta = ${pp(G - m)}; ${pp(g)} cada una. A invierte a LIBOR, entra al swap y termina con 8,0 % + ${pp(g)}.`,
    trampas: `${pp(8.0 + G / 2)}: olvidar el margen. ${pp(8.0 + (G - m))}: darle a A toda la ganancia. ${pp(8.8)}: la tasa fija de B.` });
}
{
  // Guía U4, ej. 3
  const G = (7.0 - 5.0) - (9.0 - 7.5), m = 0.1, g = (G - m) / 2;
  Q({ id: 'U4-P04', unidad: 4, tema: 'Ventaja comparativa', dificultad: 3, tipo: 'práctica', fuente: 'Guía U4, ej. 3',
    enunciado: 'Tasas fijas: A paga 5,0 % en USD o 7,5 % en GBP; B paga 7,0 % en USD o 9,0 % en GBP. A quiere endeudarse en GBP y B en USD. Un banco cobra 0,1 % y el resto se reparte en partes iguales. ¿Cuánto termina pagando B?',
    correcta: `${pp(7.0 - g)} en USD`,
    incorrectas: [`${pp(5.0 + g)} en USD`, `${pp(7.0 - (G - m))} en USD`, `${pp(7.5 - g)} en GBP`],
    explicacion: `Ganancia total = (7,0 − 5,0) − (9,0 − 7,5) = ${pp(G)}; neta = ${pp(G - m)}; ${pp(g)} cada una. B: 7,0 % − ${pp(g)} = ${pp(7.0 - g)} en USD.`,
    trampas: `${pp(5.0 + g)}: partir de la tasa en USD de A en lugar de la de B. ${pp(7.0 - (G - m))}: darle a B toda la ganancia. ${pp(7.5 - g)} en GBP: es lo que paga A.` });
}
{
  // Tabla de flujos
  const N = 10e6, fija = 0.05;
  const neto = tv => (N * tv) / 2 - (N * fija) / 2;
  Q({ id: 'U4-P05', unidad: 4, tema: 'Flujos', dificultad: 1, tipo: 'práctica', fuente: 'Nuevo · Hull 6.1',
    enunciado: 'Una empresa paga 5 % anual fijo y recibe LIBOR, con pagos semestrales sobre $10.000.000. La LIBOR fijada al inicio del semestre es 4,2 % anual. ¿Cuál es el flujo neto de la empresa al final del semestre?',
    correcta: `$ ${signo(neto(0.042), 0)}`,
    incorrectas: [`$ ${signo(2 * neto(0.042), 0)}`, `$ ${signo(-neto(0.042), 0)}`, `$ ${signo(neto(0.042) / 10, 0)}`],
    explicacion: `Recibe 10.000.000 × 4,2 % / 2 = 210.000 y paga 10.000.000 × 5 % / 2 = 250.000: neto −40.000.`,
    trampas: '−80.000: no dividir por 2 la tasa anual. +40.000: invertir el signo. −4.000: error de escala.' });

  Q({ id: 'U4-P06', unidad: 4, tema: 'Flujos', dificultad: 3, tipo: 'práctica', fuente: 'Nuevo · Hull 6.1',
    enunciado: 'Mismo swap (paga 5 % fijo, recibe LIBOR, semestral, $10.000.000). La LIBOR observada al inicio del 1.er semestre fue 4,2 % y al inicio del 2.º semestre, 4,6 %. ¿Cuál es el flujo neto que la empresa cobra o paga al FINAL del 2.º semestre?',
    correcta: `$ ${signo(neto(0.046), 0)}`,
    incorrectas: [`$ ${signo(neto(0.042), 0)}`, `$ ${signo(-neto(0.046), 0)}`, `$ ${signo(neto(0.044), 0)}`],
    explicacion: 'El pago del final del 2.º semestre usa la LIBOR fijada al INICIO del 2.º semestre (4,6 %): 230.000 − 250.000 = −20.000.',
    trampas: '−40.000: usar la LIBOR del 1.er semestre. +20.000: signo invertido. −30.000: promediar las dos tasas.' });
}
Q({ id: 'U4-P07', unidad: 4, tema: 'Usos', dificultad: 2, tipo: 'práctica', fuente: 'Presentación U4 · Hull 6.1',
  enunciado: 'Una empresa tiene un préstamo a LIBOR + 0,2 %. Entra en un swap en el que paga 4 % fijo y recibe LIBOR. ¿Qué tasa termina pagando?',
  correcta: '4,20 % fijo',
  incorrectas: ['3,80 % fijo', 'LIBOR + 4,20 %', '4,00 % fijo'],
  explicacion: 'Paga LIBOR + 0,2 % al banco, recibe LIBOR y paga 4 %: neto 4,2 % fijo.',
  trampas: '3,80 %: restar el margen en lugar de sumarlo. LIBOR + 4,20 %: no cancelar la LIBOR. 4,00 %: olvidar el margen del préstamo.' });
{
  // Valuación por bonos (ejemplo de Hull)
  const t = [0.25, 0.75, 1.25], r = [0.10, 0.105, 0.11];
  const Bfix = 4 * EXP(-r[0] * t[0]) + 4 * EXP(-r[1] * t[1]) + 104 * EXP(-r[2] * t[2]);
  const BfixPlano = 4 * EXP(-0.10 * 0.25) + 4 * EXP(-0.10 * 0.75) + 104 * EXP(-0.10 * 1.25);
  const BfixSinNominal = 4 * EXP(-r[0] * t[0]) + 4 * EXP(-r[1] * t[1]) + 4 * EXP(-r[2] * t[2]);
  const BfixCuponAnual = 8 * EXP(-r[0] * t[0]) + 8 * EXP(-r[1] * t[1]) + 108 * EXP(-r[2] * t[2]);
  const enunciadoBase = 'Swap sobre $100 millones: se recibe 8 % anual fijo (pagos semestrales) y se paga la tasa variable. Quedan pagos dentro de 3, 9 y 15 meses. Tasas cero (continuas): 10 %, 10,5 % y 11 %. La tasa variable fijada para el próximo pago es 10,2 % anual.';
  Q({ id: 'U4-P08', unidad: 4, tema: 'Valuación', dificultad: 2, tipo: 'práctica', fuente: 'Hull 6.4 (ejemplo)',
    enunciado: `${enunciadoBase} ¿Cuánto vale el bono a tasa fija (B_fix), en millones?`,
    correcta: f(Bfix), incorrectas: [f(BfixPlano), f(BfixCuponAnual), f(BfixSinNominal)],
    explicacion: 'B_fix = 4e^(−0,10·0,25) + 4e^(−0,105·0,75) + 104e^(−0,11·1,25).',
    trampas: `${f(BfixPlano)}: descontar todo al 10 %. ${f(BfixCuponAnual)}: usar el cupón anual (8) en vez del semestral (4). ${f(BfixSinNominal)}: olvidar el nominal final.` });

  const Bfl = 105.1 * EXP(-0.025);
  Q({ id: 'U4-P09', unidad: 4, tema: 'Valuación', dificultad: 3, tipo: 'práctica', fuente: 'Hull 6.4 (ejemplo)',
    enunciado: `${enunciadoBase} ¿Cuánto vale el bono a tasa variable (B_fl), en millones?`,
    correcta: f(Bfl), incorrectas: [f(100), f(110.2 * EXP(-0.025)), f(105.1)],
    explicacion: 'k* = 100 × 10,2 % / 2 = 5,1. B_fl = (100 + 5,1)·e^(−0,10·0,25).',
    trampas: `100,00: suponer que vale la par (eso es justo después de un pago). ${f(110.2 * EXP(-0.025))}: usar la tasa anual completa como k*. 105,10: no descontar.` });

  Q({ id: 'U4-P10', unidad: 4, tema: 'Valuación', dificultad: 3, tipo: 'práctica', fuente: 'Hull 6.4 (ejemplo)',
    enunciado: `${enunciadoBase} ¿Cuánto vale el swap para quien recibe fijo, en millones?`,
    correcta: signo(Bfix - Bfl), incorrectas: [signo(Bfl - Bfix), signo(Bfix - 100), signo(0.5 * 100 * (0.08 - 0.102) * EXP(-0.025))],
    explicacion: `V = B_fix − B_fl = ${f(Bfix)} − ${f(Bfl)}.`,
    trampas: `${signo(Bfl - Bfix)}: es el valor para quien paga fijo. ${signo(Bfix - 100)}: suponer B_fl = 100. ${signo(0.5 * 100 * (0.08 - 0.102) * EXP(-0.025))}: valuar solo el primer intercambio.` });
}
{
  const fwd = (0.105 * 0.75 - 0.10 * 0.25) / 0.5;
  Q({ id: 'U4-P11', unidad: 4, tema: 'FRAs', dificultad: 2, tipo: 'práctica', fuente: 'Hull 6.4 (ejemplo)',
    enunciado: 'Las tasas cero (continuas) a 3 y 9 meses son 10 % y 10,5 %. ¿Cuál es la tasa forward (continua) entre los meses 3 y 9?',
    correcta: pct(fwd), incorrectas: [pct(0.1025), pct(2 * (EXP(fwd / 2) - 1)), pct(0.105)],
    explicacion: 'R_F = (R₂T₂ − R₁T₁)/(T₂ − T₁) = (0,105·0,75 − 0,10·0,25)/0,5.',
    trampas: '10,25 %: promediar las tasas. 11,04 %: es la misma forward pero expresada con composición semestral (no es lo que se pide). 10,50 %: tomar la tasa a 9 meses.' });

  Q({ id: 'U4-P12', unidad: 4, tema: 'FRAs', dificultad: 3, tipo: 'práctica', fuente: 'Hull 6.4 (ejemplo)',
    enunciado: 'Una tasa forward de 10,75 % anual con composición continua equivale a una tasa anual con composición SEMESTRAL de…',
    correcta: pct(2 * (EXP(0.1075 / 2) - 1), 3),
    incorrectas: [pct(0.1075, 3), pct(2 * Math.log(1 + 0.1075 / 2), 3), pct(EXP(0.1075) - 1, 3)],
    explicacion: 'R_m = m·(e^(R_c/m) − 1) = 2·(e^(0,05375) − 1).',
    trampas: '10,750 %: no convertir. 10,471 %: aplicar la conversión inversa (de semestral a continua). 11,350 %: convertir a composición anual.' });
}
{
  // Guía U4, ej. 5 a)
  const t1 = 4 / 12, t2 = t1 + 0.5;
  const fix = 3.5e6 * EXP(-0.05 * t1) + 103.5e6 * EXP(-0.05 * t2);
  const fl = 102.3e6 * EXP(-0.05 * t1);
  const fl3 = 102.3e6 * EXP(-0.05 * 0.25), fix3 = 3.5e6 * EXP(-0.05 * 0.25) + 103.5e6 * EXP(-0.05 * 0.75);
  const flMal = 104.6e6 * EXP(-0.05 * t1);
  Q({ id: 'U4-P13', unidad: 4, tema: 'Valuación', dificultad: 3, tipo: 'práctica', fuente: 'Guía U4, ej. 5 a)',
    enunciado: 'Swap de $100 millones con vida restante de 10 meses: se intercambia LIBOR a 6 meses por 7 % anual (compuesto semestralmente). La tasa swap de mercado es 5 % anual continua para todos los plazos. La LIBOR a 6 meses fue 4,6 % anual hace dos meses. ¿Cuánto vale el swap para quien PAGA tasa variable?',
    correcta: `$ ${signo(fix - fl)}`,
    incorrectas: [`$ ${signo(fl - fix)}`, `$ ${signo(fix3 - fl3)}`, `$ ${signo(fix - flMal)}`],
    explicacion: `Pagos en 4 y 10 meses. B_fix = 3,5e^(−0,05·4/12) + 103,5e^(−0,05·10/12) = ${f(fix / 1e6, 4)} M. B_fl = 102,3e^(−0,05·4/12) = ${f(fl / 1e6, 4)} M. Quien paga variable recibe fijo: B_fix − B_fl.`,
    trampas: 'El valor negativo es el de quien paga fijo. +2.117.935,55 supone que el próximo pago es en 3 meses. −152.855,17 usa la LIBOR anual completa (4,6) como cupón variable.' });
}
{
  const r = Swaps.valuarSwapMonedas({ principalDom: 10, tasaDom: 0.06, principalExt: 9, tasaExt: 0.04, spot: 1.05, rDom: 0.05, rExt: 0.03, tiempos: [1, 2, 3] });
  Q({ id: 'U4-P14', unidad: 4, tema: 'Swap de monedas', dificultad: 3, tipo: 'práctica', fuente: 'Presentación U4 · Hull 6.5',
    enunciado: 'Una empresa recibe 6 % anual sobre USD 10 millones y paga 4 % anual sobre EUR 9 millones. Quedan 3 pagos anuales (en 1, 2 y 3 años) con intercambio final de principales. Tasas continuas: 5 % en USD y 3 % en EUR. El euro vale 1,05 USD. ¿Cuánto vale el swap para la empresa, en millones de USD?',
    correcta: signo(r.valorBonos, 4),
    incorrectas: [signo(-r.valorBonos, 4), signo(r.BD - r.BF, 4), signo(r.BD - r.BF / 1.05, 4)],
    explicacion: `B_USD = ${f(r.BD, 4)}; B_EUR = ${f(r.BF, 4)}. V = B_USD − 1,05·B_EUR.`,
    trampas: 'El negativo es el valor para la contraparte. B_USD − B_EUR olvida convertir monedas. B_USD − B_EUR/1,05 divide por el tipo de cambio en vez de multiplicar.' });
}
Q({ id: 'U4-P15', unidad: 4, tema: 'Swap de monedas', dificultad: 2, tipo: 'práctica', fuente: 'Hull 6.5',
  enunciado: 'El euro vale 1,10 USD. Las tasas continuas son 5 % en USD y 3 % en EUR. ¿Cuál es el tipo de cambio forward (USD por EUR) a 2 años?',
  correcta: f(1.10 * EXP(0.04), 4),
  incorrectas: [f(1.10 * EXP(-0.04), 4), f(1.10 * EXP(0.02), 4), f(1.10, 4)],
  explicacion: 'F = S₀·e^((r − r_f)·T) = 1,10·e^((0,05 − 0,03)·2).',
  trampas: `${f(1.10 * EXP(-0.04), 4)}: invertir las tasas. ${f(1.10 * EXP(0.02), 4)}: usar 1 año. 1,1000: suponer que el forward es igual al spot.` });
{
  const t = [0.5, 1, 1.5, 2], z = [0.04, 0.044, 0.047, 0.05];
  const d = t.map((x, i) => EXP(-z[i] * x)), suma = d.reduce((a, b) => a + b, 0);
  const R = (2 * (1 - d[3])) / suma;
  Q({ id: 'U4-P16', unidad: 4, tema: 'Tasa swap', dificultad: 3, tipo: 'práctica', fuente: 'Nuevo · Hull 6.3',
    enunciado: 'Las tasas cero (continuas) a 0,5; 1; 1,5 y 2 años son 4,0 %; 4,4 %; 4,7 % y 5,0 %. ¿Cuál es la tasa swap a 2 años con pagos semestrales (anual, compuesta semestralmente)?',
    correcta: pct(R), incorrectas: [pct(R / 2), pct(z.reduce((a, b) => a + b, 0) / 4), pct((2 * (1 - d[3])) / (suma - d[3]))],
    explicacion: `Al inicio B_fix = L: (R/2)·Σdᵢ + d₄ = 1 ⇒ R = 2·(1 − ${f(d[3], 4)})/${f(suma, 4)}.`,
    trampas: `${pct(R / 2)}: olvidar multiplicar por 2 (es la tasa semestral). ${pct(z.reduce((a, b) => a + b, 0) / 4)}: promediar las tasas cero. ${pct((2 * (1 - d[3])) / (suma - d[3]))}: dejar afuera de la suma el factor del último cupón.` });
}
{
  // Guía U4, ej. 7
  const pv = i => 1 / Math.pow(1.04, i);
  const correcto = 50000 + 100000 * (pv(1) + pv(2) + pv(3) + pv(4));
  const todas450 = 50000 * (1 + pv(1) + pv(2) + pv(3) + pv(4));
  Q({ id: 'U4-P17', unidad: 4, tema: 'Riesgo de crédito', dificultad: 3, tipo: 'práctica', fuente: 'Guía U4, ej. 7',
    enunciado: 'Un banco recibe 10 % anual y paga LIBOR a 6 meses sobre USD 10 millones, con pagos semestrales durante 5 años. La contraparte incumple en el 6.º pago (fin del año 3), cuando la tasa es 8 % anual (compuesta semestralmente) para todos los plazos. La LIBOR fue 9 % a mitad del año 3. ¿Cuál es la pérdida del banco?',
    correcta: `$ ${f(correcto)}`,
    incorrectas: [`$ ${f(450000)}`, `$ ${f(correcto - 50000)}`, `$ ${f(todas450)}`],
    explicacion: 'Quedan 5 intercambios: el incumplido (500.000 − 450.000) y 4 más valuados con la tasa vigente (500.000 − 400.000), descontados al 4 % semestral.',
    trampas: '450.000: sumar sin descontar. 362.989,52 excluye el pago incumplido. 231.494,76 usa la LIBOR vieja (9 %) en todos los períodos.' });
}
Q({ id: 'U4-P18', unidad: 4, tema: 'Intermediario', dificultad: 1, tipo: 'práctica', fuente: 'Presentación U4',
  enunciado: 'La empresa A le paga al banco 4,015 % fijo y el banco le paga a la empresa B 3,985 % fijo (las patas variables se compensan). ¿Cuánto gana el banco?',
  correcta: '0,03 % anual (3 puntos básicos)',
  incorrectas: ['0,30 % anual (30 puntos básicos)', '3 % anual', '0,015 % anual (1,5 puntos básicos)'],
  explicacion: '4,015 % − 3,985 % = 0,03 % = 3 pb.' });
{
  // Guía U4, ej. 6
  const BG = (20e6 * 0.1) / Math.pow(1.07, 0.25) + 22e6 / Math.pow(1.07, 1.25);
  const BU = (30e6 * 0.06) / Math.pow(1.04, 0.25) + 31.8e6 / Math.pow(1.04, 1.25);
  const BGc = 2e6 * EXP(-0.07 * 0.25) + 22e6 * EXP(-0.07 * 1.25), BUc = 1.8e6 * EXP(-0.04 * 0.25) + 31.8e6 * EXP(-0.04 * 1.25);
  Q({ id: 'U4-P19', unidad: 4, tema: 'Swap de monedas', dificultad: 3, tipo: 'práctica', fuente: 'Guía U4, ej. 6',
    enunciado: 'A un swap de divisas le quedan 15 meses. Intercambia 10 % sobre GBP 20 millones por 6 % sobre USD 30 millones, una vez por año. Las tasas de mercado son 4 % en USD y 7 % en GBP, con composición ANUAL. GBPUSD = 1,85. ¿Cuánto vale el swap para quien paga USD?',
    correcta: `$ ${signo(BG * 1.85 - BU)}`,
    incorrectas: [`$ ${signo(BU - BG * 1.85)}`, `$ ${signo(20e6 * 1.85 - 30e6)}`, `$ ${signo(BGc * 1.85 - BUc)}`],
    explicacion: `B_GBP = 2/1,07^0,25 + 22/1,07^1,25 = ${f(BG / 1e6, 4)} M; B_USD = 1,8/1,04^0,25 + 31,8/1,04^1,25 = ${f(BU / 1e6, 4)} M. V = 1,85·B_GBP − B_USD.`,
    trampas: 'El valor negativo es el de quien paga GBP. +7.000.000 mira solo los principales al spot. +8.894.735,95 descuenta con composición continua aunque las tasas son anuales.' });
}
