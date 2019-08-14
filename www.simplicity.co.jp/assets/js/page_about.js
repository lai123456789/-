

if (PJAX.maincontents.isTransition() === false) {
	document.addEventListener("DOMContentLoaded", GAS_pjaxDOMContentLoaded, false);
}

function GAS_pjaxDOMContentLoaded() {
	/*if (MonoTypeWebFonts) {
		//MonoTypeWebFonts.cleanup();
		//MonoTypeWebFonts.RefreshFonts();
		//console.log("MonoTypeWebFonts.RefreshFonts /a");
	}*/
}

function GAS_pjaxOnLoadComplete() {
	
}

function GAS_pjaxDestroyJS() {
	GAS_pjaxOnLoadComplete = null;
	GAS_pjaxDOMContentLoaded = null;
	GAS_pjaxDestroyJS = null;
}

