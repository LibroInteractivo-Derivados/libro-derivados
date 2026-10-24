// Programa: cronograma y bibliografía armados a partir del objeto LIBRO (js/comun.js).
(function () {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const fecha = iso => { const [a, m, d] = iso.split('-').map(Number); return new Date(a, m - 1, d); };
  const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  const corta = iso => { const f = fecha(iso); return `${DIAS[f.getDay()]} ${String(f.getDate()).padStart(2, '0')}/${String(f.getMonth() + 1).padStart(2, '0')}`; };
  const proxima = LIBRO.clases.find(c => fecha(c.fecha) >= hoy);
  const unidad = id => LIBRO.unidades.find(u => u.id === id);
  const primera = u => (u.paginas.find(p => p.archivo) || {}).archivo;

  const filas = LIBRO.clases.map(c => {
    const u = c.unidad && unidad(c.unidad);
    return {
      clase: c === proxima ? 'actual' : c.examen ? 'examen' : '',
      celdas: [
        c.n ?? '—',
        corta(c.fecha),
        u ? `<span class="punto-u" style="background: var(--${u.id})"></span>${primera(u) ? `<a href="${primera(u)}">U ${u.numero}</a>` : `U ${u.numero}`}` : '',
        c.tema,
      ],
    };
  });
  $('cronograma').innerHTML = `<div class="tabla-wrap"><table class="tabla cronograma"><thead><tr><th>Clase</th><th>Fecha</th><th>Unidad</th><th>Temas y actividades</th></tr></thead><tbody>${filas
    .map(f => `<tr class="${f.clase}">${f.celdas.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

  $('bibliografia').innerHTML = `<div class="tabla-wrap"><table class="tabla"><thead><tr><th>Unidad</th><th>Clases</th><th>Hull</th></tr></thead><tbody>${LIBRO.unidades
    .map(u => `<tr><td><span class="punto-u" style="background: var(--${u.id})"></span><strong>${u.numero}</strong> · ${u.nombre}</td><td>${u.clases}</td><td>${u.hull}</td></tr>`).join('')}</tbody></table></div>`;
})();
