const fs = require("fs");
const { getTempDbInstance } = require("../db");
const dbInstance = getTempDbInstance();
const db = dbInstance.db("addressMapping");
const addrToBlock = db.collection("addrToBlockNumber");

class BigAddrManager {
  constructor() {
    const data = fs.readFileSync(
      __dirname + "/../config/bigAddr.json",
      "utf-8"
    );
    this.bigAddr = JSON.parse(data);
    this.length = Object.keys(this.bigAddr).length;
    this.addrToBlock = {};
    for (let key in this.bigAddr) {
      this.addrToBlock[this.bigAddr[key]] = 0;
    }
  }

  async initAddrToBlock() {
    const result = await addrToBlock.find({}, { _id: 0 }).toArray();
    for (let i = 0; i < result.length; i++) {
      this.addrToBlock[result[i].address] = result[i].maxBlockNumber;
    }
  }

  updateAddr() {
    const data = fs.readFileSync(
      __dirname + "/../config/bigAddr.json",
      "utf-8"
    );
    const addrObj = JSON.parse(data);
    // having added new address
    if (Object.keys(addrObj).length > this.length) {
      this.bigAddr = addrObj;
      for (let key in this.bigAddr) {
        if (!this.addrToBlock[this.bigAddr[key]]) {
          this.addrToBlock[this.bigAddr[key]] = 0;
        }
      }
    }
  }

  getAddr() {
    return this.bigAddr;
  }

  getAddrToBlock() {
    return this.addrToBlock;
  }

  async setAddrToBlock(addr, maxBlock) {
    this.addrToBlock[addr] = maxBlock;
    await addrToBlock.updateOne(
      { address: addr },
      {
        $set: {
          label: this.getAddrLabel(addr),
          address: addr,
          maxBlockNumber: maxBlock
        }
      },
      { upsert: true }
    );
  }

  getAddrLabel(addr) {
    for (let key in this.bigAddr) {
      if (this.bigAddr[key] === addr) return key;
    }
  }

  async initAddrManager() {
    await this.initAddrToBlock();
    setInterval(() => {
      this.updateAddr();
    }, 60000);
  }
}

let addrManager;
addrManager = new BigAddrManager();

module.exports = addrManager;
