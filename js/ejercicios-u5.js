// Ejercicios · Unidad V · Introducción a las opciones. Formato: ver js/ejercitacion.js
// Convención: tasas anuales continuas, salvo que el enunciado diga otra cosa.
window.EJERCICIOS = window.EJERCICIOS || [];

(function () {
  const E = ej => EJERCICIOS.push(ej);
  const k = (x, d = 2) => fmt(x, d).replace(/,/g, '{,}');
  const exp = Math.exp;
  const LIM = { texto: 'Límites de precios', enlace: 'herramientas.html#limites-de-precios' };
  const PAR = { texto: 'Paridad put-call', enlace: 'herramientas.html#paridad-put-call-despejar-la-incognita' };
  const POS = { texto: 'Las cuatro posiciones básicas', enlace: 'u5-simulacion.html#posiciones-basicas' };

  E({
    id: 'U5-01', titulo: 'Elegir la opción ante una expectativa alcista', fuente: 'Guía U5, ej. 1', tema: 'Payoffs', dificultad: 1,
    enunciado: `<p>Un inversor espera una suba de Intel (INTC) en los próximos 90 días. INTC cotiza a $40. Cotizaciones a 90 días: call 45 con prima 1 y put 45 con prima 6. Cada contrato es por 100 acciones.</p><p>a) ¿Qué opción conviene comprar? b) ¿Cuál es el resultado de un contrato si al vencimiento la acción cotiza a $38? c) ¿Y a $50?</p>`,
    campos: [
      { etiqueta: 'a) Opción a comprar', opciones: ['Call', 'Put'], respuesta: 'Call' },
      { etiqueta: 'b) Resultado si S_T = 38', respuesta: -100, tol: 0.5, errores: [{ valor: -1, mensaje: 'Es por contrato: multiplicá por 100 acciones.' }] },
      { etiqueta: 'c) Resultado si S_T = 50', respuesta: 400, tol: 0.5, errores: [{ valor: 500, mensaje: 'Te falta restar la prima pagada (1 × 100).' }, { valor: 4, mensaje: 'Es por contrato: multiplicá por 100 acciones.' }] },
    ],
    pistas: ['Quien espera una suba quiere el derecho a comprar.'],
    resolucion: `<p>a) Con expectativa alcista se compra el <b>call</b>: el put 45 gana si la acción baja.</p>
      <p>b) A 38 el call no se ejerce (comprar a 45 algo que vale 38 no tiene sentido): se pierde la prima, \\(-1 \\times 100 = -100\\).</p>
      <p>c) A 50 se ejerce: \\((50 - 45 - 1) \\times 100 = 400\\). El break-even es 46.</p>`,
    herramienta: POS,
  });

  E({
    id: 'U5-02', titulo: 'Cobertura de una cartera con puts', fuente: 'Guía U5, ej. 2', tema: 'Payoffs', dificultad: 1,
    enunciado: `<p>Un inversor tiene 1.000 acciones de NVIDIA (NVDA), que cotiza a $72, y quiere protegerse de una baja en los próximos 90 días sin vender las acciones. Cotizaciones: call 70 con prima 4 y put 70 con prima 1 (contratos de 100 acciones).</p><p>a) ¿Qué opción conviene comprar? b) ¿Cuántos contratos? c) ¿Cuánto vale la posición (acciones + puts, neta de la prima) si al vencimiento la acción cotiza a $72? d) ¿Y a $66?</p>`,
    campos: [
      { etiqueta: 'a) Opción a comprar', opciones: ['Put', 'Call'], respuesta: 'Put' },
      { etiqueta: 'b) Contratos', respuesta: 10, tol: 0.01, errores: [{ valor: 1000, mensaje: 'Cada contrato cubre 100 acciones.' }] },
      { etiqueta: 'c) Posición si S_T = 72', respuesta: 71000, tol: 1, errores: [{ valor: 72000, mensaje: 'Restá la prima pagada: 10 contratos × 100 × 1.' }] },
      { etiqueta: 'd) Posición si S_T = 66', respuesta: 69000, tol: 1, errores: [{ valor: 66000, mensaje: 'A 66 se ejerce el put: las acciones se venden a 70.' }, { valor: 70000, mensaje: 'Restá la prima pagada (1.000).' }] },
    ],
    resolucion: `<p>a, b) Para protegerse de una baja se compra el derecho a vender: <b>10 puts</b> (10 × 100 = 1.000 acciones). Costo: \\(10 \\times 100 \\times 1 = 1.000\\).</p>
      <p>c) A 72 el put no se ejerce: \\(72.000 - 1.000 = 71.000\\).</p>
      <p>d) A 66 se ejerce: se venden las acciones a 70, \\(70.000 - 1.000 = 69.000\\). Ese es el piso de la posición, baje lo que baje la acción: es un <i>protective put</i>.</p>`,
    aviso: 'La guía da "69.000 y 71.000", en el orden inverso al de la pregunta: 71.000 corresponde a $72 y 69.000 a $66.',
    herramienta: { texto: 'Simulador de estrategias (protective put)', enlace: 'u8-simulacion.html' },
  });

  {
    const lb = 28 - 25 * exp(-0.08 / 3), fv = 24.5 * exp(0.08 / 3);
    E({
      id: 'U5-03', titulo: 'Límite inferior de un call y arbitraje', fuente: 'Guía U5, ej. 3', tema: 'Límites', dificultad: 2,
      enunciado: `<p>¿Cuál es el límite inferior del precio de un call europeo a 4 meses sobre una acción sin dividendos, si \\(S_0 = 28\\), \\(K = 25\\) y \\(r = 8\\%\\) anual? Si el call cotiza a $3,50, diseñá un arbitraje e indicá la ganancia si al vencimiento la acción cotiza a $20 o a $30.</p>`,
      campos: [
        { etiqueta: 'Límite inferior', respuesta: lb, tol: 0.01, errores: [{ valor: 3, mensaje: 'Restaste K sin descontar: el límite es S₀ − K·e^(−rT).' }] },
        { etiqueta: 'Ganancia si S_T = 20', respuesta: fv - 20, tol: 0.015 },
        { etiqueta: 'Ganancia si S_T = 30', respuesta: fv - 25, tol: 0.015, errores: [{ valor: fv - 30, mensaje: 'A 30 se ejerce el call: la acción para cerrar el corto se compra a 25, no a 30.' }] },
      ],
      pistas: ['El call está barato: comprá el call y vendé en corto la acción.', 'Lo que recaudás hoy (28 − 3,50 = 24,50) se coloca 4 meses al 8 % continuo.'],
      resolucion: `<p>\\(c \\ge S_0 - Ke^{-rT} = 28 - 25e^{-0{,}08 \\times 4/12} = ${k(lb)}\\). A 3,50 el call está barato.</p>
        <p>Hoy: comprar el call (−3,50), vender en corto la acción (+28) y colocar 24,50. En 4 meses: \\(24{,}50\\,e^{0{,}08/3} = ${k(fv)}\\).</p>
        <ul><li>\\(S_T = 20\\): no se ejerce; se recompra la acción a 20. Ganancia: \\(${k(fv)} - 20 = ${k(fv - 20)}\\).</li>
        <li>\\(S_T = 30\\): se ejerce, se compra a 25 y se cierra el corto. Ganancia: \\(${k(fv)} - 25 = ${k(fv - 25)}\\).</li></ul>
        <p>Se gana en cualquier escenario: eso es un arbitraje.</p>`,
      herramienta: LIM,
    });
  }

  {
    const lb = 15 * exp(-0.06 / 12) - 12, deuda = 14.7 * exp(0.06 / 12);
    E({
      id: 'U5-04', titulo: 'Límite inferior de un put y arbitraje', fuente: 'Guía U5, ej. 4', tema: 'Límites', dificultad: 2,
      enunciado: `<p>¿Cuál es el límite inferior del precio de un put europeo a 1 mes sobre una acción sin dividendos, si \\(S_0 = 12\\), \\(K = 15\\) y \\(r = 6\\%\\) anual? Si el put cotiza a $2,70, diseñá un arbitraje e indicá la ganancia si la acción cotiza a $10 o a $20 al vencimiento.</p>`,
      campos: [
        { etiqueta: 'Límite inferior', respuesta: lb, tol: 0.01, errores: [{ valor: 3, mensaje: 'Ese es el valor intrínseco: el límite europeo descuenta el strike, K·e^(−rT) − S₀.' }] },
        { etiqueta: 'Ganancia si S_T = 10', respuesta: 15 - deuda, tol: 0.015 },
        { etiqueta: 'Ganancia si S_T = 20', respuesta: 20 - deuda, tol: 0.015 },
      ],
      pistas: ['El put está barato: se compra el put y la acción, con dinero prestado.'],
      resolucion: `<p>\\(p \\ge Ke^{-rT} - S_0 = 15e^{-0{,}005} - 12 = ${k(lb)}\\). A 2,70 está barato.</p>
        <p>Hoy: se toman prestados \\(2{,}70 + 12 = 14{,}70\\) y se compran el put y la acción. Al vencimiento se devuelven \\(14{,}70\\,e^{0{,}005} = ${k(deuda)}\\).</p>
        <ul><li>\\(S_T = 10\\): se ejerce el put y se vende la acción a 15: \\(15 - ${k(deuda)} = ${k(15 - deuda)}\\).</li>
        <li>\\(S_T = 20\\): se vende la acción a 20: \\(20 - ${k(deuda)} = ${k(20 - deuda)}\\).</li></ul>`,
      herramienta: LIM,
    });
  }

  {
    const p = 1 + 20 * exp(-0.01) - 19;
    E({
      id: 'U5-05', titulo: 'Paridad put-call', fuente: 'Guía U5, ej. 5', tema: 'Paridad', dificultad: 1,
      enunciado: `<p>Una acción sin dividendos vale $19 y un call europeo a 3 meses con strike $20 vale $1. La tasa es 4 % anual. ¿Cuánto vale un put europeo a 3 meses con strike $20?</p>`,
      campos: [{ etiqueta: 'Put', respuesta: p, tol: 0.01, errores: [{ valor: 2, mensaje: 'Falta descontar el strike: K·e^(−rT), no K.' }, { valor: 1 + 20 * exp(-0.04) - 19, mensaje: 'El plazo es 3 meses: T = 0,25, no 1.' }] }],
      resolucion: `<p>\\(c + Ke^{-rT} = p + S_0 \\Rightarrow p = 1 + 20e^{-0{,}04 \\times 0{,}25} - 19 = ${k(p)}\\).</p>`,
      herramienta: PAR,
    });
  }

  {
    const D = 0.8 * exp(-0.01), lb = 64 - D - 60 * exp(-0.04);
    const fv = 59 * exp(0.04) - 0.8 * exp(0.12 * 3 / 12);
    E({
      id: 'U5-06', titulo: 'Límite inferior con dividendos y arbitraje', fuente: 'Guía U5, ej. 6', tema: 'Dividendos', dificultad: 3,
      enunciado: `<p>Un call europeo a 4 meses cotiza a $5. La acción vale $64, el strike es $60 y se espera un dividendo de $0,80 dentro de 1 mes. La tasa es 12 % anual.</p><p>a) Determiná el límite inferior del precio. b) Diseñá un arbitraje e indicá la ganancia si en 4 meses la acción vale $55 o $70.</p>`,
      campos: [
        { etiqueta: 'a) Límite inferior', respuesta: lb, tol: 0.01, errores: [{ valor: 64 - 60 * exp(-0.04), mensaje: 'Falta restar el valor presente del dividendo: quien tiene el call no lo cobra.' }] },
        { etiqueta: 'b) Ganancia si S_T = 55', respuesta: fv - 55, tol: 0.015, errores: [{ valor: 59 * exp(0.04) - 55, mensaje: 'Al estar corto en la acción, hay que pagar el dividendo (0,80 en el mes 1, capitalizado hasta T).' }] },
        { etiqueta: 'b) Ganancia si S_T = 70', respuesta: fv - 60, tol: 0.015 },
      ],
      pistas: ['c ≥ S₀ − D − K·e^(−rT), con D el valor presente del dividendo.', 'Quien está corto en la acción le paga el dividendo al dueño.'],
      resolucion: `<p>a) \\(D = 0{,}80\\,e^{-0{,}12/12} = ${k(D, 4)}\\); \\(c \\ge 64 - ${k(D, 4)} - 60e^{-0{,}04} = ${k(lb)}\\). A 5 el call está barato.</p>
        <p>b) Hoy: comprar el call y vender la acción en corto; se colocan \\(64 - 5 = 59\\). En el mes 1 se paga el dividendo de 0,80 (que en T equivale a \\(0{,}80\\,e^{0{,}12 \\times 3/12}\\)). En T se tiene \\(59e^{0{,}04} - 0{,}80e^{0{,}03} = ${k(fv)}\\).</p>
        <ul><li>\\(S_T = 55\\): se recompra la acción: \\(${k(fv)} - 55 = ${k(fv - 55)}\\).</li><li>\\(S_T = 70\\): se ejerce a 60: \\(${k(fv)} - 60 = ${k(fv - 60)}\\).</li></ul>`,
      herramienta: LIM,
    });
  }

  {
    const lb = 50 * exp(-0.005) - 47, deuda = 49.5 * exp(0.005);
    E({
      id: 'U5-07', titulo: 'Put barato: arbitraje', fuente: 'Guía U5, ej. 7', tema: 'Límites', dificultad: 2,
      enunciado: `<p>Un put europeo a 1 mes cotiza a $2,50. La acción vale $47, el strike es $50 y la tasa es 6 % anual. a) Determiná el límite inferior. b) Diseñá un arbitraje e indicá la ganancia si en un mes la acción vale $40 o $60.</p>`,
      campos: [
        { etiqueta: 'a) Límite inferior', respuesta: lb, tol: 0.01, errores: [{ valor: 3, mensaje: 'Ese es el valor intrínseco. El límite europeo es K·e^(−rT) − S₀.' }] },
        { etiqueta: 'b) Ganancia si S_T = 40', respuesta: 50 - deuda, tol: 0.015 },
        { etiqueta: 'b) Ganancia si S_T = 60', respuesta: 60 - deuda, tol: 0.015 },
      ],
      resolucion: `<p>a) \\(p \\ge 50e^{-0{,}06/12} - 47 = ${k(lb)}\\): a 2,50 el put está barato.</p>
        <p>b) Se piden prestados \\(2{,}50 + 47 = 49{,}50\\) y se compran el put y la acción. Deuda en T: \\(49{,}50\\,e^{0{,}005} = ${k(deuda)}\\).</p>
        <ul><li>\\(S_T = 40\\): se ejerce a 50: \\(50 - ${k(deuda)} = ${k(50 - deuda)}\\).</li><li>\\(S_T = 60\\): se vende a 60: \\(${k(60 - deuda)}\\).</li></ul>`,
      herramienta: LIM,
    });
  }

  {
    const D = 0.5 * exp(-0.1 * 2 / 12) + 0.5 * exp(-0.1 * 5 / 12);
    const p = 2 + D + 30 * exp(-0.05) - 29;
    E({
      id: 'U5-08', titulo: 'Paridad put-call con dividendos', fuente: 'Guía U5, ej. 8', tema: 'Dividendos', dificultad: 2,
      enunciado: `<p>Un call europeo a 6 meses con strike $30 cuesta $2. La acción vale $29 y se esperan dividendos de $0,50 dentro de 2 y de 5 meses. La tasa libre de riesgo es 10 % para todos los plazos. ¿Cuánto vale un put europeo a 6 meses con strike $30?</p>`,
      campos: [{ etiqueta: 'Put', respuesta: p, tol: 0.01, errores: [{ valor: 2 + 30 * exp(-0.05) - 29, mensaje: 'Falta el valor presente de los dividendos: c + D + K·e^(−rT) = p + S₀.' }, { valor: 2 + 1 + 30 * exp(-0.05) - 29, mensaje: 'Los dividendos van a valor presente: D = 0,5e^(−0,1·2/12) + 0,5e^(−0,1·5/12).' }] }],
      resolucion: `<p>\\(D = 0{,}5e^{-0{,}1 \\times 2/12} + 0{,}5e^{-0{,}1 \\times 5/12} = ${k(D, 4)}\\).</p>
        <p>\\(c + D + Ke^{-rT} = p + S_0 \\Rightarrow p = 2 + ${k(D, 4)} + 30e^{-0{,}05} - 29 = ${k(p)}\\).</p>
        <p>Los dividendos hacen bajar la acción el día que se pagan: por eso el put vale más que sin ellos.</p>`,
      herramienta: PAR,
    });
  }

  {
    const inf = 4 - 31 + 30 * exp(-0.02);
    E({
      id: 'U5-09', titulo: 'Límites de un put americano', fuente: 'Guía U5, ej. 9', tema: 'Paridad', dificultad: 3,
      enunciado: `<p>Un call americano sobre una acción sin dividendos cuesta $4. La acción vale $31, el strike es $30, el vencimiento es en 3 meses y la tasa es 8 %. Obtené los límites inferior y superior del precio del put americano con el mismo strike y vencimiento.</p>`,
      campos: [
        { etiqueta: 'Límite inferior del put', respuesta: inf, tol: 0.01 },
        { etiqueta: 'Límite superior del put', respuesta: 3, tol: 0.01 },
      ],
      pistas: ['Para americanas sin dividendos: S₀ − K ≤ C − P ≤ S₀ − K·e^(−rT).'],
      resolucion: `<p>\\(S_0 - K \\le C - P \\le S_0 - Ke^{-rT}\\): \\(1 \\le 4 - P \\le 31 - 30e^{-0{,}02} = ${k(31 - 30 * exp(-0.02))}\\).</p>
        <p>Entonces \\(${k(inf)} \\le P \\le 3\\).</p>
        <p>Por qué: sin dividendos el call americano no se ejerce antes (\\(C = c\\)), y el put americano vale al menos el europeo, que por paridad es \\(c + Ke^{-rT} - S_0\\): de ahí el límite inferior. El superior sale de comparar un call más \\(K\\) en efectivo con un put más la acción: la primera cartera vale al menos lo mismo que la segunda en cualquier momento en que se ejerza el put.</p>`,
      herramienta: PAR,
    });
  }

  {
    const vpK = 82 * exp(-0.25 * 5 / 12), fair = 7.72 + vpK - 80;
    const gB = 82 - (1.4 + 80 - 7.72) * exp(0.25 * 5 / 12);
    const gC = (2.1 + 80 - 7.72) * exp(0.25 * 5 / 12) - 82;
    E({
      id: 'U5-10', titulo: 'Precio "fair" y arbitraje por paridad', fuente: 'Guía U5, ej. 10', tema: 'Paridad', dificultad: 3,
      enunciado: `<p>Una acción vale $80. Un call europeo a 5 meses con strike $82 vale $7,72 y la tasa libre de riesgo es 25 %. a) Determiná el precio fair del put con las mismas características. b) Si el put cotiza a $1,40, ¿cuánto se gana al vencimiento con el arbitraje? c) ¿Y si cotiza a $2,10?</p>`,
      campos: [
        { etiqueta: 'a) Put fair', respuesta: fair, tol: 0.01 },
        { etiqueta: 'b) Ganancia (put a 1,40)', respuesta: gB, tol: 0.015 },
        { etiqueta: 'b) Estrategia', opciones: ['Comprar put y acción, vender call', 'Vender put y acción, comprar call'], respuesta: 'Comprar put y acción, vender call' },
        { etiqueta: 'c) Ganancia (put a 2,10)', respuesta: gC, tol: 0.015 },
      ],
      resolucion: `<p>a) \\(p = c + Ke^{-rT} - S_0 = 7{,}72 + 82e^{-0{,}25 \\times 5/12} - 80 = ${k(fair)}\\).</p>
        <p>b) A 1,40 el put está barato: se compra lo barato (put + acción) y se vende lo caro (call + bono). Se piden prestados \\(1{,}40 + 80 - 7{,}72 = 73{,}68\\); en T se devuelven \\(${k((1.4 + 80 - 7.72) * exp(0.25 * 5 / 12))}\\) y la cartera vale siempre 82: ganancia \\(${k(gB)}\\).</p>
        <p>c) A 2,10 el put está caro: se vende el put y la acción en corto y se compra el call. Se colocan \\(74{,}38\\), que crecen a \\(${k((2.1 + 80 - 7.72) * exp(0.25 * 5 / 12))}\\); en T se pagan 82: ganancia \\(${k(gC)}\\).</p>`,
      herramienta: { texto: 'Paridad y arbitraje', enlace: 'u5-simulacion.html#paridad' },
    });
  }

  E({
    id: 'U5-11', titulo: 'Beneficio de un short put', fuente: 'Nuevo', tema: 'Payoffs', dificultad: 1,
    enunciado: `<p>Un inversor vende un put con strike $50 y cobra una prima de $3. a) ¿Cuál es su beneficio si al vencimiento la acción vale $44? b) ¿Cuál es el break-even? c) ¿Cuál es su ganancia máxima? d) ¿Y su pérdida máxima?</p>`,
    campos: [
      { etiqueta: 'a) Beneficio con S_T = 44', respuesta: -3, tol: 0.01, errores: [{ valor: 3, mensaje: 'El comprador ejerce: el vendedor compra a 50 algo que vale 44 (−6) y cobró 3.' }, { valor: -6, mensaje: 'Sumá la prima cobrada (+3).' }] },
      { etiqueta: 'b) Break-even', respuesta: 47, tol: 0.01, errores: [{ valor: 53, mensaje: 'Para un put vendido el break-even está por debajo del strike: K − prima.' }] },
      { etiqueta: 'c) Ganancia máxima', respuesta: 3, tol: 0.01 },
      { etiqueta: 'd) Pérdida máxima', respuesta: 47, tol: 0.01, errores: [{ valor: -47, mensaje: 'Pedimos el tamaño de la pérdida, en positivo.' }, { valor: 50, mensaje: 'Restá la prima cobrada.' }] },
    ],
    resolucion: `<p>Beneficio del short put: \\(3 - \\max(50 - S_T, 0)\\).</p><p>a) \\(3 - 6 = -3\\). b) \\(50 - 3 = 47\\). c) La prima: 3 (si \\(S_T \\ge 50\\)). d) Si la acción vale 0: \\(3 - 50 = -47\\).</p>`,
    herramienta: POS,
  });

  E({
    id: 'U5-12', titulo: 'Valor intrínseco y valor tiempo', fuente: 'Nuevo', tema: 'Moneyness', dificultad: 1,
    enunciado: `<p>Una acción vale $105. Un call con strike $100 cotiza a $7,50 y un put con strike $100 a $1,80. a) Valor intrínseco y valor tiempo del call. b) Valor intrínseco y valor tiempo del put. c) ¿El put está ITM, ATM u OTM?</p>`,
    campos: [
      { etiqueta: 'a) VI del call', respuesta: 5, tol: 0.01 },
      { etiqueta: 'a) VT del call', respuesta: 2.5, tol: 0.01, errores: [{ valor: 7.5, mensaje: 'El valor tiempo es la prima menos el valor intrínseco.' }] },
      { etiqueta: 'b) VI del put', respuesta: 0, tol: 0.01, errores: [{ valor: -5, mensaje: 'El valor intrínseco nunca es negativo: max(K − S, 0).' }] },
      { etiqueta: 'b) VT del put', respuesta: 1.8, tol: 0.01 },
      { etiqueta: 'c) El put está…', opciones: ['ITM', 'ATM', 'OTM'], respuesta: 'OTM' },
    ],
    resolucion: `<p>a) \\(VI = \\max(105 - 100, 0) = 5\\); \\(VT = 7{,}50 - 5 = 2{,}50\\).</p><p>b) \\(VI = \\max(100 - 105, 0) = 0\\); todo el precio es valor tiempo: 1,80.</p><p>c) Fuera del dinero (OTM): ejercerlo hoy no daría nada.</p>`,
  });

  E({
    id: 'U5-13', titulo: 'Variables que afectan el precio de un put', fuente: 'Nuevo', tema: 'Variables', dificultad: 1,
    enunciado: `<p>a) Si aumenta la volatilidad del subyacente, ¿qué pasa con el precio de un put europeo? b) ¿Y si aumenta la tasa libre de riesgo?</p>`,
    campos: [
      { etiqueta: 'a) Más volatilidad', opciones: ['Sube', 'Baja', 'No cambia', 'Depende del strike'], respuesta: 'Sube' },
      { etiqueta: 'b) Más tasa', opciones: ['Sube', 'Baja', 'No cambia', 'Depende de la volatilidad'], respuesta: 'Baja' },
    ],
    resolucion: `<p>a) Sube: el que tiene la opción gana con las bajas grandes y su pérdida está limitada a la prima, así que más dispersión lo favorece.</p><p>b) Baja: el put es el derecho a cobrar \\(K\\) en el futuro, y con una tasa más alta el valor presente de \\(K\\) es menor.</p>`,
    herramienta: { texto: '¿Cómo cambia el precio de una opción?', enlace: 'u5-simulacion.html#variables' },
  });

  E({
    id: 'U5-14', titulo: 'Límite superior y arbitraje', fuente: 'Nuevo', tema: 'Límites', dificultad: 1,
    enunciado: `<p>Una acción vale $50 y un call europeo sobre ella cotiza a $52. ¿Cuál es la ganancia mínima, sin riesgo, que se obtiene hoy vendiendo el call y comprando la acción?</p>`,
    campos: [{ etiqueta: 'Ganancia mínima hoy', respuesta: 2, tol: 0.01 }],
    resolucion: `<p>El call no puede valer más que la acción (\\(c \\le S_0\\)): da derecho a comprarla pagando algo más. Se vende el call (+52) y se compra la acción (−50): se ganan 2 hoy. Al vencimiento, si ejercen, se entrega la acción y se cobra \\(K\\); si no, queda la acción. Nunca hay pérdida.</p>`,
    herramienta: LIM,
  });

  {
    const p = 4 + 28 * exp(-0.03) - 30;
    E({
      id: 'U5-15', titulo: 'Paridad put-call (2)', fuente: 'Nuevo', tema: 'Paridad', dificultad: 1,
      enunciado: `<p>Un call europeo a 6 meses con strike $28 cuesta $4. La acción vale $30 y la tasa es 6 % anual (continua). ¿Cuánto debe valer el put europeo con el mismo strike y vencimiento?</p>`,
      campos: [{ etiqueta: 'Put', respuesta: p, tol: 0.01, errores: [{ valor: 2, mensaje: 'Falta descontar el strike: 28·e^(−0,03).' }] }],
      resolucion: `<p>\\(p = c + Ke^{-rT} - S_0 = 4 + 28e^{-0{,}03} - 30 = ${k(p)}\\).</p>`,
      herramienta: PAR,
    });
  }

  E({
    id: 'U5-16', titulo: 'Ejercicio anticipado', fuente: 'Nuevo', tema: 'Ejercicio anticipado', dificultad: 2,
    enunciado: `<p>¿Cuándo conviene ejercer anticipadamente un call americano sobre una acción que <b>no paga dividendos</b>?</p>`,
    campos: [{ etiqueta: 'Respuesta', opciones: ['Cuando está muy dentro del dinero', 'Cuando la tasa de interés es alta', 'Nunca: siempre es mejor venderlo', 'Cuando falta poco para el vencimiento'], respuesta: 'Nunca: siempre es mejor venderlo' }],
    resolucion: `<p>Nunca. Ejercer obliga a pagar \\(K\\) antes (se pierde el interés), no se cobra ningún dividendo por tener la acción antes y se pierde la protección ante una baja. El call vale al menos \\(S_0 - Ke^{-rT}\\), que es más que \\(S_0 - K\\): venderlo siempre da más que ejercerlo. Con dividendos o con puts la historia cambia.</p>`,
  });

  {
    const sup = 45 - 42 * exp(-0.025) + 1.5;
    E({
      id: 'U5-17', titulo: 'Banda para un call americano', fuente: 'Nuevo', tema: 'Paridad', dificultad: 2,
      enunciado: `<p>Un put americano sobre una acción sin dividendos cuesta $1,50. La acción vale $45, el strike es $42, el vencimiento es en 6 meses y la tasa es 5 % anual. ¿Entre qué valores tiene que estar el precio del call americano con el mismo strike y vencimiento?</p>`,
      campos: [
        { etiqueta: 'Mínimo del call', respuesta: 4.5, tol: 0.01 },
        { etiqueta: 'Máximo del call', respuesta: sup, tol: 0.01 },
      ],
      resolucion: `<p>\\(S_0 - K \\le C - P \\le S_0 - Ke^{-rT}\\): \\(3 \\le C - 1{,}50 \\le 45 - 42e^{-0{,}025} = ${k(sup - 1.5)}\\).</p><p>Entonces \\(4{,}50 \\le C \\le ${k(sup)}\\).</p>`,
      herramienta: PAR,
    });
  }
})();
