import pandas as pd
import googlemaps
import time
import json
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

if not API_KEY:
    raise ValueError("Missing GOOGLE_MAPS_API_KEY in .env file")

gmaps = googlemaps.Client(key=API_KEY)

CACHE_FILE = "../processed/geocode_cache.json"

# load cache
if os.path.exists(CACHE_FILE):
    with open(CACHE_FILE, "r") as f:
        cache = json.load(f)
else:
    cache = {}

def save_cache():
    with open(CACHE_FILE, "w") as f:
        json.dump(cache, f)

# normalize query
def normalize(query):
    return query.strip().lower()

# campus mapping (FIX: improves accuracy)
CAMPUS_QUERY_MAP = {
    "Bloomington": "Indiana University Bloomington",
    "Indianapolis": "Indiana University Indianapolis",
    "Fort Wayne": "Indiana University Fort Wayne",
    "Kokomo": "Indiana University Kokomo",
    "Northwest": "Indiana University Northwest",
    "South Bend": "Indiana University South Bend",
    "Southeast": "Indiana University Southeast",
    "East": "Indiana University East",
}

# geocode
def geocode(query):
    key = normalize(query)

    if key in cache:
        return cache[key]

    try:
        result = gmaps.geocode(query)

        if not result:
            cache[key] = {"lat": None, "lng": None}
            return cache[key]

        loc = result[0]["geometry"]["location"]
        address = result[0]["formatted_address"]

        # DEBUG: detect suspicious results
        if "Indiana University" not in address:
            print(f"[SUSPECT] {query} -> {address}")

        cache[key] = {
            "lat": loc["lat"],
            "lng": loc["lng"]
        }

        return cache[key]

    except Exception as e:
        print(f"[ERROR] {query} -> {e}")
        cache[key] = {"lat": None, "lng": None}
        return cache[key]

# process csv
def process_csv(file_path, campus_name):

    if not os.path.exists(file_path):
        print(f"[SKIP] Missing file: {file_path}")
        return

    df = pd.read_csv(file_path)

    # normalize column names (FIX printer issue)
    df.columns = [c.strip().replace(" ", "_") for c in df.columns]

    df = df.dropna(subset=["Building"])

    # build unique building list ONLY for geocoding
    unique_buildings = df["Building"].drop_duplicates()

    building_coords = {}

    total = len(unique_buildings)
    print(f"\nProcessing {file_path} | {total} unique buildings (geocoding)\n")

    campus_query = CAMPUS_QUERY_MAP.get(campus_name, campus_name)

    # geocode each building once
    for i, building in enumerate(unique_buildings, start=1):

        # FIXED query (major improvement)
        query = f"{building}, {campus_query}, Indiana, USA"

        print(f"[{i}/{total}] {building}")

        coords = geocode(query)
        building_coords[building] = coords

        time.sleep(0.12)

        if i % 20 == 0:
            save_cache()

    save_cache()

    # now attach coords back to FULL dataset
    results = []

    print("\nAttaching coordinates to all printer rows...\n")

    for i, row in enumerate(df.itertuples(index=False), start=1):

        building = row.Building
        room = getattr(row, "Room", None)

        # FIX: correct column access
        printer = getattr(row, "Printer_name", None)

        coords = building_coords.get(building, {"lat": None, "lng": None})

        results.append({
            "Building": building,
            "Room": room,
            "Printer name": printer,
            "Campus": campus_name,
            "lat": coords["lat"],
            "lng": coords["lng"]
        })

    out_file = file_path.replace(".csv", "_geocoded.csv")
    pd.DataFrame(results).to_csv(out_file, index=False)

    print(f"Done -> {out_file}")


if __name__ == "__main__":

    files = [
        ("../raw/PrinterLocations-FortWayne.csv", "Fort Wayne"),
        ("../raw/PrinterLocations-Bloomington.csv", "Bloomington"),
        ("../raw/PrinterLocations-Indianapolis.csv", "Indianapolis"),
        ("../raw/PrinterLocations-East.csv", "East"),
        ("../raw/PrinterLocations-Kokomo.csv", "Kokomo"),
        ("../raw/PrinterLocations-Northwest.csv", "Northwest"),
        ("../raw/PrinterLocations-SouthBend.csv", "South Bend"),
        ("../raw/PrinterLocations-Southeast.csv", "Southeast"),
    ]

    for file_path, campus in files:
        process_csv(file_path, campus)

    print("\nALL DONE.")