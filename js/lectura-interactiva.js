// Lectura interactiva de la teoría: recuadros de "punto clave" y mini simulaciones
// que acompañan el texto. Se cargan en las páginas uN-teoria.html (después de comun.js y calculos.js).
//
// ---------------------------------------------------------------------------
// Punto clave (HTML que se escribe en la teoría):
//
//   <aside class="punto-clave" data-id="u1-margenes">
//     <ul><li>Idea 1.</li><li>Idea 2.</li></ul>
//   </aside>
//
// data-id tiene que ser único: con él se recuerda si el alumno marcó "Lo tengo claro".
//
// Mini simulación (HTML que se escribe en la teoría):
//
//   <div class="mini-sim" data-sim="margenes"></div>
//
// data-sim es el nombre de una de las simulaciones registradas abajo (MINI_SIMS).
// ---------------------------------------------------------------------------

(function () {
  // ======================================================================
  // Puntos clave
  // ======================================================================
  // También la usa el Modo Profesor (js/profesor/contenido.js) al volver a dibujar un punto clave editado.
  function decorarPuntoClave(caja) {
    if (caja.querySelector(':scope > .pc-titulo')) return;
    const id = caja.dataset.id;
    const titulo = document.createElement('p');
    titulo.className = 'pc-titulo';
    titulo.innerHTML = '<span class="pc-icono" aria-hidden="true">★</span> Punto clave';
    caja.prepend(titulo);
    if (!id) return;
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'pc-entendido';
    const pintar = () => {
      const ok = Guardado.leer('pc:' + id, false);
      caja.classList.toggle('entendido', ok);
      boton.textContent = ok ? '✓ Lo tengo claro' : 'Marcar como claro';
      boton.setAttribute('aria-pressed', String(ok));
    };
    boton.addEventListener('click', () => { Guardado.escribir('pc:' + id, !Guardado.leer('pc:' + id, false)); pintar(); });
    caja.appendChild(boton);
    pintar();
  }
  document.querySelectorAll('aside.punto-clave').forEach(decorarPuntoClave);
  window.LecturaInteractiva = { decorarPuntoClave };

  // ======================================================================
  // Mini simulaciones: utilidades comunes
  // ======================================================================
  let contador = 0;
  const pct = (x, d = 2) => `${fmt(x * 100, d)} %`;
  const rango = (id, etiqueta, min, max, paso, valor, formato = v => fmt(v, 2)) => controlRango({ id, etiqueta, min, max, paso, valor, formato });
  const radios = (nombre, opciones, elegida) => `<div class="opciones-radio">${opciones.map(([v, t]) => `<label><input type="radio" name="${nombre}" value="${v}" ${v === elegida ? 'checked' : ''}> ${t}</label>`).join('')}</div>`;
  const datos = items => items.map(([etq, val, clase = '', nota = '', destacado = false]) =>
    `<div class="dato ${destacado ? 'destacado' : ''}"><div class="dato-etiqueta">${etq}</div><div class="dato-valor ${clase}">${val}</div>${nota ? `<div class="dato-nota">${nota}</div>` : ''}</div>`).join('');

  function marco({ titulo, enlace, controles, conGrafico = true }) {
    return `<div class="ms-cabecera"><span class="ms-etiqueta">Probalo acá</span><b>${titulo}</b></div>
      <div class="ms-cuerpo">
        <div class="ms-controles entradas">${controles}</div>
        <div class="ms-salida">
          <div class="resultados ms-datos"></div>
          ${conGrafico ? '<div class="ms-grafico"><canvas></canvas></div>' : ''}
          <p class="ms-texto"></p>
        </div>
      </div>
      ${enlace ? `<a class="ms-enlace" href="${enlace}">Abrir la simulación completa →</a>` : ''}`;
  }

  // Gráfico de líneas. series: [{ label, data: [{x, y}], color?, dash?, ancho? }]; marcas: puntos destacados.
  function grafico(canvas, series, { tituloX = '', tituloY = '', xMin, xMax, decX = 0, decY = 0, marcas = [], leyenda = true }) {
    const c = coloresGrafico();
    const colores = [c.acento, c.series[0], c.series[1], c.series[2], c.series[3]];
    const sets = series.map((s, i) => ({
      label: s.label, data: s.data, borderColor: s.color || colores[i], backgroundColor: s.color || colores[i],
      borderWidth: s.ancho || 2, borderDash: s.dash || [], pointRadius: 0, tension: 0, stepped: s.escalonado || false,
    }));
    marcas.forEach(m => sets.push({ label: '·' + (m.label || ''), data: [{ x: m.x, y: m.y }], pointRadius: 6, pointHoverRadius: 7, pointBackgroundColor: m.color || c.acento, pointBorderColor: c.superficie, pointBorderWidth: 2, showLine: false }));
    const o = opcionesEjes({ tituloX, tituloY, xMin, xMax, decX, decY, leyenda });
    o.plugins.legend.labels.filter = item => !String(item.text).startsWith('·');
    o.plugins.legend.labels.boxWidth = 12;
    dibujarGrafico(canvas, { type: 'line', data: { datasets: sets }, options: o });
  }

  const rangoX = (desde, hasta, n = 80) => Array.from({ length: n + 1 }, (_, i) => desde + ((hasta - desde) * i) / n);

  // ======================================================================
  // Catálogo de mini simulaciones. Cada una: { titulo, enlace, montar(caja, p, $$) }.
  // p = prefijo único para los id; $$(id) = elemento con ese id dentro de la caja.
  // montar devuelve la función que recalcula (se vuelve a llamar si cambia el tema).
  // ======================================================================
  const MINI_SIMS = {

    // ---------------- Unidad I ----------------
    'forward-payoff': {
      titulo: 'Payoff de un forward al vencimiento',
      enlace: 'u1-simulacion.html#payoffs',
      montar(caja, p, $$) {
        caja.innerHTML = marco({ titulo: this.titulo, enlace: this.enlace, controles:
          rango(p + 'k', 'Precio pactado K', 80, 120, 1, 100, v => fmt(v, 0)) +
          rango(p + 'st', 'Precio al vencimiento S<sub>T</sub>', 50, 150, 1, 115, v => fmt(v, 0)) });
        vincularRango(p + 'k', v => fmt(v, 0)); vincularRango(p + 'st', v => fmt(v, 0));
        return () => {
          const K = +$$(p + 'k').value, ST = +$$(p + 'st').value, largo = ST - K;
          caja.querySelector('.ms-datos').innerHTML = datos([
            ['Largo (se compromete a comprar a K)', fmtSigno(largo, 0), claseSigno(largo), '', true],
            ['Corto (se compromete a vender a K)', fmtSigno(-largo, 0), claseSigno(-largo)],
          ]);
          const xs = rangoX(50, 150, 4);
          grafico(caja.querySelector('canvas'), [
            { label: 'Largo', data: xs.map(x => ({ x, y: x - K })) },
            { label: 'Corto', data: xs.map(x => ({ x, y: K - x })), dash: [6, 4] },
          ], { tituloX: 'Precio al vencimiento', tituloY: 'Payoff', xMin: 50, xMax: 150, marcas: [{ x: ST, y: largo }, { x: ST, y: -largo, color: coloresGrafico().series[0] }] });
          caja.querySelector('.ms-texto').innerHTML = largo === 0
            ? `Con S<sub>T</sub> = K nadie gana: el activo vale exactamente lo pactado.`
            : `El activo vale ${fmt(ST, 0)} y se intercambia a ${fmt(K, 0)}: el largo ${largo > 0 ? 'gana' : 'pierde'} ${fmt(Math.abs(largo), 0)} y el corto, lo contrario. Es un juego de suma cero y no hay prima: los dos payoffs son rectas.`;
        };
      },
    },

    margenes: {
      titulo: 'Cuenta de márgenes, día por día',
      enlace: 'u1-simulacion.html#cuenta-de-margenes',
      montar(caja, p, $$) {
        // El ejemplo del texto: 2 futuros de oro de 100 onzas a 1.250; margen inicial 6.000 y de mantenimiento 4.500 por contrato.
        const P0 = 1250, N = 2, TAM = 100, MI = 6000, MM = 4500;
        let precios = [];
        caja.innerHTML = marco({ titulo: this.titulo, enlace: this.enlace, controles:
          `<div><label>Posición</label>${radios(p + 'lado', [['larga', 'Larga (compré)'], ['corta', 'Corta (vendí)']], 'larga')}</div>
           <p class="ayuda" style="margin:0">2 futuros de oro de 100 onzas a ${fmt(P0, 0)}. Margen inicial: 6.000 por contrato; de mantenimiento: 4.500.</p>
           <div class="botones" style="margin:0">
             <button class="btn" type="button" data-mov="-10">Baja (−10)</button>
             <button class="btn" type="button" data-mov="-3">Baja (−3)</button>
             <button class="btn" type="button" data-mov="3">Sube (+3)</button>
             <button class="btn" type="button" data-mov="10">Sube (+10)</button>
             <button class="btn" type="button" data-reiniciar>Reiniciar</button>
           </div>` });
        const lado = () => caja.querySelector(`input[name="${p}lado"]:checked`).value;
        caja.addEventListener('click', ev => {
          const b = ev.target.closest('[data-mov], [data-reiniciar]');
          if (!b) return;
          if (b.dataset.reiniciar !== undefined) precios = [];
          else { const u = precios.length ? precios[precios.length - 1] : P0; precios.push(Math.round((u + parseFloat(b.dataset.mov)) * 100) / 100); }
          act();
        });
        const act = () => {
          const r = Futuros.cuentaMargen({ precios: [P0, ...precios], contratos: N, tamano: TAM, margenInicial: MI, margenMantenimiento: MM, larga: lado() === 'larga' });
          const f = r.filas[r.filas.length - 1];
          caja.querySelector('.ms-datos').innerHTML = datos([
            ['Día', String(f ? f.dia : 0)],
            ['Precio de ajuste', fmt(f ? f.precio : P0)],
            ['Saldo de la cuenta', fmt(f ? f.saldo : r.mi, 0), '', '', true],
            ['Depositado por llamados', fmt(r.totalLlamados, 0)],
          ]);
          const dias = [0, ...r.filas.map(x => x.dia)];
          const xMax = Math.max(5, dias.length - 1);
          grafico(caja.querySelector('canvas'), [
            { label: 'Saldo', data: dias.map((x, i) => ({ x, y: i ? r.filas[i - 1].saldoAntes : r.mi })) },
            { label: 'Margen inicial', data: [{ x: 0, y: r.mi }, { x: xMax, y: r.mi }], color: coloresGrafico().ganancia, ancho: 1.2 },
            { label: 'Mantenimiento', data: [{ x: 0, y: r.mm }, { x: xMax, y: r.mm }], color: coloresGrafico().perdida, ancho: 1.2, dash: [6, 4] },
          ], { tituloX: 'Día', tituloY: 'Saldo (antes del depósito)', xMin: 0, xMax });
          caja.querySelector('.ms-texto').innerHTML = !f
            ? 'Tocá los botones para mover el precio del futuro un día por vez.'
            : `Día ${f.dia}: el futuro ${f.diaria >= 0 === (lado() === 'larga') ? 'subió' : 'bajó'} a ${fmt(f.precio)} y la cuenta ${f.diaria >= 0 ? 'recibe' : 'paga'} ${fmt(Math.abs(f.diaria), 0)} (${fmt(Math.abs(f.precio - (r.filas.length > 1 ? r.filas[r.filas.length - 2].precio : P0)))} × 100 onzas × 2 contratos).` +
              (f.llamado > 0 ? ` <b>Llamado de margen:</b> el saldo quedó en ${fmt(f.saldoAntes, 0)}, debajo de ${fmt(r.mm, 0)}; hay que depositar ${fmt(f.llamado, 0)} para volver a ${fmt(r.mi, 0)}.` : ` El saldo sigue por encima del mantenimiento (${fmt(r.mm, 0)}): no hay llamado.`);
        };
        return act;
      },
    },

    // ---------------- Unidad II ----------------
    base: {
      titulo: 'Precio efectivo y riesgo de base',
      enlace: 'u2-simulacion.html#cobertura-y-riesgo-de-base',
      montar(caja, p, $$) {
        const S1 = 48, F1 = 50;
        caja.innerHTML = marco({ titulo: this.titulo, enlace: this.enlace, conGrafico: false, controles:
          `<div><label>Cobertura</label>${radios(p + 'lado', [['corta', 'Corta (voy a vender)'], ['larga', 'Larga (voy a comprar)']], 'corta')}</div>
           <p class="ayuda" style="margin:0">Se abre en t₁ con S₁ = ${fmt(S1)} y F₁ = ${fmt(F1)}; el futuro vence después de t₂.</p>` +
          rango(p + 's2', 'Contado al cerrar, S₂', 35, 65, 0.5, 44) + rango(p + 'f2', 'Futuro al cerrar, F₂', 35, 65, 0.5, 43) +
          `<div class="botones" style="margin:0"><button class="btn" type="button" data-venc>Cerrar al vencimiento (F₂ = S₂)</button></div>` });
        vincularRango(p + 's2'); vincularRango(p + 'f2');
        caja.querySelector('[data-venc]').addEventListener('click', () => { $$(p + 'f2').value = $$(p + 's2').value; $$(p + 'f2').dispatchEvent(new Event('input', { bubbles: true })); });
        return () => {
          const corta = caja.querySelector(`input[name="${p}lado"]:checked`).value === 'corta';
          const S2 = +$$(p + 's2').value, F2 = +$$(p + 'f2').value, b2 = S2 - F2;
          const resFut = corta ? F1 - F2 : F2 - F1, efectivo = corta ? S2 + resFut : S2 - resFut;
          caja.querySelector('.ms-datos').innerHTML = datos([
            ['Base al cerrar, b₂ = S₂ − F₂', fmtSigno(b2)],
            ['Resultado de los futuros', fmtSigno(resFut), claseSigno(resFut)],
            [corta ? 'Precio efectivo de venta' : 'Costo efectivo de compra', fmt(efectivo), '', 'F₁ + b₂', true],
            ['Sin cobertura', fmt(S2)],
          ]);
          caja.querySelector('.ms-texto').innerHTML = b2 === 0
            ? `Base cero: obtenés exactamente F₁ = ${fmt(F1)}. Es lo que pasa al cerrar justo al vencimiento, porque el futuro converge al contado.`
            : `La cobertura fija F₁ = ${fmt(F1)}; lo único que queda librado al azar es la base al cerrar (${fmtSigno(b2)}), que ${(b2 > 0) === corta ? 'te favorece' : 'te perjudica'}. Sin cobertura, el resultado dependería por completo de S₂.`;
        };
      },
    },

    hstar: {
      titulo: 'Ratio de cobertura de mínima varianza',
      enlace: 'u2-simulacion.html#estimar-h-con-datos',
      montar(caja, p, $$) {
        caja.innerHTML = marco({ titulo: this.titulo, enlace: this.enlace, controles:
          rango(p + 'rho', 'Correlación ρ entre ΔS y ΔF', 0, 1, 0.01, 0.8) +
          rango(p + 'ss', 'Desvío de ΔS, σ<sub>S</sub>', 0.05, 0.6, 0.01, 0.25) +
          rango(p + 'sf', 'Desvío de ΔF, σ<sub>F</sub>', 0.05, 0.6, 0.01, 0.3) +
          '<p class="ayuda" style="margin:0">Exposición: 1.000.000 de unidades; cada futuro cubre 10.000.</p>' });
        ['rho', 'ss', 'sf'].forEach(k => vincularRango(p + k));
        return () => {
          const rho = +$$(p + 'rho').value, sS = +$$(p + 'ss').value, sF = +$$(p + 'sf').value;
          const h = Cobertura.ratioMinimaVarianza({ rho, sigmaS: sS, sigmaF: sF });
          const desvio = x => Math.sqrt(Math.max(0, sS * sS + x * x * sF * sF - 2 * x * rho * sS * sF));
          caja.querySelector('.ms-datos').innerHTML = datos([
            ['h* = ρ·σ<sub>S</sub>/σ<sub>F</sub>', fmt(h, 4), '', '', true],
            ['Contratos N* = h*·Q<sub>A</sub>/Q<sub>F</sub>', fmt(h * 100, 1)],
            ['Efectividad ρ²', pct(rho * rho, 1), '', 'varianza que se elimina'],
          ]);
          const xs = rangoX(0, 2, 60);
          grafico(caja.querySelector('canvas'), [{ label: 'Desvío de la posición cubierta', data: xs.map(x => ({ x, y: desvio(x) })) }],
            { tituloX: 'Ratio de cobertura h', tituloY: 'Desvío', xMin: 0, xMax: 2, decX: 1, decY: 2, marcas: [{ x: h, y: desvio(h) }, { x: 1, y: desvio(1), color: coloresGrafico().series[1] }] });
          caja.querySelector('.ms-texto').innerHTML = `El riesgo de la posición cubierta es mínimo en h* = ${fmt(h, 2)} (punto destacado), no necesariamente en h = 1 (punto gris).` +
            (rho < 0.999 ? ` Aun en el óptimo queda riesgo porque ρ < 1: se elimina solo el ${fmt(rho * rho * 100, 0)} % de la varianza.` : ' Con ρ = 1 la cobertura es perfecta.');
        };
      },
    },

    beta: {
      titulo: 'Cambiar la beta de una cartera',
      enlace: 'u2-simulacion.html#cubrir-o-cambiar-la-beta-de-una-cartera',
      montar(caja, p, $$) {
        const P = 10e6, F = 5000, M = 250;
        caja.innerHTML = marco({ titulo: this.titulo, enlace: this.enlace, conGrafico: false, controles:
          rango(p + 'b', 'Beta actual β', 0.3, 2, 0.05, 1.2) + rango(p + 'bo', 'Beta objetivo β*', 0, 2, 0.05, 0.6) +
          `<p class="ayuda" style="margin:0">Cartera de ${fmt(P, 0)}; futuro sobre el índice a ${fmt(F, 0)} × ${M} = ${fmt(F * M, 0)} por contrato.</p>` });
        vincularRango(p + 'b'); vincularRango(p + 'bo');
        return () => {
          const b = +$$(p + 'b').value, bo = +$$(p + 'bo').value;
          const N = Cobertura.cambiarBeta({ beta: b, betaObjetivo: bo, VA: P, VF: F * M });
          caja.querySelector('.ms-datos').innerHTML = datos([
            ['N = (β − β*)·P / (F·m)', fmt(Math.abs(N), 2), '', '', true],
            ['Operación', Math.abs(N) < 1e-9 ? 'Nada' : N > 0 ? 'Vender futuros' : 'Comprar futuros', N > 0 ? 'neg' : N < 0 ? 'pos' : ''],
          ]);
          caja.querySelector('.ms-texto').innerHTML = Math.abs(N) < 1e-9 ? 'La beta ya es la deseada: no hace falta operar.'
            : `Para ${bo < b ? 'bajar' : 'subir'} la beta de ${fmt(b)} a ${fmt(bo)} hay que ${N > 0 ? 'vender' : 'comprar'} unos ${fmt(Math.round(Math.abs(N)), 0)} contratos.` +
              (bo === 0 ? ' Con β* = 0 la cartera queda cubierta por completo y rinde, en teoría, la tasa libre de riesgo.' : '');
        };
      },
    },

    // ---------------- Unidad III ----------------
    composicion: {
      titulo: 'Frecuencia de composición',
      enlace: '',
      montar(caja, p, $$) {
        const FREC = [[1, 'Anual'], [2, 'Semestral'], [4, 'Trimestral'], [12, 'Mensual'], [365, 'Diaria'], [0, 'Continua']];
        caja.innerHTML = marco({ titulo: this.titulo, enlace: this.enlace, controles:
          rango(p + 'r', 'Tasa nominal anual R', 0.01, 0.4, 0.005, 0.1, v => pct(v, 1)) +
          `<div><label>Composición m</label>${radios(p + 'm', FREC.map(([m, t]) => [String(m), t]), '12')}</div>` });
        vincularRango(p + 'r', v => pct(v, 1));
        return () => {
          const R = +$$(p + 'r').value, m = +caja.querySelector(`input[name="${p}m"]:checked`).value;
          const efectiva = mm => (mm === 0 ? Math.exp(R) - 1 : Math.pow(1 + R / mm, mm) - 1);
          const rc = Tasas.aContinua(R, m);
          caja.querySelector('.ms-datos').innerHTML = datos([
            ['100 después de un año', fmt(100 * (1 + efectiva(m))), '', '', true],
            ['Tasa efectiva anual', pct(efectiva(m), 3)],
            ['Equivalente continua R<sub>c</sub>', pct(rc, 3), '', m === 0 ? 'ya es continua' : 'm·ln(1 + R/m)'],
          ]);
          const c = coloresGrafico();
          dibujarGrafico(caja.querySelector('canvas'), {
            type: 'bar',
            data: { labels: FREC.map(f => f[1]), datasets: [{ label: 'Tasa efectiva anual', data: FREC.map(f => efectiva(f[0]) * 100), backgroundColor: FREC.map(f => (f[0] === m ? c.acento : c.series[0])) }] },
            options: { animation: false, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: R * 100 * 0.98, ticks: { callback: v => fmt(v, 2) + ' %', color: c.suave }, grid: { color: c.grilla } }, x: { ticks: { color: c.suave }, grid: { display: false } } } },
          });
          caja.querySelector('.ms-texto').innerHTML = `La misma tasa nominal de ${pct(R, 1)} rinde más cuanto más seguido se capitaliza, pero la diferencia se achica: de mensual a continua casi no cambia. Las tasas de la materia, salvo aviso, son continuas.`;
        };
      },
    },

    'forward-precio': {
      titulo: 'Precio forward y arbitraje',
      enlace: '',
      montar(caja, p, $$) {
        caja.innerHTML = marco({ titulo: this.titulo, enlace: this.enlace, conGrafico: false, controles:
          rango(p + 's', 'Contado S₀', 50, 150, 1, 100, v => fmt(v, 0)) + rango(p + 'r', 'Tasa libre de riesgo r', 0, 0.15, 0.0025, 0.05, v => pct(v, 2)) +
          rango(p + 't', 'Plazo T (años)', 0.25, 2, 0.25, 1) + rango(p + 'q', 'Rendimiento q (dividendos)', 0, 0.08, 0.0025, 0, v => pct(v, 2)) +
          rango(p + 'fm', 'Forward de mercado', 80, 140, 0.25, 108) });
        vincularRango(p + 's', v => fmt(v, 0)); vincularRango(p + 'r', v => pct(v, 2)); vincularRango(p + 't'); vincularRango(p + 'q', v => pct(v, 2)); vincularRango(p + 'fm');
        return () => {
          const S = +$$(p + 's').value, r = +$$(p + 'r').value, T = +$$(p + 't').value, q = +$$(p + 'q').value, Fm = +$$(p + 'fm').value;
          const a = Futuros.arbitraje({ S, r, T, Fmercado: Fm, q });
          caja.querySelector('.ms-datos').innerHTML = datos([
            ['F₀ = S₀·e^((r − q)T)', fmt(a.teorico), '', '', true],
            ['Mercado − teórico', fmtSigno(a.dif), claseSigno(a.dif)],
            ['Estrategia', a.estrategia === 'ninguna' ? 'Ninguna' : a.estrategia === 'cash-and-carry' ? 'Cash-and-carry' : 'Reverse cash-and-carry'],
            ['Ganancia por unidad, en T', fmt(a.gananciaEnT)],
          ]);
          caja.querySelector('.ms-texto').innerHTML = a.estrategia === 'ninguna' ? 'El forward está en su valor teórico: no hay arbitraje.'
            : a.estrategia === 'cash-and-carry'
              ? `El forward está caro: pedís ${fmt(S, 0)} prestados, comprás el activo y lo vendés a plazo a ${fmt(Fm)}. Al vencimiento entregás el activo, cobrás ${fmt(Fm)} y devolvés ${fmt(a.teorico)}${q > 0 ? ' (descontando lo que rinde el activo)' : ''}: te quedan ${fmt(a.gananciaEnT)}.`
              : `El forward está barato: vendés el activo en corto, colocás los ${fmt(S, 0)} a la tasa r y lo comprás a plazo a ${fmt(Fm)}. Al vencimiento tenés ${fmt(a.teorico)}, recomprás a ${fmt(Fm)} y devolvés el activo: te quedan ${fmt(a.gananciaEnT)}.`;
        };
      },
    },

    // ---------------- Unidad IV ----------------
    'swap-valor': {
      titulo: 'Valor de un swap cuando se mueven las tasas',
      enlace: 'u4-ejemplos.html',
      montar(caja, p, $$) {
        caja.innerHTML = marco({ titulo: this.titulo, enlace: this.enlace, controles:
          rango(p + 'k', 'Tasa fija pactada (semestral)', 0.02, 0.08, 0.0025, 0.05, v => pct(v, 2)) +
          rango(p + 'r', 'Tasa de mercado (continua, curva plana)', 0.01, 0.1, 0.0025, 0.04, v => pct(v, 2)) +
          rango(p + 't', 'Años que le quedan al swap', 0.5, 5, 0.5, 3) +
          '<p class="ayuda" style="margin:0">Nocional: 100 millones; pagos semestrales; el swap está justo después de un pago.</p>' });
        vincularRango(p + 'k', v => pct(v, 2)); vincularRango(p + 'r', v => pct(v, 2)); vincularRango(p + 't');
        const valor = (k, r, T) => {
          const tiempos = Swaps.fechasDePago({ proximo: 0.5, cantidad: Math.round(T * 2), m: 2 });
          return Swaps.valuarPorBonos({ nocional: 100, tasaFija: k, m: 2, tiempos, tasasCero: tiempos.map(() => r), tasaVariableFijada: Swaps.continuaACompuesta(r, 2) });
        };
        return () => {
          const k = +$$(p + 'k').value, r = +$$(p + 'r').value, T = +$$(p + 't').value;
          const v = valor(k, r, T);
          caja.querySelector('.ms-datos').innerHTML = datos([
            ['Bono fijo B<sub>fix</sub>', fmt(v.Bfix)], ['Bono variable B<sub>fl</sub>', fmt(v.Bfl)],
            ['Valor para quien recibe fija', fmtSigno(v.valorRecibeFijo), claseSigno(v.valorRecibeFijo), 'millones', true],
            ['Valor para quien paga fija', fmtSigno(-v.valorRecibeFijo), claseSigno(-v.valorRecibeFijo), 'millones'],
          ]);
          const xs = rangoX(0.01, 0.1, 36);
          grafico(caja.querySelector('canvas'), [{ label: 'Valor para quien recibe fija', data: xs.map(x => ({ x: x * 100, y: valor(k, x, T).valorRecibeFijo })) }],
            { tituloX: 'Tasa de mercado (%)', tituloY: 'Valor (millones)', xMin: 1, xMax: 10, decX: 0, decY: 1, leyenda: false, marcas: [{ x: r * 100, y: v.valorRecibeFijo }] });
          const rs = Swaps.continuaACompuesta(r, 2);
          caja.querySelector('.ms-texto').innerHTML = `La tasa de mercado equivale a ${pct(rs, 2)} semestral, ${rs < k ? 'por debajo' : rs > k ? 'por encima' : 'igual'} de la fija pactada (${pct(k, 2)}). ` +
            (Math.abs(v.valorRecibeFijo) < 0.005 ? 'Por eso el swap vale cero: la fija pactada es la tasa swap.' : `Por eso recibir fija ${v.valorRecibeFijo > 0 ? 'vale' : 'cuesta'} ${fmt(Math.abs(v.valorRecibeFijo))} millones. Recibir fija se comporta como un bono: gana cuando las tasas bajan, y más cuanto más plazo queda.`);
        };
      },
    },

    // ---------------- Unidad V ----------------
    'payoff-opcion': {
      titulo: 'Payoff y beneficio de una opción',
      enlace: 'u5-simulacion.html',
      montar(caja, p, $$) {
        caja.innerHTML = marco({ titulo: this.titulo, enlace: this.enlace, controles:
          `<div><label>Opción</label>${radios(p + 'tipo', [['call', 'Call'], ['put', 'Put']], 'call')}</div>
           <div><label>Posición</label>${radios(p + 'lado', [['compra', 'Compra'], ['venta', 'Venta (lanzador)']], 'compra')}</div>` +
          rango(p + 'k', 'Strike K', 80, 120, 1, 100, v => fmt(v, 0)) + rango(p + 'c', 'Prima', 0, 20, 0.5, 5) + rango(p + 'st', 'Precio al vencimiento S<sub>T</sub>', 50, 150, 1, 115, v => fmt(v, 0)) });
        vincularRango(p + 'k', v => fmt(v, 0)); vincularRango(p + 'c'); vincularRango(p + 'st', v => fmt(v, 0));
        return () => {
          const tipo = caja.querySelector(`input[name="${p}tipo"]:checked`).value, lado = caja.querySelector(`input[name="${p}lado"]:checked`).value;
          const K = +$$(p + 'k').value, prima = +$$(p + 'c').value, ST = +$$(p + 'st').value;
          const pata = { type: tipo, side: lado, strike: K, premium: prima, qty: 1 };
          const payoff = x => Payoff.legPnL({ ...pata, premium: 0 }, x), benef = x => Payoff.legPnL(pata, x);
          const equilibrio = tipo === 'call' ? K + prima : K - prima;
          caja.querySelector('.ms-datos').innerHTML = datos([
            ['Payoff', fmtSigno(payoff(ST)), claseSigno(payoff(ST))],
            ['Beneficio (con la prima)', fmtSigno(benef(ST)), claseSigno(benef(ST)), '', true],
            ['Punto de equilibrio', fmt(equilibrio)],
          ]);
          const xs = [...rangoX(50, 150, 50), K].sort((a, b) => a - b);
          grafico(caja.querySelector('canvas'), [
            { label: 'Beneficio', data: xs.map(x => ({ x, y: benef(x) })) },
            { label: 'Payoff', data: xs.map(x => ({ x, y: payoff(x) })), dash: [6, 4] },
          ], { tituloX: 'Precio al vencimiento', tituloY: 'Resultado', xMin: 50, xMax: 150, marcas: [{ x: ST, y: benef(ST) }] });
          const ejerce = tipo === 'call' ? ST > K : ST < K;
          caja.querySelector('.ms-texto').innerHTML = `${ejerce ? `La opción se ejerce: ${tipo === 'call' ? `comprar a ${fmt(K, 0)} algo que vale ${fmt(ST, 0)}` : `vender a ${fmt(K, 0)} algo que vale ${fmt(ST, 0)}`}.` : 'La opción vence sin valor: no conviene ejercerla.'} ` +
            (lado === 'compra' ? `Quien compra arriesga como máximo la prima (${fmt(prima)}).` : `Quien vende cobra la prima (${fmt(prima)}) y asume la pérdida si se ejerce${tipo === 'call' ? ', que puede no tener límite' : ''}.`);
        };
      },
    },

    paridad: {
      titulo: 'Paridad put-call',
      enlace: 'herramientas.html#paridad-put-call-despejar-la-incognita',
      montar(caja, p, $$) {
        caja.innerHTML = marco({ titulo: this.titulo, enlace: this.enlace, conGrafico: false, controles:
          rango(p + 's', 'Acción S₀', 80, 120, 1, 100, v => fmt(v, 0)) + rango(p + 'k', 'Strike K', 80, 120, 1, 100, v => fmt(v, 0)) +
          rango(p + 'r', 'Tasa r', 0, 0.1, 0.0025, 0.05, v => pct(v, 2)) + rango(p + 't', 'Plazo T (años)', 0.25, 2, 0.25, 1) +
          rango(p + 'c', 'Call de mercado c', 1, 20, 0.05, 10.45) + rango(p + 'p', 'Put de mercado p', 0.5, 20, 0.05, 5.57) });
        vincularRango(p + 's', v => fmt(v, 0)); vincularRango(p + 'k', v => fmt(v, 0)); vincularRango(p + 'r', v => pct(v, 2)); vincularRango(p + 't'); vincularRango(p + 'c'); vincularRango(p + 'p');
        return () => {
          const S = +$$(p + 's').value, K = +$$(p + 'k').value, r = +$$(p + 'r').value, T = +$$(p + 't').value, c = +$$(p + 'c').value, pm = +$$(p + 'p').value;
          const Kr = K * Math.exp(-r * T), pt = c + Kr - S, dif = pm - pt;
          caja.querySelector('.ms-datos').innerHTML = datos([
            ['c + K·e^(−rT)', fmt(c + Kr)], ['p + S₀', fmt(pm + S)],
            ['Put por paridad', fmt(pt), '', 'c + K·e^(−rT) − S₀', true], ['Diferencia (mercado − paridad)', fmtSigno(dif), claseSigno(dif)],
          ]);
          caja.querySelector('.ms-texto').innerHTML = Math.abs(dif) < 0.005 ? 'Se cumple la paridad: no hay arbitraje.'
            : dif > 0 ? `El put está caro: vendés el put y la acción en corto, comprás el call y colocás K·e^(−rT) = ${fmt(Kr)}. Hoy te quedan ${fmt(dif)} y al vencimiento las posiciones se cancelan.`
              : `El put está barato: comprás el put y la acción, vendés el call y pedís prestado K·e^(−rT) = ${fmt(Kr)}. Hoy te quedan ${fmt(-dif)} y al vencimiento las posiciones se cancelan.`;
        };
      },
    },

    // ---------------- Unidad VI ----------------
    binomial: {
      titulo: 'Árbol binomial de un período',
      enlace: 'u6-simulacion.html',
      montar(caja, p, $$) {
        caja.innerHTML = marco({ titulo: this.titulo, enlace: this.enlace, conGrafico: false, controles:
          rango(p + 's', 'Acción S₀', 50, 150, 1, 100, v => fmt(v, 0)) + rango(p + 'k', 'Strike K (call)', 50, 150, 1, 100, v => fmt(v, 0)) +
          rango(p + 'u', 'Factor de suba u', 1.02, 1.5, 0.01, 1.2) + rango(p + 'd', 'Factor de baja d', 0.6, 0.98, 0.01, 0.85) +
          rango(p + 'r', 'Tasa r', 0, 0.1, 0.0025, 0.05, v => pct(v, 2)) + rango(p + 't', 'Plazo T (años)', 0.25, 1, 0.25, 0.5) });
        vincularRango(p + 's', v => fmt(v, 0)); vincularRango(p + 'k', v => fmt(v, 0)); vincularRango(p + 'u'); vincularRango(p + 'd'); vincularRango(p + 'r', v => pct(v, 2)); vincularRango(p + 't');
        return () => {
          const S = +$$(p + 's').value, K = +$$(p + 'k').value, u = +$$(p + 'u').value, d = +$$(p + 'd').value, r = +$$(p + 'r').value, T = +$$(p + 't').value;
          const er = Math.exp(r * T), pr = (er - d) / (u - d);
          const cu = Math.max(S * u - K, 0), cd = Math.max(S * d - K, 0);
          const delta = (cu - cd) / (S * (u - d)), c = (pr * cu + (1 - pr) * cd) / er, B = c - delta * S;
          const ok = d < er && er < u;
          caja.querySelector('.ms-datos').innerHTML = datos([
            ['p* = (e^(rT) − d)/(u − d)', ok ? fmt(pr, 4) : '—'], ['Delta Δ (acciones)', fmt(delta, 4)],
            ['Bonos B', fmtSigno(B), '', B < 0 ? 'se pide prestado' : 'se presta'], ['Call c', ok ? fmt(c, 4) : '—', '', '', true],
          ]) + `<div class="ms-arbol" aria-label="Árbol de un período">
              <div class="nodo"><b>${fmt(S, 0)}</b><span>c = ${ok ? fmt(c, 2) : '—'}</span></div>
              <div class="ramas"><div class="nodo"><b>${fmt(S * u, 2)}</b><span>c<sub>u</sub> = ${fmt(cu, 2)}</span></div><div class="nodo"><b>${fmt(S * d, 2)}</b><span>c<sub>d</sub> = ${fmt(cd, 2)}</span></div></div>
            </div>`;
          caja.querySelector('.ms-texto').innerHTML = ok
            ? `La cartera de ${fmt(delta, 4)} acciones y ${fmtSigno(B)} en bonos paga lo mismo que el call en los dos estados, así que vale lo mismo: ${fmt(c, 4)}. Con p* se llega al mismo precio descontando el pago esperado.`
            : `<b>Hay arbitraje:</b> tiene que cumplirse d < e^(rT) = ${fmt(er, 4)} < u. Si no, la acción le gana siempre al bono (o al revés) y p* queda fuera de 0 y 1.`;
        };
      },
    },

    bs: {
      titulo: 'Black-Scholes-Merton',
      enlace: 'herramientas.html#black-scholes-paso-a-paso',
      montar(caja, p, $$) {
        caja.innerHTML = marco({ titulo: this.titulo, enlace: this.enlace, controles:
          rango(p + 's', 'Acción S₀', 50, 150, 1, 100, v => fmt(v, 0)) + rango(p + 'k', 'Strike K', 50, 150, 1, 100, v => fmt(v, 0)) +
          rango(p + 'v', 'Volatilidad σ', 0.05, 0.8, 0.01, 0.25, v => pct(v, 0)) + rango(p + 't', 'Plazo T (años)', 0.05, 2, 0.05, 0.5) +
          rango(p + 'r', 'Tasa r', 0, 0.15, 0.0025, 0.05, v => pct(v, 2)) });
        vincularRango(p + 's', v => fmt(v, 0)); vincularRango(p + 'k', v => fmt(v, 0)); vincularRango(p + 'v', v => pct(v, 0)); vincularRango(p + 't'); vincularRango(p + 'r', v => pct(v, 2));
        return () => {
          const S = +$$(p + 's').value, K = +$$(p + 'k').value, sigma = +$$(p + 'v').value, T = +$$(p + 't').value, r = +$$(p + 'r').value;
          const b = Opciones.blackScholes({ S, K, r, sigma, T });
          caja.querySelector('.ms-datos').innerHTML = datos([
            ['d₁', fmt(b.d1, 4)], ['d₂', fmt(b.d2, 4)], ['N(d₁) = delta del call', fmt(b.Nd1, 4)],
            ['Call c', fmt(b.call, 4), '', '', true], ['Put p', fmt(b.put, 4)],
          ]);
          const xs = rangoX(50, 150, 60);
          grafico(caja.querySelector('canvas'), [
            { label: 'Call hoy (BSM)', data: xs.map(x => ({ x, y: Opciones.blackScholes({ S: x, K, r, sigma, T }).call })) },
            { label: 'Valor intrínseco', data: xs.map(x => ({ x, y: Math.max(x - K, 0) })), dash: [6, 4] },
          ], { tituloX: 'Precio de la acción', tituloY: 'Valor del call', xMin: 50, xMax: 150, decY: 0, marcas: [{ x: S, y: b.call }] });
          caja.querySelector('.ms-texto').innerHTML = `La distancia entre la curva y el valor intrínseco es el valor tiempo: crece con σ y con T. N(d₂) = ${fmt(b.Nd2, 4)} es la probabilidad neutral al riesgo de que el call termine dentro del dinero.`;
        };
      },
    },

    // ---------------- Unidad VII ----------------
    'bs-q': {
      titulo: 'Opción con rendimiento q: índice, moneda o futuro',
      enlace: 'u7-simulacion.html',
      montar(caja, p, $$) {
        caja.innerHTML = marco({ titulo: this.titulo, enlace: this.enlace, conGrafico: false, controles:
          `<div><label>Subyacente</label>${radios(p + 'sub', [['indice', 'Índice (q = dividendos)'], ['moneda', 'Moneda (q = tasa extranjera)'], ['futuro', 'Futuro (q = r)']], 'indice')}</div>` +
          rango(p + 's', 'Precio del subyacente', 50, 150, 1, 100, v => fmt(v, 0)) + rango(p + 'k', 'Strike K', 50, 150, 1, 100, v => fmt(v, 0)) +
          rango(p + 'v', 'Volatilidad σ', 0.05, 0.6, 0.01, 0.2, v => pct(v, 0)) + rango(p + 't', 'Plazo T (años)', 0.1, 2, 0.05, 0.5) +
          rango(p + 'r', 'Tasa doméstica r', 0, 0.15, 0.0025, 0.06, v => pct(v, 2)) + rango(p + 'q', 'Rendimiento q', 0, 0.12, 0.0025, 0.03, v => pct(v, 2)) });
        ['s', 'k', 't'].forEach(k => vincularRango(p + k, k === 't' ? undefined : v => fmt(v, 0)));
        vincularRango(p + 'v', v => pct(v, 0)); vincularRango(p + 'r', v => pct(v, 2)); vincularRango(p + 'q', v => pct(v, 2));
        return () => {
          const sub = caja.querySelector(`input[name="${p}sub"]:checked`).value;
          const S = +$$(p + 's').value, K = +$$(p + 'k').value, sigma = +$$(p + 'v').value, T = +$$(p + 't').value, r = +$$(p + 'r').value;
          const qCampo = $$(p + 'q');
          qCampo.disabled = sub === 'futuro';
          const q = sub === 'futuro' ? r : +qCampo.value;
          const b = Opciones.blackScholes({ S, K, r, sigma, T, q }), b0 = Opciones.blackScholes({ S, K, r, sigma, T });
          caja.querySelector('.ms-datos').innerHTML = datos([
            ['q usado', pct(q, 2), '', sub === 'futuro' ? 'modelo de Black: q = r' : ''],
            ['Call', fmt(b.call, 4), '', `sin q: ${fmt(b0.call, 4)}`, true], ['Put', fmt(b.put, 4), '', `sin q: ${fmt(b0.put, 4)}`],
            ['Forward implícito S·e^((r − q)T)', fmt(S * Math.exp((r - q) * T))],
          ]);
          const que = { indice: 'el índice paga dividendos a una tasa q', moneda: 'tener la moneda extranjera rinde su tasa de interés r<sub>f</sub> = q', futuro: 'el futuro no cuesta nada hoy y no rinde: en el mundo neutral al riesgo crece a r − q = 0' }[sub];
          caja.querySelector('.ms-texto').innerHTML = `Regla de Merton: como ${que}, se reemplaza S₀ por S₀·e^(−qT). Eso baja el precio esperado del subyacente: el call vale menos y el put más que sin rendimiento.`;
        };
      },
    },

    // ---------------- Unidad VIII ----------------
    estrategias: {
      titulo: 'Payoff de una estrategia',
      enlace: 'u8-simulacion.html',
      montar(caja, p, $$) {
        const S0 = 100, r = 0.05, sigma = 0.25, T = 0.25; // las mismas primas que la teoría y el simulador de la U VIII
        const prima = (tipo, K) => Opciones.blackScholes({ S: S0, K, r, sigma, T })[tipo];
        const pata = (side, type, K) => ({ side, type, strike: K, premium: prima(type, K), qty: 1 });
        const ESTR = {
          'bull-call': { nombre: 'Bull spread con calls', patas: (a, b) => [pata('compra', 'call', a), pata('venta', 'call', b)], idea: 'apuesta a una suba moderada con costo y ganancia limitados' },
          'bear-put': { nombre: 'Bear spread con puts', patas: (a, b) => [pata('compra', 'put', b), pata('venta', 'put', a)], idea: 'apuesta a una baja moderada con costo y ganancia limitados' },
          straddle: { nombre: 'Straddle (cono)', patas: (a, b) => [pata('compra', 'call', b), pata('compra', 'put', b)], idea: 'gana si el precio se mueve mucho, para cualquier lado' },
          strangle: { nombre: 'Strangle (cuna)', patas: (a, b) => [pata('compra', 'put', a), pata('compra', 'call', b)], idea: 'como el straddle, más barato, pero necesita un movimiento mayor' },
          butterfly: { nombre: 'Butterfly con calls', patas: (a, b) => [pata('compra', 'call', a), { ...pata('venta', 'call', (a + b) / 2), qty: 2 }, pata('compra', 'call', b)], idea: 'gana si el precio queda cerca del strike del medio (apuesta a poca volatilidad)' },
          collar: { nombre: 'Collar (acción + put − call)', patas: (a, b) => [{ side: 'compra', type: 'stock', strike: 0, premium: S0, qty: 1 }, pata('compra', 'put', a), pata('venta', 'call', b)], idea: 'protege la acción con un put y lo financia vendiendo un call' },
        };
        caja.innerHTML = marco({ titulo: this.titulo, enlace: this.enlace, controles:
          `<div><label for="${p}e">Estrategia</label><select id="${p}e">${Object.entries(ESTR).map(([k, e]) => `<option value="${k}">${e.nombre}</option>`).join('')}</select></div>` +
          rango(p + 'k1', 'Strike bajo K₁', 70, 100, 1, 90, v => fmt(v, 0)) + rango(p + 'k2', 'Strike alto K₂', 100, 130, 1, 110, v => fmt(v, 0)) +
          `<p class="ayuda" style="margin:0">Acción a ${S0}; primas de Black-Scholes con σ = 25 %, 3 meses y r = 5 %, como en el texto.</p>` });
        vincularRango(p + 'k1', v => fmt(v, 0)); vincularRango(p + 'k2', v => fmt(v, 0));
        return () => {
          const e = ESTR[$$(p + 'e').value], a = +$$(p + 'k1').value, b = +$$(p + 'k2').value;
          const legs = e.patas(a, b), an = Payoff.analyze(legs);
          const lim = x => (x === Infinity ? 'Ilimitada' : x === -Infinity ? 'Ilimitada' : fmtSigno(x));
          caja.querySelector('.ms-datos').innerHTML = datos([
            ['Costo neto inicial', fmt(Math.abs(an.netPremium)), '', an.netPremium > 0 ? 'net debit: se paga' : 'net credit: se cobra'],
            ['Ganancia máxima', lim(an.maxProfit), 'pos'], ['Pérdida máxima', lim(an.maxLoss), 'neg'],
            ['Puntos de equilibrio', an.breakevens.map(x => fmt(x)).join(' y ') || '—', '', '', true],
          ]);
          const xs = [...rangoX(50, 150, 50), a, b, (a + b) / 2].sort((x, y) => x - y);
          grafico(caja.querySelector('canvas'), [{ label: 'Beneficio al vencimiento', data: xs.map(x => ({ x, y: Payoff.totalPnL(legs, x) })) }],
            { tituloX: 'Precio de la acción al vencimiento', tituloY: 'Beneficio', xMin: 50, xMax: 150, leyenda: false });
          caja.querySelector('.ms-texto').innerHTML = `${e.nombre}: ${e.idea}.`;
        };
      },
    },
  };

  // ======================================================================
  // Montaje
  // ======================================================================
  document.querySelectorAll('.mini-sim[data-sim]').forEach(caja => {
    const def = MINI_SIMS[caja.dataset.sim];
    if (!def) { caja.innerHTML = `<p class="vacio">No existe la simulación «${caja.dataset.sim}».</p>`; return; }
    const p = `ms${++contador}-`;
    const $$ = id => caja.querySelector('#' + CSS.escape(id));
    const act = def.montar(caja, p, $$);
    const correr = () => { try { act(); renderFormulas(caja); } catch (e) { console.error(e); } };
    caja.addEventListener('input', correr);
    caja.addEventListener('change', correr);
    if (typeof alCambiarTema === 'function') alCambiarTema(correr);
    correr();
  });

  window.MINI_SIMS = MINI_SIMS;
})();
