import sdk from './1-initialize-sdk.js';

const editionDrop = sdk.getEditionDrop(
  '0x9C10351ea2224649EA7710E2903a9551152919fF'
);
const token = sdk.getToken('0x01b9b15C35d1fA8F45cB8aD79ba4B7CadC49a2AF');

(async () => {
  try {
    // get all the addresses of people that own the membership NFT with tokenId 0
    const walletAddresses = await editionDrop.history.getAllClaimerAddresses(0);

    if (walletAddresses.length === 0) {
      console.log('No NFTs have been claimed yet.');
      process.exit(0);
    }

    // loop through the array of addresses.
    const airdropTargets = walletAddresses.map((address) => {
      const randomAmount = Math.floor(
        Math.random() * (10000 - 1000 + 1) + 1000
      );
      console.log('✅ Going to airdrop', randomAmount, 'tokens to', address);

      const airdropTarget = {
        toAddress: address,
        amount: randomAmount,
      };

      return airdropTarget;
    });

    console.log('Starting airdrop...');
    await token.transferBatch(airdropTargets);
    console.log(
      '✅ Successfully airdropped tokens to all the holders of the NFT!'
    );
  } catch (e) {
    console.log('Failed to airdrop tokens', e);
  }
})();
