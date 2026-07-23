# Marc Portfolio

Portfolio profesional y blog técnico construido con Astro y TypeScript. La aplicación se genera como un sitio estático y se sirve desde una imagen Nginx reproducible.

## Desarrollo

```sh
npm ci
npm run codegraph:init
npm run dev
```

La verificación completa del repositorio es:

```sh
npm run verify
```

## Entrega

Las pull requests hacia `main` ejecutan `CI / Verify`. Después de un merge, GitHub Actions vuelve a verificar el commit y publica en GHCR una imagen candidata identificada por el SHA del commit y por su digest inmutable.

El workflow no despliega producción. La promoción de un digest aprobado pertenece a una capa operativa privada y separada del repositorio público.

Consulta [`ops/ci-candidates.md`](ops/ci-candidates.md) para el contrato de CI y candidatos.
