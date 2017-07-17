// let assert = require('chai').assert,
//     should = require('chai').should(),
//     expect = require('chai').expect();

import assert from 'chai'
import {should} from 'chai'
import {expect} from 'chai'

// let assert = require('assert'); // Using Node Assert
import React from 'react';
import ScorePopOut from '../ScorePopOut';
import { shallow } from 'enzyme';
// import ShallowRenderer from 'react-shallow-render';
// import TestUtils from "react-addons-test-utils";

// const renderer = new ShallowRenderer();
// let renderer = TestUtils.createRenderer();
// renderer.render(<LoadGameData />);
// const shallowRendererResult = renderer.getRenderOutput();

const app = require('./appTest_test');

//Results
const add = app.addFunc,
      beverage = app.beveragesCheck,
      maybeFirst = app.maybeFirst;

describe('ScorePopOut',() => {
  const wrapper = shallow(<ScorePopOut />);

  it('should successfully trigger ScorePopOut', () => {
    expect(wrapper.props().id).to.equal('popper');
  })

  it('should accept a String input into scoreEvent', function() {
    wrapper.setState({ scoreEvent: 'A player scored.' });
    expect(wrapper.state('scoreEvent')).to.have.string('A player scored.');
  })
})

// describe('add', function() {
//   let result = null;
//
//   it('should add two values and return 10', function() {
//     result = add(5,5);
//     assert.equal(result, 10);
//   })
//
//   it('should add two values together and return a number', function() {
//     result = add(10, 30);
//     assert.typeOf(result, 'number');
//   })
//
//   it('should add two values and be above 30', function() {
//     result = add(29,2);
//     assert.isAbove(result, 30);
//   })
// })
//
// describe('beveragesCheck', function() {
//   it('returns if the array has the tea property', function() {
//     let result = beverage();
//     result.should.have.property('tea').with.length(3);
//   })
// })
//
// describe('maybeFirst', function() {
//   it('returns the first element of the array', function() {
//     let result = maybeFirst([3,4,1]);
//     assert.equal(result, 3, 'maybeFirst first index is 3');
//   })
// })
