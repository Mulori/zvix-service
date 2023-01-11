const route = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
var md5 = require("md5");
const authConfig = require("../../config/auth");
const validated = require("../../middlewares/validCpfCnpj");
const removeFormatacao = require("../../middlewares/removerFormatacao");
const mid = require("../../middlewares/mid");
const validator = require("email-validator");

function GenerateToken(param = {}) {
  return jwt.sign({ param }, authConfig.secret);
}

route.post("/api/v1/signup", async (req, res) => {
  const { nome, sobrenome, email, nomeUsuario, senha } = req.body;

  var now = new Date();
  now.setHours(now.getHours() - 3);

  if (!nome || !sobrenome || !email || !nomeUsuario || !senha)
    return res.status(400).send("Solicitação incorreta.");

  if (!validator.validate(email)) {
    return res.status(401).send("O e-mail informado não é valido.");
  }

  if (senha.length < 6) {
    return res.status(401).send("A senha deve conter no minimo 6 caracteres.");
  }

  if (nomeUsuario.length < 6) {
    return res
      .status(401)
      .send("O nome de usuário deve conter no minimo 6 caracteres.");
  }

  const conta_email = await prisma.conta.findFirst({
    where: {
      email: email,
    },
  });

  if (conta_email) {
    return res.status(401).send("O e-mail informado já está em uso.");
  }

  const conta = await prisma.conta.findFirst({
    where: {
      nome_usuario: nomeUsuario,
    },
  });

  if (conta) {
    return res.status(401).send("O nome de usuário já está em uso.");
  }

  await prisma.conta
    .create({
      data: {
        nome: mid(nome, 80),
        sobrenome: mid(sobrenome, 80),
        email: mid(email, 200),
        nome_usuario: mid(nomeUsuario, 50),
        chave: md5(senha),
        cadastrado: now,
        alterado: now,
      },
    })
    .then((e) => {
      return res.status(200).send({
        codigo: e.codigo,
        nome: e.nome,
        sobrenome: e.sobrenome,
        email: e.email,
        nome_usuario: e.nome_usuario,
        cadastrado: e.cadastrado,
        token: GenerateToken({ id: e.id, email: e.email }),
      });
    })
    .catch((e) => {
      console.log(e);
      return res
        .status(500)
        .send("Ocorreu um problema ao incluir a nova conta.");
    });
});

route.post("/api/v1/signin", async (req, res) => {
  const { email, senha } = req.body;

  if (!email) {
    return res.status(400).send("Informe o e-mail.");
  }

  if (!validator.validate(email)) {
    return res.status(401).send("O e-mail informado não é valido.");
  }

  if (!senha) {
    return res.status(400).send("Informe a senha.");
  }

  const conta = await prisma.conta.findFirst({
    select: {
      codigo: true,
      nome: true,
      sobrenome: true,
      email: true,
      nome_usuario: true,
      cadastrado: true,
    },
    where: {
      email: email.trim(),
      chave: md5(senha),
    },
  });

  if (!conta) {
    return res.status(400).send("E-mail e/ou senha incorretos.");
  }

  return res.status(200).send({
    conta: conta,
    token: GenerateToken({ id: conta.id, email: conta.email }),
  });
});

module.exports = route;
