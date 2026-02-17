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
  // is self transfer?
  const isSelfTransfer = event.params.to.toLowerCase() === event.params.from.toLowerCase();

  if (!account) {
    account = {
      id: tokenId,
      currentOwner: event.params.to,
      transferCount: 0 ,
      isOriginalOwner: true, 
      lastUpdatedBlock: event.block.number,
      mintedAt: event.block.timestamp,
      isBurned: isBurnEvent, 
      lastSalePrice: 0.03,
    };
  } else {
      let oldTransferCount = account.transferCount
      // We just want to keep info about the first owner, so if its not the actual, transferCount must be 1
      if (isSelfTransfer && oldTransferCount == 0) { oldTransferCount = 1}
      account = {
        ...account,
        currentOwner: event.params.to,
        transferCount: oldTransferCount +1,
        lastUpdatedBlock: event.block.number,
        isBurned: isBurnEvent,
        lastSalePrice: oldTransferCount,
      };
  }

  context.PudgyPenguins_Account.set(account);
});

