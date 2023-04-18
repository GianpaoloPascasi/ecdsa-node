import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { toHex } from "ethereum-cryptography/utils";

function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey }) {
  async function onChange(evt) {
    setPrivateKey(evt.target.value);
    try{
      const address = toHex(secp256k1.getPublicKey(evt.target.value));
      if (address) {
        setAddress(address);
        const {
          data: { balance },
        } = await server.get(`balance/${address}`);
        setBalance(balance);
      } else {
        setBalance(0);
      }
    }catch(e){
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

      <div className="balance">Balance at {address}: {balance}</div>
    </div>
  );
}

export default Wallet;
