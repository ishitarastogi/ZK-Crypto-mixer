import styles from "../style/Navbar.module.css";
import Link from "next/link";

const Navbar = ({ account, connectMetamask }) => {
  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.logo}>Crypto Mixer</div>
        <div className={styles.navLinks}>
          <Link href="/" legacyBehavior>
            <a className={styles.navItem}>Mixer</a>
          </Link>
          <Link href="/asp" legacyBehavior>
            <a className={styles.navItem}>Asp</a>
          </Link>
        </div>
        <div className={styles.contact}>
          {account ? (
            <button className={styles.contactButton}>Connected</button>
          ) : (
            <button onClick={connectMetamask} className={styles.contactButton}>
              Connect Wallet
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
