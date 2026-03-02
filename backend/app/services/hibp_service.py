import requests
from ..config import Config

def check_email_breaches(email):

    url = f"{Config.BASE_URL}/breachedaccount/{email}?truncateResponse=false"

    headers = {
        "hibp-api-key": Config.HIBP_API_KEY,
        "user-agent": "breach-intelligence-platform"
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 404:
        return []

    if response.status_code != 200:
        raise Exception("HIBP API error")

    return response.json()