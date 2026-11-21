import numpy as np
import soundfile as sf
import librosa
from typing import Tuple, Dict, Any

def load_audio_preserve_channels(file_path: str, target_sr: int = 16000) -> Tuple[np.ndarray, int, int]:
    """
    Load an audio file preserving separate participant channels if stereo.
    Returns:
        audio_data: np.ndarray shape (samples,) or (channels, samples)
        sample_rate: int
        channels: int
    """
    # Use soundfile to inspect raw channels
    info = sf.info(file_path)
    channels = info.channels

    # Load audio
    data, sr = sf.read(file_path, dtype='float32')

    # If sample rate needs resampling
    if sr != target_sr:
        if channels == 1:
            data = librosa.resample(data, orig_sr=sr, target_sr=target_sr)
        else:
            # Resample each channel independently
            channels_list = []
            for ch in range(channels):
                ch_data = librosa.resample(data[:, ch], orig_sr=sr, target_sr=target_sr)
                channels_list.append(ch_data)
            data = np.stack(channels_list, axis=1)
        sr = target_sr

    return data, sr, channels

def get_channel_or_mono(data: np.ndarray, channel_idx: int = 0) -> np.ndarray:
    """
    Safely get 1D signal from mono or multi-channel audio without blind flattening.
    """
    if data.ndim == 1:
        return data
    elif data.ndim == 2:
        if channel_idx < data.shape[1]:
            return data[:, channel_idx]
        return np.mean(data, axis=1) # Fallback to downmix if index out of bounds
    return data.flatten()
