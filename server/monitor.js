const fs = require("fs-extra");
const Web3 = require("web3");
const config = require("./config");

const web3 = new Web3(config.ethInstance);

function monitorChannels(db) {
  // const snapshot = fs.readJsonSync(config.snapshot);
  const abi = fs.readJSONSync(config.ledgerContractAbi);
  const ledgerContract = new web3.eth.Contract(abi, config.ledgerContract);

  // snapshot.Channels.forEach((channel) => {
  //   importChannel(db, {
  //     channelId: channel.Cid,
  //     tokenAddress: channel.Token,
  //     peerAddrs: [channel.P1, channel.P2],
  //   });
  // });

  ledgerContract.events.OpenChannel(
    {
      fromBlock: 10012234,
    },
    (err, event) => {
      if (err) {
        console.error(err);
        return;
      }

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
