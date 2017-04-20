import React from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import {OverlayTrigger, Tooltip} from "react-bootstrap";

// import BaseRunnerTooltip from '../../../components/Tooltip';

const customStyles = {
    overlay : {
        zIndex                : '200'
    },
    content: {
        WebkitBoxShadow       : '3px 3px 5px 0px rgba(0,0,0,0.40)',
        MozBoxShadow          : '3px 3px 5px 0px rgba(0,0,0,0.40)',
        BowShadow             : '3px 3px 5px 0px rgba(0,0,0,0.40)',
        fontFamily            : 'sans-serif',
        top                   : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)',
        transition            : 'all 0.35s ease',
        padding               : '10px 20px 10px',
        borderRadius          : '7px 7px 0px 0px',
        overflow              : 'hidden',
        width                 : '70%'
    }
};

let tweenStyle = {
    content: {
        opacity               : '0'
    }
};

const BaseRunnerTooltip = React.createClass({
    render() {
        // console.log(this.props);
        if(this.props.tooltip) {
            let tooltip = <Tooltip id={this.props.id}>{this.props.tooltip}</Tooltip>;

            return (
                <OverlayTrigger
                    overlay={tooltip} placement={this.props.placement}
                    delayShow={300} delayHide={150}>
                    <div className={this.props.className}>{this.props.children}</div>
                </OverlayTrigger>
            );
        } else {
            let tooltip = <Tooltip id={this.props.id}>{this.props.tooltip}</Tooltip>;
            return (
                <OverlayTrigger
                    overlay={tooltip} placement={this.props.placement}
                    delayShow={300} delayHide={150}>
                    <div className={this.props.className}>{this.props.children}</div>
                </OverlayTrigger>
            );
        }
    }
});

export default class GameModalMLB extends React.Component {
    constructor() {
        super();

        this.state = {
            modalIsOpen: false,
            gameContentBody: null,
            game: null,
            modalStyle: _.merge(customStyles, tweenStyle)
        };

        this.openModal = this.openModal.bind(this);
        this.afterOpenModal = this.afterOpenModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    openModal() {
        this.setState({modalIsOpen: true});
    }

    afterOpenModal() {
        tweenStyle['content'].opacity = '1';
        this.setState({modalStyle: _.merge(customStyles, tweenStyle)});
        this.getBoxscoreData(this.state.game, this.state.game.game_data_directory);
    }

    closeModal() {
        tweenStyle['content'].opacity = '0';
        this.setState({modalStyle: _.merge(customStyles, tweenStyle)});
        setTimeout(() => {
            this.setState({modalIsOpen: false});
        }, 350);
    }
    getBoxscoreData(selectedGameData, game_data_directory) {
        let self = this,
            urls = [],
            data = null,
            rawBoxScore = null,
            players = [],
            gameContentBody = [],
            boxScore = [],
            activePlayerData = [];

            console.log('getBoxscoreData:', selectedGameData);

            //Display Postponed game.
            function displayPPDGameData() {
                //Apply Team Names.
                boxScore.push(<div className='boxScore' key={Math.random()}>
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
                    <div className='boxScoreContainer'>{boxScore}</div>
                    <div className='activePlayerDataContainer'>{activePlayerData}</div>
                </div>);

                self.setState({gameContentBody});
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
                    homeTeam = data.home_name_abbrev;

                //Apply Team Names.
                boxScore.push(<div className='boxScore' key={Math.random()}>
                    <div>
                        <div className='teamNames' data-tooltop="">{awayTeamName} vs. {homeTeamName}</div>
                        <div className='startTime'><strong>{data.time_hm_lg}{data.ampm}</strong></div>
                    </div>
                </div>);

                activePlayerData.push(<div className='activePlayerData' key={Math.random()}>
                    <div className='bases'>
                        <div className='winnerLoser'>
                            <div><strong>Probables:</strong></div>
                            <table>
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
                            </table>
                        </div>
                    </div>
                </div>);

                //Combine all content
                gameContentBody.push(<div key={Math.random()}>
                    <div>{boxScore}</div>
                    <div className='activePlayerDataContainer'>{activePlayerData}</div>
                </div>)

                self.setState({gameContentBody});
              });
            }

            if(selectedGameData.status.ind == 'DR' || selectedGameData.status.ind == 'DI') {
              displayPPDGameData();
            } else if(selectedGameData.status.ind == 'S') {
              displayPregameData();
            } else {
              urls[0] = axios.get('http://www.mlb.com/gdcross' + game_data_directory + '/linescore.json'),
              urls[1] = axios.get('http://www.mlb.com/gdcross' + game_data_directory + '/rawboxscore.xml'),
              urls[2] = axios.get('http://www.mlb.com/gdcross' + game_data_directory + '/players.xml');

              //Test call JSON Linescore from match when clicking on specific Game
              axios.all(urls).then((gameData) => {
                  //Linescore
                  data = gameData[0].data.data.game;

                  //Box Score
                  let parseString = require('xml2js').parseString,
                      boxScore_XML = gameData[1].data;
                  parseString(boxScore_XML, function (err, result) {
                      rawBoxScore = result.boxscore;
                      console.log(rawBoxScore);
                  });

                  //Players
                  parseString = require('xml2js').parseString;
                  let players_XML = gameData[2].data;
                  parseString(players_XML, function (err, result) {
                      players = [result.game.team[0].player, result.game.team[1].player];
                  });

                  let awayTeamName = data.away_team_name,
                      homeTeamName = data.home_team_name,
                      awayTeam = data.away_name_abbrev,
                      homeTeam = data.home_name_abbrev,
                      awayRuns = data.away_team_runs,
                      homeRuns = data.home_team_runs,
                      awayHits = data.away_team_hits,
                      homeHits = data.home_team_hits,
                      awayErrors = data.away_team_errors,
                      homeErrors = data.home_team_errors,
                      runnersOnBase = data.runners_on_base;

                  dispayGameData();

                  function dispayGameData() {
                    console.log(data);
                      //Apply Team Names.
                      boxScore.push(<div className='boxScore' key={Math.random()}>
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

                          if(_.isArray(data.linescore)) {
                              awayInningScore = (inning.away_inning_runs == '' ? '0' : inning.away_inning_runs);
                              homeInningScore = getHomeInningScore();
                          } else {
                              awayInningScore = (inning.away_inning_runs == '' ? '0' : inning.away_inning_runs);
                              homeInningScore = getHomeInningScore();
                          }

                          inningData.push(<div key={Math.random()}>
                              <div className={'scoreBox' + topInning}>{awayInningScore}</div>
                              <div className={'scoreBox' + bottomInning}>{homeInningScore}</div>
                          </div>);
                      }

                      //Apply Inning Linescores if there's any data.
                      // if (_.isUndefined(data.linescore.inning.length)) {
                      //     boxScore.push(<div className='boxScore' key={Math.random()}>
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

                      if(_.isArray(data.linescore)) {
                          _.forEach(data.linescore, function (inning, id) {
                              currentInning = id + 1;
                              getInningScore(data, inning);

                              boxScore.push(<div className='boxScore' key={Math.random()}>
                                  <div className='inningContainer'>
                                      <div className='inning'>{currentInning}</div>
                                      {inningData}
                                  </div>
                              </div>);

                              inningData = [];
                          });
                      } else {
                          currentInning = 1;
                          getInningScore(data.status, 1);

                          boxScore.push(<div className='boxScore' key={Math.random()}>
                              <div className='inningContainer'>
                                  <div className='inning'>{currentInning}</div>
                                  {inningData}
                              </div>
                          </div>);

                          inningData = [];
                      }

                      //Apply Totals.
                      boxScore.push(<div className='boxScore totals' key={Math.random()}>
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
                      for (var i = 0; i < parseInt(data.balls); i++) balls.push(<div key={Math.random()}
                                                                                        className='countIt'>&nbsp;</div>);
                      for (var i = 0; i < parseInt(data.strikes); i++) strikes.push(<div key={Math.random()}
                                                                                          className='countIt'>&nbsp;</div>);
                      for (var i = 0; i < parseInt(data.outs); i++) outs.push(<div key={Math.random()}
                                                                                       className='countIt'>&nbsp;</div>);

                      //Append the non-active elements to complete the BSO layout.
                      totalBalls = 4 - balls.length,
                      totalStrikes = 3 - strikes.length,
                      totalOuts = 3 - outs.length;

                      for (var i = 0; i < totalBalls; i++) balls.push(<div key={Math.random()} className=''>&nbsp;</div>);
                      for (var i = 0; i < totalStrikes; i++) strikes.push(<div key={Math.random()} className=''>&nbsp;</div>);
                      for (var i = 0; i < totalOuts; i++) outs.push(<div key={Math.random()} className=''>&nbsp;</div>);

                      //Find Runners on Base with their Player Numbers. Return their name for Tooltip.
                      function getPlayerInfo(playerNumber) {
                          let playerOnBase = [];

                          //Loop through all Player IDs with passed in Player ID. Break the loop when it's found.
                          _.forEach(players, function(playerObj) {
                              playerOnBase = _.filter(playerObj, function(player) {
                                  return player.$.id == playerNumber;
                              });
                              if(playerOnBase.length > 0) return false;
                          });

                          if(playerOnBase.length > 0) {
                              return playerOnBase[0].$.first + ' ' + playerOnBase[0].$.last;
                          } else {
                              return '';
                          }
                      }

                      if (data.status !== 'Final') {
                          //Show Runner/Batter/Pitcher Data
                          activePlayerData.push(<div className='activePlayerData' key={Math.random()}>
                              <div className='bases'>
                                  <div className='baseContainer'>
                                      <div className='secondBase baseRow'>
                                        <BaseRunnerTooltip className={'base ' + (_.includes(currentRunnersOnBase, '2b') ? 'onBase' : '')}
                                                           placement='top'
                                                           tooltip={(_.includes(currentRunnersOnBase, '2b') ? getPlayerInfo(data.runner_on_2b) : null)}
                                                           id='tooltip-1'>&nbsp;</BaseRunnerTooltip>
                                      </div>
                                      <div className='thirdFirstBase baseRow'>
                                        <BaseRunnerTooltip className={'base ' + (_.includes(currentRunnersOnBase, '3b') ? 'onBase' : '')}
                                                           placement='top'
                                                           tooltip={(_.includes(currentRunnersOnBase, '3b') ? getPlayerInfo(data.runner_on_3b) : null)}
                                                           id='tooltip-2'>&nbsp;</BaseRunnerTooltip>

                                        <BaseRunnerTooltip className={'base ' + (_.includes(currentRunnersOnBase, '1b') ? 'onBase' : '')}
                                                           placement='right'
                                                           tooltip={(_.includes(currentRunnersOnBase, '1b') ? getPlayerInfo(data.runner_on_1b) : null)}
                                                           id='tooltip-3'>&nbsp;</BaseRunnerTooltip>
                                      </div>
                                  </div>
                                  <div className='currentPitcherBatter'>
                                      <div><strong>Pitcher:</strong> {data.current_pitcher.first} {data.current_pitcher.last}</div>
                                      <div><strong>Batter:</strong> {data.current_batter.first_name} {data.current_batter.last_name}</div>
                                  </div>
                              </div>
                              <div className='BSO'>
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
                              </div>
                              <div><strong>Last Play:</strong> {data.pbp_last}</div>
                              <hr />
                              <div><strong>Weather:</strong> {rawBoxScore.$.weather}</div>
                              <div><strong>Wind:</strong> {rawBoxScore.$.wind}</div>
                              <div><strong>Venue:</strong> {data.venue}, {data.location}</div>
                          </div>);
                      } else if (data.status === 'Final') {
                          activePlayerData.push(<div className='activePlayerData' key={Math.random()}>
                              <div className='bases'>
                                  <div className='winnerLoser'>
                                      <div><strong>WP:</strong> {data.winning_pitcher.first} {data.winning_pitcher.last} ({data.winning_pitcher.wins}-{data.winning_pitcher.losses})</div>
                                      <div><strong>LP:</strong> {data.losing_pitcher.first} {data.losing_pitcher.last} ({data.losing_pitcher.wins}-{data.losing_pitcher.losses})</div>
                                      {data.save_pitcher.first !== '' ? (<div><strong>SV:</strong> {data.save_pitcher.first} {data.save_pitcher.last} ({data.save_pitcher.saves})</div>) : ('')}
                                  </div>
                              </div>
                              <hr />
                              <div><strong>Weather:</strong> {rawBoxScore.$.weather}</div>
                              <div><strong>Wind:</strong> {rawBoxScore.$.wind}</div>
                              <div><strong>Venue:</strong> {data.venue}, {data.location}</div>
                              <div><strong>Attendance:</strong> {rawBoxScore.$.attendance}</div>
                          </div>);
                      }

                      //Combine all content
                      gameContentBody.push(<div key={Math.random()}>
                          {data.status === 'Final' ? (
                          <div className='headline'>{rawBoxScore.team[0].$.short_name} ({rawBoxScore.team[0].$.wins}-{rawBoxScore.team[0].$.losses}) vs.&nbsp;
                               {rawBoxScore.team[1].$.short_name} ({rawBoxScore.team[1].$.wins}-{rawBoxScore.team[1].$.losses})</div>) : ('')}
                          <div className='boxScoreContainer'>{boxScore}</div>
                          <div className='activePlayerDataContainer'>{activePlayerData}</div>
                      </div>);

                      self.setState({gameContentBody});
                  }
              });
            }
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
        } else if(game.status.ind === 'I') {
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

                <Modal
                    isOpen={this.state.modalIsOpen}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    style={this.state.modalStyle}
                    contentLabel="Game Modal MLB">

                    {this.state.modalIsOpen ? (
                        <div key={game.id}>{this.state.gameContentBody}</div>
                    ) : ''}
                </Modal>
            </div>
        );
    }
}
