import sdk from './1-initialize-sdk.js';

// Governance contract (which will have 80% tokens transferred to its acc)
const vote = sdk.getVote('0x562E9e92eD36B5C06726090c1eFaf2EfB56C3fc7');

// ERC-20 contract
const token = sdk.getToken('0x01b9b15C35d1fA8F45cB8aD79ba4B7CadC49a2AF');

(async () => {
  try {
    // Give our voting/governance contract the power to mint additional tokens if needed
    await token.roles.grant('minter', vote.getAddress());

    console.log(
      'Successfully gave vote contract permissions to act on token contract'
    );
  } catch (error) {
    console.error(
      'failed to grant vote contract permissions on token contract',
      error
    );
    process.exit(1);
  }

  try {
    // Grab our wallet's token balance, since we hold almost the entire supply right now
    const ownedTokenBalance = await token.balanceOf(process.env.WALLET_ADDRESS);

    // Grab 80% of the supply that we hold.
    const ownedAmount = ownedTokenBalance.displayValue;
    const percent80 = (Number(ownedAmount) / 100) * 80;

    // Transfer 80% of the supply to our voting contract.
    await token.transfer(vote.getAddress(), percent80);

    console.log(
      `✅ Successfully transferred ${percent80} tokens to vote contract`
    );
  } catch (err) {
    console.error('failed to transfer tokens to vote contract', err);
  }
})();
