pragma solidity ^0.4.18;


import 'zeppelin-solidity/contracts/payment/PullPayment.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';


contract BudgetWallet is PullPayment, Ownable {

    event PaymentAuthorized(address _dest, uint _amount);

    function authorizePayment(address _dest, uint _amount) public onlyOwner{
        asyncSend(_dest, _amount);
        PaymentAuthorized(_dest, _amount);
    }

    function () public payable {

    }
}
