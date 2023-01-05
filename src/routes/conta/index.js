const route = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const md5 = require("md5");
const jwt = require("jsonwebtoken");
const middleware = require("../../middlewares/auth");

route.use(middleware);

route.get("/api/v1/ok", async (req, res) => {
  return res.status(200).send("OK");
});

route.get("/api/v1/conta/:id", async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).send("Nenhum ID informado.");
  }

  await prisma.conta
    .findFirst({
      select: {
        codigo: true,
        nome: true,
        cpf_cnpj: true,
        nome_usuario: true,
        cadastrado: true,
        alterado: true,
        type: true,
      },
      where: {
        codigo: parseInt(id),
      },
    })
    .then((data) => {
      return res.status(200).json(data);
    })
    .catch(() => {
      return res.status(500).send("Ocorreu um erro inesperado.");
    });
});

route.put("/api/v1/conta/:id/atualizarinformacao", async (req, res) => {
  const { id } = req.params;
  const { nomeCompleto, nomeUsuario } = req.body;

  if (!id) {
    return res.status(400).send("Nenhum ID informado.");
  }

  if (!nomeCompleto || !nomeUsuario) {
    return res.status(400).send("Solicitação Incorreta.");
  }

  const ret_nome_usuario = await prisma.conta.findFirst({
    where: { NOT: { codigo: parseInt(id) }, nome_usuario: nomeUsuario },
  });

  if (ret_nome_usuario) {
    return res
      .status(401)
      .send("Já existe uma conta com este nome de usuário.");
  }

  const user_conta = await prisma.conta.findFirst({
    where: { codigo: parseInt(id) },
  });

  if (!user_conta) {
    return res.status(400).send("Nenhuma conta com o ID informado.");
  }

  await prisma.conta
    .update({
      where: {
        codigo: parseInt(id),
      },
      data: {
        nome: nomeCompleto,
        nome_usuario: nomeUsuario,
      },
    })
    .then(() => {
      return res.status(200).send("Alterado com suceso!");
    })
    .catch((e) => {
      console.log(e);
      return res
        .status(200)
        .send(
          "Ocorreu um erro inesperado ao tentar atualizar as informações da conta."
        );
    });
});

route.put("/api/v1/conta/:id/atualizarsenha", async (req, res) => {
  const { id } = req.params;
  const { senhaAntiga, senhaNova, confirmacaoSenhaNova } = req.body;

  if (!id) {
    return res.status(400).send("Nenhum ID informado.");
  }

  if (!senhaAntiga || !senhaNova || !confirmacaoSenhaNova) {
    return res.status(400).send("Solicitação Incorreta.");
  }

  const user_exist = await prisma.conta.findFirst({
    where: { codigo: parseInt(id) },
  });

  if (!user_exist) {
    return res.status(404).send("Nenhuma conta com o ID informado.");
  }

  const user_pass = await prisma.conta.findFirst({
    where: { codigo: parseInt(id), chave: md5(senhaAntiga) },
  });

  if (!user_pass) {
    return res.status(401).send("A senha antiga é invalida.");
  }

  if (senhaNova !== confirmacaoSenhaNova) {
    return res.status(401).send("As senhas não coincidem.");
  }

  if (senhaNova.length < 6) {
    return res
      .status(401)
      .send("As senhas devem conter no minimo 6 caracteres.");
  }

  await prisma.conta
    .update({
      where: { codigo: parseInt(id) },
      data: { chave: md5(senhaNova) },
    })
    .then(() => {
      return res.status(200).send("A senha foi alterada com sucesso!");
    })
    .catch(() => {
      return res
        .status(500)
        .send("Ocorreu um erro inesperado ao alterar a senha da conta.");
    });
});

module.exports = route;
