/**
 * Truffle configuration
 *
 * @see https://github.com/trufflesuite/truffle-config/blob/master/index.js
 * @see https://github.com/trufflesuite/truffle/releases
 */
const cnf = require('./cnf.json');

require('babel-register');
require('babel-polyfill');

const path      = require('path');
const basePath  = process.cwd();

const buildDir          = path.join(basePath, 'build');
const buildDirContracts = path.join(basePath, 'build/contracts');
const srcDir            = path.join(basePath, 'src/contracts');
const testDir           = path.join(basePath, 'test/contracts');
const migrationsDir     = path.join(basePath, 'migrations/contracts');

module.exports = {
    mocha: {
        useColors: true
    },
    solc: {
        optimizer: {
            enabled:    true,
            runs:       200
        }
    },
    networks: {
        _development: {
            host:       cnf.networks._development.host,
            port:       cnf.networks._development.port,
            network_id: cnf.networks._development.chainId,
            gas:        cnf.networks._development.gas,
            gasPrice:   cnf.networks._development.gasPrice
        },
        coverage: {
            host:       cnf.networks.coverage.host,
            network_id: cnf.networks.coverage.chainId,
            port:       cnf.networks.coverage.port,
            gas:        cnf.networks.coverage.gas,
            gasPrice:   cnf.networks.coverage.gasPrice
        },
        ropsten: {
            host:       cnf.networks.ropsten.host,
            port:       cnf.networks.ropsten.port,
            network_id: cnf.networks.ropsten.chainId,
            from:       cnf.networks.ropsten.from,
            gas:        cnf.networks.ropsten.gas,       // GasLimit (must be under block gas limit! -> determine via etherscan.io) -> 4000000
            gasPrice:   cnf.networks.ropsten.gasPrice   // GasPrice 4000000000
        }
    },
    build_directory:            buildDir,
    contracts_build_directory:  buildDirContracts,
    migrations_directory:       migrationsDir,
    contracts_directory:        srcDir,
    test_directory:             testDir
};
