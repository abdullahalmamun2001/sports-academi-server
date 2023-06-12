const express = require('express');
const app = express();
require('dotenv').config()
const jwt = require('jsonwebtoken');
const stripe = require("stripe")(process.env.Payment_Secret_key);

const cors = require('cors');

const port = process.env.PORT || 5000;


// middleware
app.use(cors())
app.use(express.json())

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    res.status(401).send({ error: true, message: 'unauthorized function' })
  }
  const token = authorization.split(' ')[1]
  jwt.verify(token, process.env.JWT_web_token, (err, decoded) => {
    if (err) {
      res.status(401).send({ error: true, message: 'unauthorized function' })
    }
    req.decoded = decoded;
    next();
  })
}

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kbqlzif.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {

    const usersCollection = client.db("sports-ecademy").collection('users');
    const classesCollection = client.db("sports-ecademy").collection('classes');
    const purchaseCollection = client.db("sports-ecademy").collection('purchase');

    // jwt apis 
    // console.log(process.env.JWT_web_token);
    app.post('/jwt', (req, res) => {

      const body = req.body;
      const token = jwt.sign(body, process.env.JWT_web_token, { expiresIn: '1h' })
      res.send(token)
    })
    // user data save apis 


    // app.get('/user/admin/:email', verifyJWT, async (req, res) => {
    //   const email = req.params.email;
    //   const decodedEmail = req.decoded.email;

    //   if (email !== decodedEmail) {
    //     return ({ admin: false })
    //   }
    //   const query = { email: email };
    //   const user = await usersCollection.findOne(query);
    //   const result = { admin: user?.role === 'admin' }
    //   res.send(result)
    // })
    // app.get('/users/admin/:email', verifyJWT, async (req, res) => {
    //   const email = req.params.email;

      

    //   const query = { email: email }
    //   const user = await usersCollection.findOne(query);
    //   const result = { admin: user?.role === 'admin' }
    //   res.send(result);
    // })

    app.put('/user/:email', async (req, res) => {
      const user = req.body;
      const email = req.params.email;
      const query = { email: email }
      const doc = {
        $set: user
      }
      const option = { upsert: true }
      const result = await usersCollection.updateOne(query, doc, option)
      res.send(result)

    })
    app.patch('/user/:id', async (req, res) => {

      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const doc = {
        $set: {
          role: 'admin'
        }
      }

      const result = await usersCollection.updateOne(query, doc)
      res.send(result)

    })
    app.patch('/user/admin/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const doc = {
        $set: {
          role: 'instructor'
        }
      }

      const result = await usersCollection.updateOne(query, doc)
      res.send(result)

    })

    app.get('/user', async (req, res) => {
      const result = await usersCollection.find().toArray()
      res.send(result)
    })

    // add class added api 


    app.patch('/class/approve/:id', async (req, res) => {

      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const doc = {
        $set: {
          status: 'approve'
        }
      }
      const option = { upsert: true }
      const result = await classesCollection.updateOne(query, doc, option)
      res.send(result)
    })


    app.patch('/class/denied/:id', async (req, res) => {

      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const doc = {
        $set: {
          status: 'denied'
        }
      }
      const option = { upsert: true }
      const result = await classesCollection.updateOne(query, doc, option)
      res.send(result)
    })

    app.patch('/class/feedback/:id', async (req, res) => {

      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const doc = {
        $set: {
          status: 'denied'
        }
      }
      const option = { upsert: true }
      const result = await classesCollection.updateOne(query, doc, option)
      res.send(result)
    })


    app.post('/class', async (req, res) => {
      const user = req.body;
      const result = await classesCollection.insertOne(user)
      res.send(result)

    })


    app.put('/user/:id', async (req, res) => {
      const user = req.body;
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const doc = {
        $set: user
      }
      const option = { upsert: true }
      const result = await classesCollection.updateOne(query, doc, option)
      res.send(result)

    })


    app.get('/classes', async (req, res) => {
      const status = req.query.status;
      if (!status) {
        res.send([])
      }
      const query = { status: status }
      const result = await classesCollection.find(query).toArray()
      res.send(result)
    })


    app.get('/class', async (req, res) => {
      const result = await classesCollection.find().toArray()
      res.send(result)
    })

    
    app.get('/class/:id', async (req, res) => {
      const id=req.params.id;
      const query={_id:new ObjectId(id)}
      const result = await classesCollection.find(query).toArray()
      res.send(result)
    })




    // purchase collection api 
    app.get('/pay/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) }
      res.send(await purchaseCollection.find(query).toArray())
    })


    app.put('/purchase/:id', async (req, res) => {
      const user = req.body;
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const doc = {
        $set: user
      }
      const option = { upsert: true }
      const result = await purchaseCollection.updateOne(query, doc, option)
      res.send(result)
      console.log(result);
    })

    app.post('/purchase', async (req, res) => {
      const body = req.body;
      res.send(await purchaseCollection.insertOne(body))
    })

    app.get('/purchase', async (req, res) => {
      const result = await purchaseCollection.find().toArray()
      res.send(result)
    })

    // purchase deleted api 

    app.delete('/purchase/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      res.send(await purchaseCollection.deleteOne(query))
    })


    // card payment api 
    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      if (price) {
        const amount = price * 100;
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: "usd",
          payment_method_types: ['card']
        });
        res.send({
          clientSecret: paymentIntent.client_secret,
        });
      }
    })

    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('server is running')
})
app.listen(port, () => {
  console.log(`server is running with port ${port}`);
})