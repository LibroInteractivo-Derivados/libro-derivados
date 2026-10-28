// ============================================================================
// Modo Profesor · Configuración del docente
// ----------------------------------------------------------------------------
// Los cambios del docente NUNCA modifican los archivos originales del libro: se
// guardan como una "configuración" (un objeto JSON) que se aplica sobre el
// contenido original cada vez que se abre una página. Por eso siempre se puede
// restaurar el original.
//
// De dónde sale la configuración que se aplica:
//   1. Borrador local: lo que el docente edita en ESTE navegador (localStorage).
//   2. Configuración publicada: el archivo js/config-docente.js que se distribuye
//      con el libro. Es la que ven los alumnos en sus propias computadoras.
//   3. Si no hay ninguna, el libro se muestra tal como viene.
//
// Estructura (versión 1):
// {
//   formato: 'derivados-docente', version: 1,
//   meta: { creado, actualizado },
//   acceso: { hash, ocultarBoton },
//   libro: { materia, cuatrimestre, clases, evaluaciones, unidades: { u1: { nombre, ... } } },
//   unidades: { orden: ['u1', ...] | null, ocultas: ['u7'], paginasOcultas: ['u3-simulacion', 'batalla'] },
//   preguntas: { 'U1-T01': { enunciado, correcta, incorrectas, explicacion, trampas, tipo, dificultad } },
//                (ediciones de preguntas del banco: valen para la autoevaluación, la batalla y los simulacros)
//   simulacro: { ocultos: ['final'] },     exámenes del simulacro que no ven los alumnos
//   aviso:     { activo, texto },          aviso del docente en la portada
//   paginas: {
//     'u6-teoria': {
//       bloques:   { b12: { huella, html, envolver, atributos, oculto } },
//       nuevos:    [ { id, tipo, despues, ancla (huella del bloque de referencia), despuesSeccion, html, creado } ],
//       secciones: { orden: [...] | null, ocultas: [...] },
//       simuladores: { 'w-arbol': { campos: { 'a-sigma': { valor, min, max } } } },
//       ejercitacion: { resoluciones, pistas, autoevaluacion, ocultos, preguntasOcultas,
//                       editados: { 'U6-03': { enunciado, resolucion, modelo } },
//                       notas: { 'U6-03': html }, propios: [...], preguntasPropias: [...] }
//     }
//   }
// }
// ============================================================================

(function (P) {
  'use strict';

  const U = P.Util;
  const C = {};

  C.FORMATO = 'derivados-docente';
  C.VERSION = 1;
  const CLAVE_BORRADOR = 'derivados:docente:borrador';
  const CLAVE_HISTORIAL = 'derivados:docente:historial';
  const MAX_HISTORIAL = 40;

  let actual = null;              // configuración en uso
  let origen = 'original';        // 'borrador' | 'publicada' | 'original'
  let publicada = null;           // la del archivo js/config-docente.js (si hay)
  const estadoGuardado = { ok: true, cuando: null, persistente: true };
  const oyentes = [];             // funciones que se avisan cuando cambia la configuración

  // --------------------------------------------------------------------------
  // Modelo
  // --------------------------------------------------------------------------
  C.vacia = function () {
    const ahora = new Date().toISOString();
    return {
      formato: C.FORMATO,
      version: C.VERSION,
      meta: { creado: ahora, actualizado: ahora },
      acceso: { hash: null, ocultarBoton: false },
      libro: {},
      unidades: { orden: null, ocultas: [], paginasOcultas: [] },
      paginas: {},
      preguntas: {},
      simulacro: { ocultos: [] },
      aviso: { activo: false, texto: '' },
    };
  };

  const esObjeto = x => x && typeof x === 'object' && !Array.isArray(x);
  const listaDeTextos = x => (Array.isArray(x) ? x.filter(v => typeof v === 'string') : []);
  const texto = (x, max = 200000) => (typeof x === 'string' ? x.slice(0, max) : undefined);
  const numeroONulo = x => (typeof x === 'number' && Number.isFinite(x) ? x : x === null ? null : undefined);

  // Limpia una configuración que viene de afuera (archivo importado, almacenamiento
  // o archivo publicado): descarta lo desconocido y sanea todo el HTML.
  C.normalizar = function (crudo) {
    if (!esObjeto(crudo) || crudo.formato !== C.FORMATO) return null;
    const c = C.vacia();
    if (esObjeto(crudo.meta)) {
      c.meta.creado = texto(crudo.meta.creado, 40) || c.meta.creado;
      c.meta.actualizado = texto(crudo.meta.actualizado, 40) || c.meta.actualizado;
    }
    if (esObjeto(crudo.acceso)) {
      c.acceso.hash = texto(crudo.acceso.hash, 40) || null;
      c.acceso.ocultarBoton = crudo.acceso.ocultarBoton === true;
    }
    // Datos generales del libro (cronograma, nombres de unidades...).
    if (esObjeto(crudo.libro)) {
      const l = crudo.libro;
      ['materia', 'cuatrimestre'].forEach(k => { if (typeof l[k] === 'string') c.libro[k] = U.textoPlano(l[k]).slice(0, 200); });
      if (Array.isArray(l.clases)) {
        c.libro.clases = l.clases.filter(esObjeto).slice(0, 80).map(x => ({
          n: typeof x.n === 'number' ? x.n : null,
          fecha: /^\d{4}-\d{2}-\d{2}$/.test(x.fecha) ? x.fecha : '2026-01-01',
          unidad: /^u[1-9]$/.test(x.unidad) ? x.unidad : null,
          tema: U.textoPlano(texto(x.tema, 400) || ''),
          examen: x.examen === true,
        }));
      }
      if (Array.isArray(l.evaluaciones)) {
        c.libro.evaluaciones = l.evaluaciones.filter(esObjeto).slice(0, 20).map(x => ({
          fecha: /^\d{4}-\d{2}-\d{2}$/.test(x.fecha) ? x.fecha : '2026-01-01',
          nombre: U.textoPlano(texto(x.nombre, 200) || 'Evaluación'),
          unidades: listaDeTextos(x.unidades).filter(id => /^u[1-9]$/.test(id)),
        }));
      }
      if (esObjeto(l.unidades)) {
        c.libro.unidades = {};
        Object.entries(l.unidades).forEach(([id, d]) => {
          if (!esObjeto(d) || !/^u[1-9]$/.test(id)) return;
          const u = {};
          ['nombre', 'corto', 'descripcion', 'clases', 'hull'].forEach(k => { if (typeof d[k] === 'string') u[k] = U.textoPlano(d[k]).slice(0, 600); });
          c.libro.unidades[id] = u;
        });
      }
    }
    if (esObjeto(crudo.unidades)) {
      const idU = id => /^u[1-9]$/.test(id);
      c.unidades.orden = Array.isArray(crudo.unidades.orden) ? listaDeTextos(crudo.unidades.orden).filter(idU) : null;
      c.unidades.ocultas = listaDeTextos(crudo.unidades.ocultas).filter(idU);
      c.unidades.paginasOcultas = listaDeTextos(crudo.unidades.paginasOcultas).filter(x => /^[a-z0-9-]+$/.test(x) && x !== 'index');
    }
    if (esObjeto(crudo.paginas)) {
      Object.entries(crudo.paginas).forEach(([clave, p]) => {
        if (!esObjeto(p) || !/^[a-z0-9-]+$/.test(clave)) return;
        c.paginas[clave] = normalizarPagina(p);
      });
    }
    // Ediciones de preguntas del banco (todo el libro).
    if (esObjeto(crudo.preguntas)) {
      Object.entries(crudo.preguntas).forEach(([id, d]) => {
        if (!esObjeto(d) || !/^[A-Za-z0-9-]{2,30}$/.test(id)) return;
        const y = {};
        ['enunciado', 'correcta', 'explicacion', 'trampas'].forEach(k => { if (typeof d[k] === 'string') y[k] = U.sanear(d[k]); });
        if (Array.isArray(d.incorrectas)) y.incorrectas = d.incorrectas.filter(v => typeof v === 'string').slice(0, 3).map(U.sanear);
        if (d.tipo === 'teórica' || d.tipo === 'práctica') y.tipo = d.tipo;
        if ([1, 2, 3].includes(d.dificultad)) y.dificultad = d.dificultad;
        if (Object.keys(y).length) c.preguntas[id] = y;
      });
    }
    if (esObjeto(crudo.simulacro)) c.simulacro.ocultos = listaDeTextos(crudo.simulacro.ocultos).filter(x => /^[a-z0-9]{1,20}$/.test(x));
    if (esObjeto(crudo.aviso)) {
      c.aviso.activo = crudo.aviso.activo === true;
      c.aviso.texto = texto(crudo.aviso.texto, 2000) || ''; // texto plano: se escapa al mostrarlo
    }
    return c;
  };

  function normalizarPagina(p) {
    const r = {};
    if (esObjeto(p.bloques)) {
      r.bloques = {};
      Object.entries(p.bloques).forEach(([id, b]) => {
        if (!esObjeto(b)) return;
        const x = { huella: texto(b.huella, 40) || '' };
        if (typeof b.html === 'string') x.html = U.sanear(b.html);
        if (b.envolver === true) x.envolver = true;
        if (b.oculto === true) x.oculto = true;
        if (esObjeto(b.atributos)) {
          x.atributos = {};
          U.ATRIBUTOS_FIGURA.forEach(a => { if (typeof b.atributos[a] === 'string') x.atributos[a] = b.atributos[a].slice(0, 2000); });
        }
        r.bloques[id] = x;
      });
    }
    if (Array.isArray(p.nuevos)) {
      r.nuevos = p.nuevos.filter(n => esObjeto(n) && typeof n.id === 'string').map(n => ({
        id: n.id.replace(/[^a-z0-9-]/gi, '').slice(0, 40),
        tipo: texto(n.tipo, 30) || 'parrafo',
        despues: texto(n.despues, 60) || null,
        ancla: texto(n.ancla, 40) || null,
        despuesSeccion: texto(n.despuesSeccion, 120) || null,
        html: U.sanear(n.html || ''),
        creado: texto(n.creado, 40) || new Date().toISOString(),
      }));
    }
    if (esObjeto(p.secciones)) {
      r.secciones = {
        orden: Array.isArray(p.secciones.orden) ? listaDeTextos(p.secciones.orden) : null,
        ocultas: listaDeTextos(p.secciones.ocultas),
      };
    }
    if (esObjeto(p.simuladores)) {
      r.simuladores = {};
      Object.entries(p.simuladores).forEach(([wid, w]) => {
        if (!esObjeto(w) || !esObjeto(w.campos)) return;
        const campos = {};
        Object.entries(w.campos).forEach(([cid, cfg]) => {
          if (!esObjeto(cfg)) return;
          const x = {};
          if (typeof cfg.valor === 'string' || typeof cfg.valor === 'boolean') x.valor = typeof cfg.valor === 'string' ? cfg.valor.slice(0, 500) : cfg.valor;
          const mn = numeroONulo(cfg.min), mx = numeroONulo(cfg.max);
          if (mn !== undefined && mn !== null) x.min = mn;
          if (mx !== undefined && mx !== null) x.max = mx;
          campos[cid] = x;
        });
        r.simuladores[wid] = { campos };
      });
    }
    if (esObjeto(p.ejercitacion)) {
      const e = p.ejercitacion, x = {};
      ['resoluciones', 'pistas', 'autoevaluacion'].forEach(k => { if (typeof e[k] === 'boolean') x[k] = e[k]; });
      x.ocultos = listaDeTextos(e.ocultos);
      x.preguntasOcultas = listaDeTextos(e.preguntasOcultas);
      x.editados = {};
      if (esObjeto(e.editados)) {
        Object.entries(e.editados).forEach(([id, d]) => {
          if (!esObjeto(d)) return;
          const y = {};
          ['enunciado', 'resolucion', 'modelo'].forEach(k => { if (typeof d[k] === 'string') y[k] = U.sanear(d[k]); });
          x.editados[id] = y;
        });
      }
      x.notas = {};
      if (esObjeto(e.notas)) Object.entries(e.notas).forEach(([id, h]) => { if (typeof h === 'string') x.notas[id] = U.sanear(h); });
      x.propios = (Array.isArray(e.propios) ? e.propios : []).filter(esObjeto).map(q => ({
        id: String(q.id || U.nuevoId('D')).replace(/[^A-Za-z0-9-]/g, '').slice(0, 30),
        titulo: U.textoPlano(texto(q.titulo, 300) || 'Ejercicio del docente'),
        tema: U.textoPlano(texto(q.tema, 120) || 'Docente'),
        dificultad: [1, 2, 3].includes(q.dificultad) ? q.dificultad : 2,
        enunciado: U.sanear(q.enunciado || ''),
        resolucion: U.sanear(q.resolucion || ''),
        etiqueta: U.textoPlano(texto(q.etiqueta, 200) || ''),
        respuesta: typeof q.respuesta === 'number' && Number.isFinite(q.respuesta) ? q.respuesta : null,
        tol: typeof q.tol === 'number' && Number.isFinite(q.tol) && q.tol >= 0 ? q.tol : null,
      }));
      x.preguntasPropias = (Array.isArray(e.preguntasPropias) ? e.preguntasPropias : []).filter(esObjeto).map(q => ({
        id: String(q.id || U.nuevoId('DQ')).replace(/[^A-Za-z0-9-]/g, '').slice(0, 30),
        tipo: q.tipo === 'práctica' ? 'práctica' : 'teórica',
        dificultad: [1, 2, 3].includes(q.dificultad) ? q.dificultad : 2,
        enunciado: U.sanear(q.enunciado || ''),
        correcta: U.sanear(q.correcta || ''),
        incorrectas: (Array.isArray(q.incorrectas) ? q.incorrectas : []).filter(v => typeof v === 'string').slice(0, 5).map(U.sanear),
        explicacion: U.sanear(q.explicacion || ''),
      }));
      r.ejercitacion = x;
    }
    return r;
  }

  // --------------------------------------------------------------------------
  // Carga y guardado
  // --------------------------------------------------------------------------
  C.cargar = function () {
    publicada = C.normalizar(window.CONFIG_DOCENTE);
    const borrador = C.normalizar(U.leerJSON('local', CLAVE_BORRADOR));
    if (borrador) { actual = borrador; origen = 'borrador'; }
    else if (publicada) { actual = JSON.parse(JSON.stringify(publicada)); origen = 'publicada'; }
    else { actual = C.vacia(); origen = 'original'; }
    estadoGuardado.persistente = U.localDisponible();
    return actual;
  };

  C.obtener = () => actual;
  C.origen = () => origen;
  C.publicada = () => publicada;
  C.estadoGuardado = () => ({ ...estadoGuardado });
  C.alCambiar = fn => oyentes.push(fn);

  C.guardar = function () {
    actual.meta.actualizado = new Date().toISOString();
    const ok = U.escribirLocal(CLAVE_BORRADOR, JSON.stringify(actual));
    estadoGuardado.ok = ok;
    estadoGuardado.persistente = ok;
    estadoGuardado.cuando = new Date().toISOString();
    origen = 'borrador';
    oyentes.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
    return ok;
  };

  // Configuración de una página (la crea vacía si hace falta).
  C.pagina = function (clave, crear = false) {
    if (!actual.paginas[clave] && crear) actual.paginas[clave] = {};
    return actual.paginas[clave] || {};
  };

  // Quita objetos vacíos para que el archivo exportado quede limpio.
  C.compactar = function (c = actual) {
    Object.keys(c.paginas).forEach(clave => {
      const p = c.paginas[clave];
      if (p.bloques && !Object.keys(p.bloques).length) delete p.bloques;
      if (p.nuevos && !p.nuevos.length) delete p.nuevos;
      if (p.secciones && !(p.secciones.ocultas || []).length && !(p.secciones.orden || []).length) delete p.secciones;
      if (p.simuladores) {
        Object.keys(p.simuladores).forEach(w => { if (!Object.keys(p.simuladores[w].campos || {}).length) delete p.simuladores[w]; });
        if (!Object.keys(p.simuladores).length) delete p.simuladores;
      }
      if (p.ejercitacion) {
        const e = p.ejercitacion;
        const largo = x => (Array.isArray(x) ? x.length : x && typeof x === 'object' ? Object.keys(x).length : 0);
        const vacia = ['resoluciones', 'pistas', 'autoevaluacion'].every(k => e[k] === undefined)
          && !largo(e.ocultos) && !largo(e.preguntasOcultas) && !largo(e.editados)
          && !largo(e.notas) && !largo(e.propios) && !largo(e.preguntasPropias);
        if (vacia) delete p.ejercitacion;
      }
      if (!Object.keys(p).length) delete c.paginas[clave];
    });
    c.preguntas = c.preguntas || {};
    c.simulacro = c.simulacro || { ocultos: [] };
    c.aviso = c.aviso || { activo: false, texto: '' };
    return c;
  };

  // --------------------------------------------------------------------------
  // Cambios con historial (deshacer / rehacer)
  // --------------------------------------------------------------------------
  // El historial vive en sessionStorage: sobrevive a la navegación entre páginas
  // de la misma pestaña, pero no se mezcla entre pestañas.
  function leerHistorial() {
    const h = U.leerJSON('sesion', CLAVE_HISTORIAL);
    return h && Array.isArray(h.atras) && Array.isArray(h.adelante) ? h : { atras: [], adelante: [] };
  }
  function escribirHistorial(h) {
    // Si no entra en el almacenamiento, se descartan los pasos más viejos.
    while (h.atras.length > MAX_HISTORIAL) h.atras.shift();
    let intentos = 0;
    while (!U.escribirSesion(CLAVE_HISTORIAL, JSON.stringify(h)) && h.atras.length && intentos++ < 50) h.atras.shift();
  }

  // Aplica un cambio: guarda el estado anterior para deshacer y autoguarda.
  C.cambiar = function (descripcion, mutar) {
    const antes = JSON.stringify(actual);
    mutar(actual);
    C.compactar();
    if (JSON.stringify(actual) === antes) return false;
    const h = leerHistorial();
    h.atras.push({ c: antes, d: descripcion, t: Date.now() });
    h.adelante = [];
    escribirHistorial(h);
    C.guardar();
    return true;
  };

  C.historial = () => {
    const h = leerHistorial();
    return {
      puedeDeshacer: h.atras.length > 0,
      puedeRehacer: h.adelante.length > 0,
      ultimo: h.atras.length ? h.atras[h.atras.length - 1].d : null,
      siguiente: h.adelante.length ? h.adelante[h.adelante.length - 1].d : null,
    };
  };

  C.deshacer = function () {
    const h = leerHistorial();
    const paso = h.atras.pop();
    if (!paso) return null;
    h.adelante.push({ c: JSON.stringify(actual), d: paso.d, t: Date.now() });
    actual = C.normalizar(JSON.parse(paso.c)) || C.vacia();
    escribirHistorial(h);
    C.guardar();
    return paso.d;
  };

  C.rehacer = function () {
    const h = leerHistorial();
    const paso = h.adelante.pop();
    if (!paso) return null;
    h.atras.push({ c: JSON.stringify(actual), d: paso.d, t: Date.now() });
    actual = C.normalizar(JSON.parse(paso.c)) || C.vacia();
    escribirHistorial(h);
    C.guardar();
    return paso.d;
  };

  // Reemplaza toda la configuración (importar, restaurar todo). Queda en el historial.
  C.reemplazar = function (nueva, descripcion) {
    const antes = JSON.stringify(actual);
    actual = nueva;
    C.compactar();
    const h = leerHistorial();
    h.atras.push({ c: antes, d: descripcion, t: Date.now() });
    h.adelante = [];
    escribirHistorial(h);
    C.guardar();
  };

  // Borra el borrador local: vuelve a regir el archivo publicado (o el original).
  C.descartarBorrador = function () {
    U.borrarLocal(CLAVE_BORRADOR);
    U.borrarSesion(CLAVE_HISTORIAL);
  };

  // --------------------------------------------------------------------------
  // Exportar y publicar
  // --------------------------------------------------------------------------
  C.textoJSON = () => JSON.stringify(C.compactar(JSON.parse(JSON.stringify(actual))), null, 2);

  // Contenido del archivo js/config-docente.js que se distribuye a los alumnos.
  C.textoPublicacion = () => `// Configuración del docente para el libro "Derivados I".
// Generada por el Modo Profesor el ${U.fechaHora(new Date().toISOString())}.
//
// Para que los alumnos vean esta versión del libro, reemplazá con este archivo el
// archivo js/config-docente.js de la carpeta del libro y distribuí la carpeta.
// No hace falta editarlo a mano: se vuelve a generar desde el Modo Profesor.
window.CONFIG_DOCENTE = ${C.textoJSON()};
`;

  // Lee un archivo importado: acepta el .json exportado o el config-docente.js publicado.
  C.leerArchivo = function (contenido) {
    let crudo = String(contenido || '').trim();
    const i = crudo.indexOf('window.CONFIG_DOCENTE');
    if (i >= 0) crudo = crudo.slice(crudo.indexOf('=', i) + 1).trim().replace(/;\s*$/, '');
    let datos;
    try { datos = JSON.parse(crudo); } catch (e) { return { error: 'El archivo no tiene un formato válido (no es JSON).' }; }
    if (!esObjeto(datos) || datos.formato !== C.FORMATO) return { error: 'El archivo no es una configuración del Modo Profesor de este libro.' };
    if (typeof datos.version === 'number' && datos.version > C.VERSION) return { error: 'El archivo fue generado por una versión más nueva del libro.' };
    const c = C.normalizar(datos);
    return c ? { config: c } : { error: 'No se pudo leer la configuración.' };
  };

  P.Config = C;
})(window.Profesor = window.Profesor || {});
