module.exports = {
  port: process.env.PORT || 8000,
  database: './db.json',
  ethInstance:
    process.env.ETH_INSTANCE ||
    'wss://mainnet.infura.io/ws/v3/ce581be62b43483b8627f4f9f2ad40d6',
  ledgerContract: '0x4f7f56d57607e346ff8719c9f34cba3bbccae71f',
  routerRegistryContract: '2f11656af5d1e9be634a8d00417cc05ebb43fc08',
  snapshot: '',
  initialBlock: 10012234,
  verifySig: false,
  ospReportTimeout: 30, // 30 minutes
  tokens: [
    {
      name: 'ETH',
      address: '0x0000000000000000000000000000000000000000',
    },
    {
      name: 'CELR',
      address: '0x4f9254c83eb525f9fcf346490bbb3ed28a81c667',
    },
  ],
};
