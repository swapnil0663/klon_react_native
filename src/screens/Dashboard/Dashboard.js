import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Animated,
  ScrollView,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import * as ExpoAudio from 'expo-audio';
import { COLORS, SIZES } from '../../constants/theme';
import { Mic, LogOut, Sparkles } from 'lucide-react-native';
import { clearSession } from '../../services/session';
import axios from 'axios';
import * as FileSystem from 'expo-file-system/legacy';

const { width } = Dimensions.get('window');

const API_URLS = {
  startSession: 'https://api.planet-ria.com/fastapi/start_session',
  processText: 'https://api.planet-ria.com/fastapi/process_text_testing',
  googleSTT: 'https://speech.googleapis.com/v1/speech:recognize?key=AIzaSyCC1BDQm3_ABbk4OVAWUY5UoNkKjNEmnP4',
};

const ASSETS = {
  intro: 'https://res.cloudinary.com/ddr5lp3bt/video/upload/v1743137399/Intro_videonew.mp3_1_1_spjhb9.mp4', 
  talking: 'https://res.cloudinary.com/ddr5lp3bt/video/upload/v1743137065/free_full_talk.mp3_2_cygxfv.mp4', 
  waiting: 'https://res.cloudinary.com/ddr5lp3bt/video/upload/v1743142436/listen_video_j116zp.mp4', 
  thinking: 'https://res.cloudinary.com/ddr5lp3bt/video/upload/v1743137205/thinking_video.mp3_1_krgnji.mp4',
};

const STRINGS = {
  initialGreeting: "Hello, I am Aria; What would you like to Explore today?",
  waitingPrompt: "Hold the button and speak to Aria",
};

const DashboardScreen = ({ navigation }) => {
  const [currentVideo, setCurrentVideo] = useState('intro');
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [aiText, setAiText] = useState(STRINGS.initialGreeting);
  
  const videoOpacity = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isAriaSpeaking = useRef(false);

  const recorder = ExpoAudio.useAudioRecorder({
    encoder: 'pcm',
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  });

  const player = useVideoPlayer(ASSETS.intro, (p) => {
    p.loop = false;
    p.play();
  });

  const switchVideo = (type, muted = true) => {
    if (player && ASSETS[type] && currentVideo !== type) {
      // THE CINEMATIC CROSS-FADE: Hide the "stuck" frame during the network switch
      Animated.sequence([
        Animated.timing(videoOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.delay(100)
      ]).start(() => {
        setCurrentVideo(type);
        
        // Update subtitle if entering waiting state
        if (type === 'waiting') {
           setAiText(STRINGS.waitingPrompt);
        }

        player.replaceAsync(ASSETS[type]);
        player.loop = (type === 'waiting' || type === 'thinking');
        player.muted = muted;
        player.volume = muted ? 0 : 1.0;
        player.play();
        
        // Wipe finished, reveal the character's next state
        setTimeout(() => {
          Animated.timing(videoOpacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
        }, 300);
      });
    }
  };

  useEffect(() => {
    // Exact 5.2s duration (Anticipated by 150ms for smooth fade)
    const timer = setTimeout(() => {
      if (currentVideo === 'intro') {
        switchVideo('waiting', true);
      }
    }, 5050);

    const sub = player.addListener('playbackFinished', () => {
       if (currentVideo === 'intro' || currentVideo === 'talking') {
          switchVideo('waiting', true);
       }
    });

    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, [player, currentVideo]);

  useEffect(() => {
    initSession();
    return () => Speech.stop();
  }, []);

  const initSession = async () => {
    try {
      const resp = await fetch(API_URLS.startSession, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ learning_state: 'free_conversation', device_id: 'hero' }),
      });
      if (resp.status === 200) {
        const data = await resp.json();
        setSessionId(data.session_id);
      }
    } catch {
      setSessionId("demo_session_123");
    }
  };

  const handleAiResponse = async (text) => {
    await Speech.stop();
    isAriaSpeaking.current = true;
    setAiText(text);
    switchVideo('talking', true);
    
    setTimeout(() => {
      Speech.speak(text, {
        language: 'en-US',
        pitch: 1.05,
        onDone: () => { isAriaSpeaking.current = false; switchVideo('waiting', true); },
        onStopped: () => { isAriaSpeaking.current = false; switchVideo('waiting', true); }
      });
    }, 200);
  };

  const startRecording = async () => {
    try {
      if (isAriaSpeaking.current) await Speech.stop();
      const { granted } = await ExpoAudio.requestRecordingPermissionsAsync();
      if (!granted) return;
      await ExpoAudio.setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);
      switchVideo('waiting', true);
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } catch (err) { console.error(err); }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    pulseAnim.setValue(1);
    try {
      recorder.stop();
      const uri = recorder.uri;
      if (!uri) return;
      switchVideo('thinking', true);
      if (sessionId === "demo_session_123") {
        setTimeout(() => handleAiResponse("I heard you Hero! You're very brave."), 2000);
        return;
      }
      const base64Audio = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const sttResp = await axios.post(API_URLS.googleSTT, {
        config: { encoding: 'LINEAR16', sampleRateHertz: 44100, languageCode: 'en-US' },
        audio: { content: base64Audio }
      });
      const userText = sttResp.data.results?.[0]?.alternatives?.[0]?.transcript;
      if (!userText) { handleAiResponse("I missed that Hero."); return; }
      const aiResp = await axios.post(API_URLS.processText, { session_id: sessionId, text: userText });
      if (aiResp.data.response) handleAiResponse(aiResp.data.response);
    } catch { handleAiResponse("Signal fuzzy. Retry!"); }
  };

  const handleLogout = async () => {
    await clearSession();
    navigation.replace('SignIn');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.titleText}>Hello User</Text>
          {/* <View style={styles.statusRow}>
             <Text style={[styles.statusTag, sessionId && sessionId !== 'demo_session_123' ? styles.ok : styles.warn]}>
                {sessionId && sessionId !== 'demo_session_123' ? 'MISSION ACTIVE' : 'DEMO MODE'}
             </Text>
          </View> */}
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <LogOut color={COLORS.error} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.videoCard}>
          <Animated.View style={[styles.videoContainer, { opacity: videoOpacity }]}>
            <VideoView player={player} style={styles.video} contentFit="contain" nativeControls={false} />
          </Animated.View>
          <View style={styles.overlay}>
             <Text style={styles.aiText}>{aiText}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <Text style={styles.guideText}>{isRecording ? "I am Listening..." : "Hold and Speak"}</Text>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity 
              activeOpacity={0.8}
              onPressIn={startRecording}
              onPressOut={stopRecording}
              style={[styles.micBtn, isRecording && styles.micBtnActive]}
            >
              <Mic color={COLORS.white} size={42} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: COLORS.white, borderBottomWidth:1, borderBottomColor:'#F2F2F2' },
  titleText: { fontSize: 26, fontWeight: 'bold', color: COLORS.primary },
  statusRow: { marginTop: 4 },
  statusTag: { fontSize: 10, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  ok: { backgroundColor: '#DCFCE7', color: '#166534' },
  warn: { backgroundColor: '#FEF9C3', color: '#854D0E' },
  logoutBtn: { padding: 10, backgroundColor: '#FFF0F0', borderRadius: 40 },
  scroll: { paddingBottom: 40 },
  videoCard: { width: width - 30, height: width * 1.1, marginHorizontal: 15, marginTop: 15, borderRadius: 32, backgroundColor: '#000', overflow: 'hidden', elevation: 12 },
  videoContainer: { flex: 1, backgroundColor: '#000' },
  video: { flex: 1 },
  overlay: { position: 'absolute', bottom: 15, left: 15, right: 15, padding: 20, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 20 },
  aiText: { color: COLORS.white, textAlign: 'center', fontSize: 16, fontWeight: '700' },
  controls: { alignItems: 'center', marginVertical: 15 },
  guideText: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 20 },
  micBtn: { width: 95, height: 95, borderRadius: 50, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 12 },
  micBtnActive: { backgroundColor: COLORS.error },
});

export default DashboardScreen;
