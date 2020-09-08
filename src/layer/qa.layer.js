import React from "react"
import { ShshStyle, ShstSource, GtfsEdgesStyle } from './shst_styles.js'
import MapLayer from "AvlMap/MapLayer"
import length from '@turf/length'

// const COLOR = 'rgba(255, 255, 255, 0.95)'
const api = 'http://lor.availabs.org:9010' 
//const api = 'http://localhost:8080'


class ShstLayer extends MapLayer {

    onAdd(map) {
        super.onAdd(map);
        fetch(`${api}/gtfs-matches`)
        .then(r => r.json())
        .then(matches => {
            console.log('matches', matches)
            this.matches = matches
            fetch(`${api}/gtfs-conflation-map-join`)
            .then(r => r.json())
            .then(joins => {
                this.joins = joins;
                console.log('joins', joins)
                  fetch(`${api}/gtfs-edges`)
                    .then(r => r.json())
                    .then(edges => {
                        
                        this.calculateStatistics(matches, edges, joins)
                    })
            })
        })
        
        this.toggleTransit = this.toggleTransit.bind(this)
        this.transitOpacity = this.transitOpacity.bind(this)
        this.highlightUnJoined = this.highlightUnJoined.bind(this)
        this.highlightUnMatched = this.highlightUnMatched.bind(this)
    }

    calculateStatistics (matches,edges, joins) {
        this.numMatches = 0;
        this.numJoins = 0;
        this.unMatched = []
        this.unJoined = []
        this.match10 = 0
        this.match50 = 0
        edges.features.forEach((e,i) => {
            
            e.properties.length = length(e)
            this.numMatches += matches[e.properties.matchId] ? 1 : 0
            if(!matches[e.properties.matchId]) {
                this.unMatched.push(e.properties.matchId)
            } else { 
                
                let matchLength = matches[e.properties.matchId]
                    .reduce((out, curr) =>  { return out + (curr.shst_ref_end - curr.shst_ref_start)},0)
                
                if(Math.abs(e.properties.length*1000 - matchLength) < 5){
                    this.match10 += 1
                } else {

                }

                this.match50 +=  Math.abs(e.properties.length*1000 - matchLength) < 50 ? 1 : 0

            }

            this.numJoins += joins[e.properties.matchId] ? 1 : 0
            if(!joins[e.properties.matchId]) {
                this.unJoined.push(e.properties.matchId)
            }
        })
        this.edges = edges
        this.numEdges = edges.features.length
        
        this.highlightTransit(this.unMatched)
      
        this.component.forceUpdate()
        console.log('done',)

    }
    
    highlightUnJoined() {
        this.highlightTransit(this.unJoined, 'hotpink')
    }

    highlightUnMatched() {
        this.highlightTransit(this.unMatched, 'crimson')
    }

    highlightTransit(ids,color='crimson') {
        this.map.setPaintProperty(
            "gtfs-edges", 
            "line-color",
            ["match", 
                ["string", ["get", "matchId"]], 
                [...ids],
                color,
                'slateblue'
            ]
        )
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
                    //console.log('shape_id', matchIndex, this.shstHover)
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
    //console.log('segments', layer.segments)
    return  (

        <div style={{backgroundColor: '#fff',padding: 15}}>
            <div>
                <div style={{fontSize: '1.3em', fontWeigh: 500, borderBottom: `1px solid ${colors.primary}`, color: colors.primary }}>
                    Transit Layer
                    <span style={{float: 'right'}}><input type='checkbox'  onClick={layer.toggleTransit}/></span>
                </div>
                <label style={{color: colors.light}}>Opacity</label>
                <input type="range" min="1" max="100" onChange={layer.transitOpacity} style={{width: '100%'}}/>\
                <div style={{display: 'flex', padding: 10, borderRadius: 5, border: '1px solid DimGray', flexDirection: 'column'}}>
                    {layer.numMatches ? 
                        (
                        <>
                        <div style={{display: 'flex', paddingBottom: 15}}>
                            <div style={{flex: '1',textAlign:'center', width: '100%'}}>
                                <div># Edges</div>
                                <div style={{fontSize:'3em', fontWeight: 500, padding: 5}}>{layer.numEdges.toLocaleString()}</div>
                            </div>
                        </div>
                        <div style={{display: 'flex', paddingBottom: 15}}>
                            <div style={{flex: '1',textAlign:'center', cursor:'pointer'}} onClick={layer.highlightUnMatched}>
                                <div>% Matching</div>
                                <div style={{fontSize:'3em', fontWeight: 500, padding: 5}}>{ ((layer.numMatches / layer.numEdges) *100).toFixed(1)}</div>
                                
                            </div>
                            <div style={{flex: '1',textAlign:'center'}}>
                                 <div> 5m </div>
                                <div style={{fontSize:'3em', fontWeight: 500, padding: 5}}>{ ((layer.match10 / layer.numEdges) *100).toFixed(1)}</div>
                            </div>
                            <div style={{flex: '1',textAlign:'center'}}>
                                 <div> 50m </div>
                                <div style={{fontSize:'3em', fontWeight: 500, padding: 5}}>{ ((layer.match50 / layer.numEdges) *100).toFixed(1)}</div>
                            </div>
                        </div>
                        <div style={{display: 'flex', paddingBottom: 15}}>
                            <div style={{flex: '1',textAlign:'center', cursor:'pointer'}}  onClick={layer.highlightUnJoined}>
                                <div>% Matching</div>
                                <div style={{fontSize:'3em', fontWeight: 500, padding: 5}}>{ ((layer.numJoins / layer.numEdges) *100).toFixed(1)}</div>
                            
                            </div>
                            <div style={{flex: '1',textAlign:'center'}}>
                                
                            </div>
                            <div style={{flex: '1',textAlign:'center'}}>
                                
                            </div>
                        </div>
                        </>)
                        : <div style={{flex: '1',textAlign:'center'}}>...</div>
                    }
                </div>
                
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


