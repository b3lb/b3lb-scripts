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
        measurement: 'bigbluebutton_meetings',
        field: 'active_meetings',
        min: 200,
        max: 250
    },
    {
        measurement: 'bigbluebutton_meetings',
        field: 'active_recordings',
        min: 200,
        max: 250
    },
    {
        measurement: 'bigbluebutton_meetings',
        field: 'participant_count',
        min: 5000,
        max: 7500
    },
    {
        measurement: 'bigbluebutton_meetings',
        field: 'listener_count',
        min: 5000,
        max: 7500
    },
    {
        measurement: 'bigbluebutton_meetings',
        field: 'video_count',
        min: 500,
        max: 750
    }
]

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

setInterval(() => {
    const writeApi = influxdb.getWriteApi(args.org, args.bucket)

    points.forEach(p => {
        let _p = new Point(p.measurement)
            .intField(p.field, randomIntFromInterval(p.min, p.max))
        writeApi.writePoint(_p)
        console.log(_p.toString())
    })

    tenants.forEach(t => {
        points.forEach(p => {
            let _p = new Point(`${t}:${p.measurement}`)
                .intField(p.field, randomIntFromInterval(p.min, p.max))
            writeApi.writePoint(_p)
            console.log(_p.toString())
        })
    })

    writeApi.close()
}, args.interval)