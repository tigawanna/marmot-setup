# getting started with marmot and pocketbase

> `This will work with any sqlite db since the only pocketbase specifics are the pb_data/data.db
sqlite file in pocketbase`


1. ### installation
> `the most reliable source for the latest + other versions of installations would is repo/releases` 

- pocketbase : https://github.com/pocketbase/pocketbase/releases
```ts


wget --quiet -O pocketbase.tar.gz https://github.com/pocketbase/pocketbase/releases/download/v0.10.3/pocketbase_0.10.3_linux_amd64.zip

tar -xf pocketbase.tar.gz
```

- marmot : https://github.com/maxpert/marmot/releases
```ts
wget --quiet -O marmot.tar.gz https://github.com/maxpert/marmot/releases/download/v0.7.4/marmot-v0.7.4-linux-amd64.tar.gz

tar -xf marmot.tar.gz
```

- goreman: cli tool to run multiple long living commands in one terminal instance: https://github.com/mattn/goreman/releases

```ts
wget --quiet -O goreman.tar.gz https://github.com/mattn/goreman/releases/download/v0.3.13/goreman_v0.3.13_linux_arm64.tar.gz

tar -xf goreman.tar.gz
```

- nats-server : https://github.com/nats-io/nats-server/releases

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


2. ### config

`mm1/config.toml`
```toml
db_path="/home/dennis/code/marmot/pb_10a/pb_data/data.db"
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
db_path="/home/dennis/code/marmot/pb_10b/pb_data/data.db"
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

and finaly we'll set up goreman to run all these commands 
> you might have to adjust the file paths to match your setup

`Procfile`
```ts
pocketbase1: ~/code/marmot/pb_10a/pocketbase serve
pocketbase2: ~/code/marmot/pb_10b/pocketbase serve --http="127.0.0.1:8091"

nats-1: nats-server -c ./nats/nats-1.conf
nats-2: nats-server -c ./nats/nats-2.conf 


marmot-1: sleep 10 && ./mm1/marmot -config ./mm1/config.toml 
marmot-2: sleep 10 && ./mm2/marmot -config ./mm2config.toml



```


> also note tat both dbs should have the same schema , in my case  created one pocketbase instance and copied the directory after makig a few records `pb_10a and pb_10b with pb_data/data.db`

finally run 
```sh 
goreman start
```

and changes made in one instance should reflect on the other one
helpful resources
- [.deb installation on ubuntu](https://www.javatpoint.com/how-to-install-deb-file-in-ubuntu)

