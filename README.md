# bbs-scripts

This repository is used by projects to build, manage et run a development cluster.

Available commands: 
```shell
@SLedunois ➜ /workspaces/bigblueswarm-scripts (main ✗) $ make help
help                           list available tasks on this project
build.image                    build custom bigbluebutton docker image
cluster.init                   initialize telegraf development configuration
cluster.start                  start development cluster
cluster.stop                   stop development cluster
cluster.telegraf               initialize bigbluebutton telegraf configuration
cluster.grafana                launch cluster with grafana
cluster.consul                 start development cluster using consul coniguration provider
cluster.bigblueswarm           start development cluster using bigblueswarm image
```
