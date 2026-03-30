import pandas as pd
import json
import os

INPUT_FILES = [
    "../raw/PrinterLocations-FortWayne_geocoded.csv",
    "../raw/PrinterLocations-Bloomington_geocoded.csv",
    "../raw/PrinterLocations-Indianapolis_geocoded.csv",
    "../raw/PrinterLocations-East_geocoded.csv",
    "../raw/PrinterLocations-Kokomo_geocoded.csv",
    "../raw/PrinterLocations-Northwest_geocoded.csv",
    "../raw/PrinterLocations-SouthBend_geocoded.csv",
    "../raw/PrinterLocations-Southeast_geocoded.csv",
]

OUTPUT_FILE = "../processed/buildings_geocoded.json"

all_data = []

for file in INPUT_FILES:
    if not os.path.exists(file):
        print(f"[SKIP] Missing: {file}")
        continue

    df = pd.read_csv(file)

    # normalize column names
    df.columns = [c.strip() for c in df.columns]

    for _, row in df.iterrows():
        all_data.append({
            "building": row.get("Building"),
            "campus": row.get("Campus"),
            "lat": row.get("lat"),
            "lng": row.get("lng")
        })

# final structure
output = {
    "buildings": all_data
}

os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

with open(OUTPUT_FILE, "w") as f:
    json.dump(output, f, indent=2)

print(f"Saved -> {OUTPUT_FILE} ({len(all_data)} records)")