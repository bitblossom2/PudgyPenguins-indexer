/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  PudgyPenguins,
  PudgyPenguins_CreatePenguin,
  PudgyPenguins_Transfer,
  PudgyPenguins_Account
} from "generated";

const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

PudgyPenguins.CreatePenguin.handler(async ({ event, context }) => {
  const entity: PudgyPenguins_CreatePenguin = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    event_id: event.params.id,
    timestamp: event.block.timestamp,
  };

  context.PudgyPenguins_CreatePenguin.set(entity);
});


PudgyPenguins.Transfer.handler(async ({ event, context }) => {

  const entity: PudgyPenguins_Transfer = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    from: event.params.from,
    to: event.params.to,
    tokenId: event.params.tokenId,
    price: 0n, 
  };

  context.PudgyPenguins_Transfer.set(entity);
  
  const tokenId = event.params.tokenId.toString();
  let account = await context.PudgyPenguins_Account.get(tokenId);
  const isBurnEvent = event.params.to === ADDRESS_ZERO;
  const isSelfTransfer = event.params.to.toLowerCase() === event.params.from.toLowerCase();

  if (!account) {
    account = {
      id: tokenId,
      currentOwner: event.params.to,
      isOriginalOwner: true,
      lastUpdatedBlock: event.block.number,
      mintedAt: event.block.timestamp,
      isBurned: isBurnEvent, 
    };
  } else {
      let old_OG_Owner = account.isOriginalOwner
      // We just want to keep info about the first owner
      if (!isSelfTransfer && old_OG_Owner == true) { old_OG_Owner = false}
      account = {
        ...account,
        currentOwner: event.params.to,
        isOriginalOwner: old_OG_Owner,
        lastUpdatedBlock: event.block.number,
        isBurned: isBurnEvent,
      };
  }

  context.PudgyPenguins_Account.set(account);
});

