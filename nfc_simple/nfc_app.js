'use strict';

var contracts = require('eris-contracts');
var fs = require('fs');
var http = require('http');
var url = require('url')
var address = require('./epm.json').nfc_simpleK;
var abi = JSON.parse(fs.readFileSync('./abi/' + address, 'utf8'));
var accounts = require('./accounts.json');
var chainUrl;
var manager;
var contract;
var server;

chainUrl = 'http://10.0.20.99:1337/rpc';

// Instantiate the contract object manager using the chain URL and the account
// data.
manager = contracts.newContractManagerDev(chainUrl,
  accounts.chickencoop_full_000);

// Instantiate the contract object using the ABI and the address.
contract = manager.newContractFactory(abi).at(address);

// Create an HTTP server.
server = http.createServer(function (request, response) {

  var f = function common(error, result) {
         if (error) {
          console.log('404:'+error);
          response.statusCode = 404;
          response.write("404".toString());
         } else {
          console.log('200:'+result);
          response.statusCode = 200;
          response.setHeader('Content-Type', 'application/json');
          response.write(result.toString());
         }
         //response.end('\n');
  }    

  var parsedURL = url.parse(request.url, true);
  var path = parsedURL.pathname
    , query = parsedURL.query
	, uid = query.uid
	, perms = query.perms
    , m_uid = query.m_uid;

  if (request.method=='GET') {
   console.log("Query:", query);
   console.log("Command:", path);

   switch (path) {
    case '/adduser':
      contract.add_user(uid.toString(), m_uid.toString(), perms, f);
      break;

    case '/deluser':
     contract.del_user(uid.toString(), m_uid.toString(), f);
      break;
   
    case '/modperms':
     contract.modify_perms(uid.toString(), m_uid.toString(), perms, f);
      break;
   
    case '/getperms':
     contract.get_perms(uid.toString(), f);
      break;
   
    case '/getmaster':
     contract.get_master(uid.toString(), f);
      break;
   
    default:
      console.log('400:command does not exist');
      response.statusCode = 400;
      response.write("400".toString());
      //response.end();
  } //switch
 } //if GET ...else (POST ) ...?
});

// Tell the server to listen to incoming requests on the port specified in the
// environment.
server.listen(8337, function () {
  console.log('Listening for HTTP requests')
});

