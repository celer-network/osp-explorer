module.exports = {
  port: process.env.PORT || 8000,
  database: "./db.json",
  ethInstance: "wss://mainnet.infura.io/ws/v3/ce581be62b43483b8627f4f9f2ad40d6",
  ledgerContract: "0x4f7f56d57607e346ff8719c9f34cba3bbccae71f",
  routerRegistryContract: "2f11656af5d1e9be634a8d00417cc05ebb43fc08",
  ledgerContractAbi: "./server/CelerLedger.abi",
  snapshot: "./snapshot.json",
  verifySig: false,
  ospReportTimeout: 15, // 15 minutes
  tokens: [
    {
      name: "A",
      address: "0xeC7E5Fa6e7645C2d47cB8642AAC539F189d7Cd67",
    },
    {
      name: "B",
      address: "0xFd3Cc9D89E7AC516e4D1df89233D999C210a5bFf",
    },
    {
      name: "C",
      address: "0xe496Fa48419C14B0Fe2dCf9c1d5C0F408BA3BD2D",
    },
    {
      name: "D",
      address: "0x0000000000000000000000000000000000000000",
    },
  ],
};
