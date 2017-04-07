import React from "react";
import axios from 'axios';

export default class Scores_MLB extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            liveGameSection: null,
            completedGameSection: null,
            todayGameSection: null,
            futureGameSection: null,
            gamesSection: null
        };

        this.timeoutOpenLoader = null;
        this.timeoutCloseLoader = null;
    }

    //Return MLB Scoreboard data.
    loadScoreData() {
        var self = this;

        return new Promise(function(resolve, reject) {
            let date = moment(),
                year = date.format('YYYY'),
                month = date.format('MM'),
                day = date.format('DD');

            axios.get('http://mlb.mlb.com/gdcross/components/game/mlb/year_'+ year +'/month_'+ month +'/day_'+ day +'/master_scoreboard.json')
                .then(res => resolve(res.data))
                .catch(err => {
                    setTimeout(function(){
                        console.log(err, 'Trying again');
                        self.buildScoreboard();
                    }, 3000);
                });
        });
    }

    buildScoreboard() {
        let p = this.loadScoreData(),
            self = this;

        p.then((scoreData) => {
            console.log("Data Updated.");

            let gameData = scoreData.data.games;

            // Filter different dates.
            let gamesSection = [];

            _.forEach(gameData.game, function(game, id) {
                gamesSection.push(<div key={id}>
                    {self.renderGameOutput(game)}
                </div>);
            });

            this.setState({gamesSection});
        });
    }

    componentWillMount() {
        this.buildScoreboard();
    }

    getNumberOfColumns(games) {
        return "completedGamesGroupContainer col-md-" + (Object.keys(games).length > 1 ? "6" : "12");
    }

    //Build out HTML object of Scores.
    renderGameOutput(game) {
        let gameStatus = '',
            homeScore = '',
            awayScore = '';

        if (game.length == 0) {
            return (<h4 key="{game.length}">No games listed.</h4>);
        } else {
            if(game.status.ind === 'P' || game.status.ind === 'F') {
                //Pre-Game or Final
                gameStatus = game.status.status;
            } else if(game.status.ind === 'DR') {
                //Postponed
                // gameStatus = game.description;
                gameStatus = "PPD";
            } else if(game.status.ind === 'IR') {
                //Temporary Delay
                gameStatus = game.status.inning_state + ' ' + game.status.inning + ' -- ' + game.status.status + ' (' + game.status.reason +')';
            } else if(game.status.ind === 'I') {
                //In Progress
                gameStatus = game.status.inning_state + ' ' + game.status.inning;
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
                <div className="scoreTable">
                    <div className="scores">
                        <div className="team">{game.away_name_abbrev}</div>
                      <div className="score">{awayScore}</div>
                        <br />
                        <div className="team">{game.home_name_abbrev}</div>
                      <div className="score">{homeScore}</div>
                    </div>
                    <div className="timeRemaining">{gameStatus}</div>
                </div>
            )
        }
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
                    <h2>Live</h2>
                    <div className="gameGroupContainer">
                        {this.state.gamesSection}
                    </div>
                </div>
            </div>
        );
    }
}
