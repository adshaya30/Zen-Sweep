import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

type TabGlyphProps = {
  color: string;
  focused?: boolean;
};

function IconWrap({
  children,
  focused,
}: {
  children: ReactNode;
  focused?: boolean;
}) {
  return (
    <View style={[styles.wrap, focused ? styles.wrapFocused : null]}>
      {children}
    </View>
  );
}

export function OverviewTabIcon({ color, focused }: TabGlyphProps) {
  return (
    <IconWrap focused={focused}>
      <View style={[styles.clock, { borderColor: color }]}>
        <View style={[styles.clockHand, { backgroundColor: color }]} />
      </View>
    </IconWrap>
  );
}

export function InsightsTabIcon({ color, focused }: TabGlyphProps) {
  return (
    <IconWrap focused={focused}>
      <View style={styles.bars}>
        <View style={[styles.bar, { height: 8, backgroundColor: color }]} />
        <View style={[styles.bar, { height: 14, backgroundColor: color }]} />
        <View style={[styles.bar, { height: 10, backgroundColor: color }]} />
      </View>
    </IconWrap>
  );
}

export function BlocksTabIcon({ color, focused }: TabGlyphProps) {
  return (
    <IconWrap focused={focused}>
      <View style={[styles.shield, { borderColor: color }]}>
        <View style={[styles.shieldBar, { backgroundColor: color }]} />
      </View>
    </IconWrap>
  );
}

export function ProfileTabIcon({ color, focused }: TabGlyphProps) {
  return (
    <IconWrap focused={focused}>
      <View style={[styles.head, { backgroundColor: color }]} />
      <View style={[styles.body, { borderColor: color }]} />
    </IconWrap>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapFocused: {
    backgroundColor: 'rgba(26, 54, 38, 0.12)',
    borderRadius: 16,
  },
  clock: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2.2,
  },
  clockHand: {
    position: 'absolute',
    top: 3,
    left: 8,
    width: 2,
    height: 7,
    borderRadius: 1,
  },
  bars: {
    height: 16,
    width: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  bar: {
    width: 4,
    borderRadius: 2,
  },
  shield: {
    width: 18,
    height: 20,
    borderWidth: 2.2,
    borderRadius: 4,
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldBar: {
    width: 8,
    height: 2,
    borderRadius: 1,
  },
  head: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  body: {
    width: 16,
    height: 8,
    borderTopWidth: 2.2,
    borderLeftWidth: 2.2,
    borderRightWidth: 2.2,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
});
