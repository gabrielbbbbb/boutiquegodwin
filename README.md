# Boutique-Godwin Informatique — version catalogue

## Tester sous Windows
Le catalogue utilise `fetch()` pour lire `data/products.json`. Il doit être lancé avec un serveur HTTP local.
Dans VS Code, ouvrez un terminal à la racine du projet puis lancez :
```bash
python -m http.server 8000
```
Ouvrez ensuite `http://localhost:8000`.

## Structure
- `index.html` : vitrine publique
- `product.html` : fiche détaillée d'un produit avec galerie multi-images
- `data/products.json` : catalogue public
- `assets/css/style.css` : design responsive bleu premium
- `assets/js/app.js` : catalogue, recherche et filtres
- `assets/js/product.js` : galerie de photos sur la fiche produit
- `assets/images/boutique-godwin-logo.png` : logo fourni
- `admin-local/` : espace d'administration local à développer

## Règle des images
Chaque produit doit avoir au minimum 3 images dans son tableau `images`. Il n'y a pas de maximum fixé.
Les produits de démonstration sont des exemples : vérifiez et remplacez leurs photos, prix et informations avant publication.

## GitHub Pages
Publiez `index.html`, `product.html`, `assets/` et `data/`.
Ne publiez pas `admin-local/`. Le fichier `.gitignore` aide à éviter son ajout accidentel, mais vérifiez toujours les fichiers avant un push.
