const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const ObjectId = require("mongodb").ObjectId;
const stripe = require("stripe")(
	"sk_test_51K8Mj3KGdK20KSsSjIYYpMAhI1PZ7hev2kSq8an6kZaQQwQ4cbDRKcgqeQigSvA2SVujmUJK1SJ9oBM8EFEzYcni00FVk5EWCl"
);

require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(fileUpload());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

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

		// Post Service
		app.post("/services", async (req, res) => {
			const service = req.body;
			const file = req.files;
			const photoData = file.photo.data;
			const encodedPhoto = photoData.toString("base64");
			const photoBuffer = Buffer.from(encodedPhoto, "base64");
			const newService = {
				name: service.name,
				price: service.price,
				description: service.description,
				photo: photoBuffer,
			};
			const result = await serviceCollection.insertOne(newService);
			res.send(result);
		});

		//Get single service
		app.get("/services/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await serviceCollection.findOne(query);
			res.send(result);
		});

		// Delete single service
		app.delete("/services/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await serviceCollection.deleteOne(query);
			res.send(result);
			console.log(result);
		});

		//Get User Collections
		app.get("/users", async (req, res) => {
			const cursor = userCollections.find({});
			const result = await cursor.toArray();
			res.send(result);
		});

		// Update user role
		app.put("/users/:id", async (req, res) => {
			const id = req.params.id;
			const body = req.body;
			const query = { _id: ObjectId(id) };
			const option = { upsert: true };
			const updateDoc = {
				$set: {
					role: body.role,
				},
			};
			console.log(body);
			const result = await userCollections.updateOne(query, updateDoc, option);
			res.send(result);
		});

		// Get single User
		app.get("/users/:email", async (req, res) => {
			const email = req.params.email;
			const result = await userCollections.findOne({ email: email });
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

		// Post review in collection
		app.post("/reviews", async (req, res) => {
			const review = req.body;
			const result = await reviewCollections.insertOne(review);
			res.send(result);
		});

		//Get Order Collections
		app.get("/orders", async (req, res) => {
			const cursor = orderCollections.find({});
			const result = await cursor.toArray();
			res.send(result);
		});

		//Get single order
		app.get("/orders/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await orderCollections.findOne(query);
			res.send(result);
		});

		// Post Order to collection
		app.post("/orders", async (req, res) => {
			const order = req.body;
			const result = await orderCollections.insertOne(order);
			res.send(result);
		});

		// Update order status to Shipping
		app.put("/orders/:id", async (req, res) => {
			const id = req.params.id;
			const body = req.body;
			const query = { _id: ObjectId(id) };
			const option = { upsert: true };
			const updateDoc = {
				$set: {
					status: body.status,
				},
			};
			const result = await orderCollections.updateOne(query, updateDoc, option);
			res.send(result);
		});

		// Delete single Order
		app.delete("/orders/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await orderCollections.deleteOne(query);
			res.send(result);
		});

		// Payment intent
		app.post("/create-payment-intent", async (req, res) => {
			const paymentInfo = req.body;
			const amount = paymentInfo.price * 100;
			const paymentIntent = stripe.paymentIntents.create({
				currency: "usd",
				amount: amount,
				payment_methods_types: ["card"],
			});
			res.send({
				clientSecret: paymentIntent.client_secret,
			});
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
