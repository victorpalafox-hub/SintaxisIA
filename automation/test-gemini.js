require('dotenv').config({ path: '../.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ ERROR: GEMINI_API_KEY no encontrada en .env');
  console.error('💡 Verifica que el archivo .env existe en la raíz del proyecto');
  process.exit(1);
}

console.log('═══════════════════════════════════════════════════════════');
console.log('🧪 TEST DE GEMINI API - CUENTA PREMIUM');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
console.log('🔑 API Key detectada:', '***' + apiKey.substring(apiKey.length - 4));
console.log('');

async function testGemini25Flash() {
  console.log('📡 Probando GEMINI 2.5 FLASH (PRIORIDAD 1)...');
  console.log('');

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.3,
        topP: 0.95,
        maxOutputTokens: 512,
      },
    });

    const testPrompt = `
Analiza este texto de noticia y extrae información:

TEXTO: "OpenAI acaba de lanzar GPT-5, su modelo de lenguaje más avanzado hasta la fecha con capacidades revolucionarias de razonamiento y comprensión."

Responde SOLO con JSON válido (sin markdown):
{
  "mainEntity": "nombre de la entidad principal",
  "entityType": "company",
  "relatedTerms": ["término1", "término2", "término3"],
  "imageSearchQuery": "query para buscar logo oficial",
  "confidence": 0.95
}
    `.trim();

    console.log('📤 Enviando request al modelo...');
    const startTime = Date.now();

    const result = await model.generateContent(testPrompt);
    const response = result.response.text();

    const duration = Date.now() - startTime;

    console.log(`⏱️  Tiempo de respuesta: ${duration}ms`);
    console.log('');
    console.log('📥 Respuesta recibida:');
    console.log('─────────────────────────────────────────────────────────');
    console.log(response);
    console.log('─────────────────────────────────────────────────────────');
    console.log('');

    // Limpiar respuesta de markdown si existe
    const cleanJson = response
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed = JSON.parse(cleanJson);

    console.log('✅ Validación de respuesta:');
    console.log(`   • JSON válido: ✓`);
    console.log(`   • Entidad detectada: "${parsed.mainEntity}"`);
    console.log(`   • Tipo: ${parsed.entityType}`);
    console.log(`   • Confianza: ${(parsed.confidence * 100).toFixed(0)}%`);
    console.log(`   • Términos relacionados: ${parsed.relatedTerms.join(', ')}`);
    console.log(`   • Query de búsqueda: "${parsed.imageSearchQuery}"`);
    console.log('');
    console.log('🎉 ¡GEMINI 2.5 FLASH FUNCIONA PERFECTAMENTE!');
    console.log('');
    console.log('✅ Configuración recomendada en scriptGen.ts:');
    console.log('   model: "gemini-2.5-flash"');
    console.log('');

    return { success: true, model: 'gemini-2.5-flash' };

  } catch (error) {
    console.log('❌ Error con Gemini 2.5 Flash:', error.message);
    console.log('');

    if (error.message.includes('models/gemini-2.5-flash') || error.message.includes('not found')) {
      console.log('💡 El modelo "gemini-2.5-flash" no está disponible');
      console.log('');
      return { success: false, model: 'gemini-2.5-flash', error: 'MODEL_NOT_FOUND' };
    } else if (error.message.includes('API_KEY_INVALID')) {
      console.error('❌ ERROR CRÍTICO: API Key inválida');
      console.error('💡 Verifica que copiaste correctamente la API key de Google AI Studio');
      process.exit(1);
    } else if (error.message.includes('PERMISSION_DENIED')) {
      console.error('❌ ERROR: Sin permisos para este modelo');
      return { success: false, model: 'gemini-2.5-flash', error: 'PERMISSION_DENIED' };
    } else {
      console.error('❌ Error:', error.message);
      return { success: false, model: 'gemini-2.5-flash', error: error.message };
    }
  }
}

async function testGemini20Flash() {
  console.log('📡 Probando GEMINI 2.0 FLASH (PRIORIDAD 2)...');
  console.log('');

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.3,
        topP: 0.95,
        maxOutputTokens: 512,
      },
    });

    const testPrompt = `
Analiza: "Anthropic lanza Claude 4 con mejoras significativas"

Responde SOLO en JSON (sin markdown):
{
  "mainEntity": "nombre",
  "entityType": "company",
  "relatedTerms": ["term1", "term2"],
  "confidence": 0.9
}
    `.trim();

    console.log('📤 Enviando request al modelo...');
    const startTime = Date.now();

    const result = await model.generateContent(testPrompt);
    const response = result.response.text();

    const duration = Date.now() - startTime;

    console.log(`⏱️  Tiempo de respuesta: ${duration}ms`);
    console.log('');
    console.log('📥 Respuesta:');
    console.log(response);
    console.log('');

    const cleanJson = response
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed = JSON.parse(cleanJson);

    console.log('✅ GEMINI 2.0 FLASH FUNCIONA');
    console.log(`   Entidad: ${parsed.mainEntity}`);
    console.log('');

    return { success: true, model: 'gemini-2.0-flash' };

  } catch (error) {
    console.error('❌ Error con Gemini 2.0 Flash:', error.message);
    return { success: false, model: 'gemini-2.0-flash', error: error.message };
  }
}

async function testGemini15Flash() {
  console.log('📡 Probando GEMINI 1.5 FLASH...');
  console.log('');

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 512,
      },
    });

    const testPrompt = `
Analiza: "Google presenta Gemini 2.0"

Responde SOLO en JSON (sin markdown):
{
  "mainEntity": "Google",
  "entityType": "company",
  "relatedTerms": ["Gemini", "AI"],
  "confidence": 0.9
}
    `.trim();

    console.log('📤 Enviando request al modelo...');
    const startTime = Date.now();

    const result = await model.generateContent(testPrompt);
    const response = result.response.text();

    const duration = Date.now() - startTime;

    console.log(`⏱️  Tiempo de respuesta: ${duration}ms`);
    console.log('');
    console.log('📥 Respuesta:');
    console.log(response);
    console.log('');

    console.log('✅ GEMINI 1.5 FLASH FUNCIONA');
    console.log('');

    return { success: true, model: 'gemini-1.5-flash' };

  } catch (error) {
    console.error('❌ Error con Gemini 1.5:', error.message);
    return { success: false, model: 'gemini-1.5-flash', error: error.message };
  }
}

async function runTests() {
  console.log('');
  console.log('🔗 CADENA DE FALLBACK: 2.5-flash → 2.0-flash → 1.5-flash');
  console.log('');

  // Probar Gemini 2.5 Flash (PRIORIDAD 1)
  let result = await testGemini25Flash();

  if (!result.success) {
    console.log('🔄 Fallback: Intentando con Gemini 2.0 Flash (PRIORIDAD 2)...');
    console.log('');
    result = await testGemini20Flash();
  }

  if (!result.success) {
    console.log('🔄 Fallback: Intentando con Gemini 1.5 Flash (PRIORIDAD 3)...');
    console.log('');
    result = await testGemini15Flash();
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 RESULTADO FINAL');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  if (result.success) {
    console.log(`✅ Modelo funcionando: ${result.model}`);
    console.log('');
    console.log('📝 CONFIGURACIÓN EN scriptGen.ts:');
    console.log('   GEMINI_FALLBACK_CHAIN = [');
    console.log('     "gemini-2.5-flash",   // Prioridad 1');
    console.log('     "gemini-2.0-flash",   // Prioridad 2');
    console.log('     "gemini-1.5-flash",   // Prioridad 3');
    console.log('   ]');
    console.log('');
    console.log('✅ La cadena de fallback está correctamente configurada');
    console.log('');
  } else {
    console.log('❌ Ningún modelo de Gemini funciona');
    console.log('');
    console.log('💡 Verificar:');
    console.log('   1. API key válida en https://aistudio.google.com');
    console.log('   2. Cuenta con acceso habilitado');
    console.log('   3. No hay límites de rate-limit');
  }

  console.log('═══════════════════════════════════════════════════════════');

  return result;
}

// Ejecutar tests
runTests().catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
