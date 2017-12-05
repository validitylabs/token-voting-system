var moment = require("moment");

const LoggedTokenCrowdsale = artifacts.require('LoggedTokenCrowdsale')
const Crowdsale = artifacts.require('Crowdsale')
const BudgetWallet = artifacts.require('BudgetWallet')
const LoggedToken = artifacts.require('LoggedToken')
const MintableToken = artifacts.require('MintableToken')
const BudgetProposalVoting = artifacts.require('BudgetProposalVoting')


module.exports = function (deployer) {
  startTime = moment(new Date('2019-12-12')).format('X')
  endTime = moment(new Date('2020-12-12')).format('X')

  deployer.deploy(BudgetWallet).then( () => {
    deployer.deploy(LoggedTokenCrowdsale, startTime, endTime, 12, BudgetWallet.address)
  }).then(() => console.log('finished'))
};
