import os
import re
import json
import logging
import difflib
from datetime import datetime
from pathlib import Path
from typing import Any, Optional
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.core.config import settings
from app.models.schemas import RetrievedSource, RailwayInfoItem
from app.retrieval.baseline_data import (
    BASELINE_TRAINS,
    BASELINE_STATIONS,
    BASELINE_POLICIES,
    BASELINE_FAQS
)

logger = logging.getLogger(__name__)

CITY_ALIASES = {
    "delhi": "NDLS",
    "new delhi": "NDLS",
    "mumbai": "CSMT",
    "bombay": "CSMT",
    "mumbai central": "MMCT",
    "chennai": "MAS",
    "madras": "MAS",
    "bangalore": "SBC",
    "bengaluru": "SBC",
    "kolkata": "HWH",
    "calcutta": "HWH",
    "howrah": "HWH",
    "coimbatore": "CBE",
    "trivandrum": "TVC",
    "thiruvananthapuram": "TVC",
    "bhopal": "RKMP",
    "rani kamalapati": "RKMP",
    "habibganj": "RKMP",
    "varanasi": "BSB",
    "banaras": "BSB",
    "kashi": "BSB",
    "ernakulam": "ERS",
    "cochin": "ERS",
    "kochi": "ERS",
    "pune": "PUNE",
    "kollam": "QLN",
    "quilon": "QLN",
    "thrissur": "TCR",
    "trichur": "TCR",
    "palakkad": "PGT",
    "palghat": "PGT",
    "alappuzha": "ALLP",
    "alleppey": "ALLP",
    "kayamkulam": "KYJ",
    "kozhikode": "CLT",
    "calicut": "CLT",
    "shoranur": "SRR",
    "kannur": "CAN",
    "cannore": "CAN",
    "kasaragod": "KGQ",
    "surat": "ST",
    "vadodara": "BRC",
    "baroda": "BRC",
    "ratlam": "RTM",
    "kota": "KOTA",
    "salem": "SA",
    "erode": "ED",
    "tiruppur": "TUP",
    "madgaon": "MAO",
    "goa": "MAO",
    "agra": "AGC",
    "mathura": "MTJ",
    "kanpur": "CNB",
    "prayagraj": "PRYJ",
    "allahabad": "PRYJ",
    "jhansi": "VGLJ",
    "gwalior": "GWL",
    "asansol": "ASN",
    "dhanbad": "DHN",
    "gaya": "GAYA",
    "deendayal": "DDU"
}

KEYWORD_POLICY_MAP = {
    "tatkal": ["POL_TATKAL_01", "FAQ_02"],
    "cancellation": ["POL_REFUND_02", "POL_RAC_WL_03"],
    "cancel": ["POL_REFUND_02", "POL_RAC_WL_03"],
    "refund": ["POL_REFUND_02", "POL_RAC_WL_03"],
    "clerkage": ["POL_REFUND_02", "POL_RAC_WL_03"],
    "rac": ["POL_RAC_WL_03"],
    "waitlist": ["POL_RAC_WL_03"],
    "waiting": ["POL_RAC_WL_03"],
    "baggage": ["POL_BAGGAGE_04", "FAQ_03"],
    "luggage": ["POL_BAGGAGE_04", "FAQ_03"],
    "senior": ["POL_SENIOR_05"],
    "lower berth": ["POL_SENIOR_05"],
    "quota": ["POL_SENIOR_05"],
    "pet": ["POL_PETS_06"],
    "dog": ["POL_PETS_06"],
    "cat": ["POL_PETS_06"],
    "lost": ["POL_LOST_07"],
    "found": ["POL_LOST_07"],
    "emergency": ["POL_EMERGENCY_08", "FAQ_01"],
    "helpline": ["POL_EMERGENCY_08", "FAQ_01"],
    "doctor": ["POL_EMERGENCY_08"],
    "medical": ["POL_EMERGENCY_08"],
    "139": ["POL_EMERGENCY_08", "FAQ_01"]
}

class RailwayRetrievalEngine:
    def __init__(self, data_dir: Optional[str] = None):
        self.data_dir = Path(data_dir or settings.DATA_DIR)
        self.dataset_status: str = "uninitialized"
        self.loaded_files: list[str] = []
        
        # Primary In-Memory Collections
        self.trains: list[dict[str, Any]] = []
        self.stations: list[dict[str, Any]] = []
        self.policies: list[dict[str, Any]] = []
        self.faqs: list[dict[str, Any]] = []
        
        # Fast Lookup Maps
        self.trains_by_number: dict[str, dict[str, Any]] = {}
        self.trains_by_name: dict[str, dict[str, Any]] = {}
        self.stations_by_code: dict[str, dict[str, Any]] = {}
        self.stations_by_name: dict[str, dict[str, Any]] = {}
        self.policies_by_id: dict[str, dict[str, Any]] = {}
        self.faqs_by_id: dict[str, dict[str, Any]] = {}
        
        # Vectorizer and Chunk Index for Semantic Search
        self.doc_chunks: list[dict[str, Any]] = []
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.tfidf_matrix = None
        
        # Initialize
        self.load_dataset()

    def load_dataset(self) -> None:
        """Loads dataset from files in data_dir, falling back to baseline reference data."""
        self.trains.clear()
        self.stations.clear()
        self.policies.clear()
        self.faqs.clear()
        self.loaded_files.clear()
        
        external_files_found = False
        
        if self.data_dir.exists():
            for root, _, files in os.walk(self.data_dir):
                for f in files:
                    if f.startswith(".") or f.lower() in ("readme.md", ".gitkeep"):
                        continue
                    full_path = Path(root) / f
                    ext = full_path.suffix.lower()
                    if ext in (".csv", ".json", ".xlsx", ".txt", ".md"):
                        external_files_found = True
                        self._ingest_file(full_path)
        
        if external_files_found and (self.trains or self.stations or self.policies or self.faqs):
            self.dataset_status = "external_dataset_loaded"
            logger.info(f"Loaded external dataset successfully from {len(self.loaded_files)} files.")
        else:
            self._load_baseline()
            self.dataset_status = "baseline_reference_mode"
            
        self._build_indices()
        self._build_vector_index()

    def _load_baseline(self) -> None:
        """Loads the verified authentic baseline railway data."""
        self.trains = [dict(t, source="baseline_reference") for t in BASELINE_TRAINS]
        self.stations = [dict(s, source="baseline_reference") for s in BASELINE_STATIONS]
        self.policies = [dict(p, source="baseline_reference") for p in BASELINE_POLICIES]
        self.faqs = [dict(f, source="baseline_reference") for f in BASELINE_FAQS]
        self.loaded_files = ["baseline_verified_reference.py"]

    def _ingest_file(self, file_path: Path) -> None:
        """Ingests a single file, detecting its type and contents flexibly."""
        file_name = file_path.name
        ext = file_path.suffix.lower()
        
        try:
            if ext == ".csv":
                df = pd.read_csv(file_path, dtype=str).fillna("")
                self._process_dataframe(df, file_name)
                self.loaded_files.append(file_name)
            elif ext == ".xlsx":
                xls = pd.ExcelFile(file_path)
                for sheet in xls.sheet_names:
                    df = pd.read_excel(xls, sheet_name=sheet, dtype=str).fillna("")
                    self._process_dataframe(df, f"{file_name} [{sheet}]")
                self.loaded_files.append(file_name)
            elif ext == ".json":
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self._process_json(data, file_name)
                self.loaded_files.append(file_name)
            elif ext in (".txt", ".md"):
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    self._process_text(content, file_name)
                self.loaded_files.append(file_name)
        except Exception as e:
            logger.error(f"Failed to ingest file {file_name}: {e}")

    def _process_dataframe(self, df: pd.DataFrame, source_name: str) -> None:
        """Classifies and processes a tabular dataframe based on detected columns."""
        if df.empty:
            return
            
        cols = {str(c).lower().strip().replace(" ", "_"): c for c in df.columns}
        
        train_no_col = next((cols[k] for k in cols if any(x in k for x in ["train_no", "trainno", "train_num", "number"])), None)
        train_name_col = next((cols[k] for k in cols if "name" in k and "station" not in k), None)
        
        stn_code_col = next((cols[k] for k in cols if any(x in k for x in ["station_code", "stn_code", "code"]) and "train" not in k), None)
        stn_name_col = next((cols[k] for k in cols if "station_name" in k or ("station" in k and "name" in k)), None)
        
        rule_col = next((cols[k] for k in cols if any(x in k for x in ["rule", "policy", "question", "title"])), None)
        desc_col = next((cols[k] for k in cols if any(x in k for x in ["desc", "detail", "content", "answer", "text"])), None)
        
        for idx, row in df.iterrows():
            row_dict = row.to_dict()
            
            if train_no_col and row_dict.get(train_no_col):
                train_num = str(row_dict[train_no_col]).strip()
                train_name = str(row_dict.get(train_name_col, f"Train {train_num}")).strip()
                item = {
                    "train_number": train_num,
                    "train_name": train_name,
                    "origin_name": str(row_dict.get(cols.get("origin", cols.get("source", cols.get("from", ""))), "")),
                    "destination_name": str(row_dict.get(cols.get("destination", cols.get("dest", cols.get("to", ""))), "")),
                    "departure_time": str(row_dict.get(cols.get("departure_time", cols.get("departure", cols.get("dept_time", ""))), "")),
                    "arrival_time": str(row_dict.get(cols.get("arrival_time", cols.get("arrival", cols.get("arr_time", ""))), "")),
                    "classes": str(row_dict.get(cols.get("classes", cols.get("class", "")), "")),
                    "runs_on": str(row_dict.get(cols.get("runs_on", cols.get("days", "")), "")),
                    "source": source_name,
                    "raw": row_dict
                }
                self.trains.append(item)
            elif stn_code_col and row_dict.get(stn_code_col):
                code = str(row_dict[stn_code_col]).strip().upper()
                name = str(row_dict.get(stn_name_col, code)).strip()
                facilities_raw = row_dict.get(cols.get("facilities", cols.get("amenities", "")), "")
                facilities = [f.strip() for f in str(facilities_raw).split(",") if f.strip()] if facilities_raw else []
                item = {
                    "station_code": code,
                    "station_name": name,
                    "city": str(row_dict.get(cols.get("city", ""), "")),
                    "state": str(row_dict.get(cols.get("state", ""), "")),
                    "division": str(row_dict.get(cols.get("division", ""), "")),
                    "zone": str(row_dict.get(cols.get("zone", ""), "")),
                    "facilities": facilities,
                    "source": source_name,
                    "raw": row_dict
                }
                self.stations.append(item)
            elif rule_col or desc_col:
                title = str(row_dict.get(rule_col, f"Rule {idx+1}")).strip()
                content = str(row_dict.get(desc_col, "")).strip()
                category = str(row_dict.get(cols.get("category", "General Policy"), "General Policy")).strip()
                item = {
                    "policy_id": f"EXT_POL_{idx+1}",
                    "category": category,
                    "title": title,
                    "content": content or title,
                    "source": source_name,
                    "raw": row_dict
                }
                self.policies.append(item)

    def _process_json(self, data: Any, source_name: str) -> None:
        if isinstance(data, list):
            for i, item in enumerate(data):
                if isinstance(item, dict):
                    if "train_number" in item or "train_no" in item:
                        item["source"] = source_name
                        self.trains.append(item)
                    elif "station_code" in item or "stn_code" in item:
                        item["source"] = source_name
                        self.stations.append(item)
                    elif "policy_id" in item or "rule" in item or "policy" in item:
                        item["source"] = source_name
                        self.policies.append(item)
                    elif "question" in item:
                        item["source"] = source_name
                        self.faqs.append(item)
        elif isinstance(data, dict):
            for key in ["trains", "stations", "policies", "faqs"]:
                if key in data and isinstance(data[key], list):
                    for item in data[key]:
                        if isinstance(item, dict):
                            item["source"] = source_name
                            getattr(self, key).append(item)

    def _process_text(self, content: str, source_name: str) -> None:
        sections = re.split(r'\n(?=#{1,3}\s+|\d+\.\s+)', content)
        for i, section in enumerate(sections):
            text = section.strip()
            if not text or len(text) < 20:
                continue
            lines = text.split("\n")
            title = lines[0].replace("#", "").strip()
            body = "\n".join(lines[1:]).strip() if len(lines) > 1 else text
            self.policies.append({
                "policy_id": f"DOC_{source_name}_{i+1}",
                "category": "Documentation Policy",
                "title": title,
                "content": body,
                "source": source_name
            })

    def _build_indices(self) -> None:
        self.trains_by_number.clear()
        self.trains_by_name.clear()
        self.stations_by_code.clear()
        self.stations_by_name.clear()
        self.policies_by_id.clear()
        self.faqs_by_id.clear()
        
        for t in self.trains:
            num = str(t.get("train_number", t.get("train_no", ""))).strip()
            if num:
                self.trains_by_number[num] = t
            name = str(t.get("train_name", t.get("name", ""))).strip().lower()
            if name:
                self.trains_by_name[name] = t
                clean_name = re.sub(r'[^a-z0-9\s]', '', name)
                self.trains_by_name[clean_name] = t
                
        for s in self.stations:
            code = str(s.get("station_code", s.get("code", ""))).strip().upper()
            if code:
                self.stations_by_code[code] = s
            name = str(s.get("station_name", s.get("name", ""))).strip().lower()
            if name:
                self.stations_by_name[name] = s
                clean_name = re.sub(r'[^a-z0-9\s]', '', name)
                self.stations_by_name[clean_name] = s
                
        for p in self.policies:
            pid = p.get("policy_id")
            if pid:
                self.policies_by_id[pid] = p
                
        for f in self.faqs:
            fid = f.get("faq_id")
            if fid:
                self.faqs_by_id[fid] = f

    def _build_vector_index(self) -> None:
        self.doc_chunks.clear()
        
        for t in self.trains:
            num = t.get("train_number", "")
            name = t.get("train_name", "")
            orig = t.get("origin_name", t.get("origin_code", ""))
            dest = t.get("destination_name", t.get("destination_code", ""))
            classes = t.get("classes", "")
            halts = t.get("major_halts", [])
            text = (
                f"Train {num} {name}. Origin: {orig} ({t.get('origin_code', '')}), "
                f"Destination: {dest} ({t.get('destination_code', '')}). "
                f"Departure: {t.get('departure_time', '')}, Arrival: {t.get('arrival_time', '')}. "
                f"Runs on: {t.get('runs_on', '')}. Classes: {classes}. Halts: {', '.join(halts) if isinstance(halts, list) else halts}."
            )
            self.doc_chunks.append({
                "record_id": f"TRAIN_{num}",
                "category": "Train",
                "title": f"Train {num} - {name}",
                "snippet": text,
                "file_source": t.get("source", "dataset"),
                "metadata": t
            })
            
        for s in self.stations:
            code = s.get("station_code", "")
            name = s.get("station_name", "")
            facs = s.get("facilities", [])
            fac_str = ", ".join(facs) if isinstance(facs, list) else str(facs)
            text = (
                f"Station {code} - {name}. Located in {s.get('city', '')}, {s.get('state', '')}. "
                f"Zone: {s.get('zone', '')}, Division: {s.get('division', '')}. "
                f"Platforms: {s.get('platforms', '')}. Facilities & Amenities: {fac_str}."
            )
            self.doc_chunks.append({
                "record_id": f"STN_{code}",
                "category": "Station",
                "title": f"Station {code} - {name}",
                "snippet": text,
                "file_source": s.get("source", "dataset"),
                "metadata": s
            })
            
        for p in self.policies:
            pid = p.get("policy_id", "POL")
            title = p.get("title", "")
            content = p.get("content", "")
            cat = p.get("category", "Policy")
            text = f"Railway Policy: {title}. Category: {cat}. Details: {content}"
            self.doc_chunks.append({
                "record_id": pid,
                "category": "Policy",
                "title": title,
                "snippet": text,
                "file_source": p.get("source", "dataset"),
                "metadata": p
            })
            
        for f in self.faqs:
            fid = f.get("faq_id", "FAQ")
            q = f.get("question", "")
            a = f.get("answer", "")
            text = f"FAQ: {q} Answer: {a}"
            self.doc_chunks.append({
                "record_id": fid,
                "category": "FAQ",
                "title": q,
                "snippet": text,
                "file_source": f.get("source", "dataset"),
                "metadata": f
            })
            
        if self.doc_chunks:
            corpus = [doc["snippet"] for doc in self.doc_chunks]
            self.vectorizer = TfidfVectorizer(
                ngram_range=(1, 2),
                stop_words="english",
                sublinear_tf=True
            )
            self.tfidf_matrix = self.vectorizer.fit_transform(corpus)

    def extract_entities(self, query: str) -> dict[str, Any]:
        text = query.lower()
        entities = {
            "train_numbers": [],
            "station_codes": [],
            "station_names": [],
            "route": None,
            "keywords": []
        }
        
        train_nums = re.findall(r'\b\d{4,5}\b', query)
        for num in train_nums:
            entities["train_numbers"].append(num)
                
        for city, code in CITY_ALIASES.items():
            pattern = r'\b' + re.escape(city) + r'\b'
            if re.search(pattern, text):
                if code not in entities["station_codes"]:
                    entities["station_codes"].append(code)
                entities["station_names"].append(city.title())
                
        tokens = re.findall(r'\b[A-Za-z]{2,5}\b', query)
        for tok in tokens:
            upper_tok = tok.upper()
            if upper_tok in self.stations_by_code:
                if upper_tok not in entities["station_codes"]:
                    entities["station_codes"].append(upper_tok)
                    
        for stn_name, stn_rec in self.stations_by_name.items():
            if len(stn_name) > 3 and stn_name in text:
                code = stn_rec.get("station_code")
                if code and code not in entities["station_codes"]:
                    entities["station_codes"].append(code)
                if stn_rec.get("station_name") not in entities["station_names"]:
                    entities["station_names"].append(stn_rec.get("station_name"))
                    
        route_match = re.search(r'(?:from|between)\s+([a-zA-Z\s]+?)\s+(?:to|and)\s+([a-zA-Z\s]+)', text)
        if route_match:
            orig_raw = route_match.group(1).strip()
            dest_raw = route_match.group(2).strip()
            orig_code = CITY_ALIASES.get(orig_raw, orig_raw.upper())
            dest_code = CITY_ALIASES.get(dest_raw, dest_raw.upper())
            entities["route"] = {"origin": orig_raw, "destination": dest_raw, "origin_code": orig_code, "destination_code": dest_code}

        for kw in KEYWORD_POLICY_MAP:
            if kw in text:
                entities["keywords"].append(kw)
                
        return entities

    def retrieve(self, query: str, top_k: int = 8) -> list[RetrievedSource]:
        results: list[RetrievedSource] = []
        seen_ids: set[str] = set()
        
        entities = self.extract_entities(query)
        lower_query = query.lower()
        
        # 1. Exact Match on Train Numbers
        for num in entities["train_numbers"]:
            if num in self.trains_by_number:
                t = self.trains_by_number[num]
                rec_id = f"TRAIN_{num}"
                snippet = (
                    f"Train {num}: {t.get('train_name')}. "
                    f"Route: {t.get('origin_name')} ({t.get('origin_code')}) -> {t.get('destination_name')} ({t.get('destination_code')}). "
                    f"Departure: {t.get('departure_time')}, Arrival: {t.get('arrival_time')}. "
                    f"Runs on: {t.get('runs_on')}. Classes: {t.get('classes')}. Halts: {t.get('major_halts')}."
                )
                results.append(RetrievedSource(
                    record_id=rec_id,
                    category="Train",
                    title=f"Train {num} - {t.get('train_name')}",
                    snippet=snippet,
                    score=1.0,
                    file_source=t.get("source", "dataset"),
                    metadata=t
                ))
                seen_ids.add(rec_id)
                
        # 2. Exact Match on Station Codes
        for code in entities["station_codes"]:
            if code in self.stations_by_code:
                s = self.stations_by_code[code]
                rec_id = f"STN_{code}"
                if rec_id not in seen_ids:
                    facs = s.get("facilities", [])
                    fac_str = ", ".join(facs) if isinstance(facs, list) else str(facs)
                    snippet = (
                        f"Station {code}: {s.get('station_name')}. "
                        f"City/State: {s.get('city')}, {s.get('state')}. Zone: {s.get('zone')}. Platforms: {s.get('platforms')}. "
                        f"Available Facilities: {fac_str}."
                    )
                    results.append(RetrievedSource(
                        record_id=rec_id,
                        category="Station",
                        title=f"Station {code} - {s.get('station_name')}",
                        snippet=snippet,
                        score=1.0,
                        file_source=s.get("source", "dataset"),
                        metadata=s
                    ))
                    seen_ids.add(rec_id)

        # 3. Keyword / Policy Direct Boosting
        for kw in entities["keywords"]:
            target_ids = KEYWORD_POLICY_MAP.get(kw, [])
            for tid in target_ids:
                if tid in self.policies_by_id and tid not in seen_ids:
                    p = self.policies_by_id[tid]
                    results.append(RetrievedSource(
                        record_id=tid,
                        category="Policy",
                        title=p.get("title", "Policy"),
                        snippet=f"{p.get('title')}: {p.get('content')}",
                        score=0.98,
                        file_source=p.get("source", "dataset"),
                        metadata=p
                    ))
                    seen_ids.add(tid)
                elif tid in self.faqs_by_id and tid not in seen_ids:
                    f = self.faqs_by_id[tid]
                    results.append(RetrievedSource(
                        record_id=tid,
                        category="FAQ",
                        title=f.get("question", "FAQ"),
                        snippet=f"Q: {f.get('question')} A: {f.get('answer')}",
                        score=0.96,
                        file_source=f.get("source", "dataset"),
                        metadata=f
                    ))
                    seen_ids.add(tid)

        # 4. Route Search Match
        if entities["route"]:
            r = entities["route"]
            orig_candidates = [r["origin_code"].upper(), r["origin"].lower()]
            dest_candidates = [r["destination_code"].upper(), r["destination"].lower()]
            
            for t in self.trains:
                t_orig_code = str(t.get("origin_code", "")).upper()
                t_orig_name = str(t.get("origin_name", "")).lower()
                t_dest_code = str(t.get("destination_code", "")).upper()
                t_dest_name = str(t.get("destination_name", "")).lower()
                
                orig_match = any(c in t_orig_code or c in t_orig_name for c in orig_candidates if c)
                dest_match = any(c in t_dest_code or c in t_dest_name for c in dest_candidates if c)
                
                if orig_match and dest_match:
                    num = t.get("train_number")
                    rec_id = f"TRAIN_{num}"
                    if rec_id not in seen_ids:
                        snippet = (
                            f"Direct Train: {num} - {t.get('train_name')}. "
                            f"{t.get('origin_name')} ({t.get('origin_code')}) to {t.get('destination_name')} ({t.get('destination_code')}). "
                            f"Departs: {t.get('departure_time')}, Arrives: {t.get('arrival_time')}. Classes: {t.get('classes')}."
                        )
                        results.append(RetrievedSource(
                            record_id=rec_id,
                            category="Train Route",
                            title=f"Route Match: {t.get('train_name')}",
                            snippet=snippet,
                            score=0.98,
                            file_source=t.get("source", "dataset"),
                            metadata=t
                        ))
                        seen_ids.add(rec_id)

        # 5. Fuzzy Match for Train Names
        train_names = list(self.trains_by_name.keys())
        close_matches = difflib.get_close_matches(lower_query, train_names, n=2, cutoff=0.55)
        for m in close_matches:
            t = self.trains_by_name[m]
            num = t.get("train_number")
            rec_id = f"TRAIN_{num}"
            if rec_id not in seen_ids:
                results.append(RetrievedSource(
                    record_id=rec_id,
                    category="Train",
                    title=f"Train {num} - {t.get('train_name')}",
                    snippet=f"Train {num} {t.get('train_name')}: {t.get('origin_name')} to {t.get('destination_name')}, Departs {t.get('departure_time')}.",
                    score=0.92,
                    file_source=t.get("source", "dataset"),
                    metadata=t
                ))
                seen_ids.add(rec_id)

        # 6. Semantic / TF-IDF Vector Search with Adaptive Threshold
        if self.vectorizer and self.tfidf_matrix is not None and self.doc_chunks:
            try:
                query_vec = self.vectorizer.transform([query])
                sims = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
                top_indices = np.argsort(sims)[::-1]
                
                # Adaptive threshold: allow top matches with score > 0.04
                for idx in top_indices[:top_k]:
                    sim_score = float(sims[idx])
                    if sim_score < 0.04:
                        break
                    doc = self.doc_chunks[idx]
                    rec_id = doc["record_id"]
                    if rec_id not in seen_ids:
                        results.append(RetrievedSource(
                            record_id=rec_id,
                            category=doc["category"],
                            title=doc["title"],
                            snippet=doc["snippet"],
                            score=round(sim_score, 4),
                            file_source=doc["file_source"],
                            metadata=doc["metadata"]
                        ))
                        seen_ids.add(rec_id)
                        if len(results) >= top_k:
                            break
            except Exception as e:
                logger.error(f"Error in vector retrieval: {e}")

        return results[:top_k]

    def get_total_records_count(self) -> int:
        return len(self.trains) + len(self.stations) + len(self.policies) + len(self.faqs)

    def get_category_breakdown(self) -> dict[str, int]:
        return {
            "Trains": len(self.trains),
            "Stations": len(self.stations),
            "Policies & Rules": len(self.policies),
            "FAQs": len(self.faqs)
        }

    def get_all_railway_info(self, category: Optional[str] = None, page: int = 1, page_size: int = 20) -> tuple[list[RailwayInfoItem], int]:
        items: list[RailwayInfoItem] = []
        cat_lower = category.lower().strip() if category else ""
        
        if not cat_lower or cat_lower in ("train", "trains"):
            for t in self.trains:
                items.append(RailwayInfoItem(
                    id=f"TRAIN_{t.get('train_number')}",
                    category="Train",
                    name=t.get("train_name", ""),
                    code=str(t.get("train_number", "")),
                    origin=f"{t.get('origin_name', '')} ({t.get('origin_code', '')})",
                    destination=f"{t.get('destination_name', '')} ({t.get('destination_code', '')})",
                    departure=t.get("departure_time", ""),
                    arrival=t.get("arrival_time", ""),
                    details=f"Runs: {t.get('runs_on')}. Classes: {t.get('classes')}. Duration: {t.get('duration', 'N/A')}.",
                    source=t.get("source", "dataset"),
                    raw_data=t
                ))
                
        if not cat_lower or cat_lower in ("station", "stations"):
            for s in self.stations:
                facs = s.get("facilities", [])
                items.append(RailwayInfoItem(
                    id=f"STN_{s.get('station_code')}",
                    category="Station",
                    name=s.get("station_name", ""),
                    code=s.get("station_code", ""),
                    details=f"City: {s.get('city')}, State: {s.get('state')}. Zone: {s.get('zone')}. Platforms: {s.get('platforms')}.",
                    facilities=facs if isinstance(facs, list) else [str(facs)],
                    source=s.get("source", "dataset"),
                    raw_data=s
                ))
                
        if not cat_lower or cat_lower in ("policy", "policies", "rules"):
            for p in self.policies:
                items.append(RailwayInfoItem(
                    id=p.get("policy_id", "POL"),
                    category="Policy",
                    name=p.get("title", "Policy"),
                    details=p.get("content", ""),
                    source=p.get("source", "dataset"),
                    raw_data=p
                ))
                
        if not cat_lower or cat_lower in ("faq", "faqs"):
            for f in self.faqs:
                items.append(RailwayInfoItem(
                    id=f.get("faq_id", "FAQ"),
                    category="FAQ",
                    name=f.get("question", "FAQ"),
                    details=f.get("answer", ""),
                    source=f.get("source", "dataset"),
                    raw_data=f
                ))
                
        total = len(items)
        start = (page - 1) * page_size
        end = start + page_size
        return items[start:end], total

    def _parse_time_mins(self, time_str: str) -> tuple[int, int]:
        """Parses HH:MM (ignoring suffixes like (+1 day)) and returns (minutes_from_midnight, day_offset)."""
        if not time_str:
            return 0, 0
        clean_time = str(time_str).strip()
        m = re.search(r'(\d{1,2}):(\d{2})', clean_time)
        if not m:
            return 0, 0
        hh, mm = int(m.group(1)), int(m.group(2))
        day_offset = 0
        if "+1" in clean_time:
            day_offset = 1
        elif "+2" in clean_time:
            day_offset = 2
        elif "+3" in clean_time:
            day_offset = 3
        return hh * 60 + mm, day_offset

    def resolve_station(self, query: str) -> Optional[dict[str, Any]]:
        """Intelligently resolves station code, name, city alias, or partial query."""
        if not query:
            return None
        raw = query.strip()
        q_clean = raw.lower()
        q_upper = raw.upper()

        # 1. Exact match on Station Code
        if q_upper in self.stations_by_code:
            return self.stations_by_code[q_upper]

        # 2. Check City / Name Aliases
        if q_clean in CITY_ALIASES:
            code = CITY_ALIASES[q_clean]
            if code in self.stations_by_code:
                return self.stations_by_code[code]

        # 3. Exact match on Station Name
        if q_clean in self.stations_by_name:
            return self.stations_by_name[q_clean]

        # 4. Normalized match (without punctuation)
        clean_norm = re.sub(r'[^a-z0-9\s]', '', q_clean)
        if clean_norm in self.stations_by_name:
            return self.stations_by_name[clean_norm]

        # 5. Partial / Substring match in station names (require at least 4 chars to avoid false positives like 'it', 'at')
        if len(q_clean) >= 4:
            for name, stn in self.stations_by_name.items():
                if q_clean in name:
                    return stn

        # 6. Check if query is inside station's city or vice-versa
        if len(q_clean) >= 4:
            for stn in self.stations:
                city = str(stn.get("city", "")).lower()
                if q_clean == city or q_clean in city:
                    return stn

        return None

    def get_all_stations(self, query: Optional[str] = None) -> list[dict[str, Any]]:
        """Returns all unique stations, optionally filtered by a search query."""
        results = []
        seen_codes = set()
        q_clean = query.lower().strip() if query else ""

        for s in self.stations:
            code = str(s.get("station_code", s.get("code", ""))).strip().upper()
            if not code or code in seen_codes:
                continue
            seen_codes.add(code)

            name = str(s.get("station_name", s.get("name", ""))).strip()
            city = str(s.get("city", "")).strip()
            state = str(s.get("state", "")).strip()

            if q_clean:
                if not (q_clean in code.lower() or q_clean in name.lower() or q_clean in city.lower() or q_clean in state.lower()):
                    continue

            results.append({
                "station_code": code,
                "station_name": name,
                "city": city,
                "state": state,
                "zone": s.get("zone", ""),
                "division": s.get("division", ""),
                "platforms": s.get("platforms"),
                "facilities": s.get("facilities", [])
            })

        results.sort(key=lambda x: x["station_name"])
        return results

    def get_train_by_number(self, train_number: str) -> Optional[dict[str, Any]]:
        """Fetches train details by 4-5 digit train number."""
        num = str(train_number).strip()
        return self.trains_by_number.get(num)

    def get_train_route_schedule(self, train_number: str) -> Optional[list[dict[str, Any]]]:
        """Returns ordered timetable and route schedule for a train."""
        train = self.get_train_by_number(train_number)
        if not train:
            return None
        schedule = train.get("route_schedule")
        if schedule and isinstance(schedule, list):
            return schedule

        # Fallback 2-stop schedule if detailed stops not stored
        return [
            {
                "stop_number": 1,
                "station_code": train.get("origin_code", "ORIGIN"),
                "station_name": train.get("origin_name", "Origin"),
                "arrival": "Origin",
                "departure": train.get("departure_time", "00:00"),
                "halt_mins": 0,
                "day": 1,
                "distance_km": 0
            },
            {
                "stop_number": 2,
                "station_code": train.get("destination_code", "DEST"),
                "station_name": train.get("destination_name", "Destination"),
                "arrival": train.get("arrival_time", "00:00"),
                "departure": "Destination",
                "halt_mins": 0,
                "day": 1,
                "distance_km": train.get("distance_km", 0)
            }
        ]

    def search_trains_between_stations(
        self,
        from_station: str,
        to_station: str,
        date_str: Optional[str] = None
    ) -> dict[str, Any]:
        """
        Retrieves all trains operating between two stations in the correct route direction.
        Verifies that destination station index is strictly greater than origin station index.
        Computes accurate segment journey duration, overnight day differences, and day-of-week operation.
        """
        from_stn = self.resolve_station(from_station)
        if not from_stn:
            raise ValueError(f"Origin station '{from_station}' was not found in the railway database")

        to_stn = self.resolve_station(to_station)
        if not to_stn:
            raise ValueError(f"Destination station '{to_station}' was not found in the railway database")

        from_code = from_stn.get("station_code", "").upper()
        to_code = to_stn.get("station_code", "").upper()

        if from_code == to_code:
            raise ValueError(f"Origin and destination stations cannot be the same ({from_code} - {from_stn.get('station_name')})")

        day_name: Optional[str] = None
        if date_str:
            try:
                clean_date = date_str.split("T")[0].strip()
                dt = datetime.strptime(clean_date, "%Y-%m-%d")
                day_name = dt.strftime("%a")
            except Exception as e:
                logger.warning(f"Could not parse journey date '{date_str}': {e}")
                day_name = None

        matching_trains = []

        for train in self.trains:
            schedule = train.get("route_schedule")
            train_num = str(train.get("train_number", ""))

            idx_from: Optional[int] = None
            idx_to: Optional[int] = None
            stop_from: Optional[dict[str, Any]] = None
            stop_to: Optional[dict[str, Any]] = None

            if schedule and isinstance(schedule, list):
                for i, stop in enumerate(schedule):
                    code = stop.get("station_code", "").upper()
                    if code == from_code and idx_from is None:
                        idx_from = i
                        stop_from = stop
                    elif code == to_code and idx_to is None:
                        idx_to = i
                        stop_to = stop

                # ROUTE SEQUENCE VERIFICATION:
                # The destination must strictly occur AFTER the origin in the route sequence!
                if idx_from is not None and idx_to is not None and idx_to > idx_from and stop_from and stop_to:
                    dep_time = stop_from.get("departure")
                    if not dep_time or dep_time == "Origin":
                        dep_time = train.get("departure_time", "00:00")
                    if " " in dep_time:
                        dep_time = dep_time.split()[0]

                    arr_time = stop_to.get("arrival")
                    if not arr_time or arr_time == "Destination":
                        arr_time = train.get("arrival_time", "00:00")
                    if " " in arr_time:
                        arr_time = arr_time.split()[0]

                    day_from = int(stop_from.get("day", 1))
                    day_to = int(stop_to.get("day", 1))

                    dep_mins, _ = self._parse_time_mins(dep_time)
                    arr_mins, _ = self._parse_time_mins(arr_time)

                    day_diff = max(0, day_to - day_from)
                    journey_mins = (day_diff * 1440) + arr_mins - dep_mins
                    if journey_mins < 0:
                        journey_mins += 1440
                        day_diff += 1

                    hours = journey_mins // 60
                    minutes = journey_mins % 60
                    formatted_duration = f"{hours}h {minutes:02d}m"

                    dist_from = int(stop_from.get("distance_km", 0))
                    dist_to = int(stop_to.get("distance_km", 0))
                    distance_km = max(0, dist_to - dist_from)

                    intermediate_stops = [
                        s.get("station_name", s.get("station_code", ""))
                        for s in schedule[idx_from + 1 : idx_to]
                    ]

                    runs_on_list = train.get("runs_on", ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])
                    runs_on_date = (day_name in runs_on_list) if day_name else True

                    classes = train.get("classes", [])
                    if isinstance(classes, str):
                        classes = [c.strip() for c in classes.split(",")]

                    matching_trains.append({
                        "train_number": train_num,
                        "train_name": train.get("train_name", ""),
                        "train_type": train.get("train_type", "Superfast"),
                        "origin_code": train.get("origin_code", ""),
                        "origin_name": train.get("origin_name", ""),
                        "destination_code": train.get("destination_code", ""),
                        "destination_name": train.get("destination_name", ""),
                        "from_station_code": from_code,
                        "from_station_name": stop_from.get("station_name", from_stn.get("station_name", "")),
                        "to_station_code": to_code,
                        "to_station_name": stop_to.get("station_name", to_stn.get("station_name", "")),
                        "departure_time": dep_time,
                        "arrival_time": arr_time,
                        "duration": formatted_duration,
                        "duration_minutes": journey_mins,
                        "day_difference": day_diff,
                        "distance_km": distance_km,
                        "runs_on": runs_on_list,
                        "runs_on_date": runs_on_date,
                        "classes": classes,
                        "pantry": train.get("pantry"),
                        "intermediate_stops_count": len(intermediate_stops),
                        "intermediate_stations": intermediate_stops,
                        "is_direct": True
                    })
            else:
                # Direct train check for simple origin-destination records without route_schedule
                t_orig = train.get("origin_code", "").upper()
                t_dest = train.get("destination_code", "").upper()
                if t_orig == from_code and t_dest == to_code:
                    dep_time = train.get("departure_time", "00:00")
                    arr_time = train.get("arrival_time", "00:00")
                    dep_mins, _ = self._parse_time_mins(dep_time)
                    arr_mins, arr_off = self._parse_time_mins(arr_time)
                    day_diff = arr_off
                    journey_mins = (day_diff * 1440) + arr_mins - dep_mins
                    if journey_mins < 0:
                        journey_mins += 1440
                        day_diff += 1
                    hours = journey_mins // 60
                    minutes = journey_mins % 60

                    runs_on_list = train.get("runs_on", ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])
                    runs_on_date = (day_name in runs_on_list) if day_name else True
                    classes = train.get("classes", [])
                    if isinstance(classes, str):
                        classes = [c.strip() for c in classes.split(",")]

                    matching_trains.append({
                        "train_number": train_num,
                        "train_name": train.get("train_name", ""),
                        "train_type": train.get("train_type", "Superfast"),
                        "origin_code": t_orig,
                        "origin_name": train.get("origin_name", ""),
                        "destination_code": t_dest,
                        "destination_name": train.get("destination_name", ""),
                        "from_station_code": from_code,
                        "from_station_name": from_stn.get("station_name", ""),
                        "to_station_code": to_code,
                        "to_station_name": to_stn.get("station_name", ""),
                        "departure_time": dep_time,
                        "arrival_time": arr_time,
                        "duration": f"{hours}h {minutes:02d}m",
                        "duration_minutes": journey_mins,
                        "day_difference": day_diff,
                        "distance_km": train.get("distance_km", 0),
                        "runs_on": runs_on_list,
                        "runs_on_date": runs_on_date,
                        "classes": classes,
                        "pantry": train.get("pantry"),
                        "intermediate_stops_count": 0,
                        "intermediate_stations": [],
                        "is_direct": True
                    })

        return {
            "from_station": {
                "station_code": from_code,
                "station_name": from_stn.get("station_name", ""),
                "city": from_stn.get("city", ""),
                "state": from_stn.get("state", ""),
                "zone": from_stn.get("zone", ""),
                "division": from_stn.get("division", ""),
                "platforms": from_stn.get("platforms"),
                "facilities": from_stn.get("facilities", [])
            },
            "to_station": {
                "station_code": to_code,
                "station_name": to_stn.get("station_name", ""),
                "city": to_stn.get("city", ""),
                "state": to_stn.get("state", ""),
                "zone": to_stn.get("zone", ""),
                "division": to_stn.get("division", ""),
                "platforms": to_stn.get("platforms"),
                "facilities": to_stn.get("facilities", [])
            },
            "journey_date": date_str,
            "day_of_week": day_name,
            "total_trains": len(matching_trains),
            "trains": matching_trains
        }


retrieval_engine = RailwayRetrievalEngine()
