def generate_recommendations(score):
    
    if score >= 75:
        return [
            "Immediately change all compromised passwords",
            "Enable Two-Factor Authentication (2FA)",
            "Monitor financial and personal accounts",
            "Check for identity theft activity"
        ]

    elif score >= 50:
        return [
            "Change reused passwords",
            "Enable 2FA on important accounts",
            "Review account activity"
        ]

    elif score >= 25:
        return [
            "Use strong unique passwords",
            "Avoid password reuse"
        ]

    else:
        return [
            "No immediate threat detected",
            "Continue good security practices"
        ]