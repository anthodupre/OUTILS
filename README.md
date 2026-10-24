# OUTILS

## `glissades/index.html` — Info terrain, Glissades des Pays d'en Haut

Tableau de bord pour les employés qui travaillent dehors aux Glissades. Il ne montre pas la météo brute (MétéoMédia la donne déjà). Il en tire des informations pour la journée sur le terrain, sans dire aux employés comment faire leur travail. Tout tient sur un seul écran de téléphone, sans défilement. C'est un seul fichier sans dépendance, à coller dans Koder ou à ouvrir dans un navigateur.

**Écran principal** (texte lisible sans zoomer, clair le jour et sombre la nuit)
- **Vitesse de glisse** : carte colorée selon la glisse estimée avec la météo, avec tendance, facteurs en cause et niveau par secteur (bout de chou, débutant, intermédiaire, expert). Elle donne aussi l'heure par heure : glisse, température et neige ou pluie.
- **Zones** : les 13 zones avec leur vitesse estimée (plus rapide pour les zones expertes).
- **À noter** : conditions prévues sur les pistes et les équipements, par importance (pistes glacées, couloirs qui se recouvrent, neige soufflée, glace sur les tapis roulants, rafales au télérafting, noirceur, fabrication de neige).
- **Déneigement** : niveau faible, moyen ou élevé, neige tombée et prévue, verglas ou regel, poudrerie.
- **Ressenti** : maintenant et pire de la journée, temps avant gelure, heures où le ressenti atteint −28 ou moins, min et max.
- **Journée** : temps avant la fermeture ou l'ouverture, horaire, achalandage prévu, noirceur, conditions de fabrication de neige pour la nuit qui vient (de la fermeture à l'ouverture du lendemain).
- Toucher une carte ouvre son panneau de détail.

**Barre du bas** : 24 h (heure par heure détaillé), Radar (animé, dernière heure autour du Domaine), Chrono (km/h par zone), Alertes d'Environnement Canada. Une pastille météo en haut ouvre le détail de la météo.

**Réglages ⚙** : thème, taille du texte, fréquence d'actualisation. Le bouton **DEV** demande le code `BURGER` et ouvre le mode test : scénarios simulés, réglages fins, voyage dans le temps, diagnostic des sources.

**Aucun entretien prévu** : l'horaire est un horaire type de saison, calqué sur 2026-2027 et répété chaque année. Les dates de la relâche sont approximatives pour les saisons suivantes. L'état ouvert ou fermé vient du site du Domaine. Sources gratuites, sans clé : Open-Meteo, Environnement et Changement climatique Canada (GeoMet) et le site du Domaine (état des zones seulement).
