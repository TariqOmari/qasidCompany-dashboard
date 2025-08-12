// components/WorldMapCard.jsx
import React from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const geoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

const WorldMapCard = () => {
  return (
    <div className="bg-white rounded-xl shadow p-4 w-full h-[400px]">
      <h2 className="text-right font-semibold mb-4 text-gray-700">
        بازدید کاربران جهانی
      </h2>
      <div className="w-full h-full">
        <ComposableMap projectionConfig={{ scale: 120 }}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill: "#D6D6DA",
                      outline: "none",
                    },
                    hover: {
                      fill: "#F53",
                      outline: "none",
                    },
                    pressed: {
                      fill: "#E42",
                      outline: "none",
                    },
                  }}
                />
              ))
            }
          </Geographies>
        </ComposableMap>
      </div>
    </div>
  );
};

export default WorldMapCard;
