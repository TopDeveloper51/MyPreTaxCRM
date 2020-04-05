import { Component, Pipe, PipeTransform } from '@angular/core';


@Pipe({
    name: 'phone'
})
export class PhonePipe {
    transform(val) {
        val = val ? val.replace('+', '') : '';
        var reg = /^\d+$/;
        if (val !== undefined && val !== null) {
            if (val.toLowerCase() != 'anonymous' && val.toLowerCase() != 'restricted' && reg.test(val)) {
                var val1 = val.substring(0, val.length - 10);
                var val2 = val.substring(val.length - 10);
                var s2 = ("" + val2).replace(/\D/g, '');
                var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
                return (!m) ? null : (((val1) ? "+" + val1 + " " : "") + "(" + m[1] + ") " + m[2] + "-" + m[3]);
            } else {
                return val;
            }
        } else {
            return '';
        }
    }
}

//Pipe for transforming the seconds to hours, minutes and seconds
@Pipe({
    name: 'hhmmss',
})

export class HourMinuteSecondPipe implements PipeTransform {
    transform(totalSeconds: any, ishhmm: boolean) {
        if (totalSeconds != undefined) {
            var hours = Math.floor(totalSeconds / 3600);
            var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
            var seconds = totalSeconds - (hours * 3600) - (minutes * 60);

            // round seconds
            seconds = Math.round(seconds * 100) / 100
            if (ishhmm !== undefined && ishhmm == true) {
                // var result = (hours < 10 ? "0" + hours : hours);
                let result: any = hours;
                result += ":" + (minutes < 10 ? "0" + minutes : minutes);
                return result
            } else {
                // var result = (hours < 10 ? "0" + hours : hours);
                let result: any = hours;
                result += ":" + (minutes < 10 ? "0" + minutes : minutes);
                result += ":" + (seconds < 10 ? "0" + seconds : seconds);
                return result
            }

        }
    }
}