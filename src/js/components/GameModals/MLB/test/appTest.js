module.exports = {
  addFunc: function(first, second) {
    return first + second;
  },
  beveragesCheck: function() {
    return beverages = { tea: ['chai', 'matcha', 'oolong'] };
  },
  maybeFirst: function(array) {
    if (array && array.length) {
      return array[0];
    }
  },
  getData: function() {
    return 'http://mlb.mlb.com/gdcross/components/game/mlb/year_2017/month_07/day_14/master_scoreboard.json';
  }
}
