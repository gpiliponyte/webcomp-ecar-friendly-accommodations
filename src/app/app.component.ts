
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
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
import { FormControl } from '@angular/forms';


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
  address = ""
  accessType = ""
  capacity = ""
  city = ""
  paymentInfo = ""
  reservable = ""
  plugInfo: any = null
  all: any = null
  
  distanceTillEChargingStation = 1500
  accommodationFeatures: any = []
  nearbyStations: any = []

  @ViewChild("banner") banner!: ElementRef;
  @ViewChild("ebanner") ebanner!: ElementRef;

  @Input() language = 'en'
  @Input() centerCoordinates = [11.3548, 46.4983]

  accommodationTypesSelected = new FormControl();
  selectedAccommodations:any = [];
  accommodations: string[] = ["BedBreakfast", 'HotelPension', 'Farm', 'Camping', 'Youth', 'Mountain', 'Apartment', 'Not defined'];
  //accommodations: any[] = [{value: "BedBreakfast", id: 1}, {value: "HotelPension", id: 2}, {value: "HotelPension", id: 2}, 'Camping', 'Youth', 'Mountain', 'Apartment'];

  languageSelected = new FormControl()
  languages: any[] = [{value: "en", img: "assets/flag_en.svg"}, {value: "it", img: "assets/flag_it.svg"}, {value: "de", img: "assets/flag_de.svg"}];

  selected = {value: "en", img: "assets/flag_en.svg"}



  constructor(private accommodationService: AccommodationService){}


  onFilterApplied() {
    let layer = this.map.getAllLayers()[2]
    if(layer) {
      this.map.removeLayer(layer)
    }

    console.log(this.selectedAccommodations)
    console.log(this.accommodationFeatures[0].get("accType"))
    
    //@ts-ignore
    let featuresSelected = this.accommodationFeatures.filter(el => this.selectedAccommodations.includes(el.get("accType")) && el.get("distances")[0].distance < this.distanceTillEChargingStation)

    console.log(featuresSelected)
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
              src: 'assets/my_e_car_pic.svg',
              scale: 0.5
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

  onAccommodationSelectionChange(event: any) {
    console.log(event)
    this.selectedAccommodations = event
    //@ts-ignore
    // let featuresSelected = this.accommodationFeatures.filter(el => event.value.includes(el.get("accType")) && el.get("distances")[0].distance < this.distanceTillEChargingStation)

    // this.addLayer(COLOR.ACCOMMODATION, featuresSelected)
    // this.accommodationService.getAccommodationsByType(1).subscribe(el => console.log(el))
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
      center: transform(this.centerCoordinates, 'EPSG:4326', 'EPSG:3857'),
      zoom: 10, maxZoom: 20, minZoom: 8
    }),
    controls: []
  });

  this.map.addControl(new ZoomSlider({}))
  this.map.addControl(new ScaleLine({}))

  this.accommodationService.getEcharging().subscribe(items => {

    let points: { point: Point; item: { latitude: any; longitude: any; name: any; available: any; scode: any; }; }[] = []

    let features = []

    for(let item of items){
      let point = new Point(fromLonLat([item.longitude, item.latitude]))
      let feature = new Feature({geometry: point })
      points.push({point, item})
      feature.set("name", item.name)
      feature.set("type", "E-Charging Station")
      feature.set("address", item.address)
      feature.set("accessType", item.accessType)
      feature.set("capacity", item.capacity)
      feature.set("city", item.city)
      feature.set("paymentInfo", item.paymentInfo)
      feature.set("reservable", item.reservable)
      feature.set("scode", item.scode)
      
      features.push(feature)
    }

    this.addLayer(COLOR.ECHARGER, features)


    this.accommodationService.getAccommodations().subscribe(items => {

      let features = []

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
        feature.set("all", item.all)


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

      // let featuresSelected = features.filter(el => el.get("distances")[0].distance < this.distanceTillEChargingStation)

      // this.addLayer(COLOR.ACCOMMODATION, featuresSelected)

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
          this.all = object.get("all")
          this.banner.nativeElement.style.top = e.pixel[1] + "px"
          this.banner.nativeElement.style.left = e.pixel[0] + "px";
          this.banner.nativeElement.style.display = 'inherit'
        } else {
          //{address: el.smetadata.address, accessType: el.smetadata.accessType, capacity: el.smetadata.capacity, city: el.smetadata.city, paymentInfo: el.smetadata.paymentInfo, reservable: el.smetadata.reservable}
          this.accommodationService.requestStationPlugs(object.get("scode")).subscribe(el => {
            console.log(el.data[0])
            this.plugInfo = el
            this.address = object.get("address")
            this.accessType = object.get("accessType")
            this.capacity = object.get("capacity")
            this.city = object.get("city")
            this.paymentInfo = object.get("paymentInfo")
            this.reservable = object.get("reservable")
            this.ebanner.nativeElement.style.top = e.pixel[1] + "px"
            this.ebanner.nativeElement.style.left = e.pixel[0] + "px";
            this.ebanner.nativeElement.style.display = 'inherit'
          })
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