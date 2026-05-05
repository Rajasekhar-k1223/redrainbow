import math
import struct
import wave
import os

sample_rate = 44100
duration = 2.0 # 2 seconds to loop seamlessly
frequency = 65.41 # C2 - Low bass drone
fname = r'C:\Rajasekhar\RedRainbow\frontend\public\cyber.wav'

# Ensure directory exists
os.makedirs(os.path.dirname(fname), exist_ok=True)

try:
    wavef = wave.open(fname, 'wb')
    wavef.setnchannels(1) # mono
    wavef.setsampwidth(2) 
    wavef.setframerate(sample_rate)

    for i in range(int(duration * sample_rate)):
        t = float(i) / sample_rate
        
        # 1. Base intense sub-bass drone
        base = math.sin(2.0 * math.pi * frequency * t)
        
        # 2. Add an octave above for presence
        octave = 0.5 * math.sin(2.0 * math.pi * (frequency * 2) * t)
        
        # 3. Add a fast LFO 'heartbeat/alarm' pulse effect (8 beats per second)
        lfo = (math.sin(2.0 * math.pi * 8.0 * t) + 1.0) / 2.0
        
        # Combine
        value = (base + octave) * lfo
        
        # 4. Soft Saturation / Distortion for that grit
        value = max(-0.9, min(0.9, value * 2.0))
        
        data = struct.pack('<h', int(value * 32767.0))
        wavef.writeframesraw(data)

    wavef.close()
    print("Successfully synthesized cyber.wav")
except Exception as e:
    print(f"Error: {e}")
