function formatHex(str) {
  if (str.startsWith("0x")) {
    return str;
  }

  return "0x" + str;
}

module.exports = {
  formatHex,
};
