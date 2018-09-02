'use strict';

const IPFS = require('ipfs');
const express = require('express');
const bodyParser = require('body-parser');
const contract = require('./contract');
const web3 = require('./web3');
const pg = require('pg');
const creds = require('./db_creds');

const app = express();
//app.use(bodyParser.json());
//----
app.use(bodyParser.json({limit: '10mb', extended: true}))
//app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))
//----
app.post('/submitfile', submitFileHandler);
app.get('/getfilehashes', getLabelHashesHandler);
app.get('/getallhashes', getAllHashesHandler);
const PORT = 8080;

const node = new IPFS();
const pool = new pg.Pool({
    max: 1,
    host: 'project.c1xl2fyihvxj.us-west-1.rds.amazonaws.com',
    user: creds['user'],
    password: creds['password'],
    database: 'ipfs'
});

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});

function submitFileHandler(req, resp) {
    storeOnIPFS(req.body['filename'], req.body['data']).then((filesAdded) => {
        storeInDB(req.body['label'], filesAdded[0].hash).then(() => {
            resp.status(200).send('OK');
        })
    }).catch((error) => {
        console.error(error);
        resp.status(500).send('Something went wrong. Please try again');
    });
}

function getLabelHashesHandler(req, resp) {
    getHashesByLabelFromDB(req.query.label).then((hashes)=> {
        resp.status(200).send({'hashes': hashes});
    }).catch((error) => {
        console.error(error);
        resp.status(500).send('Something went wrong. Please try again');
    })
}

//--
function getAllHashesHandler(req, resp) {
    getAllHashesFromDB(req.query.label).then((hashes)=>{
        resp.status(200).send({'hashes':hashes});
    }).catch((error)=>{
        console.error(error);
        resp.status(500).send('Something went wrong. Please try again')
    })
}
//--

function storeOnIPFS(filename, body) {
    return node.files.add({
        path: filename,
        content: Buffer.from(body)
    })
}

function storeInDB(label, hash) {
    return pool.connect().then((client) => {
        const query = `
            INSERT INTO label_hashes(label, hash)
            VALUES($1, $2)
            ON CONFLICT(label, hash) DO NOTHING;
        `;
        return client.query(query, [label, hash]).then(() => {
            return client.release();
        })
    })
}

function getHashesByLabelFromDB(label) {
    return pool.connect().then((client) => {
        const query = `
            SELECT hash
            FROM label_hashes
            WHERE label = $1;
        `;
        return client.query(query, [label]).then((result) => {
            client.release();
            const rows = result.rows;
            const hashes = [];
            for (const row of rows) {
                hashes.push(row['hash']);
            }

            return Promise.resolve(hashes);
        })
    })
}
//--
function getAllHashesFromDB() {
    return pool.connect().then((client)=>{
        const query = `
            SELECT hash
            FROM label_hashes
        `;
        return client.query(query).then((result)=>{
            client.release();
            const rows = result.rows;
            const hashes = [];
            for (const row of rows) {
                hashes.push(row['hash']);
            }

            return Promise.resolve(hashes);
        })
    })
}
//--

// Code for storing hash on etherium
// web3.eth.getAccounts().then((accounts) => {
//     console.log(accounts);
//     contract.methods.sendHash('hash from ipfs').send({
//         from: accounts[0],
//     }, (error, transactionHash) => {
//         console.error(error);
//         console.log(transactionHash);
//     })
// });


