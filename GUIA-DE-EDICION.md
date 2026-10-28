# Guía para editar el libro a mano

> **¿Querés cambiar textos, fórmulas, preguntas, ejercicios, el cronograma o qué ven los alumnos sin tocar código?** Usá el **Modo Profesor**: botón «Modo Profesor» al pie de cualquier página (ver la sección 18). Esta guía es para cambios de fondo: páginas nuevas, simulaciones o diseño.

## 1. Antes de empezar

- **Para ver el libro:** doble clic en `index.html`. Se abre en el navegador. Funciona sin internet: las fórmulas (KaTeX), los gráficos (Chart.js) y las tipografías (IBM Plex y Literata) están incluidos en la carpeta `vendor/`, con sus licencias. El libro no se conecta a ningún servicio externo.
- **Para editar:** usá un editor de texto plano. Se recomienda **Visual Studio Code** (gratis). También sirve el Bloc de notas. **Nunca uses Word**, porque arruina el código.
- **Cómo trabajar:** editás el archivo, guardás (Ctrl+S) y recargás el navegador (F5) para ver el cambio.
- **Hacé una copia de la carpeta antes de cambios grandes.** Si algo se rompe, volvés a la copia.

## 2. Qué hay en cada archivo

| Archivo | Qué contiene | ¿Lo vas a editar? |
|---|---|---|
| `index.html` + `js/portada.js` | Portada: próxima clase, próxima evaluación y avance por unidad | Poco |
| `programa.html` + `js/programa.js` | Cronograma, bibliografía y convenciones | Si cambian fechas |
| `uN-teoria.html` (N = 1 a 8) | **Texto de la teoría de cada unidad** | **Sí, es lo principal** |
| `uN-simulacion.html` (y `u4-ejemplos.html`) | Textos y campos de las simulaciones | A veces (introducciones, valores iniciales) |
| `uN-ejercitacion.html` | Página de ejercitación (no tiene contenido propio) | No |
| `js/ejercicios-uN.js` | **Ejercicios con corrección automática de la unidad N** | Sí, para agregar o corregir ejercicios |
| `js/preguntas-uN.js` | **Preguntas de opción múltiple de la unidad N** | Sí |
| `herramientas.html` + `js/herramientas.js` + `js/herramientas2.js` | Caja de herramientas (calculadoras paso a paso) | Textos y valores iniciales |
| `simulacro.html` + `js/simulacro.js` + `css/simulacro.css` | Simulacros de parcial y final con nota y análisis por tema (ver 14 ter) | Si cambian la escala, la cantidad de preguntas o el tiempo |
| `batalla.html` + `js/batalla.js` + `css/batalla.css` | Juego de repaso con las preguntas de opción múltiple (ver 14 bis) | Si querés cambiar jefes o el balance |
| `formulario.html` + `js/formulario.js` | Formulario por unidad y glosario | Sí, si agregás fórmulas o términos |
| `js/comun.js` | **Menú del libro** (objeto `LIBRO` al principio) y componentes comunes | Solo para páginas, fechas o capítulos |
| `js/estrategias.js` | Estrategias predefinidas del simulador de la U VIII | Si querés cambiar primas o descripciones |
| `css/libro.css` | Colores y diseño (modo claro y oscuro) | Solo para cambiar colores |
| `js/calculos.js` | Todas las fórmulas financieras | No, salvo que quieras cambiar un cálculo |
| `js/uN-simulacion.js`, `js/u4-ejemplos.js` | Lógica de las simulaciones | No |

## 3. Editar texto

En los archivos `uX-teoria.html`, el texto está entre etiquetas. Cambiá solo lo que está **entre** las etiquetas:

```html
<p>Esto es un párrafo. Podés cambiar este texto libremente.</p>
```

| Querés… | Escribí |
|---|---|
| Un párrafo | `<p>Texto</p>` |
| **Negrita** | `<strong>texto</strong>` |
| *Cursiva* | `<em>texto</em>` |
| Título de sección (aparece solo en el índice lateral) | `<h2>Título</h2>` |
| Subtítulo | `<h3>Subtítulo</h3>` |
| Lista con viñetas | `<ul><li>Uno</li><li>Dos</li></ul>` |
| Lista numerada | `<ol><li>Uno</li><li>Dos</li></ol>` |
| Enlace | `<a href="u5-simulacion.html">texto del enlace</a>` |

**Regla de oro:** toda etiqueta que se abre se cierra (`<p>` … `</p>`). Si una página se ve rara después de editar, casi siempre es una etiqueta sin cerrar.

## 4. Cajas destacadas

Copiá y pegá uno de estos bloques. Solo cambia la palabra de la `class`:

```html
<div class="caja definicion">
  <p class="caja-titulo">Definición</p>
  <p>Texto de la definición.</p>
</div>
```

Tipos disponibles: `definicion` (azul), `ejemplo` (verde), `importante` (naranja), `hull` (gris, para lecturas), `prueba` (color de la unidad, para "Probá vos").

Para una resolución que se despliega con un clic:

```html
<details class="desplegable">
  <summary>Ver la resolución</summary>
  <p>Texto oculto hasta que el alumno hace clic.</p>
</details>
```

## 5. Fórmulas

Las fórmulas se escriben en LaTeX:

- **Dentro del texto:** entre `\(` y `\)` → `la prima \(c\) del call`
- **En su propio renglón, en un recuadro:**
  ```html
  <div class="formula">\[ c + K e^{-rT} = p + S_0 \]</div>
  ```

| Querés | Escribí |
|---|---|
| Subíndice \(S_0\) | `S_0` (si es más de un carácter: `S_{T}`) |
| Exponente \(e^{-rT}\) | `e^{-rT}` |
| Fracción | `\frac{a}{b}` |
| Raíz | `\sqrt{T}` |
| Letras griegas | `\sigma`, `\Delta`, `\delta` |
| Menor / mayor o igual | `\le`, `\ge` |
| **Menor que** | `\lt` (**no** uses el símbolo `<`, porque confunde al HTML) |
| Mayor que | `>` o `\gt` |
| Coma decimal | `4{,}27` (sin las llaves queda un espacio raro) |
| Sumatoria | `\sum_{i=1}^{n}` |
| Texto dentro de una fórmula | `\text{Payoff}` |

## 6. Gráficos de payoff dentro del texto

Para agregar un gráfico de una estrategia, escribí una sola línea:

```html
<figure class="grafico-payoff" data-patas="compra call 95 6,4; venta call 105 1,2" data-individuales>
  <figcaption>Texto debajo del gráfico</figcaption>
</figure>
```

Cada pata va separada por `;` con el formato `compra|venta  call|put  strike  prima  [cantidad]`:

- `compra call 100 5` → long call, strike 100, prima 5
- `venta put 70 7` → short put, strike 70, prima 7
- `compra put 100 2,9 2` → **2** puts comprados
- `compra accion 100` → acción comprada a 100
- `compra bono 1000 835,27` → bono cupón cero de nominal 1.000 comprado a 835,27

Opciones extra (se escriben dentro de `<figure ...>`):

- `data-individuales` → dibuja cada pata con línea punteada
- `data-modo="payoff"` → muestra el payoff bruto, sin primas
- `data-desde="60" data-hasta="140"` → rango del eje horizontal

## 7. Diagramas de swaps

```html
<figure class="diagrama-swap"
  data-entidades="Empresa A | Banco | Empresa B"
  data-flujos="Empresa A > Banco: 4 %; Banco > Empresa A: SOFR; Empresa A > afuera: SOFR + 0,2 %">
  <figcaption>Texto debajo</figcaption>
</figure>
```

- `data-entidades`: las cajas, de izquierda a derecha, separadas por `|`.
- `data-flujos`: cada flujo es `quién paga > quién cobra: etiqueta`, separados por `;`.
- `afuera` representa a prestamistas o inversiones externas (se dibuja como flecha vertical).

## 8. Tablas

```html
<div class="tabla-wrap">
  <table class="tabla">
    <thead><tr><th>Columna 1</th><th class="num">Columna numérica</th></tr></thead>
    <tbody>
      <tr><td>Fila 1</td><td class="num">4,27</td></tr>
      <tr><td>Fila 2</td><td class="num neg">−1,07</td></tr>
    </tbody>
  </table>
</div>
```

`num` alinea a la derecha; `pos` pinta en verde y `neg` en rojo.

## 9. Enlaces al simulador de estrategias

Para abrir el simulador con una estrategia ya cargada:

```html
<a class="boton-sim" href="u8-simulacion.html?estrategia=straddle">Abrir en el simulador →</a>
```

Nombres válidos: `long-call`, `short-call`, `long-put`, `short-put`, `ppn`, `covered-call`, `reverse-covered-call`, `protective-put`, `reverse-protective-put`, `collar`, `bull-call-spread`, `bull-put-spread`, `bear-put-spread`, `bear-call-spread`, `box-spread`, `call-butterfly`, `put-butterfly`, `top-straddle`, `short-strangle`, `straddle` (bottom straddle), `strangle` (long strangle), `strip`, `strap`, `short-butterfly`.

Para agregar una estrategia nueva al simulador, copiá un bloque `{ id: ..., grupo: ..., ... }` en `js/estrategias.js`. El campo `grupo` define en qué sección del menú aparece.

## 10. Agregar una página o activar "Ejercitación"

1. Copiá una página parecida (por ejemplo `u4-teoria.html`) con el nombre nuevo, por ejemplo `u4-ejercitacion.html`.
2. En el archivo nuevo, cambiá `data-seccion="teoria"` (en la etiqueta `<body>`) por el id de la página, por ejemplo `data-seccion="ejercitacion"`.
3. En `js/comun.js`, dentro de `LIBRO`, buscá la unidad y poné el nombre del archivo donde decía `null`:
   ```js
   { id: 'ejercitacion', nombre: 'Ejercitación', archivo: 'u4-ejercitacion.html' },
   ```

El menú, las pestañas y los botones "Anterior / Siguiente" se actualizan solos.

Para una **unidad nueva**, agregá otro bloque `{ id: 'u7', numero: 'VII', ... }` en `LIBRO.unidades`, en el lugar donde quieras que aparezca. Si querés que tenga su propio color, agregá también una línea en la sección "Colores por unidad" de `css/libro.css`.

## 11. Otros cambios habituales

- **Fechas, clases o capítulos de Hull** de una unidad: en `js/comun.js`, campos `clases` y `hull`. El campo `corto` es el nombre abreviado que se muestra en la barra superior.
- **Caja de herramientas:** la página es `herramientas.html` y su lógica está en `js/herramientas.js` y `js/herramientas2.js`. Los textos de introducción y los valores iniciales de cada calculadora se cambian en el `.html`.
- **Primas de las estrategias predefinidas:** en `js/estrategias.js`, objeto `PRIMAS_REF`. Si las cambiás, actualizá también los ejemplos del texto en `u8-teoria.html`.
- **Valores iniciales de una simulación:** en el `.html` de la simulación, el atributo `value="..."` de cada campo.
- **Colores:** en `css/libro.css`, sección "Colores por unidad".

## 12. Compartir el libro con los alumnos

Como es una carpeta de archivos HTML sin servidor, se puede publicar gratis:

- **Netlify Drop** (lo más fácil): entrás a app.netlify.com/drop y arrastrás la carpeta `libro-derivados`. Te da un link.
- **GitHub Pages:** subís la carpeta a un repositorio de GitHub y activás Pages.

Cada vez que edites algo, volvé a subir la carpeta.


## 13. Ejercicios con corrección automática

Cada unidad tiene su archivo `js/ejercicios-uN.js`. Un ejercicio es un bloque como este:

```js
E({
  id: 'U5-05', titulo: 'Paridad put-call', fuente: 'Guía U5, ej. 5', tema: 'Paridad', dificultad: 1,
  enunciado: `<p>Una acción vale $19 y un call a 3 meses con strike $20 vale $1. La tasa es 4 %. ¿Cuánto vale el put?</p>`,
  campos: [
    { etiqueta: 'Put', respuesta: 1 + 20 * Math.exp(-0.01) - 19, tol: 0.01,
      errores: [{ valor: 2, mensaje: 'Falta descontar el strike.' }] },
  ],
  pistas: ['Usá c + K·e^(−rT) = p + S₀.'],
  resolucion: `<p>Explicación paso a paso…</p>`,
  herramienta: { texto: 'Paridad put-call', enlace: 'herramientas.html#paridad-put-call-despejar-la-incognita' },
  aviso: 'Opcional: diferencias con la guía de la cátedra.',
});
```

- **`respuesta`** puede ser una cuenta: el libro la calcula. **`tol`** es la tolerancia aceptada.
- **`errores`** son respuestas equivocadas típicas: si el alumno pone ese valor, ve el mensaje.
- Para una pregunta de elegir: `{ etiqueta: '…', opciones: ['Call', 'Put'], respuesta: 'Call' }`.
- Para una pregunta abierta, en lugar de `campos` usá `respuestaModelo: '<p>…</p>'`: el alumno ve la respuesta y se autoevalúa.
- Si `fuente` contiene la palabra "Guía", el ejercicio cuenta como de la guía de la cátedra en el marcador.
- Dentro de las fórmulas (`\\( … \\)`) los decimales se escriben `0{,}5` para que KaTeX no agregue espacios.

## 14. Preguntas de opción múltiple

En `js/preguntas-uN.js`, cada pregunta es:

```js
Q({ id: 'U5-T01', unidad: 5, tema: 'Paridad', dificultad: 1, tipo: 'teórica', fuente: 'Hull cap. 11',
  enunciado: '…',
  correcta: 'La respuesta correcta',
  incorrectas: ['Distractor 1', 'Distractor 2', 'Distractor 3'],
  explicacion: 'Por qué es correcta.',
  trampas: 'Opcional: el error típico.' });
```

Siempre tienen que ser **exactamente tres** incorrectas y las cuatro opciones distintas. El libro las mezcla al mostrarlas.

Cuidá que la correcta no se delate por la forma: si es mucho más larga o más precisa que las otras, el alumno la adivina sin saber. Escribí distractores de largo y estilo parecidos (por ejemplo, agregándoles una justificación plausible pero equivocada), y en las prácticas usá el mismo formato numérico en las cuatro opciones.

Las mismas preguntas alimentan la **Batalla** (sección 14 bis): una pregunta nueva aparece sola en el jefe de su unidad y en los jefes de parcial que incluyen esa unidad.

## 14 ter. Simulacro de examen

`simulacro.html` + `js/simulacro.js` + `css/simulacro.css`. Arma exámenes de opción múltiple con las preguntas del banco: 1.er parcial (U I a III), 2.º parcial (U IV, V, VI y VIII) y final (todas). Las unidades de los parciales salen de `LIBRO.evaluaciones` en `js/comun.js`. La portada enlaza al simulacro de cada bloque (`simulacro.html#p1`, `#p2`, `#final`).

- **Modalidades:** completo (35 preguntas, 90 minutos) y mini (15 preguntas, 45 minutos). Se cambian en `MODALIDADES`, al principio de `js/simulacro.js`.
- **Escala de notas:** en `ESCALA` (porcentaje mínimo de aciertos para cada nota; menos del 60 % es desaprobado). `UMBRAL_REFORZAR` (60 %) decide qué temas se marcan para reforzar.
- **Selección:** mitad prácticas y mitad teóricas. Primero entran las preguntas que el alumno vio menos veces; entre ésas, se reparte entre unidades y dificultades en proporción al banco.
- **Ejercicios para completar:** se configuran en `ESPECIALES`, al principio de `js/simulacro.js`. Cada uno tiene su módulo, su tema y `prob`, la proporción de los simulacros de cada examen en que aparece (1 = siempre, 0 = nunca). Cuentan como una de las preguntas prácticas. Hoy hay dos:
  - **Cuadro de márgenes de un futuro** (`js/cuadro-margenes.js`): siempre en el 1.er parcial y en la mitad de los finales. Como la Guía U1, ej. 1, y la tabla 2.1 de Hull. Con datos al azar (oro, soja, maíz o dólar futuro; posición larga o corta; 2 a 5 contratos; 6 días), el alumno completa el saldo inicial y, para cada día, la ganancia diaria, la acumulada, el saldo y el llamado de margen. El llamado repone hasta el margen inicial; el saldo de cada día es antes del depósito, que se suma al día siguiente. Siempre hay uno o dos llamados. Es correcto si están bien los 25 casilleros (tolerancia 0,5). El mismo ejercicio está en la ejercitación de la Unidad I (`<div class="ej-cuadro-margenes"></div>`).
- **Diagrama de un swap para completar:** siempre en el 2.º parcial y en la mitad de los finales, nunca en el 1.º. Es el ejercicio de ventaja comparativa con intermediario (como la Guía U4, ej. 1, y el diagrama de la teoría de la U IV): se dan las tasas fija y variable que les ofrecen a A y B, quién quiere cada tipo de tasa y el margen del banco; el alumno elige el sentido de cada flecha (las cuatro patas del swap y los dos préstamos; se tocan para cambiarlo) y completa las tasas de las flechas y el costo neto de cada empresa. Las patas variables son SOFR sin spread y la ganancia se reparte en partes iguales. Los datos cambian en cada simulacro. Cuenta como una de las prácticas y es correcta solo si están bien las 6 tasas (tolerancia 0,0005 puntos porcentuales) y los 6 sentidos. El ejercicio vive en `js/diagrama-swap.js` (generación, solución, corrección y dibujo; usa `Swaps.ventajaComparativa` de `js/calculos.js`), y sus estilos están al final de `css/libro.css`. El mismo ejercicio está en la teoría de la Unidad IV, después del ejemplo de la cátedra, con botones para verificar, ver la solución y generar otro. Para ponerlo en cualquier otra página: `<div class="ej-diagrama-swap"></div>` y cargar `js/diagrama-swap.js` después de `js/comun.js`.
- **Qué se guarda en el navegador:**
  - `derivados:simulacro:intentos`: cada simulacro entregado, con nota, porcentaje, tiempos promedio (general, prácticas y teóricas), resultados por tema y por unidad, y el detalle de cada pregunta (respondida, correcta, segundos).
  - `derivados:simulacro:vistas`: cuántas veces le tocó cada pregunta.
  - `derivados:simulacro:enCurso`: el simulacro sin terminar, para retomarlo si se recarga la página.
  - `derivados:idAnonimo`: un código al azar por navegador, sin datos personales.
- **Descargas:** desde "Tus simulacros anteriores" el alumno puede bajar sus resultados en CSV (una fila por pregunta, para Excel) o JSON. Mientras el libro no tenga un servidor que reciba los datos, ésa es la forma de juntarlos para la tesis.

## 14 bis. Batalla (juego de repaso)

`batalla.html` + `js/batalla.js` + `css/batalla.css`. Es un juego por turnos con tiempo (*Active Time Battle*) que usa el banco de opción múltiple de todas las unidades. Cada página de ejercitación enlaza al jefe de su unidad (`batalla.html#u5`).

- **Jefes:** al principio de `js/batalla.js`, en `JEFES`. Cada jefe tiene `id` (se usa en el enlace, `batalla.html#p1`), `unidades` (de qué unidades salen las preguntas), `nombre`, `icono` (un emoji), `vida`, `ataque`, `color` (el token de la unidad, por ejemplo `'u5'`; sin color usa el acento general) y `golpe` (el texto del ataque).
- **Balance:** en `CONFIG` (vida del jugador, daño por error, velocidad de las barras, daño por dificultad, tiempos ideales, cantidad de ítems). Con la vida actual (200 para un jefe de unidad) hacen falta unas 8 a 12 respuestas correctas.
- **Rango:** 80 % del puntaje sale de la proporción de aciertos y hasta 20 puntos de la rapidez. Si perdés, el puntaje queda topeado en 59. S ≥ 90, A ≥ 75, B ≥ 60, C el resto.
- **Qué se guarda en el navegador:** `derivados:batalla:<jefe>` (intentos, victorias, mejor puntaje y rango) y `derivados:batalla:partidas` (las últimas 100 partidas, con el resultado de cada pregunta). Sirve de base para la recolección de datos de la tesis.

## 15. Componentes de la teoría

- **Objetivos de la unidad:** `<div class="objetivos"><p>Objetivos de la unidad</p><ul><li>…</li></ul></div>`.
- **Cajas:** además de `definicion`, `ejemplo`, `importante`, `error` y `prueba`, hay `argentina` (aplicaciones locales) y `hull` (qué leer del libro).
- **Fórmula con nombre:** `<div class="formula con-nombre"><span class="nombre-formula">Paridad put-call</span>\[ … \]</div>`.
- **Autoevaluación rápida al final de un tema:**
  ```html
  <div class="quiz-rapido">
    <p class="caja-titulo">Autoevaluación rápida</p>
    <div class="qr-pregunta" data-correcta="2">
      <p class="qr-enunciado">Pregunta…</p>
      <ol class="qr-op"><li>Opción 1</li><li>Opción 2 (la correcta)</li><li>Opción 3</li></ol>
      <p class="qr-explicacion">Explicación que aparece al responder.</p>
    </div>
  </div>
  ```
  `data-correcta` es el número de la opción correcta, empezando en 1.
- **Enlaces a una sección de otra página:** los títulos `<h2>` reciben un id automático a partir del texto (sin tildes, con guiones): "Las griegas" → `u6-teoria.html#las-griegas`.
- **Punto clave** (resumen de lo que se acaba de leer, con un botón "Marcar como claro" que recuerda cada alumno):
  ```html
  <aside class="punto-clave" data-id="u1-margenes">
    <ul><li>Idea 1.</li><li>Idea 2.</li></ul>
  </aside>
  ```
  `data-id` tiene que ser único en todo el libro.
- **Mini simulación dentro de la lectura:** `<div class="mini-sim" data-sim="margenes"></div>`. Las disponibles están en `js/lectura-interactiva.js` (`MINI_SIMS`): `forward-payoff`, `margenes`, `base`, `hstar`, `beta`, `composicion`, `forward-precio`, `swap-valor`, `payoff-opcion`, `paridad`, `binomial`, `bs`, `bs-q` y `estrategias`. Cada una enlaza a su simulación completa. Una mini simulación se puede usar en cualquier página de teoría, las veces que quieras.
- **Ilustraciones de la portada:** una por unidad, en `js/ilustraciones.js` (SVG simples con el color de la unidad).

## 16. Formulario y glosario

- Las fórmulas están en `formulario.html`, una "ficha" por fórmula: `<div class="ficha"><p class="ficha-titulo">Nombre</p><div class="formula">\[ … \]</div></div>`. El buscador encuentra cualquier ficha por su texto.
- Los términos del glosario están en `js/formulario.js`, en la lista `GLOSARIO`: `['Término', 'Definición', 'u5']` (el tercer dato es la unidad, para el enlace). Se ordenan solos alfabéticamente.

## 17. Convenciones del libro

- Tasas anuales con composición continua y año de 360 días (30/360), como pide la cátedra, salvo que el enunciado diga otra cosa.
- Números con coma decimal y punto de miles. En los campos de los ejercicios el alumno puede escribir con coma o con punto, y también fracciones como `4/12`.
- Cuando la guía de la cátedra tiene un error o un redondeo, el ejercicio lo aclara en `aviso` y acepta las dos respuestas si corresponde.

## 18. Modo Profesor (cómo funciona por dentro)

- **Qué es:** una capa de edición para docentes que no programan. Se activa con el botón «Modo Profesor» del pie (o agregando `#profesor` a la dirección) y una contraseña (la inicial es `profesor`; se cambia desde el panel). En la primera visita, la portada pregunta «¿Cómo querés entrar?»: «Soy profesor» abre el ingreso. La contraseña es una barrera de uso, no una medida de seguridad: todo funciona en el navegador, sin servidor.
- **Qué puede hacer el docente, sin tocar código:**
  - editar en el lugar los textos, fórmulas, cajas, figuras, puntos clave y preguntas de repaso de cualquier página; ocultar o reordenar bloques y secciones; agregar bloques nuevos;
  - elegir qué ven los alumnos: unidades, páginas de cada unidad, páginas generales (Simulacro, Batalla, Herramientas, Formulario, Programa) y cada examen del simulacro (1.er parcial, 2.º parcial, final). Lo oculto desaparece del menú, la portada, la batalla y los simulacros; el docente lo sigue viendo, marcado;
  - en la Ejercitación: ocultar ejercicios y preguntas, agregar notas, crear ejercicios y preguntas propios y **editar cualquier pregunta de opción múltiple del banco** (enunciado, opciones, explicación, tipo y dificultad), con «Volver a la original». Las preguntas editadas, ocultas o propias valen también para la batalla y los simulacros;
  - escribir un **aviso** que aparece arriba en la portada (Panel → Libro → Aviso en la portada);
  - cambiar el cronograma, los valores iniciales de los simuladores y si los alumnos ven pistas, resoluciones y la autoevaluación.
- **Nunca modifica los archivos del libro.** Los cambios del docente se guardan como una *configuración* (un JSON) que se aplica sobre el contenido original cada vez que se abre una página. Por eso siempre se puede restaurar el original, por bloque, por sección, por página o completo.
- **Dónde se guarda:**
  - mientras se edita, en el navegador del docente (`localStorage`, clave `derivados:docente:borrador`), con historial de deshacer/rehacer por pestaña;
  - para los alumnos, en el archivo **`js/config-docente.js`**. Con `window.CONFIG_DOCENTE = null;` el libro se ve tal como viene. El Modo Profesor genera ese archivo (Panel → Archivo → «Descargar config-docente.js»); hay que reemplazar con él el `js/config-docente.js` del libro publicado (en GitHub: carpeta `js` → Add file → Upload files → Commit changes);
  - para pasar los cambios a otra computadora: Panel → Archivo → Exportar / Importar (archivo `.json`).
- **Archivos:** `css/profesor.css` y la carpeta `js/profesor/`:
  - `util.js` almacenamiento seguro, huellas y saneamiento del HTML;
  - `configuracion.js` modelo de la configuración (incluye `preguntas`, `simulacro.ocultos` y `aviso`), autoguardado, historial, exportar e importar;
  - `contenido.js` aplica la configuración sobre la página (bloques, secciones, unidades, cronograma). Las mini simulaciones de la lectura y los ejercicios de diagrama de swap y de cuadro de márgenes se pueden ocultar pero no editar como texto;
  - `editor.js` edición en el lugar (texto con formato, fórmulas con vista previa, cajas, figuras, preguntas de repaso);
  - `simuladores.js` valores iniciales, rangos y validación de los simuladores;
  - `ejercicios.js` ajustes de la ejercitación y del banco de preguntas (`Profesor.ajustarPregunta`, usado por `js/preguntas-base.js`);
  - `interfaz.js` barra superior, panel lateral, ventanas y avisos;
  - `inicio.js` conecta todo con `js/comun.js` (`Profesor.antes()` y `Profesor.despues()` dentro de `iniciarLibro()`) y ofrece `Profesor.mostrar` y `Profesor.aviso()` a la portada, el simulacro y la batalla.
- **Si editás un archivo a mano después de usar el Modo Profesor:** los cambios del docente se ubican por posición y por una "huella" del texto original. Si un bloque cambió tanto que no se reconoce, el cambio del docente no se pierde: queda listado en Panel → Esta página → «Cambios sin ubicar».
- **Qué no se puede hacer desde el Modo Profesor** (requiere editar archivos): cambiar las fórmulas de cálculo de los simuladores (`js/calculos.js`), las respuestas numéricas de los ejercicios originales (`js/ejercicios-uN.js`; en su lugar, se oculta el ejercicio y se crea uno propio) o el diseño (`css/libro.css`).

