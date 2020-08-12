import React from "react";

import AvlMap from "./AvlMap"
// import TransitLayerFactory from './layers/TransitLayer'


function App() {
  return (
    <div className="App">
      <div style={{ height: "100vh" }}>
        <AvlMap
          dragPan={true}
          style={ 'mapbox://styles/am3081/cjqqukuqs29222sqwaabcjy29' }
          header="Transit Data"/>
      </div>
    </div>
  );
}

export default App;
