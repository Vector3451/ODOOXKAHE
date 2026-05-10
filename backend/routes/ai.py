from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import time

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate():
    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid request"}), 400
        
    destination = data.get('destination', 'Unknown')
    dates = data.get('dates', {})
    budget = data.get('budget', 'medium')
    travelers = data.get('travelers', 1)
    interests = data.get('interests', [])

    # Simulate AI processing delay (to show the loading state in UI)
    time.sleep(2)

    # Heuristic AI: Generate a mock itinerary based on parameters
    days = 3 # Default to 3 days for demo
    if dates and 'to' in dates and 'from' in dates:
        # Calculate rough days (mocked)
        pass
        
    mock_itinerary = []
    
    # Day 1
    mock_itinerary.append({
        "day": 1,
        "title": f"Arrival & Exploring {destination}",
        "activities": [
            {"time": "Morning", "title": "Arrival & Check-in", "description": "Settle into your accommodation and freshen up.", "location": "City Center", "cost": 0},
            {"time": "Afternoon", "title": f"Welcome Walk", "description": f"Take a stroll through the iconic streets of {destination}.", "location": "Downtown", "cost": 15},
            {"time": "Evening", "title": "Welcome Dinner", "description": "Enjoy a traditional dinner with local flavors.", "location": "Old Town", "cost": 45 if budget == 'medium' else 80}
        ]
    })
    
    # Day 2
    mock_itinerary.append({
        "day": 2,
        "title": "Culture & Highlights",
        "activities": [
            {"time": "Morning", "title": "Museum Visit", "description": "Explore the history and art of the region.", "location": "National Museum", "cost": 25},
            {"time": "Afternoon", "title": "Local Market", "description": "Taste street food and shop for souvenirs.", "location": "Central Market", "cost": 20},
            {"time": "Evening", "title": "Sunset Views", "description": "Find a high vantage point to watch the sunset over the city.", "location": "Observation Deck", "cost": 10}
        ]
    })
    
    # Day 3
    mock_itinerary.append({
        "day": 3,
        "title": "Adventure & Departure",
        "activities": [
            {"time": "Morning", "title": "Nature Escape", "description": "A short hike or walk in a nearby nature reserve or park.", "location": "City Park", "cost": 0},
            {"time": "Afternoon", "title": "Farewell Lunch", "description": "One last meal enjoying your favorite dish from the trip.", "location": "Riverfront", "cost": 30},
            {"time": "Evening", "title": "Departure", "description": "Head to the airport or train station for your journey home.", "location": "Transit Hub", "cost": 20}
        ]
    })

    return jsonify({
        "itinerary": mock_itinerary,
        "summary": f"A generated {budget} budget trip to {destination} for {travelers} traveler(s), focusing on {', '.join(interests) if interests else 'general highlights'}."
    })
