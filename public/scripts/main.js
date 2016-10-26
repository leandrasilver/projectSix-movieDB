'use strict';

// Main JS

var couchPotatoApp = {};

var userHoursSelected = 24; //Make dynamic later

couchPotatoApp.getInfo = function () {
	$('form').on('submit', function (e) {
		e.preventDefault();

		var genreID = $('input[type=radio]:checked').val();

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
	});
}; //end getinfo

couchPotatoApp.getTVInfo = function (data) {
	var tvIDsResults = data.results;
	// console.log(tvIDsResults);
	for (var i = 0; i < tvIDsResults.length; i++) {
		var id = tvIDsResults[i].id;
		$.ajax({
			url: 'https://api.themoviedb.org/3/tv/' + id,
			dataType: 'json',
			method: 'GET',
			data: {
				api_key: 'd349ab4b8dd2391d9f24c9ba68fc9819'
			}
		}).then(function (tvIDsResultsData) {
			// console.log(tvIDsResultsData);
			couchPotatoApp.filterTv(tvIDsResultsData);
		});
	}
}; //end getTVinfo

couchPotatoApp.filterTv = function (tvIDsResultsData) {

	// Amount of hours in a day the user would like to binge
	var userHoursSelected = $('input[type=number]').val();
	console.log(userHoursSelected);

	var runTime = tvIDsResultsData.episode_run_time[0];
	var episodesNum = tvIDsResultsData.number_of_episodes;
	var seasonsNum = tvIDsResultsData.number_of_seasons;

	var totalRunTime = runTime * episodesNum * seasonsNum / 60 / userHoursSelected;

	if (totalRunTime > 10 && totalRunTime < 50) {
		console.log(tvIDsResultsData);
		console.log(totalRunTime);
		var $tvTitle = $('<h3>').text(tvIDsResultsData.name);
		var $resultsImage = $('<img>').attr('src', 'https://image.tmdb.org/t/p/original' + tvIDsResultsData.poster_path);
		$('.results').append($tvTitle, $resultsImage);
	}
}; //end couchPotatoApp.filterTv

couchPotatoApp.init = function () {
	couchPotatoApp.getInfo();
};

$(function () {
	couchPotatoApp.init();
	// SmoothScroll on anchor tags
	$('a').smoothScroll();
});