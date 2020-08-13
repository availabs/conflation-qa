import React from "react";

import AvlMap from "./AvlMap"
// import TransitLayerFactory from './layers/TransitLayer'
import qaLayer from 'layer/qa.layer'

function App() {
  return (
    <div style={{ height: "100vh" }}>
      <AvlMap
        layers={[qaLayer]}
        dragPan={true}
        style={ 'mapbox://styles/am3081/ckdrpq3w2079419ppmytrrafm' }
        sidebar={false}
        header="Transit Data"/>
    </div>
    
  );
}

export default App;
