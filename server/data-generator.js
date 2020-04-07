const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const fs = require("fs");
const Reader = require("@maxmind/geoip2-node").Reader;
const faker = require("faker");

const config = require("./config");
const monitor = require("./monitor");

const dbBuffer = fs.readFileSync("./server/GeoLite2-City.mmdb");
const reader = Reader.openBuffer(dbBuffer);

const adapter = new FileSync(config.database);
const db = low(adapter);
const nodeCollection = db.get("nodes");

setTimeout(() => {
  db.defaults({ nodes: [], channels: [] }).write();
  monitor.monitorChannels(db);
}, 500);

setTimeout(() => {
  nodeCollection.value().forEach((node) => {
    const hostname = faker.internet.ip();
    let city;
    try {
      city = reader.city(hostname);
      nodeCollection
        .find(node)
        .assign({
          hostname,
          coordinates: [city.location.latitude, city.location.longitude],
        })
        .write();
    } catch (e) {}
  });
}, 2000);
