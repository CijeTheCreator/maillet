from datetime import datetime


def shorten(addr, prefix=6, suffix=4):
    if not isinstance(addr, str) or len(addr) < prefix + suffix:
        return addr
    return f"{addr[:prefix]}...{addr[-suffix:]}"


def wei_to_eth(wei_str):
    try:
        return str(float(wei_str) / 1e18)
    except:
        return wei_str


def format_timestamp(unix_ts):
    try:
        return datetime.utcfromtimestamp(unix_ts).strftime("%Y-%m-%d %H:%M:%S UTC")
    except:
        return str(unix_ts)


def process_transaction_data(data):
    processed = {
        "email": data.get("email"),
        "publicKey": data.get("publicKey"),
        "transactions": []
    }

    for tx in data.get("transactions", []):
        processed_tx = {
            "hash": shorten(tx.get("hash")),
            "from": shorten(tx.get("from")),
            "to": shorten(tx.get("to")),
            "value": wei_to_eth(tx.get("value")),
            "blockNumber": tx.get("blockNumber"),
            "timestamp": format_timestamp(tx.get("timestamp")),
            "gasPrice": tx.get("gasPrice")
        }
        processed["transactions"].append(processed_tx)

    return processed
