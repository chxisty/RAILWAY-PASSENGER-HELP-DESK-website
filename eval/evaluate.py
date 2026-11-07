"""
eval/evaluate.py - Automated evaluation framework.
Calculates official Capstone metrics:
- Hit@5 (retrieval metric)
- MRR (Mean Reciprocal Rank)
- Answer Accuracy (semantic & keyword alignment)
- Source Correctness (Precision, Recall, F1)
- Don't-know Accuracy (refusal precision & recall)
Usage:
    python eval/evaluate.py
    python eval/evaluate.py eval/test_set.json
"""

import sys
import json
import time
import re
from pathlib import Path
from typing import Dict, Any, List, Set, Tuple

# Add root directory to python path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from helpdesk.pipeline import ask
from helpdesk.search import DocumentSearcher


def normalize_tokens(text: str) -> Set[str]:
    """Tokenize and normalize text for token-level overlap scoring."""
    tokens = re.findall(r"\b[a-zA-Z0-9]+\b", text.lower())
    stopwords = {"a", "an", "the", "is", "are", "was", "were", "it", "to", "of", "and", "or", "in", "on", "at", "for"}
    return {t for t in tokens if t not in stopwords}


def compute_f1(pred_text: str, gold_text: str) -> float:
    """Compute token F1 overlap between predicted answer and ground truth."""
    pred_tokens = normalize_tokens(pred_text)
    gold_tokens = normalize_tokens(gold_text)
    
    if not gold_tokens:
        return 1.0 if not pred_tokens else 0.0
    if not pred_tokens:
        return 0.0
        
    common = pred_tokens.intersection(gold_tokens)
    if not common:
        return 0.0
        
    precision = len(common) / len(pred_tokens)
    recall = len(common) / len(gold_tokens)
    return 2 * (precision * recall) / (precision + recall)


def source_match(src1: Dict[str, Any], src2: Dict[str, Any]) -> bool:
    """Check if two source references match on document and page."""
    if src1.get("doc") != src2.get("doc"):
        return False
    # If expected page is None or actual page is None, matching doc is sufficient
    p1 = src1.get("page")
    p2 = src2.get("page")
    if p1 is None or p2 is None:
        return True
    return p1 == p2


def evaluate(test_set_path: str = "eval/test_set.json") -> Dict[str, Any]:
    test_file = Path(test_set_path)
    if not test_file.exists():
        print(f"Error: Test set not found at {test_file}")
        sys.exit(1)
        
    with open(test_file, "r", encoding="utf-8") as f:
        test_cases = json.load(f)
        
    print("=" * 70)
    print(f"RUNNING AUTOMATED EVALUATION ON {len(test_cases)} TEST QUESTIONS")
    print("=" * 70)
    
    searcher = DocumentSearcher()
    
    hit5_list = []
    mrr_list = []
    answer_f1_list = []
    source_p_list = []
    source_r_list = []
    
    tp_dont_know = 0
    fp_dont_know = 0
    fn_dont_know = 0
    tn_dont_know = 0
    
    category_stats = {}
    
    t0 = time.time()
    
    for idx, tc in enumerate(test_cases, 1):
        q_id = tc["id"]
        question = tc["question"]
        gold_ans = tc["ground_truth_answer"]
        expected_sources = tc.get("expected_sources", [])
        is_unsupported = tc.get("is_unsupported", False)
        category = tc.get("category", "general")
        
        if category not in category_stats:
            category_stats[category] = {"count": 0, "correct": 0}
        category_stats[category]["count"] += 1
        
        # 1. Retrieval Evaluation (Hit@5 and MRR)
        if expected_sources:
            retrieved = searcher.search(question, k=5)
            hit = 0
            reciprocal_rank = 0.0
            
            for rank, r_chunk in enumerate(retrieved, 1):
                chunk_ref = {"doc": r_chunk["doc"], "page": r_chunk.get("page")}
                if any(source_match(chunk_ref, exp) for exp in expected_sources):
                    hit = 1
                    if reciprocal_rank == 0.0:
                        reciprocal_rank = 1.0 / rank
                        
            hit5_list.append(hit)
            mrr_list.append(reciprocal_rank)
            
        # 2. Pipeline Execution
        pred = ask(question)
        pred_ans = pred.get("answer", "")
        pred_sources = pred.get("sources", [])
        pred_dont_know = pred.get("dont_know", False)
        
        # 3. Don't-know Classification
        if is_unsupported:
            if pred_dont_know:
                tp_dont_know += 1
                category_stats[category]["correct"] += 1
            else:
                fn_dont_know += 1
        else:
            if pred_dont_know:
                fp_dont_know += 1
            else:
                tn_dont_know += 1
                
        # 4. Answer Accuracy (F1)
        f1 = compute_f1(pred_ans, gold_ans)
        answer_f1_list.append(f1)
        if not is_unsupported and f1 >= 0.35:
            category_stats[category]["correct"] += 1
            
        # 5. Source Correctness
        if expected_sources:
            matched_sources = 0
            for ps in pred_sources:
                if any(source_match(ps, es) for es in expected_sources):
                    matched_sources += 1
            prec = matched_sources / len(pred_sources) if pred_sources else 0.0
            rec = matched_sources / len(expected_sources) if expected_sources else 0.0
            source_p_list.append(prec)
            source_r_list.append(rec)
            
        status = "PASS" if (is_unsupported and pred_dont_know) or (not is_unsupported and f1 >= 0.35) else "REVIEW"
        print(f"[{idx:02d}/{len(test_cases)}] {q_id} ({category:<11}) -> {status} (F1: {f1:.2f})")
        
    elapsed = time.time() - t0
    
    # Calculate macro aggregates
    avg_hit5 = (sum(hit5_list) / len(hit5_list)) * 100 if hit5_list else 100.0
    avg_mrr = sum(mrr_list) / len(mrr_list) if mrr_list else 1.0
    avg_ans_f1 = (sum(answer_f1_list) / len(answer_f1_list)) * 100 if answer_f1_list else 0.0
    avg_src_p = (sum(source_p_list) / len(source_p_list)) * 100 if source_p_list else 100.0
    avg_src_r = (sum(source_r_list) / len(source_r_list)) * 100 if source_r_list else 100.0
    src_f1 = (2 * avg_src_p * avg_src_r / (avg_src_p + avg_src_r)) if (avg_src_p + avg_src_r) > 0 else 0.0
    
    dk_precision = (tp_dont_know / (tp_dont_know + fp_dont_know) * 100) if (tp_dont_know + fp_dont_know) > 0 else 100.0
    dk_recall = (tp_dont_know / (tp_dont_know + fn_dont_know) * 100) if (tp_dont_know + fn_dont_know) > 0 else 100.0
    dk_accuracy = ((tp_dont_know + tn_dont_know) / len(test_cases)) * 100
    
    print("\n" + "=" * 70)
    print("OFFICIAL CAPSTONE EVALUATION RESULTS")
    print("=" * 70)
    print(f"Total Test Questions     : {len(test_cases)}")
    print(f"Evaluation Duration      : {elapsed:.2f}s ({elapsed/len(test_cases):.2f}s per query)")
    print("-" * 70)
    print(f"Retrieval Hit@5          : {avg_hit5:.1f}%")
    print(f"Retrieval MRR            : {avg_mrr:.3f}")
    print(f"Answer Accuracy (F1)     : {avg_ans_f1:.1f}%")
    print(f"Source Precision         : {avg_src_p:.1f}%")
    print(f"Source Recall            : {avg_src_r:.1f}%")
    print(f"Source F1                : {src_f1:.1f}%")
    print(f"Don't-Know Precision     : {dk_precision:.1f}%")
    print(f"Don't-Know Recall        : {dk_recall:.1f}%")
    print(f"Don't-Know Accuracy      : {dk_accuracy:.1f}%")
    print("-" * 70)
    print("Category Breakdown:")
    for cat, stat in category_stats.items():
        pct = (stat["correct"] / stat["count"]) * 100 if stat["count"] > 0 else 0
        print(f"  - {cat:<15}: {stat['correct']}/{stat['count']} passed ({pct:.1f}%)")
    print("=" * 70)
    
    metrics = {
        "total_questions": len(test_cases),
        "hit_at_5": avg_hit5,
        "mrr": avg_mrr,
        "answer_f1": avg_ans_f1,
        "source_precision": avg_src_p,
        "source_recall": avg_src_r,
        "source_f1": src_f1,
        "dont_know_precision": dk_precision,
        "dont_know_recall": dk_recall,
        "dont_know_accuracy": dk_accuracy,
        "category_breakdown": category_stats
    }
    return metrics


if __name__ == "__main__":
    test_path = sys.argv[1] if len(sys.argv) > 1 else "eval/test_set.json"
    evaluate(test_path)

