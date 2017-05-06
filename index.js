var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var passport = require('passport');
var flash = require('express-flash');
var expressValidator = require('express-validator');
var session = require('express-session');
var mongoose = require('mongoose');
var dotenv = require('dotenv');
var exphbs = require('express-handlebars');

var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use('/public', express.static('public'));
app.set('port', process.env.PORT || 3000);

var userController = require('./controllers/user');
var postController = require('./controllers/post');
var apiController  = require('./controllers/api');

dotenv.load();
mongoose.connect(process.env.MONGODB);
mongoose.connection.on('error', function(e) {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

app.use(session({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.locals.user = req.user;
  next();
});

app.get('/', postController.index);
app.get('/questions/ask', postController.newQuestionGet);
app.post('/questions/ask', userController.ensureAuthenticated, postController.newQuestionPost);
app.get('/questions/:id', postController.getQuestion);
app.post('/questions/:id', userController.ensureAuthenticated, postController.newAnswerPost);
app.get('/tags', postController.getAllTags);
app.get('/tags/:tagname', postController.getTagByName);

app.get('/account', userController.ensureAuthenticated, userController.accountGet);
app.put('/account', userController.ensureAuthenticated, userController.accountPut);
app.delete('/account', userController.ensureAuthenticated, userController.accountDelete);
app.get('/signup', userController.signupGet);
app.post('/signup', userController.signupPost);
app.get('/login', userController.loginGet);
app.post('/login', userController.loginPost);
app.get('/forgot', userController.forgotGet);
app.post('/forgot', userController.forgotPost);
app.get('/reset/:token', userController.resetGet);
app.post('/reset/:token', userController.resetPost);
app.get('/logout', userController.logout);
app.get('/users', userController.usersGet);
app.get('/users/:username', userController.userGet);

app.get('/api/tags', apiController.getTagsMatchingQuery);
app.get('/api/users', apiController.getUsers);
app.get('/api/questions', apiController.getQuestions);
app.get('/api/questions/:qid', apiController.getQuestionApi);
app.post('/api/signup', apiController.signupApiPost);

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
