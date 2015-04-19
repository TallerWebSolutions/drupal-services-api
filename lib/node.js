'use strict';

var assign  = require('lodash-node/modern/objects/assign');

function Node(drupal) {
  this.drupal = drupal;
}

Node.prototype.index = function(options, params) {
  var query = assign({}, options || {}, {
    parameters: params || {}
  });
  var url = this.drupal.urlForPath('node');
  return this.drupal.authenticatedGet(url, query);
};

Node.prototype.retrieve = function(id) {
  var url = this.drupal.urlForPath('node/' + id);
  return this.drupal.authenticatedGet(url);
};

Node.prototype.create = function(params) {
  var url = this.drupal.urlForPath('node/register');
  return this.drupal.authenticatedPost(url, params);
};

module.exports = Node;
