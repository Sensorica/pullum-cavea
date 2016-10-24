var nfc  = require('./node_modules/nfc/index').nfc
  , util = require('util')
  , version = nfc.version()
  , devices = nfc.scan()
  , fs = require('fs')
  , http = require('http')
  ;

var http_options = { //put it in command line argsv
    host: "10.0.20.99", // simulates blockchain rpc service IP
    port: 8337 // simulates blockchain rpc service port
    //method: "GET", // default is GET
};

//if (process.argv[2] != "") http_options['host'] = process.argv[2];



var deviceID
  , auth_path = './auth_card/'
  , master_path = './master_card/'
  , program_mode=false
  , go_fwd = true
  , oldTime = Date.now()
  , master_uid = ''
  ;

function send_http_req(action, orig_uid, perms, cb) {
  var received="";
  var uid=orig_uid.replace(/:/g, "");
  var m_uid=master_uid.replace(/:/g, "");
  http_options['path'] = '/'+action+'?uid='+uid+'&m_uid='+m_uid+'&perms='+perms;
  console.log(http_options);
  var req = http.get(http_options, function(res) {
    res.setEncoding("utf8");  //to emit events as strings
    res.on("data", function(data) {
        received=data;
        cb(null, received);
    }); 
  });
  req.on("error", function(err, msg) {
    cb(err, msg);
  });
  req.end();
}

function add_uid(uid, perms) {
  //Add user to the blockchain using its uid and permissions
  send_http_req("adduser", uid, perms, function(err, result) {;
    if (!err) 
        console.log("blockchain operation result:", result);
    else {
        console.log("blockchain error:", err);
    }
  });
  fs.writeFile(auth_path+uid, perms, function (err) {
    if (err) return console.log(err);
    else console.log("Added UID:", uid);
  });
}

function delete_uid(uid) {
  send_http_req("deluser", uid, 0, function(err, result) {;
    if (!err) 
        console.log("blockchain operation result:", result);
    else {
        console.log("blockchain error:", err);
    }
  });
  fs.unlink(auth_path+uid, function(err) {
    if (err) return console.error(err);
    else console.log("UID deleted:", uid);
  }); 
}

function get_perms(uid)  {
  console.log("Im in get_perms:", uid);
  send_http_req("getperms", uid, 0, function(err, result) {;
    if (!err) { 
        console.log("blockchain operation result:", result);
        return result;
            
    }
    else {
        console.log("blockchain error:", err);
        return -1;
    }
  });
 
}

function read(deviceID) {

  var nfcdev = new nfc.NFC();

  nfcdev.on('read', function(tag) {
  var nowTime = Date.now();
  uid=tag.uid;
  //console.log("\n============CARD UID:", uid);
  //console.log('old:',oldTime);
  //console.log('now:',nowTime);
  go_fwd = (nowTime > oldTime +5000); //wait 1 second to avoid double tap 
  if (go_fwd) {
    oldTime=nowTime;
  //if (true) {
    exists = (get_perms(uid) == 127);
    //fs.exists(master_path+uid, function(exists) { //master card exists
        if (exists) {
	        master_uid=uid;
	        program_mode=!program_mode;
            if (program_mode) {
                m_uid= uid;
	   	    //Set led to yellow 
    	        console.log("Program mode enabled, Master:", uid);
	        }
            else {
                m_uid='';
	   	    //Set led to blinking (normal mode)
    	        console.log("Program mode disabled, Master:", uid);
            }
	    }
    //});
    
    if (program_mode && (uid != master_uid)){ 
    //if (program_mode ){ 
        var perms=1; //simple access
        exists = (get_perms(uid) == 1); 
        //fs.exists(auth_path+uid, function(exists) {
            if (exists) delete_uid(uid)
	        else add_uid(uid, perms);
        //});
        
    }

    if (!program_mode) {
        exists = (get_perms(uid) == 1); 
        //fs.exists(auth_path+uid, function(exists) { //extend to include query to the blockchain
            if (exists) {
	        //Set led to green and unlock
	            console.log("Access granted to UID:", uid);	
	        }
            else {
	            console.log("Not valid for access UID:", uid);	
	            //Set led to red
	        }
        //});
    }
  }//only do all of the above if there is no double tap
  else { 
    //console.log("Ignoring consecutive tap for UID:", uid);
  } 
  //uid=tag.uid;old_uid=uid;

  }); //end of read event


  nfcdev.on('error', function(err) {
    console.log(util.inspect(err, { depth: null }));
  });

  nfcdev.on('stopped', function() {
    console.log('***** Stopped');
  });

  console.log(nfcdev.start(deviceID));
} //end of read(device)

deviceID=Object.keys(devices)[0];
read(deviceID);
