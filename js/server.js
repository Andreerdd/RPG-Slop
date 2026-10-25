const express = require('express');
const path = require('path');
const session = require('express-session');
const { sequelize, User, Character } = require('./database');
const { onUserLogin, onUserRegister, getCurrentUser } = require('./account')

const { askGemini } = require('./llm.js');
const providers = { gemini: askGemini };

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, '../public');

app.set('view engine', 'ejs');
app.set('views', publicDir);

app.use('/css', express.static(path.join(publicDir, 'css')));
app.use('/img', express.static(path.join(publicDir, 'img')));
app.use(express.static(publicDir));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Cada navegador recebe um cookie com o id da sua sessão; quem está logado fica em req.session.userId
app.use(session({
  secret: '626F6C736F6E61726F666C6176696F66756465727365766169',
  resave: false,
  saveUninitialized: false
}));

// rotas [rota, nome da página, título]
const pages = [
  ['/', 'lobby', 'Lobby'],
  ['/personagem', 'personagem', 'Criar personagem'],
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
    const currentUserId = getCurrentUser(req);
    if (route === '/personagem' && !currentUserId) return res.redirect('/login');

    const currentUser = currentUserId ? await User.findByPk(currentUserId) : null;
    const characters = route === '/' && currentUserId
      ? await Character.findAll({ where: { createdByUserId: currentUserId }, order: [['createdAt', 'DESC']] })
      : [];

    res.render(pageName, {
      title,
      pageName,
      reqQuery: req.query,
      currentUser,
      characters,
    });
  });
});

app.post('/personagem', async (req, res) => {
  const currentUserId = getCurrentUser(req);
  if (!currentUserId) return res.redirect('/login');

  const { name, appearance, characterClass } = req.body;
  const classOptions = ['Explorador', 'Guardião', 'Técnico', 'Médico', 'Livre'];
  const attributeNames = ['forca', 'agilidade', 'intelecto', 'vigor'];
  const attributes = Object.fromEntries(attributeNames.map((attribute) => [attribute, Number(req.body[attribute])]));
  const validAttributes = Object.values(attributes).every((value) => Number.isInteger(value) && value >= 1 && value <= 20);

  if (!name?.trim() || name.trim().length > 100 || !appearance?.trim() || appearance.trim().length > 2000 ||
      !classOptions.includes(characterClass) || !validAttributes) {
    return res.redirect('/personagem?erro=campos');
  }

  await Character.create({
    name: name.trim(),
    appearance: appearance.trim(),
    attributes: { classe: characterClass, ...attributes },
    createdByUserId: currentUserId,
  });

  return res.redirect('/?personagem=criado');
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



// rotas para LLM
app.post("/api/chat", async (req, res) => {
  const { message, provider = "gemini" } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "mensagem vazia!" });
  }

  const ask = providers[provider];
  if (!ask) return res.status(400).json({ error: "provider inválido!" });

  try {
    res.json({ reply: await ask(message) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "erro na solicitação para a LLM!" });
  }
});