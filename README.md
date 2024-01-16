# Crypto Mixers Towards Practical Equilibrium with Regulatory Compliance

## Introduction
The ZK Crypto Mixer is a privacy-enhancing tool designed to facilitate confidential and untraceable transactions within the blockchain space. The technology enables users to obfuscate the source and destination of their digital assets, ensuring a high level of transactional privacy.

Tornado Cash is one of the most popular cryptomixer.

## Some basic usecases
- Privacy Protection
- Anti-Surveillance
- Anonymous Spending
- Protecting Business Transactions

## Challanges
While Tornado Cash has been a pioneering solution in the realm of privacy-focused transactions, it has faced challenges related to malicious users exploiting the platform, leading to unintended consequences for innocent users.

- Money Laundering and Illicit Activities
- Regulatory Scrutiny
- Association with unknown Transactions

## Solution Approach
In simpler terms, Privacy Pools offer a unique way to boost privacy in blockchain transactions. Instead of just proving a withdrawal's connection to a particular deposit, users show they belong to a specific group called an "association set." This set, determined by a Merkle root shared publicly, can vary widely – from just the user's deposit to a broader collection of all past deposits.

users prove their membership by using the same commitment in two zero-knowledge proofs. One proof links to the total set of commitments, and the other links to the association set root. This flexibility allows users to specify a range of potential origins for their funds, giving them control over how private their transactions are.

*Example:* Imagine honest users (like Alice, Bob, Carl, and David) alongside a not-so-honest user (Eve). When making withdrawals, users decide their association sets – including their deposit and potentially excluding others. Honest users might avoid including Eve to steer clear of stolen funds, while Eve's set includes everyone. Observers can then make educated guesses about the origin of specific withdrawals, like #5 possibly coming from Eve.

This system isn't reliant on users being nice. Honest users have reasons to prove they aren't associated with bad actors. Creating association sets involves deciding which deposits to include, providing users with a flexible way to manage privacy during blockchain transactions. It's all about finding a balance – maximizing privacy while minimizing the risk of looking suspicious to outside parties.

Users won't manually select deposits; instead, they'll subscribe to association set providers (ASPs) that generate sets with specific properties. ASPs can operate on-chain or off-chain, automatically or with human intervention.

``` mermaid
graph TD
  subgraph User1
    A1[Deposit with Commitment]
    B1[Share Commitment]
  end

  subgraph User2
    A2[Request Withdrawal]
    B2[Generate Proof]
  end

  subgraph ASP
    C[Generate Association Set]
    D[Provide Merkle Root]
  end

  subgraph PrivacyPoolsContract
    E[Verify Proofs]
    F[Execute Withdrawal]
  end

  A1 -->|1. Deposit| B1
  B1 -->|2. Share Commitment| A2
  A2 -->|3. Request Withdrawal| B2
  B2 -->|4. Generate Proof| C
  C -->|5. Generate Set| D
  D -->|6. Share Merkle Root| E
  E -->|7. Verify Proofs| F
```

## Folder Structure
- BC : Blockchain(contains the smartcontract for deposite and withdraw and types of ASP's and the verification contract for proof)

- BE : Backend(contains the API for the ASP's)

- Circuit: Contains the circom zk-circuit

- FE: Frontend(contains the Next js code)

- subgraph: contains the subgraph for the storing of merkle tree for the ASP's


## Protocols used
- [Anon Aadhar](https://github.com/privacy-scaling-explorations/anon-aadhaar)
- [Ethereum Attestation Service](https://attest.sh/)
- [The Graph](https://thegraph.com/)

## Chains(TEST NETWORKS)

### SCROLL
- [ASP](https://sepolia.scrollscan.com/address/0x102af2ea115c572d995e3661760cfb5d2b3585dd)
- [CRYPTO MIXERS](https://sepolia.scrollscan.com/address/0x8Bd77D1274f566a4E6Bb984cbd510ee90C9a91dE)
- [Anon Aadhar](https://sepolia.scrollscan.com/address/0xb0A8Efb58379820c67ea7c736AF29b096fd1b3A9)
- [USDC](https://sepolia.scrollscan.com/address/0xc26f7163A0756A337b67c3c597ca985B180e0874)
- [ERC20 Mixer](https://sepolia.scrollscan.com/address/0xfc3C38852b2F8082eDBc9A041EC67C4BeDe5d8b6)

### BASE
- [ASP](https://goerli.basescan.org/address/0x7aab9f60d40b0107ee574f8e778b6a030f072bb7)
- [CRYPTO MIXERS](https://goerli.basescan.org/address/0x8a912ce78d6401bf318d29fA2007109931CCc3aC)
- [Anon Aadhar](https://goerli.basescan.org/address/0xe5Bf9D9BEd5Ed34e58C533774919E0fE378deef6)
- [USDC](https://goerli.basescan.org/address/0x102Af2EA115C572D995e3661760cFB5D2b3585dD)
- [ERC20 Mixer](https://goerli.basescan.org/address/0xb0A8Efb58379820c67ea7c736AF29b096fd1b3A9)

### ARBITRUM
- [ASP](https://goerli.arbiscan.io/address/0xde38ec85ed35a530644d3febc296d0b13bc78674)
- [CRYPTO MIXERS](https://goerli.arbiscan.io/address/0x2755876B1504808504D9a59c12346e7441DD349F)
- [Anon Aadhar]()
- [USDC]()
- [ERC20 Mixer]()

### CELO
- [ASP](https://alfajores.celoscan.io/address/0x41332a5b45833a2f441a7374f40fc6bab1e5b06e)
- [CRYPTO MIXERS](https://alfajores.celoscan.io/address/0xD8163aAc6692A8260683b8DeB1d8B0367aE16DfE)
- [Anon Aadhar]()
- [USDC]()
- [ERC20 Mixer]()

### MANTLE
- [ASP](https://explorer.testnet.mantle.xyz/address/0xD8163aAc6692A8260683b8DeB1d8B0367aE16DfE)
- [CRYPTO MIXERS](https://explorer.testnet.mantle.xyz/address/0x042C84d108DCc422C87B1E78B5F81bA3915B0817)
- [Anon Aadhar]()
- [USDC]()
- [ERC20 Mixer]()

### OKX
- [ASP](https://www.oklink.com/x1-test/address/0x6121c1abb06cb6788075acd9f960ecd9d3c2a22f)
- [CRYPTO MIXERS](https://www.oklink.com/x1-test/address/0x042C84d108DCc422C87B1E78B5F81bA3915B0817)
- [Anon Aadhar](https://www.oklink.com/x1-test/address/0x41332a5b45833a2F441a7374F40fC6BAb1e5B06E)
- [USDC](https://www.oklink.com/x1-test/address/0xD8163aAc6692A8260683b8DeB1d8B0367aE16DfE)
- [ERC20 Mixer](https://www.oklink.com/x1-test/address/0x2755876B1504808504D9a59c12346e7441DD349F)

### POLYGONZKEVM
- [ASP]()
- [CRYPTO MIXERS]()
- [Anon Aadhar]()
- [USDC]()
- [ERC20 Mixer]()

### POLYGON
- [ASP]()
- [CRYPTO MIXERS]()
- [Anon Aadhar]()
- [USDC]()
- [ERC20 Mixer]()


## Subgraph link
[Commitments]()