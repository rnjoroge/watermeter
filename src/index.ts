import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

import server from './server';
import * as config from './config';
import UdpServerImpl from './udpserver';
import ProtocolImpl from './protocol';
import CrcImpl from './crc';
import Command from './command'
import CborImpl from './cbor'
import DatabaseImpl from './database';
import ApiServerImpl from './apiserver'

const cbor = new CborImpl();
const crcImpl = new CrcImpl();
const command = new Command(crcImpl,cbor);
const database = new DatabaseImpl(config.DatabaseConfig);
const apiServerImpl = new ApiServerImpl(config.apiServerConfig,database);
const protocolImpl = new ProtocolImpl(crcImpl);
const udpserver = new UdpServerImpl(config.udpConfig,protocolImpl,command,database);
const watermeterserver = new server(udpserver,database,apiServerImpl);
      watermeterserver.startUp();

process.on("uncaughtException", (err) => {
    watermeterserver.shutdown(err);
});
       
process.on("unhandledRejection", (reason, p) => {
    console.log("Unhandled Rejection at:", p, "reason:", reason);
    watermeterserver.shutdown(new Error("unhandledRejection"));
});
       
process.on("SIGTERM", () => {
    console.info('SIGTERM signal received.');
    watermeterserver.shutdown(new Error("SIGERM"));
});
       
process.on("SIGINT", function () {
    console.info('SIGINT signal received.');
    watermeterserver.shutdown(new Error("SIGINT"));
 }); 
       

