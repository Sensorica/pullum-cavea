var nfc  = require('nfc').nfc
  , util = require('util')
  ;

console.log('nfc.version(): ' + util.inspect(nfc.version(), { depth: null }));
    // { name: 'libfnc', version: '1.7.0' }

console.log('nfc.scan(): ' + util.inspect(nfc.scan(), { depth: null }));
    // { 'pn53x_usb:160:012': { name: 'SCM Micro / SCL3711-NFC&RW', info: { chip: 'PN533 v2.7', ... } } }
