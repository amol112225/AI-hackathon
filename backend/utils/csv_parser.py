import csv
import io
from typing import List, Dict

def parse_leads_csv(content: bytes) -> List[Dict]:
    """
    Parses a CSV file containing leads.
    Expected headers: name, phone, language (optional)
    """
    decoded_content = content.decode('utf-8')
    reader = csv.DictReader(io.StringIO(decoded_content))
    leads = []
    
    for row in reader:
        # Lowercase headers to handle Name, Phone, Language variations
        row_lower = {k.strip().lower(): v.strip() for k, v in row.items() if k}
        
        if 'name' in row_lower and 'phone' in row_lower:
            lead = {
                "name": row_lower['name'],
                "phone": row_lower['phone'],
                "language": row_lower.get('language', 'English')
            }
            leads.append(lead)
            
    return leads
