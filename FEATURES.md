# Nouvelles fonctionnalités ajoutées

## 1. Bouton de postulation

Un bouton de postulation a été ajouté pour permettre aux utilisateurs de postuler directement aux offres d'emploi. Ce bouton utilise les informations de contact fournies par l'API France Travail.

### Fonctionnalités du bouton de postulation

- **Postulation directe** : Lorsqu'une offre dispose d'une URL de postulation, le bouton redirige l'utilisateur vers cette URL.
- **Affichage des informations de contact** : Si aucune URL de postulation n'est disponible, mais que des informations de contact sont présentes (email, téléphone), ces informations sont affichées dans une fenêtre modale pour permettre à l'utilisateur de contacter le recruteur.
- **Intégration** : Le bouton est intégré à la fois dans la carte d'offre d'emploi (version compacte) et dans la page de détails de l'offre (version détaillée).

### Comment postuler

Lorsqu'une offre contient des informations de contact, les utilisateurs peuvent :
- Cliquer sur le bouton "Postuler" pour accéder directement au formulaire de candidature si disponible
- Contacter le recruteur par email ou téléphone via les informations affichées
- Consulter les commentaires et instructions supplémentaires fournis par le recruteur

## 2. Affichage enrichi des données

La page de détails d'une offre a été enrichie pour afficher plus d'informations provenant de l'API France Travail :

### Informations supplémentaires affichées

- **Qualification** : Niveau de qualification requis (cadre, non-cadre)
- **Accessibilité** : Indication si l'offre est accessible aux travailleurs handicapés
- **Contexte de travail** : Horaires et conditions d'exercice
- **Informations sur l'entreprise** : Description, site web, taille
- **Compétences** : Compétences requises avec indication si elles sont exigées ou souhaitées
- **Formations** : Niveau de formation et domaine avec indication si exigé ou souhaité
- **Langues et permis** : Langues et permis requis avec indication si exigés ou souhaités
- **Informations géographiques** : Lien vers Google Maps pour visualiser l'emplacement
- **Détails du salaire** : Compléments de rémunération
- **Indicateurs de tension** : Badge pour les offres difficiles à pourvoir

## Installation et utilisation

Les nouvelles fonctionnalités sont intégrées dans le code existant et ne nécessitent pas de configuration supplémentaire.

Pour utiliser ces fonctionnalités, il suffit de :

1. Installer les dépendances
2. Lancer l'application en mode développement avec `npm run dev`
3. Ou déployer en production avec Docker
