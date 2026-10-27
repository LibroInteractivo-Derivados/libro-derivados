// Ilustraciones de cada unidad (SVG simples, sin imágenes externas).
// Usan el color de la unidad (--color en la tarjeta) y se adaptan al tema claro u oscuro.
// Para cambiar una, editá su SVG: el lienzo mide 240 × 80.

const ILUSTRACIONES = (() => {
  const ejes = '<line x1="18" y1="64" x2="226" y2="64" class="il-eje"/><line x1="24" y1="10" x2="24" y2="70" class="il-eje"/>';
  const svg = (contenido, etiqueta) => `<svg viewBox="0 0 240 80" role="img" aria-label="${etiqueta}" xmlns="http://www.w3.org/2000/svg">${contenido}</svg>`;
  return {
    // I · Forward largo y corto: dos rectas que se cruzan en K.
    u1: svg(`<line x1="18" y1="64" x2="200" y2="64" class="il-eje"/><line x1="24" y1="10" x2="24" y2="70" class="il-eje"/>
      <line x1="40" y1="70" x2="200" y2="14" class="il-trazo"/>
      <line x1="40" y1="12" x2="200" y2="68" class="il-trazo il-punteado"/>
      <circle cx="120" cy="41" r="4" class="il-punto"/>
      <text x="205" y="17" class="il-texto">largo</text><text x="205" y="71" class="il-texto">corto</text>
      <text x="114" y="58" class="il-texto">K</text>`, 'Payoff de un forward largo y uno corto'),
    // II · Contado y futuro que se mueven juntos y convergen: la diferencia es la base.
    u2: svg(`${ejes}
      <path d="M30,22 L60,30 L85,24 L110,36 L135,31 L160,40 L185,38 L212,44" class="il-trazo"/>
      <path d="M30,40 L60,47 L85,42 L110,51 L135,47 L160,52 L185,48 L212,44" class="il-trazo il-suave"/>
      <path d="M30,22 L60,30 L85,24 L110,36 L135,31 L160,40 L185,38 L212,44 L185,48 L160,52 L135,47 L110,51 L85,42 L60,47 L30,40 Z" class="il-relleno"/>
      <circle cx="212" cy="44" r="4" class="il-punto"/>
      <text x="34" y="16" class="il-texto">futuro</text><text x="34" y="56" class="il-texto">contado</text>
      <text x="110" y="76" class="il-texto">base → 0 al vencer</text>`, 'Contado y futuro que convergen al vencimiento'),
    // III · Del precio contado al precio forward: S₀·e^(rT).
    u3: svg(`${ejes}
      <path d="M30,56 C80,54 140,44 210,16" class="il-trazo"/>
      <line x1="30" y1="56" x2="210" y2="56" class="il-guia"/><line x1="210" y1="16" x2="210" y2="64" class="il-guia"/>
      <circle cx="30" cy="56" r="4" class="il-punto"/><circle cx="210" cy="16" r="4" class="il-punto"/>
      <text x="36" y="50" class="il-texto">S₀</text><text x="150" y="14" class="il-texto">F₀ = S₀·e^(rT)</text>
      <text x="196" y="76" class="il-texto">T</text>`, 'Del precio contado al precio forward'),
    // IV · Swap: dos partes que intercambian una tasa fija por una variable.
    u4: svg(`<rect x="18" y="20" width="62" height="40" rx="8" class="il-caja"/><rect x="160" y="20" width="62" height="40" rx="8" class="il-caja"/>
      <text x="49" y="45" class="il-texto il-centro">A</text><text x="191" y="45" class="il-texto il-centro">B</text>
      <line x1="86" y1="31" x2="150" y2="31" class="il-trazo" marker-end="url(#il-flecha-u4)"/>
      <line x1="154" y1="50" x2="90" y2="50" class="il-trazo il-suave" marker-end="url(#il-flecha-u4)"/>
      <text x="120" y="25" class="il-texto il-centro">fija</text><text x="120" y="64" class="il-texto il-centro">SOFR</text>
      <defs><marker id="il-flecha-u4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="il-punta"/></marker></defs>`, 'Swap: tasa fija contra tasa variable'),
    // V · Payoff de un call: el "palo de hockey".
    u5: svg(`${ejes}
      <polyline points="30,52 120,52 205,14" class="il-trazo"/>
      <polyline points="30,62 120,62 205,24" class="il-trazo il-punteado il-suave"/>
      <circle cx="120" cy="52" r="4" class="il-punto"/>
      <text x="114" y="46" class="il-texto">K</text><text x="160" y="20" class="il-texto">call</text>
      <text x="150" y="76" class="il-texto">− prima</text>`, 'Payoff de una opción call'),
    // VI · Árbol binomial de dos pasos.
    u6: svg(`<g class="il-trazo">
        <line x1="50" y1="40" x2="120" y2="20"/><line x1="50" y1="40" x2="120" y2="60"/>
        <line x1="120" y1="20" x2="190" y2="8"/><line x1="120" y1="20" x2="190" y2="40"/>
        <line x1="120" y1="60" x2="190" y2="40"/><line x1="120" y1="60" x2="190" y2="72"/></g>
      <circle cx="50" cy="40" r="6" class="il-nodo"/><circle cx="120" cy="20" r="6" class="il-nodo"/><circle cx="120" cy="60" r="6" class="il-nodo"/>
      <circle cx="190" cy="8" r="5" class="il-nodo"/><circle cx="190" cy="40" r="5" class="il-nodo"/><circle cx="190" cy="72" r="5" class="il-nodo"/>
      <text x="16" y="44" class="il-texto">S₀</text><text x="200" y="12" class="il-texto">S·u²</text><text x="200" y="76" class="il-texto">S·d²</text>`, 'Árbol binomial de dos pasos'),
    // VII · Un índice que paga dividendos (cae al cortar el cupón) y monedas.
    u7: svg(`${ejes}
      <path d="M30,52 L62,40 L62,46 L100,32 L100,38 L140,24 L140,30 L180,18 L180,24 L210,16" class="il-trazo"/>
      <text x="56" y="62" class="il-texto">q</text><text x="96" y="52" class="il-texto">q</text><text x="136" y="44" class="il-texto">q</text>
      <text x="150" y="70" class="il-texto">US$ ⇄ €</text><text x="30" y="16" class="il-texto">índice</text>`, 'Índice con dividendos y monedas'),
    // VIII · Estrategias: straddle (V) y mariposa (carpa).
    u8: svg(`${ejes}
      <polyline points="30,16 120,58 210,16" class="il-trazo"/>
      <polyline points="30,58 95,58 120,30 145,58 210,58" class="il-trazo il-punteado il-suave"/>
      <text x="174" y="14" class="il-texto">straddle</text><text x="96" y="74" class="il-texto">mariposa</text>`, 'Payoffs de un straddle y una mariposa'),
  };
})();
