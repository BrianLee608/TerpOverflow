var User = require('../models/User');
var Question = require('../models/Question');
var Tag = require('../models/Tag');

var async = require('async');
var QuillDeltaToHtmlConverter = require('quill-delta-to-html');
var moment = require('moment');
moment().format();

/**
 * GET /
 */
exports.index = function(req, res) {
  async.parallel({
    questionCount: function(callback) {
      Question.count(callback);
    },
    questions: function(callback) {
      if (req.query.unanswered) {
        Question
          .find({ answers: { $eq: [] } })
          .sort({createDate: -1})
          .populate('author')
          .exec(callback);
      } else if (req.query.hottest) {
        console.log('hottest')
        Question
          .find({})
          .sort({answers: -1})
          .populate('author')
          .exec(callback);
      } else {
        Question
          .find({})
          .sort({createDate: -1})
          .populate('author')
          .exec(callback);
      }
    }

  }, function(err, results) {
    if (err) res.redirect('/');
    res.render('home', { error: err, data: results });
  });
};

/**
 * GET /questions/:qid
 */
exports.getQuestion = function(req, res, next) {
  Question.findOne({ _id: req.params.id }, function(err, question) {
    let ops = JSON.parse(question.deltaContent).ops;
    if (err) res.redirect('/');
    var converter = new QuillDeltaToHtmlConverter(ops, {});
    var deltaAsHtml = converter.convert();

    User.findById(question.author, function(err, user) {
      if (err) return next(err);

      res.render('post/question', {
        questionTitle: question.title,
        questionBody: deltaAsHtml,
        questionTags: question.tags,
        questionDate: moment(question.createDate).format('MMMM Do, YYYY'),
        authorDisplayName: user.displayName,
        authorGravatar: user.gravatar,
        authorUrl: user.url,
        answers: question.answers.map(ans => {
          var ansOps = JSON.parse(ans.deltaContent).ops;
          var ansConverter = new QuillDeltaToHtmlConverter(ansOps, {});
          var ansDeltaAsHtml = ansConverter.convert();
          return Object.assign({
            date: moment(ans.createDate).format('MMMM Do, YYYY'),
            ansBody: ansDeltaAsHtml,
            authorDisplayName: ans.authorDisplayName,
            authorUrl: ans.authorUrl,
            authorGravatar: ans.authorGravatar
          }, ans);
        })
      });

    });
  });
}

/**
 * GET /questions/ask
 */
exports.newQuestionGet = function(req, res) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.render('post/questionform', {
    title: 'Question'
  });
};

/**
 * POST /questions/ask
 */
exports.newQuestionPost = function(req, res, next) {
  req.assert('questionTitle', 'Title cannot be blank').notEmpty();
  req.assert('questionContent', 'Content cannot be blank').notEmpty();
  req.assert('tags', 'At least one tag is needed').notEmpty();

  var errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors);
    return res.redirect('/questions/ask');
  }

  var selectedTags = req.body.tags;
  if (typeof req.body.tags === 'string')
    selectedTags = [req.body.tags];

  var question = new Question({
    author: req.user._id,
    title: req.body.questionTitle,
    deltaContent: req.body.questionContent,
  });

  for (let t of selectedTags)
    question.tags.push(t);

  console.log(question)
  question.save(function (err) {
    if (err) return next(err);

    Tag.find()
      .where('tagname')
      .in(selectedTags)
      .update({ $inc: {numberOfQuestionsLinked: 1} })
      .exec();

    res.redirect('/questions/' + question.id);
  });

};

/**
 * POST /questions/:id
*/
exports.newAnswerPost = function(req, res, next) {
  Question.findByIdAndUpdate(
    req.params.id,
    { $push:  { "answers": {
      deltaContent: req.body.answerContent,
      authorDisplayName: req.user.displayName,
      authorUrl: req.user.url,
      authorGravatar: req.user.gravatar
    } } },
    { safe: true, upsert: true },
    function(error, question) {
      if (error) next(error);
      if (!question || !req.user) return res.redirect(req.get('referer'));
      res.redirect(req.get('referer'));
    });

}

/**
 * GET /tags
*/
exports.getAllTags = function(req, res, next) {
  async.parallel({
    tags: function(callback) {
      Tag.find({}).exec(callback);
    },
  }, function(err, results) {
    if (err) res.redirect('/');
    res.render('post/tags', { error: err, tags: results.tags });
  });
}

/**
 * GET /tags/:tagname
*/
exports.getTagByName = function(req, res, next) {
  var tagNameWithSpaces = req.params.tagname.replace(/([a-z])([A-Z])/g, '$1 $2');
  Tag.findOne({ tagname: tagNameWithSpaces }, function(err, tag) {
    if (err) return res.next(err);

    Question.find({ tags: tag.tagname }, function(error, questions) {
      if (error) return res.next(error);
      console.log(tag);
      res.render('post/tagprofile', {tag, questions});
    })
  })
}
