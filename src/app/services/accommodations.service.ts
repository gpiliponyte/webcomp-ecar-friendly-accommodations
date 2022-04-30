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
                accommodations.push({latitude: el.GpsPoints?.position?.Latitude, longitude: el.GpsPoints?.position?.Longitude, name: el.Shortname, accType: el?.AccoTypeId, accoDetail: el?.AccoDetail})
            }
          }
  
          return [{
            visible: true,
            height: 25,
            width: 25,
            dataSource: accommodations
        }];
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
          chargingStations.push({latitude: el.scoordinate.y, longitude: el.scoordinate.x, name: el.sname, available: el.savailable, scode: el?.scode})
        }

        return [{
          visible: true,
          height: 25,
          width: 25,
          dataSource: chargingStations
        }];

        }
        ));
   }

  //  getAccommodationsNearEcharging(points: any, typeFilter = '1') {
  //   let queryParams = new HttpParams();
  //   queryParams = queryParams.append("pagesize", 1000); // HOW TO GET ALL OF THEM?
  //   queryParams = queryParams.append("typefilter", typeFilter);
  //   queryParams = queryParams.append("radius", 5000);


  //   return from(points).pipe(
  //   concatMap(entry => {
  //     let itemQueryParams = queryParams
  //     itemQueryParams = itemQueryParams.append("latitude", (entry as any).latitude);
  //     itemQueryParams = itemQueryParams.append("longitude", (entry as any).longitude);

  //     return this.http.get<any>("https://api.tourism.testingmachine.eu/v1/Accommodation", {observe: 'body', params: itemQueryParams})
  //   })
  //   );
  //  }
}