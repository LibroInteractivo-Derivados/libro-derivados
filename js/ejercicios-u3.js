// Ejercicios · Unidad III · Valuación de forwards y futuros. Formato: ver js/ejercitacion.js
// Convención de la materia: tasas continuas y 30/360, salvo que el enunciado diga otra cosa.
window.EJERCICIOS = window.EJERCICIOS || [];

(function () {
  const E = ej => EJERCICIOS.push(ej);
  const k = (x, d = 2) => fmt(x, d).replace(/,/g, '{,}');
  const exp = Math.exp, ln = Math.log;

  E({
    id: 'U3-01', titulo: 'De TNA a tasa efectiva', fuente: 'Presentación U3 (cátedra)', tema: 'Tasas', dificultad: 1,
    enunciado: `<p>Pasá una \\(\\text{TNA}_{30}\\) del 32 % a tasa efectiva de 90 días (año de 360 días).</p>`,
    campos: [{ etiqueta: 'Tasa efectiva a 90 días (%)', respuesta: (Math.pow(1 + 0.32 * 30 / 360, 3) - 1) * 100, tol: 0.01, errores: [{ valor: 8, mensaje: 'Eso es proporcional (0,32 × 90/360). La TNA₃₀ se capitaliza cada 30 días: hay que componer tres períodos.' }] }],
    resolucion: `<p>Cada 30 días se gana \\(0{,}32 \\times 30/360 = 2{,}667\\%\\). En 90 días hay tres capitalizaciones: \\((1{,}02667)^3 - 1 = 8{,}22\\%\\).</p>`,
    herramienta: { texto: 'Conversor de tasas', enlace: 'herramientas.html#conversor-de-tasas' },
  });

  E({
    id: 'U3-02', titulo: 'Continua y m veces por año', fuente: 'Basado en Hull, sección 4.x', tema: 'Tasas', dificultad: 1,
    enunciado: `<p>a) ¿Qué tasa continua equivale a 10 % anual con composición semestral? b) ¿Qué tasa con composición trimestral equivale a 8 % continua?</p>`,
    campos: [
      { etiqueta: 'a) Tasa continua (%)', respuesta: 2 * ln(1.05) * 100, tol: 0.002, errores: [{ valor: ln(1.1) * 100, mensaje: 'Usaste composición anual: con semestral es 2·ln(1 + 0,10/2).' }] },
      { etiqueta: 'b) Tasa trimestral (%)', respuesta: 4 * (exp(0.02) - 1) * 100, tol: 0.002 },
    ],
    resolucion: `<p>a) \\(R_c = 2\\ln(1{,}05) = 9{,}758\\%\\). b) \\(R_4 = 4\\,(e^{0{,}08/4} - 1) = 8{,}081\\%\\).</p>`,
  });

  E({
    id: 'U3-03', titulo: 'Precio de un bono con tasas cero', fuente: 'Presentación U3 (cátedra)', tema: 'Bonos', dificultad: 2,
    enunciado: `<p>Bono bullet a 2 años, nominal 100, cupón semestral (\\(\\text{TNA}_{180}\\) 6 %). Tasas cero continuas: 5 % (6 meses), 5,8 % (1 año), 6,4 % (1,5 años) y 6,8 % (2 años). ¿Cuál es su precio?</p>`,
    campos: [{ etiqueta: 'Precio', respuesta: 3 * exp(-0.05 * 0.5) + 3 * exp(-0.058) + 3 * exp(-0.064 * 1.5) + 103 * exp(-0.068 * 2), tol: 0.01, errores: [{ valor: 6 * exp(-0.05 * 0.5) + 6 * exp(-0.058) + 6 * exp(-0.064 * 1.5) + 106 * exp(-0.068 * 2), mensaje: 'El cupón es semestral: 3 por período, no 6.' }] }],
    resolucion: `<p>\\(3e^{-0{,}05 \\times 0{,}5} + 3e^{-0{,}058} + 3e^{-0{,}064 \\times 1{,}5} + 103e^{-0{,}068 \\times 2} = 98{,}39\\).</p>`,
    herramienta: { texto: 'Bonos y duración', enlace: 'herramientas.html#bonos-rendimiento-y-duracion' },
  });

  {
    const z = Tasas.bootstrap([{ T: .25, cupon: 0, precio: 97.5 }, { T: .5, cupon: 0, precio: 94.9 }, { T: 1, cupon: 0, precio: 90 }, { T: 1.5, cupon: .08, m: 2, precio: 96 }]);
    E({
      id: 'U3-04', titulo: 'Bootstrap', fuente: 'Presentación U3 (cátedra) · Hull', tema: 'Bonos', dificultad: 2,
      enunciado: `<p>Las tasas cero continuas a 6 y 12 meses son 10,469 % y 10,536 %. Un bono a 1,5 años paga cupones de 4 cada 6 meses y 100 al final, y cotiza a 96. ¿Cuál es la tasa cero a 1,5 años?</p>`,
      campos: [{ etiqueta: 'Tasa cero a 1,5 años (%)', respuesta: z[3].r * 100, tol: 0.003, errores: [{ valor: -ln(96 / 108) / 1.5 * 100, mensaje: 'No descontaste los cupones intermedios con sus tasas: solo el último flujo (104) usa la tasa desconocida.' }] }],
      resolucion: `<p>\\(4e^{-0{,}10469 \\times 0{,}5} + 4e^{-0{,}10536} + 104e^{-1{,}5R} = 96\\). Los dos primeros valen 7,396, así que \\(e^{-1{,}5R} = 88{,}604/104 = 0{,}85196\\) y \\(R = 10{,}681\\%\\).</p>`,
      herramienta: { texto: 'Curva cero', enlace: 'u3-simulacion.html#curva-cero' },
    });
  }

  E({
    id: 'U3-05', titulo: 'Tasa forward', fuente: 'Nuevo', tema: 'Tasas', dificultad: 2,
    enunciado: `<p>La tasa cero continua a 2 meses es 30 % y la de 6 meses, 32 %. ¿Cuál es la tasa forward continua para el período entre el mes 2 y el 6?</p>`,
    campos: [{ etiqueta: 'Tasa forward (%)', respuesta: Tasas.forward(0.30, 2 / 12, 0.32, 0.5) * 100, tol: 0.01, errores: [{ valor: 31, mensaje: 'No es el promedio: hay que ponderar por los plazos.' }] }],
    resolucion: `<p>\\(R_F = \\dfrac{0{,}32 \\times 6/12 - 0{,}30 \\times 2/12}{4/12} = 33\\%\\). Como la curva es creciente, la forward supera a las dos tasas cero.</p>`,
  });

  E({
    id: 'U3-06', titulo: 'Liquidación de un FRA', fuente: 'Presentación U3 (cátedra)', tema: 'FRA', dificultad: 2,
    enunciado: `<p>Un FRA sobre 100 millones garantiza 4 % (\\(\\text{TNA}_{90}\\)) por 3 meses, dentro de 3 años. La tasa de referencia resulta 4,5 %. a) ¿Cuál es el flujo del prestamista (posición corta) al final del período? b) ¿Cuánto se liquida al vencimiento del FRA (inicio del período)?</p>`,
    campos: [
      { etiqueta: 'a) Flujo al final del período', respuesta: 1e8 * (0.04 - 0.045) * 0.25, tol: 1, errores: [{ valor: 125000, mensaje: 'El prestamista (corto) recibe la fija y paga la variable: con la variable más alta, pierde.' }] },
      { etiqueta: 'b) Liquidación al inicio del período', respuesta: (1e8 * (0.04 - 0.045) * 0.25) / (1 + 0.045 * 0.25), tol: 1, errores: [{ valor: (1e8 * (0.04 - 0.045) * 0.25) / (1 + 0.04 * 0.25), mensaje: 'Se descuenta con la tasa de mercado (4,5 %), no con la pactada.' }] },
    ],
    resolucion: `<p>a) \\(100.000.000 \\times (0{,}04 - 0{,}045) \\times 90/360 = -125.000\\). b) \\(-125.000/(1 + 0{,}045 \\times 0{,}25) = -123.609\\). El tomador (largo) recibe +123.609.</p>`,
    herramienta: { texto: 'FRA', enlace: 'herramientas.html#fra-liquidacion-y-valor' },
  });

  E({
    id: 'U3-07', titulo: 'Valor de un FRA', fuente: 'Basado en Hull, sección 4.x', tema: 'FRA', dificultad: 3,
    enunciado: `<p>Una empresa recibe 6 % anual (composición anual) sobre 100 millones entre el año 1 y el 2 en un FRA. Las tasas cero continuas a 1 y 2 años son 3 % y 4 %. ¿Cuánto vale el FRA?</p>`,
    campos: [{ etiqueta: 'Valor (en $)', respuesta: Tasas.valorFRA({ L: 1e8, RK: 0.06, RF: exp(0.05) - 1, T1: 1, T2: 2, R2: 0.04 }), tol: 50, errores: [{ valor: Tasas.valorFRA({ L: 1e8, RK: 0.06, RF: 0.05, T1: 1, T2: 2, R2: 0.04 }), mensaje: 'La forward (5 % continua) hay que pasarla a composición anual antes de compararla con el 6 %.' }] }],
    resolucion: `<p>Forward continua: \\((0{,}04 \\times 2 - 0{,}03)/1 = 5\\%\\); en composición anual \\(e^{0{,}05} - 1 = 5{,}127\\%\\). Valor: \\(100.000.000 \\times (0{,}06 - 0{,}05127) \\times e^{-0{,}08} = 805.779\\).</p>`,
  });

  E({
    id: 'U3-08', titulo: 'Arbitraje con un forward sin ingresos', fuente: 'Presentación U3 (cátedra)', tema: 'Precio forward', dificultad: 2,
    enunciado: `<p>Un activo sin ingresos vale 40 y la tasa es 5 % (continua). a) ¿Cuál es el precio forward a 3 meses? b) Si el forward cotiza a 43, ¿qué estrategia se arma y cuánto se gana en T? c) ¿Y si cotiza a 39?</p>`,
    campos: [
      { etiqueta: 'a) Forward teórico', respuesta: 40 * exp(0.05 * 0.25), tol: 0.01 },
      { etiqueta: 'b) Estrategia con F = 43', opciones: ['Cash-and-carry', 'Reverse cash-and-carry'], respuesta: 'Cash-and-carry' },
      { etiqueta: 'b) Ganancia en T', respuesta: 43 - 40 * exp(0.0125), tol: 0.01 },
      { etiqueta: 'c) Ganancia en T con F = 39', respuesta: 40 * exp(0.0125) - 39, tol: 0.01 },
    ],
    resolucion: `<p>a) \\(40e^{0{,}05 \\times 0{,}25} = 40{,}50\\).</p>
      <p>b) Forward caro: se pide prestado 40, se compra el activo y se vende el forward a 43. En T se entrega el activo, se cobran 43 y se devuelven 40,50: ganancia 2,50.</p>
      <p>c) Forward barato: se vende en corto el activo, se colocan los 40 al 5 % y se compra forward a 39. En T se cobran 40,50, se pagan 39 y se devuelve el activo: ganancia 1,50.</p>`,
    herramienta: { texto: 'Simulación de arbitraje', enlace: 'u3-simulacion.html#arbitraje' },
  });

  E({
    id: 'U3-09', titulo: 'Forward sobre un bono con cupón', fuente: 'Presentación U3 (cátedra)', tema: 'Precio forward', dificultad: 2,
    enunciado: `<p>Un bono vale 900 y paga un cupón de 40 dentro de 4 meses. La tasa a 4 meses es 3 % y a 9 meses, 4 % (continuas). ¿Cuál es el precio forward a 9 meses?</p>`,
    campos: [{ etiqueta: 'Precio forward', respuesta: Futuros.precioForward({ S: 900, r: 0.04, T: 0.75, I: 40 * exp(-0.03 / 3) }), tol: 0.01, errores: [{ valor: 900 * exp(0.03), mensaje: 'Te faltó restar el valor presente del cupón: quien está largo en el forward no lo cobra.' }, { valor: (900 - 40) * exp(0.03), mensaje: 'El cupón se resta a valor presente, no por su valor nominal.' }] }],
    resolucion: `<p>\\(I = 40e^{-0{,}03 \\times 4/12} = 39{,}60\\). \\(F_0 = (900 - 39{,}60)\\,e^{0{,}04 \\times 0{,}75} = 886{,}60\\).</p>`,
    herramienta: { texto: 'Precio forward', enlace: 'herramientas.html#precio-forward-y-arbitraje' },
  });

  E({
    id: 'U3-10', titulo: 'Valor de un forward ya pactado', fuente: 'Nuevo', tema: 'Valor del forward', dificultad: 2,
    enunciado: `<p>Hace un mes se pactó un forward largo a 3 meses a 40,50 sobre un activo sin ingresos. Hoy el activo vale 42 y la tasa es 5 %. ¿Cuánto vale el contrato para el largo y para el corto?</p>`,
    campos: [
      { etiqueta: 'Valor para el largo', respuesta: 42 - 40.5 * exp(-0.05 * 2 / 12), tol: 0.01, errores: [{ valor: 1.5, mensaje: 'K se descuenta: f = S − K·e^(−rT), con T = 2 meses.' }] },
      { etiqueta: 'Valor para el corto', respuesta: -(42 - 40.5 * exp(-0.05 * 2 / 12)), tol: 0.01 },
    ],
    resolucion: `<p>Faltan 2 meses. \\(f = S - Ke^{-rT} = 42 - 40{,}50\\,e^{-0{,}05 \\times 2/12} = 1{,}84\\) para el largo y −1,84 para el corto. Equivale a \\((F_0 - K)e^{-rT}\\) con \\(F_0 = 42e^{0{,}05/6} = 42{,}35\\).</p>`,
  });

  E({
    id: 'U3-11', titulo: 'Futuro sobre un índice', fuente: 'Nuevo', tema: 'Precio forward', dificultad: 1,
    enunciado: `<p>Un índice está en 4.000, rinde dividendos del 2 % anual y la tasa es 5 % (continuas). ¿Cuál es el futuro a 4 meses?</p>`,
    campos: [{ etiqueta: 'Futuro', respuesta: 4000 * exp(0.03 / 3), tol: 0.02, errores: [{ valor: 4000 * exp(0.05 / 3), mensaje: 'Faltó restar los dividendos: F₀ = S₀·e^((r − q)T).' }] }],
    resolucion: `<p>\\(F_0 = 4.000\\,e^{(0{,}05 - 0{,}02) \\times 4/12} = 4.040{,}20\\).</p>`,
  });

  {
    const F = 0.98 * exp((0.01 - 0.03) * 2);
    E({
      id: 'U3-12', titulo: 'Forward de monedas y arbitraje', fuente: 'Presentación U3 (cátedra)', tema: 'Monedas', dificultad: 3,
      enunciado: `<p>AUDUSD contado: 0,98 (USD por AUD). Tasas a 2 años: 3 % en Australia y 1 % en EE. UU. (continuas). a) ¿Cuál es el forward a 2 años? b) Si cotiza a 0,96, ¿cuánto se gana (en USD, en T) arbitrando con un préstamo de USD 1.000? c) Si cotiza a 0,93, ¿cuánto se gana con un préstamo de AUD 1.000?</p>`,
      campos: [
        { etiqueta: 'a) Forward (USD por AUD)', respuesta: F, tol: 0.0001, errores: [{ valor: 0.98 * exp(0.04), mensaje: 'Invertiste las tasas: la doméstica (USD, en la que se cotiza) va primero: F = S·e^((r − r_f)T).' }] },
        { etiqueta: 'b) Ganancia con F = 0,96 (USD)', respuesta: (1000 / 0.98) * exp(0.06) * 0.96 - 1000 * exp(0.02), tol: 0.02 },
        { etiqueta: 'c) Ganancia con F = 0,93 (USD)', respuesta: 980 * exp(0.02) - 1000 * exp(0.06) * 0.93, tol: 0.02 },
      ],
      resolucion: `<p>a) \\(0{,}98\\,e^{(0{,}01 - 0{,}03) \\times 2} = 0{,}9416\\).</p>
        <p>b) Forward caro: pedir USD 1.000 al 1 %, comprar AUD 1.020,41 y colocarlos al 3 % (llegan a 1.083,51), venderlos a plazo a 0,96: USD 1.040,17. Deuda: 1.020,20. Ganancia: 19,97.</p>
        <p>c) Forward barato: pedir AUD 1.000 al 3 %, venderlos por USD 980 y colocarlos al 1 % (999,80); comprar a plazo los AUD 1.061,84 que se deben, a 0,93: USD 987,51. Ganancia: 12,29.</p>`,
    });
  }

  E({
    id: 'U3-13', titulo: 'Tasa implícita del dólar futuro', fuente: 'Nuevo', tema: 'Monedas', dificultad: 2,
    enunciado: `<p>El dólar contado está a $1.400 y el futuro a 90 días a $1.505 (números ilustrativos). Con una tasa en dólares del 4 % y la convención 30/360, ¿qué tasa continua en pesos está implícita?</p>`,
    campos: [{ etiqueta: 'Tasa en pesos (%)', respuesta: (ln(1505 / 1400) / 0.25 + 0.04) * 100, tol: 0.02, errores: [{ valor: (ln(1505 / 1400) / 0.25) * 100, mensaje: 'Faltó sumar la tasa en dólares: r = ln(F/S)/T + r_f.' }, { valor: (ln(1505 / 1400) / (90 / 365) + 0.04) * 100, mensaje: 'Usaste T = 90/365, la convención del mercado. El enunciado pide 30/360: T = 90/360 = 0,25.' }] }],
    resolucion: `<p>De \\(F_0 = S_0 e^{(r - r_f)T}\\): \\(r = \\ln(1.505/1.400)/0{,}25 + 0{,}04 = ${k((ln(1505 / 1400) / 0.25 + 0.04) * 100)}\\%\\). Con días corridos sobre 365 (\\(T = 90/365\\)), como en el ejemplo de la teoría, daría 33,33 %. No es un pronóstico del dólar: es la tasa que iguala colocar pesos con comprar dólares, colocarlos y venderlos a futuro.</p>`,
  });

  E({
    id: 'U3-14', titulo: 'Futuro de oro con almacenamiento', fuente: 'Nuevo', tema: 'Commodities', dificultad: 2,
    enunciado: `<p>El oro vale 2.400 la onza. Guardarlo cuesta 6 por onza al año, pagaderos al final. Con una tasa del 4 %, ¿cuál es el futuro a 1 año?</p>`,
    campos: [{ etiqueta: 'Futuro', respuesta: (2400 + 6 * exp(-0.04)) * exp(0.04), tol: 0.02, errores: [{ valor: 2400 * exp(0.04), mensaje: 'Faltó sumar el costo de almacenamiento.' }] }],
    resolucion: `<p>\\(U = 6e^{-0{,}04} = 5{,}76\\). \\(F_0 = (2.400 + 5{,}76)\\,e^{0{,}04} = 2.503{,}95\\).</p>`,
  });

  E({
    id: 'U3-15', titulo: 'Rendimiento de conveniencia del petróleo', fuente: 'Nuevo', tema: 'Commodities', dificultad: 2,
    enunciado: `<p>El petróleo vale 70 y el futuro a 1 año, 68. La tasa es 5 % y el almacenamiento, 2 % anual. ¿Cuál es el rendimiento de conveniencia implícito?</p>`,
    campos: [{ etiqueta: 'y (%)', respuesta: (0.07 - ln(68 / 70)) * 100, tol: 0.02 }],
    resolucion: `<p>\\(y = r + u - \\ln(F_0/S_0)/T = 0{,}07 - \\ln(68/70) = 9{,}90\\%\\).</p>`,
  });

  {
    const fl = Tasas.flujosBono({ nominal: 100, cupon: 0.06, m: 2, T: 2 });
    const B = 3 * exp(-0.025) + 3 * exp(-0.058) + 3 * exp(-0.096) + 103 * exp(-0.136);
    const y = Tasas.rendimiento(fl, B), { D } = Tasas.duracion(fl, y);
    E({
      id: 'U3-16', titulo: 'Duración y cambio de precio', fuente: 'Nuevo', tema: 'Bonos', dificultad: 3,
      enunciado: `<p>El bono del ejercicio U3-03 (precio 98,39) tiene un rendimiento continuo de 6,76 %. a) Calculá su duración. b) Estimá con la duración cuánto cambia el precio si el rendimiento sube 10 puntos básicos.</p>`,
      campos: [
        { etiqueta: 'a) Duración (años)', respuesta: D, tol: 0.005 },
        { etiqueta: 'b) Cambio de precio', respuesta: -B * D * 0.001, tol: 0.003, errores: [{ valor: -B * D * 0.01, mensaje: '10 puntos básicos son 0,10 % = 0,001.' }] },
      ],
      resolucion: `<p>\\(D = \\sum t_i\\,c_i e^{-yt_i}/B = ${k(D, 3)}\\) años. \\(\\Delta B \\approx -B\\,D\\,\\Delta y = -98{,}39 \\times ${k(D, 3)} \\times 0{,}001 = ${k(-B * D * 0.001, 3)}\\).</p>`,
      herramienta: { texto: 'Bonos y duración', enlace: 'herramientas.html#bonos-rendimiento-y-duracion' },
    });
  }

  E({
    id: 'U3-17', titulo: 'Cobertura basada en duración', fuente: 'Basado en Hull, ejemplo 6.x', tema: 'Futuros de tasas', dificultad: 3,
    enunciado: `<p>Un fondo tiene una cartera de bonos de USD 10.000.000 con duración 6,8 años y quiere cubrirse de una suba de tasas con futuros sobre bonos. Cada contrato vale USD 93.062,50 y la duración del bono más barato de entregar es 9,2 años. ¿Cuántos contratos vende?</p>`,
    campos: [{ etiqueta: 'Contratos (con decimales)', respuesta: (10e6 * 6.8) / (93062.5 * 9.2), tol: 0.05, errores: [{ valor: 10e6 / 93062.5, mensaje: 'Faltó ajustar por las duraciones: N* = P·D_P/(V_F·D_F).' }] }],
    resolucion: `<p>\\(N^* = \\dfrac{P\\,D_P}{V_F\\,D_F} = \\dfrac{10.000.000 \\times 6{,}8}{93.062{,}50 \\times 9{,}2} = 79{,}42 \\approx 79\\) contratos vendidos.</p>`,
  });

  E({
    id: 'U3-18', titulo: 'Activos de consumo', fuente: 'Nuevo', tema: 'Commodities', dificultad: 2,
    enunciado: `<p>¿Por qué para un commodity de consumo (por ejemplo, el cobre) solo se puede asegurar \\(F_0 \\le (S_0 + U)e^{rT}\\) y no la igualdad?</p>`,
    respuestaModelo: `<p>Si el futuro estuviera por encima, cualquiera podría hacer cash-and-carry (pedir prestado, comprar, guardar y vender futuros): por eso vale la cota superior. Si estuviera por debajo, el arbitraje inverso exigiría que quienes tienen el bien lo vendan para comprar futuros, y quienes lo usan para producir no lo hacen: tener el bien físico tiene un beneficio (el rendimiento de conveniencia). Por eso el futuro puede quedar por debajo sin que nadie arbitre.</p>`,
  });
  E({
    id: 'U3-19', titulo: 'Precio forward y precio futuro', fuente: 'Nuevo', tema: 'Precio forward', dificultad: 2,
    enunciado: `<p>¿Cuándo son iguales el precio forward y el precio futuro? Si las tasas suben cuando el activo sube, ¿cuál es mayor y por qué?</p>`,
    respuestaModelo: `<p>Con tasas de interés conocidas (determinísticas) son iguales. Si las tasas están positivamente correlacionadas con el activo, el futuro vale un poco más: cuando el activo sube, el largo en futuros cobra ganancias diarias que reinvierte a tasas más altas, y cuando baja, financia las pérdidas a tasas más bajas. El forward no tiene ajuste diario y no aprovecha esa ventaja. Para contratos de pocos meses la diferencia es despreciable.</p>`,
  });
})();
