import React from "react";
import Map from "./Map";
import { MapThemeProvider } from "../../contexts/MapThemeContext";
import "../../assets/styles/components/home/home.scss";
import "../../styles/themes/mapDarkMode.scss";

const Home = () => {
  return (
    <MapThemeProvider>
      <div>
        <Map />
      </div>
    </MapThemeProvider>
  );
};

export default Home;
