import {
  ComponentProps,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";

type BottomSheetProps = PropsWithChildren<{
  onClose: () => void;
  visible: boolean;
}>;

export function BottomSheet({
  children,
  onClose,
  visible,
}: BottomSheetProps) {
  const modalRef = useRef<BottomSheetModal>(null);
  const [isMounted, setIsMounted] = useState(visible);
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const maxDynamicContentSize = useMemo(() => {
    return Math.max(280, height - insets.top - 96);
  }, [height, insets.top]);

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
    }
  }, [visible]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    if (visible) {
      modalRef.current?.present();
      return;
    }

    modalRef.current?.dismiss();
  }, [isMounted, visible]);

  const renderBackdrop = useCallback(
    (props: ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.32}
        pressBehavior="close"
      />
    ),
    [],
  );

  const handleDismiss = useCallback(() => {
    setIsMounted(false);
    onClose();
  }, [onClose]);

  if (!isMounted) {
    return null;
  }

  return (
    <BottomSheetModal
      ref={modalRef}
      animateOnMount
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      bottomInset={insets.bottom}
      enableDynamicSizing
      enablePanDownToClose
      handleIndicatorStyle={styles.handleIndicator}
      maxDynamicContentSize={maxDynamicContentSize}
      onDismiss={handleDismiss}
      style={styles.modal}
    >
      <BottomSheetScrollView
        bounces={false}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
  },
  contentContainer: {
    paddingBottom: spacing[8],
    paddingHorizontal: spacing[6],
  },
  handleIndicator: {
    backgroundColor: colors.stone,
    width: 36,
  },
  modal: {
    overflow: "hidden",
  },
});
