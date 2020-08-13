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
        style={ 'mapbox://styles/am3081/ckdsuik5w1b2x19n5d9lkow78' }
        sidebar={false}
        header="Transit Data"/>
    </div>
    
  );
}

export default App;
