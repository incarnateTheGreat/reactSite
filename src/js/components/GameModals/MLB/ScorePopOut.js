import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

//Overlay
export default class ScorePopOut extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }

  render() {
    const scoreData = this.props.scoreData;

    console.log("Inside ScorePopOut: ", scoreData);

    return (
      <div className='scorePopOut'>{scoreData}</div>
    );
  }
}
