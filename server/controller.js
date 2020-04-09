const protobuf = require("protobufjs");
const fs = require("fs");
const Reader = require("@maxmind/geoip2-node").Reader;

const dbBuffer = fs.readFileSync("./server/GeoLite2-City.mmdb");
const reader = Reader.openBuffer(dbBuffer);

async function setup(server, db) {
  reportProto = await protobuf.load("./server/report.proto");
  const OspInfo = reportProto.lookupType("report.OspInfo");

  server.post("/report", (req, res) => {
    const { ospInfo } = req.body;
    var ospInfoMsg = OspInfo.decode(ospInfo);

    try {
      const info = OspInfo.toObject(ospInfoMsg);
      const { hostName, payments } = info;
      const { location } = reader.city(hostName);

      db.get("nodes")
        .find({ id: info.ethAddr })
        .assign({
          ...info,
          payments: payments.low,
          coordinates: [location.latitude, location.longitude],
        })
        .write();
      res.send("success");
    } catch (err) {
      res.status(500).send(err.stack);
    }
  });
}

module.exports = {
  setup,
};
