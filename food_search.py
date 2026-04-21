"""
FOOD SEARCH MODULE FOR FOOD LOG APP
Searches USDA FoodData Central API and checks for allergens.
"""

import requests
import os

# Optional: load from .env if available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

API_KEY = os.getenv("USDA_API_KEY", "szC85PUO2yeTgtt7yKLImnFV0wr7Z0kgSIQNZqJg")
BASE_URL = "https://api.nal.usda.gov/fdc/v1"
ALLERGENS = ["milk", "egg", "peanut", "tree nut", "soy", "wheat", "fish", "shellfish", "gluten"]

def search_food(search_term):
    """Search for a food item and return details + allergens."""
    search_url = f"{BASE_URL}/search?api_key={API_KEY}&query={search_term}&pageSize=5"
    try:
        search_data = requests.get(search_url).json()
        foods = search_data.get("foods", [])
        if not foods:
            return {"error": "No results found."}

        fdc_id = foods[0]["fdcId"]
        details_url = f"{BASE_URL}/{fdc_id}?api_key={API_KEY}"
        details = requests.get(details_url).json()

        description = details.get("description", "Unknown")
        ingredients = details.get("ingredients", "No ingredients listed")
        found_allergens = [a for a in ALLERGENS if a.lower() in ingredients.lower()]

        return {
            "name": description,
            "ingredients": ingredients,
            "allergens": found_allergens,
        }
    except Exception as e:
        return {"error": f"Failed to fetch data: {e}"}

if __name__ == "__main__":
    query = input("Enter a food to search: ")
    result = search_food(query)
    print(result)
