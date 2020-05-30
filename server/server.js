const jsonServer = require('json-server');
const monitor = require('./monitor');
const axios = require('axios');

const controller = require('./controller');
const config = require('./config');

const server = jsonServer.create();
const router = jsonServer.router(config.database);
const middlewares = jsonServer.defaults({ bodyParser: true });
const db = router.db;

const HOUR = 1000 * 60 * 60;

async function initDB() {
  let res = {};
  if (config.backup) {
    res = await axios.get(config.backup);
  }

  db.defaults({
    nodes: [],
    channels: [],
    tokens: config.tokens,
    meta: {
      endBlockNumber: config.initialBlock,
    },
    ...res.data,
  }).write();
}

function backupDB() {
  axios.put(config.backup, db.getState());
}

async function initServer() {
  await initDB();

  db.set('tokens', config.tokens).write();

  // Hack to fix web3 bug
  setTimeout(() => {
    monitor.monitorChannels(db);
  }, 500);

  setInterval(() => {
    backupDB();
  }, HOUR);

  server.use(middlewares);
  controller.setup(server, db).then(() => {
    server.use(router);

    server.listen(config.port, () => {
      console.log('JSON Server is running');
    });
  });
}

initServer();
