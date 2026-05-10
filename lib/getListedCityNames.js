import connectDB from "@/lib/mongoose";
import Property from "@/models/Property";
import City from "@/models/City";
import {
  PROPERTY_LISTED_QUERY,
  cityLabelFromPropertyField,
  loadCityIdNameMapFromRows,
} from "@/lib/propertyCityLabels";

/** Distinct city labels from active listings (same idea as `/api/website/property-cities`). */
export async function getListedCityNames() {
  await connectDB();
  const rows = await Property.find(PROPERTY_LISTED_QUERY).select("city").lean();
  const idMap = await loadCityIdNameMapFromRows(rows, City);
  const set = new Set();
  for (const row of rows) {
    const label = cityLabelFromPropertyField(row.city, idMap);
    if (label) set.add(label);
  }
  return [...set].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
}
