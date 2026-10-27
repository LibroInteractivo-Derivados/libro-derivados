// Portada: próxima clase, próxima evaluación y tarjetas de las unidades agrupadas por evaluación.

(function () {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fecha = iso => { const [a, m, d] = iso.split('-').map(Number); return new Date(a, m - 1, d); };
  const corta = iso => { const f = fecha(iso); return `${String(f.getDate()).padStart(2, '0')}/${String(f.getMonth() + 1).padStart(2, '0')}`; };
  const dias = iso => Math.round((fecha(iso) - hoy) / 86400000);
  const unidad = id => LIBRO.unidades.find(u => u.id === id);
  const primeraPagina = u => (u.paginas.find(p => p.archivo) || {}).archivo;

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
  // Aviso del profesor (panel del profesor → Calendario y aviso).
  if (typeof Curso !== 'undefined') {
    const aviso = Curso.config().aviso;
    if (aviso.activo && aviso.texto.trim()) html = `<div class="aviso-docente"><p class="caja-titulo">Aviso del docente</p><p>${aviso.texto.trim().replace(/\n/g, '<br>')}</p></div>` + html;
    // Primera visita: elegir cómo entrar.
    if (Curso.modo() === null) {
      html = `<div class="elegir-modo">
          <p class="caja-titulo">¿Cómo querés entrar?</p>
          <div class="modos">
            <button type="button" data-modo="alumno"><b>Soy alumno</b><span>Leer las unidades, simular, ejercitar y rendir simulacros.</span></button>
            <button type="button" data-modo="profesor"><b>Soy profesor</b><span>Editar contenidos y preguntas, y elegir qué ven los alumnos.</span></button>
          </div>
          <p class="ayuda" style="margin:8px 0 0">Podés cambiar después con el botón de arriba a la derecha. El acceso de profesores con usuario y clave se suma más adelante.</p>
        </div>` + html;
    }
  }
  $('hoy').innerHTML = html;
  $('hoy').addEventListener('click', ev => {
    const b = ev.target.closest('[data-modo]');
    if (b) Curso.cambiarModo(b.dataset.modo);
  });

  // ---------- Progreso de lectura ----------
  const progreso = u => {
    const pags = u.paginas.filter(p => p.archivo);
    const leidas = pags.filter(p => Guardado.leer(`leido:${u.id}-${p.id}`, false)).length;
    return pags.length ? leidas / pags.length : 0;
  };

  const tarjeta = u => `
    <article class="tarjeta ${u.oculta ? 'oculta' : ''}" style="--color: var(--${u.id})">
      ${u.oculta ? '<span class="chip aviso" style="align-self:flex-start;margin-bottom:8px">Oculta para los alumnos</span>' : ''}
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

  const bloques = [
    { titulo: 'Primer parcial', ev: LIBRO.evaluaciones[0], unidades: ['u1', 'u2', 'u3'], simulacro: 'p1' },
    { titulo: 'Segundo parcial', ev: LIBRO.evaluaciones[1], unidades: ['u4', 'u5', 'u6', 'u8'], simulacro: 'p2' },
    { titulo: 'Después del segundo parcial · para el final', ev: LIBRO.evaluaciones[3], unidades: ['u7'], simulacro: 'final' },
  ];
  // Unidades ocultas para los alumnos: no aparecen (y un bloque sin unidades no se muestra).
  bloques.forEach(b => { b.unidades = b.unidades.filter(id => unidad(id)); });
  $('bloques').innerHTML = bloques.filter(b => b.unidades.length).map(b => `
    <section class="bloque-parcial">
      <header><h2>${b.titulo}</h2><span>${b.ev ? `${b.ev.nombre === b.titulo ? '' : b.ev.nombre + ' · '}${corta(b.ev.fecha)}` : ''}${b.simulacro && (typeof Curso === 'undefined' || (Curso.mostrar.examen(b.simulacro) && Curso.mostrar.general('simulacro'))) ? ` · <a href="simulacro.html#${b.simulacro}">Hacer un simulacro${b.simulacro === 'final' ? ' del final' : ''}</a>` : ''}</span></header>
      <div class="tarjetas">${b.unidades.map(id => tarjeta(unidad(id))).join('')}</div>
    </section>`).join('');
})();
