import { userAdded as userAddedEvent } from "../generated/CryptoMixer/CryptoMixer";
import { mixerCommitment } from "../generated/schema";
import { BigInt, log } from "@graphprotocol/graph-ts";

export function handleUserAdded(event: userAddedEvent): void {
  let entity = mixerCommitment.load('0');

  if (entity == null) {
    entity = new mixerCommitment('0');
    entity.totalLeafs = BigInt.fromI32(0);
    entity.commitments = [];
  }

  // entity.commitments.push(event.params.hashPairings[0]);
  entity.totalLeafs = entity.totalLeafs.plus(BigInt.fromI32(1));
  const newCommitments = entity.commitments.concat([event.params.hashPairings[0]]);
  entity.commitments = newCommitments;
  
  entity.save();
}
