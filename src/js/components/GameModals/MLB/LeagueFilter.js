import React from "react";
import shallowCompare from 'react-addons-shallow-compare';

export default class LeagueFilter extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            filterText: '',
            filteredGameData: []
        };
    }

    updateSearch(e) {
      if(e.target.value.length == 0 || e.target.value.length == 2) {
        let filtered = _.filter(this.gameData, function(game) {
            let gameObj = game.props.children.props.gameData;
            return (gameObj.league === e.target.value.toUpperCase() || e.target.value.length == 0);
        });

        this.setState({
            filteredGameData: filtered
        });
      }

      this.setState({
          filterText: e.target.value
      });
    }

    componentWillReceiveProps(nextProps) {
        if(!_.isNull(nextProps.data)) {
            this.gameData = nextProps.data;

            let filtered = _.filter(this.gameData, function(game) {
                return game.props.children.props.gameData;
            });

            this.setState({
                filteredGameData: filtered
            });
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
    }

    render() {
        this.gameData = this.props.data;

        return (
            <form>
                <input type='text'
                       placeholder='Filter the League'
                       onChange={this.updateSearch.bind(this)}
                       value={this.state.filterText} />

                <div className="gameGroupContainer">
                    {!this.state.filteredGameData ? (
                        <h4>There are no games to display.</h4>
                    ) : ( this.state.filteredGameData )}
                </div>
            </form>
        );
    }
}
