const express = require('express');
const mongoose = require('mongoose');
const app = express();

const uri = 'mongodb+srv://rolicus:CodeKicks4550@cluster0.oqn2t2i.mongodb.net/?retryWrites=true&w=majority'

async function connect(){
    try {
        await mongoose.connect(uri)
        console.log("Connected to MongoDB");
    } catch (erro) {
        console.error(error);
    }
}

connect();

app.listen(8000, () => {
    console.log("Server started on port 8000");
});
