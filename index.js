const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
	res.send("Home service is running");
});
app.listen(port, () => {
	console.log("Home service is running", port);
});
