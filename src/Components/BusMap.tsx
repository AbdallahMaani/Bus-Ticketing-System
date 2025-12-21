"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Trip } from "./TicketForm";

import { Areas } from "./TicketForm"; // Import Areas type
 
export interface BusMapRef {
  showTripRoute: (trip: Trip) => void; // New method to show a specific trip's route and zoom
  clearRoutes: () => void;
}

interface RouteFeature { // Define the structure of a route feature to replace any word
  type: "Feature";
  geometry: {
    type: "LineString";
    coordinates: number[][];
  };
  properties: Record<string, unknown>;
}

const BusMap = forwardRef<BusMapRef, { trips: Trip[]; allAreas: Areas[]; fromCityId: string | null; toCityId: string | null }>(({ trips, allAreas, fromCityId, toCityId }, ref) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useImperativeHandle(ref, () => ({
    showTripRoute: async (trip: Trip) => {
      if (mapRef.current) {
        // Clear any previously drawn routes
        if (mapRef.current.isStyleLoaded()) {
          const source = mapRef.current.getSource("routes") as maplibregl.GeoJSONSource;
          if (source) {
            source.setData({ type: "FeatureCollection", features: [] });
          }
        }

        const { origin_lat, origin_lng, destination_lat, destination_lng } = trip;

        if (!origin_lat || !origin_lng || !destination_lat || !destination_lng) {
          console.warn("Missing coordinates for trip route.");
          return;
        }

        // Fetch and draw the specific route
        try {
          const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${origin_lng},${origin_lat};${destination_lng},${destination_lat}?overview=full&geometries=geojson`);
          const data = await response.json();
          if (data.routes && data.routes.length > 0 && mapRef.current.isStyleLoaded()) {
            const source = mapRef.current.getSource("routes") as maplibregl.GeoJSONSource;
            if (source) {
              source.setData({
                type: "FeatureCollection",
                features: [{ type: "Feature", geometry: data.routes[0].geometry, properties: {} }],
              });
            }
          }
        } catch (e) {
          console.error("Error fetching route for trip:", e);
        }

        // Zoom to fit the route
        const bounds = new maplibregl.LngLatBounds();
        bounds.extend([origin_lng, origin_lat]);
        bounds.extend([destination_lng, destination_lat]);
        mapRef.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 }, // Add some padding around the bounds
          maxZoom: 14, // Don't zoom in too close
          duration: 2000,
        });
      }
    },
    clearRoutes: () => {
      if (mapRef.current && mapRef.current.isStyleLoaded()) {
        // Clear markers (only those added by this component, not the default ones)
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        // Clear routes
        const source = mapRef.current.getSource("routes") as maplibregl.GeoJSONSource;
        if (source) {
          source.setData({
            type: "FeatureCollection",
            features: [],
          });
        }
      }
    },
  }));

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [35.9333, 31.95],
      zoom: 8,
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      if (!mapRef.current) return;
      mapRef.current.addSource("routes", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });
      mapRef.current.addLayer({
        id: "routes",
        type: "line",
        source: "routes",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#007cbf",
          "line-width": 5,
          "line-opacity": 0.8,
        },
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Clear routes when trips change or no trips are present
      const source = map.getSource("routes") as maplibregl.GeoJSONSource;
      if (source) {
        source.setData({
          type: "FeatureCollection",
          features: [],
        });
      }
    
    // Display markers only for areas related to the selected 'from' and 'to' cities
    const areasToDisplay = allAreas.filter(area => 
      (fromCityId && area.city_id === fromCityId) || 
      (toCityId && area.city_id === toCityId)
    );

    areasToDisplay.forEach((area) => {
      if (area.lat && area.lng) { // Ensure coordinates exist
        // Construct details for the popup
        const details = `<strong>${area.name_en}</strong><br>Station: ${area.station_name}<br>Street: ${area.street_en}`; 
        
        // Create the popup instance
        const popup = new maplibregl.Popup({
          closeButton: false, // Hide the close button for hover popups
          closeOnClick: false, // Prevent the popup from closing when the map is clicked
          offset: 25, // Offset the popup from the marker
        }).setHTML(details);

        // Create the marker and add it to the map
      const marker = new maplibregl.Marker()
        .setLngLat([area.lng, area.lat])
        .addTo(map);

        // Get the marker's DOM element to attach event listeners
        const markerElement = marker.getElement();

        // Show popup on mouse enter
        markerElement.addEventListener('mouseenter', () => popup.addTo(map));

        // Hide popup on mouse leave
        markerElement.addEventListener('mouseleave', () => popup.remove());

      markersRef.current.push(marker);
      }
    });
  }, [allAreas, fromCityId, toCityId]); // Dependencies for marker display

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "20px",
        overflow: "hidden",
      }}
    />
  );
});

BusMap.displayName = "BusMap"; //this line sets the display name of the BusMap component for easier debugging and identification in React DevTools

export default BusMap;
