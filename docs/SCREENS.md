# Brain Clash — Écrans joueur

Récapitulatif visuel exhaustif de l'interface joueur (`player.html`), capturée sur viewport mobile 375 × 812 @ 2x.

## Régénérer les captures

```
cd scripts/screens
npm install           # première fois seulement (puppeteer-core)
node shot.js          # serveur "Brain Clash (Player)" doit tourner sur :8081
```

Les 35 PNG dans `docs/screens/` sont écrasés à chaque exécution.

Légende :
- ✅ refondu (cockpit néon)
- 🕗 à refondre

---

## 1. Rejoindre 🕗

État initial — saisie prénom + code + sélection d'avatar.

![](screens/01-rejoindre.png)

---

## 2. Salle d'attente 🕗

Après avoir rejoint, en attente du lancement par l'hôte.

![](screens/02-salle-attente.png)

---

## 3. Écran de jeu

Cadre permanent (header round + timer + bande de scores) avec un contenu interchangeable selon la phase et le type de round.

### 3a. Buzzer ✅

Round `buzzer` — gros bouton circulaire rose pulsant. Question affichée au-dessus.

![](screens/03a-buzzer.png)

### 3b. Réponses ✅

Grille 2×2 des réponses A/B/C/D — cartes néon, étincelles animées, pastille lumineuse.

**État initial (en cours)**
![](screens/03b-reponses-idle.png)

**Réponse sélectionnée** — au tap, halo blanc pulsant + bandeau « RÉPONSE ENVOYÉE ✓ ». Visible pour les rounds buzzer/patate où le joueur reste sur la grille avant la révélation.
![](screens/03b-reponses-selectionnee.png)

**Révélation** — bonne réponse en vert avec badge `✓ BONNE`, mauvaise en rouge avec badge `✗ FAUX`, autres atténuées.
![](screens/03b-reponses-revelation.png)

**Patate — porteur** — variante avec en-tête « Tu as la patate ! » et la même grille en dessous.
![](screens/03b-patate-porteur.png)

### 3c. Attente 🕗 *(état polyvalent)*

Le `state-waiting` sert pour de nombreux moments de pause. Chaque variante a son propre contenu textuel.

**PRÊT** — avant chaque round, bouton READY.
![](screens/03c-attente-pret.png)

**Picker (toi tu choisis) — étape 2 (difficulté)** — mode "le dernier choisit", après avoir choisi un thème.
![](screens/03c-attente-picker.png)

**Picker (toi tu choisis) — étape 1 (thème)** — grille des thèmes proposés.
![](screens/03c-attente-picker-themes.png)

**Picker — un autre joueur choisit** — vue non-picker, en attente que l'autre choisisse.
![](screens/03c-attente-picker-autre.png)

**Décompte** — 3 → 2 → 1 → GO.
![](screens/03c-attente-decompte.png)

**Réponse envoyée** — pour les rounds QCM-style (qcm/chrono/steal/carton), une fois ta réponse envoyée.
![](screens/03c-attente-reponse-envoyee.png)

**Un autre buzze** — pendant qu'un autre joueur répond (round buzzer).
![](screens/03c-attente-autre-buzz.png)

**Un autre choisit sa cible** — round steal/carton, en attente que l'autre choisisse.
![](screens/03c-attente-autre-choisit-cible.png)

**Éliminé** — éliminé de la manche en cours (carton).
![](screens/03c-attente-elimine.png)

**Patate — non porteur** — quelqu'un d'autre a la patate.
![](screens/03c-attente-patate-autre.png)

**Patate — BOOM** — explosion en fin de manche, vue par tous les joueurs.
![](screens/03c-attente-patate-boom.png)

### 3d. Résultat 🕗

Affiché après la révélation pour les rounds buzzer/patate.

**Bonne réponse**
![](screens/03d-resultat-bon.png)

**Mauvaise réponse**
![](screens/03d-resultat-mauvais.png)

**Temps écoulé**
![](screens/03d-resultat-temps-ecoule.png)

### 3e. Buzz raté 🕗

Round buzzer, tu as buzzé puis donné une mauvaise réponse — tu ne peux plus rejouer cette question.

![](screens/03e-buzz-rate.png)

### 3f. Scores 🕗

Classement entre rounds.

![](screens/03f-scores.png)

### 3g. Final 🕗

Classement de fin de partie, avec bouton retour à l'accueil.

![](screens/03g-final.png)

### 3h. Écran intermédiaire

Affiché 4,5 s entre chaque question. Une variante par type de round.

**QCM ✅** — médaille néon ✓/✗ personnalisée : bonne/mauvaise réponse, gain, série de bonnes réponses (🔥 SÉRIE × N), carte "bonne réponse était", décompte SVG 4,5 s.
![](screens/03h-inter-qcm.png)

**Buzzer — vainqueur 🕗** — un joueur a buzzé en premier et donné la bonne réponse.
![](screens/03h-inter-buzzer.png)

**Buzzer — buzz raté (toi)** — tu as buzzé puis donné la mauvaise réponse : panneau `RÉSULTAT` + `-X pts ❌` + rappel de la bonne réponse. C'est aussi la vue affichée si tu n'as pas buzzé pendant que quelqu'un d'autre l'a fait sans trouver.
![](screens/03h-inter-buzzer-rate.png)

**Buzzer — personne n'a buzzé** — temps écoulé sans aucun buzz : panneau `RÉSULTAT` + `⏱️ Temps écoulé` + bonne réponse révélée.
![](screens/03h-inter-buzzer-timeout.png)

**Chrono 🕗**
![](screens/03h-inter-chrono.png)

**Steal 🕗**
![](screens/03h-inter-steal.png)

**Patate 🕗** (explosion)
![](screens/03h-inter-patate.png)

**Carton 🕗** — chip résultat personnel (score, ballons restants), bonne réponse révélée.
![](screens/03h-inter-carton.png)

### 3i. Choisir une cible ✅

Round steal ou carton — après avoir bien répondu, tu choisis sur qui voler / tirer. Style cockpit néon : viseur animé en en-tête, carte cible avec avatar, ballons, réticule ; bouton TIRER/VOLER verrouillé tant qu'aucune cible n'est sélectionnée.

**Steal**
![](screens/03i-choisir-cible-steal.png)

**Carton**
![](screens/03i-choisir-cible-carton.png)

### 3j. Classement Chrono 🕗

Round chrono — classement par rapidité après la révélation.

![](screens/03j-classement-chrono.png)
