/* **************************************************************************************
  WARNING: DO NOT EDIT this file except from inside the graphql-starter-template repository.
  Changes made to this file inside child repos will NOT be reflected in the parent source
  template repository, and will interfere with the ability to upgrade common code from
  the template repository.
***************************************************************************************** */
const loginSchema = require('coa-web-login');
const apiSchema = require('./api');

/*
 * The test endpoint just a placeholder since the base schema
 * needs to have a Mutation type that can be extended.
 */
const baseSchema = `
  # the schema allows the following query:

  type User {
    id: Int
    name: String
    email: String
    position: String
    department: String
    division: String
    supervisor_id: Int
    supervisor: String
    supervisor_email: String
  }

  type Query {
    version: String
    user: User
  }

  type Dummy {
    message: String
  }
  type Mutation {
    test: Dummy
  }
`;

const schemas = [
  baseSchema,
  apiSchema.schema,
  loginSchema.graphql.schema,
];

module.exports = schemas.reduce((accum, cur) => accum.concat(cur), '');
