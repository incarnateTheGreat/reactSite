import React from "react";

export default class Article extends React.Component {
  render() {
    const { title } = this.props;

    return (
      <div class="col-md-4">
        <h2>{title}</h2>
        <p>This is the article from which it is being posted for the world to see. I hope you enjou it as much as I enjoyed composing it.
        Good day.</p>
        <a class="btn btn-default" href="#">More Info</a>
      </div>
    )
  }
}
