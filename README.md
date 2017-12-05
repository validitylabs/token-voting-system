#Architecture 'Vote By Token Shares'
##Purpose and Functional Requirements
roland.kofler@validitylabs.org
2017-11-25

The purpose of this contracts is to allow to vote with tokens on proposals and assign budgets to it.
> We are basing our work heavily on the OpenZeppelin Solidity library. On top of a vanilla Crowdsale we need the ability to keep Ether in Escrow and perform a proposal-vote-payout mechanism. e.g.:
- Crowdsale makes 10k ETH until endTime
- After endTime owner makes a proposal to payOut themselves 1k ETH (they also pass a URL and a hash along with the proposal for explanatory purposes)
- All token hodlers have 2 weeks to vote yes or no on the proposal
- By the end of the 2 week period the result is assessed, if a simple majority votes in favor the amount will be paid out to the beneficiary account specified in the proposal
- If the vote turns out as "no" then there is a 20 day lock up period in which the owner can not make new proposals to prevent spamming by owner.

## Quality Attributes
Smart contracts have intrinsically:
1. **highest security requirements**
2. **high requirements on gas operating costs**. In fact the fluctuating gas prices impose themselfs a risk of service operation.
Derived from the functional requirements no specific Quality Attributes arise.
## Design Principles
1. **Open Closed Principle**: Open for extension, closed for modification. Because security audits are costly and time-consuming, because modification of existing code is more risky than plugging in different modules on well defined interfaces, we endorse this paradigm
2. **Build on Standards**: Reuse existing proven frameworks and libraries when possible (mostly Zeppelin)
## Structure

<figure>
  <img src="https://docs.google.com/drawings/d/e/2PACX-1vSShpqEuN_4H4prc6OWfMu7_Y3x8QOhJQDU7Z4PV4drNCDcTZaTm3wiCpBg9i8fhdMphvFTEmH9xEf9/pub?w=960&h=720" alt="my alt text"/>
  <figcaption> </figcaption>
</figure>
*LoggedTokenCrowdsale*  extend Zeppelins Crowdsale and overrides [createTokenContract()](https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/crowdsale/Crowdsale.sol#L58") so that we can use our *LoggedToken*. LoggedToken extends *MintableToken* with a feature copied by MiniMeToken: [balanceOfAt(address _owner, uint _blockNumber)](https://github.com/Giveth/minime/blob/master/contracts/MiniMeToken.sol#L282). This feature is used to snapshot the balance of tokens at proposal creation time. Only those addresses who hold tokens at the given blockheight can then vote on the proposal. *VotingStrategy* encapsulates the algorithm to decide the outcome of a *Proposal* ballot. This would make it easy to change the logic for the next foreseable step: requiring a minimal voting threshold (i.e. a *Quorum*)
## Behavior
### 1. Initialization of the contract system
![Initialization of System UML Sequence Diagramm](https://docs.google.com/drawings/d/e/2PACX-1vTVoR-51Pz5SVK6chiPQP3lvSIKEGCb9e8l97oqaH0QtUgz6TXjx5Ttu7nxylcXiXtgPDCcM39Zjnby/pub?w=480&h=720)
First the *BudgetWallet* contracts must be created and injected in the constructor of the *LoggedTokenCrowdsale*. Only the address of the Wallet is required as the Crowdsale must only send funds to that address without caring if its a contract or an Externally Owned Address (EOA).During construction time, the *LoggedTokenCrowdsale* creates an instance of *LoggedToken*. This in inherited functionality enforced by Zeppelin's *Crowdsale* contract.
Now the constructor of the voting system *BudgetProposalVoting* is called with both the token and the wallet as parameter.
Finally the ownership of the *BudgetWallet* is handed over to the voting system, so that only this contract can withdraw funds.

### 2. Proposal creation
![ ](https://docs.google.com/drawings/d/e/2PACX-1vTcQmGO-_5KbjiUw0vWIdR0vj420rpF4SS3ZteP6tKvoZ0T0UbrzC_7dfKpcoF17LGkG9V3h5i27Q1p/pub?w=302&h=709  "Proposal Creation UML Sequence Diagram")
In order to hinder the voting system to issue proposals before the crowdsale endet, it has always to check `hasEnded()` of the LoggedTokenCrowdsale or better [mintFinished](https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/token/MintableToken.sol#L20) of the MintableToken not introducing a dependency to the Crowdsale contract.
For now the preconditions for creating a proposals are:
1. crowdsale ended
2. owner is proposing
3. no other proposal is currently voted for or it's budget not redeemed
This allows us to use a simple struct of one active proposals, while logging all proposals as *EVM Events* instead of storing a history of proposals.
4. owner has collected funds of the last proposal if it was successful.
It is important that new proposals remember the blockheight of their creation so that we can retrieve the balance of tokens at creation time borrowing from MiniMeToken's `balanceOfAt()`logic.
### 3. Voting for a proposal
Voting starts after the owner successfully created a new Proposal.
Voting rule is:
 1. Each tokenholder at proposal time blockheight can vote with the weight of his token.
 2. as long as the voting period is not over
 3. he can do this only once per proposal
![Proposal Struct UML Class Diagram](https://docs.google.com/drawings/d/e/2PACX-1vSCa5LAdKXLdO84SY8epOJXmy_p5Ac3Ouv1XSH_FzAZ_P7SfyfqL1ZJcC8OlG_2zeRc7gFa4O6PnnQx/pub?w=328&h=158)
### 4. Redemption of the budget
Following conditions must hold
1. only Owner can redeem
2. voting period must be over to redeem
3. voting must have been successful, `countYesVotes > countNoVotes`, to redeem
4. If not redeemed, owner can't issue a new proposal
## Security Issues
Not comprehensive assesment of security issues
### Economic attacks
1. Front running - a informed attacker can buy many tokens before a specific proposal will be made. He then can use this weight to nudge the outcome towards his advantage.

##Further Improvements
Some suggestions what to do next:
1. Develop a EIP standard for token voting
2. Allow for multiple proposals in parallel
3. Allow for different amounts of budget per proposal



