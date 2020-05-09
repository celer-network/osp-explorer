const dns = require('dns');

const IP_REGEX = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

function formatHex(str) {
  if (str.startsWith('0x')) {
    return str;
  }

  return '0x' + str;
}

async function getIP(str) {
  if (IP_REGEX.test(str)) {
    return str;
  }

  return new Promise((resolve, reject) => {
    dns.lookup(str, {}, (err, address) => {
      if (err) {
        reject(err);
      }

      resolve(address);
    });
  });
}

module.exports = {
  formatHex,
  getIP,
};
