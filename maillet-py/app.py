from flask import Flask, request, jsonify
import json
from parser import graph

app = Flask(__name__)


def generate_system_message(sender):
    system_message = f"""
    You are an email-based crypto wallet assistant.

    Your role is to interpret and fulfill user requests using the tools available to you.
    Take the sender email as: {sender}
    """
    return system_message


@app.route('/postmark-webhook', methods=['POST'])
def postmark_webhook():
    """
    Endpoint to receive Postmark webhooks and print the request body
    """
    try:
        received_email = request.get_json()
        from_account = received_email['From']
        subject = received_email['Subject']
        text = received_email['TextBody']
        user_message = f"Sender: {from_account}\nSubject: {subject}\n{text}"

        inputs = {"messages": [
            ("system", generate_system_message(from_account)),
            ("user", user_message),
        ]}
        result = graph.invoke(inputs)
        print(result)
        return jsonify({"status": "success", "message": "Webhook received"}), 200
    except Exception as e:
        print(f"Error processing webhook: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({"status": "healthy"}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
