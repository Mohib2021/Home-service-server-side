const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

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

		//Get Service Collections
		app.get("/services", async (req, res) => {
			const cursor = serviceCollection.find({});
			const result = await cursor.toArray();
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
