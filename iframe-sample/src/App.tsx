import { useState } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import "./App.css";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const defaultCenter = {
  lat: 35.69575,
  lng: 139.77521,
};

const defaultZoom = 9;

const App = () => {
  const [mapCenter] = useState(defaultCenter);
  const [zoom] = useState(defaultZoom);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "",
    libraries: ["places"],
    language: "ja",
    region: "JP",
  });
  return (
    <div className="App">
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={zoom}
          options={{
            zoomControl: true,
          }}
        />
      )}
    </div>
  );
};

export default App;
