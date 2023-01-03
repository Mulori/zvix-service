const route = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
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

module.exports = route;
