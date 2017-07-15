import React, { Component } from 'react'
import classNames from 'classnames'
import _ from 'lodash'

//ScorePopOut SCSS
require('./scss/ScorePopOut.scss')

export default class ScorePopOut extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      display: 'scorePopOut',
      scoreEvent: null
    };
  }

  componentWillReceiveProps(nextProps) {
    if(!_.isUndefined(nextProps.scoreEvent)) {
      let scoreEvent = nextProps.scoreEvent,
          display = classNames({
            'scorePopOut': true,
            'show': nextProps.scoreEvent.length > 0
          });

      this.setState({ display });
      this.setState({ scoreEvent });
    }
  }

  render() {
    return (
      <div className={this.state.display}>{this.state.scoreEvent}</div>
    );
  }
}
