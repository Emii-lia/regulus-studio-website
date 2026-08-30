# Regulus Studio — Site vitrine

Site statique (HTML/CSS/JS, aucune dépendance de build) reproduisant la maquette validée du cahier des charges.

## Structure
```
index.html
css/style.css
js/script.js
assets/
```

## Formulaire de contact
Le formulaire pointe déjà vers Formspree : `https://formspree.io/f/xjyvkqwp`.
Pour changer de compte/formulaire, éditer l'attribut `action` du `<form id="contact-form">` dans `index.html`.

## Adresse email de contact
Le lien « Écrire par email » utilise `contact.regulusstudio@gmail.com`.

## Déploiement (Netlify, recommandé par le cahier des charges)
1. Créer un compte sur netlify.com
2. "Add new site" → "Deploy manually" → glisser-déposer le dossier `Website/`
3. Une fois le nom de domaine réservé (ex. via un registrar comme Namecheap/OVH), le brancher dans Netlify : Site settings → Domain management → Add custom domain
4. Netlify fournit le HTTPS automatiquement (exigé au §4.4 du cahier des charges)

## Tester en local
Ouvrir `index.html` directement dans un navigateur, ou lancer un petit serveur local :
```
python3 -m http.server 8000
```
puis ouvrir http://localhost:8000
