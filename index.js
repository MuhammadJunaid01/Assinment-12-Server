const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const { parse } = require("dotenv");
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oisx1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log("mongo pass and name", uri);
async function run() {
  try {
    await client.connect();
    const database = client.db("E_Bikers");
    const products = database.collection("products");
    const confirmOrders = database.collection("confirmOrders");
    const reviews = database.collection("reviews");
    const ourCollection = database.collection("ourCollection");
    const parts = database.collection("parts");
    const usersCollection = database.collection("users");
    // get all products api
    app.get("/allproducts", async (req, res) => {
      const cursor = products.find({});
      const result = await cursor.toArray();
      res.json(result);
    });
    // get limit product api
    app.get("/products", async (req, res) => {
      const cursor = products.find({});
      const result = await cursor.limit(6).toArray();
      res.json(result);
    });
    // get singele product api
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const result = await products.findOne({ _id: ObjectId(id) });

      res.json(result);
    });
    // place order api
    app.post("/placeOrder", async (req, res) => {
      console.log("email paiche", req.body);
      const result = await confirmOrders.insertOne(req.body);
      res.json(result);
    });
    // my order api
    app.get("/myOrder/:email", async (req, res) => {
      const email = req.params.email;
      console.log("email paiche", email);
      const query = { email: email };

      const cursor = confirmOrders.find(query);
      const result = await cursor.toArray();
      console.log("filter result", result);
      res.json(result);
    });
    // reviews post api
    app.post("/reviews", async (req, res) => {
      console.log("reviews", req.body);
      const result = await reviews.insertOne(req.body);
      res.json(result);
    });
    // reviews get api
    app.get("/reviews", async (req, res) => {
      const cursor = reviews.find({});
      const result = await cursor.toArray();
      console.log("filter result", result);
      res.json(result);
    });
    // collection api get
    app.get("/ourCollection", async (req, res) => {
      const cursor = ourCollection.find({});
      console.log("page", req.query);
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const count = await cursor.count();

      let result;
      if (page) {
        result = await cursor
          .skip(page * size)
          .limit(size)
          .toArray();
      } else {
        result = await cursor.toArray();
      }
      // console.log("filter result", result);
      res.json({
        count,
        result,
      });
    });
    // load singel data on our collection
    app.get("/ourCollection/:id", async (req, res) => {
      const id = req.params.id;
      console.log("hiited id ", id);
      const result = await ourCollection.findOne({ _id: ObjectId(id) });
      res.json(result);
      // console.log("result ", result);
    });
    // parts api get
    app.get("/parts", async (req, res) => {
      const cursor = parts.find({});
      const result = await cursor.toArray();
      console.log("filter result", result);
      res.json(result);
    });
    app.get("/parts/:id", async (req, res) => {
      const id = req.params.id;
      // console.log("hiited id ", id);
      const result = await parts.findOne({ _id: ObjectId(id) });
      res.json(result);
    });
    // users post api
    app.post("/users", async (req, res) => {
      console.log("reviews", req.body);
      const users = await usersCollection.insertOne(req.body);
      res.json(users);
    });
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log(result);
      res.json(result);
    });
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
    app.put("/admin", async (req, res) => {
      console.log(req.body);
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
app.get("/testing", (req, res) => {
  res.send("hello testing api");
});
app.get("/", (req, res) => {
  res.send("E bikers server is runnig ");
});
run().catch(console.dir);
app.listen(port, () => {
  console.log("server is runnig the port", port);
});
