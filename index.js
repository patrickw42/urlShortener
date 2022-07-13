require("dotenv").config();

const express = require("express");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

//makes /public static so html file can access css
app.use("/public", express.static(`${process.cwd()}/public`));

//makes root of app open html file
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

//used to parse url params
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

//need url object to parse/convert url to hostname so it can be checked
// with dnl.lookup()
const URL = require("url").URL;
const dns = require("dns");

//connect to mongoBD using MONGO_URI key stored in .env file in root of app
//WILL NEED TO UPDATE TO MAKE FUNCTIONAL!!
const mongoose = require("mongoose");
//connect to mondoDB with output msg
mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) return console.log("not connected to database");
    console.log("succesfully connected to database");
  }
);

//extract URL Model from schema in models/url.js
const URLModel = require("./models/url");

//when form submitted posts object with original_url and short_url to
// /api/shorturl   Also saving them to record in connected mongoDB
app.post("/api/shorturl", async function (req, res) {
  //convert url to hostname form for dns.lookup()
  const long_url = req.body.url;
  //error if non url passed to URL() - need try/catch
  let urlObj;
  try {
    urlObj = new URL(long_url);
  } catch (_) {
    return res.json({ error: "invalid url" });
  }
  //convert long_url to host form  w/o 'http://www.' so dns.lookup() works
  const host = urlObj.hostname;

  dns.lookup(host, function (err, address, family) {
    if (err) return res.json({ error: "invalid url" });
  });

  //first check if url already saved to database
  const record = await URLModel.findOne({ full_url: long_url });
  //if so return json obj including it's short_url
  if (record)
    return res.json({
      original_url: record.full_url,
      short_url: record.short_url,
    });

  //will be saved as short_url later in mongo
  let inputShort = 1;
  //then find the largest short_url from records to update inputShort as +1
  URLModel.findOne({})
    .sort({ short_url: "desc" })
    .exec((error, result) => {
      //only updates inputShort if database not empty
      if (!error && result != undefined) {
        inputShort = result.short_url + 1;
      }
      if (!error) {
        //create and save new record with inputShort if no error occurs
        let record = new URLModel({
          full_url: long_url,
          short_url: inputShort,
        });
        //if succesfully saved return json object with original and short urls
        record.save((err, doc) => {
          if (err) res.json({ error: "invalid url" });
          else {
            res.json({ original_url: long_url, short_url: inputShort });
          }
        });
      }
      //if error in .findOne().exec() return error msg
      else return res.send("error");
    });
});

//gets full_url based off short_url (:short_url param) and redirects browser
//to the website hosted full_url
app.get("/api/shorturl/:short_url", (req, res) => {
  //extract short_url from url params
  const { short_url } = req.params;
  //use findByOne() to find record with short_url
  URLModel.findOne({ short_url }, (err, data) => {
    if (data != undefined) res.status(301).redirect(data.full_url);
    else return res.json({ error: "invalid url" });
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
