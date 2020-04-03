const fs = require("fs-extra");
const Web3 = require("web3");
const config = require("./config");

const web3 = new Web3(config.ethInstance);

function monitorChannels(db) {
  const abi = fs.readJSONSync(config.ledgerContractAbi);
  const ledgerContract = new web3.eth.Contract(abi, config.ledgerContract);
  const nodeCollection = db.get("nodes");
  const channelCollection = db.get("channels");
  ledgerContract.events.OpenChannel(
    {
      fromBlock: 0
    },
    (err, event) => {
      if (err) {
        console.error(err);
        return;
      }

      const { channelId, tokenAddress, peerAddrs } = event.returnValues;

      if (!channelCollection.find({ id: channelId }).value()) {
        channelCollection
          .push({ tokenAddress, id: channelId, peers: peerAddrs })
          .write();
      }

      if (!nodeCollection.find({ id: peerAddrs[0] }).value()) {
        nodeCollection.push({ id: peerAddrs[0] }).write();
      }

      if (!nodeCollection.find({ id: peerAddrs[1] }).value()) {
        nodeCollection.push({ id: peerAddrs[1] }).write();
      }
    }
  );
}

module.exports = {
  monitorChannels
};
