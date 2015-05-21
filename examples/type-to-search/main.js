var most = require('most');
var rest = require('rest/client/jsonp');

module.exports = function run() {

	var url = 'http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=';

	var input = document.getElementById('search');
	var resultList = document.getElementById('results');
	var template = document.getElementById('template').innerHTML;

	// Fetch results with rest.js
	// Returns a promise for the wikipedia json response
	function getResults(text) {
		return rest(url + text).entity();
	}

	// Debounce keystrokes and get input value when it changes
	// Only search if the user stopped typing for 500ms, and if the
	// text is longer than 1 character and is different than the last
	// time we saw the text.
	var searchText = most.fromEvent('input', input)
		.debounce(500)
		.map(function(e) {
			return e.target.value.trim();
		})
		.filter(function(text) {
			return text.length > 1;
		})
		.skipRepeats();

	// Get results from wikipedia API and render
	// Ignore empty results, extract the actual list of results
	// from the wikipedia payload, then render the results
	searchText.map(getResults)
		.map(most.fromPromise)
		.switch()
		.filter(function(response) {
			return response.length > 1;
		})
		.map(function(response) {
			return response[1];
		})
		.observe(function(results) {
			resultList.innerHTML = results.reduce(function(html, item) {
				return html + template.replace(/\{name\}/g, item);
			}, '');
		});
};