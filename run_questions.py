"""
run_questions.py - Batch evaluation runner.
Executes an array of questions from an input JSON file and writes the structured results to an output JSON file.
Usage:
    python run_questions.py data/questions/sample_questions.json results.json
"""

import sys
import json
import time
from pathlib import Path
from helpdesk.pipeline import ask

def main():
    if len(sys.argv) < 3:
        print("Usage: python run_questions.py <questions.json> <results.json>")
        print("Example: python run_questions.py data/questions/sample_questions.json results.json")
        sys.exit(1)
        
    input_file = Path(sys.argv[1])
    output_file = Path(sys.argv[2])
    
    if not input_file.exists():
        print(f"Error: Input file '{input_file}' does not exist.")
        sys.exit(1)
        
    with open(input_file, "r", encoding="utf-8") as f:
        questions = json.load(f)
        
    print(f"Loaded {len(questions)} questions from {input_file}.")
    print("=" * 60)
    
    results = []
    t0 = time.time()
    
    for idx, item in enumerate(questions, 1):
        q_id = item.get("id", f"Q{idx:02d}")
        q_text = item.get("question", "")
        print(f"[{idx}/{len(questions)}] ({q_id}): {q_text[:70]}...")
        
        res = ask(q_text)
        
        output_record = {
            "id": q_id,
            "question": q_text,
            "answer": res.get("answer", ""),
            "sources": res.get("sources", []),
            "sql": res.get("sql"),
            "dont_know": res.get("dont_know", False)
        }
        results.append(output_record)
        
    elapsed = time.time() - t0
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
        
    print("=" * 60)
    print(f"Completed {len(results)} questions in {elapsed:.2f}s ({elapsed/len(results):.2f}s/q).")
    print(f"Saved structured results to: {output_file}")

if __name__ == "__main__":
    main()

