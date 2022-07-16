/* eslint-disable no-nested-ternary */
import {
  useAddress,
  useMetamask,
  useEditionDrop,
  useToken,
  useVote,
  useNetwork,
} from '@thirdweb-dev/react';
import { AddressZero } from '@ethersproject/constants';
import { ChainId } from '@thirdweb-dev/sdk';
import { useState, useEffect, useMemo } from 'react';

const App = () => {
  const address = useAddress();
  const network = useNetwork();
  const connectWithMetamask = useMetamask();
  console.log('Address: ', address);

  // Initialise our editionDrop contract
  const editionDrop = useEditionDrop(
    '0x9C10351ea2224649EA7710E2903a9551152919fF'
  );

  // Initialise our token contract
  const token = useToken('0x01b9b15C35d1fA8F45cB8aD79ba4B7CadC49a2AF');

  // Governance contract
  const vote = useVote('0x562E9e92eD36B5C06726090c1eFaf2EfB56C3fc7');

  // State variable for us to know if user has our NFT
  const [hasClaimedNFT, setHasClaimedNFT] = useState(null);

  // Loading state while the NFT is minting
  const [isClaiming, setIsClaiming] = useState(false);

  // Holds the amount of token each member has in state.
  const [memberTokenAmounts, setMemberTokenAmounts] = useState([]);
  // The array holding all of our members addresses.
  const [memberAddresses, setMemberAddresses] = useState([]);

  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // A fancy function to shorten someones wallet address, no need to show the whole thing.
  const shortenAddress = (str) =>
    `${str.substring(0, 6)}...${str.substring(str.length - 4)}`;

  // This useEffect grabs all the addresses of our members holding our NFT.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // Grab the users who hold our NFT with tokenId 0
    const getAllAddresses = async () => {
      try {
        const memberAddressesFromEditionDrop =
          await editionDrop.history.getAllClaimerAddresses(0);
        setMemberAddresses(memberAddressesFromEditionDrop);
        console.log('🚀 Members addresses', memberAddressesFromEditionDrop);
      } catch (error) {
        console.error('failed to get member list', error);
      }
    };
    getAllAddresses();
  }, [hasClaimedNFT, editionDrop.history]);

  // Retrieve all our existing proposals from the contract.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // A simple call to vote.getAll() to grab the proposals.
    const getAllProposals = async () => {
      try {
        const proposalsResult = await vote.getAll();
        setProposals(proposalsResult);
        console.log('🌈 Proposals:', proposalsResult);
      } catch (error) {
        console.log('failed to get proposals', error);
      }
    };
    getAllProposals();
  }, [hasClaimedNFT, vote]);

  // We also need to check if the user already voted.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // If we haven't finished retrieving the proposals from the useEffect above
    // then we can't check if the user voted yet!
    if (!proposals.length) {
      return;
    }

    const checkIfUserHasVoted = async () => {
      try {
        const hasVotedResult = await vote.hasVoted(
          proposals[0].proposalId,
          address
        );
        setHasVoted(hasVotedResult);
        if (hasVotedResult) {
          console.log('🥵 User has already voted');
        } else {
          console.log('🙂 User has not voted yet');
        }
      } catch (error) {
        console.error('Failed to check if wallet has voted', error);
      }
    };
    checkIfUserHasVoted();
  }, [hasClaimedNFT, proposals, address, vote]);

  // This useEffect grabs the # of token each member holds.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    const getAllBalances = async () => {
      try {
        const amounts = await token.history.getAllHolderBalances();
        setMemberTokenAmounts(amounts);
        console.log('👜 Amounts', amounts);
      } catch (error) {
        console.error('failed to get member balances', error);
      }
    };
    getAllBalances();
  }, [hasClaimedNFT, token.history]);

  // Now, we combine the memberAddresses and memberTokenAmounts into a single array
  const memberList = useMemo(
    () =>
      memberAddresses.map((mAddress) => {
        // We're checking if we are finding the mAddress in the memberTokenAmounts array.
        // If we are, we'll return the amount of token the user has.
        // Otherwise, return 0.
        const member = memberTokenAmounts?.find(
          ({ holder }) => holder === mAddress
        );

        return {
          mAddress,
          tokenAmount: member?.balance.displayValue || '0',
        };
      }),
    [memberAddresses, memberTokenAmounts]
  );

  console.log('member list', memberList);

  useEffect(() => {
    if (!address) {
      return;
    }

    const checkBalance = async () => {
      try {
        const balance = await editionDrop.balanceOf(address, 0); // 0 because the tokenId of our membership NFT is 0.

        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log('🌟 this user has a membership NFT!');
        } else {
          setHasClaimedNFT(false);
          console.log("😭 this user doesn't have a membership NFT.");
        }
      } catch (e) {
        setHasClaimedNFT(false);
        console.log('Failed to get balance of the NFT. Error:', e);
      }
    };

    checkBalance();
  }, [address, editionDrop]);

  const mintNft = async () => {
    try {
      setIsClaiming(true);
      await editionDrop.claim('0', 1);
      console.log(
        `🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${editionDrop.getAddress()}/0`
      );
      setHasClaimedNFT(true);
    } catch (error) {
      setHasClaimedNFT(false);
      console.error('Failed to mint NFT', error);
    } finally {
      setIsClaiming(false);
    }
  };

  if (address && network?.[0].data.chain.id !== ChainId.Rinkeby) {
    return (
      <div className="unsupported-network">
        <h2>Please connect to Rinkeby</h2>
        <p>
          This dapp only works on the Rinkeby network, please switch networks in
          your connected wallet.
        </p>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to BDayGiftDAO</h1>
        <button
          type="button"
          onClick={connectWithMetamask}
          className="btn-hero"
        >
          Connect your Wallet
        </button>
      </div>
    );
  }

  // Add this little piece!
  if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <h1>🎁DAO Member Page</h1>
        <p>Congratulations on being a member</p>
        <div>
          {memberList.length !== 0 ? (
            <>
              <div>
                <h2>Member List</h2>
                <table className="card">
                  <thead>
                    <tr>
                      <th>Address</th>
                      <th>Token Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberList.map((member) => (
                      <tr key={member.mAddress}>
                        <td>{shortenAddress(member.mAddress)}</td>
                        <td>{member.tokenAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <h2>Active Proposals</h2>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    // before we do async things, we want to disable the button to prevent double clicks
                    setIsVoting(true);

                    // lets get the votes from the form for the values
                    const votes = proposals.map((proposal) => {
                      const voteResult = {
                        proposalId: proposal.proposalId,
                        // abstain by default
                        vote: 2,
                      };
                      proposal.votes.forEach((voteForProposal) => {
                        const elem = document.getElementById(
                          `${proposal.proposalId}-${voteForProposal.type}`
                        );

                        if (elem.checked) {
                          voteResult.vote = voteForProposal.type;
                        }
                      });
                      return voteResult;
                    });

                    // first we need to make sure the user delegates their token to vote
                    try {
                      // we'll check if the wallet still needs to delegate their tokens before they can vote
                      const delegation = await token.getDelegationOf(address);
                      // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
                      if (delegation === AddressZero) {
                        // if they haven't delegated their tokens yet, we'll have them delegate them before voting
                        await token.delegateTo(address);
                      }
                      // then we need to vote on the proposals
                      try {
                        await Promise.all(
                          votes.map(async ({ proposalId, vote: _vote }) => {
                            // before voting we first need to check whether the proposal is open for voting
                            // we first need to get the latest state of the proposal
                            const proposal = await vote.get(proposalId);
                            // then we check if the proposal is open for voting (state === 1 means it is open)
                            if (proposal.state === 1) {
                              // if it is open for voting, we'll vote on it
                              return vote.vote(proposalId, _vote);
                            }
                            // if the proposal is not open for voting we just return nothing, letting us continue
                          })
                        );
                        try {
                          // if any of the propsals are ready to be executed we'll need to execute them
                          // a proposal is ready to be executed if it is in state 4
                          await Promise.all(
                            votes.map(async ({ proposalId }) => {
                              // we'll first get the latest state of the proposal again, since we may have just voted before
                              const proposal = await vote.get(proposalId);

                              // if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
                              if (proposal.state === 4) {
                                return vote.execute(proposalId);
                              }
                            })
                          );
                          // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
                          setHasVoted(true);
                          // and log out a success message
                          console.log('successfully voted');
                        } catch (err) {
                          console.error('failed to execute votes', err);
                        }
                      } catch (err) {
                        console.error('failed to vote', err);
                      }
                    } catch (err) {
                      console.error('failed to delegate tokens');
                    } finally {
                      // in *either* case we need to set the isVoting state to false to enable the button again
                      setIsVoting(false);
                    }
                  }}
                >
                  {proposals.map((proposal) => (
                    <div key={proposal.proposalId} className="card">
                      <h5>{proposal.description}</h5>
                      <div>
                        {proposal.votes.map(({ type, label }) => (
                          <div key={type}>
                            <input
                              type="radio"
                              id={`${proposal.proposalId}-${type}`}
                              name={proposal.proposalId}
                              value={type}
                              // default the "abstain" vote to checked
                              defaultChecked={type === 2}
                            />
                            <label htmlFor={`${proposal.proposalId}-${type}`}>
                              {label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button disabled={isVoting || hasVoted} type="submit">
                    {isVoting
                      ? 'Voting...'
                      : hasVoted
                      ? 'You Already Voted'
                      : 'Submit Votes'}
                  </button>
                  {!hasVoted && (
                    <small>
                      This will trigger multiple transactions that you will need
                      to sign.
                    </small>
                  )}
                </form>
              </div>
            </>
          ) : null}
        </div>
      </div>
    );
  }
  if (hasClaimedNFT === null) {
    return (
      <div className="landing">
        <h1>Fetching your details from blockchain...</h1>
      </div>
    );
  }

  // Render mint nft screen.
  return (
    <div className="mint-nft">
      <h1>
        Mint your free <br /> BDayGift🎁 DAO Membership NFT
      </h1>
      <button type="button" disabled={isClaiming} onClick={mintNft}>
        {isClaiming ? 'Minting...' : 'Mint your nft (FREE)'}
      </button>
    </div>
  );
};

export default App;
