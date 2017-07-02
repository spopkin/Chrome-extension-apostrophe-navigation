//alert("extension loaded");

var barOpen = false;
var searchBarId = "injectedApostropheSearchBar";
var lastSearch = "";
var barOpenKey = '\'';
var barCloseKey = 'Escape';
//F3 does this in Firefox, but Chrome intercepts that
var continueKey = 'F2';

//function createSearchBar () {
//open the search bar

var bodyNode = document.body;
var searchBar = document.createElement("input");
searchBar.nodeType = "text";
searchBar.id = searchBarId;

barOpen = true;
bodyNode.appendChild(searchBar);

searchBar.focus();
//}

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
		if (barOpen) {
			hideSearchBar();
		} 
	}
	else if (keystroke.key == continueKey) {
		if (!barOpen) {
			//continue the search without clearing the last search
			showSearchBar();
		}
	}

	else if (barOpen && document.activeElement.id === searchBarId) {
		//begin the search feature here
		lastSearch = getSearchValue();
	}
});

function showSearchBar() {
	searchBar.value = lastSearch;
	document.getElementById(searchBarId).style.display = "block";
	barOpen = true;
}

function hideSearchBar() {
	document.getElementById(searchBarId).style.display = "none";
	barOpen = false;
}

function getSearchValue() {
	return document.getElementById(searchBarId).value;
}
