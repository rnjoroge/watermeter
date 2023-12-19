import {ECommandType, IApiServer,IApiServerConfig,IDatabase} from './interface';
import  { Express, Request, Response } from "express";
import * as express from "express";


export default class ApiServerImpl implements IApiServer {

    private app: express.Express =null;
    private listenSocket:any=null;

    constructor (private config:IApiServerConfig,private database:IDatabase ) {
     this.app=  express();
     this.app.use(express.json());
    }
    start(): Promise<void> {
     return new Promise( (resolve,reject) => {
        this.app.listen(Number(this.config.port), () => {
            this.getHandler() ;
            this.postHandler();
            console.log('api server listening to port ' + this.config.port);
            resolve()
        });
    })
    }
    stop(): Promise<void> {
      return new Promise( (resolve,reject) => {   
          console.log('Shutting down api server now');
          // this.app.close()

          resolve();

      })
    }


    private getHandler() {
       this.app.get('/api/device/:type/qtype/:subtype', async (req: Request, res: Response) => {
            try {
       //   console.log(" get request params ",req.params)
          if(!req.params) {
            return res.status(500).json({error:"Request missing required parameter"});
          }
          if(!req.params.type) {
            return res.status(500).json({error:"Request missing required parameter (type) i.e /api/all"});
          }

                   
          if(req.params.type.toString() =='all') {
            let data=await this.database.fetch_all_device_data("",""); // later put from and to
             return res.status(200).json(data);
          }

          if(!req.params.type) {
            return res.status(500).json({error:"Request missing required parameter (type) i.e /api/device/details/"});
          }

          if(req.params.type.toString()=='details') {
              if(!req.params.subtype) {
                return res.status(500).json({error:"Request missing required parameter (serial number) i.e /api/device/details/qtype/abcd"});
              }

              let data=await this.database.get_device_data(req.params.subtype.toString()); // later put from and to
              return res.status(200).json(data);
          }

          return res.status(500).json({error:"unable to process request "});
            
            } catch (error) {
               return res.status(500).json({error:error});
            }
            //res.end('Your user agent is: ' + req.headers + ' thank you, come again!');
        })

        // for command 

        this.app.get('/api/command/:type/qtype/:subtype', async (req: Request, res: Response) => {
            try {
         // console.log(" get request params ",req.params)
          if(!req.params) {
            return res.status(500).json({error:"Request missing required parameter"});
          }
          if(!req.params.type) {
            return res.status(500).json({error:"Request missing required parameter (type) i.e /api/command/all"});
          }

                   
          if(req.params.type.toString() =='all') {
            let data=await this.database.list_serial_cache() // later put from and to
             return res.status(200).json(data);
          }

          if(!req.params.type) {
            return res.status(500).json({error:"Request missing required parameter (type) i.e /api/command/details/"});
          }

          if(req.params.type.toString()=='details') {
              if(!req.params.subtype) {
                return res.status(500).json({error:"Request missing required parameter (serial number) i.e /api/command/details/qtype/abcd"});
              }

              let data=await this.database.get_serial_cache(req.params.subtype.toString()); // later put from and to
              return res.status(200).json(data);
          }

          return res.status(500).json({error:"unable to process request "});
            
            } catch (error) {
               return res.status(500).json({error:error});
            }
            //res.end('Your user agent is: ' + req.headers + ' thank you, come again!');
        })
    }

    private postHandler() {
     this.app.post('/api/command', async (req: Request, res: Response) => {
     try {
        
    
        if(!req.body) {
            return res.status(500).json({error:"Invalid Request"});
        }
        if(!req.body.serial) {
            return res.status(500).json({error:"Invalid Reuest missing serial"});
        }
        if(!req.body.commandType) {
            return res.status(500).json({error:"Invalid Reuest missing commandType"});
        }
        if(req.body.commandType.toUpperCase() == 'OPEN_VALVE' || req.body.commandType.toUpperCase() == 'CLOSE_VALVE') {
            await this.database.create_command_cache(req.body.serial,ECommandType[req.body.commandType.toUpperCase()]);
            return   res.status(200).json({success:"Command Received and waiting Processing"});

        }

        return res.status(500).json({error:"Invalid  commandType should be OPEN_VALVE or CLOSE_VALVE"});

    } catch (error) {
          return     res.status(500).json(error);
    }
     
    })
}

    /* Helper function for reading a posted JSON body */
 

}