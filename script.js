/*
 * IDB Programming: A3 — a musical instrument
 *
 * All of the code for your instrument goes in this file. It's split into sections:
 *   settings — the "fixed" parts of your program
 *   state    — the parts of your program that change over time
 *   sound    — the Tone.js instruments and effects
 *   update   — updates the state every 100ms, if necessary
 *   use      — uses the state to make sound and shapes every 100ms, if necessary
 *   controls — what happens when the player uses the pointer
 *   setup    — starts everything
 *
 * The pointer events change the state. update() and use() each run every
 * 100ms, in a loop:
 *   1. update: change the state, e.g. based on time or on the pointer's movement
 *   2. use:    make sound and move shapes, based on the state
 *
 * Shapes come from shape.js: createShape() makes one, and its methods
 * (setPosition, setSize, setColour ...) change it.
 *
 * Tone.js documentation: https://tonejs.github.io/docs/15.1.22/
 */

import { createShape } from "./shape.js";

// ---------- Settings ----------
// Settings variables should contain all of the "fixed" parts of your programs
// For example: which notes you can play, how fast things move, the tempo.

// drawing
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const context = canvas.getContext("2d");

const square = createShape("square");

const Piano_notes = [
  ["A4", "C4", "E4", "G4"],
  ["B4", "D4", "E4", "G4"],
  ["A4", "C4", "D4", "F4"],
  ["E4", "G4", "B4", "D4"],
];
const volume = new Tone.Volume(-10).toDestination();
const Piano_samples = new Tone.Sampler ({
  urls: {
  A4: "A.wav",
  B4: "B.wav",
  C4: "C.wav",
  D4: "D.wav",
  E4: "E.wav",
  F4: "F.wav",
  G4: "G.wav" },
  baseUrl: "./Sfx/Piano/"
}).connect(volume);

const lopo_vol = new Tone.Volume(-15).toDestination();
const loop = new Tone.Sampler ({
  urls:{
    A1: "Guitar_intro.wav",
    A2: "Guitar_loop.wav",
    A3: "Voice_loop.wav"
  },
  baseUrl: "./Sfx/"
}).connect(lopo_vol)

const images = [
  "Arm.png",
  "Closed_Player.png",
  "Open_Player.png",
  "Piano.png",
  "Record_combined.png",
  "Record_guitar.png",
  "Record_voice.png",
  "Slider.png"
]

// ---------- State ----------
// State variables are the parts of your program that change over time.
// For example: where the pointer is, how fast it's moving, or whether a drone is on.
let pos_x = 0;
let pos_y = 0;
let lastX = 0;
let lastY = 0;
let last_note_pos_x = 0;
let last_note_pos_y = 0;
let lastTime = 0;
let speeds = []
let playability = true
let previous_note = "A4"
let loop_is_playing = false

let measure_index = -1;

let intro_started = false

let square_size = 10


// ---------- Sound ----------
// Make the instruments and plug them into the speakers.
const synth = new Tone.PolySynth(Tone.Synth).toDestination(); // can play several notes at once

// ---------- Update ----------
// Update the state. This is called every 100ms.
function update() {
  square_size_minus(0.5, 10)

  setTimeout(update, 20); // call update() again in 100 milliseconds
}

// ---------- Use ----------
// Use the state to make sound and move shapes. This is called every 100ms.
function use() {
  setTimeout(use, 100); // call use() again in 100 milliseconds
}

// ---------- Controls (Event Handlers) ----------
// Runs every time the pointer goes down: a click, a tap or a pen touch.
function pointerDown(event) {
  Tone.start(); // browsers only allow sound after the player has pressed something

  if (!intro_started){
    measure_iterator()
    loop.triggerAttackRelease("A1", 6)
    intro_started = true
    setTimeout(function (){
      loop_is_playing = true
      play_loop()
      loop.triggerAttackRelease("A2", 12)
      loop.triggerAttackRelease("A3", 12)
    }, 3000)
  }
}

function pointerMove(event) {
  if (loop_is_playing && measure_index != -1){

  pos_x = event.clientX
  pos_y = event.clientY

  let normX = pos_x / window.innerWidth;
  let normY = pos_y / window.innerHeight;
  let now = Date.now();
  let distance = Math.hypot(normX - lastX, normY - lastY);
  let seconds = (now - lastTime) / 1000;
  let speed = distance / seconds;
  lastX = normX;
  lastY = normY;
  lastTime = now;
  play_random_note(speed, event)
  square_size_minus(1, 20)
  }

}

// ---------- Setup ----------
// Setup is run once, at the start of the program. It sets everything up for us!
function setup() {
  update(); // start the update loop
  use(); // start the use loop
  // Example: a shape near the middle of the window. Replace it with your own.

  square.setPosition(0.5, 0.5)
  square.setSize(square_size)
  square.setColour(35)
  // Put your event listener code here
  window.addEventListener("pointerdown", pointerDown);
  window.addEventListener("pointermove", pointerMove);
}



function play_random_note(s, e){
let difference = 0;
  difference = Math.abs(speeds[speeds.length-1] - s )

  speeds.push(s);

  if (speeds.length >= 5) {
    let total = 0;

    for (let i = speeds.length - 5; i < speeds.length; i++) {
      total += speeds[i];
    }

    let average = total / 5;

    if (difference >= 0.2 && playability && average >= 0.5){
        let pos_dif = Math.hypot((e.clientY / window.innerHeight - last_note_pos_y)
        - (e.clientX / window.innerWidth - last_note_pos_x))

        // let volume_change = -13 + pos_dif * 25

        // if (volume_change >= -5) {
        //   volume_change = -5;
        // }

        // volume.volume.value = volume_change

        let random_note = Piano_notes[measure_index][
        Math.floor(Math.random() * Piano_notes[measure_index].length)]

        while (previous_note === random_note) {
        random_note = Piano_notes[measure_index][
          Math.floor(Math.random() * Piano_notes[measure_index].length)]
        }

        last_note_pos_y = e.clientY / window.innerHeight;
        last_note_pos_x = e.clientX / window.innerHeight;
        previous_note = random_note

        if (square_size <= 150){
        square_size += 35
        }

        Tone.loaded().then( function() {
        Piano_samples.triggerAttackRelease(random_note, 9);
        })

      playability = false
    }
    else if (average <= 0.3){
      playability = true
    }
  }
}

function draw_each_element(image_string, size, x, y) {
  const image = new Image();
  image.src = "./Visuals/" + image_string;

  image.onload = function () {
    context.save();
    context.translate(x + canvas.width / 2, y + canvas.height / 2);
    context.drawImage(image, -size / 2, -size / 2, size, size);
    context.restore();
  };
}

draw_each_element(images[3], 1000, 0, 0)


setup(); // Always remember to call setup()!

function play_loop(){
  setTimeout(function (){
    loop.triggerAttackRelease("A2", 12)
    loop.triggerAttackRelease("A3", 12)
    play_loop()
  }, 12000);
}

function measure_iterator(){
  setTimeout(function (){
    measure_index++
    if (measure_index === 4){
      measure_index = 0
    }
    measure_iterator()
  },3000)
}

function square_size_minus(amount, threshold){
  square.setPositionPixels(pos_x-square_size/2, pos_y-square_size/2)
  if (square_size >= threshold){
  square_size -= amount
  square.setSize(square_size)
  }
}
