const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.COFFEE_DB_USER}:${process.env.COFFEE_DB_PASS}@cluster0.todtdql.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const coffeesCollection = client.db("coffeeDB").collection("coffees");
    app.get("/coffees", async (req, res) => {
      // const cursor = coffeesCollection.find();
      // const result = await cursor.toArray();

      const result = await coffeesCollection.find().toArray();
      res.send(result);
    });

    app.post("/coffees", async (req, res) => {
      const newCoffee = req.body;
      console.log(newCoffee);

      const result = await coffeesCollection.insertOne(newCoffee);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Coffe server is getting hotter");
});

app.listen(port, () => {
  console.log(`Coffee server is running on port ${port}`);
});
