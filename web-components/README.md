# SHS Calculator Web Component

A modular, class-based JavaScript implementation of the Subjective Hallucination Scale (SHS) calculator for evaluating LLM outputs.

## Features

- ✅ **10-question Likert scale** (5-point: -2 to +2)
- ✅ **Multilingual support** (English, German, French)
- ✅ **5 dimension pairs** with scoring and consistency checking
- ✅ **Visual gauge** with 11 color-coded segments
- ✅ **Modular architecture** - easy to integrate and customize
- ✅ **Event-driven** - listen for calculation events
- ✅ **Responsive design** - works on mobile and desktop

## Quick Start

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="shs-calculator.css">
</head>
<body>
  <div id="my-shs-calculator"></div>
  
  <script src="shs-calculator.js"></script>
  <script>
    const calculator = new SHSCalculator('my-shs-calculator');
  </script>
</body>
</html>
```

### With Options

```javascript
const calculator = new SHSCalculator('my-shs-calculator', {
  language: 'en',        // 'en', 'de', or 'fr'
  showGauge: true,        // Show visual gauge (default: true)
  showConsistency: true    // Show consistency check (default: true)
});
```

## API Reference

### Constructor

```javascript
new SHSCalculator(containerId, options)
```

**Parameters:**
- `containerId` (string, required): ID of the DOM element where the calculator will be rendered
- `options` (object, optional):
  - `language` (string): Initial language ('en', 'de', 'fr'). Default: 'en'
  - `showGauge` (boolean): Show visual gauge. Default: true
  - `showConsistency` (boolean): Show consistency check section. Default: true

**Example:**
```javascript
const calc = new SHSCalculator('calculator-container', {
  language: 'de',
  showGauge: true
});
```

### Methods

#### `setLanguage(lang)`

Change the display language.

```javascript
calculator.setLanguage('fr'); // Switch to French
```

#### `getResults()`

Get the current calculation results.

```javascript
const results = calculator.getResults();
console.log(results.overall);        // Overall score (-1 to +1)
console.log(results.breakdown);     // Per-dimension breakdown
console.log(results.responses);     // Raw question responses
```

#### `reset()`

Reset the form and clear all responses.

```javascript
calculator.reset();
```

#### `exportJSON()`

Export results as JSON string.

```javascript
const jsonString = calculator.exportJSON();
console.log(jsonString);
```

#### `exportCSV(includeBreakdown)`

Export results as CSV string.

```javascript
const csvString = calculator.exportCSV(true); // Include dimension breakdown
console.log(csvString);
```

#### `downloadResults(format, filename)`

Download results as a file (JSON or CSV).

```javascript
// Download as JSON
calculator.downloadResults('json', 'my_evaluation');

// Download as CSV
calculator.downloadResults('csv');
```

### Events

The calculator emits a custom event when results are calculated:

```javascript
document.getElementById('my-shs-calculator')
  .addEventListener('shs:calculated', (e) => {
    const results = e.detail;
    console.log('Overall Score:', results.overall);
    console.log('Breakdown:', results.breakdown);
  });
```

### Results Structure

```javascript
{
  overall: -0.5,              // Overall score (-1 to +1)
  overallConsistency: 0.2,    // Overall consistency score
  breakdown: [                // Per-dimension breakdown
    {
      dimension: {...},       // Dimension pair info
      score: -0.5,           // Dimension score (-1 to +1)
      consistency: 0.2,       // Dimension consistency
      label: "Factual Accuracy"
    },
    // ... 4 more dimensions
  ],
  responses: {               // Raw responses
    q1: 2,                   // Response value (-2 to +2)
    q2: -2,
    // ... all 10 questions
  }
}
```

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

- Low absolute value (≤ 0.1): Very consistent responses
- Medium absolute value (≤ 0.5): Good consistency
- High absolute value (> 0.5): Inconsistent responses (warning)

### Overall Score

The overall score is the average of all 5 dimension scores.

## File Structure

```
web-components/
├── shs-calculator.js      # Main calculator class
├── shs-calculator.css      # Styles
├── demo.html               # Demo page
├── tests/
│   ├── shs-calculator.test.js  # Unit tests
│   └── test-runner.html        # Test runner page
└── README.md               # This file
```

## Running the Demo

Open `demo.html` in a web browser to see the calculator in action.

## Running Tests

Open `tests/test-runner.html` in a web browser to run the test suite. Tests will run automatically and display results in the page and browser console.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ support required
- No external dependencies

## Customization

### Styling

Override CSS classes to customize appearance:

```css
.shs-card {
  background: your-color;
  border-radius: your-radius;
}

.shs-btn {
  background: your-primary-color;
}
```

### Translations

Add new languages by extending `SHSCalculator.TRANSLATIONS`:

```javascript
SHSCalculator.TRANSLATIONS.es = {
  title: "Calculadora de Escala de Alucinación Subjetiva (SHS)",
  // ... other translations
};
```

## License

- **Code**: Apache-2.0 (see LICENSE file)
- **Scale text**: CC BY-NC-ND 4.0 (see LICENSE-SCALE file)

## Contributing

When contributing:
1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass

## Export Functionality

The calculator supports exporting results for further analysis:

### JSON Export

```javascript
const results = calculator.getResults();
const json = calculator.exportJSON();
// Save or send to server
```

### CSV Export

```javascript
const csv = calculator.exportCSV(true); // Include dimension breakdown
// Use for spreadsheet analysis
```

### File Download

The calculator UI includes export buttons that automatically download results:
- **Export JSON**: Downloads results as JSON file
- **Export CSV**: Downloads results as CSV file with dimension breakdown

## Integration Examples

### React Integration

```jsx
import { useEffect, useRef } from 'react';

function SHSCalculatorComponent() {
  const containerRef = useRef(null);
  const calculatorRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && !calculatorRef.current) {
      calculatorRef.current = new SHSCalculator(containerRef.current.id, {
        language: 'en',
        showGauge: true,
        showConsistency: true
      });

      containerRef.current.addEventListener('shs:calculated', (e) => {
        console.log('SHS Results:', e.detail);
        // Handle results
      });
    }
  }, []);

  return <div id="shs-container" ref={containerRef} />;
}
```

### Vue Integration

```vue
<template>
  <div id="shs-container" ref="shsContainer"></div>
</template>

<script>
export default {
  mounted() {
    this.calculator = new SHSCalculator('shs-container', {
      language: 'en'
    });

    this.$el.addEventListener('shs:calculated', (e) => {
      this.$emit('calculated', e.detail);
    });
  },
  beforeUnmount() {
    if (this.calculator) {
      this.calculator.reset();
    }
  }
}
</script>
```

### Server-Side Integration

```javascript
// Express.js example
app.post('/api/shs/calculate', (req, res) => {
  const responses = req.body.responses;
  
  // Use Python implementation for server-side calculation
  // Or validate and process responses
  const result = calculateSHS(responses);
  
  res.json(result);
});
```

## References

Müller, H., Steiger, D., Plass, M., & Holzinger, A. (2026). "The System Hallucination Scale (SHS): A Minimal yet Effective Human-Centered Instrument for Evaluating Hallucination-Related Behavior in Large Language Models." *In submission*.

Available at: https://hmmc.at/shs/

