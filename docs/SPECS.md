# MakeYourMeme — Spécifications complètes

Party game mobile multijoueur de création de memes, inspiré de « Make it Meme ».
L'objectif n'est pas d'être bon en dessin, mais de trouver la **meilleure punchline** à partir d'une image imposée.

---

## 1. Principe général

Boucle d'une manche :

1. Chaque joueur reçoit une image/template de meme (avec un thème dans le mode Topics).
2. Il écrit une légende ou un texte humoristique (texte haut / texte bas).
3. Le temps de création est limité.
4. Les memes de tous les joueurs sont présentés **un par un**.
5. Les joueurs votent sur les memes des autres : 👍 bon / 👎 mauvais / 😐 meh.
6. Les votes déterminent les points gagnés ou perdus (le score peut devenir négatif).
7. Chaque joueur peut avoir attribué son **Meme Buddy** à un autre joueur avant la révélation.
8. Après plusieurs manches, le joueur avec le meilleur score remporte la partie.

Résumé en 8 étapes : **Lobby → Manche → Template → Création → Vote → Meme Buddy → Points → Manche suivante**, puis classement final et gagnant.

---

## 2. Parties publiques et privées

- **Partie publique** : rejoindre un lobby ouvert avec d'autres joueurs.
- **Partie privée** : l'hôte crée un lobby et partage un **code de partie** (ex. `K4TZ`) ou un **lien d'invitation** rejoignable depuis le navigateur ou l'app.
- Un lobby peut accueillir **jusqu'à 30 joueurs**.
- Aucun compte n'est requis pour jouer ; le compte permet stats persistantes, amis, succès et création de contenus personnalisés.

---

## 3. Création du meme

- La manche attribue un template de meme (image + zones texte haut/bas).
- Exemple : image d'un homme qui regarde son téléphone l'air paniqué → « Moi quand je vois "Vu à 14h32" ».
- Durée de création : **90 s par défaut**, réglable par l'hôte entre **30 et 300 s**.

---

## 4. Phase de vote

- Memes affichés **un par un** à tous les joueurs.
- Temps de vote par meme : **15 s par défaut**, adaptable au nombre de joueurs.
- Un joueur **ne vote pas pour son propre meme**.
- Les votes n'élisent pas simplement un gagnant : chaque appréciation influence le score.

---

## 5. Système de points

Valeurs par défaut (constantes serveur, ajustables) :

| Vote | Effet |
|------|-------|
| 👍 drôle | **+20 pts** |
| 😐 meh | 0 pt |
| 👎 mauvais | **−20 pts** |

- Le score d'un joueur peut être **négatif**.
- Après la manche : écran de résultats avec les memes et le classement des gains.

---

## 6. Meme Buddy

- **Pendant la phase de création**, chaque joueur peut attribuer son Meme Buddy à **un autre joueur** (pari sur le meme qui va cartonner).
- Après le décompte des votes : le donateur gagne **la moitié des points** obtenus par le meme de son buddy :
  - Paul finit avec +40 → le buddy de Paul gagne +20.
  - Le bonus s'applique aussi aux **points négatifs** (risque/perte).
- Dimension stratégique : réussir son meme **et** anticiper celui qui plaira au groupe.

---

## 7. Fin de partie

-nombre de manches : **3 par défaut**, personnalisable en partie privée.
- Après la dernière manche : **classement final**, le meilleur score gagne.
- Écran gagnant + possibilité de rejouer.

---

## 8. Les 4 modes de jeu

| Mode | Description |
|------|-------------|
| 🟢 **Normal** | Chaque joueur reçoit un **template différent** et crée sa propre légende. |
| 🔵 **Topics** | Chaque manche a un **thème imposé** (contrainte supplémentaire pour orienter les blagues). |
| 🟣 **Same Meme** | Tout le monde reçoit **exactement le même template** ; la comparaison se fait sur la légende. |
| 🟡 **Relaxed** | Pas de score, pas de classement compétitif : création et amusement libres. |

---

## 9. Meme Packs

- Templates regroupés par collections : tendances, anime, gaming, etc.
- Les joueurs choisissent activement les packs utilisés dans une partie.
- (Plus tard / premium) : créer et partager ses propres packs.

---

## 10. Profil et progression

- Pseudo, avatar personnalisable.
- Succès, statistiques, historique de progression.
- **Meme Studio** : transformer ses propres images en templates.

---

## 11. Monétisation

- Cœur du jeu **gratuit**.
- Achats intégrés / abonnement optionnels : personnalisation, packs personnalisés, fonctionnalités supplémentaires, absence de publicité.

---

## 12. Jouer entre amis

- **Même pièce** : chacun sur son téléphone → même code de lobby → jeu simultané.
- **À distance** : lobby privé → partage du code/lien → tout le monde joue depuis son téléphone (+ appel Discord).
- Interopérable : iPhone / Android / navigateur PC dans le **même lobby**.

Pour cette raison, le MVP est livré en **application web mobile-first** (PWA-ready) : jouable immédiatement sur tout téléphone via le navigateur, partageable par lien.

---

## 13. Roadmap par phases (développement incrémental)

### Phase 1 — MVP multijoueur jouable ✅ (cette itération)
- Serveur temps réel : lobbies privés avec code (jusqu'à 30 joueurs), hôte, reconnect minimal.
- Boucle complète : manche → création chronométrée (90 s, réglable 30–300) → vote meme par meme (15 s) → points (+20 / 0 / −20) → résultats.
- **Meme Buddy** (choisi pendant la création, bonus/malus 50 %).
- Les **4 modes de jeu** : Normal, Topics, Same Meme, Relaxed.
- Classement final et écran gagnant, bouton « Jouer encore ».
- Templates v1 : cartes illustrées intégrées (pas d'images protégées), prêtes à être remplacées par de vraies images.

### Phase 2 — Contenus et templates
- Vraies images de templates (Meme Packs : tendances, anime, gaming), packs sélectionnables à l'entrée du lobby.
- Pool de thèmes Topics étoffé.

### Phase 3 — Récupération & robustesse
- Reprise de partie après déconnexion/rafraîchissement (rejoin par token de session).
- Parties publiques + matchmaking, partage par lien d'invitation.
- Anti-spam / modération du texte.

### Phase 4 — Comptes et progression
- Comptes, pseudos persistés, avatars, succès, statistiques, historique.
- Meme Studio (créer ses templates), packs personnalisés.

### Phase 5 — Monétisation et store
- Achats intégrés, abonnement, versions stores (PWA → Capacitor/React Native).

---

## 14. Architecture du MVP

- **Backend** : Node.js + Express + Socket.IO (`server.js` / `src/game.js`).
  - État de partie autoritaire côté serveur, phases pilotées par timeouts serveur.
  - Événements socket : `createGame`, `joinGame`, `updateSettings`, `startGame`, `submitMeme`, `chooseBuddy`, `castVote`, `nextGame`, `leaveGame`.
  - Codes de lobby à 4 lettres ; une partie est détruite quand l'hôte part ou après inactivité.
- **Frontend** : client mobile-first vanilla HTML/CSS/JS (`public/`), un socket par joueur.
- **Templates** : catalogue JS (`src/templates.js`) avec rendu visuel (couleurs, emoji, texte haut/bas). Remplacement par de vraies images prévu en Phase 2.
