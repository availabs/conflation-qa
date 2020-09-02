import React from "react"
import { ShshStyle, ShstSource, GtfsEdgesStyle } from './shst_styles.js'
import MapLayer from "AvlMap/MapLayer"

// const COLOR = 'rgba(255, 255, 255, 0.95)'
const api = 'http://localhost:8080'

class ShstLayer extends MapLayer {
    onAdd(map) {
        super.onAdd(map);
        fetch(`${api}/gtfs-matches`)
        .then(r => r.json())
        .then(matches => {
            console.log('matches', matches)
            this.matches = matches
        })

    }
    toggleTransit() {
        var visibility = this.map.getLayoutProperty('gtfs-edges', 'visibility') === 'visible' ? 'none' : 'visible';
        this.map.setLayoutProperty('gtfs-edges', 'visibility', visibility);

    }
}


 export default (props = {}) =>
    new ShstLayer("Conflation QA", {
    active: true,
    matches: {},
    sources: [
        ShstSource,
        {   
            id: 'gtfs-edges',
            source: {
                'type': 'geojson',
                'data': `${api}/gtfs-edges`,
                'generateId': true
            }
        }
    ],
    layers: [
        ShshStyle,
        GtfsEdgesStyle
    ],
    onHover: {
        layers: ['shst', "gtfs-edges"],
        dataFunc: function (feature, layer, map, a, b) {
            console.log('HOVER', this.matches)

            if(feature[0].properties.shape_id){
                //console.log('shape_id', feature[0].properties.shape_id, this)
            }
            // conflation.map.setPaintProperty("shst", "line-color",
            // ["case",
            //     ["==", ["string", ["get", "shstid"]], feature[0].properties.shstid],
            //     'chartreuse',
            //     COLOR]
            // )
        }
    },
    onClick: {
        layers: ['shst', "gtfs-edges"],
        dataFunc: function (feature) {
            console.log('Click', feature, feature[0].properties.shstid)
           
        }
    },
    popover: {
        layers: ["shst","gtfs-edges"],
        dataFunc: (feature,map) => Object.keys(feature.properties).map(k => [k, feature.properties[k]])
    },
    
    infoBoxes: {
        Overview: {
            comp: function (layer) {
                return <MapController layer={layer}/> 
            },
            show: true
        }

    }
    
})

const MapController = ({layer}) => {
    console.log('MapController', layer, layer.toggleTransit)


    return  (

        <div style={{backgroundColor: '#fff',padding: 15}}>
            <div>
                <h4>Transit Layer<span><input type='checkbox'  /></span></h4>
            </div>

        </div>
    )
}


