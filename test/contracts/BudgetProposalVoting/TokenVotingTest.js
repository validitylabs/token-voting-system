/**
 * Test for BudgetProposalVoting
 *
 * @author Validity Labs AG <info@validitylabs.org>
 */

import {assertJump, waitNDays, getEvents, BigNumber, cnf, increaseTimeTo} from '../helpers/tools';

const BudgetProposalVoting  = artifacts.require('./BudgetProposalVoting');
const LoggedToken          = artifacts.require('./LoggedToken');
const BudgetWallet          = artifacts.require('./BudgetWallet');


const should = require('chai') // eslint-disable-line
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

//const zero      = new BigNumber(0);
//const two       = new BigNumber(web3.toWei(2, 'ether'));

/**
 * BudgetProposalVoting contract
 */
contract('BudgetProposalVoting', (accounts) => {
    const owner    = accounts[0];
    const voter1   = accounts[1];
    const voter2   = accounts[2];
    const voter3   = accounts[3];

    // Provide icoTokenInstance for every test case
    let votingInstance;
    let tokenInstance;
    let walletInstance;

    beforeEach(async () => {
        votingInstance      = await BudgetProposalVoting.deployed();
        const tokenAddress  = await votingInstance.token();
        tokenInstance       = await LoggedToken.at(tokenAddress);
    });

    /**
     * [ Pre contribution period ]
     */

    // it('should instantiate the ICO crowdsale correctly', async () => {
    //     console.log('[ Pre contribution period ]'.yellow);

    //     // Set DTS to 2017-12-24T00:00:00Z CET
    //     await increaseTimeTo(1514113200);

    //     const _startTime            = await votingInstance.startTime();
    //     const _endTime              = await votingInstance.endTime();
    //     const _weiPerChf            = await votingInstance.weiPerChf();
    //     const _wallet               = await votingInstance.wallet();
    //     const _cap                  = await votingInstance.cap();
    //     const _confirmationPeriod   = await votingInstance.confirmationPeriod();
    //     const bigCap                = new BigNumber(cnf.cap);
    //     const confirmationPeriod    = new BigNumber(cnf.confirmationPeriod);

    //     _startTime.should.be.bignumber.equal(cnf.startTime);
    //     _endTime.should.be.bignumber.equal(cnf.endTime);
    //     _weiPerChf.should.be.bignumber.equal(cnf.rateWeiPerChf);
    //     _wallet.should.be.equal(wallet);
    //     _cap.should.be.bignumber.equal(bigCap.mul(10e18));
    //     _confirmationPeriod.div(60 * 60 * 24).should.be.bignumber.equal(confirmationPeriod);
    // });

    // it('should verify, the owner is added properly to manager accounts', async () => {
    //     const manager = await votingInstance.isManager(owner);

    //     assert.isTrue(manager, 'Owner should be a manager too');
    // });

    // it('should set manager accounts', async () => {
    //     const tx1 = await votingInstance.setManager(activeManager, true, {from: owner, gas: 1000000});
    //     const tx2 = await votingInstance.setManager(inactiveManager, false, {from: owner, gas: 1000000});

    //     const manager1 = await votingInstance.isManager(activeManager);
    //     const manager2 = await votingInstance.isManager(inactiveManager);

    //     assert.isTrue(manager1, 'Manager 1 should be active');
    //     assert.isFalse(manager2, 'Manager 2 should be inactive');

    //     // Testing events
    //     const events1 = getEvents(tx1, 'ChangedManager');
    //     const events2 = getEvents(tx2, 'ChangedManager');

    //     assert.equal(events1[0].manager, activeManager, 'activeManager address does not match');
    //     assert.isTrue(events1[0].active, 'activeManager expected to be active');

    //     assert.equal(events2[0].manager, inactiveManager, 'inactiveManager address does not match');
    //     assert.isFalse(events2[0].active, 'inactiveManager expected to be inactive');
    // });

    // it('should alter manager accounts', async () => {
    //     const tx1 = await votingInstance.setManager(activeManager, false, {from: owner, gas: 1000000});
    //     const tx2 = await votingInstance.setManager(inactiveManager, true, {from: owner, gas: 1000000});

    //     const manager1 = await votingInstance.isManager(activeManager);
    //     const manager2 = await votingInstance.isManager(inactiveManager);

    //     assert.isFalse(manager1, 'Manager 1 should be inactive');
    //     assert.isTrue(manager2, 'Manager 2 should be active');

    //     // Testing events
    //     const events1 = getEvents(tx1, 'ChangedManager');
    //     const events2 = getEvents(tx2, 'ChangedManager');

    //     assert.isFalse(events1[0].active, 'activeManager expected to be inactive');
    //     assert.isTrue(events2[0].active, 'inactiveManager expected to be active');

    //     // Roll back to origin values
    //     const tx3 = await votingInstance.setManager(activeManager, true, {from: owner, gas: 1000000});
    //     const tx4 = await votingInstance.setManager(inactiveManager, false, {from: owner, gas: 1000000});

    //     const manager3 = await votingInstance.isManager(activeManager);
    //     const manager4 = await votingInstance.isManager(inactiveManager);

    //     assert.isTrue(manager3, 'Manager 1 should be active');
    //     assert.isFalse(manager4, 'Manager 2 should be inactive');

    //     const events3 = getEvents(tx3, 'ChangedManager');
    //     const events4 = getEvents(tx4, 'ChangedManager');

    //     assert.isTrue(events3[0].active, 'activeManager expected to be active');
    //     assert.isFalse(events4[0].active, 'inactiveManager expected to be inactive');
    // });

    // it('should fail, because we try to set manager from unauthorized account', async () => {
    //     try {
    //         await votingInstance.setManager(activeManager, false, {from: activeInvestor1, gas: 1000000});
    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should whitelist investor accounts', async () => {
    //     const tx1 = await votingInstance.whiteListInvestor(activeInvestor1, {from: owner, gas: 1000000});
    //     const tx2 = await votingInstance.whiteListInvestor(activeInvestor2, {from: activeManager, gas: 1000000});

    //     const whitelisted1 = await votingInstance.isWhitelisted(activeInvestor1);
    //     const whitelisted2 = await votingInstance.isWhitelisted(activeInvestor2);

    //     assert.isTrue(whitelisted1, 'Investor1 should be whitelisted');
    //     assert.isTrue(whitelisted2, 'Investor2 should be whitelisted');

    //     // Testing events
    //     const events1 = getEvents(tx1, 'ChangedInvestorWhitelisting');
    //     const events2 = getEvents(tx2, 'ChangedInvestorWhitelisting');

    //     assert.equal(events1[0].investor, activeInvestor1, 'Investor1 address doesn\'t match');
    //     assert.isTrue(events1[0].whitelisted, 'Investor1 should be whitelisted');

    //     assert.equal(events2[0].investor, activeInvestor2, 'Investor2 address doesn\'t match');
    //     assert.isTrue(events2[0].whitelisted, 'Investor2 should be whitelisted');
    // });

    // it('should unwhitelist investor account', async () => {
    //     const tx            = await votingInstance.unWhiteListInvestor(inactiveInvestor1, {from: owner, gas: 1000000});
    //     const whitelisted   = await votingInstance.isWhitelisted(inactiveInvestor1);

    //     assert.isFalse(whitelisted, 'inactiveInvestor1 should be unwhitelisted');

    //     // Testing events
    //     const events = getEvents(tx, 'ChangedInvestorWhitelisting');

    //     assert.equal(events[0].investor, inactiveInvestor1, 'inactiveInvestor1 address doesn\'t match');
    //     assert.isFalse(events[0].whitelisted, 'inactiveInvestor1 should be unwhitelisted');
    // });

    // it('should fail, because we try to whitelist investor from unauthorized account', async () => {
    //     try {
    //         await votingInstance.whiteListInvestor(inactiveInvestor1, {from: activeInvestor2, gas: 1000000});
    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should fail, because we try to unwhitelist investor from unauthorized account', async () => {
    //     try {
    //         await votingInstance.whiteListInvestor(activeInvestor1, {from: activeInvestor2, gas: 1000000});
    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should fail, because we try to run batchWhiteListInvestors with a non manager account', async () => {
    //     try {
    //         await votingInstance.batchWhiteListInvestors([activeInvestor1, activeInvestor2], {from: activeInvestor2, gas: 1000000});
    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should fail, because we try to run unWhiteListInvestor with a non manager account', async () => {
    //     try {
    //         await votingInstance.unWhiteListInvestor(activeInvestor1, {from: activeInvestor2, gas: 1000000});
    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should whitelist 2 investors by batch function', async () => {
    //     await votingInstance.unWhiteListInvestor(activeInvestor1, {from: owner, gas: 1000000});
    //     await votingInstance.unWhiteListInvestor(activeInvestor2, {from: owner, gas: 1000000});

    //     const tx = await votingInstance.batchWhiteListInvestors([activeInvestor1, activeInvestor2], {from: owner, gas: 1000000});

    //     const whitelisted1  = await votingInstance.isWhitelisted(activeInvestor1);
    //     const whitelisted2  = await votingInstance.isWhitelisted(activeInvestor2);

    //     assert.isTrue(whitelisted1, 'activeInvestor1 should be whitelisted');
    //     assert.isTrue(whitelisted2, 'activeInvestor2 should be whitelisted');

    //     // Testing events
    //     const events = getEvents(tx, 'ChangedInvestorWhitelisting');

    //     assert.equal(events[0].investor, activeInvestor1, 'Investor1 address doesn\'t match');
    //     assert.isTrue(events[0].whitelisted, 'Investor1 should be whitelisted');

    //     assert.equal(events[1].investor, activeInvestor2, 'Investor2 address doesn\'t match');
    //     assert.isTrue(events[1].whitelisted, 'Investor2 should be whitelisted');
    // });

    // it('should verify the investor account states succesfully', async () => {
    //     const whitelisted1  = await votingInstance.isWhitelisted(activeInvestor1);
    //     const whitelisted2  = await votingInstance.isWhitelisted(activeInvestor2);
    //     const whitelisted3  = await votingInstance.isWhitelisted(inactiveInvestor1);

    //     assert.isTrue(whitelisted1, 'activeInvestor1 should be whitelisted');
    //     assert.isTrue(whitelisted2, 'activeInvestor2 should be whitelisted');
    //     assert.isFalse(whitelisted3, 'inactiveInvestor1 should be unwhitelisted');
    // });

    // it('should fail, because we try to mint tokens for presale with a non owner account', async () => {
    //     try {
    //         await votingInstance.mintTokenPreSale(activeInvestor1, 1, {from: activeManager, gas: 1000000});

    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should fail, because we try to mint tokens more as cap limit allows', async () => {
    //     try {
    //         const big = new BigNumber(95000000 * 1e18);
    //         await votingInstance.mintTokenPreSale(activeInvestor1, (cnf.cap + big.add(1)));

    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should fail, because we try to trigger buyTokens in before contribution time is started', async () => {
    //     try {
    //         await votingInstance.buyTokens(activeInvestor1, {from: activeInvestor2, gas: 1000000});

    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should fail, because we try to trigger the fallback function before contribution time is started', async () => {
    //     try {
    //         await votingInstance.sendTransaction({
    //             from:   owner,
    //             value:  web3.toWei(1, 'ether'),
    //             gas:    700000
    //         });

    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should mint tokens for presale', async () => {
    //     const activeInvestor1Balance1   = await icoTokenInstance.balanceOf(activeInvestor1);
    //     const activeInvestor2Balance1   = await icoTokenInstance.balanceOf(activeInvestor2);
    //     const tenB                       = new BigNumber(10);
    //     const fiveB                      = new BigNumber(5);

    //     activeInvestor1Balance1.should.be.bignumber.equal(zero);
    //     activeInvestor2Balance1.should.be.bignumber.equal(zero);

    //     const tx1 = await votingInstance.mintTokenPreSale(activeInvestor1, 10);
    //     const tx2 = await votingInstance.mintTokenPreSale(activeInvestor2, 5);

    //     const activeInvestor1Balance2 = await icoTokenInstance.balanceOf(activeInvestor1);
    //     const activeInvestor2Balance2 = await icoTokenInstance.balanceOf(activeInvestor2);

    //     activeInvestor1Balance2.should.be.bignumber.equal(tenB);
    //     activeInvestor2Balance2.should.be.bignumber.equal(fiveB);

    //     // Testing events
    //     const events1 = getEvents(tx1, 'TokenPurchase');
    //     const events2 = getEvents(tx2, 'TokenPurchase');

    //     assert.equal(events1[0].purchaser, owner, '');
    //     assert.equal(events2[0].purchaser, owner, '');

    //     assert.equal(events1[0].beneficiary, activeInvestor1, '');
    //     assert.equal(events2[0].beneficiary, activeInvestor2, '');

    //     events1[0].value.should.be.bignumber.equal(zero);
    //     events1[0].amount.should.be.bignumber.equal(tenB);

    //     events2[0].value.should.be.bignumber.equal(zero);
    //     events2[0].amount.should.be.bignumber.equal(fiveB);
    // });

    // /**
    //  * [ Contribution period ]
    //  */
    // it('should turn the time 35 days forward to contribution period', async () => {
    //     console.log('[ Contribution period ]'.yellow);
    //     await waitNDays(35);
    // });

    // it('should fail, because we try to trigger buyTokens as unwhitelisted investor', async () => {
    //     try {
    //         await votingInstance.buyTokens(activeInvestor1, {from: inactiveInvestor1, gas: 1000000, value: web3.toWei(2, 'ether')});

    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should fail, because we try to trigger buyTokens with a too low investment', async () => {
    //     try {
    //         await votingInstance.buyTokens(
    //             activeInvestor1,
    //             {from: activeInvestor1, gas: 1000000, value: web3.toWei(1, 'ether')}
    //         );

    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

    // it('should fail, because we try to trigger buyTokens for beneficiary 0x0', async () => {
    //     try {
    //         await votingInstance.buyTokens(
    //             '0x0',
    //             {from: activeInvestor1, gas: 1000000, value: web3.toWei(1, 'ether')}
    //         );

    //         assert.fail('should have thrown before');
    //     } catch (e) {
    //         assertJump(e);
    //     }
    // });

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
