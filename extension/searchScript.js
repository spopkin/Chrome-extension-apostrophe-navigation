//alert("extension loaded");

//constants
const searchBarId = "injectedApostropheSearchBar";
const barOpenKey = '\'';
const barCloseKey = 'Escape';
//F3 does this in Firefox, but Chrome intercepts that
const continueKey = 'F2';

//are we in the middle of a search now?
var barOpen = false;

//create the search bar
var bodyNode = document.body;
var searchBar = document.createElement("input");
searchBar.nodeType = "text";
searchBar.id = searchBarId;
bodyNode.appendChild(searchBar);

//The most recent search query.  It has to be up here,
//so as to facilitate pickup up where we left off with
//the F2 key.
var lastSearch = "";

//The index of the next link to search;
var lastSearchedIndex = 0;

//The currently selected link.  It had to be put here,
//so as to be able to reset its style when selecting a
//different one.
var currentLink = null;
var currentLinkStyle = null;

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
			var wasOpen = barOpen;
			//continue the search without clearing the last search
			showSearchBar();
			if (wasOpen) {
				//search the next link
				if (!keystroke.shiftKey) {
					searchLinksForString(lastSearch, lastSearchedIndex + 1);
				}
				else {
					searchLinksForString(lastSearch, lastSearchedIndex - 1);
				}
			}
			else {
				//search the current one again
				searchLinksForString(lastSearch, lastSearchedIndex);
				console.log("asdf");
			}
			console.log(lastSearchedIndex);
	}

	else if (barOpen && document.activeElement.id === searchBarId) {
		if (printableKey(keystroke.keyCode)) {
			//begin the search feature here
			lastSearch = getSearchValue();
			searchLinksForString(lastSearch, 0);
		}
	}
});

function printableKey (keyCode) {
	if (keyCode == 32 ||  (keyCode > 47 && keyCode < 58) 
	|| (keyCode > 64 && keyCode < 91) || (keyCode > 95 && keyCode < 112)
	|| (keyCode > 185 && keyCode < 193) || (keyCode > 218 && keyCode < 223)) {
		//then it is a printable character
		return true;
	}
	return false;
}

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
	resetCurrentLink();
}

//Get the current search bar text
function getSearchValue() {
	return document.getElementById(searchBarId).value;
}

//Search all links on the page for a given string
// Params: the string to search for, the instance number
// if you are using the F2 key to iterate
function searchLinksForString (searchString, instanceNo) {
	resetCurrentLink();
	var allLinks = document.getElementsByTagName("a");
	var filteredLinks = [];
	for (var i = 0; i < allLinks.length; i++) {
		if (allLinks[i].innerText.includes(lastSearch)) {
			filteredLinks.push(allLinks[i]);
		}
	} 

	if (instanceNo < 0) {
		//loop around if we fall below index 0
		instanceNo = filteredLinks.length + instanceNo;
	}
	
	// target instance is filtered[no]
	if (filteredLinks.length > 0) {
		currentLink = filteredLinks[instanceNo % filteredLinks.length];
		currentLinkStyle = currentLink.style;
		currentLink.style.border = "1px dotted grey";
		lastSearchedIndex = instanceNo;
		
	}
	else {
		console.log("no match for: " + lastSearch);
		lastSearchedIndex = 0;
	}
	//var selection = window.getSelection();
}

//Resets the style of the current link, as well as sets
//the reference to null
function resetCurrentLink() {
	if (currentLink != null) {
		currentLink.style = currentLinkStyle;
		currentLink = null;
	}
}
