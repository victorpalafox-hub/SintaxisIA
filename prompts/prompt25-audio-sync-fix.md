# Prompt 25: Fix Audio-Texto Sync + Hook Visual + Control de Imágenes

Actúa como ingeniero senior de Remotion/TypeScript y como creador de Shorts (YouTube/TikTok) enfocado en retención.

## Contexto del Proyecto

Monorepo con 3 paquetes:
- `remotion-app/` - Renderizado de video (React + Remotion)
- `automation/` - Pipeline de contenido (news, Gemini scripts, ElevenLabs audio)
- `/` (raíz) - Playwright tests

**Test Status**: 1013 tests (1011 passing, 2 skipped), 42 spec files
**Tema activo**: Tech Editorial (Prompt 20)
**Video**: 50s total = Hero 8s + Content 37s + Outro 5s, 1080x1920, 30fps
**Crossfade**: 30 frames (1s) de overlap entre escenas adyacentes

## Objetivo (3 fixes críticos + 2 mejoras)

1. **FIX CRÍTICO**: Corregir desfase audio ↔ texto en pantalla (2 causas raíz)
2. **FIX CRÍTICO**: Asegurar que el texto mostrado sea EXACTAMENTE lo que se narra
3. **FIX CRÍTICO**: Propagar phraseTimestamps desde TTS hasta Remotion (pipeline roto)
4. **MEJORA**: Hook visual sutil en los primeros 0-0.3s (potenciar lo existente)
5. **MEJORA**: Limitar cambios de imagen dinámica a máx 3 por video

## Archivos a Leer ANTES de Implementar

1. `CLAUDE.md` - Contexto completo del proyecto
2. `remotion-app/src/compositions/AINewsShort.tsx` - Composición principal (NO pasa audioSync)
3. `remotion-app/src/components/scenes/ContentScene.tsx` - Escena de contenido (ACEPTA audioSync pero no lo recibe)
4. `remotion-app/src/utils/phrase-timing.ts` - Cálculo de timing de frases (NO conoce el offset de escena)
5. `remotion-app/src/utils/text-splitter.ts` - Splitter de frases (splitIntoReadablePhrases)
6. `remotion-app/src/types/video.types.ts` - VideoProps (FALTA campo audioSync), AudioSync, ContentSceneProps
7. `automation/src/services/video-rendering.service.ts` - generateVideoProps() (genera audioSync pero description usa body en vez de script)
8. `automation/src/orchestrator.ts` - PASO 6 (TTS) y PASO 7 (render) - phraseTimestamps se PIERDE entre ambos pasos
9. `automation/src/services/tts.service.ts` - generateAudio() retorna TTSResponse pero internamente agrega phraseTimestamps
10. `automation/src/types/tts.types.ts` - TTSResponse vs TTSResponseWithTimestamps
11. `remotion-app/src/components/scenes/HeroScene.tsx` - Ya tiene zoom+blur+slide (NO crear nueva capa)
12. `remotion-app/src/styles/themes.ts` - heroAnimation, contentAnimation, sceneTransition
13. `automation/src/services/scene-segmenter.service.ts` - SEGMENT_DURATION=15, Math.max(4, ceil(duration/15)) = siempre ≥4 segmentos

---

## A) FIX 1: FRAME OFFSET - Causa raíz del desfase (BLOQUEADOR)

### Diagnóstico

El desfase tiene DOS causas raíz que el sistema actual NO maneja:

**Causa 1 - Frame offset**: AudioMixer empieza en frame 0 (segundo 0 del video). ContentScene empieza en frame 210 (segundo 7, por crossfade). Dentro de ContentScene, `useCurrentFrame()` retorna frame RELATIVO (0, 1, 2...). Cuando ContentScene está en frame 0, el audio ya está en el segundo ~7. Pero `getPhraseTiming()` calcula `currentSecond = currentFrame / fps = 0`, y busca la frase del segundo 0 (el hook), cuando debería buscar la frase del segundo 7.

**Causa 2 - audioSync no llega**: `AINewsShort.tsx` NO pasa `audioSync` a `ContentScene` (línea 206-218). Además, `VideoProps` (el tipo TypeScript) NO tiene campo `audioSync`. El servicio `generateVideoProps()` SÍ lo genera en el JSON (línea 667), pero TypeScript lo ignora.

### Cambios

#### 1. Agregar `audioSync` a `VideoProps` (`remotion-app/src/types/video.types.ts`)

Agregar campo `audioSync?: AudioSync` a la interface `VideoProps` (después de `config`, antes del cierre):

```typescript
// En VideoProps, agregar después de config:

/**
 * Datos de sincronización de audio (Prompt 19.7)
 * Contiene timestamps de frases de Whisper para sync preciso
 * @since Prompt 25
 */
audioSync?: AudioSync;
```

#### 2. Pasar `audioSync` en `AINewsShort.tsx` (`remotion-app/src/compositions/AINewsShort.tsx`)

En el componente AINewsShort, extraer audioSync de props y pasarlo a ContentScene:

```typescript
// Después de: const config = props.config;
const audioSync = props.audioSync;

// En <ContentScene>, agregar prop:
<ContentScene
  description={news.description}
  // ... props existentes ...
  audioSync={audioSync}
  sceneStartSecond={heroSceneDuration / fps}  // YA EXISTE, es ~8
/>
```

#### 3. Agregar offset en `getPhraseTiming()` (`remotion-app/src/utils/phrase-timing.ts`)

Este es el fix MÁS CRÍTICO. Agregar campo `sceneOffsetSeconds` a `TimingConfig`:

```typescript
// En interface TimingConfig, agregar:
/** Offset en segundos del inicio de la escena respecto al audio (Prompt 25) */
sceneOffsetSeconds?: number;
```

En la función `getPhraseTiming()`, cuando hay `phraseTimestamps`, aplicar offset:

```typescript
// Donde dice: const currentSecond = currentFrame / fps;
// Cambiar a:
const sceneOffset = config.sceneOffsetSeconds ?? 0;
const currentSecond = (currentFrame / fps) + sceneOffset;
```

NOTA: Este offset SOLO aplica cuando hay phraseTimestamps (rama con Whisper). La rama de distribución uniforme (fallback) NO necesita offset porque distribuye frases uniformemente sobre la duración de la escena.

#### 4. Pasar offset en ContentScene (`remotion-app/src/components/scenes/ContentScene.tsx`)

En la llamada a `getPhraseTiming()` (línea 193), agregar sceneOffsetSeconds:

```typescript
const phraseTiming = getPhraseTiming(
  frame,
  sceneDurationFrames,
  phrases.length,
  {
    fadeInFrames: textAnimation.fadeInFrames,
    fadeOutFrames: textAnimation.fadeOutFrames,
    phraseTimestamps: audioSync?.phraseTimestamps,
    fps,
    sceneOffsetSeconds: sceneStartSecond, // Prompt 25: offset para sync con audio
  }
);
```

---

## B) FIX 2: TEXTO ON-SCREEN = TEXTO NARRADO

### Diagnóstico

En `video-rendering.service.ts` línea 646:
```typescript
description: request.body || request.script,
```

- El audio narra `fullScript` = hook + body + opinion + cta (todo concatenado)
- La pantalla muestra `request.body` = solo la sección body

Resultado: el audio dice "La fusion SpaceX-xAI no es solo mas satelites" (hook) pero la pantalla muestra el body que empieza mucho después.

### Cambios

#### 1. Usar `request.script` como description (`automation/src/services/video-rendering.service.ts`)

En `generateVideoProps()`, cambiar:

```typescript
// ANTES (línea 646):
description: request.body || request.script,

// DESPUÉS:
description: request.script,  // Prompt 25: SIEMPRE usar el script completo (es lo que se narra)
```

Esto asegura que el texto disponible en pantalla sea el mismo que se narró.

#### 2. Agregar log de validación

En `generateVideoProps()`, después de construir el objeto props, agregar:

```typescript
// Prompt 25: Log de validación de consistencia texto-audio
const descriptionPreview = request.script.substring(0, 80);
console.log(`   📝 On-screen text source: fullScript (${request.script.length} chars)`);
console.log(`   📝 Preview: "${descriptionPreview}..."`);
```

---

## C) FIX 3: PROPAGAR phraseTimestamps EN EL PIPELINE

### Diagnóstico

El dato se pierde en el orchestrator entre PASO 6 (TTS) y PASO 7 (render):

- PASO 6: `ttsService.generateAudio()` genera phraseTimestamps internamente vía Whisper
- PASO 6 data: solo guarda `audioPath`, `durationSeconds`, `provider`, `fromCache` → **phraseTimestamps se descarta**
- PASO 7: `videoRenderingService.renderVideo()` acepta `phraseTimestamps` en VideoRenderRequest pero no lo recibe

### Cambios

#### 1. Cambiar tipo de retorno de `generateAudio()` (`automation/src/services/tts.service.ts`)

La firma actual dice `Promise<TTSResponse>` pero internamente retorna campos extra. Cambiar:

```typescript
// ANTES (línea 98):
async generateAudio(request: TTSRequest): Promise<TTSResponse> {

// DESPUÉS:
async generateAudio(request: TTSRequest): Promise<TTSResponseWithTimestamps> {
```

Agregar import de `TTSResponseWithTimestamps` si no existe.

#### 2. Guardar phraseTimestamps en PASO 6 del orchestrator (`automation/src/orchestrator.ts`)

En el bloque de PASO 6 (generate_audio), cambiar el return (líneas 351-356):

```typescript
// ANTES:
return {
  audioPath: ttsResult.audioPath,
  durationSeconds: ttsResult.durationSeconds,
  provider: ttsResult.provider,
  fromCache: ttsResult.fromCache,
};

// DESPUÉS:
return {
  audioPath: ttsResult.audioPath,
  durationSeconds: ttsResult.durationSeconds,
  provider: ttsResult.provider,
  fromCache: ttsResult.fromCache,
  phraseTimestamps: ttsResult.phraseTimestamps,  // Prompt 25: propagar timestamps
};
```

Agregar log después del return data:
```typescript
if (ttsResult.phraseTimestamps?.length) {
  console.log(`   🔄 Whisper timestamps: ${ttsResult.phraseTimestamps.length} frases`);
} else {
  console.log(`   ℹ️  Sin timestamps de Whisper (sync por distribución uniforme)`);
}
```

#### 3. Pasar phraseTimestamps en PASO 7 del orchestrator

En la llamada a `videoRenderingService.renderVideo()` (línea 404-419), extraer y pasar phraseTimestamps:

```typescript
// Extraer audioData con tipo correcto (incluye phraseTimestamps opcional):
const audioData = audioStep.data as {
  audioPath: string;
  durationSeconds: number;
  provider: string;
  fromCache: boolean;
  phraseTimestamps?: PhraseTimestamp[];
};

// En la llamada a renderVideo, agregar:
const renderResult = await videoRenderingService.renderVideo({
  // ... props existentes ...
  phraseTimestamps: audioData.phraseTimestamps,  // Prompt 25: sync timestamps
});
```

Agregar import de `PhraseTimestamp` desde `./types/tts.types`.

---

## D) FIX 4: FRASES COHERENTES CON AUDIO SYNC

### Diagnóstico

Cuando audioSync existe, ContentScene ejecuta `splitIntoReadablePhrases(description)` generando N frases, pero `phraseTimestamps` puede tener M frases (de Whisper). Si N ≠ M, `phrases[phraseTiming.currentPhraseIndex]` apunta a la frase incorrecta.

### Cambios en ContentScene (`remotion-app/src/components/scenes/ContentScene.tsx`)

Cuando hay audioSync con phraseTimestamps, usar el texto de los timestamps como source of truth:

```typescript
// ANTES (líneas 183-189):
const phrases = useMemo(
  () => splitIntoReadablePhrases(description, {
    maxCharsPerPhrase: textAnimation.maxCharsPerPhrase,
    minWordsPerPhrase: textAnimation.minWordsPerPhrase,
  }),
  [description]
);

// DESPUÉS:
const phrases = useMemo(() => {
  // Prompt 25: Si hay timestamps de audio, usar SU texto como source of truth
  // Esto evita mismatch entre el split visual y el split de Whisper
  if (audioSync?.phraseTimestamps && audioSync.phraseTimestamps.length > 0) {
    return audioSync.phraseTimestamps.map((ts, index) => ({
      text: ts.text,
      index,
      charCount: ts.text.length,
      wordCount: ts.text.split(/\s+/).length,
    }));
  }

  // Fallback: split visual uniforme (sin Whisper)
  return splitIntoReadablePhrases(description, {
    maxCharsPerPhrase: textAnimation.maxCharsPerPhrase,
    minWordsPerPhrase: textAnimation.minWordsPerPhrase,
  });
}, [description, audioSync]);
```

**IMPORTANTE**: El array de dependencias del useMemo debe incluir `audioSync`.

---

## E) MEJORA 1: HOOK VISUAL SUTIL (0-0.3s)

### Diagnóstico del estado actual

HeroScene.tsx YA tiene hooks visuales potentes:
- Zoom dramático 0.8 → 1.2 con spring (línea 81-88)
- Blur-to-focus 20px → 0px en 30 frames/1s (línea 92-94)
- Fade in de imagen en 20 frames (línea 97-102)
- Slide-up del título con spring (línea 109-116)

NO crear una nueva capa de animación. Lo que falta es un "flash" de impacto inicial para capturar el scroll.

### Cambios en HeroScene (`remotion-app/src/components/scenes/HeroScene.tsx`)

Agregar un flash sutil de luz blanca en los primeros 8-10 frames (0.3s):

```typescript
// Después de las animaciones existentes, agregar:

// Prompt 25: Flash de impacto inicial (0-10 frames)
// Overlay blanco muy breve que simula "encendido" de pantalla
const flashOpacity = interpolate(
  frame,
  [0, 4, 10],
  [0.15, 0.15, 0],
  { extrapolateRight: 'clamp' }
);
```

En el render, agregar un div overlay DESPUÉS del contenedor principal pero DENTRO del AbsoluteFill con fadeOut:

```tsx
{/* Prompt 25: Flash de impacto inicial */}
{flashOpacity > 0 && (
  <AbsoluteFill
    style={{
      backgroundColor: `rgba(255, 255, 255, ${flashOpacity})`,
      pointerEvents: 'none',
    }}
  />
)}
```

**Configuración**: Agregar en `themes.ts` dentro de `heroAnimation`:
```typescript
/** Opacidad máxima del flash inicial (0-1, 0 = desactivado) */
flashMaxOpacity: 0.15,
/** Frames de duración del flash */
flashDurationFrames: 10,
```

---

## F) MEJORA 2: CONTROL DE IMÁGENES DINÁMICAS (máx 3 cambios)

### Diagnóstico

`scene-segmenter.service.ts` línea 169: `Math.max(4, Math.ceil(totalDuration / 15))` = mínimo 4 segmentos para un video de 45s. Esto crea 4+ cambios de imagen que se sienten random y bajan coherencia.

### Cambios

#### 1. Agregar constante en scene-segmenter (`automation/src/services/scene-segmenter.service.ts`)

```typescript
// ANTES:
const SEGMENT_DURATION = 15;

// DESPUÉS:
const SEGMENT_DURATION = 15;
/**
 * Máximo de segmentos de imagen por video (Prompt 25)
 * Limita cambios de imagen para coherencia visual.
 * Los cambios ocurren preferentemente en transiciones de sección.
 */
const MAX_IMAGE_SEGMENTS = 3;
```

En `segmentScript()`, cambiar:
```typescript
// ANTES (línea 169):
const numSegments = Math.max(4, Math.ceil(totalDuration / SEGMENT_DURATION));

// DESPUÉS:
const numSegments = Math.min(MAX_IMAGE_SEGMENTS, Math.max(2, Math.ceil(totalDuration / SEGMENT_DURATION)));
```

Esto produce 2-3 segmentos en vez de 4+.

#### 2. Crossfade suave en ContentScene al cambiar imagen

En `ContentScene.tsx`, cuando la imagen cambia (dynamicScenes), agregar un crossfade. Reemplazar el cálculo de `getCurrentImage()` para que retorne también el progreso de transición:

```typescript
// Agregar función helper para crossfade entre imágenes:
const getImageWithTransition = (): { url: string | undefined; transitionProgress: number } => {
  if (!dynamicScenes || dynamicScenes.length === 0) {
    return { url: images?.context || images?.hero, transitionProgress: 1 };
  }

  const currentScene = dynamicScenes.find(
    scene => currentSecond >= scene.startSecond && currentSecond < scene.endSecond
  );

  if (!currentScene) {
    const lastScene = dynamicScenes[dynamicScenes.length - 1];
    return { url: currentSecond >= lastScene.endSecond ? lastScene.imageUrl : dynamicScenes[0].imageUrl, transitionProgress: 1 };
  }

  // Prompt 25: Crossfade en los primeros 20 frames de cada segmento
  const segmentFrame = (currentSecond - currentScene.startSecond) * fps;
  const transitionProgress = Math.min(1, segmentFrame / 20);

  return { url: currentScene.imageUrl, transitionProgress };
};
```

Aplicar `transitionProgress` a la opacidad de la imagen:
```typescript
const { url: contextImage, transitionProgress } = getImageWithTransition();
// En el style de la imagen: opacity: imageOpacity * transitionProgress,
```

#### 3. Log de imágenes usadas

En `scene-segmenter.service.ts`, después de crear los segmentos, agregar log:
```typescript
logger.info(`[SceneSegmenter] ${segments.length} segmentos de imagen (máx ${MAX_IMAGE_SEGMENTS})`);
```

---

## G) LIMPIEZA

1. Eliminar `sceneDurationFrames = 37 * fps` hardcodeado en ContentScene.tsx (línea 140). Usar `durationInFrames` del `useVideoConfig()` que ya se lee en línea 74:
```typescript
// ANTES:
const sceneDurationFrames = 37 * fps;
// DESPUÉS:
const sceneDurationFrames = durationInFrames;
```

2. En `video-rendering.service.ts` `generateDataContract()` línea 574: `theme: 'cyberpunk'` debería ser `theme: 'tech-editorial'` (el tema actual desde Prompt 20). Esto es cosmético pero evita confusión.

3. Si queda algún import no usado después de los cambios, eliminarlo.

---

## H) TESTS: `tests/specs/prompt25-audio-sync-fix.spec.ts`

**Patrón**: Static file validation con `fs.readFileSync()`. NUNCA llamadas API.

### Suite 1: VideoProps tiene audioSync (~3 tests)
- `VideoProps` en `remotion-app/src/types/video.types.ts` contiene `audioSync?: AudioSync`
- `AudioSync` interface existe con `phraseTimestamps` y `audioDuration`
- `PhraseTimestamp` tiene campos `text`, `startSeconds`, `endSeconds`

### Suite 2: AINewsShort pasa audioSync (~3 tests)
- `AINewsShort.tsx` contiene `props.audioSync` o `audioSync`
- `AINewsShort.tsx` pasa `audioSync={` a ContentScene
- `AINewsShort.tsx` pasa `sceneStartSecond=` a ContentScene

### Suite 3: Frame offset en phrase-timing (~4 tests)
- `TimingConfig` tiene campo `sceneOffsetSeconds`
- `getPhraseTiming()` contiene `sceneOffsetSeconds`
- El offset se suma al currentSecond: contiene `+ sceneOffset` o `+ (config.sceneOffsetSeconds`
- ContentScene pasa `sceneOffsetSeconds: sceneStartSecond` a getPhraseTiming

### Suite 4: Texto on-screen = script narrado (~3 tests)
- `generateVideoProps` en video-rendering.service.ts: `description: request.script` (NO request.body)
- generateVideoProps contiene log "On-screen text source"
- generateVideoProps NO contiene `request.body || request.script` como description

### Suite 5: Pipeline phraseTimestamps propagación (~5 tests)
- `tts.service.ts` `generateAudio` retorna `TTSResponseWithTimestamps` (no solo TTSResponse)
- orchestrator.ts PASO 6 guarda `phraseTimestamps` en el return
- orchestrator.ts PASO 7 pasa `phraseTimestamps` a `renderVideo()`
- orchestrator.ts importa `PhraseTimestamp` de types
- orchestrator.ts contiene "Whisper timestamps" en un log

### Suite 6: Frases desde audioSync (~3 tests)
- ContentScene.tsx contiene `audioSync?.phraseTimestamps` en useMemo de phrases
- ContentScene.tsx tiene `audioSync` en array de dependencias del useMemo
- ContentScene.tsx contiene `.map((ts, index)` o equivalente para mapear timestamps a frases

### Suite 7: Hook visual flash (~3 tests)
- HeroScene.tsx contiene `flashOpacity` o equivalente
- themes.ts heroAnimation tiene `flashMaxOpacity` y `flashDurationFrames`
- HeroScene.tsx tiene un overlay con backgroundColor rgba white

### Suite 8: Control de imágenes dinámicas (~4 tests)
- scene-segmenter.service.ts contiene `MAX_IMAGE_SEGMENTS` con valor 3
- scene-segmenter.service.ts usa `Math.min(MAX_IMAGE_SEGMENTS` en numSegments
- ContentScene.tsx contiene lógica de `transitionProgress` o crossfade para imágenes
- scene-segmenter.service.ts contiene log con "máx" o "max" y "segmento"

### Suite 9: Limpieza y compatibilidad (~4 tests)
- ContentScene.tsx NO contiene `37 * fps` hardcodeado para sceneDurationFrames
- ContentScene.tsx usa `durationInFrames` para sceneDurationFrames
- video-rendering.service.ts contiene `theme: 'tech-editorial'` (no cyberpunk)
- Todos los tests existentes de prompt 19.7 (audio-sync) siguen siendo válidos estructuralmente

### Suite 10: npm Scripts (~2 tests)
- Root package.json tiene `test:audio-sync-fix` o `test:prompt25`
- Scripts apuntan a `prompt25-audio-sync-fix.spec.ts`

**Total estimado**: ~35 tests

---

## I) SCRIPTS EN ROOT `package.json`

```json
"test:audio-sync-fix": "playwright test tests/specs/prompt25-audio-sync-fix.spec.ts",
"test:prompt25": "playwright test tests/specs/prompt25-audio-sync-fix.spec.ts"
```

---

## J) ACTUALIZAR `CLAUDE.md`

1. Prompt History: agregar fila Prompt 25 - Audio Sync Fix
2. Quick Reference: actualizar phrase-timing con sceneOffsetSeconds
3. Test Status: actualizar conteo de tests
4. Pipeline: actualizar PASO 2 → PASO 7 flujo de phraseTimestamps

---

## Orden de Implementación (dependencias)

```
1. VideoProps + TimingConfig (tipos)        ← sin dependencias
2. tts.service.ts (return type)             ← sin dependencias
3. orchestrator.ts (propagar timestamps)    ← depende de 2
4. video-rendering.service.ts (description) ← sin dependencias
5. phrase-timing.ts (sceneOffsetSeconds)    ← depende de 1
6. ContentScene.tsx (phrases + offset)      ← depende de 5
7. AINewsShort.tsx (pasar audioSync)        ← depende de 1, 6
8. HeroScene.tsx (flash) + themes.ts        ← sin dependencias
9. scene-segmenter.service.ts (max 3)      ← sin dependencias
10. ContentScene.tsx (crossfade imágenes)   ← depende de 9
11. Limpieza (hardcoded, theme name)        ← después de todo
12. Tests + scripts + CLAUDE.md             ← después de todo
```

## Restricciones

- **NO tocar** lógica de generación de voz/audio (ElevenLabs/Edge-TTS/Whisper)
- **NO tocar** Pexels, smart-query-generator, ni image scoring
- **NO tocar** PASOs 1, 3, 4, 5, 8-11 del orchestrator
- **NO crear** nuevos Service Objects ni clases - solo modificar existentes
- **Prioridad absoluta**: A (offset) + B (texto) + C (pipeline) = el desfase se corrige
- **Tests estáticos**: `fs.readFileSync()` + assertions, NUNCA llamadas API
- **Los 1013 tests existentes DEBEN seguir pasando**

## Verificación Final

```bash
npm run check              # TypeScript compila sin errores
npm run test:prompt25      # Tests nuevos pasan
npm run test:prompt19.7    # Audio sync original sigue pasando
npm test                   # TODOS los tests pasan (1013 + ~35 nuevos)
```

## Resumen de Archivos

| Archivo | Acción | Cambio Principal |
|---------|--------|------------------|
| `remotion-app/src/types/video.types.ts` | MODIFICAR | Agregar `audioSync?: AudioSync` a VideoProps |
| `remotion-app/src/utils/phrase-timing.ts` | MODIFICAR | Agregar `sceneOffsetSeconds` a TimingConfig + lógica offset |
| `remotion-app/src/compositions/AINewsShort.tsx` | MODIFICAR | Pasar `audioSync` a ContentScene |
| `remotion-app/src/components/scenes/ContentScene.tsx` | MODIFICAR | Usar timestamps como source of truth + offset + crossfade imágenes + eliminar hardcode 37*fps |
| `remotion-app/src/components/scenes/HeroScene.tsx` | MODIFICAR | Flash sutil 10 frames |
| `remotion-app/src/styles/themes.ts` | MODIFICAR | flashMaxOpacity + flashDurationFrames en heroAnimation |
| `automation/src/services/video-rendering.service.ts` | MODIFICAR | `description: request.script` (no body) + theme tech-editorial |
| `automation/src/services/tts.service.ts` | MODIFICAR | Return type → TTSResponseWithTimestamps |
| `automation/src/orchestrator.ts` | MODIFICAR | PASO 6: guardar phraseTimestamps, PASO 7: pasarlos a render |
| `automation/src/services/scene-segmenter.service.ts` | MODIFICAR | MAX_IMAGE_SEGMENTS=3, Math.min en numSegments |
| `tests/specs/prompt25-audio-sync-fix.spec.ts` | **CREAR** | ~35 tests |
| `package.json` (raíz) | MODIFICAR | 2 scripts de test |
| `CLAUDE.md` | MODIFICAR | Prompt 25, conteo tests |
