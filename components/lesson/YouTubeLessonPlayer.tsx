import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import YoutubeIframe, { PLAYER_STATES, YoutubeIframeRef } from 'react-native-youtube-iframe';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';

const { width: SCREEN_W } = Dimensions.get('window');
const PLAYER_H = Math.round(SCREEN_W * (9 / 16));

function extractYouTubeId(input: string): string | null {
  if (!input?.trim()) return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const m = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

interface Props {
  videoUrl: string;
  accentColor?: string;
  isCompleted?: boolean;
  lessonProgress?: number;
  onComplete?: () => void;
  onProgress?: (percent: number) => void;
}

export function YouTubeLessonPlayer({
  videoUrl,
  accentColor = Colors.primary,
  isCompleted = false,
  lessonProgress = 0,
  onComplete,
  onProgress,
}: Props) {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];

  const videoId = extractYouTubeId(videoUrl);
  const playerRef = useRef<YoutubeIframeRef>(null);
  const durationRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(isCompleted);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [ended, setEnded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    completedRef.current = isCompleted;
  }, [isCompleted]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    intervalRef.current = setInterval(async () => {
      if (!playerRef.current || durationRef.current <= 0) return;
      try {
        const currentTime = await playerRef.current.getCurrentTime();
        const pct = Math.min(100, Math.round((currentTime / durationRef.current) * 100));
        onProgress?.(pct);
        if (pct >= 90 && !completedRef.current) {
          stopPolling();
          completedRef.current = true;
          onComplete?.();
        }
      } catch {
        // ignore transient WebView errors
      }
    }, 5000);
  }, [stopPolling, onProgress, onComplete]);

  const handleStateChange = useCallback(
    (state: PLAYER_STATES) => {
      if (state === PLAYER_STATES.PLAYING) {
        setEnded(false);
        startPolling();
      } else {
        stopPolling();
      }
      if (state === PLAYER_STATES.ENDED) {
        setEnded(true);
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
      }
    },
    [startPolling, stopPolling, onComplete]
  );

  const handleReady = useCallback(async () => {
    setLoading(false);
    try {
      const dur = await playerRef.current?.getDuration();
      if (dur && dur > 0) durationRef.current = dur;
    } catch {}
  }, []);

  const handleError = useCallback(() => {
    setError(true);
    setLoading(false);
  }, []);

  // No video configured
  if (!videoId) return null;

  // Error loading
  if (error) {
    return (
      <View style={[styles.placeholder, { backgroundColor: theme.card }]}>
        <View style={[styles.placeholderIcon, { backgroundColor: `${theme.textMuted}15` }]}>
          <Ionicons name="play-circle-outline" size={40} color={theme.textMuted} />
        </View>
        <Typography variant="label" secondary style={{ marginTop: 10 }}>
          Video no disponible
        </Typography>
        <Typography variant="caption" muted style={{ textAlign: 'center', marginTop: 4, maxWidth: 220 }}>
          Comprueba tu conexión a internet e intenta de nuevo
        </Typography>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, fullscreen && styles.wrapperFullscreen]}>
      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={accentColor} />
          <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.55)', marginTop: 10 }}>
            Cargando video…
          </Typography>
        </View>
      )}

      {/* YouTube player */}
      <YoutubeIframe
        ref={playerRef}
        height={PLAYER_H}
        videoId={videoId}
        play={false}
        onReady={handleReady}
        onChangeState={handleStateChange}
        onError={handleError}
        onFullScreenChange={setFullscreen}
        webViewStyle={loading ? styles.hidden : undefined}
        webViewProps={{ androidLayerType: 'hardware' }}
        initialPlayerParams={{
          rel: false,
          preventFullScreen: false,
          cc_lang_pref: 'es',
        }}
      />

      {/* Ended overlay */}
      {ended && !loading && (
        <View style={styles.endedOverlay}>
          <Ionicons name="checkmark-circle" size={56} color={Colors.success} />
          <Typography variant="h4" style={{ color: '#FFF', marginTop: 10 }}>
            ¡Video completado!
          </Typography>
          {!isCompleted && (
            <Typography
              variant="caption"
              style={{ color: 'rgba(255,255,255,0.65)', marginTop: 6, textAlign: 'center' }}
            >
              Lección marcada como completada automáticamente
            </Typography>
          )}
          <TouchableOpacity
            style={styles.replayBtn}
            onPress={() => setEnded(false)}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={15} color="#FFF" />
            <Typography variant="label" style={{ color: '#FFF' }}>
              Ver de nuevo
            </Typography>
          </TouchableOpacity>
        </View>
      )}

      {/* "Already completed" banner */}
      {isCompleted && !ended && !loading && (
        <View style={[styles.completedBanner, { backgroundColor: `${Colors.success}18`, borderColor: `${Colors.success}28` }]}>
          <Ionicons name="checkmark-circle" size={13} color={Colors.success} />
          <Typography variant="caption" color={Colors.success} style={{ fontWeight: '700', flex: 1 }}>
            Lección completada · Puedes ver el video de nuevo
          </Typography>
        </View>
      )}

      {/* In-progress banner */}
      {!isCompleted && !ended && !loading && lessonProgress > 0 && (
        <View style={[styles.progressBanner, { backgroundColor: `${accentColor}18`, borderColor: `${accentColor}28` }]}>
          <Ionicons name="time-outline" size={13} color={accentColor} />
          <Typography variant="caption" color={accentColor} style={{ fontWeight: '600' }}>
            Vista {lessonProgress}% · continúa donde lo dejaste
          </Typography>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#000',
  },
  wrapperFullscreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  hidden: { opacity: 0 },
  loadingOverlay: {
    height: PLAYER_H,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  placeholder: {
    height: PLAYER_H,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: Spacing.xl,
  },
  placeholderIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: Spacing.xl,
  },
  replayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  progressBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
