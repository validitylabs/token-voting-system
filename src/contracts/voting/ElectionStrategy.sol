pragma solidity ^0.4.18;

interface ElectionStrategy {

    function isYes(uint countYes, uint countNo) public view returns (bool);
}