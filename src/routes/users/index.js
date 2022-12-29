const route = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

route.get("/conta", (req, res) => {
  prisma.conta
    .findMany({})
    .then((result) => {
      return res.status(200).json(result);
    })
    .catch((error) => {
      return res.status(500).json(error);
    });
});

module.exports = route;
