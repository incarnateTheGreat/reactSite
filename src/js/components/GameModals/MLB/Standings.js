import React from 'react';
import axios from 'axios';
import shallowCompare from 'react-addons-shallow-compare';

export default class Standings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: []
    };
  }

  componentWillReceiveProps(nextProps) {
      let self = this;

      if(!_.isNull(nextProps.data)) {
        axios.get('https://erikberg.com/mlb/standings.xml').then(function (standings) {
            let parseString = require('xml2js').parseString;
            parseString(standings.data, function (err, result) {
                let standingsParsed = result['sports-content'].standing,
                    league = '',
                    teamName = '',
                    teamStats = null,
                    divisions = [],
                    teamRow = [];

                var findObjectByLabel = function(obj, label) {
                    if(obj.label === label) { return obj; }
                    for(var i in obj) {
                        if(obj.hasOwnProperty(i)){
                            var foundLabel = findObjectByLabel(obj[i], label);
                            if(foundLabel) { return foundLabel; }
                        }
                    }
                    return null;
                };

                _.forEach(standingsParsed, function (division) {
                    _.forEach(division.team, function (team) {
                      // team['team-metadata'][0].name[0].$.first + ' ' +
                        teamName =  team['team-metadata'][0].name[0].$.last;
                        // console.log(team['team-stats']);
                        // console.log(team['team-stats'][0]['outcome-totals']);
                        teamStats = {
                            wins: team['team-stats'][0]['outcome-totals'][0].$.wins,
                            losses: team['team-stats'][0]['outcome-totals'][0].$.losses,
                            pct: team['team-stats'][0]['outcome-totals'][0].$['winning-percentage'],
                            rs: team['team-stats'][0]['outcome-totals'][0].$['points-scored-for'],
                            ra: team['team-stats'][0]['outcome-totals'][0].$['points-scored-against'],
                            rd: team['team-stats'][0]['outcome-totals'][0].$['points-difference'],
                            streak: team['team-stats'][0]['outcome-totals'][0].$['streak-type'].toUpperCase() + ' ' + team['team-stats'][0]['outcome-totals'][0].$['streak-total'],
                            gb: team['team-stats'][0].$['games-back']
                        };
                        // console.log('---------------------');
                        // console.log(teamName);
                        // console.log(teamStats);
                        // console.log('---------------------');

                        // self.setState({data: teamStats});

                        teamRow.push(<tr key={Math.random()}>
                                <td>{teamName}</td>
                                <td>{teamStats.wins}</td>
                                <td>{teamStats.losses}</td>
                                <td>{teamStats.pct}</td>
                                <td>{teamStats.gb}</td>
                                <td>{teamStats.rs}</td>
                                <td>{teamStats.ra}</td>
                                <td>{teamStats.rd}</td>
                                <td>{teamStats.streak}</td>
                            </tr>);

                        self.setState({data: teamRow});
                    });
                });
            });
        });
      }
  }

  shouldComponentUpdate(nextProps, nextState) {
      return shallowCompare(this, nextProps, nextState);
  }

  render() {
    return (
      <div>
        <table className='standings'>
          <tbody>
            <tr>
              <td>(Division)</td>
              <td>W</td>
              <td>L</td>
              <td>PCT</td>
              <td>GB</td>
              <td>RS</td>
              <td>RA</td>
              <td>RD</td>
              <td>STREAK</td>
            </tr>
            {this.state.data}
          </tbody>
        </table>
      </div>
    )
  }
}
