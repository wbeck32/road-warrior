var roadWarrior=angular.module("roadWarrior",[]);angular.module("roadWarrior").controller("TrekController",["trekService","legService","pathElevationService","neighborsService","mapFactory","markerFactory","$http",function(e,t,r,n,o,a,i){function s(){var e,t,r=[];e=g.legs[0].origin.getPosition(),e.name=g.legs[0].origin.name,r.push(e);for(var n=0;n<g.legs.length;n++)t=g.legs[n].dest.getPosition(),t.name=g.legs[n].dest.name,r.push(t);return{markers:r,name:g.name,id:l.id}}this.legs=t.legs,this.name=t.name,this.treks=e.allTreks,this.showDetails=[],this.showEditName=!1;var l=null;this.markerName=function(e){return e.name?": "+e.name:""};var g=this;this.renderTrek=function(e){t.unRenderAll(),t.legs=e.legs,t.name=e.name,t.renderAll(),this.legs=t.legs,this.name=t.name,this.hideFields(),l=e},this.renderSavedTrek=function(r){var n=[];console.log(r);var o=new google.maps.LatLng(r.markers[0].k,r.markers[0].D),i=a.create(o,t,!0);i.name=r.markers[0].name;for(var s=1;s<r.markers.length;s++){console.log(s);var l=new google.maps.LatLng(r.markers[s].k,r.markers[s].D),g=a.create(l,t,!0);g.name=r.markers[s].name;var c=t.createLeg(i,g,!0);n.push(c),i=g}e.allTreks.push({name:r.name,legs:n,id:r._id}),a.markerIndex=65},this.renderAllSavedTreks=function(){i({method:"GET",url:"/api/retrievealltreks"}).success(function(e){e.forEach(function(e){g.renderSavedTrek(e)})}).error(function(){console.log("failure")})},this.renderAllSavedTreks(),this.deleteTrek=function(t){i({method:"DELETE",url:"/api/deleteatrek/"+t.id}).success(function(e,t){console.log("delete: ",t)}).error(function(){console.log("failure")}),e["delete"](t),t.legs===this.legs&&this.clearTrek()},this.clearTrek=function(){t.unRenderAll(),this.legs=t.legs,this.name=t.name,l=null},this.saveTrek=function(){l?l.name=this.name:this.legs.length>0&&(l={name:this.name,legs:this.legs},e.allTreks.push(l)),i({method:"POST",url:"/api/saveatrek",data:{trek:s()},headers:{"Content-Type":"application/json"}}).success(function(e){e&&(l.id=e),l=null}).error(function(){console.log("failure"),l=null}),t.unRenderAll(),this.legs=t.legs,this.name=t.name},this.hideFields=function(){for(var e=0;e<g.legs.length;e++)g.showDetails[e]=!1},this.removeLeg=function(e){t.removeLeg(e),this.hideFields()},this.toggleDetails=function(e){this.showDetails[e]=!this.showDetails[e]},this.editName=function(){this.showEditName=!this.showEditName}}]),angular.module("roadWarrior").controller("SideBarController",function(){function e(e){"currentTrek"===e?n=[!0,!1,!1]:"trekList"===e?n=[!1,!0,!1]:"directions"===e&&(n=[!1,!1,!0]),r&&(document.getElementById(r+"Tab").className="tab"),document.getElementById(e+"Tab").className="tab activeTab",r=e}var t=document.getElementById("sideMenu"),r=(document.getElementById("sidebarContent"),null),n=[!0,!1,!1];this.activePanel=function(e){return n[e]},this.tabSwitcher=function(n){r?r===n?(t.className="hideMenu",document.getElementById(r+"Tab").className="tab",r=null):e(n):(t.className="showMenu",e(n))}}),angular.module("roadWarrior").service("legService",["$rootScope","mapFactory","markerFactory","neighborsService","pathElevationService","elevationProfileFactory",function(e,t,r,n,o,a){this.legs=[],this.name="new trek";var i=null,s={suppressMarkers:!0,preserveViewport:!0,draggable:!0},l=new google.maps.DirectionsService,g=this;this.unRenderAll=function(){r.markerIndex=65,i&&i.setMap(null),i=null,this.name="new trek",this.legs.length>0&&(this.legs.forEach(function(e){e.dest.setMap(null),e.rend.setMap(null)}),this.legs=[])},this.renderAll=function(){r.markerIndex=66+this.legs.length,i=this.legs[0].origin,this.legs[0].origin.setMap(t),this.legs.forEach(function(e){e.dest.setMap(t),e.rend.setMap(t)}),a(this.legs)},this.createLeg=function(n,a,i){function c(n,a){this.origin=n,this.dest=a,this.rend=new google.maps.DirectionsRenderer(s),i||this.rend.setMap(t),this.elevationProfile=[],this.travelMode="WALKING";var c=this;google.maps.event.addListener(c.rend,"directions_changed",function(){e.$apply(function(){if(c.rend.getDirections().routes[0].legs[0].via_waypoints.length>0){var e=r.create(c.rend.getDirections().routes[0].legs[0].via_waypoints.pop(),g),t=g.createLeg(e,c.dest);t.travelMode=c.travelMode,g.legs.splice(g.legs.indexOf(c)+1,0,t),c.dest=e,c.getDirections()}})}),this.getDirections=function(){var e={origin:this.origin.getPosition(),destination:this.dest.getPosition(),travelMode:this.travelMode};l.route(e,function(e,t){t==google.maps.DirectionsStatus.OK&&(c.rend.setDirections(e),o(c,g.legs))})},this.getDirections()}return new c(n,a)},this.addLeg=function(e){var t;if(this.legs.length>0){var r=this.legs[this.legs.length-1];t=this.createLeg(r.dest,e)}else i?t=this.createLeg(i,e):i=e;t&&this.legs.push(t)},google.maps.event.addListener(t,"click",function(e){var t=r.create(e.latLng,g);g.addLeg(t)}),this.moveMarker=function(e){var t=n(e,this.legs);t.prevLeg&&t.prevLeg.getDirections(),t.nextLeg&&t.nextLeg.getDirections()},this.removeMarker=function(e){e.setMap(null);var t=n(e,this.legs);if(t.prevLeg||t.nextLeg)if(!t.prevLeg&&t.nextLeg)i=t.nextLeg.dest,i.setIcon("https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld="+i.index+"|009900|000000"),this.legs.shift().rend.setMap(null);else if(t.prevLeg&&!t.nextLeg)this.legs.pop().rend.setMap(null);else{t.prevLeg.rend.setMap(null),t.nextLeg.rend.setMap(null);var o=this.createLeg(t.prevLeg.origin,t.nextLeg.dest),a=this.legs.indexOf(t.prevLeg);this.legs.splice(a,2,o)}else i=null,r.markerIndex=65},this.removeLeg=function(e){1===this.legs.length?(this.legs[0].origin.setMap(null),this.removeMarker(this.legs[0].dest),i=null,r.markerIndex=65):this.removeMarker(0===e?this.legs[0].origin:this.legs[e].dest)}}]),angular.module("roadWarrior").factory("markerFactory",["$rootScope","mapFactory","elevationService",function(e,t,r){return{markerIndex:65,markerColor:function(){return 65===this.markerIndex?"|009900|000000":"|ff0000|000000"},create:function(n,o,a){var i=new google.maps.Marker({position:n,map:a?null:t,draggable:!0,icon:"https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld="+String.fromCharCode(this.markerIndex)+this.markerColor()});return r(n,i),i.index=String.fromCharCode(this.markerIndex),this.markerIndex++,a||t.panTo(n),google.maps.event.addListener(i,"click",function(){e.$apply(function(){o.removeMarker(i)})}),google.maps.event.addListener(i,"dragend",function(){e.$apply(function(){o.moveMarker(i)})}),i}}}]),angular.module("roadWarrior").factory("mapFactory",["mapStyles",function(e){var t={lat:45.5227,lng:-122.6731},r=!1,n={zoom:16,draggableCursor:"crosshair",center:t,styles:e},o=new google.maps.Map(document.getElementById("map-canvas"),n),a=document.createElement("img");a.src="/images/locationIcon.svg",a.style.cursor="pointer",o.controls[google.maps.ControlPosition.TOP_RIGHT].push(a);var i=document.createElement("img");i.src="/images/elevation_icon.png",i.style.cursor="pointer",o.controls[google.maps.ControlPosition.TOP_RIGHT].push(i);var s=document.getElementById("slider-button");return google.maps.event.addDomListener(s,"click",function(){var e=document.getElementById("elevation-wrapper");e.className=r?"hideChart":"showChart",r=!r}),google.maps.event.addDomListener(i,"click",function(){var e=document.getElementById("elevation-wrapper");e.className=r?"hideChart":"showChart",r=!r}),google.maps.event.addDomListener(a,"click",function(){navigator.geolocation&&navigator.geolocation.getCurrentPosition(function(e){o.panTo({lat:e.coords.latitude,lng:e.coords.longitude})})}),o}]),angular.module("roadWarrior").factory("pathElevationService",["mapFactory","elevationProfileFactory",function(e,t){var r=new google.maps.ElevationService;return function(e,n){for(var o=e.rend.getDirections().routes[0].legs[0].steps,a=[],i=0;i<o.length;i++)for(var s=0;s<o[i].path.length;s++)a.push(o[i].path[s]);if(a.length>200){for(var l=Math.ceil(a.length/200),g=[],c=0;c<a.length;c+=l)g.push(a[i]);a=g}var u={path:a,samples:a.length/2};r.getElevationAlongPath(u,function(r,o){o==google.maps.ElevationStatus.OK?(e.elevationProfile=r,t(n)):console.log("You suck, sucker",o)})}}]),angular.module("roadWarrior").factory("elevationProfileFactory",["mapFactory",function(e){return function(t){function r(t){function r(){i.setVisible(!1)}google.visualization.events.addListener(n,"onmouseout",r);var a=JSON.parse(o.getValue(t.row,2));e.panTo({lat:a.k,lng:a.D});var i=new google.maps.Marker({position:new google.maps.LatLng(a.k,a.D),icon:{path:google.maps.SymbolPath.CIRCLE,scale:4},map:e})}var n=new google.visualization.LineChart(document.getElementById("elevation-chart"));google.visualization.events.addListener(n,"onmouseover",r);var o=new google.visualization.DataTable;o.addColumn("number","Distance"),o.addColumn("number","Elevation"),o.addColumn({type:"string",role:"annotation"}),o.addColumn({type:"string",role:"tooltip",p:{html:!0}});for(var a,i,s,l=0,g=0;g<t.length;g++){a=t[g].rend.directions.routes[0].legs[0].distance.value,i=t[g].elevationProfile.length,s=a/i;for(var c=0;c<t[g].elevationProfile.length;c++){var u=t[g].elevationProfile[c].elevation,d=JSON.stringify(t[g].elevationProfile[c].location),h='<div class="tooltip-text"><div><p><b>Distance:</b> '+Math.round(.0621371*l)/100+" miles</p></div><div><p><b>Elevation:</b> "+Math.round(328.084*t[g].elevationProfile[c].elevation)/100+" feet</p></div></div>";o.addRow([l,u,d,h]),l+=s}}var m=new google.visualization.DataView(o);m.hideColumns([2]),n.draw(m,{trigger:"none",chartArea:{left:0,top:0,width:"100%",height:"98%"},hAxis:{title:"Distance",gridlines:{color:"transparent"},baselineColor:"transparent",textPostion:"in"},vAxis:{gridlines:{color:"transparent"},baselineColor:"transparent",textPostion:"in"},tooltip:{isHtml:"true",legend:"none"},focusTarget:"category",aggregationTarget:"series"})}}]),angular.module("roadWarrior").factory("elevationService",function(){var e=new google.maps.ElevationService;return function(t,r){var n={locations:[t]};e.getElevationForLocations(n,function(e,t){r.elevation=t==google.maps.ElevationStatus.OK&&e[0]?e[0].elevation:null})}}),angular.module("roadWarrior").filter("totalDistance",function(){return function(e){return e.reduce(function(e,t){return t.rend.directions?e+t.rend.directions.routes[0].legs[0].distance.value:void 0},0)}}).filter("metersToMiles",function(){return function(e){return(6214e-7*e).toFixed(2)}}).filter("metersToFeet",function(){return function(e){return(3.281*e).toFixed(0)}}),angular.module("roadWarrior").value("mapStyles",[{featureType:"administrative",elementType:"all",stylers:[{visibility:"on"},{lightness:33}]},{featureType:"landscape",elementType:"all",stylers:[{color:"#f2e5d4"}]},{featureType:"poi.park",elementType:"geometry",stylers:[{color:"#c5dac6"}]},{featureType:"poi.park",elementType:"labels",stylers:[{visibility:"on"},{lightness:20}]},{featureType:"road",elementType:"all",stylers:[{lightness:20}]},{featureType:"road.highway",elementType:"geometry",stylers:[{color:"#c5c6c6"}]},{featureType:"road.arterial",elementType:"geometry",stylers:[{color:"#e4d7c6"}]},{featureType:"road.local",elementType:"geometry",stylers:[{color:"#fbfaf7"}]},{featureType:"water",elementType:"all",stylers:[{visibility:"on"},{color:"#acbcc9"}]}]),angular.module("roadWarrior").factory("neighborsService",function(){return function(e,t){var r,n,o=t[0],a=0;if(t.length>0)for(;!(r&&n||(o.origin===e&&(n=o),o.dest===e&&(r=o),a++,a>t.length-1));)o=t[a];return{prevLeg:r,nextLeg:n}}}),angular.module("roadWarrior").service("trekService",function(){this.allTreks=[],this["delete"]=function(e){this.allTreks.splice(this.allTreks.indexOf(e),1)}});
//# sourceMappingURL=main.js.map