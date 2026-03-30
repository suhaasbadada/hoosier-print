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
    df = df.dropna(subset=["Building"])

    unique_buildings = df[["Building"]].drop_duplicates()

    results = []
    total = len(unique_buildings)

    print(f"\nProcessing {file_path} | {total} unique buildings\n")

    for i, row in enumerate(unique_buildings.itertuples(index=False), start=1):

        building = row.Building
        query = f"{building}, {campus_name}, Indiana, USA"

        print(f"[{i}/{total}] {building}")

        coords = geocode(query)

        results.append({
            "Building": building,
            "Campus": campus_name,
            "lat": coords["lat"],
            "lng": coords["lng"]
        })

        time.sleep(0.12)

        if i % 20 == 0:
            save_cache()

    save_cache()

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