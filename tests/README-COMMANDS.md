# Guia de Comandos de Testing

> Documentacion completa de todos los comandos disponibles para ejecutar y gestionar tests en Sintaxis IA.

---

## Comandos Basicos

### Ejecutar todos los tests
```bash
npm test
```

### Ejecutar con interfaz visual (Playwright UI)
```bash
npm run test:ui
```

### Ejecutar en modo headed (ver navegador)
```bash
npm run test:headed
```

### Ejecutar en modo debug
```bash
npm run test:debug
```

---

## Comandos por Suite

| Suite | Tests | Comando |
|-------|-------|---------|
| TestLogger | 3 | `npm run test:logger` |
| Service Objects | 5 | `npm run test:services` |
| Video Generation | 19 | `npm run test:video` |
| Content Validation | 23 | `npm run test:content` |

### TestLogger (3 tests)
```bash
npm run test:logger
```
Valida el sistema de logging estructurado con Winston.

### Service Objects (5 tests)
```bash
npm run test:services
```
Demuestra el patron Service Object con GeminiServiceObject.

### Video Generation (19 tests)
```bash
npm run test:video
```
Tests de renderizado, validacion de archivos y metadatos de video.

### Content Validation (23 tests)
```bash
npm run test:content
```
Tests de estructura de scripts, longitud, deteccion de topics e imagenes.

---

## Comandos por Categoria

### Tests unitarios (8 tests)
```bash
npm run test:unit
```
Ejecuta TestLogger + Service Objects.

### Tests de integracion (42 tests)
```bash
npm run test:integration
```
Ejecuta Video Generation + Content Validation.

### Todos los tests (50 tests)
```bash
npm run test:all
```
Ejecuta todos los tests del directorio specs/.

---

## Reportes

### Ver ultimo reporte HTML
```bash
npm run test:report
```
Abre el reporte HTML interactivo en el navegador.

### Generar solo reporte HTML
```bash
npm run test:html
```

### Generar solo reporte JSON
```bash
npm run test:json
```

### Generar solo reporte JUnit (CI/CD)
```bash
npm run test:junit
```

### Ubicacion de reportes

| Tipo | Ubicacion |
|------|-----------|
| HTML | `tests/reports/html/index.html` |
| JSON | `tests/reports/results.json` |
| JUnit | `tests/reports/junit.xml` |

---

## CI/CD

### Ejecutar para CI/CD (multiples reporters)
```bash
npm run test:ci
```
Genera reportes HTML, JSON y JUnit simultaneamente.

### Validacion completa del proyecto
```bash
npm run validate:all
```
Ejecuta TypeScript check + todos los tests + abre reporte.

### Pipeline CI
```bash
npm run ci:validate
```
Ejecuta lint + tests con reporter para CI.

---

## Agentes de Claude Code

### QA Automation (ejecutar tests)
```bash
npm run test:qa-automation
```

### Security Review
```bash
npm run security:review
```

### Documentation Update
```bash
npm run docs:update
```

### Code Refactoring
```bash
npm run refactor:apply
```

### Listar agentes disponibles
```bash
npm run agents:list
```

---

## Tips y Trucos

### Filtrar tests por nombre
```bash
npx playwright test -g "should validate"
npx playwright test -g "video"
```

### Ejecutar un archivo especifico
```bash
npx playwright test tests/specs/prompt7-video-generation.spec.ts
```

### Ejecutar tests en paralelo
```bash
npx playwright test --workers=4
```

### Ejecutar con reintentos
```bash
npx playwright test --retries=2
```

### Ver trace de tests fallidos
```bash
npx playwright show-trace tests/test-results/*/trace.zip
```

### Ejecutar solo tests marcados con .only
```bash
npx playwright test --project=chromium
```

---

## Estructura de Archivos

```
tests/
├── specs/                          # Archivos de test
│   ├── prompt5-testlogger-validation.spec.ts
│   ├── service-objects-demo.spec.ts
│   ├── prompt7-video-generation.spec.ts
│   └── prompt8-content-validation.spec.ts
├── reports/                        # Reportes generados
│   ├── html/                       # Reporte HTML interactivo
│   ├── results.json                # Resultados en JSON
│   └── junit.xml                   # Reporte JUnit para CI
├── test-results/                   # Artefactos (screenshots, videos, traces)
├── logs/                           # Logs de TestLogger
├── utils/                          # Utilidades
│   ├── TestLogger.ts
│   ├── test-runner.ts              # Runner programatico
│   └── log-formatter.ts
└── README-COMMANDS.md              # Este archivo
```

---

## Configuracion

### playwright.config.ts

| Setting | Local | CI |
|---------|-------|-----|
| Workers | 4 | 1 |
| Retries | 0 | 2 |
| Timeout | 120s | 120s |
| Screenshots | On failure | On failure |
| Video | On failure | On failure |
| Trace | On first retry | On first retry |

---

## Troubleshooting

### Tests fallan por timeout
- Aumentar timeout en playwright.config.ts
- Ejecutar con menos workers: `--workers=1`

### No se generan reportes
- Verificar que la carpeta `tests/reports/` existe
- Ejecutar `npm run test:ci` para forzar todos los reporters

### Screenshots/videos no se guardan
- Solo se guardan en tests fallidos por defecto
- Cambiar configuracion en playwright.config.ts

### Error "No test results found"
- Ejecutar tests primero: `npm test`
- Verificar que `tests/reports/results.json` existe

---

## Enlaces Utiles

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Test Annotations](https://playwright.dev/docs/test-annotations)
- [Playwright Reporters](https://playwright.dev/docs/test-reporters)
- [Playwright CLI](https://playwright.dev/docs/test-cli)

---

*Documentacion generada para Sintaxis IA - Videos Short*
*50 tests | 4 suites | Service Object Pattern*
