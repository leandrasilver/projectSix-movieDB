'use strict';

// Main JS
$(window, ".results").load(function () {
	$('.preloader').fadeOut('slow');
});

var $loading = $('.preloader').hide();
$(document).ajaxStart(function () {
	$loading.show();
}).ajaxStop(function () {
	$loading.hide();
});

var couchPotatoApp = {};

// Counter for prepending error message when all sections
// are not filled out
couchPotatoApp.counter = 0;

couchPotatoApp.getInfo = function () {

	//Enable unclicking a radio button
	$('input[type=radio]').on('click', function () {
		var previousValue = $(this).attr('previousValue');
		var name = $(this).attr('name');

		if (previousValue == 'checked') {
			$(this).removeAttr('checked');
			$(this).attr('previousValue', false);
		} else {
			$('input[name=' + name + ']:radio').attr('previousValue', false);
			$(this).attr('previousValue', 'checked');
		}
	});

	// only submit the form when all three user inputs are selected

	$('form').on('submit', function (e) {
		e.preventDefault();

		// Define use input variables
		var genreID = $('input[name="genreInput"]:checked').val();
		var userHoursSelected = $('input[type=number]').val();
		var userDaysSelected = $('input[name="numOfDays"]:checked').val();

		if (genreID == undefined || userDaysSelected === undefined || userHoursSelected === "") {
			var $warningText = $('<h3>').text('Please go back and fill in all sections.');
			// This counter will only allow text to be prepended once
			if (couchPotatoApp.counter < 1) {
				$('div.submitWrap').prepend($warningText);
				couchPotatoApp.counter++;
			}
		} else {
			$.ajax({
				url: 'https://api.themoviedb.org/3/discover/tv',
				dataType: 'json',
				method: 'GET',
				data: {
					api_key: 'd349ab4b8dd2391d9f24c9ba68fc9819',
					with_genres: genreID
				}
			}).then(function (data) {
				couchPotatoApp.getTVInfo(data);
			});
			$('fieldset, header, footer').hide();
			$('.results').css('opacity', '1');
			// if there was an error and user corrects it
			// remove the warning text
			$('div.submitWrap h3').remove();
		}
	});
}; //end getinfo

//Made a function that returned the ajax call for a specific id
couchPotatoApp.getFullTVInfo = function (id) {
	return $.ajax({
		url: 'https://api.themoviedb.org/3/tv/' + id,
		dataType: 'json',
		method: 'GET',
		data: {
			api_key: 'd349ab4b8dd2391d9f24c9ba68fc9819'
		}
	});
};

couchPotatoApp.getTVInfo = function (data) {
	var _$;

	var tvIDsResults = data.results;
	//Create an empty array to whole the returned tvshow ajax calls
	var tvShows = [];
	for (var i = 0; i < tvIDsResults.length; i++) {
		var id = tvIDsResults[i].id;
		//For every show, call the function that returns the ajax call
		tvShows.push(couchPotatoApp.getFullTVInfo(id));
	}
	//When all the shows come back
	//NOTE: the spread operator ... is used to call $.when with all the shows as arguments
	(_$ = $).when.apply(_$, tvShows)
	//Then when they have come back do a similar thing but instead we gather them up.
	.then(function () {
		for (var _len = arguments.length, finishedTVShows = Array(_len), _key = 0; _key < _len; _key++) {
			finishedTVShows[_key] = arguments[_key];
		}

		//Map just the data object
		finishedTVShows = finishedTVShows.map(function (show) {
			return show[0];
		});
		//Then add it to the page
		finishedTVShows.forEach(function (tvShow) {
			couchPotatoApp.filterTv(tvShow);
		});

		// Toggle overview on and off
		$('.imgContainer').on('click', 'i', function () {
			$(this).toggleClass('fa-angle-down');
			$(this).nextAll('p').toggleClass('jsOverview jsHide');
		});

		//Show the results
		$('.results').show();

		//Start flickiky 
		$('.slider').flickity({
			imagesLoaded: true,
			wrapAround: true,
			draggable: false
		});
	});
}; //end getTVinfo

couchPotatoApp.filterTv = function (tvIDsResultsData) {

	// Amount of hours in a day the user would like to binge
	//Amount of days a user would like to binge

	var userHoursSelected = $('input[type=number]').val();
	var userDaysSelected = $('input[name="numOfDays"]:checked').val();

	var epRunTime = tvIDsResultsData.episode_run_time[0];
	var episodesNum = tvIDsResultsData.number_of_episodes;

	var totalRunTime = epRunTime * episodesNum / 60 / userHoursSelected;

	if (totalRunTime >= userDaysSelected) {

		//TV Shows Results Container
		var $tvShowContainer = $('<div>').addClass('tvShow');

		// Tv data property variables to append to result section
		var $seasonsNum = $('<p>').text('Seasons: ' + tvIDsResultsData.number_of_seasons);
		var $resultsVoteAvg = $('<p>').text('Voter Average: ' + tvIDsResultsData.vote_average);

		if (tvIDsResultsData.poster_path !== null) {

			var $resultsImage = $('<img>').attr({
				src: 'https://image.tmdb.org/t/p/original' + tvIDsResultsData.poster_path,
				alt: tvIDsResultsData.name,
				title: tvIDsResultsData.name
			});

			var $tvChevron = $('<i>').addClass('fa fa-angle-up');

			var $homepage = $('<a>').attr({
				href: tvIDsResultsData.homepage,
				target: '_blank'
			}).text('Click for ' + tvIDsResultsData.original_name + "'s Site");

			var $showOverview = $('<p>').text(tvIDsResultsData.overview).addClass('jsHide');

			var $imgContainer = $('<div>').addClass('imgContainer');
			$imgContainer.append($tvChevron, $resultsImage, $showOverview);

			$tvShowContainer.append($imgContainer, $seasonsNum, $resultsVoteAvg, $homepage);
			$('.slider').append($tvShowContainer);
		}
	}
}; //end couchPotatoApp.filterTv

couchPotatoApp.init = function () {
	couchPotatoApp.getInfo();
};

$(function () {
	couchPotatoApp.init();

	// SmoothScroll on anchor tags
	$('a').smoothScroll();

	$('.refresh').on('click', function () {
		window.location.reload(true);
	});

	$('.genreItem').on('click', function () {
		$('body').animate({
			scrollTop: $("#daysBinge").offset().top - 70
		}, 600);
	});

	$('.timeItem').on('click', function () {
		$('body').animate({
			scrollTop: $("#hoursADay").offset().top - 70
		}, 600);
	});

	// Konami Code
	var keys = [];
	var konami = "38,38,40,40,37,39,37,39,66,65";

	$(document).keydown(function (e) {
		keys.push(e.keyCode);

		if (keys.toString().indexOf(konami) >= 0) {

			keys = [];

			$(".konamiContainer").addClass("jsKonami");
		}
	});
});

// konami code on header