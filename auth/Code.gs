/**
 * PoolDrive "Stay signed in" helper.
 * Runs in YOUR Google account (script.google.com). It keeps the OAuth client secret here,
 * so the secret is never in GitHub or on your devices. PoolDrive and PDF Pair send it a
 * one-time sign-in code (first time) or a long-term key (later) and get a fresh sign-in back.
 *
 * Setup: Project Settings → Script properties → add
 *   CLIENT_ID     = your PoolDrive Client ID (…apps.googleusercontent.com)
 *   CLIENT_SECRET = that client's secret (Google Cloud → Google Auth Platform → Clients → PoolDrive)
 * Then Deploy → New deployment → Web app → Execute as: Me · Who has access: Anyone → Deploy,
 * and paste the Web app URL into PoolDrive → Accounts → Stay signed in.
 */
function doPost(e) {
  var p = {};
  try { p = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) { return out({ error: 'bad_request' }); }
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('CLIENT_ID'), secret = props.getProperty('CLIENT_SECRET');
  if (!id || !secret) return out({ error: 'not_set_up', error_description: 'Add CLIENT_ID and CLIENT_SECRET in Project Settings → Script properties.' });
  var payload = { client_id: id, client_secret: secret };
  if (p.op === 'code' && p.code) { payload.code = p.code; payload.grant_type = 'authorization_code'; payload.redirect_uri = 'postmessage'; }
  else if (p.op === 'refresh' && p.refresh_token) { payload.refresh_token = p.refresh_token; payload.grant_type = 'refresh_token'; }
  else return out({ error: 'bad_request' });
  var r = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', { method: 'post', payload: payload, muteHttpExceptions: true });
  var j = {};
  try { j = JSON.parse(r.getContentText()); } catch (err) { j = { error: 'google_error' }; }
  // only pass back what the apps need
  return out(j.error ? { error: j.error, error_description: j.error_description || '' }
    : { access_token: j.access_token, expires_in: j.expires_in, refresh_token: j.refresh_token || null, scope: j.scope || '' });
}
function doGet() { return out({ ok: true, app: 'PoolDrive stay signed in', ready: !!PropertiesService.getScriptProperties().getProperty('CLIENT_SECRET') }); }
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
