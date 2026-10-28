// ============================================================================
// Modo Profesor · Ejercitación
// ----------------------------------------------------------------------------
// En las páginas de Ejercitación el docente puede:
//   · mostrar u ocultar las resoluciones, las pistas y la autoevaluación;
//   · ocultar ejercicios o preguntas de opción múltiple;
//   · corregir el texto del enunciado o de la resolución de un ejercicio;
//   · agregar una nota del docente a cualquier ejercicio;
//   · agregar ejercicios propios (conceptuales o con respuesta numérica) y
//     preguntas propias de opción múltiple.
//
// js/ejercitacion.js llama a Profesor.ajustarEjercitacion(ejercicios, preguntas)
// antes de armar la página; este módulo devuelve las listas ya ajustadas. Los
// archivos de ejercicios y preguntas originales no se modifican.
// ============================================================================

(function (P) {
  'use strict';

  const U = P.Util;
  const C = P.Config;
  const K = P.Contenido;
  const X = {};

  let originales = { ejercicios: [], preguntas: [] };
  let edicion = false;

  const cfgEj = () => C.pagina(K.clavePagina()).ejercitacion || {};
  const numeroUnidad = () => parseInt(String(document.body.dataset.unidad || '').replace('u', ''), 10) || 0;

  // Ejercicio propio del docente → formato de js/ejercitacion.js.
  function desdePropio(q) {
    const numerico = q.respuesta !== null && q.respuesta !== undefined;
    // Los textos planos se escapan porque js/ejercitacion.js los inserta como HTML.
    const e = {
      id: q.id, titulo: U.escapar(q.titulo), fuente: 'Docente', tema: U.escapar(q.tema || 'Docente'), dificultad: q.dificultad,
      enunciado: q.enunciado, _propio: true,
    };
    if (numerico) {
      e.campos = [{ etiqueta: U.escapar(q.etiqueta || 'Resultado'), respuesta: q.respuesta, ...(q.tol !== null && q.tol !== undefined ? { tol: q.tol } : {}) }];
      if (q.resolucion) e.resolucion = q.resolucion;
    } else {
      e.campos = [];
      if (q.resolucion) e.respuestaModelo = q.resolucion;
    }
    return e;
  }

  // Pregunta propia → formato del banco de preguntas.
  const desdePreguntaPropia = q => ({
    id: q.id, unidad: numeroUnidad(), tema: 'Docente', dificultad: q.dificultad, tipo: q.tipo, fuente: 'Docente',
    enunciado: q.enunciado, correcta: q.correcta, incorrectas: q.incorrectas, explicacion: q.explicacion, _propia: true,
  });

  // --------------------------------------------------------------------------
  // Banco de preguntas para todo el libro (lo usa js/preguntas-base.js)
  // --------------------------------------------------------------------------
  // Las preguntas ocultas y las propias se configuran en la ejercitación de cada unidad,
  // y las ediciones de preguntas existentes en config.preguntas. Todo vale también para
  // la batalla y los simulacros.
  const bancoOriginal = {};      // id → pregunta tal como viene en js/preguntas-uN.js
  const ejercitacionDe = u => ((C.obtener().paginas[`u${u}-ejercitacion`] || {}).ejercitacion) || {};

  X.ajustarPreguntaBanco = function (q) {
    bancoOriginal[q.id] = q;
    const c = C.obtener();
    const ed = (c.preguntas || {})[q.id];
    const x = ed ? { ...q, ...ed, _editadaDocente: true } : q;
    if (P.modo === 'edicion') return x;
    if ((ejercitacionDe(q.unidad).preguntasOcultas || []).includes(q.id)) return null;
    if (c.unidades.ocultas.includes('u' + q.unidad)) return null;
    return x;
  };

  X.preguntasPropiasDelBanco = function () {
    const c = C.obtener();
    const res = [];
    Object.entries(c.paginas).forEach(([clave, p]) => {
      const m = clave.match(/^u(\d)-ejercitacion$/);
      if (!m || !p.ejercitacion) return;
      const u = parseInt(m[1], 10);
      (p.ejercitacion.preguntasPropias || []).forEach(q => {
        if ((q.incorrectas || []).length < 3) return; // el simulacro y la batalla necesitan cuatro opciones
        const oculta = (p.ejercitacion.preguntasOcultas || []).includes(q.id) || c.unidades.ocultas.includes('u' + u);
        if (P.modo === 'edicion' || !oculta) res.push({ ...desdePreguntaPropia(q), unidad: u });
      });
    });
    return res;
  };
  X.preguntaOriginal = id => bancoOriginal[id];

  // --------------------------------------------------------------------------
  // Ajuste de las listas (lo llama js/ejercitacion.js)
  // --------------------------------------------------------------------------
  X.ajustar = function (ejercicios, preguntas, modoEdicion) {
    edicion = modoEdicion;
    originales = { ejercicios: ejercicios.slice(), preguntas: preguntas.slice() };
    const cfg = cfgEj();
    const ocultos = new Set(cfg.ocultos || []);
    const ocultas = new Set(cfg.preguntasOcultas || []);
    const editados = cfg.editados || {};
    const notas = cfg.notas || {};

    let ej = ejercicios.map(e => {
      const x = { ...e };
      const ed = editados[e.id];
      if (ed) {
        if (ed.enunciado !== undefined) x.enunciado = ed.enunciado;
        if (ed.resolucion !== undefined) x.resolucion = ed.resolucion;
        if (ed.modelo !== undefined) x.respuestaModelo = ed.modelo;
        x._editado = true;
      }
      return x;
    });
    ej = ej.concat((cfg.propios || []).map(desdePropio));
    ej.forEach(e => { if (notas[e.id]) e.notaDocente = notas[e.id]; if (ocultos.has(e.id)) e._profOculto = true; });

    // Las propias ya suelen venir en el banco (js/preguntas-base.js): no se duplican.
    const yaEstan = new Set(preguntas.map(q => q.id));
    let pr = preguntas.concat((cfg.preguntasPropias || []).map(desdePreguntaPropia).filter(q => !yaEstan.has(q.id)));
    // Las preguntas ocultas no entran nunca en el cuestionario (ni en el modo edición:
    // así el docente ve el cuestionario tal como lo van a ver los alumnos).
    pr = pr.filter(q => !ocultas.has(q.id));

    const opciones = {
      resoluciones: cfg.resoluciones !== false,
      pistas: cfg.pistas !== false,
      autoevaluacion: cfg.autoevaluacion !== false,
    };
    if (!modoEdicion) ej = ej.filter(e => !e._profOculto);
    else { opciones.resoluciones = true; opciones.pistas = true; opciones.autoevaluacion = true; }
    return { ejercicios: ej, preguntas: pr, opciones };
  };

  X.originales = () => originales;

  // --------------------------------------------------------------------------
  // Barra de cada ejercicio (modo edición)
  // --------------------------------------------------------------------------
  X.decorar = function () {
    const lista = document.getElementById('ej-lista');
    if (!lista) return;
    const cfg = cfgEj();
    lista.querySelectorAll('article.ejercicio[data-id]').forEach(card => {
      if (card.querySelector(':scope > .prof-barra-ejercicio')) return;
      const id = card.dataset.id;
      const propio = (cfg.propios || []).some(q => q.id === id);
      const oculto = (cfg.ocultos || []).includes(id);
      const editado = !!(cfg.editados || {})[id];
      card.classList.toggle('prof-oculto', oculto);
      if (oculto) card.dataset.profOculto = 'ejercicio'; else delete card.dataset.profOculto;
      if (editado) card.dataset.profModificado = '1';
      if (propio) card.dataset.profNuevo = 'ejercicio';
      const barra = document.createElement('div');
      barra.className = 'prof-ui prof-barra-ejercicio';
      barra.setAttribute('role', 'toolbar');
      barra.setAttribute('aria-label', 'Acciones del docente sobre el ejercicio ' + id);
      const boton = (texto, accion, clase = '') => `<button type="button" class="prof-btn-chico ${clase}" data-prof-ej="${accion}">${texto}</button>`;
      barra.innerHTML = (propio
        ? boton('Editar', 'editar-propio') + boton('Eliminar', 'eliminar-propio', 'prof-btn-peligro')
        : boton('Editar textos', 'editar') + (editado ? boton('Restaurar textos', 'restaurar') : ''))
        + boton((cfg.notas || {})[id] ? 'Editar la nota del docente' : 'Agregar una nota del docente', 'nota')
        + boton(oculto ? 'Mostrar a los alumnos' : 'Ocultar a los alumnos', 'ocultar');
      card.prepend(barra);
    });
    if (!lista._profListo) {
      lista._profListo = true;
      lista.addEventListener('click', ev => {
        const b = ev.target.closest('[data-prof-ej]');
        if (!b) return;
        ev.stopPropagation();
        const id = b.closest('article.ejercicio').dataset.id;
        const accion = b.dataset.profEj;
        if (accion === 'editar') X.editarTextos(id);
        if (accion === 'restaurar') restaurarTextos(id);
        if (accion === 'nota') X.editarNota(id);
        if (accion === 'ocultar') X.alternarEjercicio(id);
        if (accion === 'editar-propio') X.editarPropio(id);
        if (accion === 'eliminar-propio') eliminarPropio(id);
      }, true);
    }
  };

  function mutarEj(descripcion, fn) {
    return C.cambiar(descripcion, c => {
      const clave = K.clavePagina();
      const pag = c.paginas[clave] = c.paginas[clave] || {};
      pag.ejercitacion = pag.ejercitacion || {};
      const e = pag.ejercitacion;
      e.ocultos = e.ocultos || []; e.preguntasOcultas = e.preguntasOcultas || [];
      e.editados = e.editados || {}; e.notas = e.notas || {};
      e.propios = e.propios || []; e.preguntasPropias = e.preguntasPropias || [];
      fn(e);
    });
  }

  const recargar = (ancla, aviso) => P.Interfaz.recargar({ ancla, aviso });

  X.alternarEjercicio = function (id) {
    let oculto = false;
    mutarEj('Mostrar u ocultar un ejercicio', e => {
      const i = e.ocultos.indexOf(id);
      if (i >= 0) e.ocultos.splice(i, 1); else { e.ocultos.push(id); oculto = true; }
    });
    recargar('ej-' + id, oculto ? 'El ejercicio quedó oculto para los alumnos.' : 'El ejercicio vuelve a estar visible.');
  };

  X.alternarPregunta = function (id) {
    mutarEj('Mostrar u ocultar una pregunta', e => {
      const i = e.preguntasOcultas.indexOf(id);
      if (i >= 0) e.preguntasOcultas.splice(i, 1); else e.preguntasOcultas.push(id);
    });
  };

  X.opcion = function (clave, valor) {
    mutarEj('Cambiar la ejercitación', e => { if (valor) delete e[clave]; else e[clave] = false; });
  };

  function restaurarTextos(id) {
    P.Interfaz.confirmar('¿Restaurar los textos originales de este ejercicio?', 'Se descartan los cambios en el enunciado y la resolución. La nota del docente, si hay, se conserva.', 'Restaurar').then(ok => {
      if (!ok) return;
      mutarEj('Restaurar un ejercicio', e => { delete e.editados[id]; });
      recargar('ej-' + id, 'Se restauraron los textos originales.');
    });
  }

  function eliminarPropio(id) {
    P.Interfaz.confirmar('¿Eliminar este ejercicio propio?', 'Se borra de la ejercitación. Podés deshacerlo con «Deshacer».', 'Eliminar', true).then(ok => {
      if (!ok) return;
      mutarEj('Eliminar un ejercicio propio', e => {
        e.propios = e.propios.filter(q => q.id !== id);
        delete e.notas[id];
        e.ocultos = e.ocultos.filter(x => x !== id);
      });
      recargar(null, 'Se eliminó el ejercicio.');
    });
  }

  // --------------------------------------------------------------------------
  // Formularios
  // --------------------------------------------------------------------------
  // Agrega un editor de texto con su etiqueta a un formulario.
  function campoTexto(form, etiqueta, html, modo = 'flujo', ayuda = '') {
    const d = document.createElement('div');
    d.className = 'prof-bloque-campo';
    const lab = document.createElement('div');
    lab.className = 'prof-etiqueta';
    lab.textContent = etiqueta;
    const ed = P.Editor.crearEditorTexto({ html: html || '', modo, etiqueta: 'p', etiquetaAccesible: etiqueta });
    d.append(lab, ed.raiz);
    if (ayuda) { const p = document.createElement('p'); p.className = 'prof-ayuda'; p.innerHTML = ayuda; d.appendChild(p); }
    form.appendChild(d);
    return ed;
  }

  const vacio = html => !U.textoPlano(html) && !/\\\(|\\\[/.test(html || '');
  const original = id => originales.ejercicios.find(e => e.id === id);

  X.editarTextos = function (id) {
    const o = original(id);
    if (!o) return;
    const ed = (cfgEj().editados || {})[id] || {};
    const conceptual = !(o.campos || []).length;
    const form = document.createElement('div');
    form.className = 'prof-form';
    form.innerHTML = `<div class="prof-aviso">${conceptual
      ? 'Podés corregir o ampliar el enunciado y la respuesta modelo.'
      : '<strong>Importante:</strong> la corrección automática sigue usando las respuestas originales. Corregí la redacción, pero no cambies los datos numéricos del enunciado; si querés otros números, ocultá este ejercicio y creá uno propio.'}</div>`;
    const enunciado = campoTexto(form, 'Enunciado', ed.enunciado !== undefined ? ed.enunciado : o.enunciado);
    const resolucion = o.resolucion !== undefined || !conceptual ? campoTexto(form, 'Resolución paso a paso', ed.resolucion !== undefined ? ed.resolucion : o.resolucion || '') : null;
    const modelo = conceptual ? campoTexto(form, 'Respuesta modelo', ed.modelo !== undefined ? ed.modelo : o.respuestaModelo || '') : null;
    const error = document.createElement('div');
    error.className = 'prof-error'; error.hidden = true; form.appendChild(error);
    const v = P.Editor.crearVentana(`Editar el ejercicio ${id}`, form, [
      { texto: 'Cancelar', accion: cerrar => cerrar() },
      {
        texto: 'Guardar', clase: 'prof-btn prof-btn-primario', accion: cerrar => {
          const nuevo = { enunciado: enunciado.fuente() };
          if (resolucion) nuevo.resolucion = resolucion.fuente();
          if (modelo) nuevo.modelo = modelo.fuente();
          if (vacio(nuevo.enunciado)) { error.hidden = false; error.textContent = 'El enunciado no puede quedar vacío. Si no querés usar el ejercicio, ocultalo.'; return; }
          const norm = h => U.sanear(h || '').replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
          const cambios = {};
          if (norm(nuevo.enunciado) !== norm(o.enunciado)) cambios.enunciado = nuevo.enunciado;
          if (resolucion && norm(nuevo.resolucion) !== norm(o.resolucion)) cambios.resolucion = nuevo.resolucion;
          if (modelo && norm(nuevo.modelo) !== norm(o.respuestaModelo)) cambios.modelo = nuevo.modelo;
          cerrar();
          mutarEj('Editar un ejercicio', e => { if (Object.keys(cambios).length) e.editados[id] = cambios; else delete e.editados[id]; });
          recargar('ej-' + id, 'Se guardaron los cambios del ejercicio.');
        },
      },
    ]);
    v.caja.classList.add('prof-modal-ancho');
    enunciado.enfocar();
  };

  X.editarNota = function (id) {
    const actual = (cfgEj().notas || {})[id] || '';
    const form = document.createElement('div');
    form.className = 'prof-form';
    const nota = campoTexto(form, 'Nota del docente', actual || '<p></p>', 'flujo', 'Los alumnos la ven arriba del enunciado, en una caja «Nota del docente». Para quitarla, dejala vacía.');
    P.Editor.crearVentana(`Nota del docente · ${id}`, form, [
      { texto: 'Cancelar', accion: cerrar => cerrar() },
      {
        texto: 'Guardar', clase: 'prof-btn prof-btn-primario', accion: cerrar => {
          const html = nota.fuente();
          cerrar();
          mutarEj('Nota del docente en un ejercicio', e => { if (vacio(html)) delete e.notas[id]; else e.notas[id] = html; });
          recargar('ej-' + id, vacio(html) ? 'Se quitó la nota.' : 'Se guardó la nota del docente.');
        },
      },
    ]);
    nota.enfocar();
  };

  X.editarPropio = function (id) {
    const actual = (cfgEj().propios || []).find(q => q.id === id) || null;
    const q = actual || { id: U.nuevoId('D-'), titulo: '', tema: 'Docente', dificultad: 2, enunciado: '', resolucion: '', etiqueta: 'Resultado', respuesta: null, tol: null };
    const form = document.createElement('div');
    form.className = 'prof-form';
    form.innerHTML = `
      <label class="prof-etiqueta" for="prof-ej-titulo">Título</label>
      <input id="prof-ej-titulo" class="prof-campo" type="text" placeholder="Por ejemplo: Valuación de un call con dos pasos">
      <div class="prof-dos-columnas">
        <div><label class="prof-etiqueta" for="prof-ej-tema">Tema (para el filtro)</label><input id="prof-ej-tema" class="prof-campo" type="text"></div>
        <div><label class="prof-etiqueta" for="prof-ej-dif">Dificultad</label><select id="prof-ej-dif" class="prof-campo"><option value="1">Básica</option><option value="2">Intermedia</option><option value="3">Avanzada</option></select></div>
      </div>`;
    form.querySelector('#prof-ej-titulo').value = q.titulo;
    form.querySelector('#prof-ej-tema').value = q.tema;
    form.querySelector('#prof-ej-dif').value = String(q.dificultad);
    const enunciado = campoTexto(form, 'Enunciado', q.enunciado || '<p></p>');
    const tipo = document.createElement('fieldset');
    tipo.className = 'prof-grupo';
    tipo.innerHTML = `<legend>Tipo de ejercicio</legend>
      <label class="prof-casilla"><input type="radio" name="prof-ej-tipo" value="conceptual"> Conceptual (el alumno compara con una respuesta modelo)</label>
      <label class="prof-casilla"><input type="radio" name="prof-ej-tipo" value="numerico"> Con respuesta numérica (corrección automática)</label>
      <div class="prof-numerico prof-tres-columnas">
        <div><label class="prof-etiqueta" for="prof-ej-etq">Qué se pide</label><input id="prof-ej-etq" class="prof-campo" type="text" placeholder="Precio del call ($)"></div>
        <div><label class="prof-etiqueta" for="prof-ej-resp">Respuesta correcta</label><input id="prof-ej-resp" class="prof-campo" type="text" inputmode="decimal" placeholder="4,76"></div>
        <div><label class="prof-etiqueta" for="prof-ej-tol">Tolerancia (opcional)</label><input id="prof-ej-tol" class="prof-campo" type="text" inputmode="decimal" placeholder="0,01"></div>
      </div>
      <p class="prof-ayuda prof-numerico">Si no indicás la tolerancia, se acepta un error del 0,5 % de la respuesta (o 0,01, lo que sea mayor), igual que en el resto del libro.</p>`;
    form.appendChild(tipo);
    const numerico = q.respuesta !== null && q.respuesta !== undefined;
    tipo.querySelector(`input[value="${numerico ? 'numerico' : 'conceptual'}"]`).checked = true;
    tipo.querySelector('#prof-ej-etq').value = q.etiqueta || 'Resultado';
    tipo.querySelector('#prof-ej-resp').value = numerico ? String(q.respuesta).replace('.', ',') : '';
    tipo.querySelector('#prof-ej-tol').value = q.tol !== null && q.tol !== undefined ? String(q.tol).replace('.', ',') : '';
    const resolucion = campoTexto(form, 'Resolución o respuesta modelo', q.resolucion || '<p></p>');
    const actualizarTipo = () => {
      const num = tipo.querySelector('input:checked').value === 'numerico';
      tipo.querySelectorAll('.prof-numerico').forEach(x => { x.hidden = !num; });
    };
    tipo.addEventListener('change', actualizarTipo);
    actualizarTipo();
    const error = document.createElement('div');
    error.className = 'prof-error'; error.hidden = true; form.appendChild(error);
    const v = P.Editor.crearVentana(actual ? 'Editar el ejercicio propio' : 'Nuevo ejercicio propio', form, [
      { texto: 'Cancelar', accion: cerrar => cerrar() },
      {
        texto: 'Guardar', clase: 'prof-btn prof-btn-primario', accion: cerrar => {
          const falla = t => { error.hidden = false; error.textContent = t; };
          const titulo = form.querySelector('#prof-ej-titulo').value.trim();
          const html = enunciado.fuente();
          if (!titulo) return falla('Escribí un título.');
          if (vacio(html)) return falla('Escribí el enunciado.');
          const num = tipo.querySelector('input:checked').value === 'numerico';
          let respuesta = null, tol = null;
          if (num) {
            respuesta = U.aNumero(tipo.querySelector('#prof-ej-resp').value);
            if (!Number.isFinite(respuesta)) return falla('La respuesta correcta tiene que ser un número (con coma o punto decimal).');
            const t = tipo.querySelector('#prof-ej-tol').value.trim();
            if (t) { tol = U.aNumero(t); if (!Number.isFinite(tol) || tol < 0) return falla('La tolerancia tiene que ser un número mayor o igual que cero.'); }
          }
          const nuevo = {
            id: q.id, titulo, tema: form.querySelector('#prof-ej-tema').value.trim() || 'Docente',
            dificultad: parseInt(form.querySelector('#prof-ej-dif').value, 10) || 2,
            enunciado: html, resolucion: vacio(resolucion.fuente()) ? '' : resolucion.fuente(),
            etiqueta: num ? tipo.querySelector('#prof-ej-etq').value.trim() || 'Resultado' : '', respuesta, tol,
          };
          cerrar();
          mutarEj(actual ? 'Editar un ejercicio propio' : 'Agregar un ejercicio propio', e => {
            const i = e.propios.findIndex(x => x.id === q.id);
            if (i >= 0) e.propios[i] = nuevo; else e.propios.push(nuevo);
          });
          recargar('ej-' + q.id, actual ? 'Se guardó el ejercicio.' : 'Se agregó el ejercicio al final de la lista.');
        },
      },
    ]);
    v.caja.classList.add('prof-modal-ancho');
    form.querySelector('#prof-ej-titulo').focus();
  };

  X.editarPregunta = function (id) {
    const actual = id ? (cfgEj().preguntasPropias || []).find(q => q.id === id) : null;
    const q = actual || { id: U.nuevoId('DQ-'), tipo: 'teórica', dificultad: 2, enunciado: '', correcta: '', incorrectas: ['', '', ''], explicacion: '' };
    const form = document.createElement('div');
    form.className = 'prof-form';
    form.innerHTML = `<div class="prof-dos-columnas">
        <div><label class="prof-etiqueta" for="prof-q-tipo">Tipo</label><select id="prof-q-tipo" class="prof-campo"><option value="teórica">Teórica</option><option value="práctica">Práctica</option></select></div>
        <div><label class="prof-etiqueta" for="prof-q-dif">Dificultad</label><select id="prof-q-dif" class="prof-campo"><option value="1">Básica</option><option value="2">Intermedia</option><option value="3">Avanzada</option></select></div>
      </div>`;
    form.querySelector('#prof-q-tipo').value = q.tipo;
    form.querySelector('#prof-q-dif').value = String(q.dificultad);
    const enunciado = campoTexto(form, 'Pregunta', q.enunciado, 'linea');
    const correcta = campoTexto(form, 'Respuesta correcta', q.correcta, 'linea');
    const incorrectas = [0, 1, 2].map(i => campoTexto(form, `Opción incorrecta ${i + 1}`, q.incorrectas[i] || '', 'linea', i === 0 ? 'Conviene que cada opción incorrecta responda a un error típico (la «trampa»). Las tres son necesarias: la pregunta también se usa en la batalla y en los simulacros, que muestran cuatro opciones.' : ''));
    const explicacion = campoTexto(form, 'Explicación (se muestra al responder)', q.explicacion, 'linea');
    const error = document.createElement('div');
    error.className = 'prof-error'; error.hidden = true; form.appendChild(error);
    const v = P.Editor.crearVentana(actual ? 'Editar la pregunta propia' : 'Nueva pregunta de opción múltiple', form, [
      { texto: 'Cancelar', accion: cerrar => cerrar() },
      {
        texto: 'Guardar', clase: 'prof-btn prof-btn-primario', accion: cerrar => {
          const falla = t => { error.hidden = false; error.textContent = t; };
          const nuevo = {
            id: q.id, tipo: form.querySelector('#prof-q-tipo').value, dificultad: parseInt(form.querySelector('#prof-q-dif').value, 10) || 2,
            enunciado: enunciado.fuente(), correcta: correcta.fuente(),
            incorrectas: incorrectas.map(x => x.fuente()).filter(h => !vacio(h)), explicacion: explicacion.fuente(),
          };
          if (vacio(nuevo.enunciado)) return falla('Escribí la pregunta.');
          if (vacio(nuevo.correcta)) return falla('Escribí la respuesta correcta.');
          if (nuevo.incorrectas.length < 3) return falla('Completá las tres opciones incorrectas.');
          if (new Set([nuevo.correcta, ...nuevo.incorrectas].map(h => U.textoPlano(h))).size < 4) return falla('Las cuatro opciones tienen que ser distintas.');
          cerrar();
          mutarEj(actual ? 'Editar una pregunta propia' : 'Agregar una pregunta propia', e => {
            const i = e.preguntasPropias.findIndex(x => x.id === q.id);
            if (i >= 0) e.preguntasPropias[i] = nuevo; else e.preguntasPropias.push(nuevo);
          });
          recargar(null, actual ? 'Se guardó la pregunta.' : 'Se agregó la pregunta al banco de la autoevaluación.');
        },
      },
    ]);
    v.caja.classList.add('prof-modal-ancho');
    enunciado.enfocar();
  };

  // Editar una pregunta del banco original (texto, opciones y respuesta correcta).
  // El cambio vale en todo el libro: autoevaluación, batalla y simulacros.
  X.editarPreguntaBanco = function (id) {
    const o = bancoOriginal[id];
    if (!o) return;
    const ed = (C.obtener().preguntas || {})[id] || {};
    const q = { ...o, ...ed };
    const form = document.createElement('div');
    form.className = 'prof-form';
    form.innerHTML = `<div class="prof-aviso">El cambio vale para la autoevaluación, la batalla y los simulacros. ${o.tipo === 'práctica' ? '<strong>Es una pregunta práctica:</strong> sus números se calculan con fórmulas; si cambiás un dato del enunciado, revisá también las cuatro opciones.' : ''}</div>
      <div class="prof-dos-columnas">
        <div><label class="prof-etiqueta" for="prof-qb-tipo">Tipo</label><select id="prof-qb-tipo" class="prof-campo"><option value="teórica">Teórica</option><option value="práctica">Práctica</option></select></div>
        <div><label class="prof-etiqueta" for="prof-qb-dif">Dificultad</label><select id="prof-qb-dif" class="prof-campo"><option value="1">Básica</option><option value="2">Intermedia</option><option value="3">Avanzada</option></select></div>
      </div>`;
    form.querySelector('#prof-qb-tipo').value = q.tipo;
    form.querySelector('#prof-qb-dif').value = String(q.dificultad);
    const enunciado = campoTexto(form, 'Pregunta', q.enunciado, 'linea');
    const correcta = campoTexto(form, 'Respuesta correcta', q.correcta, 'linea');
    const incorrectas = [0, 1, 2].map(i => campoTexto(form, `Opción incorrecta ${i + 1}`, (q.incorrectas || [])[i] || '', 'linea'));
    const explicacion = campoTexto(form, 'Explicación (se muestra al responder)', q.explicacion || '', 'linea');
    const trampas = campoTexto(form, 'Trampas (opcional: por qué alguien elegiría cada opción incorrecta)', q.trampas || '', 'linea');
    const error = document.createElement('div');
    error.className = 'prof-error'; error.hidden = true; form.appendChild(error);
    const botones = [
      { texto: 'Cancelar', accion: cerrar => cerrar() },
      {
        texto: 'Guardar', clase: 'prof-btn prof-btn-primario', accion: cerrar => {
          const falla = t => { error.hidden = false; error.textContent = t; };
          const d = {
            tipo: form.querySelector('#prof-qb-tipo').value, dificultad: parseInt(form.querySelector('#prof-qb-dif').value, 10) || 2,
            enunciado: enunciado.fuente(), correcta: correcta.fuente(), incorrectas: incorrectas.map(x => x.fuente()),
            explicacion: explicacion.fuente(), trampas: trampas.fuente(),
          };
          if (vacio(d.enunciado)) return falla('Escribí la pregunta.');
          if (vacio(d.correcta) || d.incorrectas.some(vacio)) return falla('Completá la respuesta correcta y las tres incorrectas.');
          if (new Set([d.correcta, ...d.incorrectas].map(h => U.textoPlano(h))).size < 4) return falla('Las cuatro opciones tienen que ser distintas.');
          // Se guarda solo lo que cambió respecto del original.
          const norm = h => U.textoPlano(h || '');
          const cambios = {};
          ['enunciado', 'correcta', 'explicacion', 'trampas'].forEach(k => { if (norm(d[k]) !== norm(o[k])) cambios[k] = d[k]; });
          if (d.incorrectas.map(norm).join('|') !== (o.incorrectas || []).map(norm).join('|')) cambios.incorrectas = d.incorrectas;
          if (d.tipo !== o.tipo) cambios.tipo = d.tipo;
          if (d.dificultad !== +o.dificultad) cambios.dificultad = d.dificultad;
          cerrar();
          C.cambiar('Editar una pregunta del banco', c => {
            c.preguntas = c.preguntas || {};
            if (Object.keys(cambios).length) c.preguntas[id] = cambios; else delete c.preguntas[id];
          });
          recargar(null, Object.keys(cambios).length ? 'Se guardó la pregunta (vale también para la batalla y los simulacros).' : 'La pregunta quedó igual que la original.');
        },
      },
    ];
    if (ed && Object.keys(ed).length) botones.unshift({
      texto: 'Volver a la original', accion: cerrar => {
        cerrar();
        C.cambiar('Restaurar una pregunta del banco', c => { if (c.preguntas) delete c.preguntas[id]; });
        recargar(null, 'La pregunta volvió a su versión original.');
      },
    });
    const v = P.Editor.crearVentana(`Editar la pregunta ${id}`, form, botones);
    v.caja.classList.add('prof-modal-ancho');
    enunciado.enfocar();
  };

  X.eliminarPregunta = function (id) {
    P.Interfaz.confirmar('¿Eliminar esta pregunta propia?', 'Se borra del banco de la autoevaluación.', 'Eliminar', true).then(ok => {
      if (!ok) return;
      mutarEj('Eliminar una pregunta propia', e => {
        e.preguntasPropias = e.preguntasPropias.filter(q => q.id !== id);
        e.preguntasOcultas = e.preguntasOcultas.filter(x => x !== id);
      });
      recargar(null, 'Se eliminó la pregunta.');
    });
  };

  // Datos para el panel.
  X.resumen = function () {
    const cfg = cfgEj();
    const ocultos = new Set(cfg.ocultos || []), ocultas = new Set(cfg.preguntasOcultas || []);
    // Títulos en HTML (los de los ejercicios propios, escapados).
    const propios = (cfg.propios || []).map(desdePropio);
    return {
      hay: !!document.getElementById('ejercitacion'),
      opciones: { resoluciones: cfg.resoluciones !== false, pistas: cfg.pistas !== false, autoevaluacion: cfg.autoevaluacion !== false },
      ejercicios: originales.ejercicios.concat(propios).map(e => ({ id: e.id, titulo: e.titulo, visible: !ocultos.has(e.id), propio: !!e._propio })),
      preguntas: (() => {
        const ya = new Set(originales.preguntas.map(q => q.id));
        return originales.preguntas.concat((cfg.preguntasPropias || []).map(desdePreguntaPropia).filter(q => !ya.has(q.id)));
      })().map(q => ({ id: q.id, texto: U.recortar(U.textoPlano(q.enunciado), 110), visible: !ocultas.has(q.id), propia: !!q._propia, editada: !!(C.obtener().preguntas || {})[q.id] })),
    };
  };

  P.Ejercicios = X;
})(window.Profesor = window.Profesor || {});
