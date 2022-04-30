export interface Accommodation {
    GpsPoints: {
        position: {
            Latitude: number,
            Longitude: number
        }
    },
    Shortname: string,
    accType: string
  }

export interface AccResponse {
    Items: Accommodation[]
}

export enum AccommodationType {
  HotelPension = 'HotelPension',
  BedBreakfast = 'BedBreakfast',
  Farm = 'Farm',
  Camping = 'Camping',
  Youth = 'Youth',
  Mountain = 'Mountain',
  Apartment = 'Apartment'
}

export enum COLOR {
  ACCOMMODATION = '#3399CC',
  ECHARGER = '#32CD32'
}

import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'distance'
})
export class DistancePipe implements PipeTransform {
     transform(value: any): any {
        if (value < 1000) {
          return value.toFixed(0) + " m"
        } 
        else {
          return (value / 1000).toFixed(1) + " km"
        }
      }
 }

 export function compare(a:any, b: any) {
  if ( a.distance < b.distance ){
    return -1;
  }
  if ( a.distance > b.distance ){
    return 1;
  }
  return 0;
}