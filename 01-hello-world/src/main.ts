import { Square } from './Square.js';
import {
  isReady, // an asynchronous promise that tells us when SnarkyJS is loaded and ready. This is necessary because SnarkyJS contains WASM
  shutdown, // a function that closes our program.
  Field,
  Mina, // A local Mina blockchain. We will deploy our smart contract to this in order to interact with it as a user would.
  PrivateKey,
  AccountUpdate, // a class that generates a data structure referred to as an AccountUpdate that can update zkApp accounts.
} from 'snarkyjs';

(async function main() {
  await isReady;
  console.log('SnarkyJS loaded');

  const Local = Mina.LocalBlockchain();
  Mina.setActiveInstance(Local);
  const deployedAccount = Local.testAccounts[0].privateKey;
  const zkAppPrivateKey = PrivateKey.random(); // App private key
  const zkAppAddress = zkAppPrivateKey.toPublicKey(); // App pubkey
  const contract = new Square(zkAppAddress); // Square Smart Contract
  // ----------------------------------------------------
  // new Tx0 :
  const deployTxn = await Mina.transaction(deployedAccount, () => {
    AccountUpdate.fundNewAccount(deployedAccount);
    contract.deploy({ zkappKey: zkAppPrivateKey });
    contract.sign(zkAppPrivateKey);
  });
  await deployTxn.send();
  const num0 = contract.num.get();
  console.log('state after init:', num0.toString());
  // ----------------------------------------------------
  // new Tx1 :
  const txn1 = await Mina.transaction(deployedAccount, () => {
    contract.update(Field(9));
    contract.sign(zkAppPrivateKey);
  });
  await txn1.send();
  const num1 = contract.num.get();
  console.log('state after txn1:', num1.toString());
  // ----------------------------------------------------

  try {
    const txn2 = await Mina.transaction(deployedAccount, () => {
      contract.update(Field(80));
      contract.sign(zkAppPrivateKey);
    });
    await txn2.send();
  } catch (err: any) {
    console.log(err.message);
  }
  // Get 1st state of num
  const num2 = contract.num.get();
  console.log('state after txn2:', num2.toString());

  const txn3 = await Mina.transaction(deployedAccount, () => {
    contract.update(Field(81));
    contract.sign(zkAppPrivateKey);
  });
  await txn3.send();
  // Get 1st state of num
  const num3 = contract.num.get();
  console.log('state after txn3:', num3.toString());
  // ----------------------------------------------------
  console.log('shutting down');

  await shutdown();
})();
