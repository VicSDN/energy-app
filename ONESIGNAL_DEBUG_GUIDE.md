# 🔧 Guía de Diagnóstico OneSignal

## ✅ ¿Qué hemos implementado?

### 1. **Toast de Instalación PWA**
- 📱 Aparece automáticamente después de 3 segundos
- 🎯 Solo cuando la app no está instalada
- ⏰ Respeta si el usuario lo rechaza (24h de pausa)
- 🎨 Diseño moderno y atractivo

### 2. **Servicio OneSignal Mejorado** (`src/services/oneSignalService.js`)
- 🔄 Manejo robusto de errores y timeouts
- 📊 Sistema de eventos personalizado
- 🛡️ Validación de dependencias del navegador
- 🔍 Información de debugging detallada

### 3. **Panel de Debug Interactivo** (Solo en desarrollo)
- 🐛 Aparece automáticamente si hay problemas
- 📋 Información completa del estado del servicio
- 🧪 Herramientas de prueba en tiempo real
- 📊 Log de acciones y resultados

## 🔍 Cómo Diagnosticar Problemas

### **1. Usa el Panel de Debug**

Cuando estés en modo desarrollo (`npm run serve`), verás:
- 🔴 Un botón flotante 🐛 en la esquina inferior derecha
- ✅ El panel se abre automáticamente si detecta problemas

### **2. Información Clave del Panel**

#### Estado del Servicio:
- **Inicializado**: ¿OneSignal se cargó correctamente?
- **Permisos**: `granted` (permitido) / `denied` (denegado) / `default` (sin decidir)
- **Suscrito**: ¿Está recibiendo notificaciones?
- **HTTPS**: ¿El sitio es seguro? (Requerido para notificaciones)
- **Service Worker**: ¿El navegador lo soporta?
- **Notifications API**: ¿El navegador puede mostrar notificaciones?

#### Botones de Prueba:
- **Probar Prompt**: Fuerza mostrar el diálogo de notificaciones
- **Actualizar Info**: Refresca toda la información
- **Verificar Permisos**: Revisa el estado actual

### **3. Problemas Comunes y Soluciones**

#### ❌ "OneSignal no inicializado"
**Causas posibles:**
- Bloqueador de anuncios activo
- Conexión a internet lenta
- Firewall corporativo

**Soluciones:**
1. Desactiva bloqueadores temporalmente
2. Verifica conexión a internet
3. Usa VPN si estás en red corporativa

#### ❌ "HTTPS: No"
**Problema:** Las notificaciones requieren HTTPS
**Soluciones:**
- En desarrollo: OneSignal debería permitir localhost
- En producción: Asegúrate de usar HTTPS

#### ❌ "Permisos: denied"
**Problema:** Usuario denegó permisos previamente
**Soluciones:**
1. En Chrome: Click en el candado → Notificaciones → Permitir
2. En Firefox: Click en el escudo → Permisos → Notificaciones
3. Instruir al usuario para limpiar permisos del sitio

#### ❌ "Service Worker: No soportado"
**Problema:** Navegador muy antiguo
**Solución:** Actualizar navegador

### **4. Información de Red**

Si ves errores de timeout:
```
Error: OneSignal initialization timeout after 15 seconds
```

**Soluciones:**
1. Verifica que `cdn.onesignal.com` sea accesible
2. Desactiva proxy/VPN temporalmente
3. Prueba en navegador incógnito

## 🛠️ Herramientas de Desarrollo

### **Consola del Navegador** (F12)

Busca mensajes como:
```javascript
OneSignal SDK Inicializado Correctamente!
OneSignal service: Recibido evento onesignal-ready
Notification status check: { permission: "granted", isSubscribed: true }
```

### **Application Tab** (Chrome DevTools)

1. Ve a **Application** → **Service Workers**
2. Verifica que `OneSignalSDKWorker.js` esté registrado
3. En **Storage** → **Local Storage** puedes ver:
   - `installToastDismissed`: Timestamp de rechazo del toast

## 🔧 Comandos Útiles

### **En la Consola del Navegador:**

```javascript
// Verificar estado de OneSignal
console.log(window.OneSignalState);

// Información de debug
window.OneSignal?.getNotificationPermission().then(console.log);
window.OneSignal?.isPushNotificationsEnabled().then(console.log);

// Limpiar rechazo del toast
localStorage.removeItem('installToastDismissed');
```

## 📱 Flujo de Usuario Ideal

1. **Usuario entra por primera vez**
   - ✅ Página carga normalmente
   - ✅ OneSignal se inicializa (3-5 segundos)
   - ✅ Toast de instalación aparece (después de 3 segundos)

2. **Usuario hace clic en "Añadir" (toast)**
   - ✅ Se ejecuta instalación PWA
   - ✅ Toast desaparece

3. **Usuario hace clic en "Activar Notificaciones"**
   - ✅ Aparece diálogo nativo del navegador
   - ✅ Usuario acepta
   - ✅ Redirección automática a la app

## 🚨 Señales de Alerta

Si ves estos mensajes, hay problemas:

- ❌ `OneSignal SDK not loaded - check network connection`
- ❌ `OneSignal no detectado, posible problema de red`
- ❌ `Error inicializando OneSignal SDK`
- ❌ `Tiempo de espera agotado`

## 🔄 Resetear Todo

Para probar desde cero:

1. **En Chrome:**
   - Ve a `chrome://settings/content/notifications`
   - Elimina tu sitio de la lista
   - Limpia datos del sitio

2. **En el código:**
   ```javascript
   // En consola del navegador
   localStorage.clear();
   location.reload();
   ```

## 📞 Próximos Pasos

Si sigues teniendo problemas:

1. 📋 Copia la información del panel de debug
2. 🖼️ Captura de pantalla de errores en consola
3. 🌐 Indica navegador y versión
4. 🔗 URL donde ocurre el problema

¡Con estas herramientas deberías poder identificar y resolver cualquier problema con OneSignal! 🎉

