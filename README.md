# MakeYourMeme 🖼️🎮

Party game mobile multijoueur de création de memes, inspiré de « Make it Meme ».
Pas besoin de savoir dessiner : chaque joueur reçoit un template de meme et doit trouver la meilleure punchline. Ensuite tout le monde vote, et les votes font gagner… ou perdre des points.

## Jouer

```bash
npm install
npm start          # serveur sur http://localhost:3000
```

Chaque joueur ouvre l'URL depuis son téléphone (ou son navigateur PC) :

1. Choisis un pseudo → **Créer une partie privée** (ou rejoins avec un code à 4 caractères).
2. L'hôte règle la partie et lance la manche.
3. **Création** (90 s par défaut) : écris ta punchline et choisis éventuellement ton **Meme Buddy**.
4. **Vote** : memes présentés un par un, 👍 +20 · 😐 0 · 👎 −20.
5. Résultats, classement, manche suivante… puis gagnant final 🏆.

## Modes de jeu

- 🟢 **Normal** — un template différent pour chacun.
- 🔵 **Topics** — un thème imposé par manche.
- 🟣 **Same Meme** — le même template pour tous, seul le texte change.
- 🟡 **Relaxed** — sans scores, juste pour créer et rire.

## Interface

Application web **mobile-first** (max 30 joueurs par salon) : aucun compte requis, jouable depuis n'importe quel navigateur.

## Documentation

- [Spécifications complètes](docs/SPECS.md) — fonctionnalités détaillées et roadmap par phases.

## Stack

- **Backend** : Node.js + Express + Socket.IO (état autoritaire côté serveur).
- **Frontend** : HTML/CSS/JS vanilla, mobile-first.
