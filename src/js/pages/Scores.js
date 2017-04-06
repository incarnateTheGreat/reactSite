import React from "react";
import axios from 'axios';

import GameModal from "../components/GameModal";

export default class Scores extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            liveGameSection: null,
            completedGameSection: null,
            todayGameSection: null,
            futureGameSection: null
        };

        this.timeoutOpenLoader = null;
        this.timeoutCloseLoader = null;
    }

    //Return NHL Scoreboard data.
    loadScoreData() {
      var self = this;

      return new Promise(function(resolve, reject) {
        axios.get('http://live.nhle.com/GameData/RegularSeasonScoreboardv3.jsonp')
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
      const teams = {
          ANA: 'Anaheim',
          ARI: 'Arizona',
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
          FLA: 'Florida',
          LAK: 'Los Angeles',
          MIN: 'Minnesota',
          MTL: 'Montréal',
          NSH: 'Nashville',
          NJD: 'New Jersey',
          NYI: 'NY Islanders',
          NYR: 'NY Rangers',
          OTT: 'Ottawa',
          PHI: 'Philadelphia',
          PIT: 'Pittsburgh',
          SJS: 'San Jose',
          STL: 'St Louis',
          TBL: 'Tampa Bay',
          TOR: 'Toronto',
          VAN: 'Vancouver',
          VEG: 'Vegas Golden Knights',
          WSH: 'Washington',
          WPG: 'Winnipeg'
      };

      let p = this.loadScoreData();

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
            _.forEach(gameData, function (v) {
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
                const dateFormat = "h.mm A";
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
            _.forEach(gameData, function (v) {
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
            completedGames = _.groupBy(completedGames, obj => obj.ts);

            //To show the latest day first, reverse the order of the objects (only if more than 1 day of data is available).
            if(_.keys(completedGames).length > 1) {
                let tempArr = {},
                    reversedKeys = _.keys(completedGames).reverse();

                _.forEach(reversedKeys, function(date) {
                    _.forEach(completedGames, (o, k) => (k == date ? tempArr[k] = o : ""))
                });

                completedGames = tempArr;
            }

            //Group Future Games by Day.
            futureGames = _.groupBy(futureGames, obj => obj.ts);

            //Set up Section variables to inject into Render.
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

            //Set Render States for each section.
            this.setState({liveGameSection});
            this.setState({todayGameSection});
            this.setState({completedGameSection});
            this.setState({futureGameSection});

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
      });
    }

    componentWillUnmount() {
      clearTimeout(this.timeoutOpenLoader);
      clearTimeout(this.timeoutCloseLoader);
    }

    componentWillMount() {
        this.buildScoreboard();

        //Get and create Team Data object.
        axios.get('http://statsapi.web.nhl.com/api/v1/teams')
            .then(res => {
                let teams = res.data.teams;
                const teamObj = {},
                      yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD'),
                      tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');

                _.forEach(teams, function(team) {
                    teamObj[team.name] = team;
                });

                axios.get('https://statsapi.web.nhl.com/api/v1/schedule?startDate='+ yesterday +'&endDate='+ tomorrow +'')
                    .then(res => {
                        let dates = res.data.dates,
                            today = moment().format('dddd MM/DD'),
                            diffValue = null,
                            convertedDate = null;

                        _.forEach(dates, function (date, id) {
                            console.log('-------------------------------');
                            console.log("***", moment(date.date).format('dddd MM/DD'), "***");
                            console.log('-------------------------------');
                            _.forEach(date.games, function(o, v) {
                                // console.log(o);
                                console.log("==============================================");
                                // console.log("Date:", moment(o.gameDate).format('dddd MM/DD'));
                                console.log("Venue:", o.venue.name);
                                console.log("Status:", o.status.detailedState);
                                console.log(teamObj[o.teams.away.team.name].abbreviation,":", o.teams.away.score);
                                console.log(teamObj[o.teams.home.team.name].abbreviation,":", o.teams.home.score);
                            });
                        });
                    });
            });

    }

    getNumberOfColumns(games) {
        return "completedGamesGroupContainer col-md-" + (Object.keys(games).length > 1 ? "6" : "12");
    }

    //Build out HTML object of Scores.
    renderGameOutput(gameGroup) {
        if (gameGroup.length == 0) {
            return (<h4 key="{gameGroup.length}">No games listed.</h4>);
        } else {
            return gameGroup.map((game, id) => {
                return (
                    <GameModal key={id} gameData={game} />
                )
            });
        }
    }

    render() {
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
                    <h2>Today: {moment().format("dddd M/DD")}</h2>
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
