# Guía de Configuración de Notificaciones

Sistema de notificaciones duales para Sintaxis IA.
Recibe alertas por Email y Telegram cuando hay videos listos para aprobar.

## Requisitos

- Cuenta de email para Resend
- Cuenta de Telegram

## 1. Configurar Email (Resend)

### Paso 1: Crear cuenta en Resend
1. Ir a https://resend.com
2. Crear cuenta gratis (100 emails/día)
3. Verificar tu email

### Paso 2: Verificar dominio (opcional pero recomendado)
1. Dashboard → Domains
2. Agregar dominio de envío
3. Configurar registros DNS

### Paso 3: Obtener API Key
1. Dashboard → API Keys
2. Click "Create API Key"
3. Dar nombre descriptivo: "Sintaxis IA Notifications"
4. Copiar key (empieza con `re_`)

### Paso 4: Configurar en .env
```bash
NOTIFICATION_EMAIL=tu_email@gmail.com
RESEND_API_KEY=re_tu_api_key_aqui
```

## 2. Configurar Telegram

### Paso 1: Crear Bot
1. Abrir Telegram
2. Buscar @BotFather
3. Enviar `/newbot`
4. Seguir instrucciones:
   - Nombre: "Sintaxis IA Notifier"
   - Username: `sintaxis_ia_notifier_bot`
5. Guardar el token (formato: `123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

### Paso 2: Iniciar conversación con tu bot
1. Buscar tu bot en Telegram (@tu_bot_username)
2. Enviar `/start` o cualquier mensaje

### Paso 3: Obtener Chat ID
1. Abrir en navegador:
   ```
   https://api.telegram.org/bot<TOKEN>/getUpdates
   ```
   Reemplazar `<TOKEN>` con tu token del bot

2. Buscar en la respuesta JSON:
   ```json
   "chat": {
     "id": 123456789,
     ...
   }
   ```

3. Copiar el número (puede ser negativo para grupos)

### Paso 4: Configurar en .env
```bash
TELEGRAM_BOT_TOKEN=123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_CHAT_ID=123456789
```

## 3. Configurar Dashboard

### Generar Secret Key
```bash
# En terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Configurar en .env
```bash
DASHBOARD_URL=http://localhost:3000
DASHBOARD_SECRET=tu_secret_generado_aqui
```

## 4. Archivo .env Completo

```bash
# ===========================================
# NOTIFICACIONES
# ===========================================

# Email (Resend)
NOTIFICATION_EMAIL=tu_email@gmail.com
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Telegram
TELEGRAM_BOT_TOKEN=123456789:ABC-DEF
TELEGRAM_CHAT_ID=123456789

# Dashboard
DASHBOARD_URL=http://localhost:3000
DASHBOARD_SECRET=abc123def456...

# Storage
TEMP_STORAGE_PATH=./automation/temp/videos
```

## 5. Validar Configuración

```bash
# Ejecutar pipeline en dry run
npm run automation:dry

# Deberías ver:
# ✅ Configuración validada
# 📧 Enviando email de notificación...
# ✅ Email enviado exitosamente
# 📱 Enviando notificación de Telegram...
# ✅ Notificación de Telegram enviada exitosamente
```

## 6. Ejecutar Tests

```bash
# Tests de notificaciones
npm run test:notifications

# Todos los tests
npm test
```

## Troubleshooting

### "Variables de entorno faltantes"
- Verificar que `.env` existe en la raíz del proyecto
- Verificar que todas las variables están configuradas
- Reiniciar terminal después de editar .env

### "Email failed"
- Verificar API key de Resend (empieza con `re_`)
- Verificar que el email está verificado en Resend
- Revisar logs de Resend Dashboard

### "Telegram failed"
- Verificar bot token (formato: `número:letras-y-números`)
- Verificar chat ID (enviar mensaje al bot primero)
- Verificar que enviaste al menos 1 mensaje al bot
- Probar URL: `https://api.telegram.org/bot<TOKEN>/getMe`

### "Notificaciones deshabilitadas"
- Algunas variables de entorno no están configuradas
- El pipeline continúa pero sin enviar notificaciones
- Revisar output: `Notificaciones: ⚠️ Deshabilitadas`

## Flujo de Aprobación

1. Sistema genera video
2. Guarda metadata en `automation/temp/videos/{videoId}.json`
3. Envía email HTML con preview y botones
4. Envía mensaje Telegram con botones inline
5. Usuario abre link en celular
6. Ve preview del video
7. Click "Aprobar" o "Rechazar"
8. Sistema procesa la acción

## Seguridad

- **Nunca** commitear `.env` (está en .gitignore)
- API keys y tokens solo en variables de entorno
- Los logs enmascaran información sensible
- Dashboard usa secret key para autenticar acciones
- URLs de aprobación son únicas por video
