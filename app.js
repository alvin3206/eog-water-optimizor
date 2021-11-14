//jshint esversion:6

const express = require("express");
const ejs = require("ejs");
const SocketServer = require('ws').Server;
const bodyParser = require("body-parser");

const Kafka = require('node-rdkafka');

const { configFromCli } = require('./config');
console.log(Kafka.librdkafkaVersion);

const ERR_TOPIC_ALREADY_EXISTS = 36;

function ensureTopicExists(config) {
  const adminClient = Kafka.AdminClient.create({
    'bootstrap.servers': config['bootstrap.servers'],
    'sasl.username': config['sasl.username'],
    'sasl.password': config['sasl.password'],
    'security.protocol': config['security.protocol'],
    'sasl.mechanisms': config['sasl.mechanisms']
  });

  return new Promise((resolve, reject) => {
    adminClient.createTopic({
      topic: config.topic,
      num_partitions: 1,
      replication_factor: 3
    }, (err) => {
      if (!err) {
        console.log(`Created topic ${config.topic}`);
        return resolve();
      }

      if (err.code === ERR_TOPIC_ALREADY_EXISTS) {
        return resolve();
      }

      return reject(err);
    });
  });
}

function createProducer(config, onDeliveryReport) {
  const producer = new Kafka.Producer({
    'bootstrap.servers': config['bootstrap.servers'],
    'sasl.username': config['sasl.username'],
    'sasl.password': config['sasl.password'],
    'security.protocol': config['security.protocol'],
    'sasl.mechanisms': config['sasl.mechanisms'],
    'dr_msg_cb': true
  });

  return new Promise((resolve, reject) => {
    producer
      .on('ready', () => resolve(producer))
      .on('delivery-report', onDeliveryReport)
      .on('event.error', (err) => {
        console.warn('event.error', err);
        reject(err);
      });
    producer.connect();
  });
}

async function produceExample(result, tp) {
  const config = await configFromCli();

  if (config.usage) {
    return console.log(config.usage);
  }

  await ensureTopicExists(config);

  const producer = await createProducer(config, (err, report) => {
    if (err) {
      console.warn('Error producing', err)
    } else {
      const {topic, partition, value} = report;

      console.log(tp);

    }
  });

  const key = null;
  const value = Buffer.from(JSON.stringify(result));
  producer.produce(tp, -1, value, key);

  producer.flush(10000, () => {
    producer.disconnect();
  });
}

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
//   extended: true
// }));
app.use(express.static("public"));

app.get("/", function(req,res) {
  res.render("home");
});

app.post("/post", function(req,res) {

  result = req.body;
  // console.log(result);
  if (result.type === "CURRENT_STATE") {
    tp = "water_r";
  } else {
    tp = "water_o1";
  }
  produceExample(result, tp)
    .catch((err) => {
      console.error(`Something went wrong:\n${err}`);
      process.exit(1);
  });

  return res.end('done');
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
