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
    console.log(collapsed);
  }
  navigate() {
    this.props.history.replaceState(null, "/");
  }
  render() {
    // const { history } = this.props;
    // console.log(history.isActive("What"));
    //Example of applying inline CSS.
    const logoStyle = {
      color: "white",
      float: "right",
      padding: "14px 10px 14px",
      fontSize: "1.3em",
      fontWeight: "bold"
    };
    // const { location } = this.props;
    const { collapsed } = this.state;
    const navClass = collapsed ? "collapsed" : "";

    // console.log(location.pathname.match(/^\/Who/));

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
          <ul class="nav navbar-nav">
            <li><Link to="" activeClassName="test" className="navAnim">
            <span className="navAnimBtn">Home</span>
            <span>Home</span>
            </Link></li>
            <li><Link to="Todos" activeClassName="test" className="navAnim">
              <span className="navAnimBtn">Todos</span>
              <span>Todos</span>
            </Link></li>
            <li><Link to="Who" activeClassName="test" className="navAnim">
              <span className="navAnimBtn">Who</span>
              <span>Who</span>
            </Link></li>
            <li><Link to="What" activeClassName="test" className="navAnim">
              <span className="navAnimBtn">What</span>
              <span>What</span>
            </Link></li>
            <li><Link to="Where" activeClassName="test" className="navAnim">
              <span className="navAnimBtn">Where</span>
              <span>Where</span>
            </Link></li>
            <li><Link to="Featured" activeClassName="test" className="navAnim">
              <span className="navAnimBtn">Featured</span>
              <span>Featured</span>
            </Link></li>
            <li><Link to="Scores" activeClassName="test" className="navAnim">
              <span className="navAnimBtn">Scores</span>
              <span>Scores</span>
            </Link></li>
          </ul>
        </div>
        {/*<span style={logoStyle}>tsaconas.com</span> */}
        <span className="logo">tsaconas.com</span>
      </nav>
    );
  }
}
