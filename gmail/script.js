/* ==================================================
 * SIMPLIFY GMAIL v1.3.6
 * By Michael Leggett: leggett.org
 * Copyright (c) 2019 Michael Hart Leggett
 * Repo: github.com/leggett/simplify/blob/master/gmail/
 * License: github.com/leggett/simplify/blob/master/gmail/LICENSE
 * More info: simpl.fyi
 */


// == SIMPL =====================================================
// Turn debug loggings on/off
var simplifyDebug = false;

// Print Simplify version number if debug is running
if (simplifyDebug) console.log('Simplify version ' + chrome.runtime.getManifest().version);

// Add simpl style to html tag
var htmlEl = document.documentElement;
htmlEl.classList.add('simpl');

// Toggles custom style and returns latest state
function toggleSimpl() {
	return htmlEl.classList.toggle('simpl');
}

// Handle Simplify keyboard shortcuts
function handleToggleShortcut(event) {
	// If Cmd+J was pressed, toggle simpl
	if (event.metaKey && event.which == 74) {
		toggleSimpl();
		event.preventDefault();
	}

	// If Ctrl+M was pressed, toggle menu open/closed
	if (event.ctrlKey && event.key == "m") {
		document.querySelector('.aeN').classList.toggle('bhZ');
		toggleMenu();
		// TODO: if opening, focus the first element
	}
}
window.addEventListener('keydown', handleToggleShortcut, false);

// Handle messages from background script that 
// supports page action to toggle Simplify on/off
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	if (message.action === 'toggle_simpl') {
		const isNowToggled = toggleSimpl();
		sendResponse({toggled: isNowToggled});
	}
});

// Activate page action button
chrome.runtime.sendMessage({action: 'activate_page_action'});




/* == INIT SAVED STATES =================================================
 * If someone is signed into multiple accounts, the localStorage
 * variables will overwrite one another unless we associate them
 * with an account. The user number in the URL is the only
 * identifying thing we have access to at the start of page load.
 *
 * This will continue to match the username so long as you don't
 * sign out and then back into a different account first. After
 * the page is totally loaded, we will check for this case and
 * reset the local variables if the username associated with
 * the userId in the URL doesn't match the username associated
 * with the userId in localStorage.
 */
const userPos = location.pathname.indexOf('/u/');
const u = location.pathname.substring(userPos+3, userPos+4);
let simplify = {};

const defaultParam = {
	username: "",
	previewPane: null,
	multipleInboxes: "",
	theme: "",
	navOpen: null,
	density: "",
	textButtons: null,
	rhsChat: null,
	minimizeSearch: null,
	addOns: null,
	addOnsCount: 3,
	elements: {}
}

// Helper function to init or reset the localStorage variable
function resetLocalStorage(userNum) {
	window.localStorage.clear();
	if (userNum) {
		simplify[u] = defaultParam;
		window.localStorage.simplify = JSON.stringify(simplify);
	} else {
		window.localStorage.simplify = JSON.stringify({ "0": defaultParam });
	}
}

// Initialize local storage if undefined
if (typeof window.localStorage.simplify === 'undefined') {
	resetLocalStorage();
}

// Local copy of Simplify cached state parameters
simplify = JSON.parse(window.localStorage.simplify);

// Make sure Simplify cached state parameters are initialized for this account
if (typeof simplify[u] === 'undefined') {
	resetLocalStorage(u);
}

// Write to local and localStorage object
function updateParam(param, value) {
	// Sometimes the value has already been written and we just need to update localStorage
	if (typeof value !== "undefined") {
		simplify[u][param] = value;
	}
	window.localStorage.simplify = JSON.stringify(simplify);
}

/* Make sure local variables are for the right account 
 * TODO: for now, when it doesn't match, I just localStorage.clear()
 * but there might be a better way, maybe try and match the correct account?
 */
function checkLocalVar() {
	// var username = document.querySelector('.gb_db').innerText;
	var usernameStart = document.title.search(/[a-z]+\@gmail.com - Gmail/);
	if (usernameStart > 0) {
		var username = document.title.substring(usernameStart, document.title.length-8);
		if (simplifyDebug) console.log('Username: ' + username);
		if (simplify[u].username != username) {
			if (simplifyDebug) console.log('Usernames do NOT match');
			resetLocalStorage();
		}
		updateParam("username", username);
	}
}

// Init Preview Pane or Multiple Inboxes
if (simplify[u].previewPane) {
	if (simplifyDebug) console.log('Loading with split view');
	htmlEl.classList.add('splitView');

	// Multiple Inboxes doesn't work if you have Preview Pane enabled
	updateParam("multipleInboxes", "none");
} else {
	// Multiple Inboxes only works if Preview Pane is disabled
	if (simplify[u].multipleInboxes == "horizontal") {
		if (simplifyDebug) console.log('Loading with side-by-side multiple inboxes');
		htmlEl.classList.add('multiBoxHorz');
	} else if (simplify[u].multipleInboxes == "vertical") {
		if (simplifyDebug) console.log('Loading with vertically stacked multiple inboxes');
		htmlEl.classList.add('multiBoxVert');
	}
}

// Init themes
if (simplify[u].theme == "light") {
	if (simplifyDebug) console.log('Loading with light theme');
	htmlEl.classList.add('lightTheme');
} else if (simplify[u].theme == "dark") {
	if (simplifyDebug) console.log('Loading with dark theme');
	htmlEl.classList.add('darkTheme');
} else if (simplify[u].theme == "medium") {
	if (simplifyDebug) console.log('Loading with medium theme');
	htmlEl.classList.add('mediumTheme');
}

// Init nav menu
if (simplify[u].navOpen) {
	if (simplifyDebug) console.log('Loading with nav menu open');
	document.documentElement.classList.add('navOpen');
} else {
	if (simplifyDebug) console.log('Loading with nav menu closed');
}

// Init density
if (simplify[u].density == "low") {
	if (simplifyDebug) console.log('Loading with low density inbox');
	htmlEl.classList.add('lowDensityInbox');
} else if (simplify[u].density == "high") {
	if (simplifyDebug) console.log('Loading with high density inbox');
	htmlEl.classList.add('highDensityInbox');
}

// Init text button labels
if (simplify[u].textButtons) {
	if (simplifyDebug) console.log('Loading with text buttons');
	document.documentElement.classList.add('textButtons');
}

// Init right side chat
if (simplify[u].rhsChat) {
	if (simplifyDebug) console.log('Loading with right hand side chat');
	htmlEl.classList.add('rhsChat');
}

// Hide Search box by default
if (simplify[u].minimizeSearch == null) {
	// Only default to hiding search if the window is smaller than 1441px wide
	if (window.innerWidth < 1441) {
		updateParam('minimizeSearch', true);
	} else {
		updateParam('minimizeSearch', false);
	}
}
if (simplify[u].minimizeSearch) {
	if (simplifyDebug) console.log('Loading with search hidden');
	htmlEl.classList.add('hideSearch');
}


// Make space for add-ons pane if the add-ons pane was open last time
if (simplify[u].addOns) {
	if (simplifyDebug) console.log('Loading with add-ons pane');
	htmlEl.classList.add('addOnsOpen');
}




// == URL HISTORY =====================================================

// Set up urlHashes to track and update for closing Search and leaving Settings
var closeSearchUrlHash = (location.hash.substring(1, 7) == "search"
	|| location.hash.substring(1, 7) == "label/"
	|| location.hash.substring(1, 7) == "advanc") ? "#inbox" : location.hash;
var closeSettingsUrlHash = location.hash.substring(1, 9) == "settings" ? "#inbox" : location.hash;

window.onhashchange = function() {
	if (location.hash.substring(1, 7) != "search"
		&& location.hash.substring(1, 6) != "label"
		&& location.hash.substring(1, 16) != "advanced-search") {
			closeSearchUrlHash = location.hash;
	}
	if (location.hash.substring(1, 9) != "settings")  {
		closeSettingsUrlHash = location.hash;
		htmlEl.classList.remove('inSettings');
	}
	if (location.hash.substring(1, 9) == "settings")  {
		htmlEl.classList.add('inSettings');
	}

	// if we were supposed to check the theme later, do it now
	if (checkThemeLater) {
		detectTheme();
	}
}

// Show back button if page loaded on Settings
if (location.hash.substring(1, 9) == "settings") {
	htmlEl.classList.add('inSettings');
}




/* == INIT STYLESHEET =================================================
 * Certain classnames seem to change often in Gmail. Where possible, use 
 * stable IDs, tags, and attribute selectors (e.g. #gb input[name="q"]). 
 * Other times, classnames don't change often. But for when we have to use
 * a classname and it changes often, detect the classname (usually based on
 * more stable children elements) and inject the style on load. 
 */

var simplifyStyles;
function initStyle() {
	// Create style sheet element and append to <HEAD>
	var simplifyStyleEl = document.createElement('style');
	simplifyStyleEl.id = "simplifyStyle";
	document.head.appendChild(simplifyStyleEl);

	// Setup global variable for style sheet
	if (simplifyDebug) console.log('Style sheet added');
	simplifyStyles = simplifyStyleEl.sheet;

	// Initialize addOns height now that Style Sheet is setup
	addCSS(`:root { --add-on-height: ${simplify[u].addOnsCount * 56}px; }`);

	// Add cached styles
	addStyles();
}

// Helper function to add CSS to Simplify Style Sheet
function addCSS(css, pos) {
	var position = pos ? pos : simplifyStyles.cssRules.length;
	simplifyStyles.insertRule(css, position);
	if (simplifyDebug) console.log('CSS added: ' + simplifyStyles.cssRules[position].cssText);
}

// Detect and cache classNames that often change so we can inject CSS
function detectClassNames() {
	// Search parent
	var searchParent = "." + document.querySelector('form[role="search"]').parentElement.classList.value.replace(" ",".");
	simplify[u].elements["searchParent"] = searchParent;

	// TODO: Search form elements

	// Update the cached classnames in case any changed
	updateParam();

	// Add styles again in case the classNames changed
	addStyles();
}

function addStyles() {
	// Remove right padding from action bar so search is always correctly placed
	addCSS(`html.simpl #gb ${simplify[u].elements.searchParent} { padding-right: 0px !important; }`);

	// Hide any buttons after the Search input including the support button (a bit risky)
	addCSS(`html.simpl #gb ${simplify[u].elements.searchParent} ~ div { display:none; }`);
}



// == SEARCH FUNCTIONS =====================================================

/* Focus search input */
function toggleSearchFocus(onOff) {
	// We are about to show Search if hideSearch is still on the html tag
	if (onOff == 'off' || htmlEl.classList.contains('hideSearch')) {
		// document.querySelector('header#gb form').classList.remove('gb_pe');

		// Remove focus from search input or button
		document.activeElement.blur();
	} else {
		// document.querySelector('header#gb form').classList.add('gb_pe');
		document.querySelector('header#gb form input').focus();
	}
}

// Setup search event listeners
var initSearchLoops = 0;
function initSearch() {
	// See if Search form has be added to the dom yet
	var searchForm = document.querySelector('#gb form');

	// Setup Search functions to show/hide Search at the
	// right times if we have access to the search field
	if (searchForm) {
		// Add function to search button to toggle search open/closed
		var searchIcon = document.querySelector('#gb form path[d^="M20.49,19l-5.73"]').parentElement;
		searchIcon.addEventListener('click', function(event) {
			event.preventDefault();
			event.stopPropagation();
			htmlEl.classList.toggle('hideSearch');
			updateParam('minimizeSearch', htmlEl.classList.contains('hideSearch'));
			toggleSearchFocus();
		}, false);

		// Add functionality to search close button to close search and go back
		var searchCloseIcon = document.querySelector('#gb form path[d~="6.41L17.59"]').parentElement;

		// Hide search when you clear the search if it was previously hidden
		searchCloseIcon.addEventListener('click', function(event) {
			event.preventDefault();
			event.stopPropagation();
			toggleSearchFocus('off');
			document.querySelector('header input[name="q"]').value = "";
			location.hash = closeSearchUrlHash;
			htmlEl.classList.toggle('hideSearch');
			updateParam("minimizeSearch", true);
		}, false);
	} else {
		initSearchLoops++;
		if (simplifyDebug) console.log('initSearch loop #' + initSearchLoops);

		// only try 4 times and then asume something is wrong
		if (initSearchLoops < 5) {
			// Call init function again if the gear button field wasn't loaded yet
			setTimeout(initSearch, 500);
		}
	}
}

// Detect if search is focused and needs to be expanded
var initSearchFocusLoops = 0;
function initSearchFocus() {
	// If the search field gets focus and hideSearch hasn't been applied, add it
	var searchInput = document.querySelectorAll('header input[name="q"]')[0];

	if (searchInput) {
		// Show search if the page is loaded is a search view
		if (location.hash.substring(1, 7) == "search") {
			htmlEl.classList.remove('hideSearch');
		}

		// Show search if it is focused and hidden
		searchInput.addEventListener('focus', function() {
			htmlEl.classList.remove('hideSearch');
		}, false );

		// Hide search box if it loses focus, is empty, and was previously hidden
		searchInput.addEventListener('blur', function() {
			if (this.value == "" && simplify[u].minimizeSearch) {
				htmlEl.classList.add('hideSearch');
			}
		}, false );
	} else {
		// If the search field can't be found, wait and try again
		initSearchFocusLoops++;
		if (simplifyDebug) console.log('initSearchFocus loop #' + initSearchFocusLoops);

		// Only try 10 times and then asume something is wrong
		if (initSearchFocusLoops < 5) {
			// Call init function again if the search input wasn't loaded yet
			setTimeout(initSearchFocus, 500);
		}
	}
}




// == SETTINGS FUNCTIONS =====================================================

// Setup settings event listeners
var initSettingsLoops = 0;
function initSettings() {
	// See if settings gear has be added to the dom yet
	var backButton = document.querySelector('header#gb div[aria-label="Go back"] svg');
	if (!backButton) {
		// aria-label doesn't work with non-english interfaces but .gb_1b changes often
		backButton = document.querySelector('header#gb div.gb_1b svg');
	}

	if (backButton) {
		backButton.addEventListener('click', function() {
			if (location.hash.substring(1, 9) == "settings") {
				location.hash = closeSettingsUrlHash;
				htmlEl.classList.remove('inSettings');
			}
		}, false);
	} else {
		initSettingsLoops++;
		if (simplifyDebug) console.log('initSettings loop #' + initSettingsLoops);

		// only try 5 times and then asume something is wrong
		if (initSettingsLoops < 5) {
			// Call init function again if the gear button field wasn't loaded yet
			setTimeout(initSettings, 500);
		}
	}
}




// == DETECTION FUNCTIONS =====================================================

// Detect if a dark theme is being used and change styles accordingly
var detectThemeLoops = 0;
var checkThemeLater = false;
var observingThemes = false;
function detectTheme(fromObserver) {
	var msgCheckbox = document.querySelectorAll('div[gh="tl"] .xY > .T-Jo')[0];
	var conversation = document.querySelectorAll('table[role="presentation"]');
	if (simplifyDebug) console.log('Detecting theme...');
	if (msgCheckbox) {
		var checkboxBg = window.getComputedStyle(msgCheckbox, null).getPropertyValue("background-image");
		var menuButton = document.querySelector('#gb div path[d*="18h18v-2H3v2zm0"]');
		var menuButtonBg = window.getComputedStyle(menuButton, null).getPropertyValue("color");
		if (checkboxBg.indexOf('black') > -1) {
			if (menuButtonBg.indexOf('255, 255, 255') > -1) {
				// The checkbox is black which means the threadlist 
				// bg is light, BUT the app bar icons are light
				htmlEl.classList.add('mediumTheme');
				htmlEl.classList.remove('lightTheme');
				htmlEl.classList.remove('darkTheme');
				updateParam('theme', 'medium');
			} else {			
				htmlEl.classList.add('lightTheme');
				htmlEl.classList.remove('mediumTheme');
				htmlEl.classList.remove('darkTheme');
				updateParam('theme', 'light');
			}
		} else {
			htmlEl.classList.add('darkTheme');
			htmlEl.classList.remove('lightTheme');
			htmlEl.classList.remove('mediumTheme');
			updateParam('theme', 'dark');
		}
		checkThemeLater = false;
		if (!observingThemes) observeThemes();
	} else if (conversation.length == 0) {
		// if we're not looking at a conversation, maybe the threadlist just hasn't loaded yet
		detectThemeLoops++;
		if (simplifyDebug) console.log('detectTheme loop #' + detectThemeLoops);

		// only try 4 times and then asume you're in a thread
		if (detectThemeLoops < 5) {
			setTimeout(detectTheme, 500);
		}
	} else {
		// We are looking at a conversation, check the theme when the view changes
		checkThemeLater = true;
	}
}
function observeThemes() {
	/* BUG (sort of)... this only works when changing to/from/between themes 
	 * with background images. It does NOT work when changing between flat color
	 * themes. This is b/c this only detects when attributes are changed inline or 
	 * children nodes are added/removed. The switch from white to black themes
	 * changes the css in the head (inside one of many style tags) which then
	 * changes the styles. I don't see an inline change I can observe to trigger
	 * this observer. At least not yet.
	 */
	var themeBg = document.querySelector('.yL .wl');

	if (themeBg) {	
		var themesObserverConfig = { attributes: true, attributeFilter: ["style"], childList: true, subtree: true };

		// Create an observer instance that calls the detectTheme function
		// Annoying that I have to delay by 200ms... if I don't then 
		// it checks to see if anything changed before it had a chance to change
		var themesObserver = new MutationObserver(function() { setTimeout(detectTheme, 200) });

		// Start observing the target node for configured mutations
		themesObserver.observe(themeBg, themesObserverConfig);
		observingThemes = true;
		if (simplifyDebug) console.log('Adding mutation observer for themes');
	} else {
		if (simplifyDebug) console.log('Failed to add mutation observer for themes');
	}
}

// Detect the interface density so we can adjust the line height on items
var detectDensityLoops = 0;
function detectDensity() {
	var navItem = document.querySelector('div[role="navigation"] .TN');
	if (navItem) {
		var navItemHeight = parseInt(window.getComputedStyle(navItem, null).getPropertyValue("height"));
		if (simplifyDebug) console.log('Detecting inbox density via nav item. Height is ' + navItemHeight + 'px');
		if (navItemHeight <= 26) {
			if (simplifyDebug) console.log('Detected high density');
			htmlEl.classList.remove('lowDensityInbox');
			htmlEl.classList.add('highDensityInbox');
			updateParam('density', 'high');
		} else {
			if (simplifyDebug) console.log('Detected low density');
			htmlEl.classList.add('lowDensityInbox');
			htmlEl.classList.remove('highDensityInbox');
			updateParam('density', 'low');
		}
	} else {
		detectDensityLoops++;
		if (simplifyDebug) console.log('detectDensity loop #' + detectDensityLoops);

		// only try 4 times and then assume no split view
		if (detectDensityLoops < 5) {
			// Call init function again if nav item wasn't loaded yet
			setTimeout(detectDensity, 500);
		} else {
			if (simplifyDebug) console.log('Giving up on detecting interface density');
		}
	}
}

// Detect if preview panes are enabled and being used
// TODO: I should rename SplitView PreviewPane as that is what Gmail calls the feature
var detectSplitViewLoops = 0;
function detectSplitView() {
	// Short term patch: Offline seems to mess with detecting splitPanes
	var offlineActive = document.getElementsByClassName('bvE');
	if (offlineActive && detectSplitViewLoops == 0) {
		detectSplitViewLoops++;
		setTimeout(detectSplitView, 2000);
	} else {
		var splitViewToggle = document.querySelector('div[selector="nosplit"]');
		if (splitViewToggle) {
			// Only the Preview Pane vertical or horizontal has the action bar
			var splitViewActionBar = document.querySelectorAll('div[role="main"] > .G-atb');
			if (splitViewActionBar) {
				if (splitViewActionBar.length > 0) {
					if (simplifyDebug) console.log('Split view detected and active');
					htmlEl.classList.add('splitView');
					updateParam('previewPane', true);
					/* TODO: Listen for splitview mode toggle via mutation observer */
				} else {
					if (simplifyDebug) console.log('Split view enabled but set to No Split');
					htmlEl.classList.remove('splitView');
					updateParam('previewPane', false);
				}
				// Multiple Inboxes only works when Split view is disabled
				updateParam("multipleInboxes", "none");
				htmlEl.classList.remove('multiBoxVert');
				htmlEl.classList.remove('multiBoxHorz');
			}
		} else {
			detectSplitViewLoops++;
			if (simplifyDebug) console.log('Detect preview pane loop #' + detectSplitViewLoops);

			// only try 4 times and then assume no split view
			if (detectSplitViewLoops < 5) {
				// Call init function again if the gear button field wasn't loaded yet
				setTimeout(detectSplitView, 500);
			} else {
				if (simplifyDebug) console.log('Giving up on detecting split view');
				htmlEl.classList.remove('splitView');
				updateParam('previewPane', false);

				// Multiple Inboxes only works when Split view is disabled
				detectMultipleInboxes();
			}
		}
	}
}



// Determine number of add-ons and set the height of the add-ons pane accordingly
var detectNumberOfAddOnsLoops = 0;
function detectNumberOfAddOns() {
	// Detect how many add-ons there are
	var numberOfAddOns = parseInt(document.querySelectorAll('.bAw div[role="tablist"] > div[role="tab"]').length) - 2;
	if (numberOfAddOns > 0) {
		if (simplifyDebug) console.log('There are ' + numberOfAddOns + ' add-ons');
		if (numberOfAddOns != simplify[u].addOnsCount) {
			addCSS(`:root { --add-on-height: ${numberOfAddOns * 56}px !important; }`);
			updateParam('addOnsCount', numberOfAddOns);
		} else {
			updateParam('addOnsCount', 3);
		}
	} else {
		detectNumberOfAddOnsLoops++;
		if (simplifyDebug) console.log('detectNumberOfAddOns loop #' + detectNumberOfAddOnsLoops);

		// only try 4 times and then assume no add-on pane
		if (detectNumberOfAddOnsLoops < 5) {
			// Call init function again if the add-on pane wasn't loaded yet
			setTimeout(detectNumberOfAddOns, 500);
		} else {
			if (simplifyDebug) console.log('Giving up on detecting number of add-ons pane');
		}
	}
}



// Detect Add-ons Pane
var detectAddOnsPaneLoops = 0;
function detectAddOns() {
	var addOnsPane = document.getElementsByClassName('brC-brG')[0];
	if (addOnsPane) {
		var paneVisible = window.getComputedStyle( document.getElementsByClassName('bq9')[0], null).getPropertyValue('width');
		if (simplifyDebug) console.log('Add-on pane width loaded as ' + paneVisible);
		if (paneVisible == "auto") {
			if (simplifyDebug) console.log('No add-on pane detected on load');
			htmlEl.classList.remove('addOnsOpen');
			updateParam('addOns', false);
		} else {
			if (simplifyDebug) console.log('Add-on pane detected on load');
			htmlEl.classList.add('addOnsOpen');
			updateParam('addOns', true);
		}

		// Set the height of the add-ons tray based on number of add-ons
		detectNumberOfAddOns();

		// Options for the observer (which mutations to observe)
		var addOnsObserverConfig = { attributes: true, childList: false, subtree: false };

		// Callback function to execute when mutations are observed
		// TODO: detect changes to width of bq9 instead of style attribute
		var addOnsObserverCallback = function(mutationsList, observer) {
		    for (var mutation of mutationsList) {
		        if (mutation.type == 'attributes' && mutation.attributeName == 'style') {
		        	if (simplifyDebug) console.log('Add-on pane style set to: ' + mutation.target.attributes.style.value);
		        	if (mutation.target.attributes.style.value.indexOf("display: none") > -1) {
		        		htmlEl.classList.remove('addOnsOpen');
		        		updateParam('addOns', false);
		        	} else {
		        		htmlEl.classList.add('addOnsOpen');
		        		updateParam('addOns', true);
		        	}
		        }
		    }
		};

		// Create an observer instance linked to the callback function
		var addOnsObserver = new MutationObserver(addOnsObserverCallback);

		// Start observing the target node for configured mutations
		if (simplifyDebug) console.log('Adding mutation observer for Add-ons Pane');
		addOnsObserver.observe(addOnsPane, addOnsObserverConfig);
	} else {
		detectAddOnsPaneLoops++;
		if (simplifyDebug) console.log('detectAddOns loop #' + detectAddOnsPaneLoops);

		// only try 4 times and then assume no add-on pane
		if (detectAddOnsPaneLoops < 5) {
			// Call init function again if the add-on pane wasn't loaded yet
			setTimeout(detectAddOns, 500);
		} else {
			if (simplifyDebug) console.log('Giving up on detecting add-ons pane');
		}
	}
}



// Detect Right Side Chat (why hasn't Gmail killed this already?)
var detectRightSideChatLoops = 0;
function detectRightSideChat() {
	var talkRoster = document.getElementById('talk_roster');
	if (talkRoster) {
		var rosterSide = talkRoster.getAttribute('guidedhelpid');

		if (rosterSide == "right_roster") {
			if (simplifyDebug) console.log('Right side chat found');
			htmlEl.classList.add('rhsChat');
			updateParam('rhsChat', true);
		} else {
			updateParam('rhsChat', false);
		}
	} else {
		detectRightSideChatLoops++;
		if (simplifyDebug) console.log('detectRhsChat loop #' + detectRightSideChatLoops);

		// only try 4 times and then assume no add-on pane
		if (detectRightSideChatLoops < 5) {
			// Call init function again if the add-on pane wasn't loaded yet
			setTimeout(detectRightSideChat, 500);
		} else {
			if (simplifyDebug) console.log('Giving up on detecting Talk roster');
		}
	}
}



// Detect if using text or icon buttons
var detectButtonLabelLoops = 0;
function detectButtonLabel() {
	var secondButton = document.querySelectorAll('div[gh="tm"] div[role="button"] > div')[2];
	if (secondButton) {
		var textButtonLabel = secondButton.innerText;
		if (textButtonLabel == "") {
			// Using icon buttons
			if (simplifyDebug) console.log('Icon button labels detected');
			updateParam('textButtons', false);
			htmlEl.classList.remove('textButtons');
		} else {
			// Using icon buttons
			if (simplifyDebug) console.log('Text button labels detected');
			updateParam('textButtons', true);
			htmlEl.classList.add('textButtons');
		}
	} else {
		detectButtonLabelLoops++;
		if (detectButtonLabelLoops < 5) {
			setTimeout(detectButtonLabel, 500);
			if (simplifyDebug) console.log('Detect button labels loop #' + detectButtonLabelLoops);
		}
	}
}



// Detect nav menu state
var detectMenuStateLoops = 0;
function detectMenuState() {
	var menuButton = document.querySelector('#gb div path[d*="18h18v-2H3v2zm0"]').parentElement.parentElement;
	if (menuButton) {
		var navOpen = menuButton.getAttribute('aria-expanded');
		menuButton.addEventListener('click', toggleMenu, false);
		if (navOpen == "true") {
			if (simplifyDebug) console.log('Nav menu is open');
			updateParam('navOpen', true);
			htmlEl.classList.add('navOpen');
		} else {
			if (simplifyDebug) console.log('Nav menu is closed');
			updateParam('navOpen', false);
			htmlEl.classList.remove('navOpen');
		}
	} else {
		detectMenuStateLoops++;
		if (detectMenuStateLoops < 5) {
			setTimeout(detectMenuState, 500);
			if (simplifyDebug) console.log('Detect menu state loop #' + detectMenuStateLoops);
		}
	}
}
// Helper function to toggle menu open/closed
function toggleMenu() {
	if (simplifyDebug) console.log('Toggle nav');
	var menuButton = document.querySelector('.gb_tc div:first-child');
	if (simplify[u].navOpen) {
		htmlEl.classList.remove('navOpen');
		menuButton.setAttribute('aria-expanded', 'false');
		updateParam('navOpen', false);
	}
	else {
		htmlEl.classList.add('navOpen');
		menuButton.setAttribute('aria-expanded', 'true');
		updateParam('navOpen', true);
	}
}



// Detect Multiple Inboxes
function detectMultipleInboxes() {
	var viewAllButton = document.getElementsByClassName('p9').length;
	// var inboxesPanes = document.querySelectorAll('div[role="main"]').length;
	if (viewAllButton > 0) {
		if (simplifyDebug) console.log('Multiple inboxes found');
		var actionBars = document.querySelectorAll('.G-atb[gh="tm"]').length
		if (actionBars > 1) {
			htmlEl.classList.add('multiBoxVert');
			htmlEl.classList.remove('multiBoxHorz');
			updateParam("multipleInboxes", "vertical");
		} else {
			htmlEl.classList.add('multiBoxHorz');
			htmlEl.classList.remove('multiBoxVert');
			updateParam("multipleInboxes", "horizontal");
		}
	} else {
		updateParam("multipleInboxes", "none");
		htmlEl.classList.remove('multiBoxVert');
		htmlEl.classList.remove('multiBoxHorz');
	}
}



/* Observer to toggle pagination controls
 * Hide pagination controls if buttons are disabled in the default inbox:
 * Default inbox 	.aeH > div[gh=tm] > .ar5
 *
 * Ignore these cases:
 * Priority Inbox 	.aeF > .Wm
 * Split pane 		.aeF > div[gh=tm] > .ar5
 * MultiboxHorz		.aeF > div[gh=tm] > .ar5
 * MultiboxVert		.aeF > div[gh=tm] > .ar5
 */
function testPagination() {
	var actionBar = document.querySelector('div.aeH');

	if (actionBar) {
		var paginationDivs = document.querySelectorAll('.aeH div.ar5');
		paginationDivs.forEach(function(pagination) {
			// How many messages in the list?
			var pageButtons = pagination.querySelectorAll('div[role="button"][aria-disabled="true"]');

			// Hide pagination control if the total count is less than 100
			if (pageButtons.length >= 2) {
				pagination.style.display = "none";
			} else {
				pagination.style.display = "inline-block";
			}
		});
	}
}
function observePagination() {
	var actionBar = document.querySelector('div.aeH');

	if (actionBar) {
		// Options for the observer (which mutations to observe)
		var paginationObserverConfig = { attributes: true, childList: true, subtree: true };

		// Create an observer instance linked to the callback function
		var paginationObserver = new MutationObserver(testPagination);

		// Start observing the target node for configured mutations
		if (simplifyDebug) console.log('Adding mutation observer for Pagination controls');
		paginationObserver.observe(actionBar, paginationObserverConfig);
	}
}



// Detect if this is a delegated account
function detectDelegate() {
	if (location.pathname.substring(6,7) == "b" ) {
		htmlEl.classList.add('delegate');
	}
}



// Init App switcher event listeners
function initAppSwitcher() {
	var profileButton = document.querySelector('#gb .gb_Ea');
	if (profileButton) {
		profileButton.addEventListener('mouseenter', function(event) {
			htmlEl.classList.add('appSwitcher');
		}, false);

		var appSwitcherWrapper = document.querySelector('#gbwa');
		appSwitcherWrapper.addEventListener('mouseleave', function(event) {
			htmlEl.classList.remove('appSwitcher');
		}, false);
	}
}


// Detect if there are other 3rd party extensions installed
function detectOtherExtensions() {
	var otherExtensions = document.querySelectorAll('#gb .manage_menu, #gb .inboxsdk__appButton, #gb #mailtrack-menu-opener, #gb .mixmax-appbar').length;
	if (otherExtensions > 0) {
		if (simplifyDebug) console.log('Other extensions detected');
		htmlEl.classList.add('otherExtensions');
		// If there are other extensions, we need to do something more drastic when
		// you hover over the profile button (e.g. hide settings and search entirely)
	} else {
		if (simplifyDebug) console.log('No extensions detected');
	}
}



/* TODO: dynamic padding between pagination and actions
 * Problem: Different settings like the inputs menu add extra buttons to the
 *   action bar and mis-align the pagination controls above 1441px screen resolution.
 *
 * Solution: Detect how many buttons are in the action bar and figure out how much
 *   padding there should be. Set a global css var
 *
 * A = Get width of wrapper around right side of action bar
	window.getComputedStyle(document.querySelector('.aqJ')).getPropertyValue('width')
 * B = Get width of pagination controls
	window.getComputedStyle(document.querySelector('.ar5')).getPropertyValue('width')
 * C = Get current right padding of pagination control
 	window.getComputedStyle(document.querySelector('.ar5')).getPropertyValue('padding-right')
 * A - (B + C) is the width of just the right actions
 * ---
 * I could also possibly do a querySelectorAll on divs after the pagination control and loop
 * through and count up their computed width to determine the --right-offset
*/




// Initialize everything
function initEarly() {
	initStyle();
	initSearch();
	initSearchFocus();
	initSettings();
	detectDelegate();
}
window.addEventListener('DOMContentLoaded', initEarly, false);

function initLate() {
	detectClassNames();
	detectTheme();
	detectSplitView();
	detectDensity();
	detectRightSideChat();
	detectAddOns();
	detectMenuState();
	detectButtonLabel();
	initAppSwitcher();
	testPagination();
	observePagination();
	checkLocalVar();
	detectOtherExtensions();
}
window.addEventListener('load', initLate, false);
