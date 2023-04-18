import { useState } from "react";
import server from "./server";
import { createTransaction } from "./utils/createTransaction";

function Transfer({ address, setBalance, privateKey, nonce, setNonce }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const payload = await createTransaction(
        sendAmount,
        address,
        recipient,
        privateKey,
        nonce
      );
      const {
        data: { balance, nonce: nextNonce },
      } = await server.post(`send`, payload);
      setBalance(balance);
      setNonce(nextNonce);
    } catch (ex) {
      alert(ex.response?.data.message || ex.message);
      setNonce(nonce + 1);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
