import React from 'react';
import axios from 'axios';
import Modal from 'react-modal';

const customStyles = {
    content : {
        top                   : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)',
        width                 : '50%',
        height                : '50%'
    }
};

export default class GameModal extends React.Component {
    constructor() {
        super();

        this.state = {
            modalIsOpen: false,
            gameContentBody: null,
            game: null
        };

        this.openModal = this.openModal.bind(this);
        this.afterOpenModal = this.afterOpenModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    openModal() {
        this.setState({modalIsOpen: true});
    }

    afterOpenModal() {
        this.getBoxscoreData(this.state.game);
    }

    closeModal() {
        this.setState({modalIsOpen: false});
    }

    getBoxscoreData(gameID) {
        let p = new Promise(function (resolve, reject) {
            axios.get('http://statsapi.web.nhl.com/api/v1/game/' + gameID + '/feed/live')
                .then(res => resolve(res.data));
        });

        p.then((data) => {
            let gameData = data.gameData,
                liveData = data.liveData,
                gameContentBody = [];

            // let goals = [],
            //     scorerObj = "";

            // _.forEach(liveData.plays.scoringPlays, function(id) {
            //     _.forEach(liveData.plays.allPlays, function(playID, v) {
            //         if(id == v) {
            //             scorerObj = _.find(playID.players, {playerType: 'Scorer'});
            //             console.log("Team:", playID.team.name);
            //             console.log("Scorer:", scorerObj.player.fullName);
            //             console.log("Period:", playID.about.ordinalNum);
            //             console.log("Time:", playID.about.periodTime);
            //             console.log("Type of Goal:", playID.result.secondaryType);
            //             console.log("Strength:", playID.result.strength.name);
            //             console.log("-----------------");
            //         }
            //     });
            // });
            //
            // console.log(liveData.linescore.teams.away.team.abbreviation, ":", liveData.linescore.teams.away.goals);
            // console.log(liveData.linescore.teams.home.team.abbreviation, ":", liveData.linescore.teams.home.goals);
            //
            // if(liveData.linescore.currentPeriodTimeRemaining === "Final") {
            //     if(liveData.linescore.hasShootout) {
            //         console.log(liveData.linescore.currentPeriodTimeRemaining, "(" + liveData.linescore.currentPeriodOrdinal + ")");
            //     } else {
            //         console.log(liveData.linescore.currentPeriodTimeRemaining);
            //     }
            // } else {
            //     console.log(liveData.linescore.currentPeriodTimeRemaining, liveData.linescore.currentPeriodOrdinal);
            // }

            // console.log(liveData);
            // console.log(liveData.linescore.teams.away.team.abbreviation, ":", liveData.linescore.teams.away.goals);
            // console.log(liveData.linescore.teams.home.team.abbreviation, ":", liveData.linescore.teams.home.goals);

            // modalContent.push(<div id={gameID}>
            //     <div>{liveData.linescore.teams.away.team.abbreviation} : {liveData.linescore.teams.away.goals}</div>
            //     <div>{liveData.linescore.teams.home.team.abbreviation} : {liveData.linescore.teams.home.goals}</div>
            // </div>);

            _.forEach(liveData.linescore.teams, function(teamObj, id) {
                console.log(teamObj, id);
                gameContentBody.push(<div key={id}>
                    <span>{teamObj.team.abbreviation}</span>: <span>{teamObj.goals}</span>
                </div>);
            });

            this.setState({gameContentBody});
        });
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
                    style={customStyles}
                    contentLabel="Example Modal">

                    {this.state.modalIsOpen ? (
                        <div key={game.id}>{this.state.gameContentBody}</div>
                    ) : ''}
                    <button onClick={this.closeModal}>close</button>
                </Modal>
            </div>
        );
    }
}