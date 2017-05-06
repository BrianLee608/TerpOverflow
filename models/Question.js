var QuillDeltaToHtmlConverter = require('quill-delta-to-html');
var sanitizeHtml = require('sanitize-html');
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;

var AnswerSchema = new mongoose.Schema({
  deltaContent: { type: String, required: true },
  votes: { type: Number, default: 0 },
  createDate: { type: Date, default: Date.now },
  authorDisplayName: String,
  authorUrl: String,
  authorGravatar: String
});

var QuestionSchema = new mongoose.Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  tags: [String],
  title: { type: String, required: true },
  deltaContent: { type: String, required: true },
  votes: { type: Number, default: 0 },
  answers: [AnswerSchema],
  views: { type: Number, default: 0 },
  createDate: { type: Date, default: Date.now },
});

QuestionSchema
.virtual('url')
.get(function() {
  return '/questions/' + this._id;
});

QuestionSchema
.virtual('deltaAsHtml')
.get(function() {
  let ops = JSON.parse(this.deltaContent).ops;
  let converter = new QuillDeltaToHtmlConverter(ops, {});
  return converter.convert();
});

QuestionSchema
.virtual('sanitizedDeltaAsHtmlPreview')
.get(function() {
  return sanitizeHtml(this.deltaAsHtml, {
    allowedTags: [],
    allowedAttributes: []
  }).substring(0, 200);
});

QuestionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Question', QuestionSchema);
