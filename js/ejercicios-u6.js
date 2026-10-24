// Ejercicios · Unidad VI · Valuación de opciones. Formato: ver js/ejercitacion.js
// Convención: tasas anuales continuas.
window.EJERCICIOS = window.EJERCICIOS || [];

(function () {
  const E = ej => EJERCICIOS.push(ej);
  const k = (x, d = 2) => fmt(x, d).replace(/,/g, '{,}');
  const exp = Math.exp;
  const bs = Opciones.blackScholes;
  const REP = { texto: 'Portafolio replicante', enlace: 'u6-simulacion.html#replicante' };
  const ARB = { texto: 'Árbol binomial de n pasos', enlace: 'u6-simulacion.html#arbol' };
  const BSC = { texto: 'Black-Scholes paso a paso', enlace: 'herramientas.html#black-scholes-paso-a-paso' };
  const GRI = { texto: 'Griegas y cobertura delta', enlace: 'herramientas.html#griegas-y-cobertura-delta' };
  const TEO_GRI = { texto: 'Teoría: las griegas', enlace: 'u6-teoria.html#las-griegas' };

  // Árbol de dos pasos con u y d dados (no CRR). Devuelve precios y nodos.
  function arbol2({ S, u, d, r, dt, K, tipo, americana = false }) {
    const pago = s => (tipo === 'call' ? Math.max(s - K, 0) : Math.max(K - s, 0));
    const p = (exp(r * dt) - d) / (u - d), D = exp(-r * dt);
    const Suu = S * u * u, Sud = S * u * d, Sdd = S * d * d, Su = S * u, Sd = S * d;
    const fin = [pago(Suu), pago(Sud), pago(Sdd)];
    const seguirU = D * (p * fin[0] + (1 - p) * fin[1]), seguirD = D * (p * fin[1] + (1 - p) * fin[2]);
    const Vu = americana ? Math.max(seguirU, pago(Su)) : seguirU;
    const Vd = americana ? Math.max(seguirD, pago(Sd)) : seguirD;
    const V0 = D * (p * Vu + (1 - p) * Vd);
    return { p, Su, Sd, Suu, Sud, Sdd, fin, seguirU, seguirD, Vu, Vd, precio: americana ? Math.max(V0, pago(S)) : V0, ejerceU: Vu > seguirU + 1e-12, ejerceD: Vd > seguirD + 1e-12 };
  }

  {
    const x = Opciones.replicanteUnPaso({ S0: 40, Su: 42, Sd: 38, K: 39, r: 0.08, T: 1 / 12 });
    E({
      id: 'U6-01', titulo: 'Binomial de un paso (call)', fuente: 'Guía U6, ej. 1', tema: 'Binomial', dificultad: 1,
      enunciado: `<p>Una acción vale $40 y dentro de un mes valdrá $42 o $38. La tasa es 8 % anual continua. ¿Cuál es el valor de un call europeo a un mes con strike $39? Calculá también \\(\\Delta\\) y la probabilidad neutral al riesgo \\(p\\).</p>`,
      campos: [
        { etiqueta: 'Δ', respuesta: x.delta, tol: 0.001 },
        { etiqueta: 'p', respuesta: x.p, tol: 0.001, errores: [{ valor: 0.5, mensaje: 'p no es 1/2: es la probabilidad que hace que la acción rinda r. p = (e^(rT) − d)/(u − d).' }] },
        { etiqueta: 'Call', respuesta: x.precio, tol: 0.01, errores: [{ valor: x.p * 3 + (1 - x.p) * 0, mensaje: 'Falta descontar el valor esperado a la tasa libre de riesgo.' }] },
      ],
      pistas: ['Pagos: 3 si sube, 0 si baja. Δ = (3 − 0)/(42 − 38).'],
      resolucion: `<p>Pagos: \\(c_u = 3\\), \\(c_d = 0\\). \\(\\Delta = 3/4 = ${k(x.delta, 4)}\\). La cartera de \\(\\Delta\\) acciones y \\(B\\) en caución paga lo mismo: \\(B = (3 - 0{,}75 \\times 42)\\,e^{-0{,}08/12} = ${k(x.B, 4)}\\) (deuda).</p>
        <p>\\(c = \\Delta S_0 + B = 30 ${x.B < 0 ? '-' : '+'} ${k(Math.abs(x.B), 4)} = ${k(x.precio)}\\).</p>
        <p>Con neutral al riesgo: \\(p = \\dfrac{e^{0{,}08/12} - 0{,}95}{1{,}05 - 0{,}95} = ${k(x.p, 4)}\\) y \\(c = e^{-0{,}08/12}(${k(x.p, 4)} \\times 3) = ${k(x.precioNeutral)}\\). Los dos caminos dan lo mismo.</p>`,
      herramienta: REP,
    });
  }

  E({
    id: 'U6-02', titulo: 'Replicación y valuación neutral al riesgo', fuente: 'Guía U6, ej. 2', tema: 'Binomial', dificultad: 1,
    enunciado: `<p>Explicá cómo se valúa una opción europea con un árbol binomial de un paso: a) con un portafolio replicante; b) con la valuación neutral al riesgo.</p>`,
    respuestaModelo: `<p>a) Se arma una cartera de \\(\\Delta\\) acciones y \\(B\\) en caución (o deuda) que paga lo mismo que la opción en los dos estados: \\(\\Delta = (f_u - f_d)/(S_u - S_d)\\). Por la ley del precio único, la opción vale lo mismo que la cartera: \\(f = \\Delta S_0 + B\\). Si valiera otra cosa, habría arbitraje.</p>
      <p>b) Se calcula \\(p = (e^{rT} - d)/(u - d)\\): la probabilidad con la que la acción rinde exactamente la tasa libre de riesgo. La opción vale su pago esperado con esas probabilidades, descontado a \\(r\\): \\(f = e^{-rT}[p f_u + (1-p) f_d]\\).</p>
      <p>Los dos dan el mismo resultado. Las probabilidades reales y la aversión al riesgo no aparecen: ya están en el precio de la acción.</p>`,
    herramienta: REP,
  });

  {
    const x = Opciones.replicanteUnPaso({ S0: 50, Su: 55, Sd: 45, K: 50, r: 0.1, T: 0.5, tipo: 'put' });
    E({
      id: 'U6-03', titulo: 'Binomial de un paso (put)', fuente: 'Guía U6, ej. 3', tema: 'Binomial', dificultad: 1,
      enunciado: `<p>Una acción vale $50 y dentro de seis meses valdrá $45 o $55. La tasa es 10 % anual continua. ¿Cuál es el valor de un put europeo a seis meses con strike $50? Calculá \\(\\Delta\\) y \\(B\\) del portafolio replicante.</p>`,
      campos: [
        { etiqueta: 'Δ', respuesta: x.delta, tol: 0.001, errores: [{ valor: 0.5, mensaje: 'El delta de un put es negativo: el put gana cuando la acción baja.' }] },
        { etiqueta: 'B', respuesta: x.B, tol: 0.01 },
        { etiqueta: 'Put', respuesta: x.precio, tol: 0.01 },
      ],
      resolucion: `<p>Pagos: \\(p_u = 0\\), \\(p_d = 5\\). \\(\\Delta = (0 - 5)/(55 - 45) = ${k(x.delta, 2)}\\): la cartera replicante está <b>vendida</b> en media acción.</p>
        <p>\\(B = (0 + 0{,}5 \\times 55)\\,e^{-0{,}05} = ${k(x.B, 4)}\\) colocado. \\(p = -0{,}5 \\times 50 + ${k(x.B, 4)} = ${k(x.precio)}\\).</p>
        <p>Comprobación: \\(p_{\\text{neutral}} = (e^{0{,}05} - 0{,}9)/0{,}2 = ${k(x.p, 4)}\\); \\(e^{-0{,}05}(1 - ${k(x.p, 4)}) \\times 5 = ${k(x.precioNeutral)}\\).</p>`,
      herramienta: REP,
    });
  }

  {
    const c = arbol2({ S: 100, u: 1.1, d: 0.9, r: 0.08, dt: 0.5, K: 100, tipo: 'call' });
    const p = arbol2({ S: 100, u: 1.1, d: 0.9, r: 0.08, dt: 0.5, K: 100, tipo: 'put' });
    E({
      id: 'U6-04', titulo: 'Árbol de dos pasos y paridad', fuente: 'Guía U6, ej. 4', tema: 'Binomial', dificultad: 2,
      enunciado: `<p>Una acción vale $100 y en cada uno de los dos próximos semestres sube o baja 10 %. La tasa es 8 % anual continua. Valuá un call y un put europeos a un año con strike $100 y verificá la paridad put-call.</p>`,
      campos: [
        { etiqueta: 'Call', respuesta: c.precio, tol: 0.01 },
        { etiqueta: 'Put', respuesta: p.precio, tol: 0.01 },
        { etiqueta: 'c + K·e^(−rT) = p + S₀', respuesta: c.precio + 100 * exp(-0.08), tol: 0.01 },
      ],
      pistas: [`p = (e^(0,08·0,5) − 0,9)/(1,1 − 0,9) = ${fmt(c.p, 4)}.`, 'Nodos finales: 121, 99 y 81.'],
      resolucion: `<p>\\(p = (e^{0{,}04} - 0{,}9)/0{,}2 = ${k(c.p, 4)}\\). Nodos finales: 121, 99 y 81.</p>
        <p>Call: pagos 21, 0, 0. \\(c_u = e^{-0{,}04}\\,p \\times 21 = ${k(c.Vu, 4)}\\), \\(c_d = 0\\); \\(c = e^{-0{,}04}\\,p \\times ${k(c.Vu, 4)} = ${k(c.precio)}\\).</p>
        <p>Put: pagos 0, 1, 19. \\(p_u = e^{-0{,}04}(1 - p) \\times 1 = ${k(p.Vu, 4)}\\), \\(p_d = e^{-0{,}04}[p \\times 1 + (1-p) \\times 19] = ${k(p.Vd, 4)}\\); \\(p_0 = ${k(p.precio)}\\).</p>
        <p>Paridad: \\(${k(c.precio)} + 100e^{-0{,}08} = ${k(p.precio)} + 100 = ${k(c.precio + 100 * exp(-0.08))}\\) ✔.</p>`,
      herramienta: ARB,
    });
  }

  {
    const dat = { S: 50, u: 1.06, d: 0.95, r: 0.05, dt: 0.5, K: 51 };
    const c = arbol2({ ...dat, tipo: 'call' }), p = arbol2({ ...dat, tipo: 'put' }), pa = arbol2({ ...dat, tipo: 'put', americana: true });
    E({
      id: 'U6-05', titulo: 'Dos pasos: put europeo y americano', fuente: 'Guía U6, ej. 5', tema: 'Binomial', dificultad: 3,
      enunciado: `<p>Una acción vale $50 y en cada uno de los dos próximos semestres sube 6 % o baja 5 %. La tasa es 5 % anual continua. a) Valuá un call y b) un put europeos con strike $51 que vencen al final de los dos semestres. c) Verificá la paridad. d) Si el put fuera americano, ¿cuánto valdría?</p>`,
      campos: [
        { etiqueta: 'a) Call', respuesta: c.precio, tol: 0.01 },
        { etiqueta: 'b) Put europeo', respuesta: p.precio, tol: 0.01 },
        { etiqueta: 'c) c + K·e^(−rT) = p + S₀', respuesta: c.precio + 51 * exp(-0.05), tol: 0.01, errores: [{ valor: c.precio + 51 * exp(-0.025), mensaje: 'El árbol tiene dos semestres: T = 1 año, no 6 meses.' }] },
        { etiqueta: 'd) Put americano', respuesta: pa.precio, tol: 0.01, errores: [{ valor: p.precio, mensaje: `Revisá el nodo de baja del primer semestre (S = ${fmt(pa.Sd, 2)}): ejercer da ${fmt(51 - pa.Sd, 2)}, más que seguir.` }] },
      ],
      resolucion: `<p>\\(p = (e^{0{,}025} - 0{,}95)/(1{,}06 - 0{,}95) = ${k(c.p, 4)}\\). Nodos: \\(S_u = 53\\), \\(S_d = 47{,}50\\); al final \\(56{,}18\\), \\(50{,}35\\) y \\(45{,}125\\).</p>
        <p>a) Call: pagos 5,18, 0 y 0: \\(c = ${k(c.precio)}\\). b) Put: pagos 0, 0,65 y 5,875: \\(p = ${k(p.precio)}\\).</p>
        <p>c) \\(${k(c.precio)} + 51e^{-0{,}05} = ${k(p.precio)} + 50 = ${k(c.precio + 51 * exp(-0.05))}\\).</p>
        <p>d) En \\(S_d = 47{,}50\\): seguir vale \\(${k(pa.seguirD, 4)}\\) y ejercer \\(3{,}50\\): <b>conviene ejercer</b>. Con ese valor, el put americano vale \\(${k(pa.precio)}\\).</p>`,
      aviso: 'El enunciado de la guía dice "opción a seis meses", pero el árbol tiene dos semestres: es una opción a un año. El Excel de la cátedra también usa T = 1.',
      herramienta: ARB,
    });
  }

  {
    const p = (exp(0.1 / 6) - 0.92) / (1.08 - 0.92), v = exp(-0.1 / 6) * (p * 729 + (1 - p) * 529);
    E({
      id: 'U6-06', titulo: 'Un derivado que paga S_T²', fuente: 'Guía U6, ej. 6', tema: 'Binomial', dificultad: 2,
      enunciado: `<p>Una acción vale $25 y dentro de dos meses valdrá $23 o $27. La tasa es 10 % anual continua. ¿Cuánto vale un derivado que paga \\(S_T^2\\) dentro de dos meses?</p>`,
      campos: [{ etiqueta: 'Valor del derivado', respuesta: v, tol: 0.01, errores: [{ valor: 625, mensaje: 'No es S₀²: hay que valuar el pago esperado neutral al riesgo y descontarlo.' }, { valor: p * 729 + (1 - p) * 529, mensaje: 'Falta descontar dos meses a la tasa libre de riesgo.' }] }],
      resolucion: `<p>El método sirve para cualquier pago, no solo para opciones. Pagos: \\(27^2 = 729\\) y \\(23^2 = 529\\).</p>
        <p>\\(p = \\dfrac{e^{0{,}1/6} - 0{,}92}{1{,}08 - 0{,}92} = ${k(p, 4)}\\); valor \\(= e^{-0{,}1/6}(${k(p, 4)} \\times 729 + ${k(1 - p, 4)} \\times 529) = ${k(v)}\\).</p>`,
      herramienta: REP,
    });
  }

  {
    const dat = { S: 40, u: 1.1, d: 0.9, r: 0.12, dt: 0.25, K: 42, tipo: 'put' };
    const e = arbol2(dat), a = arbol2({ ...dat, americana: true });
    E({
      id: 'U6-07', titulo: 'Put europeo y americano', fuente: 'Guía U6, ej. 7', tema: 'Binomial', dificultad: 2,
      enunciado: `<p>Una acción vale $40 y en cada uno de los dos próximos trimestres sube o baja 10 %. La tasa es 12 % anual continua. Valuá un put europeo y uno americano a seis meses con strike $42.</p>`,
      campos: [
        { etiqueta: 'Put europeo', respuesta: e.precio, tol: 0.01 },
        { etiqueta: 'Put americano', respuesta: a.precio, tol: 0.01, errores: [{ valor: e.precio, mensaje: 'En el nodo de baja (36) conviene ejercer: 42 − 36 = 6 supera al valor de seguir.' }] },
      ],
      resolucion: `<p>\\(p = (e^{0{,}03} - 0{,}9)/0{,}2 = ${k(e.p, 4)}\\). Nodos finales: 48,4; 39,6; 32,4 → pagos 0; 2,4; 9,6.</p>
        <p>Europeo: \\(p_u = ${k(e.Vu, 4)}\\), \\(p_d = ${k(e.Vd, 4)}\\), \\(p_0 = ${k(e.precio)}\\).</p>
        <p>Americano: en \\(S_d = 36\\) ejercer da 6 > ${k(e.seguirD, 4)}: se ejerce. \\(P_0 = e^{-0{,}03}[p \\times ${k(a.Vu, 4)} + (1-p) \\times 6] = ${k(a.precio)}\\).</p>`,
      herramienta: ARB,
    });
  }

  E({
    id: 'U6-08', titulo: 'Volatilidad implícita', fuente: 'Guía U6, ej. 8', tema: 'Black-Scholes', dificultad: 1,
    enunciado: `<p>¿Qué significa la volatilidad implícita? ¿Cómo calcularías la volatilidad implícita en el precio de un put europeo?</p>`,
    respuestaModelo: `<p>Es la volatilidad que, puesta en Black-Scholes, hace que el precio teórico sea igual al de mercado: la volatilidad que el mercado "descuenta" para el futuro (a diferencia de la histórica, que mira el pasado).</p>
      <p>No se puede despejar de la fórmula, así que se itera: se prueba una \\(\\sigma\\), se calcula el put, y se sube \\(\\sigma\\) si el put calculado es menor que el de mercado (o se baja si es mayor), hasta que coincidan. Se puede hacer por prueba y error, bisección o Newton-Raphson (usando vega). Funciona porque el precio del put crece siempre con \\(\\sigma\\).</p>`,
    herramienta: BSC,
  });

  {
    const b = bs({ S: 50, K: 50, r: 0.1, sigma: 0.3, T: 0.25 }), b51 = bs({ S: 51, K: 50, r: 0.1, sigma: 0.3, T: 0.25 });
    E({
      id: 'U6-09', titulo: 'Black-Scholes y delta del put', fuente: 'Guía U6, ej. 9', tema: 'Griegas', dificultad: 2,
      enunciado: `<p>Calculá el precio de un put a tres meses sobre una acción sin dividendos con strike $50, si la acción vale $50, la tasa es 10 % anual y la volatilidad 30 % anual. Sabiendo que \\(N(d_1)\\) es el delta del call, calculá el delta del put, subí un peso el subyacente y sacá conclusiones.</p>`,
      campos: [
        { etiqueta: 'Put', respuesta: b.put, tol: 0.01 },
        { etiqueta: 'N(d₁) (delta del call)', respuesta: b.Nd1, tol: 0.005 },
        { etiqueta: 'Delta del put', respuesta: b.Nd1 - 1, tol: 0.005, errores: [{ valor: b.Nd1, mensaje: 'Ese es el delta del call. El del put es N(d₁) − 1.' }] },
        { etiqueta: 'Put con S = 51', respuesta: b51.put, tol: 0.01 },
      ],
      resolucion: `<p>\\(d_1 = \\dfrac{\\ln(1) + (0{,}10 + 0{,}045)\\,0{,}25}{0{,}3 \\times 0{,}5} = ${k(b.d1, 4)}\\), \\(d_2 = ${k(b.d2, 4)}\\). \\(p = 50e^{-0{,}025}N(-d_2) - 50N(-d_1) = ${k(b.put)}\\).</p>
        <p>\\(N(d_1) = ${k(b.Nd1, 4)}\\) es el delta del call; el del put es \\(N(d_1) - 1 = ${k(b.Nd1 - 1, 4)}\\).</p>
        <p>Con \\(S = 51\\) el put vale \\(${k(b51.put)}\\): bajó \\(${k(b.put - b51.put)}\\), casi lo que anticipaba su delta (0,40). La diferencia viene de gamma: el delta cambia mientras sube la acción.</p>`,
      aviso: 'La guía responde "Delta = 0,60": ese es el delta del call. El delta del put es N(d₁) − 1 ≈ −0,40.',
      herramienta: GRI,
    });
  }

  {
    const pr = Opciones.probabilidadEjercicio({ S: 38, K: 40, mu: 0.16, sigma: 0.35, T: 0.5 });
    E({
      id: 'U6-10', titulo: 'Probabilidad de ejercicio', fuente: 'Guía U6, ej. 10', tema: 'Lognormal', dificultad: 2,
      enunciado: `<p>Una acción tiene un rendimiento esperado de 16 % y una volatilidad de 35 %. Su precio es $38. ¿Cuál es la probabilidad de que se ejerza un call europeo con strike $40 a seis meses? ¿Y un put con el mismo strike y vencimiento? (En porcentaje.)</p>`,
      campos: [
        { etiqueta: 'Probabilidad del call (%)', respuesta: pr.call * 100, tol: 0.05 },
        { etiqueta: 'Probabilidad del put (%)', respuesta: pr.put * 100, tol: 0.05 },
      ],
      pistas: ['Es N(d₂), pero con el rendimiento esperado μ en lugar de r: queremos la probabilidad real, no la neutral al riesgo.'],
      resolucion: `<p>\\(\\ln S_T\\) es normal con media \\(\\ln S_0 + (\\mu - \\sigma^2/2)T\\). La probabilidad de que \\(S_T > K\\) es \\(N(d_2)\\) con \\(\\mu\\) en lugar de \\(r\\):</p>
        <p>\\(d_2 = \\dfrac{\\ln(38/40) + (0{,}16 - 0{,}35^2/2)\\,0{,}5}{0{,}35\\sqrt{0{,}5}} = ${k(pr.d2, 4)}\\). Call: \\(N(d_2) = ${k(pr.call * 100)}\\%\\). Put: \\(N(-d_2) = ${k(pr.put * 100)}\\%\\).</p>`,
      herramienta: { texto: 'Teoría: la propiedad lognormal', enlace: 'u6-teoria.html#la-propiedad-lognormal' },
    });
  }

  {
    const b = bs({ S: 52, K: 50, r: 0.12, sigma: 0.3, T: 0.25 });
    E({
      id: 'U6-11', titulo: 'Black-Scholes (call)', fuente: 'Guía U6, ej. 11', tema: 'Black-Scholes', dificultad: 1,
      enunciado: `<p>¿Cuál es el precio de un call europeo sobre una acción sin dividendos con \\(S_0 = 52\\), \\(K = 50\\), \\(r = 12\\%\\), \\(\\sigma = 30\\%\\) y vencimiento en tres meses?</p>`,
      campos: [
        { etiqueta: 'd₁', respuesta: b.d1, tol: 0.002 },
        { etiqueta: 'd₂', respuesta: b.d2, tol: 0.002 },
        { etiqueta: 'Call', respuesta: b.call, tol: 0.01 },
      ],
      resolucion: `<p>\\(d_1 = \\dfrac{\\ln(52/50) + (0{,}12 + 0{,}045)\\,0{,}25}{0{,}3\\sqrt{0{,}25}} = ${k(b.d1, 4)}\\); \\(d_2 = d_1 - 0{,}15 = ${k(b.d2, 4)}\\).</p>
        <p>\\(c = 52N(${k(b.d1, 4)}) - 50e^{-0{,}03}N(${k(b.d2, 4)}) = 52 \\times ${k(b.Nd1, 4)} - 48{,}52 \\times ${k(b.Nd2, 4)} = ${k(b.call)}\\).</p>`,
      herramienta: BSC,
    });
  }

  E({
    id: 'U6-12', titulo: 'Cobertura delta de calls vendidos', fuente: 'Guía U6, ej. 12', tema: 'Griegas', dificultad: 1,
    enunciado: `<p>¿Qué significa que el delta de un call sea 0,70? ¿Cómo se cubre en delta neutral una posición corta en 1.000 calls con delta 0,70 cada uno?</p>`,
    campos: [
      { etiqueta: 'Operación', opciones: ['Comprar acciones', 'Vender acciones'], respuesta: 'Comprar acciones' },
      { etiqueta: 'Cantidad de acciones', respuesta: 700, tol: 0.5, errores: [{ valor: 1000, mensaje: 'Una acción tiene delta 1 y cada call 0,70: alcanza con 0,70 × 1.000.' }] },
    ],
    resolucion: `<p>Delta 0,70: si la acción sube $1, el call sube (aproximadamente) $0,70.</p>
      <p>Vendido en 1.000 calls, el delta de la posición es \\(-1.000 \\times 0{,}70 = -700\\): pierde 700 por cada peso que sube la acción. Se compran <b>700 acciones</b> (delta +700). La cobertura hay que rebalancearla, porque el delta cambia con el precio y con el tiempo.</p>`,
    herramienta: GRI,
  });

  {
    const b = bs({ S: 50, K: 50, r: 0.1, sigma: 0.25, T: 0.5 });
    E({
      id: 'U6-13', titulo: 'Delta de un call ATM', fuente: 'Guía U6, ej. 13', tema: 'Griegas', dificultad: 1,
      enunciado: `<p>Calculá el delta de un call europeo a seis meses <i>at the money</i> sobre una acción sin dividendos, con tasa 10 % anual y volatilidad 25 % anual.</p>`,
      campos: [{ etiqueta: 'Delta', respuesta: b.Nd1, tol: 0.0002, errores: [{ valor: 0.5, mensaje: 'Un call ATM no tiene delta 0,5: la tasa y la volatilidad lo corren hacia arriba (d₁ > 0).' }] }],
      resolucion: `<p>Con \\(S_0 = K\\): \\(d_1 = \\dfrac{(0{,}10 + 0{,}25^2/2)\\,0{,}5}{0{,}25\\sqrt{0{,}5}} = ${k(b.d1, 4)}\\) y \\(\\Delta = N(d_1) = ${k(b.Nd1, 4)}\\). El precio de la acción no hace falta: solo importa \\(S_0/K = 1\\).</p>`,
      aviso: 'La guía da 0,6447; con más decimales es 0,6448. Se aceptan los dos.',
      herramienta: GRI,
    });
  }

  E({
    id: 'U6-14', titulo: 'Gamma', fuente: 'Guía U6, ej. 14', tema: 'Griegas', dificultad: 2,
    enunciado: `<p>¿Qué significa la gamma de una posición en opciones? ¿Qué riesgos tiene una posición con gamma grande y negativa y delta cero?</p>`,
    respuestaModelo: `<p>Gamma mide cuánto cambia el delta cuando se mueve el subyacente: es la "curvatura" del valor de la posición. Con gamma alta, la cobertura delta se desajusta rápido y hay que rebalancear seguido.</p>
      <p>Con gamma negativa (típicamente, vendido en opciones) y delta cero, la posición no pierde ante movimientos chicos, pero ante un movimiento <b>grande en cualquier dirección</b> pierde, y cada vez más: si el subyacente sube, el delta se vuelve negativo; si baja, positivo. Es la posición de quien vendió un straddle.</p>`,
    herramienta: TEO_GRI,
  });

  E({
    id: 'U6-15', titulo: 'Theta', fuente: 'Guía U6, ej. 15', tema: 'Griegas', dificultad: 2,
    enunciado: `<p>¿Qué significa que la theta de una posición sea −0,1 cuando el tiempo se mide en años? Si un operador cree que no cambiarán ni el precio de la acción ni su volatilidad implícita, ¿qué posición le conviene?</p>`,
    respuestaModelo: `<p>Si todo lo demás queda igual, la posición pierde 0,1 por año que pasa (unos \\(0{,}1/365\\) por día corrido). Es el desgaste del valor tiempo.</p>
      <p>Quien espera que nada se mueva debería tener <b>theta positiva</b>: estar vendido en opciones (por ejemplo, vender un straddle o un strangle) y cobrar ese desgaste. El riesgo es la gamma negativa: si el precio se mueve mucho, pierde.</p>`,
    herramienta: TEO_GRI,
  });

  E({
    id: 'U6-16', titulo: 'Cobertura delta y volatilidad', fuente: 'Guía U6, ej. 16', tema: 'Griegas', dificultad: 2,
    enunciado: `<p>Una empresa cubre en delta una cartera de posiciones <b>largas</b> en calls y puts sobre una divisa. ¿Qué escenario le resulta más favorable?</p>`,
    campos: [{ etiqueta: 'Escenario', opciones: ['Un tipo de cambio prácticamente constante', 'Grandes variaciones del tipo de cambio'], respuesta: 'Grandes variaciones del tipo de cambio' }],
    resolucion: `<p>Una cartera comprada en opciones tiene gamma positiva. Con delta cero, cualquier movimiento grande le da ganancia: si sube, el delta se vuelve positivo y gana; si baja, se vuelve negativo y también gana. Si el tipo de cambio queda quieto, en cambio, pierde por theta.</p>`,
    herramienta: TEO_GRI,
  });

  E({
    id: 'U6-17', titulo: 'Delta de un futuro y de un forward', fuente: 'Guía U6, ej. 17', tema: 'Griegas', dificultad: 3,
    enunciado: `<p>¿Un futuro y un forward sobre el mismo activo y con el mismo vencimiento tienen el mismo delta?</p>`,
    respuestaModelo: `<p>No. El valor de un forward comprado es \\(S_0 - Ke^{-rT}\\) (sin ingresos): su delta es 1. El futuro se ajusta todos los días: si el contado sube $1, el futuro sube \\(e^{rT}\\) y esa ganancia se cobra hoy. Por eso el delta del futuro es \\(e^{rT}\\) veces el del forward.</p>
      <p>Consecuencia práctica: para cubrir con futuros una posición de delta \\(\\Delta\\) hacen falta \\(\\Delta\\,e^{-rT}\\) unidades de futuros (con dividendos, \\(\\Delta\\,e^{-(r-q)T}\\)).</p>`,
    herramienta: TEO_GRI,
  });

  E({
    id: 'U6-18', titulo: 'Delta y gamma de una cartera en divisas', fuente: 'Guía U6, ej. 18', tema: 'Griegas', dificultad: 3,
    enunciado: `<p>La posición de un banco en opciones sobre EURUSD tiene un delta de 30.000 y una gamma de −80.000. El tipo de cambio es 0,90 dólares por euro. a) ¿Qué posición en euros deja la cartera delta neutral? b) Si el tipo de cambio pasa a 0,93, ¿cuál es el nuevo delta de las opciones? c) ¿Qué transacción hace falta para volver a delta neutral? d) ¿La cobertura ganó o perdió?</p>`,
    campos: [
      { etiqueta: 'a) Operación', opciones: ['Vender 30.000 euros', 'Comprar 30.000 euros'], respuesta: 'Vender 30.000 euros' },
      { etiqueta: 'b) Nuevo delta de las opciones', respuesta: 30000 - 80000 * 0.03, tol: 1, errores: [{ valor: 30000 + 80000 * 0.03, mensaje: 'La gamma es negativa: si el tipo de cambio sube, el delta baja.' }] },
      { etiqueta: 'c) Euros a comprar', respuesta: 2400, tol: 1 },
      { etiqueta: 'd) Resultado', opciones: ['Perdió', 'Ganó', 'Quedó en cero'], respuesta: 'Perdió' },
    ],
    resolucion: `<p>Delta 30.000: si el euro sube un dólar, la cartera ganaría 30.000 dólares (en la práctica, 300 por cada centavo). Gamma −80.000: por cada dólar que sube el euro, el delta baja 80.000.</p>
      <p>a) Se venden 30.000 euros. b) \\(\\Delta' = 30.000 - 80.000 \\times 0{,}03 = 27.600\\). c) La cartera cubierta queda con delta \\(27.600 - 30.000 = -2.400\\): hay que <b>comprar 2.400 euros</b>.</p>
      <p>d) Perdió: con gamma negativa se termina vendiendo barato y comprando caro. Acá se vendieron euros a 0,90 y se recompran a 0,93. Es el costo de estar corto en gamma.</p>`,
    herramienta: GRI,
  });

  {
    const x = Opciones.replicanteUnPaso({ S0: 60, Su: 72, Sd: 50, K: 60, r: 0.06, T: 0.5 });
    E({
      id: 'U6-19', titulo: 'Portafolio replicante', fuente: 'Nuevo', tema: 'Binomial', dificultad: 2,
      enunciado: `<p>Una acción vale $60 y dentro de seis meses valdrá $72 o $50. La tasa es 6 % anual continua. Para un call europeo a seis meses con strike $60, calculá: a) \\(\\Delta\\); b) \\(B\\); c) el precio del call; d) la probabilidad neutral al riesgo \\(p\\).</p>`,
      campos: [
        { etiqueta: 'a) Δ', respuesta: x.delta, tol: 0.001 },
        { etiqueta: 'b) B', respuesta: x.B, tol: 0.001, errores: [{ valor: -x.B, mensaje: 'Para replicar un call se toma deuda: B es negativo.' }] },
        { etiqueta: 'c) Call', respuesta: x.precio, tol: 0.001 },
        { etiqueta: 'd) p', respuesta: x.p, tol: 0.001 },
      ],
      resolucion: `<p>a) \\(\\Delta = (12 - 0)/(72 - 50) = ${k(x.delta, 4)}\\). b) \\(B = (0 - ${k(x.delta, 4)} \\times 50)\\,e^{-0{,}03} = ${k(x.B, 4)}\\).</p>
        <p>c) \\(c = ${k(x.delta, 4)} \\times 60 ${x.B < 0 ? '-' : '+'} ${k(Math.abs(x.B), 4)} = ${k(x.precio, 4)}\\). d) \\(p = (60e^{0{,}03} - 50)/(72 - 50) = ${k(x.p, 4)}\\); comprobación: \\(e^{-0{,}03}\\,p \\times 12 = ${k(x.precioNeutral, 4)}\\).</p>`,
      herramienta: REP,
    });
  }

  {
    const p = (exp(0.05) - 0.85) / (1.2 - 0.85);
    E({
      id: 'U6-20', titulo: 'Probabilidad neutral al riesgo', fuente: 'Nuevo', tema: 'Binomial', dificultad: 1,
      enunciado: `<p>En un árbol de un paso de un año, \\(u = 1{,}20\\) y \\(d = 0{,}85\\). La tasa es 5 % anual continua. ¿Cuál es la probabilidad neutral al riesgo de suba?</p>`,
      campos: [{ etiqueta: 'p', respuesta: p, tol: 0.0005, errores: [{ valor: (1.05 - 0.85) / 0.35, mensaje: 'La tasa es continua: el crecimiento es e^(0,05), no 1,05.' }] }],
      resolucion: `<p>\\(p = \\dfrac{e^{0{,}05} - 0{,}85}{1{,}20 - 0{,}85} = ${k(p, 4)}\\). Tiene que cumplirse \\(d < e^{rT} < u\\); si no, habría arbitraje.</p>`,
    });
  }

  {
    const dat = { S: 80, K: 82, r: 0.04, sigma: 0.3, T: 1, n: 2, tipo: 'put' };
    const e = Opciones.binomial({ ...dat, guardarArbol: true }), a = Opciones.binomial({ ...dat, americana: true, guardarArbol: true });
    E({
      id: 'U6-21', titulo: 'Árbol CRR de dos pasos, put americano', fuente: 'Nuevo', tema: 'Binomial', dificultad: 3,
      enunciado: `<p>\\(S_0 = 80\\), \\(K = 82\\), \\(\\sigma = 30\\%\\), \\(r = 4\\%\\) (continua), \\(T = 1\\) año, dos pasos con \\(u = e^{\\sigma\\sqrt{\\Delta t}}\\) y \\(d = 1/u\\). a) Calculá \\(u\\) y \\(p\\). b) Precio del put europeo. c) Precio del put americano.</p>`,
      campos: [
        { etiqueta: 'a) u', respuesta: e.u, tol: 0.0005, errores: [{ valor: exp(0.3), mensaje: 'Δt = 0,5: u = e^(0,3·√0,5).' }] },
        { etiqueta: 'a) p', respuesta: e.p, tol: 0.0005 },
        { etiqueta: 'b) Put europeo', respuesta: e.precio, tol: 0.01 },
        { etiqueta: 'c) Put americano', respuesta: a.precio, tol: 0.01, errores: [{ valor: e.precio, mensaje: `En el nodo de baja (S = ${fmt(a.arbol[1][0].S, 2)}) conviene ejercer.` }] },
      ],
      resolucion: `<p>a) \\(u = e^{0{,}3\\sqrt{0{,}5}} = ${k(e.u, 4)}\\), \\(d = ${k(e.d, 4)}\\), \\(p = (e^{0{,}02} - d)/(u - d) = ${k(e.p, 4)}\\).</p>
        <p>Nodos finales: \\(${k(e.arbol[2][2].S)}\\), 80 y \\(${k(e.arbol[2][0].S)}\\) → pagos 0; 2; \\(${k(e.arbol[2][0].V)}\\).</p>
        <p>b) \\(p_u = ${k(e.arbol[1][1].V, 4)}\\), \\(p_d = ${k(e.arbol[1][0].V, 4)}\\); \\(p_0 = ${k(e.precio)}\\).</p>
        <p>c) En \\(S_d = ${k(a.arbol[1][0].S)}\\): ejercer da \\(${k(82 - a.arbol[1][0].S)}\\) > ${k(e.arbol[1][0].V)}: se ejerce. \\(P_0 = ${k(a.precio)}\\).</p>`,
      herramienta: ARB,
    });
  }

  {
    const b = bs({ S: 45, K: 48, r: 0.05, sigma: 0.28, T: 0.75 });
    E({
      id: 'U6-22', titulo: 'Black-Scholes (put) y paridad', fuente: 'Nuevo', tema: 'Black-Scholes', dificultad: 2,
      enunciado: `<p>\\(S_0 = 45\\), \\(K = 48\\), \\(r = 5\\%\\), \\(\\sigma = 28\\%\\), \\(T = 9\\) meses, sin dividendos. Calculá \\(d_1\\), \\(d_2\\) y el precio del put. Con la paridad, obtené el call.</p>`,
      campos: [
        { etiqueta: 'd₁', respuesta: b.d1, tol: 0.002 },
        { etiqueta: 'd₂', respuesta: b.d2, tol: 0.002 },
        { etiqueta: 'Put', respuesta: b.put, tol: 0.01 },
        { etiqueta: 'Call (por paridad)', respuesta: b.call, tol: 0.01 },
      ],
      resolucion: `<p>\\(d_1 = \\dfrac{\\ln(45/48) + (0{,}05 + 0{,}0392)\\,0{,}75}{0{,}28\\sqrt{0{,}75}} = ${k(b.d1, 4)}\\), \\(d_2 = ${k(b.d2, 4)}\\).</p>
        <p>\\(p = 48e^{-0{,}0375}N(-d_2) - 45N(-d_1) = ${k(b.put)}\\). \\(c = p + S_0 - Ke^{-rT} = ${k(b.put)} + 45 - ${k(48 * exp(-0.0375))} = ${k(b.call)}\\).</p>`,
      herramienta: BSC,
    });
  }

  {
    const iv = Opciones.volatilidadImplicita({ precio: 6, tipo: 'call', S: 50, K: 50, r: 0.05, T: 0.5 });
    E({
      id: 'U6-23', titulo: 'Volatilidad implícita (cálculo)', fuente: 'Nuevo', tema: 'Black-Scholes', dificultad: 2,
      enunciado: `<p>Un call europeo ATM a 6 meses (\\(S_0 = K = 50\\), \\(r = 5\\%\\)) cotiza a $6. ¿Cuál es su volatilidad implícita (en %)?</p>`,
      campos: [{ etiqueta: 'Volatilidad implícita (%)', respuesta: iv * 100, tol: 0.1 }],
      pistas: ['Probá con 30 % y con 40 %: ¿el call queda por debajo o por encima de 6?'],
      resolucion: `<p>Con \\(\\sigma = 30\\%\\) el call vale ${k(bs({ S: 50, K: 50, r: 0.05, sigma: 0.3, T: 0.5 }).call)}; con 40 %, ${k(bs({ S: 50, K: 50, r: 0.05, sigma: 0.4, T: 0.5 }).call)}. Achicando el intervalo se llega a \\(\\sigma_{imp} = ${k(iv * 100)}\\%\\).</p>`,
      herramienta: BSC,
    });
  }

  E({
    id: 'U6-24', titulo: 'Interpretación de N(d₂)', fuente: 'Nuevo', tema: 'Black-Scholes', dificultad: 1,
    enunciado: `<p>En la fórmula de Black-Scholes, \\(N(d_2)\\) es…</p>`,
    campos: [{ etiqueta: 'N(d₂) es…', opciones: ['El delta del call', 'La probabilidad neutral al riesgo de que el call se ejerza', 'La probabilidad real de que la acción suba', 'El valor presente del strike'], respuesta: 'La probabilidad neutral al riesgo de que el call se ejerza' }],
    resolucion: `<p>\\(N(d_2)\\) es la probabilidad, en el mundo neutral al riesgo, de que \\(S_T > K\\). Por eso \\(Ke^{-rT}N(d_2)\\) es el valor presente de lo que se espera pagar al ejercer. El delta del call es \\(N(d_1)\\). La probabilidad real usa \\(\\mu\\) en lugar de \\(r\\).</p>`,
    herramienta: { texto: 'Teoría: interpretación de la fórmula', enlace: 'u6-teoria.html#interpretacion-de-la-formula' },
  });

  E({
    id: 'U6-25', titulo: 'Cobertura delta con puts', fuente: 'Nuevo', tema: 'Griegas', dificultad: 1,
    enunciado: `<p>Un inversor está comprado en 1.000 puts con delta −0,35 cada uno. ¿Qué tiene que hacer para quedar delta neutral?</p>`,
    campos: [
      { etiqueta: 'Operación', opciones: ['Comprar acciones', 'Vender acciones'], respuesta: 'Comprar acciones' },
      { etiqueta: 'Cantidad', respuesta: 350, tol: 0.5 },
    ],
    resolucion: `<p>Delta de la posición: \\(1.000 \\times (-0{,}35) = -350\\). Se compran 350 acciones (delta +350). Tiene sentido: los puts ganan si la acción baja y las acciones compradas pierden en ese caso.</p>`,
    herramienta: GRI,
  });
})();
