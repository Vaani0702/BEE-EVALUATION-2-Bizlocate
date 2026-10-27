// Run:  node demo/04-modules-main.js
const { add, sub } = require("./04-utils"); // import
console.log(add(5, 6)); // 11
console.log(sub(9, 4)); // 5

// In the project every file does this:  models export a model, controllers export functions,
// routes export a router, and app.js requires them all.
