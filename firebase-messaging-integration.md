# Configuración de Firebase con OneSignal para Notificaciones Push

## Paso 1: Crear una cuenta de servicio en Firebase

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/) y selecciona tu proyecto `energy-app-d6293`.
2. Haz clic en el icono de configuración ⚙️ (junto a "Project Overview") y selecciona "Project settings".
3. Ve a la pestaña "Service accounts".
4. Selecciona "Firebase Admin SDK" y haz clic en el botón "Generate new private key".
5. Se descargará un archivo JSON con las credenciales. Este es el archivo que OneSignal necesita.

## Paso 2: Configurar OneSignal con Firebase

1. Inicia sesión en [OneSignal](https://app.onesignal.com/).
2. Selecciona tu aplicación "Energy Club".
3. Ve a "Settings" > "Messaging" > "Firebase Cloud Messaging".
4. Sube el archivo JSON que acabas de descargar de Firebase en el campo "Upload Google Service Account Key JSON File".
5. Guarda los cambios.

## Paso 3: Verificar la configuración

1. En OneSignal, ve a "Audience" > "All Users".
2. Haz clic en el botón "Send test notification" para enviar una notificación de prueba.
3. Verifica que la notificación llegue a tu dispositivo.

## Solución de problemas

### Error de formato en el archivo JSON

Si OneSignal muestra un error al subir el archivo JSON, asegúrate de que:
- El archivo es válido y contiene todas las claves necesarias
- No se ha modificado después de descargarlo
- Es el archivo JSON de cuenta de servicio (service account), no el de configuración de la app cliente

### Las notificaciones no llegan

1. Verifica que el permiso de notificaciones esté concedido en el navegador
2. Comprueba que el Service Worker esté registrado correctamente
3. Verifica en la consola de OneSignal que los dispositivos estén registrados en "Audience" > "All Users"

### Problemas de registro de dispositivos

1. Verifica que el App ID de OneSignal en tu archivo `index.html` sea correcto
2. Asegúrate de que el Service Worker esté correctamente configurado
3. Revisa los logs en la consola del navegador para errores específicos

## Envío de notificaciones programáticas

Para enviar notificaciones desde tu backend:

```javascript
// Ejemplo usando la API REST de OneSignal
const sendNotification = async (heading, content, userId = null) => {
  const appId = '04bdf268-6549-4aff-85e0-4d5c973069d5'; // Tu App ID de OneSignal
  const restApiKey = 'TU_REST_API_KEY'; // Obtén esto de OneSignal Dashboard > Settings > Keys & IDs
  
  const data = {
    app_id: appId,
    headings: { 'es': heading, 'en': heading },
    contents: { 'es': content, 'en': content },
    // Si tienes un ID de usuario específico:
    include_external_user_ids: userId ? [userId] : undefined,
    // Si no especificas usuario, se envía a todos:
    included_segments: !userId ? ['All'] : undefined
  };
  
  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${restApiKey}`
      },
      body: JSON.stringify(data)
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    return { error };
  }
};
```
