'use strict';

var assign  = require('lodash-node/modern/objects/assign');

function Views(drupal) {
  this.drupal = drupal;
}

Views.prototype.retrieve = function(viewName, options, filtersParam) {

  var query = assign({}, options || {});

  // @TODO: If possible, change this code to other away to create param array
  var str = '';
  if (filtersParam) {
    var urlParam = [];
    for (var i in filtersParam){
      urlParam.push('filters[' + encodeURI(i) + "]=" + encodeURI(filtersParam[i]));
    }
    str = urlParam.join("&")
  }

  return this.drupal.agent
    .get('views/' + viewName + '?' + str)
    .use(this.drupal.middle())
    .query(query);
};

module.exports = Views;
