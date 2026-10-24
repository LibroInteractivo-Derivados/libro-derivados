// Ejercicios · Unidad VII · Opciones sobre índices, monedas y futuros. Formato: ver js/ejercitacion.js
// Convención: tasas anuales continuas. q = rendimiento del subyacente (dividendos, tasa extranjera o r para futuros).
window.EJERCICIOS = window.EJERCICIOS || [];

(function () {
  const E = ej => EJERCICIOS.push(ej);
  const k = (x, d = 2) => fmt(x, d).replace(/,/g, '{,}');
  const exp = Math.exp;
  const bs = Opciones.blackScholes, black = Opciones.black76;
  const CALC = { texto: 'Calculadora con q', enlace: 'u7-simulacion.html#calculadora' };
  const BSH = { texto: 'Black-Scholes paso a paso', enlace: 'herramientas.html#black-scholes-paso-a-paso' };

  // ------------------------------------------------------------------
  // Guía U7 · ejercicio 1: índice o acción con dividend yield
  // ------------------------------------------------------------------
  {
    const S = 50, K = 50, r = 0.05, s = 0.3, T = 8 / 12, q = 0.02;
    const b = bs({ S, K, r, sigma: s, T, q });
    const Sq = S * exp(-q * T), Kr = K * exp(-r * T);
    const sinQ = bs({ S, K, r, sigma: s, T, q: 0 });
    E({
      id: 'U7-01', titulo: 'Opción con rendimiento por dividendos', fuente: 'Guía U7, ej. 1', tema: 'Índices y dividendos', dificultad: 2,
      enunciado: `<p>Con una tasa libre de riesgo del 5 %, volatilidad del 30 %, spot y strike de $50, plazo de 8 meses y <i>dividend yield</i> del 2 %, calculá:</p>
        <p>a) el precio mínimo de un call; b) el precio mínimo de un put; c) el precio del call; d) el precio del put; e) los dos lados de la paridad put-call.</p>`,
      campos: [
        { etiqueta: 'a) Mínimo del call', respuesta: Math.max(Sq - Kr, 0), tol: 0.01, errores: [{ valor: S - Kr, mensaje: 'Con dividendos el límite usa S₀·e^(−qT), no S₀: quien tiene el call no cobra los dividendos.' }] },
        { etiqueta: 'b) Mínimo del put', respuesta: Math.max(Kr - Sq, 0), tol: 0.01, errores: [{ valor: Kr - Sq, mensaje: 'K·e^(−rT) − S₀·e^(−qT) da negativo: el límite inferior es el máximo entre eso y cero.' }] },
        { etiqueta: 'c) Call', respuesta: b.call, tol: 0.01, errores: [{ valor: sinQ.call, mensaje: 'Ese es el call sin dividendos. Reemplazá S₀ por S₀·e^(−qT) (o usá d₁ con r − q).' }] },
        { etiqueta: 'd) Put', respuesta: b.put, tol: 0.01, errores: [{ valor: sinQ.put, mensaje: 'Ese es el put sin dividendos: con q > 0 el put vale más.' }] },
        { etiqueta: 'e) c + K·e^(−rT) = p + S₀·e^(−qT)', respuesta: b.call + Kr, tol: 0.01, errores: [{ valor: b.put + S, mensaje: 'El lado del put lleva S₀·e^(−qT), no S₀.' }] },
      ],
      pistas: ['Todo se resuelve con la regla de Merton: donde aparece S₀, poné S₀·e^(−qT).', `S₀·e^(−qT) = ${fmt(Sq, 4)} y K·e^(−rT) = ${fmt(Kr, 4)}.`],
      resolucion: `<p>\\(S_0e^{-qT} = 50e^{-0{,}02 \\times 8/12} = ${k(Sq, 4)}\\) y \\(Ke^{-rT} = 50e^{-0{,}05 \\times 8/12} = ${k(Kr, 4)}\\).</p>
        <p>a) \\(c \\ge ${k(Sq, 4)} - ${k(Kr, 4)} = ${k(Sq - Kr, 4)}\\). b) \\(p \\ge \\max(${k(Kr - Sq, 4)};\\,0) = 0\\).</p>
        <p>c, d) \\(d_1 = \\dfrac{\\ln(S_0/K) + (r - q + \\sigma^2/2)T}{\\sigma\\sqrt T} = ${k(b.d1, 4)}\\), \\(d_2 = ${k(b.d2, 4)}\\). \\(c = S_0e^{-qT}N(d_1) - Ke^{-rT}N(d_2) = ${k(b.call)}\\) y \\(p = Ke^{-rT}N(-d_2) - S_0e^{-qT}N(-d_1) = ${k(b.put)}\\).</p>
        <p>e) \\(${k(b.call)} + ${k(Kr)} = ${k(b.put)} + ${k(Sq)} = ${k(b.call + Kr)}\\).</p>
        <p>Sin dividendos el call valdría ${k(sinQ.call)} y el put ${k(sinQ.put)}: el dividendo baja el precio esperado del subyacente y por eso le resta al call y le suma al put.</p>`,
      herramienta: CALC,
      aviso: `La guía da 53,62 en e); con más decimales es ${fmt(b.call + Kr, 3)} (la guía trunca).`,
    });
  }

  // ------------------------------------------------------------------
  // Guía U7 · ejercicio 2: opción sobre moneda (Garman-Kohlhagen)
  // ------------------------------------------------------------------
  {
    const S = 1.1, K = 1.05, r = 0.06, rf = 0.03, s = 0.25, T = 0.5;
    const b = bs({ S, K, r, sigma: s, T, q: rf });
    const Sq = S * exp(-rf * T), Kr = K * exp(-r * T);
    const mal = bs({ S, K, r: rf, sigma: s, T, q: r });
    E({
      id: 'U7-02', titulo: 'Opción sobre el euro', fuente: 'Guía U7, ej. 2', tema: 'Monedas', dificultad: 2,
      enunciado: `<p>Con una tasa libre de riesgo en dólares del 6 % y del 3 % en euros, volatilidad del 25 %, spot EURUSD 1,10, strike 1,05 y plazo de 6 meses, calculá:</p>
        <p>a) el precio mínimo de un call; b) el precio mínimo de un put; c) el precio del call; d) el precio del put; e) los dos lados de la paridad put-call. (Los precios están en dólares por euro.)</p>`,
      campos: [
        { etiqueta: 'a) Mínimo del call', respuesta: Math.max(Sq - Kr, 0), tol: 0.005, errores: [{ valor: S - Kr, mensaje: 'La moneda extranjera "rinde" r_f: el límite usa S₀·e^(−r_f·T).' }] },
        { etiqueta: 'b) Mínimo del put', respuesta: 0, tol: 0.005 },
        { etiqueta: 'c) Call', respuesta: b.call, tol: 0.005, errores: [{ valor: mal.call, mensaje: 'Invertiste las tasas: r es la del dólar (la moneda en que está el precio) y q = r_f la del euro.' }] },
        { etiqueta: 'd) Put', respuesta: b.put, tol: 0.005, errores: [{ valor: mal.put, mensaje: 'Invertiste las tasas: r = 6 % (dólar) y r_f = 3 % (euro).' }] },
        { etiqueta: 'e) c + K·e^(−rT) = p + S₀·e^(−r_f·T)', respuesta: b.call + Kr, tol: 0.01 },
      ],
      pistas: ['Una moneda extranjera es como una acción que paga un "dividendo" continuo igual a su tasa de interés: q = r_f.', 'La tasa r es la de la moneda en la que se expresa el precio (dólares).'],
      resolucion: `<p>\\(S_0e^{-r_fT} = 1{,}10e^{-0{,}03 \\times 0{,}5} = ${k(Sq, 4)}\\); \\(Ke^{-rT} = 1{,}05e^{-0{,}06 \\times 0{,}5} = ${k(Kr, 4)}\\).</p>
        <p>a) \\(c \\ge ${k(Sq - Kr, 4)}\\). b) \\(p \\ge \\max(${k(Kr - Sq, 4)};0) = 0\\).</p>
        <p>c, d) \\(d_1 = \\dfrac{\\ln(1{,}10/1{,}05) + (0{,}06 - 0{,}03 + 0{,}25^2/2)\\,0{,}5}{0{,}25\\sqrt{0{,}5}} = ${k(b.d1, 4)}\\), \\(d_2 = ${k(b.d2, 4)}\\). \\(c = ${k(b.call, 4)}\\), \\(p = ${k(b.put, 4)}\\).</p>
        <p>e) \\(${k(b.call, 4)} + ${k(Kr, 4)} = ${k(b.put, 4)} + ${k(Sq, 4)} = ${k(b.call + Kr, 4)}\\).</p>
        <p>Como \\(r > r_f\\), el euro cotiza con prima a plazo (\\(F_0 = ${k(S * exp((r - rf) * T), 4)}\\)): eso le suma al call.</p>`,
      herramienta: CALC,
      aviso: `La guía da 1,12 en e); con más decimales es ${fmt(b.call + Kr, 4)} (la guía trunca; redondeado sería 1,13). Se aceptan las dos.`,
    });
  }

  // ------------------------------------------------------------------
  // Guía U7 · ejercicio 3: opción sobre futuros (Black)
  // ------------------------------------------------------------------
  {
    const F = 20, K = 19, r = 0.04, s = 0.35, T = 4 / 12;
    const b = black({ F, K, r, sigma: s, T });
    const D = exp(-r * T);
    E({
      id: 'U7-03', titulo: 'Opción sobre un futuro', fuente: 'Guía U7, ej. 3', tema: 'Futuros', dificultad: 2,
      enunciado: `<p>Con una tasa libre de riesgo del 4 %, volatilidad del 35 %, precio del futuro 20, strike 19 y plazo de 4 meses, calculá:</p>
        <p>a) el precio mínimo de un call sobre el futuro; b) el precio mínimo de un put; c) el precio del call; d) el precio del put; e) los dos lados de la paridad put-call.</p>`,
      campos: [
        { etiqueta: 'a) Mínimo del call', respuesta: (F - K) * D, tol: 0.01, errores: [{ valor: 0, mensaje: 'El call está dentro del dinero (F > K): su mínimo es (F₀ − K)·e^(−rT) > 0. Ojo: la guía tiene invertidos call y put en las respuestas.' }, { valor: F - K * D, mensaje: 'Para futuros el límite es (F₀ − K)·e^(−rT): F₀ también se descuenta, porque el futuro no cuesta nada hoy.' }] },
        { etiqueta: 'b) Mínimo del put', respuesta: 0, tol: 0.01, errores: [{ valor: (F - K) * D, mensaje: 'Ese es el mínimo del call. El put está fuera del dinero: su mínimo es 0.' }] },
        { etiqueta: 'c) Call', respuesta: b.call, tol: 0.01, errores: [{ valor: b.put, mensaje: 'Ese es el put. El call está dentro del dinero y tiene que valer más que el put. (La guía tiene las etiquetas invertidas.)' }, { valor: bs({ S: F, K, r, sigma: s, T }).call, mensaje: 'Usaste Black-Scholes sin q: para un futuro hay que poner q = r (modelo de Black).' }] },
        { etiqueta: 'd) Put', respuesta: b.put, tol: 0.01, errores: [{ valor: b.call, mensaje: 'Ese es el call. (La guía tiene las etiquetas invertidas.)' }] },
        { etiqueta: 'e) c + K·e^(−rT) = p + F₀·e^(−rT)', respuesta: b.call + K * D, tol: 0.015, errores: [{ valor: b.put + F, mensaje: 'En la paridad de futuros, F₀ también va descontado: p + F₀·e^(−rT).' }] },
      ],
      pistas: ['Modelo de Black: es Black-Scholes con S₀ = F₀ y q = r.', `e^(−rT) = ${fmt(D, 5)}.`],
      resolucion: `<p>\\(e^{-rT} = e^{-0{,}04/3} = ${k(D, 5)}\\).</p>
        <p>a) \\(c \\ge (F_0 - K)e^{-rT} = 1 \\times ${k(D, 5)} = ${k((F - K) * D, 4)}\\). b) \\(p \\ge \\max((K - F_0)e^{-rT};0) = 0\\).</p>
        <p>c, d) \\(d_1 = \\dfrac{\\ln(F_0/K) + \\sigma^2T/2}{\\sigma\\sqrt T} = ${k(b.d1, 4)}\\), \\(d_2 = ${k(b.d2, 4)}\\). \\(c = e^{-rT}[F_0N(d_1) - KN(d_2)] = ${k(b.call, 4)}\\); \\(p = e^{-rT}[KN(-d_2) - F_0N(-d_1)] = ${k(b.put, 4)}\\).</p>
        <p>e) \\(${k(b.call)} + ${k(K * D)} = ${k(b.put)} + ${k(F * D)} = ${k(b.call + K * D)}\\).</p>
        <p>La diferencia \\(c - p = (F_0 - K)e^{-rT} = ${k((F - K) * D, 4)}\\): no depende de la volatilidad.</p>`,
      herramienta: { texto: 'Árbol de un futuro', enlace: 'u7-simulacion.html#arbol-futuro' },
      aviso: 'Las respuestas de la guía tienen invertidos call y put: dan a) 0, b) 0,99, c) 1,10 y d) 2,09. El call está dentro del dinero (F = 20 > K = 19), así que su mínimo es 0,99 y vale 2,09; el put tiene mínimo 0 y vale 1,10.',
    });
  }

  // ------------------------------------------------------------------
  // Ejercicios nuevos (basados en Hull, caps. 17-18)
  // ------------------------------------------------------------------
  {
    const lb = 300 * exp(-0.03 * 0.5) - 290 * exp(-0.08 * 0.5);
    E({
      id: 'U7-04', titulo: 'Límite inferior con dividendos', fuente: 'Hull, problema 17.6', tema: 'Índices y dividendos', dificultad: 1,
      enunciado: `<p>Un índice está en 300, su rendimiento por dividendos es 3 % anual y la tasa libre de riesgo, 8 %. ¿Cuál es el límite inferior de un call europeo a 6 meses con strike 290?</p>`,
      campos: [{ etiqueta: 'Límite inferior', respuesta: lb, tol: 0.01, errores: [{ valor: 300 - 290 * exp(-0.04), mensaje: 'Falta descontar el dividendo: el índice entra como S₀·e^(−qT).' }, { valor: 10, mensaje: 'Eso es el valor intrínseco. El límite europeo compara valores presentes: S₀·e^(−qT) − K·e^(−rT).' }] }],
      resolucion: `<p>\\(c \\ge S_0e^{-qT} - Ke^{-rT} = 300e^{-0{,}015} - 290e^{-0{,}04} = ${k(300 * exp(-0.015))} - ${k(290 * exp(-0.04))} = ${k(lb)}\\).</p>`,
      herramienta: { texto: 'Límites de precios', enlace: 'herramientas.html#limites-de-precios' },
    });
  }

  {
    const c = bs({ S: 250, K: 250, r: 0.1, sigma: 0.18, T: 0.25, q: 0.03 });
    E({
      id: 'U7-05', titulo: 'Call sobre un índice', fuente: 'Hull, problema 17.8', tema: 'Índices y dividendos', dificultad: 2,
      enunciado: `<p>Calculá el valor de un call europeo a 3 meses, <i>at the money</i>, sobre un índice que está en 250. La tasa libre de riesgo es 10 %, la volatilidad del índice 18 % y su rendimiento por dividendos 3 % anual.</p>`,
      campos: [{ etiqueta: 'Call (puntos de índice)', respuesta: c.call, tol: 0.01, errores: [{ valor: bs({ S: 250, K: 250, r: 0.1, sigma: 0.18, T: 0.25 }).call, mensaje: 'Olvidaste el rendimiento por dividendos (q = 3 %).' }] }],
      resolucion: `<p>\\(d_1 = \\dfrac{\\ln(250/250) + (0{,}10 - 0{,}03 + 0{,}0162)\\,0{,}25}{0{,}18\\sqrt{0{,}25}} = ${k(c.d1, 4)}\\), \\(d_2 = ${k(c.d2, 4)}\\).</p>
        <p>\\(c = 250e^{-0{,}03 \\times 0{,}25}N(d_1) - 250e^{-0{,}10 \\times 0{,}25}N(d_2) = ${k(c.call)}\\). Con multiplicador 100, un contrato vale ${fmt(c.call * 100, 0)}.</p>`,
      herramienta: BSH,
    });
  }

  {
    const p = bs({ S: 0.52, K: 0.5, r: 0.04, sigma: 0.12, T: 8 / 12, q: 0.08 });
    E({
      id: 'U7-06', titulo: 'Put sobre una moneda', fuente: 'Hull, problema 17.9', tema: 'Monedas', dificultad: 2,
      enunciado: `<p>Calculá el valor de un put europeo a 8 meses sobre una moneda, con strike 0,50. El tipo de cambio es 0,52, su volatilidad 12 %, la tasa doméstica 4 % y la extranjera 8 % anual.</p>`,
      campos: [{ etiqueta: 'Put', respuesta: p.put, tol: 0.0005, errores: [{ valor: bs({ S: 0.52, K: 0.5, r: 0.04, sigma: 0.12, T: 8 / 12 }).put, mensaje: 'Falta la tasa extranjera: q = r_f = 8 %.' }, { valor: bs({ S: 0.52, K: 0.5, r: 0.08, sigma: 0.12, T: 8 / 12, q: 0.04 }).put, mensaje: 'Invertiste las tasas: r es la doméstica (4 %) y q la extranjera (8 %).' }] }],
      resolucion: `<p>\\(d_1 = \\dfrac{\\ln(0{,}52/0{,}50) + (0{,}04 - 0{,}08 + 0{,}0072)\\,(8/12)}{0{,}12\\sqrt{8/12}} = ${k(p.d1, 4)}\\), \\(d_2 = ${k(p.d2, 4)}\\).</p>
        <p>\\(p = 0{,}50e^{-0{,}04 \\times 8/12}N(-d_2) - 0{,}52e^{-0{,}08 \\times 8/12}N(-d_1) = ${k(p.put, 4)}\\).</p>
        <p>La tasa extranjera mayor que la doméstica hace que la moneda cotice con descuento a plazo (\\(F_0 = ${k(0.52 * exp(-0.04 * 8 / 12), 4)}\\)), y eso le da valor al put aunque hoy esté fuera del dinero.</p>`,
      herramienta: BSH,
    });
  }

  {
    const eu = Opciones.binomial({ S: 0.8, K: 0.79, r: 0.06, sigma: 0.12, T: 4 / 12, n: 2, q: 0.08, guardarArbol: true });
    const A = eu.arbol;
    const am = Opciones.binomial({ S: 0.8, K: 0.79, r: 0.06, sigma: 0.12, T: 4 / 12, n: 2, q: 0.08, americana: true });
    E({
      id: 'U7-07', titulo: 'Árbol para un call sobre moneda', fuente: 'Hull, problema 17.13', tema: 'Monedas', dificultad: 3,
      enunciado: `<p>Una moneda vale 0,80 y tiene una volatilidad del 12 %. Las tasas doméstica y extranjera son 6 % y 8 %. Con un árbol de dos pasos, valuá un call a 4 meses con strike 0,79: a) europeo; b) americano. c) ¿Conviene ejercer anticipadamente en algún nodo?</p>`,
      campos: [
        { etiqueta: 'a) Call europeo', respuesta: eu.precio, tol: 0.0003 },
        { etiqueta: 'b) Call americano', respuesta: am.precio, tol: 0.0003, errores: [{ valor: eu.precio, mensaje: 'Revisá el nodo de arriba en el mes 2: el valor intrínseco (0,0502) supera al de seguir.' }] },
        { etiqueta: 'c) Ejercicio anticipado', opciones: ['Sí, en el nodo de suba del mes 2', 'No, nunca conviene en un call'], respuesta: 'Sí, en el nodo de suba del mes 2' },
      ],
      pistas: [`Δt = 1/6; u = e^(0,12·√(1/6)) = ${fmt(eu.u, 4)}; p = (e^((r − r_f)Δt) − d)/(u − d) = ${fmt(eu.p, 4)}.`],
      resolucion: `<p>\\(u = ${k(eu.u, 4)}\\), \\(d = ${k(eu.d, 4)}\\), \\(p = \\dfrac{e^{(0{,}06 - 0{,}08)/6} - d}{u - d} = ${k(eu.p, 4)}\\). La probabilidad usa \\(r - r_f\\) porque la moneda "rinde" la tasa extranjera.</p>
        <p>Nodos finales: \\(${k(A[2][2].S, 4)} \\to ${k(A[2][2].V, 4)}\\); \\(${k(A[2][1].S, 4)} \\to ${k(A[2][1].V, 4)}\\); \\(${k(A[2][0].S, 4)} \\to 0\\). Mes 2, nodo de arriba (${k(A[1][1].S, 4)}): seguir vale \\(e^{-0{,}01}[p \\cdot ${k(A[2][2].V, 4)} + (1-p)\\,${k(A[2][1].V, 4)}] = ${k(A[1][1].V, 4)}\\); ejercer, \\(${k(A[1][1].S - 0.79, 4)}\\). Abajo (${k(A[1][0].S, 4)}): \\(${k(A[1][0].V, 4)}\\).</p>
        <p>a) Europeo: \\(${k(eu.precio, 4)}\\). b) Americano: con 0,0502 arriba, \\(${k(am.precio, 4)}\\). c) Sí: como \\(r_f > r\\), tener la moneda rinde más que esperar con el dinero, y un call muy dentro del dinero conviene ejercerlo (igual que con una acción que paga un dividendo alto).</p>`,
      herramienta: { texto: 'Árbol binomial (U VI)', enlace: 'u6-simulacion.html' },
    });
  }

  {
    const p = black({ F: 19, K: 20, r: 0.12, sigma: 0.2, T: 5 / 12 });
    E({
      id: 'U7-08', titulo: 'Put sobre un futuro', fuente: 'Hull, problema 18.11', tema: 'Futuros', dificultad: 2,
      enunciado: `<p>Calculá el valor de un put europeo a 5 meses sobre un futuro, con precio del futuro 19, strike 20, tasa libre de riesgo 12 % y volatilidad del futuro 20 %.</p>`,
      campos: [{ etiqueta: 'Put', respuesta: p.put, tol: 0.01, errores: [{ valor: bs({ S: 19, K: 20, r: 0.12, sigma: 0.2, T: 5 / 12 }).put, mensaje: 'Ese es Black-Scholes sin ajuste. Para un futuro, q = r: el futuro no crece en el mundo neutral al riesgo.' }] }],
      resolucion: `<p>\\(d_1 = \\dfrac{\\ln(19/20) + 0{,}2^2 \\times (5/12)/2}{0{,}2\\sqrt{5/12}} = ${k(p.d1, 4)}\\), \\(d_2 = ${k(p.d2, 4)}\\).</p>
        <p>\\(p = e^{-0{,}12 \\times 5/12}[20N(-d_2) - 19N(-d_1)] = ${k(p.put, 4)}\\).</p>`,
      herramienta: CALC,
    });
  }

  {
    const p = black({ F: 20, K: 20, r: 0.09, sigma: 0.25, T: 4 / 12 });
    E({
      id: 'U7-09', titulo: 'Put sobre futuro de petróleo', fuente: 'Hull, ejemplo 18.x', tema: 'Futuros', dificultad: 1,
      enunciado: `<p>Un put europeo sobre el futuro de petróleo vence en 4 meses. El futuro cotiza a 20 dólares, el strike es 20, la tasa libre de riesgo 9 % y la volatilidad del futuro 25 %. a) ¿Cuánto vale el put? b) ¿Y el call con el mismo strike?</p>`,
      campos: [
        { etiqueta: 'a) Put', respuesta: p.put, tol: 0.005 },
        { etiqueta: 'b) Call', respuesta: p.call, tol: 0.005 },
      ],
      resolucion: `<p>Con \\(F_0 = K\\), \\(d_1 = \\sigma\\sqrt T/2 = ${k(p.d1, 4)}\\) y \\(d_2 = -d_1\\). \\(p = e^{-0{,}03}[20N(${k(-p.d2, 4)}) - 20N(${k(-p.d1, 4)})] = ${k(p.put, 4)}\\).</p>
        <p>b) Por paridad, \\(c - p = (F_0 - K)e^{-rT} = 0\\): el call vale lo mismo, ${k(p.call, 4)}. Con opciones sobre futuros <i>at the money</i>, call y put valen igual.</p>`,
      herramienta: CALC,
    });
  }

  {
    const eu = Opciones.binomial({ S: 60, K: 60, r: 0.08, sigma: 0.3, T: 0.5, n: 2, q: 0.08 });
    const am = Opciones.binomial({ S: 60, K: 60, r: 0.08, sigma: 0.3, T: 0.5, n: 2, q: 0.08, americana: true });
    E({
      id: 'U7-10', titulo: 'Árbol de dos pasos para un futuro', fuente: 'Hull, problema 18.14', tema: 'Futuros', dificultad: 3,
      enunciado: `<p>Un futuro cotiza a 60 y su volatilidad es 30 %. La tasa libre de riesgo es 8 %. Con un árbol de dos pasos valuá un call a 6 meses sobre el futuro, con strike 60: a) europeo; b) americano.</p>`,
      campos: [
        { etiqueta: 'a) Europeo', respuesta: eu.precio, tol: 0.005 },
        { etiqueta: 'b) Americano', respuesta: am.precio, tol: 0.005, errores: [{ valor: eu.precio, mensaje: 'En el nodo de suba del primer paso conviene ejercer: el valor intrínseco (9,71) supera el de seguir.' }] },
      ],
      pistas: [`u = e^(0,3·√0,25) = ${fmt(eu.u, 4)}; para un futuro p = (1 − d)/(u − d) = ${fmt(eu.p, 4)}.`],
      resolucion: `<p>\\(u = ${k(eu.u, 4)}\\), \\(d = ${k(eu.d, 4)}\\), \\(p = (1 - d)/(u - d) = ${k(eu.p, 4)}\\).</p>
        <p>Al vencimiento: \\(80{,}99 \\to 20{,}99\\); \\(60 \\to 0\\); \\(44{,}45 \\to 0\\). En el paso 1, arriba (69,71): seguir vale \\(e^{-0{,}02}\\,p \\times 20{,}99 = ${k(exp(-0.02) * eu.p * 20.99152845, 4)}\\); ejercer, \\(9{,}71\\). Abajo: 0.</p>
        <p>a) \\(e^{-0{,}02}\\,p \\times ${k(exp(-0.02) * eu.p * 20.99152845, 4)} = ${k(eu.precio, 4)}\\). b) Con 9,71 arriba: \\(e^{-0{,}02}\\,p \\times 9{,}71 = ${k(am.precio, 4)}\\).</p>
        <p>Con opciones sobre futuros el call americano puede ejercerse antes, porque al ejercer se cobra \\(F - K\\) en efectivo (por el ajuste diario) y se gana el interés.</p>`,
      herramienta: { texto: 'Árbol de un futuro', enlace: 'u7-simulacion.html#arbol-futuro' },
    });
  }

  {
    const D = exp(-0.1), izq = 2 + 34 * D, der = 2 + 35 * D;
    E({
      id: 'U7-11', titulo: 'Arbitraje con la paridad de futuros', fuente: 'Hull, problema 18.13', tema: 'Futuros', dificultad: 2,
      enunciado: `<p>Un futuro a un año cotiza a 35. Un call y un put europeos a un año sobre ese futuro, ambos con strike 34, cotizan a 2. La tasa libre de riesgo es 10 %. a) ¿Cuánto vale c + K·e^(−rT)? b) ¿Y p + F₀·e^(−rT)? c) ¿Qué conviene hacer? d) ¿Cuál es la ganancia de arbitraje hoy?</p>`,
      campos: [
        { etiqueta: 'a) c + K·e^(−rT)', respuesta: izq, tol: 0.01 },
        { etiqueta: 'b) p + F₀·e^(−rT)', respuesta: der, tol: 0.01 },
        { etiqueta: 'c) Estrategia', opciones: ['Comprar el call, vender el put y vender el futuro', 'Vender el call, comprar el put y comprar el futuro'], respuesta: 'Comprar el call, vender el put y vender el futuro' },
        { etiqueta: 'd) Ganancia hoy', respuesta: der - izq, tol: 0.01 },
      ],
      resolucion: `<p>a) \\(2 + 34e^{-0{,}1} = ${k(izq, 3)}\\). b) \\(2 + 35e^{-0{,}1} = ${k(der, 3)}\\).</p>
        <p>c) El lado del put está caro: se vende el put y se compra el call (la combinación call largo + put corto equivale a un futuro comprado a 34), y se vende el futuro a 35. Al vencer, pase lo que pase, se compra a 34 y se vende a 35.</p>
        <p>d) La ganancia es \\((35 - 34)e^{-0{,}1} = ${k(der - izq, 4)}\\) en valor presente: 1 dólar al vencimiento.</p>`,
      herramienta: { texto: 'Paridad put-call', enlace: 'herramientas.html#paridad-put-call-despejar-la-incognita' },
    });
  }

  {
    const V0 = 500000, Vmin = 450000, beta = 2, S0 = 1000, r = 0.12, q = 0.04, T = 0.25;
    const K = S0 * (1 + (Vmin / V0 - 1 - r * T + q * T) / beta + r * T - q * T);
    const N = beta * V0 / (100 * S0);
    const prima = bs({ S: S0, K, r, sigma: 0.2, T, q }).put;
    E({
      id: 'U7-12', titulo: 'Seguro de cartera con β = 2', fuente: 'Hull, sección 17.1', tema: 'Seguro de cartera', dificultad: 3,
      enunciado: `<p>Una cartera vale 500.000 dólares y tiene β = 2. El índice está en 1.000 (multiplicador 100), la tasa libre de riesgo es 12 % anual y el rendimiento por dividendos del índice, 4 %. Se quiere asegurar que la cartera no valga menos de 450.000 en 3 meses. a) ¿Cuántos contratos de puts hacen falta? b) ¿Qué strike? c) Si la volatilidad del índice es 20 %, ¿cuánto cuesta el seguro?</p>`,
      campos: [
        { etiqueta: 'a) Contratos', respuesta: N, tol: 0.01, errores: [{ valor: V0 / (100 * S0), mensaje: 'Eso alcanza para β = 1. Con β = 2 la cartera se mueve el doble: hacen falta β veces más puts.' }] },
        { etiqueta: 'b) Strike', respuesta: K, tol: 0.5, errores: [{ valor: 900, mensaje: 'Una caída del 10 % de la cartera no es una caída del 10 % del índice: con β = 2 (y CAPM) alcanza con una baja menor del índice.' }] },
        { etiqueta: 'c) Costo total', respuesta: N * 100 * prima, tol: 20 },
      ],
      pistas: ['Rendimiento trimestral de la cartera (CAPM): r·T + β·(rendimiento del índice con dividendos − r·T).', 'Buscá el nivel del índice que hace que la cartera valga 450.000.'],
      resolucion: `<p>a) \\(N = \\beta V_0/(m S_0) = 2 \\times 500.000/(100 \\times 1.000) = ${k(N, 0)}\\).</p>
        <p>b) La cartera tiene que valer 450.000 sin contar sus dividendos (1 % en el trimestre, como el índice): su rendimiento total es \\(-10\\% + 1\\% = -9\\%\\). Por CAPM: \\(-0{,}09 = 0{,}03 + 2\\,(R_I - 0{,}03)\\), con \\(R_I\\) el rendimiento del índice incluidos dividendos: \\(R_I = -0{,}03\\). Sin dividendos, el índice baja 4 %: \\(K = ${k(K, 0)}\\).</p>
        <p>c) Put sobre el índice con \\(S_0 = 1.000\\), \\(K = 960\\), \\(q = 4\\%\\), \\(T = 0{,}25\\): \\(${k(prima)}\\) puntos. Costo: \\(10 \\times 100 \\times ${k(prima)} = ${k(N * 100 * prima, 0)}\\) dólares (${k(N * 100 * prima / V0 * 100)} % de la cartera).</p>`,
      herramienta: { texto: 'Seguro de cartera', enlace: 'u7-simulacion.html#seguro' },
    });
  }

  {
    const V0 = 4e6, Vmin = 3.6e6, beta = 1.5, S0 = 2000, r = 0.04, q = 0.01, T = 0.5;
    const K = S0 * (1 + (Vmin / V0 - 1 - r * T + q * T) / beta + r * T - q * T);
    const N = beta * V0 / (100 * S0);
    const prima = bs({ S: S0, K, r, sigma: 0.22, T, q }).put;
    E({
      id: 'U7-13', titulo: 'Seguro de cartera con β = 1,5', fuente: 'Nuevo', tema: 'Seguro de cartera', dificultad: 3,
      enunciado: `<p>Un fondo tiene una cartera de 4 millones de dólares con β = 1,5 y quiere que en 6 meses no valga menos de 3,6 millones. El índice está en 2.000 (multiplicador 100), r = 4 %, q = 1 % y la volatilidad del índice, 22 %. a) Contratos. b) Strike. c) Costo del seguro.</p>`,
      campos: [
        { etiqueta: 'a) Contratos', respuesta: N, tol: 0.01, errores: [{ valor: V0 / (100 * S0), mensaje: 'Multiplicá por β: la cartera es 1,5 veces más sensible que el índice.' }] },
        { etiqueta: 'b) Strike', respuesta: K, tol: 0.5, errores: [{ valor: 1800, mensaje: 'Ese strike sirve con β = 1. Con β = 1,5 el índice tiene que caer menos para que la cartera pierda 10 %.' }] },
        { etiqueta: 'c) Costo total', respuesta: N * 100 * prima, tol: 100 },
      ],
      resolucion: `<p>a) \\(N = 1{,}5 \\times 4.000.000/(100 \\times 2.000) = ${k(N, 0)}\\).</p>
        <p>b) En 6 meses: \\(rT = 2\\%\\), \\(qT = 0{,}5\\%\\). La cartera pierde 10 % sin dividendos, o sea \\(-9{,}5\\%\\) con ellos: \\(-0{,}095 = 0{,}02 + 1{,}5\\,(R_I - 0{,}02)\\) ⇒ \\(R_I = ${k(((-0.095 - 0.02) / 1.5 + 0.02) * 100)}\\%\\). Sin dividendos el índice cae \\(${k(-((-0.095 - 0.02) / 1.5 + 0.02 - 0.005) * 100)}\\%\\): \\(K = ${k(K)}\\).</p>
        <p>c) \\(p = ${k(prima)}\\) puntos; costo \\(30 \\times 100 \\times ${k(prima)} = ${k(N * 100 * prima, 0)}\\) dólares.</p>`,
      herramienta: { texto: 'Seguro de cartera', enlace: 'u7-simulacion.html#seguro' },
    });
  }

  {
    const S = 1.1, r = 0.06, rf = 0.03, s = 0.25, T = 0.5;
    const F = S * exp((r - rf) * T);
    const p = bs({ S, K: 1.05, r, sigma: s, T, q: rf }).put;
    let lo = S, hi = 3 * S;
    for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if (bs({ S, K: m, r, sigma: s, T, q: rf }).call > p) lo = m; else hi = m; }
    const K2 = (lo + hi) / 2;
    E({
      id: 'U7-14', titulo: 'Exportador: forward, put o range forward', fuente: 'Nuevo · datos de la guía U7, ej. 2', tema: 'Monedas', dificultad: 3,
      enunciado: `<p>Una empresa de Estados Unidos va a cobrar 1.000.000 de euros en 6 meses. EURUSD = 1,10, tasa en dólares 6 %, en euros 3 %, volatilidad 25 %. a) ¿A qué tipo de cambio puede vender a plazo? b) ¿Cuánto cuesta (por euro) un put con strike 1,05? c) Si financia el put vendiendo un call de igual prima (range forward), ¿qué strike tiene el call? d) Con el range forward, ¿cuántos dólares recibe si al vencimiento el euro vale 1,25?</p>`,
      campos: [
        { etiqueta: 'a) Forward', respuesta: F, tol: 0.0005, errores: [{ valor: S * exp((rf - r) * T), mensaje: 'Invertiste las tasas: F₀ = S₀·e^((r − r_f)T), con r la tasa del dólar.' }] },
        { etiqueta: 'b) Prima del put', respuesta: p, tol: 0.0005 },
        { etiqueta: 'c) Strike del call', respuesta: K2, tol: 0.002 },
        { etiqueta: 'd) Dólares recibidos', respuesta: K2 * 1e6, tol: 2000, errores: [{ valor: 1.25e6, mensaje: 'Vendió un call con strike menor a 1,25: se lo ejercen y entrega los euros al strike del call.' }] },
      ],
      pistas: ['Para c) probá strikes en la herramienta de Black-Scholes (subyacente: moneda) hasta que el call valga lo mismo que el put.'],
      resolucion: `<p>a) \\(F_0 = 1{,}10e^{(0{,}06 - 0{,}03)\\,0{,}5} = ${k(F, 4)}\\).</p>
        <p>b) Garman-Kohlhagen con \\(K = 1{,}05\\): \\(p = ${k(p, 4)}\\) dólares por euro (${fmt(p * 1e6, 0)} dólares por el millón).</p>
        <p>c) El call con strike \\(K_2 = ${k(K2, 4)}\\) vale exactamente \\(${k(p, 4)}\\): la estrategia no cuesta nada.</p>
        <p>d) A 1,25 el comprador del call lo ejerce: la empresa entrega los euros a \\(${k(K2, 4)}\\) y recibe ${fmt(K2 * 1e6, 0)} dólares. El range forward deja el resultado dentro de una banda: entre ${fmt(1.05e6, 0)} y ${fmt(K2 * 1e6, 0)}.</p>`,
      herramienta: { texto: 'Cobertura del exportador', enlace: 'u7-simulacion.html#exportador' },
    });
  }

  {
    const F = 1.1 * exp(0.015);
    const c1 = bs({ S: 1.1, K: 1.1, r: 0.06, sigma: 0.25, T: 0.5, q: 0.03 }).call;
    const c2 = black({ F, K: 1.1, r: 0.06, sigma: 0.25, T: 0.5 }).call;
    E({
      id: 'U7-15', titulo: 'Opción sobre contado y sobre futuro', fuente: 'Hull, sección 18.x', tema: 'Futuros', dificultad: 2,
      enunciado: `<p>EURUSD = 1,10, r = 6 %, r_f = 3 %, σ = 25 %. a) ¿Cuánto vale un call europeo a 6 meses sobre el euro con strike 1,10? b) ¿Cuánto vale un call europeo a 6 meses con strike 1,10 sobre un futuro de euro que vence <b>el mismo día</b>? c) ¿Por qué?</p>`,
      campos: [
        { etiqueta: 'a) Call sobre el contado', respuesta: c1, tol: 0.0005 },
        { etiqueta: 'b) Call sobre el futuro', respuesta: c2, tol: 0.0005 },
        { etiqueta: 'c) Explicación', opciones: ['Al vencimiento el futuro y el contado valen lo mismo', 'El futuro tiene menos volatilidad'], respuesta: 'Al vencimiento el futuro y el contado valen lo mismo' },
      ],
      resolucion: `<p>a) Garman-Kohlhagen: \\(${k(c1, 4)}\\). b) \\(F_0 = 1{,}10e^{0{,}015} = ${k(F, 4)}\\); Black: \\(${k(c2, 4)}\\).</p>
        <p>c) Si el futuro vence el mismo día que la opción, al vencimiento \\(F_T = S_T\\) y los dos pagos son idénticos: las opciones europeas tienen que valer lo mismo. Por eso el modelo de Black se usa también para valuar opciones sobre el contado: alcanza con el precio forward, sin estimar el rendimiento del subyacente.</p>`,
      herramienta: CALC,
    });
  }
})();
