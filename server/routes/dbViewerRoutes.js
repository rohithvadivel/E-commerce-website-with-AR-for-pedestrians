const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// GET /api/db-viewer — serves the UI
router.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DB Viewer — mern-ecommerce</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;background:#0f172a;color:#e2e8f0;min-height:100vh}
.header{background:linear-gradient(135deg,#1e293b,#334155);padding:20px 32px;border-bottom:1px solid #475569;display:flex;align-items:center;gap:16px}
.header h1{font-size:22px;font-weight:700;background:linear-gradient(135deg,#38bdf8,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.header .badge{background:#059669;color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600}
.container{display:flex;height:calc(100vh - 70px)}
.sidebar{width:240px;background:#1e293b;border-right:1px solid #334155;padding:16px 0;overflow-y:auto}
.sidebar h3{padding:8px 20px;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#64748b;margin-bottom:4px}
.col-btn{display:block;width:100%;text-align:left;background:none;border:none;color:#94a3b8;padding:10px 20px;font-size:14px;cursor:pointer;transition:all .15s}
.col-btn:hover{background:#334155;color:#f1f5f9}
.col-btn.active{background:#3b82f610;color:#60a5fa;border-right:3px solid #3b82f6;font-weight:600}
.col-btn .count{float:right;background:#334155;color:#94a3b8;padding:1px 8px;border-radius:10px;font-size:12px}
.main{flex:1;padding:24px;overflow-y:auto}
.toolbar{display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap}
.toolbar h2{font-size:18px;font-weight:700;color:#f1f5f9}
.toolbar .doc-count{color:#64748b;font-size:14px}
.btn{padding:8px 16px;border-radius:8px;border:none;cursor:pointer;font-size:13px;font-weight:600;transition:all .15s}
.btn-primary{background:#3b82f6;color:#fff}.btn-primary:hover{background:#2563eb}
.btn-danger{background:#ef4444;color:#fff}.btn-danger:hover{background:#dc2626}
.btn-secondary{background:#334155;color:#cbd5e1}.btn-secondary:hover{background:#475569}
.btn-sm{padding:5px 10px;font-size:12px}
.search-box{background:#1e293b;border:1px solid #334155;color:#e2e8f0;padding:8px 14px;border-radius:8px;font-size:13px;width:260px;outline:none}
.search-box:focus{border-color:#3b82f6}
table{width:100%;border-collapse:collapse;font-size:13px;background:#1e293b;border-radius:12px;overflow:hidden}
thead th{background:#334155;color:#94a3b8;text-align:left;padding:10px 14px;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.5px;position:sticky;top:0}
tbody td{padding:10px 14px;border-bottom:1px solid #1e293b20;color:#cbd5e1;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
tbody tr{background:#1e293b;transition:background .1s}
tbody tr:nth-child(even){background:#1e293b90}
tbody tr:hover{background:#334155}
.json-view{background:#0f172a;border:1px solid #334155;border-radius:12px;padding:20px;overflow:auto;max-height:70vh;font-family:'Cascadia Code','Fira Code',monospace;font-size:13px;line-height:1.6;white-space:pre-wrap;word-break:break-all}
.json-key{color:#60a5fa}.json-str{color:#34d399}.json-num{color:#fbbf24}.json-bool{color:#f472b6}.json-null{color:#64748b;font-style:italic}
.modal-bg{position:fixed;inset:0;background:#00000080;display:flex;align-items:center;justify-content:center;z-index:100}
.modal{background:#1e293b;border:1px solid #334155;border-radius:16px;width:700px;max-width:90vw;max-height:85vh;overflow-y:auto;padding:24px}
.modal h3{margin-bottom:16px;font-size:16px;color:#f1f5f9}
.empty{text-align:center;padding:60px;color:#64748b;font-size:15px}
.loading{text-align:center;padding:40px;color:#64748b}
.refresh-icon{display:inline-block;animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
</style>
</head>
<body>
<div class="header">
    <h1>🗄️ DB Viewer</h1>
    <span class="badge">mern-ecommerce</span>
    <span style="color:#64748b;font-size:13px;margin-left:auto">mongodb://localhost:27017</span>
</div>
<div class="container">
    <div class="sidebar" id="sidebar">
        <h3>Collections</h3>
        <div id="col-list"><div class="loading">Loading...</div></div>
    </div>
    <div class="main" id="main">
        <div class="empty">← Select a collection to view its documents</div>
    </div>
</div>
<script>
const API = '/api/db-viewer';
let currentCol = null;

async function loadCollections() {
    const res = await fetch(API + '/collections');
    const data = await res.json();
    const list = document.getElementById('col-list');
    list.innerHTML = '';
    data.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'col-btn' + (c.name === currentCol ? ' active' : '');
        btn.innerHTML = c.name + '<span class="count">' + c.count + '</span>';
        btn.onclick = () => loadDocuments(c.name);
        list.appendChild(btn);
    });
}

async function loadDocuments(name) {
    currentCol = name;
    loadCollections();
    const main = document.getElementById('main');
    main.innerHTML = '<div class="loading">Loading documents...</div>';
    const res = await fetch(API + '/collection/' + name);
    const docs = await res.json();
    
    if (!docs.length) { main.innerHTML = '<div class="empty">No documents in this collection</div>'; return; }

    const keys = [...new Set(docs.flatMap(d => Object.keys(d)))];
    const displayKeys = keys.slice(0, 8);

    let html = '<div class="toolbar"><h2>' + name + '</h2><span class="doc-count">' + docs.length + ' documents</span>';
    html += '<input class="search-box" placeholder="Search documents..." oninput="filterRows(this.value)">';
    html += '<button class="btn btn-secondary btn-sm" onclick="loadDocuments(\\'' + name + '\\')">↻ Refresh</button></div>';
    html += '<table><thead><tr>';
    displayKeys.forEach(k => html += '<th>' + k + '</th>');
    html += '<th>Actions</th></tr></thead><tbody id="doc-rows">';
    docs.forEach((doc, i) => {
        html += '<tr class="doc-row">';
        displayKeys.forEach(k => {
            let v = doc[k];
            if (v && typeof v === 'object') v = JSON.stringify(v).substring(0, 80) + '...';
            else if (v === null || v === undefined) v = '<span style="color:#64748b">null</span>';
            else v = String(v).substring(0, 60);
            html += '<td title="' + String(doc[k]).replace(/"/g, '&quot;') + '">' + v + '</td>';
        });
        html += '<td><button class="btn btn-primary btn-sm" onclick=\\'viewDoc(' + i + ')\\'>View</button></td></tr>';
    });
    html += '</tbody></table>';
    main.innerHTML = html;
    window._docs = docs;
}

function viewDoc(i) {
    const doc = window._docs[i];
    const modal = document.createElement('div');
    modal.className = 'modal-bg';
    modal.onclick = e => { if (e.target === modal) modal.remove(); };
    modal.innerHTML = '<div class="modal"><div style="display:flex;justify-content:space-between;align-items:center"><h3>Document Details</h3><button class="btn btn-secondary btn-sm" onclick="this.closest(\\'.modal-bg\\').remove()">✕ Close</button></div><div class="json-view">' + syntaxHighlight(JSON.stringify(doc, null, 2)) + '</div></div>';
    document.body.appendChild(modal);
}

function syntaxHighlight(json) {
    return json.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
        .replace(/: "([^"]*)"/g, ': <span class="json-str">"$1"</span>')
        .replace(/: (\\d+\\.?\\d*)/g, ': <span class="json-num">$1</span>')
        .replace(/: (true|false)/g, ': <span class="json-bool">$1</span>')
        .replace(/: null/g, ': <span class="json-null">null</span>');
}

function filterRows(q) {
    q = q.toLowerCase();
    document.querySelectorAll('.doc-row').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
}

loadCollections();
</script>
</body>
</html>`);
});

// GET /api/db-viewer/collections — list all collections with counts
router.get('/collections', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        const result = [];
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            result.push({ name: col.name, count });
        }
        result.sort((a, b) => a.name.localeCompare(b.name));
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/db-viewer/collection/:name — get documents from a collection
router.get('/collection/:name', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const docs = await db.collection(req.params.name)
            .find({})
            .sort({ _id: -1 })
            .limit(100)
            .toArray();
        res.json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
