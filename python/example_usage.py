"""
Example usage of the SHS Calculator

This script demonstrates various ways to use the SHS calculator
for evaluation and analysis.

@license Apache-2.0
"""

from shs_calculator import SHSCalculator
import json


def example_single_evaluation():
    """Example: Calculate SHS for a single evaluation"""
    print("=" * 60)
    print("Example 1: Single Evaluation")
    print("=" * 60)
    
    # Example responses (q1-q10)
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
    
    # Print results
    print(f"\nOverall Score: {result.overall_score:.3f} (range: -1.0 to +1.0)")
    print(f"Overall Consistency: {result.overall_consistency:.3f}")
    print("\nDimension Breakdown:")
    print("-" * 60)
    for dim in result.dimensions:
        print(f"{dim.dimension_label}:")
        print(f"  Score: {dim.score:.3f}")
        print(f"  Consistency: {dim.consistency:.3f} ({dim.consistency_level.value})")
    print()


def example_multiple_languages():
    """Example: Using different languages"""
    print("=" * 60)
    print("Example 2: Multi-language Support")
    print("=" * 60)
    
    responses = {
        "q1": 1, "q2": -1, "q3": 0, "q4": 0, "q5": 1,
        "q6": -1, "q7": 0, "q8": 0, "q9": 0, "q10": 0
    }
    
    for lang in ["en", "de", "fr"]:
        result = SHSCalculator.calculate(responses, language=lang)
        print(f"\n{lang.upper()}:")
        print(f"  Overall Score: {result.overall_score:.3f}")
        print(f"  First Dimension: {result.dimensions[0].dimension_label}")
        print(f"    Question A: {result.dimensions[0].question_a[:50]}...")
    print()


def example_batch_processing():
    """Example: Processing multiple evaluations"""
    print("=" * 60)
    print("Example 3: Batch Processing")
    print("=" * 60)
    
    # Multiple evaluations
    evaluations = [
        {"q1": 2, "q2": -2, "q3": 1, "q4": -1, "q5": 2,
         "q6": -2, "q7": 1, "q8": -1, "q9": 1, "q10": -1},
        {"q1": 1, "q2": -1, "q3": 0, "q4": 0, "q5": 1,
         "q6": -1, "q7": 0, "q8": 0, "q9": 0, "q10": 0},
        {"q1": 0, "q2": 0, "q3": -1, "q4": 1, "q5": -1,
         "q6": 1, "q7": -1, "q8": 1, "q9": -1, "q10": 1},
    ]
    
    results = []
    for i, responses in enumerate(evaluations):
        result = SHSCalculator.calculate(responses)
        results.append(result)
        print(f"Evaluation {i+1}: Overall Score = {result.overall_score:.3f}")
    
    # Calculate statistics
    overall_scores = [r.overall_score for r in results]
    mean_score = sum(overall_scores) / len(overall_scores)
    print(f"\nMean Overall Score: {mean_score:.3f}")
    print(f"Score Range: [{min(overall_scores):.3f}, {max(overall_scores):.3f}]")
    print()


def example_export_json():
    """Example: Exporting results to JSON"""
    print("=" * 60)
    print("Example 4: JSON Export")
    print("=" * 60)
    
    responses = {
        "q1": 2, "q2": -2, "q3": 1, "q4": -1, "q5": 2,
        "q6": -2, "q7": 1, "q8": -1, "q9": 1, "q10": -1
    }
    
    result = SHSCalculator.calculate(responses)
    result_dict = result.to_dict()
    
    # Pretty print JSON
    json_str = json.dumps(result_dict, indent=2, ensure_ascii=False)
    print("JSON Export:")
    print(json_str[:500] + "...")
    print("\n(Full JSON saved to example_result.json)")
    
    # Save to file
    with open("example_result.json", "w", encoding="utf-8") as f:
        json.dump(result_dict, f, indent=2, ensure_ascii=False)
    print()


def example_consistency_analysis():
    """Example: Analyzing consistency"""
    print("=" * 60)
    print("Example 5: Consistency Analysis")
    print("=" * 60)
    
    # Example with good consistency
    good_responses = {
        "q1": 2, "q2": -2, "q3": 1, "q4": -1, "q5": 2,
        "q6": -2, "q7": 1, "q8": -1, "q9": 1, "q10": -1
    }
    
    # Example with poor consistency (contradictory responses)
    poor_responses = {
        "q1": 2, "q2": 2,  # Both positive - inconsistent!
        "q3": 1, "q4": 1,  # Both positive - inconsistent!
        "q5": -2, "q6": -2,  # Both negative - inconsistent!
        "q7": 1, "q8": 1,
        "q9": -1, "q10": -1
    }
    
    good_result = SHSCalculator.calculate(good_responses)
    poor_result = SHSCalculator.calculate(poor_responses)
    
    print("Good Consistency Example:")
    print(f"  Overall Consistency: {abs(good_result.overall_consistency):.3f}")
    for dim in good_result.dimensions:
        level = dim.consistency_level.value
        print(f"  {dim.dimension_label}: {level} (|{dim.consistency:.3f}|)")
    
    print("\nPoor Consistency Example:")
    print(f"  Overall Consistency: {abs(poor_result.overall_consistency):.3f}")
    for dim in poor_result.dimensions:
        level = dim.consistency_level.value
        print(f"  {dim.dimension_label}: {level} (|{dim.consistency:.3f}|)")
    print()


def example_from_list():
    """Example: Using list input format"""
    print("=" * 60)
    print("Example 6: List Input Format")
    print("=" * 60)
    
    # Responses as a list (ordered q1 to q10)
    responses_list = [2, -2, 1, -1, 2, -2, 1, -1, 1, -1]
    
    result = SHSCalculator.calculate_from_list(responses_list, language="en")
    
    print(f"Overall Score: {result.overall_score:.3f}")
    print("Responses were provided as a list [q1, q2, ..., q10]")
    print()


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("SHS Calculator - Example Usage")
    print("=" * 60 + "\n")
    
    example_single_evaluation()
    example_multiple_languages()
    example_batch_processing()
    example_export_json()
    example_consistency_analysis()
    example_from_list()
    
    print("=" * 60)
    print("All examples completed!")
    print("=" * 60)
