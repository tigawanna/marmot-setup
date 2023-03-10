# Getting started with marmot and pocketbase

> This will work with any sqlite db since the only pocketbase specifics are the pb_data/data.db
sqlite file in pocketbase


 ## installation
 -----------------
> the most reliable source for the latest + other versions  would is repo/releases

- **marmot** : https://github.com/maxpert/marmot/releases
```ts
wget --quiet -O marmot.tar.gz https://github.com/maxpert/marmot/releases/download/v0.7.4/marmot-v0.7.4-linux-amd64.tar.gz

tar -xf marmot.tar.gz
```

- **nats-server** : https://github.com/nats-io/nats-server/releases

```ts
wget --quiet -O nats-server.tar.gz https://github.com/nats-io/nats-server/releases/download/v2.9.10/nats-server-v2.9.10-linux-amd64.zip

tar -xf nats-server.tar.gz
```
> you can also install nats-server[ globally or run it in docker](https://docs.nats.io/running-a-nats-service/introduction/installation)


> personally i used their debian build because it installs on ubuntu just fine an will update when you do `sudo apt update`
```ts
wget --quiet -O nats-server.deb https://github.com/nats-io/nats-server/releases/download/v2.9.10/nats-server-v2.9.10-amd64.deb
```
then use sudo apt install path-to-the-nats-server.deb-download 
```sh
sudo apt install nats-server.deb
```



- **pocketbase** : https://github.com/pocketbase/pocketbase/releases
```ts
wget --quiet -O pocketbase.tar.gz https://github.com/pocketbase/pocketbase/releases/download/v0.10.3/pocketbase_0.10.3_linux_amd64.zip

tar -xf pocketbase.tar.gz
```



- **goreman**: cli tool to run multiple long living commands in one terminal instance: https://github.com/mattn/goreman/releases

```sh
wget --quiet -O goreman.tar.gz https://github.com/mattn/goreman/releases/download/v0.3.13/goreman_v0.3.13_linux_arm64.tar.gz

tar -xf goreman.tar.gz
```




## config
-----------


`mm1/config.toml`
```toml
-- marmot instance 1 : for pocketbase instance 1
-- path to your pocketbase pb_data/data.db or your sqlite db
db_path="~/code/marmot/pb_10a/pb_data/data.db"
node_id=1
seq_map_path="/tmp/seq-map-1.cbor"

[snapshot]
enabled=true
store="nats"

[snapshot.nats]
replicas=1

[replication_log]
replicas=1
shards=1
max_entries=1024
compress=true


[nats]
urls=[
    "nats://localhost:4222"
]
subject_prefix="marmot-change-log"
stream_prefix="marmot-changes"


[logging]
verbose=true
format="console"


```

`mm2/config.toml`
```toml
-- marmot instance 2 : for pocketbase instance 2
-- path to your pocketbase pb_data/data.db or your sqlite db 
db_path="~/code/marmot/pb_10b/pb_data/data.db"
node_id=2
seq_map_path="/tmp/seq-map-2.cbor"

[snapshot]
enabled=true
store="nats"

[snapshot.nats]
replicas=1

[replication_log]
replicas=1
shards=1
max_entries=1024
compress=true


[nats]
urls=[
    "nats://localhost:4223"
]
subject_prefix="marmot-change-log"
stream_prefix="marmot-changes"


[logging]
verbose=true
format="console"

```

`nats/nats-1.conf`
```ts
// nats instance 1 for marmot instance 1
listen: 0.0.0.0:4222
server_name: natt1

accounts:{
    $SYS:{
        users:[
            {user: lorde, password: your_ruler}
        ]
    }
}

cluster:{
    name: rack

    listen: 0.0.0.0:4248
    routes:[
        nats-route://127.0.0.1:4248
        nats-route://127.0.0.1:4249
          
    ]
}

jetstream: enabled
jetstream:{
    store_dir: /tmp/nats1
    max_mem: 256M
    max_file: 1G
}

```

`nats/nats-2.conf`
```ts
// nats instance 2 for marmot instance 2
listen: 0.0.0.0:4223
server_name: natt2

accounts:{
    $SYS:{
        users:[
            {user: lorde, password: your_ruler}
        ]
    }
}

cluster:{
    name: rack

    listen: 0.0.0.0:4249
    routes:[
        nats-route://127.0.0.1:4248
        nats-route://127.0.0.1:4249
          
    ]
}

jetstream: enabled
jetstream:{
    store_dir: /tmp/nats2
    max_mem: 256M
    max_file: 1G
}

```


## usage

after adding the config files we'll start both pocke base instances

```ts
pocketbase1: ~/code/marmot/pb_10a/pocketbase serve
pocketbase2: ~/code/marmot/pb_10b/pocketbase serve --http="127.0.0.1:8091"
```
default pocketbase runs on `127.0.0.1:8090` so the second instance is put on `127.0.0.1:8091` to avoid conflicts 
```ts
10:38:14 pb1 | > Server started at: http://127.0.0.1:8090
10:38:14 pb1 |   - REST API: http://127.0.0.1:8090/api/
10:38:14 pb1 |   - Admin UI: http://127.0.0.1:8090/_/
```
```ts
10:38:50 pb2 | > Server started at: http://127.0.0.1:8091
10:38:50 pb2 |   - REST API: http://127.0.0.1:8091/api/
10:38:50 pb2 |   - Admin UI: http://127.0.0.1:8091/_/
```

then we bring up the NATS servers
at this point we'll add data to pocketbase-1 while leaving pocketbase-2 empty but with the same schema 

![nats 1](/imgs/nats-1.png)

![nats 2](/imgs/nats-2.png)


![pocketbase 1](/imgs/pb2-w-data.png)

![pocketbase 2](/imgs/pb1-w-no-data.png)


then let's bring up marmot-1 and 2 and also show what happens when 1 or 2  stops  wjile te other is still running
<!-- 
https://user-images.githubusercontent.com/72096712/209428245-95638f0e-df3f-4532-a785-44b1fba2fcea.mp4 -->
https://user-images.githubusercontent.com/72096712/209428356-f06b59ca-4215-4b07-8a38-f8c66cc1022e.mp4



and finaly we'll set up goreman to run all the commands at once for extra convenience
> you might need to adjust the file paths to match your setup

`Procfile`
```ts
pocketbase1: ~/code/marmot/pb_10a/pocketbase serve
pocketbase2: ~/code/marmot/pb_10b/pocketbase serve --http="127.0.0.1:8091"

nats-1: nats-server -c ./nats/nats-1.conf
nats-2: nats-server -c ./nats/nats-2.conf 


marmot-1: sleep 10 && ./mm1/marmot -config ./mm1/config.toml 
marmot-2: sleep 10 && ./mm2/marmot -config ./mm2/config.toml

```


> also note that both dbs should have the same schema , 
in my case  created one pocketbase instance and copied the directory after makig a few records `pb_10a and pb_10b with pb_data/data.db`
if you already have a populated db try using the pocketbase export schema feature or just manually copy `pb_data` 
into the new instance

finally run 
```sh 
goreman start
```

> changes made in one instance should reflect on the others

helpful resources
- [.deb installation on ubuntu](https://www.javatpoint.com/how-to-install-deb-file-in-ubuntu)
- [example setup](https://github.com/tigawanna/all-emps-emps-web.git)
