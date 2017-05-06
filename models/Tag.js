var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TagSchema = new mongoose.Schema({
  tagname: {
    type: String,
    unique: true,
    required: true,
    index: { unique: true }
  },
  numberOfQuestionsLinked: { type: Number, default: 0 }
});

TagSchema
.virtual('url')
.get(function () {
  return ('/tags/' + this.tagname).replace(/ /g,'');
});

module.exports = mongoose.model('Tag', TagSchema);
