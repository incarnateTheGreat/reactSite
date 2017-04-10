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


                });
            }

            function writeToScreen() {
                // const away = { backgroundImage: 'url("/images/logos/' + lineScore.teams.away.team.abbreviation +'.png")' },
                //       home = { backgroundImage: 'url("/images/logos/' + lineScore.teams.home.team.abbreviation +'.png")' };



                gameContentBody.push(<div key={gameID}>
                    stuff goes here.
                </div>);

                console.log(gameContentBody);

                self.setState({gameContentBody});
            }
        });
    }

    render() {
        const game = this.props.gameData;
        this.state.game = game.id;

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
