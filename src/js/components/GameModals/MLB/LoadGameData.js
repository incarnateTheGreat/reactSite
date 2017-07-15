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
          gameTabData: null,
          isOpen: null
        };

        // Bind the handleSelect function already here (not in the render function)
        this.handleSelect = this.handleSelect.bind(this);

        store.subscribe(() => {})
    }

    handleSelect(activeTab) {
        // The active tab must be set into the state so that the Tabs component knows about the change and re-renders.
        this.setState({ activeTab }, function() {
          this.setSlideOutHeight();
        });
    }

    setDefaultHeight() {
      document.getElementById('slideOut').style.height = 'auto';

      if(!_.isNull(document.getElementById('boxScoreTabs'))) {
        document.getElementById('boxScoreTabs').getElementsByClassName('tab-content')[0].style.height = 'auto';
      }
    }

    setSlideOutHeight(gameStatus) {
      let self = this;

      //Programmatically set heights on containers depending on the selection.
      if(self.state.activeTab === 0) {
        this.setDefaultHeight();
      } else {
        document.getElementById('slideOut').style.height = '75%';
        document.getElementById('boxScoreTabs').getElementsByClassName('tab-content')[0].style.height = 500 + 'px';
      }
    }

    isOpen() {
      return document.getElementById('slideOut').classList.contains('open');
    }

    componentDidMount() {
      let self = this;

      this.setState({isOpen: this.isOpen()}, function() {
        self.setDefaultHeight();
      });
    }

    componentWillReceiveProps() {
      this.setState({isOpen: this.isOpen()});
    }

    componentWillReceiveProps(nextProps) {
      let self = this;

      this.setState({activeTab: 0}, function() {
        self.setDefaultHeight();
      });

      if(!_.isUndefined(this.props.loadGameData.gameTabData)) {
        this.setState({gameTabData: this.props.loadGameData.gameTabData});
      }
    }

    render() {
      !_.isNull(this.state.gameTabData) ? this.setSlideOutHeight(this.state.gameTabData.status.ind) : '';

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
                      <Tab eventKey={1} title={this.state.gameTabData.away_name_abbrev}>{this.props.loadGameData.boxScore_away}</Tab>
                      <Tab eventKey={2} title={this.state.gameTabData.home_name_abbrev}>{this.props.loadGameData.boxScore_home}</Tab>
                  </Tabs>
              ) : ('') :
            (this.props.loadGameData.gameData)}
          </div>
      );
    }
}
