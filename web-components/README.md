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

## References

Müller, H., Steiger, D., Bignens, S., Plass, M., & Holzinger, A. (2024). "The System Hallucination Scale (SHS): A Minimal yet Effective Scale for Evaluating Hallucinations in Large Language Models." *Preprint*.

