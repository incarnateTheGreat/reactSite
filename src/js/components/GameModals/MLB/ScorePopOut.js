import React, { Component } from 'react';
import classNames from 'classnames';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

export default class ScorePopOut extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      display: 'scorePopOut'
    };
  }

  componentWillReceiveProps(things) {
    if(!_.isUndefined(things.scoreEvent)) {
      let display = classNames({
        'scorePopOut': true,
        'show': things.scoreEvent.length > 0
      });

      this.setState({ display });
    }
  }
  // shouldComponentUpdate() {
  //   console.log("shouldComponentUpdate");
  // }

  render() {
    let scoreEvent = this.props.scoreEvent;

    return (
      <div className={this.state.display}>{scoreEvent}</div>
    );
  }
}
