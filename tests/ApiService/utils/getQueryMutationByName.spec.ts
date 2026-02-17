import { getQueryMutationByName } from '../../../src/ApiService/utils/getQueryMutationByName';

describe('getQueryMutationByName', () => {
  it('should return Query for method containing "get"', () => {
    const result = getQueryMutationByName('getUsers');
    expect(result.type).toBe('Query');
  });

  it('should return Mutation for method not containing "get"', () => {
    const result = getQueryMutationByName('createUser');
    expect(result.type).toBe('Mutation');
  });

  it('should return Query for "getSomething"', () => {
    const result = getQueryMutationByName('getSomething');
    expect(result.type).toBe('Query');
  });

  it('should return Mutation for "deleteItem"', () => {
    const result = getQueryMutationByName('deleteItem');
    expect(result.type).toBe('Mutation');
  });

  it('should return Mutation for "updateUser"', () => {
    const result = getQueryMutationByName('updateUser');
    expect(result.type).toBe('Mutation');
  });

  it('should return Query for method with "get" in middle', () => {
    const result = getQueryMutationByName('forgetPassword');
    expect(result.type).toBe('Query');
  });

  it('should have decorator property', () => {
    const queryResult = getQueryMutationByName('getUsers');
    expect(queryResult.decorator).toBeDefined();

    const mutationResult = getQueryMutationByName('createUser');
    expect(mutationResult.decorator).toBeDefined();
  });
});
