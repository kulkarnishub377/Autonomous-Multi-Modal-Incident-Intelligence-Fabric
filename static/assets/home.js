const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

const savedTheme = localStorage.getItem('amif_home_theme') || 'dark';
if (savedTheme === 'light') document.body.classList.add('light');

const progress = $('#pageProgress');
function updateProgress(){
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${(scrollY / (max || 1)) * 100}%`;
  $('#siteHeader').classList.toggle('scrolled', scrollY > 18);
  let active = '';
  $$('main section[id]').forEach(section => { if (scrollY >= section.offsetTop - 160) active = section.id; });
  $$('.site-nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${active}`));
}
addEventListener('scroll', updateProgress, {passive:true});
updateProgress();

const io = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) entry.target.classList.add('show');
}), { threshold: .16 });
$$('.reveal').forEach(el => io.observe(el));

function countUp(){
  $$('[data-count]').forEach(el => {
    const target = Number(el.dataset.count || 0);
    const start = performance.now();
    function frame(t){
      const p = Math.min(1, (t - start) / 900);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
}
setTimeout(countUp, 450);

$('#themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('light');
  localStorage.setItem('amif_home_theme', document.body.classList.contains('light') ? 'light' : 'dark');
});
$('#mobileMenuBtn').addEventListener('click', () => $('#siteHeader').classList.toggle('open'));
$$('.site-nav a').forEach(a => a.addEventListener('click', () => $('#siteHeader').classList.remove('open')));

const logLines = [
  '[10:30:00] event.ingested camera_warehouse_a_01 forklift_detected',
  '[10:30:01] event.processed schema=1.0 dedupe=pass',
  '[10:31:10] sensor.reading machine_a temperature=91.5C',
  '[10:31:11] anomaly.generated temperature_anomaly severity=high',
  '[10:31:12] incident.created forklift + overheating correlation',
  '[10:31:15] agent.retriever manual evidence found',
  '[10:31:17] guard.decision human approval required',
  '[10:31:18] dashboard.updated summary + graph + audit ready'
];
const typed = $('#typedLog');
let i = 0, j = 0;
function typeLog(){
  if (!typed) return;
  if (i >= logLines.length) return;
  const line = logLines[i];
  typed.textContent = logLines.slice(0, i).join('\n') + (i ? '\n' : '') + line.slice(0, j);
  j++;
  if (j <= line.length) setTimeout(typeLog, 18);
  else { i++; j = 0; setTimeout(typeLog, 260); }
}
setTimeout(typeLog, 700);

const canvas = $('#heroCanvas');
const ctx = canvas.getContext('2d');
let points = [];
function resize(){
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  points = Array.from({length: Math.min(80, Math.floor(innerWidth/18))}, () => ({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35}));
}
addEventListener('resize', resize); resize();
function animate(){
  ctx.clearRect(0,0,innerWidth,innerHeight);
  ctx.strokeStyle = document.body.classList.contains('light') ? 'rgba(56,189,248,.16)' : 'rgba(103,232,249,.16)';
  ctx.fillStyle = document.body.classList.contains('light') ? 'rgba(56,189,248,.45)' : 'rgba(103,232,249,.45)';
  points.forEach(p => { p.x+=p.vx; p.y+=p.vy; if(p.x<0||p.x>innerWidth)p.vx*=-1; if(p.y<0||p.y>innerHeight)p.vy*=-1; ctx.beginPath(); ctx.arc(p.x,p.y,1.3,0,Math.PI*2); ctx.fill(); });
  for(let a=0;a<points.length;a++) for(let b=a+1;b<points.length;b++){
    const dx=points[a].x-points[b].x, dy=points[a].y-points[b].y, d=Math.hypot(dx,dy);
    if(d<115){ ctx.globalAlpha = 1 - d/115; ctx.beginPath(); ctx.moveTo(points[a].x,points[a].y); ctx.lineTo(points[b].x,points[b].y); ctx.stroke(); ctx.globalAlpha=1; }
  }
  requestAnimationFrame(animate);
}
animate();

/* ==========================================
   INTERACTIVE SHOWCASE SIMULATION LOGIC
   ========================================== */
window.addEventListener('DOMContentLoaded', () => {
  // Tab switching
  const tabs = $$('.showcase-tab');
  const panels = $$('.showcase-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const target = tab.dataset.showcase;
      const targetPanel = $(`#panel-${target}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }

      // Re-trigger SVG graph rendering if graph tab is open
      if (target === 'graph') {
        initShowcaseGraph();
      }
    });
  });

  // Tab 1: Ingestion
  const ingestTerminal = $('#ingestTerminalCode');
  const simPayloads = {
    vision: {
      event_type: "restricted_zone_violation",
      severity: "high",
      source_type: "camera",
      source_id: "camera_zone_a",
      timestamp: new Date().toISOString(),
      location: { site: "plant_1", zone: "zone_a" },
      payload: { object_detected: "forklift", confidence: 0.94 }
    },
    temp: {
      event_type: "temperature_anomaly",
      severity: "high",
      source_type: "iot_sensor",
      source_id: "temp_machine_a",
      timestamp: new Date().toISOString(),
      location: { site: "plant_1", zone: "zone_a" },
      payload: { temperature: 92.4, threshold: 85.0 }
    },
    audio: {
      event_type: "grinding_noise",
      severity: "medium",
      source_type: "microphone",
      source_id: "mic_mach_a",
      timestamp: new Date().toISOString(),
      location: { site: "plant_1", zone: "zone_a" },
      payload: { decibels: 92, frequency: "high_pitch" }
    },
    doc: {
      event_type: "document_indexed",
      severity: "info",
      source_type: "document_service",
      source_id: "doc_quarantine_sop",
      timestamp: new Date().toISOString(),
      payload: { file_name: "sop_quarantine_rules.txt", chunk_count: 5 }
    }
  };

  function displayIngestPayload(key) {
    if (!ingestTerminal) return;
    const data = simPayloads[key];
    ingestTerminal.innerHTML = `<span class="audit-ln">Ingesting signal...</span>\nPOST /api/events HTTP/1.1\nHost: localhost:8000\nContent-Type: application/json\n\n<span style="color:#34d399">${JSON.stringify(data, null, 2)}</span>`;
  }

  $('#simVisionBtn')?.addEventListener('click', () => displayIngestPayload('vision'));
  $('#simTempBtn')?.addEventListener('click', () => displayIngestPayload('temp'));
  $('#simAudioBtn')?.addEventListener('click', () => displayIngestPayload('audio'));
  $('#simDocBtn')?.addEventListener('click', () => displayIngestPayload('doc'));

  // Tab 2: Incident Correlation
  const incCard = $('#showcaseIncidentCard');
  const corBtn = $('#runCorrelationDemoBtn');

  if (incCard) {
    // Initial State: hide timelines
    const timelines = incCard.querySelectorAll('.timeline-point');
    timelines.forEach(t => t.style.opacity = '0.2');
  }

  corBtn?.addEventListener('click', () => {
    if (!incCard) return;
    const timelines = incCard.querySelectorAll('.timeline-point');
    incCard.style.animation = 'none';
    void incCard.offsetHeight; // trigger reflow
    incCard.style.animation = 'scaleIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
    incCard.style.borderColor = 'var(--cyan)';
    incCard.style.boxShadow = '0 0 25px hsla(188, 86%, 53%, 0.25)';

    timelines.forEach((t, index) => {
      t.style.opacity = '0';
      setTimeout(() => {
        t.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        t.style.opacity = '1';
        t.style.transform = 'translateX(4px)';
      }, (index + 1) * 600);
    });

    setTimeout(() => {
      incCard.style.borderColor = '';
      incCard.style.boxShadow = '';
      timelines.forEach(t => t.style.transform = '');
    }, 3200);
  });

  // Tab 3: RAG Search
  const chunkGrid = $('#simChunkGrid');
  const ragInput = $('#simRagInput');
  const ragCitations = $('#simRagCitations');
  const totalChunks = 36;
  const chunkData = [];

  // Seed chunk data
  for (let idx = 0; idx < totalChunks; idx++) {
    chunkData.push({
      id: idx,
      text: idx === 3 ? "Machine A manual. High temperature threshold is 85°C." :
            idx === 11 ? "Safety SOP. Temperature must not exceed limits." :
            idx === 24 ? "Coolant verification is required if temp reaches 90°C." :
            idx === 8 ? "CCTV monitor detects forklift entry near zone A." :
            idx === 15 ? "Forklift operation restricted next to machinery." :
            idx === 1 ? "Bearing friction anomaly detected on core rotor." :
            idx === 19 ? "Grinding noise signature indicates rotor bearing wear." :
            "System telemetry log healthy node active status."
    });
  }

  function initChunkGrid() {
    if (!chunkGrid) return;
    chunkGrid.innerHTML = Array.from({ length: totalChunks }, (_, idx) => 
      `<div class="chunk-block" data-chunk-idx="${idx}" title="Chunk #${idx}"></div>`
    ).join('');

    // Attach click listeners to blocks
    chunkGrid.querySelectorAll('.chunk-block').forEach(block => {
      block.addEventListener('click', () => {
        const idx = Number(block.dataset.chunkIdx);
        if (ragCitations) {
          ragCitations.innerHTML = `<div class="citation-item"><b>INSPECTED CHUNK #${idx}</b><br><span style="color:var(--cyan);">${chunkData[idx].text}</span></div>`;
        }
        chunkGrid.querySelectorAll('.chunk-block').forEach(b => b.classList.remove('highlighted'));
        block.classList.add('highlighted');
      });
    });
  }

  function runRagSearch(query) {
    if (!chunkGrid) return;
    const blocks = chunkGrid.querySelectorAll('.chunk-block');
    blocks.forEach(b => {
      b.className = 'chunk-block';
    });

    const term = query.toLowerCase().trim();
    if (!term) {
      if (ragCitations) ragCitations.innerHTML = '<div class="citation-item muted">// Enter query in input above...</div>';
      return;
    }

    const matches = [];
    chunkData.forEach(chunk => {
      if (chunk.text.toLowerCase().includes(term)) {
        matches.push(chunk.id);
      }
    });

    if (matches.length > 0) {
      matches.forEach((id, index) => {
        const block = blocks[id];
        if (block) {
          const intensity = Math.min(3, index);
          block.classList.add(`matched-${intensity}`);
          block.classList.add('highlighted');
        }
      });
      if (ragCitations) {
        ragCitations.innerHTML = matches.map(id => 
          `<div class="citation-item" style="margin-bottom:8px;"><b>CITED CHUNK #${id}</b>: "${chunkData[id].text}" · Score ${(0.96 - id*0.005).toFixed(2)}</div>`
        ).join('');
      }
    } else {
      if (ragCitations) {
        ragCitations.innerHTML = `<div class="citation-item" style="color:var(--red);">No semantic matches found.</div>`;
      }
    }
  }

  ragInput?.addEventListener('input', (e) => runRagSearch(e.target.value));
  initChunkGrid();
  if (ragInput) runRagSearch(ragInput.value);

  // Tab 4: Agent Workflow
  const runAgentBtn = $('#simRunAgentBtn');
  const agentTerminal = $('#agentShowcaseTerminal');
  const agentSteps = ['obs', 'ret', 'inv', 'plan', 'guard', 'exe'];
  const agentLogs = {
    obs: "[SYSTEM] Observer perceiving high priority event streams...\n[OBSERVER] Detected forklift intrusion at 10:30:00 & machine_temp_warning (92.4°C) at 10:31:10.",
    ret: "[RETRIEVER] Vectorizing context. Querying Qdrant index...\n[RETRIEVER] SOP citation retrieved: safety_sop_zones.txt (Lock Zone A gates if machine A overheats).",
    inv: "[INVESTIGATOR] Hypothesizing root causes...\n[INVESTIGATOR] Cause identified: Mechanical friction from restricted forklift entry near rotor bearing.",
    plan: "[PLANNER] Formulating response checklist...\n[PLANNER] Action command structured: quarantine_zone_a + unlock_ventilation_shutter.",
    guard: "[GUARD] Analyzing safety policy bounds...\n[GUARD] Operations boundary: lock gate status complies. Clearance granted.",
    exe: "[EXECUTOR] Emitting command to action commands bus...\n[SYSTEM] Action commands published. Quarantine strobe activated."
  };

  runAgentBtn?.addEventListener('click', () => {
    if (!agentTerminal) return;
    runAgentBtn.disabled = true;
    agentTerminal.textContent = '';
    
    const nodes = $$('.agent-graph-node');
    nodes.forEach(n => {
      n.classList.remove('active', 'done');
    });

    let currentStep = 0;

    function step() {
      if (currentStep >= agentSteps.length) {
        runAgentBtn.disabled = false;
        agentTerminal.textContent += "\n\n[SYSTEM] Agentic audit sequence complete. Actions logged.";
        return;
      }

      const key = agentSteps[currentStep];
      const node = $(`.agent-graph-node[data-node="${key}"]`);
      
      // Update nodes states
      if (currentStep > 0) {
        const prevKey = agentSteps[currentStep - 1];
        const prevNode = $(`.agent-graph-node[data-node="${prevKey}"]`);
        prevNode?.classList.remove('active');
        prevNode?.classList.add('done');
      }

      node?.classList.add('active');
      
      // Append logs
      agentTerminal.innerHTML += (currentStep ? '\n\n' : '') + agentLogs[key];
      agentTerminal.scrollTop = agentTerminal.scrollHeight;

      currentStep++;
      setTimeout(step, 950);
    }

    step();
  });

  // Tab 5: SVG Graph
  const graphNodes = [
    { id: 'inc_01', label: 'INC-01', type: 'Incident', x: 200, y: 150, color: 'var(--violet)' },
    { id: 'ev_01', label: 'EV-01', type: 'Event', x: 100, y: 80, color: 'var(--cyan)' },
    { id: 'ev_02', label: 'EV-02', type: 'Event', x: 100, y: 220, color: 'var(--cyan)' },
    { id: 'doc_01', label: 'SOP-01', type: 'Document', x: 300, y: 80, color: 'var(--green)' },
    { id: 'asset_01', label: 'Mach-A', type: 'Asset', x: 300, y: 220, color: 'var(--yellow)' }
  ];
  
  const graphEdges = [
    { source: 'inc_01', target: 'ev_01', rel: 'CORRELATED_WITH' },
    { source: 'inc_01', target: 'ev_02', rel: 'CORRELATED_WITH' },
    { source: 'inc_01', target: 'doc_01', rel: 'CITES_SOP' },
    { source: 'inc_01', target: 'asset_01', rel: 'AFFECTS_ASSET' },
    { source: 'ev_02', target: 'asset_01', rel: 'EMITTED_BY' }
  ];

  function initShowcaseGraph() {
    const svg = $('#simGraphSvg');
    if (!svg) return;

    svg.innerHTML = ''; // clear

    // Render edges lines
    const linesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    graphEdges.forEach((edge, idx) => {
      const sNode = graphNodes.find(n => n.id === edge.source);
      const tNode = graphNodes.find(n => n.id === edge.target);
      if (sNode && tNode) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute('x1', sNode.x);
        line.setAttribute('y1', sNode.y);
        line.setAttribute('x2', tNode.x);
        line.setAttribute('y2', tNode.y);
        line.setAttribute('class', 'graph-edge-line');
        line.setAttribute('id', `sim-edge-${idx}`);
        linesGroup.appendChild(line);
      }
    });
    svg.appendChild(linesGroup);

    // Render nodes
    const nodesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    graphNodes.forEach(node => {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute('cx', node.x);
      circle.setAttribute('cy', node.y);
      circle.setAttribute('r', node.id === 'inc_01' ? 18 : 13);
      circle.setAttribute('fill', node.color);
      circle.setAttribute('opacity', '0.85');
      circle.setAttribute('class', 'graph-node-circle');
      circle.setAttribute('data-node-id', node.id);

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute('x', node.x);
      label.setAttribute('y', node.y + 4);
      label.setAttribute('class', 'graph-node-label');
      label.textContent = node.label;

      g.appendChild(circle);
      g.appendChild(label);
      
      // Node events
      const hoverInfo = $('#simGraphHoverInfo');
      g.addEventListener('mouseover', () => {
        circle.setAttribute('r', node.id === 'inc_01' ? 22 : 16);
        circle.setAttribute('opacity', '1');
        
        // Highlight active lines
        graphEdges.forEach((edge, idx) => {
          if (edge.source === node.id || edge.target === node.id) {
            $(`#sim-edge-${idx}`)?.classList.add('active');
          }
        });

        if (hoverInfo) {
          const typeStr = `<span style="color:${node.color}; font-weight:800;">${node.type}</span>`;
          const relations = graphEdges
            .filter(e => e.source === node.id || e.target === node.id)
            .map(e => {
              const otherId = e.source === node.id ? e.target : e.source;
              const otherNode = graphNodes.find(n => n.id === otherId);
              return `${node.label} <b style="color:var(--cyan);">${e.rel}</b> ${otherNode?.label}`;
            }).join(' · ');
          hoverInfo.innerHTML = `<div>Node: ${typeStr} <b>${node.label}</b><br><small style="opacity:0.85">${relations || 'No adjacent links'}</small></div>`;
        }
      });

      g.addEventListener('mouseout', () => {
        circle.setAttribute('r', node.id === 'inc_01' ? 18 : 13);
        circle.setAttribute('opacity', '0.85');
        $$('.graph-edge-line').forEach(line => line.classList.remove('active'));
        if (hoverInfo) {
          hoverInfo.textContent = 'Hover over any node to inspect relationship details.';
        }
      });

      nodesGroup.appendChild(g);
    });
    svg.appendChild(nodesGroup);
  }

  // Tab 6: Governance & Audit RBAC Matrix
  const rolePills = $$('.role-pill');
  const simPermList = $('#simPermissionList');
  const simAudit = $('#simAuditStream');

  const permissionsMap = {
    Admin: [
      { name: "View incidents & alerts", ok: true },
      { name: "Acknowledge / resolve warnings", ok: true },
      { name: "Upload & index RAG SOPs", ok: true },
      { name: "Run agent investigations", ok: true },
      { name: "Manage operators & users", ok: true },
      { name: "View structured audit trail", ok: true }
    ],
    Operator: [
      { name: "View incidents & alerts", ok: true },
      { name: "Acknowledge / resolve warnings", ok: true },
      { name: "Upload & index RAG SOPs", ok: false },
      { name: "Run agent investigations", ok: true },
      { name: "Manage operators & users", ok: false },
      { name: "View structured audit trail", ok: false }
    ],
    Analyst: [
      { name: "View incidents & alerts", ok: true },
      { name: "Acknowledge / resolve warnings", ok: false },
      { name: "Upload & index RAG SOPs", ok: true },
      { name: "Run agent investigations", ok: true },
      { name: "Manage operators & users", ok: false },
      { name: "View structured audit trail", ok: false }
    ],
    Viewer: [
      { name: "View incidents & alerts", ok: true },
      { name: "Acknowledge / resolve warnings", ok: false },
      { name: "Upload & index RAG SOPs", ok: false },
      { name: "Run agent investigations", ok: false },
      { name: "Manage operators & users", ok: false },
      { name: "View structured audit trail", ok: false }
    ]
  };

  const auditLines = {
    Admin: [
      `[10:45:00] rbac.authorized client=admin@example.com role=Admin`,
      `[10:45:02] user.created operator_zone_a@example.com role=Operator`,
      `[10:45:10] config.applied db_mode=auto density=comfortable`
    ],
    Operator: [
      `[10:46:00] rbac.authorized client=operator@example.com role=Operator`,
      `[10:46:12] alert.acknowledged alert_id=alt_01 incident_id=inc_01`,
      `[10:46:15] agent.triggered incident_id=inc_01 workflow=v1.2.0`
    ],
    Analyst: [
      `[10:47:00] rbac.authorized client=analyst@example.com role=Analyst`,
      `[10:47:05] document.indexed file_name=machine_a_manual.txt`,
      `[10:47:11] search.query terms="overheating machine A rotor"`
    ],
    Viewer: [
      `[10:48:00] rbac.authorized client=viewer@example.com role=Viewer`,
      `[10:48:05] view.rendered section=overview`,
      `[10:48:10] view.rendered section=incidents`
    ]
  };

  function updateRbacShowcase(role) {
    if (!simPermList || !simAudit) return;

    // Permissions
    const list = permissionsMap[role];
    simPermList.innerHTML = list.map(item => 
      `<li class="${item.ok ? 'allowed' : 'denied'}">
        <span>${item.name}</span>
        <b>${item.ok ? '<span style="color:var(--green)">✓ Grant</span>' : '<span style="color:var(--red)">— Denied</span>'}</b>
      </li>`
    ).join('');

    // Audit logs
    const lines = auditLines[role];
    simAudit.innerHTML = lines.map(ln => `<div class="audit-ln">${ln}</div>`).join('');
  }

  rolePills.forEach(pill => {
    pill.addEventListener('click', () => {
      rolePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      updateRbacShowcase(pill.dataset.role);
    });
  });

  // Init default showcase items
  displayIngestPayload('vision');
  initShowcaseGraph();
  updateRbacShowcase('Admin');
});

