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
          
          if (!items) {
            res.send(`Not Registered`);
          } else {
            let tinStatus = items.TIN_Status;
            if (tinStatus === "Not Registered"){
              res.send(tinStatus);
            } else {
              res.send(items.Email);
            }            
          } 
        })
        .catch(err => {
          res.send(`Unable to validate TIN Number. ${err}`);
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
            res.send(`I am sorry but we do not have any record with the details you supplied. Please check the details and try again.`);
          } else {
            let description = `This is the result of the VIN Verification. \nStatus: ${items.Status} \nBox 31: ${items.Box31} \n\nFor more enquiry, kindly visit a Nigerian Custom Service office closest to you.`;
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
           res.send(`I am sorry but we do not have the VIN you have supplied on record. Perhaps check the VIN and try again?`);
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
    .findOne({ AgentName: agent })
    .then(items => {
      if (!items) {
        res.send(`No record found for ${agent}.`);
      } else {
        let description = `This is the information we have on the agent. \n Name: ${items.AgentName} \nStatus: ${items.Status}.`;
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
     let reply = 'This is the list of agents that belong to '; 
     let agentList = '';
     let commandName = '';
     
      //get the list of agents that belong to the command
     const collection = client.db("NCS").collection("CustomCommand");
     collection
       .find({ CustomOfficeCode: cID })
       .toArray(function(err, result) {
         if (result.length !== 0) {
           let count = 0;
           result.forEach(function(element) {
             count++;
             agentList += `${count}. ${element.Agent} \n`;
             commandName = element.CustomOfficeName;
           });
           // concatenate variables to form the reply
           reply += `${commandName}. \n`;
           reply += agentList;
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

    let fromPAAR = req.body.paar;
    let cEmail = "edidiong@redpagesconsulting.com";

    var today = new Date();
    var todaysDate =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    
    const msg = {
      to: cEmail,
      from: "capture@redpagesconsulting.com",
      subject: "PAAR Status",
      text: " ",
      html: `<p>Hello,</p><p>You requested to know the status of your PAAR on ${todaysDate}, The status of your PAAR is <b> ${fromPAAR}</b>.<p>Thank you for using our PAAR Enquiry service.</p>`
    };
    sgMail.send(msg);

    res.send(`Successful`);
    
  });

  

  //start our server
app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`);
});
