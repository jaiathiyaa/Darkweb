from flask import Blueprint, request, jsonify
from ..services.hibp_service import check_email_breaches
from ..services.risk_engine import calculate_risk, breach_severity
from ..services.recommendations import generate_recommendations
from ..utils.validators import is_valid_email

breach_bp = Blueprint("breach_bp", __name__)


@breach_bp.route("/check-email", methods=["POST"])
def check_email():

    data = request.get_json()
    email = data.get("email")

    if not email or not is_valid_email(email):
        return jsonify({"error": "Invalid email"}), 400

    try:
        breaches = check_email_breaches(email)

        if not breaches:
            return jsonify({
                "breach_count": 0,
                "risk_score": 0,
                "risk_level": "Safe",
                "exposed_categories": [],
                "recommendations": ["No breaches found. Continue safe practices."],
                "breaches": []
            })

        score, level = calculate_risk(breaches)
        recommendations = generate_recommendations(score)

        formatted = []
        exposed_categories = set()

        for breach in breaches:

            data_classes = breach.get("DataClasses", [])
            exposed_categories.update(data_classes)

            formatted.append({
                "name": breach.get("Name"),
                "domain": breach.get("Domain"),
                "breach_date": breach.get("BreachDate"),
                "exposed_data": data_classes,
                "severity": breach_severity(data_classes)
            })

        # Sort by latest breach date
        formatted.sort(
            key=lambda x: x["breach_date"] if x["breach_date"] else "0000-00-00",
            reverse=True
        )

        return jsonify({
            "breach_count": len(breaches),
            "risk_score": score,
            "risk_level": level,
            "exposed_categories": list(exposed_categories),
            "recommendations": recommendations,
            "breaches": formatted
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500