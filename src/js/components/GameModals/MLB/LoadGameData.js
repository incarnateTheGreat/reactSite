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

    slideOutClickListener(e) {
      let slideOutElem = document.getElementById('slideOut'),
          bodyElem = document.body,
          openClass = 'open',
          scoreTableClass = 'scoreTable',
          disableScrollClass = 'disableScroll',
          isSlideOutElemFound = false;

      if(e.type === 'mouseup') {
          let clickEventElem = e.target || e.srcElement;

          //Detect if Close (X) was clicked.
          if(e.target.id === 'closeSlideOut') {
            isSlideOutElemFound = false;
            closeSlideOut();
          } else {
            //Detect click that happens outside the SlideOut component.
            //Traverse the DOM upwards until either 'slideOut' ID or 'scoreTable' class are found.
            //If either are identified, then do not close the SlideOut window.
            while (clickEventElem.parentNode && !isSlideOutElemFound) {
              if(clickEventElem.id === 'slideOut' || clickEventElem.classList.contains(scoreTableClass)) {
                isSlideOutElemFound = true;
              }
              clickEventElem = clickEventElem.parentNode;
            }

            if(!isSlideOutElemFound) {
              closeSlideOut();
            }
          }
      } else if(e.type === 'keydown') {
        closeSlideOut();
      }

      function closeSlideOut() {
        //Remove 'Disable Scroll' class from the body.
        if(slideOutElem.classList.contains(openClass)) bodyElem.classList.add(disableScrollClass);

        //Close SlideOut.
        if(!isSlideOutElemFound) {
          slideOutElem.classList.remove(openClass);
          bodyElem.classList.contains(disableScrollClass) ? bodyElem.classList.remove(disableScrollClass) : '';
        }
      }
    }

    render() {
      let self = this;

      !_.isNull(this.state.gameTabData) ? this.setSlideOutHeight(this.state.gameTabData.status.ind) : '';

      //Events
      document.onmouseup = function(e) {
        self.slideOutClickListener(e);
      }

      document.onkeydown = function(e) {
        let isEscape = false,
            slideOutElem = document.getElementById('slideOut');

        e = e || window.event;

        if ("key" in e) {
            isEscape = (e.key == "Escape" || e.key == "Esc");
        } else {
            isEscape = (e.keyCode == 27);
        }

        if(isEscape) self.slideOutClickListener(e);
      };

      return (
          <div id='slideOut'>
            <span title='Close' class='glyphicon glyphicon-remove-circle' id='closeSlideOut'></span>
            {!_.isNull(this.state.gameTabData) ?
              (this.state.gameTabData.status.ind === 'I'
                || this.state.gameTabData.status.ind === 'MC'
                || this.state.gameTabData.status.ind === 'PW'
                || this.state.gameTabData.status.ind === 'F'
                || this.state.gameTabData.status.ind === 'O') ? (
                  <div>
                    <Tabs id='boxScoreTabs' activeKey={this.state.activeTab} onSelect={this.handleSelect}>
                        <Tab eventKey={0} title='Score'>{this.props.loadGameData.gameData}</Tab>
                        <Tab eventKey={1} title={this.state.gameTabData.away_name_abbrev}>{this.props.loadGameData.boxScore_away}</Tab>
                        <Tab eventKey={2} title={this.state.gameTabData.home_name_abbrev}>{this.props.loadGameData.boxScore_home}</Tab>
                    </Tabs>
                  </div>
              ) : (this.props.loadGameData.gameData) :
            ('')}
          </div>
      );
    }
}
