// express
var express = require('express');
var router = express.Router();

// assert
const assert = require('assert')

// axios
const axios = require('axios');

// multer
const multer = require ('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage});

// mongoDB
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
// const url = 'mongodb://mongo:27017' // docker connection URL
const url = 'mongodb://localhost:27017' // connection URL
const client = new MongoClient(url) // mongodb client
const dbName = 'ProjectDB' // database name
const collectionNameSights = 'sights' // collection name
const collectionNameTours = 'tours' // collection name

// define routes

/**
 * GET sights for listing.
 * Connects to the mongoDB and finds all the sights stored in the used collection
 * and sends the information about the sights to the pug-view (=_layout.pug) where they are processed to get displayed.
 */
router.get('/', function(req, res) {
  client.connect(function(err)
  {
    assert.equal(null, err);

    //console.log('Connected successfully to server');

    const db = client.db(dbName);
    const collection = db.collection(collectionNameSights);

    // find some documents
    collection.find({}).toArray(function(err, data)
    {
      assert.equal(err, null);
      //console.log('Found the following records...');
      //console.log(data);
  
      res.render('2_edit', {sightData: data});

    })
  })
});

/**
 * POST to insert sights into the database.
 * Gets all the necessary information (from the form) about a sight from a ajax call and stores it in the database.
 * Validation on the data happens on the client sight.
 */
router.post('/addSight', function(req, res, next) {
  var sightDataString = req.body.o;
  var sightData = JSON.parse(sightDataString);
  console.log(sightData);

  client.connect(function(err){

    assert.equal(null, err);

    console.log('Connected successfully to server');

    const db = client.db(dbName);
    const collection = db.collection(collectionNameSights);

    collection.insertOne(sightData, function(err, result){
      assert.equal(err, null);
      
      console.log(`Inserted the sight successfully ${result.insertedCount} document into the collection`)
      
    })
    res.redirect("/edit");
  })
})


/**
 * POST to insert sights into the database.
 * Gets a geojson sight file (from upload-button), which gets validated and later on uploaded to the database.
 * It prooves if an wikipedia url was uploaded. If yes, it uses the wikipedia url to get a short description of the sight.
 */
 router.post('/addSightInputFile', upload.single('sightInputFile'), function(req, res) {

  // set our internal DB variable
  const db = client.db(dbName);
  const collection = db.collection(collectionNameSights);

  // get our form values. These rely on the "name" attributes
  var multerObject = req.file;


  if (req.file != undefined) {
    // file extension validation
    if (checkFileExtension(multerObject.originalname)) {

      try {
        console.log(multerObject);
        var inputFileJSON = JSON.parse(multerObject.buffer);
        console.log(inputFileJSON);
      }
      catch {
        res.send("Invalid GeoJSON file. Please validate your file.")
      }
      // type validation
      if (inputFileJSON.type == "FeatureCollection") {

        // featuretype validation 
        if (inputFileJSON.features[0].geometry.type == "Point" || inputFileJSON.features[0].geometry.type == "Polygon") {
          (async () => {
            try {

              // URL wikipedia validation
              if (inputFileJSON.features[0].properties.URL.includes('wikipedia')) {
                var wikiSightName = getSightNameFromURL(inputFileJSON.features[0].properties.URL);
                const response = await axios.get('http://de.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=true&exsentences=3&explaintext=true&titles=' + wikiSightName + '&origin=*', { json: true });
                console.log(response.data);
                var key = Object.keys(response.data.query.pages)[0];
                var article = response.data.query.pages[key].extract;
                console.log(article);
                inputFileJSON.features[0].properties.Beschreibung = article;
                console.log(inputFileJSON.features[0].properties);
              }
              else if (inputFileJSON.features[0].properties.Beschreibung == "") {
                  inputFileJSON.features[0].properties.Beschreibung = "Keine Informationen vorhanden"
              }
              


              // submit to the DB
              collection.insertOne(inputFileJSON, function (err, doc) {

                if (err) {
                  // if it fails, return error
                  res.send("There was a problem adding the information to the database.");
                }
                else {
                  res.redirect("/edit");
                }
              })


            } catch (error) {
              console.log(error.response.body);
            }
          })();

          
        }
        else {
          res.send("Uploaded GeoJSON is not of type 'Point' or 'Polygon'. Please Check your GeoJSON. You can get further information in the 'Valid Files' section")
        }
        
      }
      else {
        res.send("Uploaded file is not of type 'FeatureCollection' ");
      }
    }
    else {
      res.send("Uploaded file is not of type .geojson");
    }
  }
  else {
    res.redirect("/edit");
  }
});

/**
 * POST to insert sights into the database.
 * Gets a geojson sight file (from textfield), which gets validated and later on uploaded to the database.
 * It prooves if an wikipedia url was uploaded. If yes, it uses the wikipedia url to get a short description of the sight.
 */
 router.post('/addSightInputText', upload.none('sightInputText'), function(req, res) {

  // set our internal DB variable
  const db = client.db(dbName);
  const collection = db.collection(collectionNameSights);

  // get our form values. These rely on the "name" attributes
  var multerObject = req.body;
  console.log(multerObject.sightInputText);
  if (multerObject.sightInputText != undefined) {
      try {
        //console.log(multerObject);
        var inputTextJSON = JSON.parse(multerObject.sightInputText);
        console.log(inputTextJSON);
      }
      catch {
        res.send("Invalid GeoJSON file. Please validate your file.")
      }

      // type validation
      if (inputTextJSON.type == "FeatureCollection") {

        // featuretype validation
        if (inputTextJSON.features[0].geometry.type == "Point" || inputTextJSON.features[0].geometry.type == "Polygon") {
          (async () => {
            try {
              
              // URL wikipedia validation
              if (inputTextJSON.features[0].properties.URL.includes('wikipedia')) {
                var wikiSightName = getSightNameFromURL(inputTextJSON.features[0].properties.URL);
                const response = await axios.get('http://de.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=true&exsentences=3&explaintext=true&titles=' + wikiSightName + '&origin=*', { json: true });
                console.log(response.data);
                var key = Object.keys(response.data.query.pages)[0];
                var article = response.data.query.pages[key].extract;
                console.log(article);
                inputTextJSON.features[0].properties.Beschreibung = article;
                console.log(inputTextJSON.features[0].properties);
              }
              else if (inputTextJSON.features[0].properties.Beschreibung == "") {
                  inputTextJSON.features[0].properties.Beschreibung = "Keine Informationen vorhanden"
              }
              


              // submit to the DB
              collection.insertOne(inputTextJSON, function (err, doc) {

                if (err) {
                  // if it fails, return error
                  res.send("There was a problem adding the information to the database.");
                }
                else {
                  res.redirect("/edit");
                }
              })


            } catch (error) {
              console.log(error.response.body);
            }
          })();

        }
        else {
          res.send("Uploaded GeoJSON is not of type 'Point' or 'Polygon'. Please Check your GeoJSON. You can get further information in the 'Valid Files' section")
        }
        
      }
      else {
        res.send("Uploaded file is not of type 'FeatureCollection' ");
      }
  }
  else {
    res.redirect("/edit");
  }
});


/**
 * POST to delete sight.
 * Recieves an object with the ids of all checked sights that should be deleted from the database.
 * It then iterates over the array and sends a delete query to DB with the specific sight to delete. 
 */ 
 router.post('/delete', function(req, res) {
  var sightsObj = JSON.parse(req.body.o);
  const db = client.db(dbName);
  const collection = db.collection(collectionNameSights);
  if (sightsObj.sightsChecked.length > 0) {
    for (var i=0; i<sightsObj.sightsChecked.length; i++) {
      var myquery = {"_id": mongodb.ObjectId(sightsObj.sightsChecked[i])}
      collection.deleteOne(myquery, function(err, data)
      {
          assert.equal(err, null);
          //if (err) throw err;
          console.log('One document deleted');
      })
      res.redirect("/edit");
    }  
  }
});


/**
 * This function retrieves the name of a sight when a wikipedia url is given.
 * @param {String} url 
 * @returns the sight name as a string
 */
function getSightNameFromURL(url) {
  var urlArray = url.split('/');
  var sightName = urlArray[4];
  console.log(sightName);
  return sightName;
}

/**
 * The function checks if the type of the uploaded file is .geojson and returns true if it is
 * and false if not.
 * 
 * @param {String} fileName - filename with extension
 * @returns Boolean - true if type geojson and false if not
 */
 function checkFileExtension(fileName) {
  let extension = fileName.split('.').pop();
  if (extension == "geojson"){
      return true;
  }
  else{
      return false;
  }
};


/**
 * POST to insert sights into the database.
 * Gets all the necessary information (from the form) about a sight from a ajax call and stores it in the database.
 * Validation on the data happens on the client sight.
 */
 router.post('/addTour',function(req, res, next) {
  var tourData = JSON.parse(req.body.o);
  //console.log(tourData.items);

  client.connect(async function(err){

    assert.equal(null, err);

    //console.log('Connected successfully to server');

    const db = client.db(dbName);
    const collectionSights = db.collection(collectionNameSights);
    const collectionTours = db.collection(collectionNameTours);

    var tourArray = [];
    var myfilter = {"_id": mongodb.ObjectId(tourData.items[0])};

    // find some documents
    for (let i = 0; i < tourData.items.length; i++) {
      var myfilter = {"_id": mongodb.ObjectId(tourData.items[i])};
      console.log(myfilter);
      let tourStop = await collectionSights.findOne(myfilter);
      tourArray.push(tourStop);
      console.log(tourStop)
    }
    console.log(tourArray);

    let tour = {"name": tourData.name, "items": tourArray};

    collectionTours.insertOne(tour, function(err, result){
      assert.equal(err, null);      
    })
    
  })
  res.redirect("/edit");
})

module.exports = router;
