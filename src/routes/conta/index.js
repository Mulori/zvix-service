const route = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const middleware = require("../../middlewares/auth");

route.use(middleware);

route.get("/api/v1/ok", async (req, res) => {
  return res.status(200).send("OK");
});

module.exports = route;
