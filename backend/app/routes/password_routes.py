from flask import Blueprint, request, jsonify
from ..services.password_service import check_password_exposure

password_bp = Blueprint("password_bp", __name__)

@password_bp.route("/check-password", methods=["POST"])
def check_password():

    data = request.get_json()
    password = data.get("password")

    if not password:
        return jsonify({"error": "Password required"}), 400

    result = check_password_exposure(password)

    return jsonify(result)