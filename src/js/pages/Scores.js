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
  componentWillMount() {
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
      LA:  'Los Angeles',
      MIN: 'Minnesota',
      MTL: 'Montréal',
      NAS: 'Nashville',
      NJD: 'New Jersey',
      NYI: 'NY Islanders',
      NYR: 'NY Rangers',
      OTT: 'Ottawa',
      PHI: 'Philadelphia',
      PIT: 'Pittsburgh',
      SJ:  'San Jose',
      STL: 'St Louis',
      TB:  'Tampa Bay',
      TOR: 'Toronto',
      VAN: 'Vancouver',
      WAS: 'Washington',
      WPG: 'Winnipeg'
    }

    axios.get('http://live.nhle.com/GameData/RegularSeasonScoreboardv3.jsonp')
      .then(res => {
        let jsonGameData = res.data,
            dates = [],
            datesObjects = null;

        //Remove wrapping 'loadScoreboard()' method.
        jsonGameData = jsonGameData.replace('loadScoreboard(', '');
        jsonGameData = jsonGameData.substring(0, jsonGameData.length - 1);

        //Convert to JSON.
        jsonGameData = JSON.parse(jsonGameData);

        const gameData = jsonGameData.games;

        // Collect different dates for filtering.
        datesObjects = _.uniqBy(gameData, "ts");
        datesObjects.map(e => dates.push(e.ts));

        //Add abbreviation key to game objects for display purposes.
        _.forEach(gameData, function(v,k) {
          v['abvr_atn'] = "",
          v['abvr_htn'] = "";

          _.find(teams, function(val, key) {
            if(v.atn === val) {
              v['abvr_atn'] = key;
              return false;
            }
          });

          _.find(teams, function(val, key) {
            if(v.htn === val) {
              v['abvr_htn'] = key;
              return false;
            }
          });
        });

        function getDate(dateObj) {
          //If game is currently in progress, do not modify date;
          if(dateObj.bsc === 'progress') return dateObj;

          //Get date string, modify it to support MomentJS, then apply.
          const dateFormat = "h.mm a";
          let submittedDate = "",
              convertedDate = "",
              diffValue = "",
              isSameOrAfter = false,
              testDateVal = dateObj.ts.substr(dateObj.ts.length - 4).trim();

              //Create string to check
              testDateVal = moment(testDateVal, "MM/DD");

              //If date string matches today, or actual value "TODAY" is registered, then force "TODAY".
              if((moment().isSame(testDateVal)) || dateObj.ts === "TODAY") {
                dateObj.ts = "TODAY";
              }

          submittedDate = dateObj.ts === "TODAY" ? moment() : dateObj.ts.substr(dateObj.ts.length - 4);
          convertedDate = moment(submittedDate, "MM/DD");
          isSameOrAfter = moment().isSameOrAfter(convertedDate);

          //Determine if the game is in the future or has past. Check if game has ended.
          if(isSameOrAfter) {
            //Get difference of days between today and the converted date.
            diffValue = moment().diff(convertedDate, "days");

            //Game has ended & is not today.
            if(diffValue > 0) {
              dateObj["hasEnded"] = true;
              dateObj["gameTime"] = "FINAL";
              dateObj["modifiedDate"] = moment(dateObj.ts, "MM/DD").format("ddd M/D");
            }
            //Game has ended and is today.
            // && moment().isSame(convertedDate, "day") <-- might be necessary.
            else if (_.startsWith(dateObj.bs, "F")) {
              dateObj["hasEnded"] = true;
              dateObj["gameTime"] = "FINAL";
            }
            //Game is today.
            else if(moment().isSame(convertedDate, "day")) {
              dateObj["gameTime"] = moment(dateObj.bs, dateFormat).add('3', 'hours').format(dateFormat);
            }
          } else {
              //Game is in the future.
              dateObj["hasEnded"] = false;
              dateObj["gameTime"] = moment(dateObj.bs, dateFormat).add('3', 'hours').format(dateFormat);
              dateObj["modifiedDate"] = moment(dateObj.ts, "MM/DD").format("ddd M/D");
          }

          return dateObj;
        }

        // Filter different dates.
        let liveGames = [],
            completedGames = [],
            todayGames = [],
            futureGames = [];

        //Replace date with fixed date objective
        _.forEach(gameData, function(v,k){
          v = getDate(v);

          if(v.bsc === 'progress') {
            liveGames.push(v);
          } else if(v.ts === 'TODAY') {
            todayGames.push(v);
          } else if(v.hasEnded) {
            completedGames.push(v);
          } else if(v.ts !== 'TODAY' && !v.hasEnded) {
            futureGames.push(v);
          }
        });

        //Experimenting with grouping dates.
        completedGames = _.groupBy(completedGames, function(obj) {
          return obj.ts;
        });

        let liveGameSection = this.renderGameOutput(liveGames),
            completedGameSection = [],
            todayGameSection = this.renderGameOutput(todayGames),
            futureGameSection = this.renderGameOutput(futureGames);

        for(var id in completedGames) {
          completedGameSection.push(this.renderGameOutput(completedGames[id], true));
        }

        this.setState({ liveGameSection });
        this.setState({ todayGameSection });
        this.setState({ completedGameSection });
        this.setState({ futureGameSection });
      });
  }
  //Build out HTML object of Scores.
  renderGameOutput(gameGroup, supportsGroups) {
    if(gameGroup.length == 0) {
      return (<h4>No games listed.</h4>);
    } else {
      if(supportsGroups) {
        return gameGroup.map((game, id) => {
          return (
            <div key={id} className="scoreContainer">
              <div className="scoreTable" onClick={this.viewGameInfo(game.id)}>
                <div className="scores">
                  <div className="team">{game.abvr_atn}</div> <div className="score">{game.ats}</div> <br />
                  <div className="team">{game.abvr_htn}</div> <div className="score">{game.hts}</div>
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
      } else {
        return gameGroup.map((game, id) => {
          return (
            <div key={id} className="scoreContainer">
              <div className="scoreTable" onClick={this.viewGameInfo(game.id)}>
                <div className="scores">
                  <div className="team">{game.abvr_atn}</div> <div className="score">{game.ats}</div> <br />
                  <div className="team">{game.abvr_htn}</div> <div className="score">{game.hts}</div>
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
  }
  //Link to NHL.com to get game data using game's ID
  viewGameInfo(gameID) {
    return function() {
      window.open('https://www.nhl.com/gamecenter/' + gameID + '/recap/box-score');
    }.bind(this);
  }
  render() {
    // const gameComponent = todos.map((todo) => {
    //     return <Todo key={todo.id} {...todo}/>;
    // });

    return (
      <div>
        <h1>Scores</h1>
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
