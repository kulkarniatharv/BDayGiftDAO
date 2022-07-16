import { MaxUint256 } from '@ethersproject/constants';
import sdk from './1-initialize-sdk.js';

const editionDrop = sdk.getEditionDrop(
  '0x9C10351ea2224649EA7710E2903a9551152919fF'
);

(async () => {
  try {
    const claimConditions = [
      {
        // When people are gonna be able to start claiming the NFTs (now)
        startTime: new Date(),
        // The maximum number of NFTs that can be claimed.
        maxQuantity: 50_000,
        // The price of our NFT (free)
        price: 0,
        // The amount of NFTs people can claim in one transaction.
        quantityLimitPerTransaction: 1,
        // We set the wait between transactions to MaxUint256, which means
        // people are only allowed to claim once.
        waitInSeconds: MaxUint256,
      },
    ];

    // here 0 is tokenId for our membership NFT
    await editionDrop.claimConditions.set('0', claimConditions);
    console.log('✅ Successfully set claim condition!');
  } catch (e) {
    console.log('Failed to set claim condition for the NFT', e);
  }
})();
