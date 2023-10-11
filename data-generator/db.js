export default class DB {
    constructor(client) {
        this.client = client;
    }

    async createBBBMetricTableIfNotExists() {
        try {
            await this.client.query('SELECT * FROM public.bigbluebutton LIMIT 1;')
        } catch {
            console.log("table not found. Creating bigbluebutton table")
            await this.client.query(`
            CREATE TABLE public.bigbluebutton(
                time timestamp without time zone,
                bigblueswarm_host text,
                host text,
                active_recordings bigint,
                listener_participants bigint,
                meetings bigint,
                online bigint,
                participants bigint,
                published_recordings bigint,
                recordings bigint,
                video_participants bigint,
                voice_participants bigint
            );
        `)
        }
    }

    async createBBBMetadataTableIfNotExists() {
        try {
            await this.client.query('SELECT * FROM public."bigbluebutton_bigblueswarm-tenant" LIMIT 1;')
        } catch {
            console.log("metadata table not found. Creating bigbluebutton metadata table")
            await this.client.query(`
            CREATE TABLE public."bigbluebutton_bigblueswarm-tenant" (
                "time" timestamp without time zone NOT NULL,
                "bigblueswarm-tenant" text NULL,
                bigblueswarm_host text NULL,
                host text NULL,
                active_recordings bigint NULL,
                listener_participants bigint NULL,
                meetings bigint NULL,
                online bigint NULL,
                participants bigint NULL,
                published_recordings bigint NULL,
                recordings bigint NULL,
                video_participants bigint NULL,
                voice_participants bigint NULL
            );
            `)
        }
    }

    async insertBBBMetric(row) {
        await this.client.query(`
        INSERT INTO public.bigbluebutton VALUES (
            now(),
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11
        ); 
        `, [
            "bigblueswarm.localhost.com",
            "hostname",
            row.active_recordings,
            row.listener_participants,
            row.meetings,
            row.online,
            row.participants,
            row.published_recordings,
            row.recordings,
            row.video_participants,
            row.voice_participants
        ]);
    }

    async insertMetadataBBBMetric(tenant, row) {
        await this.client.query(`
        INSERT INTO public."bigbluebutton_bigblueswarm-tenant" VALUES (
            now(),
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11,
            $12
        ); 
        `, [
            tenant,
            "bigblueswarm.localhost.com",
            "hostname",
            row.active_recordings,
            row.listener_participants,
            row.meetings,
            row.online,
            row.participants,
            row.published_recordings,
            row.recordings,
            row.video_participants,
            row.voice_participants
        ]);
    }
}