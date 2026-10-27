// SIR'S NOTES: "Path module" - gives / builds the path of a file.
// Run:  node demo/03-path-module.js
const path = require("path");

console.log(__dirname);                         // folder this file is in (full path)
console.log(__filename);                        // this file (full path)

const myPath = path.join(__dirname, "photos", "building.jpg"); // build a path that works on Windows, Mac and Linux
console.log(myPath);

console.log(path.basename(myPath));             // building.jpg   (file name)
console.log(path.dirname(myPath));              // folder part of the path
console.log(path.extname(myPath));              // .jpg           (extension)
console.log(path.parse(myPath));                // all parts in one object

// In the project: upload.js uses path.extname to keep ".jpg"/".pdf",
// and propertyController.js uses path.join to find the private PDF before res.sendFile.
