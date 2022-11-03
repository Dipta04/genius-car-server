const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middlewares(express json ta post ar jonno lage ..mongodb)
app.use(cors());
app.use(express.json());


// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASSWORD);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qgt0ukq.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){

    try{
     
         const serviceCollection = client.db('geniusCar').collection('services');
         const orderCollection = client.db('geniusCar').collection('orders');
         
        //  sob gula pete
        app.get('/services', async(req, res) =>{
               const query = {}
               const cursor = serviceCollection.find(query);
               const services = await cursor.toArray();
               res.send(services);
        })
        // specific pete
        app.get('/services/:id', async(req, res) =>{
          const id = req.params.id;
          const query = { _id: ObjectId(id) };
          const service = await serviceCollection.findOne(query);
          res.send(service);
        })


        // orders api(data create)

        // sob gula pete
         app.get('/orders', async(req, res) =>{
            //  console.log(req.query.email);
             let query = {};

             if(req.query.email)
             {
               query = {
                  email: req.query.email
               }
             }

             const cursor = orderCollection.find(query);
             const orders = await cursor.toArray();
             res.send(orders);
         });

         app.post('/orders', async(req, res) =>{
               const order = req.body;
               const result = await orderCollection.insertOne(order);
               res.send(result);
         })

        //  update ar jonno
         app.patch('/orders/:id', async(req, res) =>{
               const id = req.params.id;
               const status = req.body.status;
               const query = { _id: ObjectId(id) }
               const updatedDoc = {
                 $set:{
                     status: status
                 }
               }
               const result = await orderCollection.updateOne(query, updatedDoc);
               res.send(result);
         })

          //  delete ar jonno
         app.delete('/orders/:id', async(req, res) =>{
                 const id = req.params.id;
                 const query = { _id: ObjectId(id) };
                 const result = await orderCollection.deleteOne(query);
                 res.send(result);
         })
    }
    finally{

    }
}

run().catch(error => console.error(error));


app.get('/', (req, res) => {
  res.send('genius car server is running')
})

app.listen(port, () => {
  console.log(`Genius car server running on ${port}`);
})
