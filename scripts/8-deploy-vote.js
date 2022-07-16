import sdk from './1-initialize-sdk.js';

(async () => {
  try {
    const voteContractAddress = await sdk.deployer.deployVote({
      // Governance contract's name.
      name: 'BdayGiftDAO governance contract',

      // Location of our governance token (ERC-20 contract)
      voting_token_address: '0x01b9b15C35d1fA8F45cB8aD79ba4B7CadC49a2AF',

      // These parameters are specified in number of blocks.
      // Assuming block time of around 13.14 seconds (for Ethereum)

      // After a proposal is created, when can members start voting?
      // Set to immediately for now
      voting_delay_in_blocks: 0,

      // How long do members have to vote on a proposal when it's created?
      // we will set it to 1 day = 6570 blocks
      voting_period_in_blocks: 6570,

      // The minimum % of the total supply that need to vote for
      // the proposal to be valid after the time for the proposal has ended.
      voting_quorum_fraction: 0,

      // What's the minimum # of tokens a user needs to be allowed to create a proposal?
      // I set it to 0. Meaning no tokens are required for a user to be allowed to
      // create a proposal.
      proposal_token_threshold: 0,
    });

    console.log(
      '✅ Successfully deployed vote contract, address:',
      voteContractAddress
    );
  } catch (err) {
    console.error('Failed to deploy vote contract', err);
  }
})();
