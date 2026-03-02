def calculate_risk(breaches):

    score = len(breaches) * 10

    for breach in breaches:
        data = breach.get("DataClasses", [])

        if "Passwords" in data:
            score += 30
        if "Partial credit card data" in data or "Credit cards" in data:
            score += 25
        if "Phone numbers" in data or "Physical addresses" in data:
            score += 15

    if score > 100:
        score = 100

    if score >= 75:
        level = "Critical"
    elif score >= 50:
        level = "High"
    elif score >= 25:
        level = "Medium"
    else:
        level = "Low"

    return score, level


def breach_severity(data_classes):

    if not data_classes:
        return "Low"

    if "Passwords" in data_classes:
        return "Critical"

    if "Partial credit card data" in data_classes or "Credit cards" in data_classes:
        return "High"

    if "Phone numbers" in data_classes or "Physical addresses" in data_classes:
        return "Medium"

    return "Low"