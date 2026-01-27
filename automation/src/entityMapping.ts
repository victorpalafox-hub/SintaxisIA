// ===================================
// ENTITY MAPPING - Mapeo de entidades de IA
// ===================================

/**
 * Configuración de entidades reconocidas
 * Usado para búsqueda de noticias y resaltado en videos
 */

export interface EntityConfig {
  domain: string;
  displayName: string;
  category: 'ai-company' | 'ai-model' | 'dev-tool' | 'cloud' | 'general';
  aliases?: string[];
  color?: string;  // Color personalizado para esta entidad
}

// Mapeo de entidades conocidas
export const ENTITY_MAP: Record<string, EntityConfig> = {
  // Empresas de IA
  openai: {
    domain: 'openai.com',
    displayName: 'OpenAI',
    category: 'ai-company',
    aliases: ['open ai', 'open-ai'],
  },
  anthropic: {
    domain: 'anthropic.com',
    displayName: 'Anthropic',
    category: 'ai-company',
  },
  google: {
    domain: 'google.com',
    displayName: 'Google',
    category: 'ai-company',
    aliases: ['alphabet', 'deepmind'],
  },
  microsoft: {
    domain: 'microsoft.com',
    displayName: 'Microsoft',
    category: 'ai-company',
  },
  meta: {
    domain: 'meta.com',
    displayName: 'Meta',
    category: 'ai-company',
    aliases: ['facebook'],
  },
  nvidia: {
    domain: 'nvidia.com',
    displayName: 'NVIDIA',
    category: 'ai-company',
  },

  // Modelos de IA
  chatgpt: {
    domain: 'chat.openai.com',
    displayName: 'ChatGPT',
    category: 'ai-model',
    aliases: ['chat gpt', 'chat-gpt'],
  },
  gpt4: {
    domain: 'openai.com',
    displayName: 'GPT-4',
    category: 'ai-model',
    aliases: ['gpt-4', 'gpt 4', 'gpt4o', 'gpt-4o'],
  },
  claude: {
    domain: 'claude.ai',
    displayName: 'Claude',
    category: 'ai-model',
    aliases: ['claude 3', 'claude-3', 'claude opus', 'claude sonnet'],
  },
  gemini: {
    domain: 'gemini.google.com',
    displayName: 'Gemini',
    category: 'ai-model',
    aliases: ['google gemini', 'gemini pro', 'gemini ultra'],
  },
  llama: {
    domain: 'llama.meta.com',
    displayName: 'Llama',
    category: 'ai-model',
    aliases: ['llama 2', 'llama 3', 'llama-3'],
  },
  midjourney: {
    domain: 'midjourney.com',
    displayName: 'Midjourney',
    category: 'ai-model',
    aliases: ['mid journey', 'mid-journey', 'mj'],
  },
  dalle: {
    domain: 'openai.com/dall-e',
    displayName: 'DALL-E',
    category: 'ai-model',
    aliases: ['dall-e', 'dall e', 'dalle 3'],
  },
  sora: {
    domain: 'openai.com/sora',
    displayName: 'Sora',
    category: 'ai-model',
  },
  copilot: {
    domain: 'github.com/features/copilot',
    displayName: 'GitHub Copilot',
    category: 'dev-tool',
    aliases: ['github copilot', 'copilot x'],
  },

  // Herramientas de desarrollo
  cursor: {
    domain: 'cursor.sh',
    displayName: 'Cursor',
    category: 'dev-tool',
    aliases: ['cursor ai', 'cursor ide'],
  },
  replit: {
    domain: 'replit.com',
    displayName: 'Replit',
    category: 'dev-tool',
    aliases: ['replit ai', 'replit ghostwriter'],
  },

  // Cloud
  aws: {
    domain: 'aws.amazon.com',
    displayName: 'AWS',
    category: 'cloud',
    aliases: ['amazon web services', 'bedrock', 'aws bedrock'],
  },
  azure: {
    domain: 'azure.microsoft.com',
    displayName: 'Azure',
    category: 'cloud',
    aliases: ['microsoft azure', 'azure openai'],
  },
};

/**
 * Obtiene la configuración de una entidad por nombre
 * Busca coincidencias exactas y aliases
 */
export function getEntityConfig(name: string): EntityConfig {
  const normalized = name.toLowerCase().replace(/[\s-]+/g, '');

  // Buscar coincidencia exacta
  if (ENTITY_MAP[normalized]) {
    return ENTITY_MAP[normalized];
  }

  // Buscar en aliases
  for (const [key, config] of Object.entries(ENTITY_MAP)) {
    if (config.aliases?.some(alias =>
      alias.toLowerCase().replace(/[\s-]+/g, '') === normalized
    )) {
      return config;
    }
  }

  // Retornar configuración por defecto
  return {
    domain: `${normalized}.com`,
    displayName: name,
    category: 'general',
  };
}

/**
 * Verifica si un texto contiene una entidad conocida
 */
export function containsKnownEntity(text: string): boolean {
  const normalizedText = text.toLowerCase();

  for (const [, config] of Object.entries(ENTITY_MAP)) {
    if (normalizedText.includes(config.displayName.toLowerCase())) {
      return true;
    }
    if (config.aliases?.some(alias =>
      normalizedText.includes(alias.toLowerCase())
    )) {
      return true;
    }
  }

  return false;
}

/**
 * Extrae todas las entidades mencionadas en un texto
 */
export function extractEntities(text: string): EntityConfig[] {
  const found: EntityConfig[] = [];
  const normalizedText = text.toLowerCase();

  for (const [, config] of Object.entries(ENTITY_MAP)) {
    const isFound = normalizedText.includes(config.displayName.toLowerCase()) ||
      config.aliases?.some(alias => normalizedText.includes(alias.toLowerCase()));

    if (isFound && !found.some(e => e.displayName === config.displayName)) {
      found.push(config);
    }
  }

  return found;
}

/**
 * Lista de keywords para resaltado en subtítulos
 */
export function getHighlightKeywords(): string[] {
  const keywords: string[] = [];

  for (const config of Object.values(ENTITY_MAP)) {
    keywords.push(config.displayName);
    if (config.aliases) {
      keywords.push(...config.aliases);
    }
  }

  // Agregar términos genéricos
  keywords.push('IA', 'AI', 'AGI', 'LLM', 'Machine Learning', 'Deep Learning');

  return [...new Set(keywords)]; // Eliminar duplicados
}

export default ENTITY_MAP;
