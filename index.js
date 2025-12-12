const express = require("express");
const app = express();
const nodemailer = require("nodemailer");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ---- Database Setup ----
const uri = `mongodb+srv://${process.env.COFFEE_DB_USER}:${process.env.COFFEE_DB_PASS}@cluster0.todtdql.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// ----- Main Function -----
async function run() {
  try {
    await client.connect();
    const coffeesCollection = client.db("coffeeDB").collection("coffees");
    const userData = client.db("coffeeDB").collection("users");

    // ✔ Get all coffees
    app.get("/coffees", async (req, res) => {
      const result = await coffeesCollection.find().toArray();
      res.send(result);
    });

    //  Get specific coffee
    app.get("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeesCollection.findOne(query);
      res.send(result);
    });

    // Create coffee
    app.post("/coffees", async (req, res) => {
      const newCoffee = req.body;
      const result = await coffeesCollection.insertOne(newCoffee);
      res.send(result);
    });

    //  Update coffee
    app.put("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedCoffee = req.body;

      const updatedDoc = { $set: updatedCoffee };
      const result = await coffeesCollection.updateOne(filter, updatedDoc);

      res.send(result);
    });

    //  Delete coffee
    app.delete("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeesCollection.deleteOne(query);
      res.send(result);
    });

    // user related APIs

    app.get("/users", async (req, res) => {
      const result = await userData.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await userData.insertOne(data);
      res.send(result);
    });

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userData.deleteOne(query);
      res.send(result);
    });
    // Order Email Route
    app.post("/order", async (req, res) => {
      const { coffeeName, customer, quantity } = req.body;

      try {
        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER,
          subject: "New Coffee Order",
          text: `
            Customer: ${customer}
            Ordered Coffee: ${coffeeName}
            Quantity: ${quantity}

            Order placed successfully!
          `,
        });

        res.send({ message: "Email Sent Successfully!" });
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    console.log("MongoDB Connected!");
  } catch (error) {
    console.log(error);
  }
}

run().catch(console.dir);

// Default Route
app.get("/", (req, res) => {
  res.send("Coffee server is running...");
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
