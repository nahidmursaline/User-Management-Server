const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k5biojd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const userCollection = client.db('userDB').collection('allUser');
    
    app.post('/user', async(req, res) =>{
      const newUser = req.body;
      console.log(newUser);
      const query = {email: newUser.email}
      const existingUser = await userCollection.findOne(query);
      if(existingUser){
        return res.send({message: 'user already exist'});
      }
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    })

    app.get('/user', async(req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray()
      res.send(result);
    })

    app.get('/user/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await userCollection.findOne(query);
      res.send(result);
    })

    app.delete('/user/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })

    app.put('/user/:id', async(req, res) => {
      const id = req.params.id;
      
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true}
      const updatedUser = req.body;
      const user = {
        $set: {
          firstName: updatedUser.firstName,
           lastName: updatedUser.lastName,
            // email: updatedUser.email,
             phone: updatedUser.phone,
              photo: updatedUser.photo,
              
        }
      }
      const result = await userCollection.updateOne(filter, user, options)
      res.send(result);
    })
    

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res) => {
    res.send('user management is running');
})

app.listen(port, ()=> {
    console.log(`User Management is running on port ${port}`)
})