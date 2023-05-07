Array.from(document.body.children).forEach( ele => ele.style.display = "none" );

function htmlToElement(html) {
  let template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild;
}

$.get("https://cdn.jsdelivr.net/gh/alasdair-greenland/Samplette-Insert/tag.html", data => {
  let ele = htmlToElement(data);
  document.body.append(ele);
  postLoad();
});

$.get("cdn.jsdelivr.net/npm/youtube-mp3-converter@1.0.3/index.min.js", data => {
  
});

Array.from($("link")).forEach( ele => ele.href = "" );
$("link")[1].href = "https://cdn.jsdelivr.net/gh/alasdair-greenland/Samplette-Insert/style.css";
$("link")[2].href = "https://cdn.jsdelivr.net/gh/alasdair-greenland/Samplette-Insert/icofont.css";

const style = getComputedStyle(document.body);

function animateSongTitle(name) {

  let chars = "abcdefghijklmnopqrstuvwxyz";
  let ele = document.getElementById("song-title");
  let t = 0;
  let rCounter = 0;
  let rTimes = 2;

  let interval = setInterval( () => {

    let str = ""
    str += name.substring(0, t + 1);
    for (let i = 0; i < 2 && i + t < name.length - 1; i++) {
      str += chars[Math.floor(Math.random() * chars.length)];
    }

    ele.innerHTML = str;

    rCounter++;
    if (rCounter == rTimes) {
      rCounter = 0;
      t++;
    }

    if (t == name.length) {
      window.clearInterval(interval);
    }
    
  }, 15);
  
}

function setSongTitle(name) {

  document.getElementById("song-title").innerHTML = "";
  animateSongTitle(name);
  
}

let startSlider, endSlider, startInput, endInput;

function postLoad() {
  
  startSlider = document.getElementById("start-slider");
  endSlider = document.getElementById("end-slider");
  startInput = document.getElementById("start-input");
  endInput = document.getElementById("end-input");

  startSlider.oninput = () => sliderControlStartSlider();
  endSlider.oninput = () => sliderControlEndSlider();
  startInput.onchange = () => sliderControlStartInput();
  endInput.onchange = () => sliderControlEndInput();

  $("#preview-start")[0].onclick = evt => {
    player.seekTo(Number($("#start-slider")[0].value));
  }
  
  $("#preview-end")[0].onclick = evt => {
    player.seekTo(Number($("#end-slider")[0].value) - 2);
  }

  $("#progress-bar-box")[0].onclick = evt => {
    let x = Math.max(0, Math.min(evt.clientX - 57, $("#progress-bar-box")[0].offsetWidth - 7));
    let totalWidth = $("#progress-bar-box")[0].offsetWidth - 14;
  
    let time = ytPlayer.getDuration() * (x / totalWidth);
    ytPlayer.seekTo(time);
  }

  $("#favorite")[0].style.display = "none";

  //$("#download")[0].onclick = downloader;

  setCurrentTitle();

}

function sliderControlStartInput() {
  let [ start, end ] = sliderGetInputs();
  fillSlider();
  if (start > end - 8) {
    startSlider.value = Number(end) - 8;
    startInput.value = formatTime(end - 8);
  }
  else {
    startSlider.value = Number(start);
  }
  fillSlider();
}

function sliderControlEndInput() {
  let [ start, end ] = sliderGetInputs();
  fillSlider();
  sliderSetAccessibility(endInput);
  if (start <= end - 8) {
    endSlider.value = Number(end);
    endInput.value = formatTime(end);
  }
  else {
    endInput.value = formatTime(start + 8);
  }
  fillSlider();
}

function sliderControlStartSlider() {
  let [ start, end ] = sliderGetHandles();
  fillSlider();
  if (start > end - 8) {
    startSlider.value = Number(end) - 8;
    startInput.value = formatTime(end - 8);
  }
  else {
    startInput.value = formatTime(start);
  }
}

function sliderControlEndSlider() {
  let [ start, end ] = sliderGetHandles();
  fillSlider();
  sliderSetAccessibility(endSlider);
  if (start <= end - 8) {
    endSlider.value = Number(end);
    endInput.value = formatTime(end);
  }
  else {
    endSlider.value = Number(start) + 8;
    endInput.value = formatTime(start + 8);
  }
}

function sliderGetInputs() {
  let startArr = startInput.value.split(":");
  let start = Number(startArr[0]) * 60 + Number(startArr[1]);
  let endArr = endInput.value.split(":");
  let end = Number(endArr[0]) * 60 + Number(endArr[1]);
  return [ start, end ];
}

function sliderGetHandles() {
  let start = Number(startSlider.value);
  let end = Number(endSlider.value);
  return [ start, end ];
}

function fillSlider() {
  const sliderColor = style.getPropertyValue('--main-color');
  const rangeColor = style.getPropertyValue('--highlight-color-1');
  
  const rangeDist = endSlider.max - endSlider.min;
  const startPos = startSlider.value - endSlider.min;
  const endPos = endSlider.value - endSlider.min;

  startSlider.style.background = `linear-gradient(
    to right,
    ${sliderColor} 0%,
    ${sliderColor} ${(startPos)/(rangeDist)*100}%,
    ${rangeColor} ${((startPos)/(rangeDist))*100}%,
    ${rangeColor} ${(endPos)/(rangeDist)*100}%, 
    ${sliderColor} ${(endPos)/(rangeDist)*100}%, 
    ${sliderColor} 100%)`;
}

function sliderSetAccessibility(currentTarget) {
  let val = currentTarget.value;
  if (currentTarget == endInput) {
  }
  if (Number(val) <= 0 ) {
    endSlider.style.zIndex = 2;
  } else {
    endSlider.style.zIndex = 0;
  }
}

function formatTime(t) {
  let min = Math.floor(t / 60);
  let sec = Math.floor(t % 60);
  let ms = `${(t % 1).toFixed(1)}`[2];
  if (sec < 10) {
    sec = "0" + sec;
  }
  return `${min}:${sec}.${ms}`;
}

let progressBarUpdateInterval = setInterval(updateProgressBar, 100);

let oldStateChange = onPlayerStateChange.bind({});

onPlayerStateChange = evt => {
  oldStateChange(evt);
  if (evt.data == -1) {
    if (player.getDuration() == 0) return;
    $('#end-time')[0].innerHTML = formatTime(player.getDuration());
    $("#end-slider")[0].max = player.getDuration();
    $("#end-slider")[0].value = Math.min(Number($("#end-slider")[0].value) || player.getDuration(), player.getDuration());
    $("#end-input")[0].value = formatTime(player.getDuration());
    $("#start-slider")[0].value = Math.min($("#start-slider")[0].value, player.getDuration());
    $("#start-slider")[0].max = player.getDuration();
    fillSlider();
  }
}

function updateProgressBar() {
  // Update the value of our progress bar accordingly.
  let ratio = (player.getCurrentTime() / player.getDuration());
  let totalWidth = $("#progress-bar-box")[0].offsetWidth - 14;
  let width = ratio * totalWidth + 8;
  
  $('#progress-bar')[0].style.width = `${width}px`;
  $('#start-time')[0].innerHTML = formatTime(player.getCurrentTime());

  let paused = (player.getPlayerState() != 1);
  if (paused) {
    $("#start-stop")[0].firstChild.className = "icofont-ui-play";
  }
  else {
    $("#start-stop")[0].firstChild.className = "icofont-ui-pause";
  }

  if (player.getCurrentTime() > Number($("#end-slider")[0].value)) {
    player.stopVideo();
  }

  if (player.getCurrentTime() < Number($("#start-slider")[0].value)) {
    player.seekTo(Number($("#start-slider")[0].value));
  }
}

function togglePlayback() {
  let paused = (player.getPlayerState() != 1);
  if (!paused) {
    $("#start-stop")[0].firstChild.className = "icofont-ui-play";
    player.pauseVideo();
  }
  else {
    $("#start-stop")[0].firstChild.className = "icofont-ui-pause";
    player.playVideo();
  }
}

function getASong() {
  url();
  setCurrentTitle();
  setDownloadButton();
}

function setCurrentTitle() {
  let title = $(".sample-discogs-artist")[0].innerHTML + " - " + $(".sample-title-div")[0].innerHTML;
  if (title.split("-").length > 2) {
    setSongTitle($(".sample-title-div").innerHTML);
  }
  else {
    setSongTitle(title);
  }
}

// manage the downloads or wtv

class mp3cutter {
	//libPath must end with a slash
	constructor(libPath = "./lib/", log = false) {
        self.Mp3LameEncoderConfig = {
			memoryInitializerPrefixURL: libPath,
			TOTAL_MEMORY: 1073741824,
		};
		this.libPath = libPath;
		this.log = log;

		var ref = document.getElementsByTagName("script")[0];
		var script = document.createElement("script");

		script.src = this.libPath + "Mp3LameEncoder.min.js";
		ref.parentNode.insertBefore(script, ref);
	}

	logger(message) {
		if (this.log)
			console.log(message);
	}

	async cut(src, start, end, callback , bitrate = 192) {
		if (!src)
			throw 'Invalid parameters!';

		if (start > end)
			throw 'Start is bigger than end!';
		else if (start < 0 || end < 0)
			throw 'Start or end is negative, cannot process';

		this.start = start;
		this.end = end;
		this.callback = callback;
		this.bitrate = bitrate;

		// Convert blob into ArrayBuffer
		let buffer = await new Response(src).arrayBuffer();
		this.audioContext = new AudioContext();

		//Convert ArrayBuffer into AudioBuffer
		this.audioContext.decodeAudioData(buffer).then((decodedData) => this.computeData(decodedData));
	}

	computeData (decodedData) {
		this.logger(decodedData);
		//Compute start and end values in secondes
		let computedStart = decodedData.length * this.start / decodedData.duration;
		let computedEnd = decodedData.length * this.end / decodedData.duration;

		//Create a new buffer
		const newBuffer = this.audioContext.createBuffer(decodedData.numberOfChannels, computedEnd - computedStart , decodedData.sampleRate)

		// Copy from old buffer to new with the right slice.
		// At this point, the audio has been cut
		for (var i = 0; i < decodedData.numberOfChannels; i++) {
			newBuffer.copyToChannel(decodedData.getChannelData(i).slice(computedStart, computedEnd), i)
		}

		this.logger(newBuffer);

		// Bitrate is  by default 192, but can be whatever you want
		let encoder = new Mp3LameEncoder(newBuffer.sampleRate, this.bitrate);

		//Recreate Object from AudioBuffer
		let formattedArray = {
			channels: Array.apply(null, { length: (newBuffer.numberOfChannels - 1) - 0 + 1 }).map((v, i) => i + 0).map(i => newBuffer.getChannelData(i)),
			sampleRate: newBuffer.sampleRate,
			length: newBuffer.length,
		};

		this.logger(formattedArray);

		//Encode into mp3
		encoder.encode(formattedArray.channels);

		//When encoder has finished
		let compressed_blob = encoder.finish();

		this.logger(compressed_blob);

		this.logger(URL.createObjectURL(compressed_blob));

		this.callback(compressed_blob);
	}
}

function downloadBlob(blob, name = 'file.txt') {
  if (
    window.navigator && 
    window.navigator.msSaveOrOpenBlob
  ) return window.navigator.msSaveOrOpenBlob(blob);

  // For other browsers:
  // Create a link pointing to the ObjectURL containing the blob.
  const data = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = data;
  link.download = name;

  // this is necessary as link.click() does not work on the latest firefox
  link.dispatchEvent(
    new MouseEvent('click', { 
      bubbles: true, 
      cancelable: true, 
      view: window 
    })
  );

  setTimeout(() => {
    // For Firefox it is necessary to delay revoking the ObjectURL
    window.URL.revokeObjectURL(data);
    link.remove();
  }, 100);
}
      
function downloader() {
  let start = $("#start-slider")[0].value;
  let end = $("#end-slider")[0].value;
  let url =
    'https://t-one-youtube-converter.p.rapidapi.com/api/v1/createProcess' +
    '?url=' + player.getVideoUrl() +
    '&format=mp3' +
    '&responseFormat=json' +
    '&stop=' + end +
    '&start=' + start +
    '&lang=en'
  console.log(url);
  const settings = {
  	async: true,
  	crossDomain: true,
  	url: url,
  	method: 'GET',
  	headers: {
  		'X-RapidAPI-Key': 'fcf139f465msh27d763bd1e66fd6p13be21jsn0768bb1f7540',
  		'X-RapidAPI-Host': 't-one-youtube-converter.p.rapidapi.com'
  	}
  };
  
  $.ajax(settings).done(res => {
    console.log(res);
    let newUrl = res.file;
    console.log(newUrl);
    return;
    $.get(newUrl, data => {
      //console.log(data);
    	let reader = data.body.getReader();
      reader.read().then(result => {
        console.log(result);
        let blob = new Blob([result.value], { type: "audio/mp3" });
        let cutter = new mp3cutter();
        cutter.cut(blob, start, end, trimmed => {
          downloadBlob(trimmed, $("#song-title")[0].innerHTML + " (cut).mp3");
        });
      });
    });
  });
}

function setDownloadButton() {
  let url = player.getVideoUrl();
  $("#download")[0].href = "https://youtubemp3free.org/button.php?link=" + url;
}
