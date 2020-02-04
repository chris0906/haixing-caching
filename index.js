//initiate database
const { initDB, initTempDB } = require("./db");

initDB().then(() => {
  console.log("connect to db, port: 27017");
  initTempDB().then(() => {
    console.log("connect to temp db, port: 27019");
    const addrManager = require("./utils/addrManager");
    addrManager.initAddrManager().then(() => {
      console.log("initiated addr manager");
      //cache big address transactions
      const cachingBigAddrTransactions = require("./cacheBigAddrTransactions");
      cachingBigAddrTransactions();
    });
  });
});
