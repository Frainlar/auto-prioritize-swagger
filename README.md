# auto-prioritize-swagger

Minimal Node.js service that analyzes stories and exposes a webhook.

## Endpoints
- `GET /stories` – list sample stories
- `POST /webhook` – analyze a story payload `{ event: "item_added", item: {...} }`
- `GET /docs` – Swagger UI

## Scripts
- `npm start` – start server
- `npm run dev` – start with nodemon
- `npm test` – run placeholder tests
