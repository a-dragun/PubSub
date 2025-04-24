const mongoose = require("mongoose");

const dbURI = process.env.MONGO_URI

mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("Error connecting to MongoDB:", err));

module.exports = mongoose;
