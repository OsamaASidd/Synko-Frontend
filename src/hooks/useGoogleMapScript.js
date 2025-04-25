"use client";
import { Loader } from "@googlemaps/js-api-loader";
import { useEffect, useState } from "react";
export const useGoogleMapsScript = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loader = new Loader({
      apiKey: "AIzaSyDPPgKluQp-6KifO_eRxlftNuQfylTKcSo",
      libraries: ["places"],
    });

    loader.load().then(() => {
      setLoaded(true);
    });
  }, []);

  return loaded;
};
