const Web3 = require("web3");
const web3 = new Web3(require("./config/provider").providerAddr);
const transformData = require("./utils/transformData");
const { getDbInstance } = require("./db");

async function getTransactions(addr) {
  if (!web3.utils.isAddress(addr)) throw new Error("not a valid address");
  const code = await web3.eth.getCode(addr);
  if (code.length > 2) throw new Error("contract address is not acceptable");
  //get db instance
  const mongodb = getDbInstance();
  const db = mongodb.db("myproject");
  const collection = db.collection("transactions");
  //get start timestamp
  let start = Date.now();
  //get needed data from db
  console.log("begin query database");
  let maxBlockNumber;
  const fromResult = await collection
    .find({ from: addr })
    .collation({ locale: "en", strength: 2 })
    .toArray();
  if (fromResult.length !== 0)
    maxBlockNumber = fromResult[fromResult.length - 1].blockNumber;
  const toResult = await collection
    .find({ to: addr })
    .collation({ locale: "en", strength: 2 })
    .toArray();
  if (toResult.length !== 0)
    toResult[toResult.length - 1].blockNumber > maxBlockNumber
      ? (maxBlockNumber = toResult[toResult.length - 1].blockNumber)
      : "";
  const transferCode = "0xa9059cbb000000000000000000000000";
  const inputData = transferCode + addr.toLowerCase().substr(2);
  const inputResult = await collection
    .find({
      input: eval("/^" + inputData + "/")
    })
    .toArray();
  if (inputResult.length !== 0)
    inputResult[inputResult.length - 1].blockNumber > maxBlockNumber
      ? (maxBlockNumber = inputResult[inputResult.length - 1].blockNumber)
      : "";
  let end = Date.now();
  console.log("finish query database, time spent(ms): ", end - start);
  //transform data to what we need
  const result = fromResult.concat(toResult).concat(inputResult);
  const finalRes = await transformData(result);
  //give back in a form of json
  return [finalRes, maxBlockNumber];
}

module.exports = getTransactions;
