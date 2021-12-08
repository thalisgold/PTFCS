// express
var express = require('express');
var router = express.Router()

// assert
const assert = require('assert')

// mongoDB
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
// const url = 'mongodb://mongo:27017' // docker connection URL
const url = 'mongodb://localhost:27017' // connection URL
const client = new MongoClient(url) // mongodb client
const dbName = 'ProjectDB' // database name
const collectionNameTours = 'tours' // collection name

/**
 * GET sights for listing.
 * Connects to the mongoDB and finds all the sights stored in the used collection
 * and sends the information about the sights to the pug-view where they are processed to get displayed.
 */
router.get('/', function(req, res) {
  client.connect(function(err)
  {
    assert.equal(null, err);

    console.log('Connected successfully to server');

    const db = client.db(dbName);
    const collection = db.collection(collectionNameTours);

    // find some documents
    collection.find({}).toArray(function(err, data)
    {
      assert.equal(err, null);
      console.log('Found the following records...');
      console.log(data);
      res.render('1_home', {tourData: data});
    })
  })
});

/**
 * POST to delete sight.
 * Recieves an object with the ids of all checked sights that should be deleted from the database.
 * It then iterates over the array and sends a delete query to DB with the specific sight to delete. 
 */ 
 router.post('/delete', function(req, res) {
  var toursObj = JSON.parse(req.body.o);
  console.log(req);
  console.log(toursObj);
  const db = client.db(dbName);
  const collection = db.collection(collectionNameTours);
  if (toursObj.toursChecked.length > 0) {
    for (var i=0; i<toursObj.toursChecked.length; i++) {
      var myquery = {"_id": mongodb.ObjectId(toursObj.toursChecked[i])}
      collection.deleteOne(myquery, function(err, data)
      {
          assert.equal(err, null);
          //if (err) throw err;
          console.log('One document deleted');
      })
      res.redirect("/home");
    }  
  }
});

module.exports = router;
