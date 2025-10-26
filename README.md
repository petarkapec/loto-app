Loto App - simple demo

This repository contains a minimal Express backend (with Prisma) and a simple React frontend (Vite). It's intentionally simple to make it easy to follow.

Structure
- backend/: Express + Prisma
- frontend/: Vite + React

Getting started (locally)

1. Create a Postgres database (you mentioned you already have one on Render). Get the DATABASE_URL.
2. In `backend/`, copy `.env.example` to `.env` and set `DATABASE_URL` and `PUBLIC_BASE_URL`.
3. Install backend deps:

   cd backend
   npm install
   npx prisma generate
   npx prisma migrate dev --name init

4. Install frontend deps and run:

   cd ../frontend
   npm install
   npm run dev

By default the frontend proxies `/api` to `http://localhost:4000` (backend).

Auth0 setup (overview)

We use two types of auth:
- User login (OpenID Connect) for users who buy tickets. Use Auth0 App (Regular Web / Single Page App) and configure allowed callbacks to your frontend URL (e.g. http://localhost:3000).
- Machine-to-machine client (client_credentials) for the admin service that calls `/new-round`, `/close`, and `/store-results`.

Steps (Auth0 dashboard):
1. Create an API in Auth0 Dashboard -> APIs. Set an Identifier (this is the `M2M_AUDIENCE` used by the backend). Enable RS256 signing.
2. Create a Machine-to-Machine Application and authorize it to the API.
   - Note the Client ID and Client Secret. Use these in the external admin application to obtain a token using client_credentials.
3. (Optional) Create an SPA application for users and configure Allowed Callback URLs and Logout URLs.

Backend env vars for Auth0 (put into `backend/.env`):

AUTH0_JWKS_URI=https://YOUR_AUTH0_DOMAIN/.well-known/jwks.json
M2M_AUDIENCE=YOUR_API_IDENTIFIER
M2M_ISSUER=https://YOUR_AUTH0_DOMAIN/

Important notes
- This is a minimal scaffold. For production you must harden security (CORS, HTTPS, token validation for user endpoints, rate limiting, input sanitization, logging, and secrets storage).
- The frontend currently does not perform user login; you can integrate Auth0 SPA SDK to protect the Buy page and attach the user's identity to the ticket creation calls.
