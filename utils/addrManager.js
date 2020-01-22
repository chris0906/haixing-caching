const fs = require("fs");

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

  setAddrToBlock(addr, maxBlock) {
    this.addrToBlock[addr] = maxBlock;
  }

  getAddrLabel(addr) {
    for (let key in this.bigAddr) {
      if (this.bigAddr[key] === addr) return key;
    }
  }
}

const addrManager = new BigAddrManager();
setInterval(() => {
  addrManager.updateAddr();
}, 10000);

module.exports = addrManager;
