// Ejercicio para completar: diagrama de un swap con intermediario (ventaja comparativa).
// Lo usan el simulacro (js/simulacro.js) y la teoría de la Unidad IV (u4-teoria.html).
//
// Como el ejercicio 1 de la Guía U4: a dos empresas les ofrecen una tasa fija y una variable;
// una necesita endeudarse a tasa variable y la otra a tasa fija. Cada una toma el préstamo en
// el mercado donde tiene ventaja comparativa y un banco arma dos swaps (las patas variables son
// SOFR, sin spread). El banco se queda con un margen y el resto de la ganancia se reparte en
// partes iguales. El alumno elige el sentido de las flechas y completa las tasas del diagrama
// y el costo neto de cada empresa. "X" es la empresa que quiere tasa variable; "Y", la otra.
//
// Requiere js/calculos.js (Swaps.ventajaComparativa) y js/comun.js (aNumero).
//
// Casilleros (el array de respuestas tiene 12 posiciones):
//   0 a 5: tasas (ver NOMBRES_CAMPOS).
//   6 y 7: sentido de la pata fija y de la pata SOFR entre A y el banco; 8 y 9: lo mismo entre
//   el banco y B; 10 y 11: préstamo de A y de B. Sentidos: 'der', 'izq', 'abajo', 'arriba'.

const DiagramaSwap = (() => {
  const CAMPOS = 12;
  const NOMBRES_CAMPOS = [
    'Tasa fija que X paga a sus prestamistas',
    'Spread sobre SOFR que Y paga a sus prestamistas',
    'Tasa fija que el banco le paga a X',
    'Tasa fija que Y le paga al banco',
    'Spread del costo neto de X (SOFR + …)',
    'Costo neto de Y (tasa fija)',
  ];
  const CICLO_SENTIDOS = { h: ['', 'der', 'izq'], v: ['', 'abajo', 'arriba'] };
  const SIMBOLO_SENTIDO = { der: '→', izq: '←', abajo: '↓', arriba: '↑', '': 'sin elegir' };
  const esVertical = n => n >= 10;
  const tasaTxt = x => `${Number(x.toFixed(3)).toLocaleString('es-AR', { maximumFractionDigits: 3 })} %`;
  const spreadTxt = s => (Math.abs(s) < 1e-9 ? 'SOFR' : s > 0 ? `SOFR + ${tasaTxt(s)}` : `SOFR − ${tasaTxt(-s)}`);
  const vacio = () => Array(CAMPOS).fill('');

  // Datos al azar.
  function generar() {
    const elegir = arr => arr[Math.floor(Math.random() * arr.length)];
    const pasos = (desde, hasta, paso) => Array.from({ length: Math.round((hasta - desde) / paso) + 1 }, (_, i) => Math.round((desde + i * paso) * 100) / 100);
    let d, r;
    do {
      const fijoX = elegir(pasos(3, 6.5, 0.1));
      const spreadX = elegir(pasos(0, 0.6, 0.05));
      d = {
        fijoX, spreadX,
        fijoY: Math.round((fijoX + elegir(pasos(0.8, 2, 0.1))) * 100) / 100,
        spreadY: Math.round((spreadX + elegir(pasos(0.1, 1, 0.05))) * 100) / 100,
        margen: elegir([0.04, 0.06, 0.1, 0.2]),
      };
      r = Swaps.ventajaComparativa(d);
    } while (!r.conviene || r.ganancia < 0.05);
    return { ...d, xEsA: Math.random() < 0.5, nocional: elegir([10, 20, 50, 100]), plazo: elegir([3, 5, 7, 10]) };
  }

  const nombres = c => ({ X: c.xEsA ? 'Empresa A' : 'Empresa B', Y: c.xEsA ? 'Empresa B' : 'Empresa A' });

  // Valores correctos: las 6 tasas (en el orden de NOMBRES_CAMPOS) y los 6 sentidos.
  function solucion(c) {
    const r = Swaps.ventajaComparativa(c);
    // Si A es la que quiere variable (X), el banco le paga la fija a A (←) y A le paga SOFR (→);
    // B (Y) le paga la fija al banco (←) y recibe SOFR (→). Si A es Y, todo al revés.
    const fija = c.xEsA ? 'izq' : 'der', sofr = c.xEsA ? 'der' : 'izq';
    return [c.fijoX, c.spreadY, r.tasaRecibeX, r.tasaPagaY, r.spreadFinalX, r.fijoFinalY,
      fija, sofr, fija, sofr, 'abajo', 'abajo']; // los dos préstamos se pagan: flechas hacia abajo
  }

  // La solución escrita como si la hubiera completado el alumno (para "Ver la solución").
  function respuestaModelo(c) {
    return solucion(c).map((v, n) => (n < 6 ? String(Number(v.toFixed(3))).replace('.', ',').replace('-', '−') : v));
  }

  function corregir(c, resp) {
    const sol = solucion(c);
    const marcas = sol.map((v, n) => (n < 6 ? Math.abs(aNumero(resp[n] || '') - v) <= 0.0005 : (resp[n] || '') === v));
    const bien = marcas.filter(Boolean).length;
    return {
      sol, marcas, bien, total: CAMPOS, correcta: bien === CAMPOS,
      tasasBien: marcas.slice(0, 6).filter(Boolean).length, sentidosBien: marcas.slice(6).filter(Boolean).length,
      respondida: resp.some(x => String(x || '').trim() !== ''),
    };
  }

  // Cada toque cambia el sentido de la flecha n: sin elegir → un sentido → el otro.
  function alternarSentido(resp, n) {
    const ciclo = CICLO_SENTIDOS[esVertical(n) ? 'v' : 'h'];
    resp[n] = ciclo[(ciclo.indexOf(resp[n] || '') + 1) % ciclo.length];
  }

  function enunciado(c) {
    const { X, Y } = nombres(c);
    const fila = nombre => (nombre === X ? [c.fijoX, c.spreadX] : [c.fijoY, c.spreadY]);
    const filas = ['Empresa A', 'Empresa B'].map(e => `<tr><td>${e}</td><td class="num">${tasaTxt(fila(e)[0])}</td><td class="num">${spreadTxt(fila(e)[1])}</td></tr>`).join('');
    return `<p>A las empresas A y B les ofrecen estas tasas anuales para un préstamo a ${c.plazo} años de $ ${c.nocional} millones:</p>
      <div class="tabla-wrap"><table class="tabla tasas-swap"><thead><tr><th></th><th class="num">Tasa fija</th><th class="num">Tasa variable</th></tr></thead><tbody>${filas}</tbody></table></div>
      <p><b>${X}</b> necesita un préstamo a tasa variable y <b>${Y}</b>, a tasa fija. Un banco arma un swap con cada una (las patas variables son SOFR, sin spread), gana <b>${tasaTxt(c.margen)}</b> anual y el resto de la ganancia se reparte en partes iguales entre las dos empresas.</p>`;
  }

  function instrucciones(esExamen) {
    return `<p>Completá el diagrama: tocá cada flecha para elegir su sentido (quién le paga a quién) y escribí las tasas en porcentaje (por ejemplo 5,3 o −0,25). Las flechas verticales son los préstamos o inversiones con terceros: hacia abajo si la empresa paga, hacia arriba si cobra.${esExamen ? ' Cuenta como correcta si están bien las 6 tasas y los 6 sentidos.' : ''}</p>`;
  }

  // Diagrama. modo 'examen' (para completar) o 'revision' (respuesta del alumno y la correcta).
  function dibujar(c, resp, modo, correccion) {
    const { X, Y } = nombres(c);
    const campo = (n, prefijo = '') => {
      if (modo === 'examen') {
        return `<span class="d-campo">${prefijo}<input type="text" inputmode="decimal" autocomplete="off" data-celda="${n}" value="${String(resp[n] || '').replace(/"/g, '&quot;')}" aria-label="${NOMBRES_CAMPOS[n].replace(/X/, X).replace(/Y/, Y)}"> %</span>`;
      }
      const ok = correccion.marcas[n];
      const dado = String(resp[n] || '').trim();
      return `<span class="d-campo ${ok ? 'celda-ok' : 'celda-mal'}">${prefijo}<b>${dado || '—'}</b> %${ok ? '' : `<span class="esperado">${tasaTxt(correccion.sol[n])}</span>`}</span>`;
    };
    // Trazo de una flecha: en modo examen es un botón que cambia el sentido; en la revisión se
    // dibuja el sentido elegido en verde o rojo, con el correcto al lado si está mal.
    const trazo = (n, descripcion) => {
      const dir = resp[n] || '';
      const clase = esVertical(n) ? 'd-vertical' : 'd-linea';
      if (modo === 'examen') {
        return `<button type="button" class="${clase} s-${dir || 'sin'}" data-sentido="${n}" aria-label="Sentido de la flecha ${descripcion}: ${SIMBOLO_SENTIDO[dir]}. Tocá para cambiarlo."></button>`;
      }
      const ok = correccion.marcas[n];
      return `<div class="${clase} s-${dir || 'sin'} ${ok ? 'dir-ok' : 'dir-mal'}" aria-label="${descripcion}: ${SIMBOLO_SENTIDO[dir]}${ok ? '' : `; correcto ${SIMBOLO_SENTIDO[correccion.sol[n]]}`}"></div>${ok ? '' : `<span class="d-correccion">debía ir ${SIMBOLO_SENTIDO[correccion.sol[n]]}</span>`}`;
    };
    // Patas del swap entre una empresa y el banco: arriba la fija, abajo la SOFR.
    const patas = (empresa, nFija, nSofr) => {
      const etiquetaFija = empresa === X ? campo(2) : campo(3);
      return `<div class="d-flecha"><div class="d-etq">${etiquetaFija}</div>${trazo(nFija, `de la pata fija entre ${empresa} y el banco`)}</div>
        <div class="d-flecha"><div class="d-etq">SOFR</div>${trazo(nSofr, `de la pata SOFR entre ${empresa} y el banco`)}</div>`;
    };
    const externo = (empresa, n) => `<div class="d-externo">${trazo(n, `del préstamo de ${empresa}`)}<div class="d-etq">${empresa === X ? campo(0) : campo(1, 'SOFR + ')}</div></div>`;
    return `<div class="diagrama-ej"><div class="d-grilla">
        <div class="d-caja">Empresa A</div><div class="d-flechas">${patas('Empresa A', 6, 7)}</div>
        <div class="d-caja">Banco</div><div class="d-flechas">${patas('Empresa B', 8, 9)}</div>
        <div class="d-caja">Empresa B</div>
        ${externo('Empresa A', 10)}<div></div><div></div><div></div>${externo('Empresa B', 11)}
      </div>
      <div class="d-netos">
        <div>Costo neto de ${X}: ${campo(4, 'SOFR + ')}</div>
        <div>Costo neto de ${Y}: ${campo(5)}</div>
        <div>Ganancia del banco: <b>${tasaTxt(c.margen)}</b></div>
      </div></div>`;
  }

  function explicacion(c) {
    const { X, Y } = nombres(c);
    const r = Swaps.ventajaComparativa(c);
    return `<p>Diferencia en tasa fija: ${tasaTxt(r.a)}; en tasa variable: ${tasaTxt(r.b)}. Ganancia total del swap: ${tasaTxt(r.a)} − ${tasaTxt(r.b)} = ${tasaTxt(r.total)}. Al banco van ${tasaTxt(c.margen)} y a cada empresa ${tasaTxt(r.ganancia)}.</p>
      <p>${X} tiene ventaja comparativa en tasa fija: se endeuda a ${tasaTxt(c.fijoX)}, recibe ${tasaTxt(r.tasaRecibeX)} del banco y le paga SOFR. Costo neto: ${tasaTxt(c.fijoX)} − ${tasaTxt(r.tasaRecibeX)} + SOFR = ${spreadTxt(r.spreadFinalX)}, que es ${tasaTxt(r.ganancia)} menos que el ${spreadTxt(c.spreadX)} que le ofrecían.</p>
      <p>${Y} se endeuda a ${spreadTxt(c.spreadY)}, recibe SOFR y le paga ${tasaTxt(r.tasaPagaY)} al banco. Costo neto: ${tasaTxt(r.fijoFinalY)}, ${tasaTxt(r.ganancia)} menos que el ${tasaTxt(c.fijoY)} que le ofrecían. El banco cobra ${tasaTxt(r.tasaPagaY)} y paga ${tasaTxt(r.tasaRecibeX)}: gana ${tasaTxt(c.margen)}.</p>`;
  }

  // Ejercicio autónomo dentro de una página (por ejemplo, la teoría):
  // <div class="ej-diagrama-swap"></div> → caja con verificar, ver la solución y otro ejercicio.
  function montar(contenedor) {
    let c = generar(), resp = vacio(), corregido = null, esSolucion = false;
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
        ? `<p class="${corregido.correcta ? 'pos' : 'neg'}" style="font-weight:600">${corregido.correcta
          ? '¡Correcto! Todas las tasas y todos los sentidos están bien.'
          : `${corregido.tasasBien} de 6 tasas y ${corregido.sentidosBien} de 6 sentidos correctos. En rojo, lo que está mal, con la respuesta correcta al lado.`}</p>
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
      esSolucion = false;
      corregido = corregir(c, resp);
      pintar();
    });
    contenedor.addEventListener('click', ev => {
      const flecha = ev.target.closest('[data-sentido]');
      if (flecha && !corregido) {
        const n = Number(flecha.dataset.sentido);
        alternarSentido(resp, n);
        pintar();
        const igual = contenedor.querySelector(`[data-sentido="${n}"]`);
        if (igual) igual.focus();
        return;
      }
      const b = ev.target.closest('[data-accion]');
      if (!b) return;
      const accion = b.dataset.accion;
      esSolucion = accion === 'solucion';
      if (accion === 'verificar') corregido = corregir(c, resp);
      else if (accion === 'editar') { corregido = null; if (resp.join('') === respuestaModelo(c).join('')) resp = vacio(); }
      else if (accion === 'solucion') { resp = respuestaModelo(c); corregido = corregir(c, resp); }
      else if (accion === 'otro') { c = generar(); resp = vacio(); corregido = null; }
      pintar();
    });
    pintar();
  }

  // Interfaz común con CuadroMargenes (la usa el simulacro).
  const completa = (c, resp) => resp.every(x => String(x || '').trim() !== '');
  const resumen = corr => `${corr.tasasBien} de 6 tasas y ${corr.sentidosBien} de 6 sentidos correctos.`;

  return { CAMPOS, campos: () => CAMPOS, generar, solucion, respuestaModelo, corregir, completa, resumen, alternarSentido, enunciado, instrucciones, dibujar, explicacion, montar, vacio };
})();

// Monta los ejercicios que haya en la página.
document.querySelectorAll('.ej-diagrama-swap').forEach(el => DiagramaSwap.montar(el));
