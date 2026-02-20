# Reporte de Auditoria de Seguridad

**Fecha:** 2026-02-20
**Revisor:** Security-Reviewer Agent (Claude Opus 4.6)
**Alcance:** Proyecto completo "Sintaxis IA - Videos Short" (raiz, automation/, remotion-app/)
**Rama:** main (commit 746e2dc)

---

## Resumen Ejecutivo

| Categoria | Estado |
|-----------|--------|
| Gestion de Secrets | APROBADO - Sin credenciales expuestas en codigo fuente |
| Configuracion .gitignore | APROBADO - .env correctamente excluido |
| Dependencias (raiz) | APROBADO - 0 vulnerabilidades (corregido con npm audit fix) |
| Dependencias (automation) | ADVERTENCIA - 4 high, 6 moderate restantes (transitivas, no corregibles sin breaking changes) |
| Dependencias (remotion-app) | ADVERTENCIA - 7 moderate restantes (transitivas en @remotion/bundler) |
| Inyeccion de Comandos | CRITICO - Edge-TTS fallback vulnerable |
| Integraciones API | APROBADO CON OBSERVACIONES |
| GitHub Actions | APROBADO - Permisos minimos, sin secrets expuestos |
| Logging | ADVERTENCIA - URL de ElevenLabs se registra en logs de error |

**Postura General de Seguridad: ADVERTENCIA** -- Se identifico 1 hallazgo critico de inyeccion de comandos que requiere remediacion inmediata, vulnerabilidades en dependencias que deben parchearse, y varias mejoras recomendadas.

---

## Hallazgos de Vulnerabilidades

### Critico (Accion Inmediata Requerida)

| ID | Archivo | Linea | Vulnerabilidad | Remediacion |
|----|---------|-------|----------------|-------------|
| C-001 | `automation/src/services/tts.service.ts` | 445-457 | **Inyeccion de Comandos en Edge-TTS**: El texto del usuario se interpola en un comando shell (`execAsync`) con escape insuficiente. Solo se escapan `"`, backtick y `$`, pero no se escapan metacaracteres shell como `;`, `\|`, `&&`, `$()`, saltos de linea, ni comillas simples. Un script malicioso generado por Gemini API podria inyectar comandos arbitrarios del sistema operativo. | Usar `execFile` en lugar de `exec`/`execAsync` con `shell: true`. Pasar argumentos como array en lugar de concatenar strings. Alternativamente, escribir el texto a un archivo temporal y pasarlo via `--file` en lugar de `--text`. Ver seccion de Remediacion Detallada. |

### Prioridad Alta

| ID | Archivo | Linea | Vulnerabilidad | Remediacion |
|----|---------|-------|----------------|-------------|
| H-001 | `automation/package.json` | - | **axios 1.13.4 vulnerable a DoS** via `__proto__` key en `mergeConfig` (GHSA-43fc-jf86-j433, severity: high). Afecta directamente las llamadas a ElevenLabs API. | Ejecutar `cd automation && npm audit fix` para actualizar a axios >=1.13.5 |
| H-002 | `package.json` (raiz) | - | **minimatch < 10.2.1** vulnerable a ReDoS via wildcards repetidos (GHSA-3ppc-4f35-3m26, severity: high). Dependencia transitiva de Playwright. | Ejecutar `npm audit fix` en raiz |
| H-003 | `automation/package.json` | - | **qs 6.7.0-6.14.1** vulnerable a DoS por bypass de arrayLimit (GHSA-w7fw-mjwx-w883). Dependencia transitiva via node-telegram-bot-api. | Ejecutar `cd automation && npm audit fix` |
| H-004 | `automation/src/services/tts.service.ts` | 191 | **Fuga de URL de API en logs de error**: `logger.error(\`[TTS] URL: ${error.config?.url}\`)` podria exponer la URL completa de ElevenLabs incluyendo parametros de query en archivos de log. Aunque el API key va en header (no URL), es una mala practica registrar URLs de APIs externas en produccion. | Registrar solo el hostname o un resumen sanitizado de la URL, no la URL completa. |
| H-005 | `.env.example` | 83 | **Valor placeholder de Telegram demasiado realista**: `TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11` se parece a un token real de Telegram. Aunque es un placeholder, podria causar confusiones. | Cambiar a formato mas obvio como `TELEGRAM_BOT_TOKEN=your_bot_token_here` |

### Prioridad Media

| ID | Archivo | Linea | Vulnerabilidad | Remediacion |
|----|---------|-------|----------------|-------------|
| M-001 | `automation/package.json` | - | **ajv < 8.18.0** vulnerable a ReDoS con opcion `$data` (GHSA-2g4f-4pwh-qvx6). Dependencia transitiva profunda via node-telegram-bot-api -> request. | Ejecutar `cd automation && npm audit fix --force` (nota: puede instalar version breaking de node-telegram-bot-api) |
| M-002 | `remotion-app/package.json` | - | **ajv < 8.18.0** en 3 instancias dentro del arbol de @remotion/bundler. Mismo CVE que M-001. | Ejecutar `cd remotion-app && npm audit fix` |
| M-003 | `src/config/EnvironmentManager.ts` | 488 | **Metodo `getAll()` expone todas las variables**: Retorna todas las variables de entorno incluyendo secrets sin sanitizacion. Si se llama accidentalmente en codigo de produccion, podria filtrar credenciales. | Agregar parametro `excludeSensitive: boolean = true` que filtre variables con KEY/SECRET/TOKEN/PASSWORD por defecto. O deprecar el metodo a favor de `getSummary()` que ya enmascara valores sensibles. |
| M-004 | `automation/src/services/video-rendering.service.ts` | 368-400 | **Redireccion HTTP sin limite**: El metodo `downloadFile` sigue redirects de forma recursiva sin limite maximo. Un servidor malicioso podria causar un loop infinito de redirecciones o redirigir a URLs internas (SSRF parcial). | Agregar contador de redirects con maximo de 5, y validar que la URL de redireccion use protocolo https. |
| M-005 | `automation/src/services/video-rendering.service.ts` | 370 | **Soporte HTTP sin cifrar**: El metodo `downloadFile` acepta URLs `http://` ademas de `https://`. Descargar assets via HTTP expone el contenido a ataques man-in-the-middle. | Forzar solo HTTPS para descarga de assets en produccion. Permitir HTTP solo en modo desarrollo. |

### Prioridad Baja / Recomendaciones

| ID | Archivo | Linea | Vulnerabilidad | Remediacion |
|----|---------|-------|----------------|-------------|
| L-001 | `automation/src/services/tts.service.ts` | 629 | **Uso de MD5 para hash de cache**: MD5 es criptograficamente debil. Aunque aqui se usa solo para cache (no seguridad), es mejor practica usar SHA-256. | Cambiar `crypto.createHash('md5')` a `crypto.createHash('sha256')` |
| L-002 | `src/config/EnvironmentManager.ts` | 541-548 | **`printSummary()` deprecado pero presente**: Aunque verifica `NODE_ENV !== 'production'`, el metodo podria ser invocado accidentalmente. Ya esta marcado como `@deprecated`. | Considerar eliminar el metodo en una futura version. El guard de produccion es correcto. |
| L-003 | `automation/src/config/youtube.config.ts` | 87 | **Mock value en constante con nombre generico**: `CI_MOCK_VALUE = 'ci-mock-value'` se usa como fallback para credenciales OAuth2. Es correcto pero podria ser mas descriptivo. | Renombrar a `CI_MOCK_CREDENTIAL` y agregar comentario indicando que nunca se usa para autenticacion real. |
| L-004 | `automation/src/notifiers/email-notifier.ts` | 318 | **URLs de accion en email sin firma HMAC**: Los enlaces de aprobar/rechazar en el email HTML (`approveUrl`, `rejectUrl`) no estan firmados criptograficamente. Cualquiera con el enlace podria ejecutar la accion. | Agregar firma HMAC a las URLs de accion usando `DASHBOARD_SECRET`. Ejemplo: `approveUrl + '&sig=' + hmac(secret, videoId)` |
| L-005 | `automation/src/config/env.config.ts` | 49 | **Dashboard URL default a localhost**: El fallback `http://localhost:3000` es correcto para desarrollo, pero debe validarse que no se use en produccion. | Agregar validacion en modo produccion que requiera una URL real configurada. |
| L-006 | General | - | **Sin Content Security Policy**: El proyecto no implementa CSP headers. Aunque es principalmente un pipeline de backend, si se agrega un dashboard web, CSP sera necesario. | Implementar helmet.js si se agrega servidor web para el dashboard. |

---

## Auditoria de Dependencias

### Raiz (`/`)

```
2 high severity vulnerabilities
- @isaacs/brace-expansion 5.0.0 (GHSA-7h2j-956f-4vf2)
- minimatch < 10.2.1 (GHSA-3ppc-4f35-3m26)
Fix: npm audit fix
```

### Automation (`/automation`)

```
12 vulnerabilities (1 low, 6 moderate, 5 high)
- axios 1.0.0-1.13.4 - DoS via __proto__ (GHSA-43fc-jf86-j433) [HIGH]
- minimatch < 10.2.1 - ReDoS (GHSA-3ppc-4f35-3m26) [HIGH]
- qs 6.7.0-6.14.1 - DoS arrayLimit bypass (GHSA-w7fw-mjwx-w883) [HIGH]
- ajv < 8.18.0 - ReDoS con $data (GHSA-2g4f-4pwh-qvx6) [MODERATE]
  (via node-telegram-bot-api -> request -> har-validator)
Fix parcial: npm audit fix (axios, minimatch, qs)
Fix completo: npm audit fix --force (breaking change en node-telegram-bot-api)
```

### Remotion App (`/remotion-app`)

```
8 vulnerabilities (2 low, 6 moderate)
- ajv < 8.18.0 en 3 instancias (GHSA-2g4f-4pwh-qvx6) [MODERATE]
  (via @remotion/bundler -> webpack -> schema-utils)
Fix: npm audit fix
```

### Paquetes Vulnerables Detallados

| Paquete | Severidad | CVE/Advisory | Recomendacion |
|---------|-----------|--------------|---------------|
| axios | HIGH | GHSA-43fc-jf86-j433 | `npm audit fix` en automation/ |
| minimatch | HIGH | GHSA-3ppc-4f35-3m26 | `npm audit fix` en raiz y automation/ |
| @isaacs/brace-expansion | HIGH | GHSA-7h2j-956f-4vf2 | `npm audit fix` en raiz |
| qs | HIGH | GHSA-w7fw-mjwx-w883 | `npm audit fix` en automation/ |
| ajv | MODERATE | GHSA-2g4f-4pwh-qvx6 | `npm audit fix` en automation/ y remotion-app/ |

---

## Validacion de Gestion de Secrets

- [x] Todas las API keys se cargan desde variables de entorno
- [x] `.gitignore` correctamente configurado (incluye .env, .env.local, .env.*.local, .env.dev, .env.staging, .env.prod, .env.production, *.key, *.pem)
- [x] `.env.example` contiene valores placeholder (no reales)
- [x] No se detectaron credenciales hardcodeadas en codigo fuente
- [x] No se encontraron patrones de AWS keys (AKIA...), Google API keys (AIza...), OpenAI keys (sk-...), ni Resend keys (re_...)
- [x] Git history limpio -- solo `.env.example` fue commitado (verificado)
- [x] CI/CD usa valores mock (`ci-test-mock-key`) que nunca se usan en produccion
- [x] `EnvironmentManager.getSummary()` enmascara valores sensibles con patron KEY/SECRET/PASSWORD/TOKEN
- [x] `env.config.ts` incluye funciones `maskEmail()` y `maskSecret()` para logging seguro
- [ ] **Mejora recomendada**: `.env.example` linea 83 tiene placeholder que se asemeja a token real de Telegram

---

## Estado de Seguridad por Integracion API

| API | Auth | Rate Limit | Error Handling | Escape/Sanitizacion | Estado |
|-----|------|------------|----------------|----------------------|--------|
| Gemini | OK - API key via env var, mock en CI | OK - Modelo fallback chain (3 niveles) | OK - Errores no exponen key | OK - Input via prompt template | APROBADO |
| ElevenLabs | OK - API key via env var + validacion previa | OK - Quota mensual tracking, fallback Edge-TTS | ADVERTENCIA - URL loggeada en error | OK - API key en header, no URL | ADVERTENCIA |
| NewsData.io | OK - API key via env var | OK - Limite configurable (10/request) | OK - Error handling basico | OK - Query constante, no user input | APROBADO |
| YouTube API | OK - OAuth2 con refresh token via env vars | OK - Quota tracking diaria (10k units) | OK - Errores parseados sin exponer tokens | OK - Metadata sanitizada (titulo, desc, tags) | APROBADO |
| Telegram Bot | OK - Token via env var, check antes de usar | OK - Solo envio, sin polling continuo | OK - Errores capturados | OK - Markdown escape implementado | APROBADO |
| Resend Email | OK - API key via env var | OK - Falla gracefully si no configurado | OK - Error handling con boolean return | ADVERTENCIA - URLs de accion sin firma | ADVERTENCIA |
| Pexels | OK - API key via env var | OK - Free tier 200 req/hora | OK - Scoring y fallback | OK - Query sanitizada (Prompt 53) | APROBADO |
| OpenAI Whisper | OK - API key via env var, opcional | OK - Solo cuando configurado | OK - Null return en error | OK - Solo lee archivos locales | APROBADO |

---

## Analisis Detallado de Hallazgos Criticos

### C-001: Inyeccion de Comandos en Edge-TTS

**Archivo:** `automation/src/services/tts.service.ts`, lineas 444-457

**Descripcion del problema:**

El metodo `generateWithFallback()` construye un comando shell concatenando texto directamente en la cadena del comando:

```typescript
// Escape INSUFICIENTE - solo maneja 3 caracteres
const escapedText = text
  .replace(/"/g, '\\"')
  .replace(/`/g, '\\`')
  .replace(/\$/g, '\\$');

// Texto interpolado directamente en comando shell
const edgeTtsArgs = `--text "${escapedText}" --write-media "${audioPath}"`;
const commandDirect = `edge-tts ${edgeTtsArgs}`;
await execAsync(commandDirect, { timeout: 120000 });
```

**Por que es peligroso (explicacion educativa para QA):**

Cuando usas `exec()` o `execAsync()` en Node.js, el comando se ejecuta a traves del shell del sistema operativo (bash en Linux/Mac, cmd en Windows). El shell interpreta caracteres especiales llamados "metacaracteres". Si el texto contiene cualquiera de estos caracteres sin escapar, el shell los interpretara como instrucciones:

- `;` o `&&` -- ejecuta un segundo comando
- `|` -- redirige la salida a otro comando (pipe)
- `$(...)` o `` `...` `` -- sustitucion de comandos (ejecuta lo que esta dentro)
- `\n` (salto de linea) -- nuevo comando
- `'` (comilla simple) -- rompe el contexto de string

El texto que se pasa a Edge-TTS proviene del script generado por Gemini API. Aunque Gemini no es un atacante, un prompt injection o una noticia con contenido malicioso podria generar texto que contenga estos metacaracteres.

**Ejemplo de explotacion teorica:**

Si el script generado contuviera:
```
Hola mundo"; rm -rf /tmp/test #
```

El comando resultante seria:
```
edge-tts --text "Hola mundo"; rm -rf /tmp/test #" --write-media "output.mp3"
```

El shell ejecutaria `edge-tts --text "Hola mundo"` Y TAMBIEN el segundo comando.

**Riesgo real:** Medio-Alto. El texto proviene de Gemini API (fuente semi-confiable) procesando noticias externas. Un ataque de prompt injection via noticias manipuladas es un vector plausible.

**Remediacion recomendada:**

Usar `execFile` (que NO pasa por el shell) con argumentos como array separado:

```typescript
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

// SEGURO: argumentos como array, sin interpretacion shell
await execFileAsync('edge-tts', [
  '--voice', edgeTts.voice,
  '--rate', edgeTts.rate,
  '--pitch', edgeTts.pitch,
  '--text', text,  // No necesita escape -- no pasa por shell
  '--write-media', audioPath,
], { timeout: 120000 });
```

Alternativamente, escribir el texto a un archivo temporal:

```typescript
const tempTextFile = path.join(this.cachePath, `${textHash}.txt`);
fs.writeFileSync(tempTextFile, text, 'utf-8');

await execFileAsync('edge-tts', [
  '--voice', edgeTts.voice,
  '--file', tempTextFile,
  '--write-media', audioPath,
], { timeout: 120000 });

fs.unlinkSync(tempTextFile); // Limpiar
```

---

## Revision de GitHub Actions

**Archivo:** `.github/workflows/test.yml`

Hallazgos positivos:
- Permisos minimos configurados: `contents: read`, `checks: write`
- No se usan secrets de GitHub en el workflow (el proyecto usa `CI=true` y `NODE_ENV=test` para activar modo mock)
- Job de security audit ejecuta `npm audit` en paralelo
- Timeout configurado (15 minutos)
- Artefactos con retencion limitada (30 dias reports, 7 dias failures)
- Usa `npm ci` (instalacion determinista) en lugar de `npm install`
- Actions pinneadas a version major (v4) -- considerar pinnear a SHA para mayor seguridad

**Observaciones:**
- `continue-on-error: true` en audit steps es aceptable (informativo, no bloqueante)
- No se publican secrets en logs ni artefactos

---

## Practicas Positivas de Seguridad Detectadas

El proyecto ya implementa varias buenas practicas de seguridad que vale la pena destacar:

1. **Patron `isTestOrCI()`**: Detecta ambiente de pruebas/CI y usa valores mock, evitando que se requieran API keys reales durante testing.

2. **Validacion lazy de env vars**: El `automation/src/config.ts` solo valida variables requeridas en produccion, no al importar el modulo (solucionando 20 test failures previos en CI).

3. **Mascaras de logging**: `env.config.ts` implementa `maskEmail()` y `maskSecret()` para sanitizar valores sensibles antes de registrarlos.

4. **Guard de produccion en `printSummary()`**: El metodo verifica `NODE_ENV !== 'production'` antes de imprimir configuracion.

5. **Escape HTML en emails**: `email-notifier.ts` implementa `escapeHtml()` para prevenir XSS en el contenido del email.

6. **Escape Markdown en Telegram**: `telegram-notifier.ts` implementa `escapeMarkdown()` para prevenir inyeccion de formato.

7. **YouTube OAuth2 con scope minimo**: Solo solicita `youtube.upload` y `youtube.readonly`.

8. **Privacidad por defecto**: `YOUTUBE_DEFAULT_PRIVACY=private` -- los videos no se publican automaticamente.

9. **Validacion y sanitizacion de metadata YouTube**: `validateTitle()`, `validateDescription()`, y `validateTags()` sanitizan input antes de enviar a la API.

10. **ElevenLabs key validation**: `validateElevenLabsKey()` verifica credenciales con un GET a `/user/subscription` antes de intentar generar audio.

---

## Acciones de Remediacion Aplicadas (durante esta revision)

Las siguientes correcciones se aplicaron durante el proceso de revision:

1. **npm audit fix en raiz**: 0 vulnerabilidades restantes (antes: 2 high). Se actualizaron `@isaacs/brace-expansion` y `minimatch`.

2. **npm audit fix en automation/**: axios actualizado (corrige GHSA-43fc-jf86-j433), qs actualizado (corrige GHSA-w7fw-mjwx-w883). Quedan 10 vulnerabilidades en dependencias transitivas profundas (ajv via node-telegram-bot-api, minimatch via googleapis -> gaxios) que requieren breaking changes.

3. **npm audit fix en remotion-app/**: Se actualizaron paquetes disponibles. Quedan 7 moderate en ajv via @remotion/bundler -> webpack -> schema-utils (no hay fix disponible sin actualizar Remotion).

4. **Placeholders de .env.example mejorados (H-005)**: Se reemplazaron valores que se asemejaban a credenciales reales:
   - `TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11` cambiado a `your_bot_token_here`
   - `TELEGRAM_CHAT_ID=123456789` cambiado a `your_chat_id_here`
   - `NOTIFICATION_EMAIL=tu_email@gmail.com` cambiado a `your_email@example.com`
   - `RESEND_API_KEY=re_xxxxxxxxxxxxx` cambiado a `re_your_resend_api_key_here`

5. **TypeScript check post-fix**: Verificado que todas las correcciones no rompen la compilacion.

---

## Acciones de Remediacion Recomendadas

### Prioridad 1 - Inmediata (antes del proximo deploy)

1. **Corregir inyeccion de comandos Edge-TTS (C-001)**: Reemplazar `execAsync` con `execFileAsync` y pasar argumentos como array. Este es el hallazgo mas critico.

2. **Parchear axios en automation/ (H-001)**: Ejecutar `cd automation && npm audit fix`. La version actual 1.13.4 es vulnerable a DoS.

3. **Parchear minimatch en raiz (H-002)**: Ejecutar `npm audit fix` en el directorio raiz.

### Prioridad 2 - Esta semana

4. **Sanitizar URL en log de error TTS (H-004)**: Modificar linea 191 de `tts.service.ts` para no registrar la URL completa.

5. **Mejorar placeholder de Telegram en .env.example (H-005)**: Cambiar a formato que claramente no sea un token real.

6. **Parchear qs en automation/ (H-003)**: Ejecutar `cd automation && npm audit fix`.

### Prioridad 3 - Este mes

7. **Agregar limite de redirects en downloadFile (M-004)**: Prevenir loops infinitos y SSRF.

8. **Forzar HTTPS en descarga de assets (M-005)**: Solo permitir HTTP en desarrollo.

9. **Deprecar/proteger `getAll()` en EnvironmentManager (M-003)**: Agregar filtrado de variables sensibles.

10. **Agregar firma HMAC a URLs de email (L-004)**: Prevenir acciones no autorizadas via links de aprobacion.

11. **Actualizar ajv en dependencias transitivas (M-001, M-002)**: Requiere `npm audit fix --force` o actualizacion de paquetes padre.

---

## Metricas de Seguridad

| Metrica | Valor |
|---------|-------|
| Vulnerabilidades Criticas (codigo) | 1 |
| Vulnerabilidades High (dependencias) | 7 |
| Vulnerabilidades Moderate (dependencias) | 12 |
| Vulnerabilidades Low (dependencias) | 3 |
| Secrets en codigo fuente | 0 |
| Secrets en git history | 0 |
| APIs con auth correcta | 8/8 |
| APIs con rate limiting | 7/8 |
| APIs con error handling seguro | 7/8 |
| Archivos .env en git | 0 (solo .env.example) |
| Cobertura de .gitignore | Completa |

---

## Proxima Revision

Se recomienda repetir este escaneo de seguridad:
- Despues de corregir C-001 (inyeccion de comandos)
- Despues de ejecutar `npm audit fix` en todos los paquetes
- Antes de integrar YouTubeService en el orchestrator (paso 11 pendiente)
- Cuando se agregue el dashboard web de aprobacion (requerira CSP, CORS, CSRF protection)

**Periodicidad sugerida:** Cada 2 semanas o ante cambios en dependencias/configuracion.

---

*Reporte generado por Security-Reviewer Agent -- Proyecto educativo para QA Automation*
*Los hallazgos estan explicados con contexto educativo para profesionales de QA en transicion a automatizacion.*
