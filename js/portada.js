// Portada: aviso del docente, próxima clase, próxima evaluación y tarjetas de las unidades
// agrupadas por evaluación (con su ilustración y el enlace al simulacro de cada examen).

(function () {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fecha = iso => { const [a, m, d] = iso.split('-').map(Number); return new Date(a, m - 1, d); };
  const corta = iso => { const f = fecha(iso); return `${String(f.getDate()).padStart(2, '0')}/${String(f.getMonth() + 1).padStart(2, '0')}`; };
  const dias = iso => Math.round((fecha(iso) - hoy) / 86400000);
  const unidad = id => LIBRO.unidades.find(u => u.id === id);
  const primeraPagina = u => (u.paginas.find(p => p.archivo) || {}).archivo;
  const PROF = window.Profesor && Profesor.mostrar ? Profesor : null;
  const escapar = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- Próxima clase ----------
  const proxima = LIBRO.clases.find(c => dias(c.fecha) >= 0);
  const evaluacion = LIBRO.evaluaciones.find(e => dias(e.fecha) >= 0);
  let html = '';
  if (proxima) {
    const u = proxima.unidad && unidad(proxima.unidad);
    const d = dias(proxima.fecha);
    const cuando = d === 0 ? 'Hoy' : d === 1 ? 'Mañana' : `En ${d} días`;
    html += `<div class="hoy" style="--acento: var(--${proxima.unidad || 'u1'})">
      <div class="fecha"><b>${corta(proxima.fecha)}</b>${cuando}</div>
      <div class="que"><small>${proxima.examen ? 'Próxima evaluación' : `Próxima clase${proxima.n ? ' · Clase ' + proxima.n : ''}`}</small>
        ${u ? `<strong>Unidad ${u.numero} · ${u.nombre}</strong><br><span class="ayuda" style="font-size:0.85rem">${proxima.tema}</span>` : `<strong>${proxima.tema}</strong>`}</div>
      ${u && primeraPagina(u) ? `<a class="btn-primario" style="text-decoration:none" href="${primeraPagina(u)}">Ir a la unidad</a>` : '<a class="btn" href="programa.html">Ver el programa</a>'}
    </div>`;
  }
  if (evaluacion && (!proxima || !proxima.examen)) {
    const us = evaluacion.unidades.map(id => unidad(id)).filter(Boolean).map(u => u.numero).join(', ');
    html += `<p class="ayuda" style="margin:6px 0 0">${evaluacion.nombre}: ${corta(evaluacion.fecha)} (faltan ${dias(evaluacion.fecha)} días)${us ? ` · Unidades ${us}` : ''}.</p>`;
  }

  // Aviso del docente (Modo Profesor → Libro → Aviso en la portada).
  const aviso = PROF && Profesor.aviso ? Profesor.aviso() : '';
  if (aviso) html = `<div class="aviso-docente"><p class="caja-titulo">Aviso del docente</p><p>${escapar(aviso).replace(/\n/g, '<br>')}</p></div>` + html;

  // Primera visita: elegir cómo entrar. "Soy profesor" abre el ingreso con contraseña.
  const enEdicion = PROF && Profesor.modo !== 'alumno';
  if (PROF && !enEdicion && !Guardado.leer('modoElegido', false)) {
    html = `<div class="elegir-modo">
        <p class="caja-titulo">¿Cómo querés entrar?</p>
        <div class="modos">
          <button type="button" data-modo="alumno"><b>Soy alumno</b><span>Leer las unidades, simular, ejercitar y rendir simulacros.</span></button>
          <button type="button" data-modo="profesor"><b>Soy profesor</b><span>Editar contenidos y preguntas, y elegir qué ven los alumnos (pide contraseña).</span></button>
        </div>
        <p class="ayuda" style="margin:8px 0 0">Más adelante, el docente entra con el botón «Modo profesor» al pie de cualquier página.</p>
      </div>` + html;
  }
  $('hoy').innerHTML = html;
  $('hoy').addEventListener('click', ev => {
    const b = ev.target.closest('[data-modo]');
    if (!b) return;
    Guardado.escribir('modoElegido', true);
    const caja = $('hoy').querySelector('.elegir-modo');
    if (caja) caja.remove();
    if (b.dataset.modo === 'profesor') location.hash = '#profesor';
  });

  // ---------- Progreso de lectura ----------
  const progreso = u => {
    const pags = u.paginas.filter(p => p.archivo);
    const leidas = pags.filter(p => Guardado.leer(`leido:${u.id}-${p.id}`, false)).length;
    return pags.length ? leidas / pags.length : 0;
  };

  const tarjeta = u => `
    <article class="tarjeta ${u._profOculta ? 'oculta' : ''}" style="--color: var(--${u.id})">
      ${u._profOculta ? '<span class="chip aviso" style="align-self:flex-start;margin-bottom:8px">Oculta para los alumnos</span>' : ''}
      ${typeof ILUSTRACIONES !== 'undefined' && ILUSTRACIONES[u.id] ? `<div class="ilustracion">${ILUSTRACIONES[u.id]}</div>` : ''}
      <span class="num-unidad">Unidad ${u.numero}</span>
      <h3>${u.nombre}</h3>
      <div class="progreso-u" title="Páginas marcadas como leídas"><div style="width:${Math.round(progreso(u) * 100)}%"></div></div>
      <p>${u.descripcion}</p>
      <div class="meta">${u.clases}<br>${u.hull}</div>
      <div class="enlaces">
        ${u.paginas.map(p => (p.archivo ? `<a href="${p.archivo}">${p.nombre}</a>` : `<span>${p.nombre} (próximamente)</span>`)).join('')}
      </div>
    </article>`;

  // Bloques: uno por evaluación que incluye unidades (en el orden del menú) y, al final,
  // las unidades que no entran en ninguna. Con el cronograma original queda: Primer
  // parcial (I, II, III), Segundo parcial (IV, V, VI, VIII) y, para el final, la VII.
  // Se arma a partir de LIBRO para que respete lo que configure el docente.
  const orden = id => LIBRO.unidades.findIndex(u => u.id === id);
  const enOrden = ids => ids.filter(id => unidad(id)).sort((a, b) => orden(a) - orden(b));
  const conUnidades = LIBRO.evaluaciones.filter(e => enOrden(e.unidades || []).length);
  const SIMULACROS = ['p1', 'p2'];
  const bloques = conUnidades.map(e => ({ titulo: e.nombre, ev: e, unidades: enOrden(e.unidades), simulacro: SIMULACROS[LIBRO.evaluaciones.indexOf(e)] || 'final' }));
  const usadas = new Set(bloques.flatMap(b => b.unidades));
  const restantes = LIBRO.unidades.map(u => u.id).filter(id => !usadas.has(id));
  if (restantes.length) {
    const ultima = conUnidades[conUnidades.length - 1];
    bloques.push({
      titulo: ultima ? `Después del ${ultima.nombre.charAt(0).toLowerCase() + ultima.nombre.slice(1)} · para el final` : 'Unidades del libro',
      ev: ultima ? LIBRO.evaluaciones[LIBRO.evaluaciones.length - 1] : null,
      unidades: restantes,
      simulacro: 'final',
    });
  }
  // El enlace al simulacro aparece una sola vez por examen y solo si está habilitado.
  const yaEnlazados = new Set();
  const enlaceSimulacro = b => {
    if (!b.simulacro || yaEnlazados.has(b.simulacro)) return '';
    if (PROF && !(Profesor.mostrar.pagina('simulacro') && Profesor.mostrar.examen(b.simulacro))) return '';
    yaEnlazados.add(b.simulacro);
    return ` · <a href="simulacro.html#${b.simulacro}">Hacer un simulacro${b.simulacro === 'final' ? ' del final' : ''}</a>`;
  };
  $('bloques').innerHTML = bloques.map(b => `
    <section class="bloque-parcial">
      <header><h2>${b.titulo}</h2><span>${b.ev ? `${b.ev.nombre === b.titulo ? '' : b.ev.nombre + ' · '}${corta(b.ev.fecha)}` : ''}${enlaceSimulacro(b)}</span></header>
      <div class="tarjetas">${b.unidades.map(id => tarjeta(unidad(id))).join('')}</div>
    </section>`).join('');
})();
