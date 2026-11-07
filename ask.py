"""
ask.py - Interactive CLI tool for asking passenger questions.
Usage:
    python ask.py "What is the name of train 12430?"
    python ask.py "Does the 60-day booking limit apply to the Taj Express?"
"""

import sys
import json
from helpdesk.pipeline import ask

def main():
    if len(sys.argv) < 2:
        print("Usage: python ask.py \"<question>\"")
        print("Example: python ask.py \"What is the name of train 12430?\"")
        sys.exit(1)
        
    question = sys.argv[1].strip()
    result = ask(question)
    
    # Print clean formatted JSON to stdout
    print(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()

