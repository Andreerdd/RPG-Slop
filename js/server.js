const express = require('express');
const path = require('path');
const { sequelize, User } = require('./database');
const { onUserLogin, onUserRegister, getCurrentUser } = require('./account')

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, '../public');

app.set('view engine', 'ejs');
app.set('views', publicDir);

app.use('/css', express.static(path.join(publicDir, 'css')));
app.use('/img', express.static(path.join(publicDir, 'img')));
app.use(express.static(publicDir));
app.use(express.urlencoded({ extended: false }));

// rotas [rota, nome da página, título]
const pages = [
  ['/', 'lobby', 'Lobby'],
  ['/login', 'login', 'Acessar Conta'], // cadastro e login na mesma página
  ['/sala', 'sala', 'Sala X'],
  ['/teste-llm', 'teste-llm', 'Teste LLM'],
  ['/teste-lmm', 'teste-lmm', 'Teste LMM']
];

// Vetor de rotas POST no formato [link, função que lidará com a requisição]
const postRoutes = [
  ['/create-account', onUserRegister],
  ['/login', onUserLogin],
];

// "Automatiza" os GET requests
pages.forEach(([route, pageName, title]) => {
  app.get(route, async (req, res) => {
    const currentUserId = getCurrentUser();
    const currentUser = currentUserId ? await User.findByPk(currentUserId) : null;

    res.render(pageName, {
      title,
      pageName,
      reqQuery: req.query,
      currentUser,
    });
  });
});

// "Automatiza" os POST requests
postRoutes.forEach(([route, handler]) => {
  app.post(route, (req, res) => {
    handler(req, res);
  });
});


async function startServer() {
  await sequelize.authenticate();
  await sequelize.sync();

  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Erro ao inicializar o banco de dados:', error);
  process.exitCode = 1;
});
