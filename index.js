var erisC = require('eris-contracts');
 
// URL to the rpc endpoint of the eris-db server. 
var erisdbURL = "http://localhost:1337/rpc";
// See the 'Private Keys and Signing' section below for more info on this. 
var accountData = require('/some/account/data.json');
// newContractManagerDev lets you use an accountData object (address & private key) directly, i.e. no key/signing daemon is needed. This should only be used while developing/testing. 
var contractManager = erisC.newContractManagerDev(erisdbURL, accountData);
