const jsonServer = require("json-server");
const monitor = require("./monitor");
const config = require("./config");

const server = jsonServer.create();
const router = jsonServer.router(config.database);
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(router);

// Hack to fix web3 bug
setTimeout(() => {
  monitor.monitorChannels(router.db);
}, 500);

server.listen(config.port, () => {
  console.log("JSON Server is running");
});
