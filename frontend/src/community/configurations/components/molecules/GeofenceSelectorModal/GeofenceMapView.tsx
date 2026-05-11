import { APIProvider, AdvancedMarker, Map, MapMouseEvent } from "@vis.gl/react-google-maps";
import { ReactNode } from "react";

import RadiusCircle from "./RadiusCircle";

interface Props {
  center: { lat: number; lng: number } | null;
  radius: number;
  height?: string;
  mapId: string;
  onClick?: (e: MapMouseEvent) => void;
  interactive?: boolean;
  children?: ReactNode;
}

const defaultCenter = { lat: 20, lng: 0 };
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

const GeofenceMapView = ({
  center,
  radius,
  height = "22rem",
  mapId,
  onClick,
  interactive = true,
  children
}: Props) => {
  const mapContent = center ? (
    <Map
      style={{ width: "100%", height }}
      defaultCenter={center}
      defaultZoom={14}
      center={center}
      mapId={mapId}
      onClick={interactive ? onClick : undefined}
      gestureHandling={interactive ? undefined : "none"}
      disableDefaultUI={!interactive}
    >
      <AdvancedMarker position={center} />
      <RadiusCircle center={center} radius={radius} />
    </Map>
  ) : (
    <Map
      style={{ width: "100%", height }}
      defaultCenter={defaultCenter}
      defaultZoom={2}
      mapId={mapId}
      onClick={interactive ? onClick : undefined}
      gestureHandling={interactive ? undefined : "none"}
      disableDefaultUI={!interactive}
    />
  );

  return (
    <APIProvider apiKey={apiKey}>
      <div className="relative">
        {mapContent}
        {children}
      </div>
    </APIProvider>
  );
};

export default GeofenceMapView;
