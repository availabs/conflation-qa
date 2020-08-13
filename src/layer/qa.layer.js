import React from "react"
import { ShshStyle, ShshStyleOutline, ShstSource } from './shst_styles.js'
import MapLayer from "AvlMap/MapLayer"

const COLOR = 'rgba(255, 255, 255, 0.95)'


const conflation = new MapLayer("Conflation QA", {
    active: true,
    sources: [
        ShstSource
    ],
    layers: [
        ShshStyle
    ],
    onHover: {
        layers: ['shst'],
        dataFunc: (feature) => {
            console.log('HOVER', feature, feature[0].properties.shstid)
            // conflation.map.setPaintProperty("shst", "line-color",
            // ["case",
            //     ["==", ["string", ["get", "shstid"]], feature[0].properties.shstid],
            //     'chartreuse',
            //     COLOR]
            // )
        }
    },
    popover: {
        layers: ["shst"],
        dataFunc: (feature,map) => Object.keys(feature.properties).map(k => [k, feature.properties[k]])
    },
    
    infoBoxes: {
        test: {
            comp: () => <div style={{backgroundColor: '#fff'}}>Conflation QA</div> ,
            show: true
        }

    }
    
})

export default conflation