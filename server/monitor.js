const fs = require("fs-extra");
const Web3 = require("web3");
const config = require("./config");

const web3 = new Web3(config.ethInstance);

function monitorChannels(db) {
  const abi = fs.readJSONSync("./server/contracts/CelerLedger.abi");
  const ledgerContract = new web3.eth.Contract(abi, config.ledgerContract);

  ledgerContract.events.OpenChannel(
    {
      fromBlock:
        db.get("meta.endBlockNumber").value() + 1 || config.initialBlock,
    },
    (err, event) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log("New Event tx", event.transactionHash:);
      db.set("meta.endBlockNumber", event.blockNumber).write();
      importChannel(db, event.returnValues);
    }
  );
}

function importChannel(db, channel) {
  const nodeCollection = db.get("nodes");
  const channelCollection = db.get("channels");
  const { channelId, tokenAddress, peerAddrs } = channel;

  if (!channelCollection.find({ id: channelId }).value()) {
    channelCollection
      .push({ tokenAddress, id: channelId, peers: peerAddrs })
      .write();
  }

  const node0 = nodeCollection.find({ id: peerAddrs[0] }).value();
  if (!node0) {
    nodeCollection.push({ id: peerAddrs[0], channels: [channelId] }).write();
  } else {
    nodeCollection.find({ id: peerAddrs[0] }).assign({
      channels: [...node0.channels, channelId],
    });
  }

  const node1 = nodeCollection.find({ id: peerAddrs[1] }).value();
  if (!node1) {
    nodeCollection.push({ id: peerAddrs[1], channels: [channelId] }).write();
  } else {
    nodeCollection.find({ id: peerAddrs[1] }).assign({
      channels: [...node1.channels, channelId],
    });
  }
}

module.exports = {
  monitorChannels,
};
