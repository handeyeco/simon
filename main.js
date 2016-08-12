$(function () {
  // Collect Selectors
  var menuButton    = $('#menu-btn'),
      menu          = $('#menu'),
      playButton    = $('#play-btn'),
      statusIcon    = $('#status-icon'),
      score         = $('#score'),
      colorButtons  = $('.color-btn'),
      loser         = $('.loser'),
      resetButton   = $('#reset-btn'),
      strictButton  = $('#strict-btn'),
      winner        = $('.winner');

  // State
  var state = {
    // Sctrict mode boolean
    strict: false,
    // Status: "playback", "recording", "waiting", "paused"
    status: "waiting",
    // Array of computer moves
    playback: [],
    playbackCounter: 0,
    // Array of user moves
    userInput: [],
    audio: {
      green: new Audio('simon-green.mp3'),
      red: new Audio('simon-red.mp3'),
      yellow: new Audio('simon-yellow.mp3'),
      blue: new Audio('simon-blue.mp3'),
      error: new Audio('simon-error.mp3'),
      win: new Audio('simon-win.mp3')
    },
    timeouts: []
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

  function clearGameTimeouts () {
    state.timeouts.forEach(function (elem) {
      window.clearTimout(elem);
    });

    state.timeouts = [];
  }

  /* =========================== */
  /* =========================== */
  //            Menu
  /* =========================== */
  /* =========================== */
  $(menuButton).click(function () {
    pauseGame();
    updateStatusIcon();
    $(menu).fadeToggle();
  });

  $(resetButton).click(function () {
    $(this).addClass('active');
    resetGame();
  });

  function resetGame() {
    clearGameTimeouts();

    state.status = "waiting";
    state.playback = [];
    state.playbackCounter = 0;
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
    $(resetButton).removeClass('active');

    if (state.status === "waiting") {
      startRound();
    } else if (state.status === "paused") {
      playback();
      updateStatusIcon();
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
    if (state.playback.length === 20) {
      state.audio.win.play();
      $(winner).addClass('active');
    } else {
      $(winner).removeClass('active');
    }

    window.setTimeout(function () {
      state.playbackCounter = 0;
      addRound();
      playback();
      updateStatusIcon();
    }, 600);

  }

  function playback() {
    state.status = "playback";
    console.log(state.status);
    $(colorButtons).removeClass('active');

    var color = state.playback[state.playbackCounter],
        current = "#" + color;

    $(current).addClass('active');
    state.audio[color].play();

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

    var color = event.target.id;

    state.audio[color].play();
    state.userInput.push(color);

    if (arrayEqual(state.userInput, state.playback)) {
      window.setTimeout(startRound, 1000);
    } else {
      var position = state.userInput.length - 1;

      if (state.playback[position] !== state.userInput[position]) {
        window.setTimeout(handleError, 1000);
      }
    }
  }

  function handleError() {
    state.audio.error.play();

    state.playbackCounter = 0;
    $(loser).addClass('active');
    window.setTimeout(function () {
      $(loser).removeClass('active');
    }, 6000);

    if (state.strict) {
      window.setTimeout(resetGame, 1000);
    } else {
      window.setTimeout(playback, 1000);
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
    state.status = "paused";
    state.userInput = [];
    state.playbackCounter = 0;
    updateStatusIcon();
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
