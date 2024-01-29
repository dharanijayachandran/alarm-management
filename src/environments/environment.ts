// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: true,
  baseUrl_gatewayManagement: "http://10.225.10.23:8080/GatewayManagementView/",
  baseUrl_AssetManagement: "http://10.225.10.23:8080/AssetManagementView/",
  baseUrl_MasterDataManagement: "http://10.225.10.23:8080/MasterDataManagmentView/",
  baseUrl_AlarmManagement: "http://10.225.10.23:8080/AlarmManagementView/",
  environmentUrl: 'http://10.225.10.23:8080/'
};


