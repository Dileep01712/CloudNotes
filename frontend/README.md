# CloudNotes Frontend

React + Vite frontend for CloudNotes — fast, mobile-first UI with secure auth integrations and folder/note management.

## Tech stack
- React (TypeScript) + Vite
- Tailwind CSS
- React Router DOM
- React Context API for state

## Quickstart

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Run development server (hot reload):

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

4. Preview the production build:

```bash
npm run preview
```

See scripts in [frontend/package.json](frontend/package.json).

## Environment

Create a `.env` or `.env.local` in the `frontend` folder for runtime config. Common values used by this project:

- `VITE_API_URL` — base URL for the backend API (e.g. `http://localhost:5000`).

If you prefer, configure a dev proxy in [frontend/vite.config.ts](frontend/vite.config.ts).


## Key features (summary)

- Silent token refresh and centralized auth handling (HTTP-only refresh cookies + access tokens).
- OTP-based signup and password-recovery flows integrated into the UI.
- Real-time note composing with word count and auto-resize.
- Trash / restore flows for notes and folders with soft-delete semantics.
- Responsive grid and workspace UI components for fast navigation.

## Production notes & recommendations

- Set `VITE_API_URL` to your production backend (HTTPS) and ensure CORS is configured on the backend to allow your origin.
- Build with `npm run build` and serve the `dist` output using a static host (Netlify, Vercel, static S3 + CloudFront, etc.).
- Keep auth cookies secure by using HTTPS and setting proper cookie attributes on the backend (`secure`, `sameSite` as appropriate).
- Audit third-party packages and update dependencies periodically (see `devDependencies` and `dependencies` in [frontend/package.json](frontend/package.json)).
