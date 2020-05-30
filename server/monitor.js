const fs = require('fs-extra');
const _ = require('lodash');
const { createAlchemyWeb3 } = require('@alch/alchemy-web3');
const config = require('./config');

const web3 = createAlchemyWeb3(config.ethInstance);

function monitorChannels(db) {
  const routerAbi = fs.readJSONSync('./server/contracts/RouterRegistry.abi');
  const routerContract = new web3.eth.Contract(
    routerAbi,
    config.routerRegistryContract
  );

  routerContract.events.RouterUpdated(
    {
      fromBlock: db.get('meta.endBlockNumber').value() + 1,
    },
    _.partial(handleRouterUpdated, db)
  );

  const ledgerAbi = fs.readJSONSync('./server/contracts/CelerLedger.abi');
  const ledgerContract = new web3.eth.Contract(
    ledgerAbi,
    config.ledgerContract
  );

  ledgerContract.events.OpenChannel(
    {
      fromBlock: db.get('meta.endBlockNumber').value() + 1,
    },
    _.partial(handleOpenChannel, db)
  );
}

function handleRouterUpdated(db, err, event) {
  if (err) {
    console.error(err);
    return;
  }

  console.log('New RouterUpdated Event tx', event.transactionHash);
  db.set('meta.endBlockNumber', event.blockNumber).write();

  const { routerAddress } = event.returnValues;
  const nodeCollection = db.get('nodes');

  if (!nodeCollection.find({ id: routerAddress }).value()) {
    nodeCollection.push({ id: routerAddress, channels: [] }).write();
  }
}

function handleOpenChannel(db, err, event) {
  if (err) {
    console.error(err);
    return;
  }

  console.log('New OpenChannel Event tx', event.transactionHash);
  db.set('meta.endBlockNumber', event.blockNumber).write();

  const { channelId, tokenAddress, peerAddrs } = event.returnValues;
  const channelCollection = db.get('channels');
  const nodeCollection = db.get('nodes');

  if (!channelCollection.find({ id: channelId }).value()) {
    channelCollection
      .push({ tokenAddress, id: channelId, peers: peerAddrs })
      .write();
  }

  const node0 = nodeCollection.find({ id: peerAddrs[0] }).value();
  if (!node0) {
    nodeCollection.push({ id: peerAddrs[0], channels: [channelId] }).write();
  } else {
    nodeCollection
      .find({ id: peerAddrs[0] })
      .assign({
        channels: [...node0.channels, channelId],
      })
      .write();
  }

  const node1 = nodeCollection.find({ id: peerAddrs[1] }).value();
  if (!node1) {
    nodeCollection.push({ id: peerAddrs[1], channels: [channelId] }).write();
  } else {
    nodeCollection
      .find({ id: peerAddrs[1] })
      .assign({
        channels: [...node1.channels, channelId],
      })
      .write();
  }
}

module.exports = {
  monitorChannels,
};
