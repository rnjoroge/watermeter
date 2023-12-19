import {ICbor} from './interface';
import { decode, encode } from 'cbor-x';


export default class CborImpl implements ICbor {

    constructor () {

    }
    decode(data: Uint8Array) {
       return  decode(data);
    }
    encode(data: any): Uint8Array {
       return new Uint8Array(encode(data));
    }
    
}