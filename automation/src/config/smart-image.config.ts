/**
 * @fileoverview Smart Image Config - Prompt 23
 *
 * Configuracion centralizada para el sistema de seleccion inteligente
 * de imagenes. Siguiendo patron anti-hardcode del proyecto.
 *
 * Contiene:
 * - Diccionario espanol->ingles para keywords de tecnologia
 * - Configuracion de scoring para seleccion de imagenes
 * - Configuracion de queries alternativas
 * - Colores de fallback (Tech Editorial theme)
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 23
 */

// =============================================================================
// DICCIONARIO ESPANOL -> INGLES
// =============================================================================

/**
 * Diccionario de traduccion espanol -> ingles para keywords de tecnologia.
 * Cubre los terminos mas comunes en noticias de IA/tech.
 *
 * IMPORTANTE: Las keys deben estar en minusculas, sin acentos (normalizadas
 * con NFD + strip diacritics). Los valores son la traduccion al ingles.
 *
 * @example
 * SPANISH_TO_ENGLISH['inteligencia'] // 'intelligence'
 * SPANISH_TO_ENGLISH['modelo'] // 'model'
 */
export const SPANISH_TO_ENGLISH: Record<string, string> = {
  // ===== IA / Machine Learning =====
  'inteligencia': 'intelligence',
  'artificial': 'artificial',
  'aprendizaje': 'learning',
  'profundo': 'deep',
  'automatico': 'machine',
  'modelo': 'model',
  'modelos': 'models',
  'algoritmo': 'algorithm',
  'datos': 'data',
  'entrenamiento': 'training',
  'inferencia': 'inference',
  'neuronal': 'neural',
  'neuronales': 'neural',
  'red': 'network',
  'redes': 'networks',
  'cerebro': 'brain',
  'prediccion': 'prediction',
  'clasificacion': 'classification',
  'generativa': 'generative',
  'generativo': 'generative',
  'chatbot': 'chatbot',
  'agente': 'agent',
  'agentes': 'agents',
  'multimodal': 'multimodal',
  'parametros': 'parameters',
  'tokens': 'tokens',
  'contexto': 'context',
  'prompt': 'prompt',

  // ===== Robotica / Autonomia =====
  'robot': 'robot',
  'robots': 'robots',
  'robotica': 'robotics',
  'dron': 'drone',
  'drones': 'drones',
  'autonomo': 'autonomous',
  'autonoma': 'autonomous',
  'vehiculo': 'vehicle',
  'coche': 'car',
  'conduccion': 'driving',
  'sensor': 'sensor',
  'sensores': 'sensors',

  // ===== Empresas / Industria =====
  'empresa': 'company',
  'empresas': 'companies',
  'industria': 'industry',
  'plataforma': 'platform',
  'sistema': 'system',
  'sistemas': 'systems',
  'servicio': 'service',
  'servicios': 'services',
  'herramienta': 'tool',
  'herramientas': 'tools',
  'aplicacion': 'application',
  'producto': 'product',
  'productos': 'products',
  'lanzamiento': 'launch',
  'anuncio': 'announcement',
  'version': 'version',
  'actualizacion': 'update',
  'disponible': 'available',
  'gratis': 'free',
  'gratuito': 'free',
  'precio': 'price',
  'costo': 'cost',
  'millones': 'millions',

  // ===== Tecnologia General =====
  'tecnologia': 'technology',
  'digital': 'digital',
  'software': 'software',
  'hardware': 'hardware',
  'procesador': 'processor',
  'chip': 'chip',
  'chips': 'chips',
  'memoria': 'memory',
  'almacenamiento': 'storage',
  'servidor': 'server',
  'servidores': 'servers',
  'nube': 'cloud',
  'computacion': 'computing',
  'programacion': 'programming',
  'codigo': 'code',
  'desarrollo': 'development',
  'desarrollador': 'developer',
  'desarrolladores': 'developers',
  'interfaz': 'interface',
  'pantalla': 'screen',
  'dispositivo': 'device',
  'dispositivos': 'devices',
  'movil': 'mobile',
  'internet': 'internet',
  'navegador': 'browser',
  'busqueda': 'search',
  'buscador': 'search engine',

  // ===== Acciones / Verbos / Sustantivos de Accion =====
  'revoluciona': 'revolution',
  'transforma': 'transformation',
  'mejora': 'improvement',
  'avance': 'advancement',
  'innovacion': 'innovation',
  'descubrimiento': 'discovery',
  'investigacion': 'research',
  'creacion': 'creation',
  'generacion': 'generation',
  'deteccion': 'detection',
  'reconocimiento': 'recognition',
  'procesamiento': 'processing',
  'analisis': 'analysis',
  'optimizacion': 'optimization',
  'automatizacion': 'automation',
  'capacidad': 'capability',
  'rendimiento': 'performance',
  'velocidad': 'speed',
  'precision': 'accuracy',
  'eficiencia': 'efficiency',
  'funcionalidad': 'functionality',
  'caracteristica': 'feature',
  'cambio': 'change',
  'impacto': 'impact',

  // ===== Seguridad =====
  'seguridad': 'security',
  'ciberseguridad': 'cybersecurity',
  'privacidad': 'privacy',
  'proteccion': 'protection',
  'vulnerabilidad': 'vulnerability',
  'amenaza': 'threat',
  'riesgo': 'risk',

  // ===== Medios / Contenido =====
  'imagen': 'image',
  'imagenes': 'images',
  'video': 'video',
  'texto': 'text',
  'voz': 'voice',
  'audio': 'audio',
  'lenguaje': 'language',
  'traduccion': 'translation',
  'contenido': 'content',
  'multimedia': 'multimedia',
  'fotografia': 'photography',
  'musica': 'music',
  'arte': 'art',

  // ===== Medicina / Ciencia =====
  'medicina': 'medicine',
  'medico': 'medical',
  'diagnostico': 'diagnosis',
  'cirugia': 'surgery',
  'farmaceutico': 'pharmaceutical',
  'genoma': 'genome',
  'proteina': 'protein',
  'salud': 'health',
  'paciente': 'patient',
  'tratamiento': 'treatment',

  // ===== Negocios / Finanzas =====
  'mercado': 'market',
  'inversion': 'investment',
  'financiero': 'financial',
  'economia': 'economy',
  'comercio': 'commerce',
  'usuario': 'user',
  'usuarios': 'users',
  'cliente': 'client',
  'competencia': 'competition',
  'crecimiento': 'growth',

  // ===== Espacio / Ciencia =====
  'espacio': 'space',
  'satelite': 'satellite',
  'exploracion': 'exploration',
  'universo': 'universe',
  'energia': 'energy',
  'renovable': 'renewable',
  'cuantico': 'quantum',
  'cuantica': 'quantum',
  'fisica': 'physics',
  'ciencia': 'science',

  // ===== Gaming / Entretenimiento =====
  'juego': 'game',
  'juegos': 'games',
  'videojuego': 'videogame',
  'videojuegos': 'videogames',
  'jugador': 'player',
  'simulacion': 'simulation',
  'virtual': 'virtual',
  'realidad': 'reality',
  'aumentada': 'augmented',
  'graficos': 'graphics',
  'render': 'render',
  'mundo': 'world',
  'mundos': 'worlds',
  'interactivo': 'interactive',
  'streaming': 'streaming',

  // ===== Adjetivos Comunes en Tech News =====
  'nuevo': 'new',
  'nueva': 'new',
  'nuevos': 'new',
  'nuevas': 'new',
  'avanzado': 'advanced',
  'avanzada': 'advanced',
  'potente': 'powerful',
  'rapido': 'fast',
  'rapida': 'fast',
  'inteligente': 'intelligent',
  'global': 'global',
  'masivo': 'massive',
  'experimental': 'experimental',
  'revolucionario': 'revolutionary',
  'revolucionaria': 'revolutionary',
  'abierto': 'open',
  'abierta': 'open',
  'libre': 'open source',
  'futuro': 'future',
  'proximo': 'next',
  'proxima': 'next',
  'mejor': 'better',
  'mayor': 'bigger',
  'grande': 'large',
  'pequeno': 'small',
  'completo': 'complete',
};

// =============================================================================
// CONFIGURACION DE SCORING
// =============================================================================

/**
 * Configuracion de scoring para seleccion de imagenes de Pexels.
 *
 * Cuando Pexels devuelve multiples resultados, se evalua cada uno
 * con estos criterios para seleccionar la mas relevante.
 */
export const IMAGE_SCORING_CONFIG = {
  /** Numero de candidatos a obtener de Pexels para scoring */
  candidateCount: 5,

  /** Score minimo para aceptar una imagen (0-100) */
  minimumScore: 20,

  /**
   * Pesos de scoring (deben sumar 100)
   *
   * - textRelevance: cuantas keywords de la query aparecen en el alt text
   * - orientationBonus: portrait preferido para YouTube Shorts
   * - resolution: resolucion (mayor = mejor)
   * - positionBonus: posicion en resultados de Pexels (primeros = mas relevantes)
   */
  weights: {
    textRelevance: 50,
    orientationBonus: 25,
    resolution: 15,
    positionBonus: 10,
  },

  /** Resolucion minima aceptable (ancho en px) */
  minimumWidth: 800,

  /** Resolucion ideal (ancho en px) - score maximo */
  idealWidth: 2000,
};

// =============================================================================
// CONFIGURACION DE QUERIES
// =============================================================================

/**
 * Configuracion para generacion de queries de busqueda
 */
export const QUERY_CONFIG = {
  /** Numero maximo de queries alternativas a generar */
  maxAlternatives: 2,

  /** Keywords maximas por query (APIs trabajan mejor con queries cortas) */
  maxKeywordsPerQuery: 3,

  /**
   * Fallback topics cuando todo falla (en ingles, tematicos de tech/IA).
   * Se selecciona uno aleatorio para evitar repeticion.
   */
  fallbackTopics: [
    'artificial intelligence technology',
    'tech innovation futuristic',
    'digital transformation abstract',
    'modern technology workspace',
    'data science visualization',
  ],
};

// =============================================================================
// CONFIGURACION DE FALLBACK (UI Avatars)
// =============================================================================

/**
 * Colores para UI Avatars fallback - Tech Editorial theme (Prompt 20)
 * Se usan cuando ningun proveedor retorna imagen valida
 */
export const FALLBACK_THEME = {
  /** Fondo oscuro (Tech Editorial background) */
  backgroundColor: '0F172A',
  /** Texto azul primario (Tech Editorial primary) */
  textColor: '4A9EFF',
  /** Tamano de la imagen generada */
  imageSize: 800,
  /** Si el texto se muestra en negrita */
  bold: true,
};
