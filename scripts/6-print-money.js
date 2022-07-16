import sdk from './1-initialize-sdk.js';

// This is the address of our ERC-20 contract printed out in the step before.
const token = sdk.getToken('0x01b9b15C35d1fA8F45cB8aD79ba4B7CadC49a2AF');

(async () => {
  try {
    // The max supply you want to set. 1,000,000 tokens
    const amount = 1_000_000;
    // Interact with your deployed ERC-20 contract and mint the tokens!
    await token.mintToSelf(amount);
    const totalSupply = await token.totalSupply();

    // Print out how many of our tokens are out there now!
    console.log(
      '✅ There now is',
      totalSupply.displayValue,
      '$CONFETTI in circulation'
    );
  } catch (error) {
    console.error('Failed to print money', error);
  }
})();
