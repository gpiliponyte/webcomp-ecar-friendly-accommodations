
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Feature, Overlay } from 'ol';
import ScaleLine from 'ol/control/ScaleLine';
import ZoomSlider from 'ol/control/ZoomSlider';
import { LineString, Point } from 'ol/geom';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import { fromLonLat, transform } from 'ol/proj';
import { Cluster, OSM, Vector } from 'ol/source';
import { Fill, Icon, Stroke, Style, Text } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import View from 'ol/View';
import { AccommodationService } from './services/accommodations.service';
import { COLOR, compare } from './services/types';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public map!: Map
  name = ""
  type = ""
  accType = ""
  link = ""
  phone = ""
  distanceTillEChargingStation = 1500
  accommodationFeatures: any = []
  nearbyStations: any = []

  @ViewChild("banner") banner!: ElementRef;
  @ViewChild("ebanner") ebanner!: ElementRef;


  constructor(private accommodationService: AccommodationService){}


  onFilterApplied() {
    console.log("filter applied")
    let layer = this.map.getAllLayers()[2]
    this.map.removeLayer(layer)
    
    //@ts-ignore
    let featuresSelected = this.accommodationFeatures.filter(el=> el.get("distances")[0].distance < this.distanceTillEChargingStation)

    this.addLayer(COLOR.ACCOMMODATION, featuresSelected)

  }

  addLayer(color: any, features: any) {
    let source = new Vector({features: features})
 
    let clusterSource = new Cluster({
      distance: 100,//parseInt('40', 10),
      source: source
    });

    let clusters = new VectorLayer({
      source: clusterSource,
      style: function(feature) {
        const size = feature.get('features').length;
        let styleCache: any = {};
        let style = styleCache[size];
        if (!style) {
          style = new Style({
            image: size > 0 ? new CircleStyle({
              radius: size > 1 ? size*0.05+10 : 5,
              stroke: new Stroke({
                color: '#fff'
              }),
              fill: new Fill({
                color:  color
              })
            }) : new Icon({
              opacity: 1,
              src: 'assets/marker.svg',
              scale: 1
            }),
            text: new Text(
              {
              text: size > 1 ? size.toString() : "",
              fill: new Fill({
                color: '#fff'
              })
            })
          });
          styleCache[size] = style;
        }
        return style;
      }
    });

    this.map.addLayer(clusters);
  }


  ngOnInit(): void {
    this.map = new Map({
    layers: [
      new TileLayer({
        source: new OSM(),
      })
    ],
    target: 'map',
    view: new View({ 
      center: transform([11.3548, 46.4983], 'EPSG:4326', 'EPSG:3857'),
      zoom: 10, maxZoom: 20, minZoom: 8
    }),
    controls: []
  });

  this.map.addControl(new ZoomSlider({}))
  // this.map.addControl(new ScaleLine({}))


  this.accommodationService.getEcharging().subscribe(array => {

    let points: { point: Point; item: { latitude: any; longitude: any; name: any; available: any; scode: any; }; }[] = []

    let features = []
    let items = array[0].dataSource
    for(let item of items){
      let point = new Point(fromLonLat([item.longitude, item.latitude]))
      let feature = new Feature({geometry: point })
      points.push({point, item})
      feature.set("name", item.name)
      feature.set("type", "E-Charging Station")

      features.push(feature)
    }

    this.addLayer(COLOR.ECHARGER, features)


    this.accommodationService.getAccommodations().subscribe(array => {

      let features = []
      let items = array[0].dataSource

      for(let item of items){
        let point = new Point(fromLonLat([item.longitude, item.latitude]))

        let feature = new Feature({geometry: point})
        feature.set("name", item.name)
        feature.set("link", item.accoDetail.en.Website)
        feature.set("phone", item.accoDetail.en.Phone)
        feature.set("city", item.accoDetail.en.City)
        feature.set("type", "Hotel")
        feature.set("accType", item.accType)
        feature.set("longitude", item.longitude)
        feature.set("latitude", item.latitude)

        let distancesToEchargingStations = []

        for(let ep of points) {

          let line = new LineString([ep.point.getCoordinates(), point.getCoordinates()])

          distancesToEchargingStations.push({station: ep, distance: line.getLength()})
        }
        
        distancesToEchargingStations.sort(compare);

        feature.set("distances", distancesToEchargingStations)

        features.push(feature)
      }

      this.accommodationFeatures = features

      let featuresSelected = features.filter(el => el.get("distances")[0].distance < this.distanceTillEChargingStation)

      this.addLayer(COLOR.ACCOMMODATION, featuresSelected)

    })

  })


  this.map.on("click", (e) => {
    this.banner.nativeElement.style.display = 'none'
    this.ebanner.nativeElement.style.display = 'none'
    this.map.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
      if(feature.get("features").length == 1) {
        let object = feature.get("features")[0]

        this.name = object.get("name")
        this.type = object.get("type")
        this.accType = object.get("accType")

        if(object.get("type") == "Hotel") {
          this.nearbyStations = object.get("distances").slice(0, 3);
          this.link = object.get("link")
          this.phone = object.get("phone")
          this.banner.nativeElement.style.top = e.pixel[1] + "px"
          this.banner.nativeElement.style.left = e.pixel[0] + "px";
          this.banner.nativeElement.style.display = 'inherit'
        } else {
          this.ebanner.nativeElement.style.top = e.pixel[1] + "px"
          this.ebanner.nativeElement.style.left = e.pixel[0] + "px";
          this.ebanner.nativeElement.style.display = 'inherit'
        }
        

      } else {
        let coordinates = this.map.getCoordinateFromPixelInternal(e.pixel)
      
        this.map.setView(new View({center: coordinates, zoom: (this.map.getView().getZoom() as number) + 2, maxZoom: 20, minZoom: 8}))
      }

    this.map.on("movestart", () => {
      this.banner.nativeElement.style.display = 'none'
      this.ebanner.nativeElement.style.display = 'none'
    })

    })
  })
 }
}