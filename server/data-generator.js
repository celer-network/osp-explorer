const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const faker = require('faker');
const axios = require('axios');
const protobuf = require('protobufjs');
const Web3 = require('web3');

const config = require('./config');

const adapter = new FileSync(config.database);
const db = low(adapter);
const nodeCollection = db.get('nodes');

protobuf.load('./server/proto/report.proto', (err, reportProto) => {
  if (err) {
    return;
  }

  const OspInfo = reportProto.lookupType('ospreport.OspInfo');

  nodeCollection.value().forEach((node) => {
    const payload = {
      ethAddr: node.id,
      rpcHost: `${faker.internet.ip()}:8000`,
      payments: faker.random.number(),
      openAccept: faker.random.boolean(),
      stdOpenchanConfigs: [
        {
          tokenAddr: '0x82e8A274AdDa78D7F09c12Ae8af06c2cf081B396',
          minDeposit: '10000',
          maxDeposit: '10000',
        },
      ],
      adminInfo: {
        name: faker.name.firstName(),
        email: faker.internet.email(),
        organization: faker.company.companyName(),
        address: faker.address.streetAddress(),
        website: faker.internet.domainName(),
      },
    };
    const ospInfoMsg = OspInfo.create(payload);

    if (node.id === '0xCe2A0401b8080a7368656b346D00db9c5641Ab58') {
      axios
        .post('http://localhost:8000/report', {
          ospInfo: Web3.utils.bytesToHex(
            OspInfo.encode(ospInfoMsg).finish().toJSON().data
          ),
        })
        .catch(() => {});
    }
  });
});
