// allInstalledPackages.js
import { LightningElement, track, wire } from 'lwc';
// import getContactList from '@salesforce/apex/AnalysePackageLicenses.getContactList';
import getPackageLicense from '@salesforce/apex/AnalysePackageLicenses.getPackageLicense';

// import message service features required for publishing and the message channel
import { publish, MessageContext } from 'lightning/messageService';
import RECORD_SELECTED_CHANNEL from '@salesforce/messageChannel/Record_Selected__c';

// const actions = [
//     { label: 'Show details', name: 'show_details' }
// ];

const COLUMNS = [
    { label: 'NamespacePrefix', fieldName: 'NamespacePrefix', Type: 'text'}
];
/** The delay used when debouncing event handlers before invoking Apex. */
const DELAY = 350;


export default class allInstalledPackages extends LightningElement {
    columns = COLUMNS;
    @track contacts;

    @wire(getPackageLicense) contacts;
    // @track testmyName = 'BMCServiceDesk';

    //wire MessageContext
    @wire(MessageContext) messageContext;

    handleContactSelect(event) {
        const payload = { recordId: event.target.contact.NamespacePrefix };
        publish(this.messageContext, RECORD_SELECTED_CHANNEL, payload);
    }

    handleKeyChange(event) {
        // Debouncing this method: Do not actually invoke the Apex call as long as this function is
        // being called within a delay of DELAY. This is to avoid a very large number of Apex method calls.
        window.clearTimeout(this.delayTimeout);
        const searchKey = event.target.value;
        console.log(searchKey + " for all packages Names")
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.delayTimeout = setTimeout(() => {
            findPackages({ searchKey })
                .then((result) => {
                    this.contacts = result;
                    this.error = undefined;
                    console.log("search executed " + this.contacts);
                })
                .catch((error) => {
                    this.error = error;
                    this.contacts = undefined;
                    console.log("gone to error");
                });
        }, DELAY);
    }


}