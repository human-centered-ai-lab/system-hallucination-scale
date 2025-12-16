/**
 * Subjective Hallucination Scale (SHS) Calculator
 * 
 * A modular, class-based implementation of the SHS evaluation tool.
 * Supports multiple languages and provides scoring, consistency checking, and visualization.
 * 
 * @license Apache-2.0
 */

class SHSCalculator {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container element with id "${containerId}" not found`);
    }

    this.options = {
      language: options.language || 'en',
      showGauge: options.showGauge !== false,
      showConsistency: options.showConsistency !== false,
      ...options
    };

    this.currentLang = this.options.language;
    this.responses = {};
    this.results = null;

    this.init();
  }

  // Constants
  static QUESTIONS = [
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

  static DIMENSION_PAIRS = [
    { key: "Factual Accuracy", key_de: "Faktische Genauigkeit", key_fr: "Précision factuelle", a: "q1", b: "q2" },
    { key: "Source Reliability", key_de: "Quellenzuverlässigkeit", key_fr: "Fiabilité des sources", a: "q3", b: "q4" },
    { key: "Logical Coherence", key_de: "Logische Kohärenz", key_fr: "Cohérence logique", a: "q5", b: "q6" },
    { key: "Deceptiveness", key_de: "Täuschungspotenzial", key_fr: "Potentiel de tromperie", a: "q7", b: "q8" },
    { key: "Responsiveness to Guidance", key_de: "Reaktionsfähigkeit auf Anleitung", key_fr: "Réactivité aux conseils", a: "q9", b: "q10" },
  ];

  static CONS_VERY_GOOD = 0.1;
  static CONS_GOOD = 0.5;

  static GAUGE_COLORS = [
    "#8B1A1A","#A52A2A","#CD3333","#E84545","#FF5555",
    "#999999",
    "#90EE90","#7FD77F","#6BC66B","#4CAF50","#2E8B2E"
  ];

  static TRANSLATIONS = {
    en: {
      title: "Subjective Hallucination Scale (SHS) Calculator",
      note: "For each of the 10 questions, choose how much you agree: strongly disagree, disagree, neutral, agree, strongly agree. Then click Calculate to see your score.",
      button: "Calculate SHS",
      alert: "Please answer all questions.",
      resultTitles: {
        overall: "Overall Score",
        consistency: "Consistency Check",
        breakdown: "Breakdown"
      },
      consistency: {
        veryGood: "Consistency is very good.",
        good: "Consistency is good.",
        inconsistent: "Warning: responses are inconsistent (no consistent statement for at least one dimension).",
        review: "At least one pair is inconsistent; review those answers."
      },
      breakdownConsistency: {
        noConsistent: "Consistency: no consistent statement for this dimension.",
        veryGood: "Consistency: very good.",
        good: "Consistency: good."
      },
      segments: [
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
      ]
    },
    de: {
      title: "Subjektive Halluzinationsskala (SHS) Rechner",
      note: "Beantworte die 10 Fragen, indem du deinen Grad der Zustimmung wählst: stimme gar nicht zu, stimme nicht zu, neutral, stimme zu, stimme voll zu. Dann klicke auf „Berechne SHS", um deinen Score zu sehen.",
      button: "Berechne SHS",
      alert: "Bitte alle Fragen beantworten.",
      resultTitles: {
        overall: "Gesamtscore",
        consistency: "Konsistenzprüfung",
        breakdown: "Aufschlüsselung"
      },
      consistency: {
        veryGood: "Konsistenz ist sehr gut.",
        good: "Konsistenz ist gut.",
        inconsistent: "Warnung: Antworten sind inkonsistent (keine konsistente Aussage für mindestens eine Dimension).",
        review: "Mindestens ein Paar ist inkonsistent; überprüfe diese Antworten."
      },
      breakdownConsistency: {
        noConsistent: "Konsistenz: keine konsistente Aussage für diese Dimension.",
        veryGood: "Konsistenz: sehr gut.",
        good: "Konsistenz: gut."
      },
      segments: [
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
      ]
    },
    fr: {
      title: "Calculateur d'échelle de hallucination subjective (SHS)",
      note: "Pour chacune des 10 questions, choisissez votre degré d'accord : pas du tout d'accord, pas d'accord, neutre, d'accord, tout à fait d'accord. Cliquez ensuite sur « Calculate » pour voir votre score.",
      button: "Calculer SHS",
      alert: "Veuillez répondre à toutes les questions.",
      resultTitles: {
        overall: "Score global",
        consistency: "Vérification de cohérence",
        breakdown: "Répartition"
      },
      consistency: {
        veryGood: "La cohérence est très bonne.",
        good: "La cohérence est bonne.",
        inconsistent: "Avertissement: les réponses sont incohérentes (aucune déclaration cohérente pour au moins une dimension).",
        review: "Au moins une paire est incohérente; examinez ces réponses."
      },
      breakdownConsistency: {
        noConsistent: "Cohérence: aucune déclaration cohérente pour cette dimension.",
        veryGood: "Cohérence: très bonne.",
        good: "Cohérence: bonne."
      },
      segments: [
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
    }
  };

  // Initialize the calculator
  init() {
    this.render();
    this.attachEventListeners();
  }

  // Render the calculator UI
  render() {
    const t = this.getTranslations();
    this.container.innerHTML = `
      <div class="shs-lang" id="shs-lang-${this.container.id}" aria-label="Language selector">
        <div class="shs-lang-option ${this.currentLang === 'en' ? 'active' : ''}" data-lang="en">🇬🇧 English</div>
        <div class="shs-lang-option ${this.currentLang === 'de' ? 'active' : ''}" data-lang="de">🇩🇪 Deutsch</div>
        <div class="shs-lang-option ${this.currentLang === 'fr' ? 'active' : ''}" data-lang="fr">🇫🇷 Français</div>
      </div>
      <div class="shs-card">
        <p class="shs-note" id="shs-note-${this.container.id}">${t.note}</p>
        <form id="shs-form-${this.container.id}" class="shs-questions">
          <div id="shs-questions-container-${this.container.id}"></div>
          <div class="shs-actions">
            <button type="submit" class="shs-btn" id="shs-submit-${this.container.id}">${t.button}</button>
          </div>
        </form>
      </div>
      <div id="shs-results-${this.container.id}" class="shs-card shs-results">
        <div class="shs-actions" style="margin-top:0;">
          <button type="button" id="shs-back-${this.container.id}" class="shs-btn secondary">← Back</button>
        </div>
        <div class="shs-result-block">
          <h3 id="overall-title-${this.container.id}">${t.resultTitles.overall}</h3>
          ${this.options.showGauge ? `
          <div class="shs-gauge">
            <svg viewBox="0 0 200 200">
              <g id="shs-segments-${this.container.id}"></g>
            </svg>
            <div class="shs-needle" id="shs-needle-${this.container.id}"></div>
            <div class="shs-label">SHS SCORE</div>
          </div>
          ` : ''}
          <div id="overall-score-${this.container.id}" class="shs-metric" style="text-align:center; margin-top:1rem;"></div>
          <div class="shs-summary" id="overall-text-${this.container.id}" style="text-align:center; margin-top:0.5rem;"></div>
        </div>
        ${this.options.showConsistency ? `
        <div class="shs-result-block">
          <h4 id="consistency-title-${this.container.id}">${t.resultTitles.consistency}</h4>
          <div class="shs-consistency" id="consistency-text-${this.container.id}"></div>
        </div>
        ` : ''}
        <div class="shs-result-block">
          <h4 id="breakdown-title-${this.container.id}">${t.resultTitles.breakdown}</h4>
          <div class="shs-summary" id="breakdown-text-${this.container.id}"></div>
        </div>
      </div>
    `;

    this.renderQuestions();
    if (this.options.showGauge) {
      this.renderGaugeBase();
    }
  }

  // Render questions table
  renderQuestions() {
    const container = document.getElementById(`shs-questions-container-${this.container.id}`);
    if (!container) return;

    container.innerHTML = "";
    const table = document.createElement("table");
    table.className = "shs-table";
    
    const t = this.getTranslations();
    const langLabel = this.currentLang === "de" ? "Frage" : this.currentLang === "fr" ? "Question" : "Question";
    
    table.innerHTML = `
      <thead>
        <tr>
          <th style="width:50%;">${langLabel}</th>
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
    SHSCalculator.QUESTIONS.forEach(([id, en, de, fr]) => {
      const label = this.currentLang === "de" ? de : this.currentLang === "fr" ? fr : en;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${label}</td>
        ${[-2, -1, 0, 1, 2].map(v => `
          <td class="center">
            <label style="display:inline-flex; justify-content:center; align-items:center; width:100%; padding:0.35rem 0; cursor:pointer;">
              <input type="radio" class="shs-radio" name="${id}-${this.container.id}" value="${v}" aria-label="${label} ${v}" />
            </label>
          </td>
        `).join("")}
      `;
      tbody.appendChild(row);
    });
    
    container.appendChild(table);
  }

  // Attach event listeners
  attachEventListeners() {
    const langRoot = document.getElementById(`shs-lang-${this.container.id}`);
    const form = document.getElementById(`shs-form-${this.container.id}`);
    const backBtn = document.getElementById(`shs-back-${this.container.id}`);

    if (langRoot) {
      langRoot.addEventListener("click", (e) => {
        const btn = e.target.closest(".shs-lang-option");
        if (!btn) return;
        this.setLanguage(btn.dataset.lang);
      });
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.calculate();
      });
    }

    if (backBtn) {
      backBtn.addEventListener("click", () => {
        this.showForm();
      });
    }
  }

  // Set language
  setLanguage(lang) {
    this.currentLang = lang;
    const langRoot = document.getElementById(`shs-lang-${this.container.id}`);
    if (langRoot) {
      [...langRoot.querySelectorAll(".shs-lang-option")].forEach(el => {
        el.classList.toggle("active", el.dataset.lang === lang);
      });
    }
    this.render();
    this.attachEventListeners();
  }

  // Get translations for current language
  getTranslations() {
    return SHSCalculator.TRANSLATIONS[this.currentLang] || SHSCalculator.TRANSLATIONS.en;
  }

  // Get dimension label
  getDimensionLabel(pair) {
    if (this.currentLang === "de") return pair.key_de;
    if (this.currentLang === "fr") return pair.key_fr;
    return pair.key;
  }

  // Get segment text for a score value
  getSegmentText(value) {
    const clamped = Math.max(-1, Math.min(1, value));
    const t = this.getTranslations();
    const segments = t.segments;
    
    for (const seg of segments) {
      if (clamped >= seg.min && clamped <= seg.max) {
        return seg.label;
      }
    }
    return segments[segments.length - 1].label;
  }

  // Calculate scores
  calculate() {
    // Collect responses
    const vals = {};
    for (let i = 1; i <= 10; i++) {
      const name = `q${i}-${this.container.id}`;
      const sel = document.querySelector(`input[name="${name}"]:checked`);
      if (!sel) {
        const t = this.getTranslations();
        alert(t.alert);
        return;
      }
      vals[`q${i}`] = parseInt(sel.value, 10);
    }

    // Calculate dimension scores
    const scores = [];
    const consistencies = [];
    const breakdown = [];

    SHSCalculator.DIMENSION_PAIRS.forEach(p => {
      const score = (vals[p.a] - vals[p.b]) / 4;
      const cons = (vals[p.a] + vals[p.b]) / 4;
      scores.push(score);
      consistencies.push(cons);
      breakdown.push({ 
        dimension: p, 
        score, 
        consistency: cons,
        label: this.getDimensionLabel(p)
      });
    });

    const overall = scores.reduce((s, x) => s + x, 0) / scores.length;
    const overallCons = consistencies.reduce((s, x) => s + x, 0) / consistencies.length;

    // Store results
    this.results = {
      overall,
      overallConsistency: overallCons,
      breakdown,
      responses: vals
    };

    // Display results
    this.displayResults();
    
    // Emit custom event
    this.container.dispatchEvent(new CustomEvent('shs:calculated', {
      detail: this.results
    }));
  }

  // Display results
  displayResults() {
    const t = this.getTranslations();
    const results = this.results;

    // Overall score
    const overallScoreEl = document.getElementById(`overall-score-${this.container.id}`);
    if (overallScoreEl) {
      overallScoreEl.textContent = `${this.formatValue(results.overall)} (range -1..+1)`;
    }

    // Gauge
    if (this.options.showGauge) {
      this.setGauge(results.overall);
    }

    // Overall text
    const overallTextEl = document.getElementById(`overall-text-${this.container.id}`);
    if (overallTextEl) {
      overallTextEl.textContent = this.getSegmentText(results.overall);
    }

    // Consistency
    if (this.options.showConsistency) {
      const consistencyTextEl = document.getElementById(`consistency-text-${this.container.id}`);
      if (consistencyTextEl) {
        consistencyTextEl.textContent = this.getConsistencySummary(
          results.overallConsistency,
          results.breakdown.map(b => b.consistency)
        );
      }
    }

    // Breakdown
    const breakdownTextEl = document.getElementById(`breakdown-text-${this.container.id}`);
    if (breakdownTextEl) {
      const consTexts = t.breakdownConsistency;
      breakdownTextEl.textContent = results.breakdown.map(b => {
        const consText = Math.abs(b.consistency) > SHSCalculator.CONS_GOOD
          ? consTexts.noConsistent
          : Math.abs(b.consistency) < SHSCalculator.CONS_VERY_GOOD
            ? consTexts.veryGood
            : consTexts.good;
        return `${b.label}: ${this.formatValue(b.score)} (${this.getSegmentText(b.score)}) — ${consText}`;
      }).join(" | ");
    }

    // Show results, hide form
    this.showResults();
  }

  // Get consistency summary text
  getConsistencySummary(overallCons, consList) {
    const t = this.getTranslations();
    const msgs = [];
    
    if (Math.abs(overallCons) <= SHSCalculator.CONS_VERY_GOOD) {
      msgs.push(t.consistency.veryGood);
    } else if (Math.abs(overallCons) <= SHSCalculator.CONS_GOOD) {
      msgs.push(t.consistency.good);
    } else {
      msgs.push(t.consistency.inconsistent);
    }
    
    const outliers = consList.filter(c => Math.abs(c) > SHSCalculator.CONS_GOOD).length;
    if (outliers > 0) {
      msgs.push(t.consistency.review);
    }
    
    return msgs.join(" ");
  }

  // Format value
  formatValue(v) {
    return v.toFixed(2);
  }

  // Show results view
  showResults() {
    const resultsEl = document.getElementById(`shs-results-${this.container.id}`);
    const formEl = this.container.querySelector(".shs-card:not(.shs-results)");
    
    if (resultsEl) resultsEl.style.display = "block";
    if (formEl) formEl.style.display = "none";
  }

  // Show form view
  showForm() {
    const resultsEl = document.getElementById(`shs-results-${this.container.id}`);
    const formEl = this.container.querySelector(".shs-card:not(.shs-results)");
    
    if (resultsEl) resultsEl.style.display = "none";
    if (formEl) formEl.style.display = "block";
  }

  // Gauge rendering
  renderGaugeBase() {
    const segmentsContainer = document.getElementById(`shs-segments-${this.container.id}`);
    if (!segmentsContainer) return;

    segmentsContainer.innerHTML = '';
    const allSegments = [];

    for (let i = 0; i < 11; i++) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', this.createSegment(i));
      path.setAttribute('fill', SHSCalculator.GAUGE_COLORS[i]);
      path.setAttribute('class', 'shs-segment');
      segmentsContainer.appendChild(path);
      allSegments.push(path);
    }

    this.gaugeSegments = allSegments;
  }

  createSegment(index) {
    const totalSegments = 11;
    const totalArc = 270;
    const segmentAngle = totalArc / totalSegments;
    const startAngle = -135;
    const radius = 80;
    const thickness = 25;

    const angle1 = startAngle + (index * segmentAngle);
    const angle2 = angle1 + segmentAngle - 2;

    const outerStart = this.polarToCartesian(100, 100, radius, angle1);
    const outerEnd = this.polarToCartesian(100, 100, radius, angle2);
    const innerStart = this.polarToCartesian(100, 100, radius - thickness, angle1);
    const innerEnd = this.polarToCartesian(100, 100, radius - thickness, angle2);
    const largeArcFlag = segmentAngle > 180 ? 1 : 0;

    return [
      `M ${outerStart.x} ${outerStart.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerEnd.x} ${innerEnd.y}`,
      `A ${radius - thickness} ${radius - thickness} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
      'Z'
    ].join(' ');
  }

  polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  setGauge(value) {
    const needle = document.getElementById(`shs-needle-${this.container.id}`);
    if (!needle) return;

    const clampedValue = Math.max(-1, Math.min(1, parseFloat(value)));
    const normalizedValue = (clampedValue + 1) / 2; // 0 to 1
    const totalArc = 270;
    const startAngle = -135;
    const needleAngle = startAngle + (normalizedValue * totalArc);

    needle.style.transform = `translate(-50%, -100%) rotate(${needleAngle}deg)`;

    // Highlight active segment
    if (this.gaugeSegments) {
      const activeSegmentIndex = Math.floor(normalizedValue * 11);
      const clampedIndex = Math.max(0, Math.min(10, activeSegmentIndex));

      this.gaugeSegments.forEach((seg, idx) => {
        if (idx === clampedIndex) {
          seg.classList.add('active');
        } else {
          seg.classList.remove('active');
        }
      });
    }
  }

  // Public API methods
  getResults() {
    return this.results;
  }

  reset() {
    this.responses = {};
    this.results = null;
    this.showForm();
    // Clear all radio buttons
    const radios = this.container.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => radio.checked = false);
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SHSCalculator;
}

