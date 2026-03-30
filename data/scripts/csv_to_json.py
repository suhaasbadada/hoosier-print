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

    # drop bad rows
    df = df.dropna(subset=["Building", "lat", "lng"])

    # remove exact duplicates (important)
    df = df.drop_duplicates(subset=["Building", "Room", "Printer name", "Campus"])

    print(f"{file} -> {len(df)} valid rows")

    for _, row in df.iterrows():
        all_data.append({
            "building": row.get("Building"),
            "campus": row.get("Campus"),
            "room": row.get("Room"),
            "printer_name": row.get("Printer name"),
            "lat": float(row.get("lat")),
            "lng": float(row.get("lng"))
        })

# OPTIONAL: group by building (better for frontend)
grouped = {}

for item in all_data:
    key = (item["building"], item["campus"], item["lat"], item["lng"])

    if key not in grouped:
        grouped[key] = {
            "building": item["building"],
            "campus": item["campus"],
            "lat": item["lat"],
            "lng": item["lng"],
            "printers": []
        }

    grouped[key]["printers"].append({
        "room": item["room"],
        "printer_name": item["printer_name"]
    })

# final structure
output = {
    "buildings": list(grouped.values())
}

os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

with open(OUTPUT_FILE, "w") as f:
    json.dump(output, f, indent=2)

print(f"\nSaved -> {OUTPUT_FILE} ({len(output['buildings'])} buildings)")