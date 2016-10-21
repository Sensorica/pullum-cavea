/**
 * Storage contract for master nfc cards (UID's)
 */

contract MasterCard {

    bytes32 public id;
    bytes32 public uid;
    
    function MasterCard(bytes32 _id, bytes32 _uid) {
        id = _id;
        uid = _uid;
    }    
}
