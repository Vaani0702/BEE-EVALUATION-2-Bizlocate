// SIR'S NOTES: "Node.js - backend pe js program run hota hai"
// This is the PLAIN Node server (no Express). Express (see ../app.js) is just a simpler version of this.
// Run:  node demo/01-http-server.js     then open  http://localhost:4000/home
const http = require("http"); // built-in module, no install needed

let products = [{ id: 1, name: "laptop" }];

const server = http.createServer((req, res) => {
  // req = what the browser sent (url, method, body). res = what we send back.

  // GET /home  -> send text
  if (req.url === "/home" && req.method === "GET") {
    res.end("HOME PAGE");
  }

  // GET /products -> send JSON
  else if (req.url === "/products" && req.method === "GET") {
    res.end(JSON.stringify(products)); // JSON.stringify: object -> string
  }

  // POST /products -> the body arrives in CHUNKS (small pieces) of a stream
  else if (req.url === "/products" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; }); // each time a chunk arrives, add it to the variable
    req.on("end", () => {                           // "end" = all chunks have arrived
      const newProduct = JSON.parse(body);          // JSON.parse: string -> object
      newProduct.id = products.length + 1;
      products.push(newProduct);

      res.statusCode = 201; // 201 = Created
      res.end(JSON.stringify({ success: true, message: "Product data created", data: newProduct }));
    });
  }

  else {
    res.statusCode = 404;
    res.end("Not found");
  }
});

server.listen(4000, () => console.log("Plain Node server on http://localhost:4000"));

// Test the POST from another terminal:
// curl -X POST http://localhost:4000/products -d '{"name":"phone"}'
