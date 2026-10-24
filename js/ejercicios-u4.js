window.EJERCICIOS = window.EJERCICIOS || [];
// Ejercicios · Unidad IV · Swaps. Formato: ver el comentario de js/ejercitacion.js.
// Todas las respuestas se CALCULAN con js/calculos.js (Swaps, Tasas): no hay resultados escritos a mano.
// Los mensajes de `errores` son texto plano (no admiten KaTeX ni HTML).

(function () {
  const H = String.raw;
  const E = ej => EJERCICIOS.push(ej);

  // ---------- Formatos ----------
  const redondeo = (x, d) => (Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x);
  const local = (x, d) => Math.abs(x).toLocaleString('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const n = (x, d = 2) => { const r = redondeo(x, d); return (r < 0 ? '−' : '') + local(r, d); };            // texto
  const k = (x, d = 2) => { const r = redondeo(x, d); return (r < 0 ? '-' : '') + local(r, d).replace(/,/g, '{,}'); }; // KaTeX
  const libor = s => (redondeo(s, 2) < 0 ? `LIBOR − ${n(-s)} %` : `LIBOR + ${n(s)} %`);
  const rel = (x, p = 0.001) => Math.abs(x) * p; // tolerancia relativa (0,1 %)
  const M = 1e6;

  // Montos grandes: si el alumno escribe "412.989" o "2.109.129" (puntos de miles, sin decimales),
  // el corrector lo lee como 412,989 o 2,109. Este diagnóstico se lo explica.
  const miles = r => [
    { valor: r / 1000, mensaje: `Si lo escribiste con puntos de miles y sin decimales (${n(r, 0)}), el corrector lo lee como un decimal. Escribilo sin puntos (${Math.round(r)}) o con coma decimal (${n(r)}). Si lo calculaste en millones, pasalo a unidades.` },
    { valor: r / 1e6, mensaje: `Parece un resultado en millones o escrito con puntos de miles sin decimales. Ingresalo completo: ${Math.round(r)} o ${n(r)}.` },
  ];

  const tablaTasas = (cols, filas) => `<div class="tabla-wrap"><table class="tabla"><thead><tr><th></th>${cols.map(c => `<th class="num">${c}</th>`).join('')}</tr></thead><tbody>${filas.map(f => `<tr><td>${f[0]}</td>${f.slice(1).map(x => `<td class="num">${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

  const T_VENTAJA = H`<a href="u4-teoria.html#el-argumento-de-la-ventaja-comparativa">El argumento de la ventaja comparativa</a>`;
  const T_VALUACION = H`<a href="u4-teoria.html#valuacion-de-un-swap-de-tasa-de-interes">Valuación de un swap de tasa de interés</a>`;
  const T_MONEDAS = H`<a href="u4-teoria.html#swap-de-monedas">Swap de monedas</a>`;
  const T_CREDITO = H`<a href="u4-teoria.html#riesgo-de-credito">Riesgo de crédito</a>`;

  const RIESGOS = ['Riesgo cambiario', 'Riesgo de tasa de interés', 'Ninguno: queda calzado'];
  const COBERTURAS = ['Con forwards de moneda', 'Con un swap de tasa de interés', 'Con opciones sobre acciones'];

  // =====================================================================
  // U4-01 · Ventaja comparativa (préstamo)
  // =====================================================================
  {
    const datos = { fijoX: 5.0, spreadX: 0.1, fijoY: 6.4, spreadY: 0.6 };   // X = A (quiere variable), Y = B (quiere fija)
    const v = Swaps.ventajaComparativa({ ...datos, margen: 0.1 });
    const sinBanco = Swaps.ventajaComparativa({ ...datos, margen: 0 });
    E({
      id: 'U4-01', titulo: 'Ventaja comparativa en un préstamo', fuente: 'Guía U4, ej. 1', tema: 'Ventaja comparativa', dificultad: 1,
      enunciado: H`<p>A las empresas A y B les ofrecieron las siguientes tasas anuales sobre un préstamo a 5 años de $20 millones:</p>
        ${tablaTasas(['Tasa fija', 'Tasa variable'], [['Empresa A', '5,0 %', 'LIBOR + 0,1 %'], ['Empresa B', '6,4 %', 'LIBOR + 0,6 %']])}
        <p>La empresa A requiere un préstamo a tasa variable y la B, a tasa fija. Diseñá un swap que le deje al intermediario 0,1 % anual y que sea igualmente atractivo para ambas empresas.</p>
        <p>Indicá la ganancia total que genera el swap (antes del margen del banco) y la tasa que termina pagando cada empresa.</p>`,
      campos: [
        { etiqueta: 'Ganancia total del swap (%)', respuesta: v.total, tol: 0.01,
          errores: [
            { valor: v.a + v.b, mensaje: 'Sumaste las dos diferencias. La ganancia es la diferencia ENTRE las diferencias: 1,4 % − 0,5 %.' },
            { valor: v.total - v.margen, mensaje: 'Ese valor ya descuenta el 0,1 % del banco. Se pide la ganancia total, antes del margen.' },
            { valor: v.a, mensaje: 'Esa es solo la diferencia en tasa fija. Restale la diferencia en tasa variable (0,6 % − 0,1 %).' },
          ] },
        { etiqueta: 'A termina pagando LIBOR + … (%)', respuesta: v.spreadFinalX, tol: 0.01,
          errores: [
            { valor: sinBanco.spreadFinalX, mensaje: 'Repartiste el 0,9 % sin descontar antes el 0,1 % que se queda el banco.' },
            { valor: datos.spreadX - (v.total - v.margen), mensaje: 'Le diste a A toda la ganancia neta. El enunciado pide que el swap sea igualmente atractivo: se reparte en partes iguales.' },
            { valor: datos.spreadX + v.ganancia, mensaje: 'La ganancia REDUCE lo que paga A: hay que restarla de su margen sobre LIBOR, no sumarla.' },
            { valor: -v.ganancia, mensaje: 'Te olvidaste del margen que A pagaría por su cuenta (LIBOR + 0,1 %): la mejora se descuenta de ese 0,1 %.' },
          ] },
        { etiqueta: 'B termina pagando (% fijo)', respuesta: v.fijoFinalY, tol: 0.01,
          errores: [
            { valor: sinBanco.fijoFinalY, mensaje: 'Repartiste la ganancia sin descontar el 0,1 % del banco.' },
            { valor: datos.fijoY + v.ganancia, mensaje: 'La ganancia reduce lo que paga B: restala de 6,4 %.' },
            { valor: datos.fijoY - (v.total - v.margen), mensaje: 'Le diste a B toda la ganancia neta; se reparte en partes iguales.' },
          ] },
      ],
      pistas: [
        'Calculá cuánto más paga B que A en tasa fija y en tasa variable. La ventaja comparativa es la diferencia entre esas dos diferencias.',
        'A tiene ventaja comparativa en tasa fija: se endeuda a tasa fija, B a tasa variable, y el swap da vuelta los flujos. A la ganancia total restale el 0,1 % del banco y repartí el resto en partes iguales.',
      ],
      resolucion: H`<p><b>1. Diferencias.</b> En tasa fija B paga \(6{,}4\% - 5{,}0\% = ${k(v.a, 1)}\%\) más que A; en tasa variable, solo \(0{,}6\% - 0{,}1\% = ${k(v.b, 1)}\%\) más. A es mejor deudor en los dos mercados (ventaja absoluta), pero donde más se nota su ventaja es en la tasa fija: esa es su <b>ventaja comparativa</b>.</p>
        <p><b>2. Ganancia total.</b> \(${k(v.a, 1)}\% - ${k(v.b, 1)}\% = ${k(v.total, 1)}\%\). El banco se queda con 0,1 %, así que quedan \(${k(v.total - v.margen, 1)}\%\) para repartir: \(${k(v.ganancia, 1)}\%\) para cada empresa.</p>
        <p><b>3. Tasas finales.</b> A: \(\text{LIBOR} + 0{,}1\% - ${k(v.ganancia, 1)}\% = \text{LIBOR} ${k(v.spreadFinalX, 1)}\%\). B: \(6{,}4\% - ${k(v.ganancia, 1)}\% = ${k(v.fijoFinalY, 1)}\%\).</p>
        <p><b>4. Un diseño posible</b> (el de la planilla de la cátedra). A se endeuda al 5 % fijo y B a LIBOR + 0,6 %. En el swap, A recibe ${n(v.tasaRecibeX, 1)} % fijo del banco y le paga LIBOR; B le paga ${n(v.tasaPagaY, 1)} % fijo al banco y recibe LIBOR.</p>
        <figure class="diagrama-swap" data-entidades="Empresa A | Banco | Empresa B"
          data-flujos="Banco > Empresa A: ${n(v.tasaRecibeX, 1)} %; Empresa A > Banco: LIBOR; Empresa B > Banco: ${n(v.tasaPagaY, 1)} %; Banco > Empresa B: LIBOR; Empresa A > afuera: 5 %; Empresa B > afuera: LIBOR + 0,6 %">
          <figcaption>Flujos del swap. Las flechas verticales son los préstamos que cada empresa tomó en el mercado.</figcaption></figure>
        <ul><li>A: paga 5 % + LIBOR y cobra ${n(v.tasaRecibeX, 1)} %: neto <b>${libor(v.spreadFinalX)}</b> (mejora ${n(v.ganancia, 1)} % frente a LIBOR + 0,1 %).</li>
        <li>B: paga LIBOR + 0,6 % + ${n(v.tasaPagaY, 1)} % y cobra LIBOR: neto <b>${n(v.fijoFinalY, 1)} %</b> (mejora ${n(v.ganancia, 1)} % frente a 6,4 %).</li>
        <li>Banco: cobra ${n(v.tasaPagaY, 1)} % y paga ${n(v.tasaRecibeX, 1)} %: gana <b>0,1 %</b>. Las tres mejoras suman ${n(v.total, 1)} %.</li></ul>
        <p>Repasá: ${T_VENTAJA}.</p>`,
      herramienta: { texto: 'Calculadora de ventaja comparativa', enlace: 'u4-ejemplos.html#ejemplo-2' },
    });
  }

  // =====================================================================
  // U4-02 · Ventaja comparativa (inversión)
  // =====================================================================
  {
    // En una inversión conviene COBRAR más. Se usa la misma función con las tasas en negativo
    // (cobrar 8,8 % equivale a "pagar" −8,8 %). X = B (quiere variable), Y = A (quiere fija).
    const datos = { fijoX: -8.8, spreadX: 0, fijoY: -8.0, spreadY: 0 };
    const v = Swaps.ventajaComparativa({ ...datos, margen: 0.2 });
    const sinBanco = Swaps.ventajaComparativa({ ...datos, margen: 0 });
    const recibeA = -v.fijoFinalY;            // 8,3 %
    const recibeB = -v.spreadFinalX;          // LIBOR + 0,3 %
    const bancoPagaA = -v.tasaPagaY;          // fija que el banco le paga a A
    const BpagaBanco = -v.tasaRecibeX;        // fija que B le paga al banco
    E({
      id: 'U4-02', titulo: 'Ventaja comparativa en una inversión', fuente: 'Guía U4, ej. 2', tema: 'Ventaja comparativa', dificultad: 2,
      enunciado: H`<p>A las empresas A y B se les ofrecieron las siguientes tasas anuales sobre una inversión de $5 millones a 10 años:</p>
        ${tablaTasas(['Tasa fija', 'Tasa variable'], [['Empresa A', '8,0 %', 'LIBOR'], ['Empresa B', '8,8 %', 'LIBOR']])}
        <p>La empresa A requiere una inversión a tasa fija y B, a tasa variable. Diseñá un swap que le deje a un banco 0,2 % anual y que sea igualmente atractivo para ambas empresas. ¿Cuánto termina cobrando cada una?</p>`,
      campos: [
        { etiqueta: 'Ganancia total del swap (%)', respuesta: v.total, tol: 0.01,
          errores: [{ valor: v.total - v.margen, mensaje: 'Ese valor ya descuenta el 0,2 % del banco. Se pide la ganancia total.' }] },
        { etiqueta: 'A termina cobrando (% fijo)', respuesta: recibeA, tol: 0.01,
          errores: [
            { valor: -sinBanco.fijoFinalY, mensaje: 'Repartiste la ganancia sin descontar el 0,2 % que se queda el banco.' },
            { valor: 8.0 - v.ganancia, mensaje: 'En una inversión, mejorar es COBRAR más: la ganancia se suma a la tasa de A.' },
            { valor: 8.0 + (v.total - v.margen), mensaje: 'Le diste a A toda la ganancia neta; se reparte en partes iguales.' },
          ] },
        { etiqueta: 'B termina cobrando LIBOR + … (%)', respuesta: recibeB, tol: 0.01,
          errores: [
            { valor: -sinBanco.spreadFinalX, mensaje: 'Repartiste la ganancia sin descontar el 0,2 % del banco.' },
            { valor: -recibeB, mensaje: 'En una inversión la ganancia se SUMA a lo que cobra B: LIBOR + 0,3 %.' },
          ] },
      ],
      pistas: [
        'En una inversión la ventaja es cobrar más. ¿En qué mercado B obtiene comparativamente más que A?',
        'B tiene ventaja comparativa en tasa fija (cobra 0,8 % más que A, contra 0 % en variable): B invierte a tasa fija, A a tasa variable, y el swap invierte los flujos.',
      ],
      resolucion: H`<p><b>1. Diferencias.</b> En tasa fija B cobra \(8{,}8\% - 8{,}0\% = ${k(v.a, 1)}\%\) más que A; en tasa variable las dos cobran LIBOR (diferencia ${k(v.b, 0)} %). B tiene ventaja comparativa en la tasa fija.</p>
        <p><b>2. Ganancia total.</b> \(${k(v.a, 1)}\% - ${k(v.b, 0)}\% = ${k(v.total, 1)}\%\). Menos 0,2 % del banco quedan \(${k(v.total - v.margen, 1)}\%\): \(${k(v.ganancia, 1)}\%\) para cada empresa.</p>
        <p><b>3. Tasas finales.</b> A cobra \(8{,}0\% + ${k(v.ganancia, 1)}\% = ${k(recibeA, 1)}\%\) fijo. B cobra \(\text{LIBOR} + ${k(recibeB, 1)}\%\).</p>
        <p><b>4. Un diseño posible.</b> B invierte al 8,8 % fijo y A a LIBOR. En el swap, A le entrega LIBOR al banco y recibe ${n(bancoPagaA, 1)} % fijo; B le paga ${n(BpagaBanco, 1)} % fijo al banco y recibe LIBOR.</p>
        <figure class="diagrama-swap" data-entidades="Empresa A | Banco | Empresa B"
          data-flujos="Banco > Empresa A: ${n(bancoPagaA, 1)} %; Empresa A > Banco: LIBOR; Empresa B > Banco: ${n(BpagaBanco, 1)} %; Banco > Empresa B: LIBOR; afuera > Empresa A: LIBOR; afuera > Empresa B: 8,8 %">
          <figcaption>Las flechas verticales hacia arriba son lo que cada empresa cobra por su inversión.</figcaption></figure>
        <ul><li>A: cobra LIBOR por su inversión, paga LIBOR y cobra ${n(bancoPagaA, 1)} %: neto <b>${n(recibeA, 1)} % fijo</b>.</li>
        <li>B: cobra 8,8 %, paga ${n(BpagaBanco, 1)} % y cobra LIBOR: neto <b>${libor(recibeB)}</b>.</li>
        <li>Banco: ${n(BpagaBanco, 1)} % − ${n(bancoPagaA, 1)} % = <b>0,2 %</b>.</li></ul>
        <p>Repasá: ${T_VENTAJA}.</p>`,
    });
  }

  // =====================================================================
  // U4-03 · Swap de monedas por ventaja comparativa (USD / GBP)
  // =====================================================================
  {
    // "fijo" = mercado en USD, "spread" = mercado en GBP. X = A (quiere GBP), Y = B (quiere USD).
    const datos = { fijoX: 5.0, spreadX: 7.5, fijoY: 7.0, spreadY: 9.0 };
    const v = Swaps.ventajaComparativa({ ...datos, margen: 0.1 });
    const sinBanco = Swaps.ventajaComparativa({ ...datos, margen: 0 });
    const usdBanco = v.fijoFinalY - datos.fijoX;   // el banco cobra 6,8 % USD de B y paga 5,0 % USD a A
    const gbpBanco = v.spreadFinalX - datos.spreadY; // cobra 7,3 % GBP de A y paga 9,0 % GBP a B
    E({
      id: 'U4-03', titulo: 'Swap de monedas por ventaja comparativa', fuente: 'Guía U4, ej. 3', tema: 'Ventaja comparativa', dificultad: 2,
      enunciado: H`<p>La empresa A está endeudada en USD y la B en GBP, ambas a tasa fija. Las tasas que les ofrecen son:</p>
        ${tablaTasas(['USD', 'GBP'], [['Empresa A', '5,0 %', '7,5 %'], ['Empresa B', '7,0 %', '9,0 %']])}
        <p>a) A quiere convertir su pasivo a GBP y B, a USD. Diseñá un swap que le deje a un banco 0,1 % anual y que sea igualmente atractivo para ambas empresas.</p>
        <p>b) ¿Qué inconveniente presenta este swap para el intermediario y cómo lo soluciona?</p>`,
      campos: [
        { etiqueta: 'a) Ganancia total del swap (%)', respuesta: v.total, tol: 0.01,
          errores: [{ valor: v.a + v.b, mensaje: 'Sumaste las diferencias. La ganancia es 2,0 % − 1,5 %.' }] },
        { etiqueta: 'a) A termina pagando en GBP (%)', respuesta: v.spreadFinalX, tol: 0.01,
          errores: [
            { valor: sinBanco.spreadFinalX, mensaje: 'No descontaste el 0,1 % del banco antes de repartir.' },
            { valor: datos.spreadX + v.ganancia, mensaje: 'La ganancia reduce lo que paga A en GBP: restala de 7,5 %.' },
          ] },
        { etiqueta: 'a) B termina pagando en USD (%)', respuesta: v.fijoFinalY, tol: 0.01,
          errores: [
            { valor: sinBanco.fijoFinalY, mensaje: 'No descontaste el 0,1 % del banco antes de repartir.' },
            { valor: datos.fijoY + v.ganancia, mensaje: 'La ganancia reduce lo que paga B en USD: restala de 7,0 %.' },
          ] },
        { etiqueta: 'b) Riesgo que asume el banco', opciones: RIESGOS, respuesta: RIESGOS[0] },
        { etiqueta: 'b) Cómo lo cubre', opciones: COBERTURAS, respuesta: COBERTURAS[0] },
      ],
      pistas: [
        'Tratá cada moneda como un "mercado". A paga 2,0 % menos que B en USD, pero solo 1,5 % menos en GBP: su ventaja comparativa está en USD.',
        'A se endeuda en USD y B en GBP. Mirá en qué moneda cobra y en qué moneda paga el banco cada flujo.',
      ],
      resolucion: H`<p><b>a)</b> En USD, B paga \(7{,}0\% - 5{,}0\% = ${k(v.a, 1)}\%\) más que A; en GBP, \(9{,}0\% - 7{,}5\% = ${k(v.b, 1)}\%\) más. Ganancia total: \(${k(v.a, 1)}\% - ${k(v.b, 1)}\% = ${k(v.total, 1)}\%\). Menos 0,1 % del banco: \(${k(v.total - v.margen, 1)}\%\), es decir \(${k(v.ganancia, 1)}\%\) para cada una.</p>
        <ul><li>A: \(7{,}5\% - ${k(v.ganancia, 1)}\% = ${k(v.spreadFinalX, 1)}\%\) <b>en GBP</b>.</li>
        <li>B: \(7{,}0\% - ${k(v.ganancia, 1)}\% = ${k(v.fijoFinalY, 1)}\%\) <b>en USD</b>.</li></ul>
        <p>Diseño (el de la planilla de la cátedra): A se endeuda en USD al 5 % y B en GBP al 9 %. El banco le paga a A el 5 % en USD y A le paga ${n(v.spreadFinalX, 1)} % en GBP; el banco le paga a B el 9 % en GBP y B le paga ${n(v.fijoFinalY, 1)} % en USD.</p>
        <figure class="diagrama-swap" data-entidades="Empresa A | Banco | Empresa B"
          data-flujos="Banco > Empresa A: USD 5 %; Empresa A > Banco: GBP ${n(v.spreadFinalX, 1)} %; Empresa B > Banco: USD ${n(v.fijoFinalY, 1)} %; Banco > Empresa B: GBP 9 %; Empresa A > afuera: USD 5 %; Empresa B > afuera: GBP 9 %">
          <figcaption>Cada empresa termina pagando en la moneda que quería.</figcaption></figure>
        <p><b>b)</b> Mirá al banco moneda por moneda: en USD cobra ${n(v.fijoFinalY, 1)} % y paga 5,0 % (gana ${n(usdBanco, 1)} % en USD); en GBP cobra ${n(v.spreadFinalX, 1)} % y paga 9,0 % (pierde ${n(-gbpBanco, 1)} % en GBP). El neto es 0,1 %, pero <b>en monedas distintas</b>: si la libra se aprecia contra el dólar, la pérdida en GBP crece y se come la ganancia. El banco queda expuesto a <b>riesgo cambiario</b> y lo cubre comprando GBP a plazo con <b>contratos forward</b> para las fechas de pago.</p>
        <p>Repasá: ${T_MONEDAS}.</p>`,
    });
  }

  // =====================================================================
  // U4-04 · Swap de monedas fija contra variable (CAD / USD)
  // =====================================================================
  {
    const datos = { fijoX: 5.0, spreadX: 0.5, fijoY: 6.5, spreadY: 1.0 }; // X = A (quiere USD variable), Y = B (quiere CAD fija)
    const v = Swaps.ventajaComparativa({ ...datos, margen: 0.5 });
    const sinBanco = Swaps.ventajaComparativa({ ...datos, margen: 0 });
    const pbMal = Swaps.ventajaComparativa({ ...datos, margen: 0.05 });
    const cadBanco = v.fijoFinalY - datos.fijoX;     // +1,25 % en CAD
    const usdBanco = v.spreadFinalX - datos.spreadY; // −0,75 % en USD
    E({
      id: 'U4-04', titulo: 'Swap de monedas: fija en CAD contra variable en USD', fuente: 'Guía U4, ej. 4', tema: 'Ventaja comparativa', dificultad: 2,
      enunciado: H`<p>Las empresas A y B enfrentan las siguientes tasas de interés:</p>
        ${tablaTasas(['Tasa fija (CAD)', 'Tasa variable (USD)'], [['Empresa A', '5,0 %', 'LIBOR + 0,5 %'], ['Empresa B', '6,5 %', 'LIBOR + 1,0 %']])}
        <p>A quiere un préstamo en USD a tasa variable y B, en CAD a tasa fija. Una institución financiera planea concertar un swap y exige 50 pb. Resolvelo de modo que los flujos netos de A y de B queden en una sola moneda.</p>
        <p>a) Calculá las tasas que terminan pagando ambas empresas para que el swap les resulte igualmente atractivo.</p>
        <p>b) ¿Qué inconveniente presenta este swap para el intermediario y cómo lo soluciona?</p>`,
      campos: [
        { etiqueta: 'a) Ganancia total del swap (%)', respuesta: v.total, tol: 0.01,
          errores: [{ valor: v.a + v.b, mensaje: 'Sumaste las diferencias. La ganancia es 1,5 % − 0,5 %.' }] },
        { etiqueta: 'a) A paga en USD: LIBOR + … (%)', respuesta: v.spreadFinalX, tol: 0.01,
          errores: [
            { valor: sinBanco.spreadFinalX, mensaje: 'Ese resultado sale de repartir el 1 % sin descontar los 50 pb del banco (o de darle a A toda la ganancia neta).' },
            { valor: pbMal.spreadFinalX, mensaje: '50 pb (puntos básicos) son 0,50 %, no 0,05 %.' },
            { valor: datos.spreadX + v.ganancia, mensaje: 'La ganancia reduce lo que paga A: restala de LIBOR + 0,5 %.' },
          ] },
        { etiqueta: 'a) B paga en CAD (%)', respuesta: v.fijoFinalY, tol: 0.01,
          errores: [
            { valor: sinBanco.fijoFinalY, mensaje: 'Repartiste el 1 % sin descontar los 50 pb del banco.' },
            { valor: pbMal.fijoFinalY, mensaje: '50 pb (puntos básicos) son 0,50 %, no 0,05 %.' },
            { valor: datos.fijoY + v.ganancia, mensaje: 'La ganancia reduce lo que paga B: restala de 6,5 %.' },
          ] },
        { etiqueta: 'b) Riesgo que asume el banco', opciones: RIESGOS, respuesta: RIESGOS[0] },
        { etiqueta: 'b) Cómo lo cubre', opciones: COBERTURAS, respuesta: COBERTURAS[0] },
      ],
      pistas: [
        '50 pb = 0,50 %. Compará las diferencias entre B y A en cada mercado.',
        'A tiene ventaja comparativa en CAD fija (1,5 % contra 0,5 %): A se endeuda en CAD y B en USD. Para que cada empresa pague en una sola moneda, el banco toma las dos monedas a su cargo.',
      ],
      resolucion: H`<p><b>a)</b> En CAD fija B paga \(${k(v.a, 1)}\%\) más que A; en USD variable, \(${k(v.b, 1)}\%\) más. Ganancia total: \(${k(v.a, 1)}\% - ${k(v.b, 1)}\% = ${k(v.total, 1)}\%\). Menos 0,50 % del banco: \(${k(v.total - v.margen, 2)}\%\), o sea \(${k(v.ganancia, 2)}\%\) para cada una.</p>
        <ul><li>A: \(\text{LIBOR} + 0{,}5\% - ${k(v.ganancia, 2)}\% = \text{LIBOR} + ${k(v.spreadFinalX, 2)}\%\) <b>en USD</b>.</li>
        <li>B: \(6{,}5\% - ${k(v.ganancia, 2)}\% = ${k(v.fijoFinalY, 2)}\%\) <b>en CAD</b>.</li></ul>
        <p>Diseño (el de la planilla de la cátedra): A se endeuda al 5 % en CAD y B a LIBOR + 1 % en USD. El banco le paga a A el 5 % en CAD y A le paga ${libor(v.spreadFinalX)} en USD; el banco le paga a B LIBOR + 1 % en USD y B le paga ${n(v.fijoFinalY)} % en CAD. Así cada empresa queda con flujos en una sola moneda.</p>
        <figure class="diagrama-swap" data-entidades="Empresa A | Banco | Empresa B"
          data-flujos="Banco > Empresa A: CAD 5 %; Empresa A > Banco: USD LIBOR + ${n(v.spreadFinalX)} %; Empresa B > Banco: CAD ${n(v.fijoFinalY)} %; Banco > Empresa B: USD LIBOR + 1 %; Empresa A > afuera: CAD 5 %; Empresa B > afuera: USD LIBOR + 1 %">
          <figcaption>El banco recibe y paga en las dos monedas.</figcaption></figure>
        <p><b>b)</b> El banco gana ${n(cadBanco)} % en CAD (${n(v.fijoFinalY)} % − 5 %) y pierde ${n(-usdBanco)} % en USD (paga LIBOR + 1 %, cobra ${libor(v.spreadFinalX)}). Neto: 0,50 %, pero en monedas distintas, así que queda expuesto a <b>riesgo cambiario</b>. Lo cubre con <b>contratos forward</b> de moneda (por ejemplo, vendiendo a plazo los CAD que va a cobrar).</p>
        <p>Repasá: ${T_MONEDAS}.</p>`,
      herramienta: { texto: 'Calculadora de ventaja comparativa', enlace: 'u4-ejemplos.html#ejemplo-2' },
    });
  }

  // =====================================================================
  // U4-05 · Valuación de un swap de tasa (bonos y FRAs)
  // =====================================================================
  {
    const base = { nocional: 100 * M, tasaFija: 0.07, m: 2, tasasCero: [0.05, 0.05], tasaVariableFijada: 0.046 };
    const a = Swaps.valuarPorBonos({ ...base, tiempos: [4 / 12, 10 / 12] });
    const aF = Swaps.valuarPorFRAs({ ...base, tiempos: [4 / 12, 10 / 12] });
    const b = Swaps.valuarPorBonos({ ...base, tiempos: [3 / 12, 9 / 12] });
    const bF = Swaps.valuarPorFRAs({ ...base, tiempos: [3 / 12, 9 / 12] });
    const va = a.valorRecibeFijo, vb = b.valorRecibeFijo;
    const GUIA_B = 1703422.12; // respuesta impresa en la guía para b), que no coincide con el cálculo
    const fd1 = a.filas[0].fd, fd2 = a.filas[1].fd;
    const sinCuponVar = a.Bfix - base.nocional * fd1;
    const blfNominal = a.Bfix - base.nocional;
    const cuponAnual = Swaps.valuarPorBonos({ ...base, m: 1, tiempos: [4 / 12, 10 / 12] });
    const errA = [
      { valor: sinCuponVar, mensaje: 'Al bono variable le faltó el cupón ya fijado: B_fl = (N + 2,3 M)·e^(−r·t1), no solo N·e^(−r·t1).' },
      { valor: blfNominal, mensaje: 'Tomaste B_fl = N. El bono variable vale N justo DESPUÉS de un pago; hoy vale (N + cupón fijado) descontado hasta el próximo pago.' },
      { valor: vb, mensaje: 'Ese es el valor del inciso b). En a) el próximo pago es dentro de 4 meses y el siguiente dentro de 10.' },
      ...miles(va),
    ];
    E({
      id: 'U4-05', titulo: 'Valuación de un swap de tasa', fuente: 'Guía U4, ej. 5', tema: 'Valuación', dificultad: 2,
      enunciado: H`<p>Un swap de tasas de interés de $100 millones tiene una vida restante de 10 meses. Según sus términos, la LIBOR a seis meses se intercambia por una tasa de 7 % anual (compuesta semestralmente). La tasa swap de mercado para todos los vencimientos (promedio de compra y venta) es 5 % anual con composición continua. La LIBOR a seis meses fue 4,6 % anual hace dos meses. Resolvé por el enfoque de bonos y por el de FRAs.</p>
        <p>a) Calculá el valor actual del swap para la parte que paga tasa variable y para la que paga tasa fija.</p>
        <p>b) Repetí los cálculos suponiendo que para el próximo pago faltan 3 meses.</p>`,
      aviso: H`<b>Diferencia con la guía.</b> Para el inciso b) la guía da 1.703.422,12. El Excel de la cátedra y el cálculo dan <b>${n(vb)}</b>, que es el valor que corrige este ejercicio.`,
      campos: [
        { etiqueta: H`a) \(B_{fix}\) ($)`, respuesta: a.Bfix, tol: rel(a.Bfix, 0.0002),
          errores: [
            { valor: cuponAnual.Bfix, mensaje: 'Usaste el cupón anual (7 M). Con pagos semestrales el cupón es 7 % / 2 × 100 M = 3,5 M.' },
            { valor: 3.5 * M + 103.5 * M, mensaje: 'Sumaste los flujos sin descontarlos.' },
            ...miles(a.Bfix),
          ] },
        { etiqueta: H`a) \(B_{fl}\) ($)`, respuesta: a.Bfl, tol: rel(a.Bfl, 0.0002),
          errores: [
            { valor: base.nocional, mensaje: 'El bono variable vale N justo después de un pago. Hoy vale el nocional más el cupón ya fijado (2,3 M), descontados 4 meses.' },
            { valor: base.nocional * fd1, mensaje: 'Te faltó el cupón ya fijado: 100 M × 4,6 % / 2 = 2,3 M.' },
            { valor: base.nocional * (1 + 0.023), mensaje: 'Falta descontar: (100 + 2,3) M × e^(−0,05 × 4/12).' },
            ...miles(a.Bfl),
          ] },
        { etiqueta: 'a) Valor para quien paga variable ($)', respuesta: va, tol: rel(va), errores: errA },
        { etiqueta: 'a) Valor para quien paga fija ($)', respuesta: -va, tol: rel(va),
          errores: [{ valor: va, mensaje: 'Quien paga fija RECIBE variable: su valor es B_fl − B_fix, el opuesto del de la otra parte.' }, ...miles(-va)] },
        { etiqueta: 'b) Valor para quien paga variable ($)', respuesta: vb, tol: rel(vb),
          errores: [
            { valor: GUIA_B, mensaje: 'Ese es el número que figura en la guía, pero no sale de los datos: el Excel de la cátedra y el cálculo dan 2.117.935,55 (ver el aviso).' },
            { valor: va, mensaje: 'Ese es el valor del inciso a). En b) los pagos son dentro de 3 y de 9 meses.' },
            ...miles(vb),
          ] },
        { etiqueta: 'b) Valor para quien paga fija ($)', respuesta: -vb, tol: rel(vb),
          errores: [{ valor: -GUIA_B, mensaje: 'Ese es el número de la guía con signo negativo; el cálculo da −2.117.935,55 (ver el aviso).' }, ...miles(-vb)] },
      ],
      pistas: [
        H`Quien paga variable recibe fijo: para esa parte el swap vale \(B_{fix} - B_{fl}\). Los pagos son dentro de 4 y de 10 meses; el cupón fijo es 3,5 M por semestre.`,
        H`El bono variable vale el nocional más el cupón ya fijado (4,6 %/2 × 100 M = 2,3 M), descontados hasta el próximo pago: \(B_{fl} = 102{,}3\,e^{-0{,}05 \times 4/12}\) millones.`,
      ],
      resolucion: H`<p><b>a) Enfoque de bonos.</b> Quedan dos pagos, en \(t_1 = 4/12\) y \(t_2 = 10/12\). El cupón fijo es \(100 \times 7\%/2 = 3{,}5\) M.</p>
        <div class="formula">\[ B_{fix} = 3{,}5\,e^{-0{,}05 \times 4/12} + 103{,}5\,e^{-0{,}05 \times 10/12} = ${k(a.Bfix)} \]</div>
        <p>El próximo cupón variable ya se fijó hace dos meses: \(100 \times 4{,}6\%/2 = 2{,}3\) M. Justo después de ese pago el bono variable vuelve a valer el nocional, así que:</p>
        <div class="formula">\[ B_{fl} = (100 + 2{,}3)\,e^{-0{,}05 \times 4/12} = ${k(a.Bfl)} \]</div>
        <p>Para quien <b>paga variable</b> (recibe fijo): \(V = B_{fix} - B_{fl} = ${k(va)}\). Para quien <b>paga fija</b>: \(${k(-va)}\). Tiene sentido: el swap paga 7 % fijo y hoy el mercado pide 5 %, así que recibir fijo vale.</p>
        <p><b>a) Enfoque de FRAs.</b> El primer intercambio ya está fijado: \(0{,}5 \times 100 \times (7\% - 4{,}6\%) = ${k(aF.filas[0].flujo / M, 1)}\) M, con VP \(${k(aF.filas[0].vp)}\). Para el segundo, la forward continua entre 4 y 10 meses es 5 % (curva plana), que en composición semestral es \(2(e^{0{,}025} - 1) = ${k(aF.filas[1].tasaVariable * 100, 4)}\%\). Flujo: \(0{,}5 \times 100 \times (7\% - ${k(aF.filas[1].tasaVariable * 100, 4)}\%) = ${k(aF.filas[1].flujo)}\), con VP \(${k(aF.filas[1].vp)}\). Suma: <b>${n(aF.valorRecibeFijo)}</b>, igual que por bonos.</p>
        <p><b>b)</b> Con los pagos en \(t_1 = 0{,}25\) y \(t_2 = 0{,}75\): \(B_{fix} = ${k(b.Bfix)}\), \(B_{fl} = 102{,}3\,e^{-0{,}05 \times 0{,}25} = ${k(b.Bfl)}\). Valor para quien paga variable: <b>${n(vb)}</b>; para quien paga fija, <b>${n(-vb)}</b>. Por FRAs da lo mismo: ${n(bF.valorRecibeFijo)}.</p>
        <p>Repasá: ${T_VALUACION}.</p>`,
      herramienta: { texto: 'Calculadora de valuación de swaps', enlace: 'u4-ejemplos.html#ejemplo-3' },
    });
  }

  // =====================================================================
  // U4-06 · Valuación de un swap de divisas (GBP / USD)
  // =====================================================================
  {
    const base = { principalDom: 30 * M, tasaDom: 0.06, principalExt: 20 * M, tasaExt: 0.10, spot: 1.85 };
    const rUSD = Tasas.aContinua(0.04, 1), rGBP = Tasas.aContinua(0.07, 1); // tasas anuales → continuas equivalentes
    const sw = Swaps.valuarSwapMonedas({ ...base, rDom: rUSD, rExt: rGBP, tiempos: [0.25, 1.25] });
    const V = -sw.valorBonos;            // quien paga USD y recibe GBP
    const VF = -sw.valorForwards;
    const cont = -Swaps.valuarSwapMonedas({ ...base, rDom: 0.04, rExt: 0.07, tiempos: [0.25, 1.25] }).valorBonos;
    const plazos = -Swaps.valuarSwapMonedas({ ...base, rDom: rUSD, rExt: rGBP, tiempos: [1, 2] }).valorBonos;
    const enGBP = V / base.spot;
    E({
      id: 'U4-06', titulo: 'Valuación de un swap de divisas', fuente: 'Guía U4, ej. 6', tema: 'Valuación', dificultad: 3,
      enunciado: H`<p>Un swap de divisas tiene una vida restante de 15 meses. Requiere intercambiar un interés de 10 % sobre GBP 20 millones por un interés de 6 % sobre USD 30 millones, una vez al año. La estructura temporal de tasas es plana en ambas plazas y, si el swap se negociara hoy, las tasas intercambiadas serían 4 % en USD y 7 % en GBP. Todas las tasas se cotizan con composición anual. El tipo de cambio GBPUSD es 1,8500 (USD por libra).</p>
        <p>Calculá el valor del swap para la parte que paga GBP y para la que paga USD, por el enfoque de bonos y por el de forwards.</p>`,
      campos: [
        { etiqueta: H`\(B_{GBP}\) (GBP)`, respuesta: sw.BF, tol: rel(sw.BF, 0.0002),
          errores: [{ valor: -Swaps.valuarSwapMonedas({ ...base, rDom: 0.04, rExt: 0.07, tiempos: [0.25, 1.25] }).BF * -1, mensaje: 'Descontaste con e^(−rt). Las tasas tienen composición anual: el factor es (1,07)^(−t).' }, ...miles(sw.BF)] },
        { etiqueta: H`\(B_{USD}\) (USD)`, respuesta: sw.BD, tol: rel(sw.BD, 0.0002),
          errores: [{ valor: Swaps.valuarSwapMonedas({ ...base, rDom: 0.04, rExt: 0.07, tiempos: [0.25, 1.25] }).BD, mensaje: 'Descontaste con e^(−rt). Las tasas tienen composición anual: el factor es (1,04)^(−t).' }, ...miles(sw.BD)] },
        { etiqueta: 'Valor para quien paga USD (USD)', respuesta: V, tol: rel(V),
          errores: [
            { valor: cont, mensaje: 'Descontaste con composición continua; las tasas son anuales: usá (1 + r)^(−t).' },
            { valor: plazos, mensaje: 'Usaste pagos dentro de 1 y 2 años. Al swap le quedan 15 meses: los pagos son dentro de 3 y de 15 meses.' },
            { valor: enGBP, mensaje: 'Ese valor está en GBP. Pasalo a dólares: multiplicá B_GBP por 1,85 antes de restar B_USD.' },
            ...miles(V),
          ] },
        { etiqueta: 'Valor para quien paga GBP (USD)', respuesta: -V, tol: rel(V),
          errores: [{ valor: V, mensaje: 'Quien paga GBP recibe USD: su valor es B_USD − 1,85 × B_GBP, el opuesto.' }, ...miles(-V)] },
      ],
      pistas: [
        'Al swap le quedan 15 meses con pagos anuales: los próximos pagos son dentro de 3 y de 15 meses (t = 0,25 y t = 1,25).',
        H`Valuá cada pata como un bono en su moneda, con su tasa: \(B_{GBP} = 2(1{,}07)^{-0{,}25} + 22(1{,}07)^{-1{,}25}\). Después pasá a dólares con el spot.`,
      ],
      resolucion: H`<p><b>Enfoque de bonos.</b> Cupones: GBP \(20 \times 10\% = 2\) M y USD \(30 \times 6\% = 1{,}8\) M, en \(t = 0{,}25\) y \(t = 1{,}25\) (en el último se devuelve el principal).</p>
        <div class="formula">\[ B_{GBP} = 2\,(1{,}07)^{-0{,}25} + 22\,(1{,}07)^{-1{,}25} = ${k(sw.BF / M, 4)} \text{ M GBP} \]</div>
        <div class="formula">\[ B_{USD} = 1{,}8\,(1{,}04)^{-0{,}25} + 31{,}8\,(1{,}04)^{-1{,}25} = ${k(sw.BD / M, 4)} \text{ M USD} \]</div>
        <p>Para quien <b>paga USD</b> (recibe GBP): \(V = 1{,}85 \times B_{GBP} - B_{USD} = ${k(V)}\) USD. Para quien <b>paga GBP</b>: \(${k(-V)}\) USD.</p>
        <p><b>Enfoque de forwards.</b> Con tasas anuales, \(F_t = S_0 \left(\frac{1{,}04}{1{,}07}\right)^{t}\): \(F_{0,25} = ${k(sw.filas[0].forward, 4)}\) y \(F_{1,25} = ${k(sw.filas[1].forward, 4)}\). Para quien recibe GBP:</p>
        <div class="tabla-wrap"><table class="tabla"><thead><tr><th>t</th><th class="num">GBP recibidas × F</th><th class="num">USD pagados</th><th class="num">Neto (USD)</th><th class="num">VP al 4 %</th></tr></thead><tbody>
        ${sw.filas.map(f => `<tr><td>${n(f.t)}</td><td class="num">${n(f.flujoExt * f.forward)}</td><td class="num">${n(f.flujoDom)}</td><td class="num">${n(f.flujoExt * f.forward - f.flujoDom)}</td><td class="num">${n(-f.valorForward)}</td></tr>`).join('')}
        </tbody></table></div>
        <p>Suma: <b>${n(VF)}</b> USD, igual que por bonos. El swap vale mucho para quien recibe libras porque cobra 10 % en GBP cuando el mercado paga 7 %.</p>
        <p>Repasá: ${T_MONEDAS}.</p>`,
      herramienta: { texto: 'Calculadora de swaps de monedas', enlace: 'u4-ejemplos.html#ejemplo-4' },
    });
  }

  // =====================================================================
  // U4-07 · Riesgo de crédito en un swap de tasa
  // =====================================================================
  {
    const rc = Tasas.aContinua(0.08, 2);                 // 8 % semestral → continua (para usar valuarPorBonos)
    const tiempos = [0, 0.5, 1, 1.5, 2];
    const base = { nocional: 10 * M, tasaFija: 0.10, m: 2, tiempos, tasasCero: tiempos.map(() => rc), tasaVariableFijada: 0.09 };
    const v = Swaps.valuarPorBonos(base);
    const perdida = v.valorRecibeFijo;
    const netoIncumplido = v.k - v.kVar;
    const sinIncumplido = perdida - netoIncumplido;
    const libor9 = Swaps.valuarPorBonos({ ...base, tasasCero: tiempos.map(() => rc), tasaVariableFijada: 0.09 }); // referencia
    const netoFuturo = v.k - (base.nocional * 0.08) / 2;
    const anualidad = (tasa, t) => t.slice(1).reduce((s, x) => s + Math.pow(1 + tasa, -2 * x), 0);
    const todo9 = netoIncumplido * (1 + anualidad(0.04, tiempos));
    const al8 = netoIncumplido + netoFuturo * tiempos.slice(1).reduce((s, x) => s + Math.pow(1.08, -2 * x), 0);
    const continua = netoIncumplido + netoFuturo * tiempos.slice(1).reduce((s, x) => s + Math.exp(-0.08 * x), 0);
    E({
      id: 'U4-07', titulo: 'Riesgo de crédito en un swap de tasa', fuente: 'Guía U4, ej. 7', tema: 'Riesgo de crédito', dificultad: 3,
      enunciado: H`<p>Una institución financiera inició un swap de tasas de interés con la empresa X: recibe 10 % anual y paga LIBOR a seis meses sobre un principal de USD 10 millones durante 5 años, con pagos semestrales. La empresa X no cumple en la sexta fecha de pago (fin del año 3), cuando la tasa de interés (composición semestral) es 8 % anual para todos los vencimientos. La LIBOR a seis meses fue 9 % anual a la mitad del año 3.</p>
        <p>Calculá la pérdida para la institución financiera.</p>`,
      campos: [
        { etiqueta: 'Flujo neto del pago incumplido, fin del año 3 (USD)', respuesta: netoIncumplido, tol: 1,
          errores: [
            { valor: v.k - (base.nocional * 0.08) / 2, mensaje: 'El pago del año 3 usa la LIBOR fijada seis meses antes (9 %), no la tasa actual del 8 %.' },
            { valor: 2 * netoIncumplido, mensaje: 'Los pagos son semestrales: 10 % y 9 % se dividen por 2.' },
            ...miles(netoIncumplido),
          ] },
        { etiqueta: 'Pérdida para la institución (USD)', respuesta: perdida, tol: rel(perdida),
          errores: [
            { valor: sinIncumplido, mensaje: 'Falta el intercambio que X no pagó al fin del año 3 (50.000): también se pierde.' },
            { valor: todo9, mensaje: 'Usaste la LIBOR vieja (9 %) para todos los pagos. Los pagos variables futuros se valúan con la tasa vigente (8 %).' },
            { valor: al8, mensaje: 'Descontaste al 8 % por semestre. La tasa del 8 % es anual con composición semestral: 4 % por semestre.' },
            { valor: continua, mensaje: 'Descontaste con e^(−rt). La tasa del 8 % tiene composición semestral: el factor es 1,04^(−n).' },
            { valor: netoIncumplido + 4 * netoFuturo, mensaje: 'Falta descontar los flujos futuros al 4 % semestral.' },
            ...miles(perdida),
          ] },
      ],
      pistas: [
        'Quedan 5 intercambios: el que X no pagó (hoy) y 4 más. El de hoy usa la LIBOR de 9 % fijada hace seis meses; los futuros se valúan con la tasa vigente del 8 %.',
        'Cada intercambio futuro deja 500.000 − 400.000 = 100.000 a favor de la institución. Descontalos al 4 % por semestre.',
      ],
      resolucion: H`<p>La institución recibe fijo (10 %) y paga variable. Cuando X incumple, la pérdida es el <b>valor del swap para la institución</b>, si es positivo: lo que deja de cobrar menos lo que deja de pagar.</p>
        <p><b>1. El pago incumplido</b> (fin del año 3, \(t = 0\)): recibe \(10 \times 10\%/2 = 0{,}5\) M y paga \(10 \times 9\%/2 = 0{,}45\) M. Neto: <b>${n(netoIncumplido, 0)}</b>.</p>
        <p><b>2. Los 4 pagos futuros.</b> Se valúan suponiendo que la LIBOR futura es la tasa vigente (8 %): cada uno deja \(500.000 - 400.000 = ${k(netoFuturo, 0)}\). Se descuentan al 4 % semestral:</p>
        <div class="formula">\[ \text{Pérdida} = ${k(netoIncumplido, 0)} + ${k(netoFuturo, 0)}\left(1{,}04^{-1} + 1{,}04^{-2} + 1{,}04^{-3} + 1{,}04^{-4}\right) = ${k(perdida)} \]</div>
        <p><b>Lo mismo como dos bonos.</b> \(B_{fix} = ${k(v.Bfix)}\) (cupones de 500.000 y el principal, descontados al 4 % semestral) y \(B_{fl} = 10.000.000 + 450.000 = ${k(v.Bfl, 0)}\) (hoy se paga el cupón fijado y el bono vuelve a la par). \(B_{fix} - B_{fl} = ${k(perdida)}\).</p>
        <p>Fijate que la pérdida es apenas un 4 % del principal: en un swap de tasa no se arriesga el nocional, solo el valor del contrato. Repasá: ${T_CREDITO}.</p>`,
    });
  }

  // =====================================================================
  // U4-08 · Riesgo de crédito en un swap de divisas
  // =====================================================================
  {
    const base = { principalDom: 7 * M, principalExt: 10 * M, spot: 0.8, rDom: Tasas.aContinua(0.08, 1), rExt: Tasas.aContinua(0.03, 1), tiempos: [0, 1, 2, 3, 4] };
    const sw = Swaps.valuarSwapMonedas({ ...base, tasaDom: 0.09, tasaExt: 0.04 });   // USD doméstica, CHF extranjera
    const costo = -sw.valorBonos;                   // la institución recibe CHF y paga USD
    const guia = -Swaps.valuarSwapMonedas({ ...base, tasaDom: 0.08, tasaExt: 0.03 }).valorBonos; // cupones = tasas de mercado (Hull)
    const sinHoy = -Swaps.valuarSwapMonedas({ ...base, tasaDom: 0.09, tasaExt: 0.04, tiempos: [1, 2, 3, 4] }).valorBonos;
    const dividido = sw.BF / base.spot - sw.BD;
    E({
      id: 'U4-08', titulo: 'Riesgo de crédito en un swap de divisas', fuente: 'Guía U4, ej. 8', tema: 'Riesgo de crédito', dificultad: 3,
      enunciado: H`<p>Una institución financiera participa en un swap de divisas a 10 años con la empresa Y: recibe un interés de 4 % anual en CHF y paga un interés de 9 % anual en USD. Los intereses se intercambian una vez al año y los principales son USD 7 millones y CHF 10 millones. La empresa Y se declara en quiebra al final del año 6, cuando el tipo de cambio es 0,8000 USD por franco. Al final del año 6 la tasa de interés es 3 % anual en CHF y 8 % anual en USD para todos los vencimientos (composición anual).</p>
        <p>¿Cuál es el costo para la institución financiera?</p>`,
      aviso: H`<b>Diferencia con la guía.</b> La guía y su Excel dan 680.000,00. El enunciado está adaptado de Hull (problema 7.12 del OFOD), donde los cupones del swap son 3 % en CHF y 8 % en USD, iguales a las tasas de mercado: con esos cupones cada pata vale su principal más el cupón del día y el costo es \(0{,}8 \times 10{,}3 - 7{,}56 = 0{,}68\) millones. Con los cupones de este enunciado (4 % y 9 %) el costo es <b>${n(costo)}</b>, que es lo que corrige este ejercicio. Si tu cátedra toma la otra versión, el procedimiento es idéntico.`,
      campos: [
        { etiqueta: H`\(B_{CHF}\) (CHF)`, respuesta: sw.BF, tol: rel(sw.BF, 0.0002),
          errores: [{ valor: Swaps.valuarSwapMonedas({ ...base, tasaDom: 0.08, tasaExt: 0.03 }).BF, mensaje: 'Usaste un cupón del 3 %. El cupón del swap es 4 % sobre CHF 10 M (400.000 por año); el 3 % es solo la tasa para descontar.' }, ...miles(sw.BF)] },
        { etiqueta: H`\(B_{USD}\) (USD)`, respuesta: sw.BD, tol: rel(sw.BD, 0.0002),
          errores: [{ valor: Swaps.valuarSwapMonedas({ ...base, tasaDom: 0.08, tasaExt: 0.03 }).BD, mensaje: 'Usaste un cupón del 8 %. El cupón del swap es 9 % sobre USD 7 M (630.000 por año); el 8 % es la tasa para descontar.' }, ...miles(sw.BD)] },
        { etiqueta: 'Costo para la institución (USD)', respuesta: costo, tol: rel(costo),
          errores: [
            { valor: guia, mensaje: 'Ese es el resultado de la guía, que usa como cupones las tasas de mercado (3 % y 8 %). Con los cupones de este swap (4 % y 9 %) da otro valor: mirá el aviso.' },
            { valor: sinHoy, mensaje: 'Falta el intercambio del año 6, que Y no pagó: entra en t = 0, sin descontar.' },
            { valor: dividido, mensaje: 'El tipo de cambio es 0,80 USD por franco: para pasar CHF a USD se multiplica por 0,80, no se divide.' },
            ...miles(costo),
          ] },
      ],
      pistas: [
        'Quedan los intercambios de los años 6 (el que no se pagó, en t = 0) a 10, con devolución de principales al final. La institución recibe CHF y paga USD: está larga un bono en francos y corta uno en dólares.',
        H`Valuá cada bono en su moneda con su tasa (3 % y 8 % anuales) y pasá el de francos a dólares con 0,80: costo \(= 0{,}8\,B_{CHF} - B_{USD}\).`,
      ],
      resolucion: H`<p>Al quebrar Y, la institución pierde el valor del swap, si es positivo para ella. Quedan 5 intercambios: el del año 6 (hoy, \(t = 0\)) y los de los años 7 a 10, con los principales al final.</p>
        <div class="formula">\[ B_{CHF} = 0{,}4 + \frac{0{,}4}{1{,}03} + \frac{0{,}4}{1{,}03^2} + \frac{0{,}4}{1{,}03^3} + \frac{10{,}4}{1{,}03^4} = ${k(sw.BF / M, 4)} \text{ M CHF} \]</div>
        <p>En dólares: \(0{,}8 \times ${k(sw.BF / M, 4)} = ${k(0.8 * sw.BF / M, 4)}\) M USD.</p>
        <div class="formula">\[ B_{USD} = 0{,}63 + \frac{0{,}63}{1{,}08} + \frac{0{,}63}{1{,}08^2} + \frac{0{,}63}{1{,}08^3} + \frac{7{,}63}{1{,}08^4} = ${k(sw.BD / M, 4)} \text{ M USD} \]</div>
        <p>Costo: \(${k(0.8 * sw.BF / M, 4)} - ${k(sw.BD / M, 4)} = ${k(costo / M, 4)}\) millones, es decir <b>USD ${n(costo)}</b>.</p>
        <p>A diferencia del swap de tasa, acá el intercambio final de principales pesa mucho: por eso el riesgo de crédito de un swap de monedas es mayor. Repasá: ${T_CREDITO}.</p>`,
    });
  }

  // =====================================================================
  // U4-09 · Tabla de flujos
  // =====================================================================
  {
    const libores = [0.042, 0.046, 0.050, 0.054, 0.058, 0.060];
    const fl = Swaps.flujos({ nocional: 10 * M, tasaFija: 0.05, m: 2, tasasVariables: libores });
    const neto = fl.map(f => f.netoPagadorFijo);
    const suma = neto.reduce((s, x) => s + x, 0);
    E({
      id: 'U4-09', titulo: 'Tabla de flujos de un swap', fuente: 'Nuevo', tema: 'Flujos y usos', dificultad: 1,
      enunciado: H`<p>Una empresa firma un swap a 3 años sobre un nocional de $10 millones: <b>paga 5 % anual fijo</b> y recibe LIBOR, con pagos semestrales. Las LIBOR observadas al inicio de cada semestre (que se pagan al final de ese semestre) resultaron: 4,2 %; 4,6 %; 5,0 %; 5,4 %; 5,8 % y 6,0 %.</p>
        <p>a) ¿Cuál es el flujo neto de la empresa en el primer semestre? b) ¿Y en el último? c) ¿Cuánto suman los flujos netos de los seis semestres?</p>`,
      campos: [
        { etiqueta: 'a) Neto del primer semestre ($)', respuesta: neto[0], tol: 1,
          errores: [{ valor: 2 * neto[0], mensaje: 'Las tasas son anuales y los pagos semestrales: dividí por 2.' }, { valor: -neto[0], mensaje: 'La empresa PAGA fijo y RECIBE variable: neto = variable − fijo.' }, ...miles(neto[0])] },
        { etiqueta: 'b) Neto del último semestre ($)', respuesta: neto[5], tol: 1,
          errores: [{ valor: 2 * neto[5], mensaje: 'Las tasas son anuales y los pagos semestrales: dividí por 2.' }, { valor: -neto[5], mensaje: 'La empresa recibe variable y paga fijo: neto = variable − fijo.' }, ...miles(neto[5])] },
        { etiqueta: 'c) Suma de los seis netos ($)', respuesta: suma, tol: 1,
          errores: [{ valor: 2 * suma, mensaje: 'Las tasas son anuales y los pagos semestrales: dividí por 2.' }, { valor: -suma, mensaje: 'Revisá el signo: la empresa recibe variable y paga fijo.' }, ...miles(suma)] },
      ],
      pistas: ['El pago fijo es 10.000.000 × 5 % / 2 = 250.000 por semestre. Cada pago variable es 10.000.000 × LIBOR / 2.'],
      resolucion: H`<p>El pago fijo es \(10.000.000 \times 5\%/2 = ${k(fl[0].pagoFijo, 0)}\) por semestre. La empresa recibe la variable, así que su neto es <b>variable − fijo</b>:</p>
        <div class="tabla-wrap"><table class="tabla"><thead><tr><th>Semestre</th><th class="num">LIBOR</th><th class="num">Recibe (variable)</th><th class="num">Paga (fijo)</th><th class="num">Neto</th></tr></thead><tbody>
        ${fl.map(f => `<tr><td>${f.periodo}</td><td class="num">${n(f.tasaVariable * 100, 1)} %</td><td class="num">${n(f.pagoVariable, 0)}</td><td class="num">${n(f.pagoFijo, 0)}</td><td class="num">${n(f.netoPagadorFijo, 0)}</td></tr>`).join('')}
        </tbody></table></div>
        <p>a) <b>${n(neto[0], 0)}</b>; b) <b>${n(neto[5], 0)}</b>; c) <b>${n(suma, 0)}</b>. Al principio la empresa pierde porque la LIBOR está por debajo del 5 %; cuando las tasas suben, el swap la protege: por eso quien teme una suba de tasas paga fijo.</p>`,
      herramienta: { texto: 'Calculadora de flujos de un swap', enlace: 'u4-ejemplos.html#ejemplo-1' },
    });
  }

  // =====================================================================
  // U4-10 · ¿Siempre conviene el swap?
  // =====================================================================
  {
    const v = Swaps.ventajaComparativa({ fijoX: 5.0, spreadX: 0.5, fijoY: 6.0, spreadY: 1.5, margen: 0 });
    const OP = ['a) Sí, ganan 1 % en total', 'b) Sí, ganan 0,5 % cada una', 'c) No: las dos diferencias son iguales', 'd) No, porque Y tiene peor calificación'];
    E({
      id: 'U4-10', titulo: '¿Siempre conviene el swap?', fuente: 'Nuevo', tema: 'Ventaja comparativa', dificultad: 1,
      enunciado: H`${tablaTasas(['Tasa fija', 'Tasa variable'], [['Empresa X (quiere variable)', '5,0 %', 'LIBOR + 0,5 %'], ['Empresa Y (quiere fija)', '6,0 %', 'LIBOR + 1,5 %']])}
        <p>¿Pueden X e Y mejorar sus condiciones con un swap basado en la ventaja comparativa?</p>
        <ol type="a"><li>Sí, ganan 1 % en total.</li><li>Sí, ganan 0,5 % cada una.</li><li>No: la diferencia en tasa fija (1 %) es igual a la diferencia en tasa variable (1 %), así que no hay ventaja comparativa.</li><li>No, porque Y tiene peor calificación crediticia.</li></ol>`,
      campos: [{ etiqueta: 'Respuesta', opciones: OP, respuesta: v.conviene ? OP[0] : OP[2] }],
      resolucion: H`<p>Diferencia en tasa fija: \(6{,}0\% - 5{,}0\% = ${k(v.a, 1)}\%\). Diferencia en tasa variable: \(1{,}5\% - 0{,}5\% = ${k(v.b, 1)}\%\). La ganancia potencial es la diferencia entre las dos: \(${k(v.total, 1)}\%\). <b>No hay ventaja comparativa</b> (respuesta c): X es mejor deudor en los dos mercados, pero por el mismo margen, así que no hay nada para repartir.</p>
        <p>La d) es una trampa: que Y tenga peor calificación es justamente lo habitual en estos ejemplos. Lo que genera la ganancia no es la diferencia de calidad crediticia en sí, sino que esa diferencia sea <b>distinta</b> en cada mercado.</p>`,
    });
  }

  // =====================================================================
  // U4-11 · Valuación con tasas cero continuas
  // =====================================================================
  {
    const base = { nocional: 50, tasaFija: 0.06, m: 1, tiempos: [0.5, 1.5, 2.5], tasasCero: [0.04, 0.045, 0.05], tasaVariableFijada: 0.05 }; // en millones
    const v = Swaps.valuarPorBonos(base);
    const vF = Swaps.valuarPorFRAs(base);
    E({
      id: 'U4-11', titulo: 'Valuación de un swap con tasas cero continuas', fuente: 'Nuevo', tema: 'Valuación', dificultad: 2,
      enunciado: H`<p>Un swap sobre un nocional de $50 millones tiene pagos anuales. Un banco <b>recibe 6 % fijo</b> y paga la tasa variable anual. Quedan tres pagos, dentro de 0,5; 1,5 y 2,5 años. Las tasas cero (composición continua) para esos plazos son 4 %; 4,5 % y 5 %. La tasa variable ya fijada para el próximo pago es 5 % anual.</p>
        <p>Calculá a) el valor del bono a tasa fija \(B_{fix}\), b) el del bono a tasa variable \(B_{fl}\) y c) el valor del swap para el banco. Expresá todo en millones.</p>`,
      campos: [
        { etiqueta: H`a) \(B_{fix}\) (millones de $)`, respuesta: v.Bfix, tol: 0.001,
          errores: [{ valor: 3 + 3 + 53, mensaje: 'Sumaste los flujos sin descontarlos.' }, { valor: v.Bfix * 1e6, mensaje: 'Se pide en millones.' }] },
        { etiqueta: H`b) \(B_{fl}\) (millones de $)`, respuesta: v.Bfl, tol: 0.001,
          errores: [
            { valor: 50 * v.filas[0].fd, mensaje: 'Te faltó el cupón variable ya fijado (50 × 5 % = 2,5): B_fl = (50 + 2,5)·e^(−0,04 × 0,5).' },
            { valor: 50, mensaje: 'El bono variable vale el nocional justo después de un pago. Hoy faltan 6 meses: descontá 52,5 millones.' },
            { valor: 52.5, mensaje: 'Falta descontar 52,5 millones hasta el próximo pago (0,5 años al 4 %).' },
          ] },
        { etiqueta: 'c) Valor del swap para el banco (millones de $)', respuesta: v.valorRecibeFijo, tol: 0.001,
          errores: [
            { valor: v.Bfix - 50 * v.filas[0].fd, mensaje: 'Al bono variable le faltó el cupón ya fijado.' },
            { valor: v.Bfix - 50, mensaje: 'Tomaste B_fl = 50; hoy vale (50 + 2,5) descontado medio año.' },
          ] },
      ],
      pistas: [H`Los flujos del bono fijo son 3; 3 y 53 millones. Cada uno se descuenta con su tasa: \(e^{-r_i t_i}\).`, H`\(B_{fl} = (50 + 2{,}5)\,e^{-0{,}04 \times 0{,}5}\). El banco recibe fijo: \(V = B_{fix} - B_{fl}\).`],
      resolucion: H`<div class="formula">\[ B_{fix} = 3\,e^{-0{,}04 \times 0{,}5} + 3\,e^{-0{,}045 \times 1{,}5} + 53\,e^{-0{,}05 \times 2{,}5} = ${k(v.Bfix, 4)} \]</div>
        <div class="formula">\[ B_{fl} = (50 + 2{,}5)\,e^{-0{,}04 \times 0{,}5} = ${k(v.Bfl, 4)} \]</div>
        <p>El banco recibe fijo: \(V = B_{fix} - B_{fl} = ${k(v.valorRecibeFijo, 4)}\) millones. Por FRAs (tasas forward implícitas en la curva, pasadas a composición anual) da lo mismo: \(${k(vF.valorRecibeFijo, 4)}\). Repasá: ${T_VALUACION}.</p>`,
      herramienta: { texto: 'Calculadora de valuación de swaps', enlace: 'u4-ejemplos.html#ejemplo-3' },
    });
  }

  // =====================================================================
  // U4-12 · Tasa swap
  // =====================================================================
  {
    const t = [0.5, 1, 1.5, 2], r = [0.040, 0.044, 0.047, 0.050];
    const d = t.map((ti, i) => Tasas.factorDescuento(r[i], ti));      // composición continua (m = 0)
    const sumaD = d.reduce((s, x) => s + x, 0);
    const R = (2 * (1 - d[3])) / sumaD;
    E({
      id: 'U4-12', titulo: 'Tasa swap', fuente: 'Nuevo', tema: 'Valuación', dificultad: 3,
      enunciado: H`<p>Calculá la tasa fija de un swap a 2 años con pagos semestrales que valga cero al inicio, si las tasas cero (composición continua) para 0,5; 1; 1,5 y 2 años son 4,0 %; 4,4 %; 4,7 % y 5,0 %. Expresala como tasa anual con composición semestral.</p>`,
      campos: [
        { etiqueta: 'Tasa swap (% anual, composición semestral)', respuesta: R * 100, tol: 0.01,
          errores: [
            { valor: R * 50, mensaje: 'Ese es el cupón semestral. La tasa anual es el doble.' },
            { valor: Tasas.aContinua(R, 2) * 100, mensaje: 'Esa es la tasa equivalente en composición continua. Se pide con composición semestral.' },
            { valor: 5.0, mensaje: 'La tasa swap no es la tasa cero a 2 años: es la que hace que el bono fijo valga la par.' },
          ] },
      ],
      pistas: [H`Al inicio el bono variable vale la par (\(B_{fl} = N\)). La tasa swap es la que hace \(B_{fix} = N\): \(\frac{R}{2}\sum d_i + d_4 = 1\).`],
      resolucion: H`<p>Al inicio, justo antes de fijar la primera tasa, el bono variable vale el nocional. Para que el swap valga cero, el bono fijo también tiene que valer la par. Con \(N = 1\) y \(d_i = e^{-r_i t_i}\):</p>
        <p>\(d_1 = ${k(d[0], 4)}\), \(d_2 = ${k(d[1], 4)}\), \(d_3 = ${k(d[2], 4)}\), \(d_4 = ${k(d[3], 4)}\); \(\sum d_i = ${k(sumaD, 4)}\).</p>
        <div class="formula">\[ \frac{R}{2}\sum_{i=1}^{4} d_i + d_4 = 1 \;\Rightarrow\; R = \frac{2\,(1 - d_4)}{\sum d_i} = \frac{2\,(1 - ${k(d[3], 4)})}{${k(sumaD, 4)}} = ${k(R * 100, 4)}\% \]</div>
        <p>La tasa swap a 2 años es <b>${n(R * 100, 2)} %</b> anual con composición semestral. Queda apenas por encima de la tasa cero a 2 años porque la curva tiene pendiente positiva y el bono fijo cobra cupones en los plazos más cortos.</p>`,
    });
  }

  // =====================================================================
  // U4-13 · Swap de monedas con tasas continuas
  // =====================================================================
  {
    const base = { principalDom: 11, tasaDom: 0.05, principalExt: 10, tasaExt: 0.03, spot: 1.15, rDom: 0.045, rExt: 0.025, tiempos: [1, 2] }; // millones
    const sw = Swaps.valuarSwapMonedas(base);
    const V = -sw.valorBonos;   // la empresa recibe EUR y paga USD
    const sinPrincipales = (() => {
      const BF = sw.filas.reduce((s, f) => s + base.principalExt * base.tasaExt * f.fdExt, 0);
      const BD = sw.filas.reduce((s, f) => s + base.principalDom * base.tasaDom * f.fdDom, 0);
      return base.spot * BF - BD;
    })();
    E({
      id: 'U4-13', titulo: 'Valuación de un swap de monedas (tasas continuas)', fuente: 'Nuevo', tema: 'Valuación', dificultad: 2,
      enunciado: H`<p>Una empresa <b>recibe 3 % anual en EUR</b> sobre EUR 10 millones y <b>paga 5 % anual en USD</b> sobre USD 11 millones. Quedan dos pagos anuales (dentro de 1 y 2 años), con intercambio de principales al final. Las tasas son 4,5 % en USD y 2,5 % en EUR (composición continua) y el tipo de cambio es 1,15 USD por euro.</p>
        <p>Calculá \(B_{USD}\), \(B_{EUR}\) y el valor del swap para la empresa, en millones de USD.</p>`,
      campos: [
        { etiqueta: H`\(B_{USD}\) (millones de USD)`, respuesta: sw.BD, tol: 0.001, errores: [{ valor: 0.55 + 11.55, mensaje: 'Falta descontar los flujos.' }] },
        { etiqueta: H`\(B_{EUR}\) (millones de EUR)`, respuesta: sw.BF, tol: 0.001, errores: [{ valor: 0.3 + 10.3, mensaje: 'Falta descontar los flujos.' }] },
        { etiqueta: 'Valor para la empresa (millones de USD)', respuesta: V, tol: 0.001,
          errores: [
            { valor: V / base.spot, mensaje: 'Ese valor está en euros. Se pide en USD: V = 1,15 × B_EUR − B_USD.' },
            { valor: sw.BF / base.spot - sw.BD, mensaje: 'El tipo de cambio es USD por euro: para pasar euros a dólares se multiplica por 1,15.' },
            { valor: sinPrincipales, mensaje: 'Te faltó el intercambio de principales al final: el último flujo es 10,3 M EUR contra 11,55 M USD.' },
          ] },
      ],
      pistas: [H`La empresa está larga un bono en euros y corta uno en dólares: \(V = S_0\,B_{EUR} - B_{USD}\).`],
      resolucion: H`<div class="formula">\[ B_{USD} = 0{,}55\,e^{-0{,}045} + 11{,}55\,e^{-0{,}045 \times 2} = ${k(sw.BD, 4)} \]</div>
        <div class="formula">\[ B_{EUR} = 0{,}3\,e^{-0{,}025} + 10{,}3\,e^{-0{,}025 \times 2} = ${k(sw.BF, 4)} \]</div>
        <p>\(V = 1{,}15 \times ${k(sw.BF, 4)} - ${k(sw.BD, 4)} = ${k(V, 4)}\) millones de USD. Con forwards (\(F_t = 1{,}15\,e^{(0{,}045 - 0{,}025)t}\)) da lo mismo: ${n(-sw.valorForwards, 4)}.</p>
        <p>El swap vale a favor de la empresa porque recibe 3 % en euros cuando el mercado paga 2,5 %, y paga 5 % en dólares cuando el mercado pide 4,5 %... pero además el euro "vale" más que lo que se pactó en principales: 10 M EUR × 1,15 = 11,5 M USD contra 11 M USD.</p>`,
      herramienta: { texto: 'Calculadora de swaps de monedas', enlace: 'u4-ejemplos.html#ejemplo-4' },
    });
  }

  // =====================================================================
  // U4-14 · Riesgo de crédito (concepto)
  // =====================================================================
  {
    const OP = ['a) El nocional del swap', 'b) Los intereses de un período', 'c) El valor del swap, si es positivo para el banco', 'd) Una suma fija según el plazo restante'];
    E({
      id: 'U4-14', titulo: '¿Qué pierde el banco si una parte incumple?', fuente: 'Nuevo', tema: 'Riesgo de crédito', dificultad: 1,
      enunciado: H`<p>Un banco intermedia un swap de tasa. Si una de las empresas incumple, el banco pierde:</p>
        <ol type="a"><li>El nocional del swap.</li><li>Los intereses de un período.</li><li>El valor del swap para el banco, si en ese momento es positivo.</li><li>Siempre la misma suma, que depende solo del plazo restante.</li></ol>`,
      campos: [{ etiqueta: 'Respuesta', opciones: OP, respuesta: OP[2] }],
      resolucion: H`<p><b>c)</b>. En un swap de tasa no se intercambia el nocional, así que no está en riesgo. Si la contraparte incumple, el banco tiene que reemplazar el contrato a las condiciones de mercado: pierde el valor que el swap tenía para él. Si ese valor era negativo (el swap le jugaba en contra), el incumplimiento no le genera pérdida. Por eso la exposición cambia con las tasas y no es una suma fija. Repasá: ${T_CREDITO}.</p>`,
    });
  }

  // =====================================================================
  // U4-15 · Uso de swaps
  // =====================================================================
  {
    const OP = ['a) Pagar tasa fija y recibir LIBOR', 'b) Recibir tasa fija y pagar LIBOR', 'c) Un swap de monedas', 'd) Ninguno: un swap no cambia el tipo de tasa'];
    const sube = Swaps.flujos({ nocional: 100, tasaFija: 0.05, m: 1, tasasVariables: [0.07] })[0]; // ejemplo: la LIBOR sube a 7 %
    E({
      id: 'U4-15', titulo: 'Protegerse de una suba de tasas', fuente: 'Nuevo', tema: 'Flujos y usos', dificultad: 1,
      enunciado: H`<p>Una empresa tiene un préstamo a LIBOR + 1 % y teme una suba de tasas. ¿Qué swap le conviene?</p>
        <ol type="a"><li>Pagar tasa fija y recibir LIBOR.</li><li>Recibir tasa fija y pagar LIBOR.</li><li>Un swap de monedas.</li><li>Ninguno: un swap no cambia el tipo de tasa de un préstamo.</li></ol>`,
      campos: [{ etiqueta: 'Respuesta', opciones: OP, respuesta: OP[0] }],
      resolucion: H`<p><b>a)</b>. Con el swap la empresa paga LIBOR + 1 % al banco que le prestó, recibe LIBOR y paga la tasa fija \(K\): neto, \(K + 1\%\) <b>fijo</b>. La LIBOR se cancela, así que una suba ya no la afecta. Por ejemplo, con \(K = 5\%\), si la LIBOR sube a 7 % el swap le deja ${n(sube.netoPagadorFijo, 0)} por cada 100 de nocional, que compensa el mayor interés del préstamo. La b) la dejaría todavía más expuesta a la suba.</p>`,
    });
  }

  // ---------------------------------------------------------------------
  // Los diagramas de swaps de las resoluciones se dibujan al abrirlas: comun.js
  // dibuja los de la página al cargarla, antes de que existan estas tarjetas.
  // ---------------------------------------------------------------------
  if (typeof document !== 'undefined') {
    document.addEventListener('click', ev => {
      const btn = ev.target.closest && ev.target.closest('[data-accion="resolucion"]');
      if (!btn) return;
      const res = btn.closest('.ejercicio').querySelector('.ej-resolucion');
      if (!res || res.hidden) return;
      requestAnimationFrame(() => res.querySelectorAll('figure.diagrama-swap[data-entidades]').forEach(fig => dibujarDiagramaSwap(fig)));
    });
  }
})();
