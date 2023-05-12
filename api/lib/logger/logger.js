const { format, createLogger, transport, transports } = require("winston");
//Destructuring assignment yapısı ile modülü import etdip kullanıcalak methodları değişken olarak tanımladık.

const { LOG_LEVEL } = require("../../config");

const formats = format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    format.simple(),
    format.splat(),
    format.printf(info => `${info.timestamp} ${info.level.toLocaleUpperCase()}: [email:${info.message.email}] [location:${info.message.location}] [procType:${info.message.proc_type}] [log:${info.message.log}]`)
)

const logger = createLogger({
    level: LOG_LEVEL,
    transports: [
        new (transports.Console)({ format: formats })
    ]
})

module.exports = logger;