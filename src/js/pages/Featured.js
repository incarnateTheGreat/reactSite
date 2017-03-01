import React from "react";

import Article from "../components/Article";

export default class Featured extends React.Component {
  render() {
    const Articles = [
      "This Guy Does This",
      "Some Guy Does That",
      "A Thing Happend",
      "When Oliver Sneezed",
      "Why People Talk"
    ].map((title, i) => <Article key={i} title={title} />);

    console.log(Articles);

    return (
      <div>
        <div class="row">{Articles}</div>
      </div>
    );
  }
}
