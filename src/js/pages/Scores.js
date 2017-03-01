import React from "react";
import axios from 'axios';

// import Article from "../components/Article";

export default class Scores extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      posts: []
    };
  }
  componentDidMount() {
    axios.get('https://nhl-score-api.herokuapp.com/api/scores/latest')
      .then(res => {
        const posts = res.data.map((obj, num) => obj);
        this.setState({ posts });

        _.forEach(this.state.posts, function(o,i) {
          console.log(o);
        })
      });
  }
  render() {
    // const gameComponent = todos.map((todo) => {
    //     return <Todo key={todo.id} {...todo}/>;
    // });

    return (
      <div>
        <h1>Scores</h1>
        <hr/>
        <h2>NHL Scores</h2>
        <div class="scoreTableContainer">
          {this.state.posts.map((post, id) =>
              <div class="scoreTable" key={id}>
                <div class="team">{post.teams.home}</div> <div class="score">{post.scores[post.teams.home]}</div> <br />
                <div class="team">{post.teams.away}</div> <div class="score">{post.scores[post.teams.home]}</div>
              </div>
            )}
        </div>
      </div>
    );
  }
}
