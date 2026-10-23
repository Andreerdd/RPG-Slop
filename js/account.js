/**
 * Código responsável por lidar com coisas relacionadas à conta do usuário.
 */

const bcrypt = require('bcrypt');
const { User } = require('./database');

// Quantidade de vezes que o hash será feito
const saltRounds = 10;

/**
 * Cria um usuário e coloca ele dentro do banco de dados.
 * @param {string} displayName nome que será exibido para o usuário
 * @param {string} username nome de usuário para login
 * @param {string} password senha sem hash
 * @param {Boolean} authenticate se deve logar com a conta criada automaticamente
 * @returns {Promise<object>} usuário criado
 */
async function createUser(displayName, username, password, authenticate=false) {
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
        displayName,
        username,
        passwordHash
    });

    if (authenticate) await authenticateUser(username, password);

    return user;
}

/**
 * Confere as credenciais de login.
 * @param {string} username nome de usuário
 * @param {string} password senha sem hash
 * @returns {Promise<object|null>} usuário autenticado ou null
 */
async function authenticateUser(username, password) {
    const user = await User.findOne({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return null;
    }
    console.log("autenticou com sucesso!");
    return user;
}

/**
 * Função chamada quando o usuário tenta registrar uma conta
 * @param req request do node
 * @param res response do node
 */
async function onUserRegister(req, res) {
    const { nomeregistro, usuarioregistro, senharegistro } = req.body;

    if (!nomeregistro || !usuarioregistro || !senharegistro) {
        return res.status(400).json({ type: 'error', code: 'campos' });
    }

    try {
        const usernameUsed = await isUsernameUsed(usuarioregistro);
        if (usernameUsed) {
            return res.status(409).json({ type: 'error', code: 'usuario-em-uso' });
        }

        const user = await createUser(nomeregistro, usuarioregistro, senharegistro, true);

        if (!user)
            return res.status(500).json({ type: 'error', code: 'erro-servidor' });

        return res.json({ type: 'success', redirect: '/' });
        //return res.status(201).json({ type: 'success', code: 'conta-criada' });
    } catch (error) {
        console.error('Erro ao criar conta:', error);
        return res.status(500).json({ type: 'error', code: 'erro-servidor' });
    }
}

/**
 * Função chamada quando o usuário tenta fazer login
 * @param req request do node
 * @param res response do node
 */
async function onUserLogin(req, res) {
    const { usuariologin, senhalogin } = req.body;

    if (!usuariologin || !senhalogin) {
        return res.status(400).json({ type: 'error', code: 'campos' });
    }

    try {
        const user = await authenticateUser(usuariologin, senhalogin);
        if (!user) {
            return res.status(401).json({ type: 'error', code: 'credenciais' });
        }

        return res.json({ type: 'success', redirect: '/' });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        return res.status(500).json({ type: 'error', code: 'erro-servidor' });
    }
}

/**
 * Retorna se o username dado já foi usado.
 * @param {String} username username que se deseja verificar
 * @return {Boolean} isUsed se o username já é utilizado.
 */
async function isUsernameUsed(username) {
    const user = await User.findOne({
        where: {
            username: username
        }
    });
    return !!(user); // not (not (object)) = booleano
}

module.exports = {
    onUserRegister,
    onUserLogin
};