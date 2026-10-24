// Formulario: glosario y buscador.

const GLOSARIO = [
  ['Activo subyacente', 'El activo cuyo precio determina el valor del derivado: una acción, un índice, una moneda, una tasa, un commodity o un futuro.', 'u1'],
  ['Forward', 'Contrato privado (OTC) para comprar o vender un activo en una fecha futura a un precio pactado hoy. Se liquida al vencimiento y tiene riesgo de contraparte.', 'u1'],
  ['Futuro', 'Contrato estandarizado que se negocia en un mercado organizado. Se ajusta todos los días (márgenes) y la cámara compensadora es la contraparte de todos.', 'u1'],
  ['Margen inicial / de mantenimiento', 'Depósito que se exige al abrir una posición en futuros / saldo mínimo de la cuenta. Si el saldo cae por debajo del de mantenimiento, hay que reponer hasta el inicial (llamado de margen).', 'u1'],
  ['Cámara compensadora', 'Entidad que se interpone entre comprador y vendedor de cada futuro, garantiza el cumplimiento y administra los márgenes.', 'u1'],
  ['Interés abierto', 'Cantidad de contratos de futuros vigentes (posiciones largas, que son iguales a las cortas).', 'u1'],
  ['Cobertura corta / larga', 'Venta de futuros para protegerse de una baja del precio de algo que se tiene o se va a vender / compra de futuros para protegerse de una suba de algo que se va a comprar.', 'u2'],
  ['Base', 'Diferencia entre el precio contado y el del futuro, S − F. El riesgo de base es la incertidumbre sobre su valor al cerrar la cobertura.', 'u2'],
  ['Contango / backwardation', 'Mercado en el que los futuros cotizan por encima del contado (o los más largos por encima de los cortos) / por debajo.', 'u2'],
  ['Ratio de cobertura de mínima varianza', 'h* = ρ σS/σF: la proporción de la exposición que conviene cubrir con futuros para minimizar la varianza del resultado.', 'u2'],
  ['Tailing the hedge', 'Ajuste de la cantidad de contratos usando valores (y no cantidades) para tener en cuenta el ajuste diario de los futuros.', 'u2'],
  ['Beta', 'Sensibilidad del rendimiento de una cartera al rendimiento del mercado. Determina cuántos futuros sobre índice hacen falta para cubrirla.', 'u2'],
  ['Composición continua', 'Forma de capitalizar en la que los intereses se reinvierten en forma continua: un capital crece a A·e^(rT). Es la convención de la materia.', 'u3'],
  ['Tasa cero (spot)', 'Tasa de una inversión que paga todo junto al final, sin flujos intermedios.', 'u3'],
  ['Tasa forward', 'Tasa implícita en la curva actual para un período futuro.', 'u3'],
  ['Bootstrap', 'Método para obtener la curva de tasas cero a partir de precios de bonos, de los plazos más cortos a los más largos.', 'u3'],
  ['FRA', 'Forward rate agreement: contrato que fija hoy la tasa de un préstamo futuro sobre un nocional. Se liquida la diferencia entre la tasa pactada y la de mercado.', 'u3'],
  ['Duración', 'Promedio ponderado de los plazos de los flujos de un bono. Mide la sensibilidad del precio a cambios en el rendimiento.', 'u3'],
  ['Costo de mantenimiento (cost of carry)', 'Lo que cuesta tener el activo hasta el vencimiento: interés más costos de almacenamiento menos ingresos que genera.', 'u3'],
  ['Convenience yield', 'Beneficio implícito de tener físicamente un commodity (por ejemplo, para no frenar la producción). Explica que el futuro cotice por debajo del costo de mantenimiento.', 'u3'],
  ['Swap', 'Acuerdo para intercambiar flujos de fondos en fechas futuras según una fórmula pactada.', 'u4'],
  ['Swap de tasa (plain vanilla)', 'Una parte paga tasa fija y la otra tasa variable sobre un mismo nocional, que no se intercambia.', 'u4'],
  ['Swap de monedas', 'Intercambio de capital e intereses en una moneda por capital e intereses en otra. Los capitales sí se intercambian, al principio y al final.', 'u4'],
  ['Tasa swap', 'Tasa fija que hace que un swap valga cero al inicio. Es el par yield de la curva.', 'u4'],
  ['Ventaja comparativa', 'Argumento según el cual dos empresas ganan con un swap si cada una se endeuda en el mercado donde tiene ventaja relativa.', 'u4'],
  ['SOFR / LIBOR', 'Tasas variables de referencia. La LIBOR en dólares dejó de publicarse en 2023 y fue reemplazada por tasas como la SOFR.', 'u4'],
  ['Call / put', 'Opción de compra / de venta: el derecho, no la obligación, de comprar / vender el subyacente a un precio fijado (strike).', 'u5'],
  ['Strike (precio de ejercicio)', 'Precio al que se puede comprar (call) o vender (put) el subyacente al ejercer la opción.', 'u5'],
  ['Prima', 'Precio de la opción: lo que paga el comprador y cobra el lanzador.', 'u5'],
  ['Opción europea / americana', 'La europea solo se puede ejercer al vencimiento; la americana, en cualquier momento hasta el vencimiento.', 'u5'],
  ['Lanzador', 'Quien vende (emite) una opción: cobra la prima y queda obligado si el comprador ejerce.', 'u5'],
  ['ITM / ATM / OTM', 'Dentro, en o fuera del dinero: si ejercer hoy daría un pago positivo, si el subyacente está en el strike, o si ejercer no daría nada.', 'u5'],
  ['Valor intrínseco / valor tiempo', 'Lo que se cobraría ejerciendo hoy / la diferencia entre la prima y el valor intrínseco.', 'u5'],
  ['Paridad put-call', 'Relación de no arbitraje entre call y put europeos con el mismo strike y vencimiento: c + Ke^(−rT) = p + S₀.', 'u5'],
  ['Arbitraje', 'Estrategia que genera una ganancia sin riesgo y sin inversión neta. Los precios de equilibrio no admiten arbitraje.', 'u5'],
  ['Portafolio replicante', 'Cartera de Δ acciones y B en caución que paga lo mismo que una opción en todos los escenarios. Su costo es el precio de la opción.', 'u6'],
  ['Valuación neutral al riesgo', 'Método que valúa un derivado como su pago esperado, con probabilidades bajo las cuales todos los activos rinden r, descontado a r.', 'u6'],
  ['Precio de Arrow-Debreu', 'Lo que vale hoy un título que paga $1 solo en un estado (nodo) futuro. Con ellos se valúa cualquier pago.', 'u6'],
  ['Movimiento browniano geométrico', 'Modelo del precio de una acción en el que el rendimiento en cada instante es normal: dS = μS dt + σS dz. Implica que S_T es lognormal.', 'u6'],
  ['Volatilidad histórica / implícita', 'Desvío de los rendimientos pasados, anualizado / volatilidad que, puesta en Black-Scholes, reproduce el precio de mercado.', 'u6'],
  ['Delta', 'Cambio en el valor de la opción por cada $1 de cambio en el subyacente. Es la cantidad de acciones por opción de una cobertura delta.', 'u6'],
  ['Gamma', 'Cambio del delta por cada $1 de cambio en el subyacente. Mide cuán seguido hay que rebalancear la cobertura.', 'u6'],
  ['Theta', 'Cambio en el valor de la opción por el paso del tiempo, con todo lo demás igual. Suele ser negativa para el comprador.', 'u6'],
  ['Vega', 'Cambio en el valor de la opción ante un cambio en la volatilidad.', 'u6'],
  ['Cobertura delta', 'Mantener una posición en el subyacente que compense el delta de las opciones, rebalanceando a medida que cambia.', 'u6'],
  ['Rendimiento por dividendos (q)', 'Dividendos anuales expresados como tasa continua sobre el precio del activo. Con él se valúan opciones sobre índices.', 'u7'],
  ['Garman-Kohlhagen', 'Fórmula para opciones sobre monedas: Black-Scholes con q igual a la tasa de interés extranjera.', 'u7'],
  ['Modelo de Black', 'Fórmula para opciones sobre futuros: Black-Scholes con S₀ = F₀ y q = r.', 'u7'],
  ['Seguro de cartera', 'Compra de puts sobre un índice para garantizar que una cartera no valga menos que un piso.', 'u7'],
  ['Range forward', 'Combinación de un put comprado y un call vendido de igual prima: cobertura cambiaria de costo cero dentro de una banda.', 'u7'],
  ['Spread', 'Estrategia con dos o más opciones del mismo tipo (todos calls o todos puts).', 'u8'],
  ['Combinación', 'Estrategia con calls y puts sobre el mismo subyacente, como el straddle o el strangle.', 'u8'],
  ['Net debit / net credit', 'Una estrategia es de débito si al armarla se paga (se compra más de lo que se vende) y de crédito si se cobra.', 'u8'],
];

(function () {
  const dl = $('lista-glosario');
  const romano = { u1: 'I', u2: 'II', u3: 'III', u4: 'IV', u5: 'V', u6: 'VI', u7: 'VII', u8: 'VIII' };
  dl.innerHTML = GLOSARIO.slice().sort((a, b) => a[0].localeCompare(b[0], 'es'))
    .map(([t, d, u]) => `<div class="ficha termino"><dt>${t}</dt><dd>${d} <a class="chip" href="${u}-teoria.html">U ${romano[u]}</a></dd></div>`).join('');

  const normalizar = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const fichas = [...document.querySelectorAll('.contenido .ficha')];
  fichas.forEach(f => { f._texto = normalizar(f.textContent); });
  const titulos = [...document.querySelectorAll('.contenido h2')];
  $('f-buscar').addEventListener('input', e => {
    const q = normalizar(e.target.value.trim());
    let visibles = 0;
    fichas.forEach(f => { const ok = !q || f._texto.includes(q); f.classList.toggle('oculto', !ok); if (ok) visibles++; });
    // Oculta los títulos y enlaces de las unidades sin resultados
    titulos.forEach(h => {
      const bloque = [];
      for (let el = h.nextElementSibling; el && el.tagName !== 'H2'; el = el.nextElementSibling) bloque.push(el);
      const hay = bloque.some(el => (el.classList.contains('ficha') && !el.classList.contains('oculto')) || el.querySelector?.('.ficha:not(.oculto)'));
      const mostrar = !q || hay;
      h.classList.toggle('oculto', !mostrar);
      bloque.forEach(el => { if (!el.classList.contains('ficha') && !el.querySelector?.('.ficha')) el.classList.toggle('oculto', !mostrar); });
    });
    $('f-vacio').classList.toggle('oculto', visibles > 0);
  });
})();
