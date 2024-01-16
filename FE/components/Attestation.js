import React, { useContext } from "react";
import axios from "axios";
import styles from "../../FE/style/MerkleTree.module.css";
import AccountContext from "../utils/accountContext";

function Attestation() {
  const { account } = useContext(AccountContext);

  async function checkEligibility() {
    var config = {
      method: "post",
      url: "http://localhost:8080/api/asp/check-reputation-eligliblity",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        userAddress: account.address, // Ensure that account data is sent in the request body
      },
    };

    try {
      const response = await axios(config);
      console.log("response", response);

      // Check the status field in the response data
      if (response.data.status) {
        alert("You are eligible.");
      } else {
        alert("You are not eligible.");
      }
    } catch (error) {
      console.error("Error during eligibility check:", error);
      alert("An error occurred while checking eligibility.");
    }
  }

  return (
    <div className={styles.attestationContainer}>
      <button className={styles.eligibilityButton} onClick={checkEligibility}>
        Check Eligibility Criteria
      </button>
    </div>
  );
}

export default Attestation;
