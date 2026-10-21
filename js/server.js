const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, '../public');

app.set('view engine', 'ejs');
app.set('views', publicDir);

app.use('/css', express.static(path.join(publicDir, 'css')));
app.use('/img', express.static(path.join(publicDir, 'img')));
app.use(express.static(publicDir));

// Vetor de páginas no formato [link, nome da página, título]
const pages = [
  ['/', 'index', 'RPG Slop'],
  ['/exemplo', 'exemplo', 'Exemplo'],
  ['/lobby', 'lobby', 'Lobby'],
];

pages.forEach(([route, pageName, title]) => {
  app.get(route, (req, res) => {
    res.render(pageName, { title, pageName });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
