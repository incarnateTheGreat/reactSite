import React from "react";
import { Link } from "react-router";

export default class Nav extends React.Component {
  constructor() {
    super()
    this.state = {
      collapsed: true
    }
  }
  toggleCollapse() {
    const collapsed = !this.state.collapsed;
    this.setState({collapsed});
  }
  navigate() {
    this.props.history.replaceState(null, "/");
  }
  render() {
    //Example of applying inline CSS.
    const logoStyle = {
      color: "white",
      float: "right",
      padding: "14px 10px 14px",
      fontSize: "1.3em",
      fontWeight: "bold"
    };
    const { collapsed } = this.state;
    const navClass = collapsed ? "collapse" : "";

    return (
      <nav class="navbar navbar-inverse" role="navigation">
        <div class="container">
          <div class="navbar-header">
            <button type="button" class="navbar-toggle" onClick={this.toggleCollapse.bind(this)}>
              <span class="sr-only">Toggle Navigation</span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
            </button>
          </div>
        </div>
        <div class={"navbar-collapse " + navClass} id="bs-example-navbar-collapse-1">
          <span className="logo">tsaconas.com</span>
          <ul class="nav navbar-nav">
            <li><Link to="">
              <span className="navAnimBtn">Home</span>
              <span>Home</span>
            </Link></li>
          <li><Link to="/Featured" activeClassName="active">
              <span className="navAnimBtn">Featured</span>
              <span>Featured</span>
            </Link></li>
          <li><Link to="Scores_NHL" activeClassName="active">
              <span className="navAnimBtn">NHL</span>
              <span>NHL</span>
            </Link></li>
          <li><Link to="Scores_MLB" activeClassName="active">
              <span className="navAnimBtn">MLB</span>
              <span>MLB</span>
            </Link></li>
          </ul>
        </div>
      </nav>
    );
  }
}
