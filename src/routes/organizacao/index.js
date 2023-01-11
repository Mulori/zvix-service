const route = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const md5 = require("md5");
const jwt = require("jsonwebtoken");
const middleware = require("../../middlewares/auth");
const e = require("express");

route.use(middleware);

route.get("/api/v1/organizacao/conta/:id", async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).send("Solicitação Incorreta.");
  }

  const org = await prisma.organizacao.findFirst({
    where: { conta_codigo: parseInt(id) },
  });

  if (!org) {
    return res.status(404).send("Você não possui nenhuma organização.");
  }

  console.log(org);

  await prisma.organizacao
    .findMany({ where: { conta_codigo: parseInt(id) } })
    .then((e) => {
      return res.status(200).send(e);
    })
    .catch((e) => {
      return res.status(500).send("Ocorreu um erro ao listar as organizações.");
    });
});

route.post("/api/v1/organizacao", async (req, res) => {
  const { conta_codigo, nome, codigo_tipo_controle } = req.body;

  var now = new Date();
  now.setHours(now.getHours() - 3);

  if (!conta_codigo || !nome || !codigo_tipo_controle) {
    return res.status(400).send("Solicitação Incorreta.");
  }

  const conta = await prisma.conta.findFirst({
    where: { codigo: parseInt(conta_codigo) },
  });

  if (!conta) {
    return res
      .status(404)
      .send("Nenhuma conta foi encontrada com o ID informado.");
  }

  if (nome.trim().length < 10) {
    return res
      .status(403)
      .send("O nome da organização não pode conter menos que 10 caracteres.");
  }

  const org = await prisma.organizacao.findFirst({
    where: { nome: nome.trim() },
  });

  if (org) {
    return res
      .status(404)
      .send("Já existe uma organização com o nome informado.");
  }

  if (codigo_tipo_controle !== 1) {
    return res
      .status(404)
      .send("Nenhum controle foi encontrado com o código informado.");
  }

  await prisma.organizacao
    .create({
      data: {
        conta_codigo: parseInt(conta_codigo),
        nome: nome.trim(),
        codigo_tipo_controle: parseInt(codigo_tipo_controle),
        cadastrado: now,
        alterado: now,
      },
    })
    .then((e) => {
      return res.status(200).send("Organização criada com sucesso!");
    })
    .catch(() => {
      return res.status(500).send("Ocorreu um erro inesperado.");
    });
});

module.exports = route;
