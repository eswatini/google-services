import io
import math
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
import plotly.express as px
import streamlit as st


# -----------------------------
# App configuration
# -----------------------------
st.set_page_config(page_title="Spreadsheet Dashboard", layout="wide")


# -----------------------------
# Utilities
# -----------------------------

def _attempt_parse_datetime(series: pd.Series) -> pd.Series:
    """Attempt to parse a series to datetime while preserving non-parsable entries.

    Returns the original series if parsing does not increase datetime-like values.
    """
    if series.dtype.kind in {"M"}:  # already datetime64
        return series
    try:
        parsed = pd.to_datetime(series, errors="coerce", utc=False, infer_datetime_format=True)
        # If very few values were parsed, keep original to avoid mis-typing
        parsed_ratio = parsed.notna().mean() if len(parsed) else 0.0
        if parsed_ratio >= 0.7:  # at least 70% parsed -> likely a date column
            return parsed
    except Exception:
        pass
    return series


def _infer_dtypes(df: pd.DataFrame) -> pd.DataFrame:
    """Return a dataframe with improved dtypes, especially for dates."""
    improved = df.copy()
    object_like_columns = improved.select_dtypes(include=["object"]).columns
    for column_name in object_like_columns:
        improved[column_name] = _attempt_parse_datetime(improved[column_name])
    return improved


def _split_column_types(df: pd.DataFrame) -> Tuple[List[str], List[str], List[str]]:
    """Return (numeric_columns, datetime_columns, categorical_columns)."""
    numeric_columns = list(df.select_dtypes(include=[np.number]).columns)
    datetime_columns = list(df.select_dtypes(include=["datetime64[ns]", "datetime64[ns, UTC]"]).columns)
    categorical_columns = [
        name
        for name in df.columns
        if name not in numeric_columns and name not in datetime_columns
    ]
    return numeric_columns, datetime_columns, categorical_columns


def _read_uploaded_file(uploaded_file: st.runtime.uploaded_file_manager.UploadedFile, sheet_name: Optional[str]) -> pd.DataFrame:
    file_bytes = uploaded_file.read()
    file_buffer = io.BytesIO(file_bytes)
    file_name_lower = uploaded_file.name.lower()

    if file_name_lower.endswith(".csv"):
        return pd.read_csv(file_buffer)
    if file_name_lower.endswith(".xlsx") or file_name_lower.endswith(".xls"):
        return pd.read_excel(file_buffer, sheet_name=sheet_name)

    raise ValueError("Unsupported file type. Please upload a CSV or Excel file.")


@st.cache_data(show_spinner=False)
def load_dataframe(uploaded_file_bytes: bytes, file_name: str, sheet_name: Optional[str]) -> pd.DataFrame:
    buffer = io.BytesIO(uploaded_file_bytes)
    if file_name.lower().endswith(".csv"):
        df = pd.read_csv(buffer)
    elif file_name.lower().endswith(".xlsx") or file_name.lower().endswith(".xls"):
        df = pd.read_excel(buffer, sheet_name=sheet_name)
    else:
        raise ValueError("Unsupported file type.")
    return _infer_dtypes(df)


def _format_large_int(value: int) -> str:
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return "-"
    for unit in ["", "K", "M", "B", "T"]:
        if abs(value) < 1000:
            return f"{value:,.0f}{unit}"
        value /= 1000
    return f"{value:,.0f}P"


# -----------------------------
# Sidebar: file upload and options
# -----------------------------
with st.sidebar:
    st.title("Data Setup")

    use_sample_data = st.toggle("Use sample dataset", value=False, help="Try the app without uploading a file")

    uploaded_file = None
    sheet_name: Optional[str] = None

    if not use_sample_data:
        uploaded_file = st.file_uploader("Upload CSV or Excel", type=["csv", "xlsx", "xls"], accept_multiple_files=False)
        if uploaded_file is not None and uploaded_file.name.lower().endswith((".xlsx", ".xls")):
            sheet_name = st.text_input("Excel sheet name (optional)", value="") or None

    st.markdown("---")
    st.caption("Tip: Large files may take a moment. Data is cached for speed.")


# -----------------------------
# Load data
# -----------------------------
if use_sample_data:
    # Generate a small synthetic dataset
    rng = np.random.default_rng(42)
    num_rows = 800
    dates = pd.date_range("2023-01-01", periods=num_rows, freq="D")
    categories = rng.choice(["North", "South", "East", "West"], size=num_rows)
    products = rng.choice(["Alpha", "Beta", "Gamma"], size=num_rows)
    values = rng.normal(loc=100, scale=20, size=num_rows).round(2)
    quantities = rng.integers(1, 10, size=num_rows)

    df_raw = pd.DataFrame({
        "date": dates,
        "region": categories,
        "product": products,
        "sales": values,
        "quantity": quantities,
    })
else:
    if uploaded_file is None:
        st.info("Upload a CSV/Excel in the sidebar or toggle 'Use sample dataset'.")
        st.stop()
    df_raw = load_dataframe(uploaded_file.getvalue(), uploaded_file.name, sheet_name)


if df_raw.empty:
    st.warning("The dataset appears to be empty.")
    st.stop()


# -----------------------------
# Data overview
# -----------------------------
st.title("Spreadsheet Dashboard")

st.subheader("Data Preview")
st.dataframe(df_raw.head(50), use_container_width=True)

numeric_cols, date_cols, cat_cols = _split_column_types(df_raw)

with st.expander("Column types", expanded=False):
    left, right, right2 = st.columns(3)
    with left:
        st.markdown("**Numeric**")
        st.write(numeric_cols or ["-"])
    with right:
        st.markdown("**Datetime**")
        st.write(date_cols or ["-"])
    with right2:
        st.markdown("**Categorical**")
        st.write(cat_cols or ["-"])


# -----------------------------
# Sidebar: filters
# -----------------------------
with st.sidebar:
    st.markdown("---")
    st.title("Filters")

    filters: Dict[str, Dict[str, object]] = {}

    # Categorical filters (limit to reasonable cardinality)
    for column_name in cat_cols:
        unique_values = pd.Series(df_raw[column_name].dropna().unique())
        if len(unique_values) == 0 or len(unique_values) > 2000:
            continue
        sorted_values = sorted(unique_values.astype(str).tolist())
        selected = st.multiselect(f"{column_name}", options=sorted_values, default=sorted_values)
        filters[column_name] = {"type": "categorical", "selected": selected}

    # Numeric ranges
    for column_name in numeric_cols:
        col_min = float(pd.to_numeric(df_raw[column_name], errors="coerce").min())
        col_max = float(pd.to_numeric(df_raw[column_name], errors="coerce").max())
        if math.isfinite(col_min) and math.isfinite(col_max) and col_min != col_max:
            selected_min, selected_max = st.slider(
                f"{column_name}", min_value=col_min, max_value=col_max, value=(col_min, col_max)
            )
            filters[column_name] = {"type": "numeric", "range": (selected_min, selected_max)}

    # Date ranges
    for column_name in date_cols:
        col_min = pd.to_datetime(df_raw[column_name]).min()
        col_max = pd.to_datetime(df_raw[column_name]).max()
        if pd.notna(col_min) and pd.notna(col_max) and col_min != col_max:
            selected_date_range = st.date_input(
                f"{column_name}",
                value=(col_min.date(), col_max.date()),
                min_value=col_min.date(),
                max_value=col_max.date(),
            )
            if isinstance(selected_date_range, tuple) and len(selected_date_range) == 2:
                filters[column_name] = {"type": "date", "range": selected_date_range}


@st.cache_data(show_spinner=False)
def apply_filters(df: pd.DataFrame, filters: Dict[str, Dict[str, object]]) -> pd.DataFrame:
    filtered = df.copy()

    for column_name, filter_spec in filters.items():
        kind = filter_spec.get("type")
        if kind == "categorical":
            selected = filter_spec.get("selected", [])
            if len(selected) == 0:
                filtered = filtered.iloc[0:0]
                break
            # Cast to string comparison to match UI selection casting
            filtered = filtered[filtered[column_name].astype(str).isin(selected)]
        elif kind == "numeric":
            min_val, max_val = filter_spec.get("range", (None, None))
            numeric_series = pd.to_numeric(filtered[column_name], errors="coerce")
            filtered = filtered[(numeric_series >= float(min_val)) & (numeric_series <= float(max_val))]
        elif kind == "date":
            start_date, end_date = filter_spec.get("range", (None, None))
            dates = pd.to_datetime(filtered[column_name], errors="coerce")
            filtered = filtered[(dates >= pd.Timestamp(start_date)) & (dates <= pd.Timestamp(end_date) + pd.Timedelta(days=1) - pd.Timedelta(milliseconds=1))]

    return filtered


df = apply_filters(df_raw, filters)


# -----------------------------
# KPIs
# -----------------------------
null_cells = int(df.isna().sum().sum())
duplicate_rows = int(df.duplicated().sum())

kpi_cols = st.columns(4)
with kpi_cols[0]:
    st.metric("Rows (filtered)", _format_large_int(len(df)))
with kpi_cols[1]:
    st.metric("Columns", _format_large_int(df.shape[1]))
with kpi_cols[2]:
    st.metric("Missing cells", _format_large_int(null_cells))
with kpi_cols[3]:
    st.metric("Duplicate rows", _format_large_int(duplicate_rows))

with st.expander("Quick metric over numeric column", expanded=False):
    if numeric_cols:
        metric_col = st.selectbox("Column", options=numeric_cols, index=0)
        agg = st.selectbox("Aggregation", options=["sum", "mean", "median", "min", "max"], index=1)
        series = pd.to_numeric(df[metric_col], errors="coerce")
        value = {
            "sum": series.sum(),
            "mean": series.mean(),
            "median": series.median(),
            "min": series.min(),
            "max": series.max(),
        }[agg]
        st.metric(f"{agg} of {metric_col}", f"{value:,.2f}")
    else:
        st.info("No numeric columns available.")


# -----------------------------
# Chart Builder
# -----------------------------
st.subheader("Chart Builder")

chart_left, chart_right = st.columns([2, 1])

with chart_right:
    chart_type = st.selectbox("Chart type", ["Bar", "Line", "Area", "Scatter", "Histogram", "Box"], index=0)

    x_col = st.selectbox("X axis", options=list(df.columns), index=0)

    needs_y = chart_type in {"Bar", "Line", "Area", "Scatter", "Box"}
    numeric_for_y = numeric_cols if numeric_cols else []
    y_col = None
    if needs_y and numeric_for_y:
        default_y_index = 0
        if x_col in numeric_for_y and len(numeric_for_y) > 1:
            default_y_index = 1
        y_col = st.selectbox("Y axis (numeric)", options=numeric_for_y, index=default_y_index)

    color_col = st.selectbox("Color / Group (optional)", options=["(none)"] + list(df.columns), index=0)
    if color_col == "(none)":
        color_col = None

    aggregation = None
    if chart_type in {"Bar", "Line", "Area"} and y_col is not None:
        aggregation = st.selectbox("Aggregation", options=["sum", "mean", "count"], index=0)

    orientation = None
    if chart_type == "Bar":
        orientation = st.radio("Orientation", options=["vertical", "horizontal"], horizontal=True, index=0)

with chart_left:
    fig = None
    try:
        if chart_type == "Histogram":
            fig = px.histogram(df, x=x_col, color=color_col, nbins=40, opacity=0.85)
        elif chart_type == "Box":
            fig = px.box(df, x=x_col, y=y_col, color=color_col, points="outliers")
        elif chart_type == "Scatter":
            fig = px.scatter(df, x=x_col, y=y_col, color=color_col, trendline=None)
        elif chart_type in {"Bar", "Line", "Area"} and y_col is not None:
            temp = df.copy()
            if aggregation == "count":
                temp["__ones__"] = 1
                agg_col = "__ones__"
                y_label = f"count of {y_col}"
            else:
                agg_col = y_col
                y_label = f"{aggregation} of {y_col}"

            grouped = temp.groupby([x_col] + ([color_col] if color_col else []), dropna=False)[agg_col]
            if aggregation == "sum" or aggregation == "count":
                summarized = grouped.sum().reset_index()
            elif aggregation == "mean":
                summarized = grouped.mean().reset_index()
            else:
                summarized = grouped.sum().reset_index()

            if chart_type == "Bar":
                fig = px.bar(
                    summarized,
                    x=x_col if orientation == "vertical" else y_label,
                    y=y_label if orientation == "vertical" else x_col,
                    color=color_col,
                    orientation="v" if orientation == "vertical" else "h",
                )
            elif chart_type == "Line":
                fig = px.line(summarized, x=x_col, y=y_label, color=color_col)
            elif chart_type == "Area":
                fig = px.area(summarized, x=x_col, y=y_label, color=color_col, groupnorm=None)
        else:
            st.info("Select appropriate axes/columns for the chosen chart.")
    except Exception as e:
        st.warning(f"Chart could not be rendered: {e}")

    if fig is not None:
        fig.update_layout(margin=dict(l=10, r=10, t=30, b=10))
        st.plotly_chart(fig, use_container_width=True)


# -----------------------------
# Pivot Table
# -----------------------------
st.subheader("Pivot Table")

pivot_left, pivot_right = st.columns([2, 1])

with pivot_right:
    pivot_index = st.multiselect("Rows (index)", options=list(df.columns), default=[col for col in cat_cols[:1]])
    pivot_columns = st.multiselect("Columns", options=list(df.columns), default=[col for col in cat_cols[1:2]])
    pivot_values_candidates = numeric_cols if numeric_cols else []
    pivot_values = st.multiselect("Values (numeric)", options=pivot_values_candidates, default=pivot_values_candidates[:1])
    pivot_aggfunc = st.selectbox("Aggregation", options=["sum", "mean", "count"], index=0)
    pivot_sort = st.selectbox("Sort by", options=["index", "columns", "none"], index=0)

with pivot_left:
    if pivot_values:
        try:
            agg_map = {"sum": np.sum, "mean": np.mean, "count": len}[pivot_aggfunc]
            pivot_df = pd.pivot_table(
                df,
                index=pivot_index if pivot_index else None,
                columns=pivot_columns if pivot_columns else None,
                values=pivot_values,
                aggfunc=agg_map,
                fill_value=0,
                dropna=False,
            )
            if pivot_sort == "index":
                pivot_df.sort_index(inplace=True)
            elif pivot_sort == "columns":
                pivot_df.sort_index(axis=1, inplace=True)
            st.dataframe(pivot_df, use_container_width=True)
        except Exception as e:
            st.warning(f"Pivot table could not be created: {e}")
    else:
        st.info("Select at least one numeric column for Values.")


# -----------------------------
# Download filtered data
# -----------------------------
st.subheader("Download")

@st.cache_data(show_spinner=False)
def to_csv_bytes(df_in: pd.DataFrame) -> bytes:
    return df_in.to_csv(index=False).encode("utf-8")

csv_bytes = to_csv_bytes(df)
st.download_button(
    label="Download filtered data as CSV",
    data=csv_bytes,
    file_name="filtered_data.csv",
    mime="text/csv",
)