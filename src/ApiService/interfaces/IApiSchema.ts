export type IApiSchema = Record<
  string,
  {
    request?: object;
    response: object;
  }
>;
