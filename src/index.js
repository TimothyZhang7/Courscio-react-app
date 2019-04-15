import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import MainBoard from './MainBoard';
import Home from './Home';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

ReactDOM.render(
	<Router>
		<Route path="/" exact component={MainBoard} />
		<Route path="/home" exact component={Home} />
	</Router>
	, 
	document.getElementById("Board_Anchor"))


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
