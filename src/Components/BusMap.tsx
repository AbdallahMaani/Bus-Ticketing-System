"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Trip } from "./TicketForm";

export interface BusMapRef {
  zoomTo: (lat: number, lng: number) => void;
  clearRoutes: () => void;
}

const BusMap = forwardRef<BusMapRef, { trips: Trip[] }>(({ trips }, ref) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useImperativeHandle(ref, () => ({
    zoomTo: (lat: number, lng: number) => {
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [lng, lat],
          zoom: 14,
          duration: 2000,
        });
      }
    },
    clearRoutes: () => {
      if (mapRef.current && mapRef.current.isStyleLoaded()) {
        // Clear markers
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

  const markersRef = useRef<maplibregl.Marker[]>([]);

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

    if (trips.length === 0) {
      const source = map.getSource("routes") as maplibregl.GeoJSONSource;
      if (source) {
        source.setData({
          type: "FeatureCollection",
          features: [],
        });
      }
      return;
    }

    const uniqueMarkers = new Map<string, { lat: number; lng: number; details: string }>();
    trips.forEach((trip) => {
      if (trip.origin_lat && trip.origin_lng) {
        const key = `${trip.origin_lat},${trip.origin_lng}`;
        if (!uniqueMarkers.has(key)) {
          uniqueMarkers.set(key, {
            lat: trip.origin_lat,
            lng: trip.origin_lng,
            details: `<strong>${trip.origin_name}</strong><br>Station: ${trip.origin_station}<br>Street: ${trip.origin_street}`,
          });
        }
      }
      if (trip.destination_lat && trip.destination_lng) {
        const key = `${trip.destination_lat},${trip.destination_lng}`;
        if (!uniqueMarkers.has(key)) {
          uniqueMarkers.set(key, {
            lat: trip.destination_lat,
            lng: trip.destination_lng,
            details: `<strong>${trip.destination_name}</strong><br>Station: ${trip.destination_station}<br>Street: ${trip.destination_street}`,
          });
        }
      }
    });

    uniqueMarkers.forEach(({ lat, lng, details }) => {
      const marker = new maplibregl.Marker()
        .setLngLat([lng, lat])
        .setPopup(new maplibregl.Popup().setHTML(details))
        .addTo(map);
      markersRef.current.push(marker);
    });

    const routes = new Map<string, { origin: [number, number]; destination: [number, number] }>();
    trips.forEach((trip) => {
      if (trip.origin_lat && trip.origin_lng && trip.destination_lat && trip.destination_lng) {
        const routeKey = `${trip.origin_lat},${trip.origin_lng}-${trip.destination_lat},${trip.destination_lng}`;
        if (!routes.has(routeKey)) {
          routes.set(routeKey, {
            origin: [trip.origin_lng, trip.origin_lat],
            destination: [trip.destination_lng, trip.destination_lat],
          });
        }
      }
    });

    const routePromises = Array.from(routes.values()).map(async (route) => {
      const { origin, destination } = route;
      try {
        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?overview=full&geometries=geojson`);
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          return {
            type: "Feature" as const,
            geometry: data.routes[0].geometry,
            properties: {},
          };
        }
      } catch (e) {
        console.error("Error fetching route:", e);
      }
      return null;
    });

    Promise.all(routePromises).then((routeFeatures) => {
      if (!map) return;
      const validFeatures = routeFeatures.filter((f) => f !== null) as any[];
      const source = map.getSource("routes") as maplibregl.GeoJSONSource;
      if (source) {
        source.setData({
          type: "FeatureCollection",
          features: validFeatures,
        });
      }
    });
  }, [trips]);

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

export default BusMap;
