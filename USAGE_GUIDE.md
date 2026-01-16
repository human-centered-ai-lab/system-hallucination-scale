# System Hallucination Scale (SHS) - Usage Guide

This guide provides practical instructions for using SHS in various contexts, from quick evaluations to large-scale research studies.

## Table of Contents

1. [Quick Evaluation](#quick-evaluation)
2. [Research Studies](#research-studies)
3. [Batch Processing](#batch-processing)
4. [Integration Examples](#integration-examples)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

## Quick Evaluation

### Using the Web Calculator

The fastest way to evaluate a single LLM output:

1. **Open the calculator**: Visit https://hmmc.at/shs/ or open `web-components/demo.html`
2. **Read the LLM output**: Review the text you want to evaluate
3. **Answer questions**: For each of the 10 questions, select your level of agreement:
   - 😡 Strongly disagree (-2)
   - 😕 Disagree (-1)
   - 😐 Neutral (0)
   - 🙂 Agree (+1)
   - 😃 Strongly agree (+2)
4. **Calculate**: Click "Calculate SHS" to see results
5. **Review results**: Check overall score, consistency, and dimension breakdown
6. **Export** (optional): Download results as JSON or CSV

### Interpreting Scores

- **Overall Score Range**: -1.0 to +1.0
  - **Negative scores** (< 0): Indicate hallucination risk
  - **Positive scores** (> 0): Indicate low hallucination risk
  - **Near zero**: Neutral/balanced assessment

- **Consistency Check**: 
  - **Very good** (|consistency| ≤ 0.1): Responses are highly consistent
  - **Good** (0.1 < |consistency| ≤ 0.5): Acceptable consistency
  - **Inconsistent** (|consistency| > 0.5): Warning - review responses

- **Dimension Breakdown**: Identifies specific areas of concern:
  - Factual Accuracy
  - Source Reliability
  - Logical Coherence
  - Deceptiveness
  - Responsiveness to Guidance

## Research Studies

### Study Design

When conducting SHS evaluations in research:

1. **Define evaluation criteria**: What constitutes a "hallucination" in your context?
2. **Train evaluators**: Ensure consistent understanding of questions
3. **Provide context**: Give evaluators access to source materials when possible
4. **Collect metadata**: Record model, prompt, domain, evaluator ID, timestamp
5. **Plan analysis**: Decide on statistical methods and comparisons

### Data Collection

#### Option 1: Web Calculator (Manual)

- Use the web calculator for each evaluation
- Export results individually or aggregate manually
- Best for: Small studies (< 50 evaluations), pilot studies

#### Option 2: Batch Processing (Automated)

- Prepare CSV or JSON file with all responses
- Use `batch_processor.py` to process all evaluations
- Best for: Large studies (> 50 evaluations), systematic comparisons

#### Example CSV Format

```csv
q1,q2,q3,q4,q5,q6,q7,q8,q9,q10,model,prompt_id,evaluator_id
2,-2,1,-1,2,-2,1,-1,1,-1,gpt-4,prompt_001,eval_001
1,-1,0,0,1,-1,0,0,0,0,claude-3,prompt_001,eval_001
```

### Statistical Analysis

The batch processor generates summary statistics:

```bash
python python/batch_processor.py evaluations.json --stats --stats-output stats.json
```

This provides:
- Mean, min, max, standard deviation of overall scores
- Dimension-level statistics
- Consistency metrics

For advanced analysis, import results into statistical software (R, Python pandas, etc.).

## Batch Processing

### Preparing Input Data

#### JSON Format

```json
[
  {
    "q1": 2, "q2": -2, "q3": 1, "q4": -1, "q5": 2,
    "q6": -2, "q7": 1, "q8": -1, "q9": 1, "q10": -1
  },
  {
    "q1": 1, "q2": -1, "q3": 0, "q4": 0, "q5": 1,
    "q6": -1, "q7": 0, "q8": 0, "q9": 0, "q10": 0
  }
]
```

#### CSV Format

```csv
q1,q2,q3,q4,q5,q6,q7,q8,q9,q10
2,-2,1,-1,2,-2,1,-1,1,-1
1,-1,0,0,1,-1,0,0,0,0
```

### Processing

```bash
# Basic processing
python python/batch_processor.py input.json --output results.json

# With statistics
python python/batch_processor.py input.json --output results.json --stats

# CSV input/output
python python/batch_processor.py input.csv --format csv --output results.csv

# German labels
python python/batch_processor.py input.json --language de --output results.json
```

### Output Formats

#### JSON Output

```json
[
  {
    "overall_score": 0.75,
    "overall_consistency": 0.1,
    "dimensions": [
      {
        "dimension_key": "Factual Accuracy",
        "score": 1.0,
        "consistency": 0.0,
        "consistency_level": "very_good"
      },
      ...
    ],
    "responses": {"q1": 2, "q2": -2, ...}
  }
]
```

#### CSV Output

Includes one row per evaluation with:
- Overall scores
- Dimension scores and consistencies
- Raw responses

## Integration Examples

### Python API Integration

```python
from python.shs_calculator import SHSCalculator

# Calculate single evaluation
responses = {"q1": 2, "q2": -2, ...}
result = SHSCalculator.calculate(responses)

# Process in loop
results = []
for eval_responses in evaluation_list:
    result = SHSCalculator.calculate(eval_responses)
    results.append(result)

# Export
import json
with open('results.json', 'w') as f:
    json.dump([r.to_dict() for r in results], f, indent=2)
```

### JavaScript/Web Integration

```javascript
// Initialize calculator
const calc = new SHSCalculator('container-id', {
  language: 'en',
  showGauge: true,
  showConsistency: true
});

// Listen for results
document.getElementById('container-id')
  .addEventListener('shs:calculated', (e) => {
    const results = e.detail;
    
    // Send to server
    fetch('/api/shs/save', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(results)
    });
  });
```

### REST API Wrapper

Example Flask endpoint:

```python
from flask import Flask, request, jsonify
from python.shs_calculator import SHSCalculator

app = Flask(__name__)

@app.route('/api/shs/calculate', methods=['POST'])
def calculate_shs():
    data = request.json
    responses = data.get('responses')
    language = data.get('language', 'en')
    
    try:
        result = SHSCalculator.calculate(responses, language)
        return jsonify(result.to_dict())
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
```

## Best Practices

### For Evaluators

1. **Read carefully**: Review the LLM output thoroughly before rating
2. **Use full scale**: Don't avoid extreme values (-2, +2) if they apply
3. **Check consistency**: Review dimension pairs for logical consistency
4. **Consider context**: Factor in domain, task complexity, and user needs
5. **Be consistent**: Apply similar standards across evaluations

### For Researchers

1. **Train evaluators**: Conduct training sessions with example evaluations
2. **Inter-rater reliability**: Have multiple evaluators rate the same outputs
3. **Document context**: Record model version, prompt, domain, evaluation date
4. **Validate consistency**: Review consistency scores - high inconsistency may indicate unclear questions
5. **Statistical analysis**: Use appropriate tests (t-tests, ANOVA, etc.) for comparisons

### For Developers

1. **Validate inputs**: Check response ranges (-2 to +2) before calculation
2. **Handle errors**: Provide clear error messages for invalid inputs
3. **Preserve data**: Export raw responses along with calculated scores
4. **Version control**: Track which version of SHS was used
5. **Documentation**: Document any customizations or extensions

## Troubleshooting

### Common Issues

**Q: I get "Please answer all questions" but I did answer them.**  
A: Make sure all radio buttons are selected. Check that JavaScript is enabled.

**Q: Consistency warnings appear even though my responses seem logical.**  
A: This can happen if you have mixed feelings. Review the dimension pairs - they should generally have opposite signs (one positive, one negative).

**Q: How do I handle neutral responses (0)?**  
A: Neutral responses are valid. They indicate uncertainty or that the question doesn't apply. However, many neutral responses may reduce score discriminability.

**Q: Can I use SHS for non-English text?**  
A: Yes, the calculator supports German and French. For other languages, you may need to translate the questions (subject to license terms).

**Q: What if I need to evaluate multiple outputs?**  
A: Use the batch processor or process multiple evaluations programmatically. Each output should be evaluated separately.

### Getting Help

- **Documentation**: Check README files in `web-components/` and `python/`
- **Paper**: Refer to the full paper for theoretical background
- **Issues**: Report bugs or questions via GitHub issues (if available)
- **Community**: Contact the research team at https://hmmc.at/shs/

## Additional Resources

- **Interactive Calculator**: https://hmmc.at/shs/
- **Research Paper**: See `System_Hallucination_Scale_SHS_V2-2.pdf`
- **Python Documentation**: See `python/README.md`
- **Web Component Documentation**: See `web-components/README.md`

---

**Last updated**: Based on SHS V2-2 (2026)
