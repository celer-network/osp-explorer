const protobuf = require("protobufjs");
const fs = require("fs");
const Web3 = require("web3");
const differenceInMinutes = require("date-fns/differenceInMinutes");
const Reader = require("@maxmind/geoip2-node").Reader;
const utils = require("./utils");
const config = require("./config");

const web3 = new Web3(config.ethInstance);
const dbBuffer = fs.readFileSync("./server/geo/GeoLite2-City.mmdb");
const reader = Reader.openBuffer(dbBuffer);

async function setup(server, db) {
  reportProto = await protobuf.load("./server/proto/report.proto");
  const OspInfo = reportProto.lookupType("ospreport.OspInfo");

  server.post("/report", async (req, res) => {
    const { ospInfo, sig } = req.body;
    const ospInfoMsg = OspInfo.decode(
      web3.utils.hexToBytes(utils.formatHex(ospInfo))
    );
    const info = OspInfo.toObject(ospInfoMsg);
    const { ethAddr, rpcHost, payments = {} } = info;
    console.log("New report from", ethAddr);

    if (config.verifySig) {
      const account = web3.eth.personal.ecRecover(
        utils.formatHex(ospInfo),
        utils.formatHex(sig)
      );

      if (account !== ethAddr) {
        res.status(400).send("sig is not valid");
        return;
      }
    }

    try {
      const node = db.get("nodes").find({ id: ethAddr });
      const ip = await utils.getIP(rpcHost.split(":")[0]);
      const { location } = reader.city(ip);
      const now = new Date();
      const update = {
        ...info,
        payments: payments.low || 0,
        coordinates: [location.longitude, location.latitude],
        lastUpdate: now,
      };

      const { initialUpdate, lastUpdate } = node.value();
      if (
        !initialUpdate ||
        differenceInMinutes(now, lastUpdate) > config.ospReportTimeout
      ) {
        update.initialUpdate = now;
      }

      node.assign(update).write();
      res.send("success");
    } catch (err) {
      console.log(err);
      res.status(400).send(err.stack);
    }
  });
}

module.exports = {
  setup,
};
