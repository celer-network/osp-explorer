const protobuf = require("protobufjs");
const fs = require("fs");
const Web3 = require("web3");
const differenceInMinutes = require("date-fns/differenceInMinutes");
const Reader = require("@maxmind/geoip2-node").Reader;
const config = require("./config");

const web3 = new Web3(config.ethInstance);
const dbBuffer = fs.readFileSync("./server/GeoLite2-City.mmdb");
const reader = Reader.openBuffer(dbBuffer);

async function setup(server, db) {
  reportProto = await protobuf.load("./server/report.proto");
  const OspInfo = reportProto.lookupType("report.OspInfo");

  server.post("/report", (req, res) => {
    const { ospInfo, sig } = req.body;
    const ospInfoMsg = OspInfo.decode(ospInfo);
    const info = OspInfo.toObject(ospInfoMsg);

    if (config.verifySig) {
      const account = web3.eth.personal.ecRecover(
        web3.utils.bytesToHex(ospInfo),
        web3.utils.bytesToHex(sig)
      );

      if (account !== info.ethAddr) {
        res.status(400).send("sig is not valid");
        return;
      }
    }

    try {
      const { hostName, payments } = info;
      const { location } = reader.city(hostName);
      const now = new Date();
      const node = db.get("nodes").find({ id: info.ethAddr });
      const update = {
        ...info,
        payments: payments.low,
        coordinates: [location.latitude, location.longitude],
        lastUpdate: now,
      };

      if (
        !node.value.initialUpdate ||
        differenceInMinutes(now, node.value.lastUpdate) >
          config.ospReportTimeout
      ) {
        update.initialUpdate = now;
      }

      node.assign(update).write();
      res.send("success");
    } catch (err) {
      res.status(400).send(err.stack);
    }
  });
}

module.exports = {
  setup,
};
