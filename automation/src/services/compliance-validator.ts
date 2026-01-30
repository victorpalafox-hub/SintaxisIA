/**
 * @fileoverview Servicio de Validacion de Compliance
 *
 * Valida que los scripts generados tengan suficientes "marcadores humanos"
 * para cumplir con las politicas de contenido de YouTube.
 *
 * El sistema detecta 6 marcadores y requiere minimo 4 para pasar:
 * 1. Primera persona (yo, mi, creo, etc.)
 * 2. Opinion subjetiva
 * 3. Incertidumbre admitida
 * 4. Pregunta reflexiva
 * 5. Evita lenguaje corporativo
 * 6. Usa analogias
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 15
 */

import type {
  GeneratedScript,
  HumanMarkers,
  ComplianceReport,
} from '../types/script.types';

// =============================================================================
// CONSTANTES
// =============================================================================

/**
 * Umbral minimo de marcadores humanos para pasar compliance
 * Un script debe tener al menos 4 de 6 marcadores
 */
const MINIMUM_HUMAN_SCORE = 4;

/**
 * Patrones regex para detectar primera persona
 */
const FIRST_PERSON_PATTERNS =
  /\b(yo|mi|me|creo|pienso|noto|observo|considero|veo|encuentro|parece|llama la atencion|mi analisis|mi opinion)\b/i;

/**
 * Patrones regex para detectar opinion subjetiva
 */
const OPINION_PATTERNS =
  /\b(parece|considero|en mi opinion|para mi|desde mi perspectiva|personalmente|me parece|creo que|pienso que|noto que)\b/i;

/**
 * Patrones regex para detectar admision de incertidumbre
 */
const UNCERTAINTY_PATTERNS =
  /\b(quizas|quiza|probablemente|podria|tal vez|posiblemente|no esta claro|habra que ver|es dificil saber|aun no sabemos|no tenemos certeza|puede que|es posible que)\b/i;

/**
 * Patrones regex para detectar preguntas reflexivas
 */
const REFLECTIVE_QUESTION_PATTERNS =
  /\b(crees|piensas|te imaginas|consideras|has notado|te preguntas|que opinas|como ves|te parece)\b/i;

/**
 * Patrones regex para detectar lenguaje corporativo (a EVITAR)
 */
const CORP_SPEAK_PATTERNS =
  /\b(disruptivo|innovador|revolucionario|game-changer|paradigma|sinergia|optimizar|potenciar|transformacional|lider en|pionero|vanguardia|increible|insano|brutal)\b/i;

/**
 * Patrones regex para detectar analogias
 */
const ANALOGY_PATTERNS =
  /\b(como|similar a|recuerda a|parecido a|es como si|imagina que|piensa en|de la misma manera que|al igual que|comparado con)\b/i;

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

/**
 * Servicio de validacion de compliance para YouTube
 *
 * Verifica que los scripts generados tengan suficientes
 * "marcadores humanos" para cumplir con las politicas de YouTube
 * sobre contenido generado por IA.
 *
 * @example
 * ```typescript
 * const validator = new ComplianceValidator();
 * const report = validator.validateHumanElements(script);
 *
 * if (report.passed) {
 *   console.log('Script listo para produccion');
 * } else {
 *   console.log('Problemas:', report.issues);
 * }
 * ```
 */
export class ComplianceValidator {
  /**
   * Valida que el script tenga suficientes elementos humanos
   *
   * Analiza el texto completo del script buscando 6 tipos de
   * marcadores humanos. Requiere minimo 4 para pasar.
   *
   * @param script - Script generado a validar
   * @returns Reporte completo de compliance
   */
  validateHumanElements(script: GeneratedScript): ComplianceReport {
    // Construir texto completo para analisis
    const fullText = this.buildFullText(script);

    // Evaluar cada marcador
    const markers: HumanMarkers = {
      hasFirstPerson: this.checkFirstPerson(fullText),
      hasOpinion: this.checkOpinion(fullText),
      admitsUncertainty: this.checkUncertainty(fullText),
      hasReflectiveQuestion: this.checkReflectiveQuestion(fullText),
      avoidsCorpSpeak: this.avoidsCorpSpeak(fullText),
      hasAnalogy: this.checkAnalogy(fullText),
    };

    // Calcular score
    const score = Object.values(markers).filter(Boolean).length;
    const passed = score >= MINIMUM_HUMAN_SCORE;

    // Generar listas de issues y strengths
    const { issues, strengths } = this.analyzeMarkers(markers);

    // Generar recomendacion basada en score
    const recommendation = this.generateRecommendation(score);

    return {
      passed,
      humanScore: score,
      markers,
      recommendation,
      issues,
      strengths,
    };
  }

  /**
   * Construye el texto completo del script para analisis
   */
  private buildFullText(script: GeneratedScript): string {
    const parts = [
      script.hook,
      script.body,
      script.opinion,
      script.cta,
    ].filter(Boolean);

    return parts.join(' ');
  }

  /**
   * Verifica uso de primera persona
   *
   * Busca patrones como: yo, mi, me, creo, pienso, noto, etc.
   */
  private checkFirstPerson(text: string): boolean {
    return FIRST_PERSON_PATTERNS.test(text);
  }

  /**
   * Verifica opinion subjetiva
   *
   * Busca patrones como: parece, considero, en mi opinion, etc.
   */
  private checkOpinion(text: string): boolean {
    return OPINION_PATTERNS.test(text);
  }

  /**
   * Verifica que admita incertidumbre
   *
   * Busca patrones como: quizas, probablemente, no esta claro, etc.
   */
  private checkUncertainty(text: string): boolean {
    return UNCERTAINTY_PATTERNS.test(text);
  }

  /**
   * Verifica pregunta reflexiva
   *
   * Requiere signo de interrogacion Y palabras reflexivas.
   */
  private checkReflectiveQuestion(text: string): boolean {
    const hasQuestion = text.includes('?');
    const hasReflectiveWords = REFLECTIVE_QUESTION_PATTERNS.test(text);
    return hasQuestion && hasReflectiveWords;
  }

  /**
   * Verifica que evite lenguaje corporativo
   *
   * Retorna TRUE si NO contiene palabras corporativas.
   */
  private avoidsCorpSpeak(text: string): boolean {
    return !CORP_SPEAK_PATTERNS.test(text);
  }

  /**
   * Verifica analogia o comparacion
   *
   * Busca patrones como: como, similar a, es como si, etc.
   */
  private checkAnalogy(text: string): boolean {
    return ANALOGY_PATTERNS.test(text);
  }

  /**
   * Analiza marcadores y genera listas de issues/strengths
   */
  private analyzeMarkers(markers: HumanMarkers): {
    issues: string[];
    strengths: string[];
  } {
    const issues: string[] = [];
    const strengths: string[] = [];

    // Primera persona
    if (!markers.hasFirstPerson) {
      issues.push(
        "Falta uso de primera persona ('yo creo', 'me parece', 'noto que')"
      );
    } else {
      strengths.push('Usa primera persona apropiadamente');
    }

    // Opinion
    if (!markers.hasOpinion) {
      issues.push("Falta opinion personal ('en mi opinion', 'considero que')");
    } else {
      strengths.push('Incluye opinion personal');
    }

    // Incertidumbre
    if (!markers.admitsUncertainty) {
      issues.push(
        "Falta admitir incertidumbre ('probablemente', 'aun no esta claro')"
      );
    } else {
      strengths.push('Admite incertidumbre apropiadamente');
    }

    // Pregunta reflexiva
    if (!markers.hasReflectiveQuestion) {
      issues.push('Falta pregunta reflexiva que invite a pensar');
    } else {
      strengths.push('Incluye pregunta reflexiva');
    }

    // Corp speak
    if (!markers.avoidsCorpSpeak) {
      issues.push('Usa lenguaje corporativo o frases hechas');
    } else {
      strengths.push('Evita lenguaje corporativo');
    }

    // Analogia
    if (!markers.hasAnalogy) {
      issues.push('Falta analogia o comparacion con mundo real');
    } else {
      strengths.push('Usa analogias efectivas');
    }

    return { issues, strengths };
  }

  /**
   * Genera recomendacion basada en el score
   */
  private generateRecommendation(score: number): string {
    if (score < 3) {
      return 'Script muy robotico. Regenerar con mas enfasis en tono humano y personal.';
    } else if (score < MINIMUM_HUMAN_SCORE) {
      return 'Script borderline. Regenerar agregando elementos humanos faltantes.';
    } else if (score < 5) {
      return 'Script aceptable pero puede mejorar. Considerar agregar elementos faltantes.';
    } else {
      return 'Script cumple con naturalidad humana. Listo para produccion.';
    }
  }

  /**
   * Valida solo si tiene primera persona (quick check)
   *
   * Util para validacion rapida antes de compliance completo.
   */
  quickCheckFirstPerson(text: string): boolean {
    return this.checkFirstPerson(text);
  }

  /**
   * Cuenta palabras corporativas en el texto
   *
   * Util para debugging y analisis detallado.
   */
  countCorpSpeakWords(text: string): number {
    const words = [
      'disruptivo',
      'innovador',
      'revolucionario',
      'game-changer',
      'paradigma',
      'sinergia',
      'optimizar',
      'potenciar',
      'transformacional',
      'increible',
      'insano',
      'brutal',
    ];

    let count = 0;
    const lowerText = text.toLowerCase();

    for (const word of words) {
      if (lowerText.includes(word)) {
        count++;
      }
    }

    return count;
  }
}

// =============================================================================
// INSTANCIA SINGLETON
// =============================================================================

/**
 * Instancia singleton del validador
 *
 * Usar cuando no se necesita configuracion personalizada.
 */
export const complianceValidator = new ComplianceValidator();

// =============================================================================
// FUNCIONES STANDALONE
// =============================================================================

/**
 * Valida un script de forma standalone
 *
 * Wrapper conveniente para uso sin instanciar la clase.
 *
 * @param script - Script a validar
 * @returns Reporte de compliance
 */
export function validateScriptCompliance(
  script: GeneratedScript
): ComplianceReport {
  return complianceValidator.validateHumanElements(script);
}

/**
 * Quick check: verifica si un texto tiene tono humano basico
 *
 * @param text - Texto a verificar
 * @returns true si tiene al menos primera persona y no es corp speak
 */
export function quickHumanCheck(text: string): boolean {
  const validator = new ComplianceValidator();
  const hasFirstPerson = validator.quickCheckFirstPerson(text);
  const corpCount = validator.countCorpSpeakWords(text);

  return hasFirstPerson && corpCount === 0;
}

// =============================================================================
// EXPORTS
// =============================================================================

export default ComplianceValidator;
