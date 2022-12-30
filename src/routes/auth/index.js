const route = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
var md5 = require("md5");
const authConfig = require("../../config/auth");
const validated = require("../../middlewares/validCpfCnpj");
const removeFormatacao = require("../../middlewares/removerFormatacao");
const mid = require("../../middlewares/mid");

function GenerateToken(param = {}) {
  return jwt.sign({ param }, authConfig.secret, {
    expiresIn: 86400,
  });
}

route.post("/api/v1/signup", async (req, res) => {
  const { cpfCnpj, nomeOrganizacao, nomeCompleto, nomeUsuario, senha } =
    req.body;

  var now = new Date();
  now.setHours(now.getHours() - 3);

  if (!cpfCnpj || !nomeOrganizacao || !nomeCompleto || !nomeUsuario || !senha)
    return res.status(400).send("Solicitação incorreta.");

  if (!validated(cpfCnpj)) {
    return res.status(401).send("CPF ou CNPJ não é válido.");
  }

  if (senha.length < 6) {
    return res.status(401).send("A senha deve conter no minimo 6 caracteres.");
  }

  const org = await prisma.organizacao.findFirst({
    where: {
      cpf_cnpj: removeFormatacao(cpfCnpj),
    },
  });

  if (org) {
    return res.status(401).send("CPF ou CNPJ já está cadastrado.");
  }

  const conta = await prisma.conta.findFirst({
    where: {
      nome_usuario: nomeUsuario,
    },
  });

  if (conta) {
    return res.status(401).send("Nome de usuário já está em uso");
  }

  await prisma.organizacao
    .create({
      data: {
        cpf_cnpj: removeFormatacao(cpfCnpj),
        nome: mid(nomeOrganizacao, 150),
      },
    })
    .then(async (e_org) => {
      await prisma.conta
        .create({
          data: {
            nome: mid(nomeCompleto, 200),
            cpf_cnpj: e_org.cpf_cnpj,
            nome_usuario: mid(nomeUsuario, 50),
            chave: md5(senha),
            type: 1,
            cadastrado: now,
            alterado: now,
          },
        })
        .then((e) => {
          return res.status(200).send({
            codigo: e.codigo,
            cpf_cnpj: e.cpf_cnpj,
            nome: e.nome,
            nome_usuario: e.nome_usuario,
            cadastrado: e.cadastrado,
            tipo: e.type,
            token: GenerateToken({ id: e.id, cpf_cnpj: e.cpf_cnpj }),
          });
        })
        .catch((e) => {
          console.log(e);
          return res
            .status(500)
            .send("Ocorreu um problema ao incluir a nova conta.");
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
  const { cpf_cnpj, nome_usuario, senha } = req.body;

  console.log(req.body);

  if (!cpf_cnpj || !nome_usuario || !senha) {
    return res.status(400).send("Solicitação Incorreta");
  }

  const conta = await prisma.conta.findFirst({
    select: {
      codigo: true,
      nome: true,
      nome_usuario: true,
      cadastrado: true,
      alterado: true,
      type: true,
    },
    where: {
      cpf_cnpj: cpf_cnpj,
      nome_usuario: nome_usuario,
      chave: senha,
    },
  });

  if (!conta) {
    return res
      .status(400)
      .send(
        "Usuário não encontrado. Verifique as credenciais e tente novamente."
      );
  }

  return res.status(200).send({
    conta: conta,
    token: GenerateToken({ id: conta.id, cpf_cnpj: conta.cpf_cnpj }),
  });
});

module.exports = route;
