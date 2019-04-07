
import React, { Component } from 'react';
import {Card, Row, Col, Form, Button, ButtonToolbar, ToggleButton, ToggleButtonGroup, Popover, OverlayTrigger} from 'react-bootstrap';
import {Slider, Rate} from 'antd';
import axios from 'axios';
import './App.css';

const API = '/v1/'

const noCourse = {cname: "Error", credit: 0, crn: "00000", description: "Contact Enginner",
end_t: "2400", id:-1, key: "-1MON", location: "None", 
major: "None", name: "null", prerequisite: "No prerequisite", 
schoolId: -1, score: 0, semester: "Fall 2019", 
start_t:"0000", title: "System Error", weekday: "NO"};

class App extends Component {
	constructor(props) {
		super(props)

		this.state = {
			token: "",
			auth: "",
			uid: 6,
			courses: [],
			resultPrompt: "",
			courses_raw_data: [], //RenderedHtml, start_t, end_t, course_obj, weekdays
			isLoading: false,
			err: false,
			dept: "Nothing",
			weekdays: [],
			isAdvancedSearch: true,
			semester: "Fall 2019",
			school: "Arts, Science, and Engineering",
			slider_val: [800,2400],
			cur_course: noCourse,
			comment: "",
			comments: []
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
		this.raw_data_extract = this.raw_data_extract.bind(this)
		this.searchActionInterpret = this.searchActionInterpret.bind(this)
		this.render_key_word = this.render_key_word.bind(this)
		this.onDestroySearchResult = this.onDestroySearchResult.bind(this)
		this.onDateDeptChange = this.onDateDeptChange.bind(this)
		this.renderCardList = this.renderCardList.bind(this)
	}

	clicked(){
	    this.setState({
	      showMe : ! this.state.showMe
	    })
	}

	async componentDidMount() {
		this.setState({
			isLoading: true
		});

		console.log("TO ROWS")
		

		try{
			var courseRows = []
			var courseRows_raw = []
			const courseRow = <Card className="noCourse-card" text="black" key="0">
					<Card.Body>
						<Card.Title>Use the filter or search box to find courses</Card.Title>
					</Card.Body>
					<img class="card-img-bottom" src="comics/noCourse.png" alt="noCourse" />
					<br />
				</Card>
			courseRows.push(courseRow)
			courseRows_raw.push([courseRow],800,2400)
			this.setState({
				courses: courseRows,
				courses_raw_data: courseRows_raw
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
		var courses = this.raw_data_extract(this.weekday_filter(this.dept_filter(raw_data, this.state.dept), this.state.weekdays));
		console.log(raw_data)
		console.log(courses)
		this.setState({
			isAdvancedSearch: false,
			courses_raw_data: raw_data,
			courses: courses,
			resultPrompt: this.render_key_word(this.props.keyword)
		})
	}

	searchActionInterpret(subject, weekday){
		if (subject === 'NONE'){
			subject = this.state.dept
		}else{
			this.setState({
				dept: subject
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
			this.ReMount(subject, temp)
		}else{
			this.onDateDeptChange(temp, subject)
		}
	}

	renderCardList(response){
		var courseRows_raw = []
		var weekdayRow = ""
		var weekdays = []
		const filtered = response
		for(var i= 0; i< filtered.length; i++) {
			weekdayRow = "";
			weekdays = []
			const cur_course = filtered[i];
			while (i < filtered.length && cur_course.crn === filtered[i].crn){
				weekdayRow = weekdayRow + " " + this.translate_weekday(filtered[i].weekday);
				weekdays.push(filtered[i].weekday);
				i++
			}
			i--
			const courseRow = <Card className="classCard" bg="light" text="#383838" key={cur_course.key}>
			  <Card.Body>
			  <Row>
				  <Col tag="a" className="card_padding" data-toggle="modal" id={cur_course.id} data-target="#myModal" onClick={this.recordPopUpInfo} style={{ cursor: "pointer"}} xs={9}>
					<Card.Title>{cur_course.cname}&nbsp;&nbsp;{cur_course.title}</Card.Title>
					<Card.Subtitle>CRN&nbsp;{cur_course.crn}&nbsp;&nbsp;{cur_course.credit}&nbsp;Credits</Card.Subtitle>
					<div className="card-text">
					  <table>
						<tbody>     
							<tr>
								<td className="rowTitle">Time:</td>
								<td id="time">{weekdayRow}&nbsp;{cur_course.start_t}-{cur_course.end_t}</td>
							</tr>
							<tr>
								<td className="rowTitle">Location: </td>
								<td>{cur_course.location}</td>
							</tr>
							<tr>
								<td className="rowTitle">Instructor:</td>
								<td id="instructor">{cur_course.instructor}</td>
							</tr>
							<tr>       
								<td className="rowTitle">Description:</td>
								<td>{cur_course.description}</td>
						  </tr>
					  </tbody>
					  </table>
					</div>
					</Col>
					<Col xs={3} id="flagdiv">
						<div id="flag">
							<span id="flagtext">Course Rating</span> <br /><p id="courseScore">{cur_course.score}</p>
						</div>
						<div className="cardButton">
						  <Button id="select" value= {cur_course.id} variant="success">Add to Schedule</Button>
						  <Button id="wishlist" value= {cur_course.id} variant="danger">Add to Wishlist</Button>
						</div>
					</Col>
				</Row>
			  </Card.Body>
			  <br />
			</Card>
			courseRows_raw.push([courseRow, cur_course.start_t, cur_course.end_t, cur_course.major, weekdays, cur_course])
		}
		this.setState({
			courses_raw_data: courseRows_raw
		})
		return courseRows_raw
	}

	async ReMount(subject, weekdays){
		this.setState({
			isLoading: true,
			courses:[],
			courses_raw_data: [],
		});

		//The start_t and end_t
		const a = this.state.slider_val[0]
		const b = this.state.slider_val[1]

		try{
			let query = 'course/filters?major=' + encodeURIComponent(subject) + '&semester=' + encodeURIComponent(this.state.semester)
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

	findCourseById(raw_data, cid){
		console.log(raw_data)
		console.log(cid)
		for (var i= 0; i< raw_data.length; i++){
			if (raw_data[i].length === 6){
				if (parseInt(raw_data[i][5].id) === parseInt(cid)){
					return raw_data[i][5]
				}
			}
		}
		console.log("Course not found, fatal logical error")
		return undefined
	}

	onDateDeptChange(weekdays, dept){
		console.log(weekdays)
		console.log(dept)
		const dept_clear_courses = this.dept_filter(this.state.courses_raw_data, dept)
		console.log(dept_clear_courses)
		const weekday_clear_courses = this.weekday_filter(dept_clear_courses, weekdays)
		console.log(weekday_clear_courses)
		const courses = this.raw_data_extract(weekday_clear_courses)
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
		const courses = this.time_filter(this.weekday_filter(this.dept_filter(this.state.courses_raw_data,this.state.dept),this.state.weekdays), a, b)
		console.log()
		this.setState({
			courses: courses
		})
	}

	time_filter(tuples,a,b){
		var courseRows = []
		for (var i=0; i< tuples.length; i++){
			if (tuples[i][1] >= a && tuples[i][2] <= b){
				courseRows.push(tuples[i][0])
			}
		}
		return courseRows
	}

	dept_filter(tuples, dept){
		var raw_data = []
		if (tuples.length> 0 && tuples[0].length> 3 && dept !== "Nothing"){
			for (var i=0; i<tuples.length; i++){
				if (tuples[i][3] === dept){
					raw_data.push(tuples[i])
				}
			}
			return raw_data
		}else{
			return tuples
		}
	}

	weekday_filter(tuples, weekdays){
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
		}else{
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
		this.ReMount(this.state.dept, this.state.weekdays)
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

	commentChange(event){
		this.setState({
			comment: event.target.value
		})
	}

	async submitComment(event){
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
					<a className="pull-left">
					</a>
					<div className="media-body shadow-sm p-3 mb-2 bg-white rounded">
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



//  }
render(){ 

	const marks = {
			0: '8am',
			8.33: '',
			16.66: '',
			25: '',
			33.32: 'Noon',
			41.65: '',
			50: '',
			58.31: '',
			66.64: '4pm',
			74.97: '',
			83.3: '',
			91.63: '',
			100: '8pm+'
		};

		const popover = (
			<Popover id="popover-basic" title="Popover right">
				And here's some <strong>amazing</strong> content. It's very engaging. right?
			</Popover>
		);

		const showMe = this.state.showMe;
		var v;
		let button;

		if(showMe){
		     v = "visible";
		     console.log('vis')
		   }
		   else{
		     v= "notVisible";
		
		     console.log('not')
		
		   }


		return (

			<div className="App">
				<div className="Container">
					<Row>
						<Col xs={0} md={0} lg={1}>
						</Col>
						<Col className="filterLarge" xs={12} md={3} lg={2}>
							<div container="true" className="filtersmall">
								<button variant="primary" onClick={() => this.clicked() }>
					              	<div>
					                	<p id="filterWord">FILTER BY</p>
					                </div>
					            </button>

					            <div id = {v}>
								<Form.Group as={Col} className="formGroup" controlId="formGridTerm">
									<Form.Control as="select" className="formControl" defaultValue= "Fall 2019">
										<option hidden>Term</option>
										<option></option>
										<option>Fall 2019</option>
									</Form.Control>
								</Form.Group>
								</div>

								<div id = {v}>
								<Form.Group as={Col} className="formGroup" controlId="formGridSchool">
									<Form.Control as="select" className="formControl" defaultValue= "Arts, Science, and Engineering">
										<option hidden>School</option>
										<option></option>
										<option>Arts, Science, and Engineering</option>
									</Form.Control>
								</Form.Group>
								</div>

								<div id = {v}>
									<Form.Group as={Col} className="formGroup" controlId="formGridDept">
										<Form.Control as="select" className="formControl" onChange={(event) => this.searchActionInterpret(event.target.value,"NONE")}>
											<option hidden>Department</option>
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

									<div className="sliderbox">
											<Slider range marks={marks} step={null} tooltipVisible={false} defaultValue={[0,100]} onAfterChange={this.onSliderChange}/>
									</div>

									<ButtonToolbar xs={12} md={3} lg={2}>
										<ToggleButtonGroup type="checkbox" defaultValue={[1, 3]} id="weekBar">
											<ToggleButton value={'MON'} onChange={(event) => this.searchActionInterpret('NONE', event.target.value)}>M</ToggleButton>
											<ToggleButton value={'TUE'} onChange={(event) => this.searchActionInterpret('NONE', event.target.value)}>T</ToggleButton>
											<ToggleButton value={'WEN'} onChange={(event) => this.searchActionInterpret('NONE', event.target.value)}>W</ToggleButton>
											<ToggleButton value={'THU'} onChange={(event) => this.searchActionInterpret('NONE', event.target.value)}>Th</ToggleButton>
											<ToggleButton value={'FRI'} onChange={(event) => this.searchActionInterpret('NONE', event.target.value)}>F</ToggleButton>
										</ToggleButtonGroup>
									</ButtonToolbar>

									</Form.Group>
								</div>
							</div>
						</Col>
						<Col xs={12} md={7} lg={7}>
							{this.state.resultPrompt}
							{this.state.courses}
						</Col>
						<Col xs={0} md={2} lg={1}>
			                <OverlayTrigger trigger="click" placement="left" overlay={popover}>
			                  <Button className="schedulePop btn-info" variant="success" id="extraBtn">Schedule</Button>
			                </OverlayTrigger>
			 
			                <OverlayTrigger  trigger="click" placement="left" overlay={popover}>
			                  <Button className="dashPop btn-info" variant="success" id="extraBtn">Dashboard</Button>
			                </OverlayTrigger>
						</Col>
						<Col xs={0} md={0} lg={1}>
						</Col>
					</Row>

					<div className= "modal fade" id="myModal" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
					<div className= "modal-dialog">
						<div className="modal-content">
						<div className="modal-header">
							<button type="button" className="close" data-dismiss="modal" onClick={this.unloadCurCourse} aria-hidden="true">&times;</button>
						</div>
						<div className="modal-body">
							<Row>
								<Col xs={8}>
								  <Card className="classCard" bg="light" text="#383838">
									<Card.Body>
										<Row>
											<Col xs={9} id="courseInfo">
												<Card.Title>{this.state.cur_course.cname}&nbsp;&nbsp;{this.state.cur_course.title}</Card.Title>
												<Card.Subtitle>CRN&nbsp;{this.state.cur_course.crn}&nbsp;&nbsp;{this.state.cur_course.credit}&nbsp;Credits</Card.Subtitle>
												<div className="card-text">
													<table>
														<tbody>     
															<tr>
																<td className="rowTitle">Time:</td>
																<td id="time">{this.state.cur_course.weekday} {this.state.cur_course.start_t}-{this.state.cur_course.end_t}</td>
															</tr>
															<tr>
																<td className="rowTitle">Location: </td>
																<td>{this.state.cur_course.location}</td>
															</tr>
															<tr>
																<td className="rowTitle">Instructor:</td>
																<td id="instructor">Prof.</td>
															</tr>
															<tr>       
																<td className="rowTitle">Description:</td>
																<td>{this.state.cur_course.description}</td>
														  </tr>
														</tbody>
													 </table>
												</div>
											</Col>

											<Col xs={3} id="flagdiv">
												<div id="flag">
													<span id="flagtext">Course Rating</span> <br /><p id="courseScore">{this.state.cur_course.score}</p>
												</div>
												<Rate allowHalf defaultValue={2.5}/>
											</Col>
										</Row>
										<Row>
											<div className="cardButtonMod">
												<Button id="selectMod"  variant="success">Add to Schedule</Button>
												<Button id="wishlistMod"  variant="danger">Add to Wishlist</Button>
												<Button id="syllabusMod"  variant="secondary">Syllabus</Button>
											</div>
										</Row>
									</Card.Body>
									<br />
								  </Card>

								  <div className="row bootstrap snippets">
										<div className= "col-8 col-md-offset-2 col-sm-12">
										<div className="comment-wrapper">
											<div className= "panel-heading"></div>
											<div className="panel panel-info">
												<div className="panel-body">
													<textarea className="form-control" value= {this.state.comment} onChange={this.commentChange} placeholder="Write a comment..." rows="3"></textarea>
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
								<Col xs={4}>
								   <div className="card">
									   <div className="card-body text-center pb-2">
										   <p><img className="rounded-circle portrait" src="http://nicesnippets.com/demo/profile-2.png" width="100%" height="auto" /></p>
										   <h5 className="profCard-title"><strong>Nike Tyson</strong></h5>
										   <p className="profCard-text">This is basic user profile with image, title, detail and button.</p>
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