// Ejercicios · Unidad II · Cobertura y especulación con futuros. Formato: ver js/ejercitacion.js
window.EJERCICIOS = window.EJERCICIOS || [];

(function () {
  const E = ej => EJERCICIOS.push(ej);
  const k = (x, d = 2) => fmt(x, d).replace(/,/g, '{,}');

  E({
    id: 'U2-01', titulo: 'Precio efectivo de una cobertura corta', fuente: 'Basado en Hull, sección 3.x', tema: 'Riesgo de base', dificultad: 1,
    enunciado: `<p>Un productor se cubre vendiendo futuros cuando el contado vale 48 y el futuro 50. Al cerrar la cobertura, el contado vale 44 y el futuro 43. a) ¿Cuál es la base al cerrar? b) ¿Cuál es el resultado de los futuros? c) ¿Qué precio efectivo obtiene?</p>`,
    campos: [
      { etiqueta: 'a) Base final b₂', respuesta: 44 - 43, tol: 0.01, errores: [{ valor: -1, mensaje: 'La base es contado menos futuro: S₂ − F₂.' }] },
      { etiqueta: 'b) Resultado de los futuros', respuesta: 50 - 43, tol: 0.01, errores: [{ valor: -7, mensaje: 'Vendió futuros a 50 y los recompra a 43: gana.' }] },
      { etiqueta: 'c) Precio efectivo', respuesta: 50 + 1, tol: 0.01, errores: [{ valor: 44, mensaje: 'Ese es el precio sin cobertura: sumale el resultado de los futuros.' }, { valor: 50, mensaje: 'Eso sería con base final cero. Acá la base no es cero.' }] },
    ],
    resolucion: `<p>\\(b_2 = 44 - 43 = 1\\). Los futuros ganan \\(50 - 43 = 7\\). Precio efectivo: \\(44 + 7 = 51 = F_1 + b_2 = 50 + 1\\). La base se fortaleció (de −2 a +1) y eso favoreció a la cobertura corta.</p>`,
  });

  E({
    id: 'U2-02', titulo: 'Costo efectivo de una cobertura larga', fuente: 'Nuevo', tema: 'Riesgo de base', dificultad: 1,
    enunciado: `<p>Un molino compra futuros de trigo a 200 para cubrir una compra futura. Cuando compra el trigo, el contado vale 195 y el futuro 196. ¿Cuál es el costo efectivo por tonelada?</p>`,
    campos: [{ etiqueta: 'Costo efectivo', respuesta: 200 + (195 - 196), tol: 0.01, errores: [{ valor: 201, mensaje: 'La base final es S₂ − F₂ = −1: el costo es F₁ + b₂.' }, { valor: 195, mensaje: 'Ese es el precio sin cobertura.' }] }],
    resolucion: `<p>Paga 195 en el contado y pierde \\(200 - 196 = 4\\) en los futuros: costo \\(199 = F_1 + b_2 = 200 + (195 - 196)\\). La base se debilitó y a la cobertura larga le convino.</p>`,
  });

  E({
    id: 'U2-03', titulo: 'Cervecería cubierta con futuros de trigo', fuente: 'Presentación U2 (cátedra)', tema: 'Ratio de cobertura', dificultad: 2,
    enunciado: `<p>Una cervecería va a importar 1.200 toneladas de cebada en dos meses y se cubre con futuros de trigo (contratos de 25 toneladas). \\(\\sigma_F = 0{,}022\\), \\(\\sigma_S = 0{,}027\\), \\(\\rho = 0{,}91\\). Calculá el ratio de cobertura de mínima varianza y la cantidad de contratos (redondeada). ¿Compra o vende futuros?</p>`,
    campos: [
      { etiqueta: 'h*', respuesta: (0.91 * 0.027) / 0.022, tol: 0.002, errores: [{ valor: (0.91 * 0.022) / 0.027, mensaje: 'Invertiste los desvíos: h* = ρ·σS/σF (contado arriba).' }, { valor: 0.91, mensaje: 'h* no es la correlación: hay que multiplicarla por σS/σF.' }] },
      { etiqueta: 'Contratos', respuesta: 54, tol: 0.01, errores: [{ valor: 48, mensaje: 'Eso es con h = 1. Usá h*.' }, { valor: 53, mensaje: '53,6 se redondea a 54.' }] },
      { etiqueta: 'Posición en futuros', opciones: ['Compra (cobertura larga)', 'Venta (cobertura corta)'], respuesta: 'Compra (cobertura larga)' },
    ],
    resolucion: `<p>\\(h^* = 0{,}91 \\times 0{,}027/0{,}022 = 1{,}117\\). \\(N^* = 1{,}117 \\times 1.200/25 = 53{,}6 \\approx 54\\). Como va a comprar cebada y teme una suba, compra futuros.</p>`,
    herramienta: { texto: 'Cobertura con futuros', enlace: 'herramientas.html#cobertura-con-futuros' },
  });

  E({
    id: 'U2-04', titulo: 'Combustible de aviones con heating oil', fuente: 'Basado en Hull, ejemplo 3.x', tema: 'Ratio de cobertura', dificultad: 2,
    enunciado: `<p>Una aerolínea va a comprar 2.000.000 de galones de combustible en un mes y se cubre con futuros de heating oil (42.000 galones por contrato). \\(\\rho = 0{,}928\\), \\(\\sigma_S = 0{,}0263\\), \\(\\sigma_F = 0{,}0313\\). Calculá h*, la efectividad de la cobertura y los contratos.</p>`,
    campos: [
      { etiqueta: 'h*', respuesta: (0.928 * 0.0263) / 0.0313, tol: 0.002 },
      { etiqueta: 'Efectividad (%)', respuesta: 0.928 * 0.928 * 100, tol: 0.1, errores: [{ valor: 92.8, mensaje: 'La efectividad es ρ², no ρ.' }] },
      { etiqueta: 'Contratos (redondeado)', respuesta: 37, tol: 0.01, errores: [{ valor: 48, mensaje: 'Eso es con h = 1.' }] },
    ],
    resolucion: `<p>\\(h^* = 0{,}928 \\times 0{,}0263/0{,}0313 = 0{,}78\\). Efectividad: \\(0{,}928^2 = 86{,}1\\%\\). \\(N^* = 0{,}78 \\times 2.000.000/42.000 = 37{,}1 \\approx 37\\).</p>`,
  });

  {
    const h = (0.928 * 0.0263) / 0.0313, N = (h * 2000000 * 1.94) / (42000 * 1.99);
    E({
      id: 'U2-05', titulo: 'Ajuste por liquidación diaria', fuente: 'Basado en Hull, sección 3.x', tema: 'Ratio de cobertura', dificultad: 3,
      enunciado: `<p>Con los datos del ejercicio anterior, el combustible cuesta 1,94 dólares por galón y el futuro de heating oil, 1,99. ¿Cuántos contratos corresponden con el ajuste por liquidación diaria (<em>tailing the hedge</em>)?</p>`,
      campos: [{ etiqueta: 'Contratos (con decimales)', respuesta: N, tol: 0.05, errores: [{ valor: (h * 2000000) / 42000, mensaje: 'Ese es el cálculo sin ajuste. Con tailing se usan valores: h*·V_A/V_F.' }] }],
      resolucion: `<p>\\(V_A = 2.000.000 \\times 1{,}94 = 3.880.000\\); \\(V_F = 42.000 \\times 1{,}99 = 83.580\\). \\(N^* = 0{,}78 \\times 3.880.000/83.580 = ${k(N)}\\), unos 36 contratos.</p>`,
    });
  }

  {
    const N = (1.5 * 5050000) / (250 * 1010);
    const fut = 30 * (1010 - 902) * 250, ret = 0.01 + 1.5 * (-0.1 + 0.0025 - 0.01), cartera = 5050000 * (1 + ret);
    E({
      id: 'U2-06', titulo: 'Cubrir una cartera con futuros del S&P 500', fuente: 'Presentación U2 (cátedra)', tema: 'Índices y beta', dificultad: 3,
      enunciado: `<p>Un gestor cubre por 3 meses una cartera de USD 5.050.000 con β = 1,5 usando futuros del S&amp;P 500 a 4 meses (250 dólares por punto). Índice: 1.000; futuro: 1.010; tasa libre de riesgo: 4 % anual; dividendos del índice: 1 % anual. A los 3 meses el índice está en 900 y el futuro en 902.</p>
        <p>Calculá: a) los contratos a vender; b) la ganancia en futuros; c) el valor de la cartera (CAPM); d) el valor de la posición cubierta.</p>`,
      campos: [
        { etiqueta: 'a) Contratos', respuesta: N, tol: 0.01, errores: [{ valor: 20, mensaje: 'Te faltó la beta: N* = β·V_A/V_F.' }] },
        { etiqueta: 'b) Ganancia en futuros (USD)', respuesta: fut, tol: 1, errores: [{ valor: 30 * (1000 - 900) * 250, mensaje: 'Usaste el índice, no el futuro: los futuros se vendieron a 1.010 y se recompran a 902.' }] },
        { etiqueta: 'c) Valor de la cartera (USD)', respuesta: cartera, tol: 2, errores: [{ valor: 5050000 * (1 - 0.15), mensaje: 'Aplicaste β al −10 % directo. Por CAPM: r + β·(rendimiento del índice con dividendos − r), todo trimestral.' }] },
        { etiqueta: 'd) Posición cubierta (USD)', respuesta: cartera + fut, tol: 2 },
      ],
      pistas: ['Rendimiento trimestral de la cartera: 0,04/4 + 1,5 × (−10 % + 0,01/4 − 0,04/4).'],
      resolucion: `<p>a) \\(N^* = 1{,}5 \\times 5.050.000/(250 \\times 1.010) = 30\\).</p>
        <p>b) \\(30 \\times (1.010 - 902) \\times 250 = 810.000\\).</p>
        <p>c) El índice rinde −10 % (−9,75 % con dividendos). CAPM: \\(0{,}01 + 1{,}5 \\times (-0{,}0975 - 0{,}01) = -15{,}125\\%\\). Cartera: \\(5.050.000 \\times 0{,}84875 = 4.286.187\\).</p>
        <p>d) \\(4.286.187 + 810.000 = 5.096.187\\): aproximadamente lo invertido más la tasa libre de riesgo.</p>`,
      herramienta: { texto: 'Simulación de beta', enlace: 'u2-simulacion.html#cubrir-o-cambiar-la-beta-de-una-cartera' },
    });
  }

  E({
    id: 'U2-07', titulo: 'Cambiar la beta de una cartera', fuente: 'Nuevo', tema: 'Índices y beta', dificultad: 2,
    enunciado: `<p>Con la cartera del ejercicio anterior (USD 5.050.000, β = 1,5, futuro a 1.010 por 250), ¿cuántos contratos hay que operar para a) bajar la beta a 0,75 y b) subirla a 2? Indicá el número con signo: positivo = vender, negativo = comprar.</p>`,
    campos: [
      { etiqueta: 'a) Para β* = 0,75', respuesta: (1.5 - 0.75) * 20, tol: 0.01 },
      { etiqueta: 'b) Para β* = 2', respuesta: (1.5 - 2) * 20, tol: 0.01, errores: [{ valor: 10, mensaje: 'Para subir la beta se compran futuros: el número es negativo.' }] },
    ],
    resolucion: `<p>\\(V_A/V_F = 5.050.000/252.500 = 20\\). a) \\((1{,}5 - 0{,}75) \\times 20 = 15\\): vender 15. b) \\((1{,}5 - 2) \\times 20 = -10\\): comprar 10.</p>`,
  });

  E({
    id: 'U2-08', titulo: 'Ratio de cobertura con contratos', fuente: 'Presentación U2 (cátedra)', tema: 'Ratio de cobertura', dificultad: 1,
    enunciado: `<p>Un productor va a cosechar 1.000 toneladas de soja. a) Si vende 10 contratos de 100 toneladas, ¿cuál es su ratio de cobertura? b) ¿Cuántos contratos debería vender para un ratio de 0,8?</p>`,
    campos: [
      { etiqueta: 'a) Ratio de cobertura h', respuesta: 1, tol: 0.001 },
      { etiqueta: 'b) Contratos para h = 0,8', respuesta: 8, tol: 0.01 },
    ],
    resolucion: `<p>\\(h = N \\cdot Q_F/Q_A\\). a) \\(10 \\times 100/1.000 = 1\\). b) \\(N = 0{,}8 \\times 1.000/100 = 8\\).</p>`,
  });

  E({
    id: 'U2-09', titulo: '¿La base se fortaleció o se debilitó?', fuente: 'Nuevo', tema: 'Riesgo de base', dificultad: 1,
    enunciado: `<p>Al abrir una cobertura, el contado vale 2,10 y el futuro 2,25. Al cerrarla, el contado vale 2,30 y el futuro 2,35. a) ¿Cuánto cambió la base? b) ¿A quién favoreció ese cambio?</p>`,
    campos: [
      { etiqueta: 'a) Cambio de la base (b₂ − b₁)', respuesta: (2.30 - 2.35) - (2.10 - 2.25), tol: 0.001 },
      { etiqueta: 'b) Favoreció a…', opciones: ['La cobertura corta (vendió futuros)', 'La cobertura larga (compró futuros)'], respuesta: 'La cobertura corta (vendió futuros)' },
    ],
    resolucion: `<p>\\(b_1 = -0{,}15\\) y \\(b_2 = -0{,}05\\): la base subió 0,10, se <b>fortaleció</b>. Eso favorece a quien está largo en contado y corto en futuros: la cobertura corta.</p>`,
  });

  {
    const y = 0.04 + 0.02 - Math.log(200 / 220) / 0.25;
    E({
      id: 'U2-10', titulo: 'Rendimiento de conveniencia implícito', fuente: 'Presentación U2 (cátedra)', tema: 'Conveniencia', dificultad: 2,
      enunciado: `<p>El trigo vale 220 al contado y el futuro a 3 meses, 200. La tasa libre de riesgo es 4 % y el costo de almacenamiento, 2 % anual (continuos). ¿Cuál es el rendimiento de conveniencia implícito? ¿El mercado está en contango o en backwardation?</p>`,
      campos: [
        { etiqueta: 'y (%)', respuesta: y * 100, tol: 0.05, errores: [{ valor: (0.06 + Math.log(200 / 220)) * 100, mensaje: 'Faltó dividir el logaritmo por T = 0,25.' }] },
        { etiqueta: 'Estado del mercado', opciones: ['Contango', 'Backwardation'], respuesta: 'Backwardation' },
      ],
      resolucion: `<p>\\(y = r + c - \\tfrac{1}{T}\\ln\\tfrac{F_0}{S_0} = 0{,}04 + 0{,}02 - 4 \\ln\\tfrac{200}{220} = ${k(y * 100)}\\%\\). El futuro está por debajo del contado: <b>backwardation</b>, típico de un mercado con escasez.</p>`,
    });
  }

  E({
    id: 'U2-11', titulo: 'Especular con futuros sobre índice', fuente: 'Nuevo', tema: 'Especulación', dificultad: 2,
    enunciado: `<p>Un especulador compra 2 futuros sobre un índice a 5.000 (50 dólares por punto) y deposita un margen de 25.000 por contrato. Cierra cuando el futuro está a 5.150. a) ¿Cuánto ganó? b) ¿Qué rendimiento obtuvo sobre el margen?</p>`,
    campos: [
      { etiqueta: 'a) Ganancia (USD)', respuesta: 150 * 50 * 2, tol: 0.5 },
      { etiqueta: 'b) Rendimiento sobre el margen (%)', respuesta: (15000 / 50000) * 100, tol: 0.05, errores: [{ valor: 3, mensaje: 'Ese es el rendimiento del índice. El especulador solo puso el margen.' }] },
    ],
    resolucion: `<p>Gana \\(150 \\times 50 \\times 2 = 15.000\\) con un margen de 50.000: un 30 %, diez veces el 3 % que subió el índice. Con una baja del 3 % perdería lo mismo.</p>`,
  });

  E({
    id: 'U2-12', titulo: 'Elección del contrato', fuente: 'Nuevo', tema: 'Riesgo de base', dificultad: 2,
    enunciado: `<p>Una empresa necesita cubrir una venta que hará el 10 de julio. Hay futuros que vencen en marzo, junio, septiembre y diciembre. ¿Qué vencimiento conviene y por qué?</p>`,
    respuestaModelo: `<p>Septiembre: el vencimiento <b>más cercano posterior</b> al fin de la cobertura. Junio vence antes y obligaría a rolar o a quedar sin cobertura; un contrato que vence muy lejos tiene más riesgo de base y menos liquidez. Además, no conviene usar un contrato en su mes de entrega, porque su precio puede moverse de manera errática.</p>`,
  });
  E({
    id: 'U2-13', titulo: '¿Cubrirse o no?', fuente: 'Nuevo', tema: 'Cobertura', dificultad: 2,
    enunciado: `<p>Dá dos argumentos en contra de que una empresa se cubra y explicá por qué una cobertura puede "salir mal" aunque esté bien hecha.</p>`,
    respuestaModelo: `<p>1) Los accionistas pueden diversificar el riesgo por su cuenta. 2) Si toda la industria está expuesta al mismo riesgo y traslada los precios, cubrirse puede dejar a la empresa desalineada con sus competidores. Una cobertura bien hecha elimina tanto las pérdidas como las ganancias: si el precio se movió a favor, el resultado ex post es peor que sin cubrirse, aunque la decisión haya sido correcta.</p>`,
  });
  E({
    id: 'U2-14', titulo: 'h* = 1 no es cobertura perfecta', fuente: 'Presentación U2 (cátedra)', tema: 'Ratio de cobertura', dificultad: 2,
    enunciado: `<p>Si \\(\\rho = 0{,}5\\) y \\(\\sigma_S = 2\\sigma_F\\), ¿cuánto vale h*? ¿Qué porcentaje de la varianza elimina la cobertura?</p>`,
    campos: [
      { etiqueta: 'h*', respuesta: 1, tol: 0.001 },
      { etiqueta: 'Varianza eliminada (%)', respuesta: 25, tol: 0.1, errores: [{ valor: 100, mensaje: 'h* = 1 no implica cobertura perfecta: la efectividad es ρ².' }, { valor: 50, mensaje: 'La efectividad es ρ², no ρ.' }] },
    ],
    resolucion: `<p>\\(h^* = 0{,}5 \\times 2 = 1\\), pero la efectividad es \\(\\rho^2 = 25\\%\\): queda el 75 % de la varianza. La cobertura perfecta exige \\(\\rho = 1\\).</p>`,
  });
})();
