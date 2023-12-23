import { Query, Mutation } from '@nestjs/graphql';

export const getQueryMutationByName = (methodName: string) =>
  methodName.includes('get') ? { type: 'Query', decorator: Query } : { type: 'Mutation', decorator: Mutation };
