   //swiper slider
   var swiper = new Swiper('.sliderFirst', {
      loop: true,
     navigation: {
       nextEl: '.button-next',
       prevEl: '.button-prev',
     },
   });


   // drage and drop
var makeUnselectable = function ($target) {
  $target
    .addClass('unselectable') // All these attributes are inheritable
    .attr('unselectable', 'on') // For IE9 - This property is not inherited, needs to be placed onto everything
    .attr('draggable', 'false') // For moz and webkit, although Firefox 16 ignores this when -moz-user-select: none; is set, it's like these properties are mutually exclusive, seems to be a bug.
    .on('dragstart', function () {
      return false;
    }); // Needed since Firefox 16 seems to ingore the 'draggable' attribute we just applied above when '-moz-user-select: none' is applied to the CSS 

  $target // Apply non-inheritable properties to the child elements
    .find('*')
    .attr('draggable', 'false')
    .attr('unselectable', 'on');
};

   function handleDragStart(e) {

     source = this;

     e.dataTransfer.effectAllowed = 'move';
     e.dataTransfer.setData('text', this.innerHTML);

   }

   function handleDragOver(e) {

     if (e.preventDefault) {
       e.preventDefault();
     }
     this.classList.add('over');

     return false;
   }

   function handleDragLeave(e) {

     this.classList.remove('over');

   }

   function handleDrop(e) {

     if (e.preventDefault) {
       e.preventDefault();

     }
     this.classList.remove('over');

     source.innerHTML = this.innerHTML;
     this.innerHTML = e.dataTransfer.getData('text');
   }

   var fras = document.querySelectorAll('.frame');
   [].forEach.call(fras, function (fra) {
     fra.addEventListener('dragstart', handleDragStart, false);
     fra.addEventListener('dragover', handleDragOver, false);
     fra.addEventListener('dragleave', handleDragLeave, false);
     fra.addEventListener('drop', handleDrop, false);
   });


//video
$('#play-video').on('click', function (e) {
  e.preventDefault();
  $('#video-overlay').addClass('open');
  $("#video-overlay").append('<iframe width="100%" height="100%" src="https://www.youtube.com/embed/gKD5vLWUdLM" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>');
  $("html,body").css("overflow", "hidden");
});

$('.video-overlay, .video-overlay-close').on('click', function (e) {
  e.preventDefault();
  close_video();
});

$(document).keyup(function (e) {
  if (e.keyCode === 27) {
    close_video().click;
  }
});

function close_video() {
  $('.video-overlay.open').removeClass('open').find('iframe').remove();
   $("html,body").css("overflow", "visible");
};

//record


let preview = document.getElementById("preview");
let recording = document.getElementById("recording");
let startButton = document.getElementById("startButton");
let stopButton = document.getElementById("stopButton");
let downloadButton = document.getElementById("downloadButton");

let recordingTimeMS = 60000;

function log(msg) {
  logElement.innerHTML += msg + "\n";
}

function wait(delayInMS) {
  return new Promise((resolve) => setTimeout(resolve, delayInMS));
}

function startRecording(stream, lengthInMS) {
  let recorder = new MediaRecorder(stream);
  let data = [];

  recorder.ondataavailable = (event) => data.push(event.data);
  recorder.start();
  log(recorder.state + " for " + lengthInMS / 1000 + " seconds...");

  let stopped = new Promise((resolve, reject) => {
    recorder.onstop = resolve;
    recorder.onerror = (event) => reject(event.name);
  });

  let recorded = wait(lengthInMS).then(
    () => recorder.state == "recording" && recorder.stop()
  );

  return Promise.all([stopped, recorded]).then(() => data);
}

function stop(stream) {
  stream.getTracks().forEach((track) => track.stop());
}
startButton.addEventListener(
  "click",
  function () {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true
      })
      .then((stream) => {
        preview.srcObject = stream;
        downloadButton.href = stream;
        preview.captureStream =
          preview.captureStream || preview.mozCaptureStream;
        return new Promise((resolve) => (preview.onplaying = resolve));
      })
      .then(() => startRecording(preview.captureStream(), recordingTimeMS))
      .then((recordedChunks) => {
        let recordedBlob = new Blob(recordedChunks, {
          type: "video/webm"
        });
        recording.src = URL.createObjectURL(recordedBlob);
        downloadButton.href = recording.src;
        downloadButton.download = "RecordedVideo.webm";

      })
  },
  false
);
stopButton.addEventListener(
  "click",
  function () {
    stop(preview.srcObject);
  },
  false
);
