const express = require("express");
const app = express();
const cors = require("cors");
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes, toHex } = require("ethereum-cryptography/utils");

const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0x1": 100,
  "0x2": 50,
  "0x3": 75,
  "03385c3a6ec0b9d57a4330dbd6284989be5bd00e41c535f9ca39b6ae7c521b81cd": 100,
};

const accounts = {
  "0x1": {
    // splitted so i can use the sentTransactions lenght as nonce
    sentTransactions: [], // sentTransactions.length is the latest nonce
    receivedTransactions: [],
  },
  "0x2": {
    sentTransactions: [],
    receivedTransactions: [],
  },
  "0x3": {
    sentTransactions: [],
    receivedTransactions: [],
  },
  "03385c3a6ec0b9d57a4330dbd6284989be5bd00e41c535f9ca39b6ae7c521b81cd": {
    sentTransactions: [],
    receivedTransactions: [],
  },
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({
    balance,
    nonce: accounts[address]?.sentTransactions?.length || 0,
  });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature } = req.body;

  if (amount < 0) {
    res.status(400).send({ message: "Hacker!" });
    return;
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  const nonce = accounts[sender].sentTransactions.length;
  const hash = hashMessage(`${amount};${sender};${recipient};${nonce}`);
  const verified = secp.secp256k1.verify(signature, hash, sender);
  if (!verified) {
    res.status(401).send({ message: "Signature not verified!" });
    return;
  }

  if (balances[sender] < amount) {
    accounts[sender].sentTransactions.push({
      failed: true,
      amount,
      recipient,
      nonce,
    });
    res.status(400).send({ message: "Not enough funds!", nonce: nonce + 1 });
  } else {
    balances[sender] -= parseInt(amount);
    balances[recipient] += parseInt(amount);
    accounts[sender].sentTransactions.push({
      amount: amount,
      nonce,
      recipient,
    });
    accounts[recipient].receivedTransactions.push({
      amount: amount,
      sender,
      nonce,
    });
    console.log(accounts, balances);
    res.send({
      balance: balances[sender],
      nonce: nonce + 1,
    });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
    accounts[address] = {
      sentTransactions: [],
      receivedTransactions: [],
    };
  }
}

function hashMessage(message) {
  const bytes = utf8ToBytes(message);
  return keccak256(bytes);
}
