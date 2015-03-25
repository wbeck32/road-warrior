$(document).ready(function(){

$('.tab').click(function() {
	$('.sidebarContent').addClass('sidebarLeft');
});

$('.trekListTab').click(function() {
	if ($(this).hasClass('blueBack')){
		$(this).removeClass('blueBack');
		$('.tabList').removeClass('slideLeft');
		$('.sidebarContent').removeClass('sidebarLeft');
	} else {
		$('.tabList').addClass('slideLeft');
		$(this).addClass('blueBack');
		$('.currentTab').removeClass('blueBack');
		$('.directionsTab').removeClass('blueBack');
		$('.trekListPanel').addClass('visible');
		$('.currentPanel').removeClass('visible');
		$('.directionsPanel').removeClass('visible');
	}
});

$('.currentTab').click(function() {
	if ($(this).hasClass('blueBack')){
		$(this).removeClass('blueBack');
		$('.tabList').removeClass('slideLeft');
		$('.sidebarContent').removeClass('sidebarLeft');
	} else {
		$('.tabList').addClass('slideLeft');
		$(this).addClass('blueBack');
		$('.trekListTab').removeClass('blueBack');
		$('.directionsTab').removeClass('blueBack');
		$('.trekListPanel').removeClass('visible');
		$('.currentPanel').addClass('visible');
		$('.directionsPanel').removeClass('visible');
	}
});

$('.directionsTab').click(function() {
	if ($(this).hasClass('blueBack')){
		$(this).removeClass('blueBack');
		$('.tabList').removeClass('slideLeft');
		$('.sidebarContent').removeClass('sidebarLeft');
	} else {
		$('.tabList').addClass('slideLeft');
		$(this).addClass('blueBack');
		$('.currentTab').removeClass('blueBack');
		$('.trekListTab').removeClass('blueBack');
		$('.trekListPanel').removeClass('visible');
		$('.currentPanel').removeClass('visible');
		$('.directionsPanel').addClass('visible');
	}
});

});

