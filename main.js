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
  var returnInitialState = function () {
    return {
      // Strict mode boolean
      strict: false,
      // Status: "playback", "recording", "waiting", "paused"
      status: "waiting",
      // Array of computer moves
      playback: [],
      playbackCounter: 0,
      // Array of user moves
      userInput: [],
      timeouts: []
    };
  }

  var state = returnInitialState();

  var audio = {
    green: new Audio('http://simon.matthewbryancurtis.com/simon-green.mp3'),
    red: new Audio('http://simon.matthewbryancurtis.com/simon-red.mp3'),
    yellow: new Audio('http://simon.matthewbryancurtis.com/simon-yellow.mp3'),
    blue: new Audio('http://simon.matthewbryancurtis.com/simon-blue.mp3'),
    error: new Audio('http://simon.matthewbryancurtis.com/simon-error.mp3'),
    win: new Audio('http://simon.matthewbryancurtis.com/simon-win.mp3')
  }

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
      window.clearTimeout(elem);
    });

    state.timeouts = [];
  }

  /* =========================== */
  /* =========================== */
  //            Menu
  /* =========================== */
  /* =========================== */
  $(menuButton).click(function () {
    if (state.status === "playback" || state.status === "recording") {
      pauseGame();
    }
    updateStatusIcon();
    $(menu).fadeToggle();
  });

  $(resetButton).click(function () {
    $(this).addClass('active');
    resetGame();
  });

  $(strictButton).click(function () {
    $(this).toggleClass('active');
    state.strict = !state.strict;
  })

  function resetGame() {
    clearGameTimeouts();

    var strict = state.strict || false;

    state = returnInitialState();

    state.strict = strict;

    console.log(state.status);

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

    updateStatusIcon();
  }

  $(playButton).click(handlePlayButtonClick);

  /* =========================== */
  /* =========================== */
  //         Gameplay
  /* =========================== */
  /* =========================== */
  function startRound() {
    if (state.playback.length === 20) {
      audio.win.play();
      $(winner).addClass('active');
    } else {
      $(winner).removeClass('active');
    }

    state.timeouts.push(window.setTimeout(function () {
      state.playbackCounter = 0;
      addRound();
      playback();
      updateStatusIcon();
    }, 600));

  }

  function playback() {
    state.status = "playback";
    $(colorButtons).removeClass('active');

    var color = state.playback[state.playbackCounter],
        current = "#" + color;

    $(current).addClass('active');
    audio[color].play();

    state.playbackCounter += 1;

    if (state.playback.length > state.playbackCounter) {
      state.timeouts.push(window.setTimeout(playback, 1000));
    } else {
      state.timeouts.push(window.setTimeout(startRecording, 1000));
    }
  }

  function startRecording() {
    state.status = "recording";
    state.userInput = [];
    $(colorButtons).removeClass('active');
  }

  function handleColorButtonClick(event) {
    $(colorButtons).removeClass('active');

    if (state.status !== "recording" || state.userInput >= state.playback) {
      return;
    }

    var color = event.target.id;

    audio[color].play();
    state.userInput.push(color);

    if (arrayEqual(state.userInput, state.playback)) {
      state.timeouts.push(window.setTimeout(startRound, 1000));
    } else {
      var position = state.userInput.length - 1;

      if (state.playback[position] !== state.userInput[position]) {
        state.timeouts.push(window.setTimeout(handleError, 1000));
      }
    }
  }

  function handleError() {
    audio.error.play();

    state.playbackCounter = 0;
    $(loser).addClass('active');
    window.setTimeout(function () {
      $(loser).removeClass('active');
    }, 6000);

    if (state.strict) {
      state.timeouts.push(window.setTimeout(resetGame, 1000));
    } else {
      state.timeouts.push(window.setTimeout(playback, 1000));
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
