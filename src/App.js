import React, { Component } from 'react';
import { GoogleApiWrapper } from 'google-maps-react'
import './App.css';
import MapContainer from './MapContainer'

//If there a problem with Google API
document.addEventListener("DOMContentLoaded", function(e) {
  let scriptTag = document.getElementsByTagName('SCRIPT').item(1);
    
  scriptTag.onerror = function(e) {
    console.log('Sorry! We cant access Google Maps API for now!');
    
    let mapContainerElemt = document.querySelector('#root');
    let erroElement = document.createElement('div');
    erroElement.innerHTML = '<div class="error-msg">We cant access Google Maps API </div>'
    mapContainerElemt.appendChild(erroElement)
  }
});

class App extends Component {
  componentDidMount() {
    document.querySelector('.menu').addEventListener('click', this.toggleSideBar)    
  }
 
  render() {
    return (
      <div className="App"> 
        {/*hamburger menu svg*/}
        <a className="menu" tabIndex="0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M2 6h20v3H2zm0 5h20v3H2zm0 5h20v3H2z"/>
            </svg>
        </a>        
        <h1 className="heading"> React Wow In Minia </h1>
        <MapContainer google={this.props.google} />
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyCcWi2VnslXjblvlK2JMusXX26jK8WniZY'
    
})(App)
