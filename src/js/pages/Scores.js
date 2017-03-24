import React from "react";
import axios from 'axios';

// import Article from "../components/Article";

export default class Scores extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            liveGameSection: null,
            completedGameSection: null,
            todayGameSection: null,
            futureGameSection: null
        };
    }

    //Return NHL Scoreboard data.
    loadScoreData() {
      return new Promise(function(resolve, reject) {
        axios.get('http://live.nhle.com/GameData/RegularSeasonScoreboardv3.jsonp')
             .then(res => resolve(res.data));
      });
    }

    buildScoreboard() {
      const teams = {
          ANA: 'Anaheim',
          ARI: 'Arizona',
          ATL: 'Atlanta',
          BOS: 'Boston',
          BUF: 'Buffalo',
          CGY: 'Calgary',
          CAR: 'Carolina',
          CHI: 'Chicago',
          COL: 'Colorado',
          CBJ: 'Columbus',
          DAL: 'Dallas',
          DET: 'Detroit',
          EDM: 'Edmonton',
          FLO: 'Florida',
          LA: 'Los Angeles',
          MIN: 'Minnesota',
          MTL: 'Montréal',
          NAS: 'Nashville',
          NJD: 'New Jersey',
          NYI: 'NY Islanders',
          NYR: 'NY Rangers',
          OTT: 'Ottawa',
          PHI: 'Philadelphia',
          PIT: 'Pittsburgh',
          SJ: 'San Jose',
          STL: 'St Louis',
          TB: 'Tampa Bay',
          TOR: 'Toronto',
          VAN: 'Vancouver',
          WAS: 'Washington',
          WPG: 'Winnipeg'
      };

      var p = this.loadScoreData();

      p.then((scoreData) => {
        console.log("Data Updated.");
        let jsonScoreData = scoreData,
            dates = [],
            datesObjects = null;

            //Remove wrapping 'loadScoreboard()' method.
            jsonScoreData = jsonScoreData.replace('loadScoreboard(', '');
            jsonScoreData = jsonScoreData.substring(0, jsonScoreData.length - 1);

            //Convert to JSON.
            jsonScoreData = JSON.parse(jsonScoreData);

            const gameData = jsonScoreData.games;

            // Collect different dates for filtering.
            datesObjects = _.uniqBy(gameData, "ts");
            datesObjects.map(e => dates.push(e.ts));

            //Add abbreviation key to game objects for display purposes.
            _.forEach(gameData, function (v, k) {
                v['abvr_atn'] = "",
                    v['abvr_htn'] = "";

                //Assign abbreviated Away team name to key.
                _.find(teams, function (val, key) {
                    if (v.atn === val) {
                        v['abvr_atn'] = key;
                        return false;
                    }
                });

                //Assign abbreviated Home team name to key.
                _.find(teams, function (val, key) {
                    if (v.htn === val) {
                        v['abvr_htn'] = key;
                        return false;
                    }
                });
            });

            function getDate(dateObj) {
                //If game is currently in progress, do not modify date;
                if (dateObj.bsc === 'progress') return dateObj;

                //Get date string, modify it to support MomentJS, then apply.
                const dateFormat = "h.mm a";
                let submittedDate = "",
                    convertedDate = "",
                    diffValue = "",
                    isSameOrAfter = false,
                    testDateVal = dateObj.ts.substr(dateObj.ts.length - 4).trim(),
                    todayVal = moment().format();

                //Create ISO formats.
                testDateVal = moment(testDateVal, "MM/DD").format();
                todayVal = moment().format();

                //Create Moment objects to compare Today and date variable.
                testDateVal = moment(testDateVal);
                todayVal = moment(todayVal);

                //If date string matches today, or actual value "TODAY" is registered, then force "TODAY".
                if ((todayVal.isSame(testDateVal, "day")) || dateObj.ts === "TODAY") {
                    dateObj.ts = "TODAY";
                }

                submittedDate = dateObj.ts === "TODAY" ? moment() : dateObj.ts.substr(dateObj.ts.length - 4);
                convertedDate = moment(submittedDate, "MM/DD");
                isSameOrAfter = moment().isSameOrAfter(convertedDate);

                //Determine if the game is in the future or has past. Check if game has ended.
                if (isSameOrAfter) {
                    //Get difference of days between today and the converted date.
                    diffValue = moment().diff(convertedDate, "days");

                    //Game has ended & is not today.
                    if (diffValue > 0) {
                        dateObj["hasEnded"] = true;
                        dateObj["gameTime"] = dateObj.bs;
                    }
                    //Game has ended and is today.
                    // && moment().isSame(convertedDate, "day") <-- might be necessary.
                    else if (_.startsWith(dateObj.bs, "F")) {
                        dateObj["hasEnded"] = true;
                        dateObj["gameTime"] = "FINAL";
                    }
                    //Game is today.
                    else if (moment().isSame(convertedDate, "day")) {
                        dateObj["gameTime"] = moment(dateObj.bs, dateFormat).add('3', 'hours').format(dateFormat);
                    }
                } else {
                    //Game is in the future.
                    dateObj["hasEnded"] = false;
                    dateObj["gameTime"] = moment(dateObj.bs, dateFormat).add('3', 'hours').format(dateFormat);
                }

                return dateObj;
            }

            // Filter different dates.
            let liveGames = [],
                completedGames = [],
                todayGames = [],
                futureGames = [];

            //Replace date with fixed date objective
            _.forEach(gameData, function (v, k) {
                v = getDate(v);

                if (v.bsc === 'progress') {
                    liveGames.push(v);
                } else if (v.ts === 'TODAY') {
                    todayGames.push(v);
                } else if (v.hasEnded) {
                    completedGames.push(v);
                } else if (v.ts !== 'TODAY' && !v.hasEnded) {
                    futureGames.push(v);
                }
            });

            //Group Completed Games by Day.
            completedGames = _.groupBy(completedGames, function (obj) {
                return obj.ts;
            });

            //To show the latest day first, reverse the order of the objects (only if more than 1 day of data is available).
            if(_.keys(completedGames).length > 1) {
                let tempArr = {},
                    reversedKeys = _.keys(completedGames).reverse();

                _.forEach(reversedKeys, function(date) {
                    _.forEach(completedGames, (o, k) => (k == date ? tempArr[k] = o : ""))
                });

                completedGames = tempArr;
            }

            futureGames = _.groupBy(futureGames, function (obj) {
                return obj.ts;
            });

            let liveGameSection = this.renderGameOutput(liveGames),
                completedGameSection = [],
                todayGameSection = this.renderGameOutput(todayGames),
                futureGameSection = [];

            //Wrap Completed Games by Day into separate groups.
            if(_.keys(completedGames).length > 0) {
                for (var id in completedGames) {
                    completedGameSection.push(<div key={id} className={this.getNumberOfColumns(completedGames)}>
                        <h3>{id}</h3>
                        {this.renderGameOutput(completedGames[id])}
                    </div>);
                }
            } else {
                completedGameSection.push(this.renderGameOutput([]));
            }

            //Wrap Future Games by Day into separate groups.
            if(_.keys(futureGames).length > 0) {
                for (var id in futureGames) {
                    futureGameSection.push(<div key={id} className={this.getNumberOfColumns(futureGames)}>
                        <h3>{id}</h3>
                        {this.renderGameOutput(futureGames[id])}
                    </div>);
                }
            } else {
                futureGameSection.push(this.renderGameOutput([]));
            }

            this.setState({liveGameSection});
            this.setState({todayGameSection});
            this.setState({completedGameSection});
            this.setState({futureGameSection});

            let loader = document.getElementsByClassName("loader")[0];

            //Display Loader.
            setTimeout(() => loader.setAttribute("style", "opacity: 1"), 30000);

            //Refresh the Scoreboard Data at every interval, then hide Loader.
            setTimeout(() => {
              loader.setAttribute("style", "opacity: 0");
              this.buildScoreboard();
            }, 6000);
      });
    }

    componentWillMount() {
        this.buildScoreboard();
    }

    getBoxscoreData(gameID) {
      return function () {
        axios.get('http://statsapi.web.nhl.com/api/v1/game/' + gameID + '/feed/live')
            .then(res => {
                let gameData = res.data.gameData,
                    liveData = res.data.liveData;

                console.log(res.data.liveData);

                console.log(liveData.linescore.teams.away.team.abbreviation, ":", liveData.linescore.teams.away.goals);
                console.log(liveData.linescore.teams.home.team.abbreviation, ":", liveData.linescore.teams.home.goals);

                if(liveData.linescore.currentPeriodTimeRemaining === "Final") {
                  if(liveData.linescore.hasShootout) {
                    console.log(liveData.linescore.currentPeriodTimeRemaining, "(" + liveData.linescore.currentPeriodOrdinal + ")");
                  } else {
                    console.log(liveData.linescore.currentPeriodTimeRemaining);
                  }
                } else {
                  console.log(liveData.linescore.currentPeriodTimeRemaining, liveData.linescore.currentPeriodOrdinal);
                }

              // }
            });
      }.bind(this);
    }

    //Link to NHL.com to get game data using game's ID
    viewGameInfo(gameID) {
        return function () {
            window.open('https://www.nhl.com/gamecenter/' + gameID + '/recap/box-score');
        }.bind(this);
    }

    getNumberOfColumns(games) {
        let classString = "completedGamesGroupContainer col-md-";

        return classString = classString + (Object.keys(games).length > 1 ? "6" : "12");
    }

    //Build out HTML object of Scores.
    renderGameOutput(gameGroup) {
        if (gameGroup.length == 0) {
            return (<h4 key="{gameGroup.length}">No games listed.</h4>);
        } else {
            return gameGroup.map((game, id) => {
                return (
                    <div key={id} className="scoreContainer">
                        <div className="scoreTable" onClick={this.getBoxscoreData(game.id)}>
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
                        </div>
                    </div>
                )
            });
        }
    }

    render() {
        // const gameComponent = todos.map((todo) => {
        //     return <Todo key={todo.id} {...todo}/>;
        // });

        return (
            <div>
              <div class="loader"></div>
                <h1>Scores</h1>
                <h5>All times in EST</h5>
                <hr/>
                <h2>NHL Scores</h2>
                <div className="scoreTableContainer">
                    <h2>Live</h2>
                    <div className="gameGroupContainer">
                        {this.state.liveGameSection}
                    </div>
                    <hr />
                    <h2>Today</h2>
                    <div className="gameGroupContainer">
                        {this.state.todayGameSection}
                    </div>
                    <hr />
                    <h2>Completed</h2>
                    <div className="gameGroupContainer">
                        {this.state.completedGameSection}
                    </div>
                    <hr />
                    <h2>Future</h2>
                    <div className="gameGroupContainer">
                        {this.state.futureGameSection}
                    </div>
                </div>
            </div>
        );
    }
}
