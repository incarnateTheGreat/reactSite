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
        <div className="container">
          <p class="text-muted"><Link to="Home">Home</Link> | <Link to="Who">Who</Link> | <Link to="What">What</Link> | <Link to="Where">Where</Link> | &copy; {year} React Site.</p>
        </div>
      </footer>
    );
  }
}
