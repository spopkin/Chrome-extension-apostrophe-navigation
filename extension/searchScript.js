//alert("extension loaded");

var barOpen = false;
var searchBarId = "injectedApostropheSearchBar";
var lastSearch = "";
var barOpenKey = '\'';
var barCloseKey = 'Escape';
//F3 does this in Firefox, but Chrome intercepts that
var continueKey = 'F2';

//create the search bar
var bodyNode = document.body;
var searchBar = document.createElement("input");
searchBar.nodeType = "text";
searchBar.id = searchBarId;
bodyNode.appendChild(searchBar);

searchBar.focus();

//Listen for the apropriate keystroke input and take action
document.body.addEventListener("keyup", function (keystroke) {
	if (keystroke.key == barOpenKey) {
		if (keystroke.target.nodeName != "INPUT") {
			lastSearch = "";
			showSearchBar();
			document.getElementById(searchBarId).focus();
		}
	}
	else if (keystroke.key == barCloseKey) {
		//close the search bar
		hideSearchBar();
	}
	else if (keystroke.key == continueKey) {
			//continue the search without clearing the last search
			showSearchBar();
	}

	else if (barOpen && document.activeElement.id === searchBarId) {
		//begin the search feature here
		lastSearch = getSearchValue();
	}
});

function showSearchBar() {
	if (!barOpen) {
		searchBar.value = lastSearch;
		document.getElementById(searchBarId).style.display = "block";
		barOpen = true;
	}
}

function hideSearchBar() {
	if (barOpen) {
		document.getElementById(searchBarId).style.display = "none";
		barOpen = false;
	}
}

function getSearchValue() {
	return document.getElementById(searchBarId).value;
}
