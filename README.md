# OpenWeb Search Engine

Un moteur de recherche moderne et sécurisé avec une interface élégante inspirée des dernières tendances du web.

## 🌟 Fonctionnalités

- 🔍 Recherche web avec filtrage intelligent
- 🖼️ Recherche d'images avec prévisualisation
- 🔒 Sécurité renforcée contre les contenus malveillants
- 🎨 Interface utilisateur moderne et réactive
- 🌙 Mode sombre natif
- 📱 Design responsive

## 🛠️ Technologies

- HTML5 / CSS3
- JavaScript (ES6+)
- Node.js
- Express.js
- Cheerio (pour le web crawling)

## 🚀 Pour commencer

### Fork et Installation

1. Forkez le repository en cliquant sur le bouton "Fork" en haut à droite de la page GitHub
2. Clonez votre fork
```bash
git clone https://github.com/votre-username/OpenWeb.git
cd OpenWeb
```

3. Ajoutez le repository original comme remote
```bash
git remote add upstream https://github.com/original-owner/OpenWeb.git
```

4. Installez les dépendances
```bash
npm install
```

5. Lancez le projet
```bash
npm start
```

### Rester à jour

Pour maintenir votre fork à jour avec le repository principal :
```bash
git fetch upstream
git checkout main
git merge upstream/main
```

## 🔧 Configuration

### Crawler

Modifiez le fichier `initCrawler.js` pour ajouter vos URLs :

```javascript
const sitesToCrawl = [
    'https://votre-site.com',
    'https://autre-site.com'
];
```

### Sécurité

Le moteur intègre plusieurs couches de sécurité :
- Filtrage des domaines malveillants
- Protection contre le contenu NSFW
- Vérification des URLs HTTPS
- Protection contre les attaques XSS
- En-têtes de sécurité

## 📝 Licence

MIT License

## 🤝 Contribution

1. Assurez-vous d'avoir un fork à jour
2. Créez une nouvelle branche pour votre fonctionnalité
```bash
git checkout -b feature/ma-nouvelle-feature
```
3. Committez vos changements
```bash
git add .
git commit -m "Description détaillée de vos changements"
```
4. Poussez vers votre fork
```bash
git push origin feature/ma-nouvelle-feature
```
5. Ouvrez une Pull Request depuis votre fork vers le repository principal

## 🔮 Fonctionnalités à venir

- [ ] Support multilingue
- [ ] Recherche avancée
- [ ] Mode shopping
- [ ] API publique
- [ ] Suggestions en temps réel

## 📞 Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue ou à nous contacter directement.

## ⭐ Soutenez le projet

Si vous trouvez ce projet utile, n'hésitez pas à lui donner une étoile sur GitHub !
