import React from 'react'
import { connect } from 'react-redux'
import { Tab, Tabs } from 'react-bootstrap'
import _ from 'lodash'

//Redux Store
import store from '../../../store'

//SlideOut SCSS
require('./scss/SlideOut.scss')

//Connect to Redux Store.
@connect((store) => {
  return {
    loadGameData: store.loadGameData,
    boxScore_away: store.boxScore_away,
    boxScore_home: store.boxScore_home,
    gameTabData: store.gameTabData
  }
})

export default class LoadGameData extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
          activeTab: 0, // Takes active tab from props if it is defined there,
          gameTabData: null
        };

        // Bind the handleSelect function already here (not in the render function)
        this.handleSelect = this.handleSelect.bind(this);

        store.subscribe(() => {})
    }

    componentWillReceiveProps(nextProps) {
      if(!_.isUndefined(this.props.loadGameData.gameTabData)) {
        this.setState({gameTabData: this.props.loadGameData.gameTabData});
      }
    }

    handleSelect(activeTab) {
        // The active tab must be set into the state so that the Tabs component knows about the change and re-renders.
        this.setState({ activeTab });
    }

    render() {
      return (
          <div id='slideOut'>
            {!_.isNull(this.state.gameTabData) ?
              (this.state.gameTabData.status.ind === 'I'
                || this.state.gameTabData.status.ind === 'MC'
                || this.state.gameTabData.status.ind === 'PW'
                || this.state.gameTabData.status.ind === 'F'
                || this.state.gameTabData.status.ind === 'O') ? (
                  <Tabs id='boxScoreTabs' activeKey={this.state.activeTab} onSelect={this.handleSelect}>
                      <Tab eventKey={0} title='Score'>{this.props.loadGameData.gameData}</Tab>
                      <Tab eventKey={1} title={this.state.gameTabData.away_name_abbrev}>{this.props.loadGameData.boxscore_away}</Tab>
                      <Tab eventKey={2} title={this.state.gameTabData.home_name_abbrev}>{this.props.loadGameData.boxscore_home}</Tab>
                  </Tabs>
              ) : ('') :
            ('')}
          </div>
      );
    }
}
