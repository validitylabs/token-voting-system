pragma solidity ^0.4.18;


import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract Proposal is Ownable{
    
        uint public amount;
        uint public blocktime ;
        string public name;
        string public url;
        bytes32 public hashvalue;
        mapping(address => bool) public hasVoted;
        uint public countYesVotes;
        uint public countNoVotes;
        address public beneficiaryAccount;
        
        function Proposal(uint _amount, uint _blocktime, string _name, string _url, bytes32 _hashvalue, address _beneficiaryAccount) public Ownable(){
            amount = _amount;
            blocktime = _blocktime;
            name = _name;
            url = _url;
            hashvalue = _hashvalue;
            beneficiaryAccount = _beneficiaryAccount;
            
        }
        
        function vote(address voter, uint votes, bool isYes) public onlyOwner {
            require(!hasVoted[voter]);
            if (isYes)
              countYesVotes = countYesVotes + votes;
            else 
              countNoVotes = countNoVotes +votes;
        }
        
        
}
