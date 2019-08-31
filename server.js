const express = require("express");
app = express();
const MongoClient = require("mongodb").MongoClient;
const client = new MongoClient(
  "mongodb+srv://eddy:eddy123@atmlocations-puah7.mongodb.net/",
  { useNewUrlParser: true }
);
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);



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
      collection
        .findOne({ TIN: tinNo })
        .then(items => {
          let tinStatus = items.TIN_Status;
          if (!items) {
            res.send(`Not Registered`);
          } else if (tinStatus === "Not Registered") {
            res.send(tinStatus);
          } else {
            res.send(items.Email);
          }
        })
        .catch(err => {
          res.send(`Unable to validate Account Number.`);
        });
    });
  });

  //Before 2017
  app.post("/api/before2017/:cno", (req, res) => {
    client.connect(err => {
      if (err) {
        res.send(err.message);
        return;
      }

      let CNo = req.params.cno;
      CNo = CNo.trim();

      const collection = client.db("NCS").collection("Before2017");
      collection
        .findOne({ CNumber: CNo })
        .then(items => {
          if (!items) {
            res.send(`No record found for the details you supplied.`);
          } else {
            let description = `This is the result of the VIN Verification . \nStatus: ${items.Status} \nBox 31: ${items.Box31} \nFor more enquiry, kindly visit a Nigerian Custom Service office closest to you.`;
            res.send(description);
          }
        })
        .catch(err => {
          res.send(`Unable to query for VIN below 2017.`);
        });
    });
  });

 //2017 and above
 app.post("/api/2017andAbove/:VIN", (req, res) => {
   client.connect(err => {
     if (err) {
       res.send(err.message);
       return;
     }

     let vin = req.params.VIN;

     const collection = client.db("NCS").collection("2017AndBeyond");
     collection
       .findOne({ VIN: vin })
       .then(items => {
         if (!items) {
           res.send(`No record found for the details you supplied.`);
         } else {
           let description = `This is the result of the VIN Verification. \n Status: ${items.Status} \n Model: ${items.Model} \n Year: ${items.Year}.`;
           res.send(description);
         }
       })
       .catch(err => {
         res.send(`Unable to query for VIN 2017 and above.`);
       });
   });
 });

 
 //Query an agent
 app.post("/api/Agent", (req, res) => {
    
  client.connect(err => {
    if (err) {
      res.send(err.message);
      return;
    }

    let agent = req.body.agentName;

  const collection = client.db("NCS").collection("CustomAgents");
  collection
    .findOne({ Name: agent })
    .then(items => {
      if (!items) {
        res.send(`No record found for ${agent}.`);
      } else {
        let description = `This is the information we have on the agent. \n Name: ${items.Name} \nStatus: ${items.Status}.`;
        res.send(description);
      }
    })
    .catch(err => {
      res.send(`Unable to query agent.`);
    });
  });
 });

 //Query custom command
 app.post("/api/Command", (req, res) => {
   client.connect(err => {
     if (err) {
       res.send(err.message);
       return;
     }

     let cID = req.body.commandID;

     const collection = client.db("NCS").collection("CustomCommand");
     collection
       .find({ CustomOfficeCode: cID })
       .toArray(function(err, result) {
         if (result.length !== 0) {
           let reply =
             "This is the list of agents that belong to the command. \n";
           let count = 0;
           result.forEach(function(element) {
             count++;
             reply += `${count}. ${element.Agent} \n`;
           });
           res.send(reply);

         } else {
           res.send(`No agents listed for the command you selected.`);
         }
         if (err) throw err;
       });
   });
 });

  //Send Mail
  app.post("/api/sendpaar", (req, res) => {

    let PAARStatus = req.body.paar;
    let cEmail = req.body.cemail;
    
    const msg = {
      to: cEmail,
      from: "capture@redpagesconsulting.com",
      subject: "PAAR Status",
      text: " ",
      html: `<p><strong>${PAARStatus}</strong></p><br /><p>Thank you for using our service. We are here to serve you better.</p> `
    };
    sgMail.send(msg);

    res.send(`Successful`);
    
  });

  //start our server
app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`);
});