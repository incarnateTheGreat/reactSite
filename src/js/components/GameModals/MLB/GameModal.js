import React from 'react';
import axios from 'axios';
import Modal from 'react-modal';

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
        padding               : '0',
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
        this.getBoxscoreData(this.state.game);
    }

    closeModal() {
        tweenStyle['content'].opacity = '0';
        this.setState({modalStyle: _.merge(customStyles, tweenStyle)});
        setTimeout(() => {
            this.setState({modalIsOpen: false});
        }, 350);

    }
    getBoxscoreData(data) {
        let self = this;

        console.log(data);

        let gameContentBody = [],
            boxScore = [],
            activePlayerData = [],
            awayTeamName = data.away_team_name,
            homeTeamName = data.home_team_name,
            awayTeam = data.away_name_abbrev,
            homeTeam = data.home_name_abbrev,
            awayRuns = _.isUndefined(data.linescore) ? 0 : data.linescore.r.away,
            homeRuns = _.isUndefined(data.linescore) ? 0 : data.linescore.r.home,
            awayHits = _.isUndefined(data.linescore) ? 0 : data.linescore.h.away,
            homeHits = _.isUndefined(data.linescore) ? 0 : data.linescore.h.home,
            awayErrors = _.isUndefined(data.linescore) ? 0 : data.linescore.e.away,
            homeErrors = _.isUndefined(data.linescore) ? 0 : data.linescore.e.home,
            runnersOnBase = _.isUndefined(data.linescore) ? 0 : data.runners_on_base;

        if(data.status.ind === 'Y' || data.status.ind === 'F') {
          dispayGameData();
        } else {
          //no game data yet. display pre-game content, if any.
          displayPregameData();
        }

        function displayPregameData() {
          //Apply Team Names.
          boxScore.push(<div className='boxScore' key={Math.random()}>
            <div>
              <div className='teamNames'>{awayTeamName} vs. {homeTeamName}</div>
            </div>
          </div>);

          activePlayerData.push(<div className='activePlayerData' key={Math.random()}>
            <div className='bases'>
              <div className='winnerLoser'>
                <div>Probables:</div>
                  <div><strong>{awayTeam}:</strong> {data.away_probable_pitcher.first} {data.away_probable_pitcher.last} ({data.away_probable_pitcher.wins}-{data.away_probable_pitcher.losses}) ERA: {data.away_probable_pitcher.era}</div>
                  <div><strong>{homeTeam}:</strong> {data.home_probable_pitcher.first} {data.home_probable_pitcher.last} ({data.home_probable_pitcher.wins}-{data.home_probable_pitcher.losses}) ERA: {data.home_probable_pitcher.era}</div>
              </div>
            </div>
          </div>);

          //Combine all content
          gameContentBody.push(<div key={Math.random()}>
            <div>{boxScore}</div>
            <div className='activePlayerDataContainer'>{activePlayerData}</div>
          </div>)

          self.setState({gameContentBody});
        }

        function dispayGameData() {
            // const away = { backgroundImage: 'url("/images/logos/' + lineScore.teams.away.team.abbreviation +'.png")' },
            //       home = { backgroundImage: 'url("/images/logos/' + lineScore.teams.home.team.abbreviation +'.png")' };

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
            function getInningScore(dataStatus, inning) {
              if(currentInning === parseInt(dataStatus.inning) && (dataStatus.ind === 'I')) {
                if(dataStatus.top_inning === 'Y') {
                  topInning = ' currentInning';
                } else {
                  bottomInning = ' currentInning';
                }
              }

              function getHomeInningScore() {
                if(!inning.home && data.status.status === 'Final') {
                  return 'X';
                } else if(inning.home == '') {
                  return '0';
                } else {
                  return inning.home;
                }
              }

              awayInningScore = (inning.away == '' ? '0' : inning.away);
              homeInningScore = getHomeInningScore();

              inningData.push(<div key={Math.random()}>
                <div className={'scoreBox' + topInning}>{awayInningScore}</div>
                <div className={'scoreBox' + bottomInning}>{homeInningScore}</div>
              </div>)
            }

            //Apply Inning Linescores if there's any data.
            if(data.linescore.inning.length > 1) {

              // if(data.status.inning > (parseInt(data.scheduled_innings) + 3)) {
              //   console.log('Current Total Innings:', data.status.inning);
              //   //Create offset variable to show latest 9 innings.
              // } else {
              //   console.log("Nermal.");
              // }

                _.forEach(data.linescore.inning, function(inning, id) {
                  currentInning = id + 1;
                  getInningScore(data.status, inning);

                    boxScore.push(<div className='boxScore' key={Math.random()}>
                        <div className='inningContainer'>
                            <div className='inning'>{currentInning}</div>
                            {inningData}
                        </div>
                    </div>);

                    inningData = [];
                });
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

            // Find Runner Data home
            _.forEach(runnersOnBase, (o, id) => {
              if(id !== 'status') currentRunnersOnBase.push(id.substr(id.length - 2).trim());
            });

            // BSO: Calculate the tabulated Balls, Strikes, and Outs, then push the active elements.
            console.log(data.status.b, data.status.s, data.status.o);

            for(var i = 0; i < parseInt(data.status.b); i++) {
              balls.push(<div key={Math.random()} className='countIt'>&nbsp;</div>)
            }
            for(var i = 0; i < parseInt(data.status.s); i++) {
              strikes.push(<div key={Math.random()} className='countIt'>&nbsp;</div>)
            }
            for(var i = 0; i < parseInt(data.status.o); i++) {
              outs.push(<div key={Math.random()} className='countIt'>&nbsp;</div>)
            }

            //Append the non-active elements to complete the BSO layout.
            totalBalls = 4 - balls.length,
            totalStrikes = 3 - strikes.length,
            totalOuts = 3 - outs.length;

            for(var i = 0; i < totalBalls; i++) {
              balls.push(<div key={Math.random()} className=''>&nbsp;</div>)
            }
            for(var i = 0; i < totalStrikes; i++) {
              strikes.push(<div key={Math.random()} className=''>&nbsp;</div>)
            }
            for(var i = 0; i < totalOuts; i++) {
              outs.push(<div key={Math.random()} className=''>&nbsp;</div>)
            }

            if(data.status.status !== 'Final') {
              //Show Runner/Batter/Pitcher Data
              activePlayerData.push(<div className='activePlayerData' key={Math.random()}>
                <div className='bases'>
                  <div className='baseContainer'>
                    <div className='secondBase baseRow'>
                      <div href='#' data-toggle="tooltip" title="Hooray!" className={'base ' + (_.includes(currentRunnersOnBase, '2b') ? 'onBase' : '')}>&nbsp;</div>
                    </div>
                    <div className='thirdFirstBase baseRow'>
                      <div className={'base ' + (_.includes(currentRunnersOnBase, '3b') ? 'onBase' : '')}>&nbsp;</div>
                      <div className={'base ' + (_.includes(currentRunnersOnBase, '1b') ? 'onBase' : '')}>&nbsp;</div>
                    </div>
                  </div>
                  <div className='currentPitcherBatter'>
                    <div><strong>Pitcher:</strong> {data.pitcher.first} {data.pitcher.last}</div>
                    <div><strong>Batter:</strong> {data.batter.first} {data.batter.last}</div>
                  </div>
                </div>
                <div className='BSO'>
                  <div className='BSOContainer'>
                    <div className='bsoName'>B: </div>
                    {balls}
                  </div>
                  <div className='BSOContainer'>
                    <div className='bsoName'>S: </div>
                    {strikes}
                  </div>
                  <div className='BSOContainer'>
                    <div className='bsoName'>O: </div>
                    {outs}
                  </div>
                </div>
              </div>);
            } else if(data.status.status === 'Final') {
              activePlayerData.push(<div className='activePlayerData' key={Math.random()}>
                <div className='bases'>
                  <div className='winnerLoser'>
                    <div><strong>WP:</strong> {data.winning_pitcher.first} {data.winning_pitcher.last} ({data.winning_pitcher.wins}-{data.winning_pitcher.losses})</div>
                    <div><strong>LP:</strong> {data.losing_pitcher.first} {data.losing_pitcher.last} ({data.losing_pitcher.wins}-{data.losing_pitcher.losses})</div>
                  {data.save_pitcher.first !== '' ? (<div><strong>SV:</strong> {data.save_pitcher.first} {data.save_pitcher.last} ({data.save_pitcher.saves})</div>) : ('')}
                  </div>
                </div>
              </div>);
            }

            //Combine all content
            gameContentBody.push(<div key={Math.random()}>
              <div className='boxScoreContainer'>{boxScore}</div>
              <div className='activePlayerDataContainer'>{activePlayerData}</div>
            </div>)

            self.setState({gameContentBody});
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
