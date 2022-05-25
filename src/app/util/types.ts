export enum AccommodationType {
  HotelPension = 'HotelPension',
  BedBreakfast = 'BedBreakfast',
  Farm = 'Farm',
  Camping = 'Camping',
  Youth = 'Youth',
  Mountain = 'Mountain',
  Apartment = 'Apartment',
}

export enum AccommodationNewType {
  Hotel = 'Hotel',
  BedAndBreakfast = 'BedAndBreakfast',
  Hostel = 'Hostel',
  Campground = 'Campground',
  NotDefined = 'Not Defined'
}

export interface EChargingStation {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  type: string;
  accessType: string;
  capacity: string;
  address: string;
  city: string;
  scode: string;
  paymentInfo: string;
  reservable: boolean;
}

export interface AccommodationDetails {
  address: string;
  city: string;
  website: string;
  phone: string;
}

export interface Accommodation {
  latitude: number;
  longitude: number;
  name: string;
  type: string;
  accType: string;
  accoCat: string;
  altitude: number;
  en: AccommodationDetails;
  it: AccommodationDetails;
  de: AccommodationDetails;
}

export interface Plug {
  id: number;
  outletTypeCode: string;
  maxPower: number;
  minCurrent: number;
  maxCurrent: number;
}

export enum COLOR {
  ACCOMMODATION = '#3f51b5',
  ECHARGER = '#8acd32',
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'translateProperty',
})
export class TranslatePropertyPipe implements PipeTransform {
  transform(value: any, property: any, lang: any): any {
    return value[lang][property];
  }
}

@Pipe({
  name: 'distance',
})
export class DistancePipe implements PipeTransform {
  transform(value: any): any {
    if (value < 1000) {
      return value.toFixed(0) + ' m';
    } else {
      return (value / 1000).toFixed(1) + ' km';
    }
  }
}

export function compare(a: any, b: any) {
  if (a.distance < b.distance) {
    return -1;
  }
  if (a.distance > b.distance) {
    return 1;
  }
  return 0;
}
