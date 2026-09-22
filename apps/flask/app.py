from datetime import datetime, timezone

from flask import Flask, jsonify

app = Flask(__name__)


@app.route("/health")
def health():
    return jsonify(
        status="ok",
        service="flask",
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@app.route("/")
def index():
    return jsonify(message="DevSecOps Flask app")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
