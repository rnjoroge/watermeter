
import {IUdpserver,IServerConfig,ISource,IProtocol,ICommand,IDatabase, ECommandType} from './interface';
import * as dgram from 'node:dgram';



export default class UdpServerImpl implements IUdpserver {
    server:any=null;
    constructor (private config:IServerConfig,private protocol:IProtocol,private command:ICommand,private database:IDatabase) {

    }
   async start(): Promise<boolean> {
    return new Promise( async (resolve,reject) => {
      try {
       this.server = dgram.createSocket('udp4');
          this.server.on('error', (err) => {
            console.error(`udp server error:\n${err.stack}`);
            this.server.close();
            throw err;
          });
      
          this.server.on('listening', () => {
            const address = this.server.address()
            console.log('udp server listening to ', 'Address: ', address.address, 'Port: ', address.port);
            return resolve(true);
          })
        this.server.on('message', (msg, rinfo) => {      
          //  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
         //    console.log(" msg received ",msg)
           this.processRequest(msg,{address:rinfo.address,port:rinfo.port})
        });
        console.log(" binding server to")
        this.server.bind(this.config.port);
        
      } catch (error) {
        console.error(error);
       return  reject(error);
      } 
    })
    }
   async stop(): Promise<boolean> {
    return new Promise( async (resolve,reject) => {
       try {
          if(this.server) {
            this.server.close()
          }
          return resolve(true)
       } catch (error) {
           console.error(error);
           return reject(error);
       } 
      })
    }


    private sendMessage (data:Buffer,port:number,address:string):Promise<void> {
      return new Promise( (resolve,reject) => {  
        this.server.send(data,port,address,function(error){
          if(error){
            console.log('Error sending Data sent !!!',error);
            reject(error)
          }else{
            console.log('Data sent !!!');
            resolve()
          }
          })
        })
    }

    private async processRequest (receivedData:any,datasource:ISource) {
        try {
            let decodeddata=  await this.protocol.from_bytes(receivedData);
            console.log(" === decoded data === ",decodeddata);
            let data = this.protocol.get_data(decodeddata);
           // console.log(" ===  data === ",data);
             await this.database.save({decodeddata,datasource,data});
             if(decodeddata.messageType =='0') {
              // means this request need a response 
              let response = this.command.emptyResponse(decodeddata.messageId);
              await this.sendMessage(response,datasource.port,datasource.address)
             }

             if(data) {
              // has data
                 if(data.device_details) {
                   // has device details 
                     if(data.device_details.serial_number) {
                      // has serial number

                      let cacheCommand= await this.database.get_serial_cache(data.device_details.serial_number.toString());
                      // there is a cached command 

                      console.log(" == Serial cached command === ",cacheCommand)
                      if(cacheCommand) {
                          if(cacheCommand.commandType ==ECommandType.OPEN_VALVE) {
                            let  respCmd= this.command.openValve();
                            await this.sendMessage(respCmd,datasource.port,datasource.address);
                            await this.database.remove_serial_cache(data.device_details.serial_number.toString())
                          }
                          if(cacheCommand.commandType ==ECommandType.CLOSE_VALVE) {
                            let  respCmd= this.command.closeValve();
                            await this.sendMessage(respCmd,datasource.port,datasource.address);
                            await this.database.remove_serial_cache(data.device_details.serial_number.toString())
                          }
                      }

                    
                     
                     }
                 }
             }

   
        } catch (error) {
            console.error(error)
        }
    }
    
}