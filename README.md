# Invitación de boda · Elizabeth y Gustavo

Página web estática (HTML + CSS + JavaScript). No necesita instalar nada.

## Estructura

```
index.html              Contenido de la invitación
css/style.css           Diseño (colores, sobre, animaciones, formulario)
js/main.js              Sobre, música, cuenta atrás y pétalos
js/rsvp-config.js       ✏️ LISTA DE INVITADOS y pases autorizados
js/rsvp-storage.js      ✏️ A dónde se envían las respuestas (URL de Apps Script)
js/rsvp-ui.js           Formulario RSVP (validaciones y mensajes)
assets/img/             Ilustraciones y fotos
assets/audio/           Música de fondo
apps-script/apps.gs     Código para pegar en Google Apps Script (no se ejecuta en GitHub)
```

## Qué editar

1. **Invitados**: abre `js/rsvp-config.js` y reemplaza los 3 nombres de prueba por tu lista
   (`{n:"Nombre completo", p:pases}`).
2. **Respuestas**: en `js/rsvp-storage.js`, `mode:'endpoint'` y `endpoint.url` ya apuntan a tu Apps Script.
   Si creas una nueva implementación, la URL puede cambiar: pégala ahí.
3. **Fecha y hora** de la cuenta atrás: en `js/main.js` (`TARGET`, hora de Lima).

## Publicar gratis con GitHub Pages

1. Crea un repositorio en github.com (por ejemplo `boda-elizabeth-y-gustavo`).
2. Sube **el contenido de esta carpeta** respetando las subcarpetas
   (con GitHub Desktop o con *Add file → Upload files* arrastrando las carpetas).
3. En el repositorio: **Settings → Pages → Source: Deploy from a branch → `main` / `(root)` → Save**.
4. En 1–2 minutos tu invitación estará en `https://TU-USUARIO.github.io/boda-elizabeth-y-gustavo/`.

## Google Apps Script (guardar respuestas en la hoja)

1. Crea una hoja de Google. Desde ella: **Extensiones → Apps Script** (así queda vinculado a la hoja).
2. Pega el contenido de `apps-script/apps.gs` y guarda.
3. **Implementar → Nueva implementación → Aplicación web**: ejecutar como *yo*, acceso *Cualquier persona*.
4. Si cambias el código después: **Implementar → Administrar implementaciones → ✏️ → Versión nueva → Implementar**.
5. Prueba: abre la URL de la aplicación web en el navegador; debe mostrar `{"ok":true,...}`.
6. Opcional: crea una hoja llamada `Invitados` (A = nombre completo, B = asistentes autorizados)
   para que el servidor también valide los pases.

## Ojo con la privacidad

En un repositorio **público** (necesario para Pages gratis) cualquiera puede ver:
la lista de invitados de `rsvp-config.js`, los datos bancarios de `index.html`, la URL del Apps Script
y la canción de `assets/audio`. Si no quieres eso, quita esos datos o el audio antes de subir.
