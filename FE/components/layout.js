import Navbar from "./Navbar";
import React, { useState } from "react";
import utils from "../utils/$u";
import AccountContext from "../utils/accountContext"; // Adjust the path as necessary

import { ethers } from "ethers";
// Adjust the path if your Navbar component is elsewhere
import styles from "../style/Navbar.module.css";
const Layout = ({ children }) => {
  const [account, updateAccount] = useState(null);
  const connectMetamask = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install Metamask to use this app.");
        throw "no-metamask";
      }

      var accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      var chainId = window.ethereum.networkVersion;

      var activeAccount = accounts[0];
      var balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [activeAccount, "latest"],
      });
      balance = utils.moveDecimalLeft(
        ethers.BigNumber.from(balance).toString(),
        18
      );

      var newAccountState = {
        chainId: chainId,
        address: activeAccount,
        balance: balance,
      };
      updateAccount(newAccountState);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <AccountContext.Provider value={{ account, updateAccount }}>
      <Navbar account={account} connectMetamask={connectMetamask} />
      <main>{children}</main>
    </AccountContext.Provider>
  );
};

export default Layout;
