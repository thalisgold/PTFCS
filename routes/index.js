var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient
const assert = require('assert')

const url = 'mongodb://localhost:27017' // connection URL
const client = new MongoClient(url) // mongodb client
const dbName = 'PTFCS-database' // database name
const collectionName = 'test' // collection name


/* GET search page. */
router.get('/', function(req, res, next) 
{
  
  // connect to the mongodb database and retrieve all docs
  client.connect(function(err) 
  {
    assert.equal(null, err)
  
    console.log('Connected successfully to server')
  
    const db = client.db(dbName)
    const collection = db.collection(collectionName)

    // Find some documents
    collection.find({}).toArray(function(err, docs) 
    {
      assert.equal(err, null);
      console.log('Found the following records...');
      console.log(docs[0].features)
      res.render('index', { title: 'Search Page', data: docs[0].features });

    })
  
  })

 /**
 * POST to insert sights into the database.
 * Gets all the necessary information (from the form) about a sight from a ajax call and stores it in the database.
 * Validation on the data happens on the client sight.
 */
router.post('/addStation', function(req, res, next) {
  var stationDataString = req.body.o;
  var stationData = JSON.parse(stationDataString);
  console.log(stationData);

  // client.connect(function(err){

  //   assert.equal(null, err);

  //   console.log('Connected successfully to server');

  //   const db = client.db(dbName);
  //   const collection = db.collection(collectionName);

  //   collection.insertOne(stationData, function(err, result){
  //     assert.equal(err, null);
      
  //     console.log(`Inserted the sight successfully ${result.insertedCount} document into the collection`)
      
  //   })
  //   res.send("It worked");
  // })
})

});


module.exports = router;
