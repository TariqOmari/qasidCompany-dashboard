import React from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

const MapCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 text-right mt-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4">بازدید کاربران جهانی</h3>
      <div className="w-full h-64">
        <ComposableMap projectionConfig={{ scale: 130 }}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: { fill: "#f97316", outline: "none" },
                    hover: { fill: "#ea580c", outline: "none" },
                    pressed: { fill: "#9a3412", outline: "none" },
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

export default MapCard;
