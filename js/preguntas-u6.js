// Banco de preguntas · UNIDAD VI · Valuación de opciones
// (usa los helpers de preguntas-base.js)

// Árbol binomial de dos pasos con u y d dados (como en la guía).
function arbol2({ S, u, d, K, r, dt, tipo, americana = false }) {
  const p = (EXP(r * dt) - d) / (u - d), D = EXP(-r * dt);
  const pago = s => (tipo === 'call' ? Math.max(s - K, 0) : Math.max(K - s, 0));
  const uu = pago(S * u * u), ud = pago(S * u * d), dd = pago(S * d * d);
  let vu = D * (p * uu + (1 - p) * ud), vd = D * (p * ud + (1 - p) * dd);
  if (americana) { vu = Math.max(vu, pago(S * u)); vd = Math.max(vd, pago(S * d)); }
  let v0 = D * (p * vu + (1 - p) * vd);
  if (americana) v0 = Math.max(v0, pago(S));
  return { v0, vu, vd, p, sinDescontar: p * p * uu + 2 * p * (1 - p) * ud + (1 - p) * (1 - p) * dd };
}

// ---------- Teóricas ----------
Q({ id: 'U6-T01', unidad: 6, tema: 'Replicación', dificultad: 1, tipo: 'teórica', fuente: 'Presentación U6',
  enunciado: '¿Qué establece la ley del precio único?',
  correcta: 'Dos carteras con los mismos pagos futuros en todos los escenarios deben valer lo mismo hoy.',
  incorrectas: [
    'Dos carteras con los mismos pagos futuros deben tener el mismo rendimiento esperado.',
    'Dos activos que valen lo mismo hoy deben pagar lo mismo en el futuro.',
    'Una opción tiene un único precio para todos los strikes.',
  ],
  explicacion: 'Si no, habría arbitraje: se vende la cara y se compra la barata.' });

Q({ id: 'U6-T02', unidad: 6, tema: 'Replicación', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U6',
  enunciado: 'El portafolio que replica un CALL en el modelo binomial consiste en…',
  correcta: 'Comprar Δ acciones financiando parte de la compra con deuda (B < 0).',
  incorrectas: [
    'Vender en corto Δ acciones y colocar dinero (B > 0).',
    'Comprar Δ acciones y colocar dinero (B > 0).',
    'Vender en corto Δ acciones y tomar deuda (B < 0).',
  ],
  explicacion: 'Para un call, Δ > 0 y B < 0 (ejemplo de clase: Δ = 2/3, B = −18,46).',
  trampas: '«Vender en corto Δ acciones y colocar dinero» es la cartera que replica un PUT.' });

Q({ id: 'U6-T03', unidad: 6, tema: 'Replicación', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U6',
  enunciado: 'El portafolio que replica un PUT en el modelo binomial consiste en…',
  correcta: 'Vender en corto acciones (Δ < 0) y colocar dinero (B > 0).',
  incorrectas: ['Comprar acciones (Δ > 0) y tomar deuda (B < 0).', 'Comprar acciones (Δ > 0) y colocar dinero (B > 0).', 'Vender en corto acciones (Δ < 0) y tomar deuda (B < 0).'],
  explicacion: 'El put gana cuando la acción baja: la réplica está vendida en la acción.' });

Q({ id: 'U6-T04', unidad: 6, tema: 'Binomial', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U6',
  enunciado: 'Para que no haya arbitraje en el modelo binomial debe cumplirse…',
  correcta: 'd < e^(rT) < u',
  incorrectas: ['d < u < e^(rT)', 'e^(rT) < d < u', 'u < e^(rT) < d'],
  explicacion: 'La acción no puede rendir siempre más (ni siempre menos) que la tasa libre de riesgo.' });

Q({ id: 'U6-T05', unidad: 6, tema: 'Binomial', dificultad: 3, tipo: 'teórica', fuente: 'Presentación U6',
  enunciado: 'Si en un árbol binomial se diera d > e^(rT), el arbitraje consistiría en…',
  correcta: 'Tomar un préstamo por S₀ a la tasa r y comprar la acción.',
  incorrectas: [
    'Vender en corto la acción e invertir lo recaudado a la tasa r.',
    'No hay arbitraje: el modelo sigue siendo válido.',
    'Comprar un call y vender un put con el mismo strike.',
  ],
  explicacion: 'Si incluso en el peor estado la acción rinde más que r, se compra con deuda y se gana seguro.',
  trampas: '«Vender en corto la acción e invertir lo recaudado» es el arbitraje cuando e^(rT) > u.' });

Q({ id: 'U6-T06', unidad: 6, tema: 'Neutral al riesgo', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U6',
  enunciado: 'En el modelo binomial, la probabilidad neutral al riesgo de suba es…',
  correcta: 'p = (e^(rΔt) − d)/(u − d)',
  incorrectas: ['p = (u − e^(rΔt))/(u − d)', 'p = (e^(rΔt) − d)/u', 'p = 0,5 siempre'],
  explicacion: 'Es la probabilidad que hace que la acción rinda, en promedio, la tasa libre de riesgo.',
  trampas: '(u − e^(rΔt))/(u − d) es 1 − p.' });

Q({ id: 'U6-T07', unidad: 6, tema: 'Neutral al riesgo', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U6',
  enunciado: 'La probabilidad p de la valuación neutral al riesgo…',
  correcta: 'No es la probabilidad real de suba: es la que tendría un mundo de inversores neutrales al riesgo.',
  incorrectas: [
    'Es la probabilidad real de que el precio de la acción suba, estimada a partir de la tasa libre de riesgo.',
    'Es la frecuencia histórica con que subió la acción en períodos de igual duración que Δt.',
    'Es igual al delta de la opción, porque ambos miden la sensibilidad al precio del subyacente.',
  ],
  explicacion: 'Las probabilidades reales no se conocen ni hacen falta para valuar.' });

Q({ id: 'U6-T08', unidad: 6, tema: 'Neutral al riesgo', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U6',
  enunciado: 'Según el principio de valuación neutral al riesgo, el valor de una opción es…',
  correcta: 'El valor esperado de su payoff con probabilidades neutrales al riesgo, descontado a la tasa libre de riesgo.',
  incorrectas: [
    'El valor esperado de su payoff con probabilidades neutrales al riesgo, descontado al rendimiento esperado de la acción.',
    'El valor esperado de su payoff con probabilidades reales, descontado a la tasa libre de riesgo.',
    'El payoff máximo posible, descontado a la tasa libre de riesgo.',
  ],
  explicacion: 'Probabilidades neutrales al riesgo Y descuento a r: las dos cosas van juntas.',
  trampas: 'La opción que descuenta al rendimiento esperado de la acción cambia solo la tasa de descuento.' });

Q({ id: 'U6-T09', unidad: 6, tema: 'Binomial', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U6',
  enunciado: 'En la calibración de Cox-Ross-Rubinstein, los factores de suba y baja son…',
  correcta: 'u = e^(σ√Δt) y d = 1/u',
  incorrectas: ['u = e^(σ·Δt) y d = 1/u', 'u = 1 + σ y d = 1 − σ', 'u = e^(rΔt) y d = e^(−rΔt)'],
  explicacion: 'La volatilidad escala con la raíz del tiempo.',
  trampas: 'u = e^(σ·Δt) olvida la raíz cuadrada.' });

Q({ id: 'U6-T10', unidad: 6, tema: 'Delta', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U6',
  enunciado: 'En un paso del árbol binomial, el delta de la opción es…',
  correcta: '(C_u − C_d)/(S_u − S_d)',
  incorrectas: ['(C_u − C_d)/S₀', '(S_u − S_d)/(C_u − C_d)', '(C_u + C_d)/(S_u + S_d)'],
  explicacion: 'Es la variación de la opción por cada peso de variación del subyacente.' });

Q({ id: 'U6-T11', unidad: 6, tema: 'Delta', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U6',
  enunciado: 'El delta de un call europeo está siempre…',
  correcta: 'Entre 0 y 1.',
  incorrectas: ['Entre −1 y 0.', 'Exactamente en 0,5.', 'Por encima de 1.'],
  explicacion: 'El delta del put está entre −1 y 0.' });

Q({ id: 'U6-T12', unidad: 6, tema: 'Binomial', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U6',
  enunciado: 'Al valuar una opción AMERICANA con un árbol binomial, en cada nodo se toma…',
  correcta: 'El máximo entre el valor de ejercerla y el valor de mantenerla.',
  incorrectas: ['El mínimo entre el valor de ejercerla y el valor de mantenerla.', 'Solo el valor de mantenerla, porque el ejercicio se revisa al vencimiento.', 'El promedio entre el valor de ejercerla y el de mantenerla.'],
  explicacion: 'El tenedor elige lo que más le conviene en cada nodo.' });

Q({ id: 'U6-T13', unidad: 6, tema: 'Binomial', dificultad: 1, tipo: 'teórica', fuente: 'Presentación U6',
  enunciado: 'Para valuar una opción con un árbol binomial se empieza por…',
  correcta: 'Las condiciones terminales (los payoffs al vencimiento) y se avanza hacia atrás.',
  incorrectas: [
    'El nodo inicial (el precio de hoy) y se avanza hacia el vencimiento.',
    'El nodo central del árbol y se avanza hacia ambos extremos.',
    'El cálculo del delta en t = 0 y luego se completan los demás nodos.',
  ],
  explicacion: 'Es la "inducción hacia atrás".' });

Q({ id: 'U6-T14', unidad: 6, tema: 'Binomial', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U6',
  enunciado: 'Si se aumenta mucho la cantidad de pasos de un árbol binomial (con u = e^(σ√Δt)), el precio de una opción europea…',
  correcta: 'Converge al precio de Black-Scholes.',
  incorrectas: ['Diverge y no tiene límite.', 'Converge al valor intrínseco.', 'No cambia: es igual al de un paso.'],
  explicacion: 'Black-Scholes es el límite del modelo binomial.' });

Q({ id: 'U6-T15', unidad: 6, tema: 'Black-Scholes', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U6',
  enunciado: 'El modelo de Black-Scholes supone que el precio de la acción…',
  correcta: 'Sigue un movimiento browniano geométrico: retornos normales y precios lognormales.',
  incorrectas: [
    'Sigue una distribución normal: precios normales y retornos lognormales.',
    'Tiene una volatilidad estocástica que cambia a lo largo de la vida de la opción.',
    'Puede tener saltos discontinuos, como ante noticias inesperadas.',
  ],
  explicacion: 'ln(S_T/S₀) se distribuye normal; por lo tanto, S_T es lognormal.',
  trampas: '«Precios normales y retornos lognormales» invierte normal y lognormal.' });

Q({ id: 'U6-T16', unidad: 6, tema: 'Black-Scholes', dificultad: 1, tipo: 'teórica', fuente: 'Presentación U6',
  enunciado: 'La fórmula de Black-Scholes sirve para valuar…',
  correcta: 'Opciones europeas.',
  incorrectas: ['Opciones americanas.', 'Tanto europeas como americanas.', 'Solo puts.'],
  explicacion: 'No contempla el ejercicio anticipado.' });

Q({ id: 'U6-T17', unidad: 6, tema: 'Black-Scholes', dificultad: 1, tipo: 'teórica', fuente: 'Presentación U6',
  enunciado: '¿Cuál es el único parámetro de Black-Scholes que no se observa directamente en el mercado?',
  correcta: 'La volatilidad.',
  incorrectas: ['La tasa libre de riesgo.', 'El precio del subyacente.', 'El tiempo al vencimiento.'],
  explicacion: 'Se estima de forma histórica o se extrae de los precios (volatilidad implícita).' });

Q({ id: 'U6-T18', unidad: 6, tema: 'Volatilidad implícita', dificultad: 2, tipo: 'teórica', fuente: 'Guía U6, ej. 8',
  enunciado: 'La volatilidad implícita es…',
  correcta: 'La volatilidad que hace que el precio de Black-Scholes iguale al precio de mercado de la opción.',
  incorrectas: [
    'El desvío estándar histórico de los retornos del subyacente.',
    'La volatilidad que maximiza el precio de la opción.',
    'El promedio de las volatilidades de calls y puts con distinto strike.',
  ],
  explicacion: 'Es "forward looking" y se obtiene iterando, porque no se puede despejar de la fórmula.' });

Q({ id: 'U6-T19', unidad: 6, tema: 'Interpretación', dificultad: 3, tipo: 'teórica', fuente: 'Presentación U6',
  enunciado: 'En la fórmula de Black-Scholes, N(d₂) representa…',
  correcta: 'La probabilidad neutral al riesgo de que el call se ejerza.',
  incorrectas: ['La probabilidad real de que el call se ejerza.', 'El delta del call.', 'La probabilidad neutral al riesgo de que el put se ejerza.'],
  explicacion: 'Es la probabilidad (neutral al riesgo) de que S_T > K.',
  trampas: '«La probabilidad real…» cambia una sola palabra («real»). El delta es N(d₁).' });

Q({ id: 'U6-T20', unidad: 6, tema: 'Interpretación', dificultad: 3, tipo: 'teórica', fuente: 'Presentación U6',
  enunciado: 'En la fórmula de Black-Scholes, N(d₁) es…',
  correcta: 'El delta del call.',
  incorrectas: ['La probabilidad neutral al riesgo de ejercicio del call.', 'El delta del put.', 'La gamma del call.'],
  explicacion: 'N(d₁) = ∂c/∂S₀. El delta del put es N(d₁) − 1.' });

Q({ id: 'U6-T21', unidad: 6, tema: 'Interpretación', dificultad: 3, tipo: 'teórica', fuente: 'Presentación U6',
  enunciado: 'El término S₀·N(d₁) de la fórmula del call corresponde al valor de…',
  correcta: 'Un call "asset or nothing".',
  incorrectas: ['Un call "cash or nothing".', 'Un put "asset or nothing".', 'El valor intrínseco del call.'],
  explicacion: 'Entrega una acción si S_T > K y nada en caso contrario. K·e^(−rT)·N(d₂) es K veces un "cash or nothing".' });

Q({ id: 'U6-T22', unidad: 6, tema: 'Interpretación', dificultad: 3, tipo: 'teórica', fuente: 'Presentación U6',
  enunciado: 'Un call plain vanilla equivale a…',
  correcta: 'Una posición larga en un "asset or nothing" y K posiciones cortas en un "cash or nothing".',
  incorrectas: [
    'Una posición larga en un "cash or nothing" y K posiciones cortas en un "asset or nothing".',
    'Una posición larga en un "asset or nothing" y K posiciones largas en un "cash or nothing".',
    'Una posición corta en un "asset or nothing" y K posiciones largas en un "cash or nothing".',
  ],
  explicacion: 'c = S₀N(d₁) − K·e^(−rT)N(d₂): si se activa, se recibe la acción y se pagan K.' });

Q({ id: 'U6-T23', unidad: 6, tema: 'Black-Scholes', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U6',
  enunciado: 'Cuando falta muy poco para el vencimiento y S > K, en la fórmula del call…',
  correcta: 'N(d₁) y N(d₂) tienden a 1 y el call tiende a S − K.',
  incorrectas: ['N(d₁) y N(d₂) tienden a 0 y el call tiende a 0.', 'N(d₁) y N(d₂) tienden a 0,5.', 'N(d₁) tiende a 1, N(d₂) a 0 y el call tiende a S.'],
  explicacion: 'σ√(T − t) → 0, así que d₁ y d₂ → +∞: la fórmula converge al payoff.' });

Q({ id: 'U6-T24', unidad: 6, tema: 'Delta', dificultad: 2, tipo: 'teórica', fuente: 'Guía U6, ej. 9',
  enunciado: 'En Black-Scholes, el delta de un put europeo es…',
  correcta: 'N(d₁) − 1',
  incorrectas: ['N(d₁)', '1 − N(d₁)', '−N(d₂)'],
  explicacion: 'Siempre está entre −1 y 0.',
  trampas: '1 − N(d₁) tiene el signo cambiado.' });

Q({ id: 'U6-T25', unidad: 6, tema: 'Griegas', dificultad: 2, tipo: 'teórica', fuente: 'Guía U6, ej. 14',
  enunciado: 'La gamma de una opción mide…',
  correcta: 'Cuánto cambia el delta ante un cambio en el precio del subyacente.',
  incorrectas: [
    'Cuánto cambia el precio de la opción con el paso del tiempo.',
    'Cuánto cambia el precio de la opción ante un cambio en la volatilidad.',
    'Cuánto cambia el precio de la opción ante un cambio en la tasa de interés.',
  ],
  explicacion: 'Es la "aceleración" del precio de la opción. Las otras opciones describen theta, vega y rho.' });

Q({ id: 'U6-T26', unidad: 6, tema: 'Griegas', dificultad: 2, tipo: 'teórica', fuente: 'Guía U6 (Excel, hoja 14)',
  enunciado: 'Las posiciones COMPRADAS en calls y en puts tienen gamma…',
  correcta: 'Positiva.',
  incorrectas: ['Negativa.', 'Positiva en los calls y negativa en los puts.', 'Nula.'],
  explicacion: 'Long call y long put: gamma +. Las posiciones vendidas tienen gamma −.' });

Q({ id: 'U6-T27', unidad: 6, tema: 'Griegas', dificultad: 3, tipo: 'teórica', fuente: 'Guía U6, ej. 14',
  enunciado: 'Una posición tiene delta cero y una gamma grande y NEGATIVA. ¿Cuál es su riesgo?',
  correcta: 'Pierde ante un movimiento grande del subyacente en cualquier dirección.',
  incorrectas: ['Gana ante un movimiento grande del subyacente en cualquier dirección.', 'No tiene riesgo, porque el delta es cero.', 'Pierde solo si el subyacente sube.'],
  explicacion: 'Con gamma negativa, el delta se mueve en contra en cualquier dirección: la cobertura delta deja de servir.' });

Q({ id: 'U6-T28', unidad: 6, tema: 'Griegas', dificultad: 3, tipo: 'teórica', fuente: 'Guía U6, ej. 15',
  enunciado: 'La theta de una posición es −0,1 con el tiempo medido en años. Esto significa que…',
  correcta: 'Si nada más cambia, la posición pierde 0,1 de valor por cada año que pasa.',
  incorrectas: [
    'Si nada más cambia, la posición gana 0,1 de valor por cada año que pasa.',
    'La posición pierde un 10 % de su valor por día.',
    'La posición pierde 0,1 por cada punto de volatilidad.',
  ],
  explicacion: 'Para períodos más cortos se toma la proporción (por ejemplo, 0,1/365 por día).' });

Q({ id: 'U6-T29', unidad: 6, tema: 'Griegas', dificultad: 2, tipo: 'teórica', fuente: 'Guía U6, ej. 15',
  enunciado: 'Un operador cree que no cambiarán ni el precio de la acción ni su volatilidad implícita. ¿Qué posición le conviene?',
  correcta: 'Vender opciones (theta positiva).',
  incorrectas: ['Comprar opciones (theta negativa).', 'Comprar la acción.', 'Comprar un straddle.'],
  explicacion: 'Si nada se mueve, el paso del tiempo erosiona el valor de las opciones: le conviene estar vendido.' });

Q({ id: 'U6-T30', unidad: 6, tema: 'Griegas', dificultad: 3, tipo: 'teórica', fuente: 'Guía U6, ej. 16',
  enunciado: 'Una empresa cubre en delta una cartera de posiciones LARGAS en calls y puts sobre una divisa. ¿Qué escenario le resulta más favorable?',
  correcta: 'Grandes variaciones en el tipo de cambio.',
  incorrectas: ['Un tipo de cambio prácticamente constante.', 'Una suba gradual y sostenida del tipo de cambio.', 'Es indistinto: con cobertura delta el resultado no depende del tipo de cambio.'],
  explicacion: 'La cartera es long gamma: la volatilidad la beneficia.' });

Q({ id: 'U6-T31', unidad: 6, tema: 'Griegas', dificultad: 3, tipo: 'teórica', fuente: 'Guía U6, ej. 17',
  enunciado: '¿Un futuro y un forward sobre el mismo activo tienen el mismo delta?',
  correcta: 'No: el delta del futuro es e^(rT) veces el del forward.',
  incorrectas: ['Sí, ambos tienen delta igual a 1.', 'No: el delta del forward es e^(rT) veces el del futuro.', 'No: el delta del futuro es e^(−rT) veces el del forward.'],
  explicacion: 'El futuro liquida diariamente; el forward descuenta el payoff futuro a hoy.' });

Q({ id: 'U6-T32', unidad: 6, tema: 'Black-Scholes', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U6',
  enunciado: 'Si la acción paga un rendimiento por dividendos continuo δ, la fórmula de Black-Scholes se ajusta…',
  correcta: 'Reemplazando S por S·e^(−δT).',
  incorrectas: ['Reemplazando K por K·e^(−δT).', 'Reemplazando r por r + δ.', 'Reemplazando σ por σ − δ.'],
  explicacion: 'c = S·e^(−δT)·N(d₁) − K·e^(−rT)·N(d₂), con r − δ dentro de d₁ y d₂.' });

Q({ id: 'U6-T33', unidad: 6, tema: 'Black-Scholes', dificultad: 3, tipo: 'teórica', fuente: 'Presentación U6',
  enunciado: '¿Cuál de estas afirmaciones sobre el modelo de Black-Scholes es FALSA?',
  correcta: 'Permite valuar opciones americanas con ejercicio anticipado.',
  incorrectas: [
    'Supone volatilidad constante durante la vida de la opción.',
    'Supone una tasa libre de riesgo constante.',
    'Ignora los comportamientos extremos (saltos) en los precios.',
  ],
  explicacion: 'Las otras tres son limitaciones reales del modelo.' });

Q({ id: 'U6-T34', unidad: 6, tema: 'Delta', dificultad: 2, tipo: 'teórica', fuente: 'Guía U6, ej. 12',
  enunciado: 'Que el delta de un call sea 0,70 significa que…',
  correcta: 'Si la acción sube $1, el call sube aproximadamente $0,70.',
  incorrectas: ['Hay un 70 % de probabilidad real de que el call se ejerza.', 'Si la acción sube 1 %, el call sube 0,70 %.', 'Si la acción sube $0,70, el call sube $1.'],
  explicacion: 'El delta mide unidades monetarias de la opción por unidad monetaria del subyacente.' });

// ---------- Prácticas ----------
{
  // Guía U6, ej. 1
  const x = Opciones.replicanteUnPaso({ S0: 40, Su: 42, Sd: 38, K: 39, r: 0.08, T: 1 / 12, tipo: 'call' });
  Q({ id: 'U6-P01', unidad: 6, tema: 'Binomial', dificultad: 2, tipo: 'práctica', fuente: 'Guía U6, ej. 1',
    enunciado: 'Una acción vale 40 y en un mes valdrá 42 o 38. La tasa es 8 % anual continua. ¿Cuánto vale un call europeo a un mes con K = 39?',
    correcta: f(x.precio), incorrectas: [f(x.p * 3 * EXP(-0.08)), f(0.5 * 3 * EXP(-0.08 / 12)), f(3)],
    explicacion: `p = (e^(0,08/12) − 0,95)/(1,05 − 0,95) = ${f(x.p, 4)}. c = e^(−0,08/12)·p·3.`,
    trampas: `${f(x.p * 3 * EXP(-0.08))}: descontar un año en lugar de un mes. ${f(0.5 * 3 * EXP(-0.08 / 12))}: usar p = 0,5. 3,00: el payoff en el estado de suba.` });
}
{
  // Guía U6, ej. 3
  const x = Opciones.replicanteUnPaso({ S0: 50, Su: 55, Sd: 45, K: 50, r: 0.1, T: 0.5, tipo: 'put' });
  Q({ id: 'U6-P02', unidad: 6, tema: 'Binomial', dificultad: 2, tipo: 'práctica', fuente: 'Guía U6, ej. 3',
    enunciado: 'Una acción vale 50 y en seis meses valdrá 45 o 55. La tasa es 10 % anual continua. ¿Cuánto vale un put europeo a seis meses con K = 50?',
    correcta: f(x.precio), incorrectas: [f(x.p * 5 * EXP(-0.05)), f((1 - x.p) * 5), f(0.5 * 5 * EXP(-0.05))],
    explicacion: `p = ${f(x.p, 4)}. El put paga 5 solo si baja: e^(−0,05)·(1 − p)·5.`,
    trampas: `${f(x.p * 5 * EXP(-0.05))}: usar p en lugar de 1 − p. ${f((1 - x.p) * 5)}: no descontar. ${f(0.5 * 5 * EXP(-0.05))}: usar p = 0,5.` });
}
{
  // Guía U6, ej. 4
  const c = arbol2({ S: 100, u: 1.1, d: 0.9, K: 100, r: 0.08, dt: 0.5, tipo: 'call' });
  const unPaso = Opciones.replicanteUnPaso({ S0: 100, Su: 110, Sd: 90, K: 100, r: 0.08, T: 1, tipo: 'call' });
  Q({ id: 'U6-P03', unidad: 6, tema: 'Binomial', dificultad: 3, tipo: 'práctica', fuente: 'Guía U6, ej. 4',
    enunciado: 'Una acción vale 100 y en cada uno de los dos próximos semestres sube o baja 10 %. La tasa es 8 % anual continua. ¿Cuánto vale un call europeo a un año con K = 100?',
    correcta: f(c.v0), incorrectas: [f(c.vu), f(c.sinDescontar), f(unPaso.precio)],
    explicacion: `p = (e^(0,04) − 0,9)/0,2 = ${f(c.p, 4)}. Se recorre el árbol hacia atrás desde los payoffs 21, 0 y 0.`,
    trampas: `${f(c.vu)}: es el valor en el nodo de suba, no en t = 0. ${f(c.sinDescontar)}: no descontar. ${f(unPaso.precio)}: usar un solo paso anual de ±10 %.` });

  const p = arbol2({ S: 100, u: 1.1, d: 0.9, K: 100, r: 0.08, dt: 0.5, tipo: 'put' });
  Q({ id: 'U6-P04', unidad: 6, tema: 'Paridad', dificultad: 2, tipo: 'práctica', fuente: 'Guía U6, ej. 4',
    enunciado: `En el mismo árbol (S₀ = 100, ±10 % por semestre, r = 8 %), el call a un año con K = 100 vale ${f(c.v0)}. Usando la paridad put-call, ¿cuánto vale el put europeo?`,
    correcta: f(p.v0), incorrectas: [f(c.v0 - 100 + 100 * EXP(-0.08 * 0.5)), f(c.v0), f(c.v0 + 100 - 100 * EXP(-0.08))],
    explicacion: `p = c + K·e^(−rT) − S₀ = ${f(c.v0)} + 100·e^(−0,08) − 100 = ${f(p.v0)}.`,
    trampas: `${f(c.v0 - 100 + 100 * EXP(-0.04))}: descontar medio año en vez de uno. ${f(c.v0)}: creer que, por estar ATM, el put vale lo mismo que el call. ${f(c.v0 + 100 - 100 * EXP(-0.08))}: invertir los signos.` });
}
{
  // Guía U6, ej. 5
  const am = arbol2({ S: 50, u: 1.06, d: 0.95, K: 51, r: 0.05, dt: 0.5, tipo: 'put', americana: true });
  const eu = arbol2({ S: 50, u: 1.06, d: 0.95, K: 51, r: 0.05, dt: 0.5, tipo: 'put' });
  Q({ id: 'U6-P05', unidad: 6, tema: 'Americanas', dificultad: 3, tipo: 'práctica', fuente: 'Guía U6, ej. 5',
    enunciado: 'Una acción vale 50 y en cada uno de dos semestres sube 6 % o baja 5 %. La tasa es 5 % anual continua. ¿Cuánto vale un put AMERICANO con K = 51 al cabo de los dos semestres?',
    correcta: f(am.v0), incorrectas: [f(eu.v0), f(1), f(51 - 47.5)],
    explicacion: 'En el nodo de baja (S = 47,50) conviene ejercer: 3,50 > valor de mantener. Eso eleva el valor en t = 0.',
    trampas: `${f(eu.v0)}: es el put europeo. 1,00: el valor intrínseco hoy. 3,50: el valor de ejercer en el nodo de baja.` });
}
{
  // Guía U6, ej. 6
  const p = (EXP(0.1 * 2 / 12) - 0.92) / (1.08 - 0.92);
  const v = EXP(-0.1 * 2 / 12) * (p * 729 + (1 - p) * 529);
  Q({ id: 'U6-P06', unidad: 6, tema: 'Binomial', dificultad: 3, tipo: 'práctica', fuente: 'Guía U6, ej. 6',
    enunciado: 'Una acción vale 25 y en dos meses valdrá 23 o 27. La tasa es 10 % anual continua. ¿Cuánto vale un derivado que paga S_T² en dos meses?',
    correcta: f(v), incorrectas: [f(625), f(p * 729 + (1 - p) * 529), f(EXP(-0.1 * 2 / 12) * 629)],
    explicacion: `p = ${f(p, 4)}. Valor = e^(−0,1·2/12)·(p·729 + (1 − p)·529).`,
    trampas: `625,00: S₀². ${f(p * 729 + (1 - p) * 529)}: no descontar. ${f(EXP(-0.1 * 2 / 12) * 629)}: usar p = 0,5.` });
}
{
  // Guía U6, ej. 7
  const am = arbol2({ S: 40, u: 1.1, d: 0.9, K: 42, r: 0.12, dt: 0.25, tipo: 'put', americana: true });
  const eu = arbol2({ S: 40, u: 1.1, d: 0.9, K: 42, r: 0.12, dt: 0.25, tipo: 'put' });
  Q({ id: 'U6-P07', unidad: 6, tema: 'Americanas', dificultad: 3, tipo: 'práctica', fuente: 'Guía U6, ej. 7',
    enunciado: 'Una acción vale 40 y en cada uno de dos trimestres sube o baja 10 %. La tasa es 12 % anual continua. ¿Cuánto vale un put AMERICANO a seis meses con K = 42?',
    correcta: f(am.v0), incorrectas: [f(eu.v0), f(2), f(am.vd)],
    explicacion: 'En el nodo de baja (S = 36) conviene ejercer: 42 − 36 = 6 supera al valor de mantener.',
    trampas: `${f(eu.v0)}: es el put europeo. 2,00: el valor intrínseco hoy. 6,00: el valor en el nodo de baja.` });
}
Q({ id: 'U6-P08', unidad: 6, tema: 'Neutral al riesgo', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo · Presentación U6',
  enunciado: 'En un árbol de un paso de un año, u = 1,20 y d = 0,85. La tasa es 5 % anual continua. ¿Cuál es la probabilidad neutral al riesgo de suba?',
  correcta: f((EXP(0.05) - 0.85) / 0.35, 4),
  incorrectas: [f(1 - (EXP(0.05) - 0.85) / 0.35, 4), f((1 - 0.85) / 0.35, 4), f(0.5, 4)],
  explicacion: 'p = (e^(0,05) − 0,85)/(1,20 − 0,85).',
  trampas: '0,4249 es 1 − p. 0,4286 ignora la tasa (r = 0). 0,5000 supone p = 0,5.' });
{
  const x = Opciones.replicanteUnPaso({ S0: 60, Su: 72, Sd: 50, K: 60, r: 0.06, T: 0.5, tipo: 'call' });
  Q({ id: 'U6-P09', unidad: 6, tema: 'Replicación', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo · Presentación U6',
    enunciado: 'Una acción vale 60 y en seis meses valdrá 72 o 50. ¿Cuántas acciones (Δ) tiene el portafolio que replica un call con K = 60?',
    correcta: f(x.delta, 4), incorrectas: [f(12 / 60, 4), f(22 / 12, 4), f(0.5, 4)],
    explicacion: 'Δ = (C_u − C_d)/(S_u − S_d) = (12 − 0)/(72 − 50).',
    trampas: '0,2000: dividir por S₀. 1,8333: invertir el cociente. 0,5000: suponer que un call ATM tiene Δ = 0,5.' });

  Q({ id: 'U6-P10', unidad: 6, tema: 'Replicación', dificultad: 3, tipo: 'práctica', fuente: 'Nuevo · Presentación U6',
    enunciado: 'Con los mismos datos (S₀ = 60; 72 o 50 en seis meses; K = 60) y r = 6 % anual continua, ¿cuánto vale el call?',
    correcta: f(x.precio), incorrectas: [f(x.p * 12), f(0.5 * 12 * EXP(-0.03)), f(x.delta * 60)],
    explicacion: `Δ = ${f(x.delta, 4)}; B = −Δ·50·e^(−0,03) = ${f(x.B, 4)}. c = Δ·60 + B.`,
    trampas: `${f(x.p * 12)}: no descontar. ${f(0.5 * 12 * EXP(-0.03))}: usar p = 0,5. ${f(x.delta * 60)}: olvidar la deuda B.` });
}
Q({ id: 'U6-P11', unidad: 6, tema: 'Binomial', dificultad: 2, tipo: 'práctica', fuente: 'Presentación U6',
  enunciado: 'Con σ = 30 % anual y pasos de Δt = 0,5 años, ¿cuál es el factor de suba u de Cox-Ross-Rubinstein?',
  correcta: f(EXP(0.3 * Math.sqrt(0.5)), 4),
  incorrectas: [f(EXP(0.3 * 0.5), 4), f(1.3, 4), f(1 + 0.3 * Math.sqrt(0.5), 4)],
  explicacion: 'u = e^(σ√Δt) = e^(0,3·√0,5).',
  trampas: '1,1618: olvidar la raíz. 1,3000: usar 1 + σ. 1,2121: usar 1 + σ√Δt sin exponencial.' });
{
  // Guía U6, ej. 11
  const b = bs(52, 50, 0.12, 0.3, 0.25);
  Q({ id: 'U6-P12', unidad: 6, tema: 'Black-Scholes', dificultad: 3, tipo: 'práctica', fuente: 'Guía U6, ej. 11',
    enunciado: '¿Cuánto vale un call europeo sobre una acción sin dividendos con S = 52, K = 50, r = 12 %, σ = 30 % y T = 3 meses?',
    correcta: f(b.call), incorrectas: [f(52 * b.Nd1 - 50 * b.Nd2), f(b.put), f(2)],
    explicacion: `d₁ = ${f(b.d1, 4)}, d₂ = ${f(b.d2, 4)}. c = 52·N(d₁) − 50·e^(−0,03)·N(d₂).`,
    trampas: `${f(52 * b.Nd1 - 50 * b.Nd2)}: no descontar K. ${f(b.put)}: es el put. 2,00: el valor intrínseco.` });
}
{
  // Guía U6, ej. 9
  const b = bs(50, 50, 0.1, 0.3, 0.25);
  Q({ id: 'U6-P13', unidad: 6, tema: 'Black-Scholes', dificultad: 3, tipo: 'práctica', fuente: 'Guía U6, ej. 9',
    enunciado: '¿Cuánto vale un put europeo a 3 meses sobre una acción sin dividendos con S = K = 50, r = 10 % y σ = 30 %?',
    correcta: f(b.put), incorrectas: [f(b.call), f(50 * (1 - b.Nd2) - 50 * (1 - b.Nd1)), f(0)],
    explicacion: `p = 50·e^(−0,025)·N(−d₂) − 50·N(−d₁), con d₁ = ${f(b.d1, 4)} y d₂ = ${f(b.d2, 4)}.`,
    trampas: `${f(b.call)}: es el call. ${f(50 * (1 - b.Nd2) - 50 * (1 - b.Nd1))}: no descontar K. 0,00: el valor intrínseco (está ATM).` });
}
{
  // Guía U6, ej. 13
  const b = bs(1, 1, 0.1, 0.25, 0.5);
  Q({ id: 'U6-P14', unidad: 6, tema: 'Delta', dificultad: 2, tipo: 'práctica', fuente: 'Guía U6, ej. 13',
    enunciado: '¿Cuál es el delta de un call europeo at the money a seis meses, sobre una acción sin dividendos, con r = 10 % y σ = 25 %?',
    correcta: f(b.Nd1, 4), incorrectas: [f(0.5, 4), f(b.Nd2, 4), f(1 - b.Nd1, 4)],
    explicacion: `Δ = N(d₁), con d₁ = (0 + (0,10 + 0,25²/2)·0,5)/(0,25·√0,5) = ${f(b.d1, 4)}.`,
    trampas: '0,5000: suponer que ATM implica Δ = 0,5. 0,5771 es N(d₂). 0,3552 es N(−d₁) (el delta del put en valor absoluto).' });
}
{
  // Guía U6, ej. 10 (probabilidad real: se usa μ en lugar de r)
  const b = bs(38, 40, 0.16, 0.35, 0.5);
  Q({ id: 'U6-P15', unidad: 6, tema: 'Interpretación', dificultad: 3, tipo: 'práctica', fuente: 'Guía U6, ej. 10',
    enunciado: 'Una acción vale 38, tiene un rendimiento esperado de 16 % y una volatilidad de 35 %. ¿Cuál es la probabilidad de que se ejerza un call europeo con K = 40 a seis meses?',
    correcta: pct(b.Nd2), incorrectas: [pct(b.Nd1), pct(1 - b.Nd2), pct(1 - b.Nd1)],
    explicacion: `Es N(d₂) calculado con μ = 16 % en lugar de r: d₂ = ${f(b.d2, 4)}.`,
    trampas: '59,47 % es N(d₁) calculado con μ. 50,31 % es la probabilidad de ejercicio del put. 40,53 % es N(−d₁).' });
}
{
  const vi = Opciones.volatilidadImplicita({ precio: 6, tipo: 'call', S: 50, K: 50, r: 0.05, T: 0.5 });
  Q({ id: 'U6-P16', unidad: 6, tema: 'Volatilidad implícita', dificultad: 3, tipo: 'práctica', fuente: 'Nuevo · Presentación U6',
    enunciado: 'Un call europeo at the money a seis meses (S = K = 50, r = 5 %) cotiza a 6. ¿Cuál es su volatilidad implícita?',
    correcta: pct(vi), incorrectas: [pct(0.3), pct(0.45), pct(0.25)],
    explicacion: `Se itera σ hasta que Black-Scholes dé 6: σ ≈ ${pct(vi)}. Por ejemplo, con σ = 30 % el call vale ${f(bs(50, 50, 0.05, 0.3, 0.5).call)} (poco) y con 45 % vale ${f(bs(50, 50, 0.05, 0.45, 0.5).call)} (demasiado).` });
}
{
  const am = Opciones.binomial({ S: 80, K: 82, r: 0.04, sigma: 0.3, T: 1, n: 2, tipo: 'put', americana: true, guardarArbol: true });
  const eu = Opciones.binomial({ S: 80, K: 82, r: 0.04, sigma: 0.3, T: 1, n: 2, tipo: 'put' });
  Q({ id: 'U6-P17', unidad: 6, tema: 'Americanas', dificultad: 3, tipo: 'práctica', fuente: 'Nuevo · Presentación U6',
    enunciado: 'S₀ = 80, K = 82, σ = 30 %, r = 4 % continua, T = 1 año. Con un árbol de Cox-Ross-Rubinstein de dos pasos, ¿cuánto vale un put AMERICANO?',
    correcta: f(am.precio), incorrectas: [f(eu.precio), f(2), f(am.arbol[1][0].V)],
    explicacion: `u = ${f(am.u, 4)}, d = ${f(am.d, 4)}, p = ${f(am.p, 4)}. En el nodo de baja (S = ${f(am.arbol[1][0].S)}) conviene ejercer.`,
    trampas: `${f(eu.precio)}: es el put europeo. 2,00: el valor intrínseco hoy. ${f(am.arbol[1][0].V)}: el valor en el nodo de baja.` });
}
Q({ id: 'U6-P18', unidad: 6, tema: 'Griegas', dificultad: 3, tipo: 'práctica', fuente: 'Guía U6, ej. 18',
  enunciado: 'Una posición en opciones sobre el euro tiene delta 30.000 y gamma −80.000, con el tipo de cambio en 0,90 USD/EUR. Si el tipo de cambio sube a 0,93, ¿cuál es el nuevo delta?',
  correcta: '27.600', incorrectas: ['32.400', '30.000', '2.400'],
  explicacion: 'Nuevo delta ≈ 30.000 + (−80.000)·(0,93 − 0,90) = 30.000 − 2.400.',
  trampas: '32.400: ignorar el signo negativo de gamma. 30.000: creer que el delta no cambia. 2.400: es solo el cambio, no el nuevo delta.' });

Q({ id: 'U6-P19', unidad: 6, tema: 'Delta', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo · Guía U6, ej. 12',
  enunciado: 'Estás comprado en 1.000 puts con delta −0,35 cada uno. ¿Qué tenés que hacer para quedar delta neutral?',
  correcta: 'Comprar 350 acciones.', incorrectas: ['Vender 350 acciones.', 'Comprar 650 acciones.', 'Vender 650 acciones.'],
  explicacion: 'Delta de la cartera = 1.000 × (−0,35) = −350. Hay que sumar +350: comprar 350 acciones.',
  trampas: 'Vender 350 duplica el riesgo. 650 usa 1 − 0,35.' });
{
  const b = bs(50, 50, 0.05, 0.3, 1);
  Q({ id: 'U6-P20', unidad: 6, tema: 'Black-Scholes', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo · Presentación U6',
    enunciado: 'S = K = 50, r = 5 %, σ = 30 %, T = 1 año. ¿Cuánto vale d₁?',
    correcta: f(b.d1, 4), incorrectas: [f(b.d2, 4), f(0.05 / 0.3, 4), f((0.05 + 0.09) / 0.3, 4)],
    explicacion: 'd₁ = (ln(S/K) + (r + σ²/2)·T)/(σ√T) = (0 + 0,05 + 0,045)/0,30.',
    trampas: '0,0167 es d₂. 0,1667: olvidar σ²/2. 0,4667: usar σ² en lugar de σ²/2.' });

  const vpK = 50 * EXP(-0.05);
  Q({ id: 'U6-P21', unidad: 6, tema: 'Paridad', dificultad: 3, tipo: 'práctica', fuente: 'Nuevo · Presentación U6',
    enunciado: `Con S = K = 50, r = 5 %, σ = 30 % y T = 1, el call europeo vale ${f(b.call)}. ¿Cuánto vale el put europeo?`,
    correcta: f(b.put), incorrectas: [f(b.call), f(b.call + 50 - vpK), f(50 - vpK)],
    explicacion: `p = c + K·e^(−rT) − S = ${f(b.call)} + ${f(vpK)} − 50.`,
    trampas: `${f(b.call)}: creer que ATM implica p = c. ${f(b.call + 50 - vpK)}: invertir los signos. ${f(50 - vpK)}: es S − K·e^(−rT), no el put.` });
}
