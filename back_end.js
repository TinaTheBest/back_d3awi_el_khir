const express = require("express");
const cors = require("cors");

/********************************************** Initialiser la base de donnée ********************************************/
const { initializeApp } = require("firebase-admin");
var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://projet2cpe60b0-default-rtdb.firebaseio.com"
});

/********************************************* construire les API *************************************************************/
const app = express();

app.use(cors());
app.use(express.json());

app.use('/API/event', require('./routes/API/event.js'));
app.use('/API/Donation', require('./routes/API/Donation.js'));
app.use('/API/Contact', require('./routes/API/Contact.js'));
app.use('/API/Auth', require('./routes/API/Authentification.js'));



app.get("/", (req, res) => {
  res.send("' ok !! '");
});


app.listen(8000, () => {
  console.log('Server is running on port 8000.');
});






