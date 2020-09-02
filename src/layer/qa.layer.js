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
            this.calculateStatistics(map,matches)
        })
        
        this.toggleTransit = this.toggleTransit.bind(this)
        this.transitOpacity = this.transitOpacity.bind(this)
    }

    calculateStatistics (map,matches) {

    }

    toggleTransit() {
        this.map.setLayoutProperty(
            'gtfs-edges', 
            'visibility', 
            this.map.getLayoutProperty('gtfs-edges', 'visibility') === 'visible' ? 'none' : 'visible'
        );
    }

    transitOpacity (e) {
        console.log('hello', e)
        if(e && e.target) {
            console.log('set', e.target.value)
            this.map.setPaintProperty('gtfs-edges','line-opacity', e.target.value/100)
        }
    }   
}


 export default (props = {}) =>
    new ShstLayer("Conflation QA", {
    active: true,
    matches: {},
    segments: [],
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
        dataFunc: function (feature) {
            
            if(feature[0].properties.shape_id){
                let matchIndex = `${feature[0].properties.shape_id}::${feature[0].properties.shape_index}`
                
                let segments = this.matches[matchIndex]
                if(segments){
                    this.shstHover = Object.values(segments).map(v => {
                         this.map.setFeatureState({
                          source: 'ShstSource',
                          sourceLayer: 'gtfs_conflation_qa',
                          id: v.shst_match_id
                        }, {
                          hover: true
                        });
                        return v.shst_match_id
                    })
                    console.log('shape_id', matchIndex, this.shstHover)
                }
            }
            
        }
    },
    onClick: {
        layers: ['shst', "gtfs-edges"],
        dataFunc: function (feature) {
            
            if(feature[0].properties.shape_id){
                let matchId = `${feature[0].properties.shape_id}::${feature[0].properties.shape_index}`
                this.matchId = matchId
                let segments = this.matches[matchId]
                this.map.setPaintProperty(
                    "gtfs-edges", 
                    "line-color",
                    ["match", 
                        ["string", ["get", "matchId"]], 
                        matchId,
                        '#FF8C00',
                        'slateblue'
                    ]
                )
               
                if(segments) {
                    this.segments = segments || []
                    let shstIds = Object.values(segments).map(v => v.shst_reference)
                    this.map.setPaintProperty(
                        "shst", 
                        "line-color",
                        ["match", 
                            ["string", ["get", "shstid"]], 
                            shstIds,
                            'yellow',
                            'white'
                        ]
                    )
                }


            }
           
        }
    },
    popover: {
        layers: ["shst","gtfs-edges"],
        dataFunc: (feature,map) => [['id', feature.id], ...Object.keys(feature.properties).map(k => [k, feature.properties[k]])]
    },
    infoBoxes: {
        Overview: {
            comp: MapController,
            show: true
        }

    }
    
})

const MapController = ({layer}) => {
    // console.log('MapController', layer)
    const colors = {
        primary: '#333',
        light: '#aaa'
    }
    // const transitVisibility = (e,v) => {
    //     console.log('transitVisibility', e.target.value/100, layer)
    //     (e.target.value/100)
    // } 
    console.log('segments', layer.segments)
    return  (

        <div style={{backgroundColor: '#fff',padding: 15}}>
            <div>
                <div style={{fontSize: '1.3em', fontWeigh: 500, borderBottom: `1px solid ${colors.primary}`, color: colors.primary }}>
                    Transit Layer
                    <span style={{float: 'right'}}><input type='checkbox'  onClick={layer.toggleTransit}/></span>
                </div>
                <label style={{color: colors.light}}>Opacity</label>
                <input type="range" min="1" max="100" onChange={layer.transitOpacity} style={{width: '100%'}}/>
                <div>
                    {layer.matchId}
                    <table>
                        <tbody>
                            {layer.segments.map(d => <tr><td>{d.shst_match_id}</td><td>{d.shst_reference}</td></tr>)}
                        </tbody>    
                    </table>
                    
                </div>
            </div>
        </div>
    )
}


