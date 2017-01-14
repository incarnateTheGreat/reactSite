import React from "react";

import Footer from "../components/Footer";
import Header from "../components/Header";

export default class What extends React.Component {
  render() {
    console.log(this.props);
    const { query } = this.props.location;
    const { params } = this.props;
    const { game, player } = query;
    return (
      <div>
        <h1>What ({params.ever})</h1>
        <h4>Game: { game }, Player: { player }</h4>
      </div>
    );
  }
}
