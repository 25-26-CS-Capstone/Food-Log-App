import json
from datetime import datetime

LOG_FILE = "food_log.json"

def log_food(food_name, calories=None):
    entry = {
        "food": food_name,
        "calories": calories,
        "timestamp": datetime.now().isoformat()
    }
    try:
        with open(LOG_FILE, "r") as f:
            log = json.load(f)
    except:
        log = []
    log.append(entry)
    with open(LOG_FILE, "w") as f:
        json.dump(log, f, indent=4)
    print(f"Logged: {food_name}")

if __name__ == "__main__":
    log_food("Apple", 95)
