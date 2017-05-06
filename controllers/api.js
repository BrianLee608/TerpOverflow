var User = require('../models/User');
var Question = require('../models/Question');
var Tag = require('../models/Tag');

var async = require('async');

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

exports.getTagsMatchingQuery = function(req, res) {
  if (req.query.q) {
    const regex = new RegExp(escapeRegex(req.query.q), 'gi');
    Tag.find({ "tagname": regex }, function (err, foundTags) {
      if (err)
        res.send("{}");

      var tags = foundTags.map(t => {return {
        tagname: t.tagname,
        numberOfQuestionsLinked: t.numberOfQuestionsLinked,
        url: t.url
      }});
      res.json({ total_count: foundTags.length, items: tags });
    });
  } else {
    Tag.find({}, function (err, foundTags) {
      if (err)
        res.send("{}");

      var tags = foundTags.map(t => { return {
        tagname: t.tagname,
        url: t.url
      }});
      res.json({ total_count: foundTags.length, items: tags })
    })
  }
}

exports.getUsers = function(req, res) {
  User.find({}, function(err, users) {
    if (err)
      res.send({error: "Request not successful"});
    res.send(users);
  });
};

exports.getQuestions = function(req, res) {
  var page = req.query.page || 1;
  var limit = req.query.limit || 15;
  Question.paginate({}, { page, limit }, function(err, result) {
    res.send({
      total: result.total,
      page: result.page,
      pageCount: result.pages,
      items: result.docs
    });
  })

};

exports.getQuestionApi = function(req, res) {
  Question.findById(req.params.qid, function(err, question) {
    if (err) return res.json({});
    if (!question) return res.json({});
    res.json(question);
  })
}
/**
 * POST /api/signup
 */
exports.signupApiPost = function(req, res) {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  var errors = req.validationErrors();
  if (errors)
    return res.send({error: "POST body not valid."});

  User.findOne({ email: req.body.email }, function(err, user) {
    if (user)
      return res.send({error: 'The email address you have entered is already associated with another account.'});

    user = new User({
      displayName: req.body.name,
      email: req.body.email,
      password: req.body.password
    });
    console.log(user)
    user.save(function(err) {
      console.log(user)
      if (err) return {error: 'Internal database error'};
      res.send({status: "OK"});
    });
  });
};
