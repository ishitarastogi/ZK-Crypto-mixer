import React, { useState, useEffect } from "react";
import { MerkleTree } from "merkletreejs";
import SHA256 from "crypto-js/sha256";
import styles from "../style/MerkleTree.module.css";
import AadhaarComponent from "../components/Adhar";
import Attestation from "../components/Attestation";
import { gql, useQuery } from "@apollo/client";

const GET_LEAF_NODES = gql`
  query {
    mixerCommitments {
      commitments
    }
  }
`;

const createMerkleTree = (commitments) => {
  const leaves = commitments.map((commitment) => SHA256(commitment));
  return new MerkleTree(leaves, SHA256);
};

const truncateHash = (hash) =>
  `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;

function MerkleTreeComponent() {
  const [selectedTreeIndex, setSelectedTreeIndex] = useState(0);
  const [merkleTree, setMerkleTree] = useState(null);
  const { loading, error, data } = useQuery(GET_LEAF_NODES, {
    pollInterval: 5000,
  });

  useEffect(() => {
    if (data && data.mixerCommitments && data.mixerCommitments.length > 0) {
      setMerkleTree(createMerkleTree(data.mixerCommitments[0].commitments));
    }
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const treeDetails = [
    {
      heading: "Basic ASP",
      subheading: "This is a basic example of ASP",
      description:
        "This is a description for Basic ASP. Here you can add more details about the tree, the logic behind it, and any other relevant information that users might find useful.",
    },
    {
      heading: "Anyone Aadhar",
      subheading: "Generate and verify identity proofs",
      description:
        "The Anon Aadhaar circuit enables citizens with an Aadhaar card to generate zero-knowledge identity proofs, which can be verified both on and off the chain.",
    },

    {
      heading: "Attestation",
      subheading: "Attest to anything and everything",
      description:
        "This check if you never been revoked, carrying good reputation for long duration of time, never involved in bad activities.",
    },
  ];

  const selectedTreeDetails = treeDetails[selectedTreeIndex] || {};

  return (
    <div className={styles.mainContainer}>
      <div className={styles.dropdownContainer}>
        <select
          className={styles.treeSelector}
          value={selectedTreeIndex}
          onChange={(e) => setSelectedTreeIndex(parseInt(e.target.value, 10))}
        >
          {treeDetails.map((detail, index) => (
            <option key={index} value={index}>
              {detail.heading}
            </option>
          ))}
        </select>
        <div className={styles.treeDisplay}>
          <h1 className={styles.mainHeading}>Merkle Tree</h1>
          {merkleTree &&
            merkleTree
              .getLayers()
              .slice() // Create a shallow copy to avoid mutating the original array
              .reverse() // Reverse the order to display root at the top
              .map((layer, index) => (
                <div
                  key={index}
                  className={`${styles.layer} ${styles[`layer${index}`]}`}
                >
                  {layer.map((hash, hashIndex) => (
                    <div key={hashIndex} className={styles.node}>
                      {truncateHash(hash.toString("hex"))}
                    </div>
                  ))}
                </div>
              ))}
        </div>
      </div>
      <div className={styles.detailsContainer}>
        <div className={styles.description}>
          <h1>{selectedTreeDetails.heading}</h1>
          <h2>{selectedTreeDetails.subheading}</h2>
          <p>{selectedTreeDetails.description}</p>
        </div>
        {selectedTreeIndex === 1 && (
          <div className={styles.componentSpacing}>
            <AadhaarComponent />
          </div>
        )}
        {selectedTreeIndex === 2 && (
          <div className={styles.componentSpacing}>
            <Attestation />
          </div>
        )}
      </div>
    </div>
  );
}
export default MerkleTreeComponent;
