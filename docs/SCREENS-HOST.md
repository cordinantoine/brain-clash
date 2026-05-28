# Brain Clash — Écrans hôte (TV / plateau)

Récapitulatif visuel exhaustif de l'interface hôte (`index.html`), capturée à 1920 × 1080 (résolution native de design).

## Régénérer les captures

```
cd scripts/screens-host
npm install           # première fois seulement (puppeteer-core)
node shot.js          # serveur "Brain Clash (Host)" doit tourner sur :8080
```

Les 20 PNG dans `docs/screens-host/` sont écrasés à chaque exécution.

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

Plateau TV en cours de question : carte question, 4 réponses A/B/C/D, sidebar classement, timer, barre élim (si carton/patate).

![](screens-host/09-question.png)

---

## 10. Question — révélation ✅

Bonne réponse révélée (en vert), buzz indicator si pertinent, anecdote.

![](screens-host/10-question-revelation.png)

---

## 11–16. Écran intermédiaire

Affiché 4,5 s entre chaque question. Layout 2 colonnes : scores à gauche (avatar + nom + score, encadré néon), résultat à droite encadré d'une bordure LED animée.

### 11. QCM ✅

Design néon "reveal" : headline ✓/✗ avec lettre de la bonne réponse, bloc gagnants (cartes médaille avec avatar + gain), aucun gagnant → "PERSONNE N'A TROUVÉ", anecdote "💡 LE SAVIEZ-VOUS ?".

![](screens-host/11-inter-qcm.png)

---

### 12. Buzzer 🕗

Avatar du vainqueur en grand (ou ⏱️ si temps écoulé), nombre de points remportés, bonne réponse + anecdote.

![](screens-host/12-inter-buzzer.png)

---

### 13. Chrono 🕗

Classement de la question par rapidité (🥇/🥈/🥉), points par joueur, bonne réponse.

![](screens-host/13-inter-chrono.png)

---

### 14. Steal 🕗

Voleur et victime côte à côte avec avatars, points volés (+X / -X), bonne réponse.

![](screens-host/14-inter-steal.png)

---

### 15. Patate Chaude 🕗

💥 BOOM si explosion (avatar du perdant, perte de points), ou 🥔 passage de la patate avec indiquation du nouveau porteur.

![](screens-host/15-inter-patate.png)

---

### 16. Tir à la Carabine ✅

Design "cinte" : chip de round, headline kicker (TIR RÉUSSI / RICOCHET RATÉ / EN JOUE… / TEMPS ÉCOULÉ), liste des joueurs avec ballons 🎈 restants et badges (TIREUR / -1 BALLON / ÉLIMINÉ / CIBLE ?), bonne réponse.

![](screens-host/16-inter-carton.png)

---

## 17. Classement entre rounds 🕗

Affiché brièvement entre 2 rounds avant le suivant.

![](screens-host/17-scoreboard.png)

---

## 18. Classement final 🕗

Fin de partie — lauriers dorés, confettis, feux d'artifice, bouton retour à l'accueil.

![](screens-host/18-final.png)
