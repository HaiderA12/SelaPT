const web3 = require('./web3');
// access our local copy to contract deployed on rinkeby testnet
// use your own contract address

//const address = '0xb84b12e953f5bcf01b05f926728e855f2d4a67a9';
//const address = '0x7bc5986c7284ce275500753a07967740c1f48473';
const address = '0xbee131b14592e41b1f9623f7032ce0aec13fd892';
//use the ABI from your contract
const abi = [
	{
		"constant": true,
		"inputs": [],
		"name": "getHash",
		"outputs": [
			{
				"name": "x",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "x",
				"type": "string"
			}
		],
		"name": "sendHash",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

module.exports = new web3.eth.Contract(abi, address);