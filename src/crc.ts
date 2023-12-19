
import {ICrc} from './interface';
//import crc16ccitt from 'crc/crc16ccitt';

import {crc16} from 'easy-crc';

export default class CrcImpl implements ICrc {

    constructor() {
        
    }
    validate(data: Uint8Array): boolean {
   ///checksum should be 62041
        console.log(" data to validate ",data);
        let reqChecksum = this.convertUint8_to_hexStr(data.slice(data.length-2,data.length));
       // console.log(" validate checksum  ",reqChecksum)
        let checksum = crc16('AUG-CCITT', Buffer.from(data.slice(0,data.length-2)));
        if(reqChecksum!==checksum) {
            return false
        }
        return true

    }
    checksum(data: any): Uint8Array {
      let  chk= crc16('AUG-CCITT', Buffer.from(data));

     // console.log(" checksum result ",chk)
      let bytearray = this.numberToBytes(chk);
      let uintArr = new Uint8Array(2);
            uintArr[0]=bytearray[0];
            uintArr[1]=bytearray[1];

        console.log(" checksum uintArr ",uintArr)
      return uintArr
    }

   private convertUint8_to_hexStr(uint8) {
   // console.log("Uint8 ",uint8)
        let hex = Buffer.from(uint8).toString('hex');
        console.log("hex ",hex)
        const hexToDecimal =parseInt(hex, 16);
        return hexToDecimal;
    }

    private numberToBytes(num) {
        const binary = num.toString(2);
        const paddedBinary = binary.padStart(Math.ceil(binary.length / 8) * 8, '0');
        const bytes = paddedBinary.match(/.{1,8}/g);
        const decimalBytes = bytes.map(byte => parseInt(byte, 2));
        return decimalBytes;
    }



}

