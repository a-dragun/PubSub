const mongoose = require("mongoose");

const dbURI = process.env.MONGO_URI

mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => res.status(500).render('error', { status: 500, message: "Greška na serveru!" }));

module.exports = mongoose;
