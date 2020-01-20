const fs = require("fs");
const token = JSON.parse(
  fs.readFileSync(__dirname + "/../erc/ethToken.json", "utf-8")
);
const tokenData = [];
for (let i = 0; i < token.length; i++) {
  const address = token[i].address.toLowerCase();
  tokenData[address] = token[i];
}

function getTokenLength() {
  return Object.getOwnPropertyNames(tokenData).length;
}

function getDecimals(address) {
  const obj = tokenData[address.toLowerCase()];
  if (obj) return obj.decimal;
  else return null;
}

function getSymbol(address) {
  const obj = tokenData[address.toLowerCase()];
  if (obj) return obj.symbol;
  else return null;
}

module.exports = { getDecimals, getSymbol, tokenData, getTokenLength };
