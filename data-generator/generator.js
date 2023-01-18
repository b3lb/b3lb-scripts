import { InfluxDB, Point } from '@influxdata/influxdb-client'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

const args = yargs(hideBin(process.argv))
    .option('host', {
        description: 'InfluxDB host',
        default: 'http://localhost:8086',
        type: 'string'
    })
    .option('token', {
        description: 'Influxdb API token',
        default: 'Zq9wLsmhnW5UtOiPJApUv1cTVJfwXsTgl_pCkiTikQ3g2YGPtS5HqsXef-Wf5pUU3wjY3nVWTYRI-Wc8LjbDfg==',
        type: 'string'
    })
    .option('bucket', {
        description: 'Influxdb bucket',
        default: 'bucket',
        type: 'string'
    })
    .option('org', {
        description: 'Influxdb organization',
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

const influxdb = new InfluxDB({ url: args.host, token: args.token })

const tenants = ["tenant1.localhost.com", "tenant2.localhost.com"]

const points = [
    {
        measurement: 'bigbluebutton',
        fields: [
            {
                field: 'meetings',
                min: 200,
                max: 250
            },
            {
                field: 'active_recordings',
                min: 200,
                max: 250
            },
            {
                field: 'participants',
                min: 5000,
                max: 7500
            },
            {
                field: 'listener_participants',
                min: 5000,
                max: 7500
            },
            {
                field: 'video_participants',
                min: 500,
                max: 750
            },
            {
                field: 'voice_participants',
                min: 5000,
                max: 7500
            },
            {
                field: 'recordings',
                min: 10,
                max: 50
            },
            {
                field: 'published_recordings',
                min: 10,
                max: 50
            },
            {
                field: 'online',
                min: 1,
                max: 1
            }
        ]
    }
]

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function getPoint(measurement, fields) {
    let point = new Point(measurement)
    fields.forEach(f => point.intField(f.field, randomIntFromInterval(f.min, f.max)))

    return point
}

setInterval(() => {
    const writeApi = influxdb.getWriteApi(args.org, args.bucket)

    points.forEach(p => {
        let point = getPoint(p.measurement, p.fields)
        writeApi.writePoint(point)
        console.log(point.toString())
    })

    tenants.forEach(t => {
        points.forEach(p => {
            let point = getPoint(`${p.measurement}:${t}`, p.fields)
            writeApi.writePoint(point)
            console.log(point.toString())
        })
    })

    writeApi.close()
}, args.interval)
