:root{
  --bg:#0b1220;
  --bg2:#0f172a;
  --panel:#0b1730;
  --panel2:#0e1a36;
  --text:#e5e7eb;
  --muted:#94a3b8;
  --line:rgba(255,255,255,.08);
  --shadow: 0 12px 30px rgba(0,0,0,.35);

  --sidebar:#070f1f;
  --sidebar-hover:rgba(255,255,255,.06);

  --primary:#3b82f6;
  --secondary:#22c55e;
  --warning:#f59e0b;
  --danger:#ef4444;
  --dark:#111827;

  --radius:16px;
}

*{ box-sizing:border-box; }

html, body{ height:100%; }

body{
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  margin:0;
  background: radial-gradient(1100px 700px at 20% 10%, rgba(59,130,246,.18), transparent 60%),
              radial-gradient(900px 600px at 80% 30%, rgba(34,197,94,.12), transparent 55%),
              linear-gradient(180deg, var(--bg), var(--bg2));
  color:var(--text);
}

/* ===== Layout ===== */
.dashboard-container{ display:flex; height:100vh; }

/* Sidebar */
aside.sidebar{
  width:260px;
  background: linear-gradient(180deg, var(--sidebar), #050b18);
  color:var(--text);
  padding:18px 14px;
  border-right:1px solid var(--line);
  display:flex;
  flex-direction:column;
  gap:14px;
}

.brand{
  display:flex;
  gap:12px;
  align-items:center;
  padding:10px 10px;
  border-radius:14px;
  background: rgba(255,255,255,.03);
  border:1px solid var(--line);
}

.brand-logo{
  width:44px;
  height:44px;
  border-radius:14px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:800;
  letter-spacing:.5px;
  background: linear-gradient(135deg, rgba(59,130,246,.95), rgba(34,197,94,.85));
  box-shadow: 0 10px 20px rgba(0,0,0,.25);
  overflow:hidden;
}

.brand-text h2{
  margin:0;
  font-size:16px;
  line-height:1.1;
}

.brand-text .pro{
  font-size:11px;
  padding:2px 8px;
  border-radius:999px;
  background: rgba(59,130,246,.18);
  border:1px solid rgba(59,130,246,.35);
  margin-left:6px;
}

.small{ font-size:12px; }
.muted{ color:var(--muted); }

/* Menu */
aside.sidebar ul{
  list-style:none;
  padding:0;
  margin:0;
  display:flex;
  flex-direction:column;
  gap:6px;
}

aside.sidebar li{
  padding:11px 12px;
  cursor:pointer;
  border-radius:12px;
  border:1px solid transparent;
  background: transparent;
  transition: .15s ease;
  user-select:none;
}

aside.sidebar li:hover{
  background: var(--sidebar-hover);
  border-color: var(--line);
}

aside.sidebar li.active{
  background: rgba(59,130,246,.14);
  border-color: rgba(59,130,246,.35);
}

.sidebar-footer{
  margin-top:auto;
  padding:10px;
}

.pill{
  display:flex;
  gap:10px;
  align-items:center;
  padding:10px 12px;
  border-radius:999px;
  background: rgba(255,255,255,.03);
  border:1px solid var(--line);
}

.dot{
  width:8px;
  height:8px;
  border-radius:999px;
  background: var(--secondary);
  box-shadow: 0 0 0 4px rgba(34,197,94,.12);
}

/* Main */
main.main-content{
  flex:1;
  padding:18px;
  overflow-y:auto;
}

.topbar{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
  margin-bottom:14px;
  padding:14px 16px;
  border-radius: var(--radius);
  background: rgba(255,255,255,.03);
  border:1px solid var(--line);
  box-shadow: var(--shadow);
}

.topbar h1{
  margin:0;
  font-size:18px;
  letter-spacing:.2px;
}

.crumb{ margin-top:4px; }

.topbar-right{
  display:flex;
  align-items:end;
  gap:10px;
  flex-wrap:wrap;
}

.mode-box{
  display:flex;
  flex-direction:column;
  gap:6px;
  min-width:160px;
}

select, input, textarea{
  width:100%;
  padding:10px 12px;
  border-radius:12px;
  border:1px solid var(--line);
  outline:none;
  background: rgba(255,255,255,.03);
  color: var(--text);
}

input::placeholder, textarea::placeholder{
  color: rgba(148,163,184,.75);
}

textarea{
  min-height:90px;
  resize:vertical;
}

/* CORREÇÃO DAS OPTIONS DOS SELECTS */
select{
  appearance:auto;
  -webkit-appearance:auto;
  -moz-appearance:auto;
}

select option{
  background:#0f172a;
  color:#e5e7eb;
}

select:focus{
  border-color: rgba(59,130,246,.5);
  box-shadow: 0 0 0 2px rgba(59,130,246,.15);
}

.btn-logout{
  padding:11px 14px;
  border:none;
  border-radius:12px;
  background: rgba(239,68,68,.18);
  border:1px solid rgba(239,68,68,.35);
  color:var(--text);
  cursor:pointer;
  transition:.15s ease;
}
.btn-logout:hover{ transform: translateY(-1px); }

/* Quick cards */
.cards{
  display:flex;
  gap:12px;
  margin:14px 0 16px 0;
  flex-wrap:wrap;
}

.card{
  flex:1;
  min-width:220px;
  padding:16px;
  border-radius:16px;
  text-align:left;
  cursor:pointer;
  color:var(--text);
  user-select:none;
  border:1px solid var(--line);
  background: rgba(255,255,255,.03);
  box-shadow: var(--shadow);
  transition:.15s ease;
}
.card:hover{ transform: translateY(-2px); }

.card-title{ font-weight:800; font-size:14px; }
.card-sub{ margin-top:6px; opacity:.9; }

.btn-primary{ background: linear-gradient(135deg, rgba(59,130,246,.25), rgba(59,130,246,.08)); border-color: rgba(59,130,246,.35); }
.btn-secondary{ background: linear-gradient(135deg, rgba(34,197,94,.25), rgba(34,197,94,.08)); border-color: rgba(34,197,94,.35); }
.btn-dark{ background: linear-gradient(135deg, rgba(17,24,39,.7), rgba(17,24,39,.35)); border-color: rgba(255,255,255,.10); }

.panel{
  background: rgba(255,255,255,.03);
  border-radius: var(--radius);
  padding:16px;
  border:1px solid var(--line);
  box-shadow: var(--shadow);
  margin-bottom:14px;
}

h2{ margin:0 0 12px 0; font-size:16px; }
h3{ margin:0 0 10px 0; font-size:14px; }

.row{ display:flex; gap:12px; flex-wrap:wrap; }
.col{ flex:1; min-width:240px; }

.actions{
  display:flex;
  gap:10px;
  align-items:center;
  flex-wrap:wrap;
}

button{
  padding:10px 12px;
  border:none;
  border-radius:12px;
  cursor:pointer;
  color:var(--text);
  background: rgba(59,130,246,.20);
  border:1px solid rgba(59,130,246,.35);
  transition:.15s ease;
  line-height:1;
}
button:hover{ transform: translateY(-1px); }

.btn-green{ background: rgba(34,197,94,.20); border-color: rgba(34,197,94,.35); }
.btn-yellow{ background: rgba(245,158,11,.20); border-color: rgba(245,158,11,.35); }
.btn-red{ background: rgba(239,68,68,.20); border-color: rgba(239,68,68,.35); }
.btn-ghost{ background: rgba(255,255,255,.03); border-color: var(--line); }
.btn-soft{ background: rgba(255,255,255,.06); border-color: var(--line); }
.btn-whatsapp{
  background: rgba(34,197,94,.20);
  border-color: rgba(34,197,94,.45);
}

.hr{ height:1px; background: var(--line); margin:12px 0; }

/* Tables */
.table{
  width:100%;
  border-collapse:collapse;
  margin:10px 0;
  overflow:hidden;
  border-radius:14px;
}

.table th, .table td{
  border:1px solid var(--line);
  padding:10px;
  text-align:left;
  font-size:13px;
}

.table th{
  background: rgba(255,255,255,.04);
  color: var(--muted);
  font-weight:700;
}

/* History cards */
.history-item{
  padding:12px;
  background: rgba(255,255,255,.03);
  margin-bottom:10px;
  border-radius:16px;
  cursor:pointer;
  border:1px solid var(--line);
  display:flex;
  justify-content:space-between;
  gap:10px;
  align-items:center;
}
.history-item:hover{ background: rgba(255,255,255,.05); }

.badge{
  font-size:12px;
  padding:4px 10px;
  border-radius:999px;
  border:1px solid var(--line);
  background: rgba(255,255,255,.03);
  color: var(--muted);
  white-space:nowrap;
}
.badge.blue{ border-color: rgba(59,130,246,.35); color: rgba(147,197,253,.95); background: rgba(59,130,246,.10); }
.badge.green{ border-color: rgba(34,197,94,.35); color: rgba(134,239,172,.95); background: rgba(34,197,94,.10); }
.badge.yellow{ border-color: rgba(245,158,11,.35); color: rgba(253,230,138,.95); background: rgba(245,158,11,.10); }
.badge.red{ border-color: rgba(239,68,68,.35); color: rgba(252,165,165,.95); background: rgba(239,68,68,.10); }

/* Kanban */
.kanban{
  display:flex;
  gap:12px;
  margin-top:12px;
  align-items:flex-start;
  flex-wrap:wrap;
}

.column{
  background: rgba(255,255,255,.03);
  flex:1;
  min-width:240px;
  padding:12px;
  border-radius:18px;
  min-height:320px;
  border:1px solid var(--line);
}

.column h3, .column h2{
  text-align:left;
  margin:6px 0 10px 0;
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:8px;
}

.dropzone{ min-height:260px; }

.card-kanban{
  background: rgba(255,255,255,.03);
  padding:12px;
  margin-bottom:10px;
  border-radius:16px;
  cursor:grab;
  box-shadow: 0 8px 18px rgba(0,0,0,.25);
  border:1px solid var(--line);
}

.card-kanban .title{
  font-weight:800;
  margin-bottom:6px;
  font-size:13px;
}
.card-kanban .meta{
  font-size:12px;
  color: var(--muted);
}

.card-kanban .mini-actions{
  display:flex;
  gap:8px;
  margin-top:10px;
  flex-wrap:wrap;
}

/* Status columns */
.col-aguardando{ border-color: rgba(239,68,68,.25); }
.col-emservico{ border-color: rgba(245,158,11,.25); }
.col-finalizado{ border-color: rgba(59,130,246,.25); }
.col-entregue{ border-color: rgba(34,197,94,.25); }

.kpi-grid{
  display:grid;
  grid-template-columns: repeat(4, minmax(160px, 1fr));
  gap:12px;
}
@media(max-width: 1100px){
  .kpi-grid{ grid-template-columns: repeat(2, minmax(160px, 1fr)); }
}
@media(max-width: 700px){
  aside.sidebar{ width:220px; }
  .kpi-grid{ grid-template-columns: 1fr; }
}

.kpi{
  padding:14px;
  border-radius:18px;
  border:1px solid var(--line);
  background: rgba(255,255,255,.03);
  box-shadow: var(--shadow);
}
.kpi .kpi-label{ color: var(--muted); font-size:12px; }
.kpi .kpi-value{ font-size:22px; font-weight:900; margin-top:6px; }

.kpi.primary{ border-color: rgba(59,130,246,.35); }
.kpi.green{ border-color: rgba(34,197,94,.35); }
.kpi.yellow{ border-color: rgba(245,158,11,.35); }
.kpi.red{ border-color: rgba(239,68,68,.35); }

.logo-preview{
  width:120px;
  height:120px;
  border-radius:18px;
  border:1px solid var(--line);
  background: rgba(255,255,255,.03);
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
}
.logo-preview img{ width:100%; height:100%; object-fit:cover; }

.stepper{ display:flex; gap:10px; flex-wrap:wrap; }
.step{
  padding:8px 10px;
  border-radius:999px;
  border:1px solid var(--line);
  background: rgba(255,255,255,.03);
  color: var(--muted);
  font-size:12px;
}
.step.active{
  border-color: rgba(59,130,246,.35);
  color: rgba(147,197,253,.95);
  background: rgba(59,130,246,.10);
}

.preview-row{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  margin-top:10px;
}
.photo{
  width:120px;
  height:120px;
  border-radius:16px;
  border:1px solid var(--line);
  overflow:hidden;
  background: rgba(255,255,255,.03);
}
.photo img{ width:100%; height:100%; object-fit:cover; }

.stock-suggest{
  padding:10px 12px;
  border:1px solid var(--line);
  border-radius:12px;
  background: rgba(255,255,255,.03);
  cursor:pointer;
}
.stock-suggest:hover{
  background: rgba(255,255,255,.05);
}

.calendar-day{
  padding:12px;
  border:1px solid var(--line);
  border-radius:16px;
  background: rgba(255,255,255,.03);
  margin-bottom:10px;
}

.calendar-day h3{
  margin-bottom:8px;
}

/* Pequena correção pra botões dentro de cards não estourarem */
.card-kanban button{ padding:9px 10px; }
