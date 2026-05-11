import { useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type ViewProps,
} from "react-native";

export type LiveWaveformProps = ViewProps & {
  level?: number;
  active?: boolean;
  processing?: boolean;
  barWidth?: number;
  barGap?: number;
  barRadius?: number;
  barColor?: string;
  barHeight?: number;
  height?: number;
  sensitivity?: number;
  smoothingTimeConstant?: number;
};

export const LiveWaveform = ({
  level = 0,
  active = false,
  processing = false,
  barWidth = 6,
  barGap = 4,
  barRadius = 999,
  barColor = "#000000",
  barHeight: baseBarHeight = 6,
  height = 64,
  sensitivity = 1,
  smoothingTimeConstant = 0.8,
  style,
  ...rest
}: LiveWaveformProps) => {
  const [width, setWidth] = useState(0);
  const [bars, setBars] = useState<number[]>([]);

  const smoothedRef = useRef<number[]>([]);
  const lastActiveRef = useRef<number[]>([]);
  const processingTimeRef = useRef(0);

  const onLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    if (nextWidth !== width) {
      setWidth(nextWidth);
    }
  };

  const step = barWidth + barGap;
  const barCount = Math.max(12, Math.floor(width / step));
  const halfCount = Math.floor(barCount / 2);

  useEffect(() => {
    smoothedRef.current = new Array(barCount).fill(0);
    setBars(new Array(barCount).fill(0));
  }, [barCount]);

  useEffect(() => {
    if (barCount === 0) {
      return;
    }

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(64, now - last) / 1000;
      last = now;

      const next = smoothedRef.current.slice();

      if (active) {
        const liveLevel = Math.max(0, Math.min(1, level * sensitivity));

        for (let index = 0; index < barCount; index += 1) {
          const norm = (index - halfCount) / Math.max(1, halfCount);
          const centerWeight = 1 - Math.abs(norm) * 0.45;
          const wobble =
            0.8 +
            0.2 *
              Math.sin(now * 0.005 + index * 0.6) *
              Math.cos(now * 0.003 + index * 0.35);
          const target = Math.max(0.05, liveLevel * centerWeight * wobble);
          const a = smoothingTimeConstant;
          next[index] = next[index] * a + target * (1 - a);
        }

        lastActiveRef.current = next.slice();
      } else if (processing) {
        processingTimeRef.current += dt;
        const time = processingTimeRef.current;

        for (let index = 0; index < barCount; index += 1) {
          const norm = (index - halfCount) / Math.max(1, halfCount);
          const centerWeight = 1 - Math.abs(norm) * 0.35;
          const wave =
            0.22 +
            0.18 * Math.sin(time * 1.8 + norm * 3) +
            0.14 * Math.cos(time * 1.2 - norm * 2);
          next[index] = Math.max(0.05, Math.min(1, wave * centerWeight));
        }
      } else {
        for (let index = 0; index < barCount; index += 1) {
          next[index] *= 0.88;
          if (next[index] < 0.01) {
            next[index] = 0;
          }
        }
      }

      smoothedRef.current = next;
      setBars(next);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, barCount, halfCount, level, processing, sensitivity, smoothingTimeConstant]);

  const renderedBars = useMemo(() => {
    return bars.map((value, index) => {
      const barVisualHeight = Math.max(baseBarHeight, value * height * 0.8);
      const opacity = 0.35 + Math.min(1, value) * 0.65;

      return (
        <View
          key={`bar-${index}`}
          style={[
            styles.bar,
            {
              width: barWidth,
              height: barVisualHeight,
              borderRadius: barRadius,
              backgroundColor: barColor,
              marginRight: index === bars.length - 1 ? 0 : barGap,
              opacity,
            },
          ]}
        />
      );
    });
  }, [barColor, barGap, barRadius, barWidth, bars, baseBarHeight, height]);

  return (
    <View
      {...rest}
      onLayout={onLayout}
      style={[styles.container, { height }, style]}
    >
      <View style={styles.row}>{renderedBars}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    justifyContent: "center",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  bar: {
    alignSelf: "center",
  },
});
