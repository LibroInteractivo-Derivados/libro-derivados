// Banco de preguntas · Unidad III · Valuación de forwards y futuros (usa los helpers de preguntas-base.js)

// ---------- Teóricas ----------
Q({ id: 'U3-T01', unidad: 3, tema: 'Tasas', dificultad: 1, tipo: 'teórica', fuente: 'Presentación U3',
  enunciado: 'Salvo indicación en contrario, en la materia se usan…',
  correcta: 'Tasas anuales con composición continua y la convención 30/360.',
  incorrectas: ['Tasas efectivas anuales y la convención actual/365.', 'TNA con capitalización mensual y actual/360.', 'Tasas simples y actual/actual.'],
  explicacion: 'Es la convención que fija la cátedra para todos los ejercicios.' });
Q({ id: 'U3-T02', unidad: 3, tema: 'Tasas', dificultad: 1, tipo: 'teórica', fuente: 'Hull cap. 4',
  enunciado: 'Una tasa cero (spot) a T años es…',
  correcta: 'La tasa de una inversión que empieza hoy y paga todo junto en T, sin flujos intermedios.',
  incorrectas: ['La tasa de un bono con cupones que cotiza a la par, es decir, su tasa de cupón.', 'La tasa implícita entre dos plazos futuros, que surge de las tasas de hoy.', 'La tasa que paga un bono cuyo precio es cero al momento de la emisión.'],
  explicacion: 'Es la tasa de un bono cupón cero. La de un bono con cupones a la par es el par yield.' });
Q({ id: 'U3-T03', unidad: 3, tema: 'Tasas', dificultad: 2, tipo: 'teórica', fuente: 'Hull cap. 4',
  enunciado: 'Si la curva de tasas cero es creciente, las tasas forward…',
  correcta: 'Están por encima de las tasas cero.',
  incorrectas: ['Están por debajo de las tasas cero.', 'Son iguales a las tasas cero.', 'Son el promedio de las tasas cero.'],
  explicacion: 'R_F = R₂ + (R₂ − R₁)·T₁/(T₂ − T₁): si R₂ > R₁, la forward supera a R₂.' });
Q({ id: 'U3-T04', unidad: 3, tema: 'FRA', dificultad: 1, tipo: 'teórica', fuente: 'Presentación U3',
  enunciado: 'La posición larga en un FRA (según la cátedra)…',
  correcta: 'Paga la tasa fija y recibe la variable: protege a quien va a tomar prestado.',
  incorrectas: ['Recibe la tasa fija y paga la variable: protege a quien va a prestar.', 'Paga y recibe tasa fija.', 'Intercambia el nocional al vencimiento.'],
  explicacion: 'El largo (borrower) fija su costo de endeudamiento: cobra si la tasa termina por encima de la pactada.' });
Q({ id: 'U3-T05', unidad: 3, tema: 'FRA', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U3',
  enunciado: 'Un FRA F₆ₓ₉ es un contrato…',
  correcta: 'Sobre una tasa de 3 meses que empieza dentro de 6 meses.',
  incorrectas: ['Sobre una tasa de 9 meses que empieza dentro de 6 meses.', 'Sobre una tasa de 6 meses que empieza dentro de 9 meses.', 'Que vence en 15 meses.'],
  explicacion: 'Fₘₓₙ: el período de interés va del mes m al mes n.' });
Q({ id: 'U3-T06', unidad: 3, tema: 'Precio forward', dificultad: 1, tipo: 'teórica', fuente: 'Hull cap. 5',
  enunciado: 'Si F₀ > S₀·e^(rT) para un activo de inversión sin ingresos, el arbitraje consiste en…',
  correcta: 'Pedir prestado, comprar el activo y vender el forward (cash-and-carry).',
  incorrectas: ['Vender en corto el activo, invertir y comprar el forward.', 'Comprar el forward y el activo.', 'No hay arbitraje: el forward puede valer cualquier cosa.'],
  explicacion: 'El forward está caro: se vende y se cubre comprando el activo financiado.' });
Q({ id: 'U3-T07', unidad: 3, tema: 'Precio forward', dificultad: 2, tipo: 'teórica', fuente: 'Hull cap. 5',
  enunciado: 'Los dividendos conocidos que paga una acción durante la vida de un forward…',
  correcta: 'Reducen el precio forward: F₀ = (S₀ − I)e^(rT).',
  incorrectas: ['Aumentan el precio forward.', 'No afectan el precio forward.', 'Se suman al precio forward a su valor nominal.'],
  explicacion: 'Quien tiene la acción cobra los dividendos; el largo en el forward no.' });
Q({ id: 'U3-T08', unidad: 3, tema: 'Valor del forward', dificultad: 1, tipo: 'teórica', fuente: 'Presentación U3',
  enunciado: 'Al momento de pactarse, un forward vale…',
  correcta: 'Cero, porque K se fija igual al precio forward de ese momento.',
  incorrectas: ['K·e^(−rT), el valor presente del precio de entrega pactado.', 'S₀ − K, la diferencia entre el precio contado y el pactado.', 'El precio forward, porque es lo que se paga para entrar.'],
  explicacion: 'f = (F₀ − K)e^(−rT) y al inicio F₀ = K. No confundir el precio forward (F) con el valor del contrato (f).' });
Q({ id: 'U3-T09', unidad: 3, tema: 'Monedas', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U3',
  enunciado: 'Si la tasa local es mayor que la extranjera, el forward de la moneda extranjera…',
  correcta: 'Cotiza por encima del contado.',
  incorrectas: ['Cotiza por debajo del contado.', 'Es igual al contado.', 'Depende de la expectativa de devaluación del mercado.'],
  explicacion: 'F₀ = S₀e^((r − r_f)T): con r > r_f, F₀ > S₀. Lo exige el no arbitraje, no las expectativas.' });
Q({ id: 'U3-T10', unidad: 3, tema: 'Commodities', dificultad: 2, tipo: 'teórica', fuente: 'Hull cap. 5 · presentación U3',
  enunciado: 'Para un commodity de consumo solo puede asegurarse que F₀ ≤ (S₀ + U)e^(rT) porque…',
  correcta: 'Quienes tienen el bien para producir no lo venden para comprar futuros aunque estén baratos.',
  incorrectas: ['No se puede comprar el bien al contado para armar el arbitraje inverso.', 'Los costos de almacenamiento del bien son desconocidos de antemano.', 'Los futuros de commodities no tienen ajuste diario, a diferencia de los financieros.'],
  explicacion: 'El reverse cash-and-carry no funciona: tener el bien físico tiene un beneficio, el rendimiento de conveniencia.' });
Q({ id: 'U3-T11', unidad: 3, tema: 'Precio forward', dificultad: 2, tipo: 'teórica', fuente: 'Hull cap. 5',
  enunciado: 'Con tasas de interés conocidas (determinísticas), el precio de un futuro y el de un forward con el mismo vencimiento…',
  correcta: 'Son iguales.',
  incorrectas: ['El futuro siempre es mayor.', 'El forward siempre es mayor.', 'No se pueden comparar.'],
  explicacion: 'Las diferencias aparecen cuando las tasas son aleatorias y están correlacionadas con el activo.' });
Q({ id: 'U3-T12', unidad: 3, tema: 'Bonos', dificultad: 2, tipo: 'teórica', fuente: 'Hull cap. 4',
  enunciado: 'La aproximación del cambio de precio de un bono con la duración, ante una suba grande de la tasa,…',
  correcta: 'Sobrestima la caída del precio, porque la relación precio-tasa es convexa.',
  incorrectas: ['Subestima la caída del precio, porque la relación precio-tasa es cóncava.', 'Es exacta para cualquier cambio de tasa, porque la duración es una derivada.', 'No sirve para bonos con cupones, solo para bonos cupón cero.'],
  explicacion: 'La tangente queda por debajo de la curva convexa; la convexidad corrige el error.' });
Q({ id: 'U3-T13', unidad: 3, tema: 'Futuros de tasas', dificultad: 2, tipo: 'teórica', fuente: 'Hull cap. 6',
  enunciado: 'En la cobertura basada en duración, la cantidad de contratos es…',
  correcta: 'N* = P·D_P / (V_F·D_F)',
  incorrectas: ['N* = P / V_F', 'N* = P·D_F / (V_F·D_P)', 'N* = D_P / D_F'],
  explicacion: 'Se igualan las sensibilidades a la tasa de la cartera y de la posición en futuros.' });

// ---------- Prácticas ----------
Q({ id: 'U3-P01', unidad: 3, tema: 'Tasas', dificultad: 1, tipo: 'práctica', fuente: 'Presentación U3',
  enunciado: '¿Qué tasa efectiva a 90 días equivale a una TNA₃₀ del 32 % (año de 360 días)?',
  correcta: pct(Math.pow(1 + 0.32 / 12, 3) - 1), incorrectas: [pct(0.08), pct(Math.pow(1 + 0.32 / 12, 12) - 1), pct(0.32 / 12)],
  explicacion: '(1 + 0,32·30/360)³ − 1.', trampas: '8,00 % es proporcional, sin capitalizar; 37,14 % es la TEA; 2,67 % es la tasa de 30 días.' });
Q({ id: 'U3-P02', unidad: 3, tema: 'Tasas', dificultad: 1, tipo: 'práctica', fuente: 'Hull cap. 4',
  enunciado: '¿Qué tasa continua equivale a 10 % anual con capitalización semestral?',
  correcta: pct(2 * Math.log(1.05), 3), incorrectas: [pct(Math.log(1.1), 3), pct(0.1025, 3), pct(0.1, 3)],
  explicacion: 'R_c = m·ln(1 + R_m/m) = 2·ln(1,05).', trampas: 'ln(1,1) usa composición anual; 10,25 % es la efectiva anual.' });
Q({ id: 'U3-P03', unidad: 3, tema: 'Precio forward', dificultad: 1, tipo: 'práctica', fuente: 'Presentación U3',
  enunciado: 'Un activo sin ingresos vale 40; r = 5 % continua. Si el forward a 3 meses cotiza a 43, la ganancia del arbitraje en T es aproximadamente:',
  correcta: '2,50 (cash-and-carry)', incorrectas: ['3,00 (cash-and-carry)', '2,50 (reverse cash-and-carry)', '0,50'],
  explicacion: 'Teórico 40e^(0,0125) = 40,50. Forward caro: se vende a 43 y se compra el activo financiado: 43 − 40,50 = 2,50.' });
{
  const F = (900 - 40 * EXP(-0.01)) * EXP(0.03);
  Q({ id: 'U3-P04', unidad: 3, tema: 'Precio forward', dificultad: 2, tipo: 'práctica', fuente: 'Presentación U3',
    enunciado: 'Bono a 900 con cupón de 40 en 4 meses; r₄ = 3 %, r₉ = 4 %. ¿Precio forward a 9 meses?',
    correcta: f(F), incorrectas: [f(900 * EXP(0.03)), f(860 * EXP(0.03)), f((900 - 40 * EXP(-0.04 * 0.75)) * EXP(0.03))],
    explicacion: 'F₀ = (900 − 40e^(−0,03·4/12))·e^(0,04·0,75).', trampas: '927,41 ignora el cupón; 886,19 lo resta sin descontar; 887,41 lo descuenta con la tasa y el plazo equivocados.' });
}
Q({ id: 'U3-P05', unidad: 3, tema: 'Monedas', dificultad: 2, tipo: 'práctica', fuente: 'Presentación U3',
  enunciado: 'AUDUSD = 0,98; r_USD = 1 %, r_AUD = 3 % (continuas). ¿Forward a 2 años?',
  correcta: f(0.98 * EXP(-0.04), 4), incorrectas: [f(0.98 * EXP(0.04), 4), f(0.98 * EXP(-0.02), 4), '0,9800'],
  explicacion: 'F = S·e^((r_USD − r_AUD)T): el AUD rinde más, cotiza con descuento a plazo.', trampas: '1,0200 invierte las tasas; 0,9606 usa 1 año; 0,9800 ignora la diferencia de tasas.' });
Q({ id: 'U3-P06', unidad: 3, tema: 'Valor del forward', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'Forward largo pactado a 40,50; faltan 2 meses; S = 42; r = 5 %. ¿Cuánto vale?',
  correcta: f(42 - 40.5 * EXP(-0.05 / 6)), incorrectas: ['1,50', f(-(42 - 40.5 * EXP(-0.05 / 6))), f(42 - 40.5 * EXP(-0.05 * 2))],
  explicacion: 'f = S − K·e^(−rT).', trampas: `1,50 no descuenta K; ${f(-(42 - 40.5 * EXP(-0.05 / 6)))} es el valor para el corto; ${f(42 - 40.5 * EXP(-0.05 * 2))} usa T = 2 años en lugar de 2 meses.` });
Q({ id: 'U3-P07', unidad: 3, tema: 'FRA', dificultad: 2, tipo: 'práctica', fuente: 'Presentación U3',
  enunciado: 'FRA sobre 100 millones al 4 % por 3 meses; la tasa resulta 4,5 %. ¿Cuánto recibe el largo si se liquida al inicio del período?',
  correcta: '123.609', incorrectas: ['125.000', '−123.609', '123.762'],
  explicacion: '100.000.000 × 0,005 × 0,25 = 125.000 al final, descontado: 125.000/(1 + 0,045 × 0,25).', trampas: '125.000 no descuenta; 123.762 descuenta con la tasa pactada.' });
Q({ id: 'U3-P08', unidad: 3, tema: 'Tasas', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'Tasas cero continuas: 3 % a 1 año y 4 % a 2 años. ¿Forward continua para el segundo año?',
  correcta: '5,00 %', incorrectas: ['3,50 %', '4,00 %', '1,00 %'],
  explicacion: '(0,04 × 2 − 0,03 × 1)/1 = 5 %.', trampas: '3,5 % promedia.' });
Q({ id: 'U3-P09', unidad: 3, tema: 'Commodities', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'Petróleo: S₀ = 70, F₀ a 1 año = 68, r = 5 %, u = 2 %. ¿Rendimiento de conveniencia?',
  correcta: pct(0.07 - Math.log(68 / 70)), incorrectas: [pct(0.07), pct(0.07 + Math.log(68 / 70)), pct(Math.log(70 / 68))],
  explicacion: 'y = r + u − ln(F₀/S₀)/T.' });
Q({ id: 'U3-P10', unidad: 3, tema: 'Futuros de tasas', dificultad: 3, tipo: 'práctica', fuente: 'Basado en Hull',
  enunciado: 'Cartera de 10.000.000 con duración 6,8; contrato de 93.062,50 con duración 9,2. ¿Contratos a vender?',
  correcta: f((10e6 * 6.8) / (93062.5 * 9.2), 1), incorrectas: [f(10e6 / 93062.5, 1), f((10e6 * 9.2) / (93062.5 * 6.8), 1), f(6.8 / 9.2, 2)],
  explicacion: 'N* = P·D_P/(V_F·D_F).', trampas: '107,5 ignora las duraciones; 145,4 las invierte; 0,74 es solo el cociente de duraciones.' });

// ---------- Preguntas agregadas (revisión de octubre de 2026) ----------
Q({ id: 'U3-T14', unidad: 3, tema: 'Tasas', dificultad: 1, tipo: 'teórica', fuente: 'Nuevo',
  enunciado: 'Un 12 % anual con capitalización mensual, comparado con un 12 % anual continuo,…',
  correcta: 'Rinde menos, porque la capitalización continua es la más frecuente posible.',
  incorrectas: ['Rinde más, porque se capitaliza doce veces por año en lugar de una.', 'Rinde lo mismo: los dos son del 12 % anual y solo cambia cómo se expresa.', 'No se pueden comparar, porque usan convenciones de capitalización distintas.'],
  explicacion: 'El 12 % mensual equivale a 12 × ln(1,01) = 11,94 % continuo: rinde menos.',
  trampas: 'Dos tasas con el mismo número y distinta capitalización no son equivalentes.' });
Q({ id: 'U3-T15', unidad: 3, tema: 'Tasas', dificultad: 1, tipo: 'teórica', fuente: 'Nuevo',
  enunciado: 'Un pase (repo), como la caución bursátil, es…',
  correcta: 'Una venta de títulos con el compromiso de recomprarlos más adelante a un precio mayor: un préstamo con garantía.',
  incorrectas: ['Un préstamo sin garantía entre bancos, a plazo muy corto, a la tasa interbancaria.', 'Un swap de tasa fija por variable entre dos entidades, sin intercambio de títulos.', 'La compra de un bono a tasa variable con el compromiso de mantenerlo hasta el vencimiento.'],
  explicacion: 'La diferencia entre el precio de recompra y el de venta es el interés. Como hay títulos en garantía, el riesgo de crédito es bajo.',
  trampas: 'El préstamo sin garantía entre bancos es el interbancario (la vieja LIBOR).' });
Q({ id: 'U3-T16', unidad: 3, tema: 'Precio forward', dificultad: 2, tipo: 'teórica', fuente: 'Nuevo',
  enunciado: '¿Por qué el precio forward de una acción no es un pronóstico de su precio futuro?',
  correcta: 'Porque sale de un argumento de arbitraje (comprar hoy y financiarse a r), no de lo que el mercado espera.',
  incorrectas: ['Porque los forwards no se negocian en bolsa y su precio no es público ni transparente.', 'Porque incluye una prima por riesgo que agrega el mercado sobre el precio esperado.', 'Sí lo es: el precio forward es el valor esperado del precio de la acción al vencimiento.'],
  explicacion: 'F₀ = S₀e^(rT) no depende del rendimiento esperado de la acción: depende solo de S₀, r y T.',
  trampas: 'Si fuera el valor esperado, dependería del rendimiento esperado μ, que no aparece en la fórmula.' });
Q({ id: 'U3-T17', unidad: 3, tema: 'Precio forward', dificultad: 2, tipo: 'teórica', fuente: 'Nuevo',
  enunciado: 'El futuro sobre un índice cuyo rendimiento por dividendos q es mayor que la tasa r…',
  correcta: 'Cotiza por debajo del índice.',
  incorrectas: ['Cotiza por encima del índice.', 'Cotiza igual que el índice.', 'No puede existir: habría arbitraje.'],
  explicacion: 'F₀ = S₀e^((r − q)T): con q > r el exponente es negativo.',
  trampas: 'No hay arbitraje: quien tiene el índice cobra q, que es más de lo que cuesta financiarlo.' });
Q({ id: 'U3-T18', unidad: 3, tema: 'FRA', dificultad: 2, tipo: 'teórica', fuente: 'Basado en Hull, cap. 4',
  enunciado: 'Un FRA se valúa suponiendo que…',
  correcta: 'La tasa variable será igual a la tasa forward de hoy, y descontando el flujo con la tasa libre de riesgo.',
  incorrectas: ['La tasa variable será igual a la tasa de hoy para ese plazo, sin calcular la forward.', 'La tasa variable será igual a la tasa fija del FRA, por lo que su valor es siempre cero.', 'No tiene valor hasta que se fija la tasa variable, porque antes no hay flujos conocidos.'],
  explicacion: 'Un FRA a la tasa forward vale cero; uno pactado a otra tasa vale la diferencia de intereses, calculada con la forward, descontada.',
  trampas: 'Si se supusiera igual a la tasa fija, todo FRA valdría cero.' });
Q({ id: 'U3-T19', unidad: 3, tema: 'Bonos', dificultad: 1, tipo: 'teórica', fuente: 'Nuevo',
  enunciado: 'La duración de un bono cupón cero es…',
  correcta: 'Igual a su plazo.',
  incorrectas: ['Menor que su plazo.', 'Cero, porque no paga cupones.', 'La mitad de su plazo.'],
  explicacion: 'La duración es el promedio de los plazos de los flujos ponderado por su valor presente. Un cupón cero tiene un solo flujo, al vencimiento.',
  trampas: 'Los bonos con cupones tienen duración menor que su plazo.' });
Q({ id: 'U3-T20', unidad: 3, tema: 'Bonos', dificultad: 2, tipo: 'teórica', fuente: 'Nuevo',
  enunciado: 'Si dos bonos tienen la misma duración, el de mayor convexidad…',
  correcta: 'Sube más cuando bajan las tasas y baja menos cuando suben.',
  incorrectas: ['Baja más cuando suben las tasas.', 'Tiene siempre un rendimiento mayor.', 'Se comporta igual ante cualquier cambio de tasas.'],
  explicacion: 'Con la misma duración la recta tangente es la misma, pero la curva más convexa queda más arriba de ella hacia los dos lados.',
  trampas: 'Solo para cambios chicos se comportan casi igual; con cambios grandes, la convexidad importa.' });
Q({ id: 'U3-T21', unidad: 3, tema: 'Futuros de tasas', dificultad: 2, tipo: 'teórica', fuente: 'Nuevo',
  enunciado: 'Si las tasas de interés suben, el precio del futuro sobre SOFR a 3 meses…',
  correcta: 'Baja, porque se cotiza como 100 menos la tasa.',
  incorrectas: ['Sube.', 'No cambia, porque la tasa se fija al vencimiento.', 'Sube o baja según el plazo del contrato.'],
  explicacion: 'Cotización = 100 − R. Así, el futuro se mueve como un bono: baja cuando suben las tasas.',
  trampas: 'Quien teme una suba de tasas vende estos futuros.' });
Q({ id: 'U3-T22', unidad: 3, tema: 'Commodities', dificultad: 2, tipo: 'teórica', fuente: 'Nuevo',
  enunciado: 'Para el oro, que es un activo de inversión, el precio del futuro…',
  correcta: 'Queda atado por arbitraje al contado más el costo de financiarlo y guardarlo.',
  incorrectas: ['Puede estar muy por debajo del contado por el rendimiento de conveniencia.', 'No depende de la tasa de interés.', 'Es siempre igual al contado.'],
  explicacion: 'Los que tienen oro como inversión lo prestan o venden si el futuro está barato: valen las dos desigualdades y F₀ = (S₀ + U)e^(rT).',
  trampas: 'El rendimiento de conveniencia importa en los commodities de consumo.' });
Q({ id: 'U3-P11', unidad: 3, tema: 'Tasas', dificultad: 1, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: '¿Qué tasa anual con capitalización trimestral equivale a un 10 % anual continuo?',
  correcta: pct(4 * (EXP(0.025) - 1), 2), incorrectas: ['10,00 %', pct(EXP(0.1) - 1, 2), pct(EXP(0.025) - 1, 2)],
  explicacion: 'R₄ = 4·(e^(0,10/4) − 1).',
  trampas: `10,00 % supone que son iguales. ${pct(EXP(0.1) - 1, 2)} es la tasa efectiva anual. ${pct(EXP(0.025) - 1, 2)} es la tasa de un trimestre.` });
{
  const F = (50 - EXP(-0.06 * 0.25)) * EXP(0.03);
  Q({ id: 'U3-P12', unidad: 3, tema: 'Precio forward', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo',
    enunciado: 'Una acción vale 50 y paga un dividendo de 1 dentro de 3 meses. Con r = 6 % continua, ¿cuál es el precio forward a 6 meses?',
    correcta: f(F), incorrectas: [f(50 * EXP(0.03)), f(50 - EXP(-0.015)), f((50 + EXP(-0.015)) * EXP(0.03))],
    explicacion: 'F₀ = (S₀ − I)·e^(rT), con I = 1·e^(−0,06 × 0,25) = 0,9851.',
    trampas: `${f(50 * EXP(0.03))} ignora el dividendo. ${f(50 - EXP(-0.015))} resta el dividendo pero no capitaliza. ${f((50 + EXP(-0.015)) * EXP(0.03))} suma el dividendo en lugar de restarlo.` });
}
Q({ id: 'U3-P13', unidad: 3, tema: 'Monedas', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'El dólar contado vale $1.450. La tasa en pesos es 32 % y la tasa en dólares, 4 % (continuas). ¿Cuál es el dólar futuro a 6 meses (números ilustrativos)?',
  correcta: f(1450 * EXP(0.14), 1), incorrectas: [f(1450 * EXP(0.16), 1), f(1450 * EXP(-0.14), 1), f(1450 * EXP(0.28), 1)],
  explicacion: 'F₀ = S₀·e^((r − r_f)T) = 1.450·e^(0,28 × 0,5).',
  trampas: `${f(1450 * EXP(0.16), 1)} ignora la tasa en dólares. ${f(1450 * EXP(-0.14), 1)} invierte las tasas. ${f(1450 * EXP(0.28), 1)} usa T = 1 año.` });
Q({ id: 'U3-P14', unidad: 3, tema: 'Valor del forward', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'Un forward corto sobre un activo sin ingresos se pactó a K = 105. Faltan 6 meses, el activo vale 100 y r = 6 % continua. ¿Cuánto vale para el corto?',
  correcta: f(105 * EXP(-0.03) - 100), incorrectas: ['5,00', f(100 - 105 * EXP(-0.03)), f(105 - 100 * EXP(-0.03))],
  explicacion: 'Para el corto: f = K·e^(−rT) − S₀ = 105·e^(−0,03) − 100.',
  trampas: `5,00 no descuenta K. ${f(100 - 105 * EXP(-0.03))} es el valor para el largo. ${f(105 - 100 * EXP(-0.03))} descuenta S₀ en lugar de K.` });
Q({ id: 'U3-P15', unidad: 3, tema: 'FRA', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'Un FRA largo (según la cátedra, paga fija y recibe variable) sobre 50 millones pactó 5 % por 6 meses. La tasa del período resulta 4 % (anual, simple). ¿Qué pasa al final del período?',
  correcta: 'El largo paga 250.000.', incorrectas: ['El largo cobra 250.000.', 'El largo paga 500.000.', 'El largo paga 245.098.'],
  explicacion: '(0,04 − 0,05) × 0,5 × 50.000.000 = −250.000: la tasa terminó por debajo de la pactada y el largo paga la diferencia.',
  trampas: 'Cobrar sería si la tasa hubiera subido. 500.000 olvida que el período es de medio año. 245.098 es ese monto descontado, que se paga si se liquida al inicio del período.' });
Q({ id: 'U3-P16', unidad: 3, tema: 'Bonos', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'Un bono vale 95 y tiene una duración de 4 años (rendimiento continuo). Si el rendimiento sube 50 puntos básicos, ¿cuál es el cambio aproximado del precio?',
  correcta: '−1,90', incorrectas: ['+1,90', '−19,00', '−0,48'],
  explicacion: 'ΔB ≈ −B·D·Δy = −95 × 4 × 0,005.',
  trampas: '+1,90 cambia el signo: cuando sube la tasa, el precio baja. −19,00 usa 5 % en lugar de 0,5 %. −0,48 olvida la duración.' });

// ---------- Preguntas basadas en la Guía U3 de la cátedra ----------
{
  // Guía U3, ej. 2: acción a 45, r = 15 % continua, 6 meses.
  const S = 45, r = 0.15, T = 0.5, F = S * EXP(r * T);
  Q({ id: 'U3-P17', unidad: 3, tema: 'Precio forward', dificultad: 2, tipo: 'práctica', fuente: 'Guía U3, ej. 2',
    enunciado: 'Una acción sin dividendos vale 45 y la tasa libre de riesgo es 15 % anual continua. Un forward a 6 meses cotiza a 50. ¿Qué arbitraje conviene y cuánto gana por acción al vencimiento?',
    correcta: `Cash and carry (comprar contado y vender forward): gana ${f(50 - F)}.`,
    incorrectas: [`Reverse cash and carry (vender contado y comprar forward): gana ${f(50 - F)}.`, 'Cash and carry (comprar contado y vender forward): gana 5,00.', `Cash and carry (comprar contado y vender forward): gana ${f((50 - F) * EXP(-r * T))}.`],
    explicacion: `F₀ = 45·e^(0,15 × 0,5) = ${f(F)}. El forward está caro: se toma prestado 45, se compra la acción y se vende a plazo a 50. Al vencimiento se entrega la acción, se cobra 50 y se devuelven ${f(F)}: quedan ${f(50 - F)}.`,
    trampas: 'Con el forward caro se vende el forward, no se compra. 5,00 olvida el costo de financiar la compra. La última descuenta a hoy una ganancia que la pregunta pide al vencimiento.' });
  // Límites con imperfecciones (guía: 49,84 y 47,21).
  const cf = 10 / 100, cs = 0.01, rT = 0.18, rC = 0.15, disp = 0.8;
  const LS = (S * (1 + cs) + cf) * EXP(rT * T);
  const LI = disp * S * (1 - cs) * EXP(rC * T) + (1 - disp) * S * (1 - cs) - cf * EXP(rC * T);
  const datosImp = 'Acción sin dividendos a 45; forward a 6 meses. Costo del forward: 10 por contrato de 100 acciones (al pactar). Costo de comprar o vender la acción: 1 %. Tasa para tomar fondos: 18 %; para colocar: 15 % (continuas). De una venta en corto solo se puede colocar el 80 %; el 20 % queda en garantía sin interés.';
  Q({ id: 'U3-P18', unidad: 3, tema: 'Precio forward', dificultad: 3, tipo: 'práctica', fuente: 'Guía U3, ej. 2',
    enunciado: `${datosImp} ¿Cuál es el límite superior del rango de no arbitraje?`,
    correcta: f(LS), incorrectas: [f(S * (1 + cs) * EXP(rT * T)), f((S * (1 + cs) + cf) * EXP(rC * T)), f(S * EXP(rT * T))],
    explicacion: `Cash and carry: se toman prestados 45 × 1,01 + 0,10 = 45,55 al 18 % y se compra la acción. Al vencimiento hay que devolver 45,55·e^(0,09) = ${f(LS)}: si el forward cotiza más que eso, hay arbitraje (la guía da 49,84).`,
    trampas: `${f(S * (1 + cs) * EXP(rT * T))} olvida el costo del forward. ${f((S * (1 + cs) + cf) * EXP(rC * T))} financia la compra a la tasa de colocación. ${f(S * EXP(rT * T))} ignora los costos de transacción.` });
  Q({ id: 'U3-P19', unidad: 3, tema: 'Precio forward', dificultad: 3, tipo: 'práctica', fuente: 'Guía U3, ej. 2',
    enunciado: `${datosImp} ¿Cuál es el límite inferior del rango de no arbitraje?`,
    correcta: f(LI), incorrectas: [f((S * (1 - cs) - cf) * EXP(rC * T)), f(disp * S * (1 - cs) * EXP(rC * T) - cf * EXP(rC * T)), f(disp * S * (1 - cs) * EXP(rT * T) + (1 - disp) * S * (1 - cs) - cf * EXP(rT * T))],
    explicacion: `Reverse cash and carry: se vende en corto y se reciben 45 × 0,99 = 44,55, pero solo el 80 % se coloca al 15 %; el 20 % vuelve sin interés. Se paga el costo del forward (0,10) al pactar. Al vencimiento se tiene 0,8 × 44,55·e^(0,075) + 0,2 × 44,55 − 0,10·e^(0,075) = ${f(LI)} (la guía da 47,21).`,
    trampas: 'La primera ignora la restricción de la venta en corto. La segunda pierde el 20 % en garantía como si no se recuperara. La última usa la tasa de toma de fondos para colocar.' });
}
{
  // Guía U3, ej. 4: largo a 3 meses, S = 30, r = 10 %; dos meses después S = 38.
  const F0 = 30 * EXP(0.1 * 0.25), F1 = 38 * EXP(0.1 / 12), v = 38 - F0 * EXP(-0.1 / 12);
  Q({ id: 'U3-P20', unidad: 3, tema: 'Valor del forward', dificultad: 2, tipo: 'práctica', fuente: 'Guía U3, ej. 4',
    enunciado: 'Se entra largo en un forward a 3 meses sobre una acción sin dividendos que vale 30, con r = 10 % continua. Dos meses después la acción vale 38 y la tasa no cambió. ¿Cuánto vale el forward?',
    correcta: f(v), incorrectas: [f(38 - F0), f(F1 - F0), '8,00'],
    explicacion: `K = 30·e^(0,025) = ${f(F0)}. Faltando un mes: f = S − K·e^(−rT) = 38 − ${f(F0)}·e^(−0,1/12) = ${f(v)}. Equivale a (F₁ − K)·e^(−rT), con F₁ = ${f(F1)}.`,
    trampas: `${f(38 - F0)} no descuenta K. ${f(F1 - F0)} es la diferencia de precios forward sin descontar. 8,00 compara con el precio de contado inicial.` });
  // Guía U3, ej. 5: dividendos de 2 en 2 y 5 meses; S = 50, r = 8 %, 6 meses; corto.
  const I0 = 2 * EXP(-0.08 * 2 / 12) + 2 * EXP(-0.08 * 5 / 12), K = (50 - I0) * EXP(0.04);
  const I1 = 2 * EXP(-0.08 * 2 / 12), Fn = (48 - I1) * EXP(0.02), corto = (K - Fn) * EXP(-0.02);
  Q({ id: 'U3-P21', unidad: 3, tema: 'Precio forward', dificultad: 3, tipo: 'práctica', fuente: 'Guía U3, ej. 5',
    enunciado: 'Una acción vale 50 y pagará dividendos de 2 dentro de 2 meses y de 2 dentro de 5 meses. Con r = 8 % anual continua, ¿cuál es el precio forward a 6 meses?',
    correcta: f(K), incorrectas: [f((50 - 4) * EXP(0.04)), f(50 * EXP(0.04)), f((50 - I0) * EXP(0.08))],
    explicacion: `I = 2·e^(−0,08×2/12) + 2·e^(−0,08×5/12) = ${f(I0, 4)}. F₀ = (50 − I)·e^(0,08×0,5) = ${f(K)} (la guía da 47,97).`,
    trampas: `${f((50 - 4) * EXP(0.04))} resta los dividendos sin descontarlos. ${f(50 * EXP(0.04))} los ignora. ${f((50 - I0) * EXP(0.08))} capitaliza un año en lugar de seis meses.` });
  Q({ id: 'U3-P22', unidad: 3, tema: 'Valor del forward', dificultad: 3, tipo: 'práctica', fuente: 'Guía U3, ej. 5',
    enunciado: `Siguiendo con esa acción (dividendos de 2 a los 2 y 5 meses; r = 8 %), alguien vendió el forward a 6 meses a ${f(K)}. Tres meses después la acción vale 48. ¿Cuánto vale la posición corta?`,
    correcta: f(corto), incorrectas: [f(-corto), f(K - Fn), '2,00'],
    explicacion: `Queda un solo dividendo, a 2 meses: I = 2·e^(−0,08×2/12) = ${f(I1, 4)}. Nuevo forward a 3 meses: (48 − I)·e^(0,02) = ${f(Fn)}. Para el corto: (K − F)·e^(−0,02) = ${f(corto)} (la guía da 1).`,
    trampas: `${f(-corto)} es el valor para el largo. ${f(K - Fn)} no descuenta la diferencia. 2,00 compara los precios de contado.` });
  // Guía U3, ej. 6: bono a 970, cupón de 10 en 3 meses; tasas 5 % (3 m) y 5,5 % (10 m).
  const Ib = 10 * EXP(-0.05 * 0.25), Fb = (970 - Ib) * EXP(0.055 * 10 / 12);
  Q({ id: 'U3-P23', unidad: 3, tema: 'Bonos', dificultad: 2, tipo: 'práctica', fuente: 'Guía U3, ej. 6',
    enunciado: 'Un bono vale 970 y paga un cupón de 10 dentro de 3 meses. Tasas continuas: 5 % a 3 meses y 5,5 % a 10 meses. ¿Cuál es el precio forward a 10 meses?',
    correcta: f(Fb), incorrectas: [f(970 * EXP(0.055 * 10 / 12)), f((970 - 10) * EXP(0.055 * 10 / 12)), f((970 - Ib) * EXP(0.05 * 10 / 12))],
    explicacion: `I = 10·e^(−0,05×0,25) = ${f(Ib, 4)}; F₀ = (970 − I)·e^(0,055×10/12) = ${f(Fb)} (la guía da 1.005,15).`,
    trampas: 'La primera ignora el cupón. La segunda lo resta sin descontarlo. La última capitaliza a la tasa de 3 meses.' });
}
{
  // Guía U3, ej. 7: GBP a 1,61; r_USD 2 %, r_GBP 4 %.
  const F = 1.61 * EXP(-0.02);
  const gbp = 100 / 1.61, ganancia = gbp * EXP(0.04) * 1.72 - 100 * EXP(0.02);
  Q({ id: 'U3-P24', unidad: 3, tema: 'Monedas', dificultad: 3, tipo: 'práctica', fuente: 'Guía U3, ej. 7',
    enunciado: 'La libra vale 1,61 USD; tasas a un año: 2 % en EE. UU. y 4 % en Inglaterra (continuas). Si el forward a un año cotiza 1,72, ¿cuánto se gana al año tomando USD 100 prestados para arbitrar?',
    correcta: `USD ${f(ganancia)}`, incorrectas: [`USD ${f(100 / 1.61 * 1.72 - 100 * EXP(0.02))}`, `USD ${f(gbp * EXP(0.04) * 1.72 - 100)}`, `USD ${f(ganancia * EXP(-0.02))}`],
    explicacion: `F teórico = 1,61·e^(0,02 − 0,04) = ${f(F, 4)}: el forward a 1,72 está caro. Se toman USD 100 al 2 %, se compran ${f(gbp)} libras, se colocan al 4 % (${f(gbp * EXP(0.04))} libras) y se venden a plazo a 1,72: ${f(gbp * EXP(0.04) * 1.72)} dólares. Se devuelven ${f(100 * EXP(0.02))}: quedan ${f(ganancia)} (la guía da 9,17).`,
    trampas: 'La primera no coloca las libras al 4 %. La segunda olvida pagar el interés del préstamo. La última descuenta a hoy una ganancia que la pregunta pide al año.' });
  Q({ id: 'U3-P25', unidad: 3, tema: 'Monedas', dificultad: 1, tipo: 'práctica', fuente: 'Guía U3, ej. 7',
    enunciado: 'La libra vale 1,61 USD; tasas a un año: 2 % en EE. UU. y 4 % en Inglaterra (continuas). ¿Cuál es el precio forward de la libra a un año?',
    correcta: f(F, 4), incorrectas: [f(1.61 * EXP(0.02), 4), '1,6100', f(1.61 * EXP(-0.06), 4)],
    explicacion: 'F₀ = S₀·e^((r_USD − r_GBP)T) = 1,61·e^(−0,02). La moneda con más tasa cotiza con descuento a plazo.',
    trampas: 'La primera invierte las tasas. 1,6100 ignora la diferencia de tasas. La última suma las tasas.' });
  // Guía U3, ej. 8 y 9: dólar a 17,38; pesos 23,65 %, dólares 1,45 %.
  const Fd = 17.38 * EXP((0.2365 - 0.0145) * 0.5);
  Q({ id: 'U3-P26', unidad: 3, tema: 'Monedas', dificultad: 2, tipo: 'práctica', fuente: 'Guía U3, ej. 8',
    enunciado: 'El dólar vale $ 17,38. Tasas continuas: 23,65 % en pesos y 1,45 % en dólares. ¿Cuál es el precio de equilibrio del dólar futuro a 6 meses?',
    correcta: f(Fd), incorrectas: [f(17.38 * EXP(0.2365 * 0.5)), f(17.38 * EXP((0.2365 - 0.0145))), f(17.38 * EXP(-(0.2365 - 0.0145) * 0.5))],
    explicacion: 'F₀ = 17,38·e^((0,2365 − 0,0145) × 0,5) = 19,42.',
    trampas: 'La primera ignora la tasa en dólares. La segunda usa un año en lugar de seis meses. La última invierte las tasas.' });
  const LI = 17.38 * EXP((0.2365 - 0.0645) * 0.5), LS = 17.42 * EXP((0.3365 - 0.0145) * 0.5);
  Q({ id: 'U3-P27', unidad: 3, tema: 'Monedas', dificultad: 3, tipo: 'práctica', fuente: 'Guía U3, ej. 9',
    enunciado: 'Dólar: comprador 17,38 y vendedor 17,42. Pesos: tasa pasiva 23,65 % y activa 33,65 %. Dólares: pasiva 1,45 % y activa 6,45 % (todas continuas). ¿Cuál es el rango de no arbitraje del dólar futuro a 6 meses?',
    correcta: `Entre ${f(LI)} y ${f(LS)}.`,
    incorrectas: [`Entre ${f(17.42 * EXP((0.2365 - 0.0645) * 0.5))} y ${f(17.38 * EXP((0.3365 - 0.0145) * 0.5))}.`, `Entre ${f(17.38 * EXP((0.2365 - 0.0145) * 0.5))} y ${f(17.42 * EXP((0.2365 - 0.0145) * 0.5))}.`, `Entre ${f(LI)} y ${f(17.38 * EXP((0.3365 - 0.0145) * 0.5))}.`],
    explicacion: `Límite superior (cash and carry): pedir pesos al 33,65 %, comprar dólares a 17,42 y colocarlos al 1,45 %: 17,42·e^((0,3365 − 0,0145)×0,5) = ${f(LS)}. Límite inferior: pedir dólares al 6,45 %, venderlos a 17,38 y colocar pesos al 23,65 %: 17,38·e^((0,2365 − 0,0645)×0,5) = ${f(LI)} (la guía da 18,94 y 20,47).`,
    trampas: 'La primera cruza los tipos de cambio comprador y vendedor. La segunda usa solo las tasas pasivas, como si no hubiera diferencia entre tomar y colocar fondos. La última calcula el límite superior con el tipo comprador: para comprar dólares se paga el vendedor.' });
}
{
  // Guía U3, ej. 12: oro contado 293, futuro diciembre 302; T-bill diciembre 5,35 % simple, 180 días (30/360).
  const Fdic = 293 * (1 + 0.0535 * 180 / 360);
  Q({ id: 'U3-P28', unidad: 3, tema: 'Commodities', dificultad: 2, tipo: 'práctica', fuente: 'Guía U3, ej. 12',
    enunciado: 'El 30 de junio el oro vale 293 al contado. La tasa a diciembre es 5,35 % anual simple (30/360, 180 días). ¿Qué precio futuro a diciembre sería el de equilibrio (sin costos de almacenamiento)?',
    correcta: f(Fdic), incorrectas: ['302,00', f(293 * 1.0535), f(293 * EXP(0.0535 * 0.5))],
    explicacion: `F = 293 × (1 + 0,0535 × 180/360) = ${f(Fdic)} (la guía da 300,84). El futuro que se observa (302) está un poco por encima.`,
    trampas: '302 es el precio de mercado, no el de equilibrio. La segunda aplica la tasa de un año entero. La última capitaliza en forma continua, pero la tasa es simple.' });
}
Q({ id: 'U3-T23', unidad: 3, tema: 'Commodities', dificultad: 2, tipo: 'teórica', fuente: 'Guía U3, ej. 12',
  enunciado: 'El oro vale 293 al contado; el futuro a agosto, 297,40 y el futuro a diciembre, 302. ¿Cómo se describe este mercado?',
  correcta: 'Normal: los futuros más lejanos cotizan por encima del contado y de los más cercanos.',
  incorrectas: ['Invertido: los futuros cotizan por encima del precio de contado.', 'Normal: la base S − F es positiva y crece a medida que se alarga el plazo.', 'Invertido: el futuro a diciembre debería valer menos que el de agosto.'],
  explicacion: 'Un mercado normal (contango) tiene precios futuros crecientes con el plazo, como pasa cuando domina el costo de tenencia. En uno invertido los futuros lejanos valen menos.',
  trampas: 'Con futuros por encima del contado la base S − F es negativa (la guía la informa como F − S = 9).' });
{
  // Guía U3, ej. 13: tasas cero continuas 8,0 / 8,2 / 8,4 / 8,5 / 8,6 / 8,7 % (3 a 18 meses).
  Q({ id: 'U3-P29', unidad: 3, tema: 'Tasas', dificultad: 2, tipo: 'práctica', fuente: 'Guía U3, ej. 13',
    enunciado: 'Tasas cero continuas: 8,2 % a 6 meses, 8,4 % a 9 meses y 8,5 % a 12 meses. ¿Cuál es la tasa forward continua para el cuarto trimestre (de 9 a 12 meses)?',
    correcta: pp((8.5 * 12 - 8.4 * 9) / 3), incorrectas: [pp((8.5 + 8.4) / 2), '8,50 %', pp((8.5 * 12 - 8.2 * 9) / 3)],
    explicacion: 'R_F = (R₂T₂ − R₁T₁)/(T₂ − T₁) = (8,5 × 12 − 8,4 × 9)/3 = 8,8 %.',
    trampas: '8,45 % promedia las tasas. 8,50 % es la cero a 12 meses. 9,40 % toma la tasa de 6 meses como si fuera la de 9.' });
  // Guía U3, ej. 14: recibir 9,5 % trimestral entre 12 y 15 meses; forward 9 % continua; cero a 15 meses 8,6 %.
  const fwdQ = 4 * (EXP(0.09 / 4) - 1);
  const vFRA = 1e6 * (0.095 - fwdQ) * 0.25 * EXP(-0.086 * 1.25);
  Q({ id: 'U3-P30', unidad: 3, tema: 'FRA', dificultad: 3, tipo: 'práctica', fuente: 'Guía U3, ej. 14',
    enunciado: 'La tasa forward continua entre 12 y 15 meses es 9,0 % y la tasa cero a 15 meses es 8,6 % (continuas). ¿Cuánto vale hoy un FRA que permite recibir 9,5 % (capitalización trimestral) en ese trimestre, sobre USD 1 millón?',
    correcta: f(vFRA), incorrectas: [f(1e6 * (0.095 - fwdQ) * 0.25), f(1e6 * (0.095 - 0.09) * 0.25 * EXP(-0.086 * 1.25)), f(1e6 * (0.095 - fwdQ) * 0.25 * EXP(-0.085))],
    explicacion: `La forward se pasa a trimestral: 4(e^(0,09/4) − 1) = ${pct(fwdQ, 4)}. Flujo al final del trimestre: 1.000.000 × (9,5 % − ${pct(fwdQ, 4)}) × 0,25; se descuenta 15 meses al 8,6 %: ${f(vFRA)} (la guía da 893,56).`,
    trampas: 'La primera no descuenta. La segunda compara 9,5 % trimestral con 9 % continua sin convertir. La última descuenta solo hasta el inicio del período (12 meses).' });
  // Guía U3, ej. 15: FRA 1x4; LIBOR 30 d 4 %, 120 d 5 %.
  const Ra = ((1 + 0.05 * 120 / 360) / (1 + 0.04 * 30 / 360) - 1) * 360 / 90;
  const vVto = 1e6 * (0.06 - Ra) * 0.25 / (1 + 0.06 * 0.25);
  Q({ id: 'U3-P31', unidad: 3, tema: 'FRA', dificultad: 2, tipo: 'práctica', fuente: 'Guía U3, ej. 15',
    enunciado: 'LIBOR (nominal anual, base 360): 4 % a 30 días y 5 % a 120 días. ¿Cuál es la tasa de un FRA 1x4?',
    correcta: pct(Ra), incorrectas: [pct((0.05 * 120 - 0.04 * 30) / 90), '4,50 %', '5,00 %'],
    explicacion: `[(1 + 0,05 × 120/360)/(1 + 0,04 × 30/360) − 1] × 360/90 = ${pct(Ra, 4)}.`,
    trampas: `${pct((0.05 * 120 - 0.04 * 30) / 90)} aplica la fórmula de tasas continuas a tasas simples. 4,50 % promedia. 5,00 % es la LIBOR a 120 días.` });
  Q({ id: 'U3-P32', unidad: 3, tema: 'FRA', dificultad: 3, tipo: 'práctica', fuente: 'Guía U3, ej. 15',
    enunciado: `Un FRA 1x4 comprado sobre $ 1 millón se pactó a ${pct(Ra)} (90 días, base 360). Al vencimiento del FRA la LIBOR a 90 días es 6 %. ¿Cuánto vale el FRA para el comprador en ese momento (liquidación al inicio del período)?`,
    correcta: f(vVto), incorrectas: [f(1e6 * (0.06 - Ra) * 0.25), f(1e6 * (0.06 - Ra) * 0.25 / (1 + Ra * 0.25)), f(-vVto)],
    explicacion: `Diferencia de intereses al final del período: 1.000.000 × (6 % − ${pct(Ra, 4)}) × 90/360 = ${f(1e6 * (0.06 - Ra) * 0.25)}. Como se liquida al inicio, se descuenta a la LIBOR observada: ÷ (1 + 0,06 × 90/360) = ${f(vVto)} (la guía da 1.685,68).`,
    trampas: 'La primera no descuenta. La segunda descuenta con la tasa pactada en lugar de la observada. La última es el valor para el vendedor.' });
  // Guía U3, ej. 16: FRA 4x6 sobre 0,5 millones; LIBOR 120 d 7,00 %, 180 d 7,10 %.
  const R46 = ((1 + 0.071 * 180 / 360) / (1 + 0.07 * 120 / 360) - 1) * 360 / 60;
  Q({ id: 'U3-P33', unidad: 3, tema: 'FRA', dificultad: 3, tipo: 'práctica', fuente: 'Guía U3, ej. 16',
    enunciado: 'Una empresa tomará dentro de 120 días un préstamo de $ 500.000 por 60 días y fija la tasa con un FRA 4x6. LIBOR (nominal anual, base 360): 7,00 % a 120 días y 7,10 % a 180 días. ¿Qué interés queda fijado?',
    correcta: f(5e5 * R46 * 60 / 360), incorrectas: [f(5e5 * 0.071 * 60 / 360), f(5e5 * 0.07 * 60 / 360), f(5e5 * ((0.071 * 180 - 0.07 * 120) / 60) * 60 / 360)],
    explicacion: `Tasa del FRA: [(1 + 0,071 × 180/360)/(1 + 0,07 × 120/360) − 1] × 360/60 = ${pct(R46, 4)}. Interés: 500.000 × ${pct(R46, 4)} × 60/360 = ${f(5e5 * R46 * 60 / 360)} (la guía da 5.944,63).`,
    trampas: 'La primera usa la LIBOR a 180 días. La segunda, la de 120. La última aplica la fórmula de tasas continuas a tasas simples.' });
  // Guía U3, ej. 17: cero a 3 años 3,7 %; forward del año 3: 5,1 %; paga 5 % (continuas).
  const v17 = 1e6 * (EXP(0.051) - EXP(0.05)) * EXP(-0.037 * 3);
  Q({ id: 'U3-P34', unidad: 3, tema: 'FRA', dificultad: 3, tipo: 'práctica', fuente: 'Guía U3, ej. 17',
    enunciado: 'La tasa cero a 3 años es 3,7 % y la forward para el tercer año, 5,1 % (continuas). ¿Cuánto vale un FRA en el que usted paga 5 % (continua) durante el tercer año sobre USD 1 millón?',
    correcta: f(v17), incorrectas: [f(1e6 * (EXP(0.051) - EXP(0.05))), f(1e6 * 0.001 * EXP(-0.037 * 3)), f(-v17)],
    explicacion: `Al final del año 3 recibe la variable y paga la fija: 1.000.000 × (e^(0,051) − e^(0,05)) = ${f(1e6 * (EXP(0.051) - EXP(0.05)))}. Descontado 3 años al 3,7 %: ${f(v17)} (la guía da 941,29). Está largo en la tasa variable y corto en la fija.`,
    trampas: 'La primera no descuenta. La segunda toma la diferencia de tasas sin capitalizarla. La última es el valor para quien recibe la fija.' });
  // Guía U3, ej. 18: tasa semestral → continua.
  Q({ id: 'U3-P35', unidad: 3, tema: 'Tasas', dificultad: 2, tipo: 'práctica', fuente: 'Guía U3, ej. 18',
    enunciado: 'Un bono cupón cero a 6 meses rinde 4 % anual con capitalización semestral. ¿Cuál es la tasa equivalente con composición continua?',
    correcta: pct(2 * Math.log(1.02)), incorrectas: ['4,00 %', pct(2 * (EXP(0.02) - 1)), pct(Math.log(1.04))],
    explicacion: 'R_c = m·ln(1 + R_m/m) = 2·ln(1,02) = 3,96 %.',
    trampas: '4,00 % no convierte. 4,04 % convierte en sentido contrario (de continua a semestral). 3,92 % trata la tasa como anual efectiva.' });
}
Q({ id: 'U3-T24', unidad: 3, tema: 'FRA', dificultad: 3, tipo: 'teórica', fuente: 'Guía U3, ej. 16',
  enunciado: 'Una empresa tomará un préstamo a tasa variable dentro de 120 días por 60 días y quiere ponerle un techo al costo. ¿Qué hace?',
  correcta: 'Compra (va larga en) un FRA 4x6: fija hoy la tasa que pagará en ese período.',
  incorrectas: ['Vende un FRA 4x6: así cobra la diferencia si la tasa sube.', 'Compra un FRA 2x6, para cubrir desde hoy hasta el fin del préstamo.', 'Vende un FRA 6x4, que empieza cuando termina el préstamo.'],
  explicacion: 'El FRA 4x6 cubre el período que empieza en el mes 4 y termina en el mes 6. El comprador paga la tasa fija y recibe la variable: si la tasa sube, el FRA compensa el mayor costo del préstamo.',
  trampas: 'El vendedor del FRA cobra si la tasa baja, no si sube. El 2x6 cubre un período que no es el del préstamo. "6x4" no es una notación válida.' });
Q({ id: 'U3-T25', unidad: 3, tema: 'FRA', dificultad: 3, tipo: 'teórica', fuente: 'Guía U3, ej. 17',
  enunciado: 'En un FRA usted paga una tasa fija del 5 % y recibe la tasa variable. Con la terminología de la guía, usted está…',
  correcta: 'Largo en la tasa variable y corto en la tasa fija.',
  incorrectas: ['Largo en la tasa fija y corto en la tasa variable.', 'Largo en las dos tasas, porque compró el FRA.', 'Corto en la tasa variable, porque la cobra al final.'],
  explicacion: 'Estar "largo" en una tasa es recibirla: gana si esa tasa sube. Quien paga fija y recibe variable gana cuando la tasa variable sube.',
  trampas: 'En el ejercicio 14, quien recibe 9,5 % fijo está largo en la tasa fija: es la posición opuesta.' });
