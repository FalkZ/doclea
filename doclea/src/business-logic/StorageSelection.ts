
type StorageSelectionTransitions = Record<string, StorageSelectionState>

abstract class StorageSelectionState {
    constructor(transitions: StorageSelectionTransitions){};
    
}

export class StorageSelectionInitState extends StorageSelectionState {
    constructor({success, failed}){
        super();

        this.apply();

        if(dlkfd) new success()
        if(error) new fail()

    }

    apply(){}

}


export class StorageSelectionErrorState extends StorageSelectionState {

}
export class StorageSelectionAuthenticatedState extends StorageSelectionState {

}

export class StorageSelectionSelectedState extends StorageSelectionState {

}