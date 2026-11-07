"""
build_index.py - CLI tool to build the document retrieval index.
Reads documents from data/documents/, runs OCR on scanned PDFs, chunks texts,
and serializes the results into index/ for fast retrieval.
"""

import sys
import time
from pathlib import Path
from helpdesk.ingest import build_index

def main():
    print("=" * 60)
    print("Railway Passenger Help Desk - Index Builder")
    print("=" * 60)
    
    t0 = time.time()
    data_dir = "data"
    index_dir = "index"
    
    if len(sys.argv) > 1:
        data_dir = sys.argv[1]
    if len(sys.argv) > 2:
        index_dir = sys.argv[2]
        
    try:
        meta = build_index(data_dir=data_dir, index_dir=index_dir)
        elapsed = time.time() - t0
        print(f"\n[OK] Successfully indexed {meta['total_documents']} documents into {meta['total_chunks']} chunks in {elapsed:.2f}s.")
        print(f"[OK] Index saved to '{index_dir}/'.")
    except Exception as e:
        print(f"\n[ERROR] Failed to build index: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

