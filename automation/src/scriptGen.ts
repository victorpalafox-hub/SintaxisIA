// ===================================
// SCRIPT GENERATOR - Generar guiones con Gemini
// ===================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config';
import { logger } from '../utils/logger';
import { NewsArticle } from './newsAPI';

// Inicializar cliente de Gemini
const genAI = new GoogleGenerativeAI(config.api.geminiApiKey);

// Interfaz para el guión generado
export interface VideoScript {
  gancho: string;           // 0-3s: Frase impactante inicial
  headline: string;         // 3-8s: Título principal
  contenido: string[];      // 8-50s: Puntos principales (array de frases)
  impacto: string;          // 50-55s: Dato o reflexión impactante
  cta: string;              // 55-60s: Call to action
  tags: string[];           // Tags para mostrar en pantalla
  fullScript: string;       // Script completo para TTS
}

// Prompt template para generar guiones de shorts
const SCRIPT_PROMPT = `
Eres un experto en crear guiones virales para YouTube Shorts sobre tecnología e IA.
Tu estilo es: IMPACTANTE, CONCISO, INFORMATIVO.

REGLAS ESTRICTAS:
1. El video dura EXACTAMENTE 60 segundos
2. Habla en español neutro latinoamericano
3. Usa frases cortas y punchy
4. Incluye datos específicos cuando sea posible
5. El gancho debe generar curiosidad inmediata
6. NO uses clickbait falso, solo hechos reales

ESTRUCTURA DEL GUIÓN:

GANCHO (3 segundos):
- Una frase explosiva que detenga el scroll
- Ejemplo: "¡OpenAI acaba de cambiar TODO!"

HEADLINE (5 segundos):
- El título principal de la noticia
- Claro y directo

CONTENIDO (42 segundos):
- 4-5 puntos principales
- Cada punto es una oración completa
- Explica el qué, por qué y cómo nos afecta

IMPACTO (5 segundos):
- Un dato sorprendente o reflexión
- Genera emoción

CTA (5 segundos):
- Invita a seguir para más contenido de IA
- Ejemplo: "Sígueme para más noticias de IA"

Responde SOLO con un JSON válido con esta estructura:
{
  "gancho": "texto del gancho",
  "headline": "título principal",
  "contenido": ["punto 1", "punto 2", "punto 3", "punto 4"],
  "impacto": "dato impactante",
  "cta": "call to action",
  "tags": ["tag1", "tag2", "tag3"]
}
`;

/**
 * Genera un guión para video short basado en un artículo
 * @param article - Artículo de noticia
 * @returns Guión estructurado para el video
 */
export async function generateScript(article: NewsArticle): Promise<VideoScript> {
  logger.info('Generando guión con Gemini AI...');

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const articleContext = `
NOTICIA A CONVERTIR EN GUIÓN:
Título: ${article.title}
Descripción: ${article.description || 'No disponible'}
Contenido: ${article.content || 'No disponible'}
Fuente: ${article.source_name}
Fecha: ${article.pubDate}
`;

  try {
    const result = await model.generateContent([
      SCRIPT_PROMPT,
      articleContext
    ]);

    const response = result.response;
    const text = response.text();

    // Extraer JSON de la respuesta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta de Gemini');
    }

    const scriptData = JSON.parse(jsonMatch[0]);

    // Construir el script completo para TTS
    const fullScript = [
      scriptData.gancho,
      scriptData.headline,
      ...scriptData.contenido,
      scriptData.impacto,
      scriptData.cta
    ].join(' ');

    const script: VideoScript = {
      ...scriptData,
      fullScript
    };

    logger.success('Guión generado exitosamente');
    logger.info(`Gancho: "${script.gancho}"`);

    return script;
  } catch (error) {
    logger.error(`Error generando guión: ${error}`);
    throw error;
  }
}

export default { generateScript };
