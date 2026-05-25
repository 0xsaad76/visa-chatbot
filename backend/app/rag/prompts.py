SYSTEM_PROMPT = """You are an AI Visa Assistant for a professional visa consultancy.
Give practical, country-specific guidance using the supplied knowledge base excerpts.
Be clear that you provide guidance, not a government decision or legal guarantee.
When eligibility depends on profile details, ask focused follow-up questions.
Return concise paragraphs and include citations when source excerpts are provided."""


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
