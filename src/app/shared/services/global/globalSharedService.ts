import { Injectable, Inject } from '@angular/core';
import { AngularCsv } from 'angular7-csv/dist/Angular-csv';
import { ExcelService, PdfService } from 'global';
import * as $ from 'jquery';
@Injectable({ providedIn: 'root' })
export class globalSharedService {

    // Getting ID value
    name: any;
    public selectedId = null;
    public listOfRow: any;
    pageName: string;
    public userDetails: any;
    tabClick = null;
    urlName = null;
    listOfModulesforServices: any;
    parentName: any;

    analogAssetObj: any;

    // Asset configuration page
    assetViewModeFormViewStatus = 'assetViewMode';
    result: string;
    isadmin: boolean;
    landingMenuUrlForHome: any;
    maxUser: any;
    roleList: any[];
    assetDetails: any;
    globalId: any;
    notificationMediaList: any[];
    confirmedNotificationGroupList: any[];
    usersList: any[];
    public notificationGroupDetails: any;
    notificationMediaTabDetails: any;
    notificationGroupmediaDetails: any;
    backId: string;
    dataDataSource: any;
    onpageloadNotificationGroupMediaDetails: any;
    confirmedAccessGroupList: any;
    id: number;
    reminingUser: number;
    maxUsers: number;
    dataServerTime: any;
    emailId: string;
    dropDownTextSettings: {
        text: string;
        noDataLabel: string;
    };
    setassetViewModeFormViewStatus(view) {
        this.assetViewModeFormViewStatus = view;
    }


    constructor(private excelService: ExcelService, private pdfService: PdfService) {

    }

    // When click on update/view, ID will pass to respective updata view
    GettingId(id) {
        this.selectedId = id;
        setTimeout(() => {
            this.selectedId = null;
        }, 1000)
    }
    GettingString(name) {
        this.name = name;
        setTimeout(() => {
            this.name = null;
        }, 2000)
    }
    setId(id) {
        this.id = id;
    }
    gettingName(name) {
        this.parentName = name;
    }
    // Store json valu to global level for show click to edit view
    setOrganizationDetail(pageName, objectDetail) {
        this.pageName = pageName;
        this.listOfRow = objectDetail;
        // setTimeout(() => {
        //     this.listOfRow = null;
        // }, 1000)
    }
    setMenuDetail(menu: any) {
        this.listOfRow = menu;
    }

    analogAsset(objectDetail) {
        this.analogAssetObj = objectDetail;
    }

    // User view to global level for show click to edit view tab level passing

    //=========================================( URL, Boject, tab,  Header
    listOfRowDetailForUser(url, objectDetail, tab, header) {
        this.userDetails = objectDetail;
        this.pageName = header;
        this.urlName = url;
        this.tabClick = tab;
    }

    // clearInfo
    clearInfo() {
        this.userDetails = null;
        this.pageName = null;
        this.tabClick = null;
        this.urlName = null;
        this.selectedId = null;
        this.listOfRow = null;
        sessionStorage.setItem('clickedRowDetail', null);
        // this.pageName = null;
        $('ul li').removeClass('active');
        this.assetViewModeFormViewStatus = 'assetViewMode';
    }

    getNamePattern() {
        return "^[a-zA-Z][ a-zA-Z0-9.#@*&_-]*";
    }
    getNamePatternForGatewayandAsset() {
        return "[ a-zA-Z0-9.#@*:&_-]*";
    }
    setIsAdmin(isAdmin: boolean) {
        this.isadmin = isAdmin;
    }
    doubleHyphen(event: any) {
        var str = event.target.value;
        var n = str.includes("--");
        if (n) {
            return true;
        }
    }

    //Response code
    responseStatus = 800;


    // Error alert message type key value
    // Modal window for failed scenario(ex: Not saved)
    messageType_Fail = 'Failed'; //(!) with red
    // Information
    messageType_Info = 'Info';
    // Modal window for Warning info (ex: Cancel/Reset/Tab navigation)
    messageType_Warning = 'Warning';  // (!) with orange
    // Modal window for delete
    messageType_Error = 'Error'; // (Cross) with Red

    // Modal Window foralarm message format
    messageType_AlarmMessage = 'AlarmMessage';

    // Modal Window for clear message format
    messageType_ClearMessage = 'ClearMessage';

    // Landing menu

    landingMenuUrl(landingMenuUrl) {
        this.landingMenuUrlForHome = landingMenuUrl;
    }
    setNumberOfUsers(numberOfUsers: any) {
        this.maxUser = numberOfUsers;
        setTimeout(() => {
            this.maxUser = null;
        }, 2000)
    }
    setRoleList(confirmedList: any[]) {
        this.roleList = confirmedList;
    }
    setAssetDetail(details) {
        this.assetDetails = details;
        setTimeout(() => {
            this.assetDetails = null;
        }, 1000)
    }

    setGlobalId(id: any) {
        this.globalId = id;
    }

    setNotificationMedia(objectDetail) {
        this.notificationMediaList = objectDetail;
    }
    setConfirmedNotificationGroupList(objectDetail) {
        this.confirmedNotificationGroupList = objectDetail;
    }
    setConfirmedAccessGroupList(objectDetail) {
        this.confirmedAccessGroupList = objectDetail;
    }
    setUsersList(objectDetail) {
        this.usersList = objectDetail;
    }
    setNotificationGroupDetails(objectDetail) {
        this.notificationGroupDetails = objectDetail;
    }
    setNotificationMediaTabDetails(objectDetail) {
        this.notificationMediaTabDetails = objectDetail;
        setTimeout(() => {
            this.notificationMediaTabDetails = null;
        }, 2000)
    }

    setNotificationGroupmediaDetails(objectDetail) {
        this.notificationGroupmediaDetails = objectDetail;
    }
    setBackId(object) {
        this.backId = object;
    }

    // datasource
    dataSource(dataSource) {
        this.dataDataSource = dataSource;
    }
    setNotificationDetail(obj) {
        this.onpageloadNotificationGroupMediaDetails = obj;
    }


    // To get the Selected Dahboard name
    selectedDashboardName = [];
    getDashboardSelectedName(userDashboardList, id) {
        let selectedDashboardIdName = '';

        this.selectedDashboardName = userDashboardList.filter((item) => {
            if (id == null) {
                return item.isDefault == true;
            } else {
                return item.id == parseInt(id);
            }
        });

        if (this.selectedDashboardName.length) {
            selectedDashboardIdName = this.selectedDashboardName[0].name;
        } else selectedDashboardIdName = 'Dashboard';

        return selectedDashboardIdName;
    }


    getPatternForCommunication(dataType): any {
        switch (dataType) {
            case 'String': {
                return "";
            }
            case 'Integer': {
                return "[0-9]*";
            }
            case 'Long': {
                return "[0-9]*";
            }
            case 'Double': {
                return /^[0-9]\d{0,5}(\.\d{1,4})?%?$/
            }
            case 'Float': {
                return /^[0-9]\d{0,5}(\.\d{1,4})?%?$/
            }
            default: {
                // return "^[a-zA-Z][ a-zA-Z0-9.#@*&_-]*";
                return "";
            }
        }

    }
    getPatternForDiscreterTag(dataType): any {
        switch (dataType) {
            case 'String': {
                return "";
            }
            case 'Integer': {
                return "[0-9][0-9,]*";
            }
            case 'Long': {
                return "[0-9][0-9,]*";
            }
            case 'Double': {
                return /^[0-9]\d{0,5}(\.\d{1,4})?%?$/
            }
            case 'Float': {
                return /^[0-9]\d{0,5}(\.\d{1,4})?%?$/
            }
            default: {
                // return "^[a-zA-Z][ a-zA-Z0-9.#@*&_-]*";
                return "";
            }
        }

    }
    setLanguageURL(pageUrl) {
        // Getting the host name, Pathname, Current page URL
        let protocol = window.location.protocol
        let hostName = window.location.host;
        var pathName = protocol + "//" + hostName + '/empyreal-universe/';
        var currentPageUrl;
        if (pageUrl != null) {
            currentPageUrl = pageUrl;
        } else {
            currentPageUrl = this.getCurrentUrl();
        }
        $('.navbar-nav.navbar-right li.dropdown a#header_language + ul > li a').each(function () {
            $(this).attr('href', '');
            let anchorTagAttrbute = $(this).attr('name');
            let path = pathName + anchorTagAttrbute + "/#" + currentPageUrl;
            $(this).attr('href', path);
        });
    }


    getCurrentUrl() {
        let pageName = document.location.href.split("#")[1];
        return pageName;
    }

    setReminingUsers(reminingUsers: number) {
        this.reminingUser = reminingUsers;
        setTimeout(() => {
            this.reminingUser = null;
        }, 2000)
    }
    setMaxUsers(maxUsers: number) {
        this.maxUsers = maxUsers;
        setTimeout(() => {
            this.maxUsers = null;
        }, 2000)
    }
    setDataServerTime(dataServerTime) {
        this.dataServerTime = dataServerTime;
        setTimeout(() => {
            this.maxUsers = null;
        }, 2000)
    }


    // Download as a CSV/PDF/Excel file name
    fileName: string;
    getExportingFileName(exportingfileName) {
        let timeSpan = new Date().toISOString();
        let getFullDay = timeSpan.split('T');
        let getTime = getFullDay[1].split(':');
        let getHrMin = getTime[0] + "H" + getTime[1] + "m";
        this.fileName = `${exportingfileName}_${getFullDay[0]}_${getHrMin}`;
        return this.fileName;
    }

    // Date and Time split for search criteria
    startDateEndDateTimeSplit(dateTime) {
        let getFullDay = dateTime.split('T');
        let getTime = getFullDay[1].split(':');
        let getHrMin = getTime[0] + ":" + getTime[1];
        return getFullDay[0] + " " + getHrMin;
    }

    // Make new set of re-arrange object
    reCreateNewObject(data, displayedColumns) {
        let sendBack = data.map(object => {
            var newObject = {};
            for (const objPropertyName of displayedColumns) {
                if (!object.hasOwnProperty(objPropertyName)) {
                    newObject[objPropertyName] = '-';
                } else {
                    newObject[objPropertyName] = object[objPropertyName] ? object[objPropertyName] : '-';
                }
            }
            return newObject;
        });
        return sendBack;
    }



    // Download CSV/PDF/Excel Title formate
    formateCSVTitle(titleList, headerName) {
        let headerTitle = headerName;
        let breakSentence = '\r\n';
        let titleRowKeys = '';
        let titleRowValues = '';
        let titleKeysValues;

        // Getting saperate Title Keys and Values
        for (const [key, value] of Object.entries(titleList)) {
            /* Row by Row */
            titleRowKeys += '"' + key + '"' + ',' + '"' + value + '"' + ',' + breakSentence;
        }

        //   Remove at last character (,)
        /* Row by Row */
        titleKeysValues = titleRowKeys.slice(0, -1);

        return headerTitle + breakSentence + breakSentence + titleKeysValues;

    }

    // Final download files
    downloadFile(fileType, exportFile, searchFieldsContainer, tableBodyDataList, fileName, csvOptions) {
        if (fileType == 'pdf') {
            // PDF Export format
            this.pdfService.generatePDF(exportFile, searchFieldsContainer);
        } else if (fileType == 'excel') {
            // Excel export format
            this.excelService.generateExcel(exportFile, searchFieldsContainer);
        } else if (fileType == 'csv') {
            // Export CSV format
            new AngularCsv(tableBodyDataList, fileName, csvOptions);
        }
    }


    // Remove last element in the array
    removeLastIndexAtArray(object) {
        // Convert Obaject into Array
        let array = Object.values(object);
        array.pop();
        return array;
    }

    // Added S.No. to Download file excel,CSV, PDF
    serialNumberGenerate(array) {
        let i = 1;
        let returnModifiedArray = array.map((object) => {
            object.id = i;
            i++;
            return object;
        });
        return returnModifiedArray;
    }

    setUserEmailId(emailId: string) {
        this.emailId = emailId;
    }


    //   Selected Language
    public selectedLanguage: string;

    // Return the Selected languge for Syncfusion Dropdown
    getLanguage() {
        return this.selectedLanguage;
    }

    // Set Language
    setLanguage(language) {
        this.selectedLanguage = language;
    }

    setMultiselectDropdownTextSettings() {
        return this.dropDownTextSettings = {
            text: $localize`:@@multiSelectDropdown.select:--Select--`,
            noDataLabel: $localize`:@@multiSelectDropdown.noDataLabel:No Data Available`
        };

    }

    setGatewayLableName(path) {
        let gatewayAndTemplateLableName;
        if (path[1] == "asset-template") {
            return gatewayAndTemplateLableName = "Gateway Template";
        }
        else if (path[1] == "asset") {
            return gatewayAndTemplateLableName = "Gateway";
        }
    }


    setData:any[] = [];
    setDataValue(data){
        this.setData = data;
    }

    getDataValue(){
        return this.setData;
    }
}
