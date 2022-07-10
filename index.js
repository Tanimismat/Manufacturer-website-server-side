const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oid2i.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// function for verifying JWT

// function verifyJWT(req, res, next) {
//     console.log('abc');
// }

// function verifyJWT(req, res, next) {
//     // reading auth header
//     const authHeader = req.headers.authorization;
//     // console.log('abc');
//     // sending response if there is no auth header
//     if (!authHeader) {
//         return res.status(401).send({ message: "Unauthorized access" });
//     }
//     // checking if the token is correct == verification
//     const token = authHeader.split(' ')[1];
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
//         // if (err) {
//         //     return res.status(403).send({ message: "Forbidden access" });
//         // }
//         // req.decoded = decoded;
//         next()
//     });
// }

async function run() {
    try {
        await client.connect()
        // await client.db("manufacturer_website").collection("tools");
        console.log("Connected to manufacturer database"); 
        const database = client.db('manufacturer_website');

        const toolCollection = database.collection('tools');
        const orderCollection = database.collection('orders');
        const userCollection = database.collection('users');
        
        // loading data from database
        app.get('/tools', async (req, res) => {
            const query = {};
            const cursor = toolCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools);
        })

        // api for loading single tool
        app.get('/tool/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const singleTool = await toolCollection.findOne(query);
            res.send(singleTool);
        })

        // adding orders data
        app.post('/orders', async(req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })
        // --------
        app.get('/orders', async (req, res) => {
            const user = req.query.email;
            // reading authorization header
            const authorization = req.headers.authorization;
            console.log('auth header',authorization)

            // const decodedEmail = req.decoded.email;
            // if (user === decodedEmail) {
            //     const query = { user: user };
            //     const orders = await orderCollection.find(query).toArray();
            //     return res.send(orders);
            // }
            // else {
            //     return res.status(403).send({ message: "Forbidden access" });
            // }
            const query = { user: user };
            const orders = await orderCollection.find(query).toArray();
            return res.send(orders);
        })

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user ,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
            res.send({result, token});
        })
    } 
    finally { 
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Manufacturer server is running')
});

app.listen(port, () => {
    console.log('Listening to port', port)
})