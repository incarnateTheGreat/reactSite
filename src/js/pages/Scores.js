import React from "react";
import axios from 'axios';

// import Article from "../components/Article";

export default class Scores extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      gameData: []
    };
  }
  componentDidMount() {
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
        let jsonGameData = res.data;

        //Remove wrapping 'loadScoreboard()' method.
        jsonGameData = jsonGameData.replace('loadScoreboard(', '');
        jsonGameData = jsonGameData.substring(0, jsonGameData.length - 1);

        //Convert to JSON.
        jsonGameData = JSON.parse(jsonGameData);

        const gameData = jsonGameData.games;

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
      });
  }
  render() {
    // const gameComponent = todos.map((todo) => {
    //     return <Todo key={todo.id} {...todo}/>;
    // });

    console.log(moment().format("dddd M/D"));

    return (
      <div>
        <h1>Scores</h1>
        <hr/>
        <h2>NHL Scores</h2>
        <div class="scoreTableContainer">
          {this.state.gameData.map((game, id) =>
            <div key={id}>
              {/* <h3>{game.ts}</h3> */}
              <div class="scoreTable">
                <div class="scores">
                  <div class="team">{game.abvr_atn}</div> <div class="score">{game.ats}</div> <br />
                  <div class="team">{game.abvr_htn}</div> <div class="score">{game.hts}</div>
                </div>
                <div class="timeRemaining">{game.bs === 'FINAL' ? 'F' : game.bs}</div>
              </div>
            </div>
            )}
        </div>
      </div>
    );
  }
}
