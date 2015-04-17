'use strict';

var superagent = require('superagent-bluebird-promise');
// var interceptor = require('superagent-intercept');
var assign  = require('lodash-node/modern/objects/assign');
// var TaxonomyVocabulary = require('./lib/taxonomy-vocabulary');
// var DrupalFile = require('./lib/file');
// var User    = require('./lib/user');
var Promise = require('bluebird'); // jshint ignore:line

function Drupal(endpoint) {
  this.agent              = superagent;
  this._endpoint          = endpoint;
  this._cookie            = null;
  this._csrfToken         = null;
  // this.taxonomyVocabulary = new TaxonomyVocabulary(this);
  // this.file               = new DrupalFile(this);
  // this.user               = new User(this);
}



/*
 * Superagent middle ware.
 */
Drupal.prototype.middle = function () {

  return function (request) {

    // Prefix with endpoint path.
    if (this._endpoint) {
      request.use(this.urlForPath());
    }
    
    // Authenticate the request if there's session.
    if (this.isLoggedIn()) {
      request.use(this.authenticateRequest());
    }
    return request;
  }.bind(this);
};

Drupal.prototype.urlForPath = function() {
  return function (request) {
    if (this._endpoint) {
      request.url = this._endpoint + '/' + request.url;
    }
    return request;
  }.bind(this);
};

Drupal.prototype.isLoggedIn = function() {
  if (this._cookie && this._csrfToken) {
    return true;
  }

  return false;
};

/*
 * Login/Logout
 */
Drupal.prototype.login = function(username, password) {
  if (this.isLoggedIn()) {
    return Promise.resolve();
  }

  return this.agent
    .post('user/login')
    .use(this.middle())
    .send({
      username: username,
      password: password
    })
    .then(function(response) {
      var user        = response.body;
      this._cookie    = createCookieFromUser(user);
      this._csrfToken = user.token;

      return user;
    }.bind(this));
};

Drupal.prototype.logout = function() {
  return this.agent
    .post('user/logout')
    .use(this.middle())
    .then(function() {
      this._cookie    = null;
      this._csrfToken = null;
      return true;
    }.bind(this));
};

/*
 * Node methods
 */
Drupal.prototype.index = function(options, params) {
  // This merges options like limit: 1 and params like title: 'whatever'.
  var query = assign({}, options || {}, {
    parameters: params || {}
  });

  return this.agent
    .get('node')
    .use(this.middle())
    .query(query);
};

Drupal.prototype.node = function(nid) {
  return this.agent
    .get('node/' + nid)
    .use(this.middle());
};

// Drupal.prototype.node.create = function(body) {
//   return this.agent
//     .post('node.json')
//     .use(this.middle())
//     .send(body);
// };

// Drupal.prototype.update = function(nid, body) {
//   return this.authenticatedPut(this.urlForNode(nid), body);
// };

// Drupal.prototype.delete = function(nid) {
//   return this.authenticatedDelete(this.urlForNode(nid));
// };

Drupal.prototype.authenticateRequest = function() {
  return function (request) {
    request.set('Cookie', this._cookie);
    request.set('X-CSRF-Token', this._csrfToken);
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