/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('units').del()
  await knex('units').insert([
    { id: 1, name: 'TL', description: 'Teelöffel' },
    { id: 2, name: 'EL', description: 'Esslöffel' },
    { id: 3, name: 'g', description: 'Gramm' }
  ]);
};
