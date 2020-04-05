import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({name: 'statusFromNumber'})
export class StatusFromNumberPipe implements PipeTransform {
    transform(federalObject: any): string {
        // Check if eFileStatus is defined in return
        if (federalObject.status !== undefined) {
            if (_.includes([0, 1, 2, 3, 4, 5, 6], federalObject.status)) {
                return 'Transmitted';
            } else if (federalObject.status === 7) {
                if (federalObject.stateName !== undefined && federalObject.stateName !== '') {
                    if (federalObject.stateName.toLowerCase() === 'federal') {
                        return 'At IRS';
                    } else {
                        return 'At State';
                    }
                }
            } else if (federalObject.status === 8) {
                return 'Rejected';
            } else if (federalObject.status === 9) {
                return 'Accepted';
            } else if (federalObject.status === 21) {
                return 'Cancelled';
            /// for bank product
            } else if (federalObject.status === 17 || federalObject.status === 15 || federalObject.status === 16) {
                return 'Accepted';
            } else if (_.includes([10, 11, 12, 13, 18], federalObject.status)) {
                return 'Transmitted';
            } else if (federalObject.status === 14) {
                return 'Rejected';
            }

        }
    }
}

