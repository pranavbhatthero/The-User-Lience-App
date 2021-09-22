// import { LightningElement, wire } from 'lwc';
import { LightningElement ,api, wire, track} from 'lwc';
import allLicenseSummarywithoutOEM from '@salesforce/apex/AnalysePackageLicenses.allLicenseSummarywithoutOEM';
// import getSpecificPackageLicense from '@salesforce/apex/AnalysePackageLicenses.getSpecificPackageLicense';
// import getFirstPackageNamespacePrefix from '@salesforce/apex/AnalysePackageLicenses.getFirstPackageNamespacePrefix';

// Import message service features required for subscribing and the message channel
// import { subscribe, MessageContext } from 'lightning/messageService';
// import RECORD_SELECTED_CHANNEL from '@salesforce/messageChannel/Record_Selected__c';

// License, NamespacePrefix, IsActive, Quantity
// Profile.UserLicense.Name License, UserPackageLicense.PackageLicense.NamespacePrefix NamespacePrefix, IsActive, Count(Id) Quantity
const COLUMNS = [
    { label: 'License', fieldName: 'License', Type: 'text'},
    // { label: 'NamespacePrefix', fieldName: 'NamespacePrefix', Type: 'text'},
    { label: 'IsActive', fieldName: 'IsActive', Type: 'text'},
    { label: 'Count', fieldName: 'Quantity', Type: 'text', cellAttributes: { alignment: 'center' } }
    // Profile.UserLicense.Name
    // { label: 'License', fieldName: 'License', Types: 'text'}
];

/** The delay used when debouncing event handlers before invoking Apex. */
const DELAY = 350;

export default class AllLicenseDetailsWithoutOEM extends LightningElement {
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
            
            // Working getUserList
            // @wire(getUserList, {packageKey: '$PackageName' , ifPackageKeyNull: '$firstPackageName'})
            // @wire(getUsersByProfiles , {packageKey: '$PackageName' , ifPackageKeyNull: '$firstPackageName'} )
            @wire(allLicenseSummarywithoutOEM)
            myUsersProfiles(result) {
             if (result.data) {
                this.data = result;
                console.log("hitting getUsersByProfiles() !");
                // console.log(result.data);
                // console.log("getUsersByProfiles() with " + this.firstPackageName);
                console.log(result.data[0]);
                // if (this.data) {console.log(" there is data in profiles" + this.data);}
                // console.log(this.data)
                // Start mapping
                let currentData = [];
                // let rowId = 0;
                // console.log("result data : " + result.data);
                result.data.forEach((row) => {
                    let rowData = {};
                    // License, NamespacePrefix, IsActive, Quantity
                    rowData.Quantity = row.Quantity; 
                    rowData.License = row.License;
                    // rowData.NamespacePrefix = row.NamespacePrefix;
                    rowData.IsActive = row.IsActive; 
                    // console.log("Id : " + rowData.Id); 
                    // rowId = rowId + 1 ;
                    // rowData.Id = rowId;
                    console.log("rowData.Count : " + rowData.Quantity);
                    console.log("rowData.License : " + rowData.License);
                    // console.log("rowData.NamespacePrefix : " + rowData.NamespacePrefix);
                    console.log("rowData.IsActive : " + rowData.IsActive);
                    // Profile related data
                    // if (row.Profile) { rowData.UsersProfileName = row.Profile.Name; console.log("profile" + row.Name); }
                    // License related data
                    // if (row.Profile.UserLicense) { rowData.UsersProfileUserLicenseName = row.Profile.UserLicense.Name; }
                    // console.log("rowData : " + rowData);
                    currentData.push(rowData);
                    // console.log("currentData : " + currentData);
                    });
                this.data = currentData;
                // console.log("profiles/Count : " + currentData);
                // Stop Mapping 
                 this.error = undefined;
             } else if (result.error) {
                 this.error = result.error;
                 this.data = undefined;
             }
            } 
    
    
        }
    
        