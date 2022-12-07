import {
  Field, // could be : string | number | bigint | boolean | Field
  SmartContract, // The class that creates zkApp smart contracts.
  state, // references to [state stored on chain in a zkApp account].
  State, // a class used within zkApp [SmartContract] to create state above.
  method, // decorator : for the end user's entry points to interacting with our smart contract.
  DeployArgs, // The type for arguments submitted to a newly deployed smart contract.
  Permissions, // An collection of methods for manipulating zkApp smart contract permissions.
} from 'snarkyjs';

export class Square extends SmartContract {
  /// Create state [num]
  @state(Field) num = State<Field>();
  /// On init ()
  deploy(args: DeployArgs) {
    super.deploy(args);
    // Permissions setup :
    this.setPermissions({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
    });
    // Initial value for [num] state
    this.num.set(Field(3));
  }

  /// Notice that we use the @method decorator because
  /// we intend for this method to be invoked by end users
  @method update(square: Field) {
    const currentState = this.num.get();
    this.num.assertEquals(currentState);
    square.assertEquals(currentState.mul(currentState));
    this.num.set(square);
  }
}
