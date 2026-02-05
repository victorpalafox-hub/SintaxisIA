/**
 * @fileoverview News Enricher Service - Prompt 24
 *
 * Enriquece objetos NewsItem con campos que normalizeNewsArticle() deja vacíos:
 * - company: detectada desde título/descripción usando COMPANY_ALIASES + COMPANY_SCORES
 * - type: detectado desde título/descripción usando NEWS_TYPE_PATTERNS
 * - productName: extraído con regex del título
 *
 * Sin estos campos, el scoring de CarnitaScorer pierde hasta 19 puntos
 * (company: 0-10pts + type: 0-9pts), haciendo casi imposible alcanzar
 * el umbral de 75/97 puntos.
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 24
 */

import { logger } from '../../utils/logger';
import {
  COMPANY_ALIASES,
  NEWS_TYPE_PATTERNS,
  PRODUCT_NAME_PATTERNS,
} from '../config/newsdata.config';
import { COMPANY_SCORES } from '../config/scoring-rules';
import type { NewsItem } from '../types/news.types';
import type { NewsType } from '../types/scoring.types';

// =============================================================================
// SERVICIO DE ENRIQUECIMIENTO
// =============================================================================

/**
 * Servicio para enriquecer noticias con datos de scoring
 *
 * normalizeNewsArticle() convierte NewsArticle → NewsItem pero deja
 * company, type, metrics y productName como undefined. Este servicio
 * llena esos campos analizando el texto de título y descripción.
 *
 * @example
 * ```typescript
 * const enricher = new NewsEnricherService();
 * const enrichedItems = enricher.enrichAll(normalizedItems);
 * // Ahora los items tienen company, type y productName detectados
 * ```
 */
export class NewsEnricherService {
  /**
   * Enriquece un array completo de NewsItem
   *
   * Detecta company, type y productName para cada item y
   * loguea estadísticas de cuántos campos fueron detectados.
   *
   * @param items - Array de NewsItem con campos vacíos
   * @returns Array de NewsItem enriquecidos (mismas referencias mutadas)
   */
  enrichAll(items: NewsItem[]): NewsItem[] {
    logger.info(`[NewsEnricher] Enriqueciendo ${items.length} noticias...`);

    const enriched = items.map(item => this.enrich(item));

    // Estadísticas de enriquecimiento
    const withCompany = enriched.filter(i => i.company).length;
    const withType = enriched.filter(i => i.type).length;
    const withProduct = enriched.filter(i => i.productName).length;

    logger.info(
      `[NewsEnricher] Resultados: ${withCompany}/${items.length} con empresa, ` +
      `${withType}/${items.length} con tipo, ${withProduct}/${items.length} con producto`,
    );

    return enriched;
  }

  /**
   * Enriquece un solo NewsItem
   *
   * Detecta company, type y productName si no están ya definidos.
   * No sobreescribe campos que ya tienen valor.
   *
   * @param item - NewsItem a enriquecer
   * @returns El mismo item con campos detectados
   */
  enrich(item: NewsItem): NewsItem {
    // Texto combinado para análisis
    const fullText = `${item.title} ${item.description}`;

    // Solo enriquecer campos que están vacíos
    if (!item.company) {
      item.company = this.detectCompany(fullText);
    }

    if (!item.type) {
      item.type = this.detectType(fullText);
    }

    if (!item.productName) {
      item.productName = this.extractProductName(item.title);
    }

    return item;
  }

  /**
   * Detecta la empresa principal mencionada en el texto
   *
   * Busca primero en COMPANY_ALIASES (variantes de nombres),
   * luego en las keys de COMPANY_SCORES (nombres canónicos).
   *
   * @param text - Texto completo (título + descripción)
   * @returns Nombre canónico de la empresa o undefined
   */
  private detectCompany(text: string): string | undefined {
    const textLower = text.toLowerCase();

    // 1. Buscar en aliases (más variantes, matchea cosas como "chatgpt" → "OpenAI")
    for (const [alias, canonical] of Object.entries(COMPANY_ALIASES)) {
      if (textLower.includes(alias)) {
        return canonical;
      }
    }

    // 2. Buscar nombres canónicos directamente en el texto original (case-sensitive)
    for (const companyName of Object.keys(COMPANY_SCORES)) {
      if (companyName !== 'default' && text.includes(companyName)) {
        return companyName;
      }
    }

    return undefined;
  }

  /**
   * Detecta el tipo de noticia desde el texto
   *
   * Evalúa NEWS_TYPE_PATTERNS en orden de prioridad.
   * El primer tipo que matchee gana.
   *
   * @param text - Texto completo (título + descripción)
   * @returns Tipo de noticia o undefined (se asigna 'other' por defecto en scoring)
   */
  private detectType(text: string): NewsType | undefined {
    for (const { type, patterns } of NEWS_TYPE_PATTERNS) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          return type;
        }
      }
    }

    return undefined;
  }

  /**
   * Extrae nombre de producto del título
   *
   * Busca patrones como "presenta X", "lanza X", "launches X",
   * o nombres entre comillas.
   *
   * Lógica movida desde orchestrator.ts extractProductName() (dead code).
   *
   * @param title - Título de la noticia
   * @returns Nombre del producto o undefined
   */
  private extractProductName(title: string): string | undefined {
    for (const pattern of PRODUCT_NAME_PATTERNS) {
      const match = title.match(pattern);
      if (match?.[1]) {
        // Limpiar: remover trailing whitespace y caracteres especiales
        const name = match[1].trim().replace(/[.,;:!?]+$/, '');
        // Validar que tenga al menos 2 caracteres
        if (name.length >= 2) {
          return name;
        }
      }
    }

    return undefined;
  }
}
