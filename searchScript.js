//constants
const searchBarId = "injectedApostropheSearchBar";
const searchBarDivId = "injectedApostropheDiv";
const searchBarResultTextId = "injectedApostropheSearchResultText";
const barOpenKey = '\'';
const barCloseKey = 'Escape';
//F3 does this in Firefox, but Chrome intercepts that
const continueKey = 'F2';
const linkBorderStyle = "1px dotted grey";
const linkHighlightColor = "#FFEE55";
const linkFollowKey = 'Enter';

//are we in the middle of a search now?
var barOpen = false;

//create the search bar
var bodyNode = document.body;
var searchBarDiv = document.createElement("div");
var searchBar = document.createElement("input");
var resultText = document.createElement("p");
searchBarDiv.id = searchBarDivId;
resultText.id = searchBarResultTextId;
searchBar.nodeType = "text";
searchBar.id = searchBarId;
searchBarDiv.appendChild(searchBar);
searchBarDiv.appendChild(resultText);
bodyNode.appendChild(searchBarDiv);

//The most recent search query.  It has to be up here,
//so as to facilitate pickup up where we left off with
//the F2 key.
var lastSearch = "";

//The index of the next link to search;
var lastSearchedIndex = 0;

//The currently selected link.  It had to be put here,
//so as to be able to reset its style when selecting a
//different one, as well as to be able to click it with
//a different event than the one that selected it.
var currentLink = null;
var currentLinkStyle = null;

searchBar.focus();

//Listen for the apropriate keystroke input and open the search bar.
document.body.addEventListener("keyup", function (keystroke) {
	if (barOpen && document.activeElement.id === searchBarId 
	&& printableKey(keystroke.keyCode) || keystroke.key == 'Backspace') {
		//begin the search feature here
		lastSearch = getSearchValue();
		searchLinksForString(lastSearch, 0);
	}

}, false);

//Listen for the appropriate keystrokes that do everything else.
document.body.addEventListener("keydown", function (keystroke) {
	if (keystroke.key == barOpenKey) {
		if (keystroke.target.nodeName != "INPUT") {
			lastSearch = "";
			//showSearchBar();
			if (showSearchBar()) {
				keystroke.preventDefault();
			}
			document.getElementById(searchBarId).focus();
		}
	}
	if (keystroke.key == barCloseKey) {
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
			}
	}
	else if (keystroke.key == linkFollowKey && barOpen && currentLink != null) {
		//follow it in a new tab if ctrl is pressed
		if (keystroke.ctrlKey) {
			window.open(currentLink.href);
			hideSearchBar();
		}
		else {
			//follow the selected link normally if not
			currentLink.click();
		}
	}
}, true);

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
		document.getElementById(searchBarDivId).style.display = "block";
		barOpen = true;
		return true;
	}
	return false;
}

function hideSearchBar() {
	if (barOpen) {
		document.getElementById(searchBarDivId).style.display = "none";
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
	searchString = searchString.toLowerCase();
	resetCurrentLink();
	var allLinks = document.getElementsByTagName("a");
	var filteredLinks = [];
	for (var i = 0; i < allLinks.length; i++) {
		if (allLinks[i].innerText.toLowerCase().indexOf(searchString.toLowerCase()) != -1) {
			filteredLinks.push(allLinks[i]);
		}
	} 

	if (instanceNo < 0) {
		//loop around if we fall below index 0
		instanceNo = filteredLinks.length + instanceNo;
	}

	// target instance is filtered[no]
	if (filteredLinks.length > 0) {
		//adjust the instance number if it is too big
		instanceNo = instanceNo % filteredLinks.length;

		//get the current link
		currentLink = filteredLinks[instanceNo];
		currentLinkStyle = currentLink.style;

		//add border to it
		currentLink.style.border = linkBorderStyle;
		lastSearchedIndex = instanceNo;

		//highlight the matching link
		currentLink.style.backgroundColor = linkHighlightColor;

		currentLink.scrollIntoView(false);
		document.getElementById(searchBarResultTextId).innerText = "result " 
		+ (instanceNo + 1) + " of " + (filteredLinks.length);
	}
	else {
		//console.log("no match for: " + lastSearch);
		lastSearchedIndex = 0;
		document.getElementById(searchBarResultTextId).innerText = "result 0 of 0";
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

//opens a link in a new background tab
function openLinkInNewBackgroundTab(linkToOpen) {
	
}

