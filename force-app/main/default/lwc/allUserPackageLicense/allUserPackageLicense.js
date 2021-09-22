// import { LightningElement, wire } from 'lwc';
import { LightningElement ,api, wire, track} from 'lwc';
import getUserList from '@salesforce/apex/AnalysePackageLicenses.getUserList';
import findUsers from '@salesforce/apex/AnalysePackageLicenses.findUsers';
import getSpecificPackageLicense from '@salesforce/apex/AnalysePackageLicenses.getSpecificPackageLicense';
import getFirstPackageNamespacePrefix from '@salesforce/apex/AnalysePackageLicenses.getFirstPackageNamespacePrefix';

// Import message service features required for subscribing and the message channel
import { subscribe, MessageContext } from 'lightning/messageService';
import RECORD_SELECTED_CHANNEL from '@salesforce/messageChannel/Record_Selected__c';

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

export default class AllUserPackageLicense extends LightningElement {
    //start
    columns = COLUMNS;
    @track data;
    @track firstPackageName;
    @track hrefdata;
    error;

    // adding for LMS
    subscription = null;
    PackageName = '';
    SpecificPackageLicense = '';
    
    // To get the first Package Name upon LAUNCH
    @wire(getFirstPackageNamespacePrefix)
    myFirstPackageName(result) {
        if (result.data) {
            // if (this.PackageName) { this.firstPackageName = this.PackageName; console.log("firstPackageName changed") }
            // else { this.firstPackageName = result.data[0].NamespacePrefix; console.log("firstPackageName initialized") }
            this.firstPackageName = result.data[0].NamespacePrefix;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.firstPackageName = undefined;
        }
       }

    // Get Allowed and Used Package License nunbers to print on top of the USER list view    
    @wire(getSpecificPackageLicense, {packageKey: '$PackageName' , ifPackageKeyNull: '$firstPackageName'})
    myPackageLicenses(result) {
        if (result.data) {
            // console.log('if result');
            // console.log(result.data[0].AllowedLicenses);
            this.SpecificPackageLicense = result.data[0];
            // console.log("The Allowed License : " + this.SpecificPackageLicense.AllowedLicenses);
            // console.log("The Used License : " + this.SpecificPackageLicense.UsedLicenses);
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.SpecificPackageLicense = undefined;
            // console.log('if error');
        }
       }

    // Working getUserList
    @wire(getUserList, {packageKey: '$PackageName' , ifPackageKeyNull: '$firstPackageName'})
    myUsers(result) {
     if (result.data) {
        this.data = result;
        // console.log("hitting getUserList() !");
        // console.log(result.data[0]);
        // console.log(this.data)
        // Start mapping
        let currentData = [];
        // console.log("result data : " + result.data);
        result.data.forEach((row) => {
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
            if (row.Profile.UserLicense) { rowData.UsersProfileUserLicenseName = row.Profile.UserLicense.Name; }
            currentData.push(rowData);
            });
        this.data = currentData;
        // console.log("license : " + this.data);
        // Stop Mapping 
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
        let searchingterms = event.target.value;
        // const passfirstPackageName = this.firstPackageName;
        let passfirstPackageName = this.firstPackageName;
        // console.log("firstPackageName changed confirmed : " + passfirstPackageName);
        // if (this.PackageName) {
        //     passfirstPackageName = this.PackageName;
        // } else {
        //     passfirstPackageName = this.firstPackageName;
        // }
        // console.log(searchingterms + " and " + passfirstPackageName)
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.delayTimeout = setTimeout(() => {
            findUsers({ searchKey: searchingterms , ifPackageKeyNull: passfirstPackageName})
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
                        if (row.Profile.UserLicense) { rowData.UsersProfileUserLicenseName = row.Profile.UserLicense.Name; }
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

    // By using the MessageContext @wire adapter, unsubscribe will be called
    // implicitly during the component descruction lifecycle.
    @wire(MessageContext)
    messageContext;
    // Encapsulate logic for LMS subscribe.
    subscribeToMessageChannel() {
        this.subscription = subscribe(
            this.messageContext,
            RECORD_SELECTED_CHANNEL,
            (message) => this.handleMessage(message)
        );
    }
    // Handler for message received by component
    handleMessage(message) {
        this.PackageName = message.recordId;
        // console.log("All User Package License : " + this.PackageName);
        this.firstPackageName = this.PackageName;
        // console.log("firstPackageName changed : " + this.firstPackageName);

    }
    // Standard lifecycle hooks used to sub/unsub to message channel
    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    // CSV EXPORT TEST 1
    // reference - https://www.salesforcemind.com/2019/09/salesforce-export-to-excel-with.html
    exportToCSV() {  
        // let columnHeader = ["Name", "Email"];  // This array holds the Column headers to be displayd
        // Id, Name, IsActive, Alias, Username, ProfileId, UserRoleId, Profile.Name, UserRole.Name
        let columnHeader = ["Id", "Name", "IsActive", "Alias", "Username", "ProfileId", "UserRoleId"];
        let jsonKeys = ["Id", "Name", "IsActive", "Alias", "Username", "ProfileId", "UserRoleId"]; // This array holds the keys in the json data  
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

