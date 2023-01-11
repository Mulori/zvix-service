const route = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const md5 = require("md5");
const jwt = require("jsonwebtoken");
const middleware = require("../../middlewares/auth");
const e = require("express");

route.use(middleware);

route.get("/api/v1/controle", async (req, res) => {
  await prisma.tipo_controle
    .findMany()
    .then((e) => {
      return res.status(200).send(e);
    })
    .catch((e) => {
      return res.status(500).send("Ocorreu um erro ao listar os controles.");
    });
});

module.exports = route;
