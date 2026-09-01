# Autenticador privado de Sveltia CMS

Esta unidad despliega el Worker oficial [`sveltia/sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth) fijado al commit `25f56e1ed4a96cb25fcb96469c9c99fb6d3713bc`. La entrada de Wrangler es `src/index.js`: delega el protocolo OAuth al código oficial vendorizado, sin modificar sus bytes, y solo normaliza el alcance GitHub y los headers de respuesta. `vendor/sveltia-cms-auth/UPSTREAM.json` conserva el repositorio, commit, Git blob y SHA-256; `LICENSE.txt` conserva su licencia MIT. `npm run verify:upstream` comprueba el SHA-256 antes de cualquier uso operativo.

## Contrato

- Dominio del Worker: `https://cms-auth.portfolio.mybrawl.io`.
- Callback OAuth exacto: `https://cms-auth.portfolio.mybrawl.io/callback`.
- Origen autorizado por el Worker: `ALLOWED_DOMAINS=portfolio.mybrawl.io`.
- El CMS usa el backend GitHub de `0865marc/marc-portfolio`, rama `main`, con OAuth y alcance exacto `public_repo`.
- Este Worker no publica el sitio. Los cambios del CMS crean ramas y pull requests; `main` sigue pasando CI, generando solamente un candidato GHCR. La promoción de producción sigue siendo un proceso privado separado por digest.

## Seguridad del wrapper

- Solo las solicitudes `GET /auth` y `GET /oauth/authorize` con `provider=github` y `scope=public_repo,user` se reescriben a `scope=public_repo`. Otros scopes GitHub, ausencia de scope, callbacks y backends no GitHub quedan intactos.
- `GET /user` de GitHub requiere autenticación, pero su respuesta pública no exige el alcance `user`; GitHub reserva ese alcance para datos privados del perfil.
- Todas las respuestas delegadas, incluido el HTML de callback que transporta el token, añaden `Cache-Control: no-store`, `Pragma: no-cache` y `Referrer-Policy: no-referrer`.
- `predeploy` ejecuta `npm run verify:upstream`; el gate raíz también verifica el SHA-256 sin instalar dependencias anidadas.

## Configuración manual única

1. En Cloudflare, asegúrate de que la zona de `portfolio.mybrawl.io` está disponible para Workers.
2. En GitHub, crea una OAuth App con cualquier nombre interno, `Homepage URL` igual a `https://portfolio.mybrawl.io` y `Authorization callback URL` exactamente igual a `https://cms-auth.portfolio.mybrawl.io/callback`.
3. Desde `ops/cms-auth`, instala el lockfile:

   ```sh
   npm ci --no-audit --no-fund
   ```

4. Autentica Wrangler de forma interactiva con una cuenta que pueda administrar esa zona. No se guardan credenciales de Cloudflare en este repositorio.
5. Registra los dos secretos sin imprimirlos ni versionarlos:

   ```sh
   npm exec wrangler secret put GITHUB_CLIENT_ID
   npm exec wrangler secret put GITHUB_CLIENT_SECRET
   ```

6. Revisa el diff de configuración y despliega solo bajo autorización explícita:

   ```sh
   npm run deploy
   ```

7. Confirma en Cloudflare el custom domain y abre `/admin/` del sitio. El login debe abrir GitHub y volver al callback anterior.

## Secretos externos

Solo son necesarios para el Worker los valores emitidos por la OAuth App de GitHub:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

La ruta anterior usa `wrangler login` interactivo y no requiere secretos de Cloudflare. Si se decide ejecutar Wrangler sin interacción desde un entorno externo, ese operador aporta `CF_API_TOKEN` y `CF_ACCOUNT_ID` fuera de este repositorio; no existe automatización de despliegue ni valores de ejemplo aquí.

No uses PATs en el CMS: `public/admin/config.yml` permite únicamente OAuth. El acceso efectivo lo decide GitHub mediante permisos de escritura en el repositorio.
