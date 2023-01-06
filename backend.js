const ROOT = "assets/"
const FLOOR_DIR = "floors/"
const SCRIPTS = ["utils.js", "main.js"]
let scriptCounter = 0

var http = require('http')
http.createServer((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin","*")

        /**
         * This needs to be done as resource-type and resource-path are custom headers sent by the client.
         * resource-type indicates whether the client wants an image or file-list.
         * resource-path holds the name of file.
         * When resource-type = "file-list", then resource-path will be empty.
         */
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

/**
 * Here, all of the front end files are sent to the client using the following function.
 * This was done so that there would be no need to host two different servers for front-end and back-end.
 */
function fetchFrontend(req, res)
{
    let type = req.headers["sec-fetch-dest"]
    if (type === "document")
        writeResponse(res, {fileName : "main.html", contentType : "text/html"})
    else if (type === "style")
        writeResponse(res, {fileName : "main.css", contentType : "text/css"})
    else if (type === "script")
    {
        /*
         * suffix variable is used to append any extra data at the end of each file. Here, the BACKEND variable is appended at the end of each .js file.
         * However, the BACKEND variable is used only by the main.js file.
         */
        writeResponse(res, {fileName : SCRIPTS[scriptCounter], contentType : "text/javascript", suffix : 'const BACKEND = "'+req.headers['host']+'"'})

        /**
         * This is used to pick the script files from SCRIPTS.
         * if scriptCounter = 0, then utils.js is selected from SCRIPTS array.
         * if scriptCounter = 1, then main.js is selected from SCRIPTS array.
         */
        scriptCounter = (scriptCounter < (SCRIPTS.length-1))? scriptCounter+1 : 0
    }
    else if (type === "image")
        writeResponse(res, {fileName : "assets/house.png", contentType : "image/png"})
}

/*
 * Used for sending files to the client
 */
function writeResponse(res, fileData)
{
    res.writeHead(200, {'Content-type' : fileData.contentType})
    const fs = require("fs")
    fs.readFile(fileData.fileName, (err, data) =>
        {
            res.write((fileData.suffix != undefined)? data+fileData.suffix : data)
            res.end()
        }
    )
}

/**
 * Fetches the relative paths of the images within the assets/floors folder
 */
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