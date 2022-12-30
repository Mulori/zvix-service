module.exports = function (texto, size) {
  var ret = "";

  if (size > texto.length) {
    ret = texto.substring(0, texto.length);
  } else {
    ret = texto.substring(0, size);
  }

  return ret;
};
