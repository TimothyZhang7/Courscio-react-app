import React, { Component } from 'react';
import { Card,
  Row,
  Col,
  Form,
  Button,
  ButtonToolbar,
  ToggleButton,
  ToggleButtonGroup,
  Popover,
  OverlayTrigger } from 'react-bootstrap';
import {Slider, Rate} from 'antd';
import axios from 'axios';
import './App.css';
import noCoursePng from './comics/noCourse.png'
import loader from './icons/loading.svg'
import $ from 'jquery';
import Moment from "react-moment"
import "fullcalendar/dist/fullcalendar";
import 'fullcalendar-scheduler';
import 'fullcalendar/dist/fullcalendar.css';
import 'fullcalendar-scheduler/dist/scheduler.css';

const API = 'https://api.courscio.com/v1/';

const querystring = require('query-string');

const noCourse = {cname: "Error", credit: 0, crn: "00000", description: "Contact Enginner",
end_t: "2400", id:-1, key: "-1MON", location: "None", 
major: "None", name: "null", prerequisite: "No prerequisite", 
schoolId: -1, score: 0, semester: "Fall 2019", 
start_t:"0000", title: "System Error", weekday: "NO"};

const noUserDashboard = (<Popover id="popover-basic" title="Dashboard">
			<div className="dash-labels">Courses In Schedule:</div>
			<div className="dash-container">
	        Please login to use this feature
	        </div>
          <div className="line"/>
        	<div className="dash-labels my-2">Wishlist:</div>
        	<div className="dash-container">
        	<img alt="loader" src={loader} />
        	</div>
			</Popover>);

const noUserSchedule = (<Popover id="popover-basic" className= "calendar" title="Schedule">
			<div id="caldendar"></div>
      <div className="btn-wrap">
      <button className="at-calendar">Export to Google Calendar</button>
      </div>
			</Popover>);

class App extends Component {
	constructor(props) {
		super(props)

		this.state = {
			token: "",
			auth: "Bearer ",
			uid: -1,
			courses: [],
			resultPrompt: "",
			courses_raw_data: [], //RenderedHtml, start_t, end_t, course_obj, weekdays
			isLoading: false,
			err: false,
			dept: "Nothing",
			weekdays: [],
			credit: "Nothing",
			isAdvancedSearch: true,
			semester: "Fall 2019",
			school: "Arts, Science, and Engineering",
			slider_val: [800,2400],
			cur_course: noCourse,
			comment: "",
			comments: [],
			schedule: noUserSchedule,
			dashboard: noUserDashboard,
			userCart: [],
			scheduleOn: false,
			dashboardOn: false
		}

		this.ReMount = this.ReMount.bind(this)
		this.onSliderChange = this.onSliderChange.bind(this)
		this.time_filter = this.time_filter.bind(this)
		this.recordPopUpInfo = this.recordPopUpInfo.bind(this)
		this.commentChange = this.commentChange.bind(this)
		this.submitComment = this.submitComment.bind(this)
		this.getCommentList = this.getCommentList.bind(this)
		this.findCourseById = this.findCourseById.bind(this)
		this.commentBlockBuilder = this.commentBlockBuilder.bind(this)
		this.unloadCurCourse = this.unloadCurCourse.bind(this)
		this.dept_filter = this.dept_filter.bind(this)
		this.weekday_filter = this.weekday_filter.bind(this)
		this.credit_filter = this.credit_filter.bind(this)
		this.raw_data_extract = this.raw_data_extract.bind(this)
		this.searchActionInterpret = this.searchActionInterpret.bind(this)
		this.render_key_word = this.render_key_word.bind(this)
		this.onDestroySearchResult = this.onDestroySearchResult.bind(this)
		this.onDateDeptCreditChange = this.onDateDeptCreditChange.bind(this)
		this.renderCardList = this.renderCardList.bind(this)
		this.load_schedule = this.load_schedule.bind(this)
		this.load_dashboard = this.load_dashboard.bind(this)
		this.getUserSelections = this.getUserSelections.bind(this)
		this.post_to_cart = this.post_to_cart.bind(this)
		this.filter_cart = this.filter_cart.bind(this)
		this.create_dashboard_with_filtered_cart = this.create_dashboard_with_filtered_cart.bind(this)
		this.list_schedule_objs = this.list_schedule_objs.bind(this)
		this.create_calendar_with_reserved = this.create_calendar_with_reserved.bind(this)
		this.initialize_calendar = this.initialize_calendar.bind(this)
	}

	async post_to_cart(e){
		
		var cid = e.target.value
		var type = 'reserved'
		if (e.target.id === 'wishlist'){
			type = 'wishlist'
		}
		console.log(cid)
		console.log(type)

		var data = new FormData()
		data.append('courseId',cid)
		data.append('userId', this.state.uid)
		data.append('type', type)

		if (this.state.uid === -1){
			console.log('not logged in')
		}else{
			var query = 'user/'+String(this.state.uid)+'/cart'
			var qs = querystring.stringify()
			console.log(this.state.auth)
			var response = await axios.post(API + query,
				data,
				{headers: {
					'Authorization' : this.state.auth
				}})
			.catch(function (error){
				console.log(error)
			})
			console.log(response)
		}
	}

	async load_schedule() {
		if (this.state.uid === -1){
			this.setState({
				schedule: noUserSchedule
			});
		}else{
			if (!this.state.scheduleOn){
				console.log('Getting schedule for: '+this.state.uid)
				var filtered = await this.getUserSelections()
				var reserved = filtered[0]
				var schedule_objs = await this.list_schedule_objs(reserved)
				this.setState({
					scheduleOn: true,
					schedule: this.create_calendar_with_reserved(schedule_objs)
				})
			}else{
				console.log('Close Schedule')
				this.setState({
					scheduleOn: false
				})
			}
		}
	}
	
	async list_schedule_objs(reserved){
		var query = "list?ids="
		for (var i= 0; i< reserved.length; i++){
			query = query + String(reserved[i])+","
		}
		query = query.substring(0,query.length-1)
		var response = await axios.get(API + query)
		console.log(API + query)
		console.log(response)
		return response.data
	}

	async load_dashboard() {
		if (this.state.uid === -1){
			this.setState({
				dashboard: noUserDashboard
			});
		}else{
			if (!this.state.dashboardOn){
				console.log('Getting cart for: '+this.state.uid)
				var filtered = await this.getUserSelections()
				console.log(filtered)
				this.setState({
					dashboardOn: true,
					dashboard: this.create_dashboard_with_filtered_cart(filtered)
				})
			}else{
				console.log('Close Cart')
				this.setState({
					dashboardOn: false
				})
			}
		}
	}

	drawCalendar() {
	    $("#calendar").fullCalendar({
	      defaultView: 'agendaDay',
	      height: 630,
	      header: false,
	      allDaySlot: false,
	      minTime: '08:00:00',
	      maxTime: '21:00:00',
	      schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
	      events: [],
	      resources: [
	        { id: 'MON', title: 'Mon' },
	        { id: 'TUE', title: 'Tu' },
	        { id: 'WEN', title: 'Wed' },
	        { id: 'THU', title: 'Th' },
	        { id: 'FRI', title: 'Fri' }
	      ]
	    });
  	}

  	updateCalendar(reserved) {
  		$("#calendar").fullCalendar('removeEvents');
  		console.log(reserved)
  		for (var i= 0; i< reserved.length; i++){
  			console.log(reserved[i].cname)
  			$("#calendar").fullCalendar('renderEvent', {
	        id: i,
	        title: reserved[i].cname,
	        start: `${reserved[i].start_t.substring(0,2)}:${reserved[i].start_t.substring(2)}:00`,
	        end: `${reserved[i].end_t.substring(0,2)}:${reserved[i].end_t.substring(2)}:00`,
	        resourceIds: [reserved[i].weekday],
	        backgroundColor: '#e6fffa'

      	});
  		}
  		
  	}

  	create_calendar_with_reserved(reserved){
  		console.log(reserved)
  		this.drawCalendar()
  		console.log("initialized calendar")
  		this.updateCalendar(reserved)
  		console.log("updated calendar")
  		return (<Popover id="popover-basic" className = "calendar" title="Schedule">
				<div id="calendar"></div>
			</Popover>)
  	}

  	initialize_calendar(){
  		this.drawCalendar()
  		console.log("initialized calendar")
  		return (<Popover id="popover-basic" className = "calendar" title="Schedule">
				<div id="calendar"></div>
			</Popover>)
  	}

	create_dashboard_with_filtered_cart(filtered){
		var reserved = filtered[0]
		var wishlist = filtered[1]
		var reserved_divs = []
		var wishlist_divs = []
		for (var i = 0; i< reserved.length; i++){
			reserved_divs.push(<div className="schedule-course" key={i}>
        		&bull;  {reserved[i]}
        		<div className="remove">X</div>
        		<div className="send-down">d</div>
        	</div>)
		}
		for (var i = 0; i< wishlist.length; i++){
			wishlist_divs.push(<div className="schedule-course" key={i}>
        		&bull;  {wishlist[i]}
        		<div className="remove">X</div>
        		<div className="send-down">d</div>
        	</div>)
		}

		return (<Popover id="popover-basic" title="Dashboard">
			<div className="dash-labels">Courses In Schedule:</div>
			<div className="dash-container">
	        {reserved_divs}
	        </div>
        	<div className="dash-labels my-2">Wishlist:</div>
        	<div className="dash-container">
        	{wishlist_divs}
        	</div>
			</Popover>)
	}

	async getUserSelections(){
		console.log('Requesting user whole cart')
		var query = 'user/'+String(this.state.uid)+'/cartItems'
		console.log(this.state.auth)
		var response = await axios.get(API + query,
			{headers: {
				'Authorization' : this.state.auth
			}})
		.catch(function (error){
			console.log(error)
		})
		console.log(response.data)
		this.setState({
			userCart: response.data
		})
		return this.filter_cart()
	}

	filter_cart(){
		var wishlist = []
		var reserved = []
		var result = []
		for (var i = 0; i< this.state.userCart.length; i++){
			if (this.state.userCart[i].type === 'reserved'){
				reserved.push(this.state.userCart[i].courseId)
			}else if (this.state.userCart[i].type === 'wishlist'){
				wishlist.push(this.state.userCart[i].courseId)
			}else{
				console.log('missing type at: '+ String(i))
			}
		}
		result.push(reserved)
		result.push(wishlist)
		return result
	}

	async componentDidMount() {
		this.setState({
			isLoading: true
		});

		this.load_schedule()
		this.load_dashboard()

		console.log("uid: "+this.state.uid)
		try {
			var courseRows = []
			var courseRows_raw = []
			const courseRow = <Card className="noCourse-card" text="black" key="0">
					<img className="card-img-bottom" src={noCoursePng} alt="noCourse" />
					<br />
				</Card>
			courseRows.push(courseRow)
			courseRows_raw.push([courseRow],800,2400)
			this.setState({
				courses: courseRows,
				courses_raw_data: courseRows_raw,
				schedule: this.initialize_calendar()
			})
		} catch {
			this.setState({
				err: true,
				isLoading: false
			})
		}
	}

	componentWillReceiveProps(nextProps){
		var raw_data = this.renderCardList(nextProps.response)
		var courses = this.raw_data_extract(this.weekday_filter(this.dept_filter(this.credit_filter(raw_data, this.state.credit), this.state.dept), this.state.weekdays));
		if (nextProps.login){
			this.setState({
				uid: nextProps.uid,
				auth: nextProps.auth
			})
		}
		if (nextProps.keyword !== 'NONE'){
			this.setState({
				isAdvancedSearch: false,
				courses_raw_data: raw_data,
				courses: courses,
				resultPrompt: this.render_key_word(this.props.keyword)
			})
		}
	}

	searchActionInterpret(subject, weekday, credit){
		if (subject === 'NONE'){
			subject = this.state.dept
		}else{
			this.setState({
				dept: subject
			})
		}

		if (credit === 'NONE'){
			credit = this.state.credit
		}else{
			this.setState({
				credit: credit
			})
		}
		var temp = []
		if (weekday !== 'NONE'){
			const weekdays = this.state.weekdays
			if (weekdays.includes(weekday)){
				var index = weekdays.indexOf(weekday)
				const newdays = weekdays.slice(0, index).concat(weekdays.slice(index+1,weekdays.length))
				temp = newdays
				this.setState({
					weekdays: newdays
				})
			}else{
				let days = this.state.weekdays
				days.push(weekday)
				temp = days
				this.setState({
					weekdays: days
				})
			}
		}
		if (this.state.isAdvancedSearch === true){
			this.ReMount(subject, temp, credit)
		}else{
			this.onDateDeptCreditChange(temp, subject, credit)
		}
	}

	renderCardList(response) {
		var courseRows_raw = []
		var weekdayRow = ""
		var weekdays = []
		const filtered = response
		for(var i= 0; i< filtered.length; i++) {
			weekdayRow = "";
			weekdays = [];
			const cur_course = filtered[i];
			while (i < filtered.length && cur_course.crn === filtered[i].crn) {
				weekdayRow = weekdayRow + " " + this.translate_weekday(filtered[i].weekday);
				weekdays.push(filtered[i].weekday);
				i++;
			}
			i--;
			const courseRow = <Card className="classCard" bg="light" text="#383838" key={cur_course.key}>
			  <Card.Body>
			  <Row>
				  <Col
            tag="a"
            className="card_padding"
            data-toggle="modal"
            id={cur_course.id}
            data-target="#myModal"
            onClick={this.recordPopUpInfo}
            style={{ cursor: "pointer"}}
            xs={10}>
            <Card.Title>
              CRN {cur_course.crn}&nbsp;&nbsp;&nbsp;
              {cur_course.cname}&nbsp;&nbsp;
              {cur_course.title}&nbsp;&nbsp;
              {cur_course.credit}&nbsp;Credits
            </Card.Title>
            {/* <Card.Subtitle>CRN&nbsp;{cur_course.crn}&nbsp;&nbsp;{cur_course.credit}&nbsp;Credits</Card.Subtitle> */}
            <div className="card-text">
              <div className="card-text__row">
                <p className="rowTitle">Description:</p>
                <p className="text-margin text-hidden">{cur_course.description}</p>
              </div>
              <div className="card-text__row">
              <p className="rowTitle text-margin">Instructor:</p>
                  <p id="instructor">{cur_course.name}</p>
                  <p className="rowTitle text-margin">Time:</p>
                  <p id="time">{weekdayRow}&nbsp;{cur_course.start_t}-{cur_course.end_t}</p>
                  <p className="rowTitle text-margin">Location: </p>
                  <p>{cur_course.location}</p>
              </div>
            </div>
					</Col>
					<Col xs={2} className="rating-section align-middle">
            <div className="rating">{cur_course.score}</div>
            <div className="rating__subtitle">Course Rating</div>
					</Col>
				</Row>
        <Row>
          <div className="cardButton">
            <Button id="select" value= {cur_course.id} onClick= {this.post_to_cart} variant="success">Add to Schedule</Button>
            <Button id="wishlist" value= {cur_course.id} onClick= {this.post_to_cart} variant="danger">Add to Wishlist</Button>
          </div>
        </Row>
			  </Card.Body>
			</Card>
			courseRows_raw.push([courseRow, cur_course.start_t, cur_course.end_t, cur_course.major, weekdays, cur_course])
		}
		this.setState({
			courses_raw_data: courseRows_raw
		})
		return courseRows_raw
	}

	async ReMount(subject, weekdays, credit){
		this.setState({
			isLoading: true,
			courses:[],
			courses_raw_data: [],
		});

		//The start_t and end_t
		const a = this.state.slider_val[0]
		const b = this.state.slider_val[1]

		try {
			let query = 'course/filters?major=' + encodeURIComponent(subject) + '&semester=' + encodeURIComponent(this.state.semester)
			if (credit !== "Nothing"){
				query = query + '&credit=' + encodeURIComponent(credit)
			}
			console.log(weekdays)
			weekdays.forEach((day)=>{
				query = query + '&weekdays=' + day
			})
			const response = await axios.get(API + query)
			console.log(response)
			var courseRows_raw = this.renderCardList(response.data)
			var courseRows = this.time_filter(courseRows_raw, a, b)
			console.log(courseRows_raw)
			this.setState({
				courses: courseRows,
				courses_raw_data: courseRows_raw
				//save raw_data as 3-tuple including elem, start_t, end_t
			})
		} catch {
			console.log("ERROR")
			this.setState({
				err: true,
				isLoading: false
			})
		}
	}

	recordPopUpInfo(e){
		console.log("open details")
		this.setState({
			cur_course: this.findCourseById(this.state.courses_raw_data, e.currentTarget.id)
		})
		this.getCommentList(e.currentTarget.id)
	}

	findCourseById(raw_data, cid) {
		console.log(cid)
		for (var i= 0; i< raw_data.length; i++){
			if (raw_data[i].length === 6){
				if (parseInt(raw_data[i][5].id) === parseInt(cid)){
					return raw_data[i][5]
				}
			}
		}
		console.log("Course not found, fatal logical error")
		return undefined;
	}

	onDateDeptCreditChange(weekdays, dept, credit){
		console.log(weekdays)
		console.log(dept)
		const dept_clear_courses = this.dept_filter(this.state.courses_raw_data, dept)
		console.log(dept_clear_courses)
		const weekday_clear_courses = this.weekday_filter(dept_clear_courses, weekdays)
		console.log(weekday_clear_courses)
		const credit_clear_courses = this.credit_filter(weekday_clear_courses, credit)
		console.log(credit_clear_courses)
		const courses = this.raw_data_extract(credit_clear_courses)
		this.setState({
			weekdays: weekdays,
			dept: dept,
			credit: credit,
			courses: courses
		})
	}

	onCreditChange(credits){
		console.log("change credit")
		const credit_clear_courses = this.credit_filter(this.state.courses_raw_data, credits)
		const courses = this.raw_data_extract(credit_clear_courses)
		this.setState({
			courses: courses
		})
	}

	onSliderChange(value){
		var a = parseFloat(value[0])
		var b = parseFloat(value[1])
		a = parseInt(a/100.0 * 720.0)
		b = parseInt(b/100.0 * 720.0)
		if (a%60 !== 59){
			a = (8+Math.floor(a/60))*100 + (a%60)
		}else{
			a = (8+Math.floor(a/60))*100 + (a%60) + 41
		}
		if (b%60 !== 59){
			b = (8+Math.floor(b/60))*100 + (b%60)
		}else{
			b = (8+Math.floor(b/60))*100 + (b%60) + 41
		}
		if (b === 2000){
			b = 2400
		}
		console.log('onAfterChange: ', a, b);
		this.setState({
			slider_val: [a, b]
		})
		const courses = this.time_filter(this.weekday_filter(this.dept_filter(this.credit_filter(this.state.courses_raw_data, this.state.credit),this.state.dept),this.state.weekdays), a, b)
		console.log()
		this.setState({
			courses: courses
		})
	}

	time_filter(tuples,a,b) {
		var courseRows = [];
		for (var i=0; i< tuples.length; i++) {
			if (tuples[i][1] >= a && tuples[i][2] <= b) {
				courseRows.push(tuples[i][0]);
			}
		}
		return courseRows;
	}

	dept_filter(tuples, dept) {
		var raw_data = [];
		if (tuples.length> 0 && tuples[0].length> 3 && dept !== "Nothing"){
			for (var i=0; i<tuples.length; i++){
				if (tuples[i][3] === dept){
					raw_data.push(tuples[i])
				}
			}
			return raw_data;
		} else {
			return tuples;
		}
	}

	credit_filter(tuples, credits) {
		var raw_data = [];
		if (tuples.length> 0 && tuples[0].length> 5 && credits !== "Nothing"){
			for (var i=0; i<tuples.length; i++){
				console.log(tuples[i][5].credit + ' = ' + credits)
				if (parseInt(tuples[i][5].credit) === parseInt(credits)){
					raw_data.push(tuples[i])
				}
			}
			return raw_data;
		} else {
			return tuples;
		}
	}

	weekday_filter(tuples, weekdays) {
		var raw_data = []
		if (tuples.length > 0 && tuples[0].length> 4 && weekdays.length > 0){
			for (var i=0; i< tuples.length; i++){
				for (var j=0; j< weekdays.length; j++){
					var found = false
					for (var k=0; k< tuples[i][4].length; k++){
						if (tuples[i][4][k] === weekdays[j]){
							found = true
						}
					}
					if (found){
						raw_data.push(tuples[i]);
						break;
					}
				}
			}
			return raw_data;
		} else {
			return tuples;
		}
	}

	raw_data_extract(tuples){
		var courseRows = []
		for (var i = 0; i< tuples.length; i++){
			courseRows.push(tuples[i][0]);
		}
		return courseRows;
	}

	render_key_word(keyword){
		return (
			<Card className="classCard" bg="light" text="#383838" key="-1">
				<Card.Body>
				<Row>
					<Col tag="a" className="card_padding" id="void" onClick={this.onDestroySearchResult} style={{ cursor: "pointer"}} xs={9}>
						<Card.Title>Showing Result for: {keyword}</Card.Title>
						<Card.Subtitle>Click to void search result</Card.Subtitle>
					</Col>
				</Row>
				</Card.Body>
				<br />
			</Card>
		);
	}

	onDestroySearchResult(){
		this.setState({
			courses: [],
			isAdvancedSearch: true,
			courses_raw_data: [],
			resultPrompt: ""
		})
		this.ReMount(this.state.dept, this.state.weekdays, this.state.credit)
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

	commentChange(event) {
		this.setState({
			comment: event.target.value
		})
	}

	async submitComment(event) {
		var toSubmit = this.state.comment;
		var query = 'rating?comment='+ encodeURIComponent(toSubmit)+ '&teaching_id='+ this.state.cur_course.id+ '&user_id='+ this.state.uid;
		console.log(query)
		alert("Comment Successfully Submitted");
		const response = await axios.post(API + query);
		console.log(response)
		this.setState({
			comment: "",
		})
		this.getCommentList(this.state.cur_course.id)
	}

	async getCommentList(teaching_id){
		var query = 'rating/'+teaching_id;
		const response = await axios.get(API + query);
		this.commentBlockBuilder(response.data)
	}

	commentBlockBuilder(comments_raw){
		var comments = []
		for (var i= 0; i< comments_raw.length; i++){
			const commentrow = (
				<li className="media" key={i}>
          <img
            alt="profile"
            src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
            className="comment-profile"
            />
          <div className="media-body shadow-sm p-3 mb-4 bg-white rounded">
						<p>
							{comments_raw[i].comment}
						</p>
					</div>
				</li>
			);
			comments.push(commentrow)
		}
		this.setState({
			comments: comments
		})
	}

	unloadCurCourse(){
		this.setState({
			cur_course: noCourse
		})
	}

render(){ 
	const marks = {
			0: '8am',
			8.33: '',
			16.66: '',
			25: '',
			33.32: '12pm',
			41.65: '',
			50: '',
			58.31: '',
			66.64: '4pm',
			74.97: '',
			83.3: '',
			91.63: '',
			100: '8pm'
		};


		const popover = (
			<Popover id="popover-basic" title="Popover right">
				And here's some <strong>amazing</strong> content. It's very engaging. right?
			</Popover>
    );

    const rate = (
      <Popover id="popover-basic" title="Rate">
        <Slider tooltipVisible={false} defaultValue={0} onAfterChange={null}/>
      </Popover>
    );
    
    const dashboard = (
			<Popover id="popover-basic" title="Dashboard">
				<div className="dash-labels">Courses In Schedule:</div>
        <div className="schedule-course">
          &bull;  PHL 101
          <div className="remove">X</div>
          <div className="send-down">d</div>
        </div>
        <div className="schedule-course">
          &bull;  CSC 101
          <div className="remove">X</div>
          <div className="send-down">d</div>
        </div>
        <div classname="line" />
        <div className="dash-labels my-2">Wishlist:</div>
        <div className="schedule-course">
          &bull;  PHL 101
          <div className="remove">X</div>
          <div className="send-down">^</div>
        </div>
        <div className="schedule-course">
          &bull;  CSC 101
          <div className="remove">X</div>
          <div className="send-down">^</div>
        </div>
			</Popover>
		);

		var v = 'visible';
		return (
			<div className="App">
				<div className="container-fluid mx-2">
					<Row>
						<Col className="" md={3} lg={3}>
              <div className="filterLarge">
                Advanced Search
              </div>
							<div container="true" className="filtersmall">
                <div id = {v}>
								<Form.Group className="formGroup" controlId="formGridTerm">
									<Form.Control as="select" className="formControl" defaultValue= "Fall 2019">
										<option hidden>Term</option>
										<option>Fall 2019</option>
									</Form.Control>
								</Form.Group>
								</div>

								

								<div id={v}>
									<Form.Group className="formGroup" controlId="formGridDept">
										<Form.Control as="select" className="formControl" onChange={(event) => this.searchActionInterpret(event.target.value,"NONE",'NONE')}>
											<option hidden value="Nothing">Department</option>
											<option value="Nothing"></option>
											<option value="African &amp; African-American Studies">AAS - African &amp; African-American Studies</option>
											<option value="Art &amp; Art History">AH - Art &amp; Art History</option>
											<option value="Anthropology">ANT - Anthropology</option>
											<option value="Religion &amp; Classics  Arabic">ARA - Religion &amp; Classics - Arabic</option>
											<option value="American Sign Language">ASL - American Sign Language</option>
											<option value="Audio Music Engineering">AME - Audio Music Engineering</option>
											<option value="American Studies">AMS - American Studies</option>
											<option value="Astronomy">AST - Astronomy</option>
											<option value="Archeology Tech &amp; Hist Structure">ATH - Archeology Tech &amp; Hist Structure</option>
											<option value="Brain and Cognitive Sciences">BCS - Brain and Cognitive Sciences</option>
											<option value="Biology">BIO - Biology</option>
											<option value="Biomedical Engineering">BME - Biomedical Engineering</option>
											<option value="College of Arts &amp; Science">CAS - College of Arts &amp; Science</option>
											<option value="Religion &amp; Classics  Classical Greek">CGR - Religion &amp; Classics - Classical Greek</option>
											<option value="Chemical Engineering">CHE - Chemical Engineering</option>
											<option value="Modern Languages &amp; Cultures  Chinese">CHI - Modern Languages &amp; Cultures - Chinese</option>
											<option value="Chemistry">CHM - Chemistry</option>
											<option value="Religion &amp; Classics  Classical Studies">CLA - Religion &amp; Classics - Classical Studies</option>
											<option value="Modern Languages &amp; Cultures  Comparative Literature">CLT - Modern Languages &amp; Cultures - Comparative Literature</option>
											<option value="Computer Science">CSC - Computer Science</option>
											<option value="Clinical and Social Sciences in Psychology">CSP - Clinical and Social Sciences in Psychology</option>
											<option value="Center for Visual Science">CVS - Center for Visual Science</option>
											<option value="Dance">DAN - Dance</option>
											<option value="Data Science &amp; Computation">DSC - Data Science &amp; Computation</option>
											<option value="Digital Humanities">DH - Digital Humanities</option>
											<option value="Digital Media Studies">DMS - Digital Media Studies</option>
											<option value="Engineering and Applied Sciences">EAS - Engineering and Applied Sciences</option>
											<option value="Electrical and Computer Engineering">ECE - Electrical and Computer Engineering</option>
											<option value="Economics">ECO - Economics</option>
											<option value="Earth &amp; Environmental Science">EES - Earth &amp; Environmental Science</option>
											<option value="Environmental Humanities">EHU - Environmental Humanities</option>
											<option value="English Language Program">ELP - English Language Program</option>
											<option value="English">ENG - English</option>
											<option value="Alternative Energy">ERG - Alternative Energy</option>
											<option value="Film and Media Studies">FMS - Film and Media Studies</option>
											<option value="Modern Languages &amp; Cultures  French">FR - Modern Languages &amp; Cultures - French</option>
											<option value="Modern Languages &amp; Cultures  German">GER - Modern Languages &amp; Cultures - German</option>
											<option value="Gender, Sexuality &amp; Women's Studies">GSW - Gender, Sexuality &amp; Women's Studies</option>
											<option value="Religion &amp; Classics  Greek">GRK - Religion &amp; Classics - Greek</option>
											<option value="Religion &amp; Classics  Hebrew">HEB - Religion &amp; Classics - Hebrew</option>
											<option value="History">HIS - History</option>
											<option value="Health and Society">HLS - Health and Society</option>
											<option value="Intensive English Program">IEP - Intensive English Program</option>
											<option value="International Relations">IR - International Relations</option>
											<option value="Modern Languages &amp; Cultures  Italian">IT - Modern Languages &amp; Cultures - Italian</option>
											<option value="Modern Languages &amp; Cultures  Japanese">JPN - Modern Languages &amp; Cultures - Japanese</option>
											<option value="Judaic Studies">JST - Judaic Studies</option>
											<option value="Modern Languages &amp; Cultures  Korean">KOR - Modern Languages &amp; Cultures - Korean</option>
											<option value="Religion &amp; Classics  Latin">LAT - Religion &amp; Classics - Latin</option>
											<option value="Linguistics">LIN - Linguistics</option>
											<option value="Literary Translation Studies">LTS - Literary Translation Studies</option>
											<option value="Mathematics">MTH - Mathematics</option>
											<option value="Materials Science">MSC - Materials Science</option>
											<option value="Mechanical Engineering">ME - Mechanical Engineering</option>
											<option value="Music">MUR - Music</option>
											<option value="Naval Science">NAV - Naval Science</option>
											<option value="Neuroscience">NSC - Neuroscience</option>
											<option value="Optics">OPT - Optics</option>
											<option value="Wallis Institute of Political Economics">PEC - Wallis Institute of Political Economics</option>
											<option value="Public Health">PH - Public Health</option>
											<option value="Philosophy">PHL - Philosophy</option>
											<option value="Photographic Preservation &amp; Collections Management">PPC - Photographic Preservation &amp; Collections Management</option>
											<option value="Physics">PHY - Physics</option>
											<option value="Modern Languages &amp; Cultures  Polish">POL - Modern Languages &amp; Cultures - Polish</option>
											<option value="Modern Languages &amp; Cultures  Portuguese">POR - Modern Languages &amp; Cultures - Portuguese</option>
											<option value="Political Science">PSC - Political Science</option>
											<option value="Psychology">PSY - Psychology</option>
											<option value="Religion and Classics">REL - Religion and Classics</option>
											<option value="Modern Languages &amp; Cultures  Russian Studies">RST - Modern Languages &amp; Cultures - Russian Studies</option>
											<option value="Modern Languages &amp; Cultures  Russian">RUS - Modern Languages &amp; Cultures - Russian</option>
											<option value="Art &amp; Art HistoryStudio Arts">SA - Art &amp; Art History-Studio Arts</option>
											<option value="Study Abroad">SAB - Study Abroad</option>
											<option value="Social Entrepreneurship">SEN - Social Entrepreneurship</option>
											<option value="Religion &amp; Classics  Sanskrit">SKT - Religion &amp; Classics - Sanskrit</option>
											<option value="Sociology">SOC - Sociology</option>
											<option value="Modern Languages &amp; Cultures  Spanish">SP - Modern Languages &amp; Cultures - Spanish</option>
											<option value="Statistics">STT - Statistics</option>
											<option value="Sustainability">SUS - Sustainability</option>
											<option value="TEAM Computer Science">TCS - TEAM Computer Science</option>
											<option value="TEAM Biomedical Engineering">TEB - TEAM Biomedical Engineering</option>
											<option value="TEAM Chemical Engineering">TEC - TEAM Chemical Engineering</option>
											<option value="TEAM Electrical Engineering">TEE - TEAM Electrical Engineering</option>
											<option value="Technical Entrepreneurship Management">TEM - Technical Entrepreneurship Management</option>
											<option value="TEAM Optics">TEO - TEAM Optics</option>
											<option value="TEAM Mechanical Engineering">TME - TEAM Mechanical Engineering</option>
											<option value="Religion &amp; Classics  Turkis">TUR - Religion &amp; Classics - Turkish</option>
											<option value="Gender, Sexuality &amp; Women's Studies">WST - Women's Studies (see GSW for current courses)</option>
											<option value="Writing Program">WRT - Writing Program</option>
										</Form.Control>
									</Form.Group>
								</div>

								<div id={v}>
								<Form.Group className="formGroup" controlId="formGridSchool">
									<Form.Control as="select" className="formControl" onChange={(event) => this.searchActionInterpret('NONE', 'NONE', event.target.value)}>
										<option hidden value="Nothing">Credits</option>
										<option value='Nothing'></option>
										<option value='1'>1.0</option>
										<option value='2'>2.0</option>
										<option value='3'>3.0</option>
										<option value='4'>4.0</option>
										<option value='5'>5.0</option>
										<option value='6'>6.0</option>
									</Form.Control>
								</Form.Group>
								</div>

                    <div className="sliderbox">
                      <p>Time Period</p>
                      <Slider range marks={marks} step={null} tooltipVisible={false} defaultValue={[0,100]} onAfterChange={this.onSliderChange}/>
                    </div>

                    <ButtonToolbar xs={12} md={3} lg={2}>
                      <ToggleButtonGroup type="checkbox" defaultValue={[1, 3]} id="weekBar">
                        <ToggleButton value={'MON'} onChange={(event) => this.searchActionInterpret('NONE', event.target.value, 'NONE')}>M</ToggleButton>
                        <ToggleButton value={'TUE'} onChange={(event) => this.searchActionInterpret('NONE', event.target.value, 'NONE')}>T</ToggleButton>
                        <ToggleButton value={'WEN'} onChange={(event) => this.searchActionInterpret('NONE', event.target.value, 'NONE')}>W</ToggleButton>
                        <ToggleButton value={'THU'} onChange={(event) => this.searchActionInterpret('NONE', event.target.value, 'NONE')}>Th</ToggleButton>
                        <ToggleButton value={'FRI'} onChange={(event) => this.searchActionInterpret('NONE', event.target.value, 'NONE')}>F</ToggleButton>
                      </ToggleButtonGroup>
                    </ButtonToolbar>
									
								
							</div>
						</Col>
						<Col xs={12} md={7} lg={7} id="result-pool">
							{this.state.resultPrompt}
							{this.state.courses}
						</Col>


						<div className="col-xs-0 col-md-2 col-lg-2 popovers">
              <OverlayTrigger trigger="click" placement="left" overlay={this.state.schedule}>
                <Button className="schedulePop btn-info" onClick={this.load_schedule} variant="success" id="extraBtn">Schedule</Button>
              </OverlayTrigger>

              <OverlayTrigger trigger="click" placement="left" overlay={this.state.dashboard}>
                <Button className="dashPop btn-info" onClick={this.load_dashboard} variant="success" id="extraBtn">Dashboard</Button>
              </OverlayTrigger>
						</div>
					</Row>

					<div className="modal fade" id="myModal" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
					<div className="modal-dialog">
						<div className="modal-content">
						<div className="modal-header">
							<button type="button" className="close" data-dismiss="modal" onClick={this.unloadCurCourse} aria-hidden="true">&times;</button>
						</div>
						<div className="modal-body custom-modal">
							<Row>
								<Col xs={9}>
								  <Card className="classCard" bg="light" text="#383838">
									<Card.Body>
										<Row>
                      <Col
                        tag="a"
                        className="card_padding"
                        data-toggle="modal"
                        id={this.state.cur_course.id}
                        data-target="#myModal"
                        onClick={this.recordPopUpInfo}
                        style={{ cursor: "pointer"}}
                        xs={10}>
                        <Card.Title>
                          CRN - {this.state.cur_course.crn}&nbsp;
                          {this.state.cur_course.cname}&nbsp;&nbsp;
                          {this.state.cur_course.title}&nbsp;&nbsp;
                          {this.state.cur_course.credit}&nbsp;Credits
                        </Card.Title>
                        {/* <Card.Subtitle>CRN&nbsp;{cur_course.crn}&nbsp;&nbsp;{cur_course.credit}&nbsp;Credits</Card.Subtitle> */}
                        <div className="card-text">
                          <div className="card-text__row">
                            <p className="rowTitle">Description:</p>
                            <p className="text-margin text-hidden">{this.state.cur_course.description}</p>
                          </div>
                          <div className="card-text__row">
                          <p className="rowTitle text-margin">Instructor:</p>
                              <p id="instructor">{this.state.cur_course.name}</p>
                              <p className="rowTitle text-margin">Time:</p>
                              <p id="time">{this.state.cur_course.weekday}&nbsp;{this.state.cur_course.start_t}-{this.state.cur_course.end_t}</p>
                              <p className="rowTitle text-margin">Location: </p>
                              <p>{this.state.cur_course.location}</p>
                              <Button id="syllabus_pop" variant="secondary">SYLLABUS</Button>
                          </div>
                        </div>
                      </Col>
                      <Col xs={2} className="rating-section align-middle">
                        <div className="rating">{this.state.cur_course.score}</div>
                        <div className="rating__subtitle">Overall Rating</div>
                        <div className="rating__subtitle--sub">(30 peers rated)</div>
                        <OverlayTrigger trigger="click" placement="left" overlay={rate}>
                          <button id="rateButton" className="btn btn-info">RATE</button>
                        </OverlayTrigger>
                      </Col>
                    </Row>
										<Row>
											<div className="cardButtonMod">
												<Button id="selectMod" variant="success">Add to Schedule</Button>
												<Button id="wishlistMod" variant="danger">Add to Wishlist</Button>
											</div>
										</Row>
									</Card.Body>
								  </Card>

								  <div className="row bootstrap snippets">
										<div className= "col-8 col-md-offset-2 col-sm-12">
										<div className="comment-wrapper">
											<div className= "panel-heading"></div>
											<div className="panel panel-info">
												<div className="panel-body">
													<textarea
                            className="form-control"
                            value= {this.state.comment}
                            onChange={this.commentChange}
                            placeholder="Write a comment..."
                            rows="3">
                          </textarea>
													<br />
													<button type="button" className="btn btn-info pull-right" onClick={this.submitComment}>Post</button>
													<div className="clearfix"></div>
													<hr />
													<ul className="media-list">
														{this.state.comments}
													</ul>
												</div>
											</div>
										</div>
									</div>
								</div>

								</Col>
								<Col xs={3}>
								   <div className="card">
									   <div className="card-body text-center pb-2">
										   <p>
                         <img
                          alt="profile"
                          className="portrait"
                          src="http://exercisebliss.com/wp-content/themes/bliss-blank3/img/profile-square.jpg"
                          />
                        </p>
										   <h5 className="prof__name">{this.state.cur_course.name}</h5>


                                                    <p className="prof__subtext"><b>PhD, Cornell University, 2004</b></p>
                                                    <br/>


                       <p className="prof__subtext"><b>Research Interests:</b></p>
                       <p className="prof__subtext"> 
                        Economics of Education, Labor Economics, 
                        Applied Econometrics,Environmental Economics, 
                        Public Economics
                      </p>
                      <button className="btn btn-secondary mx-2 personalWebsiteButton">Personal Website</button>
									   </div>
								   </div>
								</Col>
							</Row>
						</div>
						</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default App;