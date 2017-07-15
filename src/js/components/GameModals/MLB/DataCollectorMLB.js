import React from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import classNames from 'classnames';
import {Tab, Tabs} from "react-bootstrap";
import { connect } from 'react-redux'
import _ from 'lodash'

//Redux Store
import store from '../../../store';

import BaseRunnerOverlay from './BaseRunnerOverlay';

//DataCollector MLB SCSS
require('./scss/DataCollectorMLB.scss')

//Connect to Redux Store.
@connect((store) => {
  return {
    gameStatus: store.gameStatus
  }
})

export default class DataCollectorMLB extends React.Component {
    constructor() {
        super();

        this.state = {
            modalIsOpen: false,
            gameContentBody: null,
            boxScoreBody_awayTeam: null,
            boxScoreBody_awayTeamName: null,
            boxScoreBody_homeTeamName: null,
            boxScoreBody_homeTeam: null,
            hasChanged: false,
            game: null,
            slideOutActive: false,
            activeTab: 0 // Takes active tab from props if it is defined there,
        };

        // Bind the handleSelect function already here (not in the render function)
        this.handleSelect = this.handleSelect.bind(this);
        this.collectData = this.collectData.bind(this);
        this.loader = document.getElementsByClassName("loader")[0];
    }

    collectData(callback) {
      let self = this;

      this.getBoxscoreData(this.state.game, this.state.game.game_data_directory, function() {
        callback();
      });
    }

    showLoadingSpinner() {
      this.loader.style.opacity = "1";
      this.loader.style.zIndex = "201";
    }

    hideLoadingSpinner() {
      this.loader.style.opacity = "0";
      this.loader.style.zIndex = "-1";
    }

    handleSelect(selectedTab) {
        // The active tab must be set into the state so that the Tabs component knows about the change and re-renders.
        this.setState({
            activeTab: selectedTab
        });
    }

    loadingSpinner() {
      const loaderTimeoutIntervals = {
        'liveGames': [27000, 30000],
        'noLiveGames': [117000, 120000]
      };

      //Control the frequency of refresh intervals depending on whether there are Live Games in progress or not.
      function getTimeoutIntervals() {
        return liveGames.length > 0 ? 'liveGames' : 'noLiveGames';
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
        this.buildScoreboard();
      }, loaderTimeoutIntervals[getTimeoutIntervals()][1]);
    }

    getBoxscoreData(selectedGameData, game_data_directory, callback) {
        let self = this,
            urls = [],
            data = null,
            rawBoxScore = null,
            boxscoreData = null,
            gameDataObj = [],
            players = [],
            gameContentBody = [],
            boxScoreBody_awayTeam = [],
            boxScoreBody_homeTeam = [],
            activePlayerData = [],
            pitcherData = [],
            batterData = [];

            //Display Postponed game.
            function displayPPDGameData() {
                //Apply Team Names.
                gameDataObj.push(<div className='headlineContainer boxScore' key={Math.random()}>
                    <div>
                        <div className='teamNames'>{selectedGameData.away_team_name} vs. {selectedGameData.home_team_name}</div>
                        <div>{selectedGameData.venue}, {selectedGameData.location}</div>
                    </div>
                </div>);

                activePlayerData.push(<div className='activePlayerData' key={Math.random()}>
                    <div className='bases'>
                        <div className='winnerLoser'>
                            <div className='startTime'><strong>{selectedGameData.status.status}</strong>: {selectedGameData.status.reason}</div>
                        </div>
                    </div>
                </div>);

                //Combine all content
                gameContentBody.push(<div key={Math.random()}>
                    <div className='boxScoreContainer'>{gameDataObj}</div>
                    <div className='activePlayerDataContainer shortHeight'>{activePlayerData}</div>
                </div>);

                self.setState({gameContentBody}, function() {
                  //Fire off Dispatch.
                  store.dispatch({
                    type: 'LOAD_GAME_DATA',
                    payload: self.state.gameContentBody
                  });
                });
            }

            // Display Pregame data
            function displayPregameData() {
              // Get Preview data.
              urls[0] = axios.get('http://www.mlb.com/gdcross' + game_data_directory + '/linescore.json');

              axios.all(urls).then((gameData) => {
                //Linescore
                data = gameData[0].data.data.game;

                let awayTeamName = data.away_team_name,
                    homeTeamName = data.home_team_name,
                    awayTeam = data.away_name_abbrev,
                    homeTeam = data.home_name_abbrev,
                    doubleHeader = (data.double_header_sw !== 'N' ? '(Game ' + data.game_nbr + ' of Double Header)' : '');

                //Apply Team Names.
                gameDataObj.push(<div className='headlineContainer boxScore' key={Math.random()}>
                    <div>
                        <div className='teamNames' data-tooltop="">{awayTeamName} vs. {homeTeamName} {doubleHeader}</div>
                        <div className='startTime'><strong>{data.time_hm_lg}{data.ampm}</strong></div>
                    </div>
                </div>);

                activePlayerData.push(<div className='activePlayerData' key={Math.random()}>
                    <div className='bases'>
                        <div className='winnerLoser'>
                            <div><strong>Probables:</strong></div>
                            <table>
                              <tbody>
                                  <tr className='pitcherData'>
                                      <td><strong>{awayTeam}:</strong> {data.away_probable_pitcher.first} {data.away_probable_pitcher.last} ({data.away_probable_pitcher.wins}-{data.away_probable_pitcher.losses})</td>
                                      <td><strong>ERA:</strong> {data.away_probable_pitcher.era}</td>
                                  </tr>
                                  <tr className='pitcherData'>
                                      <td><strong>{homeTeam}:</strong> {data.home_probable_pitcher.first} {data.home_probable_pitcher.last} ({data.home_probable_pitcher.wins}-{data.home_probable_pitcher.losses})</td>
                                      <td><strong>ERA:</strong> {data.home_probable_pitcher.era}</td>
                                  </tr>
                                  <tr>
                                      <td><strong>Venue:</strong> {data.venue}, {data.location}</td>
                                  </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>);

                //Combine all content
                gameContentBody.push(<div key={Math.random()}>
                    <div>{gameDataObj}</div>
                    <div className='activePlayerDataContainer shortHeight'>{activePlayerData}</div>
                </div>);

                self.setState({gameContentBody}, function() {
                  //Fire off Dispatch.
                  store.dispatch({
                    type: 'LOAD_GAME_DATA',
                    payload: self.state.gameContentBody
                  });
                });
              });
            }

            //If Postponed or Pregame, run either of the first two conditions.
            //Otherwise, show In Progress or Completed game data.
            if(selectedGameData.status.ind === 'DR' || selectedGameData.status.ind === 'DI') {
              displayPPDGameData();
            } else if(selectedGameData.status.ind === 'S' || selectedGameData.status.ind === 'P') {
              displayPregameData();
            } else {
              urls[0] = axios.get('http://www.mlb.com/gdcross' + game_data_directory + '/linescore.json'),
              urls[1] = axios.get('http://www.mlb.com/gdcross' + game_data_directory + '/rawboxscore.xml'),
              urls[2] = axios.get('http://www.mlb.com/gdcross' + game_data_directory + '/players.xml'),
              urls[3] = axios.get('http://www.mlb.com/gdcross' + game_data_directory + '/boxscore.json');

              //Test call JSON Linescore from match when clicking on specific Game
              axios.all(urls).then((gameData) => {
                  let parseString = require('xml2js').parseString;

                  //Linescore
                  data = gameData[0].data.data.game;

                  //Raw Box Score
                  let boxScore_XML = gameData[1].data;
                  parseString(boxScore_XML, function (err, result) {
                      rawBoxScore = result.boxscore;
                  });

                  //Players;
                  let players_XML = gameData[2].data;
                  parseString(players_XML, function (err, result) {
                      players = [result.game.team[0].player, result.game.team[1].player];
                  });

                  //Boxscore
                  boxscoreData = gameData[3].data.data;

                  let awayTeam = data.away_name_abbrev,
                      homeTeam = data.home_name_abbrev,
                      awayRuns = data.away_team_runs,
                      homeRuns = data.home_team_runs,
                      awayHits = data.away_team_hits,
                      homeHits = data.home_team_hits,
                      awayErrors = data.away_team_errors,
                      homeErrors = data.home_team_errors;

                  dispayGameData();

                  function dispayGameData() {
                      let gameStatus = '';

                      if(parseInt(data.inning) > 9) {
                          gameStatus = 'Final' + '/' + data.inning;
                      } else {
                          gameStatus = 'Final';
                      }

                      gameDataObj.push(<div className='topBar' key={Math.random()}>
                          <div className='inningState'>{data.status === 'Final' || data.status === 'Game Over' ? (
                              gameStatus ) : ( data.inning_state + ' ' + data.inning)}</div>
                          <div className='scoreBar'><span>{data.away_team_name}</span> <span>{data.away_team_runs}</span></div>
                          <div className='scoreBar'><span>{data.home_team_name}</span> <span>{data.home_team_runs}</span></div>
                      </div>);

                      //Apply Team Names.
                      gameDataObj.push(<div className='boxScore' key={Math.random()}>
                          <div className='inningContainer'>
                              <div>&nbsp;</div>
                              <div className='teamName'>{awayTeam}</div>
                              <div className='teamName'>{homeTeam}</div>
                          </div>
                      </div>);

                      let currentInning = 0,
                          topInning = '',
                          bottomInning = '',
                          homeInningScore = 0,
                          awayInningScore = 0,
                          inningData = [];

                      //Check what inning the game is in, and if it is live or not.
                      function getInningScore(dataObj, inning) {
                          if (currentInning === parseInt(dataObj.inning) && (dataObj.ind === 'I')) {
                              if (dataObj.top_inning === 'Y') {
                                  topInning = ' currentInning';
                              } else {
                                  bottomInning = ' currentInning';
                              }
                          }

                          function getHomeInningScore() {
                              if (!inning.home_inning_runs && data.status === 'Final') {
                                  return 'X';
                              } else if (inning.home_inning_runs == '') {
                                  return '';
                              } else {
                                  return inning.home_inning_runs;
                              }
                          }

                          //If 'linescore' is not an array, it is only the 1st inning. Thanks MLB Data...
                          if(_.isArray(data.linescore)) {
                              awayInningScore = (inning.away_inning_runs == '' ? '0' : inning.away_inning_runs);
                              homeInningScore = getHomeInningScore();
                          } else {
                              awayInningScore = (dataObj.away_inning_runs == '' ? '0' : dataObj.away_inning_runs);
                              homeInningScore = getHomeInningScore();
                          }

                          inningData.push(<div key={Math.random()}>
                              <div className={'scoreBox' + topInning}>{awayInningScore}</div>
                              <div className={'scoreBox' + bottomInning}>{homeInningScore}</div>
                          </div>);
                      }

                      //Apply Inning Linescores if there's any data.
                      // if (_.isUndefined(data.linescore.inning.length)) {
                      //     gameDataObj.push(<div className='boxScore' key={Math.random()}>
                      //         <div className='inningContainer'>
                      //             <div className='inning'>{currentInning}</div>
                      //             {inningData}
                      //         </div>
                      //     </div>);
                      //
                      //     inningData = [];
                      // } else {

                          // if(data.inning > (parseInt(data.scheduled_innings) + 3)) {
                          //   console.log('Current Total Innings:', data.inning);
                          //   //Create offset variable to show latest 9 innings.
                          // } else {
                          //   console.log("Nermal.");
                          // }

                      //If 'linescore' is not an array, it is only the 1st inning. Again, thanks MLB Data.
                      if(_.isArray(data.linescore)) {
                          _.forEach(data.linescore, function (inning, id) {
                              currentInning = id + 1;
                              getInningScore(data, inning);

                              gameDataObj.push(<div className='boxScore' key={Math.random()}>
                                  <div className='inningContainer'>
                                      <div className='inning'>{currentInning}</div>
                                      {inningData}
                                  </div>
                              </div>);

                              inningData = [];
                          });
                      } else {
                          currentInning = 1;
                          getInningScore(data.linescore, 1);

                          gameDataObj.push(<div className='boxScore' key={Math.random()}>
                              <div className='inningContainer'>
                                  <div className='inning'>{currentInning}</div>
                                  {inningData}
                              </div>
                          </div>);

                          inningData = [];
                      }

                      //Display the RHE Totals.
                      gameDataObj.push(<div className='boxScore totals' key={Math.random()}>
                          <div className='inningContainer'>
                              <div className='inning'>R</div>
                              <div className='scoreBox'>{awayRuns}</div>
                              <div className='scoreBox'>{homeRuns}</div>
                          </div>
                          <div className='inningContainer'>
                              <div className='inning'>H</div>
                              <div className='scoreBox'>{awayHits}</div>
                              <div className='scoreBox'>{homeHits}</div>
                          </div>
                          <div className='inningContainer'>
                              <div className='inning'>E</div>
                              <div className='scoreBox'>{awayErrors}</div>
                              <div className='scoreBox'>{homeErrors}</div>
                          </div>
                      </div>);

                      let currentRunnersOnBase = [],
                          balls = [],
                          strikes = [],
                          outs = [],
                          totalBalls = 0,
                          totalStrikes = 0,
                          totalOuts = 0;

                      // Find Runner Data.
                      if(!_.isUndefined(data.runner_on_1b)) currentRunnersOnBase.push('1b');
                      if(!_.isUndefined(data.runner_on_2b)) currentRunnersOnBase.push('2b');
                      if(!_.isUndefined(data.runner_on_3b)) currentRunnersOnBase.push('3b');

                      // BSO: Calculate the tabulated Balls, Strikes, and Outs, then push the active elements.
                      for (var i = 0; i < parseInt(data.balls); i++) balls.push(<div key={Math.random()} className='countIt'>&nbsp;</div>);
                      for (var i = 0; i < parseInt(data.strikes); i++) strikes.push(<div key={Math.random()} className='countIt'>&nbsp;</div>);
                      for (var i = 0; i < parseInt(data.outs); i++) outs.push(<div key={Math.random()} className='countIt'>&nbsp;</div>);

                      //Append the non-active elements to complete the BSO layout.
                      totalBalls = 4 - balls.length,
                      totalStrikes = 3 - strikes.length,
                      totalOuts = 3 - outs.length;

                      for (var i = 0; i < totalBalls; i++) balls.push(<div key={Math.random()} className=''>&nbsp;</div>);
                      for (var i = 0; i < totalStrikes; i++) strikes.push(<div key={Math.random()} className=''>&nbsp;</div>);
                      for (var i = 0; i < totalOuts; i++) outs.push(<div key={Math.random()} className=''>&nbsp;</div>);

                      function getBatterBoxScoreData() {
                          //Print out Box Scores of Batter Data.
                          let batterDataHeaders = ['name_display_first_last', 'ab', 'r', 'h', 'e', 'rbi', 'bb', 'so', 'bam_avg', 'bam_obp', 'bam_slg'],
                              pitcherDataHeaders = ['name_display_first_last', 'ip', 'h', 'r', 'er', 'bb', 'so', 'hr', 'np', 'bam_era'],
                              teamName = '',
                              thBatterData = [],
                              tdBatterData = [],
                              thPitcherData = [],
                              tdPitcherData = [],
                              tempArr = [],
                              notes = [];

                          //Print out Headers for Batters
                          _.forEach(batterDataHeaders, function(header) {
                              if(header === 'name_display_first_last') {
                                  thBatterData.push(<th key={Math.random()} className='notNumeric'>Batter</th>);
                              } else {
                                  thBatterData.push(<th key={Math.random()}>{_.includes(header, 'bam_') ? header.slice(4) : header}</th>);
                              }
                          });

                          //Loop through each Team and draw out Tables.
                          _.forEach(rawBoxScore.team, function(batterInfo, teamCount) {
                              teamName = batterInfo.$.full_name;

                              // Arrange the Batting Order in sequence.
                              let batterClasses = '',
                                  pitcherClasses = '',
                                  pitcherDisplayName = '',
                                  pitcherPosition = '',
                                  pitcherNote = '',
                                  batterDisplayName = '',
                                  batterPosition = '',
                                  batterNote = '',
                                  pitcherStatsArr = ['win','loss','blown_save','hold'],
                                  //Set the correct Batting Order using SortBy.
                                  batterObj = _.sortBy(batterInfo.batting[0].batter, function(o) {
                                      return parseInt(o.$.bat_order);
                                  }),
                                  //Set the correct Pitching Order using SortBy.
                                  pitcherObj = _.sortBy(batterInfo.pitching[0].pitcher, function(o) {
                                      return parseInt(o.$.pitch_order);
                                  });

                                  //Filtering out Pitchers if the selected game is from the American League.
                                  batterObj = _.filter(batterObj, function(o) {
                                    if(selectedGameData.league === 'AA') {
                                      if(o.$.pos !== 'P') return o.$;
                                    } else {
                                      return o.$;
                                    }
                                  });

                              // Draw Batter Table.
                              _.forEach(batterObj, function(batter) {
                                  _.forEach(batterDataHeaders, function(header) {
                                      //Assign classes based on if Batter is a Pinch Hitter.
                                      //Also assigns class for Batter column.
                                      batterClasses = classNames({
                                        'pinchHitter': _.has(batter, 'pinch_hit') || !_.includes(batter.$.bat_order, '00'),
                                        'notNumeric': header === 'name_display_first_last'
                                      });

                                      if(header === 'name_display_first_last') {
                                        batterNote = _.has(batter.$, 'note') ? batter.$.note : '';
                                        batterDisplayName = batterNote + batter.$.name;
                                        batterPosition = batter.$.pos;
                                      } else {
                                        batterDisplayName = _.result(_.find(batter, header), header);
                                        batterPosition = '';
                                      }

                                      tdBatterData.push(<td key={Math.random()} className={batterClasses}>
                                        {batterDisplayName}
                                        <span className='playerPosition'>{batterPosition}</span>
                                      </td>);
                                  });

                                  batterData.push(<tr key={Math.random()}>
                                      {tdBatterData}
                                  </tr>);

                                  tdBatterData = [];
                              });

                              //Print out Headers for Pitchers
                              _.forEach(pitcherDataHeaders, function(header) {
                                  if(header === 'name_display_first_last') {
                                      thPitcherData.push(<th key={Math.random()} className='notNumeric'>Pitcher</th>);
                                  } else if (header === 'np') {
                                      thPitcherData.push(<th key={Math.random()}>pc-st</th>);
                                  } else {
                                      thPitcherData.push(<th key={Math.random()}>{_.includes(header, 'bam_') ? header.slice(4) : header}</th>);
                                  }
                              });

                              function getInningsPitched(outs) {
                                  let calcIP = null;

                                  function isInt(n) {
                                      return n % 3 === 0;
                                  }

                                  //If the Number of Outs returns a Modulous of 0,
                                  //then treat the result as a whole number and append a decimal place.
                                  if(isInt(outs)) {
                                      calcIP = parseFloat((outs) / 3).toFixed(1);
                                  } else {
                                      //Add base number of Innings Pitched and then calculate the fraction
                                      //of the decimal places down to the lowest common denominator.
                                      let f = _.round(outs / 3, 2),
                                          baseInningCount = parseInt(f),
                                          dividedFig = (f - baseInningCount) / 3,
                                          roundFig = Math.round(dividedFig * 10) / 10;

                                      calcIP = baseInningCount + roundFig;
                                  }

                                  return calcIP;
                              }

                              // Draw Pitcher Table.
                              _.forEach(pitcherObj, function(pitcher) {
                                  _.forEach(pitcherDataHeaders, function(header) {
                                      pitcherClasses = classNames({
                                          'notNumeric': header === 'name_display_first_last'
                                      });

                                      if(header === 'name_display_first_last') {
                                        let pitcherResult = '';

                                        //Post registered events (Win, Los, Blown Save, Hold);
                                        let pitcherStatistics = _.pick(pitcher.$, pitcherStatsArr);

                                        //If there are Pitcher Stats to record, open the string with a parenthesis.
                                        if(_.size(pitcherStatistics) > 0) {
                                          pitcherResult += pitcher.$.name + ' (';

                                          _.forEach(pitcherStatistics, function (o, stat) {
                                              if(stat == 'win') {
                                                  pitcherResult += 'W, ' + pitcher.$.bam_w + '-' + pitcher.$.bam_l + ',';
                                              } else if(stat == 'loss') {
                                                  pitcherResult += 'L, ' + pitcher.$.bam_w + '-' + pitcher.$.bam_l + ',';
                                              } else if(stat == 'hold') {
                                                  pitcherResult += 'H, ' + pitcher.$.bam_hld + ',';
                                              } else if(stat == 'blown_save') {
                                                  pitcherResult += 'B, ' + pitcher.$.bam_bs + ',';
                                              }
                                          });

                                          //Replace the ',' at the end with a closing parenthesis.
                                          pitcherResult = pitcherResult.replace(/.$/, ')');
                                        } else {
                                          pitcherResult = pitcher.$.name;
                                        }

                                        pitcherDisplayName = pitcherResult;
                                      } else if(header === 'ip') {
                                          //Get Innings Pitched
                                          pitcherDisplayName = getInningsPitched(pitcher.$.out);
                                      } else if(header === 'np') {
                                          pitcherDisplayName = pitcher.$.np + '-' + pitcher.$.s;
                                      } else {
                                          pitcherDisplayName = _.result(_.find(pitcher, header), header);
                                      }

                                      tdPitcherData.push(<td key={Math.random()} className={pitcherClasses}>
                                          {pitcherDisplayName}
                                      </td>);
                                  });

                                  pitcherData.push(<tr key={Math.random()}>
                                      {tdPitcherData}
                                  </tr>);

                                  tdPitcherData = [];
                              });

                              // Find Notes for Boxscores.
                              _.forEach(boxscoreData.boxscore.batting, function(battingTeam, id) {
                                if(_.has(battingTeam, 'note')) {
                                  //Put Batting data in temp object for sorting.
                                  tempArr.push(battingTeam);
                                }
                              });

                              // If there are Notes, then sort them by 'Away' team first to match the order of the Boxscores.
                              if(tempArr.length > 0) {
                                tempArr = _.sortBy(tempArr, function(o) {
                                  return o.team_flag;
                                }, ['asc']);

                                // Parse the XML Notes into JSON.
                                _.forEach(tempArr, function(arr) {
                                  parseString(arr.note, function (err, result) {
                                    _.forEach(result, function(o) {
                                      notes.push(o);
                                    });
                                  });
                                });
                              }

                              //Assemble Pitcher Totals
                              let pitcherTotalsData = [],
                                  pitchers = [],
                                  pc = 0,
                                  s = 0;

                              //Sort out all pitchers properly to get total pitch count.
                              pitchers = _.filter(boxscoreData.boxscore.pitching[teamCount], function(j, i) {
                                return i === 'pitcher';
                              });

                              pc = _.sumBy(pitchers[0], function(pitcher, i) {
                                return parseInt(pitcher.np);
                              });

                              s = _.sumBy(pitchers[0], function(pitcher, i) {
                                return parseInt(pitcher.s);
                              });

                              pitcherTotalsData.push(<tr className='pitcherTotalsRow' key={Math.random()}>
                                   <td className='notNumeric'><strong>TOTALS</strong></td>
                                   <td>{getInningsPitched(boxscoreData.boxscore.pitching[teamCount].out)}</td>
                                   <td>{boxscoreData.boxscore.pitching[teamCount].h}</td>
                                   <td>{boxscoreData.boxscore.pitching[teamCount].r}</td>
                                   <td>{boxscoreData.boxscore.pitching[teamCount].er}</td>
                                   <td>{boxscoreData.boxscore.pitching[teamCount].bb}</td>
                                   <td>{boxscoreData.boxscore.pitching[teamCount].so}</td>
                                   <td>{boxscoreData.boxscore.pitching[teamCount].hr}</td>
                                   <td>{pc}-{s}</td>
                                   <td>{boxscoreData.boxscore.pitching[teamCount].era}</td>
                              </tr>);

                              //Push Pitcher & Batter Data.
                              activePlayerData.push(<div className='batterData' key={Math.random()}>
                                  <table className='batterDataTable'>
                                    <tbody>
                                      <tr className='teamNameRow'>
                                          <td colSpan='11'>{teamName}</td>
                                      </tr>
                                      <tr className='batterHeaderRow'>
                                          {thBatterData}
                                      </tr>
                                          {batterData}
                                      <tr>
                                        <td colSpan='11' className='notNumeric'>{notes[teamCount]}</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <br />
                                  <table className='batterDataTable'>
                                    <tbody>
                                      <tr className='pitcherHeaderRow'>
                                          {thPitcherData}
                                      </tr>
                                          {pitcherData}
                                          {pitcherTotalsData}
                                    </tbody>
                                  </table>
                              </div>);

                              thPitcherData = [];
                              batterData = [];
                              pitcherData = [];
                              tempArr = [];
                              notes = [];
                          });
                      }

                      if (data.status !== 'Game Over' && data.status !== 'Final') {
                          //Show Runner/Batter/Pitcher Data
                          gameDataObj.push(<div className='activePlayerData' key={Math.random()}>
                              <div className='bases'>
                                  <div className={'baseContainer ' + (data.status === 'Warmup' || data.status === 'Pre-Game' ? 'disable' : '')}>
                                      <div className='secondBase baseRow'>
                                        { (_.includes(currentRunnersOnBase, '2b')) ? (
                                          <BaseRunnerOverlay className={'base onBase'}
                                                             placement='top'
                                                             playerProfile={data.runner_on_2b}
                                                             id='2b'>&nbsp;</BaseRunnerOverlay>) :
                                           (<div className='base'>&nbsp;</div>) }
                                      </div>
                                      <div className='thirdFirstBase baseRow'>
                                        { (_.includes(currentRunnersOnBase, '3b')) ? (
                                          <BaseRunnerOverlay className={'base thirdBase onBase'}
                                                             placement='top'
                                                             playerProfile={data.runner_on_3b}
                                                             id='3b'>&nbsp;</BaseRunnerOverlay>) :
                                           (<div className='base'>&nbsp;</div>) }

                                        { (_.includes(currentRunnersOnBase, '1b')) ? (
                                          <BaseRunnerOverlay className={'base firstBase onBase'}
                                                             placement='top'
                                                             playerProfile={data.runner_on_1b}
                                                             id='1b'>&nbsp;</BaseRunnerOverlay>) :
                                           (<div className='base'>&nbsp;</div>) }
                                      </div>
                                  </div>

                                  { (data.status === 'Warmup' || data.status === 'Pre-Game') ? (
                                      <div className='currentPitcherBatter'>
                                          <h3>Starting Pitchers</h3>
                                          <div><strong>{data.away_name_abbrev}:</strong> {data.away_probable_pitcher.first} {data.away_probable_pitcher.last}</div>
                                          <div><strong>{data.home_name_abbrev}:</strong> {data.home_probable_pitcher.first} {data.home_probable_pitcher.last}</div>
                                      </div>
                                  ) : (
                                      <div className='currentPitcherBatter'>
                                          <div><strong>Pitcher:</strong> {data.current_pitcher.first} {data.current_pitcher.last}</div>
                                          <div><strong>Batter:</strong> {data.current_batter.first_name} {data.current_batter.last_name} -- {data.current_batter.avg}</div>
                                      </div>
                                  ) }

                                  <div className='venueData'>
                                    <div><strong>Weather:</strong> {rawBoxScore.$.weather}</div>
                                    <div><strong>Wind:</strong> {rawBoxScore.$.wind}</div>
                                    <div><strong>Venue:</strong> {data.venue}, {data.location}</div>
                                  </div>
                              </div>
                              <div className={'BSO ' + (data.status === 'Warmup' || data.status === 'Pre-Game' ? 'disable' : '')}>
                                  <div className='BSOContainer'>
                                      <div className='bsoName'>B:</div>
                                      {balls}
                                  </div>
                                  <div className='BSOContainer'>
                                      <div className='bsoName'>S:</div>
                                      {strikes}
                                  </div>
                                  <div className='BSOContainer'>
                                      <div className='bsoName'>O:</div>
                                      {outs}
                                  </div>
                                  <br />
                                <div className={(data.status === 'Warmup' || data.status === 'Pre-Game' ? 'disable' : 'lastPlayDesc')}><strong>Last Play:</strong> {data.pbp_last}</div>
                              </div>
                          </div>);

                          getBatterBoxScoreData();

                      } else if (data.status === 'Final' || data.status === 'Game Over') {
                          gameDataObj.push(<div className='activePlayerData' key={Math.random()}>
                            <div className='bases'>
                                <div className='winnerLoser'>
                                    <div><strong>WP:</strong> {data.winning_pitcher.first} {data.winning_pitcher.last} ({data.winning_pitcher.wins}-{data.winning_pitcher.losses})</div>
                                    <div><strong>LP:</strong> {data.losing_pitcher.first} {data.losing_pitcher.last} ({data.losing_pitcher.wins}-{data.losing_pitcher.losses})</div>
                                    {data.save_pitcher.first !== '' ? (<div><strong>SV:</strong> {data.save_pitcher.first} {data.save_pitcher.last} ({data.save_pitcher.saves})</div>) : ('')}
                                </div>
                            </div>
                            <div className='venueData'>
                              <div><strong>Weather:</strong> {rawBoxScore.$.weather}</div>
                              <div><strong>Wind:</strong> {rawBoxScore.$.wind}</div>
                              <div><strong>Venue:</strong> {data.venue}, {data.location}</div>
                              <div><strong>Attendance:</strong> {rawBoxScore.$.attendance}</div>
                            </div>
                          </div>);

                          getBatterBoxScoreData();
                      }

                      //Combine Score and Location Data
                      gameContentBody.push(<div className='headlineContainer' key={Math.random()}>
                          {data.status === 'Final' ? (
                          <div className='headline'>{rawBoxScore.team[0].$.short_name} ({rawBoxScore.team[0].$.wins}-{rawBoxScore.team[0].$.losses}) vs.&nbsp;
                               {rawBoxScore.team[1].$.short_name} ({rawBoxScore.team[1].$.wins}-{rawBoxScore.team[1].$.losses})</div>) : ('')}
                          <div className='boxScoreContainer'>{gameDataObj}</div>
                      </div>);

                      //Combine Boxscore Data
                      _.forEach(activePlayerData, function(team, i) {
                          if(i === 0) {
                              boxScoreBody_awayTeam.push(<div key={Math.random()} className='activePlayerDataContainer'>{activePlayerData[i]}</div>);
                          } else {
                              boxScoreBody_homeTeam.push(<div key={Math.random()} className='activePlayerDataContainer'>{activePlayerData[i]}</div>);
                          }
                      });

                      //Set States and fire off Redux Dispatches.
                      self.setState({gameContentBody}, function() {
                        store.dispatch({
                          type: 'LOAD_GAME_DATA',
                          payload: self.state.gameContentBody
                        });
                      });

                      self.setState({boxScoreBody_awayTeam}, function() {
                        store.dispatch({
                          type: 'LOAD_BOXSCORE_AWAY',
                          payload: self.state.boxScoreBody_awayTeam
                        });
                      });

                      self.setState({boxScoreBody_homeTeam}, function() {
                        store.dispatch({
                          type: 'LOAD_BOXSCORE_HOME',
                          payload: self.state.boxScoreBody_homeTeam
                        });
                      });

                      store.dispatch({
                        type: 'LOAD_GAME_TAB_DATA',
                        payload: self.state.game
                      });
                  }
              });
            }

            callback();
    }

    componentWillReceiveProps(nextProps) {
      let returnStr = '',
          score = '';

      if(this.state.game.status.ind == 'I') {
        //Check if Out has occured.
        if(this.state.game.status.o != nextProps.gameData.status.o) {
            this.setState({hasChanged: true});
        } else {
            if(this.state.hasChanged) {
                this.setState({hasChanged: false});
            }
        }

        //Check for Away team Run Scored
        if(this.state.game.linescore.r.away != nextProps.gameData.linescore.r.away) {
          console.log(this.state.game.linescore.r.away, nextProps.gameData.linescore.r.away);
          console.log('away:', nextProps.gameData.pbp.last);

          score = this.state.game.away_name_abbrev + ' ' + this.state.game.linescore.r.away + ' ' + this.state.game.home_name_abbrev + ' ' + this.state.game.linescore.r.home;
          returnStr = '\n' + score + '\n' + this.state.game.away_name_abbrev + ': ' + nextProps.gameData.pbp.last;

          //Fire off Dispatch.
          store.dispatch({
            type: 'UPDATE_GAME_STATUS',
            payload: returnStr
          });
        }

        //Chec for Home team run scored.
        if(this.state.game.linescore.r.home != nextProps.gameData.linescore.r.home) {
          console.log(this.state.game.linescore.r.home, nextProps.gameData.linescore.r.home);
          console.log('home:', nextProps.gameData.pbp.last);

          score = this.state.game.away_name_abbrev + ' ' + this.state.game.linescore.r.away + ' ' + this.state.game.home_name_abbrev + ' ' + this.state.game.linescore.r.home;
          returnStr = '\n' + score + '\n' + this.state.game.home_name_abbrev + ': ' + nextProps.gameData.pbp.last;

          //Fire off Dispatch.
          store.dispatch({
            type: 'UPDATE_GAME_STATUS',
            payload: returnStr
          });
        }
      }
    }

    slideOut() {
      let self = this;

      this.showLoadingSpinner();

      this.collectData(function() {
        setTimeout(() => {
          self.hideLoadingSpinner();
          document.getElementById('slideOut').classList.add('open');
        }, 500);
      });
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

        //Set class names for the Score Table. If an Out or a Run is recorded, the indicator class will fire off a CSS Animation.
        let scoreTableClasses = classNames({
          'scoreTable': true,
          'blink_me': this.state.hasChanged
        });

        return (
            <div className={scoreTableClasses} onClick={this.slideOut.bind(this)}>
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
        );
    }
}
