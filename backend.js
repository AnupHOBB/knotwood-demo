const ROOT = "assets/"
const FLOOR_DIR = "floors/"
const SCRIPTS = ["utils.js", "main.js"]
let scriptCounter = 0

var http = require('http')
http.createServer((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin","*")
        res.setHeader("Access-Control-Allow-Headers","resource-type, resource-path")
        let type = req.headers["resource-type"]
        if (type == undefined || type == null)
            fetchFrontend(req, res)
        else if (type === "file-list")
            fetchDirectoryList(res)
        else if (type === "image")
            writeResponse(res, {fileName : ROOT+req.headers["resource-path"], contentType : "image/png"})
    }
).listen(8080);

function fetchFrontend(req, res)
{
    let type = req.headers["sec-fetch-dest"]
    if (type === "document")
        writeResponse(res, {fileName : "main.html", contentType : "text/html"})
    else if (type === "style")
        writeResponse(res, {fileName : "main.css", contentType : "text/css"})
    else if (type === "script")
    {
        writeResponse(res, {fileName : SCRIPTS[scriptCounter], contentType : "text/javascript", suffix : 'const BACKEND = "'+req.headers['host']+'"'})
        scriptCounter = (scriptCounter < (SCRIPTS.length-1))? scriptCounter+1 : 0
    }
    else if (type === "image")
        writeResponse(res, {fileName : "assets/house.png", contentType : "image/png"})
}

function writeResponse(res, fileData)
{
    res.writeHead(200, {'Content-type' : fileData.contentType})
    const fs = require("fs")
    fs.readFile(fileData.fileName, (err, data) =>
        {
            res.write((fileData.suffix != undefined)?data+fileData.suffix:data)
            res.end()
        }
    )
}

function fetchDirectoryList(res)
{
    const path = ROOT+FLOOR_DIR
    const fs = require("fs")
    res.writeHead(200, {'Content-type' : 'text/plain'})
    fs.readdir(path, (err, files) => 
        {
            files.forEach(file => res.write(FLOOR_DIR+file+"|"))
            res.end()
        }
    )
}