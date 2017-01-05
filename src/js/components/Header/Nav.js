import React from "react";
import { Link } from "react-router";

export default class Nav extends React.Component {
  render() {
    return (
      <nav class="navbar navbar-default">
        <ul class="nav navbar-nav">
          <li class="active"><Link to="">Home</Link></li>
          <li><Link to="Who">Who</Link></li>
          <li><Link to="What">What</Link></li>
          <li><Link to="Where">Where</Link></li>
        </ul>
      </nav>
    );
  }
}
