import axios from 'axios';

const BASE_URL = 'https://api.elevenlabs.io/v1';

export async function textToAudio(text) {
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;
  console.log('[ElevenLabs] voiceId:', voiceId, '| apiKey prefix:', apiKey?.slice(0, 8));
  if (!voiceId) throw new Error('ELEVENLABS_VOICE_ID is not set');
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY is not set');

  const response = await axios.post(
    `${BASE_URL}/text-to-speech/${voiceId}`,
    {
      text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: { stability: 0.4, similarity_boost: 0.8, style: 0.5, use_speaker_boost: true },
    },
    {
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      responseType: 'arraybuffer',
    }
  );

  return Buffer.from(response.data);
}

export async function textToAudioWithTimestamps(text) {
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!voiceId) throw new Error('ELEVENLABS_VOICE_ID is not set');
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY is not set');

  const response = await axios.post(
    `${BASE_URL}/text-to-speech/${voiceId}/with-timestamps`,
    {
      text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: { stability: 0.4, similarity_boost: 0.8, style: 0.5, use_speaker_boost: true },
    },
    {
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
  );

  const { audio_base64, alignment } = response.data;
  return {
    audioBuffer: Buffer.from(audio_base64, 'base64'),
    alignment, // { characters, character_start_times_seconds, character_end_times_seconds }
  };
}
