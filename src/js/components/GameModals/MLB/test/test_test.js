let assert = require('chai').assert,
    should = require('chai').should(),
    expect = require('chai').expect();

// let assert = require('assert'); // Using Node Assert
// import LoadGameData from '../LoadGameData';
// let LoadGameData = require('../LoadGameData');

const app = require('./appTest');

//Results
const add = app.addFunc,
      beverage = app.beveragesCheck,
      maybeFirst = app.maybeFirst;

describe('add', function() {
  let result = null;

  it('should add two values and return 10', function() {
    result = add(5,5);
    assert.equal(result, 10);
  })

  it('should add two values together and return a number', function() {
    result = add(10, 30);
    assert.typeOf(result, 'number');
  })

  it('should add two values and be above 30', function() {
    result = add(29,2);
    assert.isAbove(result, 30);
  })
})

describe('beveragesCheck', function() {
  it('returns if the array has the tea property', function() {
    let result = beverage();
    beverages.should.have.property('tea').with.length(3);
  })
})

describe('maybeFirst', function() {
  it('returns the first element of the array', function() {
    let result = maybeFirst([3,4,1]);
    assert.equal(result, 3, 'maybeFirst first index is 3');
  })
})
