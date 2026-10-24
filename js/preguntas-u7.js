// Banco de preguntas · Unidad VII · Opciones sobre índices, monedas y futuros (usa los helpers de preguntas-base.js)

// ---------- Teóricas ----------
Q({ id: 'U7-T01', unidad: 7, tema: 'Índices y dividendos', dificultad: 1, tipo: 'teórica', fuente: 'Hull cap. 17',
  enunciado: 'Para valuar una opción europea sobre un activo que paga un rendimiento continuo q, la regla de Merton dice que…',
  correcta: 'Se usa Black-Scholes reemplazando S₀ por S₀·e^(−qT).',
  incorrectas: ['Se usa Black-Scholes reemplazando r por r + q.', 'Se usa Black-Scholes reemplazando K por K·e^(−qT).', 'Se suma q a la volatilidad.'],
  explicacion: 'Un activo que rinde q crece a r − q en el mundo neutral al riesgo: es lo mismo que un activo sin ingresos que vale hoy S₀·e^(−qT).',
  trampas: 'Cambiar r por r − q en todos lados también afectaría el descuento del strike, que sigue siendo e^(−rT).' });
Q({ id: 'U7-T02', unidad: 7, tema: 'Índices y dividendos', dificultad: 1, tipo: 'teórica', fuente: 'Hull cap. 17',
  enunciado: 'Si sube el rendimiento por dividendos de un índice (todo lo demás igual)…',
  correcta: 'El call vale menos y el put vale más.',
  incorrectas: ['El call vale más y el put vale menos.', 'Los dos valen más.', 'No cambia nada: el dividendo ya está en el precio.'],
  explicacion: 'El dividendo baja el precio esperado del índice (el índice cae al pagarlo) y quien tiene la opción no lo cobra.' });
Q({ id: 'U7-T03', unidad: 7, tema: 'Monedas', dificultad: 1, tipo: 'teórica', fuente: 'Hull cap. 17',
  enunciado: 'En el modelo de Garman-Kohlhagen para opciones sobre monedas, el papel de q lo cumple…',
  correcta: 'La tasa libre de riesgo de la moneda extranjera.',
  incorrectas: ['La tasa libre de riesgo de la moneda doméstica.', 'La diferencia entre la tasa doméstica y la extranjera.', 'La volatilidad del tipo de cambio.'],
  explicacion: 'Quien tiene la moneda extranjera la coloca a r_f: es un "dividendo" continuo que quien tiene la opción no cobra.' });
Q({ id: 'U7-T04', unidad: 7, tema: 'Monedas', dificultad: 2, tipo: 'teórica', fuente: 'Hull cap. 17',
  enunciado: 'Si la tasa extranjera es mayor que la doméstica, el precio forward de la moneda extranjera…',
  correcta: 'Está por debajo del contado (cotiza con descuento).',
  incorrectas: ['Está por encima del contado (cotiza con prima).', 'Es igual al contado.', 'Depende de la volatilidad.'],
  explicacion: 'F₀ = S₀·e^((r − r_f)T): si r_f > r, el exponente es negativo.' });
Q({ id: 'U7-T05', unidad: 7, tema: 'Futuros', dificultad: 1, tipo: 'teórica', fuente: 'Hull cap. 18',
  enunciado: 'El modelo de Black para opciones sobre futuros equivale a Black-Scholes-Merton con…',
  correcta: 'S₀ = F₀ y q = r.',
  incorrectas: ['S₀ = F₀ y q = 0.', 'S₀ = F₀·e^(rT) y q = r.', 'S₀ = F₀ y r = 0.'],
  explicacion: 'El futuro no cuesta nada: en el mundo neutral al riesgo su valor esperado no crece, como un activo que rinde exactamente r.' });
Q({ id: 'U7-T06', unidad: 7, tema: 'Futuros', dificultad: 2, tipo: 'teórica', fuente: 'Hull cap. 18',
  enunciado: 'En un árbol binomial de un futuro, la probabilidad neutral al riesgo de suba es…',
  correcta: 'p = (1 − d)/(u − d)',
  incorrectas: ['p = (e^(rΔt) − d)/(u − d)', 'p = (e^((r − q)Δt) − d)/(u − d) con q = 0', 'p = 1/2'],
  explicacion: 'Como el futuro no requiere inversión, su valor esperado en un paso tiene que ser el precio de hoy: p·u + (1 − p)·d = 1.' });
Q({ id: 'U7-T07', unidad: 7, tema: 'Futuros', dificultad: 2, tipo: 'teórica', fuente: 'Hull cap. 18',
  enunciado: 'Si se ejerce un call sobre un futuro, el tenedor recibe…',
  correcta: 'Una posición larga en el futuro más (F − K) en efectivo.',
  incorrectas: ['Una posición corta en el futuro más (K − F) en efectivo.', 'El activo subyacente contra el pago de K.', 'Solo la diferencia F − K, sin posición en futuros.'],
  explicacion: 'Se abre un futuro comprado al último precio de ajuste y se cobra la diferencia con el strike; si quiere, cierra el futuro enseguida.' });
Q({ id: 'U7-T08', unidad: 7, tema: 'Futuros', dificultad: 2, tipo: 'teórica', fuente: 'Hull cap. 18',
  enunciado: 'La paridad put-call para opciones europeas sobre futuros es…',
  correcta: 'c + K·e^(−rT) = p + F₀·e^(−rT)',
  incorrectas: ['c + K·e^(−rT) = p + F₀', 'c + K = p + F₀·e^(−rT)', 'c − p = F₀ − K'],
  explicacion: 'El futuro se reemplaza por un bono que paga F₀ al vencimiento: por eso F₀ también va descontado.',
  trampas: 'c − p = F₀ − K olvida el descuento: la diferencia correcta es (F₀ − K)·e^(−rT).' });
Q({ id: 'U7-T09', unidad: 7, tema: 'Futuros', dificultad: 3, tipo: 'teórica', fuente: 'Hull cap. 18',
  enunciado: '¿Por qué puede convenir ejercer anticipadamente un call americano sobre un futuro, aunque el futuro no pague dividendos?',
  correcta: 'Porque al ejercer se cobra F − K en efectivo y se gana el interés; el futuro se comporta como un activo que rinde r.',
  incorrectas: ['Porque el futuro vence antes que la opción, y al vencer el futuro la opción deja de existir.', 'Porque la volatilidad del futuro es menor que la del contado y la opción pierde valor tiempo.', 'No puede convenir nunca: es igual que un call sobre una acción que no paga dividendos.'],
  explicacion: 'Con q = r el "dividendo" es la tasa: un call muy dentro del dinero vale más ejercido que vivo.' });
Q({ id: 'U7-T10', unidad: 7, tema: 'Futuros', dificultad: 2, tipo: 'teórica', fuente: 'Hull cap. 18',
  enunciado: 'Una opción europea sobre el contado y una sobre un futuro que vence el mismo día, con igual strike…',
  correcta: 'Valen lo mismo, porque al vencimiento F_T = S_T.',
  incorrectas: ['La del futuro vale más porque el futuro tiene ajuste diario.', 'La del contado vale más porque el contado es más volátil.', 'No se pueden comparar.'],
  explicacion: 'Los pagos son idénticos en T; por eso Black sirve también para opciones sobre el contado: alcanza con el precio forward.' });
Q({ id: 'U7-T11', unidad: 7, tema: 'Seguro de cartera', dificultad: 1, tipo: 'teórica', fuente: 'Hull cap. 17',
  enunciado: 'Para asegurar una cartera bien diversificada con β = 1 se compran…',
  correcta: 'Puts sobre el índice: tantos contratos como valor de la cartera dividido el valor de un contrato.',
  incorrectas: ['Calls sobre el índice por el valor de la cartera, para ganar si el mercado sube.', 'Futuros comprados sobre el índice, tantos como el valor de la cartera sobre el contrato.', 'Puts sobre cada una de las acciones de la cartera, en proporción a su peso.'],
  explicacion: 'Un put sobre el índice paga cuando el índice cae por debajo del strike, que es cuando cae la cartera.' });
Q({ id: 'U7-T12', unidad: 7, tema: 'Seguro de cartera', dificultad: 2, tipo: 'teórica', fuente: 'Hull cap. 17',
  enunciado: 'Si la cartera tiene β = 2 en lugar de 1, para asegurarla con puts sobre el índice hacen falta…',
  correcta: 'El doble de contratos, con un strike más cercano al nivel actual del índice.',
  incorrectas: ['El doble de contratos, con el mismo strike.', 'La mitad de contratos, con un strike más bajo.', 'La misma cantidad de contratos, con un strike más alto.'],
  explicacion: 'La cartera se mueve el doble que el índice: hacen falta el doble de puts, y una caída menor del índice ya lleva a la cartera al piso.' });
Q({ id: 'U7-T13', unidad: 7, tema: 'Monedas', dificultad: 2, tipo: 'teórica', fuente: 'Hull cap. 17',
  enunciado: 'Un range forward (para quien va a recibir moneda extranjera) consiste en…',
  correcta: 'Comprar un put con strike bajo y vender un call con strike alto, de igual prima.',
  incorrectas: ['Comprar un call con strike bajo y vender un put con strike alto.', 'Vender un forward y comprar un call.', 'Comprar un put y un call con el mismo strike.'],
  explicacion: 'El put da un piso y el call vendido lo financia a cambio de un techo: costo inicial cero y resultado dentro de una banda.' });

// ---------- Prácticas ----------
{
  const T = 8 / 12, b = bs(50, 50, 0.05, 0.3, T, 0.02);
  Q({ id: 'U7-P01', unidad: 7, tema: 'Índices y dividendos', dificultad: 2, tipo: 'práctica', fuente: 'Guía U7, ej. 1',
    enunciado: `S₀ = K = 50, r = 5 %, σ = 30 %, T = 8 meses, q = 2 %. El call europeo vale…`,
    correcta: f(b.call), incorrectas: [f(bs(50, 50, 0.05, 0.3, T).call), f(b.put), f(bs(50, 50, 0.07, 0.3, T).call)],
    explicacion: `Con S₀·e^(−qT) = ${f(50 * Math.exp(-0.02 * T), 4)}: c = ${f(b.call)}. Sin dividendos sería ${f(bs(50, 50, 0.05, 0.3, T).call)}.` });
}
{
  const lb = 300 * Math.exp(-0.015) - 290 * Math.exp(-0.04);
  Q({ id: 'U7-P02', unidad: 7, tema: 'Índices y dividendos', dificultad: 1, tipo: 'práctica', fuente: 'Hull problema 17.6',
    enunciado: 'Índice 300, q = 3 %, r = 8 %. El límite inferior de un call europeo a 6 meses con K = 290 es…',
    correcta: f(lb), incorrectas: [f(300 - 290 * Math.exp(-0.04)), f(10), f(300 * Math.exp(-0.015) - 290)],
    explicacion: 'S₀·e^(−qT) − K·e^(−rT) = 295,53 − 278,63.' });
}
{
  const b = bs(1.1, 1.05, 0.06, 0.25, 0.5, 0.03);
  Q({ id: 'U7-P03', unidad: 7, tema: 'Monedas', dificultad: 2, tipo: 'práctica', fuente: 'Guía U7, ej. 2',
    enunciado: 'EURUSD = 1,10, K = 1,05, r(USD) = 6 %, r(EUR) = 3 %, σ = 25 %, T = 6 meses. El put europeo vale…',
    correcta: f(b.put, 4), incorrectas: [f(bs(1.1, 1.05, 0.03, 0.25, 0.5, 0.06).put, 4), f(bs(1.1, 1.05, 0.06, 0.25, 0.5).put, 4), f(b.call, 4)],
    explicacion: 'Garman-Kohlhagen con r = 6 % (moneda del precio) y q = r_f = 3 %.',
    trampas: 'Invertir las tasas es el error más común.' });
}
{
  const F = 1.1 * Math.exp(0.015);
  Q({ id: 'U7-P04', unidad: 7, tema: 'Monedas', dificultad: 1, tipo: 'práctica', fuente: 'Hull cap. 5 y 17',
    enunciado: 'EURUSD = 1,10, r(USD) = 6 %, r(EUR) = 3 % (continuas). El forward a 6 meses es…',
    correcta: f(F, 4), incorrectas: [f(1.1 * Math.exp(-0.015), 4), f(1.1 * Math.exp(0.03), 4), f(1.1, 4)],
    explicacion: 'F₀ = S₀·e^((r − r_f)T) = 1,10·e^(0,015).' });
}
{
  const b = Opciones.black76({ F: 20, K: 19, r: 0.04, sigma: 0.35, T: 4 / 12 });
  Q({ id: 'U7-P05', unidad: 7, tema: 'Futuros', dificultad: 2, tipo: 'práctica', fuente: 'Guía U7, ej. 3',
    enunciado: 'F₀ = 20, K = 19, r = 4 %, σ = 35 %, T = 4 meses. El call europeo sobre el futuro vale…',
    correcta: f(b.call), incorrectas: [f(b.put), f(bs(20, 19, 0.04, 0.35, 4 / 12).call), f(1)],
    explicacion: 'Black: c = e^(−rT)[F₀N(d₁) − KN(d₂)]. El call está dentro del dinero y vale más que el put (1,10).',
    trampas: 'La guía tiene invertidas las etiquetas de call y put en sus respuestas.' });
}
{
  const b = Opciones.black76({ F: 19, K: 20, r: 0.12, sigma: 0.2, T: 5 / 12 });
  Q({ id: 'U7-P06', unidad: 7, tema: 'Futuros', dificultad: 2, tipo: 'práctica', fuente: 'Hull problema 18.11',
    enunciado: 'F₀ = 19, K = 20, r = 12 %, σ = 20 %, T = 5 meses. El put europeo sobre el futuro vale…',
    correcta: f(b.put), incorrectas: [f(bs(19, 20, 0.12, 0.2, 5 / 12).put), f(b.call), f((20 - 19) * Math.exp(-0.05))],
    explicacion: 'Black con F₀ = 19: p ≈ 1,50.',
    trampas: `${f(bs(19, 20, 0.12, 0.2, 5 / 12).put)} trata al futuro como una acción sin dividendos (Black-Scholes). ${f(b.call)} es el call. ${f((20 - 19) * Math.exp(-0.05))} es solo el valor intrínseco descontado.` });
}
{
  const D = Math.exp(-0.1);
  Q({ id: 'U7-P07', unidad: 7, tema: 'Futuros', dificultad: 2, tipo: 'práctica', fuente: 'Hull problema 18.13',
    enunciado: 'F₀ = 35 (un año), c = p = 2 con K = 34, r = 10 %. La ganancia de arbitraje en valor presente es…',
    correcta: f(D, 3), incorrectas: [f(1, 3), f(0, 3), f(2 * D, 3)],
    explicacion: 'p + F₀e^(−rT) = 33,669 > c + Ke^(−rT) = 32,764: comprar call, vender put y vender futuro gana (35 − 34)e^(−0,1).' });
}
{
  const N = 2 * 500000 / (100 * 1000);
  Q({ id: 'U7-P08', unidad: 7, tema: 'Seguro de cartera', dificultad: 2, tipo: 'práctica', fuente: 'Hull sección 17.1',
    enunciado: 'Cartera de 500.000 con β = 2; índice en 1.000 con multiplicador 100. ¿Cuántos contratos de puts hacen falta para el seguro?',
    correcta: f(N, 0), incorrectas: [f(5, 0), f(20, 0), f(2.5, 0)],
    explicacion: 'N = β·V₀/(m·S₀) = 2 × 500.000/100.000.' });
}
{
  const K = 1000 * (1 + (0.9 - 1 - 0.03 + 0.01) / 2 + 0.03 - 0.01);
  Q({ id: 'U7-P09', unidad: 7, tema: 'Seguro de cartera', dificultad: 3, tipo: 'práctica', fuente: 'Hull sección 17.1',
    enunciado: 'Misma cartera (β = 2), r = 12 %, q = 4 %, plazo 3 meses, piso 450.000 (−10 %). El strike de los puts es…',
    correcta: f(K, 0), incorrectas: [f(900, 0), f(950, 0), f(980, 0)],
    explicacion: 'Con índice 960: cambio −4 %, dividendos +1 %, exceso sobre r −6 %; cartera: exceso −12 %, rendimiento −9 %, menos 1 % de dividendos = −10 %.' });
}
{
  const p = Opciones.black76({ F: 20, K: 20, r: 0.09, sigma: 0.25, T: 4 / 12 });
  Q({ id: 'U7-P10', unidad: 7, tema: 'Futuros', dificultad: 1, tipo: 'práctica', fuente: 'Hull ejemplo 18.x',
    enunciado: `Un put sobre el futuro de petróleo at the money (F₀ = K = 20) vale ${f(p.put)}. ¿Cuánto vale el call con el mismo strike y vencimiento?`,
    correcta: f(p.call), incorrectas: [f(p.call + 20 * (1 - Math.exp(-0.03))), f(0), f(p.call * 2)],
    explicacion: 'c − p = (F₀ − K)e^(−rT) = 0: si F₀ = K, call y put valen lo mismo.' });
}
