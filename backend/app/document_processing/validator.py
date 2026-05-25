REQUIRED_FIELDS = {
    "passport": ["passport", "nationality", "date of birth", "expiry"],
    "bank_statement": ["account number", "statement", "balance"],
    "employment_letter": ["employment", "salary", "designation"],
    "invitation_letter": ["invitation", "host", "address"],
    "travel_insurance": ["policy", "coverage", "insured"],
    "hotel_booking": ["booking", "check-in", "check-out"],
    "flight_reservation": ["flight", "departure", "arrival"],
    "unknown": [],
}


def validate_document(document_type: str, text: str) -> dict:
    normalized = text.lower()
    required = REQUIRED_FIELDS.get(document_type, [])
    detected = [field for field in required if field in normalized]
    missing = [field for field in required if field not in normalized]
    score = 40 if document_type == "unknown" else int((len(detected) / max(1, len(required))) * 100)
    recommendations = []
    if document_type == "unknown":
        recommendations.append("Upload a clearer PDF or choose the document type manually during review.")
    if missing:
        recommendations.append("Add or rescan pages containing: " + ", ".join(missing))
    if not recommendations:
        recommendations.append("Document appears complete for pre-submission review.")
    return {
        "document_type": document_type,
        "completeness_score": score,
        "missing_fields": missing,
        "detected_fields": detected,
        "recommendations": recommendations,
    }
