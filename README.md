## Docker + Traefik Deployment

This project is containerized for production using a multi-stage build (Node build -> lightweight Node static server via `serve`). A sample `compose.yaml` with Traefik labels is provided to expose the site at `https://racfella.racfathers.io`.

### Files Added

- `Dockerfile` – Builds the static Vite bundle, serves it with `serve` on port 4173.
- `compose.yaml` – Service definition with Traefik labels.
- `.dockerignore` – Reduces build context.

### Traefik Assumptions

- External Docker network named `proxy` exists (create with `docker network create proxy` if not).
- Traefik listens on entrypoint `websecure` and has a certresolver named `le`.

Adjust labels if your Traefik config differs.

### Build-Time Secret (Encryption Key)

The app uses `VITE_ENCRYPTION_KEY` at build time (it is baked into the final JS bundle). If this value must remain secret, consider an alternative runtime injection strategy (e.g. fetching from a secure endpoint) because any user can view built front-end code.

### Quick Start

1. Export the required build arg:

```sh
export VITE_ENCRYPTION_KEY="choose-a-strong-passphrase"
```

2. (Optional) Create Traefik network if missing:

```sh
docker network create proxy
```

3. Build & start:

```sh
docker compose up -d --build
```

4. Access: https://racfella.racfathers.io

### Local Test Without Traefik

```sh
docker build -t ethist-front .
docker run --rm -p 8080:4173 ethist-front
```

Then open http://localhost:8080.

### Modifying API Proxy

If backend host changes, update the proxy in `vite.config.ts` for dev. In production (static hosting) calls go directly from browser to the specified API origin; if you need to hide it, front it with Traefik middleware or a dedicated backend.

### Runtime Config (Optional Enhancement)

If you later need runtime (not build-time) secrets, add a small script that injects `window.__APP_CONFIG__` from environment variables mounted as a config map / file, and reference that instead of `import.meta.env` for those keys.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

## Client-side encryption

This app encrypts emotions client-side before storing on-chain and decrypts on read using AES-GCM via the Web Crypto API.

Setup:

- Copy `.env.example` to `.env`.
- Set `VITE_ENCRYPTION_KEY` to a strong secret passphrase. Do not commit your real `.env`.

Caution: If the key changes, previously stored emotions may not be readable by this app. Rotate with care.
You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
