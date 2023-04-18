import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";

// use the nonce to avoid replay attacks
export async function createTransaction(
  amount,
  sender,
  recipient,
  privateKey,
  nonce
) {
  const hexSender = toHex(sender); // sender is a bigint
  return {
    sender: hexSender,
    amount: parseInt(amount, 10),
    recipient,
    amount,
    nonce,
    signature: (
      await signMessage(
        `${amount};${hexSender};${recipient};${nonce}`,
        privateKey
      )
    ).toCompactHex(),
  };
}

async function signMessage(msg, privateKey) {
  const signed = await secp256k1.sign(hashMessage(msg), privateKey);
  return signed;
}

function hashMessage(message) {
  const bytes = utf8ToBytes(message);
  return keccak256(bytes);
}
