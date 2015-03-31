// this is elevationProfileFactory.js

angular.module('roadWarrior').factory('elevationProfileFactory', ['mapFactory', function(mapFactory){
  return function (legArray) {

    var chart = new google.visualization.LineChart(document.getElementById('elevation-chart'));
    google.visualization.events.addListener(chart, 'onmouseover', chartEvent);
    var data = new google.visualization.DataTable();

    function chartEvent (point) {
      google.visualization.events.addListener(chart, 'onmouseout', removeMarker);
      var latLng = JSON.parse(data.getValue(point.row, 2));
      mapFactory.panTo({lat: latLng.k, lng: latLng.D}); 
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(latLng.k, latLng.D),
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 4
        },
        map: mapFactory
      });
      function removeMarker () {
        marker.setVisible(false);
      }
    }

    data.addColumn('number', 'Distance');    
    data.addColumn('number', 'Elevation');
    data.addColumn({type: 'string', role: 'annotation'});
    data.addColumn({type: 'string', role: 'tooltip','p': {'html': true}});

    var totalDistance = 0;
    var legDistance, legPoints, incr;

    for (var i = 0; i < legArray.length; i++) {
      legDistance = legArray[i].rend.directions.routes[0].legs[0].distance.value;
      legPoints = legArray[i].elevationProfile.length;
      incr = legDistance / legPoints;
      for (var j = 0; j < legArray[i].elevationProfile.length; j++) {
        var elevation = legArray[i].elevationProfile[j].elevation;
        var location = JSON.stringify(legArray[i].elevationProfile[j].location);
        var tooltip = '<div class="tooltip-text"><div><p><b>Distance:</b> ' + Math.round(totalDistance*0.0621371)/100 + ' miles</p></div><div><p><b>Elevation:</b> ' + Math.round(legArray[i].elevationProfile[j].elevation*328.084)/100 + ' feet</p></div></div>';
      	data.addRow([totalDistance, elevation, location, tooltip]);
      	totalDistance += incr;
      }
    }
    
    var view = new google.visualization.DataView(data);
    view.hideColumns([2]);
    chart.draw(view, { 
      trigger: 'none', 
      chartArea: {
	left: 0,
	top: 0,
        width: '100%', 
        height: '98%'
      }, 
      hAxis: {
        title: 'Distance', 
        gridlines: {
          color: 'transparent'
        },
        baselineColor: 'transparent',
        textPostion: 'in'
      },
      vAxis: {
        gridlines: {
          color: 'transparent'
        },
        baselineColor: 'transparent',
        textPostion: 'in'
      },
      tooltip: {
        isHtml: 'true',
        legend: 'none'
      },
      focusTarget: 'category',
      aggregationTarget: 'series'
    });
  };
}]);

