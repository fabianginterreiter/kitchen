import knex from '../knex.mjs';


export default function importHandler(req, res) {
    console.log(req.body);

    res.send("Hello <3");
}