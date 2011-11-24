function ruleFromNumber(n) {
  if (n < 0 || n > 255) {
    return undefined;
  }
  return _.map(_.range(8), function(i) {
    return (1 << 8 - i - 1 & n) > 0;
  });
}

function numberFromRule(bits) {
  var lookup = {true: 1, false: 0};
  return _.reduce(_.zip(_.range(8), bits), function(memo, num) {
    var power = 8 - num[0] - 1;
    var state = num[1];
    return memo + (1 << power) * lookup[state];
  }, 0);
}