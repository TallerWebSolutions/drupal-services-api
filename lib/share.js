'use strict';

var assign = require('lodash-node/modern/objects/assign');

function Share(drupal) {
  this.drupal = drupal;
}

Share.prototype.mail = function(params, type) {
  if (!type) {return}

  return this.drupal.agent
    .post('sharemail/' + type)
    .use(this.drupal.middle())
    .send(params);
};

module.exports = Share;

