import http from "http";
import fs from "fs";
import path from "path";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");

function send(res, status, contentType, body) {
  res.writeHead(status, { "Content-Type": contentType });
  res.end(body);
}

function serveFile(filePath, res) {
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      send(res, 404, "text/plain; charset=utf-8", "Not Found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const types = {
      ".html": "text/html; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".svg": "image/svg+xml",
      ".json": "application/json; charset=utf-8",
    };
    const contentType = types[ext] || "application/octet-stream";
    const stream = fs.createReadStream(filePath);
    stream.on("open", () => {
      res.writeHead(200, { "Content-Type": contentType });
    });
    stream.on("error", () => {
      send(res, 500, "text/plain; charset=utf-8", "Server Error");
    });
    stream.pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, "http://localhost");
  let pathname = decodeURIComponent(reqUrl.pathname);
  if (pathname === "/") pathname = "/index.html";
  const safePath = path.normalize(pathname).replace(/^((\.\.)[\/\\])+/, "");
  const filePath = path.join(publicDir, safePath);
  serveFile(filePath, res);
});

const port = Number(process.env.PORT) || 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

