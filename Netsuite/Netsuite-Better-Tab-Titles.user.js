// ==UserScript==
// @name         [Netsuite] Better Tab Titles
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Set custom title for Netsuite Sales Orders
// @match        https://*.app.netsuite.com/app/accounting/transactions/*
// @match        https://*.app.netsuite.com/app/*
// @run-at       document-start
// @grant        none
// @updateURL    https://raw.githubusercontent.com/jmak-bw/TampermonkeyScriptsJSM/main/Netsuite/Netsuite-Better-Tab-Titles.user.js
// @downloadURL  https://raw.githubusercontent.com/jmak-bw/TampermonkeyScriptsJSM/main/Netsuite/Netsuite-Better-Tab-Titles.user.js
// ==/UserScript==

(function() {
    'use strict';

    const interval = setInterval(() => {
        const soDiv = document.querySelector('div.uir-record-id');
        const statusDiv = document.querySelector('div.uir-record-status');
        const typeDiv = document.querySelector('h1.uir-record-type');
        const itemDiv = document.querySelector('div.uir-record-name');

        // Only proceed if typeDiv exists
        if (!typeDiv) return;

        let titleText = '';

        // Case 1: Inventory Item → show item + type
        if (typeDiv.textContent.trim() === 'Inventory Item') {
            if (itemDiv) {
                titleText = `${itemDiv.textContent} - ${typeDiv.textContent}`;
            }

        // Case 2: Anything else → show SO/status logic
        } else {
            if (soDiv && statusDiv) {
                let soText = soDiv.textContent.trim();
                let statusText = statusDiv.textContent.trim();
                let extractedYear = null;
                let shortYear = null;

                // Remove -BWUK-<year>- and extract year
                soText = soText.replace(/-BWUK-(\d{4})-/, (match, year) => {
                    extractedYear = year;
                    shortYear = 'Y' + year.slice(-2);
                    return '-';
                });

                // Shorten status
                statusText = statusText
                    .replace(/^Pending\s+/i, 'P. ')
                    .replace(/^Partially\s+/i, 'P. ')
                    .replace(/^Fully Billed$/i, 'Billed');

                titleText = `${soText}${shortYear ? ' (' + shortYear + ')' : ''} - ${statusText}`;
            }
        }

        // Set title if we got something
        if (titleText) {
            document.title = titleText;
            clearInterval(interval);
        }

    }, 500);
})();
