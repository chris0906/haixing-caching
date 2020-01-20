const fs = require("fs");

function appendToTokenJson(path, address, symbol, decimal) {
  const data = fs.readFileSync(path, "utf-8");
  const length = data.length;
  const insertData =
    data.slice(0, length - 3) +
    `,\n  {\n    \"address\": \"${address}\",\n    \"symbol\": \"${symbol}\",\n    \"decimal\": ${decimal},\n    \"type\": \"default\"\n  }` +
    data.slice(length - 3, length);

  fs.writeFileSync(path, insertData, "utf-8");
}

function writeToTokenJson(path, tokenObj) {
  const beginData = "[\n  ";
  const endData = "\n]\n";
  let middleData = "";
  // const length = Object.getOwnPropertyNames(tokenObj).length;
  for (let key in tokenObj) {
    middleData += `{\n    "address": "${key}",\n    "symbol": "${tokenObj[key].symbol}",\n    "decimal": ${tokenObj[key].decimal},\n    "type": "default"\n  },\n  `;
  }
  let finalData = beginData + middleData + endData;
  finalData =
    finalData.slice(0, finalData.length - 7) +
    finalData.slice(finalData.length - 3, finalData.length);
  fs.writeFileSync(path, finalData);
}

module.exports = { appendToTokenJson, writeToTokenJson };
