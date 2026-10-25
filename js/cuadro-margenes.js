// Ejercicio para completar: cuadro de la cuenta de márgenes de un futuro.
// Lo usan la ejercitación de la Unidad I (u1-ejercitacion.html) y el simulacro (js/simulacro.js).
//
// Como el ejercicio 1 de la Guía U1 y la tabla 2.1 de Hull: con los precios de ajuste de cada
// día, el alumno completa la ganancia diaria, la ganancia acumulada, el saldo de la cuenta y el
// llamado de margen. Convenciones:
//   - Si el saldo queda por debajo del margen de mantenimiento, hay llamado de margen y hay que
//     depositar lo necesario para volver al margen INICIAL.
//   - El saldo de cada día se informa antes del depósito; el depósito se suma al día siguiente.
//   - No se retiran excedentes.
//
// Casilleros (array de respuestas): 0 = saldo inicial (día 0); para el día d (1..D), a partir de
// 1 + 4·(d − 1): ganancia diaria, ganancia acumulada, saldo de la cuenta y llamado de margen.
//
// Requiere js/comun.js (para fmt) en las páginas del libro.

const CuadroMargenes = (() => {
  const DIAS = 6;
  const ACTIVOS = [
    { contrato: 'futuros de oro', detalle: '100 onzas cada uno', tamano: 100, precio: [1700, 2400], paso: 0.1, mov: [2, 22], margen: 0.05, unidadPrecio: 'USD por onza' },
    { contrato: 'futuros de soja', detalle: '100 toneladas cada uno', tamano: 100, precio: [280, 360], paso: 0.1, mov: [0.5, 6], margen: 0.07, unidadPrecio: 'USD por tonelada' },
    { contrato: 'futuros de maíz', detalle: '100 toneladas cada uno', tamano: 100, precio: [160, 230], paso: 0.1, mov: [0.3, 4], margen: 0.07, unidadPrecio: 'USD por tonelada' },
    { contrato: 'futuros de dólar', detalle: 'USD 1.000 cada uno', tamano: 1000, precio: [950, 1250], paso: 0.5, mov: [1, 12], margen: 0.06, unidadPrecio: 'pesos por dólar' },
  ];
  const COLUMNAS = ['Ganancia diaria', 'Ganancia acumulada', 'Saldo de la cuenta', 'Llamado de margen'];
  const campos = c => 1 + 4 * c.precios.length - 4;
  const vacio = c => Array(campos(c)).fill('');
  const num = (x, d) => (typeof fmt === 'function' ? fmt(x, d) : x.toLocaleString('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d }));
  const decPrecio = c => (c.paso < 0.5 ? 2 : c.paso < 1 ? 1 : 0);
  const precioTxt = (c, p) => num(p, decPrecio(c) === 0 ? 0 : 2);
  const monto = x => num(x, Math.abs(x - Math.round(x)) < 1e-9 ? 0 : 2);

  // Acepta 12000, 12.000, −1.800, -1800, 1.800,50 y 1800,5. Vacío = NaN.
  function leerMonto(texto) {
    let t = String(texto || '').trim().replace(/[\s$]/g, '').replace(/[−–]/g, '-');
    if (!t) return NaN;
    if (/^-?\d{1,3}(\.\d{3})+(,\d*)?$/.test(t)) t = t.replace(/\./g, '').replace(',', '.');
    else if (/^-?\d{1,3}(,\d{3})+(\.\d*)?$/.test(t)) t = t.replace(/,/g, '');
    else t = t.replace(',', '.');
    return /^-?\d*\.?\d+$/.test(t) ? parseFloat(t) : NaN;
  }

  // La cuenta de márgenes día por día (la solución).
  function calcular(c) {
    const signo = c.larga ? 1 : -1;
    const porUnidad = c.tamano * c.contratos;
    const inicial = c.margenInicial * c.contratos, mantenimiento = c.margenMantenimiento * c.contratos;
    let saldoPrevio = inicial, deposito = 0, acumulada = 0;
    const dias = [];
    for (let d = 1; d < c.precios.length; d++) {
      const diaria = Math.round(signo * (c.precios[d] - c.precios[d - 1]) * porUnidad * 100) / 100;
      acumulada = Math.round((acumulada + diaria) * 100) / 100;
      const saldo = Math.round((saldoPrevio + deposito + diaria) * 100) / 100;
      const llamado = saldo < mantenimiento - 1e-9 ? Math.round((inicial - saldo) * 100) / 100 : 0;
      dias.push({ dia: d, precio: c.precios[d], diaria, acumulada, saldo, llamado });
      saldoPrevio = saldo; deposito = llamado;
    }
    return { inicial, mantenimiento, porUnidad, dias };
  }

  function generar() {
    const azar = (a, b) => a + Math.random() * (b - a);
    const elegir = arr => arr[Math.floor(Math.random() * arr.length)];
    for (let intento = 0; intento < 500; intento++) {
      const a = elegir(ACTIVOS);
      const redondear = x => Math.round(Math.round(x / a.paso) * a.paso * 100) / 100;
      const larga = Math.random() < 0.5;
      const contratos = elegir([2, 3, 4, 5]);
      const p0 = redondear(azar(a.precio[0], a.precio[1]));
      const valor = p0 * a.tamano;
      const margenInicial = Math.max(500, Math.round(valor * a.margen / 500) * 500);
      const margenMantenimiento = Math.round(margenInicial * 0.75 / 100) * 100;
      const precios = [p0];
      for (let d = 1; d <= DIAS; d++) {
        const enContra = Math.random() < 0.6;               // más días en contra de la posición
        const sube = larga ? !enContra : enContra;
        const mov = Math.max(a.paso, redondear(azar(a.mov[0], a.mov[1])));
        precios.push(redondear(precios[d - 1] + (sube ? mov : -mov)));
      }
      const c = { ...a, larga, contratos, margenInicial, margenMantenimiento, precios };
      const r = calcular(c);
      const llamados = r.dias.filter(x => x.llamado > 0).length;
      // Un buen ejercicio: uno o dos llamados, no en el primer día, y algún día con ganancia.
      if (llamados >= 1 && llamados <= 2 && r.dias[0].llamado === 0 && r.dias.some(x => x.diaria > 0)) {
        return { contrato: a.contrato, detalle: a.detalle, tamano: a.tamano, paso: a.paso, unidadPrecio: a.unidadPrecio, larga, contratos, margenInicial, margenMantenimiento, precios };
      }
    }
    return null;
  }

  // Valores correctos, en el orden de los casilleros.
  function solucion(c) {
    const r = calcular(c);
    const sol = [r.inicial];
    r.dias.forEach(d => sol.push(d.diaria, d.acumulada, d.saldo, d.llamado));
    return sol;
  }

  const esLlamado = n => n > 0 && (n - 1) % 4 === 3;

  function corregir(c, resp) {
    const sol = solucion(c);
    const marcas = sol.map((v, n) => {
      const texto = String(resp[n] || '').trim();
      const x = texto === '' && esLlamado(n) ? 0 : leerMonto(texto); // llamado vacío = no hubo llamado
      return Math.abs(x - v) <= 0.5;
    });
    const bien = marcas.filter(Boolean).length;
    return { sol, marcas, bien, total: sol.length, correcta: bien === sol.length, respondida: resp.some(x => String(x || '').trim() !== '') };
  }

  // Completa = todos los casilleros con algo, salvo los de llamado (vacío significa "sin llamado").
  const completa = (c, resp) => resp.every((x, n) => esLlamado(n) || String(x || '').trim() !== '');

  const resumen = corr => `${corr.bien} de ${corr.total} casilleros correctos.`;

  function enunciado(c) {
    const pos = c.larga ? '<b>compra</b> (posición larga)' : '<b>vende</b> (posición corta)';
    return `<p>Un inversor ${pos} ${c.contratos} ${c.contrato} (${c.detalle}) a ${precioTxt(c, c.precios[0])} ${c.unidadPrecio}. El margen inicial es de ${num(c.margenInicial, 0)} por contrato y el margen de mantenimiento, de ${num(c.margenMantenimiento, 0)} por contrato.</p>
      <p>Si el saldo queda por debajo del margen de mantenimiento, recibe un llamado de margen y deposita lo necesario para volver al margen inicial; el depósito se suma al saldo del día siguiente. No retira excedentes.</p>`;
  }

  function instrucciones(esExamen) {
    return `<p>Completá el cuadro con los precios de ajuste: las pérdidas van con signo menos y, en «Llamado de margen», escribí el depósito (o dejalo vacío si ese día no hay llamado). El saldo de cada día es antes del depósito.${esExamen ? ' Cuenta como correcta si están bien todos los casilleros.' : ''}</p>`;
  }

  // Cuadro. modo 'examen' (para completar) o 'revision' (respuesta del alumno y la correcta).
  function dibujar(c, resp, modo, correccion) {
    const celda = (n, etiqueta) => {
      if (modo === 'examen') {
        return `<td class="num"><input type="text" inputmode="decimal" autocomplete="off" data-celda="${n}" value="${String(resp[n] || '').replace(/"/g, '&quot;')}" aria-label="${etiqueta}"></td>`;
      }
      const ok = correccion.marcas[n];
      const dado = String(resp[n] || '').trim();
      const esperado = correccion.sol[n];
      return `<td class="num ${ok ? 'celda-ok' : 'celda-mal'}"><span class="dado">${dado || '—'}</span>${ok ? '' : `<span class="esperado">${esLlamado(n) && esperado === 0 ? 'sin llamado' : monto(esperado)}</span>`}</td>`;
    };
    let filas = `<tr><td>0 (${c.larga ? 'compra' : 'venta'})</td><td class="num">${precioTxt(c, c.precios[0])}</td><td class="num celda-vacia">—</td><td class="num celda-vacia">—</td>${celda(0, 'Saldo inicial de la cuenta')}<td class="num celda-vacia">—</td></tr>`;
    for (let d = 1; d < c.precios.length; d++) {
      const base = 1 + 4 * (d - 1);
      filas += `<tr><td>${d}</td><td class="num">${precioTxt(c, c.precios[d])}</td>${COLUMNAS.map((t, j) => celda(base + j, `${t}, día ${d}`)).join('')}</tr>`;
    }
    return `<div class="tabla-wrap"><table class="tabla cuadro-margenes"><thead><tr><th>Día</th><th class="num">Precio de ajuste</th>${COLUMNAS.map(t => `<th class="num">${t}</th>`).join('')}</tr></thead><tbody>${filas}</tbody></table></div>`;
  }

  function explicacion(c) {
    const r = calcular(c);
    const llamados = r.dias.filter(d => d.llamado > 0);
    const signoTxt = c.larga ? 'Como la posición es larga, una suba del precio es ganancia y una baja, pérdida.' : 'Como la posición es corta, una baja del precio es ganancia y una suba, pérdida.';
    return `<p>Margen inicial: ${c.contratos} × ${num(c.margenInicial, 0)} = <b>${num(r.inicial, 0)}</b> (saldo del día 0). Margen de mantenimiento: ${c.contratos} × ${num(c.margenMantenimiento, 0)} = <b>${num(r.mantenimiento, 0)}</b>.</p>
      <p>Cada unidad que se mueve el precio cambia la cuenta en ${num(c.tamano, 0)} × ${c.contratos} = ${num(r.porUnidad, 0)}. ${signoTxt} La ganancia acumulada es la suma de las diarias.</p>
      ${llamados.map(d => `<p>Día ${d.dia}: el saldo queda en ${monto(d.saldo)}, debajo de ${num(r.mantenimiento, 0)}. Llamado de margen: ${num(r.inicial, 0)} − ${monto(d.saldo)} = <b>${monto(d.llamado)}</b>, que se suma al saldo del día ${d.dia + 1}.</p>`).join('')}
      <p>Saldo final: ${monto(r.dias[r.dias.length - 1].saldo)}${r.dias[r.dias.length - 1].llamado ? ' (antes del último depósito)' : ''}. Control: saldo final = margen inicial + depósitos + ganancia acumulada = ${num(r.inicial, 0)} + ${monto(llamados.filter(d => d.dia < r.dias.length).reduce((s, d) => s + d.llamado, 0))} + (${monto(r.dias[r.dias.length - 1].acumulada)}).</p>`;
  }

  function respuestaModelo(c) {
    return solucion(c).map((v, n) => (esLlamado(n) && v === 0 ? '' : monto(v).replace('-', '−')));
  }

  // Ejercicio autónomo dentro de una página: <div class="ej-cuadro-margenes"></div>.
  function montar(contenedor) {
    let c = generar(), resp = vacio(c), corregido = null, esSolucion = false;
    const pintar = () => {
      const botones = corregido
        ? `<button type="button" class="btn" data-accion="editar">Corregir mis respuestas</button>
           <button type="button" class="btn" data-accion="solucion">Ver la solución</button>
           <button type="button" class="btn-primario" data-accion="otro">Otro ejercicio</button>`
        : `<button type="button" class="btn-primario" data-accion="verificar">Verificar</button>
           <button type="button" class="btn" data-accion="solucion">Ver la solución</button>
           <button type="button" class="btn" data-accion="otro">Otro ejercicio</button>`;
      const resultado = corregido && esSolucion
        ? `<p style="font-weight:600">Esta es la solución. Tocá "Otro ejercicio" para practicar con datos nuevos.</p>
          <details class="desplegable" open><summary>Resolución paso a paso</summary>${explicacion(c)}</details>`
        : corregido
        ? `<p class="${corregido.correcta ? 'pos' : 'neg'}" style="font-weight:600">${corregido.correcta ? '¡Correcto! Todo el cuadro está bien.' : `${resumen(corregido)} En rojo, lo que está mal, con el valor correcto debajo.`}</p>
          <details class="desplegable"${corregido.correcta ? '' : ' open'}><summary>Resolución paso a paso</summary>${explicacion(c)}</details>`
        : '';
      contenedor.innerHTML = enunciado(c) + instrucciones(false) +
        dibujar(c, resp, corregido ? 'revision' : 'examen', corregido) +
        `<div class="botones" style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0">${botones}</div>${resultado}`;
    };
    contenedor.addEventListener('input', ev => {
      const campo = ev.target.closest('input[data-celda]');
      if (campo) resp[Number(campo.dataset.celda)] = campo.value;
    });
    contenedor.addEventListener('keydown', ev => {
      const campo = ev.target.closest('input[data-celda]');
      if (!campo || ev.key !== 'Enter') return;
      ev.preventDefault();
      const sig = contenedor.querySelector(`input[data-celda="${Number(campo.dataset.celda) + 1}"]`);
      if (sig) sig.focus();
    });
    contenedor.addEventListener('click', ev => {
      const b = ev.target.closest('[data-accion]');
      if (!b) return;
      const accion = b.dataset.accion;
      esSolucion = accion === 'solucion';
      if (accion === 'verificar') corregido = corregir(c, resp);
      else if (accion === 'editar') { corregido = null; if (resp.join('|') === respuestaModelo(c).join('|')) resp = vacio(c); }
      else if (accion === 'solucion') { resp = respuestaModelo(c); corregido = corregir(c, resp); }
      else if (accion === 'otro') { c = generar(); resp = vacio(c); corregido = null; }
      pintar();
    });
    pintar();
  }

  return { campos, vacio, generar, solucion, calcular, corregir, completa, resumen, enunciado, instrucciones, dibujar, explicacion, respuestaModelo, montar, leerMonto };
})();

document.querySelectorAll('.ej-cuadro-margenes').forEach(el => CuadroMargenes.montar(el));
