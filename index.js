const express = require('express')
const app = express()
const port = process.env.PORT||5000
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config()
app.use(express.json())
app.use(cors())




const uri = `mongodb+srv://${process.env.RED_ONION_USERNAME}:${process.env.RED_ONION_PASSWORD}@cluster0.69rzivz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
  try {
    await client.connect();
    const breakfastCollection = client.db("food").collection("breakfast")
    const dinnerCollection = client.db("food").collection("dinner")
    const lunchCollection = client.db("food").collection("lunch")

  app.get('/breakfast', async (req,res)=>{
    const query = {};
    const result = await breakfastCollection.find(query).toArray();
    console.log(result)
    res.send(result)
  })

  app.get('/breakfast/:id',async(req,res)=>{
    const id=req.params.id;
    const query={_id: ObjectId(id)};
    const result=await breakfastCollection.findOne(query);
    res.send(result)
  })

  app.get('/dinner',async (req,res)=>{
    const query={};
    const result= await dinnerCollection.find(query).toArray();
    res.send(result);
  })

  app.get('/lunch',async(req,res)=>{
    const query={};
    const result= await lunchCollection.find(query).toArray();
    res.send(result);
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

