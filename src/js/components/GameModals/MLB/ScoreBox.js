import React from "react";
import shallowCompare from 'react-addons-shallow-compare';

export default class ScoreBox extends React.Component {
  constructor(props) {
      super(props);

      this.state = {
          scoreBox: null,
          game: null
      };
  }

  componentWillReceiveProps(nextProps) {
    if(this.state.game.status.ind === 'I' || this.state.game.status.ind === 'MC') {
      this.setState({game: nextProps}, function() {
        console.log("updated. still conduct tests on whether data actually updates on refresh or not.");
      //   let filtered = _.filter(this.state.gameData, function(game) {
      //       let gameObj = game.props.children.props.gameData;
      //
      //       if(!_.isNull(self.state.currentSelection)) {
      //           return gameObj.league === self.state.currentSelection;
      //       } else {
      //           return gameObj;
      //       }
      //   });
      //
      //   this.setState({
      //       filteredGameData: filtered
      //   });
      });
    }

  }

  shouldComponentUpdate(nextProps, nextState) {
    if(this.state.game.status.ind === 'I' || this.state.game.status.ind === 'MC') {
      console.log('shouldComponentUpdate?', shallowCompare(this, nextProps, nextState) ? 'yes' : 'no');
      return shallowCompare(this, nextProps, nextState);
    } else {
      return false;
    }
  }

  componentWillUpdate() {
    console.log("componentWillUpdate");
  }

  render() {
    const game = this.props.gameData;
    this.state.game = game;

    let gameStatus = '',
        outs = '',
        homeScore = '',
        awayScore = '';

    if(game.status.ind === 'P' || game.status.ind === 'PW' || game.status.ind === 'F' || game.status.ind === 'O') {
        //Pre-Game, Final, or 'Game Over'
        gameStatus = (game.status.ind === 'O' ? 'F' : game.status.ind);

        if(game.status.ind === 'O') {
            gameStatus = 'F';
        } else if(game.status.ind === 'P' || game.status.ind === 'PW') {
            gameStatus = game.status.status;
        }

        //Extra Innings
        if(parseInt(game.status.inning) > 9) {
            gameStatus = gameStatus + '/' + game.status.inning;
        }
    } else if(game.status.ind === 'DR' || game.status.ind === 'DI') {
        //Postponed
        gameStatus = "PPD";
    } else if(game.status.ind === 'IR') {
        //Temporary Delay
        gameStatus = game.status.inning_state + ' ' + game.status.inning + ' -- ' + game.status.status + ' (' + game.status.reason +')';
    } else if(game.status.ind === 'I' || game.status.ind === 'MC') {
        //In Progress
        gameStatus = game.status.inning_state.substring(0, 3) + ' ' + game.status.inning;
        outs = game.status.o + ' OUT';
    }

    //Check if Linescore is available.
    if(_.isUndefined(game.linescore)) {
        awayScore = '-';
        homeScore = '-';
        gameStatus = game.status.ind === 'DR' || game.status.ind === 'DI' ? 'PPD' : game.time + ' ' + game.ampm;
    } else {
        awayScore = game.linescore.r.away;
        homeScore = game.linescore.r.home;
    }

    return (
      <div className="scoreTable" onClick={this.openModal}>
        <div className="scores">
            <div className="team">{game.away_name_abbrev}</div>
            <div className="score">{awayScore}</div>
            <br />
            <div className="team">{game.home_name_abbrev}</div>
            <div className="score">{homeScore}</div>
        </div>
        <div className="gameStatusContainer">
            <div className="timeRemaining">{gameStatus}</div>
            <div>{outs}</div>
        </div>
      </div>
    )
  }
}
