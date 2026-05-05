import math
import struct
import wave
import os

sample_rate = 44100
duration = 0.5 # Fast 0.5 second looping data processing trill
fname = r'C:\Rajasekhar\RedRainbow\frontend\public\cyber.wav'

os.makedirs(os.path.dirname(fname), exist_ok=True)

try:
    wavef = wave.open(fname, 'wb')
    wavef.setnchannels(1)
    wavef.setsampwidth(2) 
    wavef.setframerate(sample_rate)

    for i in range(int(duration * sample_rate)):
        t = float(i) / sample_rate
        
        # Iron Man HUD UI / Data Processing Trill
        # Rapid arp sequence
        step = int(t * 32) # 32 note changes per second
        
        # Frequencies forming a high-tech digital sequence
        freqs = [1200, 1600, 2400, 800, 3200, 1600, 4800, 1200]
        f = freqs[step % len(freqs)]
        
        # Generate clean sine blips (glassy high-tech sound)
        blip = 0.15 * math.sin(2.0 * math.pi * f * t)
        
        # Add a rhythmic envelope so it stutters like a computer loading
        env = math.exp(-15.0 * (t % (1.0/32.0)))
        blip *= env

        # Layer a low steady "reactor hum" (Iron Man chest piece)
        hum_freq = 60.0
        hum = 0.3 * math.sin(2.0 * math.pi * hum_freq * t)
        
        value = blip + hum
        
        data = struct.pack('<h', int(value * 32767.0))
        wavef.writeframesraw(data)

    wavef.close()
    print("Successfully synthesized Iron Man UI data transfer sound")
except Exception as e:
    print(f"Error: {e}")
