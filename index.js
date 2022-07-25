const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
app.use(express.json())
app.use(cors())




const uri = `mongodb+srv://${process.env.RED_ONION_USERNAME}:${process.env.RED_ONION_PASSWORD}@cluster0.69rzivz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req,res,next){
  const authHeader=req.headers.authorization;
  if(!authHeader){
    return res.status(401).send({message:'UNauthorized access'})
  }
  const token=authHeader.split(' ')[1]
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded) {
    if(err){
      return res.status(403).send({message:'Forbidden access'})
    }
    req.decoded=decoded;
    next()
  });
}

async function run() {
  try {
    await client.connect();
    const breakfastCollection = client.db("food").collection("breakfast")
    const dinnerCollection = client.db("food").collection("dinner")
    const lunchCollection = client.db("food").collection("lunch")
    const orderCollection = client.db("food").collection("order")
    const paymentCollection = client.db("food").collection("payments")
    const profileCollection = client.db("food").collection("profile")
    const userCollection = client.db("food").collection("user")

    app.get('/user',verifyJWT, async (req, res) => {
      const query = {};
      const result = await userCollection.find(query).toArray();
      res.send(result)
    })

    app.get('/admin/:email',verifyJWT, async (req, res) => {
      const email=req.params.email;
      const user = await userCollection.findOne({email: email});
      const isAdmin= user?.role==='admin';
      res.send({admin:isAdmin})
    })

    app.put('/user/admin/:email',verifyJWT, async(req,res)=>{
      const email=req.params.email;
      const requester=req.decoded.email;
      const requesterAccount= await userCollection.findOne({email: requester});
      if(requesterAccount.role==='admin'){
        const filter={email: email};
        const updateDoc = {
            $set: {role:'admin'},
          };
          const result = await userCollection.updateOne(filter, updateDoc);
          res.send(result)
      }else{
        res.status(403).send({message:'Forbidden Access'})
      }
  })
    app.put('/user/:email',async(req,res)=>{
      const email=req.params.email;
      const user=req.body;
      const filter={email: email};
      const options = { upsert: true };
      const updateDoc = {
          $set: user,
        };
        const result = await userCollection.updateOne(filter, updateDoc, options);
        const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN_SECRET,{ expiresIn: '1h' });
        res.send({result,token})
  })

  app.delete('/user/:id',async(req,res)=>{
    const id=req.params.id;
    const query={_id: ObjectId(id)};
    const result= await userCollection.deleteOne(query);
    res.send(result)
  })
  
    app.post('/breakfast',async(req,res)=>{
      const breakfast=req.body;
      const result= await breakfastCollection.insertOne(breakfast);
      res.send(result)
    })
    
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
    app.put('/breakfast/:id', async (req, res) => {
      const id = req.params.id;
      const updateBreakfast= req.body;
      const filter = {_id: ObjectId(id)};
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updateBreakfast.name,
          price: updateBreakfast.price,
          description: updateBreakfast.description,
          img: updateBreakfast.img
        },
      };
      const result = await breakfastCollection.updateOne(filter, updateDoc, options);
      res.send(result)
    })

    app.delete('/breakfast/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id: ObjectId(id)};
      const result=await breakfastCollection.deleteOne(query);
      res.send(result)
    })

    app.post('/dinner',async(req,res)=>{
      const query=req.body;
      const result= await dinnerCollection.insertOne(query);
      res.send(result)
    })

    app.get('/dinner', async (req, res) => {
      const query = {};
      const result = await dinnerCollection.find(query).toArray();
      res.send(result);
    })

    app.put('/dinner/:id',async(req,res)=>{
      const id=req.params.id;
      const updateDinner=req.body;
      const filter={_id: ObjectId(id)};
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updateDinner.name,
          price: updateDinner.price,
          description: updateDinner.description,
          img: updateDinner.img
        },
      };
      const result= await dinnerCollection.updateOne(filter,updateDoc,options);
      res.send(result)
    })

    app.delete('/dinner/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id: ObjectId(id)};
      const result=await dinnerCollection.deleteOne(query);
      res.send(result)
    })

    app.post('/lunch', async (req, res) => {
      const query = req.body;
      const result = await lunchCollection.insertOne(query)
      res.send(result);
    })

    app.get('/lunch', async (req, res) => {
      const query = {};
      const result = await lunchCollection.find(query).toArray();
      res.send(result);
    })

    app.put('/lunch/:id',async(req,res)=>{
      const id=req.params.id;
      const updateLunch=req.body;
      const filter={_id: ObjectId(id)};
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updateLunch.name,
          price: updateLunch.price,
          description: updateLunch.description,
          img: updateLunch.img
        },
      };
      const result= await lunchCollection.updateOne(filter,updateDoc,options);
      res.send(result)
    })

    app.delete('/lunch/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id: ObjectId(id)};
      const result=await lunchCollection.deleteOne(query);
      res.send(result)
    })

    app.post('/order', async (req, res) => {
      const order = req.body;
      const foodOrders = await orderCollection.insertOne(order);
      res.send(foodOrders)
    })

    app.get('/order',verifyJWT, async (req, res) => {
      const email=req.query.email;
      const decodedEmail=req.decoded.email;
      if(email===decodedEmail){
        const query = {email: email};
        const result = await orderCollection.find(query).toArray();
        return res.send(result)
      }
      else{
        return res.status(403).send({message:'Forbidden access'})
      }
    })

    app.get('/order/:id', async (req, res) => {
      const id = req.params.id;
      let query = { _id: ObjectId(id) };
      const result = await orderCollection.findOne(query);
      res.send(result)
    })

    app.post('/create-payment-intent', async(req, res) =>{
      const service= req.body;
      console.log(service)
      const price=service.grandTotal;
      console.log(price)
      const amount=price*100;
      const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: "usd",
          payment_method_types: ['card'],
        });
        res.send({clientSecret: paymentIntent.client_secret});
    });

    app.patch('/order/:id', async(req, res) =>{
      const id  = req.params.id;
      const payment = req.body;
      const filter = {_id: ObjectId(id)};
      const updatedDoc = {
        $set: {
          paid: true,
          transactionId: payment.transactionId
        }
      }

      const result = await paymentCollection.insertOne(payment);
      const updateOrder = await orderCollection.updateOne(filter, updatedDoc);
      res.send(updateOrder);
    })

    app.delete('/order/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id: ObjectId(id)};
      const result= await orderCollection.deleteOne(query);
      res.send(result)
    })

    app.post('/profile',async(req,res)=>{
      const query=req.body;
      const result= await profileCollection.insertOne(query);
      res.send(result)
    })
    
    app.get('/profile',async(req,res)=>{
      const query={};
      const result= await profileCollection.find(query).toArray();
      res.send(result)
    })

    app.put('/profile/:id',async(req,res)=>{
      const id=req.params.id;
      const updateProfile=req.body;
      const filter={_id: ObjectId(id)};
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updateProfile.name,
          price: updateProfile.price,
          description: updateProfile.description,
          image: updateProfile.image
        },
      };
      const result= await profileCollection.updateOne(filter,updateDoc,options);
      res.send(result)
    })

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

