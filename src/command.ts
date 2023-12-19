import {ICommand,ICrc,ICbor} from './interface';



export default class Command implements ICommand {


    constructor (private crc:ICrc,private cbor:ICbor) {

    }

    openValve(): Buffer {
        let msgid=this.numberToBytes(this.now())   ;       
        const dataArray = new Uint8Array(10);
                        dataArray[0]=1; // version
                        dataArray[1]=1; // version
                        dataArray[2]=1; // message type .. does not require confirmation
                        dataArray[3]=0X45;  // message code  // settings instructions
                        dataArray[4]=msgid[0] // message id
                        dataArray[5]=msgid[1] // message id
                        dataArray[6]=60;  // payload format cbor
                    let valveData={
                            bn: '/80/0',
                            '0':0,
                            '1':1,
                            '6':0,
                    }
          
           let cbordata= this.cbor.encode([valveData]);
           let fieldLength=this.numberToBytes(cbordata.length)   ;  
          // console.log(" ==== o.cbordata data fieldLength ===",fieldLength)
           dataArray[7]=0; 
           dataArray[8]=fieldLength[0]; 
           dataArray[9]=0xFF;

       //    console.log(" ==== 1.cbordata header ===",dataArray)
       //    console.log(" ==== 1.cbordata encoded ===",cbordata)
           let dt=this.mergeUInt8Arrays(dataArray,cbordata);
      //     console.log(" ==== 2.cbordata data and header merged  ===",dt)

       // let testDt = [1, 1, 0, 2, 50, 212, 60, 0, 175, 255, 134, 171, 98, 98, 110, 100, 47, 51, 47, 48, 2, 106, 50, 51, 48, 57, 50, 53, 48, 48, 48, 49, 13, 26, 101, 111, 115, 142, 14, 101, 85, 84, 67, 43, 56, 1, 101, 67, 84, 50, 45, 49, 7, 25, 1, 105, 17, 1, 18, 101, 80, 86, 49, 46, 50, 19, 108, 86, 51, 46, 48, 50, 95, 50, 50, 48, 57, 48, 54, 20, 0, 23, 24, 160, 164, 98, 98, 110, 101, 47, 56, 48, 47, 48, 1, 2, 6, 0, 16, 26, 0, 0, 0, 50, 164, 98, 98, 110, 101, 47, 56, 49, 47, 48, 3, 1, 1, 0, 2, 0, 163, 98, 98, 110, 101, 47, 56, 50, 47, 48, 0, 0, 1, 0, 162, 98, 98, 110, 101, 47, 56, 52, 47, 48, 0, 26, 0, 0, 56, 64, 164, 98, 98, 110, 101, 47, 57, 57, 47, 48, 1, 111, 56, 54, 50, 57, 57, 48, 48, 54, 48, 50, 54, 50, 52, 50, 52, 11, 57, 3, 61, 14, 57, 0, 55]
           let arr = this.crc.checksum(dt);
           let finalData = this.mergeUInt8Arrays(dt,arr);
           //console.log(" ==== cbordata encoded finalData data ===",finalData)
     return Buffer.from(finalData);

    }

    private  mergeUInt8Arrays(a1: Uint8Array, a2: Uint8Array): Uint8Array {
        // sum of individual array lengths
        var mergedArray = new Uint8Array(a1.length + a2.length);
            mergedArray.set(a1);
            mergedArray.set(a2, a1.length);
        return mergedArray;
      }
    closeValve(): Buffer {
        let msgid=this.numberToBytes(this.now())   ;       
        const dataArray = new Uint8Array(10);
                        dataArray[0]=1; // version
                        dataArray[1]=1; // version
                        dataArray[2]=1; // message type .. does not require confirmation
                        dataArray[3]=0X45;  // message code  // settings instructions
                        dataArray[4]=msgid[0] // message id
                        dataArray[5]=msgid[1] // message id
                        dataArray[6]=60;  // payload format cbor

                    let valveData={
                            bn: '/80/0',
                            '0':1,  // valve control 0 open 1 close
                            '1':1,  // valve status 0 open status 1 close status
                            '6':1, // forcibly open the valve
                    }
          
           let cbordata= this.cbor.encode([valveData]);
           let fieldLength=this.numberToBytes(cbordata.length)   ;  

           dataArray[7]=0; 
           dataArray[8]=fieldLength[0]; 
           dataArray[9]=0xFF;

           let dt=this.mergeUInt8Arrays(dataArray,cbordata);
           let arr = this.crc.checksum(dt);
           let finalData = this.mergeUInt8Arrays(dt,arr);
     return Buffer.from(finalData);
    }
    emptyResponse(messageid:number): Buffer {
        let msgid=this.numberToBytes(messageid)   ;       
        const dataArray = new Uint8Array(10);
                        dataArray[0]=1; // version
                        dataArray[1]=1; // version
                        dataArray[2]=1; // message type .. does not require confirmation
                        dataArray[3]=0X45;  // message code  // settings instructions
                        dataArray[4]=msgid[0] // message id
                        dataArray[5]=msgid[1] // message id
                        dataArray[6]=60;  // payload format cbor
                        dataArray[7]=0; 
                        dataArray[8]=0; 
                        dataArray[9]=0xFF;

           let arr = this.crc.checksum(dataArray);
           let finalData = this.mergeUInt8Arrays(dataArray,arr);
     return Buffer.from(finalData);
    }

    private numberToBytes(num) {
        const binary = num.toString(2);
        const paddedBinary = binary.padStart(Math.ceil(binary.length / 8) * 8, '0');
        const bytes = paddedBinary.match(/.{1,8}/g);
        const decimalBytes = bytes.map(byte => parseInt(byte, 2));
        return decimalBytes;
    }

    private  hexStringToByteArray(hexString) {
        if (hexString.length % 2 !== 0) {
            throw "Must have an even number of hex digits to convert to bytes";
        }/* w w w.  jav  a2 s .  c o  m*/
        var numBytes = hexString.length / 2;
        var byteArray = new Uint8Array(numBytes);
        for (var i=0; i<numBytes; i++) {
            byteArray[i] = parseInt(hexString.substr(i*2, 2), 16);
        }
        return byteArray;
    }

    private now():number {
        const hrTime = process.hrtime();
        let num=hrTime[0] * 1000 + hrTime[1] / 1000000;
        return Math.trunc(num);
    }

}