// ============================================================================
// Modo Profesor · Utilidades
// ----------------------------------------------------------------------------
// Funciones auxiliares que usan los demás módulos del Modo Profesor:
//   · almacenamiento seguro (localStorage y sessionStorage con respaldo en memoria),
//   · huella (hash) de textos y contraseñas,
//   · saneamiento del HTML que escribe el docente o que llega en un archivo importado,
//   · pequeñas ayudas de formato y descarga de archivos.
//
// Todo el Modo Profesor funciona del lado del navegador, sin servidor.
// ============================================================================

(function (P) {
  'use strict';

  const U = {};

  // --------------------------------------------------------------------------
  // Almacenamiento seguro
  // --------------------------------------------------------------------------
  // Algunos navegadores bloquean localStorage (ventana privada, archivos abiertos
  // con doble clic en ciertos navegadores, políticas de la institución). En ese caso
  // los datos se guardan en memoria mientras la pestaña esté abierta y la interfaz
  // avisa que hay que exportar la configuración para no perderla.
  const memoria = { local: new Map(), sesion: new Map() };
  const estado = { local: null, sesion: null };

  // Último recurso cuando el navegador no deja guardar nada: los datos viajan en
  // window.name, que se conserva al recargar y al pasar de una página a otra en la
  // misma pestaña (se pierde al cerrarla).
  const PREFIJO_NOMBRE = 'derivados-prof:';
  try {
    if (typeof window.name === 'string' && window.name.indexOf(PREFIJO_NOMBRE) === 0) {
      const d = JSON.parse(window.name.slice(PREFIJO_NOMBRE.length));
      ['local', 'sesion'].forEach(t => Object.entries(d[t] || {}).forEach(([k, v]) => memoria[t].set(k, v)));
    }
  } catch (e) { /* window.name con otro contenido: se ignora */ }
  function guardarEnNombre() {
    try {
      window.name = PREFIJO_NOMBRE + JSON.stringify({ local: Object.fromEntries(memoria.local), sesion: Object.fromEntries(memoria.sesion) });
    } catch (e) { /* sin respaldo posible */ }
  }

  function disponible(tipo) {
    if (estado[tipo] !== null) return estado[tipo];
    try {
      const almacen = tipo === 'local' ? window.localStorage : window.sessionStorage;
      const prueba = '__derivados_prueba__';
      almacen.setItem(prueba, '1');
      almacen.removeItem(prueba);
      estado[tipo] = true;
    } catch (e) {
      estado[tipo] = false;
    }
    return estado[tipo];
  }

  function leer(tipo, clave) {
    if (disponible(tipo)) {
      try {
        const almacen = tipo === 'local' ? window.localStorage : window.sessionStorage;
        return almacen.getItem(clave);
      } catch (e) { /* sigue con la memoria */ }
    }
    return memoria[tipo].has(clave) ? memoria[tipo].get(clave) : null;
  }

  // Devuelve true si quedó guardado de forma persistente.
  function escribir(tipo, clave, valor) {
    memoria[tipo].set(clave, valor);
    if (!disponible(tipo)) { guardarEnNombre(); return false; }
    try {
      const almacen = tipo === 'local' ? window.localStorage : window.sessionStorage;
      almacen.setItem(clave, valor);
      return true;
    } catch (e) {
      return false; // por ejemplo, espacio lleno
    }
  }

  function borrar(tipo, clave) {
    memoria[tipo].delete(clave);
    if (!disponible(tipo)) { guardarEnNombre(); return; }
    try {
      const almacen = tipo === 'local' ? window.localStorage : window.sessionStorage;
      almacen.removeItem(clave);
    } catch (e) { /* nada que hacer */ }
  }

  U.leerLocal = clave => leer('local', clave);
  U.escribirLocal = (clave, valor) => escribir('local', clave, valor);
  U.borrarLocal = clave => borrar('local', clave);
  U.leerSesion = clave => leer('sesion', clave);
  U.escribirSesion = (clave, valor) => escribir('sesion', clave, valor);
  U.borrarSesion = clave => borrar('sesion', clave);
  U.localDisponible = () => disponible('local');
  U.sesionDisponible = () => disponible('sesion');

  U.leerJSON = (tipo, clave) => {
    const crudo = tipo === 'local' ? U.leerLocal(clave) : U.leerSesion(clave);
    if (!crudo) return null;
    try { return JSON.parse(crudo); } catch (e) { return null; }
  };

  // --------------------------------------------------------------------------
  // Huellas (hash)
  // --------------------------------------------------------------------------
  // cyrb53: hash rápido de 53 bits. NO es criptográfico. Sirve para reconocer
  // un bloque de texto aunque cambie de lugar, y para no guardar la contraseña
  // en texto plano (ver la advertencia de seguridad en js/profesor/interfaz.js).
  U.hash = function (texto, semilla = 0) {
    let h1 = 0xdeadbeef ^ semilla, h2 = 0x41c6ce57 ^ semilla;
    for (let i = 0; i < texto.length; i++) {
      const c = texto.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 2654435761);
      h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  };

  // Huella de un bloque del libro: etiqueta + texto normalizado (sin espacios repetidos).
  U.huella = function (el) {
    const texto = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 4000);
    return U.hash(el.tagName + '|' + (el.className || '') + '|' + texto);
  };

  // --------------------------------------------------------------------------
  // Texto y formato
  // --------------------------------------------------------------------------
  U.escapar = texto => String(texto ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  U.textoPlano = html => {
    const t = document.createElement('template');
    t.innerHTML = html || '';
    return (t.content.textContent || '').replace(/\s+/g, ' ').trim();
  };

  U.recortar = (texto, n = 70) => (texto.length > n ? texto.slice(0, n - 1).trimEnd() + '…' : texto);

  U.fechaHora = iso => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    const dos = n => String(n).padStart(2, '0');
    return `${dos(d.getDate())}/${dos(d.getMonth() + 1)}/${d.getFullYear()} ${dos(d.getHours())}:${dos(d.getMinutes())}`;
  };

  U.nuevoId = prefijo => `${prefijo}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

  // Número con coma o punto decimal; acepta "8/12". Devuelve NaN si no es un número.
  U.aNumero = valor => {
    if (typeof aNumero === 'function') return aNumero(valor);
    const n = parseFloat(String(valor).replace(',', '.'));
    return Number.isFinite(n) ? n : NaN;
  };

  // Descarga un archivo generado en el navegador (funciona sin conexión).
  U.descargar = (nombre, contenido, tipo = 'application/json') => {
    const blob = new Blob([contenido], { type: tipo + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
  };

  // --------------------------------------------------------------------------
  // Saneamiento de HTML
  // --------------------------------------------------------------------------
  // El contenido que escribe el docente (o que llega en un archivo JSON importado)
  // se limpia antes de mostrarse: solo quedan etiquetas y atributos de texto con
  // formato. Se eliminan scripts, estilos, formularios, marcos y manejadores de
  // eventos, y los enlaces solo pueden ser http, https, mailto o relativos.
  const ETIQUETAS = new Set([
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup', 'small', 'code', 'mark',
    'ul', 'ol', 'li', 'a', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'hr',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
    'figure', 'figcaption', 'details', 'summary', 'dl', 'dt', 'dd', 'section',
  ]);
  // Se eliminan con todo su contenido.
  const PROHIBIDAS = new Set([
    'script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'base', 'form', 'input',
    'button', 'textarea', 'select', 'option', 'template', 'frame', 'frameset', 'applet', 'noscript',
  ]);
  const ATRIBUTOS = new Set([
    'class', 'title', 'href', 'colspan', 'rowspan', 'start', 'open',
    'data-correcta', 'data-patas', 'data-modo', 'data-desde', 'data-hasta', 'data-entidades', 'data-flujos',
  ]);

  function hrefSeguro(href) {
    const h = String(href || '').trim();
    if (!h) return false;
    if (/^(https?:|mailto:)/i.test(h)) return true;
    // Relativos: sin esquema (nada de "javascript:", "data:", etc.).
    return !/^[a-z][a-z0-9+.-]*:/i.test(h);
  }

  function limpiarNodo(nodo) {
    [...nodo.childNodes].forEach(hijo => {
      if (hijo.nodeType === Node.COMMENT_NODE) { hijo.remove(); return; }
      if (hijo.nodeType !== Node.ELEMENT_NODE) return;
      const etiqueta = hijo.tagName.toLowerCase();
      if (PROHIBIDAS.has(etiqueta) || hijo.namespaceURI !== 'http://www.w3.org/1999/xhtml') { hijo.remove(); return; }
      if (!ETIQUETAS.has(etiqueta)) {
        // Etiqueta desconocida: se conserva su contenido, sin la etiqueta.
        limpiarNodo(hijo);
        hijo.replaceWith(...hijo.childNodes);
        return;
      }
      [...hijo.attributes].forEach(at => {
        const nombre = at.name.toLowerCase();
        if (!ATRIBUTOS.has(nombre)) { hijo.removeAttribute(at.name); return; }
        if (nombre === 'href' && !hrefSeguro(at.value)) hijo.removeAttribute(at.name);
        if (nombre === 'class') {
          // Solo clases simples y nunca las de la interfaz del profesor.
          const clases = at.value.split(/\s+/).filter(c => /^[a-z0-9-]+$/i.test(c) && !/^prof-/.test(c));
          if (clases.length) hijo.setAttribute('class', clases.join(' '));
          else hijo.removeAttribute('class');
        }
      });
      if (etiqueta === 'a' && /^https?:/i.test(hijo.getAttribute('href') || '')) {
        hijo.setAttribute('target', '_blank');
        hijo.setAttribute('rel', 'noopener noreferrer');
      }
      limpiarNodo(hijo);
    });
  }

  U.sanear = function (html) {
    const t = document.createElement('template');
    t.innerHTML = String(html ?? '');
    limpiarNodo(t.content);
    return t.innerHTML;
  };

  // Atributos de datos permitidos en figuras (gráficos de payoff y diagramas de swaps).
  U.ATRIBUTOS_FIGURA = ['data-patas', 'data-modo', 'data-desde', 'data-hasta', 'data-entidades', 'data-flujos'];

  P.Util = U;
})(window.Profesor = window.Profesor || {});
