'use strict';

var assign  = require('lodash-node/modern/objects/assign');

function File(drupal) {
  this.drupal = drupal;
}

File.prototype.index = function(options, params) {
  var query = assign({}, options || {}, {
    parameters: params || {}
  });

  return this.drupal.agent
    .get('file')
    .use(this.drupal.middle())
    .query(query);
};

File.prototype.retrieve = function(fid) {
  return this.drupal.agent
    .get('file/' + fid)
    .use(this.drupal.middle());
};

File.prototype.create = function(body) {
  return this.drupal.agent
    .post('file')
    .use(this.drupal.middle())
    .send(body);
};

module.exports = File;
