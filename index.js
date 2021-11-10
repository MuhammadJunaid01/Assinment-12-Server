const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
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
