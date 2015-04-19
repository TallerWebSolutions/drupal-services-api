'use strict';

var assign  = require('lodash-node/modern/objects/assign');

function Node(drupal) {
  this.drupal = drupal;
}

Node.prototype.index = function(options, params) {
  // This merges options like limit: 1 and params like title: 'whatever'.
  var query = assign({}, options || {}, {
    parameters: params || {}
  });

  return this.drupal.agent
    .get('node')
    .use(this.drupal.middle())
    .query(query);
};

Node.prototype.retrieve = function(id) {
  return this.drupal.agent
    .get('node/' + id)
    .use(this.drupal.middle());
};

Node.prototype.create = function(params) {
  var url = this.drupal.urlForPath('node/register');
  return this.drupal.authenticatedPost(url, params);
};

Node.prototype.update = function(nid, body) {
  return this.drupal.authenticatedPut(this.urlForNode(nid), body);
};

Node.prototype.delete = function(nid) {
  return this.drupal.authenticatedDelete(this.urlForNode(nid));
};

module.exports = Node;
