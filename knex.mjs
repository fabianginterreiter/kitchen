import Knex from 'knex';
import knexfile from './knexfile.js';

const knex = Knex(knexfile[process.env.NODE_ENV != null ? process.env.NODE_ENV : 'development']);

export default knex;