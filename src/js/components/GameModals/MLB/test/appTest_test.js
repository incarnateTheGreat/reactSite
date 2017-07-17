import React from 'react'
import { mount, shallow } from 'enzyme'
import {assert} from 'chai'
import {should} from 'chai'
import {expect} from 'chai'
import sinon from 'sinon'
import { JSDOM } from 'jsdom'

//Call test objects.
import ScorePopOut from '../ScorePopOut'
import LeagueFilter from '../LeagueFilter'
import AppTest from './appTest'

//Results from AppTest
const add = AppTest.addFunc,
      beverage = AppTest.beveragesCheck,
      maybeFirst = AppTest.maybeFirst,
      jsdom = new JSDOM('<!doctype html><html><body></body></html>'),
      { window } = jsdom;

global.window = window;
global.document = window.document;

let result = null;

//MLB Tests
describe('ScorePopOut',() => {
  const wrapper = shallow(<ScorePopOut />);

  it('should accept a String input into scoreEvent', () => {
    wrapper.setState({ scoreEvent: 'A player scored.' });
    expect(wrapper.state('scoreEvent')).to.have.string('A player scored.');
  })
})

describe('LeagueFilter', () => {
  const wrapper = shallow(<LeagueFilter />);

  it('will have 5 .leagueSelector classes', () => {
    expect(wrapper.find('.leagueSelector')).to.have.length(5);
  })

  it('test click event', () => {
    const onButtonClick = sinon.spy(),
          clickWrapper = mount((
      <LeagueFilter onButtonClick={clickWrapper} />
    ));

    clickWrapper.find('input[value="AA"]').simulate('click');
    expect(onButtonClick).to.have.property('name');
  })
})

//Regular test functions.
describe('add', () => {
  it('should add two values and return 10', () => {
    result = add(5,5);
    assert.equal(result, 10);
  })

  it('should add two values together and return a number', () => {
    result = add(10, 30);
    assert.typeOf(result, 'number');
  })

  it('should add two values and be above 30', () => {
    result = add(29,2);
    assert.isAbove(result, 30);
  })
})

describe('beveragesCheck', () => {
  it('returns the array that has the tea property', () => {
    result = beverage();
    expect(result).to.have.property('tea')
  })
})

describe('maybeFirst', () => {
  it('returns the first element of the array', () => {
    result = maybeFirst([3,4,1]);
    assert.equal(result, 3, 'maybeFirst first index is 3');
  })
})
