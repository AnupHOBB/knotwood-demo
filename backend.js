const ROOT = "assets/";
const FLOOR_DIR = "floors/";

var http = require('http');
http.createServer((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin","*");
        res.setHeader("Access-Control-Allow-Headers","resource-type, resource-path");
        let type = req.headers["resource-type"];
        if (type == undefined || type == null)
            fetchFrontend(req, res);
        else if (type === "file-list")
            fetchDirectoryList(res);
        else if (type === "image")
            fetchImage(res, req.headers["resource-path"]);  
    }
).listen(8080);

function fetchFrontend(req, res)
{
    let type = req.headers["sec-fetch-dest"];
    const fs = require("fs");
    if (type === "document")
    {
        res.writeHead(200, {"Content-type" : "text/html"});
        fs.readFile("main.html", "utf-8", (err, data) =>
            {
                res.write(data);
                res.end();
            }
        );
    }
    else if (type === "style")
    {
        res.writeHead(200, {"Content-type" : "text/css"});
        fs.readFile("main_style.css", "utf-8", (err, data) =>
            {
                res.write(data);
                res.end();
            }
        );
    }
    else if (type === "script")
    {
        let requestURL = req.headers["referer"];
        res.writeHead(200, {"Content-type" : "text/javascript"});
        fs.readFile("main.js", "utf-8", (err, data) =>
            {
                res.write("const BACKEND = '"+requestURL+"';"+data);
                res.end();
            }
        );
    }
    else if (type === "image")
    {
        res.writeHead(200, {"Content-type" : "image/png"});
        fs.readFile("assets/house.png", (err, data) =>
            {
                res.write(data);
                res.end();
            }
        );
    }
}

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