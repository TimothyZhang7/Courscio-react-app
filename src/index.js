import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import MainBoard from './MainBoard';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<MainBoard />, document.getElementById("Board_Anchor"))


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
