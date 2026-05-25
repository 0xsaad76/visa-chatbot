from dataclasses import dataclass

from app.schemas.eligibility import VisaProfileCreate


@dataclass
class ScoreResult:
    eligibility_score: int
    approval_probability: str
    risk_factors: list[str]
    recommendations: list[str]


DESTINATION_BASELINES = {
    "schengen": 58,
    "united kingdom": 56,
    "united states": 52,
    "canada": 60,
    "australia": 59,
    "uae": 65,
}


def score_profile(profile: VisaProfileCreate) -> ScoreResult:
    destination = profile.destination_country.lower()
    score = DESTINATION_BASELINES.get(destination, 55)
    risk_factors: list[str] = []
    recommendations: list[str] = []

    if profile.annual_income >= 60000:
        score += 15
    elif profile.annual_income >= 30000:
        score += 8
    else:
        score -= 15
        risk_factors.append("Annual income may be below the expected financial threshold.")
        recommendations.append("Provide strong bank statements, tax returns, and proof of stable funds.")

    employed_terms = {"employed", "self-employed", "business owner", "student"}
    if profile.employment_status.lower() in employed_terms:
        score += 8
    else:
        score -= 8
        risk_factors.append("Employment or study ties are not clearly established.")
        recommendations.append("Add evidence of home-country ties, assets, enrollment, or business ownership.")

    history = profile.travel_history.lower()
    if any(term in history for term in ["schengen", "uk", "united states", "usa", "canada", "australia"]):
        score += 10
    elif not history.strip():
        score -= 6
        risk_factors.append("Limited prior international travel history.")
        recommendations.append("Make the itinerary, purpose of travel, and return plan especially clear.")

    if profile.family_sponsorship.has_sponsor:
        score += 6
        recommendations.append("Include the sponsor's legal status, invitation letter, and financial evidence.")

    if profile.travel_purpose.lower() in {"tourism", "business", "study", "family visit"}:
        score += 5
    else:
        risk_factors.append("Travel purpose may need clearer documentary support.")

    bounded_score = max(0, min(100, score))
    probability = "High" if bounded_score >= 75 else "Moderate" if bounded_score >= 50 else "Low"

    if not recommendations:
        recommendations.append("Submit a complete application with consistent dates, finances, and itinerary.")

    return ScoreResult(
        eligibility_score=bounded_score,
        approval_probability=probability,
        risk_factors=risk_factors,
        recommendations=recommendations,
    )
