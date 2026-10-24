// Ejercicios · Unidad VIII · Estrategias con opciones. Formato: ver js/ejercitacion.js
window.EJERCICIOS = window.EJERCICIOS || [];

(function () {
  const E = ej => EJERCICIOS.push(ej);
  const k = (x, d = 2) => fmt(x, d).replace(/,/g, '{,}');
  const exp = Math.exp;
  const SIM = id => ({ texto: 'Abrir en el simulador de estrategias', enlace: `u8-simulacion.html?estrategia=${id}` });

  // Patas: { tipo: 'call'|'put'|'accion', lado: +1 compra / −1 venta, K, prima, n }
  const resultado = (patas, S) => patas.reduce((t, p) => {
    const n = p.n || 1;
    if (p.tipo === 'accion') return t + p.lado * n * (S - p.prima);
    const pago = p.tipo === 'call' ? Math.max(S - p.K, 0) : Math.max(p.K - S, 0);
    return t + p.lado * n * (pago - p.prima);
  }, 0);
  // Tabla de utilidades para varios precios al vencimiento.
  const tabla = (patas, precios, etiquetas) => {
    const cols = [{ titulo: 'S<sub>T</sub>', num: true }, ...patas.map((p, i) => ({ titulo: etiquetas[i], num: true })), { titulo: 'Total', num: true }];
    const filas = precios.map(S => [fmt(S, 2), ...patas.map(p => fmt(resultado([p], S), 2)), { texto: fmt(resultado(patas, S), 2), clase: resultado(patas, S) >= 0 ? 'pos' : 'neg' }]);
    return tablaHTML(cols, filas);
  };
  const figura = (patas, extra = '') => `<figure class="grafico-payoff" data-patas="${patas}"${extra}></figure>`;

  {
    const P = [{ tipo: 'call', lado: 1, K: 15, prima: 4 }, { tipo: 'call', lado: -1, K: 17.5, prima: 2, n: 2 }, { tipo: 'call', lado: 1, K: 20, prima: 0.5 }];
    E({
      id: 'U8-01', titulo: 'Butterfly spread con calls', fuente: 'Guía U8, ej. 1', tema: 'Butterfly', dificultad: 2,
      enunciado: `<p>Hay calls a tres meses con strikes $15, $17,50 y $20 que cuestan $4, $2 y $0,50. Explicá cómo armar un butterfly spread y calculá: a) el costo; b) la ganancia máxima; c) la pérdida máxima; d) los dos break-evens.</p>`,
      campos: [
        { etiqueta: 'a) Costo neto', respuesta: 0.5, tol: 0.01, errores: [{ valor: 2.5, mensaje: 'Se venden DOS calls 17,5: entran 2 × 2 = 4.' }] },
        { etiqueta: 'b) Ganancia máxima', respuesta: 2, tol: 0.01, errores: [{ valor: 2.5, mensaje: 'Restá el costo neto (0,50).' }] },
        { etiqueta: 'c) Pérdida máxima', respuesta: 0.5, tol: 0.01 },
        { etiqueta: 'd) Break-even inferior', respuesta: 15.5, tol: 0.01 },
        { etiqueta: 'd) Break-even superior', respuesta: 19.5, tol: 0.01 },
      ],
      pistas: ['Comprar el call de strike más bajo y el de strike más alto, y vender dos del strike del medio.'],
      resolucion: `<p>Se compra el call 15, se compra el call 20 y se venden 2 calls 17,50. Costo: \\(4 + 0{,}50 - 2 \\times 2 = 0{,}50\\).</p>
        ${tabla(P, [12.5, 15, 15.5, 16, 17.5, 19, 19.5, 20, 22.5], ['Call 15', '2 calls 17,5', 'Call 20'])}
        <p>La ganancia máxima (2) se da con \\(S_T = 17{,}50\\): \\(2{,}50 - 0{,}50\\). Fuera de 15–20 se pierde el costo (0,50). Break-evens: \\(15 + 0{,}50 = 15{,}50\\) y \\(20 - 0{,}50 = 19{,}50\\).</p>
        ${figura('compra call 15 4; venta call 17,5 2 2; compra call 20 0,5', ' data-desde="10" data-hasta="25"')}
        <p>Es una apuesta a que el precio queda quieto, con riesgo acotado.</p>`,
      herramienta: SIM('call-butterfly'),
    });
  }

  {
    const P = [{ tipo: 'put', lado: 1, K: 45, prima: 3 }, { tipo: 'call', lado: 1, K: 50, prima: 2 }];
    E({
      id: 'U8-02', titulo: 'Strangle', fuente: 'Guía U8, ej. 2', tema: 'Volatilidad', dificultad: 1,
      enunciado: `<p>Un call con strike $50 cuesta $2 y un put con strike $45 cuesta $3. ¿Cómo se arma un strangle con estas opciones? Calculá: a) el costo; b) la pérdida máxima; c) los break-evens.</p>`,
      campos: [
        { etiqueta: 'a) Costo', respuesta: 5, tol: 0.01 },
        { etiqueta: 'b) Pérdida máxima', respuesta: 5, tol: 0.01 },
        { etiqueta: 'c) Break-even inferior', respuesta: 40, tol: 0.01, errores: [{ valor: 42, mensaje: 'El costo total (5) se resta del strike del put: 45 − 5.' }] },
        { etiqueta: 'c) Break-even superior', respuesta: 55, tol: 0.01, errores: [{ valor: 52, mensaje: 'Hay que recuperar el costo total (5), no solo la prima del call: 50 + 5.' }] },
      ],
      resolucion: `<p>Se compran el put 45 y el call 50: costo \\(3 + 2 = 5\\).</p>
        ${tabla(P, [30, 40, 45, 47.5, 50, 55, 65], ['Put 45', 'Call 50'])}
        <p>Entre 45 y 50 no se ejerce nada y se pierde todo el costo (5). Se gana si el precio sale de la banda 40–55. Ganancia ilimitada al alza; a la baja, hasta \\(45 - 5 = 40\\) si la acción vale 0.</p>
        ${figura('compra put 45 3; compra call 50 2', ' data-desde="30" data-hasta="65"')}
        <p>Es más barato que un straddle, pero necesita un movimiento más grande. El <i>short strangle</i> tiene el perfil opuesto.</p>`,
      herramienta: SIM('strangle'),
    });
  }

  {
    const bull = [{ tipo: 'put', lado: 1, K: 30, prima: 4 }, { tipo: 'put', lado: -1, K: 35, prima: 7 }];
    E({
      id: 'U8-03', titulo: 'Bull y bear spread con puts', fuente: 'Guía U8, ej. 3', tema: 'Spreads', dificultad: 2,
      enunciado: `<p>Puts con strikes $30 y $35 cuestan $4 y $7. ¿Cómo se arman a) un bull spread y b) un bear spread con estos puts? Para cada uno calculá el flujo inicial, la ganancia máxima y la pérdida máxima. c) ¿Cuál es el break-even?</p>`,
      campos: [
        { etiqueta: 'a) Bull: crédito inicial', respuesta: 3, tol: 0.01 },
        { etiqueta: 'a) Bull: ganancia máxima', respuesta: 3, tol: 0.01 },
        { etiqueta: 'a) Bull: pérdida máxima', respuesta: 2, tol: 0.01, errores: [{ valor: 5, mensaje: 'A la pérdida entre strikes (5) hay que restarle el crédito cobrado (3).' }] },
        { etiqueta: 'b) Bear: débito inicial', respuesta: 3, tol: 0.01 },
        { etiqueta: 'b) Bear: ganancia máxima', respuesta: 2, tol: 0.01 },
        { etiqueta: 'b) Bear: pérdida máxima', respuesta: 3, tol: 0.01 },
        { etiqueta: 'c) Break-even', respuesta: 32, tol: 0.01 },
      ],
      resolucion: `<p>a) <b>Bull spread</b>: compra put 30 y venta put 35. Entran \\(7 - 4 = 3\\) (crédito).</p>
        ${tabla(bull, [25, 30, 32, 35, 40], ['Put 30', '−Put 35'])}
        <p>Si \\(S_T \\ge 35\\), nada se ejerce y queda el crédito (3). Si \\(S_T \\le 30\\), se pierde \\(5 - 3 = 2\\). Break-even \\(35 - 3 = 32\\).</p>
        <p>b) <b>Bear spread</b>: compra put 35 y venta put 30, con débito 3. Es la posición opuesta: gana 2 como máximo (con \\(S_T \\le 30\\)) y pierde 3 como máximo (con \\(S_T \\ge 35\\)); mismo break-even, 32.</p>
        ${figura('compra put 30 4; venta put 35 7', ' data-desde="20" data-hasta="45"')}`,
      herramienta: SIM('bull-put-spread'),
    });
  }

  {
    const P = [{ tipo: 'call', lado: 1, K: 60, prima: 6 }, { tipo: 'put', lado: 1, K: 60, prima: 4 }];
    E({
      id: 'U8-04', titulo: 'Straddle', fuente: 'Guía U8, ej. 4', tema: 'Volatilidad', dificultad: 1,
      enunciado: `<p>Un call con strike $60 cuesta $6 y un put con el mismo strike y vencimiento cuesta $4. Armá la tabla de utilidades de un straddle comprado. a) ¿Cuál es el costo? b, c) ¿Entre qué precios genera pérdida? d) ¿Cuál es la pérdida máxima?</p>`,
      campos: [
        { etiqueta: 'a) Costo', respuesta: 10, tol: 0.01 },
        { etiqueta: 'b) Pierde por encima de…', respuesta: 50, tol: 0.01, errores: [{ valor: 56, mensaje: 'El break-even inferior resta el costo total (10) del strike.' }] },
        { etiqueta: 'c) …y por debajo de', respuesta: 70, tol: 0.01, errores: [{ valor: 66, mensaje: 'El break-even superior suma el costo total (10) al strike.' }] },
        { etiqueta: 'd) Pérdida máxima', respuesta: 10, tol: 0.01 },
      ],
      resolucion: `<p>Se compran el call y el put 60: costo 10.</p>
        ${tabla(P, [40, 50, 55, 60, 65, 70, 80], ['Call 60', 'Put 60'])}
        <p>Pierde si \\(50 < S_T < 70\\); la pérdida máxima (10) se da con \\(S_T = 60\\). Gana con movimientos grandes en cualquier dirección.</p>
        ${figura('compra call 60 6; compra put 60 4', ' data-desde="35" data-hasta="85"')}`,
      herramienta: SIM('straddle'),
    });
  }

  {
    const B = 10000 * exp(-0.1);
    E({
      id: 'U8-05', titulo: 'Principal-protected note', fuente: 'Nuevo', tema: 'Capital garantizado', dificultad: 1,
      enunciado: `<p>Un banco ofrece una nota que garantiza un capital de $10.000 a 2 años. La tasa libre de riesgo es 5 % anual continua. a) ¿Cuánto cuesta hoy el bono cupón cero que asegura el capital? b) ¿Cuánto queda para comprar opciones?</p>`,
      campos: [
        { etiqueta: 'a) Bono cupón cero', respuesta: B, tol: 0.5, errores: [{ valor: 10000 / 1.1, mensaje: 'La tasa es continua: 10.000·e^(−0,05·2).' }, { valor: 10000 * exp(-0.05), mensaje: 'El plazo es de 2 años.' }] },
        { etiqueta: 'b) Para opciones', respuesta: 10000 - B, tol: 0.5 },
      ],
      resolucion: `<p>a) \\(10.000\\,e^{-0{,}05 \\times 2} = ${k(B)}\\). b) \\(10.000 - ${k(B)} = ${k(10000 - B)}\\): con eso se compra un call (u otra opción) que da la participación en la suba. Con tasas más altas o plazos más largos queda más para opciones.</p>`,
      herramienta: SIM('ppn'),
    });
  }

  E({
    id: 'U8-06', titulo: 'Covered call', fuente: 'Nuevo', tema: 'Cubiertas', dificultad: 1,
    enunciado: `<p>Un inversor compra una acción a $40 y vende un call con strike $42 a $1,50. a) Costo neto. b) Ganancia máxima. c) Break-even.</p>`,
    campos: [
      { etiqueta: 'a) Costo neto', respuesta: 38.5, tol: 0.01 },
      { etiqueta: 'b) Ganancia máxima', respuesta: 3.5, tol: 0.01, errores: [{ valor: 2, mensaje: 'Sumá la prima cobrada: 42 − 40 + 1,50.' }] },
      { etiqueta: 'c) Break-even', respuesta: 38.5, tol: 0.01 },
    ],
    resolucion: `<p>a) \\(40 - 1{,}50 = 38{,}50\\). b) Si \\(S_T \\ge 42\\) le ejercen y vende a 42: \\(42 - 38{,}50 = 3{,}50\\). c) 38,50: la prima amortigua una baja de hasta 1,50.</p>
      ${figura('compra accion 40; venta call 42 1,5', ' data-individuales data-desde="25" data-hasta="55"')}
      <p>El perfil es el de un put vendido: renuncia a la suba por encima de 42 a cambio de cobrar la prima.</p>`,
    herramienta: SIM('covered-call'),
  });

  E({
    id: 'U8-07', titulo: 'Protective put', fuente: 'Nuevo', tema: 'Cubiertas', dificultad: 1,
    enunciado: `<p>Un inversor tiene una acción que vale $80 y compra un put con strike $75 a $2. a) ¿Cuál es su pérdida máxima? b) ¿Y su break-even?</p>`,
    campos: [
      { etiqueta: 'a) Pérdida máxima', respuesta: 7, tol: 0.01, errores: [{ valor: 5, mensaje: 'Sumá la prima pagada (2).' }] },
      { etiqueta: 'b) Break-even', respuesta: 82, tol: 0.01, errores: [{ valor: 78, mensaje: 'La prima se pagó: la acción tiene que subir para recuperarla, 80 + 2.' }] },
    ],
    resolucion: `<p>a) Si la acción cae por debajo de 75, vende a 75: pierde \\(80 - 75 + 2 = 7\\). b) \\(80 + 2 = 82\\).</p>
      ${figura('compra accion 80; compra put 75 2', ' data-individuales data-desde="60" data-hasta="100"')}
      <p>El perfil es el de un call comprado: un seguro con franquicia de 5.</p>`,
    herramienta: SIM('protective-put'),
  });

  {
    const box = 10 * exp(-0.05);
    E({
      id: 'U8-08', titulo: 'Box spread y arbitraje', fuente: 'Nuevo', tema: 'Box spread', dificultad: 3,
      enunciado: `<p>Con opciones europeas a un año de strikes 40 y 50 y una tasa de 5 % anual continua: a) ¿Cuánto debería valer un box spread (bull call spread 40–50 + bear put spread 50–40)? b) Si cotiza a $9,30, ¿conviene comprarlo o venderlo? c) ¿Cuál es la ganancia de arbitraje en valor de hoy?</p>`,
      campos: [
        { etiqueta: 'a) Valor teórico', respuesta: box, tol: 0.001, errores: [{ valor: 10, mensaje: 'El box paga 10 seguro al vencimiento: hoy vale su valor presente.' }] },
        { etiqueta: 'b) Operación', opciones: ['Comprarlo', 'Venderlo'], respuesta: 'Comprarlo' },
        { etiqueta: 'c) Ganancia hoy', respuesta: box - 9.3, tol: 0.001 },
      ],
      resolucion: `<p>a) Pase lo que pase, el box paga \\(K_2 - K_1 = 10\\): vale \\(10e^{-0{,}05} = ${k(box, 4)}\\).</p>
        <p>b) A 9,30 está barato: se compra y se financia al 5 %. c) Ganancia hoy: \\(${k(box, 4)} - 9{,}30 = ${k(box - 9.3, 4)}\\) (equivale a \\(${k((box - 9.3) * exp(0.05), 4)}\\) al vencimiento).</p>
        <p>Un box spread es un bono cupón cero sintético: su precio implica una tasa. Comprarlo a 9,30 es prestar a \\(\\ln(10/9{,}30) = ${k(Math.log(10 / 9.3) * 100)}\\%\\), más que el 5 %.</p>`,
      herramienta: SIM('box-spread'),
    });
  }

  E({
    id: 'U8-09', titulo: 'Collar', fuente: 'Nuevo', tema: 'Cubiertas', dificultad: 2,
    enunciado: `<p>Un inversor tiene una acción que vale $50, compra un put con strike $45 a $1,20 y vende un call con strike $55 a $1. a) Costo neto de la posición. b) Ganancia máxima. c) Pérdida máxima.</p>`,
    campos: [
      { etiqueta: 'a) Costo neto', respuesta: 50.2, tol: 0.01 },
      { etiqueta: 'b) Ganancia máxima', respuesta: 4.8, tol: 0.01, errores: [{ valor: 5, mensaje: 'Restá el costo neto de las opciones (0,20).' }] },
      { etiqueta: 'c) Pérdida máxima', respuesta: 5.2, tol: 0.01 },
    ],
    resolucion: `<p>a) \\(50 + 1{,}20 - 1 = 50{,}20\\). b) Con \\(S_T \\ge 55\\): \\(55 - 50{,}20 = 4{,}80\\). c) Con \\(S_T \\le 45\\): \\(50{,}20 - 45 = 5{,}20\\).</p>
      ${figura('compra accion 50; compra put 45 1,2; venta call 55 1', ' data-desde="35" data-hasta="65"')}
      <p>El call vendido financia casi todo el put: el inversor queda entre un piso y un techo.</p>`,
    herramienta: SIM('collar'),
  });

  E({
    id: 'U8-10', titulo: 'Strip', fuente: 'Nuevo', tema: 'Volatilidad', dificultad: 2,
    enunciado: `<p>Un strip se arma con un call y dos puts con strike $40. El call cuesta $3 y cada put $2,50. a) ¿Cuál es el costo? b) ¿Cuáles son los break-evens?</p>`,
    campos: [
      { etiqueta: 'a) Costo', respuesta: 8, tol: 0.01, errores: [{ valor: 5.5, mensaje: 'Son dos puts: 3 + 2 × 2,50.' }] },
      { etiqueta: 'b) Break-even inferior', respuesta: 36, tol: 0.01, errores: [{ valor: 32, mensaje: 'Abajo ganan los dos puts: cada peso de baja vale 2. El break-even es 40 − 8/2.' }] },
      { etiqueta: 'b) Break-even superior', respuesta: 48, tol: 0.01 },
    ],
    resolucion: `<p>a) \\(3 + 2 \\times 2{,}50 = 8\\). b) Abajo: \\(2(40 - S_T) = 8 \\Rightarrow S_T = 36\\). Arriba: \\(S_T - 40 = 8 \\Rightarrow S_T = 48\\).</p>
      ${figura('compra call 40 3; compra put 40 2,5 2', ' data-desde="20" data-hasta="60"')}
      <p>Es un straddle con sesgo bajista: gana el doble si el precio cae.</p>`,
    herramienta: SIM('strip'),
  });

  E({
    id: 'U8-11', titulo: 'Bear call spread', fuente: 'Nuevo', tema: 'Spreads', dificultad: 2,
    enunciado: `<p>Se vende un call con strike $30 a $4 y se compra un call con strike $35 a $1,50. a) ¿Es débito o crédito? ¿Por cuánto? b) Ganancia máxima. c) Pérdida máxima. d) Break-even.</p>`,
    campos: [
      { etiqueta: 'a) Flujo inicial', opciones: ['Crédito', 'Débito'], respuesta: 'Crédito' },
      { etiqueta: 'a) Monto', respuesta: 2.5, tol: 0.01 },
      { etiqueta: 'b) Ganancia máxima', respuesta: 2.5, tol: 0.01 },
      { etiqueta: 'c) Pérdida máxima', respuesta: 2.5, tol: 0.01, errores: [{ valor: 5, mensaje: 'A la diferencia entre strikes restale el crédito cobrado.' }] },
      { etiqueta: 'd) Break-even', respuesta: 32.5, tol: 0.01 },
    ],
    resolucion: `<p>a) Entran \\(4 - 1{,}50 = 2{,}50\\): crédito. b) Si \\(S_T \\le 30\\) no se ejerce nada: gana 2,50. c) Si \\(S_T \\ge 35\\): \\(-(35 - 30) + 2{,}50 = -2{,}50\\). d) \\(30 + 2{,}50 = 32{,}50\\).</p>
      ${figura('venta call 30 4; compra call 35 1,5', ' data-desde="20" data-hasta="45"')}`,
    herramienta: SIM('bear-call-spread'),
  });

  E({
    id: 'U8-12', titulo: 'Butterfly con puts', fuente: 'Nuevo', tema: 'Butterfly', dificultad: 2,
    enunciado: `<p>Puts con strikes 90, 100 y 110 cuestan $1,50, $5 y $11,20. Armá una butterfly con puts y calculá: a) el costo; b) la ganancia máxima; c) los break-evens.</p>`,
    campos: [
      { etiqueta: 'a) Costo', respuesta: 2.7, tol: 0.01 },
      { etiqueta: 'b) Ganancia máxima', respuesta: 7.3, tol: 0.01, errores: [{ valor: 10, mensaje: 'Restá el costo (2,70).' }] },
      { etiqueta: 'c) Break-even inferior', respuesta: 92.7, tol: 0.01 },
      { etiqueta: 'c) Break-even superior', respuesta: 107.3, tol: 0.01 },
    ],
    resolucion: `<p>Compra put 90 + compra put 110 + venta de 2 puts 100. a) \\(1{,}50 + 11{,}20 - 2 \\times 5 = 2{,}70\\). b) Con \\(S_T = 100\\): \\(10 - 2{,}70 = 7{,}30\\). c) \\(90 + 2{,}70 = 92{,}70\\) y \\(110 - 2{,}70 = 107{,}30\\).</p>
      ${figura('compra put 90 1,5; venta put 100 5 2; compra put 110 11,2', ' data-desde="75" data-hasta="125"')}
      <p>Por paridad, tiene el mismo perfil que la butterfly con calls de iguales strikes.</p>`,
    herramienta: SIM('put-butterfly'),
  });

  E({
    id: 'U8-13', titulo: 'Elegir la estrategia', fuente: 'Nuevo', tema: 'Elección', dificultad: 2,
    enunciado: `<p>a) Un inversor cree que el precio va a quedar quieto y quiere riesgo acotado. b) Otro espera un movimiento fuerte, más probablemente a la baja. c) Un tercero tiene acciones y quiere protegerse de una caída financiando el seguro. ¿Qué estrategia le conviene a cada uno?</p>`,
    campos: [
      { etiqueta: 'a) Precio quieto, riesgo acotado', opciones: ['Butterfly', 'Top straddle', 'Bull spread', 'Long strangle'], respuesta: 'Butterfly' },
      { etiqueta: 'b) Movimiento fuerte, sesgo bajista', opciones: ['Straddle', 'Strip', 'Strap', 'Collar'], respuesta: 'Strip' },
      { etiqueta: 'c) Protección financiada', opciones: ['Protective put', 'Collar', 'Bear put spread', 'Box spread'], respuesta: 'Collar' },
    ],
    resolucion: `<p>a) La <b>butterfly</b> gana si el precio queda cerca del strike del medio y su pérdida está limitada al costo. El top straddle (straddle vendido) también apuesta a la quietud, pero con pérdida ilimitada.</p>
      <p>b) El <b>strip</b> (1 call + 2 puts) gana con movimientos grandes y el doble si son a la baja; el strap es el espejo alcista.</p>
      <p>c) El <b>collar</b> compra un put y lo paga vendiendo un call: el protective put protege pero se paga entero.</p>`,
    herramienta: { texto: 'Teoría: mapa de estrategias', enlace: 'u8-teoria.html#mapa-de-estrategias' },
  });

  // ------------------------------------------------------------------
  // Ejercicios nuevos
  // ------------------------------------------------------------------
  {
    const P = [{ tipo: 'call', lado: 1, K: 30, prima: 3 }, { tipo: 'call', lado: -1, K: 35, prima: 1 }];
    E({
      id: 'U8-14', titulo: 'Bull call spread', fuente: 'Hull, ejemplo 12.x', tema: 'Spreads', dificultad: 1,
      enunciado: `<p>Un inversor compra un call con strike $30 a $3 y vende un call con strike $35 a $1 (mismo vencimiento). a) Costo. b) Ganancia máxima. c) Pérdida máxima. d) Break-even.</p>`,
      campos: [
        { etiqueta: 'a) Costo', respuesta: 2, tol: 0.01 },
        { etiqueta: 'b) Ganancia máxima', respuesta: 3, tol: 0.01, errores: [{ valor: 5, mensaje: 'Restá el costo del spread (2).' }] },
        { etiqueta: 'c) Pérdida máxima', respuesta: 2, tol: 0.01 },
        { etiqueta: 'd) Break-even', respuesta: 32, tol: 0.01 },
      ],
      resolucion: `<p>a) \\(3 - 1 = 2\\).</p>${tabla(P, [25, 30, 32, 35, 40], ['Call 30', '−Call 35'])}
        <p>b) Con \\(S_T \\ge 35\\): \\(5 - 2 = 3\\). c) Con \\(S_T \\le 30\\): se pierde el costo, 2. d) \\(30 + 2 = 32\\). Vender el call 35 abarata la apuesta alcista a cambio de un techo.</p>`,
      herramienta: SIM('bull-call-spread'),
    });
  }

  {
    const d = { K: 50, r: 0.05, sigma: 0.3 };
    const cLarga = Opciones.blackScholes({ S: 50, T: 0.5, ...d }).call, cCorta = Opciones.blackScholes({ S: 50, T: 0.25, ...d }).call;
    const costo = cLarga - cCorta;
    const vQuieto = Opciones.blackScholes({ S: 50, T: 0.25, ...d }).call - costo;
    const vBaja = Opciones.blackScholes({ S: 40, T: 0.25, ...d }).call - costo;
    E({
      id: 'U8-15', titulo: 'Spread de calendario', fuente: 'Nuevo', tema: 'Calendario', dificultad: 3,
      enunciado: `<p>Con \\(S_0 = 50\\), \\(r = 5\\%\\) y \\(\\sigma = 30\\%\\), un inversor vende un call a 3 meses y compra un call a 6 meses, los dos con strike 50 (valuados con Black-Scholes). a) ¿Cuánto cuesta el spread? b) ¿Cuál es su resultado cuando vence el call corto si la acción sigue en 50? c) ¿Y si cae a 40? (Suponé que la volatilidad no cambia.)</p>`,
      campos: [
        { etiqueta: 'a) Costo', respuesta: costo, tol: 0.01 },
        { etiqueta: 'b) Resultado con S = 50', respuesta: vQuieto, tol: 0.01, errores: [{ valor: -costo, mensaje: 'El call largo todavía tiene 3 meses de vida: vale su precio de Black-Scholes, no cero.' }] },
        { etiqueta: 'c) Resultado con S = 40', respuesta: vBaja, tol: 0.01 },
      ],
      pistas: ['Cuando vence el corto, el largo es un call a 3 meses: se vende a su precio de Black-Scholes.'],
      resolucion: `<p>a) Call a 6 meses: \\(${k(cLarga)}\\); call a 3 meses: \\(${k(cCorta)}\\). Costo: \\(${k(costo)}\\).</p>
        <p>b) Con \\(S = 50\\) el corto vence sin valor y el largo (3 meses por delante) vale \\(${k(cCorta)}\\): resultado \\(${k(vQuieto)}\\).</p>
        <p>c) Con \\(S = 40\\) el corto vence sin valor y el largo vale apenas \\(${k(cCorta + vBaja)}\\): resultado \\(${k(vBaja)}\\).</p>
        <p>El calendario gana si el precio queda cerca del strike, porque la opción corta pierde valor tiempo más rápido que la larga (theta). Pierde si el precio se aleja mucho en cualquier dirección.</p>`,
      herramienta: SIM('calendar-call'),
    });
  }
})();
