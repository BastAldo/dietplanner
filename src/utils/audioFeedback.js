let audioContext = null;
const synth = window.speechSynthesis;
let voices = [];

function getAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser");
        }
    }
    return audioContext;
}

function loadVoices() {
  voices = synth.getVoices().filter(v => v.lang.startsWith('it'));
}
loadVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = loadVoices;
}


function playSound(type) {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
        ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const now = ctx.currentTime;

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    gainNode.gain.setValueAtTime(0, now);

    if (type === 'start') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(523.25, now); // C5
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    } else if (type === 'stop') {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(261.63, now); // C4
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    } else if (type === 'tick') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(1046.50, now); // C6
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    }

    oscillator.start(now);
    oscillator.stop(now + 1); // Stop after 1 second max
}

export function speak(text) {
  return new Promise((resolve) => {
    if (synth.speaking) {
      synth.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voices[0] || synth.getVoices().find(v => v.default && v.lang.startsWith('it'));
    utterance.lang = 'it-IT';
    utterance.rate = 1.0;
    utterance.onend = resolve;
    utterance.onerror = resolve; // Resolve even on error to not block the queue
    synth.speak(utterance);
  });
}

export function playStartCue() {
    playSound('start');
}

export function playStopCue() {
    playSound('stop');
}

export function playTick() {
    playSound('tick');
}
