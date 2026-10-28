// Banco de preguntas de opción múltiple · base común
//
// Cada pregunta tiene 4 opciones y una sola correcta. En las prácticas, la respuesta correcta
// y las opciones incorrectas se CALCULAN con las fórmulas (no están escritas a mano), y las
// incorrectas corresponden a errores típicos ("trampas").
//
// Formato de cada pregunta:
//   Q({ id, unidad (número: 1 a 8), tema, dificultad (1 básica · 2 intermedia · 3 avanzada),
//       tipo ('teórica' | 'práctica'), fuente, enunciado, correcta, incorrectas: [3 textos],
//       explicacion, trampas (opcional) });
//
// Requiere js/calculos.js. Cada unidad tiene su archivo: js/preguntas-u4.js, js/preguntas-u5.js, etc.

const BANCO = [];
// Cada pregunta pasa por los cambios del docente (Modo Profesor, js/profesor/ejercicios.js):
// ediciones, preguntas ocultas y unidades ocultas. Vale para la autoevaluación, la batalla y los simulacros.
const Q = pregunta => {
  const q = window.Profesor && Profesor.ajustarPregunta ? Profesor.ajustarPregunta(pregunta) : pregunta;
  if (q) BANCO.push(q);
};
// Preguntas propias del docente (no dependen de los cálculos).
if (window.Profesor && Profesor.preguntasPropias) Profesor.preguntasPropias().forEach(q => BANCO.push(q));

// ---------- Formato ----------
const f = (x, d = 2) => (Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x).toLocaleString('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (x, d = 2) => `${f(x * 100, d)} %`;
const pp = (x, d = 2) => `${f(x, d)} %`; // x ya está en puntos porcentuales
const signo = (x, d = 2) => (x > 0 ? '+' : x < 0 ? '−' : '') + f(Math.abs(x), d);
const libor = s => (s >= 0 ? `LIBOR + ${f(s)} %` : `LIBOR − ${f(-s)} %`);
const EXP = Math.exp;
const bs = (S, K, r, sigma, T, q = 0) => Opciones.blackScholes({ S, K, r, sigma, T, q });
