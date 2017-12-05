pragma solidity ^0.4.18;


import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './BudgetWallet.sol';
import './LoggedToken.sol';
import './Proposal.sol';


contract BudgetProposalVoting is Ownable {

    BudgetWallet wallet;

    LoggedToken token;

    Proposal currentProposal;

    enum Stages {
    AcceptingProposal,
    AcceptingVotes,
    AcceptingPayoutClaims,
    LockUpPeriod
    }

    // This is the current stage.
    Stages public stage = Stages.AcceptingProposal;



    modifier atStage(Stages _stage) {
        require(stage == _stage);
        _;
    }


    // Perform timed transitions. Be sure to mention
    // this modifier first, otherwise the guards
    // will not take the new stage into account.
    modifier timedTransitions() {
        if (stage == Stages.AcceptingVotes &&
        now > currentProposal.blocktime() + VOTING_PERIOD)
        if (currentProposal.countYesVotes() >= currentProposal.countNoVotes())
        stage = Stages.AcceptingPayoutClaims;
        else
        stage = Stages.LockUpPeriod;

        if (stage == Stages.LockUpPeriod &&
        now > currentProposal.blocktime() + VOTING_PERIOD + LOCKUP_PERIOD)
        stage = Stages.AcceptingProposal;

        _;
    }

    uint constant VOTING_PERIOD = 2 weeks;

    uint constant LOCKUP_PERIOD = 20 days;

    event ProposalVoted(address voter, uint votes, bool isYes);

    function BudgetProposalVoting(BudgetWallet _wallet, LoggedToken _token) public Ownable() {
        wallet = _wallet;
        token = _token;
    }


    function createProposal(uint _amount, string _name, string _url, bytes32 _hashvalue, address _beneficiary)
        public onlyOwner() timedTransitions atStage(Stages.AcceptingProposal){
        require(token.mintingFinished());//Checklist: this requires that minting can't be restarted in MintableToken.
        currentProposal= new Proposal(_amount, block.timestamp, _name, _url, _hashvalue, _beneficiary);
        stage= Stages.AcceptingVotes;
    }

    function vote(bool isYes) public timedTransitions atStage(Stages.AcceptingVotes) {
        uint balance = token.balanceOfAt(msg.sender, currentProposal.blocktime());
        require(balance > 0);
        currentProposal.vote(msg.sender, balance, isYes);
        ProposalVoted(msg.sender, balance, isYes);
    }

    function claimFunds() public timedTransitions atStage(Stages.AcceptingPayoutClaims) {
        require(currentProposal != address(0x0) || currentProposal.blocktime() + VOTING_PERIOD >= block.timestamp);
        wallet.authorizePayment(currentProposal.beneficiaryAccount(), currentProposal.amount());

    }


}
