// express
const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('3_validFiles', { title: 'Valid Form:' });
});

module.exports = router;
