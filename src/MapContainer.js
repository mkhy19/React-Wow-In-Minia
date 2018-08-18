import React, {Component} from 'react'
import ReactDOM from 'react-dom'

import * as FoursquareAPI from './FoursquareAPI'

import sortBy from 'sort-by'

//Client ID
//4DQBNTFGYWRIJEJ1BQZC5M34TB3DAS21QKWCUWZX5EFNMD03
//Client Secret
//F4W4Y5WM2P1SNOH2410PBRES4BMTL2MOTMLILX05R513YE5D

export default class MapContainer extends Component {
  state = {
    query: '',
    markers: [],
    infowindow: new this.props.google.maps.InfoWindow(),
    venues: [],
    users: [],
    mapError: null,
    error: null
      
  }
 
  /*
    College & University
    4d4b7105d754a06372d81259

    College Engineering Building
    4bf58dd8d48988d19e941735
   
    College Science Building
    4bf58dd8d48988d19b941735

    College Technology Building
    4bf58dd8d48988d19f941735  

    Food
    4d4b7105d754a06374d81259
*/

  componentDidMount() {
      //Get FourSquare API
      const url = 'https://api.foursquare.com/v2/venues/search?client_id=4DQBNTFGYWRIJEJ1BQZC5M34TB3DAS21QKWCUWZX5EFNMD03&client_secret=F4W4Y5WM2P1SNOH2410PBRES4BMTL2MOTMLILX05R513YE5D&limit=9&v=20180323&categoryId=4bf58dd8d48988d19b941735,4bf58dd8d48988d19e941735,4bf58dd8d48988d19f941735&ll=28.087097,30.76184';
         
      fetch(url)    
          .then(data => {
            if (data.ok) 
            {
                //console.log(data.json());
                return data.json();              
            } 
            else
            {
                throw new Error(data.statusText)  
            }          
      })
          .then(data => {
          const venues = data.response["venues"];
          this.setState({ venues: venues });          
          this.loadMap();
          this.onclickLocation();
      })
      
      .catch(err => {  
          this.setState({ error: err.toString() });
      });
  };
 
    //Load map details
    loadMap() {
        if (this.props && this.props.google) {
            const { google } = this.props;
            const maps = google.maps;
            const mapRef = this.refs.map;
            const node = ReactDOM.findDOMNode(mapRef);
            let lat = 28.087097;
            let lng = 30.76184;
            const center = new maps.LatLng(lat, lng);
            const mapOptions = Object.assign({}, {
                center: center,
                zoom: 13,
                mapTypeId: google.maps.MapTypeId.HYBRID
            });

            this.map = new maps.Map(node, mapOptions);
            this.addMarkers()
        } 
    }

  // function to open infowindow when we click on a particular position
  onclickLocation = () => {
    const that = this;
    const {infowindow} = this.state;

    const displayInfowindow = (event) => {
      const {markers} = this.state;
      const markerIndex = markers.findIndex(m => m.title.toLowerCase() === event.target.innerText.toLowerCase());
         that.populateInfoWindow(markers[markerIndex], infowindow, that.state.users[markerIndex]);
    }
    document.querySelector('.locations-list').addEventListener('click', function (event) {
      if (event.target && event.target.nodeName === "LI") 
      {
          displayInfowindow(event);
      }
    });
  };
 
  //To add makers to all places
    addMarkers = () => {
        const { users } = this.state;
        const { google } = this.props;
        let { infowindow } = this.state;
        const bounds = new google.maps.LatLngBounds();

        this.state.venues.forEach((venue, indx) => {
            const marker = new google.maps.Marker({
                position: { 
                    lat: venue.location.lat, 
                    lng: venue.location.lng
                },
                map: this.map,
                title: venue.name
            });
            marker.addListener('click', () => {
                this.populateInfoWindow(marker, infowindow, users[indx])
            });
            this.setState((state) => ({
                markers: [...state.markers, marker]
            }));
            bounds.extend(marker.position)
        });
        this.map.fitBounds(bounds)
    };

    //This function populates the infoWindow when the marker is clicked
    //We will only allow one infoWindow which will open at the marker that is clicked, and populated based on that markers positions
    populateInfoWindow = (marker, infowindow, user) => {
        const { google } = this.props;
        const service = new google.maps.places.PlacesService(this.map);
        const geocoder = new google.maps.Geocoder();
        
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker !== marker) {
            infowindow.marker = marker.setAnimation(window.google.maps.Animation.BOUNCE);
            setTimeout(function () {
                marker.setAnimation(null);
            }, 1000);
            
            //Content for infowindows
            geocoder.geocode({ 'location': marker.position }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        service.getDetails({
                            placeId: results[1].place_id
                        }, (place, status) => {
                            if (status === google.maps.places.PlacesServiceStatus.OK) {
                                infowindow.setContent(`<h4>Name: <strong>${marker.title}</strong></h4>
                             <div>Latitude: ${marker.getPosition().lat()}</div>
                             <div>Longitude: ${marker.getPosition().lng()}</div>`);
                                infowindow.setContent(`<h3>${marker.title}</h3>
                                                        <h4>Minia Governorate, Egypt</h4> 
                                                         <h5><div>Latitude: ${marker.getPosition().lat()}</div>
                                                         <div>Longitude: ${marker.getPosition().lng()}</div></h5>`);
                                
                                infowindow.open(this.map, marker);
                            }
                        });
                    } else {
                        window.alert('No results found');
                    }
                } else {
                    window.alert('Geocoder failed due to: ' + status);
                }
            });
          
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', () => {
                infowindow.marker = null
            });
        }
    };
    
    handleValueChange = (event) => {
        this.setState({query: event.target.value});
    }
 
  render() {
    const {venues, query, markers, infowindow} = this.state;
    
    // To display or close infowindow 
    if (query)
    {
        venues.forEach((l, i) => {
            if (l.name.toLowerCase().includes(query.toLowerCase())) 
            {
              markers[i].setVisible(true);
            }
            else 
            {
                if (infowindow.marker === markers[i])
                {
                    infowindow.close();
                }
                markers[i].setVisible(false);
            }
        });
    }
    else
    {
        venues.forEach((l, i) => {
            if (markers.length && markers[i]) 
            {
                markers[i].setVisible(true);
            }
        });
    }
      
    return (
      <div>
        {this.state.error? (
                        <div className="error">
                            Error .... Please wait and try again....
                            <div className="error-description">{this.state.error}</div>
                        </div>) :     
        
        (<div className="container" role="application" aria-labelledby="app-menu" tabIndex="1">
          <div className="text-input">
            <input role="search" type='text' placeholder="Search Here"
                   value={this.state.value}
                   onChange={this.handleValueChange}/>
        
            <ul className="locations-list">{
              markers.filter(m => m.getVisible()).map((m, i) =>
                (<li key={i} role="link" tabIndex="0">{m.title}</li>))
            }</ul>
          </div>
                 
            <div role="application" className="map" ref="map">
                Please wait loading map......
                     {this.state.Error || <div className="error">{this.gm_authFailure()}</div>}
                </div>                 
            </div>)}
          </div>
        )
    }
     gm_authFailure() {
            return (
                <div>Wait wait and try again</div>
            );
        }
}
    
