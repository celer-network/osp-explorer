const jsonServer = require("json-server");
const config = require("./config");

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(router);
server.listen(config.port, () => {
  console.log("JSON Server is running");
});
