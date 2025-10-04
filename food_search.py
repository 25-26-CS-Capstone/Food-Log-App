'''
TEST CODE FOR FOOD SEARCH FOR FOOD LOG PAGE
'''

import requests

API_KEY = "szC85PUO2yeTgtt7yKLImnFV0wr7Z0kgSIQNZqJg"
BASE_URL = "https://api.nal.usda.gov/fdc/v1"

# Ask user for a search term
search_term = input("Enter a food to search: ")

# Search for the food (up to 5 results)
search_url = f"{BASE_URL}/search?api_key={API_KEY}&query={search_term}&pageSize=5"
search_response = requests.get(search_url)
search_data = search_response.json()

foods = search_data.get("foods", [])
if not foods:
    print("No results found.")
    exit()

# Show search results
print("\nSearch results:")
for index, food in enumerate(foods, 1):
    print(f"{index}. {food.get('description')} (FDC ID: {food.get('fdcId')})")

# Get details for the first result
fdc_id = foods[0]["fdcId"]
details_url = f"{BASE_URL}/{fdc_id}?api_key={API_KEY}"
details_response = requests.get(details_url)
details = details_response.json()

# Extract relevant info
description = details.get("description", "Unknown")
ingredients = details.get("ingredients", "No ingredients listed")

# Common allergens list example (TEMPORARY)
ALLERGENS = ["milk", "egg", "peanut", "tree nut", "soy", "wheat", "fish", "shellfish", "gluten"]

# Check for allergens in ingredients
found_allergens = [a for a in ALLERGENS if a.lower() in ingredients.lower()]

# Display output
print("\nFood Details:")
print(f"Name: {description}")
print(f"Ingredients: {ingredients}")

if found_allergens:
    print("Potential Allergens/Intolerances Found:")
    for allergen in found_allergens:
        print(f"   - {allergen.capitalize()}")
else:
    print("No common allergens/intolerances detected.")