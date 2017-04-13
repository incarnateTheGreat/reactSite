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
            awayTeam = data.away_name_abbrev,
            homeTeam = data.home_name_abbrev,
            awayRuns = data.linescore.r.away,
            homeRuns = data.linescore.r.home,
            awayHits = data.linescore.h.away,
            homeHits = data.linescore.h.home,
            awayErrors = data.linescore.e.away,
            homeErrors = data.linescore.e.home;

        writeToScreen();

        function writeToScreen() {
            // const away = { backgroundImage: 'url("/images/logos/' + lineScore.teams.away.team.abbreviation +'.png")' },
            //       home = { backgroundImage: 'url("/images/logos/' + lineScore.teams.home.team.abbreviation +'.png")' };

            //Apply Team Names.
            gameContentBody.push(<div className='boxScore' key={Math.random()}>
              <div className='inningContainer'>
                  <div>&nbsp;</div>
                  <div className='teamName'>{awayTeam}</div>
                  <div className='teamName'>{homeTeam}</div>
              </div>
            </div>);

            //Apply Inning Linescores if there's any data.
            //TODO: GO HIGHER UP IN 'LINESCORE' TO GET MORE DETAILED INFORMATION ABOUT WHAT INNING THE GAME IS IN AND IF IT'S TOP OR BOTTOM
            if(data.linescore.inning.length > 1) {
                _.forEach(data.linescore.inning, function(inning, id) {
                    gameContentBody.push(<div className='boxScore' key={Math.random()}>
                        <div className='inningContainer'>
                            <div className='inning'>{id+1}</div>
                            <div className='scoreBox topInning'>{inning.away}</div>
                            <div className='scoreBox bottomInning'>{!inning.home && data.status.status === 'Final' ? ('X') : inning.home}</div>
                        </div>
                    </div>);
                });
            }

            //Apply Totals.
            gameContentBody.push(<div className='boxScore totals' key={Math.random()}>
              <div className='inningContainer'>
                  <div className='inning'>R</div>
                  <div>{awayRuns}</div>
                  <div>{homeRuns}</div>
              </div>
              <div className='inningContainer'>
                  <div className='inning'>H</div>
                  <div>{awayHits}</div>
                  <div>{homeHits}</div>
              </div>
              <div className='inningContainer'>
                  <div className='inning'>E</div>
                  <div>{awayErrors}</div>
                  <div>{homeErrors}</div>
              </div>
            </div>);

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
