// Relais DeepSeek pour Cloudflare Workers (gratuit).
// À utiliser seulement si « Tester la connexion » dit que DeepSeek est injoignable depuis Safari.
// 1. dash.cloudflare.com > Workers & Pages > Create > Worker > colle ce fichier > Deploy.
// 2. Copie l'adresse du worker (https://xxx.workers.dev) dans Réglages > Adresse de l'API DeepSeek.
// Ta clé DeepSeek n'est pas stockée ici : Jarvis l'envoie à chaque appel.
//
// Trois verrous (les en-têtes CORS seuls n'empêchent pas un script ou un robot d'utiliser le relais) :
// - seule l'origine de Jarvis est acceptée, et une requête sans Origin (hors navigateur) est refusée ;
// - seuls les chemins utiles à Jarvis sont relayés ;
// - une clé « Bearer » est exigée.

const ALLOWED_ORIGIN = "https://boltjrbolt-21.github.io";
const ALLOWED_PATHS = new Set(["/chat/completions", "/v1/chat/completions", "/models", "/v1/models"]);

const cors = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin",
};

const deny = (status, message) =>
  new Response(JSON.stringify({ error: { message } }), { status, headers: { ...cors, "Content-Type": "application/json" } });

export default {
  async fetch(request) {
    if (request.headers.get("Origin") !== ALLOWED_ORIGIN) return deny(403, "Origine refusée");
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    const url = new URL(request.url);
    if (!ALLOWED_PATHS.has(url.pathname)) return deny(404, "Chemin non relayé");
    if (!["GET", "POST"].includes(request.method)) return deny(405, "Méthode refusée");

    const auth = request.headers.get("Authorization") || "";
    if (!/^Bearer \S{10,}$/.test(auth)) return deny(401, "Clé API manquante");

    const upstream = await fetch("https://api.deepseek.com" + url.pathname, {
      method: request.method,
      headers: { "Authorization": auth, "Content-Type": "application/json" },
      body: request.method === "GET" ? undefined : request.body,
    });
    const headers = new Headers(upstream.headers);
    for (const [k, v] of Object.entries(cors)) headers.set(k, v);
    return new Response(upstream.body, { status: upstream.status, headers });
  },
};
