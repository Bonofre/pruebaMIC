window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.lang = "es-CL";
recognition.interimResults = true;
recognition.continuous = true;

// ── Palabras clave de comando ──────────────────────────────────────────────
// Agrupa variantes para cada acción. Editar aquí para añadir más alias.
const COMMANDS = {
  guardar: [
    "guardar", "guardar descripción", "guardar muestra",
    "guardar pieza", "guardar resultado", "guardar fragmento"
  ],
  continuar: [
    "continuar", "siguiente", "siguiente muestra", "nueva muestra",
    "nueva pieza", "siguiente pieza", "próxima muestra", "nueva descripción"
  ],
  borrar: [
    "borrar", "limpiar", "borrar todo", "limpiar texto", "cancelar"
  ],
};

// ── Estado ──────────────────────────────────────────────────────────────────
let finalTranscript = "";
let savedDescriptions = [];
let sampleCounter = 1;
let listening = false;

// ── DOM ─────────────────────────────────────────────────────────────────────
const btnStart       = document.getElementById("btnStart");
const btnStop        = document.getElementById("btnStop");
const output         = document.getElementById("output");
const statusBadge    = document.getElementById("statusBadge");
const descriptionList = document.getElementById("descriptionList");
const emptyNote      = document.getElementById("emptyNote");

// ── Controles ────────────────────────────────────────────────────────────────
btnStart.addEventListener("click", () => {
  if (!listening) {
    recognition.start();
    listening = true;
    setStatus("escuchando");
  }
});

btnStop.addEventListener("click", () => {
  recognition.stop();
  listening = false;
  setStatus("detenido");
});

// ── Reconocimiento ───────────────────────────────────────────────────────────
recognition.addEventListener("result", (e) => {
  let interim = "";

  for (let i = e.resultIndex; i < e.results.length; i++) {
    const text = e.results[i][0].transcript;

    if (e.results[i].isFinal) {
      const cmd = detectCommand(text);
      if (cmd) {
        executeCommand(cmd);
      } else {
        finalTranscript += text + " ";
      }
    } else {
      interim += text;
    }
  }

  renderOutput(interim);
});

recognition.addEventListener("end", () => {
  if (listening) recognition.start();
});

recognition.addEventListener("error", (e) => {
  console.error("Error de reconocimiento:", e.error);
  if (e.error !== "no-speech") setStatus("error");
});

// ── Detección de comandos ────────────────────────────────────────────────────
function detectCommand(text) {
  const normalized = text.trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // quitar tildes

  for (const [action, variants] of Object.entries(COMMANDS)) {
    for (const variant of variants) {
      const v = variant.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (normalized.includes(v)) return action;
    }
  }
  return null;
}

function executeCommand(cmd) {
  flashCommand(cmd);

  if (cmd === "guardar") {
    guardarDescripcion();
  } else if (cmd === "continuar") {
    guardarDescripcion();
    nuevaDescripcion();
  } else if (cmd === "borrar") {
    finalTranscript = "";
    renderOutput("");
  }
}

// ── Acciones ─────────────────────────────────────────────────────────────────
function guardarDescripcion() {
  const texto = finalTranscript.trim();
  if (!texto) return;

  const item = {
    id: Date.now(),
    numero: sampleCounter++,
    texto,
    hora: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
  };

  savedDescriptions.unshift(item);
  finalTranscript = "";
  renderOutput("");
  renderDescriptions();
}

function nuevaDescripcion() {
  finalTranscript = "";
  renderOutput("");
}

// ── Renderizado ───────────────────────────────────────────────────────────────
function renderOutput(interim) {
  const finalHtml = finalTranscript
    ? `<span class="final">${finalTranscript}</span>`
    : "";
  const interimHtml = interim
    ? `<span class="interim">${interim}</span>`
    : "";

  output.innerHTML = finalHtml + interimHtml;
}

function renderDescriptions() {
  emptyNote.style.display = savedDescriptions.length ? "none" : "block";
  descriptionList.innerHTML = "";

  savedDescriptions.forEach((item) => {
    const card = document.createElement("div");
    card.className = "desc-card";
    card.innerHTML = `
      <div class="desc-header">
        <span class="desc-label">Muestra #${item.numero}</span>
        <span class="desc-time">${item.hora}</span>
        <button class="btn-copy" title="Copiar" onclick="copyText(${item.id})">Copiar</button>
        <button class="btn-delete" title="Eliminar" onclick="deleteDesc(${item.id})">✕</button>
      </div>
      <p class="desc-text">${item.texto}</p>
    `;
    descriptionList.appendChild(card);
  });
}

function setStatus(state) {
  const labels = {
    escuchando: { text: "Escuchando", cls: "status-on" },
    detenido:   { text: "Detenido",   cls: "status-off" },
    error:      { text: "Error",      cls: "status-error" },
  };
  const s = labels[state] || labels.detenido;
  statusBadge.textContent = s.text;
  statusBadge.className = "status-badge " + s.cls;
}

function flashCommand(cmd) {
  const labels = {
    guardar:   "Guardando descripción…",
    continuar: "Guardando y continuando…",
    borrar:    "Texto borrado",
  };
  const flash = document.getElementById("commandFlash");
  flash.textContent = labels[cmd] || cmd;
  flash.classList.add("visible");
  setTimeout(() => flash.classList.remove("visible"), 2000);
}

// ── Helpers globales (usados en onclick inline) ───────────────────────────────
window.copyText = (id) => {
  const item = savedDescriptions.find(d => d.id === id);
  if (item) navigator.clipboard.writeText(item.texto);
};

window.deleteDesc = (id) => {
  savedDescriptions = savedDescriptions.filter(d => d.id !== id);
  renderDescriptions();
};

// ── Init ─────────────────────────────────────────────────────────────────────
setStatus("detenido");
renderDescriptions();
