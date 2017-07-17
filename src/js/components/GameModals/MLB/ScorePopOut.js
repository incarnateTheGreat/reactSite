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
      scoreEventObj: null
    };
  }

  componentWillReceiveProps(nextProps) {
    if(!_.isUndefined(nextProps.scoreEvent)) {
      let scoreEventObj = nextProps.scoreEvent,
          scorePopOutElem = document.getElementsByClassName('scorePopOut')[0].classList,
          display = classNames({
            'scorePopOut': true,
            'show': scoreEventObj.scoreEvent.length > 0
          });

      //Set the Score Event to state, then display the ScorePopOut.
      this.setState({ scoreEventObj });
      this.setState({ display }, function() {
        setTimeout(() => {
          display = classNames({
            'scorePopOut': true,
            'show': false
          });

          //Hide the ScorePopOut component.
          this.setState({ display })
        }, 5000)
      });
    }
  }

  render() {
    return (
      <div className={this.state.display}>
        {!_.isNull(this.state.scoreEventObj) ? (
          <div>
            <div className='scoreTitle'>{this.state.scoreEventObj.score}</div>
            <div>{this.state.scoreEventObj.scoreEvent}</div>
          </div>
        ) : ''}
      </div>
    );
  }
}
