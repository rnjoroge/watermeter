
import {IData, IProtocol,ICrc, IProcessedData} from './interface';
import { decode, encode } from 'cbor-x';

export default class ProtocolImpl implements IProtocol {

    constructor (private crc:ICrc) {
        
    }
    get_data(data: IData): IProcessedData {
      let respdata:IProcessedData={
          device_details: {},
          meter_information: {},
          meter_valve:{},
          abnormal_alarm:{},
          delivery_reporting: {},
          interactive_information: {},
          gateway_information: {},
      };
       if(data.data) {
          data.data.forEach(element => {
            if(element.bn =='/3/0') {
                respdata.device_details=this.deviceDetails(element);
            }
            if(element.bn =='/80/0') {
                respdata.meter_information= this.meterinfo(element)
            }
            if(element.bn =='/81/0') {
                respdata.meter_valve= this.meter_valve(element)
            }
            if(element.bn =='/82/0') {
                respdata.abnormal_alarm= this.abnormal_alarm(element)
            }

            if(element.bn =='/84/0') {
                respdata.delivery_reporting= this.delivery_reporting(element)
            }
            if(element.bn =='/99/0') {
                respdata.interactive_information= this.interactive_information(element)
            }
            
         });
       }

       return respdata;
    }

    private deviceDetails(devObj:any):any {
     let dt={
        "manufacturer":devObj["0"] ||"",
        "model":devObj["1"] ||"",
        "serial_number":devObj["2"] ||"",
        "firmware_version":devObj["3"] ||"",
        "reboot":devObj["4"] ||"",
        "factory_reset":devObj["5"] ||"",
        "available_power_source":devObj["6"] ||"",
        "power_source_voltage":devObj["7"] ||"",
        "power_source_current":devObj["8"] ||"",
        "battery_level":devObj["9"] ||"",
        "memory_free":devObj["10"] ||"",
        "error_code":devObj["11"] ||"",
        "reset_error_code":devObj["12"] ||"",
        "current_time":devObj["13"] ||"",
        "utc_offset":devObj["14"] ||"",
        "timezone":devObj["15"] ||"",
        "binding_modes":devObj["16"] ||"",
        "device_type":devObj["17"] ||"",
        "hardware_version":devObj["18"] ||"",
        "software_version":devObj["19"] ||"",
        "battery_status":devObj["20"] ||"",
        "memory_total":devObj["21"] ||"",
        "ext_dev_info":devObj["22"] ||"",
        "message_sequence":devObj["23"] ||"",
        "working_hours":devObj["24"] ||"",
        "querry_info":devObj["40"] ||"",
        
     }
     return dt;
    }

    private meterinfo(devObj:any):any {
        let dt={
            "meter_type":devObj["0"] ||"",
            "measurement_model":devObj["1"] ||"",
            "pn":devObj["2"] ||"",
            "dn":devObj["3"] ||"",
            "q3":devObj["4"] ||"",
            "q3/q1":devObj["5"] ||"",
            "measurement_fault_status":devObj["6"] ||"",
            "max_reading":devObj["7"] ||"",
            "real_flow_rate":devObj["8"] ||"",
            "real_power":devObj["9"] ||"",
            "accumulated_heat":devObj["10"] ||"",
            "inlet_water_temperature":devObj["11"] ||"",
            "back_water_pressure":devObj["12"] ||"",
            "positive_flow":devObj["13"] ||"",
            "reverse_flow":devObj["14"] ||"",
            "peak_flow_rate":devObj["15"] ||"",
            "meter_reading":devObj["16"] ||"",
            "dense":devObj["17"] ||"",
            "frozen_data":devObj["18"] ||"",
            "read_day_frozen_data":devObj["19"] ||"",
            "reading_meter_time":devObj["21"] ||"",
            "available_water_allowance":devObj["23"] ||"",
            "available_water_allowance_alarm_value":devObj["24"] ||"",
            "overdraft_volume":devObj["26"] ||"",
            "dense_data_cycle":devObj["27"] ||"",
            "read_dense_data":devObj["28"] ||"",
            "read_month_frozen_data":devObj["29"] ||"",
            "read_dense_frozen_data":devObj["30"] ||"",
            "payment_function":devObj["31"] ||"",
            "dense_frozen_function":devObj["32"] ||"",
            "temperature_difference":devObj["33"] ||"",
            "pressure_valve":devObj["34"] ||"",
            "temperature_value":devObj["35"] ||"",
            "meter_status":devObj["36"] ||"",
            "meter_battery_voltage":devObj["37"] ||"",
            "accumulated_cold_water":devObj["38"] ||"",
            "query_meter_information":devObj["40"] ||"",
            "latitude_information":devObj["41"] ||"",
            "longitude_information":devObj["42"] ||"",
            "altitude":devObj["43"] ||"",
            
            
            
        }
        return dt;
    }

    private meter_valve (devObj:any):any {
        let dt={
            "valve_control":devObj["0"] ||"",
            "valve_current_status":devObj["1"] ||"",
            "valve_fault_status":devObj["2"] ||"",
            "valve_type":devObj["3"] ||"",
            "valve_overturn_period":devObj["4"] ||"",
            "atk_close_valve":devObj["5"] ||"",
            "force_valve_control":devObj["6"] ||"",
            "valve_control_timeout":devObj["7"] ||"",
            "valve_opening_angle":devObj["8"] ||"",
            "querry_valve_info":devObj["40"] ||"",
          
        }
        return dt;
    }
    private abnormal_alarm (devObj:any):any {
    }
    private delivery_reporting (devObj:any):any {
    }
    private interactive_information (devObj:any):any {
    }
    
    


   async from_bytes(data: Buffer): Promise<IData> {
    try {

        const arr = new Uint8Array(data);

        let validationResult=this.crc.validate(arr);
        if(!validationResult) {
            throw new Error(" Invalid checksum")
        }

        let dt:IData = {
            version: "V"+arr[0]+"."+arr[1],
            messageType: arr[2].toString(),
            messageCode: arr[3].toString(),
            messageId: this.convertUint8_to_hexStr(arr.slice(4,6)),
            datafieldFormat: arr[6].toString(),
            datafiledlength:this.convertUint8_to_hexStr(arr.slice(7,9)),
            delimeter: arr[9].toString(),
            data: undefined,
            checkcode: ''
        }


        let todecode = arr.slice(10,arr.length-2);

       // console.log(" ==== todecode=",todecode);
        let ddata = decode(todecode);
        dt.data=ddata;
       // return ddata 
       return dt;
    } catch (error) {
        console.error(error)  ;
    }
    }

    private convertUint8_to_hexStr(uint8) {
        let hex = Buffer.from(uint8).toString('hex');
        const hexToDecimal =parseInt(hex, 16);
        return hexToDecimal;
    }
    
}