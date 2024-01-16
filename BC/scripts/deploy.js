// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

async function main() {
  // deploy hasher
  const Hasher = await ethers.getContractFactory("Hasher");
  const hasher = await Hasher.deploy();
  await hasher.deployed();
  console.log('Hasher deployed at',hasher.address);

 // deploy verifier
 const Verifier = await ethers.getContractFactory("Groth16Verifier");
 const verifier = await Verifier.deploy();
 await verifier.deployed();
 console.log('Verifier deployed at',verifier.address);

 const ASP = await ethers.getContractFactory("ASP");
 const asp = await ASP.deploy(hasher.address);
 await asp.deployed();
 console.log('ASP deployed at',asp.address);

 // verifier for Anon
 const VerifierAnon = await ethers.getContractFactory("Verifier");
 const verifierAnon = await VerifierAnon.deploy();
  await verifierAnon.deployed();
  const _verifierAnonAddress = verifierAnon.address;
  // Setup you appId in the smart contract
  const appId = ethers.BigNumber.from("650010406386009349199801826845867124209471193088").toString();


 const AnonAadhaarVerifier = await ethers.getContractFactory("AnonAadhaarVerifier");
 const anonAadhaarVerifier = await AnonAadhaarVerifier.deploy(_verifierAnonAddress, appId);
 await anonAadhaarVerifier.deployed();
 console.log('anonAadhaarVerifier deployed at',anonAadhaarVerifier.address);


 const AnonASP = await ethers.getContractFactory("AnonASP");
 const anonAsp = await AnonASP.deploy(hasher.address, anonAadhaarVerifier.address);
 await anonAsp.deployed();
 console.log('ANonASP deployed at',anonAsp.address);


  const USDC = await ethers.getContractFactory("USDC");
  const usdc = await USDC.deploy();
  await usdc.deployed();
  console.log('USDC deployed at',usdc.address);

    // deploy CryptoMixer
    const CryptoMixer = await ethers.getContractFactory("CryptoMixer");
    const cryptoMixer = await CryptoMixer.deploy(hasher.address, verifier.address, asp.address);
    await cryptoMixer.deployed();
    console.log('CryptoMixer deployed at',cryptoMixer.address);

    let tx = await cryptoMixer.addAsp([anonAsp.address])
    await tx.wait()

  // deploy cryptoMixerERC20
  const CryptoMixerERC20 = await ethers.getContractFactory("CryptoMixerERC20");
  const cryptoMixerERC20 = await CryptoMixerERC20.deploy(hasher.address, verifier.address, asp.address, usdc.address);
  await cryptoMixerERC20.deployed();
  console.log('cryptoMixerERC20 deployed at',cryptoMixerERC20.address);
  tx = await cryptoMixerERC20.addAsp([anonAsp.address])
  await tx.wait()



  // Verify contracts
  await verifyContract("Hasher", hasher.address);
  await verifyContract("Groth16Verifier", verifier.address);
  await verifyContract("ASP", asp.address, [hasher.address]);
  await verifyContract("USDC", usdc.address);
  await verifyContract("CryptoMixer", cryptoMixer.address, [hasher.address, verifier.address, asp.address]);
  await verifyContract("AnonASP", cryptoMixerERC20.address, [hasher.address, verifier.address, asp.address, usdc.address]);
  await verifyContract("CryptoMixerERC20", anonAsp.address, [hasher.address, anonAadhaarVerifier.address]);
  
}

async function verifyContract(contractName, contractAddress, constructorArguments = []) {
  console.log(`Verifying ${contractName} at ${contractAddress}...`);
  await hre.run("verify:verify", {
    address: contractAddress,
    constructorArguments: constructorArguments,
  });
  console.log(`${contractName} verified successfully!`);
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
