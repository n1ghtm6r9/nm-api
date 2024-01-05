const { Query, Mutation } = require('@nestjs/graphql');

export const getQueryMutationByName = (methodName: string) =>
  methodName.includes('get') ? { type: 'Query', decorator: Query } : { type: 'Mutation', decorator: Mutation };
