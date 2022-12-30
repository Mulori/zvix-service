module.exports = function (val) {
  var text = "";
  text = val;
  return text
    .replace(".", "")
    .replace("-", "")
    .replace("/", "")
    .replace(".", "")
    .replace("_", "")
    .replace(",", "");
};
