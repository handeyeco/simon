$(function () {
  // Collect Selectors
  var menuButton    = $('#menu-btn'),
      menu          = $('#menu'),
      playButton    = $('#play-btn'),
      statusIcon    = $('#status-icon'),
      score         = $('#score'),
      colorButtons  = $('.color-btn');

  // State
  var state = {
    // Sctrict mode boolean
    strict: true,
    // Status: "playback", "recording", "waiting", "paused"
    status: "waiting",
    // Array of computer moves
    playback: [],
    playbackCounter: 0,
    // Array of user moves
    userInput: [],
    audio: {
      green: new Audio(),
      red: new Audio(),
      yellow: new Audio(),
      blue: new Audio(),
      error: new Audio()
    }
  };

  /* =========================== */
  /* =========================== */
  //          Utilities
  /* =========================== */
  /* =========================== */
  function arrayEqual (arr1, arr2) {
    if (arr1.length != arr2.length) { return false; }

    for (var i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) { return false; }
    }

    return true;
  }

  /* =========================== */
  /* =========================== */
  //            Menu
  /* =========================== */
  /* =========================== */
  $(menuButton).click(function () {
    $(menu).fadeToggle();
  });

  function resetGame() {
    state.status = "waiting";
    state.playback = [];
    state.userInput = [];

    $(colorButtons).removeClass('active');

    updateStatusIcon();
    updateScore();
  };

  /* =========================== */
  /* =========================== */
  //     Play Btn / Status Icon
  /* =========================== */
  /* =========================== */
  function updateStatusIcon() {
    $(statusIcon).removeClass('play-icon pause-icon');

    if (state.status === "waiting" || state.status === "paused") {
      $(statusIcon).addClass('play-icon');
    } else {
      $(statusIcon).addClass('pause-icon');
    }
  }

  function handlePlayButtonClick() {
    if (state.status === "waiting") {
      startRound();
    } else if (state.status === "paused") {
      playback();
    } else {
      pauseGame();
    }
  }

  $(playButton).click(handlePlayButtonClick);

  /* =========================== */
  /* =========================== */
  //         Gameplay
  /* =========================== */
  /* =========================== */
  function startRound() {
    state.playbackCounter = 0;
    addRound();
    playback();
    updateStatusIcon();
  }

  function playback() {
    state.status = "playback";
    console.log(state.status);
    $(colorButtons).removeClass('active');

    var current = "#" + state.playback[state.playbackCounter];
    console.log(state);

    $(current).addClass('active');

    state.playbackCounter += 1;

    if (state.playback.length > state.playbackCounter) {
      window.setTimeout(playback, 1000);
    } else {
      window.setTimeout(startRecording, 1000);
    }
  }

  function startRecording() {
    state.status = "recording";
    state.userInput = [];
    console.log(state.status);
    $(colorButtons).removeClass('active');
  }

  function handleColorButtonClick(event) {
    $(colorButtons).removeClass('active');

    if (state.status !== "recording") {
      return;
    }

    state.userInput.push(event.target.id);

    if (arrayEqual(state.userInput, state.playback)) { startRound(); }
    else {
      var position = state.userInput.length - 1;

      if (state.playback[position] !== state.userInput[position]) {
        handleError();
      }
    }
  }

  function handleError() {
    state.playbackCounter = 0;

    if (state.strict) {
      resetGame();
    } else {
      playback();
    }
  }

  $(colorButtons).mousedown(function() {
    if (state.status === "recording") {
      $(this).addClass('active');
    }
  });

  $(colorButtons).mouseup(handleColorButtonClick);

  function addRound() {
    var num = Math.random();

    if (num < 0.25) {
      state.playback.push("green");
    } else if (num < 0.5) {
      state.playback.push("red");
    } else if (num < 0.75) {
      state.playback.push("yellow");
    } else {
      state.playback.push("blue");
    }

    updateScore();

  }

  function pauseGame() {

  }

  /* =========================== */
  /* =========================== */
  //         Score Board
  /* =========================== */
  /* =========================== */
  function updateScore() {
    $(score).text(padZeros(state.playback.length));
  }

  function padZeros(num) {
    num = num + "";
    if (num.length < 2) {
      num = "0" + num;
    }
    return num;
  }

  /* =========================== */
  /* =========================== */
  //         Initialize
  /* =========================== */
  /* =========================== */
  resetGame();

});
