// SIR'S NOTES: "File System module (fs)" - file related work on the backend.
// Run:  node demo/02-fs-module.js
const fs = require("fs");

console.log("Start"); // 1st

// writeFile = create a file (or overwrite it). It is ASYNC (callback style):
// Node starts the job, moves on to the next line, and calls our function when the job is done.
fs.writeFile("demo-data.txt", "Hello BizLocate", (err) => {
  if (err) return console.log("Write failed:", err.message); // err is null when everything is fine
  console.log("3rd: file written"); // 3rd - runs AFTER "End"

  // appendFile = add content at the end of the file ("\n" = new line)
  fs.appendFile("demo-data.txt", "\nSecond line", (err2) => {
    if (err2) return console.log(err2);

    // readFile = read it back. "utf8" makes it readable text instead of raw bytes.
    fs.readFile("demo-data.txt", "utf8", (err3, data) => {
      if (err3) return console.log(err3);
      console.log("File says:\n" + data);

      // unlink = delete the file
      fs.unlink("demo-data.txt", () => console.log("File deleted"));
    });
  });
});

console.log("End"); // 2nd - the line after an async call runs BEFORE its callback

// Expected output order: Start, End, 3rd: file written, File says..., File deleted
// (the sync versions - fs.readFileSync etc. - would block and print in normal top-to-bottom order)

// In the project: server/utils/removeFiles.js uses fs.unlink to delete uploaded photos and PDFs,
// and server/middleware/upload.js uses fs.mkdirSync to create the upload folders.
