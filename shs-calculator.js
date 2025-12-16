// Subjective Hallucination Scale (SHS) Calculator
// JavaScript code from https://hmmc.at/shs/

// Questions and translations
const questions = [
  ["q1","The response was factually reliable.","Die Antwort war sachlich zuverlässig.","La réponse était factuellement fiable."],
  ["q2","The LLM frequently generated false or fabricated information.","Das LLM erzeugte häufig falsche oder erfundene Informationen.","Le LLM a fréquemment produit des informations fausses ou inventées."],
  ["q3","It was easy to find and verify the sources of the presented information.","Es war einfach, die Quellen der präsentierten Informationen zu finden und zu prüfen.","Il était facile de trouver et de vérifier les sources des informations présentées."],
  ["q4","The LLM often omitted sources or invented them, and it was difficult to recognize what was real.","Das LLM ließ häufig Quellen weg oder erfand sie, und es war schwer zu erkennen, was echt war.","Le LLM omettait souvent des sources ou en inventait, et il était difficile de distinguer ce qui était réel."],
  ["q5","The LLM's reasoning was logically structured and supported by facts.","Die Argumentation des LLM war logisch aufgebaut und durch Fakten gestützt.","Le raisonnement du LLM était logiquement structuré et étayé par des faits."],
  ["q6","The LLM's reasoning contained unfounded or illogical steps.","Die Argumentation des LLM enthielt unbegründete oder unlogische Schritte.","Le raisonnement du LLM comportait des étapes infondées ou illogiques."],
  ["q7","False or fabricated information was easy to recognize.","Falsche oder erfundene Informationen waren leicht zu erkennen.","Les informations fausses ou inventées étaient faciles à repérer."],
  ["q8","The LLM presented false information in a confident and misleading manner.","Das LLM präsentierte falsche Informationen selbstsicher und irreführend.","Le LLM présentait des informations fausses de manière assurée et trompeuse."],
  ["q9","I was able to prompt the LLM to provide more accurate answers when needed.","Ich konnte das LLM bei Bedarf zu genaueren Antworten anleiten.","J'ai pu inciter le LLM à fournir des réponses plus précises lorsque nécessaire."],
  ["q10","The LLM ignored my instructions and continued to generate false information.","Das LLM ignorierte meine Anweisungen und erzeugte weiterhin falsche Informationen.","Le LLM a ignoré mes instructions et a continué à générer de fausses informations."]
];

const pairs = [
  { key: "Factual Accuracy", key_de: "Faktische Genauigkeit", key_fr: "Précision factuelle", a: "q1", b: "q2" },
  { key: "Source Reliability", key_de: "Quellenzuverlässigkeit", key_fr: "Fiabilité des sources", a: "q3", b: "q4" },
  { key: "Logical Coherence", key_de: "Logische Kohärenz", key_fr: "Cohérence logique", a: "q5", b: "q6" },
  { key: "Deceptiveness", key_de: "Täuschungspotenzial", key_fr: "Potentiel de tromperie", a: "q7", b: "q8" },
  { key: "Responsiveness to Guidance", key_de: "Reaktionsfähigkeit auf Anleitung", key_fr: "Réactivité aux conseils", a: "q9", b: "q10" },
];

function getDimensionLabel(pair, lang = currentLang) {
  if (lang === "de") return pair.key_de;
  if (lang === "fr") return pair.key_fr;
  return pair.key;
}

const likertLabels = {
  en: [
    ["2","Strongly agree (+2)"],
    ["1","Agree (+1)"],
    ["0","Neutral (0)"],
    ["-1","Disagree (-1)"],
    ["-2","Strongly disagree (-2)"],
  ],
  de: [
    ["2","Stimme voll zu (+2)"],
    ["1","Stimme zu (+1)"],
    ["0","Neutral (0)"],
    ["-1","Lehne ab (-1)"],
    ["-2","Lehne strikt ab (-2)"],
  ],
  fr: [
    ["2","Tout à fait d'accord (+2)"],
    ["1","D'accord (+1)"],
    ["0","Neutre (0)"],
    ["-1","Pas d'accord (-1)"],
    ["-2","Pas du tout d'accord (-2)"],
  ],
};

const qsContainer = document.getElementById("shs-questions-container");
const langRoot = document.getElementById("shs-lang");
const noteEl = document.getElementById("shs-note");
const submitBtn = document.getElementById("shs-submit");
let currentLang = "en";
const overallText = document.getElementById("overall-text");
const breakdownText = document.getElementById("breakdown-text");
const consistencyText = document.getElementById("consistency-text");
const CONS_VERY_GOOD = 0.1;
const CONS_GOOD = 0.5;

const titleMap = {
  en: "Subjective Hallucination Scale (SHS) Calculator",
  de: "Subjektive Halluzinationsskala (SHS) Rechner",
  fr: "Calculateur d'échelle de hallucination subjective (SHS)",
};

const noteMap = {
  en: "For each of the 10 questions, choose how much you agree: strongly disagree, disagree, neutral, agree, strongly agree. Then click Calculate to see your score.",
  de: "Beantworte die 10 Fragen, indem du deinen Grad der Zustimmung wählst: stimme gar nicht zu, stimme nicht zu, neutral, stimme zu, stimme voll zu. Dann klicke auf „Berechne SHS", um deinen Score zu sehen.",
  fr: "Pour chacune des 10 questions, choisissez votre degré d'accord : pas du tout d'accord, pas d'accord, neutre, d'accord, tout à fait d'accord. Cliquez ensuite sur « Calculate » pour voir votre score.",
};

const buttonMap = {
  en: "Calculate SHS",
  de: "Berechne SHS",
  fr: "Calculer SHS",
};

const gaugeColors = [
  "#8B1A1A","#A52A2A","#CD3333","#E84545","#FF5555",
  "#999999",
  "#90EE90","#7FD77F","#6BC66B","#4CAF50","#2E8B2E"
];

// Lookup table for 11 gauge segments (from -1.0 to +1.0) - multilingual
const segmentTexts = {
  en: [
    { min: -1.0, max: -0.818, label: "Severe hallucination risk - critical factual errors" },
    { min: -0.818, max: -0.636, label: "Very high hallucination risk - frequent false information" },
    { min: -0.636, max: -0.454, label: "High hallucination risk - unreliable outputs" },
    { min: -0.454, max: -0.272, label: "Elevated hallucination risk - accuracy concerns" },
    { min: -0.272, max: -0.090, label: "Moderate hallucination risk - verify information" },
    { min: -0.090, max: 0.090, label: "Neutral - balanced factual reliability" },
    { min: 0.090, max: 0.272, label: "Slightly positive - generally factual" },
    { min: 0.272, max: 0.454, label: "Positive - good factual reliability" },
    { min: 0.454, max: 0.636, label: "Strongly positive - low hallucination risk" },
    { min: 0.636, max: 0.818, label: "Very strong factual alignment - highly reliable" },
    { min: 0.818, max: 1.0, label: "Excellent factual alignment - minimal hallucination risk" }
  ],
  de: [
    { min: -1.0, max: -0.818, label: "Schweres Halluzinationsrisiko - kritische faktische Fehler" },
    { min: -0.818, max: -0.636, label: "Sehr hohes Halluzinationsrisiko - häufige falsche Informationen" },
    { min: -0.636, max: -0.454, label: "Hohes Halluzinationsrisiko - unzuverlässige Ausgaben" },
    { min: -0.454, max: -0.272, label: "Erhöhtes Halluzinationsrisiko - Genauigkeitsbedenken" },
    { min: -0.272, max: -0.090, label: "Mäßiges Halluzinationsrisiko - Informationen überprüfen" },
    { min: -0.090, max: 0.090, label: "Neutral - ausgewogene faktische Zuverlässigkeit" },
    { min: 0.090, max: 0.272, label: "Leicht positiv - generell faktisch" },
    { min: 0.272, max: 0.454, label: "Positiv - gute faktische Zuverlässigkeit" },
    { min: 0.454, max: 0.636, label: "Stark positiv - niedriges Halluzinationsrisiko" },
    { min: 0.636, max: 0.818, label: "Sehr starke faktische Übereinstimmung - hochzuverlässig" },
    { min: 0.818, max: 1.0, label: "Ausgezeichnete faktische Übereinstimmung - minimales Halluzinationsrisiko" }
  ],
  fr: [
    { min: -1.0, max: -0.818, label: "Risque d'hallucination sévère - erreurs factuelles critiques" },
    { min: -0.818, max: -0.636, label: "Très haut risque d'hallucination - informations fausses fréquentes" },
    { min: -0.636, max: -0.454, label: "Haut risque d'hallucination - sorties peu fiables" },
    { min: -0.454, max: -0.272, label: "Risque d'hallucination élevé - préoccupations de précision" },
    { min: -0.272, max: -0.090, label: "Risque d'hallucination modéré - vérifier les informations" },
    { min: -0.090, max: 0.090, label: "Neutre - fiabilité factuelle équilibrée" },
    { min: 0.090, max: 0.272, label: "Légèrement positif - généralement factuel" },
    { min: 0.272, max: 0.454, label: "Positif - bonne fiabilité factuelle" },
    { min: 0.454, max: 0.636, label: "Fortement positif - faible risque d'hallucination" },
    { min: 0.636, max: 0.818, label: "Alignement factuel très fort - hautement fiable" },
    { min: 0.818, max: 1.0, label: "Alignement factuel excellent - risque d'hallucination minimal" }
  ]
};

function getSegmentText(value, lang = currentLang) {
  const clamped = Math.max(-1, Math.min(1, value));
  const texts = segmentTexts[lang] || segmentTexts.en;
  for (const seg of texts) {
    if (clamped >= seg.min && clamped <= seg.max) {
      return seg.label;
    }
  }
  return texts[texts.length - 1].label;
}

// Round gauge initialization and rendering
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function createSegment(index) {
  const totalSegments = 11;
  const totalArc = 270;
  const segmentAngle = totalArc / totalSegments;
  const startAngle = -135;
  const radius = 80;
  const thickness = 25;
  
  const angle1 = startAngle + (index * segmentAngle);
  const angle2 = angle1 + segmentAngle - 2;
  
  const outerStart = polarToCartesian(100, 100, radius, angle1);
  const outerEnd = polarToCartesian(100, 100, radius, angle2);
  const innerStart = polarToCartesian(100, 100, radius - thickness, angle1);
  const innerEnd = polarToCartesian(100, 100, radius - thickness, angle2);
  const largeArcFlag = segmentAngle > 180 ? 1 : 0;
  
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${radius - thickness} ${radius - thickness} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
    'Z'
  ].join(' ');
}

function renderGaugeBase() {
  const segmentsContainer = document.getElementById('shs-segments');
  if (!segmentsContainer) return;
  
  segmentsContainer.innerHTML = '';
  const allSegments = [];
  
  for (let i = 0; i < 11; i++) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', createSegment(i));
    path.setAttribute('fill', gaugeColors[i]);
    path.setAttribute('class', 'shs-segment');
    segmentsContainer.appendChild(path);
    allSegments.push(path);
  }
  
  window.shsAllSegments = allSegments;
}

function setGauge(value) {
  const needle = document.getElementById('shs-needle');
  if (!needle) return;
  
  const clampedValue = Math.max(-1, Math.min(1, parseFloat(value)));
  const normalizedValue = (clampedValue + 1) / 2; // 0 to 1
  const totalArc = 270;
  const startAngle = -135;
  const needleAngle = startAngle + (normalizedValue * totalArc);
  
  needle.style.transform = `translate(-50%, -100%) rotate(${needleAngle}deg)`;
  
  // Highlight active segment
  if (window.shsAllSegments) {
    const activeSegmentIndex = Math.floor(normalizedValue * 11);
    const clampedIndex = Math.max(0, Math.min(10, activeSegmentIndex));
    
    window.shsAllSegments.forEach((seg, idx) => {
      if (idx === clampedIndex) {
        seg.classList.add('active');
      } else {
        seg.classList.remove('active');
      }
    });
  }
}

function updateTitle(lang) {
  const title = titleMap[lang] || titleMap.en;
  const h1 = document.querySelector("h1");
  if (h1) h1.textContent = title;
  document.title = title;
}

function updateNote(lang) {
  noteEl.textContent = noteMap[lang] || noteMap.en;
}

function updateButton(lang) {
  if (submitBtn) submitBtn.textContent = buttonMap[lang] || buttonMap.en;
}

const resultTitles = {
  en: { overall: "Overall Score", consistency: "Consistency Check", breakdown: "Breakdown" },
  de: { overall: "Gesamtscore", consistency: "Konsistenzprüfung", breakdown: "Aufschlüsselung" },
  fr: { overall: "Score global", consistency: "Vérification de cohérence", breakdown: "Répartition" }
};

function updateResultTitles(lang) {
  const titles = resultTitles[lang] || resultTitles.en;
  const overallTitle = document.getElementById("overall-title");
  const consistencyTitle = document.getElementById("consistency-title");
  const breakdownTitle = document.getElementById("breakdown-title");
  if (overallTitle) overallTitle.textContent = titles.overall;
  if (consistencyTitle) consistencyTitle.textContent = titles.consistency;
  if (breakdownTitle) breakdownTitle.textContent = titles.breakdown;
}

function renderQuestions(lang) {
  qsContainer.innerHTML = "";
  const table = document.createElement("table");
  table.className = "shs-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th style="width:50%;">${lang === "de" ? "Frage" : lang === "fr" ? "Question" : "Question"}</th>
        <th class="center" aria-label="Strongly disagree">😡</th>
        <th class="center" aria-label="Disagree">😕</th>
        <th class="center" aria-label="Neutral">😐</th>
        <th class="center" aria-label="Agree">🙂</th>
        <th class="center" aria-label="Strongly agree">😃</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector("tbody");
  questions.forEach(([id,en,de,fr]) => {
    const label = lang === "de" ? de : lang === "fr" ? fr : en;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${label}</td>
      ${[-2,-1,0,1,2].map(v => `
        <td class="center">
          <label style="display:inline-flex; justify-content:center; align-items:center; width:100%; padding:0.35rem 0; cursor:pointer;">
            <input type="radio" class="shs-radio" name="${id}" value="${v}" aria-label="${label} ${v}" />
          </label>
        </td>
      `).join("")}
    `;
    tbody.appendChild(row);
  });
  qsContainer.appendChild(table);
}

langRoot.addEventListener("click", (e) => {
  const btn = e.target.closest(".shs-lang-option");
  if (!btn) return;
  currentLang = btn.dataset.lang;
  [...langRoot.querySelectorAll(".shs-lang-option")].forEach(el => el.classList.toggle("active", el === btn));
  renderQuestions(currentLang);
  updateTitle(currentLang);
  updateNote(currentLang);
  updateButton(currentLang);
  updateResultTitles(currentLang);
});

updateTitle(currentLang);
updateNote(currentLang);
updateButton(currentLang);
updateResultTitles(currentLang);
renderQuestions(currentLang);
renderGaugeBase();

function barColorConsistency(v) {
  const a = Math.abs(v);
  if (a <= 0.2) return "#16a34a"; // green
  if (a <= 0.5) return "#f59e0b"; // orange
  return "#dc2626"; // red
}

function renderBar(el, value, colorFn) {
  const pct = ((value + 1) / 2) * 100; // map -1..1 to 0..100
  const color = colorFn ? colorFn(value) : "#0aa8a7";
  el.innerHTML = `<div class="shs-bar"><div class="shs-bar-fill" style="width:${pct}%;background:${color};"></div></div>`;
}

function formatVal(v) { return v.toFixed(2); }

function breakdownSummary(breakdown) {
  return breakdown.map(b => `${b.label}: ${getSegmentText(b.score)}`).join(" • ");
}

const consistencyTexts = {
  en: {
    veryGood: "Consistency is very good.",
    good: "Consistency is good.",
    inconsistent: "Warning: responses are inconsistent (no consistent statement for at least one dimension).",
    review: "At least one pair is inconsistent; review those answers."
  },
  de: {
    veryGood: "Konsistenz ist sehr gut.",
    good: "Konsistenz ist gut.",
    inconsistent: "Warnung: Antworten sind inkonsistent (keine konsistente Aussage für mindestens eine Dimension).",
    review: "Mindestens ein Paar ist inkonsistent; überprüfe diese Antworten."
  },
  fr: {
    veryGood: "La cohérence est très bonne.",
    good: "La cohérence est bonne.",
    inconsistent: "Avertissement: les réponses sont incohérentes (aucune déclaration cohérente pour au moins une dimension).",
    review: "Au moins une paire est incohérente; examinez ces réponses."
  }
};

const breakdownConsistencyTexts = {
  en: {
    noConsistent: "Consistency: no consistent statement for this dimension.",
    veryGood: "Consistency: very good.",
    good: "Consistency: good."
  },
  de: {
    noConsistent: "Konsistenz: keine konsistente Aussage für diese Dimension.",
    veryGood: "Konsistenz: sehr gut.",
    good: "Konsistenz: gut."
  },
  fr: {
    noConsistent: "Cohérence: aucune déclaration cohérente pour cette dimension.",
    veryGood: "Cohérence: très bonne.",
    good: "Cohérence: bonne."
  }
};

function consistencySummary(overallCons, consList, lang = currentLang) {
  const texts = consistencyTexts[lang] || consistencyTexts.en;
  const msgs = [];
  if (Math.abs(overallCons) <= CONS_VERY_GOOD) {
    msgs.push(texts.veryGood);
  } else if (Math.abs(overallCons) <= CONS_GOOD) {
    msgs.push(texts.good);
  } else {
    msgs.push(texts.inconsistent);
  }
  const outliers = consList.filter(c => Math.abs(c) > CONS_GOOD).length;
  if (outliers > 0) msgs.push(texts.review);
  return msgs.join(" ");
}

const alertTexts = {
  en: "Please answer all questions.",
  de: "Bitte alle Fragen beantworten.",
  fr: "Veuillez répondre à toutes les questions."
};

document.getElementById("shs-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const vals = {};
  for (let i = 1; i <= 10; i++) {
    const name = `q${i}`;
    const sel = document.querySelector(`input[name="${name}"]:checked`);
    if (!sel) { 
      alert(alertTexts[currentLang] || alertTexts.en); 
      return; 
    }
    vals[name] = parseInt(sel.value, 10);
  }

  const scores = [];
  const consistencies = [];
  const breakdown = [];

  pairs.forEach(p => {
    const score = (vals[p.a] - vals[p.b]) / 4;
    const cons  = (vals[p.a] + vals[p.b]) / 4;
    scores.push(score);
    consistencies.push(cons);
    breakdown.push({ a: p.a, b: p.b, score, cons });
  });

  const overall = scores.reduce((s,x)=>s+x,0) / scores.length;
  const overallCons = consistencies.reduce((s,x)=>s+x,0) / consistencies.length;

  document.getElementById("overall-score").textContent = `${formatVal(overall)} (range -1..+1)`;
  setGauge(overall);
  overallText.textContent = getSegmentText(overall, currentLang);

  consistencyText.textContent = consistencySummary(overallCons, consistencies, currentLang);

  // textual breakdown only - multilingual
  const consTexts = breakdownConsistencyTexts[currentLang] || breakdownConsistencyTexts.en;
  breakdownText.textContent = breakdown.map(b => {
    const label = getDimensionLabel(pairs.find(p => p.a === b.a && p.b === b.b), currentLang);
    const consText = Math.abs(b.cons) > CONS_GOOD
      ? consTexts.noConsistent
      : Math.abs(b.cons) < CONS_VERY_GOOD
        ? consTexts.veryGood
        : consTexts.good;
    return `${label}: ${formatVal(b.score)} (${getSegmentText(b.score, currentLang)}) — ${consText}`;
  }).join(" | ");

  document.getElementById("shs-results").style.display = "block";
  document.querySelector(".shs-card").style.display = "none";
});

document.getElementById("shs-back").addEventListener("click", () => {
  document.getElementById("shs-results").style.display = "none";
  document.querySelector(".shs-card").style.display = "block";
});

