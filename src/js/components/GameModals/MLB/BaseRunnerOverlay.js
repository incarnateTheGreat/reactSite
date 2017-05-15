import React from 'react';
import axios from 'axios';
import {Popover, OverlayTrigger} from "react-bootstrap";

//Overlay
export default class BaseRunnerOverlay extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      onBasePlayer: null
    }
  }

  componentDidMount() {
    let self = this;

    axios.get('http://www.mlb.com/gdcross/components/game/mlb/year_2017/batters/' + this.props.playerProfile + '.xml')
         .then(function (response) {
           let parseString = require('xml2js').parseString,
               batter_XML = response.data,
               batter_JSON = null;
           parseString(batter_XML, function (err, result) {
               let gameID = result.batting.$.game_id.split('/'),
                   url = '';
                   gameID[3] = gameID[3].replace(/-/gi, '_');

               url = 'http://mlb.mlb.com/gdcross/components/game/mlb/year_' + gameID[0] + '/month_' + gameID[1] + '/day_' + gameID[2] + '/gid_' + gameID[0] + '_' + gameID[1] + '_' + gameID[2] + '_' + gameID[3] + '/batters/' + self.props.playerProfile + '.xml';

               axios.get(url)
                   .then(function (batter) {
                     parseString(batter.data, function (err, result) {
                       let title = '#' + result.Player.$.jersey_number + ' ' + result.Player.$.first_name + ' ' + result.Player.$.last_name;

                       let popover = (<Popover id="popover-positioned-left" title={title}>
                                         <div><strong>Position:</strong> {result.Player.$.pos}</div>
                                         <div><strong>Bats:</strong> {result.Player.$.bats}</div>
                                         <div><strong>Average:</strong> {result.Player.season[0].$.avg}</div>
                                      </Popover>);

                       let overLayResult = <OverlayTrigger trigger={['hover', 'focus']} delayShow={0} delayHide={0} overlay={popover}>
                                             <div className={self.props.className}>{self.props.children}</div>
                                           </OverlayTrigger>

                       self.setState({onBasePlayer: overLayResult});
                     });
                   });
           });
         }).catch(function (error) {
           console.log(error);
         });
  }

  render() {
        return (
          <div className='onBasePlayer'>
            {this.state.onBasePlayer}
          </div>
        );
  }
}
