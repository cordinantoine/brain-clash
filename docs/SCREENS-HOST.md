# Brain Clash — Écrans hôte (TV / plateau)

Récapitulatif visuel exhaustif de l'interface hôte (`index.html`), capturée à 1920 × 1080 (résolution native de design).

## Régénérer les captures

```
cd scripts/screens-host
npm install           # première fois seulement (puppeteer-core)
node shot.js          # serveur "Brain Clash (Host)" doit tourner sur :8080
```

Les 33 PNG dans `docs/screens-host/` sont écrasés à chaque exécution.

Légende :
- ✅ refondu (cockpit néon)
- 🕗 à refondre

---

## 0. Accueil ✅

Logo Brain Clash, deux CTA (créer une partie / rejoindre), stats, joystick décoratif.

![](screens-host/00-accueil.png)

---

## 1. Création de partie — étape 1/3 ✅

Choix du nombre max de joueurs (2 à 8).

![](screens-host/01-create-1-joueurs.png)

---

## 2. Création — étape 2/3 ✅

Mode de jeu + thèmes.

**Mode "Thèmes fixes"** — l'hôte sélectionne les thèmes joués.
![](screens-host/02-create-2-themes-fixed.png)

**Mode "Le dernier choisit"** — pas de sélection, le perdant choisit avant chaque round.
![](screens-host/02b-create-2-themes-last-picks.png)

---

## 3. Création — étape 3/3 ✅

Sélection des rounds de jeu (+ nb de ballons si Tir à la Carabine sélectionné).

![](screens-host/03-create-3-rounds.png)

---

## 4. Salle d'attente ✅

Code de salle, loadout (thèmes + rounds), slots joueurs, boutons.

![](screens-host/04-lobby.png)

---

## 5. Chargement 🕗

Entre lobby et premier round, pendant le chargement des questions.

![](screens-host/05-loading.png)

---

## 6. Intro de round — présentation ✅

Avant chaque round, sidebar des joueurs (avec leur état PRÊT), carte centrale décrivant le round.

![](screens-host/06-intro-presentation.png)

---

## 7. Intro de round — Picker (mode "le dernier choisit") ✅

Le joueur en dernière position choisit thème + difficulté sur son téléphone, le plateau affiche les choix en cours.

![](screens-host/07-intro-picker.png)

---

## 8. Intro de round — Décompte ✅

3 → 2 → 1 → GO juste avant de lancer le round.

![](screens-host/08-intro-decompte.png)

---

## 9. Question ✅

Plateau TV en cours de question : carte question, 4 réponses A/B/C/D, sidebar classement, timer, barre élim (si carton/patate). 4 variantes par type de round.

**9a. QCM / Buzzer / Steal** — version standard avec timer.
![](screens-host/09-question.png)

**9b. Chrono** — version standard (timer affiché tant que non révélé).
![](screens-host/09b-question-chrono.png)

**9c. Tir à la Carabine (carton)** — barre `elimbar` au-dessus avec ballons 🎈 par joueur et 💀 pour les éliminés.
![](screens-host/09c-question-carton.png)

**9d. Patate Chaude** — barre `elimbar` indiquant le porteur 🥔, header "MANCHE N/4", pas de timer.
![](screens-host/09d-question-patate.png)

---

## 10. Question — révélation ✅

Quatre variantes selon le résultat.

**10a. Bonne réponse trouvée** — réponse révélée en vert, scorer mis en avant, anecdote.
![](screens-host/10-question-revelation.png)

**10b. Personne n'a trouvé** — bonne réponse en vert, bandeau d'échec en rouge.
![](screens-host/10b-question-revelation-personne.png)

**10c. Temps écoulé** — aucune réponse, indicateur `⏱️ Temps écoulé !`.
![](screens-host/10c-question-revelation-timeout.png)

**10d. Buzz en cours** (round buzzer, avant révélation) — "🔔 X répond…" affiché pendant que le buzzer répond.
![](screens-host/10d-question-buzz-en-cours.png)

---

## 11–16. Écran intermédiaire

Affiché 4,5 s entre chaque question. Layout 2 colonnes : scores à gauche (avatar + nom + score, encadré néon), résultat à droite encadré d'une bordure LED animée.

### 11. QCM ✅

Design néon "reveal" : headline ✓/✗ avec lettre de la bonne réponse, bloc gagnants (cartes médaille avec avatar + gain), anecdote "💡 LE SAVIEZ-VOUS ?".

**11a. Gagnants** — un ou plusieurs joueurs ont trouvé.
![](screens-host/11-inter-qcm.png)

**11b. Personne n'a trouvé** — bandeau rouge "PERSONNE N'A TROUVÉ", aucun point distribué.
![](screens-host/11b-inter-qcm-personne.png)

---

### 12. Buzzer 🕗

Avatar du vainqueur en grand, nombre de points remportés, bonne réponse + anecdote.

**12a. Vainqueur** — un joueur a buzzé puis répondu correctement.
![](screens-host/12-inter-buzzer.png)

**12b. Temps écoulé** — personne n'a buzzé à temps (ou tous ont buzzé out).
![](screens-host/12b-inter-buzzer-timeout.png)

---

### 13. Chrono 🕗

Classement de la question par rapidité (🥇/🥈/🥉), points par joueur, bonne réponse.

![](screens-host/13-inter-chrono.png)

---

### 14. Steal 🕗

Voleur et victime côte à côte avec avatars, points volés (+X / -X), bonne réponse.

**14a. Vol réussi** — un joueur a bien répondu et vole des points à un autre.
![](screens-host/14-inter-steal.png)

**14b. Personne n'a trouvé** — aucune réponse correcte, pas de vol.
![](screens-host/14b-inter-steal-personne.png)

---

### 15. Patate Chaude 🕗

🥔 passage entre les manches, 💥 BOOM lors de l'explosion finale.

**15a. Explosion** — fin de manche, le porteur perd des points.
![](screens-host/15-inter-patate.png)

**15b. Passe** — un joueur passe la patate à un autre.
![](screens-host/15b-inter-patate-passe.png)

---

### 16. Tir à la Carabine ✅

Design "cinte" : chip de round, headline kicker, liste des joueurs avec ballons 🎈 restants et badges (TIREUR / -1 BALLON / ÉLIMINÉ / CIBLE ? / SURVIVANT), bonne réponse.

**16a. Tir réussi** — le tireur crève un ballon adverse.
![](screens-host/16-inter-carton.png)

**16b. Picking** — le tireur a bien répondu, il est en train de choisir sa cible sur son téléphone (badges "CIBLE ?" sur les joueurs visables).
![](screens-host/16b-inter-carton-picking.png)

**16c. Ricochet (tir sur soi-même)** — mauvaise réponse, le tireur perd un de ses propres ballons.
![](screens-host/16c-inter-carton-self.png)

**16d. Temps écoulé** — personne n'a appuyé sur la gâchette.
![](screens-host/16d-inter-carton-timeout.png)

**16e. Dernier debout** — un seul joueur reste avec des ballons → il remporte le round.
![](screens-host/16e-inter-carton-survivor.png)

---

## 17. Classement entre rounds 🕗

Affiché brièvement entre 2 rounds avant le suivant.

![](screens-host/17-scoreboard.png)

---

## 18. Classement final 🕗

Fin de partie — lauriers dorés, confettis, feux d'artifice, bouton retour à l'accueil.

![](screens-host/18-final.png)
