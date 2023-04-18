import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";

function getAddress(publicKey) {
  const hashed = keccak256(publicKey.slice(1));
  return toHex(hashed.slice(hashed.length - 20));
}

function Wallet({
  address,
  setAddress,
  balance,
  setBalance,
  privateKey,
  setPrivateKey,
  setNonce,
}) {
  async function onChange(evt) {
    setPrivateKey(evt.target.value);
    try {
      if (!secp256k1.utils.isValidPrivateKey(evt.target.value)) {
        return;
      }
      const address = secp256k1.getPublicKey(evt.target.value);
      if (address) {
        setAddress(address);
        const {
          data: { balance, nonce },
        } = await server.get(`balance/${toHex(address)}`);
        setBalance(balance);
        setNonce(nonce);
      } else {
        setBalance(0);
      }
    } catch (e) {
      console.error(`Invalid private key (${e.message})`);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet Private Key
        <input
          placeholder="Type an address, for example: 0x1"
          value={privateKey}
          onChange={onChange}
        ></input>
      </label>

      <div className="balance">
        Your address is: {address ? toHex(address) : 'none'}
      </div>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
