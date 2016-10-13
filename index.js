var erisC = require('eris-contracts');
 
var erisdbURL = "http://localhost:1337/rpc";

var account = account || require('./test/chain-config/accounts.json')['chickencoop_full_000'];

//Strictly for development! Bypasses key signing service.
var contractManager = erisC.newContractManagerDev(erisdbURL, account);

console.log(contractManager);
