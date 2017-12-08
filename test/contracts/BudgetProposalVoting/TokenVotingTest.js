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

    // Provide icoTokenInstance for every test case
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
            web3.toWei(123, 'ether'),
            'buy Cryptokitten for me',
            'http://cryptokitten.io',
            '0x123',
            beneficiary,
            {from: owner, gas: 1000000}
        );
        const events = getEvents(tx1, 'ProposalCreated');
        assert.equal(events[0].name, 'buy Cryptokitten for me', 'Event doesnt exist');
        const props = await voting.proposals(0);
        assert.equal(props[Proposal.amount], 123e+18);
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

        assert.equal(events[0].amount.toNumber(), 123e+18);
        assert.equal(events[0].beneficiary, beneficiary);
    });

    it('should be able to let beneficiaries get', async () => {
        const tx1 = await voting.releaseFunds(
            { from: activeInvestor1, gas: 1000000 }
        );

        const events = getEvents(tx1, 'FundsReleased');

        assert.equal(events[0].amount.toNumber(), 123e+18);
        assert.equal(events[0].beneficiary, beneficiary);
    });



    // it('should buyTokens properly', async () => {
    //     const tx    = await votingInstance.buyTokens(
    //         activeInvestor1,
    //         {from: activeInvestor2, gas: 1000000, value: web3.toWei(2, 'ether')}
    //     );

    //     const investment    = await votingInstance.investments(0);

    //     assert.equal(investment[0], activeInvestor2);   // Investor
    //     assert.equal(investment[1], activeInvestor1);   // Beneficiary
    //     investment[2].should.be.bignumber.equal(web3.toWei(2, 'ether'));   // Amount
    //     assert.isFalse(investment[3]);                  // Confirmed
    //     assert.isFalse(investment[4]);                  // AttemptedSettlement
    //     assert.isFalse(investment[5]);                  // CompletedSettlement

    //     // Testing events
    //     const events = getEvents(tx, 'TokenPurchase');

    //     assert.equal(events[0].purchaser, activeInvestor2, 'activeInvestor2 does not match purchaser');
    //     assert.equal(events[0].beneficiary, activeInvestor1, 'activeInvestor1 does not match beneficiary');

    //     events[0].value.should.be.bignumber.equal(web3.toWei(2, 'ether'));
    //     events[0].amount.should.be.bignumber.equal(zero);
    // });

    // it('should call the fallback function successfully', async () => {
    //     const tx1   = await votingInstance.sendTransaction({
    //         from:   activeInvestor1,
    //         value:  web3.toWei(3, 'ether'),
    //         gas:    1000000
    //     });

    //     const investment1 = await votingInstance.investments(1);

    //     assert.equal(investment1[0], activeInvestor1);   // Investor
    //     assert.equal(investment1[1], activeInvestor1);   // Beneficiary
    //     investment1[2].should.be.bignumber.equal(web3.toWei(3, 'ether'));  // Amount
    //     assert.isFalse(investment1[3]);                  // Confirmed
    //     assert.isFalse(investment1[4]);                  // AttemptedSettlement
    //     assert.isFalse(investment1[5]);                  // CompletedSettlement

    //     // Testing events
    //     const events1 = getEvents(tx1, 'TokenPurchase');

    //     assert.equal(events1[0].purchaser, activeInvestor1, 'activeInvestor1 does not match purchaser');
    //     assert.equal(events1[0].beneficiary, activeInvestor1, 'activeInvestor1 does not match beneficiary');

    //     events1[0].value.should.be.bignumber.equal(web3.toWei(3, 'ether'));
    //     events1[0].amount.should.be.bignumber.equal(zero);

    //     const tx2   = await votingInstance.sendTransaction({
    //         from:   activeInvestor1,
    //         value:  web3.toWei(4, 'ether'),
    //         gas:    1000000
    //     });

    //     const investment2 = await votingInstance.investments(2);

    //     assert.equal(investment2[0], activeInvestor1);   // Investor
    //     assert.equal(investment2[1], activeInvestor1);   // Beneficiary
    //     investment2[2].should.be.bignumber.equal(web3.toWei(4, 'ether'));  // Amount
    //     assert.isFalse(investment2[3]);                  // Confirmed
    //     assert.isFalse(investment2[4]);                  // AttemptedSettlement
    //     assert.isFalse(investment2[5]);                  // CompletedSettlement

    //     // Testing events
    //     const events2 = getEvents(tx2, 'TokenPurchase');

    //     assert.equal(events2[0].purchaser, activeInvestor1, 'activeInvestor1 does not match purchaser');
    //     assert.equal(events2[0].beneficiary, activeInvestor1, 'activeInvestor1 does not match beneficiary');

    //     events2[0].value.should.be.bignumber.equal(web3.toWei(4, 'ether'));
    //     events2[0].amount.should.be.bignumber.equal(zero);

    //     const tx3   = await votingInstance.sendTransaction({
    //         from:   activeInvestor2,
    //         value:  web3.toWei(5, 'ether'),
    //         gas:    1000000
    //     });

    //     const investment3 = await votingInstance.investments(3);

    //     assert.equal(investment3[0], activeInvestor2);      // Investor
    //     assert.equal(investment3[1], activeInvestor2);      // Beneficiary
    //     investment3[2].should.be.bignumber.equal(web3.toWei(5, 'ether')); // Amount
    //     assert.isFalse(investment3[3]);                     // Confirmed
    //     assert.isFalse(investment3[4]);                     // AttemptedSettlement
    //     assert.isFalse(investment3[5]);                     // CompletedSettlement

    //     // Testing events
    //     const events3 = getEvents(tx3, 'TokenPurchase');

    //     assert.equal(events3[0].purchaser, activeInvestor2, 'activeInvestor2 does not match purchaser');
    //     assert.equal(events3[0].beneficiary, activeInvestor2, 'activeInvestor2 does not match beneficiary');

    //     events3[0].value.should.be.bignumber.equal(web3.toWei(5, 'ether'));
    //     events3[0].amount.should.be.bignumber.equal(zero);

    //     const tx4   = await votingInstance.sendTransaction({
    //         from:   activeInvestor1,
    //         value:  web3.toWei(6, 'ether'),
    //         gas:    1000000
    //     });

    //     const investment4 = await votingInstance.investments(4);

    //     assert.equal(investment4[0], activeInvestor1);      // Investor
    //     assert.equal(investment4[1], activeInvestor1);      // Beneficiary
    //     investment4[2].should.be.bignumber.equal(web3.toWei(6, 'ether'));   // Amount
    //     assert.isFalse(investment4[3]);                     // Confirmed
    //     assert.isFalse(investment4[4]);                     // AttemptedSettlement
    //     assert.isFalse(investment4[5]);                     // CompletedSettlement

    //     // Testing events
    //     const events4 = getEvents(tx4, 'TokenPurchase');

    //     assert.equal(events4[0].purchaser, activeInvestor1, 'activeInvestor1 does not match purchaser');
    //     assert.equal(events4[0].beneficiary, activeInvestor1, 'activeInvestor1 does not match beneficiary');

    //     events4[0].value.should.be.bignumber.equal(web3.toWei(6, 'ether'));
    //     events4[0].amount.should.be.bignumber.equal(zero);
    // });

    // it('should buyTokens (for token contract) properly', async () => {
    //     const tokenAddress = await votingInstance.token();

    //     await votingInstance.buyTokens(
    //         tokenAddress,
    //         {from: activeInvestor2, gas: 1000000, value: web3.toWei(7, 'ether')}
    //     );

    //     const investment    = await votingInstance.investments(5);

    //     assert.equal(investment[0], activeInvestor2);   // Investor
    //     assert.equal(investment[1], tokenAddress);      // Beneficiary
    //     investment[2].should.be.bignumber.equal(web3.toWei(7, 'ether'));   // Amount
    //     assert.isFalse(investment[3]);                  // Confirmed
    //     assert.isFalse(investment[4]);                  // AttemptedSettlement
    //     assert.isFalse(investment[5]);                  // CompletedSettlement
    // });

    // it('should fail, because we try to trigger mintTokenPreSale in contribution period', async () => {
    //     try {
    //         await votingInstance.mintTokenPreSale(activeInvestor1, 3);

    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should fail, because we try to trigger confirmPayment with non manager account', async () => {
    //     try {
    //         await votingInstance.confirmPayment(0, {from: inactiveManager, gas: 1000000});

    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should fail, because we try to trigger batchConfirmPayments with non manager account', async () => {
    //     try {
    //         await votingInstance.batchConfirmPayments([0, 1], {from: inactiveManager, gas: 1000000});

    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should fail, because we try to trigger unConfirmPayment with non manager account', async () => {
    //     try {
    //         await votingInstance.unConfirmPayment(0, {from: inactiveManager, gas: 1000000});

    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should fail, because we try to run finaliseConfirmationPeriod with a non manager account', async () => {
    //     try {
    //         await votingInstance.finaliseConfirmationPeriod({from: activeInvestor1, gas: 1000000});

    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should fail, because we try to trigger unConfirmPayment before Confirmation period', async () => {
    //     try {
    //         await votingInstance.unConfirmPayment(0, {from: activeManager, gas: 1000000});

    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should fail, because we try to trigger batchConfirmPayments before Confirmation period', async () => {
    //     try {
    //         await votingInstance.batchConfirmPayments([0, 1], {from: activeManager, gas: 1000000});

    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should fail, because we try to trigger confirmPayment before Confirmation period', async () => {
    //     try {
    //         await votingInstance.confirmPayment(0, {from: activeManager, gas: 1000000});

    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // /**
    //  * [ Confirmation period ]
    //  */
    // it('should turn the time 10 days forward to Confirmation period', async () => {
    //     console.log('[ Confirmation period ]'.yellow);
    //     await waitNDays(10);
    // });

    // it('should fail, because we try to trigger mintTokenPreSale in Confirmation period', async () => {
    //     try {
    //         await votingInstance.mintTokenPreSale(activeInvestor1, 3);

    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should trigger confirmPayment successfully', async () => {
    //     const tx            = await votingInstance.confirmPayment(0, {from: activeManager, gas: 1000000});
    //     const events        = getEvents(tx, 'ChangedInvestmentConfirmation');
    //     const investment    = await votingInstance.investments(0);
    //     const investment1   = await votingInstance.investments(1);
    //     const investment2   = await votingInstance.investments(2);
    //     const investment3   = await votingInstance.investments(3);
    //     const investment4   = await votingInstance.investments(4);

    //     assert.equal(investment[0], activeInvestor2);   // Investor
    //     assert.equal(investment[1], activeInvestor1);   // Beneficiary
    //     investment[2].should.be.bignumber.equal(web3.toWei(2, 'ether'));   // Amount
    //     assert.isTrue(investment[3]);                   // Confirmed
    //     assert.isFalse(investment[4]);                  // AttemptedSettlement
    //     assert.isFalse(investment[5]);                  // CompletedSettlement

    //     assert.equal(investment1[0], activeInvestor1);   // Investor
    //     assert.equal(investment1[1], activeInvestor1);   // Beneficiary
    //     investment1[2].should.be.bignumber.equal(web3.toWei(3, 'ether'));  // Amount
    //     assert.isFalse(investment1[3]);                  // Confirmed
    //     assert.isFalse(investment1[4]);                  // AttemptedSettlement
    //     assert.isFalse(investment1[5]);                  // CompletedSettlement

    //     assert.equal(investment2[0], activeInvestor1);   // Investor
    //     assert.equal(investment2[1], activeInvestor1);   // Beneficiary
    //     investment2[2].should.be.bignumber.equal(web3.toWei(4, 'ether'));  // Amount
    //     assert.isFalse(investment2[3]);                  // Confirmed
    //     assert.isFalse(investment2[4]);                  // AttemptedSettlement
    //     assert.isFalse(investment2[5]);                  // CompletedSettlement

    //     assert.equal(investment3[0], activeInvestor2);      // Investor
    //     assert.equal(investment3[1], activeInvestor2);      // Beneficiary
    //     investment3[2].should.be.bignumber.equal(web3.toWei(5, 'ether')); // Amount
    //     assert.isFalse(investment3[3]);                     // Confirmed
    //     assert.isFalse(investment3[4]);                     // AttemptedSettlement
    //     assert.isFalse(investment3[5]);                     // CompletedSettlement

    //     assert.equal(investment4[0], activeInvestor1);      // Investor
    //     assert.equal(investment4[1], activeInvestor1);      // Beneficiary
    //     investment4[2].should.be.bignumber.equal(web3.toWei(6, 'ether'));   // Amount
    //     assert.isFalse(investment4[3]);                     // Confirmed
    //     assert.isFalse(investment4[4]);                     // AttemptedSettlement
    //     assert.isFalse(investment4[5]);                     // CompletedSettlement

    //     assert.equal(events[0].investmentId, 0);
    //     assert.equal(events[0].investor, activeInvestor2);
    //     assert.isTrue(events[0].confirmed);
    // });

    // it('should run batchConfirmPayments() successfully', async () => {
    //     const tx = await votingInstance.batchConfirmPayments(
    //         [0, 1, 2, 3],
    //         {from: activeManager, gas: 1000000}
    //     );

    //     const investment4   = await votingInstance.investments(4);
    //     const events        = getEvents(tx, 'ChangedInvestmentConfirmation');

    //     assert.equal(investment4[0], activeInvestor1);      // Investor
    //     assert.equal(investment4[1], activeInvestor1);      // Beneficiary
    //     investment4[2].should.be.bignumber.equal(web3.toWei(6, 'ether'));   // Amount
    //     assert.isFalse(investment4[3]);                     // Confirmed
    //     assert.isFalse(investment4[4]);                     // AttemptedSettlement
    //     assert.isFalse(investment4[5]);                     // CompletedSettlement

    //     assert.equal(events[0].investmentId, 0);
    //     assert.equal(events[0].investor, activeInvestor2);
    //     assert.isTrue(events[0].confirmed);

    //     assert.equal(events[1].investmentId, 1);
    //     assert.equal(events[1].investor, activeInvestor1);
    //     assert.isTrue(events[1].confirmed);

    //     assert.equal(events[2].investmentId, 2);
    //     assert.equal(events[2].investor, activeInvestor1);
    //     assert.isTrue(events[2].confirmed);

    //     assert.equal(events[3].investmentId, 3);
    //     assert.equal(events[3].investor, activeInvestor2);
    //     assert.isTrue(events[3].confirmed);
    // });

    // it('should run unConfirmPayment() successfully', async () => {
    //     const tx            = await votingInstance.unConfirmPayment(3, {from: activeManager, gas: 1000000});
    //     const events        = getEvents(tx, 'ChangedInvestmentConfirmation');
    //     const investment    = await votingInstance.investments(0);
    //     const investment1   = await votingInstance.investments(1);
    //     const investment2   = await votingInstance.investments(2);
    //     const investment3   = await votingInstance.investments(3);
    //     const investment4   = await votingInstance.investments(4);

    //     assert.equal(investment[0], activeInvestor2);   // Investor
    //     assert.equal(investment[1], activeInvestor1);   // Beneficiary
    //     investment[2].should.be.bignumber.equal(web3.toWei(2, 'ether'));   // Amount
    //     assert.isTrue(investment[3]);                   // Confirmed
    //     assert.isFalse(investment[4]);                  // AttemptedSettlement
    //     assert.isFalse(investment[5]);                  // CompletedSettlement

    //     assert.equal(investment1[0], activeInvestor1);   // Investor
    //     assert.equal(investment1[1], activeInvestor1);   // Beneficiary
    //     investment1[2].should.be.bignumber.equal(web3.toWei(3, 'ether'));  // Amount
    //     assert.isTrue(investment1[3]);                  // Confirmed
    //     assert.isFalse(investment1[4]);                  // AttemptedSettlement
    //     assert.isFalse(investment1[5]);                  // CompletedSettlement

    //     assert.equal(investment2[0], activeInvestor1);   // Investor
    //     assert.equal(investment2[1], activeInvestor1);   // Beneficiary
    //     investment2[2].should.be.bignumber.equal(web3.toWei(4, 'ether'));  // Amount
    //     assert.isTrue(investment2[3]);                  // Confirmed
    //     assert.isFalse(investment2[4]);                  // AttemptedSettlement
    //     assert.isFalse(investment2[5]);                  // CompletedSettlement

    //     assert.equal(investment3[0], activeInvestor2);      // Investor
    //     assert.equal(investment3[1], activeInvestor2);      // Beneficiary
    //     investment3[2].should.be.bignumber.equal(web3.toWei(5, 'ether')); // Amount
    //     assert.isFalse(investment3[3]);                     // Confirmed
    //     assert.isFalse(investment3[4]);                     // AttemptedSettlement
    //     assert.isFalse(investment3[5]);                     // CompletedSettlement

    //     assert.equal(investment4[0], activeInvestor1);      // Investor
    //     assert.equal(investment4[1], activeInvestor1);      // Beneficiary
    //     investment4[2].should.be.bignumber.equal(web3.toWei(6, 'ether'));   // Amount
    //     assert.isFalse(investment4[3]);                     // Confirmed
    //     assert.isFalse(investment4[4]);                     // AttemptedSettlement
    //     assert.isFalse(investment4[5]);                     // CompletedSettlement

    //     assert.equal(events[0].investmentId, 3);
    //     assert.equal(events[0].investor, activeInvestor2);
    //     assert.isFalse(events[0].confirmed);
    // });

    // it('should fail, because we try to trigger batchConfirmPayments with non manager account', async () => {
    //     try {
    //         await votingInstance.batchConfirmPayments([3, 4], {from: inactiveManager, gas: 1000000});

    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should fail, because we try to trigger settleInvestment before confirmation period is over', async () => {
    //     try {
    //         await votingInstance.settleInvestment(0, {from: activeManager, gas: 1000000});

    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should fail, because we try to trigger batchSettleInvestments before confirmation period is over', async () => {
    //     try {
    //         await votingInstance.batchSettleInvestments([0, 1, 2], {from: activeManager, gas: 1000000});

    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should fail, because we try to trigger finalize before confirmation period is over', async () => {
    //     try {
    //         await votingInstance.finalize();

    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // /**
    //  * [ Confirmation period over ]
    //  */
    // it('should run finaliseConfirmationPeriod successfully before confirmation period is over', async () => {
    //     console.log('[ Confirmation period over ]'.yellow);

    //     const confirmationPeriodOverBefore  = await votingInstance.confirmationPeriodOver();
    //     await votingInstance.finaliseConfirmationPeriod({from: owner, gas: 1000000});
    //     const confirmationPeriodOverAfter   = await votingInstance.confirmationPeriodOver();

    //     assert.isFalse(confirmationPeriodOverBefore);
    //     assert.isTrue(confirmationPeriodOverAfter);
    // });

    // it('should fail, because we try to mint tokens for presale after Confirmation period is over', async () => {
    //     try {
    //         await votingInstance.mintTokenPreSale(activeInvestor1, 1);

    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should fail, because we try to trigger confirmPayment after Confirmation period is over', async () => {
    //     try {
    //         await votingInstance.confirmPayment(0, {from: activeManager, gas: 1000000});

    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should fail, because we try to trigger batchConfirmPayments after Confirmation period is over', async () => {
    //     try {
    //         await votingInstance.batchConfirmPayments([3, 4], {from: activeManager, gas: 1000000});

    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should fail, because we try to trigger unConfirmPayment after Confirmation period is over', async () => {
    //     try {
    //         await votingInstance.unConfirmPayment(0, {from: activeManager, gas: 1000000});

    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should fail, because we try to trigger first settleInvestments with investmentId > 0', async () => {
    //     try {
    //         await votingInstance.settleInvestment(1, {from: activeInvestor1, gas: 1000000});

    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should fail, because we try to trigger first batchSettleInvestments with wrong investmentId order', async () => {
    //     try {
    //         await votingInstance.batchSettleInvestments([2, 1, 0], {from: activeInvestor2, gas: 1000000});

    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should run settleInvestment for first investment successfully', async () => {
    //     const investment    = await votingInstance.investments(0);
    //     const investment1   = await votingInstance.investments(1);
    //     const investment2   = await votingInstance.investments(2);
    //     const investment3   = await votingInstance.investments(3);
    //     const investment4   = await votingInstance.investments(4);

    //     investment[2].should.be.bignumber.equal(web3.toWei(2, 'ether'));   // Amount
    //     assert.isTrue(investment[3]);                   // Confirmed
    //     assert.isFalse(investment[4]);                  // AttemptedSettlement
    //     assert.isFalse(investment[5]);                  // CompletedSettlement

    //     investment1[2].should.be.bignumber.equal(web3.toWei(3, 'ether')); // Amount
    //     assert.isTrue(investment1[3]);                  // Confirmed
    //     assert.isFalse(investment1[4]);                 // AttemptedSettlement
    //     assert.isFalse(investment1[5]);                 // CompletedSettlement

    //     investment2[2].should.be.bignumber.equal(web3.toWei(4, 'ether')); // Amount
    //     assert.isTrue(investment2[3]);                  // Confirmed
    //     assert.isFalse(investment2[4]);                 // AttemptedSettlement
    //     assert.isFalse(investment2[5]);                 // CompletedSettlement

    //     investment3[2].should.be.bignumber.equal(web3.toWei(5, 'ether')); // Amount
    //     assert.isFalse(investment3[3]);                     // Confirmed
    //     assert.isFalse(investment3[4]);                     // AttemptedSettlement
    //     assert.isFalse(investment3[5]);                     // CompletedSettlement

    //     investment4[2].should.be.bignumber.equal(web3.toWei(6, 'ether'));   // Amount
    //     assert.isFalse(investment4[3]);                     // Confirmed
    //     assert.isFalse(investment4[4]);                     // AttemptedSettlement
    //     assert.isFalse(investment4[5]);                     // CompletedSettlement

    //     const balanceContractBefore     = await web3.eth.getBalance(votingInstance.address);
    //     const balanceWalletBefore       = await web3.eth.getBalance(wallet);
    //     const balanceInvestor1Before    = await icoTokenInstance.balanceOf(activeInvestor1);
    //     const balanceInvestor2Before    = await icoTokenInstance.balanceOf(activeInvestor2);

    //     await votingInstance.settleInvestment(0, {from: inactiveInvestor1, gas: 1000000});

    //     const balanceContractAfter     = await web3.eth.getBalance(votingInstance.address);
    //     const balanceInvestor1After    = await icoTokenInstance.balanceOf(activeInvestor1);
    //     const balanceInvestor2After    = await icoTokenInstance.balanceOf(activeInvestor2);

    //     balanceContractBefore.sub(balanceContractAfter).should.be.bignumber.equal(two);
    //     balanceInvestor2Before.should.be.bignumber.equal(balanceInvestor2After);

    //     const sixsixsix = new BigNumber(666);

    //     balanceContractAfter.add(web3.toWei(102, 'ether')).should.be.bignumber.equal(balanceContractBefore.add(balanceWalletBefore));

    //     balanceInvestor1Before.should.be.bignumber.equal(10);
    //     balanceInvestor1After.should.be.bignumber.equal(web3.toWei(sixsixsix, 'ether').add(10));

    //     const investmentAfter    = await votingInstance.investments(0);
    //     const investmentAfter1   = await votingInstance.investments(1);
    //     const investmentAfter2   = await votingInstance.investments(2);
    //     const investmentAfter3   = await votingInstance.investments(3);
    //     const investmentAfter4   = await votingInstance.investments(4);

    //     investmentAfter[2].should.be.bignumber.equal(web3.toWei(2, 'ether'));  // Amount
    //     assert.isTrue(investmentAfter[3]);                  // Confirmed
    //     assert.isTrue(investmentAfter[4]);                  // AttemptedSettlement
    //     assert.isTrue(investmentAfter[5]);                  // CompletedSettlement

    //     investmentAfter1[2].should.be.bignumber.equal(web3.toWei(3, 'ether'));    // Amount
    //     assert.isTrue(investmentAfter1[3]);                     // Confirmed
    //     assert.isFalse(investmentAfter1[4]);                    // AttemptedSettlement
    //     assert.isFalse(investmentAfter1[5]);                    // CompletedSettlement

    //     investmentAfter2[2].should.be.bignumber.equal(web3.toWei(4, 'ether'));    // Amount
    //     assert.isTrue(investmentAfter2[3]);                     // Confirmed
    //     assert.isFalse(investmentAfter2[4]);                    // AttemptedSettlement
    //     assert.isFalse(investmentAfter2[5]);                    // CompletedSettlement

    //     investmentAfter3[2].should.be.bignumber.equal(web3.toWei(5, 'ether'));    // Amount
    //     assert.isFalse(investmentAfter3[3]);                        // Confirmed
    //     assert.isFalse(investmentAfter3[4]);                        // AttemptedSettlement
    //     assert.isFalse(investmentAfter3[5]);                        // CompletedSettlement

    //     investmentAfter4[2].should.be.bignumber.equal(web3.toWei(6, 'ether'));  // Amount
    //     assert.isFalse(investmentAfter4[3]);                    // Confirmed
    //     assert.isFalse(investmentAfter4[4]);                    // AttemptedSettlement
    //     assert.isFalse(investmentAfter4[5]);                    // CompletedSettlement
    // });

    // it('should fail, because we try to settle an already settled investement again', async () => {
    //     try {
    //         await votingInstance.settleInvestment(0, {from: activeInvestor2, gas: 1000000});

    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should run settleBatchInvestment successfully', async () => {
    //     const investment    = await votingInstance.investments(0);
    //     const investment1   = await votingInstance.investments(1);
    //     const investment2   = await votingInstance.investments(2);
    //     const investment3   = await votingInstance.investments(3);
    //     const investment4   = await votingInstance.investments(4);

    //     investment[2].should.be.bignumber.equal(web3.toWei(2, 'ether'));   // Amount
    //     assert.isTrue(investment[3]);                   // Confirmed
    //     assert.isTrue(investment[4]);                   // AttemptedSettlement
    //     assert.isTrue(investment[5]);                   // CompletedSettlement

    //     investment1[2].should.be.bignumber.equal(web3.toWei(3, 'ether')); // Amount
    //     assert.isTrue(investment1[3]);                  // Confirmed
    //     assert.isFalse(investment1[4]);                 // AttemptedSettlement
    //     assert.isFalse(investment1[5]);                 // CompletedSettlement

    //     investment2[2].should.be.bignumber.equal(web3.toWei(4, 'ether')); // Amount
    //     assert.isTrue(investment2[3]);                  // Confirmed
    //     assert.isFalse(investment2[4]);                 // AttemptedSettlement
    //     assert.isFalse(investment2[5]);                 // CompletedSettlement

    //     investment3[2].should.be.bignumber.equal(web3.toWei(5, 'ether')); // Amount
    //     assert.isFalse(investment3[3]);                     // Confirmed
    //     assert.isFalse(investment3[4]);                     // AttemptedSettlement
    //     assert.isFalse(investment3[5]);                     // CompletedSettlement

    //     investment4[2].should.be.bignumber.equal(web3.toWei(6, 'ether'));   // Amount
    //     assert.isFalse(investment4[3]);                     // Confirmed
    //     assert.isFalse(investment4[4]);                     // AttemptedSettlement
    //     assert.isFalse(investment4[5]);                     // CompletedSettlement

    //     await votingInstance.batchSettleInvestments([1, 2]);

    //     const investmentAfter    = await votingInstance.investments(0);
    //     const investmentAfter1   = await votingInstance.investments(1);
    //     const investmentAfter2   = await votingInstance.investments(2);
    //     const investmentAfter3   = await votingInstance.investments(3);
    //     const investmentAfter4   = await votingInstance.investments(4);

    //     investmentAfter[2].should.be.bignumber.equal(web3.toWei(2, 'ether'));  // Amount
    //     assert.isTrue(investmentAfter[3]);                  // Confirmed
    //     assert.isTrue(investmentAfter[4]);                  // AttemptedSettlement
    //     assert.isTrue(investmentAfter[5]);                  // CompletedSettlement

    //     investmentAfter1[2].should.be.bignumber.equal(web3.toWei(3, 'ether'));   // Amount
    //     assert.isTrue(investmentAfter1[3]);                    // Confirmed
    //     assert.isTrue(investmentAfter1[4]);                    // AttemptedSettlement
    //     assert.isTrue(investmentAfter1[5]);                    // CompletedSettlement

    //     investmentAfter2[2].should.be.bignumber.equal(web3.toWei(4, 'ether'));   // Amount
    //     assert.isTrue(investmentAfter2[3]);                    // Confirmed
    //     assert.isTrue(investmentAfter2[4]);                    // AttemptedSettlement
    //     assert.isTrue(investmentAfter2[5]);                    // CompletedSettlement

    //     investmentAfter3[2].should.be.bignumber.equal(web3.toWei(5, 'ether'));    // Amount
    //     assert.isFalse(investmentAfter3[3]);                        // Confirmed
    //     assert.isFalse(investmentAfter3[4]);                        // AttemptedSettlement
    //     assert.isFalse(investmentAfter3[5]);                        // CompletedSettlement

    //     investmentAfter4[2].should.be.bignumber.equal(web3.toWei(6, 'ether'));  // Amount
    //     assert.isFalse(investmentAfter4[3]);                    // Confirmed
    //     assert.isFalse(investmentAfter4[4]);                    // AttemptedSettlement
    //     assert.isFalse(investmentAfter4[5]);                    // CompletedSettlement
    // });

    // it('should run settleInvestment for investment 3 (not confirmed)', async () => {
    //     const investment3 = await votingInstance.investments(3);

    //     assert.equal(investment3[0], activeInvestor2);      // Investor
    //     assert.equal(investment3[1], activeInvestor2);      // Beneficiary
    //     investment3[2].should.be.bignumber.equal(web3.toWei(5, 'ether')); // Amount
    //     assert.isFalse(investment3[3]);                     // Confirmed
    //     assert.isFalse(investment3[4]);                     // AttemptedSettlement
    //     assert.isFalse(investment3[5]);                     // CompletedSettlement

    //     const etherContractBefore     = await web3.eth.getBalance(votingInstance.address);
    //     const etherWalletBefore       = await web3.eth.getBalance(wallet);
    //     const etherInvestorBefore     = await web3.eth.getBalance(activeInvestor2);
    //     const tokenInvestor3Before    = await icoTokenInstance.balanceOf(activeInvestor2);

    //     await votingInstance.settleInvestment(3, {from: inactiveInvestor1, gas: 1000000});

    //     const etherContractAfter      = await web3.eth.getBalance(votingInstance.address);
    //     const etherWalletAfter        = await web3.eth.getBalance(wallet);
    //     const etherInvestorAfter      = await web3.eth.getBalance(activeInvestor2);
    //     const tokenInvestor3After     = await icoTokenInstance.balanceOf(activeInvestor2);

    //     etherContractBefore.sub(etherContractAfter).should.be.bignumber.equal(web3.toWei(5, 'ether'));
    //     etherWalletBefore.should.be.bignumber.equal(etherWalletAfter);
    //     etherInvestorBefore.add(web3.toWei(5, 'ether')).should.be.bignumber.equal(etherInvestorAfter);
    //     tokenInvestor3Before.should.be.bignumber.equal(tokenInvestor3After);
    //     tokenInvestor3Before.should.be.bignumber.equal(5);
    // });

    // it('should call finalize successfully', async () => {
    //     await votingInstance.token();

    //     let paused = await icoTokenInstance.paused();
    //     await icoTokenInstance.owner();
    //     const isTreasurerBefore = await icoTokenInstance.isTreasurer(votingInstance.address);

    //     assert.isTrue(isTreasurerBefore);
    //     assert.isTrue(paused);

    //     await votingInstance.finalize();

    //     paused = await icoTokenInstance.paused();
    //     assert.isFalse(paused);

    //     const isTreasurerAfter = await icoTokenInstance.isTreasurer(votingInstance.address);
    //     await icoTokenInstance.owner();

    //     assert.isFalse(isTreasurerAfter);
    // });

    // it('should not mint more tokens after finalize()', async () => {
    //     try {
    //         await icoTokenInstance.mint(owner, 1, {from: owner, gas: 1000000});

    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should settle unconfirmed investment non non-payable beneficiary wallet (token contract)', async () => {
    //     await web3.eth.getBalance(votingInstance.address);
    //     await votingInstance.batchSettleInvestments([4, 5]);
    //     await web3.eth.getBalance(votingInstance.address);

    //     const investmentAfter = await votingInstance.investments(5);

    //     investmentAfter[2].should.be.bignumber.equal(web3.toWei(7, 'ether'));   // Amount
    //     assert.isFalse(investmentAfter[3]);                                     // Confirmed
    //     assert.isTrue(investmentAfter[4]);                                      // AttemptedSettlement
    // });
});
