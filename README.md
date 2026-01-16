# System Hallucination Scale (SHS)

The **System Hallucination Scale (SHS)** is a lightweight, human-centered evaluation instrument for assessing hallucination tendencies in Large Language Models (LLMs).

Inspired by established psychometric tools such as the **System Usability Scale (SUS)** and the **System Causability Scale (SCS)**, SHS provides a fast, interpretable, and domain-agnostic way to capture how humans perceive factual inconsistency, incoherence, and misleading reasoning in model-generated text.

## Reference

**Müller, H., Steiger, D., Bignens, S., Plass, M., & Holzinger, A. (2024).**  
*"The System Hallucination Scale (SHS): A Minimal yet Effective Human-Centered Instrument for Evaluating Hallucination-Related Behavior in Large Language Models."*  
Preprint. Available at: https://hmmc.at/shs/

## Theoretical Foundation

### Background

The term *hallucination* in the context of LLMs describes instances where a model generates content that is not grounded in input data, contextual constraints, or verifiable external knowledge. Such outputs may be subtle or overt and often appear reliable due to the model's fluent and coherent language. Hallucinations differ from adversarial errors, as they typically arise from the model's normal generative behavior and are therefore difficult to detect automatically, particularly in open-domain or under-specified settings.

### Design Philosophy

SHS is explicitly **not** an automatic hallucination detector or benchmark metric. Instead, it serves as a subjective measurement instrument that captures how hallucinations manifest from a user perspective under realistic interaction conditions. This human-centered approach addresses the gap between quantifiable performance indicators and the broader dimensions of trust, reliability, and human–AI interaction.

### Scale Structure

SHS consists of:
- **10 items** organized into **5 dimension pairs**
- **5-point Likert scale** (-2 to +2: strongly disagree to strongly agree)
- **Alternating positive and negative statements** to reduce response bias
- **Dimension-based scoring** with consistency checking

### Dimensions

The five dimensions evaluated by SHS are:

1. **Factual Accuracy** (q1, q2): Assesses the factual reliability of model outputs
2. **Source Reliability** (q3, q4): Evaluates source traceability and verification
3. **Logical Coherence** (q5, q6): Measures logical structure and reasoning quality
4. **Deceptiveness** (q7, q8): Captures how misleading false information is presented
5. **Responsiveness to Guidance** (q9, q10): Assesses the model's ability to correct errors when prompted

### Scoring Algorithm

For each dimension pair (questions a and b):
- **Dimension Score**: `score = (response_a - response_b) / 4`  
  Yields a score from -1.0 (high hallucination risk) to +1.0 (low hallucination risk)
- **Consistency Score**: `consistency = (response_a + response_b) / 4`  
  Low absolute value (≤ 0.1): Very consistent  
  Medium absolute value (≤ 0.5): Good consistency  
  High absolute value (> 0.5): Inconsistent (warning)

**Overall Score**: Average of all 5 dimension scores (range: -1.0 to +1.0)

## Empirical Validation

An evaluation study with **210 participants** demonstrated:

- **High clarity**: 87.2% of evaluators found questions understandable
- **Relevance**: 83.0% considered questions relevant for LLM evaluation
- **Appropriate response options**: 93.6% found Likert scale appropriate
- **Low explanation needs**: 66.0% required no additional explanation
- **Construct validity**: Coherent response behavior and meaningful score distributions

See the [full paper](System_Hallucination_Scale_SHS_V2-2.pdf) for detailed validation results and methodology.

## Idea

While hallucinations are widely recognized as a core limitation of modern LLMs, the field still lacks a simple, standardized, and user-facing instrument to assess them systematically.

SHS addresses this gap by offering:
- a **10-item Likert-scale questionnaire**
- alternating positive and negative statements to reduce response bias
- a scoring scheme that yields interpretable scores in the range [-1, +1]

The scale is designed for **quick application** in research, evaluation studies, benchmarking, and real-world deployments.

## What is hosted here

This repository hosts:
- the **SHS scale definition** and questionnaire items
- **Reference implementations** in Python and JavaScript
- **Interactive web calculator** for conducting evaluations
- **Batch processing tools** for large-scale studies
- **Documentation** and usage guidelines
- **Supporting materials** for applying SHS in research and deployment

### Available Tools

1. **Web Component** (`web-components/`): Interactive browser-based calculator with multi-language support
2. **Python Implementation** (`python/`): Reference implementation for programmatic use and batch processing
3. **Batch Processor** (`python/batch_processor.py`): Tool for processing multiple evaluations and generating statistics

The public interactive calculator is available at:  
👉 **https://hmmc.at/shs/**

## Intended use cases

- **Human evaluation of LLM outputs**: Quick assessment of model-generated text
- **Comparative testing**: Systematic comparison of multiple models, prompting strategies, or configurations
- **Deployment monitoring**: Ongoing evaluation of hallucination tendencies in production systems
- **Research applications**: Studies on trust, reliability, and human–AI interaction
- **User studies**: Structured data collection with built-in consistency checking
- **Educational purposes**: Teaching and demonstrating hallucination assessment concepts
- **Development integration**: Embedding SHS evaluation in automated testing pipelines

## Quick Start

### Web Calculator

The easiest way to use SHS is through the interactive web calculator:

1. Visit https://hmmc.at/shs/ or use the local `web-components/demo.html`
2. Answer all 10 questions using the 5-point Likert scale
3. Click "Calculate SHS" to see your results
4. Export results as JSON or CSV for further analysis

### Python Implementation

```python
from python.shs_calculator import SHSCalculator

# Define responses (q1-q10, values from -2 to +2)
responses = {
    "q1": 2, "q2": -2, "q3": 1, "q4": -1, "q5": 2,
    "q6": -2, "q7": 1, "q8": -1, "q9": 1, "q10": -1
}

# Calculate scores
result = SHSCalculator.calculate(responses)
print(f"Overall Score: {result.overall_score:.3f}")
```

### Batch Processing

```bash
# Process multiple evaluations from JSON file
python python/batch_processor.py input.json --output results.json --stats

# Process CSV file and export statistics
python python/batch_processor.py input.csv --format csv --stats-output stats.json
```

See the [web-components README](web-components/README.md) and [python README](python/README.md) for detailed documentation.

## Repository Structure

```
system-hallucination-scale/
├── README.md                    # This file
├── LICENSE                      # Apache-2.0 (code)
├── LICENSE-SCALE                # CC BY-NC-ND 4.0 (scale text)
├── System_Hallucination_Scale_SHS_V2-2.pdf  # Research paper
├── web-components/             # Interactive web calculator
│   ├── shs-calculator.js        # Main calculator class
│   ├── shs-calculator.css       # Styles
│   ├── demo.html                # Demo page
│   ├── README.md                # Web component documentation
│   └── tests/                   # Unit tests
└── python/                      # Python reference implementation
    ├── shs_calculator.py        # Core calculator class
    ├── batch_processor.py      # Batch processing tool
    ├── requirements.txt         # Dependencies (none required)
    └── README.md                # Python documentation
```

## Status

SHS is an active research instrument and continues to evolve. The current version (V2-2) has been validated through empirical evaluation with 210 participants.

**Feedback, discussion, and contributions are welcome.**

## Citation

If you use SHS in your research, please cite:

```bibtex
@article{muller2024system,
  title={The System Hallucination Scale (SHS): A Minimal yet Effective Human-Centered Instrument for Evaluating Hallucination-Related Behavior in Large Language Models},
  author={M{\"u}ller, Heimo and Steiger, Dominik and Bignens, Sophie and Plass, Markus and Holzinger, Andreas},
  journal={Preprint},
  year={2024}
}
```

## Related Work

SHS is inspired by established psychometric instruments:
- **System Usability Scale (SUS)**: Quick and dirty usability scale
- **System Causability Scale (SCS)**: Explainability assessment tool

These instruments demonstrate how complex, subjective phenomena can be operationalized through standardized measurement tools.

## License

This repository uses dual licensing:

- **Scale text** (questionnaire items, instructions, scoring descriptions): **CC BY-NC-ND 4.0**  
  See [LICENSE-SCALE](LICENSE-SCALE) for details.  
  You can share the scale for non-commercial purposes with attribution. Commercial use and modifications require separate permission.

- **Code** (scripts, calculators, dashboards, notebooks): **Apache-2.0**  
  See [LICENSE](LICENSE) for details.

---

**System Hallucination Scale (SHS)**  
Human-centered evaluation of hallucinations in AI systems.
