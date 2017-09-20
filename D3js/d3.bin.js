(function() {

d3.bin = function() {
  var width = 1,
      height = 1,
      side,
      dx,
      dy, 
      x = d3_binX,
      y = d3_binY;

  function bin(points) {
    var binsById = {};

    points.forEach(function(point, i) {
      var py = y.call(bin, point, i) / dy; 
      var pj = Math.trunc(py);
      var px = x.call(bin, point, i) / dx;
      var pi = Math.trunc(px);

      var id = pi + "-" + pj;
      var bin = binsById[id];
      if (bin) bin.push(point); else {
        bin = binsById[id] = [point];
        bin.i = pi;
        bin.j = pj;
        bin.x = pi * dx;
        bin.y = pj * dy;
      }
    });
    return d3.values(binsById);
  }

  function square(side) {
    var dx = side,
          dy = side;
      return [dx, dy];
  }

  bin.x = function(_) {
    if (!arguments.length) return x;
    x = _;
    return bin;
  };

  bin.y = function(_) {
    if (!arguments.length) return y;
    y = _;
    return bin;
  };

  bin.square = function(sidel) {
    if (arguments.length < 1) side = sidel;
    return "m" + square(sidel).join("l") + "z";
  };


  bin.size = function(_) {
    if (!arguments.length) return [width, height];
    width = +_[0], height = +_[1];
    return bin;
  };

  bin.side = function(_) {
    if (!arguments.length) return side;
    side = +_;
    dx = side;
    dy = side;
    return bin;
  };

  return bin.side(1);
};

var d3_binX = function(d) { return d[0]; },
    d3_binY = function(d) { return d[1]; };

})();