export interface IUdpserver {
    start():Promise<boolean>;
    stop ():Promise<boolean>;
}

export interface IServerConfig {
    port:string;
    hostname:string;
}


export interface IData {
  version:string;
  messageType:string;
  messageCode:string;
  messageId:number;
  datafieldFormat:string;
  datafiledlength:number;
  delimeter:string;
  data:any;
  checkcode:string
}

export interface IProcessedData {
    device_details:any;
    meter_information:any;
    meter_valve:any;
    abnormal_alarm:any;
    delivery_reporting:any;
    interactive_information:any;
    gateway_information:any

}
export interface IProtocol {
    from_bytes(data:ArrayBuffer):Promise<IData>;
    get_data(data:IData):IProcessedData;
}

export interface ISource {
    address:string;
    port:number;
}


export interface ICrc  {
    validate(data:Uint8Array):boolean;
    checksum (data:any):Uint8Array;
}
export interface IApiServerConfig {
    port : string;
}

export interface IApiServer {
    start():Promise<void>;
    stop():Promise<void>;
}
export interface IDatabaseSettings {
    protocol: string;
    database: string;
    username: string;
    password: string;
    host: string;
    port: string;
    repl: string;
    auth_db: string;
    authSource?: string;
    servers?: string[];

}

export declare enum EConnectionStatus {
    "connected" = "connected",
    "disconnected" = "disconnected",
    "reconnecting" = "reconnecting"
}
export enum ECommandType {
    "OPEN_VALVE"="OPEN_VALVE",
    "CLOSE_VALVE"="CLOSE_VALVE"
}
export interface ISaveCommandDet {
    serial:string;
    command_type:ECommandType;
}
export interface IDatabase {
    start():Promise<void>;
    stop():Promise<void>;
    save(data:any):Promise<void>;
    fetch_all_device_data(from:string,to:string):Promise<any>;
    get_device_data(serial:string):Promise<any>;
    create_command_cache(serial:string,commandType:ECommandType):Promise<void>
    get_serial_cache(serial:string):Promise<any | null>;
    remove_serial_cache(serial:string):Promise<void>
    list_serial_cache():Promise<any>;


}

export interface ICommand {
    openValve():Buffer;
    closeValve():Buffer;
    emptyResponse(messageid:number):Buffer;
}

export interface ICbor {
    decode(data:Uint8Array):any;
    encode(data:any):Uint8Array;
    
}