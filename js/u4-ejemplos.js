// Unidad IV · Ejemplos prácticos de swaps.
// Las fórmulas están en calculos.js (objeto Swaps); acá solo se leen los datos y se muestran resultados.

// ---------- Ejemplo 1: flujos de un swap de tasa ----------
function ejemploFlujos() {
  const nocional = numero('f-nocional');
  const tasaFija = numero('f-fija') / 100;
  const m = numero('f-m');
  const variables = listaNumeros('f-variables').map(x => x / 100);
  if ([nocional, tasaFija].some(Number.isNaN) || !variables.length || variables.some(Number.isNaN)) return datosInvalidos();

  const pagaFijo = elegido('f-lado') === 'pagaFijo';
  const filas = Swaps.flujos({ nocional, tasaFija, m, tasasVariables: variables });
  const signo = pagaFijo ? 1 : -1;
  const netos = filas.map(f => signo * f.netoPagadorFijo);
  const total = netos.reduce((a, b) => a + b, 0);

  const columnas = [
    { titulo: 'Período' },
    { titulo: 'Tasa variable', num: true },
    { titulo: pagaFijo ? 'Recibe (variable)' : 'Paga (variable)', num: true },
    { titulo: pagaFijo ? 'Paga (fijo)' : 'Recibe (fijo)', num: true },
    { titulo: 'Neto', num: true },
  ];
  const cuerpo = filas.map((f, i) => [
    f.periodo,
    fmtPct(f.tasaVariable),
    fmt(f.pagoVariable, 3),
    fmt(f.pagoFijo, 3),
    { texto: (netos[i] > 0 ? '+' : '') + fmt(netos[i], 3), clase: claseSigno(netos[i]) },
  ]);
  cuerpo.push(['<strong>Total</strong>', '', '', '', { texto: (total > 0 ? '+' : '') + fmt(total, 3), clase: claseSigno(total) }]);
  $('f-tabla').innerHTML = tablaHTML(columnas, cuerpo, i => (i === filas.length ? 'total' : ''));

  const opciones = opcionesEjes({ tituloY: 'Flujo neto (millones)', leyenda: false, decY: 3 });
  opciones.scales.x = { type: 'category', title: { display: true, text: 'Período', color: coloresGrafico().suave }, ticks: { color: coloresGrafico().suave }, grid: { display: false } };
  dibujarGrafico($('f-grafico'), {
    type: 'bar',
    data: {
      labels: filas.map(f => f.periodo),
      datasets: [{
        label: 'Flujo neto',
        data: netos,
        backgroundColor: netos.map(v => (v >= 0 ? coloresGrafico().ganancia : coloresGrafico().perdida)),
      }],
    },
    options: opciones,
  });
}

// ---------- Ejemplo 2: ventaja comparativa ----------
function ejemploVentaja() {
  const nx = $('v-nx').value || 'X';
  const ny = $('v-ny').value || 'Y';
  const datos = {
    fijoX: numero('v-fx') / 100, spreadX: numero('v-sx') / 100,
    fijoY: numero('v-fy') / 100, spreadY: numero('v-sy') / 100,
    margen: numero('v-margen') / 100,
  };
  if (Object.values(datos).some(Number.isNaN)) return datosInvalidos();
  const r = Swaps.ventajaComparativa(datos);

  $('v-datos').innerHTML = `
    <div class="dato"><div class="dato-etiqueta">a: diferencia en tasa fija</div><div class="dato-valor">${fmtPct(r.a)}</div></div>
    <div class="dato"><div class="dato-etiqueta">b: diferencia en tasa variable</div><div class="dato-valor">${fmtPct(r.b)}</div></div>
    <div class="dato destacado"><div class="dato-etiqueta">Ganancia total (a − b)</div><div class="dato-valor">${fmtPct(r.total)}</div></div>
    ${r.conviene ? `<div class="dato"><div class="dato-etiqueta">Ganancia de cada empresa</div><div class="dato-valor pos">${fmtPct(r.ganancia, 3)}</div></div>` : ''}`;

  if (!r.conviene) {
    $('v-resultado').innerHTML = r.total <= 0
      ? `<div class="alerta">No hay ganancia por ventaja comparativa: ${nx} ya tiene su ventaja comparativa en tasa variable, que es lo que quiere. Le conviene endeudarse directamente, sin swap.</div>`
      : `<div class="alerta">La ganancia total (${fmtPct(r.total)}) no alcanza para cubrir el margen del banco (${fmtPct(datos.margen)}). El swap no conviene.</div>`;
    return;
  }

  const pct = x => fmt(x * 100, 3).replace(/,?0+$/, '') + ' %';
  const conBanco = datos.margen > 0;
  const fig = document.createElement('figure');
  fig.className = 'diagrama-swap';
  fig.dataset.entidades = conBanco ? `${nx} | Banco | ${ny}` : `${nx} | ${ny}`;
  const medioX = conBanco ? 'Banco' : ny;
  const medioY = conBanco ? 'Banco' : nx;
  fig.dataset.flujos = [
    `${medioX} > ${nx}: ${pct(r.tasaRecibeX)}`,
    `${nx} > ${medioX}: SOFR`,
    ...(conBanco ? [`${ny} > Banco: ${pct(r.tasaPagaY)}`, `Banco > ${ny}: SOFR`] : []),
    `${nx} > afuera: ${pct(datos.fijoX)}`,
    `${ny} > afuera: SOFR + ${pct(datos.spreadY)}`,
  ].join('; ');

  $('v-resultado').innerHTML = '';
  $('v-resultado').appendChild(fig);
  dibujarDiagramaSwap(fig);

  const spreadFinal = r.spreadFinalX >= 0 ? `SOFR + ${pct(r.spreadFinalX)}` : `SOFR − ${pct(-r.spreadFinalX)}`;
  $('v-resultado').insertAdjacentHTML('beforeend', `
    <div class="explicacion">
      <p><strong>Paso 1.</strong> Cada empresa se endeuda donde tiene ventaja comparativa: ${nx} a tasa fija (${pct(datos.fijoX)}) y ${ny} a tasa variable (SOFR + ${pct(datos.spreadY)}).</p>
      <p><strong>Paso 2.</strong> Firman el swap: ${nx} recibe ${pct(r.tasaRecibeX)} fijo y paga SOFR; ${ny} paga ${pct(r.tasaPagaY)} fijo y recibe SOFR.${conBanco ? ` El banco se queda con la diferencia: ${pct(r.tasaPagaY - r.tasaRecibeX)}.` : ''}</p>
      <p><strong>${nx}</strong> termina pagando <strong>${spreadFinal}</strong> (contra SOFR + ${pct(datos.spreadX)} si iba directo): ahorra ${pct(r.ganancia)}.</p>
      <p><strong>${ny}</strong> termina pagando <strong>${pct(r.fijoFinalY)} fijo</strong> (contra ${pct(datos.fijoY)} si iba directo): ahorra ${pct(r.ganancia)}.</p>
    </div>`);
}

// ---------- Ejemplo 3: valuación de un swap de tasa ----------
function ejemploValuacion() {
  const nocional = numero('s-nocional');
  const tasaFija = numero('s-fija') / 100;
  const m = numero('s-m');
  const proximo = numero('s-proximo');
  const cantidadLeida = Math.round(numero('s-cantidad'));
  if (!(cantidadLeida >= 1 && cantidadLeida <= 60)) {
    $('s-fechas').textContent = 'La cantidad de pagos tiene que ser un número entero entre 1 y 60.';
    return datosInvalidos();
  }
  const cantidad = cantidadLeida;
  const tasaVariableFijada = numero('s-fijada') / 100;
  const tasasCero = listaNumeros('s-ceros').map(x => x / 100);
  const tiempos = Swaps.fechasDePago({ proximo, cantidad, m });

  $('s-fechas').textContent = `Fechas de pago (años): ${tiempos.map(t => fmt(t, 2)).join(' · ')}. Ingresá ${cantidad} tasa${cantidad > 1 ? 's' : ''}.`;

  if ([nocional, tasaFija, proximo, tasaVariableFijada].some(Number.isNaN) || tasasCero.some(Number.isNaN)) return datosInvalidos();
  if (tasasCero.length !== cantidad) {
    $('s-resultado').innerHTML = `<div class="alerta">Hay ${cantidad} pagos pendientes pero ingresaste ${tasasCero.length} tasa${tasasCero.length === 1 ? '' : 's'} cero. Tiene que haber una por cada pago.</div>`;
    return;
  }

  const datos = { nocional, tasaFija, m, tiempos, tasasCero, tasaVariableFijada };
  const bonos = Swaps.valuarPorBonos(datos);
  const fras = Swaps.valuarPorFRAs(datos);
  const recibeFijo = elegido('s-lado') === 'recibeFijo';
  const s = recibeFijo ? 1 : -1;
  const valor = s * bonos.valorRecibeFijo;

  const tablaBonos = tablaHTML(
    [{ titulo: 'Pago' }, { titulo: 't (años)', num: true }, { titulo: 'Tasa cero', num: true }, { titulo: 'Factor de descuento', num: true }, { titulo: 'Flujo del bono fijo', num: true }, { titulo: 'Valor presente', num: true }],
    bonos.filas.map((f, i) => [i + 1, fmt(f.t, 2), fmtPct(f.tasa), fmt(f.fd, 4), fmt(f.flujo, 2), fmt(f.vp, 4)])
  );

  const tablaFRAs = tablaHTML(
    [{ titulo: 'Pago' }, { titulo: 't (años)', num: true }, { titulo: 'Forward (continua)', num: true }, { titulo: `Tasa variable (comp. ${m}/año)`, num: true }, { titulo: 'Flujo neto', num: true }, { titulo: 'Valor presente', num: true }],
    fras.filas.map((f, i) => {
      const vp = s * f.vp;
      return [
        i + 1, fmt(f.t, 2),
        f.forwardContinua === null ? 'ya fijada' : fmtPct(f.forwardContinua, 3),
        fmtPct(f.tasaVariable, 3),
        fmt(s * f.flujo, 4),
        { texto: fmt(vp, 4), clase: claseSigno(vp) },
      ];
    })
  );

  const iguales = Math.abs(bonos.valorRecibeFijo - fras.valorRecibeFijo) < 1e-6;
  $('s-resultado').innerHTML = `
    <div class="resultados">
      <div class="dato"><div class="dato-etiqueta">B<sub>fix</sub> (bono fijo)</div><div class="dato-valor">${fmt(bonos.Bfix, 4)}</div></div>
      <div class="dato"><div class="dato-etiqueta">B<sub>fl</sub> (bono variable)</div><div class="dato-valor">${fmt(bonos.Bfl, 4)}</div></div>
      <div class="dato destacado"><div class="dato-etiqueta">Valor del swap para esta posición</div><div class="dato-valor ${claseSigno(valor)}">${fmt(valor, 4)}</div></div>
    </div>
    <h3>Método 1: diferencia de bonos</h3>
    <p>Cupón fijo por período: \\(k = ${fmt(bonos.k, 4)}\\). Próximo pago variable ya fijado: \\(k^* = ${fmt(bonos.kVar, 4)}\\).</p>
    ${tablaBonos}
    <p>\\(B_{fl} = (L + k^*)\\,e^{-r_1 t_1} = ${fmt(nocional + bonos.kVar, 4)} \\times ${fmt(bonos.filas[0].fd, 4)} = ${fmt(bonos.Bfl, 4)}\\)</p>
    <p>Valor = ${recibeFijo ? '\\(B_{fix} - B_{fl}\\)' : '\\(B_{fl} - B_{fix}\\)'} = <strong>${fmt(valor, 4)}</strong></p>
    <h3>Método 2: cartera de FRAs</h3>
    ${tablaFRAs}
    <p>Suma de los valores presentes = <strong>${fmt(s * fras.valorRecibeFijo, 4)}</strong></p>
    <div class="${iguales ? 'ok' : 'alerta'}">${iguales ? 'Los dos métodos dan el mismo valor.' : 'Los métodos no coinciden: revisá los datos.'}</div>`;
  renderFormulas($('s-resultado'));

  const act = { nocional, tasaFija, m, proximo, cantidad, tasaVariableFijada, ceros: tasasCero.join('|'), lado: recibeFijo, valor };
  const ch = valPrevio ? Object.keys(act).filter(x => x !== 'valor' && act[x] !== valPrevio[x]) : [];
  if (valPrevio && !ch.length) return;
  const quien = recibeFijo ? 'quien recibe fijo' : 'quien paga fijo';
  let porque = `El swap equivale a ${recibeFijo ? 'comprar el bono fijo y vender el variable' : 'comprar el bono variable y vender el fijo'}. El bono variable vale casi el nominal (se reajusta a mercado); el valor del swap depende sobre todo de si la tasa fija pactada (${fmtPct(tasaFija)}) está por encima o por debajo de las tasas actuales.`;
  if (ch.length === 1) {
    const v = ch[0], sube = valPrevio && act[v] > valPrevio[v];
    porque = {
      ceros: `Cambió la curva. El bono fijo se descuenta con todas las tasas y su valor se mueve mucho; el variable solo depende del próximo pago, porque después se reajusta. Si las tasas suben, el bono fijo vale menos: pierde quien recibe fijo y gana quien paga fijo.`,
      tasaFija: `${sube ? 'Más' : 'Menos'} tasa fija significa cupones ${sube ? 'más altos' : 'más bajos'} en el bono fijo: ${sube ? 'gana' : 'pierde'} quien la recibe.`,
      tasaVariableFijada: 'La tasa variable ya fijada solo afecta el próximo pago: después el bono variable vuelve a valer el nominal. Por eso su efecto es chico.',
      lado: 'Cambiaste de lado: el valor es exactamente el opuesto. Un swap es un juego de suma cero entre las dos partes.',
      nocional: 'El valor es proporcional al nocional.',
      m: 'Con otra frecuencia de pagos cambian el cupón por período y las fechas.',
      proximo: 'Cambió cuánto falta para el próximo pago: se mueven todas las fechas y los factores de descuento.',
      cantidad: 'Cambió la cantidad de pagos que quedan: el swap es más largo o más corto, y su sensibilidad a las tasas también.',
    }[v] || porque;
  }
  narVal.decir(`Valor para ${quien}: ${fmt(valor, 4)} millones.`, porque, valor >= 0 ? 'pos' : 'neg');
  valPrevio = act;
}
const narVal = crearNarrador($('s-narrador'), { titulo: 'Por qué vale eso', maximo: 3 });
let valPrevio = null;

// ---------- Ejemplo 4: swap de monedas ----------
function ejemploMonedas() {
  const datos = {
    principalDom: numero('m-pd'), tasaDom: numero('m-cd') / 100, rDom: numero('m-rd') / 100,
    principalExt: numero('m-pe'), tasaExt: numero('m-ce') / 100, rExt: numero('m-re') / 100,
    spot: numero('m-spot'),
  };
  const proximo = numero('m-proximo');
  const cantidad = Math.round(numero('m-cantidad'));
  if (Object.values(datos).some(Number.isNaN) || Number.isNaN(proximo) || !(cantidad >= 1 && cantidad <= 60)) return datosInvalidos();
  datos.tiempos = Swaps.fechasDePago({ proximo, cantidad, m: 1 });

  const r = Swaps.valuarSwapMonedas(datos);
  const recibeDom = elegido('m-lado') === 'recibeDom';
  const s = recibeDom ? 1 : -1;
  const valor = s * r.valorBonos;

  const tabla = tablaHTML(
    [{ titulo: 't (años)' }, { titulo: 'Flujo USD', num: true }, { titulo: 'Flujo EUR', num: true }, { titulo: 'FD USD', num: true }, { titulo: 'FD EUR', num: true }, { titulo: 'Forward USD/EUR', num: true }, { titulo: 'Valor del intercambio (USD)', num: true }],
    r.filas.map(f => {
      const v = s * f.valorForward;
      return [fmt(f.t, 2), fmt(f.flujoDom, 3), fmt(f.flujoExt, 3), fmt(f.fdDom, 4), fmt(f.fdExt, 4), fmt(f.forward, 4), { texto: fmt(v, 4), clase: claseSigno(v) }];
    })
  );

  $('m-resultado').innerHTML = `
    <div class="resultados">
      <div class="dato"><div class="dato-etiqueta">B<sub>D</sub> (bono en USD)</div><div class="dato-valor">${fmt(r.BD, 4)}</div></div>
      <div class="dato"><div class="dato-etiqueta">B<sub>F</sub> (bono en EUR)</div><div class="dato-valor">${fmt(r.BF, 4)}</div></div>
      <div class="dato"><div class="dato-etiqueta">S<sub>0</sub> × B<sub>F</sub> (en USD)</div><div class="dato-valor">${fmt(datos.spot * r.BF, 4)}</div></div>
      <div class="dato destacado"><div class="dato-etiqueta">Valor del swap (millones USD)</div><div class="dato-valor ${claseSigno(valor)}">${fmt(valor, 4)}</div></div>
    </div>
    <h3>Método 1: diferencia de bonos</h3>
    <p>${recibeDom ? '\\(V = B_D - S_0 B_F\\)' : '\\(V = S_0 B_F - B_D\\)'} \\(= ${recibeDom ? `${fmt(r.BD, 4)} - ${fmt(datos.spot, 4)} \\times ${fmt(r.BF, 4)}` : `${fmt(datos.spot, 4)} \\times ${fmt(r.BF, 4)} - ${fmt(r.BD, 4)}`} = ${fmt(valor, 4)}\\)</p>
    <h3>Método 2: cartera de forwards de moneda</h3>
    <p>Cada intercambio se valúa con el tipo de cambio forward \\(F_t = S_0 e^{(r - r_f)t}\\) y se descuenta a la tasa en dólares.</p>
    ${tabla}
    <p>Suma = <strong>${fmt(s * r.valorForwards, 4)}</strong></p>
    <div class="ok">Los dos métodos dan el mismo valor.</div>`;
  renderFormulas($('m-resultado'));

  const act = { ...datos, tiempos: datos.tiempos.join('|'), recibeDom };
  const ch = monPrevio ? Object.keys(act).filter(x => act[x] !== monPrevio[x]) : [];
  if (monPrevio && !ch.length) return;
  const quien = recibeDom ? 'quien recibe dólares y paga euros' : 'quien recibe euros y paga dólares';
  let porque = 'El swap equivale a un bono en dólares comprado y un bono en euros vendido (o al revés). El valor depende del tipo de cambio y de las tasas de mercado de cada moneda.';
  if (ch.length === 1) {
    const v = ch[0], sube = act[v] > monPrevio[v];
    porque = {
      spot: `El euro ${sube ? 'se apreció' : 'se depreció'}: la pata en euros vale ${sube ? 'más' : 'menos'} dólares. ${sube ? 'Pierde' : 'Gana'} quien paga euros.`,
      rDom: `${sube ? 'Subió' : 'Bajó'} la tasa en dólares: el bono en dólares vale ${sube ? 'menos' : 'más'}, y ${sube ? 'pierde' : 'gana'} quien lo recibe.`,
      rExt: `${sube ? 'Subió' : 'Bajó'} la tasa en euros: el bono en euros vale ${sube ? 'menos' : 'más'}, y ${sube ? 'gana' : 'pierde'} quien debe pagarlo.`,
      recibeDom: 'Cambiaste de lado: el valor es exactamente el opuesto.',
      tasaDom: 'Cambió el cupón en dólares: cambian los flujos del bono en dólares.',
      tasaExt: 'Cambió el cupón en euros: cambian los flujos del bono en euros.',
    }[v] || porque;
  }
  narMon.decir(`Valor para ${quien}: ${fmt(valor, 4)} millones de USD.`, porque + ' Con forwards se llega al mismo número: cada intercambio vale lo que valdría a plazo, descontado.', valor >= 0 ? 'pos' : 'neg');
  monPrevio = act;
}
const narMon = crearNarrador($('m-narrador'), { titulo: 'Por qué vale eso', maximo: 3 });
let monPrevio = null;

alCambiar('w-flujos', ejemploFlujos);
alCambiar('w-ventaja', ejemploVentaja);
alCambiar('w-valuacion', ejemploValuacion);
alCambiar('w-monedas', ejemploMonedas);
