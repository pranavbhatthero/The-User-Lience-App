// import { LightningElement, wire } from 'lwc';
import { LightningElement ,api, wire, track} from 'lwc';
import findPackages from '@salesforce/apex/AnalysePackageLicenses.findPackages';
import getPackageLicense from '@salesforce/apex/AnalysePackageLicenses.getPackageLicense';

// Id, NamespacePrefix, AllowedLicenses, UsedLicenses, Status, IsProvisioned, CreatedDate, ExpirationDate, LastModifiedDate
const COLUMNS = [
    { label: 'Id', fieldName: 'Id', Type: 'text'},
    { label: 'NamespacePrefix', fieldName: 'NamespacePrefix', Type: 'text'},
    { label: 'AllowedLicenses', fieldName: 'AllowedLicenses', Type: 'text'},
    { label: 'UsedLicenses', fieldName: 'UsedLicenses', Type: 'text'},
    { label: 'Status', fieldName: 'Status', Type: 'text'},
    { label: 'IsProvisioned', fieldName: 'IsProvisioned', Type: 'text'},
    { label: 'CreatedDate', fieldName: 'CreatedDate', Type: 'text'},
    { label: 'ExpirationDate', fieldName: 'ExpirationDate', Type: 'text'},
    { label: 'LastModifiedDate', fieldName: 'LastModifiedDate', Type: 'text'},
];
/** The delay used when debouncing event handlers before invoking Apex. */
const DELAY = 350;

export default class AllInstalledPackagesDetailed extends LightningElement {
        //start
        columns = COLUMNS;
        @track data;
        @track hrefdata;
        error;
    
        // Get Allowed and Used Package License nunbers to print on top of the USER list view    
        @wire(getPackageLicense)
        myPackageLicenses(result) {
            if (result.data) {
                // console.log('if result');
                // console.log(result.data[0].AllowedLicenses);
                this.data = result.data;
                this.error = undefined;
            } else if (result.error) {
                this.error = result.error;
                this.data = undefined;
            }
           }
        
        handleKeyChange(event) {
            // Debouncing this method: Do not actually invoke the Apex call as long as this function is
            // being called within a delay of DELAY. This is to avoid a very large number of Apex method calls.
            window.clearTimeout(this.delayTimeout);
            const searchKey = event.target.value;
            console.log(searchKey + " for all packages")
            // console.log("this data : " + this.data);
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            this.delayTimeout = setTimeout(() => {
                findPackages({ searchKey })
                    .then((result) => {
                        this.data = result;
                        // console.log("this result data : " + this.data)
                        this.error = undefined;
                    })
                    .catch((error) => {
                        this.error = error;
                        this.data = undefined;
                    });
            }, DELAY);
        }

        // CSV EXPORT TEST 1
        // reference - https://www.salesforcemind.com/2019/09/salesforce-export-to-excel-with.html
        exportToCSV() {  
            // let columnHeader = ["Name", "Email"];  // This array holds the Column headers to be displayd
            // Id, NamespacePrefix, AllowedLicenses, UsedLicenses, Status, IsProvisioned, CreatedDate, ExpirationDate, LastModifiedDate
            let columnHeader = ["Id", "NamespacePrefix", "AllowedLicenses", "UsedLicenses", "Status", "IsProvisioned", "CreatedDate", "ExpirationDate", "LastModifiedDate"];
            let jsonKeys = ["Id", "NamespacePrefix", "AllowedLicenses", "UsedLicenses", "Status", "IsProvisioned", "CreatedDate", "ExpirationDate", "LastModifiedDate"]; // This array holds the keys in the json data  
            var jsonRecordsData = this.data;  
            let csvIterativeData;  
            let csvSeperator  
            let newLineCharacter;  
            csvSeperator = ",";  
            newLineCharacter = "\n";  
            csvIterativeData = "";  
            csvIterativeData += columnHeader.join(csvSeperator);  
            csvIterativeData += newLineCharacter;  
            for (let i = 0; i < jsonRecordsData.length; i++) {  
              let counter = 0;  
              for (let iteratorObj in jsonKeys) {  
                let dataKey = jsonKeys[iteratorObj];  
                if (counter > 0) {  csvIterativeData += csvSeperator;  }  
                if (  jsonRecordsData[i][dataKey] !== null &&  
                  jsonRecordsData[i][dataKey] !== undefined  
                ) {  csvIterativeData += '"' + jsonRecordsData[i][dataKey] + '"';  
                } else {  csvIterativeData += '""';  
                }  
                counter++;  
              }  
              csvIterativeData += newLineCharacter;  
            }  
            // console.log("csvIterativeData", csvIterativeData);  
            this.hrefdata = "data:text/csv;charset=utf-8," + encodeURI(csvIterativeData);  
          }
}
    
    