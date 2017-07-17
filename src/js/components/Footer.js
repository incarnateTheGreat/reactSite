import React from "react";
import { Link } from "react-router";

export default class Footer extends React.Component {
  currentYear() {
    return new Date().getFullYear();
  }
  render() {
    const year = this.currentYear();
    return (
      <footer>
          <p class="text-muted">
            <Link to="Home">Home</Link>
            | <Link to="Scores_NHL">NHL</Link>
            | <Link to="Scores_MLB">MLB</Link> &copy; {year} React Site.
          </p>
      </footer>
    );
  }
}
