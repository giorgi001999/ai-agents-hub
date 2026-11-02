# AI Agents Hub

A dark, responsive multi-agent AI workspace built with React, Vite, Express, and Google's Gemini API.

## Included agents

- General Assistant
- Developer Agent
- Writing Agent
- Business Strategist
- Research Agent
- QA Testing Agent

Each agent has its own server-side system instruction. Chat messages are sent to the Express API; the Gemini API key is never exposed to the browser.

## Requirements

- Node.js 20 or newer
- A Gemini API key: https://aistudio.google.com/apikey

## Run locally

```bash
npm install
cp .env.example .env
```

Add your key to `.env`:

```env
GEMINI_API_KEY=your_real_key
GEMINI_MODEL=gemini-2.5-flash
PORT=3001
```

Start both frontend and backend:

```bash
npm run dev
```

Open http://localhost:5173

The Vite dev server proxies no API paths because the Express server is mounted separately in production. For local development, add this proxy to `vite.config.js` if you want same-origin `/api` requests:

```js
server: {
  port: 5173,
  proxy: { "/api": "http://localhost:3001" }
}
```

Then restart `npm run dev`.

## Deploy to Vercel

This project includes `vercel.json` and `api/index.js` so Vercel can serve the Vite build and Express API as a serverless function.

1. Push this folder to a GitHub repository.
2. Sign in to https://vercel.com and choose **Add New → Project**.
3. Import the GitHub repository.
4. Keep the build command as `npm run build` and output directory as `dist` (the included config already sets these).
5. In **Project → Settings → Environment Variables**, add:
   - `GEMINI_API_KEY` = your real Gemini API key
   - `GEMINI_MODEL` = `gemini-2.5-flash` (optional)
6. Deploy. Open the generated `.vercel.app` URL.
7. After changing environment variables, redeploy for changes to take effect.

## Deploy locally / production server

```bash
npm run build
npm start
```

Express serves the API routes. For a traditional Node host, configure it to serve the `dist` directory as static files as well (or add a static middleware before deployment).

## Add or customize agents

Edit `server/agents.js`. Every agent needs a unique `id`, display fields, and a `systemInstruction`. The system instruction stays on the server.

## Security notes

- Never commit `.env` or paste your API key into frontend code.
- `.env` is ignored by Git.
- Add rate limiting and authentication before making this public to prevent API abuse and unexpected usage charges.
- Consider setting usage quotas and monitoring in Google AI Studio / Google Cloud.
- The included chat history is held in browser memory only and resets on refresh.
- CORS is enabled for starter convenience. For a public production app, restrict origins if using a separate API domain.
