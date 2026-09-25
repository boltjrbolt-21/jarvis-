# Pont Apple pour Jarvis

Jarvis est une application web. iOS interdit à une page web de lire directement les données privées de Calendrier et Rappels. Le raccourci compagnon **Jarvis Calendrier** sert de pont local : iOS affiche les autorisations, exécute l'action sur l'iPhone, puis renvoie uniquement le résultat demandé à Jarvis.

## Installation

1. Ouvrir l'app **Raccourcis** sur l'iPhone et créer un raccourci nommé `Jarvis Calendrier`.
2. Régler le raccourci pour recevoir du **Texte**.
3. Ajouter **Obtenir le dictionnaire à partir de l'entrée**.
4. Lire les valeurs `action` et `payload` du dictionnaire.
5. Ajouter des blocs **Si** pour les actions décrites ci-dessous.
6. À la fin de chaque branche, créer le texte JSON de résultat, appliquer **Encoder l'URL**, l'ajouter après la valeur `callback_url`, puis exécuter **Ouvrir les URL**.
7. Au premier essai, autoriser l'accès à Calendrier et Rappels.

Dans Jarvis, ouvrir **Réglages › Calendrier et rappels Apple**, vérifier que le nom est identique, puis toucher **Tester le pont Calendrier**.

## Entrée envoyée par Jarvis

```json
{
  "version": 1,
  "action": "list_events",
  "payload": {
    "from": "2026-09-25T00:00",
    "to": "2026-09-26T00:00"
  },
  "requested_at": "2026-09-25T18:00:00.000Z"
}
```

## Actions à gérer

| `action` | Action Raccourcis à utiliser | Champs de `payload` |
|---|---|---|
| `ping` | Aucun changement, renvoyer une confirmation | aucun |
| `create_event` | Ajouter un nouvel événement | `title`, `start`, `duration_minutes`, `alert_minutes_before`, `location`, `notes` |
| `list_events` | Rechercher les événements du calendrier | `from`, `to` |
| `update_event` | Rechercher puis modifier l'événement choisi | `search`, puis champs à modifier |
| `delete_event` | Rechercher, demander confirmation, supprimer | `search`, `from`, `to` |
| `create_reminder` | Ajouter un nouveau rappel | `title`, `due`, `notes`, `priority` |
| `list_reminders` | Rechercher les rappels | `list`, `include_completed` |
| `update_reminder` | Rechercher puis modifier, terminer ou supprimer | `search`, `operation`, autres champs |

Pour une recherche donnant plusieurs résultats, utiliser **Choisir dans la liste**. Pour une suppression, utiliser **Choisir dans le menu** afin de demander confirmation.

## Sortie attendue

Une réussite :

```json
{"ok":true,"action":"list_events","items":[{"id":"…","title":"Cours","start":"2026-09-26T09:00:00+02:00","end":"2026-09-26T11:00:00+02:00","location":"UFR Santé","notes":""}]}
```

Une erreur :

```json
{"ok":false,"action":"list_events","error":"Calendrier non autorisé"}
```

Le lancement utilise `shortcuts://run-shortcut`. Le raccourci rouvre ensuite Jarvis avec son résultat dans le fragment `#jarvis_callback=…`. Le fragment n'est pas envoyé au serveur GitHub Pages.

## Confidentialité

- Les autorisations Calendrier et Rappels restent gérées par iOS.
- Jarvis ne reçoit que le résultat de l'action demandée.
- Un résultat lu doit être transmis au modèle choisi pour que Jarvis puisse le reformuler oralement.
- Les fichiers audio sont conservés localement dans le stockage du navigateur. Seule leur transcription est envoyée au modèle lorsqu'on touche **Résumé + tâches**.
