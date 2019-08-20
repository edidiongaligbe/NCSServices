const express = require("express");
app = express();
const MongoClient = require("mongodb").MongoClient;
const client = new MongoClient(
  "mongodb+srv://eddy:eddy123@atmlocations-puah7.mongodb.net/",
  { useNewUrlParser: true }
);

port = process.env.PORT || 3000;
app.use(express.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });

  app.get("/", (req, res) => {
    client.connect(err => {
      if (err) {
        res.send(err.message);
        return;
      }
  
      const collection = client.db("NCS").collection("Importers");
      collection
        .find()
        .toArray()
        .then(items => res.send("You have to be specific!!!!!!!!!!!"))
        .catch(err => {
          res.send(err.message);
        });
      //client.close();
    });
  });

  //Validate TIN
app.post("/api/validateTIN/:TIN", (req, res) => {
    
    client.connect(err => {
      if (err) {
        res.send(err.message);
        return;
      }
  
      let tinNo = req.params.TIN;
  
    const collection = client.db("NCS").collection("Importers");
    collection.findOne({ TIN: tinNo })
    .then(items => {
      if (!items) {
        res.send( `Not Registered` )
      } else {
        res.send(items.Email)
      }
    })
    .catch(err => {
      res.send(
        `Unable to validate Account Number.`
      );
    });
    });

  });

  //start our server
app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}`);
  });