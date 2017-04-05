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

export default class GameModal extends React.Component {
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
    getBoxscoreData(gameID) {
        let self = this;

        let p = new Promise(function (resolve, reject) {
            axios.get('http://statsapi.web.nhl.com/api/v1/game/' + gameID + '/feed/live')
                .then(res => resolve(res.data))
                .catch(err => console.log(err));
        });

        p.then((data) => {
            let gameData = data.gameData,
                liveData = data.liveData,
                lineScore = liveData.linescore,
                homeScore = lineScore.teams.home.goals,
                awayScore = lineScore.teams.away.goals,
                gameStatus = "",
                gameContentBody = [];

            let goals = [],
                scorerObj = "",
                scoringSummary = {},
                summaryBody = [];

            function getScoringSummary() {
                _.forEach(liveData.plays.scoringPlays, function(id) {
                    _.forEach(liveData.plays.allPlays, function(playID, v) {
                        if(id == v) {
                            scorerObj = _.find(playID.players, {playerType: 'Scorer'});

                            // Collect Assists from each goal.
                            let assistsObj = _.filter(playID.players, (o) => o.playerType === 'Assist'),
                                tempAssistArr = [];

                            _.forEach(assistsObj, (o) => tempAssistArr.push(o.player.fullName));

                            scoringSummary[v] = {
                                team: playID.team.name,
                                scorer: scorerObj.player.fullName,
                                assists: tempAssistArr.join(', '),
                                period: playID.about.ordinalNum,
                                time: playID.about.periodTime,
                                typeOfGoal: playID.result.secondaryType,
                                strength: playID.result.strength.name
                            };
                        }
                    });
                });

                //Group By Periods.
                scoringSummary = _.groupBy(scoringSummary, 'period');

                _.forEach(scoringSummary, function(periodObj, period) {
                    summaryBody.push(<div key={periodObj[0].time} className='desc'>{period}</div>)
                    _.forEach(periodObj, function(data, i) {
                        summaryBody.push(
                            <div className='scoringSummary' key={Math.random()}>
                                <div><span>{data.team}</span></div>
                                <div className='scorerInfo'>
                                  <div><span>{data.scorer}</span></div>
                                  <div><span>{data.assists}</span></div>
                                  <div><span>{data.time}</span></div>
                                  <div><span>{data.typeOfGoal}</span></div>
                                </div>
                            </div>)
                    });
                });

                writeToScreen();
            }

            function getScheduledSummary() {
                let p = new Promise(function (resolve, reject) {
                    axios.get('https://statsapi.web.nhl.com/api/v1/standings?expand=standings.record,standings.team,standings.division,standings.conference&season=20162017')
                        .then(res => resolve(res.data))
                        .catch(err => console.log(err));
                });

                let home = gameData.teams.away.abbreviation,
                    away = gameData.teams.away.abbreviation;

                p.then((data) => {
                    let standings = data.records,
                        result = null,
                        teamInfo = [];

                    _.forEach(gameData.teams, function(team, id) {
                        _.forEach(standings, function(standingsObj, i) {
                            result = _.filter(standingsObj.teamRecords, function(e) {
                                return e.team.abbreviation === team.abbreviation;
                            });

                            if(result.length > 0) teamInfo.push(result);
                        });
                    });

                    summaryBody.push(<div key={gameData.venue.name}>
                        <div className='desc venue'>{gameData.venue.name}</div>
                    </div>);

                    _.forEach(teamInfo, function(team, id) {
                        let teamResult =_.head(team);
                        console.log(teamResult);

                        summaryBody.push(
                            <div key={id} className='teamInfoTable'>
                                <div className='teamName'>{teamResult.clinchIndicator} {teamResult.team.teamName} ({teamResult.leagueRecord.wins}-{teamResult.leagueRecord.losses}-{teamResult.leagueRecord.ot})</div>
                                <div className='row'>
                                    <table>
                                        <tr>
                                            <thead>
                                                <th>GP</th>
                                                <th>PTS</th>
                                                <th>GS</th>
                                                <th>GA</th>
                                                <th>Div. Ranking</th>
                                                <th>Conf. Ranking</th>
                                            </thead>
                                        </tr>
                                        <tr>
                                            <td>{teamResult.gamesPlayed}</td>
                                            <td>{teamResult.points}</td>
                                            <td>{teamResult.goalsScored}</td>
                                            <td>{teamResult.goalsAgainst}</td>
                                            <td>{teamResult.divisionRank}</td>
                                            <td>{teamResult.conferenceRank}</td>
                                        </tr>
                                    </table>
                                </div>
                            </div>)
                    });

                    writeToScreen();

                    // _.forEach(teamResult, function(team, id) {
                    //     summaryBody.push(<div key={id}>
                    //         <div>{team.team.teamName} : {team.points} PTS.</div>
                    //     </div>)
                    // });

                    // console.log('DIVISION STANDINGS');
                    // console.log('=================================================');
                    // _.forEach(standings, function(teamObj, id) {
                    //     // console.log(teamObj.division.name);
                    //     // console.log('-------------------------------------------');
                    //     _.forEach(teamObj.teamRecords, function(team, i) {
                    //         console.log(team.team.abbreviation, _.filter(team.team.abbreviation, {'abbreviation': team.team.abbreviation}) );
                    //         if( (_.filter(team.team, {'abbreviation': 'NJD'}).length > 1)) {
                    //             console.log(_.filter(team, {'abbreviation': 'NJD'}));
                    //         }
                    // //         // console.log(team.divisionRank, ':', team.team.name, team.points, 'PTS.', '/ Conference Rank:', team.conferenceRank);
                    //     });
                    //     // console.log('-------------------------------------------');
                    // });
                });
            }

            if(gameData.status.detailedState === 'Scheduled' || gameData.status.detailedState === 'Pre-Game') {
                getScheduledSummary();
            } else {
                getScoringSummary();
            }

            // if(lineScore.currentPeriodTimeRemaining === "Final") {
            //     if(lineScore.hasShootout) {
            //         console.log(lineScore.currentPeriodTimeRemaining, "(" + lineScore.currentPeriodOrdinal + ")");
            //     } else {
            //         console.log(lineScore.currentPeriodTimeRemaining);
            //     }
            // } else {
            //     console.log(lineScore.currentPeriodTimeRemaining, lineScore.currentPeriodOrdinal);
            // }

            function writeToScreen() {
                const away = { backgroundImage: 'url("/images/logos/' + lineScore.teams.away.team.abbreviation +'.png")' },
                    home = { backgroundImage: 'url("/images/logos/' + lineScore.teams.home.team.abbreviation +'.png")' };

                if(lineScore.currentPeriodTimeRemaining === 'Final') {
                    //Game has completed.
                    gameStatus = lineScore.currentPeriodTimeRemaining + (lineScore.currentPeriodOrdinal === 'SO' || lineScore.currentPeriodOrdinal === 'OT' ? ' (' + lineScore.currentPeriodOrdinal + ')' : '');
                } else if(lineScore.currentPeriod > 0) {
                    //Game is in progress.
                    gameStatus = lineScore.currentPeriodTimeRemaining + ' ' + lineScore.currentPeriodOrdinal;
                } else if(lineScore.currentPeriod === 0) {
                    //Game has not started yet.
                    gameStatus = moment(gameData.datetime.dateTime).format('h.mm a');
                    homeScore = '-';
                    awayScore = '-';
                }

                gameContentBody.push(
                    <div key={gameID}>
                      <div className='teamBlockContainer'>
                        <div className="status">{gameStatus}</div>
                        <div className="teamBlock" style={away}>
                            <div>
                                <span>{awayScore}</span>
                            </div>
                        </div>
                        <div className="teamBlock" style={home}>
                            <div>
                                <span>{homeScore}</span>
                            </div>
                        </div>
                      </div>
                      <div className="scoringSummaryContainer">
                          {summaryBody}
                      </div>
                    </div>);

                self.setState({gameContentBody});
            }
        });
    }

    //Link to NHL.com to get game data using game's ID
    viewGameInfo(gameID) {
        return function () {
            window.open('https://www.nhl.com/gamecenter/' + gameID + '/recap/box-score');
        }.bind(this);
    }

    render() {
        const game = this.props.gameData;
        this.state.game = game.id;

        return (
            <div className="scoreTable" onClick={this.openModal}>
                <div className="scores">
                    <div className="team">{game.abvr_atn}</div>
                    <div className="score">{game.ats}</div>
                    <br />
                    <div className="team">{game.abvr_htn}</div>
                    <div className="score">{game.hts}</div>
                </div>
                {game.bsc === 'progress' ? (
                    <div className="timeRemaining">{game.ts}</div>
                ) : (
                    <div className="timeRemaining">{game.gameTime}<br />{game.modifiedDate}</div>
                )}

                <Modal
                    isOpen={this.state.modalIsOpen}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    style={this.state.modalStyle}
                    contentLabel="Example Modal">

                    {this.state.modalIsOpen ? (
                        <div key={game.id}>{this.state.gameContentBody}</div>
                    ) : ''}
                </Modal>
            </div>
        );
    }
}
