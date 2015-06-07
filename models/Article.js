var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var articleSchema = new Schema({
  id: mongoose.Schema.ObjectId,
  address: String,
  title: String,
  sentences: [ {type: String}],
});


module.exports = mongoose.model('Article', articleSchema);