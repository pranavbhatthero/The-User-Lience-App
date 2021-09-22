// import { LightningElement, wire } from 'lwc';
import { LightningElement ,api, wire, track} from 'lwc';
import findUsersListWithNoOEM from '@salesforce/apex/AnalysePackageLicenses.findUsersListWithNoOEM';
import getUsersListWithNoOEM from '@salesforce/apex/AnalysePackageLicenses.getUsersListWithNoOEM';

// Id, Name, IsActive, Alias, Username, ProfileId, UserRoleId, Profile.Name, UserRole.Name, Profile.UserLicense.Name
const COLUMNS = [
    // { label: 'Id', fieldName: 'Id', Type: 'text'},
    { label: 'Full Name', fieldName: 'Name', Type: 'text'},
    { label: 'IsActive', fieldName: 'IsActive', Type: 'boolean'},
    // { label: 'Alias', fieldName: 'Alias', Type: 'text'},
    { label: 'Username', fieldName: 'Username', Type: 'text'},
    // { label: 'ProfileId', fieldName: 'ProfileId', Type: 'text'},
    { label: 'Profile', fieldName: 'UsersProfileName', Type: 'text'},
    // { label: 'UserRoleId', fieldName: 'UserRoleId', Type: 'text'},
    { label: 'Role', fieldName: 'UsersUserRoleName', Type: 'text'},
    // Profile.UserLicense.Name
    { label: 'License', fieldName: 'UsersProfileUserLicenseName', Types: 'text'}
];

/** The delay used when debouncing event handlers before invoking Apex. */
const DELAY = 350;

export default class AllUsersWithoutPackageOEMLicense extends LightningElement {
        //start
        columns = COLUMNS;
        @track data;
        @track hrefdata;
        error;
    
        // Get Allowed and Used Package License nunbers to print on top of the USER list view    
        @wire(getUsersListWithNoOEM)
        myUsersWithoutOEM(result) {
            if (result.data) {
                // console.log('if result getUsersListWithNoOEM ');
                // console.log(result.data[0]);
                this.data = result.data;
                // Start mapping
                let currentData = [];
                // console.log("result data : " + result.data);
                this.data.forEach((row) => {
                    let rowData = {};
                    // rowData.Id = row.Id; 
                    rowData.Name = row.Name; rowData.IsActive = row.IsActive;  
                    // rowData.Alias = row.Alias; 
                    rowData.Username = row.Username; 
                    // Profile related data
                    if (row.Profile) { rowData.UsersProfileName = row.Profile.Name; }
                    // UserRole related data
                    if (row.UserRole) { rowData.UsersUserRoleName = row.UserRole.Name; }
                    // License related data
                    if (row.Profile) { rowData.UsersProfileUserLicenseName = row.Profile.UserLicense.Name; }
                    currentData.push(rowData);
                    });
                this.data = currentData;
                // Stop Mapping
                this.error = undefined;
                } else if (result.error) {
                    this.error = result.error;
                    this.data = undefined;
                    // console.log('if erorr getUsersListWithNoOEM ');
                }
        }
        
        handleKeyChange(event) {
            // Debouncing this method: Do not actually invoke the Apex call as long as this function is
            // being called within a delay of DELAY. This is to avoid a very large number of Apex method calls.
            window.clearTimeout(this.delayTimeout);
            const searchKey = event.target.value;
            // console.log(searchKey + " for all packages")
            // console.log("this data : " + this.data);
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            this.delayTimeout = setTimeout(() => {
                findUsersListWithNoOEM({ searchKey })
                    .then((result) => {
                        this.data = result;
                        // console.log("this result data : " + this.data)
                        // Start mapping
                        let currentData = [];
                        // console.log("result data : " + result.data);
                        this.data.forEach((row) => {
                            let rowData = {};
                            // rowData.Id = row.Id; 
                            rowData.Name = row.Name; rowData.IsActive = row.IsActive;  
                            // rowData.Alias = row.Alias; 
                            rowData.Username = row.Username; 
                            // Profile related data
                            if (row.Profile) { rowData.UsersProfileName = row.Profile.Name; }
                            // UserRole related data
                            if (row.UserRole) { rowData.UsersUserRoleName = row.UserRole.Name; }
                            // License related data
                            if (row.Profile) { rowData.UsersProfileUserLicenseName = row.Profile.UserLicense.Name; }
                            currentData.push(rowData);
                            });
                        this.data = currentData;
                        // Stop Mapping
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
            // Id, Name, IsActive, Alias, Username, ProfileId, UserRoleId, Profile.Name, UserRole.Name
            let columnHeader = ["Id", "Name", "IsActive", "Alias", "Username", "ProfileId", "UserRoleId", "Profile.Name", "UserRole.Name"];
            let jsonKeys = ["Id", "Name", "IsActive", "Alias", "Username", "ProfileId", "UserRoleId", "Profile.Name", "UserRole.Name"]; // This array holds the keys in the json data  
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


    // // this method validates the data and creates the csv file to download
    // // reference - https://www.salesforcecodecrack.com/2019/05/export-data-as-csv-file-with-javascript.html
    // downloadCSVFile() {    
    // }

