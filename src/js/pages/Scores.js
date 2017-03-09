import React from "react";
import axios from 'axios';

// import Article from "../components/Article";

export default class Scores extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      gameData: [],
      dates: [],
      objective: [],
      scoreSection: null
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
            datesObjects = null;

        //Remove wrapping 'loadScoreboard()' method.
        jsonGameData = jsonGameData.replace('loadScoreboard(', '');
        jsonGameData = jsonGameData.substring(0, jsonGameData.length - 1);

        //Convert to JSON.
        jsonGameData = JSON.parse(jsonGameData);

        const gameData = jsonGameData.games;

        // Collect different dates for filtering.
        datesObjects = _.uniqBy(gameData, "ts");
        datesObjects.map(e => this.state.dates.push(e.ts))

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

        this.setState({ gameData });

        // Filter different dates.
        let objective = [];
        _.forEach(this.state.dates, function(v,k){
          objective.push(gameData.filter(date => date.ts == v));
        })

        this.setState({ objective });

        this.renderScores();
      });
  }
  renderScores() {
    const scoreSection = this.state.objective.map((game, id) => {
      return (
        <div key={id} className="dayContainer">
          <h3>{game[id].ts}</h3>
          {game.map((gameDetails, i) => {
            return (
              <div key={i} className="scoreContainer">
                <div className="scoreTable">
                  <div className="scores">
                    <div className="team">{gameDetails.abvr_atn}</div> <div className="score">{gameDetails.ats}</div> <br />
                  <div className="team">{gameDetails.abvr_htn}</div> <div className="score">{gameDetails.hts}</div>
                  </div>
                  <div className="timeRemaining">{this.adjustDate(gameDetails.bs)}</div>
                </div>
              </div>
            )
          })}
        </div>
      )
    });

    this.setState({ scoreSection });
  }
  adjustDate(date) {
    const dateFormat = 'h.mm a',
          isDateValid = moment(moment(date, dateFormat).format(dateFormat), dateFormat,true).isValid();

    if(isDateValid) {
      return moment(date, dateFormat).add('3', 'hours').format(dateFormat);
    } else {
      return date;
    }
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
            {this.state.scoreSection}
          </div>
      </div>
    );
  }
}
