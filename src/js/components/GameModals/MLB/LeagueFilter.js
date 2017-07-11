import React from "react";
import shallowCompare from 'react-addons-shallow-compare';
import _ from 'lodash'

//LeagueFilter SCSS
require('./scss/LeagueFilter.scss')

export default class LeagueFilter extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentSelection: null,
            filteredGameData: [],
            gameData: null
        };
    }

    updateSearch(e) {
        let filtered = _.filter(this.state.gameData, function(game) {
            let gameObj = game.props.children.props.gameData;
            return (gameObj.league === e.target.value || e.target.value == '');
        });

        this.setState({
            currentSelection: e.target.value === '' ? null : e.target.value,
            filteredGameData: filtered
        });
    }

    componentWillReceiveProps(nextProps) {
        let self = this;

        if(!_.isNull(nextProps.data)) {
            this.gameData = nextProps.data;

            this.setState({gameData: nextProps.data}, function() {
              let filtered = _.filter(this.state.gameData, function(game) {
                  let gameObj = game.props.children.props.gameData;

                  if(!_.isNull(self.state.currentSelection)) {
                      return gameObj.league === self.state.currentSelection;
                  } else {
                      return gameObj;
                  }
              });

              this.setState({
                  filteredGameData: filtered
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
          <form className='leagueFilter'>
              <div className='leagueSelector'>
                <input type='radio' name='leagueFilter' onClick={this.updateSearch.bind(this)} value='AA' /> AL
              </div>
              <div className='leagueSelector'>
                <input type='radio' name='leagueFilter' onClick={this.updateSearch.bind(this)} value='NN' /> NL
              </div>
              <div className='leagueSelector'>
                <input type='radio' name='leagueFilter' onClick={this.updateSearch.bind(this)} value='NA' /> Interleague (AL)
              </div>
              <div className='leagueSelector'>
                <input type='radio' name='leagueFilter' onClick={this.updateSearch.bind(this)} value='AN' /> Interleague (NL)
              </div>
              <div className='leagueSelector'>
                <input type='radio' name='leagueFilter' onClick={this.updateSearch.bind(this)} value='' /> ALL
              </div>
          </form>

          <div className="gameGroupContainer">
              {this.state.filteredGameData.length === 0 ? (
                  <h4>There are no games to display.</h4>
              ) : ( this.state.filteredGameData )}
          </div>
        </div>
        );
    }
}
