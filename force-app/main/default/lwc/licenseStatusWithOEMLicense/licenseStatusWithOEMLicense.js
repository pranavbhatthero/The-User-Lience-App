// import { LightningElement, wire } from 'lwc';
import { LightningElement ,api, wire, track} from 'lwc';
import getUsersCountByLicenseStatus from '@salesforce/apex/AnalysePackageLicenses.getUsersCountByLicenseStatus';
// import getSpecificPackageLicense from '@salesforce/apex/AnalysePackageLicenses.getSpecificPackageLicense';
import getFirstPackageNamespacePrefix from '@salesforce/apex/AnalysePackageLicenses.getFirstPackageNamespacePrefix';

// Import message service features required for subscribing and the message channel
import { subscribe, MessageContext } from 'lightning/messageService';
import RECORD_SELECTED_CHANNEL from '@salesforce/messageChannel/Record_Selected__c';

// Id, Name, IsActive, Alias, Username, ProfileId, UserRoleId, Profile.Name, UserRole.Name, Profile.UserLicense.Name
const COLUMNS = [
    { label: 'License', fieldName: 'License', Type: 'text'},
    { label: 'IsActive', fieldName: 'IsActive', Type: 'text'},
    { label: 'Count', fieldName: 'Quantity', Type: 'text', cellAttributes: { alignment: 'center' } }
    // Profile.UserLicense.Name
    // { label: 'License', fieldName: 'License', Types: 'text'}
];

/** The delay used when debouncing event handlers before invoking Apex. */
const DELAY = 350;

export default class LicenseStatusWithOEMLicense extends LightningElement {
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
                    this.firstPackageName = result.data[0].NamespacePrefix;
                    this.error = undefined;
                } else if (result.error) {
                    this.error = result.error;
                    this.firstPackageName = undefined;
                }
               }
            
            // Working getUserList
            // @wire(getUserList, {packageKey: '$PackageName' , ifPackageKeyNull: '$firstPackageName'})
            // @wire(getUsersByProfiles , {packageKey: '$PackageName' , ifPackageKeyNull: '$firstPackageName'} )
            @wire(getUsersCountByLicenseStatus , {ifPackageKeyNull: '$firstPackageName'})
            myUsersProfiles(result) {
             if (result.data) {
                // this.data = result;
                // console.log("hitting getUsersByProfiles() !");
                // console.log(result.data);
                // console.log("getUsersByProfiles() with " + this.firstPackageName);
                // console.log(result.data[0]);
                // if (this.data) {console.log(" there is data in profiles" + this.data);}
                // console.log(this.data)
                // Start mapping
                let currentData = [];
                // let rowId = 0;
                // console.log("result data : " + result.data);
                result.data.forEach((row) => {
                    let rowData = {};
                    rowData.Quantity = row.Quantity; 
                    rowData.License = row.License;
                    // rowData.License = row.License;
                    rowData.IsActive = row.IsActive; 
                    // console.log("Id : " + rowData.Id); 
                    // rowId = rowId + 1 ;
                    // rowData.Id = rowId;
                    // console.log("rowData.Count : " + rowData.Quantity);
                    // console.log("rowData.License : " + rowData.License);
                    // console.log("rowData.License : " + rowData.License);
                    // console.log("rowData.IsActive : " + rowData.IsActive);
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
    
            // By using the MessageContext @wire adapter, unsubscribe will be called
            // implicitly during the component descruction lifecycle.
            @wire(MessageContext) messageContext;
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
    
        }
    
        