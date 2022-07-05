const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
app.use(express.json())
app.use(cors())




const uri = `mongodb+srv://${process.env.RED_ONION_USERNAME}:${process.env.RED_ONION_PASSWORD}@cluster0.69rzivz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
  try {
    await client.connect();
    const breakfastCollection = client.db("food").collection("breakfast")
    const dinnerCollection = client.db("food").collection("dinner")
    const lunchCollection = client.db("food").collection("lunch")
    const orderCollection = client.db("food").collection("order")
    const paymentCollection = client.db("food").collection("paymentes")

    app.get('/breakfast', async (req, res) => {
      const query = {};
      const result = await breakfastCollection.find(query).toArray();
      res.send(result)
    })

    app.get('/breakfast/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await breakfastCollection.findOne(query);
      res.send(result)
    })

    app.get('/dinner', async (req, res) => {
      const query = {};
      const result = await dinnerCollection.find(query).toArray();
      res.send(result);
    })

    app.get('/lunch', async (req, res) => {
      const query = {};
      const result = await lunchCollection.find(query).toArray();
      res.send(result);
    })

    app.post('/order', async (req, res) => {
      const order = req.body;
      const foodOrders = await orderCollection.insertOne(order);
      res.send(foodOrders)
    })

    app.post('/create-payment-intent', async (req, res) => {
      const service = req.body;
      console.log(service, 'service')
      const price = service.grandTotal;
      const amount = price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
      })
      res.send({ clientSecret: paymentIntent.client_secret })
    })
    
    app.get('/order', async (req, res) => {
      const query = {};
      const result = await orderCollection.find(query).toArray();
      res.send(result)
    })

    app.get('/order/:id', async (req, res) => {
      const id = req.params.id;
      let query = { _id:ObjectId(id) };
      const result = await orderCollection.findOne(query);
      res.send(result)
    })

    // app.patch('/order/:id',async(req,res)=>{
    //   const id=req.params.id;
    //   const payment=req.body;
    //   const filter={_id:ObjectId(id)};
    //   const updatedDoc={
    //     $set:{
    //       paid: true,
    //       TransactionId: payment.TransactionId
    //     }
    //   }
    //   const result=await paymentCollection.insertOne(payment)
    //   const updateOrder = await orderCollection.updateOne(filter,updatedDoc)
    //   res.send(updateOrder)
    // })


  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

