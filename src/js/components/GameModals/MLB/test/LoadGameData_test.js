let assert = require('chai').assert; // Using Chai
let should = require('chai').should(); // Using Chai

// let assert = require('assert'); // Using Node Assert
// import LoadGameData from '../LoadGameData';
// let LoadGameData = require('../LoadGameData');

function beveragesCheck() {
  return beverages = { tea: ['chai', 'matcha', 'oolong'] };
}

describe('beveragesCheck', function() {
  it('returns if the array has the tea property', function() {
    let result = beveragesCheck();

    beverages.should.have.property('tea').with.length(3);
  })
})

function maybeFirst(array) {
  if (array && array.length) {
    return array[0];
  }
}

describe('maybeFirst', function() {
  it('returns the first element of the array', function() {
    let result = maybeFirst([3,4,1]);

    assert.equal(result, 3, 'maybeFirst first index is 3');
  })
})

describe('assertTest', function() {
  it('returns if input is a number', function() {
    assert.typeOf(1, 'number');
  })
});
