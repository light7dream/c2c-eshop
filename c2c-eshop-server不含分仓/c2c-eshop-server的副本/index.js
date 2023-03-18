let express = require('express')
let bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
let domain = require('domain')
const path = require('path')
const winston = require('winston')
const moment = require('moment')

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    transports: [
        new winston.transports.File({
            filename: 'http.log', 
            maxsize: "100m",
            maxFiles: 50,
            rotationFormat:()=>{
                return moment().format('YYYY-MM-DD.log')
            }
        }),
        // new winston.transports.Console()
    ]
})

let app = express()
let config = require('./package.json').config
// 集群模式开启时，会有多个任务实例，需要注释掉
//let schedule_task = require('./server_modules/schedule_task')

// parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

// parse application/json
app.use(bodyParser.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'xlsx')))

app.get('*', reqHandler)
app.post('*', reqHandler)
app.put('*', reqHandler)
app.delete('*', reqHandler)

function reqHandler(req, res, next) {
    if (
      req &&
      [
        '/web/user_goods/cancelOrder',
        '/web/rush/shoot',
        '/web/user_goods/myGoods',
      ].includes(req.path)
    ) {
      logger.info(formatReq(req))
    }
    next()
}

function formatReq(req) {
    let logStr = getStandardDateTime()
    logStr += `\t${req.method} ${req.path}`
    logStr += `${toString(req.query, 2)}`
    logStr += `\n\tHeader:`
    logStr += `${toString2(req.headers, 2)}`
    if (req.method !== 'GET') {
        logStr += `\n\tBody:`
        if (req.body instanceof Object) {
            logStr += `${toString(req.body, 2)}`
        } else {
            logStr += `\n\t\t${req.body}`
        }
    }
    return logStr
}

function getStandardDateTime(date) {
    return moment(date).format('YYYY-MM-DD HH:mm:ss')
}

function toString(obj, tabCount = 2) {
    let str = ''
    let item
    for (let key in obj) {
        item = obj[key]
        str += '\n'
        for (let i = 0; i < tabCount; i++) {
            str += '\t'
        }
        str += `${key}:`
        if (item instanceof Object) {
            str += toString(item, tabCount + 1)
        } else {
            str += ` ${item}`
        }
    }
    return str
}
function toString2(obj, tabCount = 2) {
    let str = ''
    let item
    for (let key in obj) {
        if(key == 'referer' || key=='tid' || key=='origin' || key =='user-agent'){
            item = obj[key]
            str += '\n'
            for (let i = 0; i < tabCount; i++) {
                str += '\t'
            }
            str += `${key}:`
            if (item instanceof Object) {
                str += toString(item, tabCount + 1)
            } else {
                str += ` ${item}`
            }
        }
    }
    return str
}


let routers = require('./server_modules/routers');
if (routers.list && routers.list.length > 0) {
    routers.list.forEach(r => {
        app.use(r.name, r.router);
    })
}

// 未处理异常捕获 middleware
app.use(function (req, res, next) {
    let d = domain.create();
    d.add(req);
    d.add(res);
    d.on('error', function (err) {
        console.error('uncaughtException url=%s, msg=%s', req.url, err.stack || err.message || err);
        if (!res.finished) {
            res.statusCode = 500;
            res.setHeader('content-type', 'application/json; charset=UTF-8');
            res.end('uncaughtException');
        }
    });
    d.run(next);
});

// 跨域支持
app.all('/api/*', function (req, res, next) {
    var origin = req.headers.origin;
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS, DELETE');
    //}
    next();
});

//404判断
app.use(function (req, res) {
    res.send('404 not found');
});

app.listen(config.server_port);

console.log("")
console.log(`------------ Info ${new Date().toLocaleString()} ---`)
console.log(`HomeServer is running at ${config.server_port}`);
console.log("------------ Info End -----------------")
console.log("\n")

// let https = require("https");
// let fs = require("fs");
// // Configuare https
// const httpsOption = {
//     key : fs.readFileSync("./cert/test.key"),
//     cert: fs.readFileSync('./cert/test.pem')
// }
// https.createServer(httpsOption, app).listen(11002);
// console.log(`SSL sever is running at 11002`);