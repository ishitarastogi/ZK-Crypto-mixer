import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt } from "@graphprotocol/graph-ts"
import { userAdded } from "../generated/CryptoMixer/CryptoMixer"

export function createuserAddedEvent(
  root: BigInt,
  hashPairings: Array<BigInt>,
  pairDirection: Array<i32>
): userAdded {
  let userAddedEvent = changetype<userAdded>(newMockEvent())

  userAddedEvent.parameters = new Array()

  userAddedEvent.parameters.push(
    new ethereum.EventParam("root", ethereum.Value.fromUnsignedBigInt(root))
  )
  userAddedEvent.parameters.push(
    new ethereum.EventParam(
      "hashPairings",
      ethereum.Value.fromUnsignedBigIntArray(hashPairings)
    )
  )
  userAddedEvent.parameters.push(
    new ethereum.EventParam(
      "pairDirection",
      ethereum.Value.fromI32Array(pairDirection)
    )
  )

  return userAddedEvent
}
