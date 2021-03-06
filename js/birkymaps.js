// Rachael Birky
// CMSC 433
// JavaScript: FlickrMaps

var user = document.getElementById("user");
var text = document.getElementById("text");
var resetButton = document.getElementById("reset");
var searchButton = document.getElementById("searchBtn");
var defaultUser = "36726765@N05";
var defaultLatLng = new google.maps.LatLng(47.6097, -122.3331);
var map, numPhotos, numLocs, mapOptions;
var minlng, minlat, maxlng, maxlat;
var juser, jtext, jbbox;
var markersg = [];

function initialize(){
    user.value = defaultUser;
    text.value = "";

    mapOptions = {
	zoom:10,
	center: defaultLatLng,
	bounds: defaultLatLng
    };

    map = new google.maps.Map(document.getElementById("map"),mapOptions);

    var styles = [
	{
	    stylers: [
		{ hue: "#c08833" },
		{ saturation: -20 }
	    ]
	},{
	    featureType: "road",
	    elementType: "geometry",
	    stylers: [
		{ lightness: 100 },
		{ visibility: "simplified" }
	    ]
	},{
	    featureType: "road",
	    elementType: "labels",
	    stylers: [
		{ visibility: "off" }
	    ]
	}
    ];

    map.setOptions({styles: styles});

    google.maps.event.addListener(map, 'idle', ajaxGET);
    resetButton.onclick = resetFunction;
    searchButton.onclick = ajaxGET;
}

function resetFunction(){
    var r = confirm("Are you sure you want to reset?")
    if (r == true){
	initialize;
    }
}

function updateStatus(){
    removeMarkers();
    var bounds =  map.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();
    minlat = sw.lat();
    minlng = sw.lng();
    maxlat = ne.lat();
    maxlng = ne.lng();
    bbox = ""+minlng+","+minlat+","+maxlng+","+maxlat;
    jbbox = encodeURIComponent(bbox);
    juser = encodeURIComponent(user.value);
    jtext = encodeURIComponent(text.value);
}

function isNew(search, lookup){
    for (k in lookup) {
	if (lookup[k].equals(search)){
	    return false;
	}
    }
    return true;
}

function getHTMLimgs(pics,num){
    htmlStr = "<div id='content'>";
    for (pic in pics) {
	if(pic>3){htmlStr+="<div><p></p></div><div>"}else{htmlStr+="\t"};
	var href = "http://farm"+pics[pic].farm+".staticflickr.com/"+pics[pic].server+"/"+pics[pic].id+"_"+pics[pic].secret+".jpg";
	var src =  "http://farm"+pics[pic].farm+".staticflickr.com/"+pics[pic].server+"/"+pics[pic].id+"_"+pics[pic].secret+"_s.jpg";
	htmlStr+='<a href="'+href+'" data-lightbox='+num+'><img src="'+src+'" /></a>';
	if(pic>3){htmlStr+="</div>"};
    }
    return htmlStr+"</div>";
}

function makeWindows(markers){
    infowindow = new google.maps.InfoWindow();
    for (marker in markers){
	var thisMarker = markers[marker].info;
	var thisPs = markers[marker].pics;
	//make HTML string https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_[mstzb].jpg
	var str = getHTMLimgs(thisPs,marker);
	// create picture URLS and store in another array? to put in lightbox
	thisMarker.content = str;
	google.maps.event.addListener(thisMarker, 'click', function(){
	    infowindow.setContent(this.content);
	    infowindow.open(map,this);
	});
    }
}

function drawMarkers(photos){
    var pics = new Array();
    j=0;
    for (var i=1; i<photos.length; i++){
	marker = new google.maps.Marker({
            position: new google.maps.LatLng(photos[i].latitude, photos[i].longitude),
            map: map,
	});
    }
}


function removeMarkers(){
    for (var t=0; t<markersg.length; t++){
	markersg[t].setMap(null);
    }
}


function ajaxGET(){
    updateStatus();

    var criteria = {
	"user_id": juser,
	"bbox": jbbox,
	"text": jtext
    };

    $.get( "server/flickr.php", criteria, function(data){
	var photo = data.photos.photo;
	var locations = new Array();
	var markers = new Array();
	for (i in photo){
	    var lat = photo[i].latitude;
	    var lng = photo[i].longitude;
	    var thisLoc = new google.maps.LatLng(photo[i].latitude, photo[i].longitude);
	    if (isNew(thisLoc, locations)){
		locations.push(thisLoc);
		var aMarker = new google.maps.Marker({
		    position: thisLoc,
		    map:map});
		var ps = new Array();
		ps.push(photo[i]);
		markersg.push(aMarker);
		markerObj = {info: aMarker, pics: ps};
		markers.push(markerObj);
	    }
	    else {
		// add to pics array of another marker
		for (m in markers){
		    var mLat = (markers[m].info.position.lat()).toFixed(6);
		    var mLng = (markers[m].info.position.lng()).toFixed(6);
		    if (mLat == photo[i].latitude && mLng == photo[i].longitude)
			markers[m].pics.push(photo[i]);
		}
	    }
	}
	document.getElementById("results").innerHTML = "Locations: " + locations.length + "<br/>Photos: " +data.photos.photo.length;
	// Make lightboxes for each marker object, loop through photos for thumbnails
	makeWindows(markers);
    })
	.fail(function(jqXHR, textStatus, errorThrown) {
	    alert( "error:" + textStatus );
	})

}
