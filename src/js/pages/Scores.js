import React from "react";
import axios from 'axios';

// import Article from "../components/Article";

export default class Scores extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      liveGameSection: null,
      completedGameSection: null,
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
      CAL: 'Calgary',
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

        // Filter different dates.
        let liveGames = [],
            completedGames = [],
            futureGames = [];

        _.forEach(gameData, function(v,k){
          // replace date with fixed date objective
          getDate(v);

          // console.log(v);

          if(v.bsc === 'progress') {
            liveGames.push(v);
          } else if(v.bsc !== 'progress' || _.startsWith(v, "F")) {
            completedGames.push(v);
          } else {
            futureGames.push(v);
          }
        });

        function getDate(dateObj) {
          const today = moment(),
                dateFormat = 'h.mm a';
          let dateValue = null,
              isDateValid = null,
              momentedDate = null;

          if(!_.startsWith(dateObj.bs, "F")) {
            isDateValid = isDateValid = moment(moment(dateObj.bs, dateFormat).format(dateFormat), dateFormat,true).isValid();
            dateValue = isDateValid ? moment(dateObj.bs, dateFormat).add('3', 'hours').format(dateFormat) : null;


          } else {
            // console.log(dateObj);

            console.log("The Date to be checked:", moment(dateObj.ts));
            console.log(dateObj.ts);
            console.log(today.diff(moment(dateObj.ts), 'days'));

            //separating dates
          }



        }

        // console.log("Live:", liveGames);
        // console.log("Completed:", completedGames);

        let theDate = {};

        _.forEach(dates, function(date) {
            theDate[date] = {};
        });

        _.forEach(theDate, function(dateObj, date) {
          _.forEach(completedGames, function(v){
            // console.log(v.ts);
            if(date === v.ts) {
              dateObj[v.id] = v;
            }
          });
        });

        // console.log(theDate);

        // console.log("Future:", futureGames);

        let liveGameSection = this.renderGameOutput(liveGames),
            completedGameSection = this.renderGameOutput(completedGames),
            futureGameSection = this.renderGameOutput(futureGames);

        this.setState({ liveGameSection });
        this.setState({ completedGameSection });
        this.setState({ futureGameSection });
      });
  }
  //Build out HTML object of Scores.
  renderGameOutput(gameGroup) {
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
              <div className="timeRemaining">{game.bs}<br />{this.adjustDate(game)}</div>
            )}
          </div>
        </div>
      )
    });
  }
  //Link to NHL.com to get game data using game's ID
  viewGameInfo(gameID) {
    return function() {
      window.open('https://www.nhl.com/gamecenter/' + gameID + '/recap/box-score');
    }.bind(this);
  }
  //Check the date/time input and return accordingly.
  adjustDate(date) {
    // console.log(date);
    // const dateFormat = 'h.mm a',
    //       isDateValid = moment(moment(date, dateFormat).format(dateFormat), dateFormat,true).isValid();

    if(date.bsc === 'final') {
      return moment(date.ts, "MM/DD").format("ddd M/D");
    }

    // if(isDateValid) {
    //   return moment(date, dateFormat).add('3', 'hours').format(dateFormat); //For Future Dates.
    // } else {
    //   return date;
    // }
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
            <div className="dayContainer">
              {this.state.liveGameSection}
            </div>
            <hr />
            <h2>Completed</h2>
            <div className="dayContainer">
              {this.state.completedGameSection}
            </div>
            <hr />
          <h2>Future</h2>
            <div className="dayContainer">
            {this.state.futureGameSection}
            </div>
          </div>
      </div>
    );
  }
}
