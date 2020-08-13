import React from "react"
import { ShshStyle, ShshStyleOutline, ShstSource } from './shst_styles.js'
import MapLayer from "AvlMap/MapLayer"



const conflation = new MapLayer("Conflation QA", {
    active: true,
    sources: [
        ShstSource
    ],
    layers: [
        ShshStyle,
        ShshStyleOutline
    ],
    
    popover: {
        layers: ["shst"],

        dataFunc: (feature,map) => {
            let hoveredStateId = null;
           
            return ["Header", ["Test", "Popover"]]
        }

    },
    
    infoBoxes: {
        test: {
            comp: () => <div style={{backgroundColor: '#fff'}}>Conflation QA</div> ,
            show: true
        }

    }
    
})

export default conflation