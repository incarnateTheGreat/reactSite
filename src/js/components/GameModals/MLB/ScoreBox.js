import React from "react";
import shallowCompare from 'react-addons-shallow-compare';

export default class ScoreBox extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            scoreBox: null,
            game: null
        };

        this.state.game = this.props.gameData;
    }

    componentWillReceiveProps(nextProps) {
        // console.log("Will Rec.");
        // // console.log(_.isUndefined(this.state.game.status));
        if(!_.isUndefined(this.state.game.status)) {
            if(this.state.game.status.ind === 'I' || this.state.game.status.ind === 'MC') {
                // console.log(this.props.gameData.status, this.state.game.status);
                //         this.setState({game: nextProps}, function() {
                //             // console.log("updated. still conduct tests on whether data actually updates on refresh or not.");
                //             //   let filtered = _.filter(this.state.gameData, function(game) {
                //             //       let gameObj = game.props.children.props.gameData;
                //             //
                //             //       if(!_.isNull(self.state.currentSelection)) {
                //             //           return gameObj.league === self.state.currentSelection;
                //             //       } else {
                //             //           return gameObj;
                //             //       }
                //             //   });
                //             //
                //             //   this.setState({
                //             //       filteredGameData: filtered
                //             //   });
                //         });
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isUndefined(this.state.game.status)) {
            if (this.state.game.status.ind === 'I' || this.state.game.status.ind === 'MC') {
                // console.log(this.state.game.away_name_abbrev, 'and', this.state.game.home_name_abbrev);
                // console.log(nextProps.gameData.status);
                // console.log(nextState.game.status);
                // console.log(this.props.gameData.status, this.state.game.status);
                // console.log(nextState.game.gameData.status);
                //
                // // console.log("Next Props Outs:", nextProps.gameData.status.o);
                // // console.log("Next State Outs:", nextState.game.gameData.status.o);
                //
                // console.log(nextProps.gameData.status.o, nextState.game.gameData.status.o);
                //
                // if(nextProps.gameData.status.o != nextState.game.gameData.status.o) {
                //     console.log("Change of outs from ", nextProps.gameData.status.o, "to", nextState.game.gameData.status.o);
                // }

                // console.log('shouldComponentUpdate?', shallowCompare(this, nextProps.gameData.status.o, nextState.game.gameData.status.o) ? 'yes' : 'no');
                // return shallowCompare(this, nextProps.gameData.status.o, nextState.game.gameData.status.o);

                return false;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    componentWillUpdate() {
        console.log("componentWillUpdate");
    }

    render() {
        let gameStatus = '',
            outs = '',
            homeScore = '',
            awayScore = '';

        if(this.state.game.status.ind === 'P' || this.state.game.status.ind === 'PW' || this.state.game.status.ind === 'F' || this.state.game.status.ind === 'O') {
            //Pre-Game, Final, or 'Game Over'
            gameStatus = (this.state.game.status.ind === 'O' ? 'F' : this.state.game.status.ind);

            if(this.state.game.status.ind === 'O') {
                gameStatus = 'F';
            } else if(this.state.game.status.ind === 'P' || this.state.game.status.ind === 'PW') {
                gameStatus = this.state.game.status.status;
            }

            //Extra Innings
            if(parseInt(this.state.game.status.inning) > 9) {
                gameStatus = gameStatus + '/' + this.state.game.status.inning;
            }
        } else if(this.state.game.status.ind === 'DR' || this.state.game.status.ind === 'DI') {
            //Postponed
            gameStatus = "PPD";
        } else if(this.state.game.status.ind === 'IR') {
            //Temporary Delay
            gameStatus = this.state.game.status.inning_state + ' ' + this.state.game.status.inning + ' -- ' + this.state.game.status.status + ' (' + this.state.game.status.reason +')';
        } else if(this.state.game.status.ind === 'I' || this.state.game.status.ind === 'MC') {
            //In Progress
            gameStatus = this.state.game.status.inning_state.substring(0, 3) + ' ' + this.state.game.status.inning;
            outs = this.state.game.status.o + ' OUT';
        }

        //Check if Linescore is available.
        if(_.isUndefined(this.state.game.linescore)) {
            awayScore = '-';
            homeScore = '-';
            gameStatus = this.state.game.status.ind === 'DR' || this.state.game.status.ind === 'DI' ? 'PPD' : this.state.game.time + ' ' + this.state.game.ampm;
        } else {
            awayScore = this.state.game.linescore.r.away;
            homeScore = this.state.game.linescore.r.home;
        }

        return (
            <div className="scoreTable">
                <div className="scores">
                    <div className="team">{this.state.game.away_name_abbrev}</div>
                    <div className="score">{awayScore}</div>
                    <br />
                    <div className="team">{this.state.game.home_name_abbrev}</div>
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
