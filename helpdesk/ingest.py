"""
helpdesk/ingest.py - Data ingestion and index construction module.
Extracts text from PDFs (with OCR fallback for scanned pages) and HTML documents,
chunks them into semantic units, and serializes index data into the index/ directory.
"""

import os
import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional

import pymupdf
from bs4 import BeautifulSoup
from rapidocr_onnxruntime import RapidOCR

logger = logging.getLogger("helpdesk.ingest")

DOC_METADATA = {
    "indianrail_refund_rules_2015.html": {
        "title": "Railway Passengers (Cancellation of Ticket and Refund of Fare) Rules, 2015",
        "date": "2015-11-12",
        "category": "refund_rules_2015"
    },
    "irctc_refund_rules_jan2026.pdf": {
        "title": "IRCTC Cancellation and Refund Rules (Updated Jan 2026)",
        "date": "2026-01-01",
        "category": "refund_rules_2026"
    },
    "pib_2026-03-24_reform_express.html": {
        "title": "Press Information Bureau: Indian Railways Reform Express 2026",
        "date": "2026-03-24",
        "category": "reform_express"
    },
    "rb_cc10_2024_advance_reservation.pdf": {
        "title": "Commercial Circular No. 10 of 2024: Revision of Advance Reservation Period (ARP) to 60 Days",
        "date": "2024-10-16",
        "category": "advance_reservation"
    },
    "rb_cc08_2025_tatkal.pdf": {
        "title": "Commercial Circular No. 08 of 2025: Modification in Tatkal Scheme (Aadhaar User ID Requirement)",
        "date": "2025-06-24",
        "category": "tatkal"
    },
    "rb_cc10_2025_reservation_charts.pdf": {
        "title": "Commercial Circular No. 10 of 2025: Preparation of First Reservation Charts 4 Hours Before Departure",
        "date": "2025-07-14",
        "category": "charts"
    },
    "rb_cc08_2026_vande_bharat_sleeper_refund.pdf": {
        "title": "Commercial Circular No. 08 of 2026 / G.S.R. 41(E): Refund Rules for Vande Bharat Sleeper Trains",
        "date": "2026-01-16",
        "category": "vande_bharat_sleeper"
    }
}


def extract_html_document(file_path: Path) -> List[Dict[str, Any]]:
    """Extract and chunk text from an HTML document."""
    meta = DOC_METADATA.get(file_path.name, {
        "title": file_path.stem,
        "date": "2020-01-01",
        "category": "document"
    })
    
    html_content = file_path.read_text(encoding="utf-8")
    soup = BeautifulSoup(html_content, "html.parser")
    
    # Strip script and style elements
    for s in soup(["script", "style"]):
        s.extract()
        
    pages = []
    
    # For HTML files, page is always null according to the specification
    if file_path.name == "indianrail_refund_rules_2015.html":
        # Extract table rows and structured paragraphs cleanly
        tables = soup.find_all("table")
        table_text = ""
        for tbl in tables:
            rows = tbl.find_all("tr")
            for r in rows:
                cols = [c.get_text(strip=True) for c in r.find_all(["td", "th"])]
                if cols:
                    table_text += " | ".join(cols) + "\n"
        
        full_text = soup.get_text(separator="\n", strip=True)
        combined = f"{full_text}\n\n[Structured Refund Table]:\n{table_text}"
        
        # Split into reasonable sized chunks
        paragraphs = combined.split("\n\n")
        chunk_buf = []
        chunk_len = 0
        chunk_idx = 0
        
        for p in paragraphs:
            p_clean = p.strip()
            if not p_clean:
                continue
            chunk_buf.append(p_clean)
            chunk_len += len(p_clean)
            if chunk_len >= 800:
                pages.append({
                    "chunk_id": f"{file_path.name}_c{chunk_idx}",
                    "doc": file_path.name,
                    "page": None,
                    "title": meta["title"],
                    "date": meta["date"],
                    "text": "\n\n".join(chunk_buf)
                })
                chunk_buf = []
                chunk_len = 0
                chunk_idx += 1
                
        if chunk_buf:
            pages.append({
                "chunk_id": f"{file_path.name}_c{chunk_idx}",
                "doc": file_path.name,
                "page": None,
                "title": meta["title"],
                "date": meta["date"],
                "text": "\n\n".join(chunk_buf)
            })
    else:
        # Standard HTML chunking (e.g. PIB press release)
        paragraphs = soup.find_all(["p", "h1", "h2", "h3", "h4", "li", "tr"])
        current_chunk = []
        current_len = 0
        chunk_idx = 0
        
        for p in paragraphs:
            txt = p.get_text(strip=True)
            if not txt:
                continue
            current_chunk.append(txt)
            current_len += len(txt)
            
            if current_len >= 900:
                pages.append({
                    "chunk_id": f"{file_path.name}_c{chunk_idx}",
                    "doc": file_path.name,
                    "page": None,
                    "title": meta["title"],
                    "date": meta["date"],
                    "text": "\n".join(current_chunk)
                })
                current_chunk = []
                current_len = 0
                chunk_idx += 1
                
        if current_chunk:
            pages.append({
                "chunk_id": f"{file_path.name}_c{chunk_idx}",
                "doc": file_path.name,
                "page": None,
                "title": meta["title"],
                "date": meta["date"],
                "text": "\n".join(current_chunk)
            })
            
    return pages


def extract_pdf_document(file_path: Path, ocr_engine: RapidOCR) -> List[Dict[str, Any]]:
    """Extract and chunk text from a PDF document with OCR fallback for scanned pages."""
    meta = DOC_METADATA.get(file_path.name, {
        "title": file_path.stem,
        "date": "2020-01-01",
        "category": "document"
    })
    
    doc = pymupdf.open(str(file_path))
    chunks = []
    
    for page_idx, page in enumerate(doc):
        page_num = page_idx + 1  # 1-indexed
        raw_text = page.get_text("text").strip()
        
        # Check if page is scanned or text is minimal
        if len(raw_text) < 50:
            pix = page.get_pixmap(dpi=200)
            img_bytes = pix.tobytes("png")
            ocr_res, _ = ocr_engine(img_bytes)
            if ocr_res:
                page_text = " ".join([line[1] for line in ocr_res])
            else:
                page_text = raw_text
        else:
            page_text = raw_text
            
        page_text = page_text.strip()
        if not page_text:
            continue
            
        # Break into chunks per page if page is long, otherwise 1 chunk per page
        if len(page_text) > 1400:
            paragraphs = page_text.split("\n\n")
            c_buf = []
            c_len = 0
            sub_idx = 0
            for para in paragraphs:
                p_str = para.strip()
                if not p_str:
                    continue
                c_buf.append(p_str)
                c_len += len(p_str)
                if c_len >= 800:
                    chunks.append({
                        "chunk_id": f"{file_path.name}_p{page_num}_{sub_idx}",
                        "doc": file_path.name,
                        "page": page_num,
                        "title": meta["title"],
                        "date": meta["date"],
                        "text": "\n\n".join(c_buf)
                    })
                    c_buf = []
                    c_len = 0
                    sub_idx += 1
            if c_buf:
                chunks.append({
                    "chunk_id": f"{file_path.name}_p{page_num}_{sub_idx}",
                    "doc": file_path.name,
                    "page": page_num,
                    "title": meta["title"],
                    "date": meta["date"],
                    "text": "\n\n".join(c_buf)
                })
        else:
            chunks.append({
                "chunk_id": f"{file_path.name}_p{page_num}",
                "doc": file_path.name,
                "page": page_num,
                "title": meta["title"],
                "date": meta["date"],
                "text": page_text
            })
            
    return chunks


def build_index(data_dir: str = "data", index_dir: str = "index") -> Dict[str, Any]:
    """Ingest all official documents and save chunks to index directory."""
    doc_path = Path(data_dir) / "documents"
    out_path = Path(index_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    
    if not doc_path.exists():
        raise FileNotFoundError(f"Documents directory not found at {doc_path}")
        
    ocr_engine = RapidOCR()
    all_chunks = []
    
    print(f"Ingesting documents from {doc_path}...")
    
    doc_files = sorted(list(doc_path.glob("*.pdf")) + list(doc_path.glob("*.html")))
    for f in doc_files:
        print(f"Processing {f.name}...")
        if f.suffix == ".html":
            chunks = extract_html_document(f)
        elif f.suffix == ".pdf":
            chunks = extract_pdf_document(f, ocr_engine)
        else:
            continue
            
        all_chunks.extend(chunks)
        print(f"  Extracted {len(chunks)} chunks from {f.name}")
        
    # Save chunks.json
    chunks_file = out_path / "chunks.json"
    with open(chunks_file, "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, indent=2, ensure_ascii=False)
        
    metadata = {
        "total_chunks": len(all_chunks),
        "total_documents": len(doc_files),
        "documents": [f.name for f in doc_files]
    }
    
    meta_file = out_path / "metadata.json"
    with open(meta_file, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"Index successfully built with {len(all_chunks)} chunks across {len(doc_files)} documents in '{index_dir}'.")
    return metadata


if __name__ == "__main__":
    build_index()

