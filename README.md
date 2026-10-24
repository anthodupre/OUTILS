# OUTILS

## `glissades/index.html` — Info terrain, Glissades des Pays d'en Haut

Tableau de bord pour les employés qui travaillent dehors. Tout tient sur un seul écran de téléphone, sans défilement. C'est un seul fichier, sans dépendance : on le colle dans Koder (aperçu HTML) ou on l'ouvre dans un navigateur.

**Sur l'écran principal**
- **Maintenant** : température, refroidissement éolien, vent et rafales, humidité, visibilité, min/max.
- **Vitesse de glisse (officielle)** : lue en direct sur le site du Domaine. On y voit Tube, Rafting, Tornade, Bobsleigh et Vortex360, plus les pistes et les remontées ouvertes.
- **Glisse prévue (météo)** : indice estimé de 0 à 100 (Lente / Modérée / Rapide / Très rapide / Glacée). Il tient compte de la température, de la neige fraîche, du regel, du verglas et du soleil, et donne la tendance des 8 prochaines heures.
- **Déneigement** : neige tombée en 6 h et en 24 h, neige prévue en 12 h avec l'heure de début, verglas, regel, poudrerie, et l'action suggérée (OK / À PRÉVOIR / REQUIS).
- **Froid · sécurité** : risque de gelure selon Environnement Canada, pauses de réchauffement selon l'ACGIH, pire ressenti des 12 prochaines heures, UV.
- **Horaire · soleil** : horaire 2026-2027, temps avant la fermeture, coucher du soleil et éclairage, conditions pour la fabrication de neige (bulbe humide).
- Une bande des 8 à 16 prochaines heures et l'état des 13 zones (pistes ouvertes et couleur de vitesse).
- Les alertes d'Environnement Canada et les signaux terrain sous forme de pastilles.

**Boutons** : Radar animé de la dernière heure (ECCC), Chrono de descente (km/h par zone, journal sur l'appareil), Prévisions texte d'Environnement Canada, Alertes. Toucher une tuile ouvre son détail.

**Réglages ⚙** : thème auto selon le soleil, clair ou sombre ; taille du texte ; fréquence d'actualisation. Le bouton **DEV** demande le code `BURGER` et ouvre le mode test : scénarios simulés (tempête, verglas, −34 °C, redoux, poudrerie…), réglages fins, voyage dans le temps et diagnostic des sources.

**Sources** (gratuites, sans clé) : API WordPress du site du Domaine, Open-Meteo, Environnement et Changement climatique Canada (GeoMet : page-ville Saint-Sauveur, alertes, radar), fond de carte Esri. Si Open-Meteo ne répond pas, l'outil se rabat sur Environnement Canada, puis sur les dernières données en cache.

L'horaire de la saison est dans la constante `HORAIRE` au début du script. Il faut la mettre à jour chaque saison.
