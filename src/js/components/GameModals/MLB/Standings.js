import React from 'react';
import axios from 'axios';
import shallowCompare from 'react-addons-shallow-compare';
import _ from 'lodash';

//LeagueFilter SCSS
require('./scss/Standings.scss')

export default class Standings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: []
    };
  }

  componentDidMount(nextProps) {
      let self = this;

      axios.get('https://erikberg.com/mlb/standings.xml').then(function (standings) {
          let parseString = require('xml2js').parseString;
          parseString(standings.data, function (err, result) {
              let standingsParsed = result['sports-content'].standing,
                  league = '',
                  teamName = '',
                  teamStats = null,
                  tableObj = [],
                  divisionRow = [],
                  teamHeader = [],
                  teamRow = [];

              _.forEach(standingsParsed, function (division, i) {
                league = division['standing-metadata'][0]['sports-content-codes'][0]['sports-content-code'][0].$['code-key'];

                  _.forEach(division.team, function (team) {
                      teamName =  team['team-metadata'][0].name[0].$.last;

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

                      teamRow.push(<tr key={Math.random()}>
                              <td>{teamName}</td>
                              <td>{teamStats.wins}</td>
                              <td>{teamStats.losses}</td>
                              <td>{teamStats.pct}</td>
                              <td>{teamStats.gb == '0.0' ? '--' : teamStats.gb}</td>
                              <td>{teamStats.rs}</td>
                              <td>{teamStats.ra}</td>
                              <td>{teamStats.rd}</td>
                              <td>{teamStats.streak}</td>
                          </tr>);
                  });

                  divisionRow.push(<thead className='standingsHeader' key={Math.random()}><tr>
                      <th>{division.$['content-label']}</th>
                      <th>W</th>
                      <th>L</th>
                      <th>PCT</th>
                      <th>GB</th>
                      <th>RS</th>
                      <th>RA</th>
                      <th>RD</th>
                      <th>STREAK</th>
                    </tr>
                  </thead>);

                  divisionRow.push(<tbody className='division' key={Math.random()}>
                    {teamRow}
                  </tbody>);

                  teamRow = [];

                  let leagueName = function() {
                    if(league === 'MLB.AL' && i === 0) {
                      return 'American';
                    } else if (league === 'MLB.NL' && i === 3) {
                      return 'National';
                    }
                  }

                  tableObj.push(<div key={Math.random()}>
                      <h3 className='league'>{leagueName()}</h3>
                      <table className='standings'>
                        {divisionRow}
                      </table>
                    </div>);

                  divisionRow = [];
              });

              self.setState({data: tableObj});
          });
      });
  }

  render() {
    return (
      <div>
        {this.state.data}
      </div>
    )
  }
}
