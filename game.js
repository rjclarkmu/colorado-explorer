let gameStarted = false;

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
let studentName = "";
let studentClass = "";
let gameMode = "";
let studentResponses = [];

function initStreetView() {
  // Game waits for the student to click Start.
}


function startGame() {
  gameStarted = true;

  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "block";

  loadRound();
  initGuessMap();
}


function loadRound() {
  const currentLocation = locations[currentRound];

  document.getElementById("round-title").innerHTML =
    "Round " +
    (currentRound + 1) +
    " of " +
    locations.length;

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


function goToObserveStage() {
  document.getElementById("explore-stage").style.display = "none";
  document.getElementById("observe-stage").style.display = "block";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


function toggleClue(button, clue) {
  if (selectedClues.includes(clue)) {
    selectedClues = selectedClues.filter(function(item) {
      return item !== clue;
    });

    button.classList.remove("clue-selected");
  } else {
    selectedClues.push(clue);
    button.classList.add("clue-selected");
  }
}


function selectAnswer(button, answer) {
  selectedAnswer = answer;

  const buttons =
    document.querySelectorAll(".answers button");

  buttons.forEach(function(btn) {
    btn.classList.remove("selected");
  });

  button.classList.add("selected");
}


function goToMapStage() {
  const warning =
    document.getElementById("observe-warning");

  const reasoning =
    document.getElementById("reasoning-box").value.trim();

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

  document.getElementById("observe-stage").style.display = "none";
  document.getElementById("map-stage").style.display = "block";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


function checkAnswer() {
  const currentLocation = locations[currentRound];

  const feedback =
    document.getElementById("feedback");

  const reasoning =
    document.getElementById("reasoning-box").value.trim();

  if (selectedAnswer === "") {
    feedback.innerHTML =
      "Choose a Colorado region first!";
    return;
  }

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

  if (regionCorrect) {
    regionPoints = 400;
  }

  let mapPoints = Math.max(
    0,
    Math.round(200 - distance * 2)
  );

  let roundScore =
    regionPoints + mapPoints;

  totalScore += roundScore;

  document.getElementById("score-number").innerHTML =
    totalScore;

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


  let message = "";

  // ANSWER
  message += "<div class='reveal-section'>";

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

  message += "</div>";


  // STUDENT THINKING
  message +=
    "<div class='reveal-section student-thinking'>";

  message +=
    "<strong>You noticed:</strong> " +
    selectedClues.join(", ") +
    "<br><br>";

  message +=
    "<strong>Your reasoning:</strong><br>" +
    reasoning;

  message += "</div>";


  // WHY THIS REGION
  message +=
    "<div class='reveal-section'>";

  message +=
    "<h3>Why this region?</h3>" +
    "<p>" +
    currentLocation.explanation +
    "</p>";

  message += "</div>";


  // SCORE
  message +=
    "<div class='reveal-section score-summary'>";

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

  message +=
    "<p>You were <strong>" +
    Math.round(distance) +
    " miles away</strong>.</p>";

  message +=
    "<p>Running Score: <strong>" +
    totalScore +
    "</strong></p>";

  message += "</div>";

  feedback.innerHTML = message;

  document.getElementById("submit-button").style.display =
    "none";

  document.getElementById("next-button").style.display =
    "inline-block";
}


function nextRound() {
  currentRound++;

  if (currentRound >= locations.length) {
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


function resetRound() {
  selectedAnswer = "";
  selectedClues = [];
  guessedLocation = null;

  document.getElementById("feedback").innerHTML = "";
  document.getElementById("observe-warning").innerHTML = "";
  document.getElementById("reasoning-box").value = "";

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


function endGame() {
  document.getElementById("round-title").innerHTML =
    "Explorer Complete!";

  document.getElementById("street-view").style.display =
    "none";

  document.getElementById("explore-stage").style.display =
    "none";

  document.getElementById("observe-stage").style.display =
    "none";

  document.getElementById("map-stage").style.display =
    "none";

  const maxScore =
    locations.length * 600;

  const finalMessage =
    "<div class='reveal-section'>" +
    "<h2>Great job!</h2>" +
    "<p>You explored all " +
    locations.length +
    " Colorado locations.</p>" +
    "<h2>Final Score</h2>" +
    "<p><strong>" +
    totalScore +
    " / " +
    maxScore +
    "</strong></p>" +
    "</div>";

  document.getElementById("game-screen").insertAdjacentHTML(
    "beforeend",
    finalMessage
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


function calculateDistance(lat1, lng1, lat2, lng2) {
  const earthRadius = 3958.8;

  const latDifference =
    degreesToRadians(lat2 - lat1);

  const lngDifference =
    degreesToRadians(lng2 - lng1);

  const a =
    Math.sin(latDifference / 2) *
      Math.sin(latDifference / 2) +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
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
