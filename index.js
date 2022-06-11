const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');

// middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oid2i.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()
        await client.db("manufacturer_website").collection("tools");
        console.log("Connected to server");
    }
    finally { 
        await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('server is running')
});

app.listen(port, () => {
    console.log('Listening to port', port)
})