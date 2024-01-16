import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt } from "@graphprotocol/graph-ts"
import { userAdded } from "../generated/schema"
import { userAdded as userAddedEvent } from "../generated/CryptoMixer/CryptoMixer"
import { handleuserAdded } from "../src/crypto-mixer"
import { createuserAddedEvent } from "./crypto-mixer-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let root = BigInt.fromI32(234)
    let hashPairings = [BigInt.fromI32(234)]
    let pairDirection = [123]
    let newuserAddedEvent = createuserAddedEvent(
      root,
      hashPairings,
      pairDirection
    )
    handleuserAdded(newuserAddedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("userAdded created and stored", () => {
    assert.entityCount("userAdded", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "userAdded",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "root",
      "234"
    )
    assert.fieldEquals(
      "userAdded",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "hashPairings",
      "[234]"
    )
    assert.fieldEquals(
      "userAdded",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "pairDirection",
      "[123]"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
