const express = require("express");
const cors = require("cors");
require("dotenv").config();
const nodemailer = require("nodemailer");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

app.use(cors());
app.use(express.json());

// ---------- MongoDB ----------
const uri = `mongodb+srv://${process.env.COFFEE_DB_USER}:${process.env.COFFEE_DB_PASS}@cluster0.todtdql.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let coffeesCollection;
let userData;

async function connectDB() {
  if (!coffeesCollection) {
    await client.connect();
    const db = client.db("coffeeDB");
    coffeesCollection = db.collection("coffees");
    userData = db.collection("users");
    console.log("MongoDB connected");
  }
}

// ---------- Routes ----------

app.get("/", (req, res) => {
  res.send("Coffee server is running...");
});

app.get("/coffees", async (req, res) => {
  await connectDB();
  const result = await coffeesCollection.find().toArray();
  res.send(result);
});

app.get("/coffees/:id", async (req, res) => {
  await connectDB();
  const result = await coffeesCollection.findOne({
    _id: new ObjectId(req.params.id),
  });
  res.send(result);
});

app.post("/coffees", async (req, res) => {
  await connectDB();
  const result = await coffeesCollection.insertOne(req.body);
  res.send(result);
});

app.put("/coffees/:id", async (req, res) => {
  await connectDB();
  const result = await coffeesCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: req.body }
  );
  res.send(result);
});

app.delete("/coffees/:id", async (req, res) => {
  await connectDB();
  const result = await coffeesCollection.deleteOne({
    _id: new ObjectId(req.params.id),
  });
  res.send(result);
});

// ---------- Users ----------
app.get("/users", async (req, res) => {
  await connectDB();
  res.send(await userData.find().toArray());
});

// ❌ app.listen নাই
// ✅ Vercel এর জন্য এটা দরকার
module.exports = app;
