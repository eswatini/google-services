# Spreadsheet Dashboard

A ready-to-run Streamlit app that turns a CSV/Excel spreadsheet into an interactive dashboard with filters, KPIs, chart builder, and a pivot table.

## Quick start

1. Create and activate a virtual environment (recommended)
   - Python 3.10+ is recommended
2. Install dependencies:

```
pip install -r requirements.txt
```

3. Run the app:

```
streamlit run app.py
```

Then open the URL printed in the terminal (usually http://localhost:8501).

## Features
- Upload CSV or Excel (`.csv`, `.xlsx`, `.xls`)
- Auto type detection for numeric and date columns
- Sidebar filters for categorical, numeric, and date columns
- KPIs: rows, columns, missing cells, duplicate rows; quick metric over any numeric column
- Chart builder (Plotly): bar, line, area, scatter, histogram, and box
- Pivot table builder (rows, columns, aggregations)
- Download filtered data as CSV
- Sample dataset option if you want to try the UI without your file

## Notes
- For Excel files, you can select a sheet
- Large files may take a moment to process; Streamlit caches data reads to speed things up
