// BoxControl PRO - script.js
// =====================================================

// ===== Helpers Storage =====
function getLS(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function setLS(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function uid(prefix="id") { return `${prefix}-${Date.now()}-${Math.floor(Math.random()*100000)}`; }

function money(n){
  const v = Number(n || 0);
  return v.toFixed(2);
}

function monthKeyFromISO(iso){
  if(!iso) return "";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  return `${y}-${m}`;
}
function niceMonthLabel(key){
  if(!key) return "";
  const [y,m] = key.split("-");
  return `${m}/${y}`;
}
function todayISO(){ return new Date().toISOString(); }
function normalizePhoneBR(phone=""){ return String(phone).replace(/\D/g, ""); }
function toWhatsAppUrl(phone="", text=""){
  const digits = normalizePhoneBR(phone);
  if(!digits) return "";
  return `https://wa.me/55${digits}?text=${encodeURIComponent(text)}`;
}

// ===== Dados base =====
const marcas = {
  "Chevrolet": ["Onix","Tracker","S10","Cruze","Spin","Camaro","Blazer"],
  "Ford": ["Ka","EcoSport","Ranger","Fusion","Edge","Mustang"],
  "Volkswagen": ["Gol","Polo","Virtus","T-Cross","Nivus","Jetta","Golf","Passat"],
  "Fiat": ["Uno","Mobi","Argo","Cronos","Toro","Strada","Punto","Fiorino"],
  "Toyota": ["Corolla","Yaris","Hilux","SW4","Etios","Prius","RAV4"],
  "Honda": ["Civic","Fit","HR-V","WR-V","CR-V","City","Accord"],
  "Renault": ["Kwid","Sandero","Logan","Duster","Captur","Stepway","Fluence"],
  "Hyundai": ["HB20","Creta","Tucson","Azera","Santa Fe","i30"],
  "Nissan": ["March","Versa","Kicks","Frontier","Sentra","Leaf","GT-R"],
  "Jeep": ["Renegade","Compass","Wrangler","Cherokee","Grand Cherokee"],
  "BMW": ["Série 1","Série 3","Série 5","X1","X3","X5","X6","X7"],
  "Mercedes-Benz": ["A-Class","C-Class","E-Class","S-Class","GLA","GLC","GLE","GLS"],
  "Audi": ["A1","A3","A4","A5","A6","Q3","Q5","Q7","Q8"],
  "Land Rover": ["Defender","Discovery","Range Rover","Evoque"],
  "Volvo": ["XC40","XC60","XC90","S60","S90"],
  "Porsche": ["911","Cayenne","Macan","Panamera","Taycan"]
};

// ===== UI Base =====
const contentArea = document.getElementById("content-area");
const topbarTitle = document.getElementById("topbarTitle");
const topbarCrumb = document.getElementById("topbarCrumb");
const quickCards = document.getElementById("quickCards");
const modeSelect = document.getElementById("modeSelect");
const funcSelectWrap = document.getElementById("funcSelectWrap");
const funcSelect = document.getElementById("funcSelect");

document.getElementById("btnLogout")?.addEventListener("click", () => {
  alert("Logout simulado 😄");
});

// Menu
const menuItems = document.querySelectorAll(".menu-item");
menuItems.forEach(item => item.addEventListener("click", () => loadPage(item.dataset.page)));
document.querySelectorAll(".card").forEach(card => card.addEventListener("click", () => loadPage(card.dataset.action)));

// ===== Modo (Admin / Funcionário) =====
function getAppMode(){ return getLS("app_mode", { mode:"admin", funcionarioId:"" }); }
function setAppMode(obj){ setLS("app_mode", obj); }

function refreshFuncSelect(){
  const funcs = getLS("funcionarios", []);
  funcSelect.innerHTML = `<option value="">Selecione</option>` + funcs.map(f => `<option value="${f.id}">${f.nome}</option>`).join("");
}

function applyModeUI(){
  const m = getAppMode();
  modeSelect.value = m.mode || "admin";

  if(m.mode === "funcionario"){
    funcSelectWrap.style.display = "flex";
    refreshFuncSelect();
    funcSelect.value = m.funcionarioId || "";
    quickCards.style.display = "none";
    loadPage("painel-funcionario");
  }else{
    funcSelectWrap.style.display = "none";
    quickCards.style.display = "flex";
  }
}

modeSelect.addEventListener("change", () => {
  const m = getAppMode();
  m.mode = modeSelect.value;
  if(m.mode !== "funcionario") m.funcionarioId = "";
  setAppMode(m);
  applyModeUI();
  if(m.mode !== "funcionario") loadPage("dashboard");
});

funcSelect.addEventListener("change", () => {
  const m = getAppMode();
  m.funcionarioId = funcSelect.value || "";
  setAppMode(m);
  loadPage("painel-funcionario");
});

// ===== Selects Marca/Modelo/Ano =====
function gerarSelectMarcas(selected="", idAttr="selectMarca") {
  let opts = `<option value="">Selecione a Marca</option>`;
  Object.keys(marcas).forEach(m => {
    const sel = (m === selected) ? "selected" : "";
    opts += `<option value="${m}" ${sel}>${m}</option>`;
  });
  return `<select id="${idAttr}" required>${opts}</select>`;
}
function gerarSelectModelo(selected="", marca="", idAttr="selectModelo") {
  let opts = `<option value="">Selecione o Modelo</option>`;
  if(marca && marcas[marca]){
    marcas[marca].forEach(modelo => {
      const sel = (modelo === selected) ? "selected" : "";
      opts += `<option value="${modelo}" ${sel}>${modelo}</option>`;
    });
  }
  return `<select id="${idAttr}" required>${opts}</select>`;
}
function gerarSelectAno(selected="", idAttr="selectAno") {
  const anoAtual = new Date().getFullYear();
  let opts = `<option value="">Selecione o Ano</option>`;
  for (let a = anoAtual; a >= 1980; a--) {
    const sel = (String(a) === String(selected)) ? "selected" : "";
    opts += `<option value="${a}" ${sel}>${a}</option>`;
  }
  return `<select id="${idAttr}" required>${opts}</select>`;
}
function bindMarcaModelo(marcaId="selectMarca", modeloId="selectModelo") {
  const selectMarca = document.getElementById(marcaId);
  const selectModelo = document.getElementById(modeloId);
  if (!selectMarca || !selectModelo) return;

  selectMarca.addEventListener("change", () => {
    const marca = selectMarca.value;
    selectModelo.innerHTML = `<option value="">Selecione o Modelo</option>`;
    if (marca && marcas[marca]) {
      marcas[marca].forEach(modelo => {
        selectModelo.innerHTML += `<option value="${modelo}">${modelo}</option>`;
      });
    }
  });
}

// ===== Empresa =====
function getEmpresa(){
  return getLS("empresa", { nome:"", cnpj:"", telefone:"", endereco:"", logoDataUrl:"" });
}
function setEmpresa(obj){
  setLS("empresa", obj);
  const mini = document.getElementById("brandLogoMini");
  if(mini){
    if(obj.logoDataUrl){
      mini.textContent = "";
      mini.style.backgroundImage = `url(${obj.logoDataUrl})`;
      mini.style.backgroundSize = "cover";
      mini.style.backgroundPosition = "center";
    }else{
      mini.style.backgroundImage = "";
      mini.textContent = "BC";
    }
  }
}

// ===== Ordens e Histórico =====
function getOrdens(){ return getLS("ordens", []); }
function setOrdens(arr){ setLS("ordens", arr); }
function getHistorico(){ return getLS("historico", []); }
function setHistorico(arr){ setLS("historico", arr); }

// ===== Clientes =====
function getClientes(){ return getLS("clientes", []); }
function setClientes(arr){ setLS("clientes", arr); }

function upsertCliente(cliente){
  const arr = getClientes();
  const idx = arr.findIndex(c => c.id === cliente.id);
  if(idx >= 0) arr[idx] = cliente; else arr.push(cliente);
  setClientes(arr);
}

function attachChecklistToCliente(clienteId, checklistObj){
  const arr = getClientes();
  const idx = arr.findIndex(c => c.id === clienteId);
  if(idx < 0) return;
  arr[idx].checklists = arr[idx].checklists || [];
  arr[idx].checklists.unshift(checklistObj);
  setClientes(arr);
}

function attachServicoToCliente(clienteId, osObj){
  const arr = getClientes();
  const idx = arr.findIndex(c => c.id === clienteId);
  if(idx < 0) return;
  arr[idx].servicos = arr[idx].servicos || [];

  if(!arr[idx].servicos.some(s => s.id === osObj.id)){
    arr[idx].servicos.unshift({
      id: osObj.id,
      dataHora: osObj.dataHora,
      status: osObj.status,
      placa: osObj.placa,
      marca: osObj.marca,
      modelo: osObj.modelo,
      ano: osObj.ano,
      total: osObj.total
    });
  }else{
    arr[idx].servicos = arr[idx].servicos.map(s => s.id === osObj.id
      ? ({...s, status: osObj.status, total: osObj.total})
      : s
    );
  }
  setClientes(arr);
}

function updateServicoStatusCliente(clienteId, osId, status, total){
  const arr = getClientes();
  const idx = arr.findIndex(c => c.id === clienteId);
  if(idx < 0) return;
  arr[idx].servicos = arr[idx].servicos || [];
  arr[idx].servicos = arr[idx].servicos.map(s => s.id === osId
    ? ({...s, status, total: (total ?? s.total)})
    : s
  );
  setClientes(arr);
}

function removeServicoFromCliente(clienteId, osId){
  const arr = getClientes();
  const idx = arr.findIndex(c => c.id === clienteId);
  if(idx < 0) return;
  arr[idx].servicos = (arr[idx].servicos || []).filter(s => s.id !== osId);
  setClientes(arr);
}

// ===== Funcionários =====
function getFuncionarios(){ return getLS("funcionarios", []); }
function setFuncionarios(arr){ setLS("funcionarios", arr); }

// ===== Estoque =====
function getEstoque(){ return getLS("estoque", []); }
function setEstoque(arr){ setLS("estoque", arr); }
function upsertEstoque(item){
  const arr = getEstoque();
  const idx = arr.findIndex(i => i.id === item.id);
  if(idx >= 0) arr[idx] = item; else arr.push(item);
  setEstoque(arr);
}

// ===== Boletos =====
function getBoletos(){ return getLS("boletos", []); }
function setBoletos(arr){ setLS("boletos", arr); }
function upsertBoleto(boleto){
  const arr = getBoletos();
  const idx = arr.findIndex(b => b.id === boleto.id);
  if(idx >= 0) arr[idx] = boleto; else arr.push(boleto);
  setBoletos(arr);
}

// =====================================================
// ESTOQUE - HELPERS NOVOS
// =====================================================
function getStockUsageMap(itens=[]){
  const usage = {};
  (itens || []).forEach(item=>{
    if(!item.estoqueId) return;
    usage[item.estoqueId] = (usage[item.estoqueId] || 0) + Number(item.qtd || 0);
  });
  return usage;
}

function applyStockDiff(oldItens=[], newItens=[]){
  const estoque = getEstoque();
  const oldUsage = getStockUsageMap(oldItens);
  const newUsage = getStockUsageMap(newItens);

  const ids = Array.from(new Set([...Object.keys(oldUsage), ...Object.keys(newUsage)]));

  for(const id of ids){
    const idx = estoque.findIndex(p=>p.id===id);
    if(idx < 0) continue;

    const oldQty = Number(oldUsage[id] || 0);
    const newQty = Number(newUsage[id] || 0);
    const delta = newQty - oldQty;

    if(delta > 0){
      if(Number(estoque[idx].quantidade || 0) < delta){
        return {
          ok:false,
          msg:`Estoque insuficiente para "${estoque[idx].nome}". Disponível: ${estoque[idx].quantidade}`
        };
      }
    }
  }

  ids.forEach(id=>{
    const idx = estoque.findIndex(p=>p.id===id);
    if(idx < 0) return;

    const oldQty = Number(oldUsage[id] || 0);
    const newQty = Number(newUsage[id] || 0);
    const delta = newQty - oldQty;

    if(delta > 0){
      estoque[idx].quantidade = Number(estoque[idx].quantidade || 0) - delta;
    }else if(delta < 0){
      estoque[idx].quantidade = Number(estoque[idx].quantidade || 0) + Math.abs(delta);
    }
  });

  setEstoque(estoque);
  return { ok:true };
}

function baixarEstoqueDaOS(itens=[]){
  return applyStockDiff([], itens);
}

function devolverEstoqueDaOS(itens=[]){
  return applyStockDiff(itens, []);
}

// =====================================================
// EXCLUIR (Cliente / OS)
// =====================================================
function excluirCliente(clienteId){
  const clientes = getClientes();
  const cli = clientes.find(c=>c.id===clienteId);
  if(!cli) return;

  const ok = confirm(
    `Excluir o cliente "${cli.cliente}"?\n\n` +
    `Isso também excluirá TODAS as OS ativas e entregues deste cliente.`
  );
  if(!ok) return;

  let ordens = getOrdens();
  const ordensCliente = ordens.filter(o=>o.clienteId === clienteId);
  ordensCliente.forEach(os => devolverEstoqueDaOS(os.itens || []));
  ordens = ordens.filter(o=>o.clienteId !== clienteId);
  setOrdens(ordens);

  let hist = getHistorico();
  hist = hist.filter(o=>o.clienteId !== clienteId);
  setHistorico(hist);

  const novos = clientes.filter(c=>c.id !== clienteId);
  setClientes(novos);

  alert("Cliente e OS vinculadas foram excluídos ✅");
  loadPage("clientes");
}

function excluirOS(osId){
  const found = findOSAnywhere(osId);
  if(!found.os) return alert("OS não encontrada.");

  const os = found.os;

  const ok = confirm(
    `Excluir a OS "${osId}"?\n\n` +
    `Cliente: ${os.clienteNome}\nPlaca: ${os.placa}\nStatus: ${os.status}`
  );
  if(!ok) return;

  if(found.from === "ordens"){
    devolverEstoqueDaOS(os.itens || []);
    const ordens = getOrdens().filter(o=>o.id !== osId);
    setOrdens(ordens);
  }else if(found.from === "historico"){
    const hist = getHistorico().filter(o=>o.id !== osId);
    setHistorico(hist);
  }

  removeServicoFromCliente(os.clienteId, osId);

  alert("OS excluída ✅");
  const m = getAppMode();
  if(m.mode === "funcionario") renderPainelFuncionario();
  else loadPage("carros-servico");
}

// =====================================================
// Páginas / Navegação
// =====================================================
function setActiveMenu(page){
  menuItems.forEach(m => {
    if(m.dataset.page === page) m.classList.add("active");
    else m.classList.remove("active");
  });
}

function loadPage(page) {
  const m = getAppMode();
  if(m.mode === "funcionario" && page !== "painel-funcionario"){
    page = "painel-funcionario";
  }

  switch (page) {
    case "dashboard":
      setActiveMenu("dashboard");
      renderDashboard();
      break;

    case "clientes":
      setActiveMenu("clientes");
      renderClientes();
      break;

    case "ordem-servico":
    case "nova-ordem":
      setActiveMenu("ordem-servico");
      renderOrdemServico();
      break;

    case "checklist":
      setActiveMenu("checklist");
      renderChecklistGuiado();
      break;

    case "carros-servico":
      setActiveMenu("carros-servico");
      renderCarrosEmServico();
      break;

    case "estoque":
      setActiveMenu("estoque");
      renderEstoque();
      break;

    case "boletos":
      setActiveMenu("boletos");
      renderBoletos();
      break;

    case "funcionarios":
      setActiveMenu("funcionarios");
      renderFuncionarios();
      break;

    case "historico":
      setActiveMenu("historico");
      renderHistoricoFinanceiro();
      break;

    case "minha-empresa":
      setActiveMenu("minha-empresa");
      renderMinhaEmpresa();
      break;

    case "painel-funcionario":
      setActiveMenu("funcionarios");
      renderPainelFuncionario();
      break;

    default:
      setActiveMenu("dashboard");
      renderDashboard();
  }
}

// =====================================================
// DASHBOARD
// =====================================================
function computeKPIs(){
  const ordens = getOrdens();
  const hist = getHistorico();

  const aguardando = ordens.filter(o => o.status === "Aguardando").length;
  const emServico = ordens.filter(o => o.status === "Em Serviço").length;
  const finalizado = ordens.filter(o => o.status === "Finalizado").length;
  const entregue = hist.length;
  const brutoEntregue = hist.reduce((acc,o)=> acc + Number(o.total||0), 0);

  return { aguardando, emServico, finalizado, entregue, brutoEntregue };
}

function renderDashboard(){
  topbarTitle.textContent = "Dashboard";
  topbarCrumb.textContent = "Métricas da empresa e visão geral";

  const k = computeKPIs();

  contentArea.innerHTML = `
    <div class="panel">
      <h2>Visão Geral</h2>
      <div class="kpi-grid">
        <div class="kpi red">
          <div class="kpi-label">Carros Aguardando</div>
          <div class="kpi-value">${k.aguardando}</div>
        </div>
        <div class="kpi yellow">
          <div class="kpi-label">Carros Em Serviço</div>
          <div class="kpi-value">${k.emServico}</div>
        </div>
        <div class="kpi primary">
          <div class="kpi-label">Carros Finalizados</div>
          <div class="kpi-value">${k.finalizado}</div>
        </div>
        <div class="kpi green">
          <div class="kpi-label">Carros Entregues</div>
          <div class="kpi-value">${k.entregue}</div>
        </div>
      </div>

      <div class="hr"></div>

      <div class="row">
        <div class="col">
          <div class="kpi primary">
            <div class="kpi-label">Bruto total (Entregues)</div>
            <div class="kpi-value">R$ ${money(k.brutoEntregue)}</div>
          </div>
        </div>
        <div class="col">
          <div class="panel" style="margin:0;">
            <h3>Ações rápidas</h3>
            <div class="actions">
              <button class="btn-green" id="dashGoOS">+ Nova OS</button>
              <button class="btn-ghost" id="dashGoClientes">Clientes</button>
              <button class="btn-ghost" id="dashGoKanban">Kanban</button>
              <button class="btn-ghost" id="dashGoEstoque">Estoque</button>
              <button class="btn-ghost" id="dashGoBoletos">Boletos</button>
            </div>
            <p class="small muted" style="margin-top:10px;">Finalize e entregue pelo Kanban para alimentar o Histórico/Financeiro.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("dashGoOS").addEventListener("click", ()=>loadPage("ordem-servico"));
  document.getElementById("dashGoClientes").addEventListener("click", ()=>loadPage("clientes"));
  document.getElementById("dashGoKanban").addEventListener("click", ()=>loadPage("carros-servico"));
  document.getElementById("dashGoEstoque").addEventListener("click", ()=>loadPage("estoque"));
  document.getElementById("dashGoBoletos").addEventListener("click", ()=>loadPage("boletos"));
}

// =====================================================
// CLIENTES
// =====================================================
function renderClientes(){
  topbarTitle.textContent = "Clientes";
  topbarCrumb.textContent = "Cadastrar, buscar e ver histórico do cliente";

  contentArea.innerHTML = `
    <div class="panel">
      <h2>Buscar / Cadastrar Cliente</h2>
      <div class="row">
        <div class="col">
          <label class="small muted">Buscar (nome / placa / telefone / CPF)</label>
          <input type="text" id="cliBusca" placeholder="Digite para buscar..." />
        </div>
        <div class="col actions" style="align-items:flex-end;">
          <button class="btn-green" id="btnNovoCliente">+ Cadastrar Cliente</button>
        </div>
      </div>
    </div>

    <div class="panel">
      <h2>Lista de Clientes</h2>
      <div id="cliList"></div>
    </div>

    <div id="cliDetails"></div>
  `;

  function drawList(filter=""){
    const wrap = document.getElementById("cliList");
    const f = filter.trim().toLowerCase();
    const clientes = getClientes();

    const list = clientes
      .filter(c => {
        if(!f) return true;
        return (
          (c.cliente||"").toLowerCase().includes(f) ||
          (c.telefone||"").toLowerCase().includes(f) ||
          (c.placa||"").toLowerCase().includes(f) ||
          (c.cpf||"").toLowerCase().includes(f)
        );
      })
      .sort((a,b)=> (a.cliente||"").localeCompare(b.cliente||""));

    if(list.length === 0){
      wrap.innerHTML = `<p class="small muted">Nenhum cliente encontrado.</p>`;
      return;
    }

    wrap.innerHTML = list.map(c => `
      <div class="history-item" data-id="${c.id}">
        <div>
          <div style="font-weight:800">${c.cliente}</div>
          <div class="small muted">Placa: ${c.placa || "-"} • Tel: ${c.telefone || "-"} • CPF: ${c.cpf || "-"} • ${c.marca || "-"} ${c.modelo || ""} ${c.ano || ""}</div>
        </div>
        <span class="badge blue">Ver</span>
      </div>
    `).join("");

    wrap.querySelectorAll(".history-item").forEach(div=>{
      div.addEventListener("click", ()=>showCliente(div.dataset.id));
    });
  }

  function showCliente(id){
    const cli = getClientes().find(c=>c.id===id);
    if(!cli) return;

    const servicos = (cli.servicos || []).slice();
    const checklists = (cli.checklists || []).slice();

    const servHtml = servicos.length ? servicos.map(s=>`
      <div class="history-item" data-os="${s.id}">
        <div>
          <div style="font-weight:800">${s.marca || ""} ${s.modelo || ""} • ${s.placa || "-"}</div>
          <div class="small muted">${s.dataHora || "-"} • Status: ${s.status || "-"} • Total: R$ ${money(s.total)}</div>
        </div>
        <div class="actions" style="gap:8px;">
          <span class="badge">${s.status || "-"}</span>
          <button class="btn-ghost btnEditOS" data-osid="${s.id}" type="button">Editar OS</button>
          <button class="btn-red btnDelOS" data-osid="${s.id}" type="button">Excluir OS</button>
        </div>
      </div>
    `).join("") : `<p class="small muted">Nenhum serviço registrado para este cliente.</p>`;

    const chkHtml = checklists.length ? checklists.map(ch=>`
      <div class="history-item" data-checkid="${ch.id}">
        <div>
          <div style="font-weight:800">Checklist • ${ch.dataHora || "-"}</div>
          <div class="small muted">${ch.obs ? "Obs: " + ch.obs : "Sem observações"} • Fotos: ${(ch.fotos||[]).length}</div>
        </div>
        <div class="actions">
          <span class="badge green">OK</span>
          <button class="btn-whatsapp btnSendChk" data-checkid="${ch.id}" type="button">WhatsApp</button>
        </div>
      </div>
    `).join("") : `<p class="small muted">Nenhum checklist salvo para este cliente.</p>`;

    document.getElementById("cliDetails").innerHTML = `
      <div class="panel">
        <h2>Cliente: ${cli.cliente}</h2>
        <div class="row">
          <div class="col">
            <div class="small muted">Contato</div>
            <div style="margin-top:6px;">Tel: <b>${cli.telefone || "-"}</b></div>
            <div>CPF: <b>${cli.cpf || "-"}</b></div>
            <div>Endereço: <b>${cli.endereco || "-"}</b></div>
          </div>
          <div class="col">
            <div class="small muted">Veículo</div>
            <div style="margin-top:6px;">Placa: <b>${cli.placa || "-"}</b> • Cor: <b>${cli.cor || "-"}</b></div>
            <div><b>${cli.marca || "-"}</b> ${cli.modelo || ""} ${cli.ano || ""}</div>
          </div>
        </div>

        <div class="actions" style="margin-top:12px;">
          <button class="btn-ghost" id="btnEditCli" type="button">Editar Cliente</button>
          <button class="btn-ghost" id="btnNovaOSCli" type="button">Criar OS</button>
          <button class="btn-ghost" id="btnChecklistCli" type="button">Checklist</button>
          <button class="btn-red" id="btnExcluirCliente" type="button">Excluir Cliente</button>
        </div>

        <div class="hr"></div>

        <h3>Serviços</h3>
        ${servHtml}

        <div class="hr"></div>

        <h3>Checklists</h3>
        ${chkHtml}
      </div>
    `;

    document.getElementById("btnEditCli").addEventListener("click", ()=>renderClienteForm(cli));
    document.getElementById("btnNovaOSCli").addEventListener("click", ()=>{ renderOrdemServico({ preClienteId: cli.id }); });
    document.getElementById("btnChecklistCli").addEventListener("click", ()=>{ renderChecklistGuiado({ preClienteId: cli.id }); });
    document.getElementById("btnExcluirCliente").addEventListener("click", ()=>excluirCliente(cli.id));

    document.querySelectorAll("#cliDetails .history-item[data-os]").forEach(d=>{
      d.addEventListener("click", ()=>abrirDetalhesOS(d.dataset.os));
    });

    document.querySelectorAll("#cliDetails .btnDelOS").forEach(btn=>{
      btn.addEventListener("click", (e)=>{
        e.stopPropagation();
        excluirOS(btn.dataset.osid);
      });
    });

    document.querySelectorAll("#cliDetails .btnEditOS").forEach(btn=>{
      btn.addEventListener("click", (e)=>{
        e.stopPropagation();
        renderEditarOS(btn.dataset.osid);
      });
    });

    document.querySelectorAll("#cliDetails .btnSendChk").forEach(btn=>{
      btn.addEventListener("click", (e)=>{
        e.stopPropagation();
        enviarChecklistWhatsApp(cli.id, btn.dataset.checkid);
      });
    });
  }

  document.getElementById("cliBusca").addEventListener("input", (e)=> drawList(e.target.value));
  document.getElementById("btnNovoCliente").addEventListener("click", ()=>renderClienteForm(null));

  drawList("");
}

function renderClienteForm(cli){
  topbarTitle.textContent = cli ? "Editar Cliente" : "Cadastrar Cliente";
  topbarCrumb.textContent = "Dados do cliente e veículo";

  const c = cli || {
    id: uid("cli"),
    cliente:"", endereco:"", telefone:"", cpf:"",
    placa:"", cor:"",
    marca:"", modelo:"", ano:"",
    servicos: [], checklists: []
  };

  contentArea.innerHTML = `
    <div class="panel">
      <h2>${cli ? "Editar Cliente" : "Novo Cliente"}</h2>
      <form id="formClientePro">
        <div class="row">
          <div class="col">
            <label class="small muted">Nome do Cliente</label>
            <input type="text" id="c_nome" value="${c.cliente}" required />
          </div>
          <div class="col">
            <label class="small muted">Telefone</label>
            <input type="tel" id="c_tel" value="${c.telefone}" required />
          </div>
        </div>

        <div class="row">
          <div class="col">
            <label class="small muted">CPF</label>
            <input type="text" id="c_cpf" value="${c.cpf || ""}" placeholder="000.000.000-00" />
          </div>
          <div class="col">
            <label class="small muted">Endereço</label>
            <input type="text" id="c_endereco" value="${c.endereco}" required />
          </div>
        </div>

        <div class="row">
          <div class="col">
            <label class="small muted">Placa</label>
            <input type="text" id="c_placa" value="${c.placa}" required />
          </div>
          <div class="col">
            <label class="small muted">Cor</label>
            <input type="text" id="c_cor" value="${c.cor}" required />
          </div>
        </div>

        <div class="row">
          <div class="col">
            <label class="small muted">Marca</label>
            ${gerarSelectMarcas(c.marca, "selectMarcaCliente")}
          </div>
          <div class="col">
            <label class="small muted">Modelo</label>
            ${gerarSelectModelo(c.modelo, c.marca, "selectModeloCliente")}
          </div>
          <div class="col">
            <label class="small muted">Ano</label>
            ${gerarSelectAno(c.ano, "selectAnoCliente")}
          </div>
        </div>

        <div class="actions" style="margin-top:12px;">
          <button type="submit" class="btn-green">Salvar</button>
          <button type="button" class="btn-ghost" id="btnVoltarClientes">Voltar</button>
          ${cli ? `<button type="button" class="btn-red" id="btnExcluirClienteForm">Excluir Cliente</button>` : ``}
        </div>
      </form>
    </div>
  `;

  bindMarcaModelo("selectMarcaCliente", "selectModeloCliente");

  document.getElementById("btnVoltarClientes").addEventListener("click", ()=>loadPage("clientes"));

  if(cli){
    document.getElementById("btnExcluirClienteForm").addEventListener("click", ()=>excluirCliente(cli.id));
  }

  document.getElementById("formClientePro").addEventListener("submit", (e)=>{
    e.preventDefault();

    const novo = {
      ...c,
      cliente: document.getElementById("c_nome").value.trim(),
      endereco: document.getElementById("c_endereco").value.trim(),
      telefone: document.getElementById("c_tel").value.trim(),
      cpf: document.getElementById("c_cpf").value.trim(),
      placa: document.getElementById("c_placa").value.trim().toUpperCase(),
      cor: document.getElementById("c_cor").value.trim(),
      marca: document.getElementById("selectMarcaCliente").value,
      modelo: document.getElementById("selectModeloCliente").value,
      ano: document.getElementById("selectAnoCliente").value,
    };

    upsertCliente(novo);
    alert("Cliente salvo!");
    loadPage("clientes");
  });
}

// =====================================================
// MINHA EMPRESA
// =====================================================
function renderMinhaEmpresa(){
  topbarTitle.textContent = "Minha Empresa";
  topbarCrumb.textContent = "Dados da empresa e logotipo para PDFs";

  const emp = getEmpresa();

  contentArea.innerHTML = `
    <div class="panel">
      <h2>Dados da Empresa</h2>

      <div class="row">
        <div class="col">
          <label class="small muted">Nome da empresa</label>
          <input type="text" id="e_nome" value="${emp.nome || ""}" placeholder="Ex: Motocar Multimarcas" />
        </div>
        <div class="col">
          <label class="small muted">CNPJ</label>
          <input type="text" id="e_cnpj" value="${emp.cnpj || ""}" placeholder="00.000.000/0000-00" />
        </div>
      </div>

      <div class="row">
        <div class="col">
          <label class="small muted">Telefone</label>
          <input type="text" id="e_tel" value="${emp.telefone || ""}" placeholder="(43) 99999-9999" />
        </div>
        <div class="col">
          <label class="small muted">Endereço</label>
          <input type="text" id="e_end" value="${emp.endereco || ""}" placeholder="Rua, número, cidade" />
        </div>
      </div>

      <div class="hr"></div>

      <div class="row">
        <div class="col">
          <h3>Logotipo</h3>
          <div class="actions">
            <input type="file" id="e_logo" accept="image/*" />
            <button class="btn-red" id="btnRemoveLogo" type="button">Remover Logo</button>
          </div>
          <p class="small muted" style="margin-top:8px;">A logo será aplicada no topo do PDF (quando existir).</p>
        </div>
        <div class="col" style="display:flex; justify-content:flex-end;">
          <div class="logo-preview" id="logoPreview">
            ${emp.logoDataUrl ? `<img src="${emp.logoDataUrl}" alt="logo" />` : `<span class="small muted">Sem logo</span>`}
          </div>
        </div>
      </div>

      <div class="actions" style="margin-top:14px;">
        <button class="btn-green" id="btnSaveEmpresa" type="button">Salvar</button>
      </div>
    </div>
  `;

  document.getElementById("btnSaveEmpresa").addEventListener("click", ()=>{
    const novo = {
      nome: document.getElementById("e_nome").value.trim(),
      cnpj: document.getElementById("e_cnpj").value.trim(),
      telefone: document.getElementById("e_tel").value.trim(),
      endereco: document.getElementById("e_end").value.trim(),
      logoDataUrl: getEmpresa().logoDataUrl || ""
    };
    setEmpresa(novo);
    alert("Dados da empresa salvos!");
  });

  document.getElementById("btnRemoveLogo").addEventListener("click", ()=>{
    const emp2 = getEmpresa();
    emp2.logoDataUrl = "";
    setEmpresa(emp2);
    document.getElementById("logoPreview").innerHTML = `<span class="small muted">Sem logo</span>`;
  });

  document.getElementById("e_logo").addEventListener("change", (e)=>{
    const file = e.target.files?.[0];
    if(!file) return;

    const r = new FileReader();
    r.onload = () => {
      const emp2 = getEmpresa();
      emp2.logoDataUrl = r.result;
      setEmpresa(emp2);
      document.getElementById("logoPreview").innerHTML = `<img src="${emp2.logoDataUrl}" alt="logo" />`;
    };
    r.readAsDataURL(file);
  });
}

// =====================================================
// FUNCIONÁRIOS
// =====================================================
function renderFuncionarios() {
  topbarTitle.textContent = "Funcionários";
  topbarCrumb.textContent = "Cadastrar e visualizar distribuição de OS";

  const funcionarios = getFuncionarios();
  const osList = getOrdens();

  contentArea.innerHTML = `
    <div class="panel">
      <h2>Funcionários</h2>
      <div class="actions">
        <button id="btnAddFuncionario" class="btn-green" type="button">+ Cadastrar Funcionário</button>
        <button id="btnAbrirPainelFunc" class="btn-ghost" type="button">Abrir Painel Funcionário</button>
        <span class="small muted">Arraste OS entre funcionários para trocar responsável.</span>
      </div>
    </div>

    <div class="panel">
      <h2>Kanban por Funcionário</h2>
      <div id="funcBoard"></div>
    </div>
  `;

  document.getElementById("btnAddFuncionario").addEventListener("click", () => {
    const nome = prompt("Nome do funcionário:");
    if (!nome) return;

    const arr = getFuncionarios();
    arr.push({ id: uid("fun"), nome: nome.trim() });
    setFuncionarios(arr);

    refreshFuncSelect();
    renderFuncionarios();
  });

  document.getElementById("btnAbrirPainelFunc").addEventListener("click", ()=>{
    const m = getAppMode();
    m.mode = "funcionario";
    setAppMode(m);
    applyModeUI();
  });

  const board = document.getElementById("funcBoard");
  if (funcionarios.length === 0) {
    board.innerHTML = `<p class="small muted">Nenhum funcionário cadastrado. Clique em “Cadastrar Funcionário”.</p>`;
    return;
  }

  const columnsHtml = funcionarios.map(f => `
    <div class="column" data-func="${f.id}">
      <h3>${f.nome} <span class="badge blue">${osList.filter(o=>o.funcionarioId===f.id).length}</span></h3>
      <div class="dropzone" data-func="${f.id}"></div>
    </div>
  `).join("");

  board.innerHTML = `<div class="kanban" id="kanbanFuncionarios">${columnsHtml}</div>`;

  funcionarios.forEach(f => {
    const col = board.querySelector(`.column[data-func="${f.id}"] .dropzone`);
    const oss = osList.filter(o => o.funcionarioId === f.id);

    oss.forEach(os => {
      const card = criarCardOS(os, { showActions:false });
      col.appendChild(card);
    });
  });

  ativarDragDropFuncionarios();
}

function ativarDragDropFuncionarios() {
  const cards = contentArea.querySelectorAll(".card-kanban");
  const dropzones = contentArea.querySelectorAll("#kanbanFuncionarios .dropzone");

  let draggedId = null;

  cards.forEach(card => {
    card.addEventListener("dragstart", () => {
      draggedId = card.dataset.osid;
      setTimeout(() => card.style.opacity = "0.4", 0);
    });

    card.addEventListener("dragend", () => {
      card.style.opacity = "1";
      draggedId = null;
    });
  });

  dropzones.forEach(zone => {
    zone.addEventListener("dragover", (e) => e.preventDefault());
    zone.addEventListener("drop", () => {
      if (!draggedId) return;

      const funcId = zone.dataset.func;
      const osList = getOrdens();
      const funcs = getFuncionarios();

      const idx = osList.findIndex(o => o.id === draggedId);
      if (idx >= 0) {
        const f = funcs.find(x=>x.id===funcId);
        osList[idx].funcionarioId = funcId;
        osList[idx].funcionarioNome = f ? f.nome : osList[idx].funcionarioNome;
        setOrdens(osList);

        updateServicoStatusCliente(osList[idx].clienteId, osList[idx].id, osList[idx].status, osList[idx].total);
      }

      renderFuncionarios();
    });
  });
}

function renderPainelFuncionario(){
  const m = getAppMode();
  topbarTitle.textContent = "Painel do Funcionário";
  topbarCrumb.textContent = "OS atribuídas • PDF sem preços • Checklist";

  refreshFuncSelect();
  funcSelectWrap.style.display = "flex";
  quickCards.style.display = "none";

  if(!m.funcionarioId){
    contentArea.innerHTML = `
      <div class="panel">
        <h2>Selecione um funcionário</h2>
        <p class="small muted">Escolha o funcionário no topo (Modo Funcionário) para ver as OS atribuídas.</p>
      </div>
    `;
    return;
  }

  const funcs = getFuncionarios();
  const func = funcs.find(f=>f.id===m.funcionarioId);
  const ordens = getOrdens().filter(o=>o.funcionarioId===m.funcionarioId);

  contentArea.innerHTML = `
    <div class="panel">
      <h2>${func ? func.nome : "Funcionário"}</h2>
      <div class="small muted">Você pode gerar PDF da OS sem preços, acessar checklist e mudar status para Finalizado/Entregue.</div>
      <div class="actions" style="margin-top:12px;">
        <button class="btn-ghost" id="btnChecklistFuncionario" type="button">Abrir Checklist</button>
        <button class="btn-ghost" id="btnVoltarAdmin" type="button">Voltar Admin</button>
      </div>
    </div>

    <div class="panel">
      <h2>Minhas Ordens</h2>
      <div class="kanban">
        <div class="column col-aguardando">
          <h3>Aguardando <span class="badge red">${ordens.filter(o=>o.status==="Aguardando").length}</span></h3>
          <div class="dropzone" data-st="Aguardando"></div>
        </div>
        <div class="column col-emservico">
          <h3>Em Serviço <span class="badge yellow">${ordens.filter(o=>o.status==="Em Serviço").length}</span></h3>
          <div class="dropzone" data-st="Em Serviço"></div>
        </div>
        <div class="column col-finalizado">
          <h3>Finalizado <span class="badge blue">${ordens.filter(o=>o.status==="Finalizado").length}</span></h3>
          <div class="dropzone" data-st="Finalizado"></div>
        </div>
      </div>
      <p class="small muted" style="margin-top:10px;">Para “Entregar”, use o botão <b>Entregar</b> dentro do cartão da OS.</p>
    </div>
  `;

  document.getElementById("btnChecklistFuncionario").addEventListener("click", ()=>renderChecklistGuiado({ funcionarioMode:true }));
  document.getElementById("btnVoltarAdmin").addEventListener("click", ()=>{
    const mode = getAppMode();
    mode.mode = "admin";
    mode.funcionarioId = "";
    setAppMode(mode);
    applyModeUI();
    loadPage("dashboard");
  });

  ordens.forEach(os=>{
    const zone = contentArea.querySelector(`.dropzone[data-st="${os.status}"]`);
    if(zone) zone.appendChild(criarCardOS(os, { showActions:true, funcionarioMode:true }));
  });

  ativarDragDropPainelFuncionario();
}

function ativarDragDropPainelFuncionario(){
  const cards = contentArea.querySelectorAll(".card-kanban");
  const zones = contentArea.querySelectorAll(".dropzone");

  let draggedId = null;
  cards.forEach(card=>{
    card.addEventListener("dragstart", ()=>{
      draggedId = card.dataset.osid;
      setTimeout(()=>card.style.opacity="0.4",0);
    });
    card.addEventListener("dragend", ()=>{
      card.style.opacity="1";
      draggedId = null;
    });
  });

  zones.forEach(z=>{
    z.addEventListener("dragover",(e)=>e.preventDefault());
    z.addEventListener("drop", ()=>{
      if(!draggedId) return;
      const newStatus = z.dataset.st;
      const ordens = getOrdens();
      const idx = ordens.findIndex(o=>o.id===draggedId);
      if(idx>=0){
        ordens[idx].status = newStatus;
        setOrdens(ordens);
        updateServicoStatusCliente(ordens[idx].clienteId, ordens[idx].id, ordens[idx].status, ordens[idx].total);
      }
      renderPainelFuncionario();
    });
  });
}

// =====================================================
// OS
// =====================================================
function renderOrdemServico(opts={}){
  topbarTitle.textContent = "Ordem de Serviço";
  topbarCrumb.textContent = "Criar OS com itens, mão de obra e PDF";

  const clientes = getClientes();
  const funcionarios = getFuncionarios();
  const estoque = getEstoque();

  const clienteOpts = clientes.length
    ? clientes.map(c => `<option value="${c.id}">${c.cliente} • ${c.placa || "-"}</option>`).join("")
    : "";

  const funcOpts = funcionarios.length
    ? funcionarios.map(f => `<option value="${f.id}">${f.nome}</option>`).join("")
    : "";

  const preClienteId = opts.preClienteId || "";

  contentArea.innerHTML = `
    <div class="panel">
      <h2>Nova Ordem de Serviço</h2>

      <form id="formOS">
        <div class="row">
          <div class="col">
            <label class="small muted">Cliente</label>
            <select id="os_cliente" required>
              <option value="">Selecione o Cliente</option>
              ${clienteOpts}
            </select>
          </div>
          <div class="col">
            <label class="small muted">Funcionário Responsável</label>
            <select id="os_funcionario" required>
              <option value="">Selecione o Funcionário</option>
              ${funcOpts}
            </select>
          </div>
        </div>

        <div class="panel" style="padding:12px; background:rgba(255,255,255,.02); border:1px solid var(--line); box-shadow:none;">
          <div class="small muted" id="os_autoInfo">Selecione um cliente para preencher placa/cor/marca/modelo/ano automaticamente.</div>
        </div>

        <div class="row">
          <div class="col">
            <label class="small muted">Placa</label>
            <input type="text" id="os_placa" placeholder="Placa" required />
          </div>
          <div class="col">
            <label class="small muted">Cor</label>
            <input type="text" id="os_cor" placeholder="Cor" required />
          </div>
        </div>

        <div class="row">
          <div class="col">
            <label class="small muted">Marca</label>
            ${gerarSelectMarcas("", "selectMarcaOS")}
          </div>
          <div class="col">
            <label class="small muted">Modelo</label>
            ${gerarSelectModelo("", "", "selectModeloOS")}
          </div>
          <div class="col">
            <label class="small muted">Ano</label>
            ${gerarSelectAno("", "selectAnoOS")}
          </div>
        </div>

        <div class="hr"></div>

        <h3>Itens / Peças</h3>
        <table class="table" id="tblItens">
          <thead>
            <tr><th style="width:90px;">Qtd</th><th>Item</th><th style="width:140px;">Valor Unit</th><th style="width:120px;">Ações</th></tr>
          </thead>
          <tbody></tbody>
        </table>
        <div class="actions">
          <button type="button" class="btn-green" id="btnAddItem">+ Adicionar Item</button>
        </div>

        <div class="hr"></div>

        <h3>Produtos do Estoque</h3>
        <div class="row">
          <div class="col">
            <select id="estoqueSelectOS">
              <option value="">Selecione um produto do estoque</option>
              ${estoque.map(p => `<option value="${p.id}">${p.nome} • Qtd: ${p.quantidade} • R$ ${money(p.valor)}</option>`).join("")}
            </select>
          </div>
          <div class="col">
            <input type="number" id="estoqueQtdOS" min="1" value="1" placeholder="Quantidade" />
          </div>
          <div class="col actions" style="align-items:flex-end;">
            <button type="button" class="btn-ghost" id="btnAddEstoqueOS">Adicionar do Estoque</button>
          </div>
        </div>

        <div class="hr"></div>

        <h3>Mão de Obra</h3>
        <table class="table" id="tblMao">
          <thead>
            <tr><th>Descrição</th><th style="width:160px;">Valor</th><th style="width:120px;">Ações</th></tr>
          </thead>
          <tbody></tbody>
        </table>
        <div class="actions">
          <button type="button" class="btn-green" id="btnAddMao">+ Adicionar Mão de Obra</button>
        </div>

        <div class="panel" style="margin-top:12px;">
          <div style="display:flex; justify-content:space-between; gap:16px; align-items:center; flex-wrap:wrap;">
            <div class="small muted">Status inicial: <span class="badge red">Aguardando</span></div>
            <div style="font-weight:900; font-size:16px;">Total: R$ <span id="os_total">0.00</span></div>
          </div>
        </div>

        <div class="actions" style="margin-top:10px;">
          <button type="submit" class="btn-green">Salvar OS</button>
          <button type="button" id="btnPDF" class="btn-ghost">Exportar PDF (Admin)</button>
        </div>
      </form>
    </div>
  `;

  bindMarcaModelo("selectMarcaOS", "selectModeloOS");

  if(preClienteId){
    document.getElementById("os_cliente").value = preClienteId;
  }

  document.getElementById("os_cliente").addEventListener("change", () => {
    const clienteId = document.getElementById("os_cliente").value;
    const c = getClientes().find(x => x.id === clienteId);
    if (!c) return;

    document.getElementById("os_placa").value = (c.placa || "").toUpperCase();
    document.getElementById("os_cor").value = c.cor || "";
    document.getElementById("selectMarcaOS").value = c.marca || "";

    const selectModelo = document.getElementById("selectModeloOS");
    selectModelo.innerHTML = `<option value="">Selecione o Modelo</option>`;
    if (c.marca && marcas[c.marca]) {
      marcas[c.marca].forEach(m => selectModelo.innerHTML += `<option value="${m}">${m}</option>`);
    }
    selectModelo.value = c.modelo || "";

    document.getElementById("selectAnoOS").value = c.ano || "";

    document.getElementById("os_autoInfo").textContent =
      `Cliente: ${c.cliente} | Tel: ${c.telefone} | CPF: ${c.cpf || "-"} | End: ${c.endereco}`;
  });

  if(preClienteId){
    document.getElementById("os_cliente").dispatchEvent(new Event("change"));
  }

  document.getElementById("btnAddItem").addEventListener("click", () => { addLinhaItem(); calcTotalOS(); });
  document.getElementById("btnAddMao").addEventListener("click", () => { addLinhaMao(); calcTotalOS(); });

  document.getElementById("btnAddEstoqueOS").addEventListener("click", ()=>{
    const estoqueId = document.getElementById("estoqueSelectOS").value;
    const qtd = Number(document.getElementById("estoqueQtdOS").value || 1);
    if(!estoqueId) return alert("Selecione um produto do estoque.");
    if(qtd <= 0) return alert("Quantidade inválida.");

    const prod = getEstoque().find(p=>p.id===estoqueId);
    if(!prod) return alert("Produto não encontrado.");
    if(Number(prod.quantidade || 0) < qtd) return alert("Quantidade insuficiente no estoque.");

    addLinhaItem(qtd, prod.nome, Number(prod.valor || 0), prod.id);
    calcTotalOS();
  });

  addLinhaItem();
  addLinhaMao();

  document.getElementById("formOS").addEventListener("submit", (e) => {
    e.preventDefault();
    salvarOS();
  });

  document.getElementById("btnPDF").addEventListener("click", () => {
    exportarPDFOSFromForm({ semPrecos:false });
  });
}

function addLinhaItem(qtd=1, item="", valor=0, estoqueId="") {
  const tbody = document.querySelector("#tblItens tbody");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="number" min="1" value="${qtd}" class="it_qtd" /></td>
    <td>
      <input type="text" value="${item}" class="it_item" placeholder="Ex: Pastilha dianteira" />
      <input type="hidden" value="${estoqueId}" class="it_estoque_id" />
    </td>
    <td><input type="number" min="0" step="0.01" value="${valor}" class="it_valor" /></td>
    <td><button type="button" class="btn-red it_rm">Remover</button></td>
  `;
  tbody.appendChild(tr);

  tr.querySelector(".it_rm").addEventListener("click", () => {
    tr.remove();
    calcTotalOS();
  });

  tr.querySelectorAll("input").forEach(inp => inp.addEventListener("input", calcTotalOS));
}

function addLinhaMao(desc="", valor=0) {
  const tbody = document.querySelector("#tblMao tbody");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="text" value="${desc}" class="mo_desc" placeholder="Ex: Troca de óleo" /></td>
    <td><input type="number" min="0" step="0.01" value="${valor}" class="mo_valor" /></td>
    <td><button type="button" class="btn-red mo_rm">Remover</button></td>
  `;
  tbody.appendChild(tr);

  tr.querySelector(".mo_rm").addEventListener("click", () => {
    tr.remove();
    calcTotalOS();
  });

  tr.querySelectorAll("input").forEach(inp => inp.addEventListener("input", calcTotalOS));
}

function calcTotalOS() {
  let total = 0;

  document.querySelectorAll("#tblItens tbody tr").forEach(tr => {
    const qtd = Number(tr.querySelector(".it_qtd").value || 0);
    const val = Number(tr.querySelector(".it_valor").value || 0);
    total += qtd * val;
  });

  document.querySelectorAll("#tblMao tbody tr").forEach(tr => {
    const val = Number(tr.querySelector(".mo_valor").value || 0);
    total += val;
  });

  const el = document.getElementById("os_total");
  if(el) el.textContent = money(total);
}

function salvarOS() {
  const clienteId = document.getElementById("os_cliente").value;
  const funcId = document.getElementById("os_funcionario").value;

  const c = getClientes().find(x => x.id === clienteId);
  const f = getFuncionarios().find(x => x.id === funcId);
  if (!c) return alert("Selecione um cliente válido!");
  if (!f) return alert("Selecione um funcionário válido!");

  const itens = Array.from(document.querySelectorAll("#tblItens tbody tr")).map(tr => ({
    qtd: Number(tr.querySelector(".it_qtd").value || 0),
    item: (tr.querySelector(".it_item").value || "").trim(),
    valor: Number(tr.querySelector(".it_valor").value || 0),
    estoqueId: (tr.querySelector(".it_estoque_id")?.value || "")
  })).filter(x => x.item);

  const mao = Array.from(document.querySelectorAll("#tblMao tbody tr")).map(tr => ({
    desc: (tr.querySelector(".mo_desc").value || "").trim(),
    valor: Number(tr.querySelector(".mo_valor").value || 0)
  })).filter(x => x.desc);

  const total = Number(document.getElementById("os_total").textContent || 0);

  const os = {
    id: uid("os"),
    createdAtISO: todayISO(),
    dataHora: new Date().toLocaleString(),
    status: "Aguardando",
    funcionarioId: f.id,
    funcionarioNome: f.nome,

    clienteId: c.id,
    clienteNome: c.cliente,
    telefone: c.telefone,
    cpf: c.cpf || "",
    endereco: c.endereco,

    placa: (document.getElementById("os_placa").value || "").toUpperCase(),
    cor: document.getElementById("os_cor").value || "",
    marca: document.getElementById("selectMarcaOS").value || "",
    modelo: document.getElementById("selectModeloOS").value || "",
    ano: document.getElementById("selectAnoOS").value || "",

    itens,
    mao,
    total
  };

  const stockResult = baixarEstoqueDaOS(os.itens);
  if(!stockResult.ok) return alert(stockResult.msg);

  const ordens = getOrdens();
  ordens.push(os);
  setOrdens(ordens);

  attachServicoToCliente(os.clienteId, os);

  alert("OS salva ✅ (Aguardando) e atribuída ao funcionário.");
  renderOrdemServico({ preClienteId: os.clienteId });
}

function renderEditarOS(osId){
  const found = findOSAnywhere(osId);
  if(!found.os) return alert("OS não encontrada para edição.");
  if(found.from !== "ordens") return alert("Só é possível editar OS ativas.");

  const os = found.os;
  const clientes = getClientes();
  const funcionarios = getFuncionarios();
  const estoque = getEstoque();

  topbarTitle.textContent = "Editar Ordem de Serviço";
  topbarCrumb.textContent = "Atualize itens, mão de obra, responsável e dados da OS";

  contentArea.innerHTML = `
    <div class="panel">
      <h2>Editar OS</h2>

      <form id="formEditOS">
        <div class="row">
          <div class="col">
            <label class="small muted">Cliente</label>
            <select id="edit_os_cliente" required>
              <option value="">Selecione o Cliente</option>
              ${clientes.map(c => `<option value="${c.id}" ${c.id===os.clienteId ? "selected" : ""}>${c.cliente} • ${c.placa || "-"}</option>`).join("")}
            </select>
          </div>
          <div class="col">
            <label class="small muted">Funcionário Responsável</label>
            <select id="edit_os_funcionario" required>
              <option value="">Selecione o Funcionário</option>
              ${funcionarios.map(f => `<option value="${f.id}" ${f.id===os.funcionarioId ? "selected" : ""}>${f.nome}</option>`).join("")}
            </select>
          </div>
        </div>

        <div class="row">
          <div class="col">
            <label class="small muted">Placa</label>
            <input type="text" id="edit_os_placa" value="${os.placa || ""}" required />
          </div>
          <div class="col">
            <label class="small muted">Cor</label>
            <input type="text" id="edit_os_cor" value="${os.cor || ""}" required />
          </div>
        </div>

        <div class="row">
          <div class="col">
            <label class="small muted">Marca</label>
            ${gerarSelectMarcas(os.marca || "", "edit_selectMarcaOS")}
          </div>
          <div class="col">
            <label class="small muted">Modelo</label>
            ${gerarSelectModelo(os.modelo || "", os.marca || "", "edit_selectModeloOS")}
          </div>
          <div class="col">
            <label class="small muted">Ano</label>
            ${gerarSelectAno(os.ano || "", "edit_selectAnoOS")}
          </div>
        </div>

        <div class="hr"></div>

        <h3>Itens / Peças</h3>
        <table class="table" id="tblEditItens">
          <thead>
            <tr><th style="width:90px;">Qtd</th><th>Item</th><th style="width:140px;">Valor Unit</th><th style="width:120px;">Ações</th></tr>
          </thead>
          <tbody></tbody>
        </table>
        <div class="actions">
          <button type="button" class="btn-green" id="btnEditAddItem">+ Adicionar Item</button>
        </div>

        <div class="hr"></div>

        <h3>Produtos do Estoque</h3>
        <div class="row">
          <div class="col">
            <select id="edit_estoqueSelectOS">
              <option value="">Selecione um produto do estoque</option>
              ${estoque.map(p => `<option value="${p.id}">${p.nome} • Qtd: ${p.quantidade} • R$ ${money(p.valor)}</option>`).join("")}
            </select>
          </div>
          <div class="col">
            <input type="number" id="edit_estoqueQtdOS" min="1" value="1" placeholder="Quantidade" />
          </div>
          <div class="col actions" style="align-items:flex-end;">
            <button type="button" class="btn-ghost" id="btnEditAddEstoqueOS">Adicionar do Estoque</button>
          </div>
        </div>

        <div class="hr"></div>

        <h3>Mão de Obra</h3>
        <table class="table" id="tblEditMao">
          <thead>
            <tr><th>Descrição</th><th style="width:160px;">Valor</th><th style="width:120px;">Ações</th></tr>
          </thead>
          <tbody></tbody>
        </table>
        <div class="actions">
          <button type="button" class="btn-green" id="btnEditAddMao">+ Adicionar Mão de Obra</button>
        </div>

        <div class="panel" style="margin-top:12px;">
          <div style="display:flex; justify-content:space-between; gap:16px; align-items:center; flex-wrap:wrap;">
            <div class="small muted">Status atual: <span class="badge blue">${os.status}</span></div>
            <div style="font-weight:900; font-size:16px;">Total: R$ <span id="edit_os_total">0.00</span></div>
          </div>
        </div>

        <div class="actions" style="margin-top:12px;">
          <button type="submit" class="btn-green">Salvar Alterações</button>
          <button type="button" class="btn-ghost" id="btnCancelarEditOS">Cancelar</button>
        </div>
      </form>
    </div>
  `;

  bindMarcaModelo("edit_selectMarcaOS", "edit_selectModeloOS");

  function addLinhaEditItem(qtd=1, item="", valor=0, estoqueId=""){
    const tbody = document.querySelector("#tblEditItens tbody");
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="number" min="1" value="${qtd}" class="it_qtd" /></td>
      <td>
        <input type="text" value="${item}" class="it_item" />
        <input type="hidden" value="${estoqueId}" class="it_estoque_id" />
      </td>
      <td><input type="number" min="0" step="0.01" value="${valor}" class="it_valor" /></td>
      <td><button type="button" class="btn-red it_rm">Remover</button></td>
    `;
    tbody.appendChild(tr);

    tr.querySelector(".it_rm").addEventListener("click", ()=>{
      tr.remove();
      calcEditTotal();
    });

    tr.querySelectorAll("input").forEach(inp => inp.addEventListener("input", calcEditTotal));
  }

  function addLinhaEditMao(desc="", valor=0){
    const tbody = document.querySelector("#tblEditMao tbody");
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="text" value="${desc}" class="mo_desc" /></td>
      <td><input type="number" min="0" step="0.01" value="${valor}" class="mo_valor" /></td>
      <td><button type="button" class="btn-red mo_rm">Remover</button></td>
    `;
    tbody.appendChild(tr);

    tr.querySelector(".mo_rm").addEventListener("click", ()=>{
      tr.remove();
      calcEditTotal();
    });

    tr.querySelectorAll("input").forEach(inp => inp.addEventListener("input", calcEditTotal));
  }

  function calcEditTotal(){
    let total = 0;
    document.querySelectorAll("#tblEditItens tbody tr").forEach(tr=>{
      total += Number(tr.querySelector(".it_qtd").value || 0) * Number(tr.querySelector(".it_valor").value || 0);
    });
    document.querySelectorAll("#tblEditMao tbody tr").forEach(tr=>{
      total += Number(tr.querySelector(".mo_valor").value || 0);
    });
    document.getElementById("edit_os_total").textContent = money(total);
  }

  (os.itens || []).forEach(i=>addLinhaEditItem(i.qtd, i.item, i.valor, i.estoqueId || ""));
  (os.mao || []).forEach(m=>addLinhaEditMao(m.desc, m.valor));
  if(!(os.itens || []).length) addLinhaEditItem();
  if(!(os.mao || []).length) addLinhaEditMao();
  calcEditTotal();

  document.getElementById("btnEditAddItem").addEventListener("click", ()=>addLinhaEditItem());
  document.getElementById("btnEditAddMao").addEventListener("click", ()=>addLinhaEditMao());
  document.getElementById("btnCancelarEditOS").addEventListener("click", ()=>loadPage("carros-servico"));

  document.getElementById("btnEditAddEstoqueOS").addEventListener("click", ()=>{
    const estoqueId = document.getElementById("edit_estoqueSelectOS").value;
    const qtd = Number(document.getElementById("edit_estoqueQtdOS").value || 1);
    if(!estoqueId) return alert("Selecione um produto do estoque.");
    if(qtd <= 0) return alert("Quantidade inválida.");

    const prod = getEstoque().find(p=>p.id===estoqueId);
    if(!prod) return alert("Produto não encontrado.");
    addLinhaEditItem(qtd, prod.nome, Number(prod.valor || 0), prod.id);
    calcEditTotal();
  });

  document.getElementById("formEditOS").addEventListener("submit", (e)=>{
    e.preventDefault();

    const ordens = getOrdens();
    const idx = ordens.findIndex(o=>o.id===os.id);
    if(idx < 0) return alert("OS não encontrada.");

    const clienteId = document.getElementById("edit_os_cliente").value;
    const funcId = document.getElementById("edit_os_funcionario").value;
    const cli = getClientes().find(c=>c.id===clienteId);
    const fun = getFuncionarios().find(f=>f.id===funcId);

    if(!cli) return alert("Cliente inválido.");
    if(!fun) return alert("Funcionário inválido.");

    const newItens = Array.from(document.querySelectorAll("#tblEditItens tbody tr")).map(tr => ({
      qtd: Number(tr.querySelector(".it_qtd").value || 0),
      item: (tr.querySelector(".it_item").value || "").trim(),
      valor: Number(tr.querySelector(".it_valor").value || 0),
      estoqueId: (tr.querySelector(".it_estoque_id")?.value || "")
    })).filter(i => i.item);

    const stockResult = applyStockDiff(os.itens || [], newItens);
    if(!stockResult.ok) return alert(stockResult.msg);

    ordens[idx] = {
      ...ordens[idx],
      clienteId: cli.id,
      clienteNome: cli.cliente,
      telefone: cli.telefone,
      cpf: cli.cpf || "",
      endereco: cli.endereco,
      funcionarioId: fun.id,
      funcionarioNome: fun.nome,
      placa: document.getElementById("edit_os_placa").value.trim().toUpperCase(),
      cor: document.getElementById("edit_os_cor").value.trim(),
      marca: document.getElementById("edit_selectMarcaOS").value,
      modelo: document.getElementById("edit_selectModeloOS").value,
      ano: document.getElementById("edit_selectAnoOS").value,
      itens: newItens,
      mao: Array.from(document.querySelectorAll("#tblEditMao tbody tr")).map(tr => ({
        desc: (tr.querySelector(".mo_desc").value || "").trim(),
        valor: Number(tr.querySelector(".mo_valor").value || 0)
      })).filter(m => m.desc),
      total: Number(document.getElementById("edit_os_total").textContent || 0)
    };

    setOrdens(ordens);
    attachServicoToCliente(ordens[idx].clienteId, ordens[idx]);
    updateServicoStatusCliente(ordens[idx].clienteId, ordens[idx].id, ordens[idx].status, ordens[idx].total);

    alert("OS atualizada com sucesso ✅");
    loadPage("carros-servico");
  });
}

// =====================================================
// KANBAN STATUS
// =====================================================
function renderCarrosEmServico() {
  topbarTitle.textContent = "Carros em Serviço";
  topbarCrumb.textContent = "Arraste para mudar status • PDF • Editar • Excluir";

  const ordens = getOrdens();

  contentArea.innerHTML = `
    <div class="panel">
      <h2>Kanban de Status</h2>
      <div class="small muted">Arraste os veículos entre status. Clique em <b>PDF</b>, <b>Editar</b> ou <b>Excluir</b> no cartão.</div>

      <div class="kanban" id="kanbanStatus">
        <div class="column col-aguardando" data-status="Aguardando">
          <h3>Aguardando <span class="badge red">${ordens.filter(o=>o.status==="Aguardando").length}</span></h3>
          <div class="dropzone" data-status="Aguardando"></div>
        </div>

        <div class="column col-emservico" data-status="Em Serviço">
          <h3>Em Serviço <span class="badge yellow">${ordens.filter(o=>o.status==="Em Serviço").length}</span></h3>
          <div class="dropzone" data-status="Em Serviço"></div>
        </div>

        <div class="column col-finalizado" data-status="Finalizado">
          <h3>Finalizado <span class="badge blue">${ordens.filter(o=>o.status==="Finalizado").length}</span></h3>
          <div class="dropzone" data-status="Finalizado"></div>
        </div>

        <div class="column col-entregue" data-status="Entregue">
          <h3>Entregue <span class="badge green">${getHistorico().length}</span></h3>
          <div class="dropzone" data-status="Entregue"></div>
          <p class="small muted" style="margin-top:10px;">Ao soltar aqui, sai das “Ordens” e entra no Histórico/Financeiro.</p>
        </div>
      </div>
    </div>
  `;

  ordens.forEach(os => {
    const zone = contentArea.querySelector(`.dropzone[data-status="${os.status}"]`);
    if (!zone) return;
    zone.appendChild(criarCardOS(os, { showActions:true }));
  });

  ativarDragDropStatus();
}

function ativarDragDropStatus() {
  const cards = contentArea.querySelectorAll(".card-kanban");
  const dropzones = contentArea.querySelectorAll("#kanbanStatus .dropzone");

  let draggedId = null;

  cards.forEach(card => {
    card.addEventListener("dragstart", () => {
      draggedId = card.dataset.osid;
      setTimeout(() => card.style.opacity = "0.4", 0);
    });

    card.addEventListener("dragend", () => {
      card.style.opacity = "1";
      draggedId = null;
    });
  });

  dropzones.forEach(zone => {
    zone.addEventListener("dragover", (e) => e.preventDefault());
    zone.addEventListener("drop", () => {
      if (!draggedId) return;

      const newStatus = zone.dataset.status;
      let ordens = getOrdens();
      const idx = ordens.findIndex(o => o.id === draggedId);
      if (idx < 0) return;

      ordens[idx].status = newStatus;

      if(newStatus === "Entregue"){
        const osEntregue = { ...ordens[idx], status:"Entregue", entregueAtISO: todayISO(), entregueEm: new Date().toLocaleString() };
        ordens = ordens.filter(o=>o.id !== draggedId);
        setOrdens(ordens);

        const hist = getHistorico();
        hist.unshift(osEntregue);
        setHistorico(hist);

        updateServicoStatusCliente(osEntregue.clienteId, osEntregue.id, "Entregue", osEntregue.total);
      }else{
        setOrdens(ordens);
        updateServicoStatusCliente(ordens[idx].clienteId, ordens[idx].id, ordens[idx].status, ordens[idx].total);
      }

      renderCarrosEmServico();
    });
  });
}

// =====================================================
// CARD OS
// =====================================================
function criarCardOS(os, opts={ showActions:true, funcionarioMode:false }) {
  const card = document.createElement("div");
  card.className = "card-kanban";
  card.draggable = true;
  card.dataset.osid = os.id;

  card.innerHTML = `
    <div class="title">${os.marca || "-"} ${os.modelo || "-"} • ${os.placa || "-"}</div>
    <div class="meta">Cliente: ${os.clienteNome || "-"} • Resp: ${os.funcionarioNome || "-"}</div>
    <div class="meta">Status: ${os.status || "-"}</div>
    ${opts.showActions ? `
      <div class="mini-actions">
        <button class="btn-ghost btnPdf" type="button">PDF</button>
        ${opts.funcionarioMode ? `
          <button class="btn-soft btnChecklist" type="button">Checklist</button>
          <button class="btn-soft btnFinalizar" type="button">Finalizar</button>
          <button class="btn-green btnEntregar" type="button">Entregar</button>
        ` : `
          <button class="btn-ghost btnEdit" type="button">Editar</button>
          <button class="btn-whatsapp btnSendOS" type="button">WhatsApp</button>
          <button class="btn-red btnExcluir" type="button">Excluir</button>
        `}
      </div>
    ` : ``}
  `;

  card.addEventListener("dblclick", () => abrirDetalhesOS(os.id));

  const btnPdf = card.querySelector(".btnPdf");
  if(btnPdf){
    btnPdf.addEventListener("click", (e)=>{
      e.stopPropagation();
      exportarPDFOSById(os.id, { semPrecos: !!opts.funcionarioMode });
    });
  }

  const btnEdit = card.querySelector(".btnEdit");
  if(btnEdit){
    btnEdit.addEventListener("click", (e)=>{
      e.stopPropagation();
      renderEditarOS(os.id);
    });
  }

  const btnSendOS = card.querySelector(".btnSendOS");
  if(btnSendOS){
    btnSendOS.addEventListener("click", (e)=>{
      e.stopPropagation();
      enviarOSWhatsApp(os.id);
    });
  }

  const btnExc = card.querySelector(".btnExcluir");
  if(btnExc){
    btnExc.addEventListener("click", (e)=>{
      e.stopPropagation();
      excluirOS(os.id);
    });
  }

  const btnChecklist = card.querySelector(".btnChecklist");
  if(btnChecklist){
    btnChecklist.addEventListener("click", (e)=>{
      e.stopPropagation();
      renderChecklistGuiado({ preClienteId: os.clienteId, funcionarioMode:true });
    });
  }

  const btnFin = card.querySelector(".btnFinalizar");
  if(btnFin){
    btnFin.addEventListener("click", (e)=>{
      e.stopPropagation();
      changeStatusOS(os.id, "Finalizado");
      renderPainelFuncionario();
    });
  }

  const btnEnt = card.querySelector(".btnEntregar");
  if(btnEnt){
    btnEnt.addEventListener("click", (e)=>{
      e.stopPropagation();
      entregarOS(os.id);
      renderPainelFuncionario();
    });
  }

  return card;
}

function findOSAnywhere(osId){
  const ordens = getOrdens();
  let os = ordens.find(o=>o.id===osId);
  if(os) return { os, from:"ordens" };

  const hist = getHistorico();
  os = hist.find(o=>o.id===osId);
  if(os) return { os, from:"historico" };

  return { os:null, from:"" };
}

function abrirDetalhesOS(osId) {
  const { os } = findOSAnywhere(osId);
  if (!os) return alert("OS não encontrada.");

  const itensTxt = (os.itens || []).map(i => `${i.qtd}x ${i.item} (R$ ${money(i.valor)})`).join("\n");
  const maoTxt = (os.mao || []).map(m => `${m.desc} (R$ ${money(m.valor)})`).join("\n");

  alert(
    `OS: ${os.id}\n` +
    `Data: ${os.dataHora}\n` +
    `Status: ${os.status}\n\n` +
    `Cliente: ${os.clienteNome}\n` +
    `Tel: ${os.telefone}\n` +
    `CPF: ${os.cpf || "-"}\n` +
    `End: ${os.endereco}\n\n` +
    `Veículo: ${os.marca} ${os.modelo} ${os.ano}\n` +
    `Placa/Cor: ${os.placa} / ${os.cor}\n` +
    `Funcionário: ${os.funcionarioNome}\n\n` +
    `ITENS:\n${itensTxt || "-"}\n\n` +
    `MÃO DE OBRA:\n${maoTxt || "-"}\n\n` +
    `TOTAL: R$ ${money(os.total || 0)}`
  );
}

function changeStatusOS(osId, status){
  const ordens = getOrdens();
  const idx = ordens.findIndex(o=>o.id===osId);
  if(idx<0) return;

  ordens[idx].status = status;
  setOrdens(ordens);
  updateServicoStatusCliente(ordens[idx].clienteId, ordens[idx].id, status, ordens[idx].total);
}

function entregarOS(osId){
  let ordens = getOrdens();
  const idx = ordens.findIndex(o=>o.id===osId);
  if(idx<0) return;

  const osEntregue = { ...ordens[idx], status:"Entregue", entregueAtISO: todayISO(), entregueEm: new Date().toLocaleString() };

  ordens = ordens.filter(o=>o.id!==osId);
  setOrdens(ordens);

  const hist = getHistorico();
  hist.unshift(osEntregue);
  setHistorico(hist);

  updateServicoStatusCliente(osEntregue.clienteId, osEntregue.id, "Entregue", osEntregue.total);
}

// =====================================================
// HISTÓRICO / FINANCEIRO
// =====================================================
function renderHistoricoFinanceiro(){
  topbarTitle.textContent = "Histórico / Financeiro";
  topbarCrumb.textContent = "Entregues • Filtro por mês • Excluir OS";

  const hist = getHistorico();

  const months = Array.from(new Set(hist.map(h => monthKeyFromISO(h.entregueAtISO || h.createdAtISO || todayISO()))))
    .filter(Boolean)
    .sort()
    .reverse();

  const monthOpts = months.map(m=> `<option value="${m}">${niceMonthLabel(m)}</option>`).join("");
  const defaultMonth = months[0] || "";

  contentArea.innerHTML = `
    <div class="panel">
      <h2>Financeiro</h2>

      <div class="row">
        <div class="col">
          <label class="small muted">Filtrar por mês</label>
          <select id="finMonth">
            <option value="">Todos</option>
            ${monthOpts}
          </select>
        </div>
        <div class="col">
          <div class="kpi primary" style="height:100%;">
            <div class="kpi-label">Carros entregues (filtro)</div>
            <div class="kpi-value" id="finCount">0</div>
          </div>
        </div>
        <div class="col">
          <div class="kpi green" style="height:100%;">
            <div class="kpi-label">Bruto total (filtro)</div>
            <div class="kpi-value" id="finTotal">R$ 0.00</div>
          </div>
        </div>
      </div>

      <div class="hr"></div>

      <h3>Entregues</h3>
      <div id="histList"></div>
    </div>
  `;

  const sel = document.getElementById("finMonth");
  if(defaultMonth) sel.value = defaultMonth;

  function draw(){
    const key = sel.value || "";
    const list = getHistorico().filter(h=>{
      if(!key) return true;
      const mk = monthKeyFromISO(h.entregueAtISO || h.createdAtISO || todayISO());
      return mk === key;
    });

    const count = list.length;
    const total = list.reduce((acc,o)=> acc + Number(o.total||0), 0);

    document.getElementById("finCount").textContent = String(count);
    document.getElementById("finTotal").textContent = `R$ ${money(total)}`;

    const wrap = document.getElementById("histList");
    if(count===0){
      wrap.innerHTML = `<p class="small muted">Nenhum veículo entregue neste filtro.</p>`;
      return;
    }

    wrap.innerHTML = list.map(os=>`
      <div class="history-item" data-osid="${os.id}">
        <div>
          <div style="font-weight:900">${os.marca || ""} ${os.modelo || ""} • ${os.placa || "-"}</div>
          <div class="small muted">Cliente: ${os.clienteNome || "-"} • Entregue: ${os.entregueEm || os.dataHora || "-"}</div>
        </div>
        <div class="actions" style="gap:8px;">
          <span class="badge green">Entregue</span>
          <span class="badge blue">R$ ${money(os.total)}</span>
          <button class="btn-whatsapp btnHistSendOS" data-osid="${os.id}" type="button">WhatsApp</button>
          <button class="btn-red btnDelHist" data-osid="${os.id}" type="button">Excluir</button>
        </div>
      </div>
    `).join("");

    wrap.querySelectorAll(".history-item").forEach(d=>{
      d.addEventListener("click", ()=>abrirDetalhesOS(d.dataset.osid));
    });

    wrap.querySelectorAll(".btnDelHist").forEach(btn=>{
      btn.addEventListener("click", (e)=>{
        e.stopPropagation();
        excluirOS(btn.dataset.osid);
        renderHistoricoFinanceiro();
      });
    });

    wrap.querySelectorAll(".btnHistSendOS").forEach(btn=>{
      btn.addEventListener("click", (e)=>{
        e.stopPropagation();
        enviarOSWhatsApp(btn.dataset.osid);
      });
    });
  }

  sel.addEventListener("change", draw);
  draw();
}

// =====================================================
// CHECKLIST GUIADO
// =====================================================
const CHECKLIST_STEPS = [
  "Foto do Capô","Foto do Painel","Foto do Odômetro","Foto Frente","Foto Traseira",
  "Foto Lateral Direita","Foto Lateral Esquerda","Foto Interno (bancos)","Foto Porta-malas",
];

function renderChecklistGuiado(opts={}){
  topbarTitle.textContent = "Checklist";
  topbarCrumb.textContent = "Checklist guiado com fotos etapa por etapa";

  const clientes = getClientes();
  const clienteOpts = clientes.map(c => `<option value="${c.id}">${c.cliente} • ${c.placa || "-"}</option>`).join("");
  const preClienteId = opts.preClienteId || "";
  const funcionarioMode = !!opts.funcionarioMode;

  let stepIndex = 0;
  let fotos = [];

  contentArea.innerHTML = `
    <div class="panel">
      <h2>Checklist Guiado</h2>

      <div class="row">
        <div class="col">
          <label class="small muted">Cliente</label>
          <select id="chk_cliente" required>
            <option value="">Selecione o Cliente</option>
            ${clienteOpts}
          </select>
        </div>
        <div class="col">
          <label class="small muted">Observações</label>
          <input type="text" id="chk_obs" placeholder="Opcional: observações da vistoria" />
        </div>
      </div>

      <div class="hr"></div>

      <div class="panel" style="margin:0; box-shadow:none; background:rgba(255,255,255,.02);">
        <div class="small muted">Passo atual</div>
        <div style="font-weight:900; font-size:16px; margin-top:6px;" id="stepLabel">${CHECKLIST_STEPS[0]}</div>

        <div class="stepper" style="margin-top:10px;" id="stepper"></div>

        <div class="actions" style="margin-top:12px;">
          <button class="btn-ghost" id="btnPrev" type="button">◀ Anterior</button>
          <button class="btn-soft" id="btnCapture" type="button">📸 Tirar foto</button>
          <button class="btn-ghost" id="btnUpload" type="button">📎 Enviar arquivo</button>
          <button class="btn-ghost" id="btnNext" type="button">Próximo ▶</button>
        </div>

        <input type="file" id="filePicker" accept="image/*" capture="environment" style="display:none;" />

        <div class="preview-row" id="previewRow"></div>

        <div class="actions" style="margin-top:12px;">
          <button class="btn-green" id="btnSalvarChecklist" type="button">Salvar Checklist</button>
          <button class="btn-red" id="btnResetChecklist" type="button">Limpar</button>
        </div>

        <p class="small muted" style="margin-top:10px;">
          “Tirar foto” usa câmera do navegador quando disponível. Se não abrir, use “Enviar arquivo”.
        </p>
      </div>
    </div>
  `;

  const selCliente = document.getElementById("chk_cliente");
  if(preClienteId) selCliente.value = preClienteId;

  function drawStepper(){
    const wrap = document.getElementById("stepper");
    wrap.innerHTML = CHECKLIST_STEPS.map((s,idx)=>`
      <span class="step ${idx===stepIndex ? "active":""}">${idx+1}</span>
    `).join("");
  }
  function drawStep(){
    document.getElementById("stepLabel").textContent = CHECKLIST_STEPS[stepIndex];
    drawStepper();
    drawPreviews();
  }
  function drawPreviews(){
    const row = document.getElementById("previewRow");
    if(fotos.length===0){
      row.innerHTML = `<span class="small muted">Nenhuma foto adicionada ainda.</span>`;
      return;
    }
    row.innerHTML = fotos.map((f,i)=>`
      <div class="photo" title="${f.label}">
        <img src="${f.dataUrl}" alt="foto-${i}" />
      </div>
    `).join("");
  }

  document.getElementById("btnPrev").addEventListener("click", ()=>{
    if(stepIndex>0){ stepIndex--; drawStep(); }
  });
  document.getElementById("btnNext").addEventListener("click", ()=>{
    if(stepIndex < CHECKLIST_STEPS.length-1){ stepIndex++; drawStep(); }
  });

  document.getElementById("btnCapture").addEventListener("click", async ()=>{
    try{
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio:false });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

      stream.getTracks().forEach(t=>t.stop());

      fotos.push({ label: CHECKLIST_STEPS[stepIndex], dataUrl });
      drawPreviews();
      if(stepIndex < CHECKLIST_STEPS.length-1){ stepIndex++; drawStep(); }
    }catch{
      document.getElementById("filePicker").click();
    }
  });

  document.getElementById("btnUpload").addEventListener("click", ()=>{
    document.getElementById("filePicker").click();
  });

  document.getElementById("filePicker").addEventListener("change", (e)=>{
    const file = e.target.files?.[0];
    if(!file) return;
    const r = new FileReader();
    r.onload = ()=>{
      fotos.push({ label: CHECKLIST_STEPS[stepIndex], dataUrl: r.result });
      drawPreviews();
      if(stepIndex < CHECKLIST_STEPS.length-1){ stepIndex++; drawStep(); }
      e.target.value = "";
    };
    r.readAsDataURL(file);
  });

  document.getElementById("btnResetChecklist").addEventListener("click", ()=>{
    if(!confirm("Limpar fotos e reiniciar checklist?")) return;
    stepIndex = 0;
    fotos = [];
    drawStep();
  });

  document.getElementById("btnSalvarChecklist").addEventListener("click", ()=>{
    const clienteId = selCliente.value;
    if(!clienteId) return alert("Selecione um cliente.");
    if(fotos.length===0) return alert("Adicione pelo menos 1 foto.");

    const obs = document.getElementById("chk_obs").value || "";

    const checklist = {
      id: uid("chk"),
      dataHora: new Date().toLocaleString(),
      createdAtISO: todayISO(),
      clienteId,
      obs,
      fotos,
      criadoPor: funcionarioMode ? "funcionario" : "admin"
    };

    const all = getLS("checklists", []);
    all.unshift(checklist);
    setLS("checklists", all);

    attachChecklistToCliente(clienteId, checklist);

    alert("Checklist salvo e vinculado ao cliente ✅");
    if(funcionarioMode) renderPainelFuncionario();
    else loadPage("clientes");
  });

  drawStep();
}

// =====================================================
// ESTOQUE
// =====================================================
function renderEstoque(){
  topbarTitle.textContent = "Estoque";
  topbarCrumb.textContent = "Produtos, quantidade e valor";

  contentArea.innerHTML = `
    <div class="panel">
      <h2>Adicionar / Editar Produto</h2>
      <form id="formEstoque">
        <input type="hidden" id="est_id" />
        <div class="row">
          <div class="col">
            <label class="small muted">Produto</label>
            <input type="text" id="est_nome" placeholder="Ex: Pastilha dianteira" required />
          </div>
          <div class="col">
            <label class="small muted">Quantidade</label>
            <input type="number" id="est_qtd" min="0" value="0" required />
          </div>
          <div class="col">
            <label class="small muted">Valor unitário</label>
            <input type="number" id="est_valor" min="0" step="0.01" value="0" required />
          </div>
        </div>
        <div class="actions" style="margin-top:12px;">
          <button type="submit" class="btn-green">Salvar Produto</button>
          <button type="button" class="btn-ghost" id="btnCancelarEstoque">Cancelar</button>
        </div>
      </form>
    </div>

    <div class="panel">
      <h2>Itens em Estoque</h2>
      <div id="estoqueList"></div>
    </div>
  `;

  function draw(){
    const list = getEstoque().sort((a,b)=>(a.nome||"").localeCompare(b.nome||""));
    const wrap = document.getElementById("estoqueList");

    if(!list.length){
      wrap.innerHTML = `<p class="small muted">Nenhum item cadastrado no estoque.</p>`;
      return;
    }

    wrap.innerHTML = list.map(item => `
      <div class="history-item">
        <div>
          <div style="font-weight:800">${item.nome}</div>
          <div class="small muted">Qtd: ${item.quantidade} • Valor unit.: R$ ${money(item.valor)}</div>
        </div>
        <div class="actions">
          <button class="btn-ghost btnEditEst" data-id="${item.id}" type="button">Editar</button>
          <button class="btn-red btnDelEst" data-id="${item.id}" type="button">Excluir</button>
        </div>
      </div>
    `).join("");

    wrap.querySelectorAll(".btnEditEst").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const item = getEstoque().find(i=>i.id===btn.dataset.id);
        if(!item) return;
        document.getElementById("est_id").value = item.id;
        document.getElementById("est_nome").value = item.nome;
        document.getElementById("est_qtd").value = item.quantidade;
        document.getElementById("est_valor").value = item.valor;
      });
    });

    wrap.querySelectorAll(".btnDelEst").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        if(!confirm("Excluir produto do estoque?")) return;
        setEstoque(getEstoque().filter(i=>i.id!==btn.dataset.id));
        draw();
      });
    });
  }

  document.getElementById("formEstoque").addEventListener("submit", (e)=>{
    e.preventDefault();

    const id = document.getElementById("est_id").value || uid("est");
    const nome = document.getElementById("est_nome").value.trim();
    const quantidade = Number(document.getElementById("est_qtd").value || 0);
    const valor = Number(document.getElementById("est_valor").value || 0);

    if(!nome) return alert("Informe o nome do produto.");

    upsertEstoque({ id, nome, quantidade, valor });
    alert("Produto salvo no estoque ✅");
    document.getElementById("formEstoque").reset();
    document.getElementById("est_id").value = "";
    draw();
  });

  document.getElementById("btnCancelarEstoque").addEventListener("click", ()=>{
    document.getElementById("formEstoque").reset();
    document.getElementById("est_id").value = "";
  });

  draw();
}

// =====================================================
// BOLETOS
// =====================================================
function renderBoletos(){
  topbarTitle.textContent = "Boletos";
  topbarCrumb.textContent = "Controle de vencimentos organizado por dia";

  contentArea.innerHTML = `
    <div class="panel">
      <h2>Novo Boleto</h2>
      <form id="formBoleto">
        <input type="hidden" id="bol_id" />
        <div class="row">
          <div class="col">
            <label class="small muted">Descrição</label>
            <input type="text" id="bol_desc" placeholder="Ex: Aluguel da oficina" required />
          </div>
          <div class="col">
            <label class="small muted">Valor</label>
            <input type="number" id="bol_valor" min="0" step="0.01" value="0" required />
          </div>
        </div>

        <div class="row">
          <div class="col">
            <label class="small muted">Vencimento</label>
            <input type="date" id="bol_venc" required />
          </div>
          <div class="col">
            <label class="small muted">Status</label>
            <select id="bol_status">
              <option value="Aberto">Aberto</option>
              <option value="Pago">Pago</option>
              <option value="Vencido">Vencido</option>
            </select>
          </div>
        </div>

        <div class="actions" style="margin-top:12px;">
          <button type="submit" class="btn-green">Salvar Boleto</button>
          <button type="button" class="btn-ghost" id="btnCancelarBoleto">Cancelar</button>
        </div>
      </form>
    </div>

    <div class="panel">
      <h2>Vencimentos por Dia</h2>
      <div id="boletosPorDia"></div>
    </div>
  `;

  function drawBoletos(){
    const wrap = document.getElementById("boletosPorDia");
    const boletos = getBoletos().sort((a,b)=>(a.vencimento||"").localeCompare(b.vencimento||""));

    if(!boletos.length){
      wrap.innerHTML = `<p class="small muted">Nenhum boleto cadastrado.</p>`;
      return;
    }

    const grupos = {};
    boletos.forEach(b=>{
      const key = b.vencimento || "Sem data";
      if(!grupos[key]) grupos[key] = [];
      grupos[key].push(b);
    });

    wrap.innerHTML = Object.keys(grupos).map(data=>{
      return `
        <div class="calendar-day">
          <h3>${data}</h3>
          ${grupos[data].map(b=>`
            <div class="history-item">
              <div>
                <div style="font-weight:800">${b.descricao}</div>
                <div class="small muted">Valor: R$ ${money(b.valor)} • Status: ${b.status}</div>
              </div>
              <div class="actions">
                <button class="btn-ghost btnEditBol" data-id="${b.id}" type="button">Editar</button>
                <button class="btn-red btnDelBol" data-id="${b.id}" type="button">Excluir</button>
              </div>
            </div>
          `).join("")}
        </div>
      `;
    }).join("");

    wrap.querySelectorAll(".btnEditBol").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const b = getBoletos().find(x=>x.id===btn.dataset.id);
        if(!b) return;
        document.getElementById("bol_id").value = b.id;
        document.getElementById("bol_desc").value = b.descricao;
        document.getElementById("bol_valor").value = b.valor;
        document.getElementById("bol_venc").value = b.vencimento;
        document.getElementById("bol_status").value = b.status;
      });
    });

    wrap.querySelectorAll(".btnDelBol").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        if(!confirm("Excluir boleto?")) return;
        setBoletos(getBoletos().filter(x=>x.id!==btn.dataset.id));
        drawBoletos();
      });
    });
  }

  document.getElementById("formBoleto").addEventListener("submit", (e)=>{
    e.preventDefault();

    const boleto = {
      id: document.getElementById("bol_id").value || uid("bol"),
      descricao: document.getElementById("bol_desc").value.trim(),
      valor: Number(document.getElementById("bol_valor").value || 0),
      vencimento: document.getElementById("bol_venc").value,
      status: document.getElementById("bol_status").value
    };

    upsertBoleto(boleto);
    alert("Boleto salvo ✅");
    document.getElementById("formBoleto").reset();
    document.getElementById("bol_id").value = "";
    drawBoletos();
  });

  document.getElementById("btnCancelarBoleto").addEventListener("click", ()=>{
    document.getElementById("formBoleto").reset();
    document.getElementById("bol_id").value = "";
  });

  drawBoletos();
}

// =====================================================
// WHATSAPP
// =====================================================
function enviarOSWhatsApp(osId){
  const { os } = findOSAnywhere(osId);
  if(!os) return alert("OS não encontrada.");

  const phone = os.telefone || "";
  if(!normalizePhoneBR(phone)) return alert("Cliente sem telefone cadastrado.");

  const itensTxt = (os.itens || []).map(i => `- ${i.qtd}x ${i.item} (R$ ${money(i.valor)})`).join("\n");
  const maoTxt = (os.mao || []).map(m => `- ${m.desc} (R$ ${money(m.valor)})`).join("\n");

  const msg =
`Olá, ${os.clienteNome}!
Segue o resumo da sua ordem de serviço.

OS: ${os.id}
Status: ${os.status}
Veículo: ${os.marca || ""} ${os.modelo || ""} ${os.ano || ""}
Placa: ${os.placa || "-"}

Itens:
${itensTxt || "-"}

Mão de obra:
${maoTxt || "-"}

Total: R$ ${money(os.total || 0)}

BoxControl PRO`;

  const url = toWhatsAppUrl(phone, msg);
  window.open(url, "_blank");
}

function enviarChecklistWhatsApp(clienteId, checkId){
  const cli = getClientes().find(c=>c.id===clienteId);
  if(!cli) return alert("Cliente não encontrado.");
  if(!normalizePhoneBR(cli.telefone || "")) return alert("Cliente sem telefone cadastrado.");

  const all = getLS("checklists", []);
  const chk = all.find(c=>c.id===checkId);
  if(!chk) return alert("Checklist não encontrado.");

  const msg =
`Olá, ${cli.cliente}!
Seu checklist foi registrado com sucesso.

Data: ${chk.dataHora}
Fotos registradas: ${(chk.fotos || []).length}
Observações: ${chk.obs || "Sem observações"}

BoxControl PRO`;

  const url = toWhatsAppUrl(cli.telefone, msg);
  window.open(url, "_blank");
}

// =====================================================
// PDF PROFISSIONAL
// =====================================================
function ensureJsPDF(){
  if(!window.jspdf?.jsPDF){
    alert("jsPDF não carregou. Verifique internet/CDN.");
    return null;
  }
  return window.jspdf.jsPDF;
}

function exportarPDFOSFromForm({ semPrecos=false }={}){
  const clienteId = document.getElementById("os_cliente")?.value || "";
  const cli = getClientes().find(c => c.id === clienteId);

  const funcionarioSel = document.getElementById("os_funcionario");
  const funcNome = funcionarioSel?.selectedOptions?.[0]?.text || "";

  const placa = document.getElementById("os_placa")?.value || "";
  const cor = document.getElementById("os_cor")?.value || "";
  const marca = document.getElementById("selectMarcaOS")?.value || "";
  const modelo = document.getElementById("selectModeloOS")?.value || "";
  const ano = document.getElementById("selectAnoOS")?.value || "";
  const total = document.getElementById("os_total")?.textContent || "0.00";

  const itens = Array.from(document.querySelectorAll("#tblItens tbody tr")).map(tr => ({
    qtd: tr.querySelector(".it_qtd")?.value || "0",
    item: tr.querySelector(".it_item")?.value || "",
    valor: tr.querySelector(".it_valor")?.value || "0"
  })).filter(i => i.item.trim());

  const mao = Array.from(document.querySelectorAll("#tblMao tbody tr")).map(tr => ({
    desc: tr.querySelector(".mo_desc")?.value || "",
    valor: tr.querySelector(".mo_valor")?.value || "0"
  })).filter(m => m.desc.trim());

  const osLike = {
    id: "OS-PRÉVIA",
    dataHora: new Date().toLocaleString(),
    status: "Prévia",
    clienteId: cli?.id || "",
    clienteNome: cli?.cliente || "",
    telefone: cli?.telefone || "",
    cpf: cli?.cpf || "",
    endereco: cli?.endereco || "",
    funcionarioNome: funcNome,
    placa, cor, marca, modelo, ano,
    itens, mao,
    total: Number(total || 0)
  };

  exportarPDFOSObject(osLike, { semPrecos });
}

function exportarPDFOSById(osId, { semPrecos=false }={}){
  const { os } = findOSAnywhere(osId);
  if(!os) return alert("OS não encontrada para PDF.");
  exportarPDFOSObject(os, { semPrecos });
}

function drawSectionTitle(doc, text, y){
  doc.setFillColor(24, 39, 75);
  doc.roundedRect(10, y, 190, 8, 2, 2, "F");
  doc.setTextColor(255,255,255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(text, 13, y + 5.5);
  doc.setTextColor(20,20,20);
}

function exportarPDFOSObject(os, { semPrecos=false }={}){
  const jsPDF = ensureJsPDF();
  if(!jsPDF) return;

  const doc = new jsPDF();
  const emp = getEmpresa();

  let y = 10;

  // Moldura topo
  doc.setDrawColor(220,220,220);
  doc.setLineWidth(0.4);
  doc.roundedRect(8, 8, 194, 280, 4, 4);

  // Cabeçalho
  doc.setFillColor(13, 23, 48);
  doc.roundedRect(10, 10, 190, 28, 3, 3, "F");

  if(emp.logoDataUrl){
    try{
      doc.addImage(emp.logoDataUrl, "PNG", 14, 13, 20, 20);
    }catch{
      try{
        doc.addImage(emp.logoDataUrl, "JPEG", 14, 13, 20, 20);
      }catch{}
    }
  }

  doc.setTextColor(255,255,255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(emp.nome || "BoxControl PRO", 40, 19);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const linhaEmpresa1 = [
    emp.cnpj ? `CNPJ: ${emp.cnpj}` : "",
    emp.telefone ? `Telefone: ${emp.telefone}` : ""
  ].filter(Boolean).join("   •   ");

  const linhaEmpresa2 = emp.endereco ? `Endereço: ${emp.endereco}` : "";

  if(linhaEmpresa1) doc.text(linhaEmpresa1, 40, 25);
  if(linhaEmpresa2) doc.text(linhaEmpresa2, 40, 30);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("ORDEM DE SERVIÇO", 140, 19);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`OS: ${os.id}`, 140, 25);
  doc.text(`Data: ${os.dataHora || "-"}`, 140, 30);
  doc.text(`Status: ${os.status || "-"}`, 140, 35);

  y = 45;

  // Cliente
  drawSectionTitle(doc, "DADOS DO CLIENTE", y);
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(20,20,20);

  doc.text(`Nome: ${os.clienteNome || "-"}`, 12, y);
  y += 6;
  doc.text(`Telefone: ${os.telefone || "-"}`, 12, y);
  y += 6;
  doc.text(`CPF: ${os.cpf || "-"}`, 12, y);
  y += 6;
  doc.text(`Endereço: ${os.endereco || "-"}`, 12, y);
  y += 10;

  // Veículo
  drawSectionTitle(doc, "DADOS DO VEÍCULO", y);
  y += 12;

  doc.text(`Veículo: ${os.marca || "-"} ${os.modelo || "-"} ${os.ano || ""}`, 12, y);
  y += 6;
  doc.text(`Placa: ${os.placa || "-"}`, 12, y);
  y += 6;
  doc.text(`Cor: ${os.cor || "-"}`, 12, y);
  y += 6;
  doc.text(`Responsável: ${os.funcionarioNome || "-"}`, 12, y);
  y += 10;

  // Itens
  drawSectionTitle(doc, "ITENS / PEÇAS", y);
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Qtd", 12, y);
  doc.text("Descrição", 28, y);
  if(!semPrecos) doc.text("Valor Unit.", 170, y, { align:"right" });
  y += 2;

  doc.setDrawColor(200,200,200);
  doc.line(10, y, 198, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  if(!(os.itens || []).length){
    doc.text("-", 12, y);
    y += 6;
  }else{
    (os.itens || []).forEach(i=>{
      doc.text(String(i.qtd || 0), 12, y);
      const desc = `${i.item || "-"}`;
      const descLines = doc.splitTextToSize(desc, 132);
      doc.text(descLines, 28, y);
      if(!semPrecos) doc.text(`R$ ${money(i.valor)}`, 170, y, { align:"right" });
      y += Math.max(6, descLines.length * 5);

      if(y > 255){
        doc.addPage();
        y = 20;
      }
    });
  }

  y += 4;

  // Mão de obra
  drawSectionTitle(doc, "MÃO DE OBRA", y);
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Descrição", 12, y);
  if(!semPrecos) doc.text("Valor", 170, y, { align:"right" });
  y += 2;
  doc.line(10, y, 198, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  if(!(os.mao || []).length){
    doc.text("-", 12, y);
    y += 6;
  }else{
    (os.mao || []).forEach(m=>{
      const descLines = doc.splitTextToSize(m.desc || "-", 148);
      doc.text(descLines, 12, y);
      if(!semPrecos) doc.text(`R$ ${money(m.valor)}`, 170, y, { align:"right" });
      y += Math.max(6, descLines.length * 5);

      if(y > 255){
        doc.addPage();
        y = 20;
      }
    });
  }

  y += 6;

  // Rodapé financeiro
  doc.setFillColor(245,245,245);
  doc.roundedRect(10, y, 190, 18, 2, 2, "F");
  doc.setDrawColor(220,220,220);
  doc.roundedRect(10, y, 190, 18, 2, 2);

  if(!semPrecos){
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`TOTAL GERAL: R$ ${money(os.total || 0)}`, 194, y + 11, { align:"right" });
  }else{
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text("Versão do funcionário - valores ocultos", 194, y + 11, { align:"right" });
  }

  y += 28;

  // Observação / assinatura
  if(y < 255){
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Observações:", 12, y);
    y += 18;

    doc.line(12, y, 90, y);
    doc.line(120, y, 198, y);
    y += 4;
    doc.setFontSize(8);
    doc.text("Assinatura do cliente", 32, y);
    doc.text("Responsável", 150, y);
  }

  const safeCliente = (os.clienteNome || "cliente").replace(/[^\w\-]+/g, "_");
  doc.save(`OS_${safeCliente}_${os.placa || ""}.pdf`);
}

// =====================================================
// INICIALIZAÇÃO
// =====================================================
setEmpresa(getEmpresa());
applyModeUI();
if(getAppMode().mode !== "funcionario"){
  loadPage("dashboard");
}

document.addEventListener("input", (e) => {
  if (document.getElementById("os_total") && e.target.closest("#formOS")) {
    calcTotalOS();
  }
});
