import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Accommodation, EChargingStation, Plug } from '../util/types';

const ACCOMMODATION_URL =
  'https://api.tourism.testingmachine.eu/v1/Accommodation';
const ECHARGING_URL = 'https://mobility.api.opendatahub.bz.it/v2/flat';

@Injectable({
  providedIn: 'root',
})
export class FetchDataService {
  constructor(private http: HttpClient) {}

  getAccommodations(): Observable<Accommodation[]> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('pagesize', 10000); // HOW TO GET ALL OF THEM?
    queryParams = queryParams.append(
      'fields',
      'GpsPoints,Shortname,AccoTypeId,AccoCategory,Altitude,AccoDetail'
    );

    return this.http
      .get<any>(ACCOMMODATION_URL, { observe: 'body', params: queryParams })
      .pipe(
        map((resp) => {
          console.log(resp.Items);
          let accommodations: Accommodation[] = [];

          for (let item of resp.Items) {
            if (item.GpsPoints?.position?.Latitude) {
              let accommodation: Accommodation = {
                latitude: item.GpsPoints?.position?.Latitude,
                longitude: item.GpsPoints?.position?.Longitude,
                name: item?.Shortname,
                type: 'Hotel',
                accType: item?.AccoTypeId,
                accoCat: item?.AccoCategory?.Id,
                altitude: item?.Altitude,
                en: {
                  address: item?.AccoDetail?.en?.Street,
                  city: item?.AccoDetail?.en?.City,
                  website: item?.AccoDetail?.en?.Website,
                  phone: item?.AccoDetail?.en?.Phone,
                },
                it: {
                  address: item?.AccoDetail?.it?.Street,
                  city: item?.AccoDetail?.it?.City,
                  website: item?.AccoDetail?.it?.Website,
                  phone: item?.AccoDetail?.it?.Phone,
                },
                de: {
                  address: item?.AccoDetail?.de?.Street,
                  city: item?.AccoDetail?.de?.City,
                  website: item?.AccoDetail?.de?.Website,
                  phone: item?.AccoDetail?.de?.Phone,
                },
              };
              accommodations.push(accommodation);
            }
          }

          return accommodations;
        })
      );
  }

  getEcharging(): Observable<EChargingStation[]> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('limit', -1);
    queryParams = queryParams.append('distinct', true);
    queryParams = queryParams.append('where', 'sactive.eq.true,scoordinate.bbi.(10.38180,46.21977,12.47797,47.09215,4326)');

    return this.http
      .get<any>(ECHARGING_URL + '/EChargingStation', {
        observe: 'body',
        params: queryParams,
      })
      .pipe(
        map((resp) => {
          let chargingStations: EChargingStation[] = [];

          console.log(resp.data);

          for (let item of resp.data) {
            let eChargingStation: EChargingStation = {
              id: item?.Id,
              latitude: item?.scoordinate?.y,
              longitude: item?.scoordinate?.x,
              name: item?.sname,
              type: 'E-Charging Station',
              accessType: item?.smetadata?.accessType,
              capacity: item?.smetadata?.capacity,
              address: item?.smetadata?.address,
              city: item?.smetadata?.city,
              scode: item?.scode,
              paymentInfo: item?.smetadata?.paymentInfo,
              reservable: item?.smetadata?.reservable,
            };
            chargingStations.push(eChargingStation);
          }

          return chargingStations;
        })
      );
  }

  sparkqlHelper(type: string) {
    return `
    {
      SELECT ("${type}" as ?type) ?nameDe ?nameIt ?nameEn ?altitude ?longitude ?latitude
        WHERE {
        ?h a schema:${type} ;   
              schema:name ?nameDe ;    
              schema:name ?nameIt ; 
              schema:name ?nameEn ; 
              schema:geo/schema:elevation ?altitude ;
              schema:geo/schema:longitude ?longitude ;
              schema:geo/schema:latitude ?latitude .
      
        FILTER (lang(?nameDe) = 'de')
        FILTER (lang(?nameIt) = 'it')
        FILTER (lang(?nameEn) = 'en')
        }
    }
    `
  }

  sparkql(): Observable<Accommodation[]> {
    let headers: HttpHeaders = new HttpHeaders({
      'Content-type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    });

    let typesOfAccommodation = ['Hotel', 'Hostel', 'Campground', 'BedAndBreakfast']

    let unionOfQueries = ""

    for(let i = 0; i<typesOfAccommodation.length; i++){
      unionOfQueries = unionOfQueries + this.sparkqlHelper(typesOfAccommodation[i])
      if(i < typesOfAccommodation.length -1) {
        unionOfQueries = unionOfQueries + "\n UNION \n"
      }

  }

    let searchQuery = `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX schema: <http://schema.org/>
    PREFIX geo: <http://www.opengis.net/ont/geosparql#>
    PREFIX : <http://noi.example.org/ontology/odh#>

    SELECT * WHERE
    {
      ${unionOfQueries}
    }
    `

    console.log(searchQuery)


    let params = new HttpParams();
    params = params.append('query', searchQuery);
    params = params.append('format', 'json');


    return this.http.get('https://sparql.opendatahub.bz.it/portal/sparql', {params, headers}).pipe(map((resp: any) => {
      console.log(resp.results.bindings)
          let accommodations: Accommodation[] = [];

          for (let item of resp.results.bindings) {
              let accommodation: Accommodation = {
                latitude: item.latitude.value,
                longitude: item.longitude.value,
                name: item.nameDe.value,
                type: 'Hotel',
                accType: item.type.value,
                accoCat: "accoCat",
                altitude: item.altitude.value,
                en: {
                  address: "street",
                  city: "city",
                  website: "website",
                  phone: "phone"
                },
                it: {
                  address: "street",
                  city: "city",
                  website: "website",
                  phone: "phone"
                },
                de: {
                  address: "street",
                  city: "city",
                  website: "website",
                  phone: "phone"
                },
              };
              accommodations.push(accommodation);
            }
          return accommodations
    }))
  }

  requestStationPlugs(station_id: any): Observable<Plug[]> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('limit', -1);
    queryParams = queryParams.append('offset', 0);
    queryParams = queryParams.append(
      'where',
      'sactive.eq.true,pcode.eq.' + station_id
    );
    queryParams = queryParams.append('shownull', false);
    return this.http
      .get<any>(ECHARGING_URL + '/EChargingPlug', {
        observe: 'body',
        params: queryParams,
      })
      .pipe(
        map((resp) => {
          let plugs: Plug[] = [];
          for (let item of resp.data) {
            let plug = {
              id: item?.smetadata?.outlets[0]?.id,
              outletTypeCode: item?.smetadata?.outlets[0]?.outletTypeCode,
              maxPower: item?.smetadata?.outlets[0]?.maxPower,
              minCurrent: item?.smetadata?.outlets[0]?.minCurrent,
              maxCurrent: item?.smetadata?.outlets[0]?.maxCurrent,
            };

            plugs.push(plug);
          }
          return plugs;
        })
      );
  }
}
