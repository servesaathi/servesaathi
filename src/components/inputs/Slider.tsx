import React, { useReducer, useRef } from 'react';
import { StyleSheet, View, PanResponder, LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';

interface SliderProps {
  min: number;
  max: number;
  value: number;
  step?: number;
  /** Fires continuously while dragging, so the caller can live-preview. */
  onChange: (value: number) => void;
  /** Fires once on release/tap-up — the point to persist/announce. */
  onChangeEnd?: (value: number) => void;
  trackColor?: string;
  activeTrackColor?: string;
  thumbColor?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const THUMB_SIZE = 26;
const TRACK_HEIGHT = 4;
const HIT_SLOP = { top: 16, bottom: 16, left: 12, right: 12 };

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

// A real drag-anywhere-on-the-track slider (RN core PanResponder, no extra
// native deps — the ios/android folders are already checked out and hand-built
// via Xcode, so anything requiring a fresh `pod install` is worth avoiding).
// Used by the Accessibility screen's Font Size control; generic enough to
// reuse for any other bounded numeric preference.
export const Slider: React.FC<SliderProps> = ({
  min,
  max,
  value,
  step = 1,
  onChange,
  onChangeEnd,
  trackColor = theme.colors.forestGreen[100],
  activeTrackColor = theme.colors.tertiary,
  thumbColor = theme.colors.tertiary,
  accessibilityLabel,
  style,
}) => {
  // Refs (not state) so the PanResponder — created once — always reads the
  // latest track width / value instead of closing over stale render-time data.
  const trackWidthRef = useRef(0);
  const valueRef = useRef(value);
  valueRef.current = value;
  // Only needed to force one re-render after onLayout reports the real width,
  // so the thumb starts in the right place before any touch happens.
  const [, forceRender] = useReducer((c) => c + 1, 0);

  const handleLayout = (e: LayoutChangeEvent) => {
    trackWidthRef.current = e.nativeEvent.layout.width;
    forceRender();
  };

  const valueFromLocalX = (x: number) => {
    const travel = trackWidthRef.current - THUMB_SIZE;
    if (travel <= 0) return valueRef.current;
    const ratio = clamp(x / travel, 0, 1);
    const raw = min + ratio * (max - min);
    return clamp(Math.round(raw / step) * step, min, max);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        onChange(valueFromLocalX(evt.nativeEvent.locationX - THUMB_SIZE / 2));
      },
      onPanResponderMove: (evt) => {
        onChange(valueFromLocalX(evt.nativeEvent.locationX - THUMB_SIZE / 2));
      },
      onPanResponderRelease: () => onChangeEnd?.(valueRef.current),
      onPanResponderTerminate: () => onChangeEnd?.(valueRef.current),
    })
  ).current;

  const width = trackWidthRef.current;
  const progress = max > min ? clamp((value - min) / (max - min), 0, 1) : 0;
  const thumbX = progress * Math.max(width - THUMB_SIZE, 0);

  return (
    <View
      style={[styles.touchArea, style]}
      onLayout={handleLayout}
      hitSlop={HIT_SLOP}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min, max, now: value }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'increment') {
          const next = clamp(valueRef.current + step, min, max);
          onChange(next);
          onChangeEnd?.(next);
        } else if (event.nativeEvent.actionName === 'decrement') {
          const next = clamp(valueRef.current - step, min, max);
          onChange(next);
          onChangeEnd?.(next);
        }
      }}
      {...panResponder.panHandlers}
    >
      <View style={[styles.track, { backgroundColor: trackColor }]} />
      <View style={[styles.track, styles.activeTrack, { width: thumbX + THUMB_SIZE / 2, backgroundColor: activeTrackColor }]} />
      <View style={[styles.thumb, { left: thumbX, backgroundColor: thumbColor }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  touchArea: {
    height: THUMB_SIZE,
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    left: THUMB_SIZE / 2,
    right: THUMB_SIZE / 2,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
  },
  activeTrack: {
    right: undefined,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    ...theme.shadows.sm,
  },
});

export default Slider;
