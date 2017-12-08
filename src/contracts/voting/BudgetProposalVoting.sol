pragma solidity ^0.4.18;


import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './BudgetWallet.sol';
import './LoggedToken.sol';
import './ElectionStrategy.sol';


contract BudgetProposalVoting is Ownable {

    BudgetWallet public wallet;

    LoggedToken public token;

    struct Proposal {
        uint  amount;
        string  name;
        string  url;
        bytes32  hashvalue;
        address  beneficiaryAccount;
        uint  blocktime ;
        uint  countNoVotes;
        uint  countYesVotes;
        mapping(address => bool)  hasVoted;
    }

    Proposal[] public proposals;

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
        now > currentProposal().blocktime + VOTING_PERIOD)
        if (electionStrategy.isYes(currentProposal().countYesVotes, currentProposal().countNoVotes)){
            stage = Stages.AcceptingPayoutClaims;
        }else{
            stage = Stages.LockUpPeriod;
        }
        if (stage == Stages.LockUpPeriod &&
        now > currentProposal().blocktime + VOTING_PERIOD + LOCKUP_PERIOD)
        stage = Stages.AcceptingProposal;

        _;
    }

    uint constant VOTING_PERIOD = 2 weeks;

    uint constant LOCKUP_PERIOD = 20 days;

    ElectionStrategy public electionStrategy;


    function BudgetProposalVoting(BudgetWallet _wallet, LoggedToken _token, ElectionStrategy _electionStrategy) public Ownable() {
        require(address(_token) != address(0x0));
        require(address(_wallet) != address(0x0));
        require(address(_electionStrategy) != address(0x0));
        wallet = _wallet;
        token = _token;
        electionStrategy = _electionStrategy;
    }

    event ProposalCreated(uint amount, string name, string url, bytes32 hashvalue, address beneficiary);
    function createProposal(uint _amount, string _name, string _url, bytes32 _hashvalue, address _beneficiary)
        public onlyOwner() timedTransitions atStage(Stages.AcceptingProposal){
        //TODO: require(token.mintingFinished());//Checklist: this requires that minting can't be restarted in MintableToken.
        proposals.push( Proposal(_amount, _name, _url, _hashvalue,_beneficiary, block.timestamp, 0,0));
        stage= Stages.AcceptingVotes;
        ProposalCreated(_amount, _name, _url, _hashvalue, _beneficiary);
    }

    event ProposalVoted(address voter, uint votes, bool isYes);
    function vote(bool isYes) public timedTransitions  atStage(Stages.AcceptingVotes) {
        uint votes = token.balanceOfAt(msg.sender, currentProposal().blocktime);
        require(votes > 0);
        Proposal storage proposal = proposals[proposals.length - 1];
        require(!proposal.hasVoted[msg.sender]);
        if (isYes)
            proposal.countYesVotes = proposal.countYesVotes + votes;
        else
            proposal.countNoVotes = proposal.countNoVotes + votes;
        ProposalVoted(msg.sender, votes, isYes);
    }

    event FundsReleased(address beneficiary, uint amount);
    //@dev: anyone can release the funds, only the beneficiary receives them
    function releaseFunds() public timedTransitions atStage(Stages.AcceptingPayoutClaims) {
        //require(currentProposal().blocktime + VOTING_PERIOD >= block.timestamp);
        wallet.authorizePayment(currentProposal().beneficiaryAccount, currentProposal().amount);
        FundsReleased(currentProposal().beneficiaryAccount, currentProposal().amount);
    }

    function currentProposal() internal view returns ( Proposal ){
        return proposals[proposals.length - 1];
    }



}
