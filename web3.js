const web3 = require('web3');
module.exports = new web3(new web3.providers.HttpProvider("http://localhost:8545"));
