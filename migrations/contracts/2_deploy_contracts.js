const moment = require('moment');

const LoggedTokenCrowdsale = artifacts.require('LoggedTokenCrowdsale');
const BudgetWallet = artifacts.require('BudgetWallet');
const LoggedToken = artifacts.require('LoggedToken');
const BudgetProposalVoting = artifacts.require('BudgetProposalVoting');
const SimpleElectionStrategy = artifacts.require('SimpleElectionStrategy');


module.exports = async (deployer) => {
    //TODO: Config these values
    const startTime = moment(new Date('2019-12-12')).format('X');
    const endTime = moment(new Date('2020-12-12')).format('X');
    const rate = 1;
    const owner= web3.eth.coinbase;

    let tokenAddress;

    deployer.deploy(BudgetWallet)
        .then( () => {
            return deployer.deploy(SimpleElectionStrategy); //TODO: change strategy if needed
        })
        .then(() => {
            return deployer.deploy(LoggedTokenCrowdsale, startTime, endTime, rate, BudgetWallet.address);
        })
        .then( () => {
            return LoggedTokenCrowdsale.deployed();
        })
        .then( (crowdsale) => {
            console.log('crowdsaleInstance address: ', crowdsale.address);
            crowdsale.token.call().then(
                function (res) { // eslint-disable-line
                    console.log('crowdsale.token address: ', res);
                });
            crowdsale.wallet.call().then(
                function (res){ // eslint-disable-line
                    console.log('crowdsale.wallet address: ', res);
                });
            return crowdsale.token();
        })
        .then( (address) => {
            const tokenInstance  =  LoggedToken.at(address);
            return deployer.deploy(BudgetProposalVoting, BudgetWallet.address, address, SimpleElectionStrategy.address);
        })
        .then( () => {
            return BudgetProposalVoting.deployed();
        })
        .then( (voting) => {
            voting.token.call().then(
                function (res) { // eslint-disable-line
                    console.log('voting.token address: ', res);
                });
            voting.wallet.call().then(
                function (res){ // eslint-disable-line
                    console.log('voting.wallet address: ', res);
                });
            voting.electionStrategy.call().then(
                function (res){ // eslint-disable-line
                    console.log('voting.electionStrategy address: ', res);
                });
            return BudgetWallet.deployed();
        })
        .then( (wallet) => {
            wallet.transferOwnership(BudgetProposalVoting.address);
            console.log(`ownership of BudgetWallet ${wallet.address} transfered to BudgetProposalVoting ${BudgetProposalVoting.address}.`);
        });

};
