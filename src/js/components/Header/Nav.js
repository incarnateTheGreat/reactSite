import React from "react";
import { Link } from "react-router";

export default class Nav extends React.Component {
  navigate() {
    this.props.history.replaceState(null, "/");
  }
  render() {
    // const { history } = this.props;
    // console.log(history.isActive("What"));
    return (
      <nav class="navbar navbar-default">
        <ul class="nav navbar-nav">
          <li class="active"><Link to="">Home</Link></li>
          <li><Link to="Who">Who</Link></li>
          <li><Link to="What" activeClassName="test">What</Link></li>
          <li><Link to="Where">Where</Link></li>
        </ul>
      </nav>
    );
  }
}
