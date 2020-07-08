const protobuf = require('protobufjs');
const fs = require('fs');
const Web3 = require('web3');
const differenceInMinutes = require('date-fns/differenceInMinutes');
const axios = require('axios');

const utils = require('./utils');
const config = require('./config');

const web3 = new Web3(config.ethInstance);

const IP_API = 'http://ip-api.com/json/';
const IP_GEO = {
  '119.23.226.3': {
    lat: 22.63,
    lon: 113.97,
  },
  '59.110.60.26': {
    lat: 39.93,
    lon: 116.11,
  },
  '8.210.167.66': {
    lat: 22.35,
    lon: 113.84,
  },
};

async function setup(server, db) {
  const reportProto = await protobuf.load('./server/proto/report.proto');
  const OspInfo = reportProto.lookupType('ospreport.OspInfo');

  server.post('/report', async (req, res) => {
    const { ospInfo, sig } = req.body;
    const ospInfoMsg = OspInfo.decode(
      web3.utils.hexToBytes(utils.formatHex(ospInfo))
    );
    const info = OspInfo.toObject(ospInfoMsg);
    const { ethAddr, rpcHost, payments = {} } = info;
    console.log('New report from', ethAddr);

    if (config.verifySig) {
      const account = web3.eth.personal.ecRecover(
        utils.formatHex(ospInfo),
        utils.formatHex(sig)
      );

      if (account !== ethAddr) {
        res.status(400).send('sig is not valid');
        return;
      }
    }

    try {
      const ip = await utils.getIP(rpcHost.split(':')[0]);
      let {
        data: { lon, lat, country, regionName },
      } = await axios.get(IP_API + ip);
      if (IP_GEO[ip]) {
        lon = IP_GEO[ip].lon;
        lat = IP_GEO[ip].lat;
      }

      const now = new Date();
      const update = {
        ...info,
        ip,
        country,
        regionName,
        payments: payments.low || 0,
        coordinates: [lon, lat],
        lastUpdate: now,
      };

      const node = db.get('nodes').find({ id: ethAddr });
      const nodeValue = node.value();
      if (regionName !== nodeValue.regionName) {
        update.regionUpdate = now;
      }

      const { initialUpdate, lastUpdate } = nodeValue;
      if (
        !initialUpdate ||
        differenceInMinutes(now, new Date(lastUpdate)) > config.ospReportTimeout
      ) {
        if (initialUpdate) {
          const period = [initialUpdate, lastUpdate];
          update.livePeriods = [...(update.livePeriods || []), period];
        }
        update.initialUpdate = now;
      }

      node.assign(update).write();
      res.send('success');
    } catch (err) {
      console.log(err);
      res.status(400).send(err.stack);
    }
  });
}

module.exports = {
  setup,
};
