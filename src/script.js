// noinspection JSIgnoredPromiseFromCall

// https://www.ttc.ca/ttcapi/routedetail/schedule?route=74&direction=0&stopCode=5518
// [{"nextBusMinutes":"8","crowdingIndex":"1"},{"nextBusMinutes":"27","crowdingIndex":"2"}]

const baseUrl = "https://www.ttc.ca/ttcapi/routedetail";

// northbound
const stClairStationAtLowerPlatform = 15306;
const mtPleasantRdAtEglintonAveEastNorthSide = 5813;
const mtPleasantRdatBlythwoodRd = 5804;

// southbound
const doncliffeLoopAtGlenEchoRd = 5518;
const mtPleasantRdAtLawrenceAveEastSouthSide = 5827
const mtPleasantRdAtStibbardAve = 5846;

function refreshUi() {
  document.getElementById("currentTime").innerText = getCurrentTime();

  populateNextBus(stClairStationAtLowerPlatform, "nb-stClairStationAtLowerPlatform-nextbus");
  populateSchedule(stClairStationAtLowerPlatform, "nb-stClairStationAtLowerPlatform-schedule", "1");

  populateNextBus(mtPleasantRdAtEglintonAveEastNorthSide, "nb-mtPleasantRdAtEglintonAveEastNorthSide-nextbus");
  populateSchedule(mtPleasantRdAtEglintonAveEastNorthSide, "nb-mtPleasantRdAtEglintonAveEastNorthSide-schedule", "1");

  populateNextBus(mtPleasantRdatBlythwoodRd, "nb-mtPleasantRdatBlythwoodRd-nextbus");
  populateSchedule(mtPleasantRdatBlythwoodRd, "nb-mtPleasantRdatBlythwoodRd-schedule", "1");

  populateNextBus(doncliffeLoopAtGlenEchoRd, "sb-doncliffeLoopAtGlenEchoRd-nextbus");
  populateSchedule(doncliffeLoopAtGlenEchoRd, "sb-doncliffeLoopAtGlenEchoRd-schedule", "0");

  populateNextBus(mtPleasantRdAtLawrenceAveEastSouthSide, "sb-mtPleasantRdAtLawrenceAveEastSouthSide-nextbus");
  populateSchedule(mtPleasantRdAtLawrenceAveEastSouthSide, "sb-mtPleasantRdAtLawrenceAveEastSouthSide-schedule", "0");

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
  const responseData = (await response.json());
  let schedule = responseData["74A"];
  if (!schedule) {
    schedule = responseData["74"];
  }

  let dailySchedule;

  let currentDay = getCurrentDay();
  if (currentDay === 'Sunday') {
    dailySchedule = schedule[2].schedule;
  }
  else if (currentDay === 'Saturday') {
    dailySchedule = schedule[1].schedule;
  }
  else {
    dailySchedule = schedule[0].schedule;
  }

  for (let i = 0; i < dailySchedule.length; i++) {
    if (!dailySchedule[i].label.startsWith('12') && dailySchedule[i].label.endsWith('PM')) {
      for (let j = 0; j < dailySchedule[i].stopTimes.length; j++) {
        let hours = dailySchedule[i].stopTimes[j].split(":")[0];
        let minutes = dailySchedule[i].stopTimes[j].split(":")[1];
        hours = 12 + parseInt(hours);
        dailySchedule[i].stopTimes[j] = `${hours}:${minutes}`;
      }
    }
  }

  let allScheduledTimes = [];
  for (let i = 0; i < dailySchedule.length; i++) {
    for (let j = 0; j < dailySchedule[i].stopTimes.length; j++) {
      allScheduledTimes.push(dailySchedule[i].stopTimes[j]);
    }
  }

  let currentTime = getCurrentTime();
  let firstTime = [];
  let times = [];

  for (let i = 0; i < allScheduledTimes.length; i++) {
    if (compareTimes(allScheduledTimes[i], currentTime) >= 0) {
      firstTime.push(allScheduledTimes[i - 1]);
      break;
    }
  }

  for (let i = 0; i < allScheduledTimes.length; i++) {
    if (compareTimes(allScheduledTimes[i], currentTime) >= 0) {
      times.push(allScheduledTimes[i]);
    }
  }

  times = [...firstTime, ...times];

  let scheduleDiv = document.getElementById(elementId);
  scheduleDiv.innerHTML = '';

  let counter = 0
  for (let time of times) {
    if (counter === 5) {
      break;
    }
    let htmlTableCellElement = document.createElement("td");
    htmlTableCellElement.innerText = time;
    if (counter === 0) {
      htmlTableCellElement.classList.add('missed');
    }
    if (counter === 1) {
      htmlTableCellElement.classList.add('next');
    }
    scheduleDiv.append(htmlTableCellElement);
    counter++;
  }
}

function compareTimes(t1, t2) {
  const [h1, m1] = t1.split(':').map(Number);
  const [h2, m2] = t2.split(':').map(Number);

  if (h1 !== h2) return h1 - h2;  // Compare hours first
  return m1 - m2;                 // Compare minutes if hours are the same
}

function getCurrentTime() {
  return new Date().toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', hour12: false});
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
