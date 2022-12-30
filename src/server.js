const express = require("express");
const auth = require("./routes/auth");
const conta = require("./routes/conta");
var cors = require("cors");

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "*");
  app.use(cors());
  next();
});

app.use(express.json());
app.use(auth);
app.use(conta);

app.listen(7412, () => console.log("Server is running..."));
