const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth");

module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).send({ error: "Token não informado." });

  const parts = token.split(" ");

  if (!parts.length === 2)
    return res.status(401).send({ error: "Token incorreto." });

  const [scheme, auth] = parts;

  if (!/^Bearer$/i.test(scheme))
    return res.status(401).send({ error: "Token mal-formado." });

  jwt.verify(auth, authConfig.secret, (error, decode) => {
    if (error) return res.status(401).send({ error: "Token inválido." });

    req.codigo_conta = decode.id;
    req.cpf_cnpj_conta = decode.cpf_cnpj;
    return next();
  });
};
