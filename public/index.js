//使用 WebSocket 的網址向 Server 開啟連結
let ws = new WebSocket('wss://2021-utd-hackathon.azurewebsites.net');


let result;
//開啟後執行的動作，指定一個 function 會在連結 WebSocket 後執行
ws.onopen = function() {
  console.log('open connection');
};

//關閉後執行的動作，指定一個 function 會在連結中斷後執行
ws.onclose = function() {
  console.log('close connection');
};

// let xhr = new XMLHttpRequest();

ws.onmessage = function(event) {
  // console.log(event)
  // console.log(event.data);
  result = JSON.parse(event.data);

  let type =  result.type;
  if (type === "CURRENT_STATE") {
    console.log("CURRENT_STATE");
    const flowRateIn = result.flowRateIn;
    const operationCount = Object.keys(result.operations).length;
    let res = [];
    for (let i in result.operations) {
      let temp = {};
      temp["operationId"] = result.operations[i].id;
      temp["flowRate"] = flowRateIn/operationCount;
      res.push(temp);
    }
    ws.send(JSON.stringify(res));

    // xhr.open("POST", "/post", true);
    // xhr.setRequestHeader('Content-Type', 'application/json');
    // xhr.send(JSON.stringify(res));

  } else if (type === "OPTIMATION_RESULT") {
    console.log("OPTIMATION_RESULT");
  }
};
