import React from "react";
import { Link } from "react-router";

export default class Nav extends React.Component {
  navigate() {
    this.props.history.replaceState(null, "/");
  }
  render() {
    // const { history } = this.props;
    // console.log(history.isActive("What"));
    const logoStyle = {
      color: "white",
      float: "right",
      padding: "14px 10px 14px",
      fontSize: "1.3em",
      fontWeight: "bold"
    };

    return (
      <nav class="navbar navbar-default">
        <ul class="nav navbar-nav">
          <li><Link to="">Home</Link></li>
          <li><Link to="Who">Who</Link></li>
          <li><Link to="What" activeClassName="test">What</Link></li>
          <li><Link to="Where">Where</Link></li>
          <li><Link to="Featured">Featured</Link></li>
        </ul>
        <span style={logoStyle}>tsaconas.com</span>
      </nav>
    );
  }
}
