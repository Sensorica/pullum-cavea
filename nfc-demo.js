'use strict';

var contracts = require('eris-contracts');
var fs = require('fs');
var http = require('http');
var url = require('url')
var address = require('./nfc_simple/epm.json').nfc_simpleK;
var abi = JSON.parse(fs.readFileSync('./nfc_simple/abi/' + address, 'utf8'));
var accounts = require('./nfc_simple/accounts.json');
var manager
    , chainUrl = 'http://127.0.0.1:1337/rpc'
    , contract
    , server;

var nfc  = require('./node_modules/nfc/index').nfc
  , util = require('util')
  , version = nfc.version()
  , devices = nfc.scan()
  , fs = require('fs')
  , http = require('http')
  ;

var deviceID
  , program_mode=false
  , uid, m_uid=''
  , exists
  , oldTime = Date.now()
  , permissions = 0;
  ;

var exec = require('child_process').exec
  , cmd = '/opt/vc/bin/vcmailbox 0x00038041 8 8 130 ' //On-board LEDs are not in GPIO in RaPi3
  , interval_flag100=0
  , interval_flag500=0
  ;

function read(deviceID) {

  var nfcdev = new nfc.NFC();
  nfcdev.on('read', function(tag) {

  var nowTime = Date.now()
  , permissions =0;

  uid=tag.uid;
  //console.log("\n============CARD UID:", uid);
  var f = function common(error, result) {
       if (error) {
         bc_result = -1;
       } else {
         bc_result = result;
       }
      };
      
  if (nowTime > oldTime + 1000) { //wait 1 second to avoid double tap
    oldTime=nowTime;
    //uid=uid.replace(/:/g, "");
    contract.get_perms(uid.replace(/:/g, ""), function (err, result) { 
        if (err) {
            result = -1;
            //console.log(err);
        }
        permissions = result.toString();
        console.log("perms:", permissions);
        if (permissions == 127) {
	        m_uid=uid;
	        program_mode=!program_mode;
            if (program_mode) {
                //m_uid = uid;
	   	    //Set led to slow blinking 
                //interval_flag500=0;
                blink500(500);
    	        console.log("Program mode enabled, Master:", uid);
	        }
            else {
                m_uid = '';
	   	    //Set led to solid (normal mode)
                interval_flag500=1; //stop blinking and set led to solid
                exec(cmd+'1', function(error, stdout, stderr) { });
                //exec(cmd+'1', function(error, stdout, stderr) { });
    	        console.log("Program mode disabled, Master:", uid);
            }
	    }
    
        if (program_mode && (uid != m_uid)){ 
            exists = (permissions == 1); 
            if (exists) { 
                contract.del_user(uid.replace(/:/g, ""), m_uid.replace(/:/g, ""), function (err, result) {
                    //led_off_t(1600);
                    //blink500(500);
                    if (! err) 
    	                console.log("UID deleted:", uid);
                    else
                        console.log("UID NOT deleted:", err);
                });
	        //else send_http_req("adduser", uid, 1, function (err, result) { 
            }
	        else  contract.add_user(uid.replace(/:/g, ""), m_uid.replace(/:/g, ""), 1, function (err, result) { 
                    //interval_flag500=1;
                    //blink100(100);
                    //interval_flag500=0;
                    //led_off_t(800);
                    //blink500(500);
                    if (! err) 
    	                console.log("UID added:", uid);
                    else
                        console.log("UID NOT added:", err);
                    
                });//1= basic access permissions
        
        }

        if (!program_mode) {
            if (permissions == 1) {
	        //led blinks 5 times and then it stays solid.  Unlock!
               // interval_flag100=0;
                blink100(100);
	            console.log("Access granted to UID:", uid);	
	        }
            else {
                //Turn led off for 0.5 s, then after sets solid led
                led_off_t(1000);
	            console.log("Not valid for access UID:", uid);	
	            //Set led to red
	        }
        }
    });
  }//only do all of the above if there is no double tap
  else { 
    //console.log("Ignoring consecutive tap for UID:", uid);
  } 

  }); //end of read event

  nfcdev.on('error', function(err) {
    console.log(util.inspect(err, { depth: null }));
  });

  nfcdev.on('stopped', function() {
    console.log('***** Stopped');
  });

  console.log(nfcdev.start(deviceID));
} //end of read(device)

function blink100(timer) {
    interval_flag100=0;
    var led_status=1;
    var i_id = setInterval(function() {
        exec(cmd+led_status, function(error, stdout, stderr) { });
        led_status = +!led_status;
        interval_flag100 ++;
        if (interval_flag100>8) {
            //exec(cmd+'1', function(error, stdout, stderr) { });
            clearInterval(i_id);
            //interval_flag100=0;
            //exec(cmd+'1', function(error, stdout, stderr) { });
        }
    }, timer);
}
function blink500(timer) {
    interval_flag500=0;
    var led_status=1;
    var i_id = setInterval(function() {
        exec(cmd+led_status, function(error, stdout, stderr) { });
        led_status = +!led_status;
        if (interval_flag500) {
            //exec(cmd+'1', function(error, stdout, stderr) { });
            clearInterval(i_id);
        }
    }, timer);
}

function led_off_t(t) {
    exec(cmd+'0', function(error, stdout, stderr) { });
    var timerId = setTimeout(function() { 
        exec(cmd+'1', function(error, stdout, stderr) { });
    }, t)
}



///****Main
//
// Instantiate the contract object manager using the chain URL and the account
// data.
manager = contracts.newContractManagerDev(chainUrl,
  accounts.demo_full_000);
// Instantiate the contract object using the ABI and the address.
contract = manager.newContractFactory(abi).at(address);


exec(cmd+'1', function(error, stdout, stderr) { });//display (normal) mode
deviceID=Object.keys(devices)[0];
read(deviceID);
