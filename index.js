const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri =
	"mongodb+srv://Mohib:Mohib@cluster0.nr9ns.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const run = async () => {
	try {
		await client.connect();
		const database = client.db("Home-Service");
		const serviceCollection = database.collection("Services");
		const userCollections = database.collection("Users");
		const reviewCollections = database.collection("Reviews");
		const orderCollections = database.collection("Orders");

		//Get Service Collections
		app.get("/services", async (req, res) => {
			const cursor = serviceCollection.find({});
			const result = await cursor.toArray();
			res.send(result);
		});

		//Get single service
		app.get("/services/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await serviceCollection.findOne(query);
			res.send(result);
		});

		//Get User Collections
		app.get("/users", async (req, res) => {
			const cursor = userCollections.find({});
			const result = await cursor.toArray();
			res.send(result);
		});

		//Post user in collection
		app.post("/users", async (req, res) => {
			const user = req.body;
			const file = req.files;
			if (!file) {
				const query = await userCollections.findOne({ email: user.email });
				if (!query) {
					const result = await userCollections.insertOne(user);
					res.send(result);
				}
			} else {
				const displayName = user.displayName;
				const email = user.email;
				const role = user.role;
				const photoData = file.photo.data;
				const encodedPhoto = photoData.toString("base64");
				const photoBuffer = Buffer.from(encodedPhoto, "base64");
				const signUpUser = {
					displayName,
					email,
					role,
					photo: photoBuffer,
				};
				const result = await userCollections.insertOne(signUpUser);
				res.send(result);
			}
		});

		//Get Review Collections
		app.get("/reviews", async (req, res) => {
			const cursor = reviewCollections.find({});
			const result = await cursor.toArray();
			res.send(result);
		});
		//Get Order Collections
		app.get("/orders", async (req, res) => {
			const cursor = orderCollections.find({});
			const result = await cursor.toArray();
			res.send(result);
		});

		// Post Order to collection
		app.post("/orders", async (req, res) => {
			const order = req.body;
			const result = await orderCollections.insertOne(order);
			res.send(result);
		});
	} finally {
		//
	}
};
run().catch(console.dir);

app.get("/", (req, res) => {
	res.send("Home service is running");
});
app.listen(port, () => {
	console.log("Home service is running", port);
});
