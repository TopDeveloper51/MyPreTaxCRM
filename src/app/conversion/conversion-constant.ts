export class APINAME {
    
    public static get CONVERSION_REPORT(): string { return '/conversionReport'; }

    public static get CONVERSION_JOB_DETAILS(): string { return '/conversionjobDetails'; }

    public static get DOWNLOAD_PDF(): string { return '/downloadPdf'; }

    public static get CONVERSION_SYNC_MISMATCH_REPORT(): string { return '/getConversionMismatchReport'; }
}


export class ENUM {
    public static StatusDisplay = {
        0: 'Open',
        1: 'PrintInProcess',
        2: 'PrintFailed',
        3: 'ConversionReady',
        4: 'ConversionInProcess',
        5: 'ConversionFailed',
        6: 'Success',
        7: 'Infected',
        8: 'UploadInterrupted',
    };

    public static PrintStatusDisplay =  {
        0: 'Open',
        1: 'RestoreInProcess',
        2: 'RestoreFailed',
        3: 'PrintInProcess',
        4: 'PrintFailed',
        5: 'CleanupInProcess',
        6: 'CleanupFailed',
        7: 'Success',
    };

    public static ConversionStatusDisplay = {
        0: 'Open',
        1: 'InProcess',
        2: 'Success',
        3: 'Failed',
    };

}


