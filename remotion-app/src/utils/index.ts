/**
 * @fileoverview Utils - Exports centralizados
 *
 * Exporta todas las utilidades de Remotion desde un único punto.
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 19.2
 */

export {
  splitIntoReadablePhrases,
  type SplitOptions,
  type Phrase,
} from './text-splitter';

export {
  getPhraseTiming,
  getPhraseTimingDebug,
  type PhraseTiming,
  type TimingConfig,
  type PhraseTimestamp,
} from './phrase-timing';
