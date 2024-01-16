import React from "react";
import { ethers } from "ethers";
import {
  LogInWithAnonAadhaar,
  useAnonAadhaar,
  AnonAadhaarProof,
} from "anon-aadhaar-react";

import styles from "../../FE/style/MerkleTree.module.css";
const ASPAddress = "0x";

function AadhaarComponent() {
  const [anonAadhaar] = useAnonAadhaar();

  return (
    <>
      <LogInWithAnonAadhaar />
      {anonAadhaar?.status === "logged-in" && (
        <>
          <p>✅ Proof is valid</p>
          <div className={styles.proofContainer}>
            <AnonAadhaarProof code={JSON.stringify(anonAadhaar.pcd, null, 2)} />
          </div>
        </>
      )}
    </>
  );
}

export default AadhaarComponent;
