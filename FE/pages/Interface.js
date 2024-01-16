import { useState, useContext, useRef, useEffect } from "react";
import utils from "../utils/$u.js";
import { ethers } from "ethers";
import styles from "../style/Interface.module.css";
import AccountContext from "../utils/accountContext";
const wc = require("../circuit/witness_calculator.js");
const cryptoMixerJSON = require("../json/CryptoMixer.json");
const cryptoMixerABI = cryptoMixerJSON.abi;
const cryptoMixerInterface = new ethers.utils.Interface(cryptoMixerABI);
var axios = require("axios");

const aspJSON = require("../json/Asp.json");
const aspABI = aspJSON.abi;
const aspInterface = new ethers.utils.Interface(aspABI);
const erc20ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
];

let tempData = null;
import { serialize } from "anon-aadhaar-pcd";
import { useAnonAadhaar } from "anon-aadhaar-react";
const signer = ethers.Wallet.createRandom();

export default function Interface() {
  const proofTextAreaRef = useRef(null);
  const [anonAadhaar] = useAnonAadhaar();
  const withdrawTextAreaRef = useRef(null); // Add this line to declare withdrawTextAreaRef
  const [showTextArea, setShowTextArea] = useState(false); // New state to track textarea visibility
  const [activeTab, setActiveTab] = useState("deposit");
  const [token, setToken] = useState("Native Token");
  const [amount, setAmount] = useState("0.01");
  const { account } = useContext(AccountContext);
  const [proofElements, updateProofElements] = useState(null);
  const [asp, setAsp] = useState("Basic ASP");
  const [withdrawProof, setWithdrawProof] = useState("");
  // const [proof, setProof] = useState("");
  const [aspData, updateAspData] = useState(null);
  const [contractAddresses, setContractAddresses] = useState({});
  const [ethBalance, setEthBalance] = useState("0");
  const [usdcBalance, setUsdcBalance] = useState("0");

  useEffect(() => {
    if (anonAadhaar.status === "logged-in") {
      console.log("anonAadhaar.pcd=====>", anonAadhaar.pcd);
    }
  }, [anonAadhaar]);

  useEffect(() => {
    async function loadAddresses() {
      try {
        const response = await fetch("/contractAddresses.json");
        const allAddresses = await response.json();
        const addressesForCurrentNetwork =
          allAddresses[account.chainId.toString()] || {};

        setContractAddresses(addressesForCurrentNetwork);
        console.log("Loaded addresses:", addressesForCurrentNetwork);
      } catch (error) {
        console.error("Failed to fetch contract addresses", error);
      }
    }

    if (account && account.chainId) {
      loadAddresses();
    }
  }, [account]);
  useEffect(() => {
    const fetchBalances = async () => {
      if (!account || !account.address) return;

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(account.address);
      setEthBalance(ethers.utils.formatEther(balance));

      const usdcContract = new ethers.Contract(
        "0xA6048249e3F8D0676140c7A1CA3C7db426CB7266",
        erc20ABI,
        provider
      );
      const usdcBalance = await usdcContract.balanceOf(account.address);
      setUsdcBalance(ethers.utils.formatUnits(usdcBalance, 6));
    };

    fetchBalances();
  }, [account, activeTab]);

  const handleASPChange = (e) => {
    setAsp(e.target.value);
    setShowTextArea(true);
  };
  const handleTokenChange = async (e) => {
    const selectedToken = e.target.value;
    setToken(selectedToken);
    setAmount(selectedToken === "Native Token" ? "0.01" : "1000");
  };
  const deposit = async () => {
    if (token === "USDC") {
      await approveUSDC();
      await depositUSDC();
    } else {
      await depositEther();
    }
  };
  const approveUSDC = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const usdcContract = new ethers.Contract(
        contractAddresses.usdc,
        erc20ABI,
        signer
      );

      const amountToApprove = ethers.utils.parseUnits("1000", 6);
      const tx = await usdcContract.approve(
        contractAddresses.usdcMixer,
        amountToApprove
      );
      await tx.wait();

      console.log("Approval transaction successful:", tx.hash);
    } catch (error) {
      console.error("Approval transaction failed:", error);
    }
  };
  const depositUSDC = async () => {
    const secret = ethers.BigNumber.from(
      ethers.utils.randomBytes(32)
    ).toString();
    const nullifier = ethers.BigNumber.from(
      ethers.utils.randomBytes(32)
    ).toString();

    const input = {
      secret: utils.BN256ToBin(secret).split(""),
      nullifier: utils.BN256ToBin(nullifier).split(""),
    };

    var res = await fetch("/deposit.wasm");
    var buffer = await res.arrayBuffer();
    var depositWC = await wc(buffer);

    const r = await depositWC.calculateWitness(input);

    const commitment = r[1];
    const nullifierHash = r[2];
    console.log("commitment", commitment);

    const tx = {
      to: contractAddresses.usdcMixer,
      from: account.address,
      data: cryptoMixerInterface.encodeFunctionData("deposit", [commitment]),
    };

    try {
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [tx],
      });

      const receipt = await waitForTransactionReceipt(txHash);
      console.log(receipt);
      const log = receipt.logs[2];

      const decodedData = cryptoMixerInterface.decodeEventLog(
        "Deposit",
        log.data,
        log.topics
      );

      const proofElements = {
        root: utils.BNToDecimal(decodedData.root),
        nullifierHash: `${nullifierHash}`,
        secret: secret,
        nullifier: nullifier,
        commitment: `${commitment}`,
        hashPairing: decodedData.hashPairings.map((n) => utils.BNToDecimal(n)),
        hashDirections: decodedData.pairDirection,
      };
      console.log(proofElements);

      updateProofElements(btoa(JSON.stringify(proofElements)));
    } catch (error) {
      console.log(error);
    }

    console.log(commitment, nullifierHash);
  };
  async function waitForTransactionReceipt(txHash) {
    while (true) {
      const receipt = await window.ethereum.request({
        method: "eth_getTransactionReceipt",
        params: [txHash],
      });

      if (receipt !== null) {
        return receipt;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  const depositEther = async () => {
    const secret = ethers.BigNumber.from(
      ethers.utils.randomBytes(32)
    ).toString();
    const nullifier = ethers.BigNumber.from(
      ethers.utils.randomBytes(32)
    ).toString();

    const input = {
      secret: utils.BN256ToBin(secret).split(""),
      nullifier: utils.BN256ToBin(nullifier).split(""),
    };

    var res = await fetch("/deposit.wasm");
    var buffer = await res.arrayBuffer();
    var depositWC = await wc(buffer);

    const r = await depositWC.calculateWitness(input);

    const commitment = r[1];
    const nullifierHash = r[2];
    console.log("commitment", commitment);

    const value = ethers.BigNumber.from("10000000000000000").toHexString();
    const tx = {
      to: contractAddresses.EthMixer,
      from: account.address,
      value: value,
      data: cryptoMixerInterface.encodeFunctionData("deposit", [commitment]),
    };

    try {
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [tx],
      });
      const receipt = await waitForTransactionReceipt(txHash);
      console.log(receipt);
      const log = receipt.logs[1];

      const decodedData = cryptoMixerInterface.decodeEventLog(
        "Deposit",
        log.data,
        log.topics
      );

      const proofElements = {
        root: utils.BNToDecimal(decodedData.root),
        nullifierHash: `${nullifierHash}`,
        secret: secret,
        nullifier: nullifier,
        commitment: `${commitment}`,
        hashPairing: decodedData.hashPairings.map((n) => utils.BNToDecimal(n)),
        hashDirections: decodedData.pairDirection,
      };
      console.log(proofElements);

      updateProofElements(btoa(JSON.stringify(proofElements)));
    } catch (error) {
      console.log(error);
    }

    console.log(commitment, nullifierHash);
  };
  const withdraw = async () => {
    let aspAddress;
    switch (asp) {
      case "Basic ASP":
        aspAddress = contractAddresses.BaseASP;
        break;
      case "Anon Adhar":
        aspAddress = contractAddresses.aadharASP;
        break;
      case "Third ASP":
        aspAddress = contractAddresses.usdcASP;
        break;

      case "Attestation ASP":
        aspAddress = contractAddresses.BaseASP;
        break;
      default:
        console.error("Unknown ASP selection");
        return;
    }
    const mixerAddress =
      token === "USDC"
        ? contractAddresses.usdcMixer
        : contractAddresses.EthMixer;
    const withdrawProofValue = withdrawTextAreaRef.current
      ? withdrawTextAreaRef.current.value
      : "";

    console.log("aspAddress", aspAddress);

    if (!withdrawProofValue) {
      alert("Please input the proof of deposit string.");
      return;
    }
    console.log("log4");

    try {
      const proofString = withdrawTextAreaRef.current.value;
      console.log(proofString);
      const proofElements = JSON.parse(atob(proofString));
      // const b_aspData = JSON.parse(atob(aspData));
      const b_aspData = aspData;
      console.log(proofElements);

      const input = {
        secret: utils.BN256ToBin(proofElements.secret).split(""),
        nullifier: utils.BN256ToBin(proofElements.nullifier).split(""),
      };

      var res = await fetch("/deposit.wasm");
      var buffer = await res.arrayBuffer();
      var depositWC = await wc(buffer);

      const r = await depositWC.calculateWitness(input);
      console.log("input", input);
      const commitment = r[1];
      console.log("oooooo", r);
      await callASP(commitment);

      //         receipt = await window.ethereum.request({ method: "eth_getTransactionReceipt", params: [proofElements.txHash] });
      //         if(!receipt){ throw "empty-receipt"; }

      //         const log = receipt.logs[0];
      //         const decodedData = cryptoMixerInterface.decodeEventLog("Deposit", log.data, log.topics);
      console.log(1);
      const SnarkJS = window["snarkjs"];
      console.log(2);
      // console.log(aspData);
      console.log(tempData);
      const proofInput = {
        root: proofElements.root, //utils.BNToDecimal(decodedData.root),
        nullifierHash: proofElements.nullifierHash,
        recipient: utils.BNToDecimal(account.address),
        associationHash: tempData.root,
        // "associationRecipient":utils.BNToDecimal(account.address),
        secret: utils.BN256ToBin(proofElements.secret).split(""),
        nullifier: utils.BN256ToBin(proofElements.nullifier).split(""),
        hashPairings: proofElements.hashPairing, //decodedData.hashPairings.map((n) => ($u.BNToDecimal(n))),
        hashDirections: proofElements.hashDirections, //decodedData.pairDirection,
        associationHashPairings: tempData.hashPairing, //decodedData.hashPairings.map((n) => ($u.BNToDecimal(n))),
        associationHashDirections: tempData.hashDirections, //decodedData.pairDirection
      };
      console.log(3);
      console.log(proofInput);
      const { proof, publicSignals } = await SnarkJS.groth16.fullProve(
        proofInput,
        "/withdraw.wasm",
        "/setup_final.zkey"
      );
      console.log(4);
      console.log("=========================================");
      console.log(proof);
      console.log(publicSignals);
      const callInputs = [
        aspAddress,
        proof.pi_a.slice(0, 2).map(utils.BN256ToHex),
        proof.pi_b
          .slice(0, 2)
          .map((row) => utils.reverseCoordinate(row.map(utils.BN256ToHex))),
        proof.pi_c.slice(0, 2).map(utils.BN256ToHex),
        publicSignals.slice(0, 3).map(utils.BN256ToHex),
      ];

      const callData = cryptoMixerInterface.encodeFunctionData(
        "withdraw",
        callInputs
      );
      const tx = {
        to: mixerAddress,
        from: account.address,
        data: callData,
      };
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [tx],
      });
      const receipt = await waitForTransactionReceipt(txHash);
    } catch (e) {
      console.log(e);
    }
  };

  const callASP = async (commitment) => {
    let aspAddress;
    switch (asp) {
      case "Basic ASP":
        aspAddress = contractAddresses.BaseASP;
        break;
      case "Anon Adhar":
        aspAddress = contractAddresses.aadharASP;
        break;
      case "Third ASP":
        aspAddress = contractAddresses.usdcASP;
        break;
      default:
        console.error("Unknown ASP selection");
        return;
    }

    try {
      if (asp === "Anon Adhar") {
        console.log("serialize(proof)", anonAadhaar.pcd);
        var data = JSON.stringify({
          commitment: JSON.stringify({ value: commitment.toString() }),
          asp_address: aspAddress,
          network: account.chainId,
          proof: anonAadhaar.pcd,
        });
        //

        var config = {
          method: "post",
          url: "http://localhost:8080/api/asp/add-anon-commitment",
          headers: {
            "Content-Type": "application/json",
          },
          data: data,
        };
        const response = await axios(config);
        console.log(response);
        console.log("Anon Adhar logic executed");
        const txHash = response?.data?.hash;
        console.log("txHash", txHash);

        const receipt = await waitForTransactionReceipt(txHash);
        console.log(receipt);
        const log = receipt.logs[0];

        const decodedData = aspInterface.decodeEventLog(
          "userAdded",
          log.data,
          log.topics
        );

        const aspElements = {
          root: utils.BNToDecimal(decodedData.root),
          hashPairing: decodedData.hashPairings.map((n) =>
            utils.BNToDecimal(n)
          ),
          hashDirections: decodedData.pairDirection,
        };

        // updateAspData(btoa(JSON.stringify(aspElements)));
        updateAspData(aspElements);
        tempData = aspElements;
        console.log("aspElements", aspElements);
      } else if (asp === "Attestation ASP") {
        var data = JSON.stringify({
          commitment: JSON.stringify({ value: commitment.toString() }),
          asp_address: aspAddress,
          network: account.chainId,
          userAddress: account.address,
        });
        //

        var config = {
          method: "post",
          url: "http://localhost:8080/api/asp/check-reputation-eligliblity",
          headers: {
            "Content-Type": "application/json",
          },
          data: data,
        };
        const response = await axios(config);
        console.log("response", response);
        const txHash = response?.data?.hash;
        console.log("txHash", txHash);

        const receipt = await waitForTransactionReceipt(txHash);
        console.log(receipt);
        const log = receipt.logs[0];

        const decodedData = aspInterface.decodeEventLog(
          "userAdded",
          log.data,
          log.topics
        );

        const aspElements = {
          root: utils.BNToDecimal(decodedData.root),
          hashPairing: decodedData.hashPairings.map((n) =>
            utils.BNToDecimal(n)
          ),
          hashDirections: decodedData.pairDirection,
        };

        // updateAspData(btoa(JSON.stringify(aspElements)));
        updateAspData(aspElements);
        tempData = aspElements;

        console.log("===============!!!!!!!!===============");
        console.log("aspElements", aspElements);
      } else {
        console.log("account", account);
        var data = JSON.stringify({
          commitment: JSON.stringify({ value: commitment.toString() }),
          asp_address: aspAddress,
          network: account.chainId,
        });
        //

        var config = {
          method: "post",
          url: "http://localhost:8080/api/asp/add-commitment",
          headers: {
            "Content-Type": "application/json",
          },
          data: data,
        };
        console.log("13333389y73843848374");
        const response = await axios(config);
        console.log("response", response);
        const txHash = response?.data?.hash;
        console.log("txHash", txHash);

        const receipt = await waitForTransactionReceipt(txHash);
        console.log(receipt);
        const log = receipt.logs[0];

        const decodedData = aspInterface.decodeEventLog(
          "userAdded",
          log.data,
          log.topics
        );

        const aspElements = {
          root: utils.BNToDecimal(decodedData.root),
          hashPairing: decodedData.hashPairings.map((n) =>
            utils.BNToDecimal(n)
          ),
          hashDirections: decodedData.pairDirection,
        };

        // updateAspData(btoa(JSON.stringify(aspElements)));
        updateAspData(aspElements);
        tempData = aspElements;

        console.log("===============!!!!!!!!===============");
        console.log("aspElements", aspElements);
        // console.log('btoa(JSON.stringify(aspElements))',btoa(JSON.stringify(aspElements)));
        console.log("================!!!!!!!!!!!==============");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const copyProof = () => {
    if (proofTextAreaRef.current) {
      proofTextAreaRef.current.select();
      document.execCommand("copy");
    }
  };

  return (
    <div className={styles.interface}>
      {account ? (
        <div className={styles.accountInfo}>
          <p>Account Address: {account.address}</p>
          <div className={styles.tokenBalance}>
            <span>Native Token Balance: {ethBalance}</span>
            <span>USDC Balance: {usdcBalance}</span>
          </div>
        </div>
      ) : (
        <p className={styles.accountInfo}>No account connected</p>
      )}
      <div className={styles.tabs}>
        <button
          onClick={() => setActiveTab("deposit")}
          className={`${styles.tab} ${
            activeTab === "deposit" ? styles.active : ""
          }`}
        >
          Deposit
        </button>
        <button
          onClick={() => setActiveTab("withdraw")}
          className={`${styles.tab} ${
            activeTab === "withdraw" ? styles.active : ""
          }`}
        >
          Withdraw
        </button>
      </div>

      <div className={styles.form}>
        <label htmlFor="amount">Amount</label>
        <input
          type="text"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <label htmlFor="token">Token</label>
        <select id="token" value={token} onChange={handleTokenChange}>
          <option value="Native Token">Native Token</option>
          <option value="USDC">USDC</option>
        </select>

        {activeTab === "deposit" ? (
          <>
            <button onClick={deposit} className={styles.depositButton}>
              Deposit
            </button>
            <textarea
              readonly
              ref={proofTextAreaRef} // Attach the ref to the textarea
              className={styles.proof}
              value={proofElements} // Set the text content to proofElements state
            >
              {" "}
            </textarea>
            <button onClick={copyProof} className={styles.copyButton}>
              Copy
            </button>
          </>
        ) : (
          <>
            <textarea
              ref={withdrawTextAreaRef} // Attach the ref to the withdrawal textarea
              className={styles.proof}
              defaultValue={proofElements} // Set the default value to proofElements
              onChange={(e) => setWithdrawProof(e.target.value)} // Update state on change
              placeholder="Paste the deposit proof here"
            />
            <label htmlFor="asp">ASP</label>
            <select id="asp" value={asp} onChange={handleASPChange}>
              <option value="Basic ASP">Basic ASP</option>
              <option value="Anon Adhar">Anon Adhar</option>
              <option value="Third ASP">USDC ASP</option>
              <option value="Attestation ASP">Attestation ASP</option>
            </select>
            {/* {showTextArea && (
              <textarea
                value={proof}
                onChange={(e) => setProof(e.target.value)}
                rows="4"
                cols="50"
                placeholder="Enter additional proof or data here"
              />
            )} */}
            <button onClick={withdraw} className={styles.withdrawButton}>
              Withdraw
            </button>
          </>
        )}
      </div>
    </div>
  );
}
