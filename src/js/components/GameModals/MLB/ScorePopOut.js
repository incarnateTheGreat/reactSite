import React from 'react';

//Overlay
export default class ScorePopOut extends React.Component {
  constructor(props) {
    super(props);

    // this.state = {
    //   onBasePlayer: null
    // }
  }

  componentDidMount() {

  }

  render() {
    const game = this.props.scoreData;

    return (
      <div className='scorePopOut'>{game}</div>
    );
  }
}
