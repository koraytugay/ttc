// noinspection JSIgnoredPromiseFromCall

// https://www.ttc.ca/ttcapi/routedetail/schedule?route=74&direction=0&stopCode=5518
// [{"nextBusMinutes":"8","crowdingIndex":"1"},{"nextBusMinutes":"27","crowdingIndex":"2"}]

const baseUrl = "https://www.ttc.ca/ttcapi/routedetail";

// northbound
const stClairStationAtLowerPlatform = 15306;
const mtPleasantRdatBlythwoodRd = 5804;

// southbound
const doncliffeLoopAtGlenEchoRd = 5518;
const mtPleasantRdAtStibbardAve = 5846;

function refreshUi() {
  document.getElementById("currentTime").innerText = new Date().toLocaleString('en-US',
    {hour: 'numeric', minute: 'numeric', hour12: true});

  populateNextBus(stClairStationAtLowerPlatform, "nb-stClairStationAtLowerPlatform-nextbus");
  populateSchedule(stClairStationAtLowerPlatform, "nb-stClairStationAtLowerPlatform-schedule", "1");
  
  populateNextBus(mtPleasantRdatBlythwoodRd, "nb-mtPleasantRdatBlythwoodRd-nextbus");
  populateSchedule(mtPleasantRdatBlythwoodRd, "nb-mtPleasantRdatBlythwoodRd-schedule", "1");
  
  populateNextBus(doncliffeLoopAtGlenEchoRd, "sb-doncliffeLoopAtGlenEchoRd-nextbus");
  populateSchedule(doncliffeLoopAtGlenEchoRd, "sb-doncliffeLoopAtGlenEchoRd-schedule", "0");
  
  populateNextBus(mtPleasantRdAtStibbardAve, "sb-mtPleasantRdAtStibbardAve-nextbus");
  populateSchedule(mtPleasantRdAtStibbardAve, "sb-mtPleasantRdAtStibbardAve-schedule", "0");
}

async function populateNextBus(stopCode, elementId) {
  const response = await fetch(baseUrl + '/GetNextBuses?routeId=74&stopCode=' + stopCode);
  const nextBusInfo = await response.json();
  const nextBusInDiv = document.getElementById(elementId);
  nextBusInDiv.innerHTML = '';

  let nextBusMinutesArr = [];

  for (let nextBus of nextBusInfo) {
    if (nextBus.nextBusMinutes === 'D') {
      nextBusMinutesArr.push('Delayed');
    }
    else if (nextBus.nextBusMinutes === '0') {
      nextBusMinutesArr.push('Due');
    }
    else {
      nextBusMinutesArr.push(nextBus.nextBusMinutes);
    }
  }
  let htmlSpanElement = document.createElement("span");
  htmlSpanElement.innerText = "Next bus is in ";
  nextBusInDiv.appendChild(htmlSpanElement);

  htmlSpanElement = document.createElement("span");
  htmlSpanElement.classList.add("minutes");
  htmlSpanElement.innerText = nextBusMinutesArr[0];
  nextBusInDiv.appendChild(htmlSpanElement);

  if (nextBusMinutesArr.length === 1) {
    htmlSpanElement = document.createElement("span");
    htmlSpanElement.innerText = " minutes."
    nextBusInDiv.appendChild(htmlSpanElement);
  }
  else {
    htmlSpanElement = document.createElement("span");
    htmlSpanElement.innerText = " minutes"
    nextBusInDiv.appendChild(htmlSpanElement);

    htmlSpanElement = document.createElement("span");
    htmlSpanElement.innerText = " and in "
    nextBusInDiv.appendChild(htmlSpanElement);

    htmlSpanElement = document.createElement("span");
    htmlSpanElement.classList.add("minutes");
    htmlSpanElement.innerText = nextBusMinutesArr[1];
    nextBusInDiv.appendChild(htmlSpanElement);

    htmlSpanElement = document.createElement("span");
    htmlSpanElement.innerText = " minutes."
    nextBusInDiv.appendChild(htmlSpanElement);
  }
}

async function populateSchedule(stopCode, elementId, direction) {
  const response = await fetch(baseUrl + "/schedule?route=74&direction=" + direction + "&stopCode=" + stopCode);
  const schedule = (await response.json())["74A"];

  let dailySchedule;

  let currentDay = getCurrentDay();
  if (currentDay === 'Sunday') {
    dailySchedule = schedule[2].schedule;
  }
  else if (currentDay === 'Saturday') {
    dailySchedule = schedule[1].schedule;
  } else {
    dailySchedule = schedule[0].schedule;
  }

  let currentTime = getCurrentTime();
  let times = [];
  for (let i = 0; i < dailySchedule.length; i++) {
    if (dailySchedule[i].label === currentTime) {
      times.push(...dailySchedule[i].stopTimes);
      times.push(...dailySchedule[i + 1].stopTimes);
    }
  }

  let scheduleDiv = document.getElementById(elementId);
  scheduleDiv.innerHTML = '';

  let counter = 0
  for (let time of times) {
    if (counter === 4) {
      break;
    }
    let htmlTableCellElement = document.createElement("td");
    htmlTableCellElement.innerText = time;
    scheduleDiv.append(htmlTableCellElement);
    counter++;
  }
}

function getCurrentTime() {
  return new Date().toLocaleString('en-US', {hour: 'numeric', hour12: true});
}

function getCurrentDay() {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
}

refreshUi();

setInterval(() => {
  if (new Date().getSeconds() == 0) {
    refreshUi();
  }
}, 1000);
