pragma solidity ^0.4.18;


import 'zeppelin-solidity/contracts/crowdsale/FinalizableCrowdsale.sol';
import './LoggedToken.sol';
import './BudgetWallet.sol';


contract LoggedTokenCrowdsale is FinalizableCrowdsale {
    LoggedToken public loggedToken;

    function LoggedTokenCrowdsale(uint256 _startTime, uint256 _endTime, uint256 _rate, BudgetWallet _wallet) public Crowdsale(_startTime, _endTime, _rate, _wallet.owner()) {
    }

    // created a logged token and exposes it
    function createTokenContract() internal returns (MintableToken) {
        loggedToken = new LoggedToken("MyToken", 1,"TKY"); //TODO: parametrize this properly
        return loggedToken;
    }

    function finalization() internal {
        loggedToken.finishMinting();
    }
}
