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

$(document).ready(function() {
  $('#rule-form').submit(function() {
    var n = $('#rule-number').val();
    var rule = ruleFromNumber(n);
    if (rule == undefined) {
      alert('rule numbers must not be less than 0 or greater than 255.');
      return false;
    }
    $('#rule-definition td').each(function(i) {
      this.innerHTML = (rule[i] ? '1' : '0');
    });
    return false;
  });
});