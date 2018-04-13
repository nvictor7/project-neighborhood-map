// Setting up each location
var Marker = function (model) {
	var _this = this;
	this.title = model.name;
	this.position = model.position;
	this.display = ko.observable(true);

	// Create marker template on the map
	this.marker = new google.maps.Marker({
		position: this.position,
		animation: google.maps.Animation.DROP,
		title: this.title
	});

	// Display marker based on select
	this.showMarker = ko.computed(function() {
		if (this.display() === true) {
			this.marker.setMap(map);
		} else {
			this.marker.setMap(null);
		}
	}, this);

	// Set up FourSquare request 
	var clientID = 'GC2CP4JUWNIBTBFH4NZ3G0QIRSMZMVIRCMUXEXSUDG2FBLJF';
	var clientSecret = 'MZW5L0XHOMADFPG1H5NW0FVGCRQ1ZRDDNGDH2KRUJ152UC3L';
	var fourSRequestUrl = 'https://api.foursquare.com/v2/venues/search?ll='+ this.position.lat + ',' + this.position.lng + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20170118&query=' + this.title;
	var fourSContent = '';
	$.ajax({
		url: fourSRequestUrl,
		dataType: 'json'
		}).done(function(response) {
			var venue = response.response.venues[0];
			var phoneNum = venue.contact.formattedPhone;
			var addr = JSON.stringify(venue.location.formattedAddress);
			var modAddr = (addr.slice(2, addr.indexOf("("))) + '<br>' + (addr.slice(addr.indexOf("Austin, TX"), -18));
			fourSContent = modAddr + '<br>' + phoneNum;
		}).fail(function() {
			alert('Error during FourSquare inquiry');
		});

	// Add click event on each marker
	this.marker.addListener('click', function() {
		infoWindow.setContent("<span class='place-name'>" + _this.title + "</span><br>" + fourSContent);
		infoWindow.open(map, this);
		map.panTo(this.getPosition());
		_this.marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function() {
			_this.marker.setAnimation(null);
		}, 2000);
	});

	// Display selected marker
	this.showSelected = function() {
		google.maps.event.trigger(_this.marker, 'click');
	};
};

var ViewModel = function() {
	var that = this;
	this.locations = ko.observableArray([]);
	this.searchInput = ko.observable('');
	this.showSideTab = ko.observable(false);
	
	// Set all markers into the map
	locationsModel.forEach(function(location) {
		that.locations.push(new Marker(location));
	});

	// Display location according to with or without a search
	this.filterList = ko.computed(function() {
		var search = that.searchInput().toLowerCase();
		if (search.length >= 1) {
			return ko.utils.arrayFilter(that.locations(), function(location) {
				var listLocation = location.title.toLowerCase().includes(search);
				location.display(listLocation);
				return listLocation;
			});
		} else {
			for (var loc = 0; loc > that.locations(); loc++) {
				loc.display(true);
			}
			return that.locations();
		}
	}, this);

	// collapse side tab based on click
	this.toggleSideTab = function() {
		that.showSideTab(!that.showSideTab());
	};
};


// Initialize map
var initMap = function() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 30.263641, lng: -97.739483},
		zoom: 14,
		mapTypeControl: false
	});

	infoWindow = new google.maps.InfoWindow();

	ko.applyBindings(new ViewModel());
};

var onMapError = function(err) {
	alert('Error occured when loading map');
};


