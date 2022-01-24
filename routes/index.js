var express = require('express');
var router = express.Router();
const assert = require('assert')

const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const url = 'mongodb://localhost:27017' // connection URL
const client = new MongoClient(url) // mongodb client
const dbName = 'PTFCS-database' // database name
const collectionName = 'stations' // collection name


/* GET search page. */
router.get('/', function(req, res, next) {
  
  // connect to the mongodb database and retrieve all docs
  client.connect(function(err) 
  {
    assert.equal(null, err)
  
    console.log('Connected successfully to server')
  
    const db = client.db(dbName)
    const collection = db.collection(collectionName)

    // Find some documents
    collection.find({}).toArray(function(err, data) 
    {
      assert.equal(err, null);
      console.log('Found the following records...');
      //console.log(docs[0].features)
      res.render('index', {stationData: data});

    })
  
  })
});

 /**
 * POST to insert sights into the database.
 * Gets all the necessary information (from the form) about a sight from a ajax call and stores it in the database.
 * Validation on the data happens on the client sight.
 */
router.post('/addStation', function(req, res) {

  console.log(req.body)
  let stationDataString = req.body.o;
  let stationData = JSON.parse(stationDataString)
  console.log(stationData)
  
  client.connect(function(err){

    assert.equal(null, err);

    console.log('Connected successfully to server');

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    collection.insertOne(stationData, function(err, result){
      assert.equal(err, null);
      console.log(result)
      console.log(`Inserted the station successfully into the collection`)
      
    })
    res.send("Station added to the database")
  })
})


/**
 * POST to delete sight.
 * Recieves an object with the ids of all checked sights that should be deleted from the database.
 * It then iterates over the array and sends a delete query to DB with the specific sight to delete. 
 */ 
router.post('/delete', function(req, res) {
  let stationsIDs = JSON.parse(req.body.o).stationsIDs
  console.log(stationsIDs)

  client.connect(function(err) {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    for (var i=0; i<stationsIDs.length; i++) {
      var myquery = {"_id": mongodb.ObjectId(stationsIDs[i])}
      console.log(myquery)
      collection.deleteOne(myquery, function(err, data)
      {
          assert.equal(err, null);
          //if (err) throw err;
          console.log('One document deleted');
      })
      res.send("Successfully deleted the selected stations");
    }  
  })
});


module.exports = router;
