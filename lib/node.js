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

  // @TODO: If possible, change this code to other away to create param array
  var str = '';
  if (params) {
    var urlParam = [];
    for (var i in params){
      urlParam.push('parameters[' + encodeURI(i) + "]=" + encodeURI(params[i]));
    }
    str = urlParam.join("&")
  }

  return this.drupal.agent
    // .get('node')
    .get('node?' + str)
    .use(this.drupal.middle())
    // .query(query);
};

Node.prototype.retrieve = function(nid) {
  return this.drupal.agent
    .get('node/' + nid)
    .use(this.drupal.middle());
};

Node.prototype.create = function(body) {
  return this.drupal.agent
    .post('node')
    .use(this.drupal.middle())
    .send(body);
};

Node.prototype.update = function(nid, body) {
  return this.drupal.agent
    .put('node/' + nid)
    .use(this.drupal.middle())
    .send(body);
};

Node.prototype.delete = function(nid) {
  return this.drupal.agent
    .del('node/' + nid)
    .use(this.drupal.middle());
};

module.exports = Node;
