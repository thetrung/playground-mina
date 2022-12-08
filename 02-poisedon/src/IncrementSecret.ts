import {
    Field,
    state,
    State,
    method,
    DeployArgs,
    Poseidon,
    Permissions,
    SmartContract
} from 'snarkyjs'

export class IncrementSecret extends SmartContract {
    // field X
    @state(Field) x = State<Field>();
    // permission config
    deploy(args: DeployArgs){
        super.deploy(args);
        this.setPermissions({
            ...Permissions.default(),
            editState : Permissions.proofOrSignature(),
        });
    }

    @method initState(salt: Field, firstSecret: Field){
        this.x.set((Poseidon.hash([salt, firstSecret])));
    }

    @method incrementSecret(salt: Field, secret: Field){
        const x = this.x.get();
        this.x.assertEquals(x);
        // set x to new hash after added 1 to secret.
        this.x.set(Poseidon.hash([salt, secret.add(1)]));
    }
}