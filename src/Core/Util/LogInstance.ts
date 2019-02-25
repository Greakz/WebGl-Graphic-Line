export interface LogInterface {
   info(source: string, message: string): void;
   set_show_logs(setTo: boolean): void;
}

class Log implements LogInterface {

    private show_logs: boolean = false;

    info(source: string, message: any) {
        if(this.show_logs) {
            let d = new Date();
            let time = '[' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ']';
            if(Object.prototype.toString.call(message) === '[object String]') {
                console.log(time + source + ': ' + message)
            } else {
                console.log(time + source + ':')
                console.log(message)
            }
        }
    }

    set_show_logs(setTo: boolean) {
        this.show_logs = setTo;
    }
}

var LogInstance: LogInterface = new Log();
export default LogInstance;