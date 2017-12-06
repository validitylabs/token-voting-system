pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './ElectionStrategy.sol';

contract SimpleElectionStrategy is ElectionStrategy, Ownable{

        function SimpleElectionStrategy() public Ownable(){
        }

        function isYes(uint countYes, uint countNo) public view returns (bool){
            return countYes > countNo;
        }


}
