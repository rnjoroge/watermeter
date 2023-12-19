
import {IUdpserver,IDatabase,IApiServer} from './interface';


export default class server {
    constructor(private udpserver:IUdpserver,private database:IDatabase,private apiserver:IApiServer){

    }

    async startUp () {
      try {
        console.log(" === starting  server ===")
        await this.database.start();
        await this.apiserver.start()
        await this.udpserver.start();
        console.log(" === server started ===")

      } catch (error) {
        console.error(error)
        this.shutdown(error);
      }
    }

    async  shutdown(err:Error) {
     try {
        await this.database.stop();
        await this.apiserver.stop()
        await this.udpserver.stop()
        console.log(" === server stopped ===")
        process.exit(0);
     } catch (error) {
      console.error(error)
      process.exit(1);
     }
    }
}