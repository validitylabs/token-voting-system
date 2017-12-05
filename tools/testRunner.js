/**
 * Test and coverage server
 * @TODO: parametrize type (test / coverage)
 * @see http://krasimirtsonev.com/blog/article/Nodejs-managing-child-processes-starting-stopping-exec-spawn
 */

require('babel-register');
require('babel-polyfill');
const Ganache = require('ganache-core');

const port      = 9545;
const config    = {
    accounts: [
        {
            balance: '0x7FFFFFFFFFFFFFFF',
            secretKey: '0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501200'
        },
        {
            balance: '0x7FFFFFFFFFFFFFFF',
            secretKey: '0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501201'
        },
        {
            balance: '0x7FFFFFFFFFFFFFFF',
            secretKey: '0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501202'
        },
        {
            balance: '0x7FFFFFFFFFFFFFFF',
            secretKey: '0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501203'
        },
        {
            balance: '0x7FFFFFFFFFFFFFFF',
            secretKey: '0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501204'
        },
        {
            balance: '0x7FFFFFFFFFFFFFFF',
            secretKey: '0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501205'
        },
        {
            balance: '0x7FFFFFFFFFFFFFFF',
            secretKey: '0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501206'
        },
        {
            balance: '0x7FFFFFFFFFFFFFFF',
            secretKey: '0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501207'
        },
        {
            balance: '0x7FFFFFFFFFFFFFFF',
            secretKey: '0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501208'
        },
        {
            balance: '0x7FFFFFFFFFFFFFFF',
            secretKey: '0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501209'
        }
    ],
    mnemonic: 'waste system voyage dentist fine donate purpose truly cactus chest coyote globe',
    port: 9545,
    total_accounts: 10,
    network_id: 4447,
    locked: false,
    db_path: './db/'
};

const server = Ganache.server(config);

server.listen(port, (err, blockchain) => {
    if (err) {
        console.log(err);
    } else {
        console.log(blockchain);

        const exec = require('child_process').exec;

        exec('truffle test --network _development', (error, stdout, stderr) => {
            console.log('stdout: ', stdout);
            console.log('stderr: ', stderr);

            if (error !== null) {
                console.log('exec error: ', error);
            }
        });

        // process.exit();
    }
});
