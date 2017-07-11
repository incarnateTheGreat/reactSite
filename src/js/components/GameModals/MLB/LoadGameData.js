import React from "react"
import { connect } from 'react-redux'
import { Tab, Tabs } from "react-bootstrap"

//Redux Store
import store from '../../../store'

//Connect to Redux Store.
@connect((store) => {
  return {
    loadGameData: store.loadGameData,
    boxScore_away: store.boxScore_away,
    boxScore_home: store.boxScore_home
  }
})

export default class LoadGameData extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
          activeTab: 0 // Takes active tab from props if it is defined there
        };

        store.subscribe(() => {})
    }

    //TODO: Pass in 'Game' variable for render() content.

    render() {
        return (
            <div id='slideOut'>
              {this.props.loadGameData.gameData}

              {/* {(game.status.ind === 'I' || game.status.ind === 'MC' || game.status.ind === 'PW' || game.status.ind === 'F' || game.status.ind === 'O') ? (
                  <Tabs id='boxScoreTabs' activeKey={this.state.activeTab} onSelect={this.handleSelect}>
                      <Tab eventKey={0} title={game.away_name_abbrev}>{this.state.boxScoreBody_awayTeam}</Tab>
                      <Tab eventKey={1} title={game.home_name_abbrev}>{this.state.boxScoreBody_homeTeam}</Tab>
                  </Tabs>
              ) : ('')} */}
            </div>
        );
    }
}
