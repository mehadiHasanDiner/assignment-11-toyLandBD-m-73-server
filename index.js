const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// toyShopManger;
// kusVyUX19zaC3oJs;
// console.log(process.env.DB_USER);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ehabgxd.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with va MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toysCategoryCollection = client
      .db("toyLandDB")
      .collection("categories");

    const toysAllCollection = client.db("toyLandDB").collection("allToys");

    const feedbackCollection = client.db("toyLandDB").collection("feedbacks");

    app.get("/categories", async (req, res) => {
      const result = await toysCategoryCollection.find().toArray();
      res.send(result);
    });

    app.get("/categories/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCategoryCollection.findOne(query);
      res.send(result);
    });

    app.post("/toys", async (req, res) => {
      const body = req.body;
      // for sorting according
      body.createAt = new Date();
      // if(!body){
      //   return res.status(404).send({ message: "Not Found"});
      // }
      const result = await toysAllCollection.insertOne(body);
      res.send(result);
      // console.log(result);
    });

    app.get("/toys", async (req, res) => {
      const result = await toysAllCollection
        .find()
        .sort({ createAt: -1 })
        .toArray();
      res.send(result);
      // console.log(result);
    });

    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysAllCollection.findOne(query);
      res.send(result);
    });

    app.get("/myToys/:email", async (req, res) => {
      const myEmail = req.params.email;
      // console.log(myEmail);
      const myToys = await toysAllCollection
        .find({ postedBy: myEmail })
        .toArray();
      res.send(myToys);
    });

    app.get("/updateToy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysAllCollection.findOne(query);
      // console.log(result);
      res.send(result);
    });

    app.delete("/updateToy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysAllCollection.deleteOne(query);
      // console.log(result);
      res.send(result);
    });

    app.put("/updateToy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateToy = req.body;
      const toy = {
        $set: {
          toyName: updateToy.toyName,
          description: updateToy.description,
          price: updateToy.price,
          quantity: updateToy.quantity,
          url: updateToy.url,
        },
      };
      const result = await toysAllCollection.updateOne(filter, toy, options);
      res.send(result);
    });

    app.post("/feedbacks", async (req, res) => {
      const body = req.body;
      body.createAt = new Date();
      const result = await feedbackCollection.insertOne(body);
      res.send(result);
    });

    app.get("/feedbacks", async (req, res) => {
      const result = await feedbackCollection
        .find()
        .sort({ createAt: -1 })
        .toArray();
      res.send(result);
      // console.log(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to Toy Land BD");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
