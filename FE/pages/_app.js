// pages/_app.js
import Layout from "../components/layout"; // Make sure the import path is correct
import { AppProps } from "next/app";
import { AnonAadhaarProvider } from "anon-aadhaar-react";
const app_id = "650010406386009349199801826845867124209471193088";
import { ApolloProvider } from "@apollo/client";
import client from "../components/apollo-client.js";
function MyApp({ Component, pageProps }) {
  return (
    <ApolloProvider client={client}>
      <AnonAadhaarProvider _appId={app_id}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AnonAadhaarProvider>
    </ApolloProvider>
  );
}

export default MyApp;
