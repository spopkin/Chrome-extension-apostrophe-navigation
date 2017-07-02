//alert("extension loaded");

var barOpen = false;

document.body.addEventListener("keyup", function (keystroke) {
	if (keystroke.key == '\'') {
		if (keystroke.target.nodeName != "INPUT") {
			//open the search bar

			var bodyNode = document.body;
			var searchBar = document.createElement("input");
			searchBar.nodeType = "text";
			searchBar.id = "injectedApostropheSearchBar";
		
			bodyNode.appendChild(searchBar);
			barOpen = true;
		}
	}
	else if (keystroke.key == 'Escape') {
		//close the search bar
		if (barOpen) {
			var searchBar = document.getElementById("injectedApostropheSearchBar");
			document.body.removeChild(searchBar);
		} 
	}
	else if (keystroke.key == 'F2') {
		//continue the search
		//F3 does this in Firefox, but Chrome intercepts that
		alert("F2");	
	}

	else if {
		//begin the search feature here
	}
});

