import React, { useEffect, useState } from "react";
import { PushAPI, CONSTANTS } from "@pushprotocol/restapi";
import { ethers } from "ethers";

function MyComponent() {
  const [userAlice, setUserAlice] = useState(null);

  useEffect(() => {
    // Initialize user
    const initializeUser = async () => {
      const signer = ethers.Wallet.createRandom();
      const initializedUser = await PushAPI.initialize(signer, {
        env: CONSTANTS.ENV.STAGING,
      });
      setUserAlice(initializedUser);
    };

    initializeUser();
  }, []);

  const sendNotification = async () => {
    if (!userAlice) {
      console.error("User is not initialized");
      return;
    }

    try {
      const response = await userAlice.channel.send(["*"], {
        notification: {
          title: "New Notification",
          body: "Hello from your React app!",
        },
      });

      console.log("Notification sent:", response);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  return (
    <div>
      <h1>My React Component</h1>
      <button onClick={sendNotification}>Send Notification</button>
    </div>
  );
}

export default MyComponent;
