DOCUMENT_KEYWORDS = {
    "passport": ["passport", "date of birth", "place of birth", "passport no", "nationality"],
    "bank_statement": ["account number", "opening balance", "closing balance", "transaction", "statement"],
    "employment_letter": ["employment", "salary", "designation", "human resources", "leave approved"],
    "invitation_letter": ["invitation", "host", "invite", "relationship", "accommodation"],
    "travel_insurance": ["insurance", "policy", "medical coverage", "coverage", "insured"],
    "hotel_booking": ["hotel", "reservation", "booking", "check-in", "check-out"],
    "flight_reservation": ["flight", "itinerary", "departure", "arrival", "airline"],
}


def classify_document(text: str) -> str:
    normalized = text.lower()
    scores = {
        document_type: sum(1 for keyword in keywords if keyword in normalized)
        for document_type, keywords in DOCUMENT_KEYWORDS.items()
    }
    best_type, best_score = max(scores.items(), key=lambda item: item[1])
    return best_type if best_score > 0 else "unknown"
