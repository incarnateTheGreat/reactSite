import React from 'react'
import axios from 'axios'
import { Tab, Tabs } from 'react-bootstrap'
import { connect } from 'react-redux'
import moment from 'moment'
import _ from 'lodash'

//Redux Store
import store from '../store'

import DataCollectorMLB from '../components/GameModals/MLB/DataCollectorMLB'
import LeagueFilter from '../components/GameModals/MLB/LeagueFilter'
import Standings from '../components/GameModals/MLB/Standings'
import LoadGameData from '../components/GameModals/MLB/LoadGameData'
import ScorePopOut from '../components/GameModals/MLB/ScorePopOut'

//Apply react-toastr.
let ReactToastr = require("react-toastr"),
    { ToastContainer } = ReactToastr,
    ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation);


//Connect to Redux Store.
@connect((store) => {
  return {
    gameStatus: store.gameStatus
  }
})

export default class Scores_MLB extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            liveGameSection: null,
            yesterdayGamesSection: null,
            todayGamesSection: null,
            returnTodayGames: null,
            tomorrowGamesSection: null,
            gameDataObjects: null,
            standings: null,
            activeTab: 0 // Takes active tab from props if it is defined there
        };

        // Bind the handleSelect function already here (not in the render function)
        this.handleSelect = this.handleSelect.bind(this);

        this.timeoutOpenLoader = null;
        this.timeoutCloseLoader = null;
    }

    componentDidMount() {
        let self = this;

        this.setGameDataOutput(function(dateObj, p) {
            self.fetchData(dateObj, p);
        });
    }

    handleSelect(selectedTab) {
        // The active tab must be set into the state so that
        // the Tabs component knows about the change and re-renders.
        this.setState({
            activeTab: selectedTab
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

                //If there's only one game to be displayed, then force it into an array in order for it to be read below.
                if(!_.isUndefined(gameData) && gameData instanceof Array === false) {
                  gameData = [gameData];
                }

                //Today's Game Data
                if(objectDay == dateObj.today.day.format('DD')) {
                    _.forEach(gameData, function(game) {
                        if(self.isGameLive(game)) {
                            gameDataObjects.live.push(game);
                        } else {
                            gameDataObjects.today.push(game);
                        }
                    });
                }
                //Tomorrow's Game Data
                else if(objectDay == dateObj.tomorrow.day.format('DD')) {
                    _.forEach(gameData, function(game) {
                        if(self.isGameLive(game)) {
                            gameDataObjects.live.push(game);
                        } else {
                            gameDataObjects.tomorrow.push(game);
                        }
                    });
                }
                //Yesterday's Game Data
                else if(objectDay == dateObj.yesterday.day.format('DD')) {
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
        }, (error) => {
          this.refs.container.error(
            "Connectivity Error",
            error.message, {
              timeOut: 5000,
              extendedTimeOut: 10000
            });
        });
    }

    shouldComponentUpdate(a,b) {
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
      this.loadSpinnerHandler();
    }

    loadSpinnerHandler() {
      let self = this,
          loader = document.getElementsByClassName("loader")[0],
          loaderTimeoutIntervals = {
            'liveGames': [30000, 32000],
            'noLiveGames': [117000, 120000]
          };

      //Control the frequency of refresh intervals depending on whether there are Live Games in progress or not.
      function getTimeoutIntervals() {
        return self.state.liveGameSection.length > 0 ? 'liveGames' : 'noLiveGames';
      }

      //Display Loader.
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

    componentWillUnmount() {
      clearTimeout(this.timeoutOpenLoader);
      clearTimeout(this.timeoutCloseLoader);
    }

    getNumberOfColumns(games) {
        return "completedGamesGroupContainer col-md-" + (Object.keys(games).length > 1 ? "6" : "12");
    }

    //Build out HTML object of Scores.
    renderGameOutput(game, id) {
        return (
            <DataCollectorMLB key={id} gameData={game} />
        )
    }

    testScoreEvent() {
      let score = 'TOP 5: TOR 5 BOS 3',
          scoreEvent = 'Smoak singles to Center. Donaldson scores';

      //Fire off Dispatch.
      store.dispatch({
        type: 'UPDATE_GAME_STATUS',
        payload: {score, scoreEvent}
      })
    }

    render() {
      let self = this;

      return (
          <div>
            <ToastContainer ref="container"
                            toastMessageFactory={ToastMessageFactory}
                            className="toast-top-right" />
            <LoadGameData />
            <ScorePopOut scoreEvent={this.props.gameStatus.name} />
            <Tabs id='MLBScores' activeKey={this.state.activeTab} onSelect={this.handleSelect}>
                <Tab eventKey={0} title='MLB Scores'>
                  <div class="loader"></div>
                  <h2>MLB Scores</h2>
                  <h5>All games in EST</h5>
                  <hr/>
                  <div className="scoreTableContainer">
                      <h2>Live</h2>
                      <div className="gameGroupContainer">
                          <LeagueFilter data={this.state.liveGameSection}></LeagueFilter>
                      </div>
                      <hr />
                      <h2>Today's Games: {moment().format("dddd M/DD")}</h2>
                      <div className="gameGroupContainer">
                          <LeagueFilter data={this.state.todayGamesSection}></LeagueFilter>
                      </div>
                      <hr />
                      <h2>Yesterday's Games: {moment().subtract(1, 'day').format("dddd M/DD")}</h2>
                      <div className="gameGroupContainer">
                          <LeagueFilter data={this.state.yesterdayGamesSection}></LeagueFilter>
                      </div>
                      <hr />
                      <h2>Tomorrow's Games: {moment().add(1, 'day').format("dddd M/DD")}</h2>
                      <div className="gameGroupContainer">
                          <LeagueFilter data={this.state.tomorrowGamesSection}></LeagueFilter>
                      </div>
                  </div>
                </Tab>
                <Tab eventKey={1} title='MLB Standings'>
                  <h2>MLB Standings</h2>
                  <hr/>
                  <Standings />
                </Tab>
            </Tabs>
          </div>
      );
    }
}
