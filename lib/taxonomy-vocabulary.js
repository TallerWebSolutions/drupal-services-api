'use strict';

var assign  = require('lodash-node/modern/objects/assign');

function TaxonomyVocabulary(drupal) {
  this.drupal = drupal;
}

TaxonomyVocabulary.prototype.index = function(options, params) {
  var query = assign({}, options || {}, {
    parameters: params || {}
  });

  return this.drupal.agent
    .get('taxonomy_vocabulary')
    .use(this.drupal.middle())
    .query(query);
};

TaxonomyVocabulary.prototype.getTree = function(vid, options) {
  var body = assign({}, options || {}, {
    vid: vid
  });

  return this.drupal.agent
    .post('taxonomy_vocabulary/getTree')
    .use(this.drupal.middle())
    .send(body);
};

module.exports = TaxonomyVocabulary;
