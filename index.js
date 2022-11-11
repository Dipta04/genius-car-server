const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
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

// jwt
function verifyJWT(req, res, next) {
  // console.log(req.headers.authorization)
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: 'unauthorized access' });
  }
  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' });
    }
    req.decoded = decoded;
    next();
  })

}

async function run() {

  try {

    const serviceCollection = client.db('geniusCar').collection('services');
    const orderCollection = client.db('geniusCar').collection('orders');


    //  jwt token ar jonno
    app.post('/jwt', (req, res) => {
      const user = req.body;
      // console.log(user);
      // '1d' mani 1din.. age 1h dewa chilo...a time ar por token thake na tai error diya dei order a
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
      res.send({ token })
    })

    //  sob gula pete
    app.get('/services', async (req, res) => {
      //geter than 100-less than 300 ar modhe sorting
      //  const query = { price: { $gt: 100, $lt: 300 } }
      // jegular price 200 ogula dao
      //  const query = { price: { $eq: 200 } }
      // gte mane geter than or equals to (200 theka boro ba soman)
      //  const query = { price: { $gte: 200 } }
      // lte mane less than or equals to (200 theka choto ba soman)
      //  const query = { price: { $lte: 200 } }
      // ne mane not equals to (150 bade baki gula)
      //  const query = { price: { $ne: 150 } }
      // shudu array ar modhe value gula dao(in)
      //  const query = { price: { $in: [20, 40, 150] } }
      // array modhe jegula asa ogula bade bakigula(nin)
      //  const query = { price: { $nin: [20, 40, 150] } }
      // 2,3 ta sorto use korta and ar bebohar
      //  const query = { $and: [{price: {$gt: 20}}, {price: {$gt: 100}}] }
      const search = req.query.search;
      console.log(search);
      let query = {};
      if (search.length) {
        query = {
          $text: {
            $search: search
          }
        }
      }
      const order = req.query.order === 'asc' ? 1 : -1;
      const cursor = serviceCollection.find(query).sort({ price: order });
      const services = await cursor.toArray();
      res.send(services);
    })
    // specific  
    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    })


    // orders api(data create)

    // sob gula pete
    app.get('/orders', verifyJWT, async (req, res) => {

      const decoded = req.decoded;
      //  console.log('inside orders api', decoded);
      if (decoded.email !== req.query.email) {
        res.status(403).send({ message: 'unauthorized access' })
      }
      //  console.log(req.query.email);
      let query = {};

      if (req.query.email) {
        query = {
          email: req.query.email
        }
      }

      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    });

    app.post('/orders', verifyJWT, async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    })

    //  update ar jonno
    app.patch('/orders/:id', verifyJWT, async (req, res) => {
      const id = req.params.id;
      const status = req.body.status;
      const query = { _id: ObjectId(id) }
      const updatedDoc = {
        $set: {
          status: status
        }
      }
      const result = await orderCollection.updateOne(query, updatedDoc);
      res.send(result);
    })

    //  delete ar jonno
    app.delete('/orders/:id', verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    })
  }
  finally {

  }
}

run().catch(error => console.error(error));


app.get('/', (req, res) => {
  res.send('genius car server is running')
})

app.listen(port, () => {
  console.log(`Genius car server running on ${port}`);
})


