import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Feature } from "ol";
import ScaleLine from "ol/control/ScaleLine";
import ZoomSlider from "ol/control/ZoomSlider";
import { LineString, Point } from "ol/geom";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import Map from "ol/Map";
import { fromLonLat, transform } from "ol/proj";
import { Cluster, OSM, Vector } from "ol/source";
import { Fill, Icon, Stroke, Style, Text } from "ol/style";
import CircleStyle from "ol/style/Circle";
import View from "ol/View";
import { FetchDataService } from "./services/fetch-data.service";
import {
  Accommodation,
  AccommodationDetails,
  AccommodationNewType,
  AccommodationType,
  COLOR,
  compare,
  EChargingStation,
} from "./util/types";
import { FormControl } from "@angular/forms";
import { TRANSLATIONS } from "./util/translations";
import { Observable, of } from "rxjs";

enum Languages {
  en = "en",
  it = "it",
  de = "de",
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnChanges {
  public map!: Map;
  plugInfo: any = null;

  loading: boolean = true;

  currentEStation: EChargingStation | undefined;
  currentAccommodation: Accommodation | undefined;

  currentAccommodationDetails$: Observable<AccommodationDetails> | undefined;

  accommodationFeatures: any = [];
  nearbyStations: any = [];

  @ViewChild("banner") banner!: ElementRef;
  @ViewChild("ebanner") ebanner!: ElementRef;

  @Input() language: Languages = Languages.en;
  @Input() longitude = 11.3548;
  @Input() latitude = 46.4983;
  @Input() distanceInMeters = 1500;
  @Input() zoom = 10;
  @Input() minZoom = 8;
  @Input() maxZoom = 20;

  translations$: Observable<any> = of(TRANSLATIONS[this.language]);

  // ACCOMMODATION TYPE SELECTBOX
  accommodationTypesSelected = new FormControl();
  selectedAccommodations: any = [];
  accommodations: string[] = Object.values(AccommodationType);

  accommodationsNew: AccommodationNewType[] =
    Object.values(AccommodationNewType);

  // LANGUAGE SELECTBOX
  languageSelected = new FormControl();
  selected = { value: this.language, img: `assets/flag_${this.language}.svg` };
  languages: any[] = Object.values(Languages).map((lan) => {
    return { value: lan, img: `assets/flag_${lan}.svg` };
  });

  constructor(private fetchDataService: FetchDataService) {}

  switchLang(lang: Languages) {
    this.translations$ = of(TRANSLATIONS[lang]);
    if (this.currentAccommodation) {
      this.currentAccommodationDetails$ = of(this.currentAccommodation[lang]);
    }
  }

  onFilterApplied() {
    let layer = this.map.getAllLayers()[2];
    if (layer) {
      this.map.removeLayer(layer);
    }

    //@ts-ignore
    let featuresSelected = this.accommodationFeatures.filter((el) =>
        this.selectedAccommodations.includes(el.get("info").accType) &&
        el.get("distances")[0].distance < this.distanceInMeters
    );

    this.addLayer(COLOR.ACCOMMODATION, featuresSelected);
  }

  addLayer(color: any, features: any) {
    let source = new Vector({ features: features });

    let clusterSource = new Cluster({
      distance: 100,
      source: source,
    });

    let clusters = new VectorLayer({
      source: clusterSource,
      style: function (feature) {
        const size = feature.get("features").length;
        let styleCache: any = {};
        let style = styleCache[size];
        if (!style) {
          style = new Style({
            image:
              size > 0
                ? new CircleStyle({
                    radius: size > 1 ? size * 0.05 + 10 : 5,
                    stroke: new Stroke({
                      color: "#fff",
                      width: 2,
                    }),
                    fill: new Fill({
                      color: color,
                    }),
                  })
                : new Icon({
                    opacity: 1,
                    src: "assets/pin_char.svg",
                    scale: 0.01,
                  }),
            text: new Text({
              text: size > 1 ? size.toString() : "",
              fill: new Fill({
                color: "#fff",
              }),
            }),
          });
          styleCache[size] = style;
        }
        return style;
      },
    });

    this.map.addLayer(clusters);
  }

  onAccommodationSelectionChange(event: any) {
    this.selectedAccommodations = event;
  }

  ngOnChanges(changes: any): void {
    if ("language" in changes) {
      this.translations$ = of(TRANSLATIONS[this.language]);
    }
  }

  hidePopover() {
    this.banner.nativeElement.style.display = "none";
    this.ebanner.nativeElement.style.display = "none";
  }

  ngOnInit(): void {
    this.map = new Map({
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      target: "map",
      view: new View({
        center: transform(
          [this.longitude, this.latitude],
          "EPSG:4326",
          "EPSG:3857"
        ),
        zoom: this.zoom,
        maxZoom: this.maxZoom,
        minZoom: this.minZoom,
      }),
      controls: [],
    });

    this.map.addControl(new ZoomSlider({}));
    this.map.addControl(new ScaleLine({}));

    this.fetchDataService.getEcharging().subscribe((items) => {
      let points: { point: Point; item: EChargingStation }[] = [];

      let features = [];

      for (let item of items) {
        let point = new Point(fromLonLat([item.longitude, item.latitude]));
        let feature = new Feature({ geometry: point });
        feature.set("info", item);
        points.push({ point, item });

        features.push(feature);
      }

      this.addLayer(COLOR.ECHARGER, features);

      this.fetchDataService.getAccommodations().subscribe((items) => {
        let features = [];
        console.time("answer time");

        for (let item of items) {
          let point = new Point(fromLonLat([item.longitude, item.latitude]));

          let feature = new Feature({ geometry: point });
          feature.set("info", item);

          let distancesToEchargingStations = [];

          for (let ep of points) {
            let line = new LineString([
              ep.point.getCoordinates(),
              point.getCoordinates(),
            ]);

            distancesToEchargingStations.push({
              station: ep,
              distance: line.getLength(),
            });
          }

          distancesToEchargingStations.sort(compare);

          feature.set("distances", distancesToEchargingStations);

          features.push(feature);
        }

        console.timeEnd("answer time");

        this.accommodationFeatures = features;

        this.loading = false;
      });
    });

    this.map.on("click", (e) => {

      this.hidePopover()

      this.map.forEachFeatureAtPixel(e.pixel, (feature) => {
        let settingBarHeight =
          document.getElementById("settings")?.clientHeight;
        let containerHeight =
          document.getElementById("main-container")?.clientHeight;

        if (feature.get("features").length == 1) {
          let object = feature.get("features")[0];

          if (object.get("info").type == "Hotel") {
            this.nearbyStations = object.get("distances").slice(0, 3);
            this.currentAccommodation = object.get("info");
            if (this.currentAccommodation) {
              this.currentAccommodationDetails$ = of(
                this.currentAccommodation[this.language]
              );
            }

            if (settingBarHeight && containerHeight) {
              this.banner.nativeElement.style.top =
                settingBarHeight + 10 + "px";
              this.banner.nativeElement.style.left = "10px";
              this.banner.nativeElement.style.display = "inherit";
              this.banner.nativeElement.style.height =
                containerHeight - settingBarHeight - 50 + "px";
            }
          } else {
            
            this.fetchDataService
              .requestStationPlugs(object.get("info").scode)
              .subscribe((el) => {
                console.log(el);
                this.plugInfo = el;
                this.currentEStation = object.get("info");

                if (settingBarHeight && containerHeight) {
                  this.ebanner.nativeElement.style.top =
                    settingBarHeight + 10 + "px";
                  this.ebanner.nativeElement.style.left = "10px";
                  this.ebanner.nativeElement.style.display = "inherit";
                  this.ebanner.nativeElement.style.height =
                    containerHeight - settingBarHeight - 40 + "px";
                }
              });
          }
        } else {
          let coordinates = this.map.getCoordinateFromPixelInternal(e.pixel);

          this.map.setView(
            new View({
              center: coordinates,
              zoom: (this.map.getView().getZoom() as number) + 2,
              maxZoom: this.maxZoom,
              minZoom: this.minZoom,
            })
          );
        }

        this.map.on("movestart", () => {
          this.hidePopover()
        });
      });
    });
  }
}
