import { pick } from 'lodash'
import { ComponentProps, useEffect, useState } from 'react'
import { Flex, Sheet, useSporeColors } from 'ui/src'
import { Trace } from 'utilities/src/telemetry/trace/Trace'
import { TextInput } from 'wallet/src/components/input/TextInput'
import { BottomSheetContextProvider } from 'wallet/src/components/modals/BottomSheetContext'
import { BottomSheetModalProps } from 'wallet/src/components/modals/BottomSheetModalProps'

export type WebBottomSheetProps = Pick<
  BottomSheetModalProps,
  | 'children'
  | 'name'
  | 'onClose'
  | 'fullScreen'
  | 'backgroundColor'
  | 'isDismissible'
  | 'isModalOpen'
  | 'alignment'
  | 'maxWidth'
>

export function BottomSheetModal(props: BottomSheetModalProps): JSX.Element {
  const supportedProps = pick(props, [
    'name',
    'onClose',
    'fullScreen',
    'backgroundColor',
    'children',
    'isDismissible',
    'isModalOpen',
    'alignment',
    'maxWidth',
  ])

  return <WebBottomSheetModal {...supportedProps} />
}

// No detached mode necessary yet in web
export function BottomSheetDetachedModal(props: BottomSheetModalProps): JSX.Element {
  const supportedProps = pick(props, [
    'name',
    'onClose',
    'fullScreen',
    'backgroundColor',
    'isModalOpen',
    'children',
    'isDismissible',
    'alignment',
    'maxWidth',
  ])

  return <WebBottomSheetModal {...supportedProps} />
}

const ANIMATION_MS = 200

function WebBottomSheetModal({
  children,
  name,
  onClose,
  fullScreen,
  backgroundColor,
  isDismissible = true,
  isModalOpen = true,
  alignment = 'center',
  maxWidth,
}: WebBottomSheetProps): JSX.Element {
  const colors = useSporeColors()
  const [fullyClosed, setFullyClosed] = useState(false)

  if (fullyClosed && isModalOpen) {
    setFullyClosed(false)
  }

  // Not the greatest, we are syncing 200 here to 200ms animation
  // TODO(EXT-745): Add Tamagui onFullyClosed callback and replace here
  useEffect(() => {
    if (!isModalOpen) {
      const tm = setTimeout(() => {
        setFullyClosed(true)
      }, ANIMATION_MS)

      return () => {
        clearTimeout(tm)
      }
    }
  }, [isModalOpen])

  const isBottomAligned = alignment === 'bottom'

  return (
    <Trace logImpression={isModalOpen} modal={name}>
      <BottomSheetContextProvider isSheetReady={true}>
        <Sheet
          disableDrag
          modal
          animation={`${ANIMATION_MS}ms`}
          dismissOnOverlayPress={false}
          dismissOnSnapToBottom={false}
          open={isModalOpen}
          snapPoints={fullScreen || !isBottomAligned ? [100] : undefined}
          onOpenChange={(open: boolean): void => {
            !open && onClose?.()
          }}>
          <Sheet.Overlay
            backgroundColor="$black"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
            height="100%"
            opacity={0.6}
            onPress={(): void => {
              isDismissible && onClose?.()
            }}
          />
          <Sheet.Frame
            alignSelf="center"
            backgroundColor="$transparent"
            flex={1}
            height={fullScreen || !isBottomAligned ? '100%' : undefined}
            justifyContent={
              alignment === 'center' ? 'center' : alignment === 'top' ? 'flex-start' : 'flex-end'
            }
            maxWidth={maxWidth}
            p="$spacing12"
            pointerEvents="none">
            <Flex
              borderRadius="$rounded24"
              p="$spacing12"
              pointerEvents="auto"
              style={{ backgroundColor: backgroundColor ?? colors.surface1.val }}
              width="100%">
              {/* To keep this consistent with how the `BottomSheetModal` works on native mobile, we only mount the children when the modal is open. */}
              {fullyClosed ? null : children}
            </Flex>
          </Sheet.Frame>
        </Sheet>
      </BottomSheetContextProvider>
    </Trace>
  )
}

export function BottomSheetTextInput(props: ComponentProps<typeof TextInput>): JSX.Element {
  return <TextInput {...props} />
}
