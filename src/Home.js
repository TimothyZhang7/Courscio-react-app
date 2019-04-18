import React, { Component } from 'react';
import LogoLarge from './icons/Logo-l.png';
import Logo from './icons/logo.png';
import { Link } from 'react-router-dom'

class Home extends Component{

  render(){
  return(
    <div>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="home.css" />
    <link rel="stylesheet" type="text/css" href="iPad.css"/>
    <link rel="stylesheet" type="text/css" href="small-device.css"/>
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.0/css/all.css" integrity="sha384-Mmxa0mLqhmOeaE8vgOSbKacftZcsNYDjQzuCOm6D02luYSzBG8vpaOykv9lFQ51Y" crossOrigin="anonymous"/>
    <script src="https://code.jquery.com/jquery-1.10.2.js"></script>

  <div>
    <nav className="navbar navbar-expand-lg navbar-light navbar-custom">
      <div className="container-fluid col-xs-12 col-sm-12 col-md-12 col-lg-12">
        <Link to="/home" className="col-1 ml-3" >
          <img className="image-fluid home-logo" id="logo" src={LogoLarge} alt="logo"/>
        </Link>
        <button className="navbar-toggler mr-3" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse col-lg-6 offset-lg-2" id="navbarSupportedContent">
          <div className="navbar-nav navbar-right col-lg-auto ml-auto">
            <Link to="/home" className="nav-item" >About Us</Link>
            <Link to="/" className="nav-item" >Sign Up</Link>
            <Link to="/" className="nav-item" >Login</Link>
            <Link to="/home" className="nav-item">Contact</Link>
          </div>
        </div>
      </div>
    </nav>

    <div className="custom-cont" id="mainPage">
        <div className="row" id="sloganRow">
          <div className="col-md-7 col-lg-7">
            <h1 id="header">Make an informed decision when selecting courses&#46;</h1>
          </div>

          <div className="col-11 col-md-4 col-lg-3 offset-lg-1" id="findCourse">
            <Link to="/" id="findCourse-button" ><button type="button" className="btn btn-danger">Find Courses</button></Link>
          </div>
        </div>

        <div className="row d-md-none">
          <h2>
            Features
            <img src="/icons/Logo-l.png" height="45" />
          </h2>
        </div>

        <div className="row my-4" id="bannerCard">
          <div className="no-pad col-sm-12 col-md-3 col-lg-3">
            <div className="card" id="comments">
              <img className="card-img-top" src="/comics/Comments.png" id="commentPic" alt="Card image cap"/>
              <div className="card-body">
                <h5 className="card-title">Comments</h5>
                <p className="card-text">See what your peers think about the class from their latest experiences.</p>
              </div>
            </div>
          </div>

          <div className="no-pad col-sm-12 col-md-3 col-lg-3">
            <div className="card" id="coureRating">
              <img className="card-img-top" src="/comics/Course_Rating.png" alt="Card image cap"/>
              <div className="card-body">
                <h5 className="card-title" id="c_rating"><span>Rating</span></h5>
                <p className="card-text">More than 30 students rated for each course. No more getting lost in biased data.</p>
              </div>
            </div>
          </div>

          <div className="no-pad col-sm-12 col-md-3 col-lg-3">
            <div className="card" id="syllabus" >
              <img className="card-img-top" src="/comics/Syllabus.png" alt="Card image cap"/>
              <div className="card-body">
                <h5 className="card-title">Syllabus</h5>
                <p className="card-text">Grasp every detail (grading, homework, topics, textbook) of the course.</p>
              </div>
            </div>
          </div>

          <div className="no-pad col-sm-12 col-md-3 col-lg-3">
            <div className="card" id="instructor" >
            <img className="card-img-top right" src="/comics/Instructor.png" alt="Card image cap"/>
            <div className="card-body">
              <h5 className="card-title" id="instText">Instructor</h5>
              <p className="card-text">Get to know your professor and have a more involved interaction.</p>
            </div>
            </div>
          </div>
        </div>
      </div>
    <div className="container-fluid " id="aboutCourscio">
      <div className="row mx-3">
        <h2 id="about_text">About Courscio<img src={Logo} height="45" /></h2>
      </div>

      <div className="row mx-2">
        <div className="col-xs-0 col-3 d-none d-md-block">
          <img className="image-fluid home-img" src="/comics/about.png" id="aboutpng" width="140%" height="80%" />
        </div>
        <div className="col-8 offset-1 d-none d-md-block">
          <h1 id="about-desc">With Courscio, all your course info <br />is in one place</h1>
        </div>
      </div>

      <div className="row mt-5 mx-4 home-row">
        <div className="col-xs-12 col-md-10 col-lg-8">
          <h3 className="aboutTitle"><u>Our</u> Story</h3>
          <p>
            Courscio went under way in November 2018 by our founders, Shuting and Vitu, 
            as a debate matter regarding the lack of valuable and reliable information  when 
            students need to choose courses. The same sentiments echoed through the people
            they surveyed, and after sizing the market, they both agreed it was worth pursuing 
            efforts to address their sample’s pain points. In February 2019, we enlarged our
            team into 9 members and landed our first product for Rochester community in March 18th.
          </p>
        </div>
        <div className="col-lg-3 col-md-2 col-xs-0 d-none d-md-block">
          <img className="image-fluid home-img" src="/comics/story.png" width="100%" height="auto"/>
        </div>
      </div>

      <div className="row mt-5 mx-4 home-row">
        <div className="col-xs-0 col-md-3 d-none d-md-block">
          <img className="image-fluid mt-3 home-img" src="/comics/vision.png" width="100%" height="auto"/>
        </div>
        <div className="col-xs-12 col-10 col-md-8 mt-5" id="ourVision">
          <h3 className="aboutTitle"><u>Our</u> Vision</h3>
          <p>Our founders’ vision: To deliver a better user experience alongside useful course information 
            to better inform students as they register for classNamees. An innovative encounter that intimately 
            allows college students to know (Courscio→ “scio”: to know in latin) information relevant to 
            their course selections. As a student-run venture, with a scrappy and creative mindset, 
            our team strives to approach democratizing the Learning Management System (LMS) market.  
          </p>
        </div>
      </div>
    </div>  

      <div id="ourTeam" className="container mt-5">
        <div className="row">
          <h2>Our Team<img src={Logo} height="45"  /></h2>
        </div>
        <div className="row mt-30">
            <div className="col-md-3 col-6">
                <div className="box15">
                    <img className="profilePic" src="/team/Julia.jpg" alt=""/>
                    <div className="box-content">
                        <h3 className="title">Shuting Liang</h3>
                        <h2 className="text">Co-Founder</h2>
                        <h2 className="text">Chef Executive</h2>
                    </div>
                </div>
            </div>
            <div className="col-md-3 col-6">
                <div className="box15">
                    <img className="profilePic" src="/team/Vitu.jpg" alt=""/>
                    <div className="box-content">
                        <h3 className="title">Vitu Kambilonje</h3>
                        <h2 className="text">Co-Founder</h2>
                        <h2 className="text">Product Manager</h2>
                    </div>
                </div>
            </div>
            <div className="col-md-3 col-6">
                <div className="box15">
                    <img className="profilePic" src="/team/Jade.jpg" alt=""/>
                    <div className="box-content">
                        <h3 className="title">Jade Fung</h3>
                        <h2 className="text">Frontend Developer</h2>
                        <h2 className="text">Database Creator </h2>
                    </div>
                </div>
            </div>
            <div className="col-md-3 col-6">
                <div className="box15">
                    <img className="profilePic" src="/team/Jianhao.jpg" alt=""/>
                    <div className="box-content">
                        <h3 className="title">Jianhao Zhang</h3>
                        <h2 className="text">Full-stack Developer</h2>
                        <h2 className="text">Database Creator </h2>
                    </div>
                </div>
            </div>
        </div>

        <div className="row mt-30">
          <div className="col-md-3 col-6">
              <div className="box15">
                  <img className="profilePic" src="/team/Jiupeng.jpg" alt=""/>
                  <div className="box-content">
                      <h3 className="title">Jiupeng Zhang</h3>
                      <h2 className="text">Backend Developer</h2>
                  </div>
              </div>
          </div>
          <div className="col-md-3 col-6">
              <div className="box15">
                  <img className="profilePic" src="/team/Andrew.jpg" alt=""/>
                  <div className="box-content">
                      <h3 className="title">Andrew Wang</h3>
                      <h2 className="text">Backend Developer</h2>
                  </div>
              </div>
          </div>
          <div className="col-md-3 col-6">
              <div className="box15">
                  <img className="profilePic" src="/team/Wailea.jpg" alt=""/>
                  <div className="box-content">
                      <h3 className="title" id="long_name">Wailea Visiko-Knox</h3>
                      <h2 className="text">Marketing Director</h2>
                  </div>
              </div>
          </div>
          <div className="col-md-3 col-6">
              <div className="box15">
                  <img className="profilePic" src="/team/Park.jpg" alt=""/>
                  <div className="box-content">
                      <h3 className="title">Joon Sung Park</h3>
                      <h2 className="text">Database Collector </h2>
                      <h2 className="text">Frontend Developer </h2>
                  </div>
              </div>
          </div>
        </div>
          <div className="row mt-30">
            <div className="col-md-3 col-6">
                <div className="box15">
                    <img className="profilePic" src="/team/Wendy.jpg" alt=""/>
                    <div className="box-content">
                        <h3 className="title">Wendy Zhou</h3>
                        <h2 className="text">Database Collector</h2>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <footer className="page-footer font-small bg-dark col-12 mt-5 py-2">
        {/* <div style={{"backgroundColor": "#E25A64"}}>
          <div className="container">
            <div className="row py-4 d-flex align-items-center">
              <div className="col-md-6 col-lg-5 text-center text-md-left mb-4 mb-md-0">
                <h6 className="mb-0">Get connected with us on social networks!</h6>
              </div>
              <div className="col-md-6 col-lg-7 text-center text-md-right">
                  <a className="fb-ic" href="https://www.facebook.com/courscio.official/" target="_blank"><i className="fab fa-facebook-f white-text mr-4"> </i></a>
                  <a className="ins-ic" href="https://www.instagram.com/courscio_official/" target="_blank"><i className="fab fa-instagram white-text"> </i></a>
              </div>
            </div>
          </div>
        </div> */}

        <div className="container text-center text-md-left mt-3">
          <div className="row mt-3">
            <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
              <h6 className="text-uppercase font-weight-bold">Courscio</h6>
              {/* <hr className="deep-purple accent-2 mb-4 mt-0 d-inline-block mx-auto" style={{"width": "60px"}}/> */}
                <a className="fb-ic" href="https://www.facebook.com/courscio.official/" target="_blank"><i className="fab fa-facebook-f white-text mr-4"> </i></a>
                <a className="ins-ic" href="https://www.instagram.com/courscio_official/" target="_blank"><i className="fab fa-instagram white-text"> </i></a>
            </div>
            <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
              <h6 className="text-uppercase font-weight-bold">Company</h6>
              {/* <hr className="deep-purple accent-2 mb-4 mt-0 d-inline-block mx-auto" style={{"width": "60px"}}/> */}
              <p>
                <a href="#aboutCourscio">About Us</a>
              </p>
              <p>
                <a href="#ourTeam">Our Team</a>
              </p>

            </div>

            <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">
              <h6 className="text-uppercase font-weight-bold">Useful links</h6>
               {/* <hr className="deep-purple accent-2 mb-4 mt-0 d-inline-block mx-auto" style={{"width": "60px"}}/> */}
              <p>
                <a href="#!">Search for Courses</a>
              </p>
            </div>
            <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4">
              <h6 className="text-uppercase font-weight-bold">Contact</h6>
               {/* <hr className="deep-purple accent-2 mb-4 mt-0 d-inline-block mx-auto" style={{"width": "60px"}}/> */}
              <p><i className="fas fa-home mr-3"></i> Rochester, NY 14627, US</p>
              <p><i className="fas fa-envelope mr-3"></i> info@courscio.com</p>
            </div>
          </div>
        </div>
        <div className="footer-copyright text-center py-3">© 2019 Copyright:
          <a href="https://courscio.com"> courscio.com</a>
        </div>
      </footer>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js"></script>
  </div>

  </div>
    )
  }
}

export default Home;


