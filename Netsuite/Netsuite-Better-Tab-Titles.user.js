// ==UserScript==
// @name         [Netsuite] Better Tab Titles
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Set custom title for Netsuite Sales Orders
// @match        https://*.app.netsuite.com/app/accounting/transactions/*
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

            // Set as page title
            document.title = `${soText} ${shortYear ? '(' + shortYear + ')' : ''} - ${statusText}`;

            clearInterval(interval); // Stop checking once found
        }
    }, 500); // Check every 500ms
})();
