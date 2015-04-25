'use strict';

var assign  = require('lodash-node/modern/objects/assign');

function Entity(drupal, type) {
  this.drupal = drupal;
  this.resourceName = 'entity_' + type;
}

Entity.prototype.index = function(options, params) {
  // This merges options like limit: 1 and params like title: 'whatever'.
  var query = assign({}, options || {}, {
    parameters: params || {}
  });

  return this.drupal.agent
    .get(this.resourceName)
    .use(this.drupal.middle())
    .query(query);
};

Entity.prototype.retrieve = function(nid) {
  return this.drupal.agent
    .get(this.resourceName + '/' + nid)
    .use(this.drupal.middle());
};

Entity.prototype.create = function(body) {
  return this.drupal.agent
    .post(this.resourceName)
    .use(this.drupal.middle())
    .send(body);
};

Entity.prototype.update = function(nid, body) {
  return this.drupal.agent
    .put(this.resourceName + '/' + nid)
    .use(this.drupal.middle())
    .send(body);
};

Entity.prototype.delete = function(nid) {
  return this.drupal.agent
    .del(this.resourceName + '/' + nid)
    .use(this.drupal.middle());
};

module.exports = Entity;
