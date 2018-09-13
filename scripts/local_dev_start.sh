# echo "Run sb_bots Stop Script"
# ./scripts/stop.sh
# echo "Run sb_bots Start Script"
# ./scripts/start.sh

echo "Stoping and remove dynamodb..."
docker stop elasticsearch && docker rm -v elasticsearch

echo "Stoping and remove dynamodb..."
docker run --name elasticsearch -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:6.4.0

echo "Stoping and remove dynamodb..."
docker stop dynamodb && docker rm -v dynamodb

echo "Starting local docker of dynamodb instance..."
docker run --name dynamodb -d -p 8000:8000 dwmkerr/dynamodb -sharedDb

echo "Create Local DB Schema..."
node dev/create.js

echo "Create lambda docker container"
docker run --rm -v /Users/french/Dev/projects/Content-Search-Lambda:/var/task lambci/lambda:nodejs8.10 app/index.handler "$(cat dev/quotesTestData.json)"
echo "Complete"