const assert = require("assert");
const { getTempDbInstance } = require("./db");
const getTransactions = require("./getTransactions");
const addrManager = require("./utils/addrManager");
const tempInstance = getTempDbInstance();
const db = tempInstance.db("address");
const { getTokenLength, tokenData } = require("./utils/abiMethods");
const { writeToTokenJson } = require("./utils/addToTokenJson");
let initialTokenLength = getTokenLength();

async function cachingBigAddrTransactions() {
  const bigAddr = addrManager.getAddr();
  const addrToBlock = addrManager.getAddrToBlock();
  for (let key in bigAddr) {
    await getDifferentTransactions("from", key, bigAddr[key], addrToBlock[key]);
    await getDifferentTransactions("to", key, bigAddr[key], addrToBlock[key]);
    await getDifferentTransactions(
      "input",
      key,
      bigAddr[key],
      addrToBlock[key]
    );
  }
  setTimeout(() => cycleUpdateCache(), 30000);
}

async function cycleUpdateCache() {
  await updateCachingBigAddrTransactions();
  setTimeout(() => cycleUpdateCache(), 30000);
}

async function updateCachingBigAddrTransactions() {
  const bigAddr = addrManager.getAddr();
  const addrToBlock = addrManager.getAddrToBlock();
  for (let key in bigAddr) {
    await getDifferentTransactions("from", key, bigAddr[key], addrToBlock[key]);
    await getDifferentTransactions("to", key, bigAddr[key], addrToBlock[key]);
    await getDifferentTransactions(
      "input",
      key,
      bigAddr[key],
      addrToBlock[key]
    );
  }
}

function writeToJson() {
  // write to json file
  if (getTokenLength() > initialTokenLength) {
    // update initial token length
    console.log(
      "write to tokenJson file:",
      getTokenLength() - initialTokenLength
    );
    initialTokenLength = getTokenLength();
    writeToTokenJson(__dirname + "/erc/ethToken.json", tokenData);
  }
}

async function getDifferentTransactions(filed, key, addr, blockNumber) {
  const result = await getTransactions(
    filed,
    addr, //address
    blockNumber //maxBlockNumber, default: 0
  );
  writeToJson();
  //transaction count length
  if (!result) {
    console.log(
      `cache ${0} transactions for ${key} address: ${addr} between [${blockNumber}, newestBlock\n`
    );
  } else {
    const transactions = result[0]; //transaction info
    const max = result[1]; //max blockNumber to get info from
    await addrManager.setAddrToBlock(bigAddr[key], max);
    const collection = db.collection(key + "_" + bigAddr[key]);
    const inserted = await collection.insertMany(transactions);
    assert.equal(transactions.length, inserted.result.n);
    console.log(
      `cache ${transactions.length} transactions for ${key} address: ${addr} between [${blockNumber}, ${max}\n`
    );
  }
}

module.exports = cachingBigAddrTransactions;
