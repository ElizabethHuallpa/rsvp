/**
 * RSVP · Boda Elizabeth y Gustavo  —  Backend en Google Apps Script (Opción B)
 *
 * Recibe las respuestas de la invitación y las guarda en la hoja de cálculo a la que está
 * vinculado este script. No contiene contraseñas ni claves: se ejecuta con tu cuenta de Google
 * cuando lo publicas como "Aplicación web".
 *
 * Hojas (se crean solas si no existen):
 *   - "Respuestas": aquí se guardan las confirmaciones.
 *   - "Invitados"  (opcional, créala tú): A = Nombre completo, B = Asistentes autorizados.
 *                  Si existe, el servidor comprueba que nadie registre más asistentes de los autorizados.
 */
const HOJA_RESPUESTAS = 'Respuestas';
const HOJA_INVITADOS = 'Invitados';
const AUTORIZADOS_SI_NO_ESTA = 1;   // debe coincidir con unlistedPasses del archivo HTML
const DEBUG = false;   // true solo para pruebas: devuelve el detalle técnico del error

function doPost(e) {
  try {
    const p = JSON.parse(e.postData.contents);
    const error = validar(p);
    if (error) return salida({ ok: false, error: error });

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let hoja = ss.getSheetByName(HOJA_RESPUESTAS);
      if (!hoja) hoja = ss.insertSheet(HOJA_RESPUESTAS);
      if (hoja.getLastRow() === 0) {
        hoja.appendRow(['Fecha', 'Nombre', 'Asistencia', 'Asistentes', 'Autorizados', 'En listado',
                        'Restricciones alimentarias', 'Acompañantes', 'Mensaje']);
      }
      const acompanantes = Array.isArray(p.acompanantes)
        ? p.acompanantes.join('\n')
        : String(p.acompanantes || '').split('|').map(v => v.trim()).filter(Boolean).join('\n');
      hoja.appendRow([new Date(), limpio(p.nombre), limpio(p.asistencia), Number(p.asistentes),
                      autorizadosPara(p.nombre), p.enListado ? 'Sí' : 'No',
                      limpio(p.restricciones), limpio(acompanantes), limpio(p.mensaje)]);
    } finally {
      lock.releaseLock();
    }
    return salida({ ok: true });
  } catch (err) {
    return salida({ ok: false, error: DEBUG ? String(err) : 'Solicitud no válida' });
  }
}

// Prueba rápida: abre la URL de la aplicación web en el navegador. Debe mostrar {"ok":true,...}
function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return salida({ ok: true, mensaje: 'RSVP activo',
                  hoja: ss ? ss.getName() : 'SIN HOJA VINCULADA: crea el script desde la hoja (Extensiones > Apps Script)' });
}

function validar(p) {
  if (!p || typeof p.nombre !== 'string' || p.nombre.trim().split(/\s+/).length < 2) return 'Falta el nombre completo';
  if (p.asistencia !== 'Asistiré' && p.asistencia !== 'No podré asistir') return 'Falta la confirmación';
  const n = Number(p.asistentes);
  if (!Number.isInteger(n) || n < 0) return 'Número de asistentes no válido';
  if (p.asistencia === 'Asistiré' && n < 1) return 'Indica al menos 1 asistente';
  if (n > autorizadosPara(p.nombre)) return 'Supera los asistentes autorizados';
  if (p.asistencia === 'Asistiré') {
    const acomp = Array.isArray(p.acompanantes)
      ? p.acompanantes
      : String(p.acompanantes || '').split('|').map(v => v.trim()).filter(Boolean);
    if (n - 1 !== acomp.length) return 'Los nombres de acompañantes no coinciden con la cantidad de asistentes';
  }
  return null;
}

// Autorizados según la hoja "Invitados" (la verdad vive en el servidor, no en el navegador).
function autorizadosPara(nombre) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_INVITADOS);
  if (!hoja) return AUTORIZADOS_SI_NO_ESTA;
  const clave = normalizar(nombre);
  const filas = hoja.getDataRange().getValues();
  for (let i = 0; i < filas.length; i++) {
    if (normalizar(String(filas[i][0])) === clave) return Number(filas[i][1]) || AUTORIZADOS_SI_NO_ESTA;
  }
  return AUTORIZADOS_SI_NO_ESTA;
}

function normalizar(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

// Evita que un texto como "=HYPERLINK(...)" se ejecute como fórmula en la hoja.
function limpio(v) {
  const s = String(v == null ? '' : v).slice(0, 500);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function salida(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
