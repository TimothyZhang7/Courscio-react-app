import React, { Component } from 'react';
// import { Card, Popover, OverlayTrigger, Button, Row, Col} from 'react-bootstrap'

import './index.css';
import axios from 'axios';
import App from './App';
import Search from './Search';

const API = '/v1/'

const querystring = require('query-string');

class MainBoard extends Component{
	constructor(){
		super()
		this.state = {
			isExist: true,
			search: "NONE",
			response: "",
			login: false,
			uid: -1,
			auth: ""
		}
		this.handle_search = this.handle_search.bind(this)
		this.doSearch = this.doSearch.bind(this)
		this.onSignIn = this.onSignIn.bind(this)
		this.translate_weekday = this.translate_weekday.bind(this)
		this.initGapi = this.initGapi.bind(this)
		this.waitforGapi = this.waitforGapi.bind(this)
	}

	componentDidMount() {
		this.initGapi()
	}

	async onSignIn(googleUser) {
		var profile = googleUser.getBasicProfile();
		var id_token = googleUser.getAuthResponse().id_token;
//		console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
//		console.log('Name: ' + profile.getName());
//		console.log('Image URL: ' + profile.getImageUrl());
//		console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
		console.log(id_token)

		var responsebody = await axios.post(API+'auth', querystring.stringify({
			email: profile.getEmail(),
			token: id_token
		}))
		.catch(function (error) {
			console.log(error)
		})
		console.log(responsebody)
		this.setState({
			uid: responsebody.data.id,
			login: true,
			auth: responsebody.headers.authorization
		})

		
	}

	initGapi(){
		console.log('Initializing gapi');
		const script = document.createElement('script');
		script.onload = () => {
			this.waitforGapi(script);
		}
		script.src = "https://apis.google.com/js/platform.js";
		document.body.appendChild(script);
	}

	waitforGapi(script) {
		console.log(script);
		if (script.getAttribute('gapi_processed')){
			console.log('gapi initialized');
			try{
				window.gapi.signin2.render('g-signin2', {
		     	'width': 150,
		     	'height': 30,
		     	'longtitle': true,
		     	'onsuccess': this.onSignIn
		     	});
		     	console.log('button rendered')
			}catch{
				console.log('gpi-initialization failed')
			}
		}else{
			console.log('try again in 100ms');
			setTimeout(()=> {this.waitforGapi(script)},100);
		}
	}

	handle_search (search_val) {
		this.setState({
			search: search_val
		});
		console.log(search_val)
		this.doSearch(search_val)
	}

	translate_weekday(abbr){
		if (abbr === "MON"){
			return "M"
		}
		if(abbr === "TUE"){
			return "T"
		}
		if(abbr === "WEN"){
			return "W"
		}
		if(abbr === "THU"){
			return "TH"
		}
		if(abbr === "FRI"){
			return "F"
		}
		if(abbr === "SAT"){
			return "SAT"
		}
		if(abbr === "SUN"){
			return "SUN"
		}
	}

	async doSearch(keyword){
//		try{
			
			let query = 'course/keyword?keyword=' + encodeURIComponent(keyword)
			console.log(query)
			const response = await axios.get(API + query)
			console.log("wait over")
			console.log(response)
			this.setState({
				response: response.data,
				search: keyword
			})
			
//		} catch {
//			console.log("ERROR")
//			this.setState({
//				err: true,
//				isLoading: false
//			})
//		}
	}

	render() {
		return(
			<div>
        <nav className="navbar navbar-expand-lg navbar-light">
          <a className="navbar-brand nav-link mx-auto" href="home.html" id="symbol">
            <img className="image-fluid" id="logo" src="/Logo.png" alt="logo"/>
          </a>    

          <div className="mx-2 my-auto d-flex w-100 flex-last">
            <Search search_states={this.state} onSearch={this.handle_search} />
          </div>

          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse flex-unordered flex-sm-last" id="navbarSupportedContent">
            <div className="navbar-nav navbar-right mx-auto">
              <a className="nav-item" href="/">Home</a>
              <a className="nav-item" href="/">About</a>
              <a className="nav-item" href="/">Contact</a>

              <span><div
                id='g-signin2' /></span>
            </div>
          </div>
        </nav>  

        <div id="root" className="fullroot"></div>
			  <App response = {this.state.response} keyword = {this.state.search} login = {this.state.login} uid = {this.state.uid}
			  	auth = {this.state.auth}
			  />
			</div>
		)   
	}
}

export default MainBoard;
