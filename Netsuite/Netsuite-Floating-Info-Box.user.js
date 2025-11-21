// ==UserScript==
// @name         [Netsuite] Floating Info Button v2
// @version      1.0
// @description  Floating button to display extracted info from (Related Records) #links_splits table
// @match        https://*.app.netsuite.com/app/accounting/transactions/salesord.nl?id=*
// @match        https://*.app.netsuite.com/app/accounting/transactions/purchord.nl?id=*
// @author       JSM
// @grant        none
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/jmak-bw/TampermonkeyScriptsJSM/main/Netsuite/Netsuite-Floating-Info-Box.user.js
// @downloadURL  https://raw.githubusercontent.com/jmak-bw/TampermonkeyScriptsJSM/main/Netsuite/Netsuite-Floating-Info-Box.user.js
// ==/UserScript==
(function () {
    'use strict';

    // --- Create Floating Action Button ---
    const fab = document.createElement('button');
    fab.innerHTML = '+';
    Object.assign(fab.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#6200EE',
        color: 'white',
        fontSize: '24px',
        border: 'none',
        cursor: 'pointer',
        zIndex: 9999,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    });

    // --- Create Info Panel ---
    const panel = document.createElement('div');
    Object.assign(panel.style, {
        position: 'fixed',
        bottom: '90px',
        right: '20px',
        width: '480px',
        maxWidth: '90vw',
        maxHeight: '480px',
        overflowY: 'auto',
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        display: 'none',
        zIndex: 9999,
    });

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    // --- Extract #links_splits table ---
    function extractInfo() {
        const table = document.getElementById('links_splits');
        if (!table) return '<p style="color:red;">Table with id="links_splits" not found.</p>';

        let rowIndex = 0;
        const rows = [];

        while (true) {
            const row = document.getElementById('linksrow' + rowIndex);
            if (!row) break;
            const cells = row.querySelectorAll('td');
            if (cells.length >= 4) {
                const link = cells[0].querySelector('a');
                let status = cells[3].innerText.trim();
                if (status === 'Pending Bill') status = 'Pending Billing';
                if (status === 'Paid In Full') status = 'Paid';

                const type = cells[1].innerText.trim();
                const amount = (type === 'Invoice' && cells.length >= 6) ? cells[5].innerText.trim() : '';

                rows.push({
                    date: cells[0].innerText.trim(),
                    type,
                    id: cells[2].innerText.trim(),
                    status,
                    amount,
                    href: link ? link.href : '#'
                });
            }
            rowIndex++;
        }

        if (!rows.length) return '<p>No rows found.</p>';

        // Group rows by type
        const groups = {};
        rows.forEach(r => {
            if (!groups[r.type]) groups[r.type] = [];
            groups[r.type].push(r);
        });

        const typeOrder = ['Item Fulfillment', 'Purchase Order', 'Invoice', 'Return Authorisation'];

        let html = `
            <style>
            .floating-table { width:100%; border-collapse:collapse; font-size:13px; margin-bottom:12px; table-layout:fixed; }
            .floating-table th, .floating-table td { padding:6px 8px; border-bottom:1px solid #eee; vertical-align:middle; text-align:left; }
            .floating-table th { background-color:#f6f6f6; border-bottom:2px solid #ddd; font-weight:600; }
            .table-title { font-weight:700; margin:8px 0 6px; padding:4px 6px; background:#e9e9e9; border-radius:4px; }
            .floating-table col.c1 { width:7%; } .floating-table col.c2 { width:22%; } .floating-table col.c3 { width:36%; } .floating-table col.c4 { width:20%; } .floating-table col.c5 { width:15%; }
            .floating-table td.amount { text-align:right; white-space:nowrap; overflow:visible; }
            .floating-table tr[data-href] { cursor:pointer; }
            .floating-table tr[data-href]:hover { background:#fafafa; }
            .floating-table td:nth-child(2) { white-space:normal; overflow:visible; text-overflow:unset; }
            </style>
        `;

        // Render tables in type order
        typeOrder.forEach(type => {
            if (!groups[type]) return;
            const isInvoice = type === 'Invoice';
            html += `<div class="table-title">${type}(s)</div>`;
            html += `<table class="floating-table"><colgroup>
                        <col class="c1"><col class="c2"><col class="c3"><col class="c4"><col class="c5">
                     </colgroup>
                     <thead>
                     <tr>
                        <th>No.</th><th>Date</th><th>ID</th><th>Status</th>${isInvoice ? '<th>Amount</th>' : '<th style="visibility:hidden"></th>'}
                     </tr>
                     </thead>
                     <tbody>`;
            groups[type].forEach((r,i)=>{
                const formattedAmount = isInvoice && r.amount ? '£' + r.amount.replace(/^£/,'') : '';
                html += `<tr data-href="${r.href}">
                            <td>${i+1}</td>
                            <td>${r.date}</td>
                            <td title="${r.id}">${r.id}</td>
                            <td>${r.status}</td>
                            ${isInvoice ? `<td class="amount">${formattedAmount}</td>` : `<td class="amount"></td>`}
                         </tr>`;
            });
            html += `</tbody></table>`;
            delete groups[type];
        });

        // Render any remaining types
        Object.keys(groups).forEach(type=>{
            html += `<div class="table-title">${type}(s)</div>`;
            html += `<table class="floating-table"><colgroup>
                        <col class="c1"><col class="c2"><col class="c3"><col class="c4"><col class="c5">
                     </colgroup>
                     <thead>
                     <tr><th>No.</th><th>Date</th><th>ID</th><th>Status</th><th style="visibility:hidden"></th></tr>
                     </thead><tbody>`;
            groups[type].forEach((r,i)=>{
                html += `<tr data-href="${r.href}">
                            <td>${i+1}</td>
                            <td>${r.date}</td>
                            <td title="${r.id}">${r.id}</td>
                            <td>${r.status}</td>
                            <td class="amount"></td>
                         </tr>`;
            });
            html += `</tbody></table>`;
        });

        return html;
    }

    // --- Attach row click listeners ---
    function attachRowListeners() {
        panel.querySelectorAll('tr[data-href]').forEach(row => {
            row.addEventListener('click', () => {
                const href = row.getAttribute('data-href');
                if (href && href !== '#') window.open(href, '_blank');
            });
        });
    }

    // --- Click Activities tab ---
    function clickActivitiesTab() {
        const activitiesTab = document.querySelector('#activitieslnk a');
        if (activitiesTab) {
            activitiesTab.click();
        }
    }

    // --- Wait for Activities table and extract ---
    function waitForActivitiesData(callback) {
        const table = document.querySelector('#activities__tab');
        if (table) {
            const rows = table.querySelectorAll('tbody tr');
            const data = Array.from(rows).map(row =>
                Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim())
            );
            callback(data);
        } else {
            setTimeout(() => waitForActivitiesData(callback), 500);
        }
    }

    // --- FAB click ---
    fab.addEventListener('click', (event) => {
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (panel.style.display === 'none') {
            panel.innerHTML = extractInfo();
            attachRowListeners();
            panel.style.display = 'block';
            fab.innerHTML = '×';
        } else {
            panel.style.display = 'none';
            fab.innerHTML = '+';
        }

        clickActivitiesTab();
        waitForActivitiesData((activitiesData) => {
            console.log('[FAB Script] Activities Data:', activitiesData);
        });
    });

})();
