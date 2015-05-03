// this is elevationProfileFactory.js

angular.module('roadWarrior').factory('elevationProfileFactory', ['mapFactory', function(mapFactory){

  var marker = new google.maps.Marker({
    icon: { path: google.maps.SymbolPath.CIRCLE, scale: 4 }
  });

  var chartWrapper = document.getElementById('elevation-chart-wrapper');

  var data, view;
  
  var chart = new google.visualization.LineChart(document.getElementById('elevation-chart'));
    google.visualization.events.addListener(chart, 'onmouseover', chartEvent);
    google.visualization.events.addListener(chart, 'onmouseout', removeMarker);

  function chartEvent (point) {
    var latLng = JSON.parse(data.getValue(point.row, 2));
    mapFactory.panTo({lat: latLng.k, lng: latLng.D});
    marker.setPosition({lat: latLng.k, lng: latLng.D});
    marker.setMap(mapFactory);
  }

  function removeMarker () {
    marker.setMap(null);
  }

  var chartOptions =  { 
    trigger: 'none', 
    chartArea: {
      left: '1%',
      top: '1%',
      width: '98%', 
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
  };

  window.addEventListener('resize', resizeThrottler);
  var resizeTimeout;
  function resizeThrottler(){
    if (!resizeTimeout && view) {
      resizeTimeout = window.setTimeout(function(){
        resizeTimeout = null;
        chart.draw(view, chartOptions);
      }, 650);
    }
  }
  
  return function (legArray) {
    if (!chartWrapper.classList.contains('hideElevation')){
      chart.clearChart();
      data = new google.visualization.DataTable();
      data.addColumn('number', 'Distance');    
      data.addColumn('number', 'Elevation');
      data.addColumn({type: 'string', role: 'annotation'});
      data.addColumn({type: 'string', role: 'tooltip','p': {'html': true}});
      data.addColumn({type:'string', role: 'annotation'}, 'Marker');

      var totalDistance = 0;
      var legDistance, legPoints, incr, elevation, location, tooltip;

      for (var i = 0; i < legArray.length; i++) {
        if (legArray[i].travelMode !== "CROW") {
          legDistance = legArray[i].rend.directions.routes[0].legs[0].distance.value;
        } else legDistance = legArray[i].directDistance;
        legPoints = legArray[i].elevationProfile.length;
        incr = legDistance / legPoints;
        for (var j = 0; j < legArray[i].elevationProfile.length; j++) {
          var marker = '';
          if (j === 0) {
            marker = legArray[i].origin.index;
          } else if (i === legArray.length - 1 && j === legArray[i].elevationProfile.length - 1) {
            marker = legArray[i].dest.index;
          }
          elevation = legArray[i].elevationProfile[j].elevation;
          location = JSON.stringify(legArray[i].elevationProfile[j].location);
          tooltip = '<div class="tooltip-text"><div><b>Distance:</b> ' + (totalDistance*0.000621371).toFixed(2) + ' miles</div><div><b>Elevation:</b> ' + (legArray[i].elevationProfile[j].elevation*3.28084).toFixed(0) + ' feet</div></div>';
      	  data.addRow([totalDistance, elevation, location, tooltip, marker]);
      	  totalDistance += incr;
        }
      }
      
      view = new google.visualization.DataView(data);
      view.hideColumns([2]);
      chart.draw(view, chartOptions);
    }
  };
}]);

