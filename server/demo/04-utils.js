// SIR'S NOTES: "Modules - user build module". One file exports, another file imports.
function add(a, b) { return a + b; }
function sub(a, b) { return a - b; }

module.exports = { add, sub }; // export to index.js
