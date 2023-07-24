const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 4560;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@wahiddatabase1.1tmbx62.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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
    // await client.connect();
    const usersCollection = client.db("campusDb").collection("users");
    const reviewCollection = client.db("campusDb").collection("reviews");
    const collegeCollection = client.db("campusDb").collection("colleges");
    const collegeCartCollection = client
      .db("campusDb")
      .collection("collegeCart");

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists" });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/colleges", async(req, res) =>{
      const result = await collegeCollection.find().toArray()
      res.send(result)
    })

    app.get("/colleges", async (req, res) => {
      const search = req.query.search;
      const query = { college_name: { $regex: search, $options: "i" } };
      const result = await collegeCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/colleges/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await collegeCollection.findOne(query);
      res.send(result);
    });

    app.get("/collegeCart", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send({});
      }
      const query = { email: email };
      const result = await collegeCartCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/collegeCart", async (req, res) => {
      const item = req.body;
      const result = await collegeCartCollection.insertOne(item);
      res.send(result);
    });

    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });

    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
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
  res.send("CampusHive is Booking Server");
});

app.listen(port, () => {
  console.log(`CampusHive server is Booking on ${port}`);
});
