# SHS Calculator - Python Reference Implementation

This directory contains the Python reference implementation of the System Hallucination Scale (SHS) calculator.

## Overview

The Python implementation provides a programmatic interface for calculating SHS scores from questionnaire responses. It is designed to be:

- **Reference implementation**: Matches the algorithm described in the SHS paper
- **Language-agnostic**: Supports English, German, and French labels
- **Type-safe**: Uses Python type hints and dataclasses
- **Well-documented**: Comprehensive docstrings and examples

## Installation

No external dependencies are required. The implementation uses only Python standard library (Python 3.7+).

```bash
# No installation needed - just import the module
```

## Quick Start

```python
from shs_calculator import SHSCalculator

# Define responses (q1-q10, values from -2 to +2)
responses = {
    "q1": 2,   # Strongly agree: factually reliable
    "q2": -2,  # Strongly disagree: not frequently false
    "q3": 1,   # Agree: easy to verify sources
    "q4": -1,  # Disagree: not often omitted sources
    "q5": 2,   # Strongly agree: logically structured
    "q6": -2,  # Strongly disagree: no illogical steps
    "q7": 1,   # Agree: false info easy to recognize
    "q8": -1,  # Disagree: not misleading
    "q9": 1,   # Agree: able to prompt for accuracy
    "q10": -1  # Disagree: did not ignore instructions
}

# Calculate SHS scores
result = SHSCalculator.calculate(responses, language="en")

# Access results
print(f"Overall Score: {result.overall_score}")
print(f"Overall Consistency: {result.overall_consistency}")

for dim in result.dimensions:
    print(f"{dim.dimension_label}: {dim.score:.3f}")
```

## API Reference

### `SHSCalculator.calculate(responses, language="en")`

Calculate SHS scores from a dictionary of responses.

**Parameters:**
- `responses` (Dict[str, int]): Dictionary mapping question IDs (q1-q10) to response values (-2 to +2)
- `language` (str): Language for labels ('en', 'de', 'fr'). Default: 'en'

**Returns:**
- `SHSResult`: Object containing overall scores, dimension breakdown, and consistency metrics

**Raises:**
- `ValueError`: If responses are invalid (missing questions, out of range, etc.)

### `SHSCalculator.calculate_from_list(responses, language="en")`

Calculate SHS scores from a list of responses (ordered q1-q10).

**Parameters:**
- `responses` (List[int]): List of 10 response values (-2 to +2) in order q1 to q10
- `language` (str): Language for labels ('en', 'de', 'fr'). Default: 'en'

**Returns:**
- `SHSResult`: Object containing all calculated scores

### `SHSResult`

Result object containing:

- `overall_score` (float): Overall SHS score in range [-1.0, +1.0]
- `overall_consistency` (float): Overall consistency score
- `dimensions` (List[DimensionResult]): Per-dimension breakdown
- `responses` (Dict[str, int]): Original response values

**Methods:**
- `to_dict()`: Convert result to dictionary for JSON serialization

### `DimensionResult`

Dimension-level result containing:

- `dimension_key` (str): Dimension identifier
- `dimension_label` (str): Human-readable dimension label
- `question_a` (str): Text of positive question
- `question_b` (str): Text of negative question
- `response_a` (int): Response to positive question
- `response_b` (int): Response to negative question
- `score` (float): Dimension score [-1.0, +1.0]
- `consistency` (float): Consistency score
- `consistency_level` (ConsistencyLevel): Consistency classification

## Scoring Algorithm

### Dimension Score

For each dimension pair (questions a and b):
```
score = (response_a - response_b) / 4
```

This yields a score from -1.0 (high hallucination risk) to +1.0 (low hallucination risk).

### Consistency Score

For each dimension pair:
```
consistency = (response_a + response_b) / 4
```

- **Very good** (|consistency| ≤ 0.1): Very consistent responses
- **Good** (0.1 < |consistency| ≤ 0.5): Good consistency
- **Inconsistent** (|consistency| > 0.5): Inconsistent responses (warning)

### Overall Score

The overall score is the average of all 5 dimension scores.

## Example: Batch Processing

```python
from shs_calculator import SHSCalculator
import json

# Process multiple evaluations
evaluations = [
    {"q1": 2, "q2": -2, "q3": 1, "q4": -1, "q5": 2, 
     "q6": -2, "q7": 1, "q8": -1, "q9": 1, "q10": -1},
    # ... more evaluations
]

results = []
for eval_responses in evaluations:
    result = SHSCalculator.calculate(eval_responses)
    results.append(result.to_dict())

# Export to JSON
with open("shs_results.json", "w") as f:
    json.dump(results, f, indent=2)
```

## Testing

Run the example to verify the implementation:

```bash
python shs_calculator.py
```

## Integration

The Python implementation can be integrated into:

- **Research pipelines**: Automated evaluation workflows
- **Data analysis**: Statistical analysis of SHS scores
- **API backends**: Server-side calculation endpoints
- **Testing frameworks**: Validation of web implementations

## License

- **Code**: Apache-2.0 (see LICENSE file)
- **Scale text**: CC BY-NC-ND 4.0 (see LICENSE-SCALE file)

## References

Müller, H., Steiger, D., Bignens, S., Plass, M., & Holzinger, A. (2024). "The System Hallucination Scale (SHS): A Minimal yet Effective Scale for Evaluating Hallucinations in Large Language Models." *Preprint*.
