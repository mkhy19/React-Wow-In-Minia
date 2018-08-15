import React, {Component} from 'react'
import ReactDOM from 'react-dom'

export default class MapContainer extends Component {

  state = {
    locations: [
      {name: "Minia City, Minia", location: {lat:28.087097, lng: 30.76184}},
      {name: "Bani Hasan, Abu Qurqas", location: {lat: 27.903456, lng: 30.854055}},
      {name: "Tounah Al Gabal, Melawi", location: {lat: 27.774032, lng: 30.739311}},
      {name: "Minia University", location: {lat: 28.12327, lng: 30.73476}},
      {name: "Amarna, Deir Mawas", location: {lat: 27.661667, lng: 30.905556}},
      {name: "Church of the Blessed Virgin Mary of Mount bird, Samalut", location: {lat: 28.280463, lng: 30.747841}},
      {name: "Al Bahnasa, Bani Mazar", location: {lat: 28.536034, lng: 30.659567}},
      {name: "Akhenaten Museum, Minia", location: {lat: 28.095683, lng: 30.770485}},
      {name: "Kornish Al Nile, Minia", location: {lat: 28.100185, lng: 30.758498}}    
    ],
    query: '',
    markers: [],
    infowindow: new this.props.google.maps.InfoWindow(),
    highlightedIcon: null
  }

  componentDidMount() {
    this.loadMap();
    this.onclickLocation();
    // Style the markers a bit. This will be our listing marker icon.
    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    this.setState({highlightedIcon: this.makeMarkerIcon('0091ff')})
  }

  loadMap() {
    if (this.props && this.props.google) {
      const {google} = this.props;
      const maps = google.maps;

      const mapRef = this.refs.map;
      const node = ReactDOM.findDOMNode(mapRef);

      // Object creates a new map - only center and zoom are required.
      const mapOptions  = Object.assign({}, {
        center: {lat:28.087097, lng:30.76184},
        zoom: 13,
        mapTypeControl: google.maps.MapTypeId
      })

      this.map = new maps.Map(node, mapOptions);
        
      this.addMarkers();
    }
  }

  // function to open infowindow when we click on a particular position
  onclickLocation = () => {
    const that = this;
    const {infowindow} = this.state;

    const displayInfowindow = (event) => {
      const {markers} = this.state;
      const markerInd = markers.findIndex(m => m.title.toLowerCase() === event.target.innerText.toLowerCase());
      that.populateInfoWindow(markers[markerInd], infowindow);
    }
    document.querySelector('.locations-list').addEventListener('click', function (event) {
      if (event.target && event.target.nodeName === "LI") 
      {
          displayInfowindow(event);
      }
    });
  };

  handleValueChange = (event) => {
    this.setState({query: event.target.value});
  }

  //To add makers to all places
  addMarkers = () => {
    const {google} = this.props;
    let {infowindow} = this.state;
    const bounds = new google.maps.LatLngBounds();

    this.state.locations.forEach((location, ind) => {
      const marker = new google.maps.Marker({
        position: {
            lat: location.location.lat, 
            lng: location.location.lng
        },
        map: this.map,
        title: location.name
      })

      marker.addListener('click', () => {
        this.populateInfoWindow(marker, infowindow);
      })
      this.setState((state) => ({
        markers: [...state.markers, marker]
      }))
      bounds.extend(marker.position);
    })
    this.map.fitBounds(bounds);
  };

  //This function populates the infoWindow when the marker is clicked
  //We will only allow one infoWindow which will open at the marker that is clicked, and populated based on that markers positions
  populateInfoWindow = (marker, infowindow) => {
    const defaultIcon = marker.getIcon()
    const {highlightedIcon, markers} = this.state
    
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker !== marker) {        
        //to reset the color of previous marker
        if (infowindow.marker) {
            const ind = markers.findIndex(m => m.title === infowindow.marker.title)
            markers[ind].setIcon(defaultIcon)
        }
        
      // change marker icon color of clicked marker
      marker.setIcon(highlightedIcon);
      infowindow.marker = marker;
      infowindow.setContent(`<h3>${marker.title}</h3><h4>Minia Governorate, Egypt</h4> <h5>${marker.position}</h5>`);
      infowindow.open(this.map, marker);
      
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', function () {
        infowindow.marker = null;
      });
    }
  }

  
  // This function takes in a COLOR, and then creates a new marker
  // icon of that color. The icon will be 21 px wide by 34 high, have an origin
  // of 0, 0 and be anchored at 10, 34).
  makeMarkerIcon = (markerColor) => {
    const {google} = this.props
    let markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
      '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21, 34));
    return markerImage;
  }

  render() {
    const {locations, query, markers, infowindow} = this.state;
    
    // To display or close infowindow 
    if (query)
    {
        locations.forEach((l, i) => {
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
        locations.forEach((l, i) => {
            if (markers.length && markers[i]) 
            {
                markers[i].setVisible(true);
            }
        });
    }
      
    return (
      <div>
        <div className="container" role="application" aria-labelledby="app-menu" tabIndex="1">
          <div className="text-input">
            <input role="search" type='text'
                   value={this.state.value}
                   onChange={this.handleValueChange}/>
        
            <ul className="locations-list">{
              markers.filter(m => m.getVisible()).map((m, i) =>
                (<li key={i} tabIndex="0" >{m.title}</li>))
            }</ul>
          </div>
                 
          <div role="application" className="map" ref="map">
            Please wait loading map......
          </div>
                 
        </div>
      </div>
    )
  }
}
