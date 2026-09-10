let gameStarted = false;

let studentName = "";
let studentClass = "";
let gameMode = "";
let studentResponses = [];

let selectedAnswer = "";
let selectedClues = [];

let guessMap;
let guessMarker;
let actualMarker;
let guessLine;
let panorama;

let guessedLocation = null;

let currentRound = 0;
let totalScore = 0;
let bonusScore = 0;

let gameLocations = [];

const RESPONSE_URL =
  "https://script.google.com/macros/s/AKfycbxBOUQM8EAts51mGZN5FwtwsLuFQnvKsg_5TrjUpTGCwk-eVxdm63iw-vQ0LcOId2444Q/exec";

// Hint system
let hintUsed = false;
let hintPenalty = 0;


// --------------------------------------------------
// GOOGLE MAPS CALLBACK
// --------------------------------------------------

function initStreetView() {
  // Wait for the student to click Start.
}


// --------------------------------------------------
// START SCREEN
// --------------------------------------------------

function selectGameMode(button, mode) {
  gameMode = mode;

  const modeButtons =
    document.querySelectorAll(".mode-buttons button");

  modeButtons.forEach(function(btn) {
    btn.classList.remove("mode-selected");
  });

  button.classList.add("mode-selected");
}


function startGame() {
  const warning =
    document.getElementById("start-warning");

  studentName =
    document.getElementById("student-name").value.trim();

  studentClass =
    document.getElementById("student-class").value;

  if (studentName === "") {
    warning.innerHTML =
      "Please enter your name.";
    return;
  }

  if (studentClass === "") {
    warning.innerHTML =
      "Please choose your class.";
    return;
  }

  if (gameMode === "") {
    warning.innerHTML =
      "Please choose Explore Colorado or Colorado Post-Test.";
    return;
  }

  warning.innerHTML = "";

  if (gameMode === "explore") {
    gameLocations = locations.filter(function(location) {
      return location.mode === "explore";
    });
  }

  if (gameMode === "post") {
    gameLocations = locations.filter(function(location) {
      return location.mode === "post";
    });
  }

  currentRound = 0;
  totalScore = 0;
  bonusScore = 0;
  studentResponses = [];

  document.getElementById("score-number").innerHTML = "0";

  // Hints only appear in Explore mode
  if (gameMode === "explore") {
    document.getElementById("hint-section").style.display =
      "block";
  } else {
    document.getElementById("hint-section").style.display =
      "none";
  }

  gameStarted = true;

  document.getElementById("start-screen").style.display =
    "none";

  document.getElementById("game-screen").style.display =
    "block";

  loadRound();
  initGuessMap();
}


// --------------------------------------------------
// LOAD ROUND
// --------------------------------------------------

function loadRound() {
  const currentLocation =
    gameLocations[currentRound];

  if (currentLocation.bonus === true) {
    document.getElementById("round-title").innerHTML =
      "⭐ BONUS ROUND ⭐";
  } else {
    const regularLocations =
      gameLocations.filter(function(location) {
        return location.bonus !== true;
      });

    document.getElementById("round-title").innerHTML =
      "Round " +
      (currentRound + 1) +
      " of " +
      regularLocations.length;
  }

  panorama = new google.maps.StreetViewPanorama(
    document.getElementById("street-view"),
    {
      pano: currentLocation.pano,

      pov: {
        heading: currentLocation.heading,
        pitch: currentLocation.pitch
      },

      zoom: currentLocation.zoom,

      addressControl: false,
      showRoadLabels: false,

      zoomControl: true,
      fullscreenControl: true,
      linksControl: true
    }
  );
}


// --------------------------------------------------
// HINT
// --------------------------------------------------

function showHint() {
  if (gameMode !== "explore") {
    return;
  }

  if (hintUsed === true) {
    return;
  }

  const currentLocation =
    gameLocations[currentRound];

  hintUsed = true;
  hintPenalty = 100;

  document.getElementById("hint-text").innerHTML =
    "💡 " + currentLocation.hint;

  document.getElementById("hint-button").style.display =
    "none";
}


// --------------------------------------------------
// GUESS MAP
// --------------------------------------------------

function initGuessMap() {
  guessMap = new google.maps.Map(
    document.getElementById("guess-map"),
    {
      center: {
        lat: 39.0,
        lng: -105.6
      },

      zoom: 6.75,

      mapTypeId: "terrain",

      gestureHandling: "none",
      zoomControl: false,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,

      styles: [
        {
          elementType: "labels",
          stylers: [
            { visibility: "off" }
          ]
        },
        {
          featureType: "poi",
          stylers: [
            { visibility: "off" }
          ]
        },
        {
          featureType: "transit",
          stylers: [
            { visibility: "off" }
          ]
        },
        {
          featureType: "road",
          stylers: [
            { visibility: "off" }
          ]
        }
      ]
    }
  );

  guessMap.addListener("click", function(event) {
    guessedLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };

    if (guessMarker) {
      guessMarker.setMap(null);
    }

    guessMarker = new google.maps.Marker({
      position: guessedLocation,
      map: guessMap,
      label: "G",
      title: "Your Guess"
    });
  });
}


// --------------------------------------------------
// EXPLORE → OBSERVE
// --------------------------------------------------

function goToObserveStage() {
  document.getElementById("explore-stage").style.display =
    "none";

  document.getElementById("observe-stage").style.display =
    "block";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// --------------------------------------------------
// CLUE BUTTONS
// --------------------------------------------------

function toggleClue(button, clue) {
  if (selectedClues.includes(clue)) {

    selectedClues =
      selectedClues.filter(function(item) {
        return item !== clue;
      });

    button.classList.remove("clue-selected");

  } else {

    selectedClues.push(clue);

    button.classList.add("clue-selected");
  }
}


// --------------------------------------------------
// REGION BUTTONS
// --------------------------------------------------

function selectAnswer(button, answer) {
  selectedAnswer = answer;

  const buttons =
    document.querySelectorAll(".answers button");

  buttons.forEach(function(btn) {
    btn.classList.remove("selected");
  });

  button.classList.add("selected");
}


// --------------------------------------------------
// OBSERVE → MAP
// --------------------------------------------------

function goToMapStage() {
  const warning =
    document.getElementById("observe-warning");

  const reasoning =
    document.getElementById("reasoning-box")
      .value
      .trim();

  if (selectedClues.length === 0) {
    warning.innerHTML =
      "Choose at least one clue you noticed.";
    return;
  }

  if (selectedAnswer === "") {
    warning.innerHTML =
      "Choose the Colorado region you think you are in.";
    return;
  }

  if (reasoning === "") {
    warning.innerHTML =
      "Write a short explanation of why you chose that region.";
    return;
  }

  warning.innerHTML = "";

  document.getElementById("observe-stage").style.display =
    "none";

  document.getElementById("map-stage").style.display =
    "block";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// --------------------------------------------------
// SUBMIT ROUND
// --------------------------------------------------

function checkAnswer() {
  const currentLocation =
    gameLocations[currentRound];

  const feedback =
    document.getElementById("feedback");

  const reasoning =
    document.getElementById("reasoning-box")
      .value
      .trim();

  if (guessedLocation === null) {
    feedback.innerHTML =
      "Click on the map to place your location guess!";
    return;
  }

  const regionCorrect =
    selectedAnswer === currentLocation.region;

  const actualLocation = {
    lat: currentLocation.lat,
    lng: currentLocation.lng
  };

  const distance = calculateDistance(
    guessedLocation.lat,
    guessedLocation.lng,
    actualLocation.lat,
    actualLocation.lng
  );

  let regionPoints = 0;
  let mapPoints = 0;
  let roundScore = 0;
  let maxRoundScore = 600;

  if (currentLocation.bonus === true) {

    maxRoundScore = 300;

    if (regionCorrect) {
      regionPoints = 200;
    }

    mapPoints = Math.max(
      0,
      Math.round(100 - distance)
    );

    roundScore =
      regionPoints + mapPoints;

    bonusScore += roundScore;

  } else {

    if (regionCorrect) {
      regionPoints = 400;
    }

    mapPoints = Math.max(
      0,
      Math.round(200 - distance * 2)
    );

    roundScore =
      regionPoints +
      mapPoints -
      hintPenalty;

    roundScore =
      Math.max(0, roundScore);

    totalScore += roundScore;
  }


  // Store response
const responseData = {
  student: studentName,
  className: studentClass,
  mode: gameMode,
  round: currentRound + 1,

  location: currentLocation.name,
  correctRegion: currentLocation.region,
  regionGuess: selectedAnswer,
  regionCorrect: regionCorrect,

  clues: selectedClues.join(", "),
  reasoning: reasoning,

  distanceMiles: Math.round(distance),

  hintUsed: hintUsed,
  hintPenalty: hintPenalty,

  bonus: currentLocation.bonus === true,

  regionPoints: regionPoints,
  mapPoints: mapPoints,
  roundScore: roundScore
};

studentResponses.push(responseData);

sendResponse(responseData);


  // Live score
  if (currentLocation.bonus === true) {

    document.getElementById("score-number").innerHTML =
      totalScore +
      " + " +
      bonusScore +
      " bonus";

  } else {

    document.getElementById("score-number").innerHTML =
      totalScore;
  }


  // Reveal marker and line
  if (actualMarker) {
    actualMarker.setMap(null);
  }

  if (guessLine) {
    guessLine.setMap(null);
  }

  actualMarker = new google.maps.Marker({
    position: actualLocation,
    map: guessMap,
    label: "A",
    title: "Actual Location"
  });

  guessLine = new google.maps.Polyline({
    path: [
      guessedLocation,
      actualLocation
    ],

    map: guessMap,
    geodesic: true,
    strokeOpacity: 1,
    strokeWeight: 3
  });


  // --------------------------------------------------
  // REVEAL
  // --------------------------------------------------

  let message = "";

  message +=
    "<div class='reveal-section'>";

  if (regionCorrect) {

    message +=
      "<h2>✅ Correct Region!</h2>";

  } else {

    message +=
      "<h2>❌ Correct Region: " +
      currentLocation.region +
      "</h2>";
  }

  message +=
    "<p>You were at <strong>" +
    currentLocation.name +
    "</strong>.</p>";

  message +=
    "</div>";


  message +=
    "<div class='reveal-section student-thinking'>";

  message +=
    "<strong>You noticed:</strong> " +
    selectedClues.join(", ") +
    "<br><br>";

  message +=
    "<strong>Your reasoning:</strong><br>" +
    reasoning;

  message +=
    "</div>";


  message +=
    "<div class='reveal-section'>";

  message +=
    "<h3>Why this region?</h3>";

  message +=
    "<p>" +
    currentLocation.explanation +
    "</p>";

  message +=
    "</div>";


  message +=
    "<div class='reveal-section score-summary'>";


  if (currentLocation.bonus === true) {

    message +=
      "<h3>⭐ Bonus Score: " +
      roundScore +
      " / 300</h3>";

    message +=
      "<p>Region: " +
      regionPoints +
      " / 200 &nbsp; | &nbsp; Map: " +
      mapPoints +
      " / 100</p>";

  } else {

    message +=
      "<h3>Round Score: " +
      roundScore +
      " / 600</h3>";

    message +=
      "<p>Region: " +
      regionPoints +
      " / 400 &nbsp; | &nbsp; Map: " +
      mapPoints +
      " / 200</p>";
  }


  message +=
    "<p>You were <strong>" +
    Math.round(distance) +
    " miles away</strong>.</p>";


  if (hintUsed === true) {

    message +=
      "<p>💡 Hint used: <strong>-100 points</strong></p>";
  }


  if (currentLocation.bonus === true) {

    message +=
      "<p>Main Score: <strong>" +
      totalScore +
      "</strong></p>";

    message +=
      "<p>Bonus Points: <strong>+" +
      bonusScore +
      "</strong></p>";

  } else {

    message +=
      "<p>Running Score: <strong>" +
      totalScore +
      "</strong></p>";
  }

  message +=
    "</div>";


  feedback.innerHTML =
    message;

  document.getElementById("submit-button").style.display =
    "none";

  document.getElementById("next-button").style.display =
    "inline-block";
}


// --------------------------------------------------
// NEXT ROUND
// --------------------------------------------------

function nextRound() {
  currentRound++;

  if (currentRound >= gameLocations.length) {
    endGame();
    return;
  }

  resetRound();
  loadRound();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// --------------------------------------------------
// RESET ROUND
// --------------------------------------------------

function resetRound() {
  selectedAnswer = "";
  selectedClues = [];
  guessedLocation = null;

  hintUsed = false;
  hintPenalty = 0;

  document.getElementById("feedback").innerHTML =
    "";

  document.getElementById("observe-warning").innerHTML =
    "";

  document.getElementById("reasoning-box").value =
    "";

  document.getElementById("hint-text").innerHTML =
    "";

  if (gameMode === "explore") {

    document.getElementById("hint-section").style.display =
      "block";

    document.getElementById("hint-button").style.display =
      "inline-block";

  } else {

    document.getElementById("hint-section").style.display =
      "none";
  }


  const answerButtons =
    document.querySelectorAll(".answers button");

  answerButtons.forEach(function(btn) {
    btn.classList.remove("selected");
  });


  const clueButtons =
    document.querySelectorAll(".clue-buttons button");

  clueButtons.forEach(function(btn) {
    btn.classList.remove("clue-selected");
  });


  if (guessMarker) {
    guessMarker.setMap(null);
    guessMarker = null;
  }

  if (actualMarker) {
    actualMarker.setMap(null);
    actualMarker = null;
  }

  if (guessLine) {
    guessLine.setMap(null);
    guessLine = null;
  }


  document.getElementById("explore-stage").style.display =
    "block";

  document.getElementById("observe-stage").style.display =
    "none";

  document.getElementById("map-stage").style.display =
    "none";

  document.getElementById("submit-button").style.display =
    "inline-block";

  document.getElementById("next-button").style.display =
    "none";
}


// --------------------------------------------------
// END GAME
// --------------------------------------------------

function endGame() {
  document.getElementById("round-title").innerHTML =
    "Explorer Complete!";

  document.getElementById("street-view").style.display =
    "none";

  document.getElementById("hint-section").style.display =
    "none";

  document.getElementById("explore-stage").style.display =
    "none";

  document.getElementById("observe-stage").style.display =
    "none";

  document.getElementById("map-stage").style.display =
    "none";


  const regularLocations =
    gameLocations.filter(function(location) {
      return location.bonus !== true;
    });

  const maxScore =
    regularLocations.length * 600;


  let finalMessage =
    "<div class='reveal-section'>" +

    "<h2>Great job, " +
    studentName +
    "!</h2>" +

    "<h2>Final Score</h2>" +

    "<p><strong>" +
    totalScore +
    " / " +
    maxScore +
    "</strong></p>";


  if (bonusScore > 0) {

    finalMessage +=
      "<h3>⭐ Bonus Points: +" +
      bonusScore +
      "</h3>";
  }


  finalMessage +=
    "</div>";


  document.getElementById("game-screen")
    .insertAdjacentHTML(
      "beforeend",
      finalMessage
    );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// --------------------------------------------------
// DISTANCE CALCULATION
// --------------------------------------------------

function calculateDistance(
  lat1,
  lng1,
  lat2,
  lng2
) {
  const earthRadius =
    3958.8;

  const latDifference =
    degreesToRadians(lat2 - lat1);

  const lngDifference =
    degreesToRadians(lng2 - lng1);

  const a =
    Math.sin(latDifference / 2) *
      Math.sin(latDifference / 2) +

    Math.cos(
      degreesToRadians(lat1)
    ) *

    Math.cos(
      degreesToRadians(lat2)
    ) *

    Math.sin(lngDifference / 2) *
      Math.sin(lngDifference / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadius * c;
}


function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// --------------------------------------------------
// SEND RESPONSE TO GOOGLE SHEET
// --------------------------------------------------

function sendResponse(responseData) {
  fetch(RESPONSE_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain"
    },
    body: JSON.stringify(responseData)
  })
  .catch(function(error) {
    console.error("Response could not be sent:", error);
  });
}
