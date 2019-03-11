"use strict";

var through = require('through');

module.exports = function() {
  var index = {},
      isEmpty = true;

  function resolve(id) {
    return index[id];
  }

  return through(
    function(mod) {
      isEmpty = false;
      index[mod.id] = mod;
    },
    function() {
      if (isEmpty) return this.queue(null);

      var queue = this.queue.bind(this),
          topLevel = values(index),
          seen = {};

      topLevel.sort(cmp);

      function visit(mod) {
        if (seen[mod.id]) return;
        seen[mod.id] = true;
        if (hasDeps(mod)) {
          var deps = values(mod.deps).map(resolve).filter(Boolean);
          deps.sort(cmp);
          deps.forEach(visit);
        }
        queue(mod);
      }
      
      values(index).forEach(visit);
      queue(null);
    }
  );
}

function values(obj) {
  var result = [];
  for (var k in obj)
    result.push(obj[k]);
  return result;
}

function hasDeps(mod) {
  return (mod.deps && Object.keys(mod.deps).length > 0)
}

function cmp (a, b) {
  return a.id < b.id ? -1 : 1;
}
