const mongoose = require('mongoose');

const uri = "mongodb://localhost:27017/thodibaat";

console.log("Attempting to connect to:", uri);

mongoose.connect(uri)
    .then(() => {
        console.log("Successfully connected to MongoDB!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("Connection failed:", err);
        process.exit(1);
    });
