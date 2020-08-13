// ==UserScript==
// @name		VRChat Credential Viewer
// @description	VRChat Credential Viewer (UserScript)
// @version		0.0.1
// @match		https://vrchat.com/home*
// @match		https://www.vrchat.com/home*
// @match		https://api.vrchat.cloud/home*
// @website		https://github.com/Yanorei32/VRCInstanceOwnerViewer
// @namespace	http://yano.teamfruit.net/~rei/
// @updateURL	https://github.com/Yanorei32/VRCCredentialViewer/raw/master/vrc-credential-viewer.user.js
// @license		MIT License
// @grant		none
// ==/UserScript==

(function() {
	'use strict';

	const DOM_POLLING_INTERVAL = 250;
	const DOM_POLLING_RETRY = (1000/DOM_POLLING_INTERVAL)*5;
	const processedE = new WeakMap();

	const tryToSetEventTrigger = (homeCE) => {
		if (location.pathname != '/home') return;
		const e = homeCE.getElementsByTagName('h2')[0];
		if (!e) return;

		if (processedE.has(e)) return;
		processedE.set(e);

		e.addEventListener('click', () => {
			const authCookie = document.cookie.replace(
				/(?:(?:^|.*;\s*)auth\s*\=\s*([^;]*).*$)|^.*$/,
				'$1',
			);
			const copyListener = (e) => {
				e.clipboardData.setData('text/plain', authCookie);
				e.preventDefault();
				document.removeEventListener('copy', copyListener);
			}
			document.addEventListener('copy', copyListener);
			document.execCommand('copy');
			alert(`Copied! [${authCookie}]`);
		});
	};

	const spaloggedin = () => {
		{
			let retryCount = 0;
			const polling = setInterval(() => {
				const homeCE = document.querySelector('div.home-content');

				if (!homeCE) {
					if (DOM_POLLING_RETRY <= ++retryCount)
						clearInterval(polling);
					return;
				}
				clearInterval(polling);

				tryToSetEventTrigger(homeCE);
				(new MutationObserver(() => {
					tryToSetEventTrigger(homeCE);
				})).observe(
					homeCE,
					{ childList: true },
				);
			}, DOM_POLLING_INTERVAL);
		}
	}

	spaloggedin();

	setTimeout(() => {
		(new MutationObserver((records) => {
			setTimeout(spaloggedin, DOM_POLLING_INTERVAL);
		})).observe(
			document.querySelector('div#app>div>main'),
			{ childList: true, attributes: true, characterData: true },
		);
	}, DOM_POLLING_INTERVAL*20);

})();
