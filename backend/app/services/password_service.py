import hashlib
import requests

def check_password_exposure(password):

    sha1_password = hashlib.sha1(password.encode()).hexdigest().upper()
    prefix = sha1_password[:5]
    suffix = sha1_password[5:]

    url = f"https://api.pwnedpasswords.com/range/{prefix}"

    response = requests.get(url)

    hashes = response.text.splitlines()

    for h in hashes:
        returned_suffix, count = h.split(":")
        if returned_suffix == suffix:
            return {
                "exposed": True,
                "count": int(count)
            }

    return {
        "exposed": False,
        "count": 0
    }