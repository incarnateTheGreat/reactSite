import React from "react";
import ReactDOM from "react-dom";
import { Router, Route, IndexRoute, hashHistory } from "react-router";

import Layout from "./pages/Layout";
import Todos from "./pages/Todos";
import Home from "./pages/Home";
import What from "./pages/What";
import Who from "./pages/Who";
import Where from "./pages/Where";
import Featured from "./pages/Featured";
import Scores from "./pages/Scores";

const app = document.getElementById('app');

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/" component={Layout}>
      <IndexRoute component={Home}></IndexRoute>
      <Route path="Todos" component={Todos}></Route>
      <Route path="What(/:ever)" component={What}></Route>
      <Route path="Who" component={Who}></Route>
      <Route path="Where" component={Where}></Route>
      <Route path="Featured" component={Featured}></Route>
      <Route path="Scores" component={Scores}></Route>
    </Route>
  </Router>,
app);
