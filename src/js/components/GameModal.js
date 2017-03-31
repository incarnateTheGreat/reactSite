import React from 'react';
import axios from 'axios';
import Modal from 'react-modal';

const customStyles = {
    content: {
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
                scoringSummaryBody = [];

            function getScoringSummary() {
                _.forEach(liveData.plays.scoringPlays, function(id) {
                    _.forEach(liveData.plays.allPlays, function(playID, v) {
                        if(id == v) {
                            scorerObj = _.find(playID.players, {playerType: 'Scorer'});
                            // console.log("Team:", playID.team.triCode);
                            // console.log("Scorer:", scorerObj.player.fullName);
                            // console.log("Period:", playID.about.ordinalNum);
                            // console.log("Time:", playID.about.periodTime);
                            // console.log("Type of Goal:", playID.result.secondaryType);
                            // console.log("Strength:", playID.result.strength.name);
                            // console.log("-----------------");

                            // Collect Assists from each goal.
                            let assistsObj = _.filter(playID.players, (o) => o.playerType === 'Assist'),
                                tempAssistArr = [];

                            _.forEach(assistsObj, (o) => tempAssistArr.push(o.player.fullName));

                            scoringSummary[v] = {
                                team: playID.team.triCode,
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
            }

            getScoringSummary();

            // if(lineScore.currentPeriodTimeRemaining === "Final") {
            //     if(lineScore.hasShootout) {
            //         console.log(lineScore.currentPeriodTimeRemaining, "(" + lineScore.currentPeriodOrdinal + ")");
            //     } else {
            //         console.log(lineScore.currentPeriodTimeRemaining);
            //     }
            // } else {
            //     console.log(lineScore.currentPeriodTimeRemaining, lineScore.currentPeriodOrdinal);
            // }

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

            //Group By Periods.
            scoringSummary = _.groupBy(scoringSummary, 'period');

            _.forEach(scoringSummary, function(periodObj, period) {
              scoringSummaryBody.push(<div key={periodObj[0].time} className='period'>{period}</div>)
                _.forEach(periodObj, function(data, i) {
                    scoringSummaryBody.push(
                      <div className={i % 2 ? 'scoringSummary even' : 'scoringSummary odd'} key={Math.random()}>
                        <div><span>{data.team}</span>: <span>{data.scorer}</span></div>
                        <div><span>{data.assists}</span></div>
                        <div><span>{data.time}</span></div>
                        <div><span>{data.typeOfGoal}</span></div>
                      </div>)
                });
            });

            gameContentBody.push(
              <div key={gameID}>
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
                <div className="scoringSummaryContainer">
                    {scoringSummaryBody}
                </div>
              </div>);

            this.setState({gameContentBody});
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
