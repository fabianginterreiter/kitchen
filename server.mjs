import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import typeDefs from './graphql/typeDefs.mjs';
import resolvers from './graphql/resolvers.mjs';
import exportHandler from './handlers/exportHandler.mjs';

const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginLandingPageLocalDefault()]
});

await server.start();

const app = express();

app.use(
    '/data',
    cors(),
    bodyParser.json(),
    expressMiddleware(server),
);

app.get('/api/export', exportHandler);

app.use(express.static('public'));

app.get('*', (req, res) => {
    res.sendFile(`${process.cwd()}/public/index.html`, (err) => {
        if (err) {
            res.status(500).send(err)
        }
    })
});

app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000`)
);