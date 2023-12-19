import {IDatabase ,IDatabaseSettings ,EConnectionStatus, ISaveCommandDet, ECommandType} from './interface';
import * as mongoDB from "mongodb";

export default class DatabaseImpl implements IDatabase {
    private client: mongoDB.MongoClient;
    //private mongostatus:EConnectionStatus=EConnectionStatus.disconnected;
    private coll:string='device'
    private coll_cache:string="commandcache"
    private status:string='disconnected'
   constructor (private dbconf:IDatabaseSettings) {
      this.init();
   }
    create_command_cache(serial: string, commandType: ECommandType): Promise<void> {
        return new Promise( async (resolve,reject) => { 
            try {
                const query = { serial: serial };
                const update = { $set: { serial: serial, commandType: commandType,commandDate:new Date().toISOString(),status:"PENDING" }};
                const options = { upsert: true }; 
    
                await this.client.db().collection(this.coll_cache).updateOne(query, update, options);
                resolve()
                
            } catch (error) {
                 reject(error);
            }
        })
    }
    get_serial_cache(serial: string): Promise<any | null> {
        return new Promise( async (resolve,reject) => { 
            try {
               let data= await this.client.db().collection(this.coll_cache).findOne({serial:serial});
               if(data){
                return resolve(data)
               }
                return resolve(null)  ;
            }           
            catch (error) {
                reject(error);
           }
      })
    }
    remove_serial_cache(serial: string): Promise<void> {
        return new Promise( async (resolve,reject) => { 
            try {
                const query = { serial: serial };
                const update = { $set: { serial: serial,processedDate:new Date().toISOString(),status:"PROCESSED" }};
                const options = { upsert: true }; 
    
                await this.client.db().collection(this.coll_cache).updateOne(query, update, options);
                resolve()
            }           
            catch (error) {
                reject(error);
           }
      })
    }
    list_serial_cache(): Promise<any> {
      return new Promise( async (resolve,reject) => { 
        try {
          let data=await  this.client.db().collection(this.coll_cache).find({}).toArray();
          return resolve(data);
      
         }           
         catch (error) {
             reject(error);
        }
    })
    }

    fetch_all_device_data(): Promise<any> {
        return new Promise( async (resolve,reject) => { 
            try {
              let data=await  this.client.db().collection(this.coll).find({}).toArray();
              return resolve(data);
          
             }           
             catch (error) {
                 reject(error);
            }
        })
    }
    get_device_data(serial: string): Promise<any> {
        return new Promise( async (resolve,reject) => { 
            try {
              let data=await  this.client.db().collection(this.coll).find({"data.device_details.serial_number":serial}).toArray();
              return resolve(data);
          
             }           
             catch (error) {
                 reject(error);
            }
        })
    }

   private async init() {
    try {
        this.client = new mongoDB.MongoClient(this.get_conn_url(this.dbconf)); 
        await this.client.connect();
         this.status="connected";
        console.log(" Mongo DB connected ")  
    } catch (error) {
        console.error(error)
    }

}
    start(): Promise<void> {
        return new Promise( async (resolve,reject) => {  
        if(this.status=="connected") {
            return resolve()
          }
         /// wait for init to complete ..you can put a time out
         return resolve()
        })
    }
   async stop(): Promise<void> {
    return new Promise( async (resolve,reject) => {
        try {
            if(this.client) {
              await this.client.close()
            }
            return resolve()
           }
           catch (err) {
            console.error(err)
            return reject(err)
           }
        })  
    }

    async save(data: any): Promise<void> {
     return new Promise( async (resolve,reject) => {
        try {
            await this.client.db().collection(this.coll).insertOne(data);
            return resolve()
        } catch (error) {
            return reject(error)
        }
  
     })
    }

    private  get_conn_url (options:IDatabaseSettings) :string {
        let connection="";
        // later check for auth if auth enabled use auth
          if(!options.protocol) {
              throw new Error (' the Mongo connection protocol is required i.e " mongodb:// " or "mongodb+srv://" ')
          }
          connection=options.protocol;
          if(!options.username) {
              throw new Error (' the connection username is required ')
          }
          connection=connection.concat(options.username);
          if(!options.password) {
              throw new Error (' the connection password is required ')
          }
          connection=connection.concat(':',options.password);
    
          if(!options.host) {
              throw new Error (' the connection host is required ')
          }
          connection=connection.concat('@',options.host);
          if(options.port) {
                  // add port if protocol is mongodb://
                  if(options.protocol === 'mongodb://') {
                      connection=connection.concat(':',options.port);
                  }
          }
          if(!options.database) {
            throw new Error (' the connection Database is required ')
          }
          connection=connection.concat('/',options.database);
          connection=connection.concat('?retryWrites=true&w=majority');
          if(options.repl) {
              if(options.protocol === 'mongodb://') {
                  connection=connection.concat('&replicaSet=',options.repl); 
              }     
          }
          if(options.authSource) {
              // add authSource    
             if(options.protocol === 'mongodb://') {
              connection=connection.concat('&authSource=',options.authSource); 
            }
          }
          if(options.auth_db) {
              // add authSource  
              if(options.protocol === 'mongodb://') {
                  connection=connection.concat('&authSource=',options.auth_db); 
                }
          }
        return connection
       }
    
}

