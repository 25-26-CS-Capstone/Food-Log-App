"""
Utility functions for Food Log App
Contains helper functions for data formatting, validation, and calculations
"""

from datetime import datetime

def format_food_entry(food_name, ingredients, allergens):
    """
    Format a food entry as a dictionary
    """
    return {
        "food": food_name,
        "ingredients": ingredients,
        "allergens": allergens,
        "timestamp": datetime.now().isoformat()
    }

def calculate_total_calories(food_list):
    """
    Calculate total calories from a list of food entries
    Assumes each entry has a 'calories' key
    """
    return sum(entry.get("calories", 0) for entry in food_list)

def sanitize_input(user_input):
    """
    Clean user input by stripping extra spaces and converting to lowercase
    """
    return user_input.strip().lower()
