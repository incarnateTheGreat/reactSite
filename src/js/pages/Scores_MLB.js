import React from "react";
import axios from 'axios';
import shallowCompare from 'react-addons-shallow-compare';

import GameModalMLB from "../components/GameModals/MLB/GameModal";

export default class Scores_MLB extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            liveGameSection: null,
            yesterdayGamesSection: null,
            todayGamesSection: null,
            returnTodayGames: null,
            tomorrowGamesSection: null,
            gameDataObjects: null
        };

        this.timeoutOpenLoader = null;
        this.timeoutCloseLoader = null;
    }

    componentDidMount() {
        let self = this;

        this.setGameDataOutput(function(dateObj, p) {
            self.fetchData(dateObj, p);
        });
    }

    fetchData(dateObj, p) {
        let self = this;

        axios.all(p).then((datesWithGames) => {
            let gameDataObjects = {
                yesterday: [],
                today: [],
                tomorrow: [],
                live: []
            };

            _.forEach((datesWithGames), (dayData) => {
                let gameData = dayData.data.data.games.game,
                    objectDay = dayData.data.data.games.day;

                if(objectDay == dateObj.today.day.format('DD')) {
                    //Today's Game Data
                    _.forEach(gameData, function(game) {
                        if(self.isGameLive(game)) {
                            gameDataObjects.live.push(game);
                        } else {
                            gameDataObjects.today.push(game);
                        }
                    });
                } else if(objectDay == dateObj.tomorrow.day.format('DD')) {
                    //Tomorrow's Game Data
                    _.forEach(gameData, function(game) {
                        if(self.isGameLive(game)) {
                            gameDataObjects.live.push(game);
                        } else {
                            gameDataObjects.tomorrow.push(game);
                        }
                    });
                } else if(objectDay == dateObj.yesterday.day.format('DD')) {
                    //Yesterday's Game Data
                    _.forEach(gameData, function(game) {
                        if(self.isGameLive(game)) {
                            gameDataObjects.live.push(game);
                        } else {
                            gameDataObjects.yesterday.push(game);
                        }
                    });
                }
            });

            self.setState({gameDataObjects: gameDataObjects});

            //After all Promises have completed, build out the Scoreboards.
            self.buildScoreboard(gameDataObjects);
        });
    }

    shouldComponentUpdate(a,b) {
        // console.log(a, b);
        return true;
    }

    setGameDataOutput(callback) {
        const dateObj = {
            yesterday: {
                day: moment().subtract(1, 'day')
            },
            today: {
                day: moment()
            },
            tomorrow: {
                day: moment().add(1, 'day')
            }
        };

        //Loop through Live, Today, and Yesterday's games.
        let p = [],
            year = '',
            month = '',
            day = '',
            url = '';

        //Use Axios to get Score Data.
        _.forEach(dateObj, function (date) {
            year = date.day.format('YYYY'),
                month = date.day.format('MM'),
                day = date.day.format('DD');

            url = 'http://mlb.mlb.com/gdcross/components/game/mlb/year_' + year + '/month_' + month + '/day_' + day + '/master_scoreboard.json';
            p.push(axios.get(url));
        });

        //Return parameters for Axios call.
        _.isUndefined(callback) ? this.fetchData(dateObj, p) : callback(dateObj, p);
    }

    isGameLive(game) {
      return game.status.ind === 'I' || game.status.ind === 'IR';
    }

    buildScoreboard(gameData) {
      // Filter different dates.
      let yesterdayGamesSection = [],
          todayGamesSection = [],
          liveGameSection = [],
          tomorrowGamesSection = [],
          self = this;

          _.forEach(gameData, function(game, gameID) {
            _.forEach(game, function(o, i) {
              if(gameID === 'today') {
                //Today's Games
                todayGamesSection.push(<div key={i}>
                    {self.renderGameOutput(o, gameID)}
                </div>);
              } else if(gameID === 'yesterday'){
                //Yesterday's Games
                yesterdayGamesSection.push(<div key={i}>
                    {self.renderGameOutput(o, gameID)}
                </div>);
              } else if(gameID === 'tomorrow'){
                //Tomorrow's Games
                tomorrowGamesSection.push(<div key={i}>
                    {self.renderGameOutput(o, gameID)}
                </div>);
              } else if(gameID === 'live') {
                //Live Games
                liveGameSection.push(<div key={i}>
                  {self.renderGameOutput(o, gameID)}
                </div>);
              }
            });
          });

          self.setState({
            liveGameSection: liveGameSection,
            yesterdayGamesSection: yesterdayGamesSection,
            todayGamesSection: todayGamesSection,
            tomorrowGamesSection: tomorrowGamesSection
          });

      this.refreshScoreboard();
    }

    refreshScoreboard() {
      let self = this;

      const loaderTimeoutIntervals = {
        'liveGames': [27000, 30000],
        'noLiveGames': [117000, 120000]
      };

      //Control the frequency of refresh intervals depending on whether there are Live Games in progress or not.
      function getTimeoutIntervals() {
        return self.state.liveGameSection.length > 0 ? 'liveGames' : 'noLiveGames';
      }

      //Display Loader.
      let loader = document.getElementsByClassName("loader")[0];
      this.timeoutOpenLoader = setTimeout(() => {
          loader.style.opacity = "1";
          loader.style.zIndex = "1";
      }, loaderTimeoutIntervals[getTimeoutIntervals()][0]);

      //Refresh the Scoreboard Data at every interval, then hide Loader.
      this.timeoutCloseLoader = setTimeout(() => {
          loader.style.opacity = "0";
          loader.style.zIndex = "-1";
          this.setGameDataOutput();
      }, loaderTimeoutIntervals[getTimeoutIntervals()][1]);
    }

    getNumberOfColumns(games) {
        return "completedGamesGroupContainer col-md-" + (Object.keys(games).length > 1 ? "6" : "12");
    }

    //Build out HTML object of Scores.
    renderGameOutput(game, id) {
        return (
            <GameModalMLB key={id} gameData={game} />
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
                    <h2>Filters</h2>
                    <h2>Live</h2>
                    <div className="gameGroupContainer">
                        <FilterSrvc data={this.state.liveGameSection}></FilterSrvc>
                      {
                          // !this.state.liveGameSection ? (
                      //   <h4>There are currently no Live Games.</h4>
                      // ) : (
                      //   this.state.liveGameSection
                      // )
                      }
                    </div>
                    <hr />
                    <h2>Today's Games: {moment().format("dddd M/DD")}</h2>
                    <div className="gameGroupContainer">
                        <FilterSrvc data={this.state.todayGamesSection}></FilterSrvc>
                        {
                        //     !this.state.todayGamesSection ? (
                        //   <h4>There are no Games today.</h4>
                        // ) : (
                        //   this.state.todayGamesSection
                        // )
                        }
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

class FilterSrvc extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            filterText: '',
            filteredGameData: []
        };
    }

    updateSearch(e) {
        let filtered = _.filter(this.gameData, function(game) {
            let gameObj = game.props.children.props.gameData;
            return (gameObj.league === e.target.value.toUpperCase() && e.target.value.length == 2) || (e.target.value.length == 0);
        });

        this.setState({
            filterText: e.target.value,
            filteredGameData: filtered
        });
    }

    componentWillReceiveProps(nextProps) {
        if(!_.isNull(nextProps.data)) {
            this.gameData = nextProps.data;

            let filtered = _.filter(this.gameData, function(game) {
                return game.props.children.props.gameData;
            });

            this.setState({
                filteredGameData: filtered
            });
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
    }

    render() {
        this.gameData = this.props.data;

        return (
            <form>
                <input type='text'
                       placeholder='Filter the League'
                       onChange={this.updateSearch.bind(this)}
                       value={this.state.filterText} />

                <div className="gameGroupContainer">
                    {!this.state.filteredGameData ? (
                        <h4>There are no games to display.</h4>
                    ) : ( this.state.filteredGameData )}
                </div>
            </form>
        );
    }
}
