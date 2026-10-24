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
 * @returns {Promise<object>} usuário criado
 */
async function createUser(displayName, username, password) {
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
        displayName,
        username,
        passwordHash
    });

    return user;
}

/**
 * Confere as credenciais de login e autentica o usuário na sessão da requisição.
 * @param req request do node
 * @param {string} username nome de usuário
 * @param {string} password senha sem hash
 * @returns {Promise<Boolean>} se conseguiu autenticar
 */
async function authenticateUser(req, username, password) {
    const user = await User.findOne({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return false;
    }

    await forceAuthenticateUser(req, user);

    return true;
}

/**
 * Define o usuário dado como autenticado na sessão da requisição, sem fazer verificações.
 * A sessão é recriada para que o id antigo (de antes do login) não continue valendo.
 * @param req request do node
 * @param user usuário que será autenticado
 * @return {Promise<void>}
 */
function forceAuthenticateUser(req, user) {
    return new Promise((resolve, reject) => {
        req.session.regenerate((error) => {
            if (error) return reject(error);

            req.session.userId = user.id;
            req.session.save((error) => error ? reject(error) : resolve());
        });
    });
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

        const user = await createUser(nomeregistro, usuarioregistro, senharegistro);

        if (!user)
            return res.status(500).json({ type: 'error', code: 'erro-servidor' });

        // Por mais que tenha acabado de criar a conta, em algum caso muito específico
        // a senha, por exemplo, já pode ter sido alterada
        await authenticateUser(req, usuarioregistro, senharegistro);

        return res.json({ type: 'success', redirect: '/' });
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
        const user = await authenticateUser(req, usuariologin, senhalogin);
        if (!user)
            return res.status(401).json({ type: 'error', code: 'credenciais' });


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

/**
 * Retorna o id do usuário logado na sessão da requisição.
 * @param req request do node
 * @return {string|null} o id do usuário logado ou null.
 */
function getCurrentUser(req) {
    return req.session.userId || null;
}

module.exports = {
    onUserRegister,
    onUserLogin,

    getCurrentUser
};