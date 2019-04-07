import React, { Component } from 'react';
import {Card, Popover, OverlayTrigger, Button, Row, Col}from 'react-bootstrap'
import './index.css';
import axios from 'axios';
import App from './App';
import Search from './Search';

const API = '/api/v1/course/keyword?'

const GOOGLE_BUTTON_ID = 'google-sign-in-button';

class MainBoard extends Component{
	constructor(){
		super()
		const noCourse = {cname: "Error", credit: 0, crn: "00000", description: "Contact Enginner",
		end_t: "2400", id:-1, key: "-1MON", location: "None", 
		major: "None", name: "null", prerequisite: "No prerequisite", 
		schoolId: -1, score: 0, semester: "Fall 2019", 
		start_t:"0000", title: "System Error", weekday: "NO"};
		this.state = {
			isExist: true,
			search: "NONE",
			response: "",
		}
		this.handle_search = this.handle_search.bind(this);
		this.doSearch = this.doSearch.bind(this)
		this.onSignIn = this.onSignIn.bind(this)
		this.translate_weekday = this.translate_weekday.bind(this)
	}

    onSignIn(googleUser) {
		var profile = googleUser.getBasicProfile();
  		var id_token = googleUser.getAuthResponse().id_token;
  		console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  		console.log('Name: ' + profile.getName());
  		console.log('Image URL: ' + profile.getImageUrl());
  		console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
  		console.log(id_token)
    }

	handle_search (search_val){
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
			
			let query = 'keyword=' + encodeURIComponent(keyword)
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

	render(){

		return(
			<div>
			<nav className="row navbar navbar-expand-lg navbar-light">
				<div className= "col-sm-0 col-md-0 col-lg-1"></div>
				
				<a className="navbar-brand col-sm-1 col-md-1 col-lg-2" href="home.html" id="symbol">
					<img className="image-fluid col-xs-1" id="logo" src="/Logo.png" alt="logo"/>
				</a>    

				<div className="container order-xs-last" id="navcontainer">
				<Search search_states = {this.state} onSearch={this.handle_search}/>
				</div>  

				<button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
					<span className="navbar-toggler-icon"></span>
				</button>   

				<div className="collapse navbar-collapse col-md-auto col-lg-4" id="navbarSupportedContent">
					<ul className="navbar-nav navbar-right">
						<li className="nav-item"><a href="home.html">Home</a></li>
						<li className="nav-item"><a href="home.html">About us</a></li>
						<li className="nav-item"><a href="google_api_test.html">Contact us</a></li>
						<div class="g-signin2 gButton" data-onsuccess="onSignIn" data-width="120" data-height="30"></div>
					</ul>
				</div>
				<div className= "col-xs-0 col-md-0 col-lg-1"></div>
			</nav>  

			<div id="root" className="fullroot"></div>
			<App response = {this.state.response} keyword = {this.state.search}/>
			</div>

		
		)   
	}
}

export default MainBoard;