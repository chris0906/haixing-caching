const abi = require("../erc/baseABI");
const decoder = require("abi-decoder").decodeMethod;
require("abi-decoder").addABI(abi);
const toDate = require("./toDate");
const Web3 = require("web3");
const web3 = new Web3(require("../config/provider").providerAddr);
const { getDecimals, getSymbol, tokenData } = require("./abiMethods");
const fs = require("fs");
const writeStream = fs.createWriteStream("unknowToken.txt", { flags: "a" });

module.exports = async function(arr) {
  const finalRes = [];
  const length = arr.length;
  const unknownContractAddr = [];
  // js doesn't support address transmit, but array support
  const initialPercentage = [0];
  for (let i = 0; i < length; i++) {
    length > 100 ? writeProgression(i, length, initialPercentage) : "";
    try {
      let from, to, value, time, symbol, blockHash;
      //if it's eth token
      if (arr[i].input === "0x" && arr[i].value !== "0") {
        from = arr[i].from;
        to = arr[i].to;
        value = web3.utils.fromWei(arr[i].value, "ether");
        symbol = "ETH";
        time = toDate(arr[i].timestamp);
        blockHash = arr[i].blockHash;
        finalRes.push({
          time,
          blockHash,
          from,
          to,
          value,
          symbol
        });
      } else {
        //if it's erc20 token
        const decodedData = decoder(arr[i].input);
        // unnable to decode input
        if (!decodedData) {
          // console.log("unknown input data, contract address: ", arr[i].to);
          continue;
        } else if (decodedData.name === "transfer" && arr[i].to !== null) {
          let decimal = getDecimals(arr[i].to);
          if (decimal === null) {
            //if ethToken json file does not have this token information, then write to ethToken json file
            const code = await web3.eth.getCode(arr[i].to);
            if (code.length <= 2) {
              console.log("not a valid contract address to get decimal from");
              console.log(arr[i]);
              continue;
            }
            const contract = new web3.eth.Contract(abi, arr[i].to);
            const symbol = await contract.methods.symbol().call();
            decimal = await contract.methods.decimals().call();
            tokenData[arr[i].to] = {
              address: arr[i].to,
              symbol,
              decimal,
              type: "default"
            };
            delete contract;
          }
          from = arr[i].from;
          to = decodedData.params[0].value;
          value = decodedData.params[1].value / 10 ** decimal;
          value = value.toString();
          symbol = getSymbol(arr[i].to);
          time = toDate(arr[i].timestamp);
          blockHash = arr[i].blockHash;
          finalRes.push({
            time,
            blockHash,
            from,
            to,
            value,
            symbol
          });
        } else {
          console.log(
            `${decodedData.name} method is invoked, but were not handled`
          );
        }
      }
    } catch (error) {
      console.log(error);
      console.log("address:", arr[i].to);
      if (!unknownContractAddr.includes(arr[i].to)) {
        unknownContractAddr.push(arr[i].to);
        writeStream.write(`unknown contract address ${arr[i].to}\r\n`);
      }
      continue;
    }
  }
  if (length > 100) process.stdout.write("\n");
  return finalRes;
};

function writeProgression(cursor, length, initialPercentage) {
  const percentage = Math.floor((cursor / length) * 100);
  if (percentage > initialPercentage[0]) {
    process.stdout.cursorTo(0);
    process.stdout.write(`${percentage}%`);
    initialPercentage[0] = percentage;
  }
}
