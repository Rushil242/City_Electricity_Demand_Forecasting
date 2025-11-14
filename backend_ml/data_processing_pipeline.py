import pandas as pd
import numpy as np
import os

RAW_DATA_FILE = 'raw_data/SME-divya-3p-1ms-influxdata_1apr2021-31dec2021.csv'
CLEANED_DATA_DIR = 'data'
CLEANED_DATA_FILE = os.path.join(CLEANED_DATA_DIR, 'cleaned_bangalore_data.csv')

print(f"Loading raw data from {RAW_DATA_FILE}...")
try:
    df = pd.read_csv(RAW_DATA_FILE, comment='#')
except FileNotFoundError:
    print(f"ERROR: Raw data file not found at {RAW_DATA_FILE}")
    print("Please make sure the file is in the 'raw_data' directory.")
    exit()

df.head()

if all(col in df.columns for col in ['_time', '_value', '_field', '_measurement']):
    df = df[['_time', '_value', '_field', '_measurement']]
    print("Successfully loaded and selected relevant columns.")
else:
    print("ERROR: The CSV file is missing one of the required columns: '_time', '_value', '_field', '_measurement'")
    exit()

print(f"Raw data shape: {df.shape}")
print(df.head())


print("Pivoting data (long to wide format)... This may take a moment.")
try:
    df_pivoted = df.pivot_table(
        index='_time', 
        columns=['_measurement', '_field'], 
        values='_value'
    )
except Exception as e:
    print(f"ERROR during pivoting: {e}")
    print("There might be duplicate entries (same time, measurement, and field). Check data integrity.")
    exit()

print("Pivot complete.")
print(f"Pivoted data shape: {df_pivoted.shape}")
print(df_pivoted.head())

print("Cleaning column names (e.g., ('Phase1', 'pf') -> 'Phase1_pf')...")

df_pivoted.columns = ['_'.join(col) for col in df_pivoted.columns.values]
print(f"New columns: {df_pivoted.columns.tolist()[:5]}...")


print("Converting index to datetime (using ISO8601 format)...")

try:
    df_pivoted.index = pd.to_datetime(df_pivoted.index, format='ISO8601')
except Exception as e:
    print(f"ERROR converting datetime index: {e}")
    print("If this error persists, try: df_pivoted.index = pd.to_datetime(df_pivoted.index, format='mixed')")
    exit()

print("Resampling data to 1-hour intervals and imputing missing values...")
df_final = df_pivoted.resample('1H').mean()

df_final = df_final.ffill()

df_final = df_final.bfill() # Back-fill to handle NaNs at the start

print(f"Final cleaned data shape: {df_final.shape}")
print(df_final.head())


print("Saving cleaned, model-ready data...")
os.makedirs(CLEANED_DATA_DIR, exist_ok=True)

df_final.to_csv(CLEANED_DATA_FILE)

print(f"--- Pipeline Complete ---")
print(f"Cleaned data saved to: {CLEANED_DATA_FILE}")

df_final.head()