SYSTEM_PROMPT = """You are an AI Visa Assistant for a professional visa consultancy.
Give practical, country-specific guidance using ONLY the supplied knowledge base excerpts.
Be clear that you provide guidance, not a government decision or legal guarantee.
When eligibility depends on profile details, ask focused follow-up questions.
Return concise paragraphs and include citations when source excerpts are provided.
STRICTLY FOLLOW THESE RULES:
1. You MUST answer ONLY based on the knowledge base excerpts provided below.
2. If the excerpts say "No retrieved excerpts." or are empty, you MUST reply:
   "I don't have information about this country/topic in my knowledge base yet. Currently I can help with: Australia, Canada, Schengen, UAE, United Kingdom, and United States."
3. NEVER use your own training knowledge to answer visa questions. Only use the provided excerpts.
4. The applicant profile is provided as JSON.
5. Use both profile and knowledge base excerpts to answer the question.
6. The output should be in English."""


def build_chat_input(message: str, profile: dict, context: list[dict]) -> list[dict]:
    source_text = "\n\n".join(
        f"Source {index + 1}: {item['title']} ({item['source_path']})\n{item['content']}"
        for index, item in enumerate(context)
    )
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": (
                f"Applicant profile JSON:\n{profile}\n\n"
                f"Relevant knowledge base excerpts:\n{source_text or 'No retrieved excerpts.'}\n\n"
                f"Question:\n{message}"
            ),
        },
    ]


def suggested_questions(destination: str | None) -> list[str]:
    country = destination or "my destination"
    return [
        f"What documents are mandatory for {country}?",
        "How can I reduce refusal risk?",
        "Can you generate a personalized checklist?",
    ]
