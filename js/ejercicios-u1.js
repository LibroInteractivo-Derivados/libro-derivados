// Ejercicios · Unidad I · Introducción a los derivados. Formato: ver js/ejercitacion.js
// Las respuestas se calculan con js/calculos.js. Números ilustrativos (no son cotizaciones reales).
window.EJERCICIOS = window.EJERCICIOS || [];

(function () {
  const E = ej => EJERCICIOS.push(ej);
  const n = (x, d = 2) => fmt(x, d);
  const k = (x, d = 2) => fmt(x, d).replace(/,/g, '{,}'); // número dentro de una fórmula KaTeX

  // U1-01 · Cuánto puede bajar el precio antes de un llamado
  E({
    id: 'U1-01', titulo: '¿Cuánto puede bajar antes del llamado de margen?', fuente: 'Basado en Hull, problema 2.x', tema: 'Márgenes', dificultad: 1,
    enunciado: `<p>Un inversor compra 2 contratos de futuros de oro (100 onzas cada uno) a 1.450 dólares la onza. El margen inicial es 6.000 dólares por contrato y el de mantenimiento, 4.500 por contrato.</p>
      <p>a) ¿Cuánto puede bajar el precio (por onza) antes de recibir un llamado de margen? b) ¿A qué precio se dispara el llamado?</p>`,
    campos: [
      { etiqueta: 'a) Baja máxima por onza (USD)', respuesta: (12000 - 9000) / 200, tol: 0.01, errores: [{ valor: 30, mensaje: 'Dividiste por 100 onzas, pero son 2 contratos: 200 onzas en total.' }, { valor: 45, mensaje: 'Usaste el margen de mantenimiento total sobre una sola posición: la baja tolerable sale de la diferencia entre el inicial y el de mantenimiento.' }] },
      { etiqueta: 'b) Precio que dispara el llamado (USD)', respuesta: 1450 - 15, tol: 0.01, errores: [{ valor: 1420, mensaje: 'Revisá la cantidad de onzas: 2 contratos × 100.' }] },
    ],
    pistas: ['El llamado llega cuando la pérdida acumulada supera la diferencia entre el margen inicial y el de mantenimiento.'],
    resolucion: `<p>La cuenta empieza con \\(2 \\times 6.000 = 12.000\\) y hay llamado si baja de \\(2 \\times 4.500 = 9.000\\): se pueden perder 3.000.</p>
      <p>Cada dólar de baja cuesta \\(2 \\times 100 = 200\\). Entonces la baja tolerable es \\(3.000 / 200 = 15\\) dólares por onza, y el llamado llega si el precio cae por debajo de \\(1.450 - 15 = 1.435\\).</p>`,
    herramienta: { texto: 'Cuenta de márgenes', enlace: 'herramientas.html#cuenta-de-margenes' },
  });

  // U1-02 · Llamado de margen en dólar futuro
  {
    const contratos = 10, tam = 1000, p0 = 1480, p1 = 1505, mi = 100000, mm = 80000;
    const r = Futuros.cuentaMargen({ precios: [p0, p1], contratos, tamano: tam, margenInicial: mi, margenMantenimiento: mm, larga: false });
    const f = r.filas[0];
    E({
      id: 'U1-02', titulo: 'Llamado de margen en dólar futuro', fuente: 'Nuevo', tema: 'Márgenes', dificultad: 2,
      enunciado: `<p>Una empresa exportadora vende 10 contratos de dólar futuro (USD 1.000 cada uno) a $1.480 por dólar. El margen inicial es $100.000 por contrato y el de mantenimiento, $80.000 por contrato (datos ilustrativos). Al día siguiente el precio de ajuste es $1.505.</p>
        <p>a) ¿Cuál es el resultado del día? b) ¿Cuál es el saldo de la cuenta antes de cualquier depósito? c) ¿Cuánto tiene que depositar?</p>`,
      campos: [
        { etiqueta: 'a) Resultado del día ($)', respuesta: f.diaria, tol: 1, errores: [{ valor: -f.diaria, mensaje: 'Revisá el signo: la posición es corta (vendió futuros) y el precio subió.' }, { valor: -25, mensaje: 'Multiplicá por el tamaño del contrato (USD 1.000) y por la cantidad de contratos.' }] },
        { etiqueta: 'b) Saldo antes del depósito ($)', respuesta: f.saldoAntes, tol: 1 },
        { etiqueta: 'c) Depósito por llamado de margen ($)', respuesta: f.llamado, tol: 1, errores: [{ valor: 800000 - f.saldoAntes, mensaje: 'El depósito no es hasta el margen de mantenimiento: hay que volver al margen INICIAL.' }] },
      ],
      resolucion: `<p>La posición es <b>corta</b>: pierde cuando el precio sube. Resultado: \\(-(1.505 - 1.480) \\times 1.000 \\times 10 = -250.000\\).</p>
        <p>Saldo: \\(1.000.000 - 250.000 = 750.000\\), menor que el mantenimiento (800.000). Hay llamado: se deposita lo necesario para volver al margen inicial, \\(1.000.000 - 750.000 = 250.000\\).</p>`,
      herramienta: { texto: 'Cuenta de márgenes', enlace: 'herramientas.html#cuenta-de-margenes' },
    });
  }

  // U1-03 · Resultado de una posición en futuros
  E({
    id: 'U1-03', titulo: 'Resultado de una posición larga en futuros', fuente: 'Nuevo', tema: 'Futuros', dificultad: 1,
    enunciado: `<p>Un acopiador compra 3 contratos de futuros de soja de 100 toneladas a USD 300 por tonelada. Cierra la posición cuando el futuro cotiza a USD 318. ¿Cuál es el resultado total?</p>`,
    campos: [{ etiqueta: 'Resultado (USD)', respuesta: (318 - 300) * 100 * 3, tol: 0.5, errores: [{ valor: 18, mensaje: 'Ese es el resultado por tonelada: multiplicá por 100 toneladas y por 3 contratos.' }, { valor: 1800, mensaje: 'Te faltó multiplicar por los 3 contratos.' }] }],
    resolucion: `<p>Por tonelada gana \\(318 - 300 = 18\\). Total: \\(18 \\times 100 \\times 3 = 5.400\\) dólares (acumulados a lo largo de los ajustes diarios).</p>`,
  });

  // U1-04 · Forward de un importador
  E({
    id: 'U1-04', titulo: 'Un importador que compra dólares a plazo', fuente: 'Nuevo', tema: 'Forwards', dificultad: 1,
    enunciado: `<p>Un importador tiene que pagar USD 1.000.000 dentro de 3 meses y compra dólares a plazo a $1.450. Al vencimiento el dólar contado vale $1.380.</p>
      <p>a) ¿Cuál es el resultado del forward (en pesos)? b) ¿Cuántos pesos le cuestan, en total, los dólares?</p>`,
    campos: [
      { etiqueta: 'a) Resultado del forward ($)', respuesta: (1380 - 1450) * 1e6, tol: 1, errores: [{ valor: (1450 - 1380) * 1e6, mensaje: 'El forward largo gana si el contado sube por encima de lo pactado; acá bajó.' }] },
      { etiqueta: 'b) Costo total de los dólares ($)', respuesta: 1450 * 1e6, tol: 1, errores: [{ valor: 1380 * 1e6, mensaje: 'Ese es el costo sin cobertura. Con el forward el costo queda fijo en lo pactado.' }] },
    ],
    resolucion: `<p>El forward largo paga \\(S_T - K = 1.380 - 1.450 = -70\\) por dólar: \\(-70.000.000\\) pesos. Pero los dólares se pagan a 1.380 en el contado (o se reciben por el forward a 1.450): en cualquier caso el costo total es \\(1.450 \\times 1.000.000 = 1.450.000.000\\). El forward fijó el precio, aunque ex post hubiera sido mejor no cubrirse.</p>`,
  });

  // U1-05 · Cobertura con put
  E({
    id: 'U1-05', titulo: 'Cobertura con un put: piso y suba', fuente: 'Nuevo', tema: 'Opciones', dificultad: 2,
    enunciado: `<p>Un exportador va a cobrar USD 1.000.000 en 3 meses. En lugar de venderlos a plazo, compra puts con strike $1.450 por dólar y prima $30 por dólar. ¿Cuántos pesos netos por dólar obtiene si al vencimiento el dólar está a a) $1.380 y b) $1.550?</p>`,
    campos: [
      { etiqueta: 'a) Pesos netos por dólar con S_T = 1.380', respuesta: 1450 - 30, tol: 0.01, errores: [{ valor: 1450, mensaje: 'Te faltó restar la prima pagada.' }, { valor: 1350, mensaje: 'Con el dólar a 1.380 el put se ejerce: vende a 1.450, no a 1.380.' }] },
      { etiqueta: 'b) Pesos netos por dólar con S_T = 1.550', respuesta: 1550 - 30, tol: 0.01, errores: [{ valor: 1420, mensaje: 'Con el dólar a 1.550 el put no se ejerce: conviene vender en el mercado.' }] },
    ],
    resolucion: `<p>Obtiene \\(\\max(S_T; K) - \\text{prima}\\). a) Se ejerce: \\(1.450 - 30 = 1.420\\). b) No se ejerce: vende a 1.550 y le queda \\(1.550 - 30 = 1.520\\). El put es un seguro: fija un piso (1.420) sin resignar la suba.</p>`,
  });

  // U1-06 · Apalancamiento con futuros
  {
    const cap = 20000, S = 100, F = 101, m = 0.10, ST = 110;
    const nF = cap / (F * m);
    E({
      id: 'U1-06', titulo: 'Especular con el activo o con futuros', fuente: 'Basado en Hull, sección 1.x', tema: 'Operadores', dificultad: 2,
      enunciado: `<p>Un especulador tiene 20.000 y cree que un activo que hoy vale 100 va a subir. El futuro a 3 meses cotiza a 101 y el margen es el 10 % del valor del contrato (lo deposita todo como margen). A los 3 meses el activo vale 110 (y el futuro converge a ese valor). Calculá el rendimiento sobre el capital a) si compró el activo y b) si compró futuros.</p>`,
      campos: [
        { etiqueta: 'a) Rendimiento comprando el activo (%)', respuesta: ((ST - S) / S) * 100, tol: 0.05 },
        { etiqueta: 'b) Rendimiento con futuros (%)', respuesta: ((nF * (ST - F)) / cap) * 100, tol: 0.1, errores: [{ valor: 100, mensaje: 'Usaste el precio contado (100) en lugar del futuro (101): la posición se pactó a 101.' }] },
      ],
      resolucion: `<p>a) Compra 200 unidades: gana \\(200 \\times 10 = 2.000\\), un 10 %.</p>
        <p>b) Cada unidad en futuros requiere \\(0{,}10 \\times 101 = 10{,}1\\) de margen: con 20.000 toma una posición de \\(20.000 / 10{,}1 = ${k(nF, 2)}\\) unidades. Gana \\(${k(nF, 2)} \\times (110 - 101) = ${k(nF * 9, 2)}\\): un \\(${k((nF * 9) / cap * 100, 1)}\\%\\). El apalancamiento multiplica la ganancia, y también multiplicaría la pérdida si el precio bajara.</p>`,
    });
  }

  // U1-07 · Especular con calls
  E({
    id: 'U1-07', titulo: 'Especular con calls', fuente: 'Basado en Hull, sección 1.x', tema: 'Operadores', dificultad: 2,
    enunciado: `<p>Con los mismos 20.000, el especulador compra calls con strike 100 y prima 5. ¿Qué rendimiento obtiene si al vencimiento el activo vale a) 110 y b) 104?</p>`,
    campos: [
      { etiqueta: 'a) Rendimiento con S_T = 110 (%)', respuesta: ((4000 * (110 - 100 - 5)) / 20000) * 100, tol: 0.05 },
      { etiqueta: 'b) Rendimiento con S_T = 104 (%)', respuesta: ((4000 * (104 - 100 - 5)) / 20000) * 100, tol: 0.05, errores: [{ valor: -100, mensaje: 'Con 104 el call se ejerce (104 > 100): recupera 4 de los 5 de prima.' }] },
    ],
    resolucion: `<p>Compra \\(20.000 / 5 = 4.000\\) calls. a) Cada call paga 10: ganancia neta \\(4.000 \\times (10 - 5) = 20.000\\), un <b>100 %</b>. b) Cada call paga 4: \\(4.000 \\times (4 - 5) = -4.000\\), un <b>−20 %</b>, aunque el activo subió 4 %. Con opciones, la pérdida máxima es la prima (el 100 % del capital) y hace falta superar el break-even (105) para ganar.</p>`,
  });

  // U1-08 · Arbitraje entre plazas
  {
    const ny = 50, ba = 71000, tc = 1400, acc = 1000, costo = 0.005;
    const bruto = (ba - ny * tc) * acc, costos = ((ba + ny * tc) * acc * costo) / 2;
    E({
      id: 'U1-08', titulo: 'Arbitraje entre Nueva York y Buenos Aires', fuente: 'Nuevo', tema: 'Operadores', dificultad: 2,
      enunciado: `<p>Una acción cotiza USD 50 en Nueva York y $71.000 en Buenos Aires; el tipo de cambio es $1.400 por dólar (números ilustrativos). a) ¿Dónde la compra y dónde la vende un arbitrajista? b) ¿Cuánto gana con 1.000 acciones, sin costos? c) ¿Y si los costos totales de la operación (compra y venta juntas) son el 0,5 % del monto operado, medido como el promedio de lo comprado y lo vendido?</p>`,
      campos: [
        { etiqueta: 'a) Compra en…', opciones: ['Nueva York', 'Buenos Aires'], respuesta: 'Nueva York' },
        { etiqueta: 'b) Ganancia sin costos ($)', respuesta: bruto, tol: 1 },
        { etiqueta: 'c) Ganancia con costos ($)', respuesta: bruto - costos, tol: 1, errores: [{ valor: bruto - 2 * costos, mensaje: 'Cobraste el 0,5 % en cada mercado. El enunciado dice que el 0,5 % es el costo total de las dos operaciones, sobre el monto promedio.' }] },
      ],
      resolucion: `<p>En pesos, Nueva York vale \\(50 \\times 1.400 = 70.000\\): está más barata que en Buenos Aires (71.000). Se compra en Nueva York y se vende en Buenos Aires: \\(1.000 \\times 1.000 = 1.000.000\\) de ganancia.</p>
        <p>Costos totales (las dos operaciones): \\(0{,}5\\% \\times (71.000.000 + 70.000.000)/2 = ${k(costos, 0)}\\). Ganancia neta: \\(${k(bruto - costos, 0)}\\). Si los costos fueran mayores que la diferencia, no habría arbitraje.</p>`,
    });
  }

  // U1-09 · Interés abierto
  E({
    id: 'U1-09', titulo: 'Interés abierto', fuente: 'Basado en Hull, sección 2.x', tema: 'Futuros', dificultad: 2,
    enunciado: `<p>En un contrato recién listado ocurren, en orden: (1) A compra 10 contratos y B vende 10; (2) C compra 5 y A vende 5; (3) D vende 3 y B compra 3. ¿Cuál es el interés abierto al final? ¿Y el volumen?</p>`,
    campos: [
      { etiqueta: 'Interés abierto', respuesta: 10, tol: 0.01, errores: [{ valor: 18, mensaje: 'Ese es el volumen: el interés abierto cuenta posiciones abiertas, no operaciones.' }, { valor: 7, mensaje: 'En (3) D abre una posición corta nueva y B cierra 3 de las suyas: el total no cambia.' }] },
      { etiqueta: 'Volumen', respuesta: 18, tol: 0.01 },
    ],
    resolucion: `<p>(1) Se abren 10: interés abierto 10. (2) C abre 5 largos y A cierra 5 de sus largos: sigue en 10. (3) D abre 3 cortos y B cierra 3 de sus cortos: sigue en 10. Posiciones finales: largos A 5 + C 5 = 10; cortos B 7 + D 3 = 10. Volumen: \\(10 + 5 + 3 = 18\\).</p>`,
  });

  // U1-10 · Convergencia
  E({
    id: 'U1-10', titulo: 'Convergencia del futuro al contado', fuente: 'Nuevo', tema: 'Futuros', dificultad: 2,
    enunciado: `<p>Es el último día del período de entrega de un futuro de trigo. El futuro cotiza 210 y el trigo disponible en el lugar de entrega, 200 (por tonelada). ¿Qué haría un arbitrajista y cuánto ganaría por tonelada (sin costos)?</p>`,
    campos: [
      { etiqueta: 'Operación', opciones: ['Comprar trigo y vender futuros', 'Vender trigo y comprar futuros'], respuesta: 'Comprar trigo y vender futuros' },
      { etiqueta: 'Ganancia por tonelada', respuesta: 10, tol: 0.01 },
    ],
    resolucion: `<p>Compra trigo a 200, vende futuros a 210 y lo entrega enseguida: gana 10 sin riesgo. Esas operaciones bajan el futuro y suben el contado hasta que coinciden: por eso, al vencimiento, el precio del futuro converge al contado.</p>`,
  });

  // U1-11 · Payoff de un call (contrato de 100)
  E({
    id: 'U1-11', titulo: 'Resultado de un contrato de opciones', fuente: 'Nuevo', tema: 'Opciones', dificultad: 1,
    enunciado: `<p>Un inversor compra 1 contrato de calls (100 acciones) con strike 45 y prima 2 por acción. ¿Cuál es el resultado si al vencimiento la acción vale a) 40 y b) 50?</p>`,
    campos: [
      { etiqueta: 'a) Resultado con S_T = 40', respuesta: -200, tol: 0.5, errores: [{ valor: -2, mensaje: 'Es por contrato: 100 acciones.' }, { valor: -700, mensaje: 'Si S_T < K el call no se ejerce: solo se pierde la prima.' }] },
      { etiqueta: 'b) Resultado con S_T = 50', respuesta: 300, tol: 0.5, errores: [{ valor: 500, mensaje: 'Te faltó restar la prima.' }] },
    ],
    resolucion: `<p>a) No se ejerce: pierde la prima, \\(-2 \\times 100 = -200\\). b) Se ejerce: \\((50 - 45 - 2) \\times 100 = 300\\).</p>`,
  });

  // U1-12 · Forward corto
  E({
    id: 'U1-12', titulo: 'Payoff de un forward corto', fuente: 'Nuevo', tema: 'Forwards', dificultad: 1,
    enunciado: `<p>Un productor vende a plazo 500 toneladas de maíz a USD 190 por tonelada. ¿Cuál es el resultado del forward si al vencimiento el maíz vale a) 175 y b) 205?</p>`,
    campos: [
      { etiqueta: 'a) Resultado con S_T = 175 (USD)', respuesta: (190 - 175) * 500, tol: 0.5 },
      { etiqueta: 'b) Resultado con S_T = 205 (USD)', respuesta: (190 - 205) * 500, tol: 0.5, errores: [{ valor: (205 - 190) * 500, mensaje: 'El forward corto pierde si el precio sube: el payoff es K − S_T.' }] },
    ],
    resolucion: `<p>El payoff del forward corto es \\(K - S_T\\) por tonelada. a) \\((190 - 175) \\times 500 = 7.500\\). b) \\((190 - 205) \\times 500 = -7.500\\). En los dos casos el productor termina cobrando 190 por tonelada: lo que pierde (o gana) en el forward lo compensa la venta en el contado.</p>`,
  });

  // Conceptuales
  E({
    id: 'U1-13', titulo: 'Forward y futuro: diferencias', fuente: 'Nuevo', tema: 'Futuros', dificultad: 1,
    enunciado: `<p>Explicá cinco diferencias entre un contrato forward y uno de futuros.</p>`,
    respuestaModelo: `<ul><li>El forward es un contrato privado (OTC); el futuro se negocia en un mercado organizado.</li><li>El forward es a medida; el futuro es estandarizado (activo, tamaño, fechas).</li><li>El forward se liquida al final; el futuro tiene ajuste diario con márgenes.</li><li>En el forward hay riesgo de crédito de la contraparte; en el futuro la cámara compensadora es la contraparte de todos y lo reduce casi a cero.</li><li>El forward suele terminar con entrega o liquidación al vencimiento; la mayoría de los futuros se cierran antes con una operación contraria.</li></ul>`,
  });
  E({
    id: 'U1-14', titulo: 'Por qué el llamado repone hasta el margen inicial', fuente: 'Nuevo', tema: 'Márgenes', dificultad: 2,
    enunciado: `<p>¿Por qué, ante un llamado de margen, hay que depositar lo necesario para volver al margen inicial y no solo al de mantenimiento? ¿Qué pasa si el inversor no deposita?</p>`,
    respuestaModelo: `<p>El margen protege a la cámara (y al agente) de que el inversor no pague sus pérdidas. Si solo se repusiera hasta el mantenimiento, una baja mínima al día siguiente generaría otro llamado: volver al inicial restablece el colchón completo. Si el inversor no deposita, el agente cierra su posición; las pérdidas hasta ese momento se cubren con el saldo de la cuenta.</p>`,
  });
  E({
    id: 'U1-15', titulo: 'Cubrirse con un forward o con una opción', fuente: 'Nuevo', tema: 'Operadores', dificultad: 2,
    enunciado: `<p>Un exportador puede cubrirse vendiendo dólares a plazo o comprando un put sobre el dólar. ¿Qué logra y qué resigna con cada alternativa?</p>`,
    respuestaModelo: `<p>Con el <b>forward</b> fija el tipo de cambio sin pagar nada hoy: elimina el riesgo, pero también resigna el beneficio si el dólar sube. Con el <b>put</b> paga una prima (un seguro): se asegura un piso (strike menos prima) y conserva la ganancia si el dólar sube. El forward es más barato si el dólar baja; el put es mejor si sube lo suficiente como para compensar la prima.</p>`,
  });
})();
