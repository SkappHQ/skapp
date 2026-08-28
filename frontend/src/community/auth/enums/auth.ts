export enum AuthMethods {
  CREDENTIAL = "CREDENTIAL",
  GOOGLE = "GOOGLE",
  MICROSOFT = "MICROSOFT",
  GUEST = "GUEST",
  CODE = "CODE",
}

export enum SignInStatus {
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE"
}

export enum SessionRefreshStatus {
  SUCCESSFUL = "successful",
  UNAUTHORIZED = "unauthorized",
  ERROR = "error"
}
