import { IncrementSecret } from "./IncrementSecret.js"
import { Mina, isReady,Field, AccountUpdate, PrivateKey,} from "snarkyjs"

// ENTRYPOINT
(async function main(){

    // loading snarkyJS...
    await isReady; console.log("loaded SnarkyJS")

    // salt for poisedon, he miss the sea :(
    const salt = Field.random();

    // Local test environment                                       
    const Local = Mina.LocalBlockchain();
    Mina.setActiveInstance(Local);
    const deployedAccount = Local.testAccounts[0].privateKey;

    // zkApp setup
    const zkAppPrivateKey = PrivateKey.random();
    const zkAppAddress = zkAppPrivateKey.toPublicKey();
    const zkAppInstance = new IncrementSecret(zkAppAddress);

    //----------------------------------------------------------------
    const deploy_txn = await Mina.transaction(deployedAccount, ()=>{
        AccountUpdate.fundNewAccount(deployedAccount);
        zkAppInstance.deploy({zkappKey: zkAppPrivateKey});
        zkAppInstance.initState(salt, Field(750));
        zkAppInstance.sign(zkAppPrivateKey);
    });
    await deploy_txn.send();
    // get value of x after init state  
    const num0 = zkAppInstance.x.get();
    console.log("state after init: %", num0.toString());

    //----------------------------------------------------------------
    const txn1 = await Mina.transaction(deployedAccount, ()=>{
        // increment update :
        zkAppInstance.incrementSecret(salt, Field(750));
        zkAppInstance.sign(zkAppPrivateKey);
    });
    await txn1.send();
    // get value of x after init state  
    const num1 = zkAppInstance.x.get();
    console.log("state after txn1: %", num1.toString());
    //----------------------------------------------------------------
})()