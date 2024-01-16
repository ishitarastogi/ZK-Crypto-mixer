import Interface from "./Interface";
import Script from "next/script";

const Index = () => {
  return (
    <div>
      <Script src="/js/snarkjs.min.js" />
      <Interface />
    </div>
  );
};

export default Index;
