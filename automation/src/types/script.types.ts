/**
 * @fileoverview Tipos para Scripts Generados
 *
 * Define interfaces para scripts de video generados por Gemini,
 * incluyendo reporte de compliance y metadata.
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 15
 */

// =============================================================================
// INTERFACES DE COMPLIANCE
// =============================================================================

/**
 * Marcadores que indican "humanidad" en un script
 *
 * Estos marcadores se usan para validar que el script
 * cumple con los requisitos de contenido genuino de YouTube.
 */
export interface HumanMarkers {
  /** Usa primera persona (yo, mi, me, creo, etc.) */
  hasFirstPerson: boolean;

  /** Incluye opinion subjetiva */
  hasOpinion: boolean;

  /** Admite incertidumbre (probablemente, quizas, etc.) */
  admitsUncertainty: boolean;

  /** Tiene pregunta reflexiva que invita a pensar */
  hasReflectiveQuestion: boolean;

  /** Evita lenguaje corporativo (revolucionario, disruptivo, etc.) */
  avoidsCorpSpeak: boolean;

  /** Incluye analogia o comparacion con mundo real */
  hasAnalogy: boolean;
}

/**
 * Reporte de validacion de compliance
 *
 * Resultado de evaluar un script contra los criterios
 * de "humanidad" requeridos para YouTube.
 */
export interface ComplianceReport {
  /** Si el script pasa el umbral minimo (4/6 marcadores) */
  passed: boolean;

  /** Score de humanidad (0-6) */
  humanScore: number;

  /** Detalle de cada marcador */
  markers: HumanMarkers;

  /** Recomendacion basada en el score */
  recommendation: string;

  /** Lista de problemas encontrados */
  issues: string[];

  /** Lista de fortalezas identificadas */
  strengths: string[];
}

// =============================================================================
// INTERFACES DE SCRIPT
// =============================================================================

/**
 * Metadata adicional del script generado
 */
export interface ScriptMetadata {
  /** ID de la noticia fuente */
  newsId: string;

  /** Empresa principal mencionada */
  company?: string;

  /** Categoria de la noticia */
  category?: string;

  /** Timestamp de generacion */
  generatedAt: string;

  /** Modelo usado para generar (si se uso fallback) */
  modelUsed?: string;

  /** Razones de fallback si se uso modelo alternativo */
  fallbackReason?: string[];

  /** Terminos tecnicos detectados en el script */
  technicalTerms?: string[];

  /** Marcadores humanos extraidos por Gemini */
  humanMarkers?: {
    /** Ejemplo de uso de primera persona */
    firstPersonUsage?: string;
    /** Ejemplo de incertidumbre admitida */
    uncertaintyAdmitted?: string;
    /** Conexion con tendencia mayor */
    trendConnection?: string;
  };
}

/**
 * Script generado por Gemini
 *
 * Estructura del guion para un video short de noticias de IA.
 * Sigue la estructura: Hook -> Analysis -> Reflection -> CTA
 *
 * @example
 * ```typescript
 * const script: GeneratedScript = {
 *   hook: "Hay un detalle que todos estan pasando por alto.",
 *   body: "Anthropic optimizo la inferencia sin comprometer calidad...",
 *   opinion: "Lo que me parece interesante es que probablemente...",
 *   cta: "Crees que este enfoque es sostenible? Dejame tu analisis.",
 *   duration: 52
 * };
 * ```
 */
export interface GeneratedScript {
  /**
   * Hook inicial (0-3 segundos)
   *
   * Frase inteligente que capta atencion sin clickbait.
   * Maximo 15 palabras.
   */
  hook: string;

  /**
   * Cuerpo del analisis (3-35 segundos)
   *
   * Analisis estructurado: que paso, por que importa, que cambia.
   * Puede llamarse "analysis" en la respuesta de Gemini.
   */
  body: string;

  /**
   * Reflexion personal (35-50 segundos)
   *
   * Opinion en primera persona con perspectiva tecnica.
   * Puede llamarse "reflection" en la respuesta de Gemini.
   */
  opinion: string;

  /**
   * Call to Action (50-55 segundos)
   *
   * Pregunta especifica relacionada con el analisis.
   */
  cta: string;

  /**
   * Duracion estimada en segundos
   *
   * Target: 50-55 segundos para video de 55s total.
   */
  duration: number;

  /**
   * Hashtags para YouTube (opcional)
   *
   * Se generan por separado si es necesario.
   * NO se renderizan en el video, solo metadata.
   */
  hashtags?: string[];

  /**
   * Metadata adicional del script
   */
  metadata?: ScriptMetadata;

  /**
   * Reporte de compliance (agregado por validador)
   *
   * Indica si el script cumple con los requisitos
   * de "humanidad" para YouTube.
   */
  complianceReport?: ComplianceReport;
}

// =============================================================================
// INTERFACES LEGACY (Compatibilidad con scriptGen.ts anterior)
// =============================================================================

/**
 * Estructura legacy del VideoScript
 *
 * Mantiene compatibilidad con el formato anterior de scriptGen.ts.
 * Usar GeneratedScript para nuevo codigo.
 *
 * @deprecated Usar GeneratedScript en su lugar
 */
export interface VideoScript {
  /** 0-3s: Frase impactante inicial */
  gancho: string;

  /** 3-8s: Titulo principal */
  headline: string;

  /** 8-50s: Puntos principales (array de frases) */
  contenido: string[];

  /** 50-55s: Dato o reflexion impactante */
  impacto: string;

  /** 55-60s: Call to action */
  cta: string;

  /** Tags para mostrar en pantalla */
  tags: string[];

  /** Script completo para TTS */
  fullScript: string;
}

// =============================================================================
// FUNCIONES DE CONVERSION
// =============================================================================

/**
 * Convierte GeneratedScript a VideoScript legacy
 *
 * Util para mantener compatibilidad con codigo existente
 * que espera el formato VideoScript.
 *
 * @param script - Script en formato nuevo
 * @returns Script en formato legacy
 *
 * @example
 * ```typescript
 * const newScript: GeneratedScript = await generator.generateScript(news);
 * const legacyScript = convertToLegacyScript(newScript);
 * ```
 */
export function convertToLegacyScript(script: GeneratedScript): VideoScript {
  // Dividir el body en puntos si es necesario
  const contenido = script.body
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10)
    .slice(0, 5);

  return {
    gancho: script.hook,
    headline: script.hook, // En el nuevo formato, hook sirve como headline
    contenido,
    impacto: script.opinion,
    cta: script.cta,
    tags: script.hashtags || [],
    fullScript: `${script.hook} ${script.body} ${script.opinion} ${script.cta}`,
  };
}

/**
 * Convierte VideoScript legacy a GeneratedScript
 *
 * @param legacy - Script en formato legacy
 * @returns Script en formato nuevo
 */
export function convertFromLegacyScript(legacy: VideoScript): GeneratedScript {
  return {
    hook: legacy.gancho,
    body: legacy.contenido.join('. '),
    opinion: legacy.impacto,
    cta: legacy.cta,
    duration: 55, // Estimado por defecto
    hashtags: legacy.tags,
  };
}

// =============================================================================
// TIPOS AUXILIARES
// =============================================================================

/**
 * Resultado de generacion con posible error
 */
export type ScriptGenerationResult =
  | { success: true; script: GeneratedScript }
  | { success: false; error: string };

/**
 * Opciones para el generador de scripts
 */
export interface ScriptGeneratorOptions {
  /** Maximo de reintentos si no pasa compliance */
  maxRetries?: number;

  /** Temperatura para Gemini (0-1) */
  temperature?: number;

  /** Modelo a usar */
  model?: 'gemini-2.5-flash' | 'gemini-2.0-flash' | 'gemini-2.0-flash-exp' | 'gemini-1.5-flash' | 'gemini-pro';

  /** Si debe validar compliance */
  validateCompliance?: boolean;
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  convertToLegacyScript,
  convertFromLegacyScript,
};
