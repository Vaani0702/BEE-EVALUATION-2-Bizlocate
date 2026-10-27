# MongoDB shell commands (from sir's notes) - try them on BizLocate's own database

Open the shell:  `mongosh`   (or MongoDB Compass -> open _MONGOSH at the bottom)

```js
show dbs                                  // list all databases
use bizlocate                             // switch to (or create) our database
show collections                          // users, properties, enquiries, requirements, sharerequests

db.createCollection("students")           // make a collection
db.students.insertOne({ name: "Prabh", age: 20, course: "B.Tech" })   // add one document
db.students.find()                        // fetch everything
db.students.find({ age: 20 })             // fetch with a condition
db.students.findOne({ name: "Prabh" })    // fetch the first match
db.students.updateOne({ name: "Prabh" }, { $set: { age: 23 } })       // change a value
db.students.updateMany({ course: "B.Tech" }, { $set: { year: 2 } })   // change many
db.students.deleteOne({ name: "Prabh" })  // delete the first match
db.students.deleteMany({ age: 23 })       // delete all matches
db.students.drop()                        // delete the whole collection
```

## SQL vs NoSQL words (from the notes)
| SQL (RDBMS) | MongoDB (NoSQL) |
|---|---|
| Database | Database |
| Table | Collection |
| Row / Record | Document (JSON-like) |
| Column / value | Field |

## The same commands on our real data
```js
db.properties.find({ verification: "pending" })                 // the admin queue
db.properties.find({ verification: "verified" }, { title: 1 })  // only titles
db.users.findOne({ email: "admin@bizlocate.com" })              // note the password is a long hash
db.properties.updateOne({ title: "Logistics Hub Alpha" }, { $set: { verification: "verified" } })
db.enquiries.deleteMany({ status: "Pending" })
```

## Mongoose = the library that connects Node.js to MongoDB
1. Make a **Schema** (shape of the document)  ->  `server/models/Property.js`
2. Make a **Model** from it  ->  `mongoose.model("Property", propertySchema)`
3. Use the model's methods: `Property.create`, `find`, `findById`, `updateOne`, `deleteOne` ...
