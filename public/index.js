//使用 WebSocket 的網址向 Server 開啟連結
let ws = new WebSocket('wss://2021-utd-hackathon.azurewebsites.net');


let result;

ws.onopen = function() {
  console.log('open connection');
};

ws.onclose = function() {
  console.log('close connection');
};

let xhr = new XMLHttpRequest();

function GetSortOrder(prop1, prop2) {
  return function(a, b) {
    temp_a = a[prop1]/a[prop2];
    temp_b = b[prop1]/b[prop2];
    if (isNaN(temp_a)) {
      temp_a = 0
    }
    if (isNaN(temp_b)) {
      temp_b = 0
    }
    if (temp_a > temp_b) {
        return -1;
    } else if (temp_a < temp_b) {
        return 1;
    }
    return 0;
  }
}

ws.onmessage = function(event) {
  // console.log(event)
  // console.log(event.data);
  result = JSON.parse(event.data);

  let time;
  let flag = true;
  if (flag === true) {
    time = new Date();
    time = time.toJSON();
  }
  console.log(time);
  let type =  result.type;
  if (type === "CURRENT_STATE") {
    console.log("CURRENT_STATE");

    const flowRateIn = result.flowRateIn;
    result.timestamp = time;
    const operationCount = Object.keys(result.operations).length;
    let matrix = Object.values(result.operations).map(value => value.revenueStructure);
    for (let i in matrix) {
      matrix[i].sort(GetSortOrder("dollarsPerDay", "flowPerDay"));
    }
    bests = Object.values(matrix).map(value => value[0]);
    current = bests.map(best => best.flowPerDay).reduce((acc, best) => best + acc);
    for (let i in bests) {
      bests[i].id = result.operations[i].id;
      bests[i].ratio = bests[i].dollarsPerDay / bests[i].flowPerDay;
      bests[i].newFlowPerDay = bests[i].flowPerDay + (flowRateIn - current)/operationCount;
    }


    let res = [];
    for (let i in bests) {
      let temp = {};
      temp["operationId"] = bests[i].id;
      temp["flowRate"] = bests[i].newFlowPerDay;
      res.push(temp);
    }
    // console.log(res);
    ws.send(JSON.stringify(res));
    flag = false;

  } else if (type === "OPTIMATION_RESULT") {
    console.log("OPTIMATION_RESULT");
    const flowRateInOpt = result.flowRateIn;
    result.timestamp = time;
    console.log(result);
    flag = true;
  }

  xhr.open("POST", "/post", true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(result));
};
