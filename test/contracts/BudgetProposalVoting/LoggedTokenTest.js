/**
 * Test for LoggedToken
 *
 * @author Validity Labs AG <info@validitylabs.org>
 */

import {assertJump, getEvents, BigNumber, cnf, increaseTimeTo, increaseTime, duration} from '../helpers/tools';

const LoggedToken          = artifacts.require('./LoggedToken');


const should = require('chai') // eslint-disable-line
.use(require('chai-as-promised'))
.use(require('chai-bignumber')(BigNumber))
.should();

contract('LoggedToken', (accounts) => {
    const owner    = accounts[0];
    const tokenholder1   = accounts[1];
    const tokenholder2   = accounts[2];
    const tokenholder3   = accounts[3];
    const beneficiary    = accounts[4];
    const budget1 = 123e+17;

    // Provide icoTokenInstance for every test case
    let token;

    beforeEach(async () => {
        if(!token) token = await LoggedToken.new();
    });

    /**
     * [ mint period ]
     */

    it('should mint some tokens', async () => {
        console.log('[ mint period ]'.yellow);
        const tx1 = await token.mint(
            tokenholder1,
            budget1,
            {from: owner}
        );
        const events = getEvents(tx1, 'Transfer');
        assert.equal(events[0]._from, 0);
        assert.equal(events[0]._to, tokenholder1);
        assert.equal(events[0]._amount, budget1);

        const balance = await token.balanceOf(tokenholder1);
        assert.equal(balance, budget1);
    });

    it('should have created checkpoints', async () => {

        const balance0 = Number(await token.balanceOfAt(tokenholder1, 0));
        assert.equal(balance0, 0);
        const blockHeight = await web3.eth.blockNumber;

        const total = Number(await token.totalSupplyAt(blockHeight+1));
        assert.equal(total, budget1);

        const balance = Number(await token.balanceOfAt(tokenholder1, blockHeight));
        assert.equal(balance, budget1);

    });
});
