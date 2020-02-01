const MongoClient = require("mongodb").MongoClient;
let client;
let inMemClient;
let tempClient;
async function initDB() {
  try {
    if (typeof client === "undefined") {
      client = new MongoClient("mongodb://localhost:27017", {
        useUnifiedTopology: true
      });
      return await client.connect();
    }
  } catch (error) {
    console.log(error);
  }
}
async function initInMemDB() {
  try {
    if (typeof inMemClient === "undefined") {
      inMemClient = new MongoClient("mongodb://localhost:27018", {
        useUnifiedTopology: true
      });
      return await inMemClient.connect();
    }
  } catch (error) {
    console.log(error);
  }
}

async function initTempDB() {
  try {
    if (typeof tempClient === "undefined") {
      tempClient = new MongoClient("mongodb://localhost:27019", {
        useUnifiedTopology: true
      });
      return await tempClient.connect();
    }
  } catch (error) {
    console.log(error);
  }
}

function getDbInstance() {
  if (typeof client === "undefined") {
    console.log("db does not initiate, please call initDB first");
    return null;
  }
  return client;
}

function getInMemDbInstance() {
  if (typeof inMemClient === "undefined") {
    console.log(
      "in memory db does not initiate, please call initInMemDB first"
    );
    return null;
  }
  return inMemClient;
}

function getTempDbInstance() {
  if (typeof tempClient === "undefined") {
    console.log("temp db does not initiate, please call initTempDB first");
    return null;
  }
  return tempClient;
}

module.exports = {
  initDB,
  initInMemDB,
  initTempDB,
  getDbInstance,
  getInMemDbInstance,
  getTempDbInstance
};
