// Banco de preguntas · Unidad II · Cobertura y especulación con futuros (usa los helpers de preguntas-base.js)

// ---------- Teóricas ----------
Q({ id: 'U2-T01', unidad: 2, tema: 'Cobertura', dificultad: 1, tipo: 'teórica', fuente: 'Hull cap. 3 · presentación U2',
  enunciado: 'Una empresa que va a comprar un activo dentro de 3 meses y teme una suba de precios debería…',
  correcta: 'Comprar futuros (cobertura larga).',
  incorrectas: ['Vender futuros (cobertura corta).', 'Vender el activo en corto hoy.', 'No hacer nada: el futuro no cubre compras futuras.'],
  explicacion: 'La cobertura larga gana si el precio sube, compensando el mayor costo de la compra.' });
Q({ id: 'U2-T02', unidad: 2, tema: 'Riesgo de base', dificultad: 1, tipo: 'teórica', fuente: 'Hull cap. 3',
  enunciado: 'La base se define como…',
  correcta: 'Precio contado del activo cubierto menos precio del futuro.',
  incorrectas: ['Precio del futuro menos precio contado.', 'La diferencia entre el futuro de hoy y el del vencimiento.', 'El margen inicial menos el de mantenimiento.'],
  explicacion: 'b = S − F. Si el activo es el subyacente del futuro, la base tiende a cero al vencimiento.' });
Q({ id: 'U2-T03', unidad: 2, tema: 'Riesgo de base', dificultad: 2, tipo: 'teórica', fuente: 'Hull cap. 3',
  enunciado: 'Un fortalecimiento inesperado de la base…',
  correcta: 'Mejora el resultado de una cobertura corta y empeora el de una larga.',
  incorrectas: ['Mejora el resultado de una cobertura larga y empeora el de una corta.', 'Mejora a las dos.', 'No afecta a ninguna si la cobertura está bien hecha.'],
  explicacion: 'El precio efectivo es F₁ + b₂. El que vendió futuros recibe F₁ + b₂ (le conviene una b₂ alta); el que compró paga F₁ + b₂.' });
Q({ id: 'U2-T04', unidad: 2, tema: 'Riesgo de base', dificultad: 2, tipo: 'teórica', fuente: 'Hull cap. 3 · presentación U2',
  enunciado: 'Si no existe un futuro con el vencimiento exacto de la cobertura, en general conviene…',
  correcta: 'Usar el vencimiento más cercano posterior al fin de la cobertura.',
  incorrectas: ['Usar el vencimiento más cercano anterior y quedar descubierto el resto.', 'Usar el vencimiento más lejano disponible.', 'No cubrirse.'],
  explicacion: 'Cubrirse más largo es preferible a quedar descubierto; pero cuanto más lejos el vencimiento, mayor el riesgo de base y menor la liquidez.' });
Q({ id: 'U2-T05', unidad: 2, tema: 'Ratio de cobertura', dificultad: 1, tipo: 'teórica', fuente: 'Hull cap. 3',
  enunciado: 'El ratio de cobertura de mínima varianza es…',
  correcta: 'h* = ρ·σ_S/σ_F',
  incorrectas: ['h* = ρ·σ_F/σ_S', 'h* = σ_S/σ_F', 'h* = ρ²'],
  explicacion: 'Es la pendiente de la regresión de ΔS sobre ΔF.', trampas: 'ρ² es la efectividad, no el ratio.' });
Q({ id: 'U2-T06', unidad: 2, tema: 'Ratio de cobertura', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U2',
  enunciado: 'Si h* = 1, la cobertura…',
  correcta: 'No es necesariamente perfecta: para eso hace falta ρ = 1.',
  incorrectas: ['Es perfecta, porque se cubre toda la exposición.', 'Elimina exactamente la mitad del riesgo.', 'Es imposible de calcular.'],
  explicacion: 'Con ρ = 0,5 y σ_S = 2σ_F, h* = 1 pero la efectividad es solo 25 %.' });
Q({ id: 'U2-T07', unidad: 2, tema: 'Ratio de cobertura', dificultad: 1, tipo: 'teórica', fuente: 'Hull cap. 3',
  enunciado: 'La efectividad de una cobertura de mínima varianza es…',
  correcta: 'ρ², el R² de la regresión de ΔS sobre ΔF.',
  incorrectas: ['ρ, la correlación entre ΔS y ΔF.', 'h*, el ratio de cobertura óptimo.', '1 − ρ, el riesgo que no se cubre.'],
  explicacion: 'Es la proporción de la varianza que elimina la cobertura.' });
Q({ id: 'U2-T08', unidad: 2, tema: 'Índices y beta', dificultad: 2, tipo: 'teórica', fuente: 'Hull cap. 3 · presentación U2',
  enunciado: 'Una cartera de acciones cubierta con futuros sobre índice hasta beta cero rinde aproximadamente…',
  correcta: 'La tasa libre de riesgo (más el alfa de la cartera, si lo hay).',
  incorrectas: ['Cero.', 'El rendimiento del índice.', 'El rendimiento del índice multiplicado por la beta.'],
  explicacion: 'Sin riesgo de mercado, por CAPM queda la tasa libre de riesgo. Si el gestor elige bien las acciones, suma el alfa.' });
Q({ id: 'U2-T09', unidad: 2, tema: 'Índices y beta', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U2',
  enunciado: '¿Por qué un gestor cubriría su cartera con futuros en vez de venderla y comprar letras?',
  correcta: 'Para evitar los costos de vender y recomprar y conservar su selección de acciones.',
  incorrectas: ['Porque así gana más que la tasa libre de riesgo sin riesgo.', 'Porque los futuros no tienen riesgo de base.', 'Porque los futuros no requieren márgenes.'],
  explicacion: 'Los futuros permiten neutralizar el mercado en minutos y a bajo costo, manteniendo las posiciones tácticas.' });
Q({ id: 'U2-T10', unidad: 2, tema: 'Conveniencia', dificultad: 2, tipo: 'teórica', fuente: 'Presentación U2',
  enunciado: 'Un rendimiento de conveniencia alto suele asociarse con…',
  correcta: 'Escasez del bien y futuros por debajo del contado (backwardation).',
  incorrectas: ['Un mercado bien abastecido, con futuros por encima del contado (contango).', 'Costos de almacenamiento altos, que encarecen tener el bien en stock.', 'Tasas de interés altas, que aumentan el costo de financiar el stock.'],
  explicacion: 'Cuando hay riesgo de faltante, tener el bien físico vale más y el futuro cotiza por debajo del contado.' });
Q({ id: 'U2-T11', unidad: 2, tema: 'Rolleo', dificultad: 2, tipo: 'teórica', fuente: 'Hull cap. 3',
  enunciado: 'El caso Metallgesellschaft ilustra que una estrategia de rolar coberturas puede fracasar por…',
  correcta: 'Falta de liquidez para pagar los márgenes antes de cobrar las ganancias del negocio cubierto.',
  incorrectas: ['Un error de cálculo del ratio de cobertura, que dejó la posición sobrecubierta.', 'El incumplimiento de la cámara compensadora, que no pagó los márgenes a favor.', 'Un cambio en la regulación que le prohibió a la empresa seguir operando futuros.'],
  explicacion: 'Las pérdidas en futuros se pagan día a día, mientras que las ganancias de los contratos de venta a largo plazo llegaban recién al vencimiento.' });
Q({ id: 'U2-T12', unidad: 2, tema: 'Cobertura', dificultad: 1, tipo: 'teórica', fuente: 'Hull cap. 3',
  enunciado: 'Con una cobertura con futuros bien hecha, si el precio se mueve a favor de la posición original…',
  correcta: 'El resultado total es peor que si no se hubiera cubierto.',
  incorrectas: ['El resultado total es mejor que sin cobertura.', 'Los futuros también ganan.', 'Se puede cancelar la cobertura sin costo y quedarse con la ganancia.'],
  explicacion: 'La cobertura elimina las sorpresas buenas y las malas: es el costo de fijar el precio.' });

// ---------- Prácticas ----------
Q({ id: 'U2-P01', unidad: 2, tema: 'Riesgo de base', dificultad: 1, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'Cobertura corta: F₁ = 50. Al cerrar, S₂ = 44 y F₂ = 43. ¿Qué precio efectivo obtiene?',
  correcta: '51', incorrectas: ['44', '50', '49'],
  explicacion: 'F₁ + b₂ = 50 + (44 − 43) = 51.', trampas: '49 resta la base en lugar de sumarla.' });
Q({ id: 'U2-P02', unidad: 2, tema: 'Riesgo de base', dificultad: 1, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'Cobertura larga: F₁ = 200. Al comprar, S₂ = 195 y F₂ = 196. ¿Cuál es el costo efectivo?',
  correcta: '199', incorrectas: ['201', '195', '200'],
  explicacion: 'F₁ + b₂ = 200 + (195 − 196) = 199.' });
{
  const h = (0.91 * 0.027) / 0.022;
  Q({ id: 'U2-P03', unidad: 2, tema: 'Ratio de cobertura', dificultad: 2, tipo: 'práctica', fuente: 'Presentación U2',
    enunciado: 'ρ = 0,91, σ_S = 0,027, σ_F = 0,022. Exposición 1.200 toneladas; contrato de 25 toneladas. ¿Cuántos contratos?',
    correcta: '54', incorrectas: ['48', '36', '44'],
    explicacion: `h* = ${f(h, 3)}; N* = ${f(h, 3)} × 1.200 / 25 = ${f((h * 1200) / 25)} ≈ 54.`,
    trampas: '48 usa h = 1; 36 invierte los desvíos; 44 usa solo la correlación (0,91 × 48).' });
}
Q({ id: 'U2-P04', unidad: 2, tema: 'Ratio de cobertura', dificultad: 1, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'Si ρ = 0,8, ¿qué porcentaje de la varianza elimina la cobertura de mínima varianza?',
  correcta: '64 %', incorrectas: ['80 %', '20 %', '36 %'],
  explicacion: 'Efectividad = ρ² = 0,64.', trampas: '36 % es la varianza que queda.' });
Q({ id: 'U2-P05', unidad: 2, tema: 'Índices y beta', dificultad: 2, tipo: 'práctica', fuente: 'Presentación U2',
  enunciado: 'Cartera de 5.050.000 con β = 1,5. Futuro a 1.010 por 250 dólares el punto. ¿Cuántos contratos se venden para cubrirla?',
  correcta: '30', incorrectas: ['20', '45', '13,3'],
  explicacion: 'N* = 1,5 × 5.050.000 / (1.010 × 250) = 30.', trampas: '20 olvida la beta; 13,3 divide por la beta.' });
Q({ id: 'U2-P06', unidad: 2, tema: 'Índices y beta', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'Con V_A/V_F = 20 y β = 1,5, ¿qué hay que hacer para llevar la beta a 2?',
  correcta: 'Comprar 10 contratos.', incorrectas: ['Vender 10 contratos.', 'Comprar 40 contratos.', 'Vender 30 contratos.'],
  explicacion: 'N = (1,5 − 2) × 20 = −10: el signo negativo indica comprar.' });
{
  const y = 0.06 - Math.log(200 / 220) / 0.25;
  Q({ id: 'U2-P07', unidad: 2, tema: 'Conveniencia', dificultad: 2, tipo: 'práctica', fuente: 'Presentación U2',
    enunciado: 'S₀ = 220, F₀ = 200 a 3 meses, r = 4 %, almacenamiento c = 2 %. ¿Cuál es el rendimiento de conveniencia?',
    correcta: pct(y, 1), incorrectas: [pct(0.06 + Math.log(200 / 220), 1), pct(0.06, 1), pct(-Math.log(200 / 220) / 0.25 - 0.06, 1)],
    explicacion: 'y = r + c − ln(F₀/S₀)/T.', trampas: '−3,5 % olvida dividir por T; 6,0 % ignora el logaritmo; 32,1 % resta r + c en lugar de sumarlas.' });
}
Q({ id: 'U2-P08', unidad: 2, tema: 'Especulación', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'Un especulador compra 2 futuros sobre índice a 5.000 (50 por punto) con un margen de 25.000 por contrato. El futuro sube a 5.150. ¿Qué rendimiento obtiene sobre el margen?',
  correcta: '30 %', incorrectas: ['3 %', '15 %', '60 %'],
  explicacion: 'Gana 150 × 50 × 2 = 15.000 sobre 50.000 de margen.', trampas: '3 % es el movimiento del índice; 60 % usa el margen de un solo contrato.' });

// ---------- Preguntas agregadas (revisión de octubre de 2026) ----------
Q({ id: 'U2-T13', unidad: 2, tema: 'Cobertura', dificultad: 1, tipo: 'teórica', fuente: 'Nuevo',
  enunciado: 'Una cobertura corta con futuros es adecuada para…',
  correcta: 'Quien tiene el activo (o lo va a tener) y teme que baje su precio.',
  incorrectas: ['Quien va a comprar el activo y teme que suba.', 'Quien quiere apostar a la suba con poco capital.', 'Quien no tiene exposición y busca una ganancia sin riesgo.'],
  explicacion: 'Vender futuros compensa la caída del valor del activo que se tiene: si el precio baja, el futuro vendido gana.',
  trampas: 'Quien va a comprar necesita una cobertura larga.' });
Q({ id: 'U2-T14', unidad: 2, tema: 'Cobertura', dificultad: 2, tipo: 'teórica', fuente: 'Basado en Hull, cap. 3',
  enunciado: 'Un argumento en contra de que una empresa se cubra es que…',
  correcta: 'Si los competidores no se cubren y el precio se mueve a favor del sector, la empresa cubierta queda peor.',
  incorrectas: ['Las coberturas con futuros siempre tienen costo, porque hay que pagar una prima.', 'Con futuros nunca se puede reducir el riesgo, solo trasladarlo de un período a otro.', 'Una cobertura con futuros garantiza una pérdida, porque elimina toda posibilidad de ganar.'],
  explicacion: 'El ejemplo de Hull del joyero: si el precio del oro y los precios de venta se mueven juntos en todo el sector, cubrirse puede agregar riesgo en lugar de quitarlo.',
  trampas: 'Entrar en un futuro no cuesta una prima; las primas son de las opciones.' });
Q({ id: 'U2-T15', unidad: 2, tema: 'Riesgo de base', dificultad: 2, tipo: 'teórica', fuente: 'Nuevo',
  enunciado: 'El riesgo de base desaparece cuando…',
  correcta: 'El activo cubierto es el subyacente del futuro y la cobertura se cierra justo al vencimiento del futuro.',
  incorrectas: ['Se usa un futuro sobre otro activo muy correlacionado con el que se quiere cubrir.', 'El ratio de cobertura es igual a 1, sin importar el vencimiento del futuro elegido.', 'Se elige el futuro más líquido, aunque venza antes o después de la fecha de la cobertura.'],
  explicacion: 'Al vencimiento el futuro converge al contado del mismo activo: la base final es cero y el precio efectivo es exactamente F₁.',
  trampas: 'Con otro activo (cobertura cruzada) la base suele ser mayor, no cero.' });
Q({ id: 'U2-T16', unidad: 2, tema: 'Ratio de cobertura', dificultad: 2, tipo: 'teórica', fuente: 'Nuevo',
  enunciado: 'Si la correlación entre los cambios del contado y del futuro es cero, la cobertura de mínima varianza…',
  correcta: 'No usa futuros: h* = 0, porque el futuro no ayuda a reducir el riesgo.',
  incorrectas: ['Usa h* = 1.', 'Usa h* = σ_S/σ_F.', 'Usa el doble de contratos para compensar la falta de correlación.'],
  explicacion: 'h* = ρ·σ_S/σ_F = 0. Un futuro que no se mueve con el activo solo agrega riesgo.',
  trampas: 'σ_S/σ_F sería el ratio con ρ = 1.' });
Q({ id: 'U2-T17', unidad: 2, tema: 'Índices y beta', dificultad: 1, tipo: 'teórica', fuente: 'Nuevo',
  enunciado: 'Para aumentar la beta de una cartera usando futuros sobre un índice, el gestor…',
  correcta: 'Compra futuros sobre el índice.',
  incorrectas: ['Vende futuros sobre el índice.', 'Vende las acciones de beta más alta.', 'Compra puts sobre el índice.'],
  explicacion: 'Un futuro comprado suma exposición al mercado. La cantidad es (β* − β)·V_A/V_F.',
  trampas: 'Vender futuros, vender acciones de beta alta o comprar puts reducen la exposición.' });
Q({ id: 'U2-T18', unidad: 2, tema: 'Ratio de cobertura', dificultad: 2, tipo: 'teórica', fuente: 'Basado en Hull, cap. 3',
  enunciado: 'El ajuste por liquidación diaria (tailing the hedge) consiste en…',
  correcta: 'Calcular la cantidad de contratos con valores en dinero: N* = h*·V_A/V_F.',
  incorrectas: ['Cerrar la cobertura todos los días y volver a abrirla.', 'Usar siempre el futuro con el vencimiento más cercano.', 'Multiplicar la cantidad de contratos por la tasa de interés.'],
  explicacion: 'Como el futuro se liquida todos los días, conviene comparar valores (precio × cantidad) del activo y del futuro, no cantidades físicas.',
  trampas: 'Elegir el vencimiento es otra decisión de la cobertura.' });
Q({ id: 'U2-T19', unidad: 2, tema: 'Rolleo', dificultad: 1, tipo: 'teórica', fuente: 'Nuevo',
  enunciado: 'Rolar una cobertura significa…',
  correcta: 'Cerrar el futuro que vence y abrir otro de vencimiento posterior, para cubrir un plazo más largo que el disponible.',
  incorrectas: ['Pasar de una posición larga a una corta en futuros según cómo se vaya moviendo el precio.', 'Reemplazar los futuros por opciones cuando se acerca el vencimiento del contrato.', 'Ajustar todos los días el margen depositado para mantener la posición abierta.'],
  explicacion: 'Cada cambio de contrato agrega una base: el rolleo suma varios riesgos de base y puede generar necesidades de liquidez (el caso Metallgesellschaft).',
  trampas: 'El ajuste del margen es el marking to market, no el rolleo.' });
Q({ id: 'U2-T20', unidad: 2, tema: 'Riesgo de base', dificultad: 2, tipo: 'teórica', fuente: 'Basado en Hull, cap. 3',
  enunciado: 'En una cobertura cruzada (por ejemplo, combustible de aviones con futuros de heating oil)…',
  correcta: 'El riesgo de base suele ser mayor, porque se suman la base del futuro y la diferencia de precio entre los dos activos.',
  incorrectas: ['No hay riesgo de base, porque los precios de los dos activos están muy correlacionados.', 'El ratio óptimo de cobertura es siempre 1, porque se cubre la misma cantidad física.', 'Conviene usar el futuro con el vencimiento más largo disponible, para no tener que rolar.'],
  explicacion: 'S₂ + F₁ − F₂ = F₁ + (S₂* − F₂) + (S₂ − S₂*): aparecen dos fuentes de riesgo. Por eso se usa h* en lugar de 1.',
  trampas: 'Con correlación menor que 1 siempre queda riesgo.' });
Q({ id: 'U2-P09', unidad: 2, tema: 'Riesgo de base', dificultad: 1, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'Cobertura larga: F₁ = 80. Al comprar el activo, S₂ = 86 y F₂ = 84. ¿Cuál es el precio efectivo de compra?',
  correcta: '82', incorrectas: ['86', '90', '80'],
  explicacion: 'Paga 86 y gana 84 − 80 = 4 en el futuro: 82. Es F₁ + b₂ = 80 + 2.',
  trampas: '86 es sin cobertura. 90 suma la ganancia del futuro en lugar de restarla. 80 ignora la base final.' });
Q({ id: 'U2-P10', unidad: 2, tema: 'Ratio de cobertura', dificultad: 1, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'El desvío de los cambios del contado es 0,032; el del futuro, 0,040, y la correlación, 0,85. ¿Cuál es el ratio de cobertura de mínima varianza?',
  correcta: '0,68', incorrectas: ['0,85', '1,06', '0,80'],
  explicacion: 'h* = 0,85 × 0,032 / 0,040 = 0,68.',
  trampas: '0,85 es la correlación sola. 1,06 invierte los desvíos. 0,80 olvida la correlación.' });
Q({ id: 'U2-P11', unidad: 2, tema: 'Ratio de cobertura', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'Con h* = 0,68, una exposición de 2.000.000 de litros y contratos de 42.000 litros, ¿cuántos contratos conviene usar (redondeado)?',
  correcta: '32', incorrectas: ['48', '22', '70'],
  explicacion: 'N* = 0,68 × 2.000.000 / 42.000 = 32,4: 32 contratos.',
  trampas: '48 ignora h*. 22 usa h*² (la efectividad). 70 divide por h* en lugar de multiplicar.' });
Q({ id: 'U2-P12', unidad: 2, tema: 'Ratio de cobertura', dificultad: 1, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'Una cobertura de mínima varianza elimina el 81 % de la varianza. ¿Cuál es la correlación entre los cambios del contado y del futuro?',
  correcta: '0,90', incorrectas: ['0,81', '0,66', '0,19'],
  explicacion: 'La efectividad es ρ²: ρ = √0,81 = 0,90.',
  trampas: '0,81 es ρ². 0,66 eleva otra vez al cuadrado. 0,19 es la parte de la varianza que queda.' });
Q({ id: 'U2-P13', unidad: 2, tema: 'Índices y beta', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'Una cartera de USD 2.000.000 tiene β = 1,2. El futuro sobre el índice cotiza 4.000 con un multiplicador de 50. ¿Qué hay que hacer para llevar la beta a cero?',
  correcta: 'Vender 12 contratos.', incorrectas: ['Vender 10 contratos.', 'Comprar 12 contratos.', 'Vender 8 contratos.'],
  explicacion: 'Cada contrato vale 4.000 × 50 = 200.000. N* = 1,2 × 2.000.000 / 200.000 = 12, vendidos.',
  trampas: '10 ignora la beta. Comprar sube la beta. 8 divide por la beta en lugar de multiplicar.' });
Q({ id: 'U2-P14', unidad: 2, tema: 'Índices y beta', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'Con la misma cartera (USD 2.000.000, β = 1,2, contrato de 200.000), ¿qué hay que hacer para bajar la beta a 0,6?',
  correcta: 'Vender 6 contratos.', incorrectas: ['Vender 12 contratos.', 'Comprar 6 contratos.', 'Vender 5 contratos.'],
  explicacion: '(β − β*)·V_A/V_F = (1,2 − 0,6) × 10 = 6 contratos vendidos.',
  trampas: '12 lleva la beta a cero. Comprar la subiría a 1,8. 5 usa el cociente de betas (0,6/1,2) en lugar de la diferencia.' });
{
  const y = 0.06 - Math.log(10150 / 10000) / 0.5;
  Q({ id: 'U2-P15', unidad: 2, tema: 'Conveniencia', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo',
    enunciado: 'Cobre: contado 10.000, futuro a 6 meses 10.150, r = 5 % y almacenamiento 1 % anual (tasas continuas). ¿Cuál es el rendimiento de conveniencia implícito?',
    correcta: pct(y, 1), incorrectas: [pct(0.06 - Math.log(10150 / 10000), 1), pct(0.05 - Math.log(10150 / 10000) / 0.5, 1), pct(-y, 1)],
    explicacion: 'y = r + u − ln(F₀/S₀)/T = 0,06 − ln(1,015)/0,5.',
    trampas: `${pct(0.06 - Math.log(10150 / 10000), 1)} olvida dividir por T. ${pct(0.05 - Math.log(10150 / 10000) / 0.5, 1)} ignora el almacenamiento. ${pct(-y, 1)} cambia el signo.` });
}
Q({ id: 'U2-P16', unidad: 2, tema: 'Ratio de cobertura', dificultad: 2, tipo: 'práctica', fuente: 'Nuevo',
  enunciado: 'h* = 0,9. La exposición vale USD 9.000.000 y cada futuro, USD 95.000. ¿Cuántos contratos con ajuste por liquidación diaria (redondeado)?',
  correcta: '85', incorrectas: ['95', '77', '105'],
  explicacion: 'N* = 0,9 × 9.000.000 / 95.000 = 85,3.',
  trampas: '95 ignora h*. 77 aplica h* dos veces. 105 divide por h*.' });

// ---------- Preguntas basadas en la Guía U2 de la cátedra ----------
{
  // Guía U2, ej. 1: productor que vende futuros mayo a 320 (cobertura corta) y cierra por compensación.
  const corta = (F1, S2, F2) => S2 + (F1 - F2);
  const larga = (F1, S2, F2) => S2 - (F2 - F1);
  Q({ id: 'U2-P17', unidad: 2, tema: 'Riesgo de base', dificultad: 2, tipo: 'práctica', fuente: 'Guía U2, ej. 1',
    enunciado: 'Un productor de soja vende futuros mayo a 320 USD/t para cubrir su cosecha. Al cosechar, el contado está a 295 y el futuro mayo a 299; vende la soja al contado y cierra el futuro por compensación. ¿Cuál es su precio de venta final?',
    correcta: `${f(corta(320, 295, 299), 0)} USD/t`, incorrectas: ['295 USD/t', '320 USD/t', `${f(320 + (299 - 295), 0)} USD/t`],
    explicacion: 'Vende al contado a 295 y gana 320 − 299 = 21 con el futuro: 316. Equivale a F₁ + b₂ = 320 + (295 − 299). La base se debilitó (−4) y eso perjudica a la cobertura corta.',
    trampas: '295 ignora el futuro. 320 supone una cobertura perfecta, sin riesgo de base. 324 suma la base con el signo cambiado.' });
  Q({ id: 'U2-P18', unidad: 2, tema: 'Riesgo de base', dificultad: 2, tipo: 'práctica', fuente: 'Guía U2, ej. 1',
    enunciado: 'El mismo productor vendió futuros mayo a 320 USD/t. Al cosechar, el contado está a 298 y el futuro mayo a 289. ¿Cuál es su precio de venta final?',
    correcta: `${f(corta(320, 298, 289), 0)} USD/t`, incorrectas: ['298 USD/t', '320 USD/t', `${f(320 - (298 - 289), 0)} USD/t`],
    explicacion: 'Contado 298 más la ganancia del futuro (320 − 289 = 31): 329. La base pasó a +9 (se fortaleció) y eso favorece a la cobertura corta.',
    trampas: '298 ignora el futuro. 320 supone base nula al cierre. 311 resta la base en lugar de sumarla.' });
  Q({ id: 'U2-P19', unidad: 2, tema: 'Riesgo de base', dificultad: 2, tipo: 'práctica', fuente: 'Guía U2, ej. 2',
    enunciado: 'Un acopiador va a comprar maíz en abril y compra futuros abril a 150 USD/t. Llegado el momento, el contado está a 107 y el futuro abril a 110; compra al contado y cierra el futuro. ¿Cuál es su precio de compra final?',
    correcta: `${f(larga(150, 107, 110), 0)} USD/t`, incorrectas: ['107 USD/t', '150 USD/t', `${f(110 + (150 - 107), 0)} USD/t`],
    explicacion: 'Paga 107 al contado y pierde 150 − 110 = 40 con el futuro comprado: 147. Equivale a F₁ + b₂ = 150 + (107 − 110). La base se debilitó y eso favorece a la cobertura larga.',
    trampas: '107 ignora la pérdida del futuro. 150 supone base nula. 153 aplica la base con el signo cambiado.' });
  const cubierto = 0.5, F1 = 226.5, S2 = 200, F2 = 205;
  Q({ id: 'U2-P20', unidad: 2, tema: 'Cobertura', dificultad: 3, tipo: 'práctica', fuente: 'Guía U2, ej. 3',
    enunciado: 'Un campo cubre el 50 % de su cosecha esperada vendiendo futuros mayo a 226,50 USD/t. Al cosechar, el contado está a 200 y el futuro mayo a 205. Vende el 100 % al contado y cierra los futuros. ¿Cuál es el precio de venta promedio de toda la producción?',
    correcta: `${f(S2 + cubierto * (F1 - F2))} USD/t`, incorrectas: ['200,00 USD/t', `${f(S2 + (F1 - F2))} USD/t`, `${f(F1 - (F1 - F2) * cubierto)} USD/t`],
    explicacion: 'El futuro gana 226,50 − 205 = 21,50 por tonelada cubierta, que es la mitad de la producción: 200 + 0,5 × 21,50 = 210,75. Sin cobertura habría obtenido 200.',
    trampas: '200 ignora la cobertura. 221,50 supone que se cubrió el 100 %. 215,75 parte del precio del futuro en lugar del contado.' });
  // Guía U2, ej. 4: h* = ρ·σS/σF.
  const h = 0.85 * 0.27 / 0.33;
  Q({ id: 'U2-P21', unidad: 2, tema: 'Ratio de cobertura', dificultad: 2, tipo: 'práctica', fuente: 'Guía U2, ej. 4',
    enunciado: 'Una empresa tiene 8.000 t de un commodity. Desvío del contado: 0,27; del futuro: 0,33; correlación: 0,85. Cada futuro es por 100 t. ¿Qué operación minimiza el riesgo?',
    correcta: `Vender ${Math.round(h * 80)} contratos (h* = ${f(h, 4)}).`,
    incorrectas: [`Vender ${Math.round(0.85 * 0.33 / 0.27 * 80)} contratos (h* = ${f(0.85 * 0.33 / 0.27, 4)}).`, `Vender ${Math.round(0.27 / 0.33 * 80)} contratos (h* = ${f(0.27 / 0.33, 4)}).`, 'Vender 80 contratos (h* = 1,0000).'],
    explicacion: `h* = ρ·σ_S/σ_F = 0,85 × 0,27/0,33 = ${f(h, 4)}. N* = h*·8.000/100 = ${f(h * 80, 1)} ≈ ${Math.round(h * 80)} contratos (la guía da 56).`,
    trampas: 'La segunda invierte los desvíos. La tercera olvida la correlación. La última cubre todo con h* = 1.' });
  // Guía U2, ej. 5: cartera de 50 millones con β = 1,2; futuro del S&P 500 a 2.470 × 250.
  const V = 50e6, beta = 1.2, contrato = 2470 * 250;
  const N = b => (b - beta) * V / contrato;
  Q({ id: 'U2-P22', unidad: 2, tema: 'Índices y beta', dificultad: 3, tipo: 'práctica', fuente: 'Guía U2, ej. 5',
    enunciado: 'Un fondo de USD 50 millones tiene β = 1,2. El futuro del S&P 500 cotiza 2.470 (multiplicador 250). Si el CIO quiere llevar el beta de la posición a 1,5, ¿qué debe hacer?',
    correcta: `Comprar ${Math.round(N(1.5))} contratos.`, incorrectas: [`Vender ${Math.round(N(1.5))} contratos.`, `Comprar ${Math.round(1.5 * V / contrato)} contratos.`, `Comprar ${Math.round(beta * V / contrato)} contratos.`],
    explicacion: `N = (β* − β)·P/F = (1,5 − 1,2) × 50.000.000/(2.470 × 250) = ${f(N(1.5), 2)}: positivo, se compran 24 contratos.`,
    trampas: 'Vender bajaría el beta. 121 usa β* = 1,5 sin restar el beta actual. 97 es la cantidad para cubrir todo el riesgo (llevar β a 0), y además hay que venderlos.' });
  Q({ id: 'U2-P23', unidad: 2, tema: 'Índices y beta', dificultad: 2, tipo: 'práctica', fuente: 'Guía U2, ej. 5',
    enunciado: 'Un fondo de USD 50 millones tiene β = 1,2. El futuro del S&P 500 cotiza 2.470 (multiplicador 250). ¿Qué debe hacer el CIO para que el beta de la posición total sea 0,6?',
    correcta: `Vender ${Math.round(-N(0.6))} contratos.`, incorrectas: [`Vender ${Math.round(-N(0))} contratos.`, `Comprar ${Math.round(-N(0.6))} contratos.`, `Vender ${Math.round((beta + 0.6) * V / contrato)} contratos.`],
    explicacion: `N = (0,6 − 1,2) × 50.000.000/617.500 = ${f(N(0.6), 2)}: se venden 49 contratos. Para eliminar todo el riesgo (β = 0) harían falta 97.`,
    trampas: '97 lleva el beta a cero. Comprar subiría el beta. 146 suma los betas en lugar de restarlos.' });
  // Guía U2, ej. 10: estima 350 t, vende 14 futuros de 25 t a 170.
  const ventaF = 14 * 25, F0 = 170;
  const resultado = (prod, S) => prod * S + ventaF * (F0 - S);
  Q({ id: 'U2-P24', unidad: 2, tema: 'Cobertura', dificultad: 3, tipo: 'práctica', fuente: 'Guía U2, ej. 10',
    enunciado: 'Un productor estima cosechar 350 t y vende 14 futuros de 25 t a 170. Al vencimiento el contado está a 160, pero cosechó solo 300 t. ¿Cuál fue su precio de venta efectivo por tonelada?',
    correcta: f(resultado(300, 160) / 300), incorrectas: ['170,00', '160,00', f((300 * 160 - ventaF * 10) / 300)],
    explicacion: `Vende 300 × 160 = 48.000 y el futuro gana 350 × (170 − 160) = 3.500: ${f(resultado(300, 160), 0)} en total, ${f(resultado(300, 160) / 300)} por tonelada. Quedó sobrecubierto: las 50 t de más funcionaron como especulación (esta vez a favor).`,
    trampas: '170 sería el precio si hubiera cosechado las 350 t. 160 ignora el futuro. 148,33 resta la ganancia del futuro en lugar de sumarla.' });
  Q({ id: 'U2-P25', unidad: 2, tema: 'Cobertura', dificultad: 3, tipo: 'práctica', fuente: 'Guía U2, ej. 10',
    enunciado: 'El mismo productor (vendió 14 futuros de 25 t a 170) cosecha 300 t y al vencimiento el contado está a 180. ¿Cuál es su ingreso total?',
    correcta: f(resultado(300, 180), 0), incorrectas: [f(300 * 180, 0), f(300 * 170, 0), f(300 * 180 + ventaF * 10, 0)],
    explicacion: `Vende 300 × 180 = 54.000 y pierde 350 × 10 = 3.500 con los futuros: ${f(resultado(300, 180), 0)}, o sea ${f(resultado(300, 180) / 300)} por tonelada. Al estar sobrecubierto, queda por debajo de 170.`,
    trampas: '54.000 ignora la pérdida del futuro. 51.000 supone que la cobertura fija 170 por tonelada aunque se cubrieron 350 t. 57.500 suma la pérdida como si fuera ganancia.' });
  // Guía U2, ej. 14: aerolínea, h* = 0,75 × 1,1/1,2.
  const hA = 0.75 * 1.1 / 1.2;
  Q({ id: 'U2-P26', unidad: 2, tema: 'Ratio de cobertura', dificultad: 2, tipo: 'práctica', fuente: 'Guía U2, ej. 14',
    enunciado: 'Una aerolínea va a comprar 100.000 litros de combustible en 4 meses. Desvío de los cambios del contado: 1,1; del futuro: 1,2; correlación: 0,75. Cada futuro es por 22.000 litros. ¿Qué estrategia minimiza el riesgo?',
    correcta: `Comprar ${Math.round(hA * 100000 / 22000)} contratos.`, incorrectas: [`Vender ${Math.round(hA * 100000 / 22000)} contratos.`, `Comprar ${Math.round(100000 / 22000)} contratos.`, `Comprar ${Math.round(0.75 * 1.2 / 1.1 * 100000 / 22000)} contratos.`],
    explicacion: `h* = 0,75 × 1,1/1,2 = ${f(hA, 4)}; N* = ${f(hA, 4)} × 100.000/22.000 = ${f(hA * 100000 / 22000, 2)} ≈ 3. Como va a comprar, la cobertura es larga.`,
    trampas: 'Vender sería cubrirse de una baja, pero la aerolínea teme una suba. 5 ignora h*. 4 invierte los desvíos.' });
}
Q({ id: 'U2-T21', unidad: 2, tema: 'Ratio de cobertura', dificultad: 3, tipo: 'teórica', fuente: 'Guía U2, ej. 7',
  enunciado: 'Razone: "si el ratio de cobertura óptimo h* es 1, estamos frente a una cobertura perfecta".',
  correcta: 'Falso: también hace falta correlación perfecta (ρ = 1) entre los cambios de precio.',
  incorrectas: ['Verdadero: h* = 1 significa cubrir exactamente el 100 % de la exposición.', 'Verdadero, siempre que el futuro venza el mismo día en que se vende el activo.', 'Falso: solo es perfecta si la volatilidad del futuro es mayor que la del contado.'],
  explicacion: 'h* = ρ·σ_S/σ_F puede valer 1 con ρ < 1 (si σ_S/σ_F = 1/ρ). En ese caso queda riesgo sin cubrir: la varianza residual es σ_S²·(1 − ρ²).',
  trampas: 'Que h* valga 1 dice cuánto cubrir, no cuánto riesgo se elimina.' });
Q({ id: 'U2-T22', unidad: 2, tema: 'Riesgo de base', dificultad: 3, tipo: 'teórica', fuente: 'Guía U2, ej. 8',
  enunciado: 'Razone: "si no hay riesgo de base, el h* necesariamente vale 1".',
  correcta: 'Verdadero: el futuro y el activo se mueven igual, así que ρ = 1 y σ_S = σ_F.',
  incorrectas: ['Falso: depende de la correlación, que puede ser menor que 1 aun sin riesgo de base.', 'Falso: sin riesgo de base no hace falta cubrirse y el h* vale cero.', 'Falso: h* es el cociente σ_S/σ_F, que en general es distinto de 1.'],
  explicacion: 'Sin riesgo de base el subyacente del futuro es el mismo activo y el plazo coincide: cualquier cambio del contado se refleja igual en el futuro.',
  trampas: 'Sin riesgo de base sí conviene cubrirse: la cobertura es perfecta, no innecesaria.' });
Q({ id: 'U2-T23', unidad: 2, tema: 'Cobertura', dificultad: 2, tipo: 'teórica', fuente: 'Guía U2, ej. 9',
  enunciado: 'Un productor no se cubre porque no puede estimar cuánto va a cosechar. ¿Qué riesgo está evitando?',
  correcta: 'Quedar sobrecubierto o subcubierto: la parte del futuro sin cosecha detrás queda como especulación.',
  incorrectas: ['El riesgo de base, que existe solo cuando el volumen a cubrir es incierto.', 'Las llamadas de margen, que solo se exigen cuando la cantidad cubierta es incierta.', 'Ninguno: cubrirse siempre conviene, sin importar el volumen cosechado.'],
  explicacion: 'Si cosecha menos de lo cubierto y el precio sube, pierde con los futuros sin tener mercadería que compense. Por eso muchos cubren solo una parte de lo esperado.',
  trampas: 'El riesgo de base y los márgenes existen aunque el volumen sea conocido.' });
