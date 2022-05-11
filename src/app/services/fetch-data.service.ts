import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Accommodation, EChargingStation, Plug } from './types';

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
    queryParams = queryParams.append('fields', 'GpsPoints,Shortname,AccoTypeId,AccoCategory,Altitude,AccoDetail');
    
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
                address: item?.AccoDetail?.en?.Street,
                city: item?.AccoDetail?.en?.City,
                website: item?.AccoDetail?.en?.Website,
                phone: item?.AccoDetail?.en?.Phone,
                altitude: item?.Altitude,
              };
              accommodations.push(accommodation);
            }
          }

          return accommodations;
        })
      );
  }

  getAccommodationsByType(type: number) {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('typefilter', type); // HOW TO GET ALL OF THEM?
    queryParams = queryParams.append('pagesize', 100);
    return this.http
      .get<any>(ACCOMMODATION_URL, { observe: 'body', params: queryParams })
      .pipe(
        map((resp) => {
          console.log(resp.Items);
          let accommodations: any = [];

          for (let item of resp.Items) {
            if (item.GpsPoints?.position?.Latitude) {
              accommodations.push({
                latitude: item.GpsPoints?.position?.Latitude,
                longitude: item.GpsPoints?.position?.Longitude,
                name: item.Shortname,
                accType: item?.AccoTypeId,
                accoDetail: item?.AccoDetail,
                all: item,
              });
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
    queryParams = queryParams.append('where', 'sactive.eq.true');
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

  requestStationPlugs(station_id: any): Observable<Plug[]> {
    return this.http
      .get<any>(
        ECHARGING_URL +
          '/EChargingPlug?limit=-1&offset=0&where=sactive.eq.true,pcode.eq.' +
          station_id +
          '&shownull=false',
        { observe: 'body' }
      )
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
