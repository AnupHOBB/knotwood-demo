const ROOT = "assets/";
const FLOOR_DIR = "floors/";

var http = require('http');
http.createServer((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin","*");
        res.setHeader("Access-Control-Allow-Headers","resource-type, resource-path");
        let type = req.headers["resource-type"];
        if (type == undefined || type == null)
            res.end();
        else if (type === "file-list")
            fetchDirectoryList(res);
        else if (type === "image")
            fetchImage(res, req.headers["resource-path"]);  
    }
).listen(8080);

function fetchDirectoryList(res)
{
    const path = ROOT+FLOOR_DIR;
    const fs = require("fs");
    res.writeHead(200, {'Content-type' : 'text/plain'});
    fs.readdir(path, (err, files) => 
        {
            files.forEach(file => res.write(FLOOR_DIR+file+"|"));
            res.end();
        }
    );
}

function fetchImage(res, path)
{
    const fs = require("fs");
    res.writeHead(200, {"Content-type" : "image/png"});
    fs.readFile(ROOT+path, (err, data) => 
        {
            res.write(data);
            res.end();
        }
    );
}