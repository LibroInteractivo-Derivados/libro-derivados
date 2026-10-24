// Partes comunes a todas las páginas del libro: menú, índice lateral, fórmulas,
// tema claro/oscuro, gráficos de payoff y diagramas escritos en el HTML,
// mini-autoevaluaciones, el "narrador" de las simulaciones y utilidades de formato.
//
// Para agregar, renombrar o habilitar páginas, editá solamente el objeto LIBRO:
// el menú, las pestañas, la portada, el programa y los botones "Anterior / Siguiente"
// se arman solos.

const LIBRO = {
  titulo: 'Derivados I',
  subtitulo: 'Libro interactivo de la materia',
  materia: 'Instrumentos Financieros Derivados I',
  cuatrimestre: '2.º cuatrimestre 2026',

  // Evaluaciones del cronograma (aparecen en la portada y en el programa).
  evaluaciones: [
    { fecha: '2026-09-18', nombre: 'Primer parcial', unidades: ['u1', 'u2', 'u3'] },
    { fecha: '2026-11-13', nombre: 'Segundo parcial', unidades: ['u4', 'u5', 'u6', 'u8'] },
    { fecha: '2026-12-04', nombre: 'Recuperatorio / final adelantado', unidades: [] },
    { fecha: '2026-12-11', nombre: 'Examen final regular', unidades: [] },
  ],

  // Cronograma de clases (viernes 18:30 a 22:00; la clase 9 es un sábado).
  clases: [
    { n: 1, fecha: '2026-08-07', unidad: 'u1', tema: 'Introducción a la ingeniería financiera y al mercado de derivados' },
    { n: 2, fecha: '2026-08-14', unidad: 'u1', tema: 'Introducción a la ingeniería financiera y al mercado de derivados' },
    { n: 3, fecha: '2026-08-21', unidad: 'u2', tema: 'Estrategias de cobertura y especulación con forwards y futuros' },
    { n: 4, fecha: '2026-08-28', unidad: 'u2', tema: 'Estrategias de cobertura y especulación con forwards y futuros' },
    { n: 5, fecha: '2026-09-04', unidad: 'u3', tema: 'Valuación de forwards y futuros' },
    { n: 6, fecha: '2026-09-11', unidad: 'u3', tema: 'Valuación de forwards y futuros' },
    { n: 7, fecha: '2026-09-18', unidad: null, tema: 'Primer examen parcial (Unidades I, II y III)', examen: true },
    { n: 8, fecha: '2026-09-25', unidad: 'u4', tema: 'Swaps' },
    { n: 9, fecha: '2026-09-26', unidad: 'u4', tema: 'Swaps (clase adicional, sábado 9:00 a 13:00, sincrónica)' },
    { n: 10, fecha: '2026-10-02', unidad: 'u4', tema: 'Swaps' },
    { n: 11, fecha: '2026-10-09', unidad: 'u5', tema: 'Introducción a las opciones. Mecánica. Propiedades' },
    { n: 12, fecha: '2026-10-16', unidad: 'u5', tema: 'Introducción a las opciones. Mecánica. Propiedades' },
    { n: 13, fecha: '2026-10-23', unidad: 'u6', tema: 'Valuación de opciones. Modelo binomial. Modelos en tiempo continuo' },
    { n: 14, fecha: '2026-10-30', unidad: 'u6', tema: 'Valuación de opciones. Modelo binomial. Modelos en tiempo continuo' },
    { n: 15, fecha: '2026-11-06', unidad: 'u8', tema: 'Estrategias con opciones' },
    { n: 16, fecha: '2026-11-13', unidad: null, tema: 'Segundo examen parcial (Unidades IV, V, VI y VIII)', examen: true },
    { n: 17, fecha: '2026-11-20', unidad: 'u7', tema: 'Opciones sobre índices, monedas y futuros' },
    { n: 18, fecha: '2026-11-27', unidad: 'u7', tema: 'Opciones sobre índices, monedas y futuros' },
    { n: 19, fecha: '2026-12-04', unidad: null, tema: 'Examen recuperatorio / examen final adelantado', examen: true },
    { n: null, fecha: '2026-12-11', unidad: null, tema: 'Examen final regular', examen: true },
  ],

  unidades: [
    {
      id: 'u1', numero: 'I', nombre: 'Introducción a los derivados', corto: 'Introducción',
      clases: 'Clases 1 y 2 · 07/08 y 14/08',
      hull: 'Hull caps. 1 y 2 (caps. 1 y 2 en la edición en español)',
      descripcion: 'Ingeniería financiera, mercados de derivados, forwards, futuros y opciones, tipos de operadores y mecánica de los futuros: márgenes y ajuste diario.',
      paginas: [
        { id: 'teoria', nombre: 'Teoría', archivo: 'u1-teoria.html' },
        { id: 'simulacion', nombre: 'Simulación', archivo: 'u1-simulacion.html' },
        { id: 'ejercitacion', nombre: 'Ejercitación', archivo: 'u1-ejercitacion.html' },
      ],
    },
    {
      id: 'u2', numero: 'II', nombre: 'Cobertura y especulación con futuros', corto: 'Cobertura',
      clases: 'Clases 3 y 4 · 21/08 y 28/08',
      hull: 'Hull cap. 3 (cap. 4 en la edición en español)',
      descripcion: 'Coberturas largas y cortas, riesgo de base, ratio de cobertura de mínima varianza, futuros sobre índices y beta, rolleo de coberturas y especulación.',
      paginas: [
        { id: 'teoria', nombre: 'Teoría', archivo: 'u2-teoria.html' },
        { id: 'simulacion', nombre: 'Simulación', archivo: 'u2-simulacion.html' },
        { id: 'ejercitacion', nombre: 'Ejercitación', archivo: 'u2-ejercitacion.html' },
      ],
    },
    {
      id: 'u3', numero: 'III', nombre: 'Valuación de forwards y futuros', corto: 'Forwards',
      clases: 'Clases 5 y 6 · 04/09 y 11/09',
      hull: 'Hull caps. 4, 5 y 6 (caps. 3 y 5 en la edición en español)',
      descripcion: 'Tasas de interés, costo de tenencia y arbitraje: precio forward de acciones, índices, monedas y commodities, valor de un forward y futuros de tasas.',
      paginas: [
        { id: 'teoria', nombre: 'Teoría', archivo: 'u3-teoria.html' },
        { id: 'simulacion', nombre: 'Simulación', archivo: 'u3-simulacion.html' },
        { id: 'ejercitacion', nombre: 'Ejercitación', archivo: 'u3-ejercitacion.html' },
      ],
    },
    {
      id: 'u4', numero: 'IV', nombre: 'Swaps', corto: 'Swaps',
      clases: 'Clases 8 a 10 · 25/09 al 02/10',
      hull: 'Hull cap. 7 (cap. 6 en la edición en español)',
      descripcion: 'Swaps de tasa de interés y de monedas: mecánica, usos, ventaja comparativa y valuación.',
      paginas: [
        { id: 'teoria', nombre: 'Teoría', archivo: 'u4-teoria.html' },
        { id: 'ejemplos', nombre: 'Ejemplos prácticos', archivo: 'u4-ejemplos.html' },
        { id: 'ejercitacion', nombre: 'Ejercitación', archivo: 'u4-ejercitacion.html' },
      ],
    },
    {
      id: 'u5', numero: 'V', nombre: 'Introducción a las opciones', corto: 'Opciones',
      clases: 'Clases 11 y 12 · 09/10 y 16/10',
      hull: 'Hull caps. 10 y 11 (caps. 7 y 8 en la edición en español)',
      descripcion: 'Mecánica de las opciones, payoffs, variables que afectan el precio, límites, paridad put-call y ejercicio anticipado.',
      paginas: [
        { id: 'teoria', nombre: 'Teoría', archivo: 'u5-teoria.html' },
        { id: 'simulacion', nombre: 'Simulación', archivo: 'u5-simulacion.html' },
        { id: 'ejercitacion', nombre: 'Ejercitación', archivo: 'u5-ejercitacion.html' },
      ],
    },
    {
      id: 'u6', numero: 'VI', nombre: 'Valuación de opciones', corto: 'Valuación',
      clases: 'Clases 13 y 14 · 23/10 y 30/10',
      hull: 'Hull caps. 13, 14, 15 y 19 (caps. 10, 11 y 15 en la edición en español)',
      descripcion: 'Modelo binomial, precios de Arrow-Debreu, procesos estocásticos, Black-Scholes-Merton, volatilidad y griegas.',
      paginas: [
        { id: 'teoria', nombre: 'Teoría', archivo: 'u6-teoria.html' },
        { id: 'simulacion', nombre: 'Simulación', archivo: 'u6-simulacion.html' },
        { id: 'ejercitacion', nombre: 'Ejercitación', archivo: 'u6-ejercitacion.html' },
      ],
    },
    {
      id: 'u7', numero: 'VII', nombre: 'Opciones sobre índices, monedas y futuros', corto: 'Índices y monedas',
      clases: 'Clases 17 y 18 · 20/11 y 27/11',
      hull: 'Hull caps. 17 y 18 (caps. 12 y 13 en la edición en español)',
      descripcion: 'Activos con rendimiento continuo: opciones sobre índices, seguro de cartera, opciones sobre monedas y opciones sobre futuros (modelo de Black).',
      paginas: [
        { id: 'teoria', nombre: 'Teoría', archivo: 'u7-teoria.html' },
        { id: 'simulacion', nombre: 'Simulación', archivo: 'u7-simulacion.html' },
        { id: 'ejercitacion', nombre: 'Ejercitación', archivo: 'u7-ejercitacion.html' },
      ],
    },
    {
      id: 'u8', numero: 'VIII', nombre: 'Estrategias con opciones', corto: 'Estrategias',
      clases: 'Clase 15 · 06/11',
      hull: 'Hull cap. 12 (cap. 9 en la edición en español)',
      descripcion: 'Notas con capital protegido, estrategias cubiertas, spreads, box spread, mariposas, spreads de calendario y estrategias de volatilidad.',
      paginas: [
        { id: 'teoria', nombre: 'Teoría', archivo: 'u8-teoria.html' },
        { id: 'simulacion', nombre: 'Simulador', archivo: 'u8-simulacion.html' },
        { id: 'ejercitacion', nombre: 'Ejercitación', archivo: 'u8-ejercitacion.html' },
      ],
    },
  ],

  // Páginas generales (aparecen a la derecha del menú).
  generales: [
    { id: 'herramientas', nombre: 'Herramientas', archivo: 'herramientas.html' },
    { id: 'simulacro', nombre: 'Simulacro', archivo: 'simulacro.html' },
    { id: 'batalla', nombre: 'Batalla', archivo: 'batalla.html' },
    { id: 'formulario', nombre: 'Formulario', archivo: 'formulario.html' },
    { id: 'programa', nombre: 'Programa', archivo: 'programa.html' },
  ],
};

// ======================================================================
// Utilidades
// ======================================================================

const $ = id => document.getElementById(id);

function fmt(n, dec = 2) {
  if (n === Infinity) return 'Ilimitada';
  if (n === -Infinity) return 'Ilimitada';
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  // Evita "-0,00".
  const r = Math.abs(n) < 0.5 * Math.pow(10, -dec) ? 0 : n;
  return r.toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

// Recibe una tasa decimal (0.05) y la muestra como porcentaje ("5,00 %").
function fmtPct(x, dec = 2) {
  if (x === null || x === undefined || Number.isNaN(x)) return '—';
  return fmt(x * 100, dec) + ' %';
}

// Monto con signo explícito: "+1.234,50" / "−1.234,50".
function fmtSigno(x, dec = 2) {
  if (x === null || x === undefined || Number.isNaN(x)) return '—';
  const s = fmt(Math.abs(x), dec);
  return (x > 0.5 * Math.pow(10, -dec) ? '+' : x < -0.5 * Math.pow(10, -dec) ? '−' : '') + s;
}

function claseSigno(v) {
  return v > 1e-9 ? 'pos' : v < -1e-9 ? 'neg' : '';
}

// Decimales para mostrar precios: 4 si el precio de referencia es chico (un tipo de cambio), 2 si no.
function decPrecio(ref) { return Math.abs(ref) < 10 ? 4 : 2; }

// Convierte texto a número; acepta coma o punto decimal, separador de miles y fracciones como "5/12".
function aNumero(valor) {
  let texto = String(valor).trim().replace(/\s/g, '').replace(/[−–]/g, '-');
  if (texto === '') return NaN;
  if (texto.includes('/')) {
    const [a, b] = texto.split('/').map(aNumero);
    return a / b;
  }
  // "1.234,56" → 1234.56 ; "1234,56" → 1234.56 ; "1234.56" → 1234.56
  if (texto.includes(',') && texto.includes('.')) texto = texto.replace(/\./g, '').replace(',', '.');
  else texto = texto.replace(',', '.');
  texto = texto.replace(/[%$]/g, '');
  return parseFloat(texto);
}

// Lee un número de un campo.
function numero(id) {
  return aNumero($(id).value);
}

// Lee una lista de números separados por espacios o punto y coma: "3,6 4,1 4,5".
function listaNumeros(id) {
  return String($(id).value)
    .replace(/[−–]/g, '-')
    .trim()
    .split(/[\s;]+/)
    .filter(Boolean)
    .map(x => parseFloat(x.replace(',', '.')));
}

function elegido(nombre) {
  const el = document.querySelector(`input[name="${nombre}"]:checked`);
  return el ? el.value : null;
}

// Funciones que dibujan algo: se vuelven a ejecutar si cambia el tema (claro/oscuro).
const RENDERS = [];
function alCambiarTema(fn) { RENDERS.push(fn); }

// Datos inválidos: si un cálculo no puede hacerse (campo vacío o fuera de rango), la
// simulación llama a datosInvalidos() en lugar de calcular. alCambiar() muestra entonces
// un aviso y atenúa los resultados viejos, para que no se lean como si fueran los nuevos.
let hayDatosInvalidos = false;
function datosInvalidos() { hayDatosInvalidos = true; }
function marcarInvalido(c, invalido) {
  c.classList.toggle('datos-invalidos', invalido);
  let aviso = c.querySelector(':scope > .aviso-datos');
  if (invalido && !aviso) {
    aviso = document.createElement('div');
    aviso.className = 'alerta aviso-datos';
    aviso.setAttribute('role', 'status');
    aviso.textContent = 'Revisá los datos: hay un campo vacío o con un valor fuera de rango. Lo que se ve abajo corresponde a los datos anteriores.';
    const entradas = c.querySelector(':scope > .entradas');
    if (entradas) entradas.after(aviso); else c.prepend(aviso);
  }
  if (aviso) aviso.hidden = !invalido;
}

// Ejecuta `fn` ahora y cada vez que cambia algún campo dentro del contenedor.
function alCambiar(idContenedor, fn) {
  const c = $(idContenedor);
  const correr = e => { hayDatosInvalidos = false; fn(e); marcarInvalido(c, hayDatosInvalidos); };
  c.addEventListener('input', correr);
  c.addEventListener('change', correr);
  RENDERS.push(correr);
  correr();
}

// Arma una tabla HTML. `columnas`: [{ titulo, num: true|false }]; `filas`: arrays de celdas.
// Una celda puede ser texto o { texto, clase }.
function tablaHTML(columnas, filas, claseFila = () => '', claseTabla = '') {
  const th = columnas.map(c => `<th class="${c.num ? 'num' : ''}">${c.titulo}</th>`).join('');
  const tr = filas
    .map((fila, i) => {
      const tds = fila
        .map((celda, j) => {
          const obj = typeof celda === 'object' && celda !== null ? celda : { texto: celda };
          return `<td class="${columnas[j] && columnas[j].num ? 'num' : ''} ${obj.clase || ''}">${obj.texto}</td>`;
        })
        .join('');
      return `<tr class="${claseFila(i)}">${tds}</tr>`;
    })
    .join('');
  return `<div class="tabla-wrap"><table class="tabla ${claseTabla}"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`;
}

// Guardado local (progreso, preferencias). Si el navegador no lo permite, no pasa nada.
const Guardado = {
  leer(clave, porDefecto = null) {
    try { const v = localStorage.getItem('derivados:' + clave); return v === null ? porDefecto : JSON.parse(v); } catch (e) { return porDefecto; }
  },
  escribir(clave, valor) {
    try { localStorage.setItem('derivados:' + clave, JSON.stringify(valor)); } catch (e) { /* sin almacenamiento */ }
  },
};

// Lee un parámetro de la dirección: ?nombre=valor (uso local) o #valor (publicado).
function parametroURL(nombre, validos = null) {
  const q = new URLSearchParams(location.search).get(nombre);
  if (q) return q;
  const h = decodeURIComponent(location.hash.replace(/^#/, ''));
  if (h && (!validos || validos.includes(h))) return h;
  return null;
}

// ======================================================================
// Tema claro / oscuro y colores para los gráficos
// ======================================================================

function token(nombre) {
  return getComputedStyle(document.body || document.documentElement).getPropertyValue(nombre).trim();
}

function colorUnidad() {
  return token('--acento') || '#1f3a5f';
}

// Paleta de los gráficos, leída de los tokens CSS (cambia con el tema).
function coloresGrafico() {
  return {
    acento: colorUnidad(),
    texto: token('--texto'),
    suave: token('--suave'),
    grilla: token('--grilla'),
    eje: token('--eje'),
    ganancia: token('--ganancia'),
    perdida: token('--perdida'),
    rellenoGanancia: token('--relleno-ganancia'),
    rellenoPerdida: token('--relleno-perdida'),
    superficie: token('--superficie'),
    series: [token('--serie-2'), token('--serie-3'), token('--serie-4'), token('--serie-5'), token('--serie-6')],
  };
}

function aplicarTemaGraficos() {
  if (!window.Chart) return;
  const c = coloresGrafico();
  Chart.defaults.font.family = '"IBM Plex Sans", system-ui, sans-serif';
  Chart.defaults.color = c.suave;
  Chart.defaults.borderColor = c.grilla;
}

const TEMAS = ['sistema', 'claro', 'oscuro'];
function aplicarTemaGuardado() {
  const t = Guardado.leer('tema', 'sistema');
  if (t === 'claro') document.documentElement.setAttribute('data-theme', 'light');
  else if (t === 'oscuro') document.documentElement.setAttribute('data-theme', 'dark');
  return t;
}
const ICONO_TEMA = '<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" style="vertical-align:-2px;margin-right:5px"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 1.5a6.5 6.5 0 0 1 0 13z" fill="currentColor"/></svg>';
function textoBotonTema(t) {
  return ICONO_TEMA + `<span class="texto-tema">${{ sistema: 'Auto', claro: 'Claro', oscuro: 'Oscuro' }[t]}</span>`;
}
function cambiarTema() {
  const actual = Guardado.leer('tema', 'sistema');
  const siguiente = TEMAS[(TEMAS.indexOf(actual) + 1) % TEMAS.length];
  Guardado.escribir('tema', siguiente);
  if (siguiente === 'sistema') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', siguiente === 'claro' ? 'light' : 'dark');
  const b = $('btn-tema');
  if (b) b.innerHTML = textoBotonTema(siguiente);
}

// Redibuja todo cuando cambia el tema (por el botón, por el sistema o por quien muestra la página).
let redibujando = false;
function redibujarTodo() {
  if (redibujando) return;
  redibujando = true;
  requestAnimationFrame(() => {
    aplicarTemaGraficos();
    document.querySelectorAll('figure.grafico-payoff[data-patas]').forEach(dibujarGraficoPayoff);
    renderDiagramas();
    RENDERS.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
    redibujando = false;
  });
}
function vigilarTema() {
  try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', redibujarTodo); } catch (e) { /* navegador viejo */ }
  new MutationObserver(redibujarTodo).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}

// ======================================================================
// Gráficos (Chart.js)
// ======================================================================

// Crea un gráfico de Chart.js en el canvas, o lo actualiza si ya existía.
function dibujarGrafico(canvas, config) {
  if (canvas._grafico) {
    canvas._grafico.data = config.data;
    canvas._grafico.options = config.options;
    canvas._grafico.update('none');
    return canvas._grafico;
  }
  canvas._grafico = new Chart(canvas, config);
  return canvas._grafico;
}

// Opciones de ejes habituales para gráficos de líneas con eje x numérico.
function opcionesEjes({ tituloX, tituloY, xMin, xMax, yMin, yMax, leyenda = true, decX = 2, decY = 2 }) {
  const c = coloresGrafico();
  return {
    animation: false,
    maintainAspectRatio: false,
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
    scales: {
      x: {
        type: 'linear', min: xMin, max: xMax,
        title: { display: !!tituloX, text: tituloX, color: c.suave },
        ticks: { callback: v => fmt(v, decX), color: c.suave },
        grid: { color: c.grilla },
      },
      y: {
        min: yMin, max: yMax,
        title: { display: !!tituloY, text: tituloY, color: c.suave },
        ticks: { callback: v => fmt(v, decY), color: c.suave },
        grid: { color: ctx => (ctx.tick.value === 0 ? c.eje : c.grilla) },
      },
    },
    plugins: {
      legend: { display: leyenda, position: 'bottom', labels: { boxWidth: 14, color: c.texto } },
      tooltip: {
        callbacks: {
          title: items => (items.length ? fmt(items[0].parsed.x, decX) : ''),
          label: item => `${item.dataset.label}: ${fmt(item.parsed.y, decY)}`,
        },
      },
    },
  };
}

// ======================================================================
// Encabezado, pestañas, índice lateral y navegación
// ======================================================================

function paginaActual() {
  const unidad = LIBRO.unidades.find(u => u.id === document.body.dataset.unidad);
  const pagina = unidad && unidad.paginas.find(p => p.id === document.body.dataset.seccion);
  return { unidad, pagina };
}

function renderEncabezado() {
  const { unidad } = paginaActual();
  const lugar = $('encabezado');
  if (!lugar) return;
  const general = document.body.dataset.pagina;

  const enlacesUnidades = LIBRO.unidades
    .map(u => `<a href="${u.paginas[0].archivo}" class="${unidad && u.id === unidad.id ? 'activa' : ''}" title="Unidad ${u.numero} · ${u.nombre}"><span class="u-num">${u.numero}</span><span class="nombre-u">${u.corto || u.nombre}</span></a>`)
    .join('');
  const enlacesGenerales = LIBRO.generales
    .filter(g => g.archivo)
    .map(g => `<a href="${g.archivo}" class="general ${general === g.id ? 'activa' : ''}">${g.nombre}</a>`)
    .join('');

  let html = `
    <header class="barra">
      <div class="barra-inner">
        <a class="marca" href="index.html">
          <span class="marca-titulo">${LIBRO.titulo}</span>
          <span class="marca-sub">${LIBRO.subtitulo}</span>
        </a>
        <nav class="unidades" aria-label="Unidades del libro">${enlacesUnidades}<span class="sep"></span>${enlacesGenerales}</nav>
        <div class="acciones-barra"><button class="btn-barra" id="btn-tema" type="button" title="Tema: automático (según el sistema), claro u oscuro" aria-label="Cambiar el tema de colores">${textoBotonTema(Guardado.leer('tema', 'sistema'))}</button></div>
      </div>
    </header>`;

  if (unidad) {
    const pestanas = unidad.paginas
      .map(p => {
        if (!p.archivo) return `<span title="Próximamente">${p.nombre} <small>(próximamente)</small></span>`;
        const activa = p.id === document.body.dataset.seccion ? 'activa' : '';
        return `<a href="${p.archivo}" class="${activa}">${p.nombre}</a>`;
      })
      .join('');
    html += `
      <div class="subbarra">
        <div class="subbarra-inner">
          <div class="unidad-titulo">Unidad ${unidad.numero} · ${unidad.nombre}<small>${unidad.clases} · ${unidad.hull}</small></div>
          <nav class="pestanas" aria-label="Secciones de la unidad">${pestanas}</nav>
        </div>
      </div>`;
  }
  html += '<div class="progreso-lectura" aria-hidden="true"><div id="barra-progreso"></div></div>';
  lugar.innerHTML = html;
  $('btn-tema').addEventListener('click', cambiarTema);

  // Deja visible la unidad activa en el menú (en pantallas angostas el menú se desplaza).
  const activa = lugar.querySelector('.unidades a.activa');
  if (activa) activa.scrollIntoView({ block: 'nearest', inline: 'center' });

  const barra = $('barra-progreso');
  const actualizar = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    barra.style.width = h > 0 ? `${Math.min(100, (scrollY / h) * 100)}%` : '0';
  };
  addEventListener('scroll', actualizar, { passive: true });
  actualizar();
}

function aSlug(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Arma el índice lateral con los títulos <h2> de la página.
function renderIndice() {
  const aside = $('indice');
  if (!aside) return;
  const titulos = [...document.querySelectorAll('.contenido h2')];
  titulos.forEach(h => { if (!h.id) h.id = aSlug(h.textContent); });
  const clave = paginaClave();
  aside.innerHTML = `<div class="indice-titulo">En esta página</div><ol>${titulos
    .map(h => `<li><a href="#${h.id}">${h.textContent}</a></li>`)
    .join('')}</ol>${clave ? `<button class="btn marcar-leido" id="btn-leido" type="button"></button>` : ''}`;

  if (clave) {
    const b = $('btn-leido');
    const pintar = () => { const l = Guardado.leer('leido:' + clave, false); b.textContent = l ? '✔ Marcada como leída' : 'Marcar como leída'; b.classList.toggle('activo', !!l); };
    b.addEventListener('click', () => { Guardado.escribir('leido:' + clave, !Guardado.leer('leido:' + clave, false)); pintar(); });
    pintar();
  }

  const enlaces = [...aside.querySelectorAll('a')];
  const marcar = () => {
    let actual = titulos[0];
    for (const h of titulos) if (h.getBoundingClientRect().top < 170) actual = h;
    enlaces.forEach(a => a.classList.toggle('actual', actual && a.getAttribute('href') === '#' + actual.id));
  };
  window.addEventListener('scroll', marcar, { passive: true });
  marcar();
}

function paginaClave() {
  const { unidad, pagina } = paginaActual();
  return unidad && pagina ? `${unidad.id}-${pagina.id}` : null;
}

function renderPieNavegacion() {
  const lugar = $('pie-navegacion');
  if (!lugar) return;
  const secuencia = [];
  LIBRO.unidades.forEach(u => u.paginas.forEach(p => { if (p.archivo) secuencia.push({ u, p }); }));
  const i = secuencia.findIndex(s => s.u.id === document.body.dataset.unidad && s.p.id === document.body.dataset.seccion);
  if (i < 0) return;
  const enlace = (s, clase, texto) =>
    s ? `<a class="${clase}" href="${s.p.archivo}"><small>${texto}</small>Unidad ${s.u.numero} · ${s.p.nombre}</a>` : '';
  lugar.innerHTML = enlace(secuencia[i - 1], 'anterior', '← Anterior') + enlace(secuencia[i + 1], 'siguiente', 'Siguiente →');
}

function renderPieLibro() {
  if (document.body.dataset.sinPie !== undefined) return;
  const pie = document.createElement('footer');
  pie.className = 'pie-libro';
  pie.innerHTML = `<div><span>${LIBRO.materia} · ${LIBRO.cuatrimestre}</span><span>Bibliografía base: Hull, <em>Options, Futures and Other Derivatives</em> · Hull, <em>Introducción a los mercados de futuros y opciones</em> (ed. en español)</span></div>`;
  document.body.appendChild(pie);
}

// ======================================================================
// Fórmulas (KaTeX): \( ... \) dentro del texto y \[ ... \] en su propio renglón
// ======================================================================

function renderFormulas(elemento = document.body) {
  if (!window.renderMathInElement) return;
  renderMathInElement(elemento, {
    delimiters: [
      { left: '\\[', right: '\\]', display: true },
      { left: '\\(', right: '\\)', display: false },
    ],
    throwOnError: false,
  });
  ajustarFormulasAnchas(elemento);
}

// Una fórmula dentro del texto que no entra en el ancho (pasa en celulares) se convierte
// en un bloque que se desplaza de costado, en lugar de ensanchar toda la página.
function ajustarFormulasAnchas(raiz = document.body) {
  raiz.querySelectorAll('.katex').forEach(k => {
    if (k.closest('.katex-display')) return;
    const caja = k.parentElement;
    const disponible = (caja.closest('p, li, td, div, dd') || caja.parentElement).clientWidth;
    const ancha = k.getBoundingClientRect().width > disponible + 1;
    caja.classList.toggle('formula-ancha', ancha);
  });
  // Las fórmulas que se desplazan de costado tienen que poder recorrerse con el teclado.
  raiz.querySelectorAll('.katex-display, .formula-ancha').forEach(el => {
    if (el.scrollWidth > el.clientWidth + 1) {
      el.tabIndex = 0;
      el.setAttribute('role', 'region');
      el.setAttribute('aria-label', 'Fórmula (se puede desplazar con las flechas)');
    } else if (el.hasAttribute('tabindex')) {
      el.removeAttribute('tabindex'); el.removeAttribute('role'); el.removeAttribute('aria-label');
    }
  });
}
let temporizadorFormulas;
addEventListener('resize', () => { clearTimeout(temporizadorFormulas); temporizadorFormulas = setTimeout(() => ajustarFormulasAnchas(), 200); });
addEventListener('load', () => setTimeout(() => ajustarFormulasAnchas(), 300));
// Al abrir un desplegable, sus fórmulas recién tienen ancho: se vuelven a revisar.
document.addEventListener('toggle', e => { if (e.target.open) ajustarFormulasAnchas(e.target); }, true);

// ======================================================================
// Gráficos de payoff escritos en el HTML
// ======================================================================
//
// <figure class="grafico-payoff" data-patas="compra call 100 5; venta call 110 2">
//   <figcaption>Texto debajo del gráfico</figcaption>
// </figure>
//
// Cada pata: compra|venta  call|put|accion|forward  strike  prima  [cantidad]
// Para la acción: compra|venta accion precio [cantidad]
// Para un forward o futuro: compra|venta forward precio-pactado [cantidad]
// Para un bono cupón cero: compra|venta bono nominal precio [cantidad]
// Atributos opcionales:
//   data-modo="payoff"     → muestra el payoff bruto (sin descontar primas)
//   data-individuales      → dibuja también cada pata con línea punteada
//   data-desde / data-hasta → rango del eje horizontal

function parsearPatas(texto) {
  const num = x => (x === undefined ? NaN : parseFloat(String(x).replace(',', '.')));
  return texto
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => {
      const p = s.split(/\s+/);
      const side = p[0].toLowerCase();
      const tipo = p[1].toLowerCase();
      if (tipo.startsWith('acc') || tipo.startsWith('forw') || tipo.startsWith('fut')) return { type: 'stock', side, strike: 0, premium: num(p[2]), qty: num(p[3]) || 1, esForward: !tipo.startsWith('acc') };
      if (tipo.startsWith('bono')) return { type: 'bond', side, strike: num(p[2]), premium: num(p[3]), qty: num(p[4]) || 1 };
      return { type: tipo, side, strike: num(p[2]), premium: num(p[3]) || 0, qty: num(p[4]) || 1 };
    });
}

function nombrePata(leg) {
  const op = leg.side === 'compra' ? 'Compra' : 'Venta';
  const cant = leg.qty > 1 ? leg.qty + ' ' : '';
  if (leg.type === 'stock') return leg.esForward ? `${leg.side === 'compra' ? 'Long' : 'Short'} forward a ${fmt(leg.premium, 0)}` : `${op} ${cant}acción`;
  if (leg.type === 'bond') return `${op} ${cant}bono cupón cero`;
  return `${op} ${cant}${leg.type === 'call' ? 'call' : 'put'} ${fmt(leg.strike, Number.isInteger(leg.strike) ? 0 : 2)}`;
}

function dibujarGraficoPayoff(fig) {
  let legs = parsearPatas(fig.dataset.patas);
  const bruto = fig.dataset.modo === 'payoff';
  if (bruto) legs = legs.map(l => ({ ...l, premium: l.type === 'stock' ? l.premium : 0 }));

  const precios = legs.filter(l => l.type !== 'bond').map(l => (l.type === 'stock' ? l.premium : l.strike));
  const paso = Math.pow(10, Math.floor(Math.log10(Math.max(...precios) * 1.3)) - 1);
  const lo = fig.dataset.desde !== undefined ? parseFloat(fig.dataset.desde) : Math.max(0, Math.floor((Math.min(...precios) * 0.7) / paso) * paso);
  const hi = fig.dataset.hasta !== undefined ? parseFloat(fig.dataset.hasta) : Math.ceil((Math.max(...precios) * 1.3) / paso) * paso;
  const xs = [];
  for (let i = 0; i <= 120; i++) xs.push(lo + ((hi - lo) * i) / 120);
  Payoff.breakpoints(legs).forEach(k => { if (k > lo && k < hi) xs.push(k); });
  xs.sort((a, b) => a - b);

  const c = coloresGrafico();
  const datasets = [{
    label: bruto ? 'Payoff' : 'Beneficio total',
    data: xs.map(x => ({ x, y: Payoff.totalPnL(legs, x) })),
    borderColor: c.acento,
    borderWidth: 2.5,
    pointRadius: 0,
    fill: { target: 'origin', above: c.rellenoGanancia, below: c.rellenoPerdida },
  }];
  if (fig.hasAttribute('data-individuales') && legs.length > 1) {
    legs.forEach((leg, i) => datasets.push({
      label: nombrePata(leg),
      data: xs.map(x => ({ x, y: Payoff.legPnL(leg, x) })),
      borderColor: c.series[i % c.series.length],
      borderWidth: 1.3,
      borderDash: [5, 4],
      pointRadius: 0,
    }));
  }

  let lienzo = fig.querySelector('.lienzo');
  if (!lienzo) {
    lienzo = document.createElement('div');
    lienzo.className = 'lienzo';
    lienzo.appendChild(document.createElement('canvas'));
    fig.insertBefore(lienzo, fig.firstChild);
  }
  const opciones = opcionesEjes({
    tituloX: fig.dataset.ejeX || 'Precio del subyacente al vencimiento',
    tituloY: bruto ? 'Payoff' : 'Beneficio',
    xMin: lo, xMax: hi, leyenda: datasets.length > 1, decX: 0,
  });
  dibujarGrafico(lienzo.querySelector('canvas'), { type: 'line', data: { datasets }, options: opciones });
}

// ======================================================================
// Diagramas de swaps escritos en el HTML
// ======================================================================
//
// <figure class="diagrama-swap"
//   data-entidades="Empresa A | Banco | Empresa B"
//   data-flujos="Banco > Empresa A: 5,9 %; Empresa A > Banco: SOFR; Empresa A > afuera: 6 %">
//   <figcaption>Texto debajo</figcaption>
// </figure>
//
// Cada flujo es "quien paga > quien recibe: etiqueta". "afuera" son los prestamistas
// o inversiones externas: se dibujan como flechas verticales debajo de la entidad.

function dibujarDiagramaSwap(fig) {
  if (!fig._id) fig._id = ++contadorDiagramas;
  const entidades = fig.dataset.entidades.split('|').map(s => s.trim());
  const flujos = (fig.dataset.flujos || '')
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => {
      const pos = s.indexOf(':');
      const ruta = s.slice(0, pos);
      const etiqueta = s.slice(pos + 1).trim();
      const [de, a] = ruta.split('>').map(x => x.trim());
      return { de, a, etiqueta };
    });

  const ANCHO_CAJA = 130, ALTO_CAJA = 56, SEP = 180, MARGEN = 20;
  const hayExternos = flujos.some(f => f.de === 'afuera' || f.a === 'afuera');
  const n = entidades.length;
  const W = 2 * MARGEN + n * ANCHO_CAJA + (n - 1) * SEP;
  const y0 = 10;
  const H = y0 + ALTO_CAJA + (hayExternos ? 70 : 16);
  const x = i => MARGEN + i * (ANCHO_CAJA + SEP);
  const idx = nombre => entidades.indexOf(nombre);

  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagrama de flujos del swap">
    <defs><marker id="flecha-${fig._id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="s-flecha"/></marker></defs>`;

  const flecha = (x1, y1, x2, y2, etiqueta) => {
    const mx = (x1 + x2) / 2;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="s-trazo" stroke-width="1.6" marker-end="url(#flecha-${fig._id})"/>
      <text x="${mx}" y="${y1 - 6}" text-anchor="middle" font-size="15" class="s-texto">${etiqueta}</text>`;
  };

  // Flujos entre entidades vecinas: el primero arriba, el segundo abajo.
  const carriles = {};
  flujos.filter(f => f.de !== 'afuera' && f.a !== 'afuera').forEach(f => {
    const i = idx(f.de), j = idx(f.a);
    if (i < 0 || j < 0) return;
    const izq = Math.min(i, j);
    carriles[izq] = (carriles[izq] || 0) + 1;
    const carril = carriles[izq];
    const y = carril === 1 ? y0 + 18 : y0 + ALTO_CAJA - 10;
    const xa = x(izq) + ANCHO_CAJA, xb = x(izq + 1);
    svg += i < j ? flecha(xa + 4, y, xb - 4, y, f.etiqueta) : flecha(xb - 4, y, xa + 4, y, f.etiqueta);
  });

  // Flujos con terceros (prestamistas o inversores): flechas verticales debajo de cada entidad.
  // Hacia abajo = la entidad paga; hacia arriba = la entidad cobra.
  const externos = {};
  flujos.filter(f => f.de === 'afuera' || f.a === 'afuera').forEach(f => {
    const ent = f.de === 'afuera' ? f.a : f.de;
    const i = idx(ent);
    if (i < 0) return;
    externos[i] = (externos[i] || 0) + 1;
    const xv = x(i) + 22 + (externos[i] - 1) * 60;
    const arriba = y0 + ALTO_CAJA + 4, abajo = y0 + ALTO_CAJA + 54;
    const sale = f.de !== 'afuera';
    svg += sale
      ? `<line x1="${xv}" y1="${arriba}" x2="${xv}" y2="${abajo}" class="s-trazo" stroke-width="1.6" marker-end="url(#flecha-${fig._id})"/>`
      : `<line x1="${xv}" y1="${abajo}" x2="${xv}" y2="${arriba}" class="s-trazo" stroke-width="1.6" marker-end="url(#flecha-${fig._id})"/>`;
    svg += `<text x="${xv + 8}" y="${abajo - 6}" font-size="14" class="s-texto">${f.etiqueta}</text>`;
  });

  entidades.forEach((e, i) => {
    svg += `<rect x="${x(i)}" y="${y0}" width="${ANCHO_CAJA}" height="${ALTO_CAJA}" rx="8" class="s-caja" stroke-width="2"/>
      <text x="${x(i) + ANCHO_CAJA / 2}" y="${y0 + ALTO_CAJA / 2 + 5}" text-anchor="middle" font-size="15" font-weight="700" class="s-texto">${e}</text>`;
  });
  svg += '</svg>';

  let lugar = fig.querySelector('.diagrama-svg');
  if (!lugar) {
    lugar = document.createElement('div');
    lugar.className = 'diagrama-svg';
    fig.insertBefore(lugar, fig.firstChild);
  }
  lugar.innerHTML = svg;
}

let contadorDiagramas = 0;
function renderDiagramas() {
  document.querySelectorAll('.diagrama-swap[data-entidades]').forEach(dibujarDiagramaSwap);
}

// ======================================================================
// Autoevaluación rápida dentro de la teoría
// ======================================================================
//
// <div class="quiz-rapido">
//   <p class="caja-titulo">Autoevaluación rápida</p>
//   <div class="qr-pregunta" data-correcta="2">          ← número de la opción correcta (1, 2, 3…)
//     <p class="qr-enunciado">¿Pregunta?</p>
//     <ol class="qr-op"><li>Opción 1</li><li>Opción 2</li><li>Opción 3</li></ol>
//     <p class="qr-explicacion">Por qué la 2 es la correcta.</p>
//   </div>
// </div>

function prepararQuizRapidos() {
  document.querySelectorAll('.quiz-rapido .qr-pregunta').forEach(q => {
    if (q._listo) return;
    q._listo = true;
    const correcta = parseInt(q.dataset.correcta, 10) - 1;
    const lista = q.querySelector('.qr-op');
    const expl = q.querySelector('.qr-explicacion');
    if (!lista) return;
    const opciones = [...lista.querySelectorAll('li')].map(li => li.innerHTML);
    const cont = document.createElement('div');
    cont.className = 'qr-opciones';
    opciones.forEach((html, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      // El prefijo oculto da un nombre accesible aunque la opción sea solo una fórmula.
      b.innerHTML = `<span class="solo-lector">Opción ${i + 1}: </span>${html}`;
      b.addEventListener('click', () => {
        cont.querySelectorAll('button').forEach((x, j) => {
          x.disabled = true;
          if (j === correcta) x.classList.add('correcta');
        });
        if (i !== correcta) b.classList.add('incorrecta');
        const fb = document.createElement('div');
        fb.className = 'qr-feedback';
        fb.innerHTML = (i === correcta ? '<b class="bien">Correcto.</b> ' : '<b class="mal">No es esa.</b> ') + (expl ? expl.innerHTML : '');
        q.appendChild(fb);
        renderFormulas(fb);
      });
      cont.appendChild(b);
    });
    lista.replaceWith(cont);
    if (expl) expl.hidden = true;
  });
}

// ======================================================================
// Narrador: explica en palabras el porqué de cada cambio en una simulación
// ======================================================================
//
// const nar = crearNarrador($('mi-narrador'), { titulo: 'Qué está pasando' });
// nar.decir('Subió la volatilidad', 'Las opciones compradas valen más porque…', 'pos');

function crearNarrador(contenedor, { titulo = 'Qué está pasando y por qué', maximo = 8 } = {}) {
  contenedor.classList.add('narrador');
  contenedor.innerHTML = `<div class="narrador-titulo"><b>${titulo}</b><button class="btn" type="button" style="padding:3px 10px;font-size:0.8rem">Limpiar</button></div><ol aria-live="polite" tabindex="0" aria-label="${titulo}: explicación de los cambios"></ol>`;
  const lista = contenedor.querySelector('ol');
  contenedor.querySelector('button').addEventListener('click', () => { lista.innerHTML = ''; });
  let ultimo = '';
  return {
    decir(que, porQue = '', tipo = '') {
      const clave = que + '|' + porQue;
      if (clave === ultimo) return;
      ultimo = clave;
      const li = document.createElement('li');
      li.className = `nuevo ${tipo}`;
      li.innerHTML = `<span class="que">${que}</span>${porQue ? `<span class="por-que">${porQue}</span>` : ''}`;
      lista.prepend(li);
      while (lista.children.length > maximo) lista.lastElementChild.remove();
      renderFormulas(li);
    },
    reemplazar(que, porQue = '', tipo = '') {
      // Actualiza la primera entrada en lugar de agregar una nueva (para cambios continuos, como un deslizador).
      const li = lista.firstElementChild;
      if (!li) return this.decir(que, porQue, tipo);
      li.className = tipo;
      li.innerHTML = `<span class="que">${que}</span>${porQue ? `<span class="por-que">${porQue}</span>` : ''}`;
      ultimo = que + '|' + porQue;
      renderFormulas(li);
    },
    limpiar() { lista.innerHTML = ''; ultimo = ''; },
  };
}

// ======================================================================
// Pestañas locales: <div class="tabs" data-grupo="x"><button data-tab="a">…</button></div>
// y paneles <div data-panel="a" data-grupo="x">…</div>
// ======================================================================

function prepararTabs() {
  document.querySelectorAll('.tabs[data-grupo]').forEach(tabs => {
    if (tabs._listo) return;
    tabs._listo = true;
    const grupo = tabs.dataset.grupo;
    const botones = [...tabs.querySelectorAll('button[data-tab]')];
    const mostrar = id => {
      botones.forEach(b => b.setAttribute('aria-selected', b.dataset.tab === id ? 'true' : 'false'));
      document.querySelectorAll(`[data-panel][data-grupo="${grupo}"]`).forEach(p => { p.hidden = p.dataset.panel !== id; });
      tabs.dispatchEvent(new CustomEvent('cambio', { detail: id }));
    };
    tabs.setAttribute('role', 'tablist');
    botones.forEach(b => { b.type = 'button'; b.setAttribute('role', 'tab'); b.addEventListener('click', () => mostrar(b.dataset.tab)); });
    const inicial = botones.find(b => b.getAttribute('aria-selected') === 'true') || botones[0];
    if (inicial) mostrar(inicial.dataset.tab);
  });
}

// Deslizador con su valor a la vista. Devuelve el HTML; el valor se lee con numero(id).
function controlRango({ id, etiqueta, min, max, paso, valor, formato = v => fmt(v, 2), extremos = true }) {
  return `<div class="control-rango">
    <div class="cabecera"><label for="${id}">${etiqueta}</label><output id="${id}-out" for="${id}">${formato(valor)}</output></div>
    <input type="range" id="${id}" min="${min}" max="${max}" step="${paso}" value="${valor}">
    ${extremos ? `<div class="extremos"><span>${formato(min)}</span><span>${formato(max)}</span></div>` : ''}
  </div>`;
}
function vincularRango(id, formato = v => fmt(v, 2)) {
  const el = $(id), out = $(id + '-out');
  const act = () => { out.textContent = formato(parseFloat(el.value)); };
  el.addEventListener('input', act);
  act();
}

// ======================================================================
// Inicio
// ======================================================================

function iniciarLibro() {
  aplicarTemaGuardado();
  aplicarTemaGraficos();
  renderEncabezado();
  renderIndice();
  renderPieNavegacion();
  renderPieLibro();
  renderFormulas();
  prepararQuizRapidos();
  prepararTabs();
  if (window.Chart) document.querySelectorAll('figure.grafico-payoff[data-patas]').forEach(dibujarGraficoPayoff);
  renderDiagramas();
  vigilarTema();
}

iniciarLibro();
