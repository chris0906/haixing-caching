const Web3 = require("web3");
const web3 = new Web3(require("./config/provider").providerAddr);
const transformData = require("./utils/transformData");
const { getDbInstance } = require("./db");
const addrManager = require("./utils/addrManager");

async function getTransactions(addr, maxBlockNumber) {
  if (!web3.utils.isAddress(addr)) throw new Error("not a valid address");
  //get db instance
  const mongodb = getDbInstance();
  const db = mongodb.db("myproject");
  const collection = db.collection("transactions");
  //get start timestamp
  let start = Date.now();
  //get needed data from db
  console.log(
    `begin query database for ${addrManager.getAddrLabel(addr)} address:${addr}`
  );
  console.log(
    "heapUsed:",
    Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100
  );
  const projection = {
    _id: 0,
    from: 1,
    to: 1,
    timestamp: 1,
    value: 1,
    input: 1,
    blockHash: 1
  };
  const fromResult = await collection
    .find({ from: addr, blockNumber: { $gt: maxBlockNumber } }, projection)
    .collation({ locale: "en", strength: 2 })
    .toArray();
  console.log(
    "after search from, heapUsed:",
    Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100
  );
  const toResult = await collection
    .find({ to: addr, blockNumber: { $gt: maxBlockNumber } }, projection)
    .collation({ locale: "en", strength: 2 })
    .toArray();
  console.log(
    "after search to, heapUsed:",
    Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100
  );
  const transferCode = "0xa9059cbb000000000000000000000000";
  const inputData = transferCode + addr.toLowerCase().substr(2);
  const inputResult = await collection
    .find(
      {
        input: eval("/^" + inputData + "/"),
        blockNumber: { $gt: maxBlockNumber }
      },
      projection
    )
    .toArray();
  console.log(
    "after search input, heapUsed:",
    Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100
  );
  let end = Date.now();
  console.log("finish query database, time spent(ms): ", end - start);
  //transform data to what we need
  const result = fromResult.concat(toResult).concat(inputResult);
  console.log(
    "after allocate final big array to stack area, heapUsed:",
    Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100
  );
  if (result.length === 0) return null;

  let max = 0;
  for (let i = 0; i < result.length; i++) {
    if (result[i].blockNumber > max) max = result[i].blockNumber;
  }

  const finalRes = await transformData(result);
  console.log(
    "after transform data, heapUsed:",
    Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100
  );
  //give back in a form of json
  return [finalRes, max];
}

module.exports = getTransactions;
