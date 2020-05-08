const jsonServer = require("json-server");
const monitor = require("./monitor");
const fs = require("fs-extra");

const controller = require("./controller");
const config = require("./config");

const server = jsonServer.create();
const router = jsonServer.router(config.database);
const middlewares = jsonServer.defaults({ bodyParser: true });

if (config.snapshot) {
  const snapshot = fs.readJsonSync(config.snapshot);
  router.db.defaults(snapshot).write();
} else {
  router.db
    .defaults({
      nodes: [],
      channels: [],
      tokens: [],
      meta: {
        endBlockNumber: config.initialBlock,
      },
    })
    .write();
}

router.db.set("tokens", config.tokens).write();
// Hack to fix web3 bug
setTimeout(() => {
  monitor.monitorChannels(router.db);
}, 500);

server.use(middlewares);
controller.setup(server, router.db).then(() => {
  server.use(router);

  server.listen(config.port, () => {
    console.log("JSON Server is running");
  });
});
