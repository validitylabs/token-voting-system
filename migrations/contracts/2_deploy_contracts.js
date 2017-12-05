const moment = require('moment');

const LoggedTokenCrowdsale = artifacts.require('LoggedTokenCrowdsale');
const BudgetWallet = artifacts.require('BudgetWallet');
const LoggedToken = artifacts.require('LoggedToken');
const BudgetProposalVoting = artifacts.require('BudgetProposalVoting');

module.exports = async (deployer) => {
    const startTime = moment(new Date('2019-12-12')).format('X');
    const endTime = moment(new Date('2020-12-12')).format('X');
    const rate = 12;

    let tokenAddress;
    let crowdsaleInstance;
    deployer.deploy(BudgetWallet)
        .then(()=>{
            return deployer.deploy(LoggedTokenCrowdsale, startTime, endTime, rate, BudgetWallet.address);
        })
        .then( () => {
             return LoggedTokenCrowdsale.deployed();
        })
        .then( (instance) => {
            console.log("crowdsaleInstance address: ", instance.address);
            crowdsaleInstance = instance;
            return crowdsaleInstance.token();
        })
        .then( (address) => {
            console.log("token address: ", address);
            const tokenInstance  =  LoggedToken.at(address);
            deployer.deploy(BudgetProposalVoting, BudgetWallet.address, tokenInstance);
        });

};
