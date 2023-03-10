const express = require("express");
const auth = require("./routes/auth");
const conta = require("./routes/conta");
const organizacao = require("./routes/organizacao");
const controle = require("./routes/controle");
var cors = require("cors");

const app = express();

//Liberar o Cors
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
    return res.status(200).json({});
  }
  next();
});

app.use(express.json());
app.use(auth);
app.use(conta);
app.use(organizacao);
app.use(controle);

app.listen(process.env.PORT || 52451, () =>
  console.log("O Serviço ZVIX está em execução...")
);
