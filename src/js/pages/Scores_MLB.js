import React from "react";
import axios from 'axios';

export default class Scores_MLB extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            liveGameSection: null,
            yesterdayGamesSection: null,
            todayGamesSection: null,
            tomorrowGamesSection: null,
        };

        this.gameDataObjects = {
          yesterday: [],
          today: [],
          tomorrow: [],
          live: []
        }

        this.timeoutOpenLoader = null;
        this.timeoutCloseLoader = null;
    }

    componentWillMount() {
      this.setGameDataOutput();
    }

    setGameDataOutput() {
      const self = this,
            dateObj = {
              yesterday: {
                day: moment().subtract(1, 'day').format('DD')
              },
              today: {
                day: moment().format('DD')
              },
              tomorrow: {
                day: moment().add(1, 'day').format('DD')
              }
            };

      //Loop through Live, Today, and Yesterday's games.
      let p = [],
          year = moment().format('YYYY'),
          month = moment().format('MM'),
          url = '';

      //Use Axios to get Score Data.
      _.forEach(dateObj, function(date) {
        url = 'http://mlb.mlb.com/gdcross/components/game/mlb/year_'+ year +'/month_'+ month +'/day_'+ date.day +'/master_scoreboard.json';
        p.push(axios.get(url));
      });

      axios.all(p).then((datesWithGames) => {
        _.forEach((datesWithGames), (dayData) => {
            let gameData = dayData.data.data.games.game,
                objectDay = dayData.data.data.games.day;

            if(objectDay == dateObj.today.day) {
              //Today's Game Data
              _.forEach(gameData, function(game) {
                if(self.isGameLive(game)) {
                  self.gameDataObjects.live.push(game);
                } else {
                  self.gameDataObjects.today.push(game);
                }
              });
            } else if(objectDay == dateObj.tomorrow.day) {
              //Tomorrow's Game Data
              _.forEach(gameData, function(game) {
                if(self.isGameLive(game)) {
                  self.gameDataObjects.live.push(game);
                } else {
                  self.gameDataObjects.tomorrow.push(game);
                }
              });
            } else if(objectDay == dateObj.yesterday.day) {
              //Yesterday's Game Data
              _.forEach(gameData, function(game) {
                if(self.isGameLive(game)) {
                  self.gameDataObjects.live.push(game);
                } else {
                  self.gameDataObjects.yesterday.push(game);
                }
              });
            }
        });

        //After all Promises have completed, build out the Scoreboards.
        setTimeout(() => {
          _.forEach(this.gameDataObjects, function(game, id) {
            self.buildScoreboard(game, id);
          });
        }, 350);
      });
    }

    isGameLive(game) {
      return game.status.ind === 'I' || game.status.ind === 'IR';
    }

    buildScoreboard(gameData, id) {
      // Filter different dates.
      let yesterdayGamesSection = [],
          todayGamesSection = [],
          liveGameSection = [],
          tomorrowGamesSection = [],
          self = this;

          _.forEach(gameData, function(game, gameID) {
            if(id === 'today') {
              //Today's Games
              todayGamesSection.push(<div key={gameID}>
                  {self.renderGameOutput(game)}
              </div>);

              self.setState({todayGamesSection});
            } else if(id === 'yesterday'){
              //Yesterday's Games
              yesterdayGamesSection.push(<div key={gameID}>
                  {self.renderGameOutput(game)}
              </div>);

              self.setState({yesterdayGamesSection});
            } else if(id === 'tomorrow'){
              //Tomorrow's Games
              tomorrowGamesSection.push(<div key={gameID}>
                  {self.renderGameOutput(game)}
              </div>);

              self.setState({tomorrowGamesSection});
            } else if(id === 'live') {
              //Live Games
              liveGameSection.push(<div key={gameID}>
                {self.renderGameOutput(game)}
              </div>);

              self.setState({liveGameSection});
            }
          });

      console.log("Data Updated:", id);

      this.refreshScoreboard();
    }

    refreshScoreboard() {
      let self = this;

      const loaderTimeoutIntervals = {
        'liveGames': [5000, 8000],
        'noLiveGames': [117000, 120000]
      };

      // //Control the frequency of refresh intervals depending on whether there are Live Games in progress or not.
      // function getTimeoutIntervals() {
      //   return self.gameDataObjects.live.length > 0 ? 'liveGames' : 'noLiveGames';
      // }
      //
      // //Display Loader.
      // let loader = document.getElementsByClassName("loader")[0];
      // this.timeoutOpenLoader = setTimeout(() => {
      //     loader.style.opacity = "1";
      //     loader.style.zIndex = "1";
      // }, loaderTimeoutIntervals[getTimeoutIntervals()][0]);
      //
      // //Refresh the Scoreboard Data at every interval, then hide Loader.
      // this.timeoutCloseLoader = setTimeout(() => {
      //     loader.style.opacity = "0";
      //     loader.style.zIndex = "-1";
      //   this.setGameDataOutput();
      // }, loaderTimeoutIntervals[getTimeoutIntervals()][1]);
    }

    getNumberOfColumns(games) {
        return "completedGamesGroupContainer col-md-" + (Object.keys(games).length > 1 ? "6" : "12");
    }

    //Build out HTML object of Scores.
    renderGameOutput(game) {
        let gameStatus = '',
            outs = '',
            homeScore = '',
            awayScore = '';

        if(game.status.ind === 'P' || game.status.ind === 'F' || game.status.ind === 'O') {
            //Pre-Game, Final, or 'Game Over'
            gameStatus = (game.status.ind === 'O' ? 'F' : game.status.ind);

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
            gameStatus = game.status.inning_state.substring(0, 3) + ' ' + game.status.inning;
            outs = game.status.o + ' OUT';
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
                <div className="gameStatusContainer">
                  <div className="timeRemaining">{gameStatus}</div>
                  <div>{outs}</div>
                </div>
            </div>
        )
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
                    <h2>Live</h2>
                    <div className="gameGroupContainer">
                      {!this.state.liveGameSection ? (
                        <h4>There are currently no Live Games.</h4>
                      ) : (
                        this.state.liveGameSection
                      )}
                    </div>
                    <hr />
                    <h2>Today's Games: {moment().format("dddd M/DD")}</h2>
                    <div className="gameGroupContainer">
                        {!this.state.todayGamesSection ? (
                          <h4>There are no Games today.</h4>
                        ) : (
                          this.state.todayGamesSection
                        )}
                    </div>
                    <hr />
                    <h2>Yesterday's Games: {moment().subtract(1, 'day').format("dddd M/DD")}</h2>
                    <div className="gameGroupContainer">
                        {!this.state.yesterdayGamesSection ? (
                          <h4>There were no Games yesterday..</h4>
                        ) : (
                          this.state.yesterdayGamesSection
                        )}
                    </div>
                    <hr />
                    <h2>Tomorrow's Games: {moment().add(1, 'day').format("dddd M/DD")}</h2>
                    <div className="gameGroupContainer">
                        {!this.state.tomorrowGamesSection ? (
                          <h4>There will be no Games tomorrow.</h4>
                        ) : (
                          this.state.tomorrowGamesSection
                        )}
                    </div>
                </div>
            </div>
        );
    }
}
