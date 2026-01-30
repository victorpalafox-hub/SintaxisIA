/**
 * @fileoverview Calendario de Publicación
 *
 * Define cuándo se publican videos automáticamente.
 * Configuración: Cada 2 días (Lun/Mié/Vie/Dom)
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 14
 */

// =============================================================================
// CONFIGURACIÓN DEL CALENDARIO
// =============================================================================

/**
 * Configuración del calendario de publicación
 *
 * - intervalDays: Frecuencia de publicación (cada 2 días)
 * - preferredDays: Días preferidos (0=Dom, 1=Lun, ..., 6=Sáb)
 * - publicationHour: Hora de publicación (formato 24h)
 * - timezone: Timezone del creador
 */
export const PUBLICATION_SCHEDULE = {
  /** Frecuencia: cada 2 días */
  intervalDays: 2,

  /**
   * Días preferidos de publicación
   * 0 = Domingo, 1 = Lunes, 3 = Miércoles, 5 = Viernes
   */
  preferredDays: [1, 3, 5, 0] as readonly number[],

  /** Hora de publicación (24h format) - 2 PM */
  publicationHour: 14,

  /** Timezone del creador */
  timezone: 'America/Mexico_City',

  /** Última publicación (se actualiza automáticamente) */
  lastPublishedAt: null as Date | null,
};

// =============================================================================
// FUNCIONES DE CÁLCULO DE FECHAS
// =============================================================================

/**
 * Calcula próxima fecha de publicación
 *
 * Agrega intervalDays a la fecha proporcionada y ajusta
 * la hora según la configuración del calendario.
 *
 * @param lastPublished - Última fecha de publicación (opcional)
 * @returns Próxima fecha de publicación
 *
 * @example
 * ```typescript
 * const next = getNextPublicationDate(new Date('2026-01-29'));
 * console.log(next); // 2026-01-31 14:00:00
 * ```
 */
export function getNextPublicationDate(lastPublished?: Date): Date {
  const now = lastPublished || new Date();

  // Agregar intervalDays
  const next = new Date(now);
  next.setDate(next.getDate() + PUBLICATION_SCHEDULE.intervalDays);
  next.setHours(PUBLICATION_SCHEDULE.publicationHour, 0, 0, 0);

  return next;
}

/**
 * Verifica si hoy es día de publicación
 *
 * Compara el día de la semana actual con los días preferidos
 * configurados en PUBLICATION_SCHEDULE.
 *
 * @returns true si hoy es día de publicación
 *
 * @example
 * ```typescript
 * if (shouldPublishToday()) {
 *   console.log('¡Hoy toca publicar!');
 * }
 * ```
 */
export function shouldPublishToday(): boolean {
  const now = new Date();
  const dayOfWeek = now.getDay();

  return PUBLICATION_SCHEDULE.preferredDays.includes(dayOfWeek);
}

/**
 * Verifica si es momento de publicar (día + hora)
 *
 * Combina verificación de día preferido + hora exacta.
 * Útil para cron jobs o schedulers.
 *
 * @returns true si es el momento exacto de publicar
 */
export function isPublicationTime(): boolean {
  const now = new Date();
  const currentHour = now.getHours();

  return shouldPublishToday() && currentHour === PUBLICATION_SCHEDULE.publicationHour;
}

/**
 * Obtiene días restantes hasta próxima publicación
 *
 * Calcula diferencia en días entre ahora y la próxima
 * fecha de publicación programada.
 *
 * @returns Número de días hasta próxima publicación
 *
 * @example
 * ```typescript
 * const days = getDaysUntilNextPublication();
 * console.log(`Próxima publicación en ${days} días`);
 * ```
 */
export function getDaysUntilNextPublication(): number {
  const now = new Date();
  const next = getNextPublicationDate(PUBLICATION_SCHEDULE.lastPublishedAt || now);

  const diffMs = next.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Actualiza fecha de última publicación
 *
 * Registra cuándo se publicó el último video.
 * Nota: En producción, persistir en database o archivo.
 *
 * @param date - Fecha de publicación (default: ahora)
 */
export function updateLastPublished(date: Date = new Date()): void {
  PUBLICATION_SCHEDULE.lastPublishedAt = date;

  // TODO: Persistir en database o archivo para sobrevivir reinicios
  console.log(`📅 Última publicación actualizada: ${date.toISOString()}`);
}

/**
 * Obtiene cronograma de publicaciones futuras
 *
 * Genera lista de próximas fechas de publicación.
 * Útil para mostrar calendario al usuario.
 *
 * @param count - Número de fechas futuras a retornar (default: 5)
 * @returns Array de fechas ordenadas cronológicamente
 *
 * @example
 * ```typescript
 * const upcoming = getUpcomingPublications(3);
 * upcoming.forEach(date => console.log(date.toLocaleDateString()));
 * ```
 */
export function getUpcomingPublications(count: number = 5): Date[] {
  const dates: Date[] = [];
  let currentDate = PUBLICATION_SCHEDULE.lastPublishedAt || new Date();

  for (let i = 0; i < count; i++) {
    currentDate = getNextPublicationDate(currentDate);
    dates.push(new Date(currentDate));
  }

  return dates;
}

/**
 * Obtiene nombre del día de la semana en español
 *
 * @param dayIndex - Índice del día (0-6)
 * @returns Nombre del día en español
 */
export function getDayName(dayIndex: number): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[dayIndex] || 'Desconocido';
}

/**
 * Formatea los días preferidos como string legible
 *
 * @returns String con días preferidos (ej: "Lun/Mié/Vie/Dom")
 */
export function getPreferredDaysFormatted(): string {
  return PUBLICATION_SCHEDULE.preferredDays
    .map(day => getDayName(day).substring(0, 3))
    .join('/');
}

// Export por defecto
export default {
  PUBLICATION_SCHEDULE,
  getNextPublicationDate,
  shouldPublishToday,
  isPublicationTime,
  getDaysUntilNextPublication,
  updateLastPublished,
  getUpcomingPublications,
  getDayName,
  getPreferredDaysFormatted,
};
