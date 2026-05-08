/// <reference types="@types/google.maps" />
import { useMap } from "@vis.gl/react-google-maps";
import { useEffect, useRef } from "react";

import { theme } from "~community/common/theme/theme";

interface Props {
  center: google.maps.LatLngLiteral;
  radius: number;
}

const RadiusCircle = ({ center, radius }: Props) => {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) return;
    if (circleRef.current) {
      circleRef.current.setCenter(center);
      circleRef.current.setRadius(radius);
    } else {
      circleRef.current = new google.maps.Circle({
        map,
        center,
        radius,
        strokeColor: theme.palette.primary.dark,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: theme.palette.primary.main,
        fillOpacity: 0.15
      });
    }
    return () => {
      circleRef.current?.setMap(null);
      circleRef.current = null;
    };
  }, [map, center, radius]);

  return null;
};

export default RadiusCircle;
