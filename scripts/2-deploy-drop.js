import { AddressZero } from '@ethersproject/constants';
import { readFileSync } from 'fs';
import sdk from './1-initialize-sdk.js';

(async () => {
  try {
    /*
      1. deploy EditionDrop which will give us contract address
      2. take the contract address and pass it to thirdWeb sdk to initialise the contract on the sdk
      3. get the metadata of our contract
    */

    const editionDropAddress = await sdk.deployer.deployEditionDrop({
      name: 'BDayGiftDAO Membership',
      description: "A DAO for choosing a gift for someone's birthday.",
      image: readFileSync('./assets/dao_membership_nft.gif'),
      // We need to pass in the address of the person who will be receiving the proceeds from sales of nfts in the contract.
      // We're planning on not charging people for the drop, so we'll pass in the 0x0 address
      // you can set this to your own wallet address if you want to charge for the drop.
      primary_sale_recipient: AddressZero,
    });

    // above function returns the address of our contract
    // use this address to initialise the contract on thirdweb sdk
    const editionDrop = await sdk.getEditionDrop(editionDropAddress);

    // get the metadata of the contract after initialising it
    const metadata = await editionDrop.metadata.get();

    console.log(
      '✅ Successfully deployed editionDrop contract, address:',
      editionDropAddress
    );
    console.log('✅ editionDrop metadata:', metadata);
  } catch (e) {
    console.log('failed to deploy editionDrop contract', e);
  }
})();
