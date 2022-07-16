import { readFileSync } from 'fs';
import sdk from './1-initialize-sdk.js';

const editionDrop = sdk.getEditionDrop(
  '0x9C10351ea2224649EA7710E2903a9551152919fF'
);

(async () => {
  try {
    await editionDrop.createBatch([
      {
        name: 'Excited present receiver',
        description: 'This NFT will give you access to BDayGiftDAO',
        image: readFileSync('./assets/dao_membership_nft.gif'),
      },
    ]);
    console.log('✅ Successfully created a new NFT in the drop!');
  } catch (e) {
    console.log('Failed to create NFT:', e);
  }
})();
