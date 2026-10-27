// SIR'S NOTES: JWT = JSON Web Token, composed of 3 parts: Header . Payload (user data) . Signature
// Run:  node demo/05-jwt-demo.js
const jwt = require("jsonwebtoken");

const SECRET = "only-the-server-knows-this";            // the secret code (JWT_SECRET in .env)

// Login success -> the server SIGNS a token (like stamping a ticket)
const token = jwt.sign({ id: "123", role: "owner" }, SECRET, { expiresIn: "7d" });
console.log("TOKEN:", token);

// The 3 parts are just text joined by dots
const [header, payload, signature] = token.split(".");
console.log("HEADER   :", Buffer.from(header, "base64").toString());   // algorithm
console.log("PAYLOAD  :", Buffer.from(payload, "base64").toString());  // user data (readable by anyone! never put passwords here)
console.log("SIGNATURE:", signature);                                  // made from header + payload + SECRET

// Every later request -> the server VERIFIES the token
console.log("VERIFIED :", jwt.verify(token, SECRET));

// A changed token or a wrong secret fails
try { jwt.verify(token + "x", SECRET); } catch (e) { console.log("TAMPERED:", e.message); }
try { jwt.verify(token, "wrong-secret"); } catch (e) { console.log("WRONG KEY:", e.message); }

// In the project: authController.js signs at login/signup, middleware/auth.js verifies on every protected route,
// and the server keeps it in an httpOnly cookie named "token" that the browser sends back automatically.
