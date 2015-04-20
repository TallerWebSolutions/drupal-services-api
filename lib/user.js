'use strict';

var assign  = require('lodash-node/modern/objects/assign');

function User(drupal) {
  this.drupal = drupal;
}

User.prototype.index = function(options, params) {
  var query = assign({}, options || {}, {
    parameters: params || {}
  });
  return this.drupal.agent
    .get('user')
    .use(this.drupal.middle())
    .query(query);
};

User.prototype.retrieve = function(id) {
  return this.drupal.agent
    .get('user/' + id)
    .use(this.drupal.middle());
};

User.prototype.create = function(params) {
  return this.drupal.agent
    .post('user/register')
    .use(this.drupal.middle())
    .send(params);
};

User.prototype.token = function () {
  return this.drupal.agent
    .post('user/token')
    .use(this.drupal.middleUrlForPath())
    .use(this.drupal.middleSetType())
    .send();

};

module.exports = User;
