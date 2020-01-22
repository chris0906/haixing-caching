const assert = require("assert");
const { getInMemDbInstance } = require("./db");
const getTransactions = require("./getTransactions");
const addrManager = require("./utils/addrManager");
const inMemInstance = getInMemDbInstance();
const db = inMemInstance.db("address");
const { getTokenLength, tokenData } = require("./utils/abiMethods");
const { writeToTokenJson } = require("./utils/addToTokenJson");
let initialTokenLength = getTokenLength();

async function cachingBigAddrTransactions() {
  //clear all collections when first start caching
  const collections = await db.listCollections().toArray();
  for (let i = 0; i < collections.length; i++) {
    const res = await db.collection(collections[i].name).drop();
    assert.equal(res, true);
  }
  const bigAddr = addrManager.getAddr();
  const addrToBlock = addrManager.getAddrToBlock();

  for (let key in bigAddr) {
    //get transactions from db
    const result = await getTransactions(
      bigAddr[key],
      addrToBlock[bigAddr[key]]
    );
    writeToJson();
    //transaction count length
    if (!result) {
      continue;
    }
    const transactions = result[0]; //transaction info
    const max = result[1]; //max blockNumber to get info from
    addrManager.setAddrToBlock(bigAddr[key], max);
    const collection = db.collection(bigAddr[key]);
    const inserted = await collection.insertMany(transactions);
    assert.equal(transactions.length, inserted.result.n);
    console.log(
      `cache ${transactions.length} transactions for ${key} address: ${bigAddr[key]}`
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
    //get transactions from db
    const result = await getTransactions(
      bigAddr[key],
      addrToBlock[bigAddr[key]]
    );
    writeToJson();
    //transaction count length
    if (!result) {
      continue;
    }
    const transactions = result[0];
    const max = result[1]; //max blockNumber to get info from
    addrManager.setAddrToBlock(bigAddr[key], max); //update max block
    const collection = db.collection(bigAddr[key]);
    const inserted = await collection.insertMany(transactions);
    assert.equal(transactions.length, inserted.result.n);
    console.log(
      `newly cache ${transactions.length} transactions for ${key} address: ${bigAddr[key]}`
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

module.exports = cachingBigAddrTransactions;
