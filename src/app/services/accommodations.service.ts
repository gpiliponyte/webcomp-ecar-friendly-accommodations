import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';


@Injectable({
    providedIn: 'root',
})
export class AccommodationService {
  constructor(private http: HttpClient) {
   }

   getAccommodations(){
    let queryParams = new HttpParams();
    queryParams = queryParams.append("pagesize", 1000); // HOW TO GET ALL OF THEM?
    return this.http.get<any>("https://api.tourism.testingmachine.eu/v1/Accommodation", {observe: 'body', params: queryParams}).pipe(map(resp => {
        
      console.log(resp.Items)
          let accommodations: any = []
  
          let list = resp.Items
  
  
          for(let el of list){
            if (el.GpsPoints?.position?.Latitude){
                accommodations.push({latitude: el.GpsPoints?.position?.Latitude, longitude: el.GpsPoints?.position?.Longitude, name: el.Shortname, accType: el?.AccoTypeId, accoDetail: el?.AccoDetail, all: el})
            }
          }
  
          return accommodations
        }
        ));
   }

   getEcharging(){
    let queryParams = new HttpParams();
    queryParams = queryParams.append("limit", -1);
    queryParams = queryParams.append("distinct", true);
    queryParams = queryParams.append("where", "sactive.eq.true");
    return this.http.get<any>("https://mobility.api.opendatahub.bz.it/v2/flat/EChargingStation", {observe: 'body', params: queryParams}).pipe(map(resp => {
        let chargingStations:any = []
  
        let list = resp.data
        console.log(resp.data)

        for(let el of list){
          chargingStations.push({id: el.Id, latitude: el.scoordinate.y, longitude: el.scoordinate.x, name: el.sname, available: el.savailable, scode: el?.scode, address: el.smetadata.address, accessType: el.smetadata.accessType, capacity: el.smetadata.capacity, city: el.smetadata.city, paymentInfo: el.smetadata.paymentInfo, reservable: el.smetadata.reservable})
        }

        return chargingStations

        }
        ));
   }

   requestStationPlugs(station_id: any) {

    return this.http.get<any>("https://mobility.api.opendatahub.bz.it/v2/flat/EChargingPlug?limit=-1&offset=0&where=sactive.eq.true,pcode.eq."+station_id+"&shownull=false", {observe: 'body'}).pipe(map(resp => 
    resp
        ));
  }

}