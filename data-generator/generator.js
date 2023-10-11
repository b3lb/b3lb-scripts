import postgres from 'pg';
const { Client } = postgres;
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

import DB from './db.js';

const args = yargs(hideBin(process.argv))
    .option('host', {
        description: 'Timescale host',
        default: 'localhost',
        type: 'string'
    })
    .option('user', {
        description: 'Timescale user',
        default: 'bigblueswarm',
        type: 'string'
    })
    .option('password', {
        description: 'Timescale password',
        default: 'password',
        type: 'string'
    })
    .option('db', {
        description: 'Timescale database',
        default: 'bigblueswarm',
        type: 'string'
    })
    .option('interval', {
        description: 'Aggregation interval in ms',
        default: 10000,
        type: 'number'
    })
    .help()
    .alias('help', 'h').argv;

const client = new Client({
    host: args.host,
    database: args.db,
    user: args.user,
    password: args.password,
    ssl: false
});

const db = new DB(client);

await client.connect();
await db.createBBBMetricTableIfNotExists();
await db.createBBBMetadataTableIfNotExists();

const tenants = ["tenant1.localhost.com", "tenant2.localhost.com"]

const fields = [
    {
        name: 'meetings',
        min: 200,
        max: 250
    },
    {
        name: 'active_recordings',
        min: 200,
        max: 250
    },
    {
        name: 'participants',
        min: 5000,
        max: 7500
    },
    {
        name: 'listener_participants',
        min: 5000,
        max: 7500
    },
    {
        name: 'video_participants',
        min: 500,
        max: 750
    },
    {
        name: 'voice_participants',
        min: 5000,
        max: 7500
    },
    {
        name: 'recordings',
        min: 10,
        max: 50
    },
    {
        name: 'published_recordings',
        min: 10,
        max: 50
    },
    {
        name: 'online',
        min: 1,
        max: 1
    }
]

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function getRow() {
    let row = {}
    fields.forEach(field => row[field.name] = randomIntFromInterval(field.min, field.max))
    return row;
}

setInterval(() => {
    db.insertBBBMetric(getRow())
    tenants.forEach(t => db.insertMetadataBBBMetric(t, getRow()))
}, args.interval)