
import {IServerConfig ,IDatabaseSettings,IApiServerConfig} from './interface'
const udpConfig:IServerConfig ={
    port: process.env.UDP_PORT|| '2221',
    hostname: process.env.UDP_HOSTNAME|| '2221',
}

const apiServerConfig:IApiServerConfig = {
    port: process.env.API_SERVER_PORT|| '2222',
}

const DatabaseConfig:IDatabaseSettings={
    protocol:process.env.PROTOCOL || "mongodb://",
    database: process.env.DB || "watermeter",
    username: process.env.DB_USER || 'admin',
    password: process.env.DB_PASS || 'admin123!',
    host: process.env.DB_HOST || "mongo", //127.0.0.1
    port: process.env.DB_PORT || "27084", //27017
    repl: process.env.DB_REPL || "rs0",
    auth_db: process.env.AUTHENTICATING_DB || "admin",
    servers: process.env.DATABASE_DB_SERVERS ? process.env.DATABASE_DB_SERVERS.split(" ") : ["mongo:27084"],
}

export  {
    udpConfig ,DatabaseConfig,apiServerConfig
}
