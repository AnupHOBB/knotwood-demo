var http = require('http');
http.createServer((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin","http://127.0.0.1:5500");
        res.writeHead(200, {'Content-type' : 'text/plain'});
        const testFolder = 'assets/floors';
        const fs = require('fs');
        fs.readdir(testFolder, (err, files) => {
            files.forEach(file => 
            {
                res.write("floors/"+file+"|");
            });
            res.end();
        });
    }
).listen(8080);
