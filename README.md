# pullum-cavea

Chickens identity and access management on the blockchain - Eris(Monax)/IoT

## Inspiration and forks

Inspired by the marmots at [Eris(now Monax)](https://monax.io/) and their projects
[urvogel](https://github.com/eris-ltd/urvogel) & [eris-eggbank](https://github.com/eris-ltd/eris-eggbank).
An evolution of the Arduino self-contained [Arduino access system](https://github.com/Sensorica/NFC_doorlock) at Sensorica Lab and project [BWAT](https://github.com/Sensorica/BWAT)

## Hardware Requirements
* Raspberry Pi 2/Pi 3
* [NFC/RFID reader](https://www.adafruit.com/product/364)
* [NFC/RFID tags][Amazon NFC stickers]

[Amazon NFC stickers]: https://www.amazon.com/gp/product/B01D8RDNZ0/ref=oh_aui_detailpage_o07_s00?ie=UTF8&psc=1

## Software Requirement
* [Hypriot Docker](http://blog.hypriot.com/downloads/)
* [eris Blockchain tools](https://erisindustries.com/)

## Dependency Projects
* [node-nfc](https://github.com/camme/node-nfc)

## Known Problems
0. The `node-nfc` node dependency has issue with the `nfc.parse` function. 

   You can pull the [forked node-nfc repo](https://github.com/shuangjj/node-nfc),  
   which fixed the problem and build the module by `node-gyp`.

