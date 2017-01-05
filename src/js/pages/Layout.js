import React from "react";

import Footer from "../components/Footer";
import Header from "../components/Header";

export default class Layout extends React.Component {
  constructor() {
    super();
    this.state = {
      title: "Welcome to this page.",
    };
  }

  changeTitle(title) {
    this.setState({title});
  }

  render() {
    return (
      <div>
        <Header changeTitle={this.changeTitle.bind(this)} title={this.state.title} />
          <div class="container-fluid">{this.props.children}</div>
        <Footer />
      </div>
    );
  }
}
