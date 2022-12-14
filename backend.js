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
            writeResponse(res, {fileName : ROOT+req.headers["resource-path"], contentType : "image/png", prefix : ""})
    }
).listen(8080);

function fetchFrontend(req, res)
{
    let type = req.headers["sec-fetch-dest"]
    if (type === "document")
        writeResponse(res, {fileName : "main.html", contentType : "text/html", prefix : ""})
    else if (type === "style")
        writeResponse(res, {fileName : "main.css", contentType : "text/css", prefix : ""})
    else if (type === "script")
    {
        let script = SCRIPTS[scriptCounter]
        let prefixValue = (script == "main.js") ? "const BACKEND = '"+req.headers["referer"]+"'\n" : ""
        writeResponse(res, {fileName : script, contentType : "text/javascript", prefix : prefixValue})
        scriptCounter = (scriptCounter < (SCRIPTS.length-1))? scriptCounter+1 : 0
    }
    else if (type === "image")
        writeResponse(res, {fileName : "assets/house.png", contentType : "image/png", prefix : ""})
}

function writeResponse(res, fileData)
{
    res.writeHead(200, {'Content-type' : fileData.contentType})
    const fs = require("fs")
    fs.readFile(fileData.fileName, (err, data) =>
        {
            res.write((fileData.prefix != "")?fileData.prefix + data:data)
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