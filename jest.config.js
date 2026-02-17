module.exports = {
  roots: ['<rootDir>/tests'],
  testMatch: ['<rootDir>/tests/**/*.spec.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@nestjs/common$': '<rootDir>/tests/__mocks__/nestjs-common.ts',
    '^@nestjs/graphql$': '<rootDir>/tests/__mocks__/nestjs-graphql.ts',
    '^@nestjs/microservices$': '<rootDir>/tests/__mocks__/nestjs-microservices.ts',
  },
};
