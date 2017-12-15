/**
 * Test for BudgetProposalVoting
 *
 * @author Validity Labs AG <info@validitylabs.org>
 */

import {assertJump, getEvents, BigNumber, cnf, increaseTimeTo, increaseTime, duration} from '../helpers/tools';

const BudgetProposalVoting = artifacts.require('./BudgetProposalVoting');
const LoggedToken          = artifacts.require('./LoggedToken');
const BudgetWallet         = artifacts.require('./BudgetWallet');
const LoggedTokenCrowdsale = artifacts.require('./LoggedTokenCrowdsale');


const should = require('chai') // eslint-disable-line
.use(require('chai-as-promised'))
.use(require('chai-bignumber')(BigNumber))
.should();

const zero      = new BigNumber(0);
const two       = new BigNumber(web3.toWei(2, 'ether'));
const Proposal = {
    amount: 0,
    name: 1,
    url: 2,
    hashvalue: 3,
    beneficiaryAccount: 4,
    blocktime: 5,
    countNoVotes: 6,
    countYesVotes: 7,
    hasVoted: 8
}
/**
 * BudgetProposalVoting contract
 */
contract('BudgetProposalVoting', (accounts) => {
    const owner    = accounts[0];
    const activeInvestor1   = accounts[1];
    const activeInvestor2   = accounts[2];
    const activeInvestor3   = accounts[3];
    const beneficiary       = accounts[4];
    const votingPeriod = duration.weeks(2);
    const lockupPeriod = duration.days(20);
    const budget1 = 123e+17;

    // Provide an instance for every test case
    let voting;
    let token;
    let wallet;
    let crowdsale;

    beforeEach(async () => {
        voting      = await BudgetProposalVoting.deployed();
        let tokenAddress = await voting.token();
        token       = await LoggedToken.at(tokenAddress);
        crowdsale   = await LoggedTokenCrowdsale.deployed();
        wallet      = await BudgetWallet.deployed();
    });

    /**
     * [ crowdsale period ]
     */

    it('move to time of crowdsale', async () => {
        console.log('[ crowdsale period ]'.yellow);
        const time = Number(await crowdsale.startTime()) + 1;
        await increaseTimeTo(time);
        assert.isAtLeast(web3.eth.getBlock(web3.eth.blockNumber).timestamp, time);
    });

    it('execute a crowdsale', async () => {
        const tx1  = await crowdsale.buyTokens(
            activeInvestor1,
            {from: activeInvestor1, gas: 1000000, value: 20e+18}
        );
        const tx2  = await crowdsale.buyTokens(
            activeInvestor2,
            {from: activeInvestor2, gas: 1000000, value: 30e+18}
        );
        const tx3  = await crowdsale.buyTokens(
            activeInvestor3,
            {from: activeInvestor3, gas: 1000000, value: 50e+18}
        );
        const events = getEvents(tx1, 'TokenPurchase');

        assert.equal(events[0].purchaser, activeInvestor1, 'activeInvestor2 does not match purchaser');
        assert.equal(events[0].beneficiary, activeInvestor1, 'activeInvestor1 does not match beneficiary');

        events[0].value.should.be.bignumber.equal(20e+18);
        assert.equal(await voting.wallet(), await crowdsale.wallet());
        const balance = web3.eth.getBalance(wallet.address).toNumber();
        assert.equal(balance, 100e+18);

    });

    it('should move to time after crowdsale', async () => {

        const time = Number(await crowdsale.endTime()) + 1;
        await increaseTimeTo(time);
        assert.isAtLeast(web3.eth.getBlock(web3.eth.blockNumber).timestamp, time);
    });


    /**
     * [ accept proposal period ]
     */

    it('should AcceptingProposals', async () => {
        console.log('[ accepting proposals period ]'.yellow);
        const stage  = await voting.stage();
        assert.equal(stage, 0, 'stage not in AcceptingProposals');
    });

    it('should be able to make a proposal', async () => {

        const tx1  = await voting.createProposal(
            budget1,
            'buy Cryptokitten for me',
            'http://cryptokitten.io',
            '0x123',
            beneficiary,
            {from: owner, gas: 1000000}
        );
        const events = getEvents(tx1, 'ProposalCreated');
        assert.equal(events[0].name, 'buy Cryptokitten for me', 'Event doesnt exist');
        const props = await voting.proposals(0);
        assert.equal(props[Proposal.amount], budget1);
        assert.equal(props[Proposal.name], 'buy Cryptokitten for me');
        assert.equal(props[Proposal.url], 'http://cryptokitten.io');
        assert.equal(props[Proposal.hashvalue], '0x1230000000000000000000000000000000000000000000000000000000000000');
        assert.equal(props[Proposal.beneficiaryAccount], beneficiary);
    });

    it('should AcceptingVotes', async () => {
        console.log('[ accepting votes period ]'.yellow);
        const stage  = await voting.stage();
        assert.equal(stage, 1, 'stage not in AcceptingVotes');
    });

    it('should be able to vote', async () => {
        const tx1 = await voting.vote(
            false,
            { from: activeInvestor1, gas: 1000000 }
        );
        const tx2 = await voting.vote(
            true,
            { from: activeInvestor2, gas: 1000000 }
        );
        const events = getEvents(tx1, 'ProposalVoted');

        const props = await voting.proposals(0);

        assert.equal(props[Proposal.countNoVotes].toNumber(), 20e+18);
        assert.equal(props[Proposal.countYesVotes].toNumber(), 30e+18);

    });

    it('should move to time after voting period', async () => {
        const before= Number (web3.eth.getBlock(web3.eth.blockNumber).timestamp);
        await increaseTimeTo(before + votingPeriod);
        const now= Number(web3.eth.getBlock(web3.eth.blockNumber).timestamp);
        assert.isAtLeast(now, before + votingPeriod);
    });

    it('should be able to let beneficiaries claim their money', async () => {
        const tx1 = await voting.releaseFunds(
            { from: activeInvestor1, gas: 1000000 }
        );

        const events = getEvents(tx1, 'FundsReleased');

        assert.equal(events[0].amount.toNumber(), budget1);
        assert.equal(events[0].beneficiary, beneficiary);
    });

    it('should be able to let beneficiaries get funds', async () => {
        const money = Number(await wallet.payments(beneficiary));
        assert.isAtLeast(Number(await web3.eth.getBalance(wallet.address)), money); //precondition to check requirements
        const balanceBefore = Number(await web3.eth.getBalance(beneficiary));
        const tx1 = await wallet.withdrawPayments(
            { from: beneficiary, gas: 1000000 }
        );
        const balanceAfter = Number(await web3.eth.getBalance(beneficiary));
        const gasUsed = Number(tx1.receipt.gasUsed) * 1e+11;
        const spend = balanceAfter - balanceBefore;
        const difference = budget1 - spend - gasUsed;
        assert.isTrue( Math.abs(difference) < 1e+6, `difference ${budget1} - ${spend} - ${gasUsed} is too big ${difference}`);
    });

    it('should AcceptingProposals again', async () => {
        console.log('[ accepting proposals period ]'.yellow);
        const stage  = await voting.stage();
        assert.equal(stage, 0, 'stage not in AcceptingProposals');
    });

});
