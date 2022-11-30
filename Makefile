.DEFAULT_GOAL := help
SHELL := /bin/bash
ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
TOKEN = $(shell grep  -Po "token: (.*)" config.yml | cut -d: -f2  | xargs) # bigblueswarm load balancer specific
SECRET = $(shell docker exec bbb1 sh -c "bbb-conf --secret" | grep -Po "Secret: (.*)" | cut -d: -f2 | xargs)


#help: @ list available tasks on this project
help:
	@grep -E '[a-zA-Z\.\-]+:.*?@ .*$$' $(MAKEFILE_LIST)| tr -d '#'  | awk 'BEGIN {FS = ":.*?@ "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

#build.image: @ build custom bigbluebutton docker image
build.image:
	@echo "[BUILD.IMAGE] build custom bigbluebutton docker image"
	DOCKER_BUILDKIT=0 docker build "$(ROOT_DIR)/docker" -t sledunois/bbb-dev:2.4-develop

#cluster.init: @ initialize development cluster (initialize influxdb and telegraf)
cluster.init: cluster.influxdb cluster.telegraf

#cluster.start: @ start development cluster
cluster.start:
	@echo "[CLUSTER] start development cluster"
	@docker-compose -f "$(ROOT_DIR)/docker-compose.yml" up -d

#cluster.stop: @ stop development cluster
cluster.stop:
	@echo "[CLUSTER] stop development cluster"
	@docker stop bbb1 bbb2 influxdb redis
	@if [ "$( docker container inspect -f '{{.State.Running}}' consul )" == "true" ]; then docker stop nconfig; fi;
	@if [ "$( docker container inspect -f '{{.State.Running}}' nconfig )" == "true" ]; then docker stop nconfig; fi;
	@if [ "$( docker container inspect -f '{{.State.Running}}' bigblueswarm )" == "true" ]; then docker stop nconfig; fi;


#cluster.influxdb: @ initialize influxdb database
cluster.influxdb:
	@echo "[CLUSTER] initialize development cluster"
	@echo "[CLUSTER] setting up InfluxDB token"
	@docker exec influxdb sh -c "influx setup --name bigblueswarmconfig --org bigblueswarm --username admin --password password --token ${TOKEN} --bucket bucket --retention 0 --force"

#cluster.telegraf: @ initialize bigbluebutton telegraf configuration
cluster.telegraf:
	@echo "[CLUSTER] initialize bigbluebutton telegraf configuration"
	@docker exec bbb1 sh -c "echo 'INFLUXDB_TOKEN=${TOKEN}\nBIGBLUESWARM_HOST=http://localhost/bigbluebutton\nBBB_SECRET=${SECRET}' > /etc/default/telegraf && . /etc/default/telegraf && systemctl restart telegraf"
	@docker exec bbb2 sh -c "echo 'INFLUXDB_TOKEN=${TOKEN}\nBIGBLUESWARM_HOST=http://localhost:8080/bigbluebutton\nBBB_SECRET=${SECRET}' > /etc/default/telegraf && . /etc/default/telegraf && systemctl restart telegraf"

#cluster.grafana: @ launch cluster with grafana
cluster.grafana:
	@echo "[CLUSTER] starting BigBlueButton cluster including grafana"
	@docker-compose -f $(ROOT_DIR)/docker-compose.yml -f $(ROOT_DIR)/docker-compose.grafana.yml up -d

#cluster.consul: @ start development cluster using consul coniguration provider
cluster.consul:
	@docker-compose -f "$(ROOT_DIR)/docker-compose.yml" -f "$(ROOT_DIR)/docker-compose.consul.yml" up -d

#cluster.bigblueswarm: @ start development cluster using bigblueswarm image
cluster.bigblueswarm:
	@docker-compose -f "$(ROOT_DIR)/docker-compose.yml" -f "$(ROOT_DIR)/docker-compose.consul.yml" -f "$(ROOT_DIR)/docker-compose.bigblueswarm.yml" up -d