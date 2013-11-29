var vows = require('vows');
var assert = require('assert');
var util = require('util');
var strava = require('passport-strava');


vows.describe('passport-strava').addBatch({
  
  'module': {
    'should report a version': function (x) {
      assert.isString(strava.version);
    },
  },
  
}).export(module);