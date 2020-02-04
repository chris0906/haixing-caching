const assert = require("assert");
const { getTempDbInstance } = require("./db");
const {
  getFromTransactions,
  getToTransactions,
  getInputTransactions
} = require("./getTransactions");
const addrManager = require("./utils/addrManager");
const tempInstance = getTempDbInstance();
const db = tempInstance.db("address");
const { getTokenLength, tokenData } = require("./utils/abiMethods");
const { writeToTokenJson } = require("./utils/addToTokenJson");
let initialTokenLength = getTokenLength();

async function insertDBandOutputInfo(
  collectionName,
  data,
  key,
  address,
  beginningBlock,
  maxBlockNumber
) {
  const transactions = data; //transaction info
  await addrManager.setAddrToBlock(address, maxBlockNumber);
  const collection = db.collection(collectionName);
  const inserted = await collection.insertMany(transactions);
  assert.equal(transactions.length, inserted.result.n);
  console.log(
    `from: cached ${transactions.length} transactions at(${beginningBlock}, ${maxBlockNumber}] for ${key} address: ${address}\n`
  );
}

function getTransactions(key, bigAddr, addrToBlock) {
  getFromTransactions(bigAddr[key], addrToBlock[bigAddr[key]]).then(
    async result => {
      if (result) {
        writeToJson();
        insertDBandOutputInfo(
          key + "_" + bigAddr[key],
          result[0],
          key,
          bigAddr[key],
          addrToBlock[bigAddr[key]],
          result[1]
        );
      } else {
        console.log(
          `from: cached ${0} transactions at(${
            addrToBlock[bigAddr[key]]
          }, newestBlock] for ${key} address: ${bigAddr[key]}\n`
        );
      }
    }
  );
  getToTransactions(bigAddr[key], addrToBlock[bigAddr[key]]).then(
    async result => {
      if (result) {
        writeToJson();
        insertDBandOutputInfo(
          key + "_" + bigAddr[key],
          result[0],
          key,
          bigAddr[key],
          addrToBlock[bigAddr[key]],
          result[1]
        );
      } else {
        console.log(
          `from: cached ${0} transactions at(${
            addrToBlock[bigAddr[key]]
          }, newestBlock] for ${key} address: ${bigAddr[key]}\n`
        );
      }
    }
  );
  getInputTransactions(bigAddr[key], addrToBlock[bigAddr[key]]).then(
    async result => {
      if (result) {
        writeToJson();
        insertDBandOutputInfo(
          key + "_" + bigAddr[key],
          result[0],
          key,
          bigAddr[key],
          addrToBlock[bigAddr[key]],
          result[1]
        );
      } else {
        console.log(
          `from: cached ${0} transactions at(${
            addrToBlock[bigAddr[key]]
          }, newestBlock] for ${key} address: ${bigAddr[key]}\n`
        );
      }
    }
  );
}

async function cachingBigAddrTransactions() {
  const bigAddr = addrManager.getAddr();
  const addrToBlock = addrManager.getAddrToBlock();

  for (let key in bigAddr) {
    getTransactions(key, bigAddr, addrToBlock);
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
    getTransactions(key, bigAddr, addrToBlock);
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
