// Relais DeepSeek pour Cloudflare Workers (gratuit).
// À utiliser seulement si « Tester la connexion » dit que DeepSeek est injoignable depuis Safari.
// 1. dash.cloudflare.com > Workers & Pages > Create > Worker > colle ce fichier > Deploy.
// 2. Copie l'adresse du worker (https://xxx.workers.dev) dans Réglages > Adresse de l'API DeepSeek.
// Ta clé DeepSeek n'est pas stockée ici : Jarvis l'envoie à chaque appel.

const ALLOWED_ORIGIN = "*"; // mets ton adresse GitHub Pages (https://boltjrbolt-21.github.io) pour restreindre

const cors = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    const url = new URL(request.url);
    const upstream = await fetch("https://api.deepseek.com" + url.pathname + url.search, {
      method: request.method,
      headers: {
        "Authorization": request.headers.get("Authorization") || "",
        "Content-Type": "application/json",
      },
      body: request.method === "GET" ? undefined : request.body,
    });
    const headers = new Headers(upstream.headers);
    for (const [k, v] of Object.entries(cors)) headers.set(k, v);
    return new Response(upstream.body, { status: upstream.status, headers });
  },
};
