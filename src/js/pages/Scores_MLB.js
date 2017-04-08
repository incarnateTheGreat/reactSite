import React from "react";
import axios from 'axios';

export default class Scores_MLB extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            liveGameSection: null,
            completedGameSection: null,
            futureGameSection: null,
            yesterdayGamesSection: null,
            todayGamesSection: null
        };

        this.timeoutOpenLoader = null;
        this.timeoutCloseLoader = null;
    }

    //Return MLB Scoreboard data.
    loadScoreData(date) {
        var self = this;

        return new Promise(function(resolve, reject) {
            let year = moment().format('YYYY'),
                month = moment().format('MM');

            axios.get('http://mlb.mlb.com/gdcross/components/game/mlb/year_'+ year +'/month_'+ month +'/day_'+ date.day +'/master_scoreboard.json')
                .then(res => resolve(res.data))
                .catch(err => {
                    setTimeout(function(){
                        console.log(err, 'Trying again');
                        self.buildScoreboard();
                    }, 3000);
                });
        });
    }

    buildScoreboard(gameData) {
      console.log("Data Updated.");

      // Filter different dates.
      let yesterdayGamesSection = [],
          todayGamesSection = [],
          self = this;

          gameData = gameData.data.games;

          //Today's Games
          if(moment().format('DD') == gameData.day) {
            _.forEach(gameData.game, function(game, id) {
                todayGamesSection.push(<div key={id}>
                    {self.renderGameOutput(game)}
                </div>);
            });

            this.setState({todayGamesSection});
          } else {
            //Yesterday's Games
            _.forEach(gameData.game, function(game, id) {
                yesterdayGamesSection.push(<div key={id}>
                    {self.renderGameOutput(game)}
                </div>);
            });

            this.setState({yesterdayGamesSection});
          }
    }

    componentWillMount() {
      const self = this,
            dateObj = {
              yesterday: {
                day: moment().subtract(1, 'day').format('DD')
              },
              today: {
                day: moment().format('DD')
              }
            };

      _.forEach(dateObj, function(date) {
        let p = self.loadScoreData(date);

        p.then((gameData) => {
          self.buildScoreboard(gameData);
        });
      });
    }

    getNumberOfColumns(games) {
        return "completedGamesGroupContainer col-md-" + (Object.keys(games).length > 1 ? "6" : "12");
    }

    //Build out HTML object of Scores.
    renderGameOutput(game) {
        let gameStatus = '',
            homeScore = '',
            awayScore = '';

        if (game.length == 0) {
            return (<h4 key="{game.length}">No games listed.</h4>);
        } else {
            if(game.status.ind === 'P' || game.status.ind === 'F') {
                //Pre-Game or Final
                gameStatus = game.status.status;

                //Extra Innings
                if(parseInt(game.status.inning) > 9) {
                  gameStatus = gameStatus + '/' + game.status.inning;
                }
            } else if(game.status.ind === 'DR') {
                //Postponed
                gameStatus = "PPD";
            } else if(game.status.ind === 'IR') {
                //Temporary Delay
                gameStatus = game.status.inning_state + ' ' + game.status.inning + ' -- ' + game.status.status + ' (' + game.status.reason +')';
            } else if(game.status.ind === 'I') {
                //In Progress
                gameStatus = game.status.inning_state + ' ' + game.status.inning;
            }

            //Check if Linescore is available.
            if(_.isUndefined(game.linescore) || game.status.ind === 'DR') {
              awayScore = '-';
              homeScore = '-';
              gameStatus = game.time + ' ' + game.ampm;
            } else {
              awayScore = game.linescore.r.away;
              homeScore = game.linescore.r.home;
            }

            return (
                <div className="scoreTable">
                    <div className="scores">
                        <div className="team">{game.away_name_abbrev}</div>
                      <div className="score">{awayScore}</div>
                        <br />
                        <div className="team">{game.home_name_abbrev}</div>
                      <div className="score">{homeScore}</div>
                    </div>
                    <div className="timeRemaining">{gameStatus}</div>
                </div>
            )
        }
    }

    render() {
        return (
            <div>
                <div class="loader"></div>
                <h1>Scores</h1>
                <h5>All games in EST</h5>
                <hr/>
                <h2>MLB Scores</h2>
                <div className="scoreTableContainer">
                    <h2>Today's Games</h2>
                    <div className="gameGroupContainer">
                        {this.state.todayGamesSection}
                    </div>
                    <hr />
                    <h2>Yesterday's Games</h2>
                    <div className="gameGroupContainer">
                        {this.state.yesterdayGamesSection}
                    </div>
                </div>
            </div>
        );
    }
}
