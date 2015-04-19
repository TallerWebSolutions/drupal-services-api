'use strict';

var test = require('tape');
var nock = require('nock');
var nockResponses = require('./nock-responses');

var Drupal = require('../index');

test('Initialize with endpoint', function(t) {
  t.plan(1);

  var endpoint = 'http://test.com/api';
  var drupal = new Drupal(endpoint);

  t.equal(drupal._endpoint, endpoint);
});

test('Initialize not forced to get a token', function(t) {
  t.plan(1);

  var endpoint = 'http://test.com/api';
  var drupal = new Drupal(endpoint, false);

  t.equal(drupal._forceToken, false);
});

test('Drupal.prototype.isLoggedIn', function(t) {
  t.plan(3);

  var drupal = new Drupal('http://test.com/api');

  // Remote check.
  nock('http://test.com/api')
    .post('/system/connect')
    .reply(200, nockResponses.system.connect.anonymous);

  // Local Check.
  nock('http://test.com/api')
    .get('/user/token')
    .reply(200, {
      token: nockResponses.user.login.token
    });

  drupal.isLoggedIn().then(function (isLoggedIn) {
    t.equal(isLoggedIn, false, 'should be false after a login');

    // Already authenticated remote check.
    nock('http://test.com/api')
      .post('/system/connect')
      .reply(200, nockResponses.system.connect.authenticated);

    nock('http://test.com/api')
      .get('/user/token')
      .reply(200, {
        token: nockResponses.user.login.token
      });

    drupal.isLoggedIn().then(function (isLoggedIn) {
      t.equal(isLoggedIn, true, 'should be true after a login in the api');
  
      // Already logged in.
      mockLogin(drupal);
      drupal.isLoggedIn().then(function (isLoggedIn) {
        t.equal(isLoggedIn, true, 'should be true after a login without requesting the api');
      });
    });

  });
});

test('user - actions - login', function(t) {
  t.plan(2);

  var drupal = new Drupal('http://test.com/api');

  // Remote check.
  nock('http://test.com/api')
    .post('/system/connect')
    .reply(200, nockResponses.system.connect.anonymous);

  // Local Check.
  nock('http://test.com/api')
    .get('/user/token')
    .reply(200, {
      token: nockResponses.user.login.token
    });

  nock('http://test.com/api')
    .post('/user/login')
    .reply(200, nockResponses.user.login);

  return drupal.login('user', 'password').then(function(data) {
    t.equal(drupal._cookie, cookie());
    t.equal(drupal._csrfToken, nockResponses.user.login.token);
  });
});

// test('user - actions - login - doesn\'t make request if already logged in', function(t) {
//   t.plan(1);

//   var drupal = loggedInDrupal('http://test.com/api');

//   var scope = nock('http://test.com/api')
//     .post('/user/login')
//     .reply(200, nockResponses.user.login);

//   return drupal.login('user', 'password').then(function() {
//     t.equal(scope.isDone(), false, 'request should not be made');
//   });
// });

// test('user - actions - logout', function(t) {
//   t.plan(2);

//   var drupal = loggedInDrupal('http://test.com/api');

//   authedNock('http://test.com/api', drupal)
//     .post('/user/logout')
//     .reply(200, nockResponses.user.logout);


//   return drupal.logout().then(function() {
//     t.equal(drupal._cookie, null);
//     t.equal(drupal._csrfToken, null);
//   });
// });

// test('user - crud - create', function(t) {
//   t.plan(1);
//   var drupal = loggedInDrupal('http://test.com/api');

//   authedNock('http://test.com/api', drupal)
//     .post('/user/register')
//     .reply(200, nockResponses.user.login);

//   return drupal.user.create({
//     mail: 'tester@test.com',
//     pass: 'test123'
//   })
//   .then(function(response) {
//     t.deepEqual(response, nockResponses.user.login);
//   });
// });

// test('node - crud - index', function(t) {
//   t.plan(1);

//   var drupal = new Drupal('http://test.com/api');

//   nock('http://test.com')
//     .get('/api/node.json')
//     .reply(200, nockResponses.node.index);

//   return drupal.index().then(function(response) {
//     t.deepEqual(response, nockResponses.node.index);
//   });
// });

// test('node - crud - index w/ query', function(t) {
//   t.plan(1);

//   var drupal = new Drupal('http://test.com/api');

//   nock('http://test.com')
//     .get('/api/node.json?limit=1&parameters%5Btitle%5D=something')
//     .reply(200, nockResponses.node.indexQuery);

//   return drupal.index({limit: 1}, {title: 'something'}).then(function(response) {
//     t.deepEqual(response, nockResponses.node.indexQuery);
//   });
// });

// test('node - crud - retrieve', function(t) {
//   t.plan(1);
//   var drupal = new Drupal('http://test.com/api');

//   nock('http://test.com')
//     .get('/api/node/3.json')
//     .reply(200, nockResponses.node.retrieve);

//   return drupal.retrieve(3).then(function(response) {
//     t.deepEqual(response, nockResponses.node.retrieve);
//   });
// });

// test('node - crud - create', function(t) {
//   t.plan(1);
//   var drupal = loggedInDrupal('http://test.com/api');

//   authedNock('http://test.com', drupal)
//     .post('/api/node.json')
//     .reply(200, nockResponses.node.create);

//   return drupal.create({
//     type: 'article',
//     title: 'title',
//     field_phone_number: { und: [{ value: '1234567890' }] }
//   }).then(function(response) {
//     t.deepEqual(response, nockResponses.node.create);
//   });
// });

// test('node - crud - update', function(t) {
//   t.plan(1);
//   var drupal = loggedInDrupal('http://test.com/api');

//   authedNock('http://test.com', drupal)
//     .put('/api/node/5.json')
//     .reply(200, nockResponses.node.update);

//   return drupal.update(5, {
//     title: 'new title',
//     field_phone_number: { und: [{ value: '999999999' }] }
//   }).then(function(response) {
//     t.deepEqual(response, nockResponses.node.update);
//   });
// });

// test('node - crud - delete', function(t) {
//   t.plan(1);
//   var drupal = loggedInDrupal('http://test.com/api');

//   authedNock('http://test.com', drupal)
//     .delete('/api/node/5.json')
//     .reply(200, nockResponses.node.delete);

//   return drupal.delete(5).then(function(response) {
//     t.deepEqual(response, nockResponses.node.delete);
//   });
// });

// test('Initializes taxonomyVocabulary with client', function(t) {
//   t.plan(1);
//   var drupal = new Drupal('http://test.com/api');

//   t.deepEqual(drupal.taxonomyVocabulary.drupal, drupal);
// });

// test('taxonomyVocabulary - crud - index', function(t) {
//   t.plan(1);
//   var drupal = new Drupal('http://test.com/api');

//   nock('http://test.com')
//     .get('/api/taxonomy_vocabulary.json')
//     .reply(200, nockResponses.taxonomyVocabulary.index);

//   return drupal.taxonomyVocabulary.index().then(function(response) {
//     t.deepEqual(response, nockResponses.taxonomyVocabulary.index);
//   });
// });

// test('taxonomyVocabulary - crud - getTree', function(t) {
//   t.plan(1);
//   var drupal = new Drupal('http://test.com/api');

//   nock('http://test.com')
//     .post('/api/taxonomy_vocabulary/getTree.json')
//     .reply(200, nockResponses.taxonomyVocabulary.getTree);

//   return drupal.taxonomyVocabulary.getTree(3).then(function(response) {
//     t.deepEqual(response, nockResponses.taxonomyVocabulary.getTree);
//   });
// });

// test('file - crud - index', function(t) {
//   t.plan(1);
//   var drupal = loggedInDrupal('http://test.com/api');

//   authedNock('http://test.com', drupal)
//     .get('/api/file.json')
//     .reply(200, nockResponses.file.index);

//   return drupal.file.index().then(function(response) {
//     t.deepEqual(response, nockResponses.file.index);
//   }, t.error);
// });

// test('file - crud - retrieve', function(t) {
//   t.plan(1);
//   var drupal = loggedInDrupal('http://test.com/api');

//   authedNock('http://test.com', drupal)
//     .get('/api/file/3.json')
//     .reply(200, nockResponses.file.retrieve);

//   return drupal.file.retrieve(3).then(function(response) {
//     t.deepEqual(response, nockResponses.file.retrieve);
//   });
// });

// test('user - index', function(t) {
//   t.plan(1);
//   var drupal = loggedInDrupal('http://test.com/api');

//   authedNock('http://test.com', drupal)
//     .get('/api/user.json')
//     .reply(200, nockResponses.user.index);

//   return drupal.user.index().then(function(response) {
//     t.deepEqual(response, nockResponses.user.index);
//   }, t.error);
// });

// test('user - retrieve', function(t) {
//   t.plan(1);
//   var drupal = loggedInDrupal('http://test.com/api');

//   authedNock('http://test.com', drupal)
//     .get('/api/user/1.json')
//     .reply(200, nockResponses.user.retrieve);

//   return drupal.user.retrieve(1).then(function(response) {
//     t.deepEqual(response, nockResponses.user.retrieve);
//   }, t.error);
// });

function authedNock(url, drupalClient) {
  return nock(url, {
    reqheaders: {
      'Cookie': drupalClient._cookie,
      'X-CSRF-Token': drupalClient._csrfToken
    }
  });
}

function loggedInDrupal(endpoint) {
  var drupal = new Drupal(endpoint);
  mockLogin(drupal);

  return drupal;
}

function mockLogin(drupal) {
  drupal._cookie = nockResponses.user.login.sessid;
  drupal._csrfToken = nockResponses.user.login.token;

  return drupal;
}

function cookie() {
  return nockResponses.user.login.session_name + '=' + nockResponses.user.login.sessid;
}
