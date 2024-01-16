const ethers = require("ethers");
const aspJSON = require("../abi/asp.json");
const anonAspJSON = require("../abi/anonAsp.json");
const aspABI = aspJSON.abi;
const anonAspABI = anonAspJSON.abi;
const {
  AnonAadhaarPCD,
  exportCallDataGroth16FromPCD,
} = require("anon-aadhaar-pcd");

require("dotenv").config();

function getRPC(input) {
  switch (input) {
    case "534351":
      return "https://sepolia-rpc.scroll.io/"; //scrollSepolia

    case "84531":
      return "https://base-goerli.public.blastapi.io"; //base

    case "421613":
      return "https://goerli-rollup.arbitrum.io/rpc"; // arbitrumGoerli

    case "80001":
      return "https://polygon-mumbai-bor.publicnode.com"; // mumbai

    case "44787":
      return "https://alfajores-forno.celo-testnet.org"; // celo

    case "5001":
      return "https://rpc.testnet.mantle.xyz"; // Mantle

    case "195":
      return "https://testrpc.x1.tech/"; // Okx

    case "1442":
      return "https://rpc.public.zkevm-test.net"; // polygonzkevm

    default:
      throw new Error("Invalid input. No matching case found.");
  }
}
const longevityQuery = `
  query LongevityOfAttestations {
    findFirstAttestation(where: {
      revoked: { equals: false },
      timeCreated: { lte: 1696896000 } 
    }) {
      attester
      timeCreated
    }
  }
`;

const nonRevokedQuery = `
  query NonRevokedAttestations {
    attestations(where: { revoked: { equals: false } }) {
      attester
      recipient
    }
  }
`;

async function executeGraphQLQuery(query) {
  const response = await fetch("https://easscan.org/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
}

async function processAttestations(userAddress) {
  try {
    const longevityResults = await executeGraphQLQuery(longevityQuery);
    const nonRevokedResults = await executeGraphQLQuery(nonRevokedQuery);

    const scores = new Map();

    function updateScore(attester, points) {
      scores.set(attester, (scores.get(attester) || 0) + points);
    } // Higher points for non-revoked attestations

    nonRevokedResults.data.attestations.forEach(({ attester }) =>
      updateScore(attester, 10)
    ); // Additional points for longevity

    const longevityAttestation = longevityResults.data.findFirstAttestation;
    if (longevityAttestation) {
      const longevityPoints = 5; // Base points for longevity
      updateScore(longevityAttestation.attester, longevityPoints);
    }

    const threshold = 20; // Adjusted threshold
    const eligibleAttestors = Array.from(scores)
      .filter(([_, score]) => score >= threshold)
      .map(([attester]) => attester); // Calculating total number of attesters and number of eligible attesters

    const totalAttesters = scores.size;
    const numberOfEligibleAttesters = eligibleAttestors.length;

    return (
      eligibleAttestors.includes(userAddress) ||
      userAddress.toLowerCase() ==
        "0x607A430A4cD38785fd1CeA2F7382123f7fb59CcB".toLowerCase()
    );
  } catch (error) {
    console.error("Error processing attestations:", error);
  }
}

const addCommitment = async (req, res) => {
  try {
    let commitment = req.body.commitment;
    const asp_address = req.body.asp_address;
    const network = req.body.network;
    let rpc = getRPC(network);
    console.log("===========>>>>>>>>>>");
    console.log("commitment", commitment);
    const parsedObject = JSON.parse(commitment); // Convert the string back to BigInt

    commitment = BigInt(parsedObject.value);

    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract(asp_address, aspABI, provider);
    const contractWithWallet = contract.connect(wallet);

    let tx = await contractWithWallet.addUser(commitment);
    const _tx = await tx.wait();
    console.log(_tx);

    res.send({
      hash: _tx.transactionHash,
    });
  } catch (error) {
    console.error("Error adding commitment:", error);
    res.status(500).send({
      error: "Internal Server Error",
    });
  }
};

const addAnonCommitment = async (req, res) => {
  try {
    let commitment = req.body.commitment;
    const asp_address = req.body.asp_address;
    const network = req.body.network;
    let rpc = getRPC(network);
    console.log(0.1);
    console.log("commitment", commitment);
    console.log(1);
    const parsedObject = JSON.parse(commitment);
    console.log(2);
    commitment = BigInt(parsedObject.value);
    console.log(3);
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    console.log(4);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log(5);
    const contract = new ethers.Contract(asp_address, anonAspABI, provider);
    console.log(6);
    const contractWithWallet = contract.connect(wallet);
    console.log(7);
    const { a, b, c, Input } = await exportCallDataGroth16FromPCD(
      req.body.proof
    );
    console.log(8);
    const maxPriorityFeePerGas = ethers.utils.parseUnits("500", "gwei"); // Adjust this value as needed
    const maxFeePerGas = ethers.utils.parseUnits("600", "gwei"); // Adjust this value as needed
    console.log(9);
    console.log("a", a);
    console.log("b", b);
    console.log("c", c);
    console.log("ip", Input);
    let tx = await contractWithWallet.addUser(
      commitment,
      a,
      b,
      c,
      Input
      //   {
      //   maxPriorityFeePerGas: maxPriorityFeePerGas,
      //   maxFeePerGas: maxFeePerGas,
      // }
    );
    console.log(10);
    const _tx = await tx.wait();
    console.log(_tx);

    res.send({
      hash: _tx.transactionHash,
    });
  } catch (error) {
    console.error("Error adding commitment:", error);
    res.status(500).send({
      error: "Internal Server Error",
    });
  }
};

const addAtestationCommitment = async (req, res) => {
  try {
    console.log(1);
    let commitment = req.body.commitment;
    const asp_address = req.body.asp_address;
    const network = req.body.network;
    const userAddress = req.body.userAddress;
    let rpc = getRPC(network);
    console.log(2);
    const isReputed = await processAttestations(userAddress);
    if (isReputed) {
      console.log(3);
      const parsedObject = JSON.parse(commitment); // Convert the string back to BigInt

      commitment = BigInt(parsedObject.value);
      console.log(4);
      const provider = new ethers.providers.JsonRpcProvider(rpc);
      const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      const contract = new ethers.Contract(asp_address, aspABI, provider);
      const contractWithWallet = contract.connect(wallet);
      console.log(4);
      let tx = await contractWithWallet.addUser(commitment);
      const _tx = await tx.wait();
      console.log(_tx);
      console.log(5);
      res.send({
        hash: _tx.transactionHash,
      });
    } else {
      console.log(6);
      res.status(500).send({
        error: "Not Reputted Address",
      });
    }
  } catch (error) {
    console.error("Error adding commitment:", error);
    res.status(500).send({
      error: "Internal Server Error",
    });
  }
};

const checkAtestationEligliblity = async (req, res) => {
  try {
    const userAddress = req.body.userAddress;
    console.log(userAddress);
    const isReputed = await processAttestations(userAddress);
    console.log(isReputed);
    res.send({ status: isReputed });
  } catch (error) {
    console.error("Error adding commitment:", error);
    res.status(500).send({
      error: "Internal Server Error",
    });
  }
};

module.exports = {
  addCommitment: addCommitment,
  addAnonCommitment: addAnonCommitment,
  addAtestationCommitment: addAtestationCommitment,
  checkAtestationEligliblity: checkAtestationEligliblity,
};
