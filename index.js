//initiate database
const { initDB, initInMemDB } = require("./db");
initDB().then(() => {
  console.log("connect to db, port: 27017");
  initInMemDB().then(() => {
    console.log("connect to in memory db, port: 27018");
    //cache big address transactions
    const cachingBigAddrTransactions = require("./cacheBigAddrTransactions");
    cachingBigAddrTransactions();
  });
});
