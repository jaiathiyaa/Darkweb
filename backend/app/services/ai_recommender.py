from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def generate_ai_recommendations(breaches, risk_score, risk_level):

    breach_summary = []

    for breach in breaches[:5]:
        breach_summary.append({
            "name": breach.get("Name"),
            "data": breach.get("DataClasses")
        })

    prompt = f"""
        You are a cybersecurity expert.

        Based on the breach data below, generate exactly 5 concise security recommendations.

        Return them as plain bullet points (one sentence each).

        Risk Score: {risk_score}
        Risk Level: {risk_level}

        Breaches:
        {breach_summary}
        """

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}]
    )

    text = response.choices[0].message.content

    recommendations = [
        line.strip()
        for line in text.split("\n")
        if line.strip() != ""
    ]

    return recommendations