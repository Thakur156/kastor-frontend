// import { useEffect, useState } from "react";
// import { Map } from "react-map-gl/dist/es5/exports-maplibre";
// import DeckGL from "@deck.gl/react";
// import { HeatmapLayer } from "@deck.gl/aggregation-layers";
// import type { MapViewState } from "@deck.gl/core";

// const INITIAL_VIEW_STATE: MapViewState = {
//   latitude: 36.68333,
//   longitude: 71.53333,
//   zoom: 9,
//   maxZoom: 16,
//   pitch: 0,
//   bearing: 0,
// };

// const MAP_STYLE =
//   "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

// type DataPoint = [number, number, number];

// export default function HeatMapChart({
//   filteredData,
//   intensity = 1,
//   threshold = 0.03,
//   radiusPixels = 30,
//   mapStyle = MAP_STYLE,
// }: {
//   filteredData: any[];
//   intensity?: number;
//   threshold?: number;
//   radiusPixels?: number;
//   mapStyle?: string;
// }) {
//   const [coordinatesData, setCoordinatesData] = useState<DataPoint[]>([]);
//   const [noCoordinates, setNoCoordinates] = useState(false);

//   function findMinMaxIntensity(data) {
//     let maxIntensity = -Infinity;
//     let minIntensity = Infinity;

//     data.forEach((point) => {
//       if (point.intensity > maxIntensity) {
//         maxIntensity = point.intensity;
//       }
//       if (point.intensity < minIntensity) {
//         minIntensity = point.intensity;
//       }
//     });

//     return { maxIntensity, minIntensity };
//   }

//   function scaleTo255(value, minValue, maxValue) {
//     return ((value - minValue) * 255) / (maxValue - minValue);
//   }

//   useEffect(() => {
//     // console.log("filtered data", filteredData);
//     const fetchCoordinatesData = () => {
//       const coords: DataPoint[] = [];

//       const { maxIntensity, minIntensity } = findMinMaxIntensity(filteredData);

//       for (const item of filteredData) {
//         // Check if item contains latitude and longitude
//         if (item.latitude && item.longitude) {
//           coords.push([
//             item.longitude,
//             item.latitude,
//             Math.ceil(scaleTo255(item.intensity, minIntensity, maxIntensity)),
//           ] as DataPoint);
//         }
//       }

//       if (coords.length === 0) {
//         setNoCoordinates(true);
//       } else {
//         setCoordinatesData(coords);
//         setNoCoordinates(false);
//       }
//     };

//     fetchCoordinatesData();
//   }, [filteredData]);

//   const layers = [
//     new HeatmapLayer<DataPoint>({
//       data: coordinatesData,
//       id: "heatmap-layer",
//       pickable: false,
//       getPosition: (d) => [d[0], d[1]],
//       getWeight: (d) => d[2],
//       radiusPixels,
//       intensity,
//       threshold,
//     }),
//   ];

//   return (
//     <>
//       {noCoordinates ? (
//         <div className="flex items-center justify-center">
//           No valid latitude and longitude data found.
//         </div>
//       ) : (
//         <DeckGL
//           initialViewState={INITIAL_VIEW_STATE}
//           controller={true}
//           layers={layers}
//         >
//           <Map reuseMaps mapStyle={mapStyle} />
//         </DeckGL>
//       )}
//     </>
//   );
// }
