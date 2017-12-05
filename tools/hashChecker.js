#!/usr/bin/env node

const sha3 = require('web3-utils').sha3;
const fs = require('fs');
const assert = require('assert');

// Valid hashes using Keccak-256

const contracts = {
    // Crowdsale     : fs.readFileSync('node_modules/zeppelin-solidity/contracts/crowdsale/Crowdsale.sol'),
    // MintableToken : fs.readFileSync('node_modules/zeppelin-solidity/contracts/token/MintableToken.sol'),
    // PausableToken : fs.readFileSync('node_modules/zeppelin-solidity/contracts/token/PausableToken.sol'),
    // StandardToken : fs.readFileSync('node_modules/zeppelin-solidity/contracts/token/StandardToken.sol'),
    // Pausable      : fs.readFileSync('node_modules/zeppelin-solidity/contracts/lifecycle/Pausable.sol'),
    // Ownable       : fs.readFileSync('node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol'),
    // ERC20         : fs.readFileSync('node_modules/zeppelin-solidity/contracts/token/ERC20.sol'),
    // BasicToken    : fs.readFileSync('node_modules/zeppelin-solidity/contracts/token/BasicToken.sol'),
    // ERC20Basic    : fs.readFileSync('node_modules/zeppelin-solidity/contracts/token/ERC20Basic.sol'),
    // SafeMath      : fs.readFileSync('node_modules/zeppelin-solidity/contracts/math/SafeMath.sol')
};

const hashes = {
    Crowdsale     : '0xa9f3d5cc6aa895230ee455f49ebe389d09cc6f9854054cddc4b1452c1e656cb2',
    MintableToken : '0xa2cb1b78ceeb23533b9db838e5faf81407a2619e49c76b9726a19a61000709d8',
    PausableToken : '0x4ce8de4a6f40283e0590e1d3f16dd4ae9584a875aa3ca4daa88a5da941a855fd',
    StandardToken : '0xd21653958f1e5959162ede02f4f7fa7456f62081572c00b095afccf96ec34af6',
    Pausable      : '0x76d46a548007eb267850fb65ed43738dd24af7f4665b5cb9624532f798b460af',
    Ownable       : '0x543a4a2f29d4deaeb178fa6f80bc6619292885cc5846c8975b5bd516f68951d4',
    ERC20         : '0x48674c3983e4e9ba8f771d28e349833164934960a952966c17ae05f05fa84379',
    BasicToken    : '0xc3f91b60a61ee54633aeccfc04b788cb9b7326d67dfa0d9df3f24c16269bea9e',
    ERC20Basic    : '0xf3cea775f019fe99571ed85b792e2e34014976813155a2d51dbfa6b45df1bc44',
    SafeMath      : '0xa4b9940597157ca749a1ff960d4cb5f7366da3b419fbf222cb48c0f17670d4ae'
};

Object.keys(contracts).forEach((key) => {
    assert.equal(sha3(contracts[key]), hashes[key], 'Hash mismatch: ' + key);
});
