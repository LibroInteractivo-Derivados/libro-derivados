// ============================================================================
// Modo Profesor · Inicio
// ----------------------------------------------------------------------------
// Conecta el Modo Profesor con el libro. js/comun.js llama:
//   · Profesor.antes()   al empezar iniciarLibro(): aplica la configuración del
//                        docente sobre el contenido original, antes de dibujar
//                        fórmulas, índice, gráficos y autoevaluaciones;
//   · Profesor.despues() al terminar iniciarLibro(): arma la interfaz del docente
//                        y carga los valores de los simuladores.
// js/ejercitacion.js llama Profesor.ajustarEjercitacion(ejercicios, preguntas).
//
// Modos:
//   'alumno'  lo que ve cualquier persona (sin rastros de edición, salvo el botón
//             discreto de acceso, que el docente puede ocultar);
//   'edicion' el docente ingresó con su contraseña;
//   'vista'   el docente previsualiza la página como alumno, sin salir.
//
// Si algo falla, el libro sigue funcionando como siempre: cada paso está protegido.
// ============================================================================

(function (P) {
  'use strict';

  const U = P.Util;
  const C = P.Config;
  const K = P.Contenido;

  P.modo = 'alumno';
  let fallo = false;

  P.antes = function () {
    try {
      C.cargar();
      const sesion = U.leerSesion('derivados:docente:sesion') === '1';
      const vista = U.leerSesion('derivados:docente:vista') === 'alumno';
      P.modo = sesion ? (vista ? 'vista' : 'edicion') : 'alumno';
      const edicion = P.modo === 'edicion';
      if (edicion) { document.body.classList.add('modo-profesor'); document.documentElement.classList.add('modo-profesor'); }
      K.aplicarLibro(edicion);
      if (K.prepararBloques()) K.aplicarPagina(edicion);
      if (!edicion && K.paginaOculta()) K.mostrarAvisoPaginaOculta();
    } catch (e) {
      fallo = true;
      console.error('Modo Profesor: no se pudo aplicar la configuración del docente.', e);
    }
  };

  P.despues = function () {
    if (fallo) return;
    try { P.Simuladores.prepararEstaticos(); } catch (e) { console.error('Modo Profesor (simuladores):', e); }
    try { P.Interfaz.iniciar(P.modo); } catch (e) { console.error('Modo Profesor (interfaz):', e); }
    document.addEventListener('DOMContentLoaded', () => {
      try { P.Simuladores.completar(); } catch (e) { console.error('Modo Profesor (simuladores):', e); }
      if (P.modo !== 'edicion') return;
      try { P.Ejercicios.decorar(); } catch (e) { console.error('Modo Profesor (ejercitación):', e); }
      try { P.Interfaz.listo(); } catch (e) { console.error('Modo Profesor (interfaz):', e); }
    });
  };

  // --------------------------------------------------------------------------
  // Visibilidad para las páginas que no son de contenido (simulacro, batalla, portada).
  // En el modo edición el docente ve todo; los alumnos, solo lo habilitado.
  // --------------------------------------------------------------------------
  const cfg = () => { try { return C.obtener(); } catch (e) { return null; } };
  P.visible = {
    unidad: id => { const c = cfg(); return !c || !c.unidades.ocultas.includes(id); },
    pagina: clave => { const c = cfg(); return !c || !c.unidades.paginasOcultas.includes(clave); },
    examen: id => { const c = cfg(); return !c || !((c.simulacro || {}).ocultos || []).includes(id); },
  };
  P.mostrar = {
    unidad: id => P.modo === 'edicion' || P.visible.unidad(id),
    pagina: clave => P.modo === 'edicion' || P.visible.pagina(clave),
    examen: id => P.modo === 'edicion' || P.visible.examen(id),
  };
  P.aviso = () => { const c = cfg(); return c && c.aviso && c.aviso.activo && (c.aviso.texto || '').trim() ? c.aviso.texto.trim() : ''; };

  // Banco de preguntas (js/preguntas-base.js): ediciones del docente, preguntas ocultas
  // y propias, para la autoevaluación, la batalla y los simulacros.
  P.ajustarPregunta = q => { if (fallo) return q; try { return P.Ejercicios.ajustarPreguntaBanco(q); } catch (e) { console.error(e); return q; } };
  P.preguntasPropias = () => { if (fallo) return []; try { return P.Ejercicios.preguntasPropiasDelBanco(); } catch (e) { console.error(e); return []; } };

  // Devuelve { ejercicios, preguntas, opciones } o null si no hay nada que ajustar.
  P.ajustarEjercitacion = function (ejercicios, preguntas) {
    if (fallo) return null;
    try { return P.Ejercicios.ajustar(ejercicios, preguntas, P.modo === 'edicion'); }
    catch (e) { console.error('Modo Profesor (ejercitación):', e); return null; }
  };
})(window.Profesor = window.Profesor || {});
