const imageInput = document.getElementById("imageInput");
const captionInput = document.getElementById("captionInput");
const photo = document.getElementById("photo");
const captionDisplay = document.getElementById("captionDisplay");

const voiceSelect = document.getElementById("voiceSelect");
const speed = document.getElementById("speed");
const fontSize = document.getElementById("fontSize");
const textColor = document.getElementById("textColor");
const highlightColor = document.getElementById("highlightColor");

const previewBtn = document.getElementById("previewBtn");
const generateBtn = document.getElementById("generateBtn");
const saveBtn = document.getElementById("saveBtn");

let voices = [];
let words = [];

/* ===========================
   LOAD IMAGE
=========================== */

imageInput.addEventListener("change", function(){

    const file = this.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(e){

        photo.src = e.target.result;
        photo.style.display = "block";

    };

    reader.readAsDataURL(file);

});

/* ===========================
   UPDATE CAPTION
=========================== */

captionInput.addEventListener("input", updateCaption);

function updateCaption(){

    const text = captionInput.value.trim();

    if(text===""){

        captionDisplay.innerHTML="YOUR CAPTION APPEARS HERE";
        return;

    }

    words = text.split(" ");

    captionDisplay.innerHTML = words
        .map(word=>`<span>${word}</span>`)
        .join(" ");

}

/* ===========================
   FONT SIZE
=========================== */

fontSize.addEventListener("input",function(){

    captionDisplay.style.fontSize=this.value+"px";

});

/* ===========================
   TEXT COLOR
=========================== */

textColor.addEventListener("input",function(){

    captionDisplay.style.color=this.value;

});

/* ===========================
   HIGHLIGHT COLOR
=========================== */

highlightColor.addEventListener("input",function(){

    document.documentElement.style.setProperty(
        "--accent",
        this.value
    );

});

/* ===========================
   LOAD VOICES
=========================== */

function loadVoices(){

    voices=speechSynthesis.getVoices();

    voiceSelect.innerHTML="";

    voices.forEach((voice,index)=>{

        const option=document.createElement("option");

        option.value=index;
        option.textContent=voice.name;

        voiceSelect.appendChild(option);

    });

}

loadVoices();

speechSynthesis.onvoiceschanged=loadVoices;
/* ===========================
   PREVIEW VOICE
=========================== */

previewBtn.addEventListener("click", previewCaption);

function previewCaption(){

    const text = captionInput.value.trim();

    if(text === ""){

        alert("Please enter a caption.");
        return;

    }

    speechSynthesis.cancel();

    updateCaption();

    const spans = captionDisplay.querySelectorAll("span");

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.voice = voices[voiceSelect.value];

    utterance.rate = parseFloat(speed.value);

    let currentWord = 0;

    utterance.onboundary = function(event){

        if(event.name === "word"){

            spans.forEach(span=>{

                span.classList.remove("highlight");

            });

            if(spans[currentWord]){

                spans[currentWord].classList.add("highlight");

            }

            currentWord++;

        }

    };

    utterance.onend = function(){

        spans.forEach(span=>{

            span.classList.remove("highlight");

        });

    };

    speechSynthesis.speak(utterance);

}

/* ===========================
   STOP CURRENT SPEECH
=========================== */

window.addEventListener("beforeunload",function(){

    speechSynthesis.cancel();

});

/* ===========================
   GENERATE BUTTON
=========================== */

generateBtn.addEventListener("click",function(){

    previewCaption();

});/* ===========================
   VIDEO RECORDING
=========================== */

let mediaRecorder;
let recordedChunks = [];
let recordedBlob = null;

async function startRecording(){

    recordedChunks = [];

    const stream = document.getElementById("preview").captureStream(30);

    mediaRecorder = new MediaRecorder(stream,{
        mimeType:"video/webm"
    });

    mediaRecorder.ondataavailable = function(event){

        if(event.data.size > 0){

            recordedChunks.push(event.data);

        }

    };

    mediaRecorder.onstop = function(){

        recordedBlob = new Blob(recordedChunks,{
            type:"video/webm"
        });

        alert("Video is ready to save.");

    };

    mediaRecorder.start();

}

function stopRecording(){

    if(mediaRecorder &&
       mediaRecorder.state !== "inactive"){

        mediaRecorder.stop();

    }

}

/* ===========================
   GENERATE VIDEO
=========================== */

generateBtn.addEventListener("click",async function(){

    const text = captionInput.value.trim();

    if(text===""){

        alert("Please enter a caption.");
        return;

    }

    await startRecording();

    speechSynthesis.cancel();

    updateCaption();

    const spans = captionDisplay.querySelectorAll("span");

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.voice = voices[voiceSelect.value];

    utterance.rate = parseFloat(speed.value);

    let currentWord = 0;

    utterance.onboundary = function(event){

        if(event.name === "word"){

            spans.forEach(span=>{

                span.classList.remove("highlight");

            });

            if(spans[currentWord]){

                spans[currentWord].classList.add("highlight");

            }

            currentWord++;

        }

    };

    utterance.onend = function(){

        spans.forEach(span=>{

            span.classList.remove("highlight");

        });

        stopRecording();

    };

    speechSynthesis.speak(utterance);

});

/* ===========================
   SAVE VIDEO
=========================== */

saveBtn.addEventListener("click",function(){

    if(!recordedBlob){

        alert("Generate a video first.");
        return;

    }

    const url = URL.createObjectURL(recordedBlob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "Phathu_Caption_Video.webm";

    a.click();

    URL.revokeObjectURL(url);

});
