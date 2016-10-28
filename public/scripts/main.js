'use strict';

// Main JS
var couchPotatoApp = {};

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

		$('.results').css('opacity', '1');
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
	console.log(tvIDsResults);
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
		//Show the results
		$('.results').show();
		//Start fliciky 
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
		console.log(tvIDsResultsData);

		//TV Shows Results Container
		var $tvShowContainer = $('<div>').addClass('tvShow');

		// Tv data property variables to append to result section
		var $seasonsNum = $('<p>').text('Seasons: ' + tvIDsResultsData.number_of_seasons);
		var $resultsVoteAvg = $('<p>').text('Voter Average: ' + tvIDsResultsData.vote_average);

		if (tvIDsResultsData.poster_path !== null && tvIDsResultsData.homepage !== undefined) {
			var $resultsImage = $('<img>').attr({
				src: 'https://image.tmdb.org/t/p/original' + tvIDsResultsData.poster_path,
				alt: tvIDsResultsData.name,
				title: tvIDsResultsData.name
			});

			// var $imgLinkContainer = $('<a>').attr({
			// 	href: tvIDsResultsData.homepage,
			// 	target: '_blank'
			// });

			// $imgLinkContainer.append($resultsImage);

			var $tvChevron = $('<i>').addClass('fa fa-angle-up');

			var $imgContainer = $('<div>').addClass('imgContainer');
			$imgContainer.append($tvChevron, $resultsImage);

			$tvShowContainer.append($imgContainer, $seasonsNum, $resultsVoteAvg);
			$('.slider').append($tvShowContainer);

			$('.fa-angle-up').on('click', function () {
				var $showOverview = $('<p>').text(tvIDsResultsData.overview).addClass('overview');
				$imgContainer.append($showOverview);
				$('.overview').show();

				$('.overview').readmore({
					speed: 75,
					lessLink: '<a href="#">Read less</a>',
					moreLink: '<a href="#">Read more</a>',
					collapsedHeight: 200
				});
			});
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
});