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
const tabAcrossPageKey = 'Tab';
const searchLinkId = "injectedApostropheSearchLinkId";

//are we in the middle of a search now?
var barOpen = false;

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
var currentLinkId = null;

//prepare the search bar
var searchBar;
prepareSearchBar();

//attach the event listeners for keystrokes
addEventListeners();

searchBar.focus();

//listen for the bar open sequence
function openEvent(keystroke) {
	//handle the bar opening case
	if (keystroke.key == barOpenKey
	&& keystroke.target != searchBar
	&& ((keystroke.target == null 
		|| keystroke.target == undefined
		)
		|| (!keystroke.target.isContentEditable))
	&& keystroke.target.nodeName.toLowerCase() !== "input") {
		lastSearch = "";
		showSearchBar();
		keystroke.stopPropagation();
		keystroke.preventDefault();
	}
}

//listen for keystrokes being typed into the search bar 
function keyEvents(keystroke) {
	//handle text being typed into the search bar
	if (barOpen && printableKey(keystroke.keyCode) || keystroke.key == 'Backspace') {
		//begin the search feature here
		if (keystroke.key != 'Backspace') {
			lastSearch = getSearchValue() + keystroke.key;
		} else {
			lastSearch = lastSearch.substring(0, lastSearch.length - 1);
		}
		searchLinksForString(lastSearch, 0);
	}
}

//Listen for the appropriate keystrokes that do everything else.
function otherEvents (keystroke) {
	//escape should close the search bar, text field or no
	if (keystroke.key == barCloseKey) {
		//close the search bar
		hideSearchBar();
	}
	else if (keystroke.key == linkFollowKey && barOpen) {
		//follow it in a new tab if ctrl is pressed
		if (keystroke.ctrlKey && currentLink != null) {
			window.open(currentLink.href);
		}
		else if(currentLink != null) {
			//follow the selected link normally if not
			currentLink.click();
		}
		//hide the search bar (ctrl-enter, as well as links that trigger JS)
		hideSearchBar();

		//reattach event listeners in case the page's javascript simply replaces
		//the document in place.
		removeEventListeners();
		addEventListeners();
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
	else if (keystroke.key == tabAcrossPageKey && barOpen) {
		//Then the user wants to indescriminantly tab to the next link on the page,
		//whether or not it matches their search.
		if (keystroke.shiftKey) {
			tabAction(currentLink, false);
		}
		else {
			tabAction(currentLink, true);
		}	
		keystroke.stopPropagation();
		keystroke.preventDefault();
	}
}

//returns true if the key is a valid one to use in the search bar
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
	searchBar.value = lastSearch;
	document.getElementById(searchBarDivId).style.display = "block";
	barOpen = true;
	document.getElementById(searchBarId).focus();
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
	if (filteredLinks.length > 0 && searchString.length > 0) {
		//adjust the instance number if it is too big
		instanceNo = instanceNo % filteredLinks.length;

		setCurrentLink(filteredLinks[instanceNo]);
		lastSearchedIndex = instanceNo;
	
		setSearchIndicator("result " + (instanceNo + 1) + " of " + (filteredLinks.length));
	}
	else {
		lastSearchedIndex = 0;
		resetCurrentLink();
	}
}

//Resets the style of the current link, as well as sets
//the reference to null
function resetCurrentLink() {
	if (currentLink != null) {
		currentLink.style = currentLinkStyle;
		currentLink.id = currentLinkId;
		setSearchIndicator("result 0 of 0");
		currentLink = null;
	}
}

//opens a link in a new background tab
function hasEditableCapability(element) {
	var current = element;
	while(current.parentNode != null && current.parentNode != document.body) {
		if (current.contenteditable != undefined) {
			return true;
		}	
		current = current.parentNode;
	}
	return false;	
}

//removes all eventlisteners
function removeEventListeners() {
	document.removeEventListener("keydown", otherEvents, false);
	document.removeEventListener("keydown", openEvent, true);
	document.getElementById(searchBarId).removeEventListener("keydown", keyEvents, false);
}

//attaches all eventlisteners
function addEventListeners() {
	document.addEventListener("keydown", otherEvents, false);
	document.addEventListener("keydown", openEvent, true);
	document.getElementById(searchBarId).addEventListener("keydown", keyEvents, false);
}

//prepares the search bar
function prepareSearchBar() {
	//create the search bar
	var bodyNode = document.body;
	var searchBarDiv = document.createElement("div");
	searchBar = document.createElement("input");
	var resultText = document.createElement("p");
	searchBarDiv.id = searchBarDivId;
	resultText.id = searchBarResultTextId;
	searchBar.nodeType = "text";
	searchBar.id = searchBarId;
	searchBarDiv.appendChild(searchBar);
	searchBarDiv.appendChild(resultText);
	bodyNode.appendChild(searchBarDiv);
}

//highlight the current link and set the appropriate variable
function setCurrentLink(newCurrentLink) {
		//get the current link
		currentLink = newCurrentLink;
		//back up the link's id and style
		currentLinkStyle = currentLink.style;
		currentLinkId = currentLink.id;

		if (currentLinkId == null || currentLinkId == undefined || currentLinkId === "") {
			//give the link an id if it does not have one
			//this is used for the tab function
			currentLink.id = searchLinkId;
		}

		//add border to it
		currentLink.style.border = linkBorderStyle;

		//highlight the matching link
		currentLink.style.backgroundColor = linkHighlightColor;
		
		currentLink.scrollIntoView(false);

}

//If you have a link selected from your search, this tabs from it to the next link on the
//page, regardless of if the next link matches your search or not.
function tabAction(selectedLink, forward) {
	var currentFound = false;
	if (selectedLink != undefined && selectedLink != null) {
		var allLinks = document.getElementsByTagName("a");
		var start = 0;
		var end = allLinks.length;
		var increment = 1;
		var loopText = "top";
		if (!forward) {
			start = allLinks.length -1;
			end = -1;
			increment = -1;
			loopText = "bottom";
		} 
		for (var i = start; i != end; i = i + increment) {
			if (allLinks[i].id != null && allLinks[i].id != undefined
				&& allLinks[i].id.toLowerCase() === selectedLink.id.toLowerCase()) {
				
				currentFound = true;
				continue;
			}
			if (currentFound) {
				resetCurrentLink();
				setCurrentLink(allLinks[i]);
				setSearchIndicator("Tabbing through");
				return;	
			}
		}
		if (currentFound) {
			//we looped around
			resetCurrentLink();
			setCurrentLink(allLinks[start]);
			setSearchIndicator("Looped around to the " + loopText);
		}
	}
	
}

//sets the "link x of y" text
function setSearchIndicator(newText) {
	document.getElementById(searchBarResultTextId).innerText = newText;
}
