"""
Batch Processing Tool for System Hallucination Scale (SHS)

This tool processes multiple SHS evaluations in batch mode, useful for:
- Processing large-scale evaluation studies
- Analyzing multiple LLM outputs
- Statistical analysis of SHS scores
- Exporting aggregated results

@license Apache-2.0
"""

import json
import csv
import argparse
from pathlib import Path
from typing import List, Dict, Any
from shs_calculator import SHSCalculator, SHSResult


def load_responses_from_json(filepath: str) -> List[Dict[str, int]]:
    """
    Load responses from JSON file.
    
    Expected format: List of dictionaries, each with q1-q10 keys.
    
    Args:
        filepath: Path to JSON file
        
    Returns:
        List of response dictionaries
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if not isinstance(data, list):
        raise ValueError("JSON file must contain a list of response dictionaries")
    
    return data


def load_responses_from_csv(filepath: str) -> List[Dict[str, int]]:
    """
    Load responses from CSV file.
    
    Expected format: CSV with columns q1, q2, ..., q10
    
    Args:
        filepath: Path to CSV file
        
    Returns:
        List of response dictionaries
    """
    responses = []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            response = {}
            for i in range(1, 11):
                qid = f"q{i}"
                if qid not in row:
                    raise ValueError(f"Missing column {qid} in CSV")
                try:
                    response[qid] = int(row[qid])
                except ValueError:
                    raise ValueError(f"Invalid value for {qid}: {row[qid]}")
            responses.append(response)
    
    return responses


def process_batch(responses_list: List[Dict[str, int]], 
                  language: str = "en") -> List[SHSResult]:
    """
    Process a batch of SHS evaluations.
    
    Args:
        responses_list: List of response dictionaries
        language: Language for labels ('en', 'de', 'fr')
        
    Returns:
        List of SHSResult objects
    """
    results = []
    errors = []
    
    for idx, responses in enumerate(responses_list):
        try:
            result = SHSCalculator.calculate(responses, language)
            results.append(result)
        except Exception as e:
            errors.append({
                'index': idx,
                'error': str(e),
                'responses': responses
            })
    
    if errors:
        print(f"Warning: {len(errors)} evaluations failed:")
        for err in errors:
            print(f"  Index {err['index']}: {err['error']}")
    
    return results


def export_results_json(results: List[SHSResult], output_path: str):
    """Export results to JSON file."""
    data = [result.to_dict() for result in results]
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Exported {len(results)} results to {output_path}")


def export_results_csv(results: List[SHSResult], output_path: str):
    """Export results to CSV file."""
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        
        # Header
        writer.writerow([
            'evaluation_id',
            'overall_score',
            'overall_consistency',
            'dim_factual_accuracy_score',
            'dim_factual_accuracy_consistency',
            'dim_source_reliability_score',
            'dim_source_reliability_consistency',
            'dim_logical_coherence_score',
            'dim_logical_coherence_consistency',
            'dim_deceptiveness_score',
            'dim_deceptiveness_consistency',
            'dim_responsiveness_score',
            'dim_responsiveness_consistency',
            'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'
        ])
        
        # Data rows
        for idx, result in enumerate(results):
            row = [
                idx,
                result.overall_score,
                result.overall_consistency,
            ]
            
            # Dimension scores and consistencies
            for dim in result.dimensions:
                row.extend([dim.score, dim.consistency])
            
            # Raw responses
            for i in range(1, 11):
                row.append(result.responses[f"q{i}"])
            
            writer.writerow(row)
    
    print(f"Exported {len(results)} results to {output_path}")


def generate_statistics(results: List[SHSResult]) -> Dict[str, Any]:
    """
    Generate statistical summary of batch results.
    
    Args:
        results: List of SHSResult objects
        
    Returns:
        Dictionary with statistical summary
    """
    if not results:
        return {}
    
    overall_scores = [r.overall_score for r in results]
    overall_consistencies = [abs(r.overall_consistency) for r in results]
    
    # Dimension statistics
    dim_stats = {}
    for dim_key in ["Factual Accuracy", "Source Reliability", "Logical Coherence", 
                    "Deceptiveness", "Responsiveness to Guidance"]:
        dim_scores = []
        dim_consistencies = []
        for result in results:
            for dim in result.dimensions:
                if dim.dimension_key == dim_key:
                    dim_scores.append(dim.score)
                    dim_consistencies.append(abs(dim.consistency))
                    break
        
        if dim_scores:
            dim_stats[dim_key] = {
                'mean_score': sum(dim_scores) / len(dim_scores),
                'min_score': min(dim_scores),
                'max_score': max(dim_scores),
                'mean_consistency': sum(dim_consistencies) / len(dim_consistencies),
            }
    
    stats = {
        'n_evaluations': len(results),
        'overall_score': {
            'mean': sum(overall_scores) / len(overall_scores),
            'min': min(overall_scores),
            'max': max(overall_scores),
            'std': (sum((x - sum(overall_scores)/len(overall_scores))**2 
                       for x in overall_scores) / len(overall_scores))**0.5,
        },
        'overall_consistency': {
            'mean': sum(overall_consistencies) / len(overall_consistencies),
            'min': min(overall_consistencies),
            'max': max(overall_consistencies),
        },
        'dimensions': dim_stats,
    }
    
    return stats


def main():
    parser = argparse.ArgumentParser(
        description='Batch process SHS evaluations',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Process JSON file and export results
  python batch_processor.py input.json --output results.json --format json
  
  # Process CSV file and export statistics
  python batch_processor.py input.csv --output results.csv --format csv --stats
  
  # Process with German labels
  python batch_processor.py input.json --language de --output results.json
        """
    )
    
    parser.add_argument('input', help='Input file (JSON or CSV)')
    parser.add_argument('--output', '-o', help='Output file path')
    parser.add_argument('--format', '-f', choices=['json', 'csv'], default='json',
                       help='Output format (default: json)')
    parser.add_argument('--language', '-l', choices=['en', 'de', 'fr'], default='en',
                       help='Language for labels (default: en)')
    parser.add_argument('--stats', '-s', action='store_true',
                       help='Generate and print statistical summary')
    parser.add_argument('--stats-output', help='Save statistics to JSON file')
    
    args = parser.parse_args()
    
    # Load input
    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Error: Input file not found: {args.input}")
        return 1
    
    print(f"Loading responses from {args.input}...")
    if input_path.suffix.lower() == '.csv':
        responses_list = load_responses_from_csv(str(input_path))
    else:
        responses_list = load_responses_from_json(str(input_path))
    
    print(f"Loaded {len(responses_list)} evaluations")
    
    # Process batch
    print("Processing evaluations...")
    results = process_batch(responses_list, args.language)
    print(f"Successfully processed {len(results)} evaluations")
    
    # Export results
    if args.output:
        output_path = Path(args.output)
        if args.format == 'csv':
            export_results_csv(results, str(output_path))
        else:
            export_results_json(results, str(output_path))
    
    # Generate statistics
    if args.stats or args.stats_output:
        stats = generate_statistics(results)
        
        if args.stats:
            print("\nStatistical Summary:")
            print("=" * 50)
            print(f"Number of evaluations: {stats['n_evaluations']}")
            print(f"\nOverall Score:")
            print(f"  Mean: {stats['overall_score']['mean']:.3f}")
            print(f"  Min:  {stats['overall_score']['min']:.3f}")
            print(f"  Max:  {stats['overall_score']['max']:.3f}")
            print(f"  Std:  {stats['overall_score']['std']:.3f}")
            print(f"\nOverall Consistency:")
            print(f"  Mean: {stats['overall_consistency']['mean']:.3f}")
            print(f"  Min:  {stats['overall_consistency']['min']:.3f}")
            print(f"  Max:  {stats['overall_consistency']['max']:.3f}")
            
            if stats['dimensions']:
                print(f"\nDimension Statistics:")
                for dim_key, dim_stat in stats['dimensions'].items():
                    print(f"  {dim_key}:")
                    print(f"    Mean Score: {dim_stat['mean_score']:.3f}")
                    print(f"    Range: [{dim_stat['min_score']:.3f}, {dim_stat['max_score']:.3f}]")
                    print(f"    Mean Consistency: {dim_stat['mean_consistency']:.3f}")
        
        if args.stats_output:
            with open(args.stats_output, 'w', encoding='utf-8') as f:
                json.dump(stats, f, indent=2, ensure_ascii=False)
            print(f"\nStatistics saved to {args.stats_output}")
    
    return 0


if __name__ == '__main__':
    exit(main())
