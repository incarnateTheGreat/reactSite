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
          console.log(o.scores);
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
          {this.state.posts.map((post, id) =>
              <div key={id}>{post.teams.home} <strong>{post.scores[post.teams.home]}</strong> <br />
              {post.teams.away} <strong>{post.scores[post.teams.home]}</strong></div>
            )}
      </div>
    );
  }
}
