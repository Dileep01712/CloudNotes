const mongoose = require('mongoose');
// const mongoURI = "mongodb+srv://Dileep:dileep1217@test.3ipk9ce.mongodb.net/?retryWrites=true&w=majority";
const mongoURI = "mongodb://localhost:27017/cloudnotes";

const connectToMongo = () => {
  mongoose.connect(mongoURI)
    .then(() => {
      console.log("Connected to MongoDB server successfully");
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB:", error);
    });
}

module.exports = connectToMongo;
