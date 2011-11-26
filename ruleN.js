_.mixin(_.string.exports());

function ruleFromNumber(n) {
  if (n < 0 || n > 255) {
    return undefined;
  }
  return _.map(_.range(8), function(i) {
    return (1 << 8 - i - 1 & n) > 0 ? '1' : '0';
  }).join('');
}

function numberFromRule(rule) {
  if (rule.length != 8) {
    return undefined;
  }

  return _.reduce(_.zip(_.range(8), rule.split('')), function(memo, num) {
    var power = 8 - num[0] - 1;
    var state = num[1];
    return memo + (1 << power) * state;
  }, 0);
}

var Automaton = function(rule, initialState) {
  function RuleObject(rule) {
    var patterns = ['111', '110', '101', '100', '011', '010', '001', '000'];
    var ruleAssoc = {};
    _.each(_.range(8), function(i) {
      ruleAssoc[patterns[i]] = rule[i];
    });
    return ruleAssoc;
  };

  this.rule = RuleObject(rule);
  this.state = initialState;
};

Automaton.prototype.nextState = function() {
  function neighborhood(state, i) {
    // returns the cell in position i of the passed state along with its
    // neighbors to the left and to the right, using periodic boundary
    // conditions.
    var h = (i - 1 >= 0) ? (i - 1) : (state.length - 1);
    var k = (i + 1 < state.length) ? (i + 1) : 0;
    return [state[h], state[i], state[k]].join('');
  }
  var oldState = this.state;
  var rule = this.rule;
  var i = 0;
  var newState = _(oldState.split('')).map(function(cell) {
    var pattern = neighborhood(oldState, i);
    i += 1;
    return rule[pattern];
  }).join('');
  this.state = newState;
  return this.state;
};

$(document).ready(function() {
  $('#rule-form').submit(function() {
    var n = $('#rule-number').val();
    var rule = ruleFromNumber(n);
    if (rule == undefined) {
      alert('rule numbers must not be less than 0 or greater than 255.');
      return false;
    }
    $('#rule-definition td').each(function(i) {
      $(this).html(rule[i]);
    });
    return false;
  });

  $('#randomize-initial').click(function() {
    var cellCount = $('#cell-count').val();
    $('#initial-state').val((_(_.range(cellCount)).map(function() {
      if (Math.random() > 0.5) {
        return '1';
      }
      else {
        return '0';
      }
    }).join('')));
  });

  $('#simulation-form').submit(function() {
    $('#results').show();
    $('#results').append('<p id="busy">reticulating splines ...</p>');
    $('#trajectory tbody').empty();

    // TODO: verify simulation parameters

    window.setTimeout(function() {
      var cellCount = $('#cell-count').val();
      var steps = $('#simulation-steps').val();
      var initial = _($('#initial-state').val()).chain().lpad(cellCount, '0').truncate(cellCount).value();

      var run = new Automaton(ruleFromNumber($('#rule-number').val()), initial);

      var frame = run.state;
      _(steps).times(function() {
        var tr = $('<tr />').appendTo('#trajectory tbody');
        _.each(_.range(cellCount), function(i) {
          $('<td />', {
            class: frame[i] == '1' ? 'on' : 'off'
          }).appendTo(tr);
        });
        frame = run.nextState();
      });
      $('#busy').remove();
    }, 0);
    return false;
  });
});