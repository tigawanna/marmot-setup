pocketbase1: ~/code/marmot/pb_10a/pocketbase serve
pocketbase2: ~/code/marmot/pb_10b/pocketbase serve --http="127.0.0.1:8091"

nats-1: nats-server -c ./nats/nats-1.conf
nats-2: nats-server -c ./nats/nats-2.conf 


marmot-1: sleep 10 && ./mm1/marmot -config ./mm1/config.toml 
marmot-2: sleep 10 && ./mm2/marmot -config ./mm2config.toml


