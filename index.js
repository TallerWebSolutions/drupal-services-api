'use strict';

var superagent = require('superagent-bluebird-promise');
// var interceptor = require('superagent-intercept');
var TaxonomyVocabulary = require('./lib/taxonomy-vocabulary');
var DrupalFile = require('./lib/file');
var User    = require('./lib/user');
var Node    = require('./lib/node');
var Entity  = require('./lib/entity');
var Views   = require('./lib/views');
var Share   = require('./lib/share');
var Promise = require('bluebird'); // jshint ignore:line

function Drupal(endpoint, connection) {

  // Agent is only needed in node.
  if (typeof superagent.agent == 'function') {
    this.agent = superagent.agent();
  }
  else {
    this.agent = superagent;
  }

  this._endpoint          = endpoint;
  this._cookie            = null;
  this._csrfToken         = null;
  this._user              = null;
  this.taxonomyVocabulary = new TaxonomyVocabulary(this);
  this.file               = new DrupalFile(this);
  this.user               = new User(this);
  this.node               = new Node(this);
  this.views              = new Views(this);
  this.share              = new Share(this);
}

Drupal.prototype.entity = function (type) {
  return new Entity(this, type);
}
/*
 * Superagent middle ware.
 */
Drupal.prototype.middle = function () {
  return function (request) {

    // Prefix with endpoint path.
    request.use(this.middleUrlForPath());

    // Use a token for the request.
    request.use(this.middleCsrfToken());

    // Authenticate the request if there's session.
    request.use(this.middleAuthenticateRequest());

    // Adds conten-type and accept to request.
    request.use(this.middleSetType());

    return request;
  }.bind(this);
};

Drupal.prototype.middleCsrfToken = function () {
  return function (request) {
    if (this._csrfToken) {
      request.set('X-CSRF-Token', this._csrfToken);
      return request;
    }
  }.bind(this);
};

Drupal.prototype.middleUrlForPath = function () {
  return function (request) {
    if (this._endpoint) {
      request.url = this._endpoint + '/' + request.url;
    }
    return request;
  }.bind(this);
};

Drupal.prototype.middleSetType = function () {
  return function (request) {
      request.accept('json');
      request.type('json');
      return request;
  }.bind(this);
};

Drupal.prototype.isLoggedIn = function () {

  // Check local login.
  if (this.isLoggedUser()) {
    return Promise.resolve(true);
  }
  // Check for remote login.
  else {
    return this.connect().then(function (data) {
      if (this.isLoggedUser(data.user)) {
        this._user = data.user;
        return true;
      }
      return false;
    }.bind(this))
    .catch(function (error) {
      return Promise.reject(error);
    }.bind(this));
  }
};

Drupal.prototype.isLoggedUser = function (user) {
  user = user || this._user;
  var hasCookieToken = this._cookie && this._csrfToken;
  var hasLoggedUser  = user != null && user.uid != null && user.uid !== 0;

  return (hasCookieToken && hasLoggedUser);
};

Drupal.prototype.connect = function () {
  var returnPromise = Promise.defer();
  var connectPromise = this.agent
    .post('system/connect')
    .use(this.middleAuthenticateRequest())
    .use(this.middleUrlForPath())
    .use(this.middleSetType());

  this.user.token().then(function (res) {
    this._csrfToken = res.body.token;


    // Connect to Drupal.
    connectPromise
      .use(this.middleCsrfToken())
      .send()
      .then(function (resCon) {
        // @TODO: Set user data.
        var data        = resCon.body;
        this._user      = data.user;
        this._cookie    = createCookieFromUser(data);

        returnPromise.resolve(data);
      }.bind(this));
  }.bind(this))
  .catch(function (error) {
    return returnPromise.reject(error);
  }.bind(this));

  return returnPromise.promise;
};

/*
 * Login/Logout
 */
Drupal.prototype.login = function(username, password) {
  var returnPromise = Promise.defer();

  this.isLoggedIn().then(function (isLoggedIn) {
    if (isLoggedIn) {
      return returnPromise.resolve(isLoggedIn);
    }
    else {
      this.agent.post('user/login')
        .use(this.middle())
        .send({
          username: username,
          password: password
        })
        .then(function(response) {
          var data        = response.body;
          this._cookie    = createCookieFromUser(data);
          this._csrfToken = data.token;

          returnPromise.resolve(data);
        }.bind(this))
        .catch(function(error) {
          returnPromise.reject(error);
        });
    }
  }.bind(this))
  .catch(function (error) {
    returnPromise.reject(error);
  }.bind(this));

  return returnPromise.promise;
};

Drupal.prototype.logout = function() {
  return this.agent
    .post('user/logout')
    .use(this.middle())
    .then(function () {
      this._cookie    = null;
      this._csrfToken = null;
      return true;
    }.bind(this));
};

Drupal.prototype.middleAuthenticateRequest = function() {
  return function (request) {
    // Adds credentials to the request.
    if (typeof request.withCredentials == 'function') {
      request.withCredentials();
    }
    else {
      this._cookie && (request.cookies = this._cookie);
      this._csrfToken && request.set('X-CSRF-Token', this._csrfToken);
    }
    return request;
  }.bind(this);
};

/*
 * private
 */
function createCookieFromUser(user) {
  return user.session_name + '=' + user.sessid;
}

module.exports = Drupal;
