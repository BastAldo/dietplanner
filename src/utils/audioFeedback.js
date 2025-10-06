let audioContext = null;

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

function playSound(type) {
    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'start') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, ctx.currentTime); // A4
        gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
    } else if (type === 'stop') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(220, ctx.currentTime); // A3
        gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
    } else if (type === 'tick') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
    }
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
